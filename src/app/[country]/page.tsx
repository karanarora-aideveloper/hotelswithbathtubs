import connectToDatabase from '@/lib/mongodb';
import Hotel from '@/models/Hotel';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import CityCard from '@/components/CityCard';
import StructuredData from '@/components/StructuredData';
import { escapeRegex, titleCase, slugify, resolveCountry } from '@/lib/utils';

export const revalidate = 3600;

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
  const geoMarkets = ['usa', 'uk', 'uae', 'singapore', 'france', 'italy', 'spain', 'japan', 'australia', 'germany', 'greece', 'switzerland', 'netherlands', 'canada'];
  const useAbsoluteTitle = geoMarkets.includes(countrySlug);
  const pageTitle = `Best Hotels with Bathtub in ${countryName} (2026) | Verified Stays`;
  const pageDescription = `Discover ${hotelCount}+ verified hotels with private in-room bathtubs & jacuzzi suites across top cities in ${countryName}. Triple-checked for couples & romantic stays.`;

  // hreflang: geographic locale signals for all priority markets
  const hreflangMap: Record<string, string> = {
    'usa': 'en-US',
    'uk': 'en-GB',
    'singapore': 'en-SG',
    'uae': 'en-AE',
    'india': 'en-IN',
    'australia': 'en-AU',
    'canada': 'en-CA',
    'ireland': 'en-IE',
    'new-zealand': 'en-NZ',
  };
  const localeCode = hreflangMap[countrySlug];

  return {
    title: useAbsoluteTitle ? { absolute: pageTitle } : pageTitle,
    description: pageDescription,
    alternates: {
      canonical: `/${countrySlug}`,
      languages: {
        ...(localeCode ? { [localeCode]: `https://www.hotelswithbathtubs.com/${countrySlug}` } : {}),
        'x-default': 'https://www.hotelswithbathtubs.com',
      },
    },
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: `https://www.hotelswithbathtubs.com/${countrySlug}`,
      siteName: 'Hotels with Bathtubs',
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
        image: { $first: "$image" }
      }
    },
    { $sort: { hotelCount: -1 as const } }
  ];

  const cities = await Hotel.aggregate<any>(pipeline);

  if (cities.length === 0) {
    notFound();
  }

  const totalHotels = cities.reduce((acc, curr) => acc + curr.hotelCount, 0);

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
                <Link href="/" className="text-accent-secondary hover:underline">Home</Link>
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
                  Every property featured across our {countryName} destinations is triple-verified across MakeMyTrip, Agoda, and Booking.com to confirm that your chosen room tier guarantees a private in-room soaking tub or whirlpool jacuzzi.
                </p>
              </div>

              <div className="flex items-center justify-between mb-6 sm:mb-8 border-b border-gray-200 pb-3">
                <div>
                  <h2 className="font-heading text-xl sm:text-3xl font-bold text-accent-secondary">Romantic Destinations</h2>
                  <p className="text-text-muted text-xs sm:text-sm mt-1">Select a city in {countryName} to find your perfect stay with private tubs</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-8">
                {cities.map((item: any, idx: number) => (
                  <CityCard
                    key={`${item._id.city}-${item._id.country}`}
                    city={item._id.city}
                    country={item._id.country}
                    hotelCount={item.hotelCount}
                    image={item.image}
                    priority={idx < 4}
                  />
                ))}
              </div>

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
