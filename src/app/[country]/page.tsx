import connectToDatabase from '@/lib/mongodb';
import Hotel from '@/models/Hotel';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import StructuredData from '@/components/StructuredData';
import CountryCitiesClient from '@/components/CountryCitiesClient';
import { escapeRegex, titleCase, slugify, resolveCountry } from '@/lib/utils';
import { getAllStates } from '@/lib/usStates';

export const revalidate = false;

export async function generateStaticParams() {
  await connectToDatabase();
  const countries = await Hotel.aggregate([
    { $match: { flagged: { $ne: true } } },
    { $group: { _id: "$country" } }
  ]);

  const seen = new Set<string>();
  const params: { country: string }[] = [];

  for (const c of countries) {
    const info = resolveCountry(c._id);
    if (!seen.has(info.slug)) {
      seen.add(info.slug);
      params.push({ country: info.slug });
    }
  }

  return params;
}

export async function generateMetadata({ params }: { params: Promise<{ country: string }> }) {
  const resolvedParams = await params;
  await connectToDatabase();

  const countryInfo = resolveCountry(resolvedParams.country);
  const countryName = countryInfo.displayName;
  const countrySlug = countryInfo.slug;

  // Count active hotels and grab the highest-rated hotel image for a country-specific OG image
  const [hotelCount, firstHotel] = await Promise.all([
    Hotel.countDocuments({ country: countryInfo.regex, flagged: { $ne: true } }),
    Hotel.findOne({ country: countryInfo.regex, flagged: { $ne: true }, image: { $exists: true, $ne: '' } })
      .sort({ rating: -1 })
      .select('image'),
  ]);

  if (hotelCount === 0) {
    return {
      title: 'Country Not Found',
    };
  }

  // Use best hotel photo as OG image; fallback to a generic bathtub image
  const ogImageUrl = firstHotel?.image
    ? firstHotel.image.startsWith('http')
      ? firstHotel.image
      : `https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/${firstHotel.image.split('/').pop()}`
    : 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp';

  // SERP-optimised title: front-loaded, year for freshness, trust hook
  // India gets shorter title (was 80 chars, Google truncates at ~60) 
  const currentYear = new Date().getFullYear();
  const pageTitle = countrySlug === 'india'
    ? `Best Hotels with Bathtub & Jacuzzi in India (${currentYear})`
    : `Best Hotels with Bathtub in ${countryName} (${currentYear}) | Verified Stays`;
  const pageDescription = `Discover ${hotelCount}+ verified hotels with private in-room bathtubs & jacuzzi suites across top cities in ${countryName}. Triple-checked for couples & romantic stays.`;

  return {
    title: { absolute: pageTitle },
    description: pageDescription,
    alternates: {
      canonical: `/${countrySlug}`,
    },
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: `https://www.hotelswithbathtubs.com/${countrySlug}`,
      siteName: 'Hotels with Bathtubs',
      locale: countrySlug === 'uk' ? 'en_GB' : 'en_US',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `Hotels with Bathtubs in ${countryName}`,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDescription,
      images: [ogImageUrl],
    },
  };
}


export default async function CountryHubPage({
  params,
}: {
  params: Promise<{ country: string }>;
}) {
  const resolvedParams = await params;
  await connectToDatabase();

  const countryInfo = resolveCountry(resolvedParams.country);
  const countryName = countryInfo.displayName;
  const countrySlug = countryInfo.slug;

  // Aggregate cities and active hotel counts inside this country
  const pipeline = [
    {
      $match: {
        country: countryInfo.regex,
        flagged: { $ne: true }
      }
    },
    {
      $group: {
        _id: { city: "$city", country: "$country" },
        hotelCount: { $sum: 1 },
        image: { $first: "$image" },
        avgRating: { $avg: "$rating" },
        totalReviews: { $sum: "$reviewsCount" },
        tubTypes: { $addToSet: "$tubType" },
        prices: { $push: "$price" },
      }
    },
    { $sort: { hotelCount: -1 as const } }
  ];

  const rawCities = await Hotel.aggregate<any>(pipeline);
  const cities = rawCities.map((c) => {
    let minP = Infinity;
    let minPriceStr = '';
    for (const p of c.prices || []) {
      if (!p) continue;
      const num = parseInt(p.replace(/[^0-9]/g, '') || '0', 10);
      if (num > 0 && num < minP) {
        minP = num;
        minPriceStr = p;
      }
    }
    const hasJacuzzi = (c.tubTypes || []).some((t: string) =>
      /jacuzzi|whirlpool|jet|hot tub/i.test(t || '')
    );
    const isIndia = countrySlug === 'india';
    const curr = minPriceStr
      ? minPriceStr.includes('$')
        ? '$'
        : minPriceStr.includes('€')
        ? '€'
        : minPriceStr.includes('£')
        ? '£'
        : isIndia
        ? '₹'
        : '$'
      : isIndia
      ? '₹'
      : '$';
    const minPrice = minP !== Infinity ? `${curr}${minP.toLocaleString()}` : isIndia ? '₹2,499' : '$149';
    const rating = c.avgRating ? Number(c.avgRating.toFixed(1)) : undefined;

    return {
      _id: c._id,
      hotelCount: c.hotelCount,
      image: c.image,
      minPrice,
      rating,
      totalReviews: c.totalReviews || 0,
      hasJacuzzi,
    };
  });

  if (cities.length === 0) {
    notFound();
  }

  const totalHotels = cities.reduce((acc, curr) => acc + curr.hotelCount, 0);

  const stateSummaries = countrySlug === 'usa'
    ? getAllStates().map((state) => {
        const stateHotelCount = state.cities.reduce((sum, cName) => {
          const match = rawCities.find((rc: any) => rc._id?.city?.toLowerCase() === cName.toLowerCase());
          return sum + (match?.hotelCount || 0);
        }, 0);
        return {
          ...state,
          hotelCount: stateHotelCount,
        };
      })
    : [];

  // Breadcrumb List Schema
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
        "name": `Hotels with Bathtubs in ${countryName}`,
        "item": `https://www.hotelswithbathtubs.com/${countrySlug}`
      }
    ]
  };

  // ISO 3166-1 alpha-2 codes for structured data
  const isoCountryMap: Record<string, string> = {
    'usa': 'US', 'uk': 'GB', 'uae': 'AE', 'india': 'IN', 'singapore': 'SG',
    'thailand': 'TH', 'malaysia': 'MY', 'japan': 'JP', 'france': 'FR',
    'indonesia': 'ID', 'italy': 'IT', 'netherlands': 'NL', 'greece': 'GR',
    'switzerland': 'CH', 'canada': 'CA', 'spain': 'ES', 'maldives': 'MV',
    'turkey': 'TR', 'australia': 'AU', 'mexico': 'MX', 'new-zealand': 'NZ',
    'french-polynesia': 'PF', 'seychelles': 'SC', 'mauritius': 'MU', 'fiji': 'FJ',
    'germany': 'DE', 'portugal': 'PT', 'south-africa': 'ZA', 'austria': 'AT',
    'czechia': 'CZ', 'hungary': 'HU', 'ireland': 'IE', 'brazil': 'BR',
    'costa-rica': 'CR', 'saint-lucia': 'LC', 'jamaica': 'JM', 'bahamas': 'BS',
    'dominican-republic': 'DO', 'turks-and-caicos': 'TC', 'barbados': 'BB',
    'aruba': 'AW', 'iceland': 'IS', 'norway': 'NO', 'finland': 'FI',
    'sweden': 'SE', 'denmark': 'DK', 'south-korea': 'KR', 'taiwan': 'TW',
    'vietnam': 'VN', 'sri-lanka': 'LK', 'croatia': 'HR', 'morocco': 'MA',
    'tanzania': 'TZ', 'chile': 'CL', 'argentina': 'AR', 'peru': 'PE',
    'colombia': 'CO', 'poland': 'PL', 'slovenia': 'SI',
    'qatar': 'QA', 'oman': 'OM', 'bahrain': 'BH', 'jordan': 'JO', 'saudi-arabia': 'SA',
    'philippines': 'PH', 'cambodia': 'KH', 'laos': 'LA', 'nepal': 'NP',
    'estonia': 'EE', 'latvia': 'LV', 'lithuania': 'LT', 'georgia': 'GE', 'azerbaijan': 'AZ',
    'cyprus': 'CY', 'malta': 'MT', 'tunisia': 'TN', 'egypt': 'EG',
    'uzbekistan': 'UZ', 'kazakhstan': 'KZ', 'mongolia': 'MN',
    'belize': 'BZ', 'guatemala': 'GT', 'panama': 'PA',
    'kenya': 'KE', 'rwanda': 'RW', 'zimbabwe': 'ZW', 'namibia': 'NA',
    'montenegro': 'ME', 'albania': 'AL', 'bosnia-and-herzegovina': 'BA', 'north-macedonia': 'MK',
    'cape-verde': 'CV', 'bermuda': 'BM', 'greenland': 'GL', 'faroe-islands': 'FO',
    'cook-islands': 'CK', 'samoa': 'WS', 'vanuatu': 'VU', 'new-caledonia': 'NC',
    'madagascar': 'MG', 'mozambique': 'MZ', 'botswana': 'BW', 'zambia': 'ZM',
    'honduras': 'HN', 'nicaragua': 'NI', 'curacao': 'CW', 'antigua-and-barbuda': 'AG',
    'ecuador': 'EC', 'uruguay': 'UY', 'bolivia': 'BO', 'paraguay': 'PY',
  };

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `Hotels with Bathtub in ${countryName}`,
    "description": `Discover ${totalHotels}+ verified hotels with private in-room bathtubs & jacuzzi suites across top cities in ${countryName}.`,
    "url": `https://www.hotelswithbathtubs.com/${countrySlug}`,
    "spatialCoverage": {
      "@type": "Country",
      "name": countryName,
      "address": {
        "@type": "PostalAddress",
        "addressCountry": isoCountryMap[countrySlug] || countrySlug.toUpperCase().slice(0, 2)
      }
    }
  };

  // ItemList Schema for Cities in this Country
  const cityListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `Destinations with Bathtubs in ${countryName}`,
    "description": `Browse top cities in ${countryName} featuring verified hotels with in-room bathtubs and private jacuzzis.`,
    "numberOfItems": cities.length,
    "itemListElement": cities.map((c, idx) => ({
      "@type": "ListItem",
      "position": idx + 1,
      "url": `https://www.hotelswithbathtubs.com/${countrySlug}/${slugify(c._id.city)}`,
      "name": `${c._id.city}, ${countryName}`
    }))
  };

  const topCitiesNames = cities.slice(0, 4).map(c => c._id.city).join(', ');

  const countryFaqs = [
    {
      q: `How are hotels with bathtubs in ${countryName} verified?`,
      a: `Every hotel listed across ${countryName} is triple-verified across MakeMyTrip, Agoda, and Booking.com. We audit room specifications to guarantee that your room includes a private in-room soaking tub or jacuzzi rather than a shared hotel spa facility.`
    },
    {
      q: `Are bathtub hotels in ${countryName} suitable for couples and romantic getaways?`,
      a: `Yes. All verified hotels in ${countryName} featured in our guide welcome couples and provide complete privacy for romantic staycations, anniversaries, and honeymoons.`
    },
    {
      q: `Which destinations in ${countryName} have the best bathtub hotels?`,
      a: `Top popular destinations for bathtub and jacuzzi stays in ${countryName} include ${topCitiesNames}. Each offers a diverse selection of luxury 5-star suites and boutique retreats.`
    },
    {
      q: `How do I guarantee my room category includes a private bathtub?`,
      a: `When booking through our verified partner links, check that your chosen room tier (such as "Jacuzzi Suite", "Executive Room with Bathtub", or "Luxury Spa Villa") explicitly lists the private bathtub amenity before confirming your reservation.`
    }
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": countryFaqs.map(faq => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a
      }
    }))
  };

  return (
    <StructuredData data={collectionSchema}>
      <StructuredData data={breadcrumbSchema}>
        <StructuredData data={cityListSchema}>
          <StructuredData data={faqSchema}>
            <>
              <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 sm:py-4 text-xs sm:text-sm font-medium text-text-muted flex items-center flex-wrap gap-1">
                <Link href="/" prefetch={false} className="text-accent-secondary hover:underline">Home</Link>
                <span>&rsaquo;</span>
                <span className="text-text-main font-semibold">Hotels with Bathtubs in {countryName}</span>
              </div>

            <header className="relative py-12 sm:py-20 md:py-24 px-4 sm:px-8 text-center bg-gradient-to-br from-gray-900 to-accent-secondary text-white overflow-hidden">
              <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
                <div className="bg-white/20 border border-white/40 backdrop-blur-md px-3.5 sm:px-5 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-bold shadow-lg mb-4 sm:mb-6 flex items-center gap-2">
                  <span>🌍</span> {cities.length} {cities.length === 1 ? 'City' : 'Cities'} · {totalHotels} Verified Stays
                </div>
                <h1 className="font-heading text-2xl sm:text-4xl md:text-5xl font-extrabold mb-3 sm:mb-4 leading-tight">
                  Hotels with Bathtub in Room in {countryName}
                </h1>
                <p className="text-sm sm:text-base md:text-lg font-medium opacity-90 max-w-2xl mx-auto leading-relaxed">
                  Explore romantic destinations in {countryName} offering private in-room bathtubs and jacuzzis, triple-verified for couples.
                </p>
              </div>
            </header>

            <section className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-16">
              {/* Country Hub Editorial Context */}
              <div className="bg-gradient-to-br from-amber-50/70 to-orange-50/70 border border-amber-200/80 rounded-2xl p-4 sm:p-8 shadow-xs mb-8 sm:mb-12">
                <h2 className="font-heading text-xl sm:text-2xl font-bold text-accent-secondary mb-3">
                  Why Book a Bathtub Hotel in {countryName}?
                </h2>
                <p className="text-gray-700 leading-relaxed mb-3 text-xs sm:text-sm md:text-base">
                  Whether you are planning an anniversary, a romantic honeymoon, or a rejuvenating weekend getaway, {countryName} offers an incredible collection of luxury hotels, heritage villas, and boutique resorts featuring private in-room bathtubs and jacuzzi suites.
                </p>
                <p className="text-gray-700 leading-relaxed text-xs sm:text-sm md:text-base">
                  Every property featured across our {countryName} destinations is triple-verified across {countrySlug === 'india' ? 'MakeMyTrip, Agoda, and Booking.com' : 'Booking.com, Agoda, and partner networks'} to confirm that your chosen room tier guarantees a private in-room soaking tub or whirlpool jacuzzi.
                </p>
              </div>

              {/* Specialty Bathtub Collections Navigation */}
              <div className="mb-10 p-5 sm:p-6 bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-sky-50/80 rounded-2xl border border-blue-100 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-heading text-base sm:text-lg font-bold text-gray-900 mb-1">
                    Explore Hand-Curated In-Room Tub Categories
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 max-w-2xl">
                    Looking for a specific bathing style? Browse our verified global guides for deep Japanese soaking tubs and private in-room whirlpool jacuzzi suites.
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
                    ♨️ In-Room Hot Tub Suites
                  </Link>
                </div>
              </div>

              {/* Featured US State Directories */}
              {countrySlug === 'usa' && (
                <section className="mb-14">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 border-b border-gray-200 pb-3">
                    <div>
                      <span className="text-2xs font-bold uppercase tracking-wider text-[#1a6fde] bg-blue-50 px-2.5 py-1 rounded-full">
                        Browse by State
                      </span>
                      <h2 className="font-heading text-xl sm:text-2xl font-bold text-gray-900 mt-2">
                        Top US States for In-Room Bathtubs &amp; Jacuzzi Suites
                      </h2>
                      <p className="text-text-muted text-xs sm:text-sm mt-1">
                        Explore verified romantic getaways, wine country soaking tubs, and mountain hot tub chalets statewide
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full w-fit">
                      12 State Hubs
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
                    {stateSummaries.map((state) => (
                      <Link
                        key={state.slug}
                        href={`/usa/${state.slug}`}
                        className="group bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col"
                      >
                        <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
                          <img
                            src={state.heroImage}
                            alt={`Hotels with bathtubs in ${state.name}`}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-xs text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                            {state.hotelCount} {state.hotelCount === 1 ? 'Stay' : 'Stays'}
                          </div>
                        </div>
                        <div className="p-4 flex flex-col flex-grow">
                          <div className="flex items-center justify-between mb-1.5">
                            <h3 className="font-heading text-base font-bold text-gray-900 group-hover:text-[#1a6fde] transition-colors">
                              {state.name}
                            </h3>
                            <span className="text-[10px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full">
                              {state.cities.length} {state.cities.length === 1 ? 'City' : 'Cities'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-3">
                            {state.tagline}
                          </p>
                          <div className="mt-auto pt-2.5 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-[#1a6fde]">
                            <span>Explore {state.shortName}</span>
                            <span>&rarr;</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              <div className="flex items-center justify-between mb-6 sm:mb-8 border-b border-gray-200 pb-3">
                <div>
                  <h2 className="font-heading text-xl sm:text-3xl font-bold text-accent-secondary">Romantic Destinations</h2>
                  <p className="text-text-muted text-xs sm:text-sm mt-1">Select a city in {countryName} to find your perfect stay with private tubs</p>
                </div>
              </div>

              <CountryCitiesClient
                initialCities={cities.slice(0, 48).map((c) => ({
                  _id: c._id,
                  hotelCount: c.hotelCount,
                  image: c.image,
                  minPrice: c.minPrice,
                  rating: c.rating,
                  totalReviews: c.totalReviews,
                  hasJacuzzi: c.hasJacuzzi,
                }))}
                remainingCities={cities.slice(48).map((c) => [
                  c._id.city,
                  c._id.country,
                  c.hotelCount,
                  c.image,
                  c.minPrice,
                  c.hasJacuzzi,
                ])}
              />

              {/* Curated Seasonal & Regional Travel Guides for USA */}
              {countrySlug === 'usa' && (
                <section className="mt-16 pt-10 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-3">
                    <div>
                      <h2 className="font-heading text-xl sm:text-2xl font-bold text-gray-900">Curated USA Jacuzzi & Bathtub Travel Guides</h2>
                      <p className="text-gray-500 text-xs sm:text-sm mt-1">Seasonal getaways, romantic couple suites, and winter mountain retreats</p>
                    </div>
                    <Link href="/blog" className="text-xs font-semibold text-[#1a6fde] hover:underline hidden sm:block">
                      View all guides &rarr;
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Link
                      href="/blog/winter-jacuzzi-getaways-usa"
                      className="group p-5 bg-white rounded-2xl border border-gray-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-2.5 py-1 rounded-full inline-block mb-3">
                          ❄️ Seasonal Getaways
                        </span>
                        <h3 className="font-heading text-base sm:text-lg font-bold text-gray-900 group-hover:text-[#1a6fde] transition-colors mb-2">
                          Top Winter Jacuzzi Getaways in the USA
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                          12 snowbound mountain resorts, alpine chalets, and fireside jetted tubs from Aspen to the Poconos.
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-[#1a6fde]">
                        <span>Read Travel Guide</span>
                        <span>&rarr;</span>
                      </div>
                    </Link>

                    <Link
                      href="/blog/valentines-day-hotels-with-jacuzzi-in-room"
                      className="group p-5 bg-white rounded-2xl border border-gray-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full inline-block mb-3">
                          ❤️ Romantic Stays
                        </span>
                        <h3 className="font-heading text-base sm:text-lg font-bold text-gray-900 group-hover:text-[#1a6fde] transition-colors mb-2">
                          Valentine&apos;s Day Hotels with In-Room Jacuzzis
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                          Hand-verified romantic hotel suites with private couple whirlpool tubs, champagne service, and candlelit ambiance.
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-[#1a6fde]">
                        <span>Read Travel Guide</span>
                        <span>&rarr;</span>
                      </div>
                    </Link>
                  </div>
                </section>
              )}

              {/* Frequently Asked Questions Section */}
              <section className="mt-20 pt-12 border-t border-gray-200 max-w-4xl mx-auto">
                <div className="text-center mb-10">
                  <span className="text-xs font-bold uppercase tracking-wider text-accent-secondary bg-accent-secondary/10 px-3 py-1 rounded-full">
                    Frequently Asked Questions
                  </span>
                  <h2 className="font-heading text-2xl sm:text-3xl font-bold text-gray-900 mt-3">
                    Booking Bathtub Hotels in {countryName}
                  </h2>
                </div>

                <div className="space-y-4">
                  {countryFaqs.map(({ q, a }) => (
                    <details key={q} className="group border border-border rounded-xl overflow-hidden bg-white">
                      <summary className="flex items-center justify-between gap-3 p-4 sm:p-5 cursor-pointer font-semibold text-sm sm:text-base text-accent-secondary list-none hover:bg-accent/5 transition-colors">
                        {q}
                        <svg className="w-4 h-4 flex-shrink-0 transition-transform group-open:rotate-180 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </summary>
                      <p className="px-4 sm:px-5 pb-4 sm:pb-5 text-sm text-text-muted leading-relaxed border-t border-border pt-3">
                        {a}
                      </p>
                    </details>
                  ))}
                </div>
              </section>
            </section>
          </>
        </StructuredData>
      </StructuredData>
    </StructuredData>
  </StructuredData>
  );
}
