import connectToDatabase from '@/lib/mongodb';
import Hotel from '@/models/Hotel';
import StructuredData from '@/components/StructuredData';
import Link from 'next/link';
import type { PipelineStage } from 'mongoose';
import LuxuryHero from '@/components/luxury/LuxuryHero';
import LuxuryTrustProof from '@/components/luxury/LuxuryTrustProof';
import LuxuryFAQ, { FAQS } from '@/components/luxury/LuxuryFAQ';
import HomeDestinationsClient from '@/components/HomeDestinationsClient';
import RecentlyViewedRow from '@/components/RecentlyViewedRow';

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
  description: 'Find 4,400+ hotels with private bathtubs in room & jacuzzi suites across 119 countries. Private tubs, checked per hotel.',
  alternates: {
    canonical: 'https://www.hotelswithbathtubs.com',
  },
  openGraph: {
    title: `Hotels with Bathtub in Room & Jacuzzi Suites (${currentYear})`,
    description: 'Find 4,400+ hotels with private bathtubs in room & jacuzzi suites across 119 countries. Private tubs, checked per hotel.',
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
    description: 'Find 4,400+ hotels with private bathtubs in room & jacuzzi suites across 119 countries. Private tubs, checked per hotel.',
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

export default async function Home() {
  const cities = await getCities();

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
  ];

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
          {/* Hero & Search matching Style B mockup */}
          <LuxuryHero />

          {/* Recently Viewed */}
          <section className="max-w-4xl mx-auto px-4 sm:px-6">
            <RecentlyViewedRow className="my-4 sm:my-6" />
          </section>

          {/* Popular destinations matching Style B mockup */}
          <section className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
            <h2 className="font-playfair text-[24px] sm:text-[26px] font-semibold text-[#14213d] mb-1">
              Popular destinations
            </h2>
            <div className="text-[13px] text-[#5b6478] mb-4 font-manrope">
              Hotels with a tub in the room
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {popularDestinations.map((dest) => (
                <Link
                  key={dest.name}
                  href={dest.href}
                  prefetch={false}
                  className="relative h-[150px] rounded-[14px] bg-center bg-cover overflow-hidden group block shadow-xs"
                  style={{ backgroundImage: `url(${dest.image})` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent group-hover:from-black/85 transition-colors" />
                  <span className="absolute left-3 bottom-2.5 text-white font-playfair text-[20px] font-semibold leading-tight drop-shadow-sm">
                    {dest.name}
                    <small className="block font-manrope text-[11px] font-normal text-white/90">
                      {dest.hotelCount} hotels
                    </small>
                  </span>
                </Link>
              ))}
            </div>
          </section>

          {/* How we check a bathtub matching Style B mockup */}
          <LuxuryTrustProof />

          {/* Find your tub in 4 taps teaser card */}
          <section className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
            <div className="bg-white border border-[#e3e7ef] rounded-[14px] p-5 sm:p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-playfair text-[20px] sm:text-[22px] font-semibold text-[#14213d] mb-1">
                  Find your tub in 4 taps
                </h2>
                <p className="text-[13px] text-[#5b6478]">
                  Pick your destination, tub style, and trip dates to see matching stays.
                </p>
              </div>
              <Link
                href="/matchmaker"
                prefetch={false}
                className="bg-[#b08d57] hover:bg-[#9c7b48] text-white rounded-[10px] px-5 py-2.5 font-bold text-[13px] transition-colors whitespace-nowrap self-start sm:self-auto inline-flex items-center gap-1.5 shadow-xs font-manrope"
              >
                <span>Start</span>
                <span>&rarr;</span>
              </Link>
            </div>
          </section>

          {/* Destination Discovery Hub */}
          <section
            id="destinations"
            className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 scroll-mt-24"
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
          <section className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
            <h2 className="font-playfair text-[22px] sm:text-[26px] font-semibold text-[#14213d] mb-1">
              Tub types
            </h2>
            <div className="text-[13px] text-[#5b6478] mb-4">
              The three styles of tubs you will find in our listings
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="bg-white border border-[#e3e7ef] rounded-[14px] p-4 shadow-xs">
                <span className="text-2xl mb-2 block">🛁</span>
                <h3 className="font-playfair font-semibold text-[#14213d] text-base mb-1">
                  Bathtub
                </h3>
                <p className="text-xs sm:text-[13px] text-[#5b6478] leading-relaxed">
                  A bathtub is a normal tub to soak in.
                </p>
              </div>
              <div className="bg-white border border-[#e3e7ef] rounded-[14px] p-4 shadow-xs">
                <span className="text-2xl mb-2 block">🫧</span>
                <h3 className="font-playfair font-semibold text-[#14213d] text-base mb-1">
                  Jetted tub
                </h3>
                <p className="text-xs sm:text-[13px] text-[#5b6478] leading-relaxed">
                  A jetted tub is a bathtub with powered water jets for massage.
                </p>
              </div>
              <div className="bg-white border border-[#e3e7ef] rounded-[14px] p-4 shadow-xs">
                <span className="text-2xl mb-2 block">♨️</span>
                <h3 className="font-playfair font-semibold text-[#14213d] text-base mb-1">
                  Hot tub
                </h3>
                <p className="text-xs sm:text-[13px] text-[#5b6478] leading-relaxed">
                  A hot tub is a heated tub with water jets.
                </p>
              </div>
            </div>
          </section>

          {/* FAQ Accordion */}
          <LuxuryFAQ />
        </div>
      </StructuredData>
    </StructuredData>
  );
}
