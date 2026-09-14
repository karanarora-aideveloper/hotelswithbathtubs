import connectToDatabase from '@/lib/mongodb';
import Hotel from '@/models/Hotel';
import Link from 'next/link';
import HomeSearch from '@/components/HomeSearch';
import HomeGeoShortcuts from '@/components/HomeGeoShortcuts';
import HomeDestinationsClient from '@/components/HomeDestinationsClient';
import { imageUrl } from '@/lib/imageUrl';
import StructuredData from '@/components/StructuredData';

// Force dynamic or revalidate since it's a directory
export const revalidate = 3600; // Revalidate every hour

// Page-level metadata — overrides layout.tsx defaults
// Targeting "hotel with bathtub in room" (1,000/mo, $0.72 CPC, currently pos 15.9)
export const metadata = {
  title: 'Hotels with Bathtubs in Room | Verified Stays Worldwide',
  description: 'Find hotels with bathtubs in room — verified stays across Booking.com, Agoda & MakeMyTrip. Discover private deep soaking tubs and jacuzzi suites worldwide.',
  alternates: {
    canonical: '/',
    languages: {
      'en-US': 'https://www.hotelswithbathtubs.com/usa',
      'en-IN': 'https://www.hotelswithbathtubs.com/india',
      'x-default': 'https://www.hotelswithbathtubs.com',
    },
  },
  openGraph: {
    title: 'Hotels with Bathtubs in Room | Verified Stays Worldwide',
    description: 'Find hotels with bathtubs in room — verified stays across Booking.com, Agoda & MakeMyTrip. Discover private deep soaking tubs and jacuzzi suites worldwide.',
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
    title: 'Hotels with Bathtubs in Room | Verified Stays Worldwide',
    description: 'Find hotels with bathtubs in room — verified stays across Booking.com, Agoda & MakeMyTrip. Discover private deep soaking tubs and jacuzzi suites worldwide.',
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
        image: { $first: "$image" }
      }
    },
    { $sort: { hotelCount: -1 as const } }
  ];

  const cities = await Hotel.aggregate<any>(pipeline);
  return cities;
}

export default async function Home() {
  const cities = await getCities();

  // Separate into United States, Global Romantic, and India destinations
  const usaCities = cities.filter(c => {
    const country = c._id.country?.toLowerCase();
    return country === 'usa' || country === 'united states';
  });
  const internationalCities = cities.filter(c => {
    const country = c._id.country?.toLowerCase();
    return country !== 'india' && country !== 'usa' && country !== 'united states';
  });
  const indiaCities = cities.filter(c => c._id.country?.toLowerCase() === 'india');

  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Hotels with Bathtubs",
    "description": "Discover premium hotels with private bathtubs and jacuzzis. Triple-verified across MakeMyTrip, Agoda & Booking.com.",
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
      "https://www.instagram.com/hotelswithbathtubs"
    ]
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Hotels with Bathtubs",
    "url": "https://www.hotelswithbathtubs.com",
    "logo": "https://www.hotelswithbathtubs.com/apple-icon",
    "image": "https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp",
    "description": "Premium hotel directory with verified in-room bathtubs and jacuzzi suites worldwide",
    "founder": {
      "@type": "Person",
      "name": "Karan Arora",
      "jobTitle": "Founder & Luxury Hotel Scout"
    },
    "areaServed": "Worldwide"
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How do I find a hotel with bathtub in room?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Use the search on Hotels with Bathtubs to browse by city. Every listing is triple-verified — we confirm the bathtub is in your room (not a shared spa) across Booking.com, Agoda, and MakeMyTrip before listing it."
        }
      },
      {
        "@type": "Question",
        "name": "What is the difference between a bathtub in room and a jacuzzi suite?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "A hotel room with bathtub features a standard deep soaking tub or freestanding bath inside your private bathroom. A jacuzzi suite has a whirlpool or jetted tub with massaging jets. Both are private to your room. Hotels with Bathtubs lists both types and clearly labels each property."
        }
      },
      {
        "@type": "Question",
        "name": "Are hotels with bathtub in room more expensive?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Not always. Many mid-range and boutique hotels include bathtubs in standard rooms. Our directory covers options from ₹2,500/night in India to luxury international suites across 100+ destinations worldwide."
        }
      },
      {
        "@type": "Question",
        "name": "Which cities have the most hotels with bathtubs in room?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "In India: Kolkata, Delhi, Goa, Jaipur, and Udaipur. In the USA: New York, Las Vegas, Boston, Miami, and Los Angeles. Globally: London, Dubai, Paris, Singapore, Bangkok, and Tokyo all feature extensive selections of luxury rooms with private in-room bathtubs and jacuzzis."
        }
      }
    ]
  };

  return (
    <StructuredData data={schema}>
      <StructuredData data={organizationSchema} />
      <StructuredData data={faqSchema}>
        <>
          <header className="relative pt-32 pb-44 px-4 sm:px-8 text-center bg-accent-secondary hero-overlay overflow-hidden">
            <img
              src="https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp"
              alt="Hotels with Bathtubs - Verified Luxury Suites"
              loading="eager"
              fetchPriority="high"
              decoding="async"
              className="object-cover object-center absolute inset-0 z-0 w-full h-full"
            />
            <div className="relative z-10 max-w-4xl mx-auto text-white">
              <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 drop-shadow-lg leading-tight">
                Hotels with Bathtub in Room &amp; Private Jacuzzis
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl font-medium drop-shadow-md mb-8 opacity-90 max-w-3xl mx-auto">
                700+ curated hotels with bathtub in room — every listing triple-verified across MakeMyTrip, Agoda &amp; Booking.com. No misleading photos. Guaranteed private tubs.
              </p>
            </div>
          </header>
          
          {/* Main Search Panel + Direct Inspiration Navigation */}
          <div className="relative z-20 max-w-4xl mx-4 md:mx-auto -mt-20 bg-white p-4 sm:p-6 rounded-2xl shadow-2xl border border-black/5">
            <HomeSearch />
            
            {/* Above-The-Fold Inspiration Shortcuts (Geo-Adaptive) */}
            <HomeGeoShortcuts />
          </div>

          {/* Trust Strip with Clean Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 p-4 md:p-5 mb-10 bg-white border-b border-border shadow-sm mx-4 md:mx-auto max-w-4xl rounded-b-2xl text-xs sm:text-sm">
            <div className="flex items-center gap-2 font-semibold text-accent-secondary">
              <svg className="w-5 h-5 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Verified on MakeMyTrip, Agoda &amp; Booking.com</span>
            </div>
            <div className="flex items-center gap-2 font-semibold text-accent-secondary">
              <svg className="w-5 h-5 text-sky-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
              <span>Guaranteed In-Room Tubs</span>
            </div>
            <div className="flex items-center gap-2 font-semibold text-accent-secondary">
              <svg className="w-5 h-5 text-indigo-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
              <span>Trusted Booking Links</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full font-medium text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Live Status: Verified Active</span>
            </div>
          </div>

          {/* Streamlined & Consolidated Proof Module */}
          <section id="verification" className="max-w-5xl mx-auto px-4 sm:px-8 py-8 sm:py-12 scroll-mt-24">
            <div className="bg-gradient-to-br from-accent/5 to-accent-secondary/5 border border-accent/20 rounded-3xl p-6 sm:p-10 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-accent/15">
                <div>
                  <h2 className="font-heading text-2xl sm:text-3xl font-bold text-accent-secondary">
                    Our Triple-Verification Promise
                  </h2>
                  <p className="text-text-muted text-sm mt-1">
                    Eliminating misleading photos so you enjoy guaranteed in-room bathtubs and jacuzzis.
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-full shadow-2xs self-start md:self-auto">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>Independently Checked &amp; Active</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-5 rounded-2xl border border-border shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 font-bold text-accent-secondary mb-2 text-base">
                      <span className="w-7 h-7 rounded-full bg-accent-secondary text-white text-xs flex items-center justify-center font-bold">1</span>
                      <span>MakeMyTrip Audit</span>
                    </div>
                    <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                      Confirmed "Bathtub", "Jacuzzi", or "Jacuzzi/Bathtub" room tags in verified listings.
                    </p>
                  </div>
                  <span className="text-2xs font-semibold text-emerald-700 mt-3 block">✓ Verified Amenity Tags</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-border shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 font-bold text-accent-secondary mb-2 text-base">
                      <span className="w-7 h-7 rounded-full bg-accent-secondary text-white text-xs flex items-center justify-center font-bold">2</span>
                      <span>Agoda Facility Check</span>
                    </div>
                    <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                      Cross-referenced against Agoda's explicit "Bathtub" and private jacuzzi room facility filter.
                    </p>
                  </div>
                  <span className="text-2xs font-semibold text-emerald-700 mt-3 block">✓ Verified Facilities</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-border shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 font-bold text-accent-secondary mb-2 text-base">
                      <span className="w-7 h-7 rounded-full bg-accent-secondary text-white text-xs flex items-center justify-center font-bold">3</span>
                      <span>Booking.com Validation</span>
                    </div>
                    <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                      Validated in room specifications for genuine in-room hot tubs and deep soaking tubs.
                    </p>
                  </div>
                  <span className="text-2xs font-semibold text-emerald-700 mt-3 block">✓ Verified Room Specs</span>
                </div>
              </div>
            </div>
          </section>

          {/* Main Destination Discovery Hub (Geo-Adaptive & Interactive Tabs) */}
          <section id="destinations" className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-16 scroll-mt-24">
            <HomeDestinationsClient
              usaCities={usaCities}
              internationalCities={internationalCities}
              indiaCities={indiaCities}
            />
            {/* FAQ Section — targets "hotel with bathtub in room" long-tail + enables FAQPage schema */}
            <section id="faq" aria-label="Frequently Asked Questions" className="max-w-3xl mx-auto">
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-accent-secondary mb-6">
                Hotel with Bathtub in Room — Common Questions
              </h2>
              <div className="space-y-4">
                {[
                  {
                    q: 'How do I find a hotel with bathtub in room?',
                    a: 'Use the search on this page to browse by city. Every listing on Hotels with Bathtubs is triple-verified — we confirm the bathtub is in your room (not in a shared spa or gym) across Booking.com, Agoda, and MakeMyTrip before listing it.',
                  },
                  {
                    q: 'What is the difference between a bathtub in room and a jacuzzi suite?',
                    a: 'A hotel room with bathtub typically features a standard deep soaking tub or freestanding bath inside your private bathroom. A jacuzzi suite has a whirlpool or jetted tub — usually larger, with massaging jets. Both are private to your room. We list both types and clearly label which each property offers.',
                  },
                  {
                    q: 'Are hotels with bathtub in room more expensive?',
                    a: 'Not always. Many mid-range and boutique hotels include bathtubs in standard rooms. Our directory covers options from ₹2,500/night in India to luxury international suites — filter by destination to find verified bathtub rooms in every budget tier.',
                  },
                  {
                    q: 'Which cities have the most hotels with bathtubs in room?',
                    a: 'In India: Kolkata, Delhi, Goa, Jaipur, and Udaipur have the highest density of verified bathtub hotels. Internationally: Dubai, Singapore, Bangkok, Tokyo, and London all have strong selections of luxury rooms with private in-room bathtubs.',
                  },
                ].map(({ q, a }) => (
                  <details key={q} className="group border border-border rounded-xl overflow-hidden">
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
  );
}
