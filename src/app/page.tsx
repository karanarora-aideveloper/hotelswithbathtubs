import connectToDatabase from '@/lib/mongodb';
import Hotel from '@/models/Hotel';
import StructuredData from '@/components/StructuredData';
import LuxuryHero from '@/components/luxury/LuxuryHero';
import LuxuryTrustProof from '@/components/luxury/LuxuryTrustProof';
import LuxuryBathtubTypologies from '@/components/luxury/LuxuryBathtubTypologies';
import LuxuryFeaturedSuites from '@/components/luxury/LuxuryFeaturedSuites';
import LuxuryFAQ from '@/components/luxury/LuxuryFAQ';
import DreamSoakMatchmaker from '@/components/DreamSoakMatchmaker';
import HomeDestinationsClient from '@/components/HomeDestinationsClient';

// Static page generation with on-demand cache
export const revalidate = false;

// Page-level metadata — overrides layout.tsx defaults
// Front-loaded for high-impression GSC head terms: "hotels with bathtub", "bathtub in room", "jacuzzi suites"
export const metadata = {
  title: {
    absolute: 'Hotels with Bathtub in Room & Jacuzzi Suites (2026)',
  },
  description: 'Find 2,500+ verified hotels with private bathtubs in room & jacuzzi suites across 111 countries. Triple-checked luxury stays.',
  alternates: {
    canonical: 'https://www.hotelswithbathtubs.com/',
  },
  openGraph: {
    title: 'Hotels with Bathtub in Room & Jacuzzi Suites (2026)',
    description: 'Find 2,500+ verified hotels with private bathtubs in room & jacuzzi suites across 111 countries. Triple-checked luxury stays.',
    url: 'https://www.hotelswithbathtubs.com',
    siteName: 'Hotels with Bathtubs',
    images: [
      {
        url: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
        width: 1200,
        height: 630,
        alt: 'Hotels with Bathtubs in Room - Verified Luxury Suites',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hotels with Bathtub in Room & Jacuzzi Suites (2026)',
    description: 'Find 2,500+ verified hotels with private bathtubs in room & jacuzzi suites across 111 countries. Triple-checked luxury stays.',
    images: ['https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp'],
  },
};

async function getCities() {
  await connectToDatabase();
  
  const pipeline: any[] = [
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

  const rawCities = await Hotel.aggregate<any>(pipeline);
  return rawCities.map((c) => {
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
      image: c.image,
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

  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Hotels with Bathtubs",
    "description": "Discover verified hotel rooms with private in-room bathtubs and jacuzzi suites across 60+ global destinations.",
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
    "description": "Verified directory for hotel rooms with in-room bathtubs and private jacuzzis worldwide",
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
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How do I find a hotel with a private bathtub in room?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Use the destination search or browse our curated city collections. Every hotel listed on Hotels with Bathtubs is triple-verified across Booking.com, Agoda, and MakeMyTrip to guarantee the bathtub or jacuzzi is private inside your room."
        }
      },
      {
        "@type": "Question",
        "name": "What is the difference between a soaking bathtub and a jacuzzi suite?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "A soaking bathtub features a deep freestanding marble, stone, or clawfoot bath designed for still, immersive hot baths. A jacuzzi suite includes a hydrotherapy tub equipped with powered massage jets and temperature controls."
        }
      },
      {
        "@type": "Question",
        "name": "What bathtub types are most common across luxury hotels in India?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "In India, luxury heritage palaces and modern resorts feature distinct architectural bath typologies: hand-carved sunken Makrana marble baths in Rajasthan, private terrace jacuzzis in Goa, vintage Victorian clawfoot tubs in colonial hill stations like Shimla, and open-air granite stone baths in Kerala backwaters."
        }
      },
      {
        "@type": "Question",
        "name": "Are hotel rooms with private bathtubs more expensive?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Not always. While presidential suites and monument-view villas command premium rates, many five-star and boutique hotels feature bathtubs in standard and executive category rooms. Starting rates range from ₹4,500/night in India and $150/night internationally."
        }
      }
    ]
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
        <div className="min-h-screen bg-[#FAF8F5] text-[#121518]">
          {/* Phase 1 & 2: Aman-Inspired Cinematic Hero & Concierge Search */}
          <LuxuryHero />

          {/* Phase 2: Understated Verification & Trust Seal */}
          <LuxuryTrustProof />

          {/* Phase 2: Country-Specific Bathtub Typologies (India & Global) */}
          <LuxuryBathtubTypologies />

          {/* Phase 2: Featured Iconic Bathtub Suites */}
          <LuxuryFeaturedSuites />

          {/* Interactive Matchmaker Segment */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
            <div className="border border-[#E5E1D8] rounded-3xl overflow-hidden bg-white shadow-xs">
              <DreamSoakMatchmaker embedded={true} />
            </div>
          </section>

          {/* Destination Discovery Hub */}
          <section id="destinations" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16 scroll-mt-24">
            <HomeDestinationsClient
              usaCities={usaCities}
              internationalCities={internationalCities}
              indiaCities={indiaCities}
            />

            {/* Quiet Luxury FAQ Accordion */}
            <LuxuryFAQ />
          </section>
        </div>
      </StructuredData>
    </StructuredData>
  );
}
