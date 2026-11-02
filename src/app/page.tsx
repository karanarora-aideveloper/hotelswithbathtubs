import connectToDatabase from '@/lib/mongodb';
import Hotel from '@/models/Hotel';
import { DUPLICATE_DROP_SLUGS } from '@/data/duplicateHotels';
import StructuredData from '@/components/StructuredData';
import Link from 'next/link';
import type { PipelineStage } from 'mongoose';
import LuxuryHero from '@/components/luxury/LuxuryHero';
import LuxuryTrustProof from '@/components/luxury/LuxuryTrustProof';
import LuxuryFAQ, { FAQS } from '@/components/luxury/LuxuryFAQ';
import HomeDestinationsClient from '@/components/HomeDestinationsClient';
import RecentlyViewedRow from '@/components/RecentlyViewedRow';
import HomeMatchmakerSection from '@/components/HomeMatchmakerSection';
import HomeTubTypesGuide from '@/components/HomeTubTypesGuide';

interface AggregatedCityRaw {
  _id: { city: string; country: string };
  hotelCount: number;
  image?: string;
  avgRating?: number;
  totalReviews?: number;
  tubTypes?: string[];
  prices?: string[];
}

// Static page generation with on-demand cache
export const revalidate = false;

const currentYear = new Date().getFullYear();

// Page-level metadata — overrides layout.tsx defaults
// Front-loaded for high-impression GSC head terms: "hotels with bathtub", "bathtub in room", "jacuzzi suites"
export const metadata = {
  title: {
    absolute: `Hotels with Bathtub in Room & Jacuzzi Suites (${currentYear})`,
  },
  description: 'Find hotel rooms with private bathtubs and jacuzzi suites across worldwide destinations. Detailed tub and room notes per hotel.',
  alternates: {
    canonical: 'https://www.hotelswithbathtubs.com',
  },
  openGraph: {
    title: `Hotels with Bathtub in Room & Jacuzzi Suites (${currentYear})`,
    description: 'Find hotel rooms with private bathtubs and jacuzzi suites across worldwide destinations. Detailed tub and room notes per hotel.',
    url: 'https://www.hotelswithbathtubs.com',
    siteName: 'Hotels with Bathtubs',
    images: [
      {
        url: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
        width: 1200,
        height: 630,
        alt: 'Hotels with Bathtubs in Room - Luxury Suites',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `Hotels with Bathtub in Room & Jacuzzi Suites (${currentYear})`,
    description: 'Find hotel rooms with private bathtubs and jacuzzi suites across worldwide destinations. Detailed tub and room notes per hotel.',
    images: ['https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp'],
  },
};

async function getCities() {
  await connectToDatabase();
  
  const pipeline: PipelineStage[] = [
    // Match the city page's own filter — flagged hotels are hidden there,
    // so they must not count toward (or inflate) a city's tile here either.
    { $match: { flagged: { $ne: true } } },
    {
      $addFields: {
        hasImage: {
          $cond: [
            { $and: [{ $ne: ["$image", null] }, { $ne: ["$image", ""] }] },
            1,
            0
          ]
        }
      }
    },
    { $sort: { hasImage: -1 as const, rating: -1 as const, reviewsCount: -1 as const } },
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

  const rawCities = await Hotel.aggregate<AggregatedCityRaw>(pipeline);
  return rawCities.map((c: AggregatedCityRaw) => {
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
    const isIndia = c._id.country?.toLowerCase() === 'india';
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
      image: c.image || '',
      minPrice,
      rating,
      totalReviews: c.totalReviews || 0,
      hasJacuzzi,
    };
  });
}

async function getHomeStats(): Promise<{ totalHotels: number; totalCountries: number; provenCount: number } | null> {
  try {
    await connectToDatabase();
    const dropSlugs = Array.from(DUPLICATE_DROP_SLUGS);
    const filter = {
      flagged: { $ne: true },
      slug: { $nin: dropSlugs },
    };
    const totalHotels = await Hotel.countDocuments(filter);
    const countries = await Hotel.distinct('country', filter);
    const provenCount = await Hotel.countDocuments({
      ...filter,
      importBatch: { $ne: null },
      bookingTubLabels: { $exists: true, $not: { $size: 0 } },
    });
    if (!totalHotels || totalHotels <= 0) return null;
    return {
      totalHotels,
      totalCountries: countries.length,
      provenCount,
    };
  } catch (err) {
    console.warn('Failed to fetch home stats:', err);
    return null;
  }
}

export default async function Home() {
  const [cities, stats] = await Promise.all([
    getCities(),
    getHomeStats(),
  ]);

  // Separate into United States, Global, and India destinations
  const usaCities = cities.filter((c) => {
    const country = c._id.country?.toLowerCase();
    return country === 'usa' || country === 'united states';
  });
  const internationalCities = cities.filter((c) => {
    const country = c._id.country?.toLowerCase();
    return country !== 'india' && country !== 'usa' && country !== 'united states';
  });
  const indiaCities = cities.filter((c) => c._id.country?.toLowerCase() === 'india');

  // Authoritative region inventory counts for directory badges and CTA links
  const totalUsaCount = usaCities.length;
  const totalInternationalCount = internationalCities.length;
  const totalIndiaCount = indiaCities.length;

  // Curate top destinations for the homepage initial payload (<120 KB vs previous 1.25 MB)
  // Full regional directories are linked via /india, /usa, and country hubs
  const topUsaCities = usaCities.slice(0, 20);
  const topIndiaCities = indiaCities.slice(0, 24);

  const getCityCount = (cityName: string) => {
    const match = cities.find(
      (c) => c._id.city?.toLowerCase() === cityName.toLowerCase()
    );
    return match ? match.hotelCount : 0;
  };

  const popularDestinations = [
    {
      name: 'Las Vegas',
      href: '/usa/las-vegas',
      hotelCount: getCityCount('Las Vegas'),
      image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/bathtub-skylofts-at-mgm-grand-las-vegas.webp',
    },
    {
      name: 'Udaipur',
      href: '/india/udaipur',
      hotelCount: getCityCount('Udaipur'),
      image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/bathtub-the-oberoi-udaivilas-udaipur.webp',
    },
    {
      name: 'Sedona',
      href: '/usa/sedona',
      hotelCount: getCityCount('Sedona'),
      image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/the-joy-sedona-sedona-1.webp',
    },
    {
      name: 'London',
      href: '/uk/london',
      hotelCount: getCityCount('London'),
      image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/timeless-victorian-retreat-by-hyde-park-london-1758-1.webp',
    },
    {
      name: 'Goa',
      href: '/india/goa',
      hotelCount: getCityCount('Goa'),
      image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/elegant-2-bhk-apartments-in-peaceful-siolim-9-1.webp',
    },
    {
      name: 'Branson',
      href: '/usa/branson',
      hotelCount: getCityCount('Branson'),
      image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/all-american-inn-suites-branson-1.webp',
    },
  ];

  // Precompute top 5 cities per country for the hero pills
  const popularCitiesMap: Record<string, { city: string; countrySlug: string }[]> = {
    IN: [
      { city: 'Delhi', countrySlug: 'india' },
      { city: 'Goa', countrySlug: 'india' },
      { city: 'Rishikesh', countrySlug: 'india' },
      { city: 'Agra', countrySlug: 'india' },
      { city: 'Mumbai', countrySlug: 'india' },
    ],
    US: [
      { city: 'Las Vegas', countrySlug: 'usa' },
      { city: 'Orlando', countrySlug: 'usa' },
      { city: 'Houston', countrySlug: 'usa' },
      { city: 'San Diego', countrySlug: 'usa' },
      { city: 'New York', countrySlug: 'usa' },
    ],
    GB: [
      { city: 'London', countrySlug: 'uk' },
      { city: 'Edinburgh', countrySlug: 'uk' },
      { city: 'Manchester', countrySlug: 'uk' },
      { city: 'Bristol', countrySlug: 'uk' },
      { city: 'Bath', countrySlug: 'uk' },
    ],
    GLOBAL: [
      { city: 'Las Vegas', countrySlug: 'usa' },
      { city: 'Delhi', countrySlug: 'india' },
      { city: 'Orlando', countrySlug: 'usa' },
      { city: 'Houston', countrySlug: 'usa' },
      { city: 'San Diego', countrySlug: 'usa' },
    ],
  };

  for (const c of cities) {
    const rawCountry = (c._id.country || '').toLowerCase().trim();
    let code = '';
    let cSlug = '';
    if (rawCountry === 'india') { code = 'IN'; cSlug = 'india'; }
    else if (rawCountry === 'usa' || rawCountry === 'united states') { code = 'US'; cSlug = 'usa'; }
    else if (rawCountry === 'uk' || rawCountry === 'united kingdom') { code = 'GB'; cSlug = 'uk'; }
    else {
      code = rawCountry.toUpperCase();
      cSlug = rawCountry.replace(/\s+/g, '-');
    }
    if (code && !popularCitiesMap[code]) popularCitiesMap[code] = [];
    if (code && popularCitiesMap[code].length < 5) {
      if (!popularCitiesMap[code].some((item) => item.city === c._id.city)) {
        popularCitiesMap[code].push({ city: c._id.city, countrySlug: cSlug });
      }
    }
  }

  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Hotels with Bathtubs",
    "description": "Discover hotel rooms with private in-room bathtubs and jacuzzi suites across 60+ global destinations.",
    "url": "https://www.hotelswithbathtubs.com",
    "image": "https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://www.hotelswithbathtubs.com/?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    },
    "sameAs": [
      "https://www.facebook.com/hotelswithbathtubs",
      "https://www.instagram.com/hotelswithbathtubs",
      "https://x.com/hotelsbathtubs",
      "https://www.linkedin.com/company/hotelswithbathtubs",
      "https://www.youtube.com/@hotelswithbathtubs"
    ]
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Hotels with Bathtubs",
    "url": "https://www.hotelswithbathtubs.com",
    "logo": "https://www.hotelswithbathtubs.com/apple-icon",
    "image": "https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp",
    "description": "Directory for hotel rooms with in-room bathtubs and private jacuzzis worldwide",
    "founder": {
      "@type": "Person",
      "name": "Karan Arora",
      "jobTitle": "Founder & Luxury Hotel Scout"
    },
    "areaServed": "Worldwide",
    "sameAs": [
      "https://www.facebook.com/hotelswithbathtubs",
      "https://www.instagram.com/hotelswithbathtubs",
      "https://x.com/hotelsbathtubs",
      "https://www.linkedin.com/company/hotelswithbathtubs",
      "https://www.youtube.com/@hotelswithbathtubs"
    ]
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": FAQS.map(({ q, a }) => ({
      "@type": "Question",
      "name": q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": a,
      },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Hotels with Bathtub in Room & Jacuzzi Suites",
        "item": "https://www.hotelswithbathtubs.com/"
      }
    ]
  };

  return (
    <StructuredData data={schema}>
      <StructuredData data={organizationSchema} />
      <StructuredData data={breadcrumbSchema} />
      <StructuredData data={faqSchema}>
        <div className="min-h-screen bg-[#f5f6f8] text-[#14213d]">
          {/* Hero & Search matching Option A mockup */}
          <LuxuryHero stats={stats} popularCitiesMap={popularCitiesMap} />

          {/* Recently Viewed */}
          <section className="max-w-[1200px] mx-auto px-4 sm:px-8">
            <RecentlyViewedRow className="my-4 sm:my-6" />
          </section>

          {/* Popular destinations matching Option A mockup */}
          <section className="max-w-[1200px] mx-auto px-4 sm:px-8 py-6 sm:py-8">
            <h2 className="font-playfair text-[24px] sm:text-[26px] md:text-[34px] font-semibold text-[#14213d] mb-1">
              Popular destinations
            </h2>
            <div className="text-[13px] text-[#5b6478] mb-4 sm:mb-6 font-manrope">
              Hotels with a tub in the room
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {popularDestinations.map((dest) => (
                <Link
                  key={dest.name}
                  href={dest.href}
                  prefetch={false}
                  className="relative h-[150px] lg:h-[220px] rounded-[16px] bg-center bg-cover overflow-hidden group block shadow-xs"
                  style={{ backgroundImage: `url(${dest.image})` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent group-hover:from-black/85 transition-colors" />
                  <span className="absolute left-3.5 bottom-3 text-white font-playfair text-[20px] lg:text-[21px] font-semibold leading-tight drop-shadow-sm">
                    {dest.name}
                    <small className="block font-manrope text-[12px] font-normal text-white/90">
                      {dest.hotelCount} hotels
                    </small>
                  </span>
                </Link>
              ))}
            </div>
          </section>

          {/* How we check a bathtub matching Option A mockup */}
          <LuxuryTrustProof />

          {/* Find your tub in 4 taps teaser card */}
          <HomeMatchmakerSection />

          {/* Destination Discovery Hub */}
          <section
            id="destinations"
            className="max-w-[1200px] mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-8 scroll-mt-24"
          >
            <HomeDestinationsClient
              usaCities={topUsaCities}
              internationalCities={internationalCities}
              indiaCities={topIndiaCities}
              totalUsaCount={totalUsaCount}
              totalInternationalCount={totalInternationalCount}
              totalIndiaCount={totalIndiaCount}
            />
          </section>

          {/* Plain-Language Tub Types Guide */}
          <HomeTubTypesGuide />

          {/* FAQ Accordion */}
          <LuxuryFAQ />
        </div>
      </StructuredData>
    </StructuredData>
  );
}
