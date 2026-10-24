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

export const dynamic = 'force-static';

const currentYear = new Date().getFullYear();

export const metadata: Metadata = {
  title: `Hotels with Hot Tub in Room | In-Room Jacuzzi Suites (${currentYear})`,
  description: 'Find verified hotels with private in-room hot tubs, jetted whirlpool suites, and romantic balcony jacuzzi rooms across popular US & global getaways.',
  alternates: {
    canonical: 'https://www.hotelswithbathtubs.com/hotels-with-hot-tub-in-room',
  },
  openGraph: {
    title: `Hotels with Hot Tub in Room | In-Room Jacuzzi Suites (${currentYear})`,
    description: 'Explore verified romantic hotels featuring guaranteed private in-room hot tubs, private balcony jacuzzis, and hydrotherapy suites.',
    url: 'https://www.hotelswithbathtubs.com/hotels-with-hot-tub-in-room',
    siteName: 'Hotels with Bathtubs',
    type: 'website',
  },
};

const FEATURED_HOT_TUB_DESTINATIONS = [
  { name: 'Las Vegas', country: 'USA', slug: '/usa/las-vegas', desc: 'Strip-view luxury whirlpool & deep spa suites', icon: '🎰' },
  { name: 'Santorini', country: 'Greece', slug: '/greece/santorini', desc: 'Caldera cliffside cave suites with private outdoor hot tubs', icon: '🇬🇷' },
  { name: 'Poconos', country: 'USA', slug: '/usa/poconos', desc: 'Classic romantic honeymoon champagne glass & whirlpool tubs', icon: '🌲' },
  { name: 'Gatlinburg', country: 'USA', slug: '/usa/gatlinburg', desc: 'Great Smoky Mountain chalets with private covered hot tubs', icon: '⛰️' },
  { name: 'Miami', country: 'USA', slug: '/usa/miami', desc: 'South Beach oceanfront balcony jacuzzi suites', icon: '🌴' },
  { name: 'Orlando', country: 'USA', slug: '/usa/orlando', desc: 'Resort spa villas with private screened jacuzzi pools', icon: '🎢' },
  { name: 'Lake Tahoe', country: 'USA', slug: '/usa/lake-tahoe', desc: 'Lakeside lodge suites with heated whirlpool tubs', icon: '❄️' },
  { name: 'Denver', country: 'USA', slug: '/usa/denver', desc: 'Rocky Mountain foothill suites with in-room hot tubs', icon: '🏔️' },
  { name: 'Sedona', country: 'USA', slug: '/usa/sedona', desc: 'Red rock canyon villas with private stargazing hot tubs', icon: '🏜️' },
  { name: 'Bali', country: 'Indonesia', slug: '/indonesia/bali', desc: 'Tropical jungle ravine villas with heated private whirlpools', icon: '🌺' },
];

export default async function HotelsWithHotTubInRoomPage() {
  await connectToDatabase();

  const topHotTubHotels = await Hotel.find({
    flagged: { $ne: true },
    $or: [
      { tubType: /hot tub|jacuzzi|whirlpool|jetted/i },
      { amenities: /hot tub|jacuzzi|whirlpool/i },
    ],
    rating: { $gte: 4.4 },
  })
    .sort({ rating: -1, reviewsCount: -1 })
    .limit(12)
    .lean();

  const totalCount = await Hotel.countDocuments({
    flagged: { $ne: true },
    $or: [
      { tubType: /hot tub|jacuzzi|whirlpool|jetted/i },
      { amenities: /hot tub|jacuzzi|whirlpool/i },
    ],
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
        "name": "Hotels with Hot Tub in Room",
        "item": "https://www.hotelswithbathtubs.com/hotels-with-hot-tub-in-room"
      }
    ]
  };

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Hotels with Hot Tub in Room",
    "description": "Curated collection of verified hotels and romantic suites featuring private in-room hot tubs and whirlpool jacuzzis.",
    "url": "https://www.hotelswithbathtubs.com/hotels-with-hot-tub-in-room",
  };

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Top Hotels with Hot Tub in Room",
    "numberOfItems": topHotTubHotels.length,
    "itemListElement": topHotTubHotels.map((h: any, idx: number) => {
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
          <Link href="/" className="text-[#1a6fde] hover:underline">Home</Link>
          <span>&rsaquo;</span>
          <span className="text-gray-900 font-semibold">Hotels with Hot Tub in Room</span>
        </div>

        {/* Hero Header */}
        <header className="relative py-14 sm:py-20 px-4 sm:px-8 text-center bg-gradient-to-br from-gray-950 via-slate-900 to-indigo-900 text-white overflow-hidden">
          <div className="relative z-10 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-bold mb-4 shadow-sm">
              <span>♨️</span> {totalCount}+ Verified In-Room Hot Tub Suites Worldwide
            </div>
            <h1 className="font-heading text-3xl sm:text-5xl font-black mb-4 tracking-tight leading-tight">
              Hotels with Private In-Room Hot Tubs &amp; Jacuzzi Suites
            </h1>
            <p className="text-base sm:text-lg text-white/85 max-w-2xl mx-auto leading-relaxed">
              No shared community spas. No guesswork. Every listing independently audited so you get a private, in-suite hot tub or jetted whirlpool inside your room.
            </p>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-16">
          {/* Top Hot Tub Destinations Mesh */}
          <section className="mb-16">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                  Popular Hot Tub Getaways
                </span>
                <h2 className="font-heading text-xl sm:text-2xl font-bold text-gray-900 mt-2">
                  Top Destinations for In-Room Hot Tubs
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
              {FEATURED_HOT_TUB_DESTINATIONS.map((dest) => (
                <Link
                  key={dest.slug}
                  href={dest.slug}
                  className="bg-white p-4 rounded-2xl border border-gray-200/80 hover:border-indigo-500 hover:shadow-md transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="text-2xl mb-1.5">{dest.icon}</div>
                    <h3 className="font-bold text-sm text-gray-900 group-hover:text-indigo-600 transition-colors">
                      {dest.name}, {dest.country}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 leading-snug line-clamp-2">
                      {dest.desc}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-indigo-600 mt-3 block group-hover:underline">
                    View Stays &rarr;
                  </span>
                </Link>
              ))}
            </div>
          </section>

          {/* Curated Top Hot Tub Stays Grid */}
          <section className="mb-16">
            <div className="mb-8">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
                Triple-Verified Inventory
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-gray-900 mt-2">
                Hand-Picked In-Room Hot Tub &amp; Jacuzzi Suites
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Independently audited across room inventories and verified traveler photos to guarantee a private hot tub inside the room.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {topHotTubHotels.map((h: any) => {
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
                        alt={`${h.name} - In-room hot tub in ${h.city}`}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {h.tubType && (
                        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-gray-900 border border-gray-200/80 shadow-xs">
                          ♨️ {h.tubType}
                        </div>
                      )}
                    </div>

                    <div className="p-4 sm:p-5 flex flex-col flex-grow">
                      <div className="flex items-baseline justify-between gap-2 mb-1">
                        <Link href={hotelUrl} className="font-bold text-gray-900 hover:text-indigo-600 transition-colors line-clamp-1 text-base">
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
                        {h.description}
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
                            source="hottub_hub_card"
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
                <h2 className="font-heading text-xl sm:text-2xl font-bold text-gray-900">Curated Hot Tub Travel Guides</h2>
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

          {/* Reader Disclosure & E-E-A-T Assurance */}
          <div className="p-4 bg-slate-50 border border-gray-200 rounded-2xl text-xs text-gray-500 mb-12">
            <strong>Affiliate Disclosure:</strong> When you book through our verified partner links on Booking.com, Agoda, MakeMyTrip, or partner networks, HotelsWithBathtubs may earn an affiliate commission at zero additional charge to you. Learn more in our{' '}
            <Link href="/editorial-policy" className="text-[#1a6fde] underline">Editorial Policy</Link>.
          </div>

          <TrendingDestinations currentCity="" />
        </main>
      </div>
    </>
  );
}
