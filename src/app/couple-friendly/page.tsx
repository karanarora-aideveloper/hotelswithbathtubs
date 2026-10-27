import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import connectToDatabase from '@/lib/mongodb';
import Hotel from '@/models/Hotel';
import Blog from '@/models/Blog';
import StructuredData from '@/components/StructuredData';
import { imageUrl, DEFAULT_HOTEL_IMAGE } from '@/lib/imageUrl';
import { slugify, titleCase } from '@/lib/utils';
import { sanitizePlaceholderText } from '@/lib/location';
import { getBathtubLabel } from '@/lib/evidence';
import OutboundLink from '@/components/OutboundLink';
import TrendingDestinations from '@/components/TrendingDestinations';
import RomanticGetawayEmailCapture from '@/components/RomanticGetawayEmailCapture';

export const revalidate = 86400; // Daily revalidation

const currentYear = new Date().getFullYear();

export const metadata: Metadata = {
  title: 'Couple-Friendly Hotels with Bathtubs',
  description: 'Hand-picked couple-friendly hotels and romantic suites featuring private in-room bathtubs and jacuzzis. Unmarried couples welcome, private suites.',
  alternates: {
    canonical: 'https://www.hotelswithbathtubs.com/couple-friendly',
  },
  openGraph: {
    title: `Couple-Friendly Hotels with Bathtubs (${currentYear})`,
    description: 'Discover verified romantic hotels and suites with private in-room bathtubs & jacuzzis. Safe, welcoming, and judgment-free stays for couples.',
    url: 'https://www.hotelswithbathtubs.com/couple-friendly',
    siteName: 'Hotels with Bathtubs',
    images: [
      {
        url: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
        width: 1200,
        height: 630,
        alt: 'Couple-Friendly Hotels with Bathtubs',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `Couple-Friendly Hotels with Bathtubs (${currentYear})`,
    description: 'Discover verified romantic hotels and suites with private in-room bathtubs & jacuzzis.',
    images: ['https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp'],
  },
};

const ROMANTIC_DESTINATIONS = [
  { name: 'Napa Valley', country: 'USA', slug: 'napa', countrySlug: 'usa', vibe: 'Vineyard soaking tubs & private garden courtyard baths', icon: '🍷' },
  { name: 'Key West', country: 'USA', slug: 'key-west', countrySlug: 'usa', vibe: 'Secluded outdoor porch bathtubs & tropical jacuzzi suites', icon: '🌴' },
  { name: 'Aspen', country: 'USA', slug: 'aspen', countrySlug: 'usa', vibe: 'Fireside cedar tubs & snowy alpine jacuzzi chalets', icon: '🏔️' },
  { name: 'Charleston', country: 'USA', slug: 'charleston', countrySlug: 'usa', vibe: 'Historic clawfoot soaking tubs & Southern romance', icon: '🌸' },
  { name: 'Miami Beach', country: 'USA', slug: 'miami', countrySlug: 'usa', vibe: 'Ocean-view whirlpool suites & art deco soaking tubs', icon: '🌊' },
  { name: 'Las Vegas', country: 'USA', slug: 'las-vegas', countrySlug: 'usa', vibe: 'Oversized marble Roman tubs & skyline jacuzzi suites', icon: '✨' },
  { name: 'Santorini', country: 'Greece', slug: 'santorini', countrySlug: 'greece', vibe: 'Caldera cliffside cave suites with outdoor hot tubs', icon: '🇬🇷' },
  { name: 'Paris', country: 'France', slug: 'paris', countrySlug: 'france', vibe: 'Haussmannian boutique suites with Eiffel Tower views', icon: '🗼' },
  { name: 'Bora Bora', country: 'French Polynesia', slug: 'bora-bora', countrySlug: 'french-polynesia', vibe: 'Overwater bungalows with glass-floor bathtubs', icon: '🏝️' },
  { name: 'Goa', country: 'India', slug: 'goa', countrySlug: 'india', vibe: 'Beachfront jacuzzis & private villa plunge tubs', icon: '🏖️' },
  { name: 'Udaipur', country: 'India', slug: 'udaipur', countrySlug: 'india', vibe: 'Palatial marble tubs overlooking Lake Pichola', icon: '🏰' },
  { name: 'Munnar', country: 'India', slug: 'munnar', countrySlug: 'india', vibe: 'Mist-clad tea valley views from private jacuzzi tubs', icon: '⛰️' },
  { name: 'Manali', country: 'India', slug: 'manali', countrySlug: 'india', vibe: 'Snow-capped Himalayan views & heated whirlpool suites', icon: '❄️' },
  { name: 'Jaipur', country: 'India', slug: 'jaipur', countrySlug: 'india', vibe: 'Heritage haveli courtyards & royal soaking baths', icon: '👑' },
];

export default async function CoupleFriendlyPage() {
  await connectToDatabase();

  // Top romantic hotels with confirmed tubs & high ratings
  const topRomanticHotels = await Hotel.find({
    flagged: { $ne: true },
    rating: { $gte: 4.4 },
    $or: [
      { tubType: /jacuzzi|whirlpool|soaking|clawfoot/i },
      { amenities: /jacuzzi|hot tub|bathtub/i }
    ]
  })
    .sort({ rating: -1, reviewsCount: -1 })
    .limit(12)
    .lean();

  // Related romantic travel guides
  const romanticBlogs = await Blog.find({
    published: true,
    $or: [
      { tags: /romantic|honeymoon|jacuzzi/i },
      { title: /romantic|honeymoon|couples|jacuzzi/i }
    ]
  })
    .limit(6)
    .sort({ createdAt: -1 })
    .lean();

  const totalHotels = await Hotel.countDocuments({ flagged: { $ne: true } });

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
        "name": "Couple-Friendly Hotels with Bathtubs",
        "item": "https://www.hotelswithbathtubs.com/couple-friendly"
      }
    ]
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Are unmarried couples allowed to book hotels with bathtubs?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. There is no law prohibiting unmarried consenting adults (18+) from booking or staying together in a hotel room. All verified properties in our directory welcome couples regardless of marital status, provided both guests present valid government-issued photo identification at check-in."
        }
      },
      {
        "@type": "Question",
        "name": "What ID proof do couples need to present at hotel check-in?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Both guests must carry original government-issued photo ID proofs. In India, accepted IDs include Aadhaar Card, Passport, Voter ID, or Driving License (PAN cards are generally not accepted as address proof). For international travel, valid passports are required."
        }
      },
      {
        "@type": "Question",
        "name": "Are the bathtubs and jacuzzis completely private?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, absolutely. Our entire verification standard requires that the bathtub, jacuzzi, or whirlpool tub is situated privately inside the reserved guest room or on an enclosed private suite balcony. We strictly exclude properties where bathtubs are part of a shared wellness or spa center."
        }
      },
      {
        "@type": "Question",
        "name": "Can local couples (from the same city) check into these hotels?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Most luxury 4-star, 5-star, and premium boutique hotels welcome local residents for staycations, weekend getaways, and anniversary celebrations. A few budget-tier chains restrict local IDs; however, all premium partner hotels featured in our directory cater to romantic staycations without local ID restrictions."
        }
      },
      {
        "@type": "Question",
        "name": "How can we make sure our room has a bathtub upon arrival?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Standard rooms frequently only offer standing showers. Always select room tiers specifically labeled 'Deluxe Room with Bathtub', 'Jacuzzi Suite', 'Executive Whirlpool Room', or 'Spa Villa' when clicking through our verified partner links on Booking.com or Agoda."
        }
      }
    ]
  };

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Top Couple-Friendly Hotels with Private Bathtubs & Jacuzzis",
    "numberOfItems": topRomanticHotels.length,
    "itemListElement": topRomanticHotels.map((h: any, idx) => ({
      "@type": "ListItem",
      "position": idx + 1,
      "url": `https://www.hotelswithbathtubs.com/${slugify(h.country)}/${slugify(h.city)}/${h.slug || slugify(h.name)}`,
      "name": h.name,
      "item": {
        "@type": "LodgingBusiness",
        "name": h.name,
        "description": sanitizePlaceholderText(h.description) || `Romantic couple-friendly hotel with private in-room bathtub in ${h.city}`,
        "address": {
          "@type": "PostalAddress",
          "addressLocality": h.city,
          "addressCountry": h.country
        }
      }
    }))
  };

  return (
    <>
      <StructuredData data={breadcrumbSchema} />
      <StructuredData data={faqSchema} />
      <StructuredData data={itemListSchema} />

      <main className="min-h-screen bg-white">
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 text-xs sm:text-sm font-medium text-gray-500 flex items-center gap-1">
          <Link href="/" prefetch={false} className="hover:text-blue-600 transition-colors">Home</Link>
          <span>&rsaquo;</span>
          <span className="text-gray-900 font-semibold">Couple-Friendly Stays</span>
        </div>

        {/* Hero */}
        <header className="relative pt-12 pb-16 sm:pt-18 sm:pb-24 px-4 sm:px-8 text-center bg-gradient-to-br from-rose-950 via-slate-900 to-indigo-950 text-white overflow-hidden rounded-b-3xl">
          <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
            <div className="bg-rose-500/20 border border-rose-400/30 backdrop-blur-md px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold shadow-lg mb-4 flex items-center gap-2 text-rose-200">
              <span>💖</span> Verified Couple-Friendly Stays · 100% Private In-Room Tubs
            </div>
            <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl font-black mb-4 leading-tight tracking-tight">
              Couple-Friendly Hotels with Private Bathtubs &amp; Jacuzzis
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-rose-100/90 font-medium max-w-2xl mx-auto leading-relaxed">
              Curated romantic escapes, anniversary suites, and weekend staycations with private in-room bathtubs and hassle-free check-ins.
            </p>
          </div>
        </header>

        {/* Trust Strip */}
        <div className="max-w-5xl mx-4 sm:mx-auto -mt-8 relative z-20 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-lg flex-shrink-0">
              🔒
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">Private In-Room Tubs</p>
              <p className="text-xs text-gray-500">Inside your private room or suite rather than a shared spa.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg flex-shrink-0">
              ✨
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">Unmarried Couples Welcome</p>
              <p className="text-xs text-gray-500">18+ with valid government photo ID at check-in.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1a6fde] flex items-center justify-center font-bold text-lg flex-shrink-0">
              🛡️
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">Verified Inventory</p>
              <p className="text-xs text-gray-500">Verified across Booking.com &amp; Agoda room tiers.</p>
            </div>
          </div>
        </div>

        {/* Romantic Destinations Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="font-heading text-2xl sm:text-3xl font-black text-gray-900 mb-2">
              Explore Top Romantic Destinations
            </h2>
            <p className="text-sm text-gray-600">
              Browse bathtub and jacuzzi suites across premier honeymoon and weekend getaway hubs.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {ROMANTIC_DESTINATIONS.map((dest) => (
              <Link
                key={dest.slug}
                href={`/${dest.countrySlug}/${dest.slug}`}
                className="group p-4 rounded-2xl border border-gray-200 hover:border-[#1a6fde] hover:shadow-md transition-all bg-white flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{dest.icon}</span>
                    <span className="text-xs font-semibold text-gray-400 group-hover:text-[#1a6fde] transition-colors">
                      {dest.country} &rarr;
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg group-hover:text-[#1a6fde] transition-colors">
                    {dest.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {dest.vibe}
                  </p>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-blue-600">
                  <span>Browse Romantic Tubs</span>
                  <span>&rsaquo;</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured Hand-Picked Romantic Hotels */}
        <section className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12 bg-gray-50/50 rounded-3xl my-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-2">
            <div>
              <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">Editor&apos;s Romantic Selection</span>
              <h2 className="font-heading text-2xl sm:text-3xl font-black text-gray-900 mt-1">
                Top-Rated Suites with Private In-Room Bathtubs
              </h2>
            </div>
            <p className="text-xs text-gray-500 max-w-sm">
              Each property features independent photo and amenity confirmation of private bathtubs or jacuzzis.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
            {topRomanticHotels.map((hotel: any) => {
              const countrySlug = slugify(hotel.country);
              const citySlug = slugify(hotel.city);
              const hotelSlug = hotel.slug || slugify(hotel.name);
              const bookingTarget = hotel.bookingUrl || hotel.agodaUrl || hotel.tripUrl || hotel.url;

              return (
                <div
                  key={hotel._id?.toString()}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-48 w-full bg-gray-100">
                      <Image
                        src={imageUrl(hotel.image?.split('/').pop() || '')}
                        alt={hotel.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                        loading="lazy"
                      />
                      {hotel.rating && Number(hotel.rating) > 0 && (
                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-gray-900 shadow-sm flex items-center gap-1">
                          <span>★</span> {Number(hotel.rating).toFixed(1)}
                        </div>
                      )}
                      <div className="absolute bottom-3 left-3 bg-gray-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-semibold text-white">
                        🛁 {getBathtubLabel(hotel)}
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="text-xs font-semibold text-gray-500 mb-1">
                        {hotel.city}, {hotel.country}
                      </div>
                      <h3 className="font-bold text-gray-900 text-base leading-snug line-clamp-1">
                        {hotel.name}
                      </h3>
                      {hotel.description && (
                        <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">
                          {sanitizePlaceholderText(hotel.description)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="p-4 pt-0 border-t border-gray-100 mt-3 flex items-center justify-between">
                    <div>
                      {hotel.price && (
                        <span className="text-sm font-black text-gray-900">{hotel.price}</span>
                      )}
                      <span className="text-2xs text-gray-400 block">per night</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/${countrySlug}/${citySlug}/${hotelSlug}`}
                        className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Details
                      </Link>
                      {bookingTarget && (
                        <OutboundLink
                          href={bookingTarget}
                          hotelName={hotel.name}
                          cityName={hotel.city}
                          source={hotel.bookingUrl ? 'booking.com' : 'agoda'}
                          className="px-3 py-1.5 rounded-xl bg-[#1a6fde] hover:bg-[#1559b8] text-white text-xs font-bold shadow-xs transition-colors"
                        >
                          Book Tub
                        </OutboundLink>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Couples Guide & Legal Rights Section */}
        <section className="max-w-4xl mx-auto px-4 sm:px-8 py-10">
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-10 shadow-xs">
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-gray-900 mb-4">
              Couple Check-in Checklist: Know Your Rights
            </h2>
            <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
              <p>
                Booking a private romantic weekend or celebrating an anniversary should be seamless and stress-free. Here are our verified recommendations to ensure a frictionless check-in experience:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100">
                  <h3 className="font-bold text-gray-900 text-sm mb-1">🪪 Carry Valid Government Photo IDs</h3>
                  <p className="text-xs text-gray-600">
                    Both guests must present original government-issued photo ID (Aadhaar, Passport, or Driving License). Digital copies on DigiLocker are also widely accepted.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-100">
                  <h3 className="font-bold text-gray-900 text-sm mb-1">⚖️ Consenting Adults (18+) Right</h3>
                  <p className="text-xs text-gray-600">
                    Under Indian law and international standards, consenting adults aged 18+ have the fundamental legal right to stay together in licensed hotels without marital scrutiny.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100">
                  <h3 className="font-bold text-gray-900 text-sm mb-1">🛁 Confirm the Room Tier</h3>
                  <p className="text-xs text-gray-600">
                    Base rooms often only offer walk-in showers. Always reserve the room category explicitly named &ldquo;Suite with Bathtub&rdquo; or &ldquo;Jacuzzi King&rdquo; to secure your tub.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-100">
                  <h3 className="font-bold text-gray-900 text-sm mb-1">✨ Private In-Room Soaking</h3>
                  <p className="text-xs text-gray-600">
                    All bathtubs and jacuzzis listed in our catalog are private and located inside your guest room quarters or private villa patio.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Romantic Travel Guides */}
        {romanticBlogs.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-gray-900 mb-6">
              Romantic Travel Guides &amp; Inspiration
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {romanticBlogs.map((b: any) => (
                <Link
                  key={b.slug}
                  href={`/blog/${b.slug}`}
                  className="group bg-white p-5 rounded-2xl border border-gray-200 hover:border-[#1a6fde] hover:shadow-sm transition-all"
                >
                  <p className="font-bold text-gray-900 group-hover:text-[#1a6fde] text-sm leading-snug line-clamp-2">
                    {b.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">
                    {b.excerpt}
                  </p>
                  <span className="text-xs font-bold text-blue-600 mt-3 inline-block">
                    Read Guide &rarr;
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* FAQs */}
        <section className="max-w-4xl mx-auto px-4 sm:px-8 py-10">
          <h2 className="font-heading text-2xl font-bold text-gray-900 mb-6 text-center">
            Frequently Asked Questions: Couple-Friendly Stays
          </h2>
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-200">
              <h3 className="font-bold text-gray-900 text-sm sm:text-base mb-1">
                Are unmarried couples allowed to book hotels with bathtubs?
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Yes. There is no law preventing unmarried adult couples (18+) from sharing a hotel room. All verified properties in our catalog welcome couples without judgment when carrying valid government photo IDs.
              </p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-200">
              <h3 className="font-bold text-gray-900 text-sm sm:text-base mb-1">
                What IDs are required for check-in?
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Both guests must present a valid government-issued photo ID. Accepted documents in India include Aadhaar Card, Passport, Voter ID, or Driving License. For international trips, valid passports are required.
              </p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-200">
              <h3 className="font-bold text-gray-900 text-sm sm:text-base mb-1">
                Are the bathtubs and jacuzzis private?
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Yes. We catalogue rooms where booking partner listings indicate a private bathtub or jacuzzi in the room or suite, rather than a shared spa.
              </p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-200">
              <h3 className="font-bold text-gray-900 text-sm sm:text-base mb-1">
                Can local couples book a stay in the same city?
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Yes. 4-star, 5-star, and premium boutique properties regularly host local couples for romantic weekend staycations, birthdays, and anniversaries with zero issues.
              </p>
            </div>
          </div>
        </section>

        {/* Romantic Getaway Secret Drop Email Capture */}
        <div className="max-w-5xl mx-auto px-4 sm:px-8 pt-4 pb-10">
          <RomanticGetawayEmailCapture destinationName="Top Romantic Getaways" />
        </div>

        {/* Global Catalog Footer / Trending Destinations */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
          <TrendingDestinations currentCity="" />
        </div>
      </main>
    </>
  );
}
