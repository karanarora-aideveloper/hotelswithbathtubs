import connectToDatabase from '@/lib/mongodb';
import { shouldIndexDestination } from '@/lib/indexing';
import Hotel from '@/models/Hotel';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { imageUrl, DEFAULT_HOTEL_IMAGE } from '@/lib/imageUrl';
import StructuredData from '@/components/StructuredData';
import CityHotelsClient from '@/components/CityHotelsClient';
import Blog from '@/models/Blog';
import { escapeRegex, buildCityRegex, titleCase, slugify, resolveCountry, isValidNeighborhood } from '@/lib/utils';
import { sanitizePlaceholderText } from '@/lib/location';
import { isDuplicateDropSlug, DUPLICATE_DROP_SLUGS } from '@/data/duplicateHotels';
import TrendingDestinations from '@/components/TrendingDestinations';

export const revalidate = false;

const JACUZZI_FILTER = {
  flagged: { $ne: true },
  $or: [
    { tubType: /jacuzzi|whirlpool|hot tub|jet/i },
    { amenities: /jacuzzi|hot tub|whirlpool/i }
  ]
};

export async function generateStaticParams() {
  await connectToDatabase();
  const destinations = await Hotel.aggregate([
    { $match: JACUZZI_FILTER },
    { $group: { _id: { city: "$city", country: "$country" } } }
  ]);

  return destinations.map((d: any) => {
    const countryInfo = resolveCountry(d._id.country);
    return {
      country: countryInfo.slug,
      city: slugify(d._id.city),
    };
  });
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

  const cityRegex = buildCityRegex(rawCity);
  const [firstHotel, hotelCount] = await Promise.all([
    Hotel.findOne({
      city: cityRegex,
      country: countryInfo.regex,
      ...JACUZZI_FILTER
    }).select('image'),
    Hotel.countDocuments({
      city: cityRegex,
      country: countryInfo.regex,
      ...JACUZZI_FILTER
    }),
  ]);

  if (hotelCount === 0) {
    return {
      title: `Hotels with Jacuzzi in ${cityName} Not Found`,
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const ogImage = firstHotel && firstHotel.image
    ? imageUrl(firstHotel.image.split('/').pop() || '')
    : DEFAULT_HOTEL_IMAGE;

  const currentYear = new Date().getFullYear();
  const pageTitle = hotelCount === 1
    ? `Hotels with Jacuzzi in Room in ${cityName}: 1 Verified Suite (${currentYear})`
    : `Hotels with Jacuzzi in Room in ${cityName} (${hotelCount} Top Suites) (${currentYear})`;
  const pageDescription = `Looking for romantic hotels with private jacuzzi in room in ${cityName}? Discover ${hotelCount === 1 ? '1 verified suite' : `${hotelCount}+ verified suites`} with in-room whirlpool tubs, balcony hot tubs, and deep jetted spas in ${cityName}, ${countryName}.`;

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
      canonical: `https://www.hotelswithbathtubs.com/${countrySlug}/${citySlug}/jacuzzi`,
    },
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: `https://www.hotelswithbathtubs.com/${countrySlug}/${citySlug}/jacuzzi`,
      siteName: 'Hotels with Bathtubs',
      locale: countrySlug === 'uk' ? 'en_GB' : 'en_US',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `Hotels with Jacuzzi in Room in ${cityName}`,
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

export default async function CityJacuzziHotelsPage({
  params,
}: {
  params: Promise<{ country: string; city: string }>;
}) {
  const resolvedParams = await params;
  await connectToDatabase();

  const countryInfo = resolveCountry(resolvedParams.country);
  const rawCity = decodeURIComponent(resolvedParams.city).replace(/-/g, ' ');
  const cityName = titleCase(rawCity);
  const countryName = countryInfo.displayName;
  const countrySlug = countryInfo.slug;
  const citySlug = slugify(rawCity);

  const cityRegex = buildCityRegex(rawCity);
  const rawHotels = await Hotel.find({
    city: cityRegex,
    country: countryInfo.regex,
    ...JACUZZI_FILTER
  }).sort({ rating: -1 }).lean();

  const activeHotels = rawHotels.filter((h: any) => !isDuplicateDropSlug(h.slug));

  if (activeHotels.length === 0) {
    notFound();
  }

  const hotels = activeHotels.map((h: any) => ({
    _id: h._id?.toString(),
    name: h.name,
    city: h.city,
    country: h.country,
    slug: h.slug || slugify(h.name),
    image: h.image,
    images: Array.isArray(h.images) && h.images.length > 0 ? h.images : (h.image ? [h.image] : []),
    partnerImages: Array.isArray(h.partnerImages) ? h.partnerImages.slice(0, 5) : [],
    url: h.url,
    agodaUrl: h.agodaUrl,
    bookingUrl: h.bookingUrl,
    airbnbUrl: h.airbnbUrl,
    tripUrl: h.tripUrl,
    amenities: h.amenities || [],
    description: sanitizePlaceholderText(h.description || ''),
    rating: h.rating,
    reviewsCount: h.reviewsCount,
    roomType: h.roomType,
    tubType: h.tubType,
    bookingTip: h.bookingTip,
    price: h.price,
    neighborhood: isValidNeighborhood(h.neighborhood) ? h.neighborhood : undefined,
    landmarkDistance: sanitizePlaceholderText(h.landmarkDistance),
  }));

  // Fetch related blog guides
  const relatedBlogs = await Blog.find({
    city: cityRegex,
    published: true
  }).limit(3).sort({ createdAt: -1 });

  // Breadcrumb schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
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
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": `Hotels with Bathtubs in ${cityName}`,
        "item": `https://www.hotelswithbathtubs.com/${countrySlug}/${citySlug}`
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": `Hotels with Jacuzzi in Room in ${cityName}`,
        "item": `https://www.hotelswithbathtubs.com/${countrySlug}/${citySlug}/jacuzzi`
      }
    ]
  };

  const hotelListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `Hotels with Jacuzzi in Room in ${cityName}`,
    "description": `Curated list of verified hotel suites featuring private in-room whirlpool tubs, jacuzzis, and hot tubs in ${cityName}, ${countryName}.`,
    "numberOfItems": hotels.length,
    "itemListElement": hotels.map((h, idx) => {
      const hasRealRating = h.rating && Number(h.rating) > 0;
      const hasRealReviews = h.reviewsCount && Number(h.reviewsCount) > 0;

      return {
        "@type": "ListItem",
        "position": idx + 1,
        "url": `https://www.hotelswithbathtubs.com/${countrySlug}/${citySlug}/${h.slug || slugify(h.name)}`,
        "name": h.name,
        "item": {
          "@type": "LodgingBusiness",
          "name": h.name,
          "description": sanitizePlaceholderText(h.description) || `Verified hotel suite with private in-room jacuzzi whirlpool tub in ${cityName}`,
          "image": {
            "@type": "ImageObject",
            "url": imageUrl(h.image?.split('/').pop() || ''),
            "caption": `${h.name} - Private Jacuzzi Suite in ${cityName}`
          },
          "url": `https://www.hotelswithbathtubs.com/${countrySlug}/${citySlug}/${h.slug || slugify(h.name)}`,
          "address": {
            "@type": "PostalAddress",
            "addressLocality": cityName,
            "addressCountry": countryName
          },
          ...(h.price ? { "priceRange": `${h.price}` } : {}),
          ...(hasRealReviews ? {
            "aggregateRating": {
              "@type": "AggregateRating",
              ...(hasRealRating ? { "ratingValue": Number(h.rating).toFixed(1) } : {}),
              "reviewCount": Number(h.reviewsCount),
              "bestRating": "5",
              "worstRating": "1"
            }
          } : {}),
          "amenityFeature": [
            { "@type": "LocationFeatureSpecification", "name": "Private Jacuzzi in Room", "value": true },
            { "@type": "LocationFeatureSpecification", "name": "Whirlpool Hydrotherapy Tub", "value": true },
            ...(h.amenities || []).map((a: string) => ({
              "@type": "LocationFeatureSpecification",
              "name": a,
              "value": true
            }))
          ]
        }
      };
    })
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `Are the jacuzzis in ${cityName} hotel rooms completely private?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Yes. Every property featured on this page guarantees that the whirlpool jacuzzi or jetted tub is located directly inside your private guest room or on your secluded suite balcony — never in a communal hotel spa or public wellness area.`
        }
      },
      {
        "@type": "Question",
        "name": `Which hotels in ${cityName} offer the best private jacuzzi in room?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Top-rated hotels in ${cityName} with guaranteed in-room jacuzzis include ${hotels.slice(0, 3).map(h => h.name).join(', ')}. Each listing has been verified with direct room category tracking.`
        }
      },
      {
        "@type": "Question",
        "name": `How do I ensure I get the jacuzzi room when booking online?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Standard base rooms rarely have hydrotherapy jets. When clicking through our verified partner links, select rooms titled "Jacuzzi Suite", "Whirlpool King", "Presidential Suite", or "Spa Villa" where the room amenities explicitly state private hot tub or whirlpool.`
        }
      },
      {
        "@type": "Question",
        "name": `What is the difference between a soaking tub and a jacuzzi in ${cityName}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `A soaking tub is a deep, free-standing bath designed for peaceful immersion without mechanical jets. A jacuzzi or whirlpool features powered motorized water jets, air bubbles, and hydrotherapy massage systems designed for relaxation and muscle relief.`
        }
      }
    ]
  };

  return (
    <>
      <StructuredData data={breadcrumbSchema} />
      <StructuredData data={hotelListSchema} />
      <StructuredData data={faqSchema} />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 sm:py-4 text-xs sm:text-sm font-medium text-text-muted flex items-center flex-wrap gap-1">
        <Link href="/" prefetch={false} className="text-accent-secondary hover:underline">Home</Link>
        <span>&rsaquo;</span>
        <Link href={`/${countrySlug}`} prefetch={false} className="text-accent-secondary hover:underline">{countryName}</Link>
        <span>&rsaquo;</span>
        <Link href={`/${countrySlug}/${citySlug}`} prefetch={false} className="text-accent-secondary hover:underline">{cityName}</Link>
        <span>&rsaquo;</span>
        <span className="text-text-main font-semibold">Hotels with Jacuzzi in Room</span>
      </div>

      {/* Switcher tabs: Bathtubs vs Jacuzzi */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 mb-4">
        <div className="inline-flex items-center p-1 bg-gray-100 rounded-xl text-xs sm:text-sm font-semibold">
          <Link
            href={`/${countrySlug}/${citySlug}`}
            prefetch={false}
            className="px-4 py-2 rounded-lg text-gray-600 hover:text-gray-900 transition-colors"
          >
            🛁 All Bathtub Hotels ({cityName})
          </Link>
          <span className="px-4 py-2 rounded-lg bg-white text-[#1a6fde] shadow-sm font-bold">
            🌊 In-Room Jacuzzi &amp; Whirlpool ({hotels.length})
          </span>
        </div>
      </div>

      <header className="relative py-12 sm:py-18 md:py-20 px-4 sm:px-8 text-center bg-gradient-to-br from-blue-950 via-indigo-950 to-slate-900 text-white overflow-hidden rounded-2xl max-w-7xl mx-auto">
        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          <div className="bg-blue-500/20 border border-blue-400/30 backdrop-blur-md px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold shadow-lg mb-4 flex items-center gap-2 text-blue-200">
            <span>🌊</span> {hotels.length} Verified In-Room Jacuzzi Suites
          </div>
          <h1 className="font-heading text-2xl sm:text-4xl md:text-5xl font-black mb-3 leading-tight tracking-tight">
            Hotels with Jacuzzi in Room in {cityName}
          </h1>
          <p className="text-sm sm:text-base md:text-lg font-medium text-blue-100/90 max-w-2xl mx-auto leading-relaxed">
            Every suite verified with guaranteed private hydrotherapy whirlpool jets, in-room jacuzzis, and romantic hot tubs in {cityName}, {countryName}. Zero shared spa facilities.
          </p>
        </div>
      </header>

      {/* Trust Banner */}
      <div className="trust-banner max-w-4xl mx-3 sm:mx-4 md:mx-auto -mt-6 sm:-mt-8 relative z-20 bg-white rounded-2xl shadow-xl grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-6 p-3.5 sm:p-5 border border-border text-xs sm:text-sm">
        <div className="flex items-center gap-2 font-semibold text-accent-secondary justify-center sm:justify-start">
          <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>100% Private In-Room Jacuzzi</span>
        </div>
        <div className="flex items-center gap-2 font-semibold text-accent-secondary justify-center sm:justify-start">
          <svg className="w-5 h-5 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
          </svg>
          <span>Active Hydrotherapy Jets</span>
        </div>
        <div className="flex items-center gap-2 font-semibold text-accent-secondary justify-center sm:justify-start">
          <svg className="w-5 h-5 text-indigo-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
          </svg>
          <span>Verified Room Tiers</span>
        </div>
      </div>

      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-4 sm:py-8">
        {/* Quick Answer Block */}
        <div className="bg-gradient-to-r from-blue-50/80 via-sky-50/60 to-indigo-50/60 border border-blue-200 rounded-2xl p-4 sm:p-6 mb-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
              <span className="text-2xs font-bold text-blue-700 uppercase tracking-wider">Jacuzzi Guide Answer</span>
            </div>
            <h2 className="font-heading text-base sm:text-lg font-bold text-gray-900">
              Where can I book a hotel room with a private jacuzzi in {cityName}?
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Top verified hotel suites featuring private in-room whirlpool jacuzzis in {cityName} include{' '}
              <strong className="text-gray-900 font-semibold">{hotels.slice(0, 3).map(h => h.name).join(', ')}</strong>.
              All {hotels.length} properties featured below have undergone room-tier verification to ensure you book an authentic private whirlpool or hot tub directly in your quarters.
            </p>
          </div>
        </div>

        {/* Client Hotel Grid */}
        <CityHotelsClient hotels={hotels} cityName={cityName} countryName={countryName} />

        {/* Related Travel Guides */}
        {relatedBlogs.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h3 className="font-heading text-xl font-bold text-gray-900 mb-4">
              Featured {cityName} Travel &amp; Bathtub Guides
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {relatedBlogs.map((b: any) => (
                <Link
                  key={b.slug}
                  href={`/blog/${b.slug}`}
                  className="group bg-white p-4 rounded-xl border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all"
                >
                  <p className="font-bold text-gray-900 group-hover:text-blue-600 text-sm line-clamp-2">
                    {b.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-2 line-clamp-2">{b.excerpt}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* FAQs */}
        <div className="mt-12 bg-white rounded-2xl border border-gray-200 p-6 sm:p-8">
          <h2 className="font-heading text-xl sm:text-2xl font-bold text-gray-900 mb-6">
            Frequently Asked Questions: Jacuzzi Hotels in {cityName}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-gray-900 text-sm sm:text-base mb-2">
                Are these jacuzzis private or shared?
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                All jacuzzis and whirlpool tubs listed on this page are strictly private and located inside the private guest room or on a secluded private balcony.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm sm:text-base mb-2">
                How do I select the exact jacuzzi room?
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                When clicking our partner links, be sure to reserve the specific suite tier (such as &quot;Whirlpool Suite&quot;, &quot;Jacuzzi Room&quot;, or &quot;Spa Villa&quot;) rather than the baseline standard room.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm sm:text-base mb-2">
                Are couples welcomed at these jacuzzi suites?
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Yes. All verified accommodations on HotelsWithBathtubs welcome couples and respect complete guest privacy.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm sm:text-base mb-2">
                What is the difference between a soaking bath and a jacuzzi?
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Soaking baths are deep, still water baths. Jacuzzis and whirlpools include powered motorized jets providing hydrotherapy and soothing massage bubbles.
              </p>
            </div>
          </div>
        </div>

        {/* Trending Destinations */}
        <TrendingDestinations currentCity={cityName} />
      </section>
    </>
  );
}
