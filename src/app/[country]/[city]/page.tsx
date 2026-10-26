import connectToDatabase from '@/lib/mongodb';
import { shouldIndexDestination } from '@/lib/indexing';
import Hotel from '@/models/Hotel';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { imageUrl, DEFAULT_HOTEL_IMAGE } from '@/lib/imageUrl';
import StructuredData from '@/components/StructuredData';
import CityHotelsClient from '@/components/CityHotelsClient';
import Blog from '@/models/Blog';
import { escapeRegex, titleCase, slugify, resolveCountry, findLowestPriceHotel, normalizePrice, isValidNeighborhood } from '@/lib/utils';
import { generateCityPageContent } from '@/lib/seo';
import TrendingDestinations from '@/components/TrendingDestinations';
import { isStateSlug, getStateBySlug, getAllStateSlugs, getAllStates, getStateForCity } from '@/lib/usStates';

export const revalidate = false;

function getCityMetaDescription(cityName: string, countryName: string, countrySlug: string, count: number, minPrice?: string): string {
  const hotelWord = count === 1 ? 'hotel' : 'hotels';
  const sentences: string[] = [
    `${count} ${cityName} ${hotelWord} with a bathtub or jacuzzi in the room, checked one by one.`,
  ];
  if (minPrice && minPrice.trim()) {
    sentences.push(`From ${minPrice.trim()}/night.`);
  }
  sentences.push('See the exact room to book.');

  let result = '';
  for (const s of sentences) {
    const candidate = result ? `${result} ${s}` : s;
    if (candidate.length <= 155) {
      result = candidate;
    } else {
      break;
    }
  }
  if (!result) {
    result = `${count} ${cityName} ${hotelWord} with verified in-room tubs.`;
  }
  return result;
}

function truncateToWord(str: string, maxLen: number): string {
  if (!str || str.length <= maxLen) return str || '';
  const truncated = str.slice(0, maxLen);
  const lastSpace = truncated.lastIndexOf(' ');
  return (lastSpace > maxLen * 0.6 ? truncated.slice(0, lastSpace) : truncated).trim() + '...';
}

export async function generateStaticParams() {
  await connectToDatabase();
  const destinations = await Hotel.aggregate([
    { $match: { flagged: { $ne: true } } },
    { $group: { _id: { city: "$city", country: "$country" } } }
  ]);

  const cityParams = destinations.map((d: any) => {
    const countryInfo = resolveCountry(d._id.country);
    return {
      country: countryInfo.slug,
      city: slugify(d._id.city),
    };
  });

  const stateParams = getAllStateSlugs().map((slug) => ({
    country: 'usa',
    city: slug,
  }));

  return [...cityParams, ...stateParams];
}

export async function generateMetadata({ params }: { params: Promise<{ country: string, city: string }> }) {
  const resolvedParams = await params;
  await connectToDatabase();

  const countryInfo = resolveCountry(resolvedParams.country);
  const rawCity = decodeURIComponent(resolvedParams.city).replace(/-/g, ' ');
  const cityName = titleCase(rawCity);
  const countryName = countryInfo.displayName;
  const countrySlug = countryInfo.slug;
  const citySlug = slugify(rawCity);

  // US State Hub Metadata
  if (countrySlug === 'usa' && isStateSlug(citySlug)) {
    const state = getStateBySlug(citySlug)!;
    const [firstHotel, hotelCount] = await Promise.all([
      Hotel.findOne({
        city: { $in: state.cities },
        country: countryInfo.regex,
        flagged: { $ne: true }
      }).select('image'),
      Hotel.countDocuments({
        city: { $in: state.cities },
        country: countryInfo.regex,
        flagged: { $ne: true }
      }),
    ]);

    if (hotelCount === 0) {
      return {
        title: `Hotels in ${state.name} Not Found`,
        robots: { index: false, follow: false },
      };
    }

    const ogImage = firstHotel && firstHotel.image
      ? imageUrl(firstHotel.image.split('/').pop() || '')
      : state.heroImage;

    const currentYear = new Date().getFullYear();
    const pageTitle = `Hotels with Bathtub in ${state.name}: Top ${hotelCount} Stays (${currentYear})`;
    const pageDescription = state.metaDescription;

    return {
      title: { absolute: pageTitle },
      description: pageDescription,
      robots: { index: shouldIndexDestination(hotelCount), follow: true },
      alternates: {
        canonical: `/usa/${state.slug}`,
      },
      openGraph: {
        title: pageTitle,
        description: pageDescription,
        url: `https://www.hotelswithbathtubs.com/usa/${state.slug}`,
        siteName: 'Hotels with Bathtubs',
        locale: 'en_US',
        images: [{ url: ogImage, width: 1200, height: 630, alt: `Hotels with Bathtubs in ${state.name}` }],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: pageTitle,
        description: pageDescription,
        images: [ogImage],
      },
    };
  }

  // Fetch the first hotel to get a city-specific image if available, count and prices for lowest price description
  const [firstHotel, hotelCount, cityHotelPrices] = await Promise.all([
    Hotel.findOne({
      city: new RegExp(`^${escapeRegex(rawCity)}$`, 'i'),
      country: countryInfo.regex,
      flagged: { $ne: true }
    }).select('image'),
    Hotel.countDocuments({
      city: new RegExp(`^${escapeRegex(rawCity)}$`, 'i'),
      country: countryInfo.regex,
      flagged: { $ne: true }
    }),
    Hotel.find({
      city: new RegExp(`^${escapeRegex(rawCity)}$`, 'i'),
      country: countryInfo.regex,
      flagged: { $ne: true },
      price: { $exists: true, $ne: '' }
    }).select('price').lean(),
  ]);

  const lowestPriceInfo = findLowestPriceHotel(cityHotelPrices);
  const minPrice = lowestPriceInfo?.price;

  if (hotelCount === 0) {
    return {
      title: `Hotels in ${cityName} Not Found`,
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const ogImage = firstHotel && firstHotel.image
    ? imageUrl(firstHotel.image.split('/').pop() || '')
    : DEFAULT_HOTEL_IMAGE;

  // SERP-Optimized Title (45-58 chars): Front-load exact high-volume search query
  const currentYear = new Date().getFullYear();
  let pageTitle = `Hotels with Bathtub in ${cityName}: ${hotelCount} Verified Rooms (${currentYear})`;
  if (hotelCount === 1) {
    pageTitle = `Hotels with Bathtub in ${cityName}: 1 Verified Room (${currentYear})`;
  } else if (citySlug === 'new-york') {
    pageTitle = `Hotels with Soaking Tubs & Bathtubs in New York (${currentYear})`;
  }

  const pageDescription = getCityMetaDescription(cityName, countryName, countrySlug, hotelCount, minPrice);


  return {
    title: {
      absolute: pageTitle,
    },
    description: pageDescription,
    robots: {
      index: shouldIndexDestination(hotelCount),
      follow: true,
    },
    alternates: {
      canonical: `/${countrySlug}/${citySlug}`,
    },
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: `https://www.hotelswithbathtubs.com/${countrySlug}/${citySlug}`,
      siteName: 'Hotels with Bathtubs',
      locale: countrySlug === 'uk' ? 'en_GB' : 'en_US',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `Hotels with Bathtubs in ${cityName}`,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDescription,
      images: [ogImage],
    },
  };

}

export default async function CityHotelsPage({
  params,
}: {
  params: Promise<{ country: string; city: string }>;
}) {
  const resolvedParams = await params;
  await connectToDatabase();

  const countryInfo = resolveCountry(resolvedParams.country);
  const rawCity = decodeURIComponent(resolvedParams.city).replace(/-/g, ' ');
  const countryName = countryInfo.displayName;
  const countrySlug = countryInfo.slug;
  const citySlug = slugify(rawCity);

  const stateConfig = countrySlug === 'usa' ? getStateBySlug(citySlug) : undefined;
  const cityName = stateConfig ? stateConfig.name : titleCase(rawCity);
  const parentState = (!stateConfig && countrySlug === 'usa') ? getStateForCity(cityName) : undefined;

  // Fetch only active (non-flagged) hotels using country regex for alias tolerance
  // For state hubs: query all hotels across the state's constituent cities
  // Sibling destination mesh linking: fetch top sister cities in same country (or constituent cities for state)
  const [rawHotels, rawSiblings] = await Promise.all([
    stateConfig
      ? Hotel.find({
          city: { $in: stateConfig.cities },
          country: countryInfo.regex,
          flagged: { $ne: true }
        }).sort({ rating: -1 }).lean()
      : Hotel.find({
          city: new RegExp(`^${escapeRegex(rawCity)}$`, 'i'),
          country: countryInfo.regex,
          flagged: { $ne: true }
        }).sort({ rating: -1 }).lean(),
    stateConfig
      ? Hotel.aggregate([
          {
            $match: {
              city: { $in: stateConfig.cities },
              country: countryInfo.regex,
              flagged: { $ne: true }
            }
          },
          {
            $group: {
              _id: "$city",
              hotelCount: { $sum: 1 }
            }
          },
          { $sort: { hotelCount: -1 } }
        ])
      : Hotel.aggregate([
          {
            $match: {
              country: countryInfo.regex,
              flagged: { $ne: true },
              city: { $not: new RegExp(`^${escapeRegex(rawCity)}$`, 'i') }
            }
          },
          {
            $group: {
              _id: "$city",
              hotelCount: { $sum: 1 }
            }
          },
          { $sort: { hotelCount: -1 } },
          { $limit: 12 }
        ])
  ]);

  if (rawHotels.length === 0) {
    notFound();
  }

  const siblingCities = rawSiblings.map((s: any) => ({
    name: titleCase(s._id),
    slug: slugify(s._id),
    count: s.hotelCount
  }));

  const hotels = rawHotels.map((h: any) => ({
    _id: h._id?.toString(),
    name: h.name,
    city: h.city,
    country: h.country,
    slug: h.slug || slugify(h.name),
    image: h.image,
    images: Array.isArray(h.images) && h.images.length > 0 ? h.images.slice(0, 3) : (h.image ? [h.image] : []),
    partnerImages: Array.isArray(h.partnerImages) ? h.partnerImages.slice(0, 5) : [],
    url: h.url,
    agodaUrl: h.agodaUrl,
    bookingUrl: h.bookingUrl,
    airbnbUrl: h.airbnbUrl,
    tripUrl: h.tripUrl,
    amenities: (h.amenities || []).slice(0, 6),
    description: h.description ? truncateToWord(h.description, 140) : '',
    rating: h.rating,
    reviewsCount: h.reviewsCount,
    roomType: h.roomType,
    tubType: h.tubType,
    bookingTip: h.bookingTip ? truncateToWord(h.bookingTip, 120) : '',
    price: h.price,
    neighborhood: isValidNeighborhood(h.neighborhood) ? h.neighborhood : undefined,
    landmarkDistance: h.landmarkDistance,
    updatedAt: h.updatedAt ? new Date(h.updatedAt).toISOString() : null,
  }));

  // Grounded freshness date derived from real MongoDB timestamps
  const maxTimestamp = hotels.reduce((max, h) => {
    const t = h.updatedAt ? new Date(h.updatedAt).getTime() : 0;
    return t > max ? t : max;
  }, 0);
  const cityVerifiedDate = maxTimestamp > 0
    ? new Date(maxTimestamp).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : 'October 2026';

  const jacuzziCount = hotels.filter(h =>
    (h.tubType && /jacuzzi|whirlpool|hot tub|jet/i.test(h.tubType)) ||
    (h.amenities && h.amenities.some((a: string) => /jacuzzi|hot tub|whirlpool/i.test(a)))
  ).length;

const CITY_ALIASES_MAP: Record<string, string[]> = {
  'new york': ['new york', 'nyc', 'new-york-city', 'manhattan'],
  'las vegas': ['las vegas', 'vegas'],
  'los angeles': ['los angeles', 'la'],
  'san francisco': ['san francisco', 'sf'],
  'new orleans': ['new orleans', 'nola'],
  'delhi': ['delhi', 'new delhi', 'mahipalpur'],
  'bangalore': ['bangalore', 'bengaluru'],
  'kolkata': ['kolkata', 'calcutta'],
};

  // Fetch related blogs where city, title, or slug matches the destination or known aliases
  const cityKey = rawCity.toLowerCase();
  const searchTerms = Array.from(new Set([cityKey, ...(CITY_ALIASES_MAP[cityKey] || [])]));
  const blogOrConditions: any[] = [
    { city: new RegExp(`^${escapeRegex(rawCity)}$`, 'i') }
  ];
  for (const term of searchTerms) {
    const termEscaped = escapeRegex(term);
    const slugEscaped = escapeRegex(term.replace(/\s+/g, '-'));
    blogOrConditions.push({ title: new RegExp(`\\b${termEscaped}\\b`, 'i') });
    blogOrConditions.push({ slug: new RegExp(`\\b${slugEscaped}\\b`, 'i') });
    blogOrConditions.push({ slug: new RegExp(slugEscaped, 'i') });
  }

  const relatedBlogs = await Blog.find({
    $or: blogOrConditions,
    published: true
  }).limit(3).sort({ createdAt: -1 });

  // Rich Schema: BreadcrumbList + ItemList of Hotels
  const breadcrumbElements: any[] = [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://www.hotelswithbathtubs.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": countryName,
      "item": `https://www.hotelswithbathtubs.com/${countrySlug}`
    }
  ];

  if (stateConfig) {
    breadcrumbElements.push({
      "@type": "ListItem",
      "position": 3,
      "name": `Hotels with Bathtubs in ${stateConfig.name}`,
      "item": `https://www.hotelswithbathtubs.com/usa/${stateConfig.slug}`
    });
  } else if (parentState) {
    breadcrumbElements.push({
      "@type": "ListItem",
      "position": 3,
      "name": `Hotels with Bathtubs in ${parentState.name}`,
      "item": `https://www.hotelswithbathtubs.com/usa/${parentState.slug}`
    });
    breadcrumbElements.push({
      "@type": "ListItem",
      "position": 4,
      "name": `Hotels with Bathtubs in ${cityName}`,
      "item": `https://www.hotelswithbathtubs.com/${countrySlug}/${citySlug}`
    });
  } else {
    breadcrumbElements.push({
      "@type": "ListItem",
      "position": 3,
      "name": `Hotels with Bathtubs in ${cityName}`,
      "item": `https://www.hotelswithbathtubs.com/${countrySlug}/${citySlug}`
    });
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbElements
  };

  const hotelListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `Hotels with Bathtubs & Jacuzzis in ${cityName}`,
    "description": stateConfig
      ? `Curated list of verified hotels and resorts with private in-room bathtubs, jacuzzis, and soaking tubs across ${stateConfig.name}.`
      : `Curated list of verified hotels and resorts with private in-room bathtubs, jacuzzis, and soaking tubs in ${cityName}, ${countryName}.`,
    "numberOfItems": hotels.length,
    "itemListElement": hotels.map((h, idx) => ({
      "@type": "ListItem",
      "position": idx + 1,
      "name": h.name,
      "url": `https://www.hotelswithbathtubs.com/${countrySlug}/${slugify(h.city || citySlug)}/${h.slug || slugify(h.name)}`
    }))
  };

  const currentYear = new Date().getFullYear();
  const pageTitle = stateConfig
    ? `Hotels with Bathtub in ${stateConfig.name}: Top ${hotels.length} Stays (${currentYear})`
    : `Hotels with Bathtub in ${cityName}: ${hotels.length === 1 ? '1 Verified Room' : `${hotels.length} Verified Rooms`} (${currentYear})`;

  const lowestPriceResult = findLowestPriceHotel(hotels);
  const minPriceHotel = lowestPriceResult?.hotel;
  const minPrice = lowestPriceResult?.price;

  const pageDescription = stateConfig
    ? stateConfig.metaDescription
    : getCityMetaDescription(cityName, countryName, countrySlug, hotels.length, minPrice);

  const destinationSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `Hotels with Bathtubs in ${cityName}`,
    "description": pageDescription,
    "url": `https://www.hotelswithbathtubs.com/${countrySlug}/${citySlug}`,
    "about": stateConfig ? {
      "@type": "State",
      "name": stateConfig.name,
      "containedInPlace": {
        "@type": "Country",
        "name": countryName,
      },
    } : {
      "@type": "City",
      "name": cityName,
      "containedInPlace": {
        "@type": "Country",
        "name": countryName,
      },
    },
  };

  const speakableSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": pageTitle,
    "description": pageDescription,
    "speakable": {
      "@type": "SpeakableSpecification",
      "cssSelector": ["h1", ".hotel-name", ".tub-type"]
    },
    "url": `https://www.hotelswithbathtubs.com/${countrySlug}/${citySlug}`
  };

  const idRequirement = countrySlug === 'india'
    ? 'valid government photo IDs (Aadhaar, Passport, or Driving License)'
    : 'valid government-issued photo ID (Passport or national ID card)';

  const neighborhoods = Array.from(new Set(hotels.map(h => h.neighborhood).filter(isValidNeighborhood))) as string[];
  const tubTypes = Array.from(new Set(hotels.map(h => h.tubType).filter(Boolean))) as string[];
  const otas = countrySlug === 'india' ? 'MakeMyTrip, Agoda, and Booking.com' : 'Booking.com, Agoda, and partner networks';

  const faqItems = stateConfig
    ? [
        ...stateConfig.faqs,
        ...(minPriceHotel && minPrice ? [{
          question: `What is the typical starting rate for a bathtub suite in ${stateConfig.name}?`,
          answer: `Nightly rates for verified bathtub suites in ${stateConfig.name} typically start from approximately ${minPrice}/night (e.g. at ${minPriceHotel.name} in ${minPriceHotel.city}), scaling to luxury 5-star spa suites depending on season and view.`
        }] : [])
      ]
    : [
        {
          question: `Which hotels in ${cityName} have private in-room bathtubs or jacuzzis?`,
          answer: `Top verified hotels in ${cityName} offering private in-room tubs include ${hotels.slice(0, 3).map(h => h.name).join(', ')}. All listings on this page have been verified across ${otas} to confirm that the specific room tier includes an authentic bathtub or jacuzzi${tubTypes.length > 0 ? ` (including ${tubTypes.slice(0, 2).join(' and ')})` : ''}.`
        },
        {
          question: `Are bathtub hotels in ${cityName} couple-friendly?`,
          answer: `Yes. Verified properties in ${cityName} featured on our guide welcome couples and provide full privacy in their suites. We recommend carrying ${idRequirement} for check-in.`
        },
        {
          question: `What is the typical nightly rate for a bathtub hotel in ${cityName}?`,
          answer: minPriceHotel && minPrice
            ? `Nightly rates for verified bathtub suites in ${cityName} typically start from approximately ${minPrice}/night (e.g. at ${minPriceHotel.name}), scaling to luxury 5-star spa suites depending on season and view.`
            : `Nightly rates for bathtub accommodations in ${cityName} vary from affordable boutique stays to ultra-luxury 5-star suites depending on seasonal demand and room tier.`
        },
        {
          question: neighborhoods.length > 0
            ? `What are the best neighborhoods in ${cityName} to stay in for a room with a bathtub?`
            : `How do I make sure my room in ${cityName} definitely has a bathtub?`,
          answer: neighborhoods.length > 0
            ? `Popular neighborhoods in ${cityName} with verified bathtub and jacuzzi hotels include ${neighborhoods.slice(0, 3).join(', ')}. Look for room categories that specifically guarantee an in-room tub.`
            : `Standard base rooms often only include standing showers. When clicking through our verified partner links, ensure you select room categories named "Suite with Bathtub", "Jacuzzi Suite", "Executive Room", or "Royal Suite" where the amenity list explicitly itemizes a private bathtub.`
        }
      ];

  // FAQPage schema derived from dynamic real property data
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqItems.map(item => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer
      }
    }))
  };

  return (
    <>
      <StructuredData data={breadcrumbSchema} />
      <StructuredData data={hotelListSchema} />
      <StructuredData data={destinationSchema} />
      <StructuredData data={faqSchema} />
      <StructuredData data={speakableSchema} />
      {hotels[0]?.image && (
        <link rel="preload" as="image" href={imageUrl(hotels[0].image)} fetchPriority="high" />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 sm:py-4 text-xs sm:text-sm font-medium text-text-muted flex items-center flex-wrap gap-1">
        <Link href="/" className="text-accent-secondary hover:underline">Home</Link>
        <span>&rsaquo;</span>
        <Link href={`/${countrySlug}`} className="text-accent-secondary hover:underline">{countryName}</Link>
        {stateConfig ? (
          <>
            <span>&rsaquo;</span>
            <span className="text-text-main font-semibold">Hotels with Bathtubs in {stateConfig.name}</span>
          </>
        ) : parentState ? (
          <>
            <span>&rsaquo;</span>
            <Link href={`/usa/${parentState.slug}`} className="text-accent-secondary hover:underline">{parentState.name}</Link>
            <span>&rsaquo;</span>
            <span className="text-text-main font-semibold">Hotels with Bathtubs in {cityName}</span>
          </>
        ) : (
          <>
            <span>&rsaquo;</span>
            <span className="text-text-main font-semibold">Hotels with Bathtubs in {cityName}</span>
          </>
        )}
      </div>

      <header className="relative py-12 sm:py-20 md:py-24 px-4 sm:px-8 text-center bg-gradient-to-br from-gray-900 to-accent-secondary text-white overflow-hidden">
        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          <div className="bg-white/20 border border-white/40 backdrop-blur-md px-3.5 sm:px-5 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-bold shadow-lg mb-4 sm:mb-6 flex items-center gap-2">
            <span>🏨</span> {hotels.length} Verified Hotels{stateConfig ? ` across ${stateConfig.cities.length} Destinations` : ''} · Triple-Source Validated · Verified {cityVerifiedDate}
          </div>
          <h1 className="font-heading text-2xl sm:text-4xl md:text-5xl font-extrabold mb-3 sm:mb-4 leading-tight">
            {stateConfig
              ? `Hotels with Bathtubs, Jacuzzis & Soaking Tubs in ${stateConfig.name}`
              : countrySlug === 'usa'
              ? `Hotels with Bathtubs, Jacuzzis & Soaking Tubs in ${cityName}`
              : `Hotels with Bathtub & Jacuzzi in ${cityName} for Couples`}
          </h1>
          <p className="text-sm sm:text-base md:text-lg font-medium opacity-90 max-w-2xl mx-auto leading-relaxed">
            {stateConfig
              ? stateConfig.intro
              : countrySlug === 'usa'
              ? `${rawHotels.length}+ verified hotels with private in-room deep soaking tubs & jacuzzi suites in ${cityName}, ${countryName} — every room verified, no shared facilities.`
              : `${rawHotels.length}+ verified hotels with private in-room bathtubs & jacuzzi suites in ${cityName}, ${countryName} — every listing triple-checked, no shared spa tubs.`}
          </p>
        </div>
      </header>

      {/* Trust Banner with SVGs (Responsive 3-column / stacked) */}
      <div className="trust-banner max-w-4xl mx-3 sm:mx-4 md:mx-auto -mt-6 sm:-mt-8 relative z-20 bg-white rounded-2xl shadow-xl grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-6 p-3.5 sm:p-5 border border-border text-xs sm:text-sm">
        <div className="flex items-center gap-2 font-semibold text-accent-secondary justify-center sm:justify-start">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-center sm:text-left">Verified on {countrySlug === 'india' ? 'MakeMyTrip, Agoda' : 'Booking.com, Agoda'} &amp; partner networks</span>
        </div>
        <div className="flex items-center gap-2 font-semibold text-accent-secondary justify-center sm:justify-start">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-sky-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
          </svg>
          <span>Guaranteed In-Room Tubs</span>
        </div>
        <div className="flex items-center gap-2 font-semibold text-accent-secondary justify-center sm:justify-start">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
          </svg>
          <span>Trusted Direct Links</span>
        </div>
      </div>

      {/* Editorial & Affiliate Disclosure */}
      <div className="max-w-4xl mx-auto px-4 sm:px-8 mt-4 mb-2 text-center">
        <p className="text-2xs sm:text-xs text-text-muted bg-gray-50 border border-gray-200 rounded-xl px-4 py-2">
          <strong>Reader Disclosure:</strong> When you book through our verified partner links on Booking.com, Agoda{countrySlug === 'india' ? ', or MakeMyTrip' : ', or partner networks'}, we may earn an affiliate commission at zero additional cost to you. We strictly recommend rooms independently verified to feature private in-room bathtubs.
        </p>
      </div>

      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-4 sm:py-8">
        {/* Quick Answer / Featured Snippet Block (Optimized for Google Position 0) */}
        <div className="bg-gradient-to-r from-blue-50/70 via-sky-50/50 to-indigo-50/50 border border-blue-200/80 rounded-2xl p-4 sm:p-6 mb-6 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-2xs font-bold text-accent uppercase tracking-wider">Quick Verified Answer</span>
            </div>
            <h2 className="font-heading text-base sm:text-lg font-bold text-accent-secondary">
              What are the best hotels with bathtubs in {cityName}?
            </h2>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              Top verified hotels featuring private in-room bathtubs and jacuzzi suites in {cityName} include{' '}
              <strong className="text-text-main font-semibold">{hotels.slice(0, 3).map(h => h.name).join(', ')}</strong>.
              All {hotels.length} stays in our directory have been independently verified across {countrySlug === 'india' ? 'MakeMyTrip, Agoda, and Booking.com' : 'Booking.com, Agoda, and partner networks'} to confirm that your private room tier guarantees an in-room bathtub or jacuzzi rather than a shared hotel spa facility.
            </p>
          </div>
          <div className="flex-shrink-0 bg-white border border-blue-100 px-4 py-3 rounded-xl text-center self-stretch sm:self-auto flex sm:flex-col justify-between sm:justify-center items-center shadow-2xs">
            <span className="text-2xs text-text-muted font-medium">Verified Stays</span>
            <span className="font-heading text-xl font-extrabold text-accent">{hotels.length}</span>
          </div>
        </div>

        {/* Constituent Destinations (State Hubs) */}
        {stateConfig && (
          <div className="mb-6 p-4 sm:p-5 bg-white rounded-2xl border border-gray-200 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div>
                <h3 className="font-heading text-sm sm:text-base font-bold text-gray-900">
                  Explore {stateConfig.name} Destinations with Verified Bathtubs
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Select a destination below to jump directly to detailed city guides and neighborhood listings:
                </p>
              </div>
              <span className="text-xs font-semibold text-[#1a6fde] bg-blue-50 px-2.5 py-1 rounded-full w-fit">
                {stateConfig.cities.length} Top Destinations
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {siblingCities.map((c) => (
                <Link
                  key={c.slug}
                  href={`/usa/${c.slug}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-blue-50/80 border border-gray-200 hover:border-blue-300 rounded-xl text-xs font-semibold text-gray-800 hover:text-[#1a6fde] transition-all group"
                >
                  <span>🛁 {c.name}</span>
                  <span className="text-[10px] bg-white border border-gray-200 text-gray-600 group-hover:border-blue-200 group-hover:text-[#1a6fde] px-1.5 py-0.5 rounded-full font-bold">
                    {c.count} {c.count === 1 ? 'stay' : 'stays'}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {jacuzziCount > 0 && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-blue-50 via-sky-50 to-indigo-50 border border-blue-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-sm flex-shrink-0">
                🌊
              </div>
              <div>
                <p className="font-heading font-bold text-gray-900 text-sm sm:text-base">
                  Looking specifically for In-Room Jacuzzis in {cityName}?
                </p>
                <p className="text-xs text-gray-600">
                  We found {jacuzziCount} verified hotel suites with private whirlpool jacuzzis and hydrotherapy jets.
                </p>
              </div>
            </div>
            <Link
              href={stateConfig ? `#directory` : `/${countrySlug}/${citySlug}/jacuzzi`}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#1a6fde] hover:bg-[#1559b8] text-white text-xs sm:text-sm font-bold shadow-sm transition-all whitespace-nowrap"
            >
              <span>View {jacuzziCount} Jacuzzi Suites</span>
              <span>&rarr;</span>
            </Link>
          </div>
        )}

        <CityHotelsClient
          hotels={hotels}
          cityName={cityName}
          countryName={countryName}
        />

        {/* Full City Hotel Directory Index (Guarantees 100% Googlebot HTML crawlability & indexation for all properties) */}
        <section id="directory" aria-label={`Directory of all verified hotels with bathtubs in ${cityName}`} className="mt-12 pt-8 border-t border-gray-200">
          <div className="bg-white rounded-2xl p-5 sm:p-7 border border-gray-200 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-gray-100">
              <div>
                <h3 className="font-heading text-lg font-bold text-gray-900">
                  All {hotels.length} Verified Bathtub Hotels &amp; Jacuzzi Suites in {cityName}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Every property listed below has been verified to confirm private in-room soaking tubs.
                </p>
              </div>
              <span className="text-xs font-semibold text-[#1a6fde] bg-blue-50 px-2.5 py-1 rounded-full w-fit">
                {hotels.length} Properties Guaranteed
              </span>
            </div>

            <nav aria-label={`All hotels with bathtubs in ${cityName}`} className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 text-xs">
              {hotels.map((h) => (
                <Link
                  key={h._id || h.slug}
                  href={`/${countrySlug}/${slugify(h.city || citySlug)}/${h.slug}`}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-blue-50/60 border border-transparent hover:border-blue-100 transition-colors group"
                >
                  <span className="font-medium text-gray-800 group-hover:text-[#1a6fde] line-clamp-1">
                    🛁 {h.name}
                  </span>
                  {h.rating && Number(h.rating) > 0 ? (
                    <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded ml-1 shrink-0">
                      ★ {Number(h.rating).toFixed(1)}
                    </span>
                  ) : null}
                </Link>
              ))}
            </nav>
          </div>
        </section>

        {/* Specialty Bathtub Collections Navigation */}
        <div className="max-w-7xl mx-auto my-10 p-5 sm:p-6 bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-sky-50/80 rounded-2xl border border-blue-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-heading text-base sm:text-lg font-bold text-gray-900 mb-1">
              Looking for a Specific Bathtub Experience?
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 max-w-2xl">
              Compare our verified thematic collections featuring private jacuzzi whirlpool suites, outdoor mountain hot tubs, and deep Japanese soaking baths globally.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/soaking-tub-hotels"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-blue-50 border border-blue-200 text-[#1a6fde] font-semibold text-xs rounded-xl shadow-2xs transition-all"
            >
              🛁 Top 50 Soaking Tub Hotels
            </Link>
            <Link
              href="/hotels-with-hot-tub-in-room"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1a6fde] hover:bg-[#1559b8] text-white font-semibold text-xs rounded-xl shadow-2xs transition-all"
            >
              ♨️ Private In-Room Hot Tubs
            </Link>
          </div>
        </div>

        {/* SEO Content / State Highlights Section */}
        {stateConfig ? (
          <div className="max-w-4xl mx-auto mt-14 sm:mt-20">
            <div className="bg-gradient-to-br from-blue-50/70 to-indigo-50/70 border border-blue-200/80 rounded-2xl p-6 sm:p-8 shadow-2xs">
              <span className="text-2xs font-bold uppercase tracking-wider text-[#1a6fde] bg-blue-100/60 px-2.5 py-1 rounded-full">
                Regional Getaways Guide
              </span>
              <h2 className="font-heading text-xl sm:text-2xl font-bold text-gray-900 mt-3 mb-4">
                Where to Find the Best In-Room Bathtubs &amp; Jacuzzi Suites in {stateConfig.name}
              </h2>
              <p className="text-sm text-gray-700 leading-relaxed mb-6 font-serif">
                {stateConfig.intro}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 sm:gap-5">
                {stateConfig.highlights.map((hl, i) => (
                  <div key={i} className="p-4 bg-white/90 rounded-xl border border-blue-100">
                    <h3 className="font-bold text-sm text-gray-900 mb-1.5 flex items-center gap-1.5">
                      <span>✨</span> {hl.region}
                    </h3>
                    <p className="text-xs text-gray-600 leading-relaxed font-serif">
                      {hl.description}
                    </p>
                  </div>
                ))}
              </div>

              {/* Neighboring State Mesh Navigation */}
              <div className="mt-8 pt-6 border-t border-blue-200/60">
                <span className="text-2xs font-bold uppercase tracking-wider text-gray-500 mb-3 block">
                  Explore More US State Getaways
                </span>
                <div className="flex flex-wrap gap-2">
                  {getAllStates()
                    .filter((s) => s.slug !== stateConfig.slug)
                    .map((s) => (
                      <Link
                        key={s.slug}
                        href={`/usa/${s.slug}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-blue-50 border border-blue-200 text-gray-800 hover:text-[#1a6fde] text-xs font-semibold rounded-lg transition-all shadow-2xs"
                      >
                        <span>{s.name}</span>
                        <span className="text-[10px] text-gray-400">&rarr;</span>
                      </Link>
                    ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto mt-14 sm:mt-20">
            <div className="bg-gradient-to-br from-amber-50/70 to-orange-50/70 border border-amber-200/80 rounded-2xl p-4 sm:p-8 shadow-2xs">
              <div dangerouslySetInnerHTML={{
                __html: generateCityPageContent(cityName, countryName, rawHotels.length)
              }} />
            </div>
          </div>
        )}

              {/* Frequently Asked Questions Section (SEO & Conversion) */}
              <section className="mt-20 pt-12 border-t border-gray-200">
                <div className="max-w-4xl mx-auto">
                  <div className="text-center mb-10">
                    <span className="text-xs font-bold uppercase tracking-wider text-accent-secondary bg-accent-secondary/10 px-3 py-1 rounded-full">
                      Frequently Asked Questions
                    </span>
                    <h2 className="font-heading text-2xl sm:text-3xl font-bold text-gray-900 mt-3">
                      Booking Bathtub &amp; Jacuzzi Hotels in {cityName}
                    </h2>
                  </div>

                  <div className="space-y-6">
                    {faqItems.map((item, idx) => (
                      <div key={idx} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                        <h3 className="font-bold text-lg text-gray-900 mb-2">
                          {item.question}
                        </h3>
                        <p className="text-gray-600 leading-relaxed">
                          {item.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Related Blogs Section */}
              {relatedBlogs.length > 0 && (
                <section className="mt-16 pt-12 border-t border-gray-200">
                  <div className="max-w-7xl mx-auto">
                    <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-accent-secondary mb-6 sm:mb-8 text-center">
                      Travel Guides &amp; Inspiration for {cityName}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                      {relatedBlogs.map((blog: any) => (
                        <Link key={blog.slug} href={`/blog/${blog.slug}`} className="group bg-white border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col">
                          <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-border bg-gray-100">
                            <img
                              src={imageUrl(blog.image)}
                              alt={blog.title}
                              loading="lazy"
                              decoding="async"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                          <div className="p-5 sm:p-6 flex flex-col flex-grow">
                            {blog.date && (
                              <p className="text-accent font-semibold text-xs sm:text-sm mb-2">
                                {isNaN(new Date(blog.date).getTime())
                                  ? blog.date
                                  : new Date(blog.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </p>
                            )}
                            <h3 className="font-heading text-lg sm:text-xl font-bold text-text-main mb-2 sm:mb-3 group-hover:text-accent transition-colors line-clamp-2">
                              {blog.title}
                            </h3>
                            <p className="text-text-muted text-sm line-clamp-3 mb-4 flex-grow font-serif">
                              {blog.excerpt}
                            </p>
                            <span className="text-accent-secondary font-semibold text-sm group-hover:underline mt-auto inline-block">Read Article &rarr;</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {/* Regional State Hub Mesh or Sister Cities */}
              {stateConfig ? (
                <section aria-label="Explore other US states with verified bathtubs" className="mt-14 pt-10 border-t border-gray-200 max-w-5xl mx-auto">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
                    <div>
                      <span className="text-2xs font-bold uppercase tracking-wider text-accent bg-accent/10 px-2.5 py-1 rounded-full">
                        More US State Hubs
                      </span>
                      <h3 className="font-heading text-lg sm:text-xl font-bold text-gray-900 mt-2">
                        Explore Other US States for In-Room Bathtubs &amp; Jacuzzis
                      </h3>
                    </div>
                    <Link
                      href="/usa"
                      className="text-xs font-bold text-[#1a6fde] hover:underline flex items-center gap-1 self-start sm:self-auto"
                    >
                      <span>Explore all USA Destinations</span>
                      <span>&rarr;</span>
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3">
                    {getAllStates()
                      .filter((s) => s.slug !== stateConfig.slug)
                      .map((s) => (
                        <Link
                          key={s.slug}
                          href={`/usa/${s.slug}`}
                          className="flex items-center justify-between p-3 rounded-xl bg-white hover:bg-blue-50/70 border border-gray-200 hover:border-[#1a6fde]/40 transition-all group shadow-2xs hover:shadow-xs"
                        >
                          <span className="text-xs font-bold text-gray-800 group-hover:text-[#1a6fde] truncate">
                            🛁 {s.name}
                          </span>
                          <span className="text-[10px] font-extrabold text-gray-500 bg-gray-50 group-hover:bg-blue-100 group-hover:text-[#1a6fde] px-2 py-0.5 rounded-full border border-gray-200 group-hover:border-blue-200 shrink-0 ml-1.5 transition-colors">
                            Explore &rarr;
                          </span>
                        </Link>
                      ))}
                  </div>
                </section>
              ) : siblingCities.length > 0 ? (
                <section aria-label={`Other destinations in ${countryName} with verified bathtubs`} className="mt-14 pt-10 border-t border-gray-200 max-w-5xl mx-auto">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
                    <div>
                      <span className="text-2xs font-bold uppercase tracking-wider text-accent bg-accent/10 px-2.5 py-1 rounded-full">
                        Regional Exploration
                      </span>
                      <h3 className="font-heading text-lg sm:text-xl font-bold text-gray-900 mt-2">
                        More Verified Bathtub &amp; Jacuzzi Stays in {countryName}
                      </h3>
                    </div>
                    <Link
                      href={`/${countrySlug}`}
                      className="text-xs font-bold text-[#1a6fde] hover:underline flex items-center gap-1 self-start sm:self-auto"
                    >
                      <span>Explore all {countryName} Destinations</span>
                      <span>&rarr;</span>
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3">
                    {siblingCities.map((c) => (
                      <Link
                        key={c.slug}
                        href={`/${countrySlug}/${c.slug}`}
                        className="flex items-center justify-between p-3 rounded-xl bg-white hover:bg-blue-50/70 border border-gray-200 hover:border-[#1a6fde]/40 transition-all group shadow-2xs hover:shadow-xs"
                      >
                        <span className="text-xs font-bold text-gray-800 group-hover:text-[#1a6fde] truncate">
                          🛁 {c.name}
                        </span>
                        <span className="text-[10px] font-extrabold text-gray-500 bg-gray-50 group-hover:bg-blue-100 group-hover:text-[#1a6fde] px-2 py-0.5 rounded-full border border-gray-200 group-hover:border-blue-200 shrink-0 ml-1.5 transition-colors">
                          {c.count} {c.count === 1 ? 'stay' : 'stays'}
                        </span>
                      </Link>
                    ))}
                  </div>

                  {parentState && (
                    <div className="mt-6 p-4 rounded-xl bg-blue-50/70 border border-blue-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <span className="text-gray-700">
                        Planning a wider trip across <strong>{parentState.name}</strong>? Explore vineyard soaking tubs, mountain hot tubs, and oceanfront suites statewide.
                      </span>
                      <Link
                        href={`/usa/${parentState.slug}`}
                        className="inline-flex items-center gap-1 text-[#1a6fde] font-bold hover:underline shrink-0"
                      >
                        <span>View all {parentState.name} Stays</span>
                        <span>&rarr;</span>
                      </Link>
                    </div>
                  )}
                </section>
              ) : null}

              {/* Also Explore: Cross-links to international & popular cities */}
              {(() => {
                const isIndia = countrySlug === 'india';
                const isTropical = ['french-polynesia', 'seychelles', 'mauritius', 'fiji', 'maldives', 'indonesia', 'greece'].includes(countrySlug);

                const tropicalLinks = [
                  { label: 'Bora Bora', href: '/french-polynesia/bora-bora' },
                  { label: 'Maldives', href: '/maldives/maldives' },
                  { label: 'Seychelles', href: '/seychelles/seychelles' },
                  { label: 'Mauritius', href: '/mauritius/mauritius' },
                  { label: 'Fiji', href: '/fiji/fiji' },
                  { label: 'Bali', href: '/indonesia/bali' },
                  { label: 'Santorini', href: '/greece/santorini' },
                  { label: 'Phuket', href: '/thailand/phuket' },
                ];

                const globalMetropolisLinks = [
                  { label: 'London', href: '/uk/london' },
                  { label: 'Paris', href: '/france/paris' },
                  { label: 'New York', href: '/usa/new-york' },
                  { label: 'Tokyo', href: '/japan/tokyo' },
                  { label: 'Dubai', href: '/uae/dubai' },
                  { label: 'Singapore', href: '/singapore/singapore' },
                  { label: 'Bangkok', href: '/thailand/bangkok' },
                  { label: 'Zurich', href: '/switzerland/zurich' },
                  { label: 'Rome', href: '/italy/rome' },
                ];

                const indiaLinks = [
                  { label: 'Goa', href: '/india/goa' },
                  { label: 'Udaipur', href: '/india/udaipur' },
                  { label: 'Manali', href: '/india/manali' },
                  { label: 'Munnar', href: '/india/munnar' },
                  { label: 'Jaipur', href: '/india/jaipur' },
                  { label: 'Mumbai', href: '/india/mumbai' },
                  { label: 'Delhi', href: '/india/delhi' },
                  { label: 'Bangalore', href: '/india/bangalore' },
                ];

                let links = globalMetropolisLinks;
                let heading = '🌏 Also Popular: Iconic Global Bathtub Stays';

                if (isIndia) {
                  links = globalMetropolisLinks;
                  heading = '🌏 Also Popular: International Luxury Stays';
                } else if (isTropical) {
                  links = tropicalLinks;
                  heading = '🏝️ Also Popular: Tropical & Overwater Bathtub Havens';
                } else {
                  links = globalMetropolisLinks;
                  heading = '🌍 Also Popular: World-Class City Bathtub Suites';
                }

                return (
                  <section className="mt-12 pt-8 border-t border-gray-200 max-w-4xl mx-auto">
                    <p className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3">{heading}</p>
                    <div className="flex flex-wrap gap-2">
                      {links
                        .filter(l => !l.href.includes(`/${countrySlug}/${citySlug}`))
                        .map(l => (
                          <Link
                            key={l.href}
                            href={l.href}
                            className="px-3 py-1.5 bg-gray-100 hover:bg-accent-secondary hover:text-white text-accent-secondary text-xs font-semibold rounded-lg transition-colors"
                          >
                            {l.label}
                          </Link>
                        ))}
                    </div>
                  </section>
                );
              })()}
            </section>
            <TrendingDestinations currentCity={cityName} />
          </>
  );
}
