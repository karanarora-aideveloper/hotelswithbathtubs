import { Metadata } from 'next';
import FallbackImg from '@/components/FallbackImg';
import Link from 'next/link';
import connectToDatabase from '@/lib/mongodb';
import Hotel from '@/models/Hotel';
import StructuredData from '@/components/StructuredData';
import { imageUrl, DEFAULT_HOTEL_IMAGE } from '@/lib/imageUrl';
import { slugify, resolveCountry } from '@/lib/utils';
import OutboundLink from '@/components/OutboundLink';
import TrendingDestinations from '@/components/TrendingDestinations';
import { sanitizePlaceholderText } from '@/lib/location';

export const dynamic = 'force-static';

const currentYear = new Date().getFullYear();

export const metadata: Metadata = {
  title: 'Hotels with Soaking Tub in Room',
  description: 'Verified luxury hotels with private deep soaking tubs, freestanding stone bathtubs, and scenic bath suites across top US & international getaways.',
  alternates: {
    canonical: 'https://www.hotelswithbathtubs.com/soaking-tub-hotels',
  },
  openGraph: {
    title: `Hotels with Soaking Tub in Room (${currentYear})`,
    description: 'Explore hand-picked luxury hotels with private in-room deep soaking bathtubs, Japanese ofuro tubs, and freestanding stone baths.',
    url: 'https://www.hotelswithbathtubs.com/soaking-tub-hotels',
    siteName: 'Hotels with Bathtubs',
    images: [
      {
        url: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/the-greenwich-hotel-new-york-1.webp',
        width: 1200,
        height: 630,
        alt: 'Hotels with Soaking Tub in Room',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `Hotels with Soaking Tub in Room (${currentYear})`,
    description: 'Explore hand-picked luxury hotels with private in-room deep soaking bathtubs.',
    images: ['https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/the-greenwich-hotel-new-york-1.webp'],
  },
};

const FEATURED_SOAKING_DESTINATIONS = [
  { name: 'New York', country: 'USA', slug: '/usa/new-york', desc: 'Skyline soaking tubs with Central Park & Manhattan views', icon: '🗽' },
  { name: 'London', country: 'UK', slug: '/uk/london', desc: 'Mayfair & Kensington heritage freestanding bathtubs', icon: '🇬🇧' },
  { name: 'Paris', country: 'France', slug: '/france/paris', desc: 'Boutique Haussmannian marble soaking baths near Eiffel Tower', icon: '🗼' },
  { name: 'Aspen', country: 'USA', slug: '/usa/aspen', desc: 'Alpine fireside cedar & stone deep soaking tubs', icon: '🏔️' },
  { name: 'Chicago', country: 'USA', slug: '/usa/chicago', desc: 'High-rise floor-to-ceiling river view soaking suites', icon: '🏙️' },
  { name: 'Tokyo', country: 'Japan', slug: '/japan/tokyo', desc: 'Traditional cedar Japanese ofuro & panoramic skyline tubs', icon: '🇯🇵' },
  { name: 'Miami', country: 'USA', slug: '/usa/miami', desc: 'Tropical oceanfront terrace deep soaking tubs', icon: '🌴' },
  { name: 'Bangkok', country: 'Thailand', slug: '/thailand/bangkok', desc: 'Riverside 5-star freestanding oval tubs overlooking Chao Phraya', icon: '🇹🇭' },
  { name: 'San Francisco', country: 'USA', slug: '/usa/san-francisco', desc: 'Nob Hill bay-view marble soaking sanctuaries', icon: '🌁' },
  { name: 'Zurich', country: 'Switzerland', slug: '/switzerland/zurich', desc: 'Lake Zurich waterfront thermal soaking suites', icon: '🇨🇭' },
];

export default async function SoakingTubHotelsPage() {
  await connectToDatabase();

  const topSoakingHotels = await Hotel.find({
    flagged: { $ne: true },
    tubType: /soaking|deep soaking|stone|freestanding|clawfoot/i,
    rating: { $gte: 4.4 },
  })
    .sort({ rating: -1, reviewsCount: -1 })
    .limit(12)
    .lean();

  const totalCount = await Hotel.countDocuments({
    flagged: { $ne: true },
    tubType: /soaking|deep soaking|stone|freestanding|clawfoot/i,
  });

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
        "name": "Hotels with Soaking Tub in Room",
        "item": "https://www.hotelswithbathtubs.com/soaking-tub-hotels"
      }
    ]
  };

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Hotels with Soaking Tub in Room",
    "description": "Curated collection of verified luxury hotels featuring private deep soaking bathtubs and freestanding stone baths in room.",
    "url": "https://www.hotelswithbathtubs.com/soaking-tub-hotels",
  };

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Top Hotels with Soaking Tub in Room",
    "numberOfItems": topSoakingHotels.length,
    "itemListElement": topSoakingHotels.map((h: any, idx: number) => {
      const countryInfo = resolveCountry(h.country);
      const citySlug = slugify(h.city || '');
      const hotelSlug = h.slug || slugify(h.name);
      return {
        "@type": "ListItem",
        "position": idx + 1,
        "name": h.name,
        "url": `https://www.hotelswithbathtubs.com/${countryInfo.slug}/${citySlug}/${hotelSlug}`
      };
    })
  };

  return (
    <>
      <StructuredData data={breadcrumbSchema} />
      <StructuredData data={collectionSchema} />
      <StructuredData data={itemListSchema} />

      <div className="bg-[#f8fafc] min-h-screen font-jakarta">
        {/* Breadcrumb Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 sm:py-4 text-xs sm:text-sm font-medium text-gray-500 flex items-center flex-wrap gap-1">
          <Link href="/" prefetch={false} className="text-[#1a6fde] hover:underline">Home</Link>
          <span>&rsaquo;</span>
          <span className="text-gray-900 font-semibold">Soaking Tub Hotels</span>
        </div>

        {/* Hero Header */}
        <header className="relative py-14 sm:py-20 px-4 sm:px-8 text-center bg-gradient-to-br from-gray-950 via-slate-900 to-[#1a6fde] text-white overflow-hidden">
          <div className="relative z-10 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-bold mb-4 shadow-sm">
              <span>🛁</span> {totalCount}+ Verified Deep Soaking Tubs Worldwide
            </div>
            <h1 className="font-heading text-3xl sm:text-5xl font-black mb-4 tracking-tight leading-tight">
              Hotels with Private Deep Soaking Tubs in Room
            </h1>
            <p className="text-base sm:text-lg text-white/85 max-w-2xl mx-auto leading-relaxed">
              Every listing verified. Discover handcrafted stone tubs, Japanese ofuro soaking baths, and freestanding panoramic tubs for the ultimate mindful retreat.
            </p>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-16">
          {/* Top Soaking Destinations Mesh */}
          <section className="mb-16">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#1a6fde] bg-blue-50 px-2.5 py-1 rounded-full">
                  Top Destinations
                </span>
                <h2 className="font-heading text-xl sm:text-2xl font-bold text-gray-900 mt-2">
                  Iconic Cities for In-Room Soaking Tubs
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
              {FEATURED_SOAKING_DESTINATIONS.map((dest) => (
                <Link
                  key={dest.slug}
                  href={dest.slug}
                  className="bg-white p-4 rounded-2xl border border-gray-200/80 hover:border-[#1a6fde] hover:shadow-md transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="text-2xl mb-1.5">{dest.icon}</div>
                    <h3 className="font-bold text-sm text-gray-900 group-hover:text-[#1a6fde] transition-colors">
                      {dest.name}, {dest.country}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 leading-snug line-clamp-2">
                      {dest.desc}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-[#1a6fde] mt-3 block group-hover:underline">
                    View Stays &rarr;
                  </span>
                </Link>
              ))}
            </div>
          </section>

          {/* Curated Top Stays Grid */}
          <section className="mb-16">
            <div className="mb-8">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
                Curated Inventory
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-gray-900 mt-2">
                Hand-Picked Deep Soaking Bath Suites
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Room categories where booking partners specify a deep soaking tub inside the private suite.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
              {topSoakingHotels.map((h: any) => {
                const countryInfo = resolveCountry(h.country);
                const citySlug = slugify(h.city || '');
                const hotelSlug = h.slug || slugify(h.name);
                const hotelUrl = `/${countryInfo.slug}/${citySlug}/${hotelSlug}`;
                const bookingUrl = h.bookingUrl || h.agodaUrl || h.airbnbUrl || h.tripUrl || h.url;

                return (
                  <div
                    key={h._id}
                    className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col"
                  >
                    <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
                      <FallbackImg
                        src={imageUrl(h.image)}
                        alt={`${h.name} - Deep soaking tub in ${h.city}`}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {h.tubType && (
                        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-gray-900 border border-gray-200/80 shadow-xs">
                          🛁 {h.tubType}
                        </div>
                      )}
                    </div>

                    <div className="p-4 sm:p-5 flex flex-col flex-grow">
                      <div className="flex items-baseline justify-between gap-2 mb-1">
                        <Link href={hotelUrl} className="font-bold text-gray-900 hover:text-[#1a6fde] transition-colors line-clamp-1 text-base">
                          {h.name}
                        </Link>
                        {h.rating && (
                          <span className="text-xs font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60 shrink-0">
                            ★ {h.rating}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-gray-500 mb-2 font-medium">
                        📍 {h.city}, {h.country}
                      </p>

                      <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed mb-4 flex-grow">
                        {sanitizePlaceholderText(h.description)}
                      </p>

                      <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2 mt-auto">
                        <div>
                          <span className="text-[10px] text-gray-400 block uppercase font-bold">Rates From</span>
                          <span className="text-sm font-black text-gray-900">{h.price || 'Check Rates'}</span>
                        </div>

                        {bookingUrl && (
                          <OutboundLink
                            href={bookingUrl}
                            hotelName={h.name}
                            cityName={h.city}
                            source="soaking_hub_card"
                            className="px-3.5 py-2 bg-[#1a6fde] hover:bg-[#1559b8] text-white text-xs font-bold rounded-xl transition-all shadow-xs"
                          >
                            Check Dates &rarr;
                          </OutboundLink>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Curated Seasonal & Regional Travel Guides */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-3">
              <div>
                <h2 className="font-heading text-xl sm:text-2xl font-bold text-gray-900">Curated Soaking & Hot Tub Guides</h2>
                <p className="text-gray-500 text-xs sm:text-sm mt-1">Deep dives into seasonal getaways, romantic suites, and cozy winter retreats</p>
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
                    Valentine's Day Hotels with In-Room Jacuzzis
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    Romantic hotel suites featuring private couple whirlpool tubs, champagne service, and candlelit ambiance.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-[#1a6fde]">
                  <span>Read Travel Guide</span>
                  <span>&rarr;</span>
                </div>
              </Link>
            </div>
          </section>

          {/* Reader Disclosure & E-E-A-T Assurance */}
          <div className="p-4 bg-slate-50 border border-gray-200 rounded-2xl text-xs text-gray-500 mb-12">
            <strong>Affiliate Disclosure:</strong> When you book through our partner links on Booking.com, Agoda, MakeMyTrip, or partner networks, HotelsWithBathtubs may earn an affiliate commission at zero additional charge to you. Learn more in our{' '}
            <Link href="/editorial-policy" className="text-[#1a6fde] underline">Editorial Policy</Link>.
          </div>

          <TrendingDestinations currentCity="" />
        </main>
      </div>
    </>
  );
}
