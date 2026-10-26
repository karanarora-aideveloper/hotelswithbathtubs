import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import connectToDatabase from '@/lib/mongodb';
import Hotel from '@/models/Hotel';
import Blog from '@/models/Blog';
import StructuredData from '@/components/StructuredData';
import { imageUrl, DEFAULT_HOTEL_IMAGE } from '@/lib/imageUrl';
import { slugify, titleCase } from '@/lib/utils';
import OutboundLink from '@/components/OutboundLink';
import TrendingDestinations from '@/components/TrendingDestinations';

export const revalidate = 86400; // Daily revalidation

const currentYear = new Date().getFullYear();

export const metadata: Metadata = {
  title: 'Hostels & Poshtels with Bathtubs',
  description: 'Boutique hostels and poshtels featuring guaranteed private in-room bathtubs & jacuzzis. Experience social backpacker vibes with private soaking luxury.',
  alternates: {
    canonical: 'https://www.hotelswithbathtubs.com/hostels',
  },
  openGraph: {
    title: `Boutique Hostels & Poshtels with Bathtubs (${currentYear} Guide)`,
    description: 'Discover verified hostels and poshtels featuring guaranteed private in-room bathtubs & jacuzzis. Vibrant community vibes meet private soaking luxury.',
    url: 'https://www.hotelswithbathtubs.com/hostels',
    siteName: 'Hotels with Bathtubs',
    images: [
      {
        url: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
        width: 1200,
        height: 630,
        alt: 'Boutique Hostels & Poshtels with Bathtubs',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `Boutique Hostels & Poshtels with Bathtubs (${currentYear} Guide)`,
    description: 'Discover verified hostels and poshtels featuring guaranteed private in-room bathtubs & jacuzzis.',
    images: ['https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp'],
  },
};

const BACKPACKER_DESTINATIONS = [
  { name: 'Manali', country: 'India', slug: 'manali', countrySlug: 'india', vibe: 'Himalayan chalets & private mountain-view jacuzzis', icon: '❄️' },
  { name: 'Rishikesh', country: 'India', slug: 'rishikesh', countrySlug: 'india', vibe: 'Riverside stone cottages with architectural soaking tubs', icon: '🧘' },
  { name: 'Goa', country: 'India', slug: 'goa', countrySlug: 'india', vibe: 'Portuguese boutique poshtels & tropical garden plunge tubs', icon: '🏖️' },
  { name: 'Kasol', country: 'India', slug: 'kasol', countrySlug: 'india', vibe: 'Parvati Valley pine attic chalets with cedar soaking tubs', icon: '🌲' },
  { name: 'Bir', country: 'India', slug: 'bir', countrySlug: 'india', vibe: 'Paragliding sunset suites with deep mountain-view tubs', icon: '🪂' },
  { name: 'Udaipur', country: 'India', slug: 'udaipur', countrySlug: 'india', vibe: 'Lake Pichola heritage havelis with carved marble tubs', icon: '🏰' },
  { name: 'Jaipur', country: 'India', slug: 'jaipur', countrySlug: 'india', vibe: 'Artistic backpacker havelis with sunken marble baths', icon: '👑' },
  { name: 'Lonavala', country: 'India', slug: 'lonavala', countrySlug: 'india', vibe: 'Pawna lakeside villas with private hydrotherapy jacuzzis', icon: '🌿' },
  { name: 'Munnar', country: 'India', slug: 'munnar', countrySlug: 'india', vibe: 'Tea plantation suites with floor-to-ceiling tub windows', icon: '⛰️' },
  { name: 'Ooty', country: 'India', slug: 'ooty', countrySlug: 'india', vibe: 'Colonial tea estate chalets with vintage clawfoot tubs', icon: '☕' },
  { name: 'Pushkar', country: 'India', slug: 'pushkar', countrySlug: 'india', vibe: 'Desert bohemian havelis with sunken sandstone tubs', icon: '🐪' },
  { name: 'Amsterdam', country: 'Netherlands', slug: 'amsterdam', countrySlug: 'netherlands', vibe: 'Design poshtel sky suites overlooking Oosterpark trees', icon: '🇳🇱' },
  { name: 'Barcelona', country: 'Spain', slug: 'barcelona', countrySlug: 'spain', vibe: 'Catalan boutique poshtels with freestanding designer tubs', icon: '🇪🇸' },
  { name: 'London', country: 'United Kingdom', slug: 'london', countrySlug: 'uk', vibe: 'Victorian sailor poshtels by Tower Bridge with en-suite tubs', icon: '🇬🇧' },
  { name: 'Bangkok', country: 'Thailand', slug: 'bangkok', countrySlug: 'thailand', vibe: 'Eco-chalets with outdoor tropical garden soaking tubs', icon: '🇹🇭' },
];

export default async function HostelsHubPage() {
  await connectToDatabase();

  // Query verified hostels, poshtels, and backpacker stays with bathtubs
  const hostels = await Hotel.find({
    flagged: { $ne: true },
    $or: [
      { name: /hostel|zostel|poshtel|backpacker|hosteller|gostops|madpackers|moustache/i },
      { description: /hostel|backpacker|poshtel|dorm/i },
      { roomType: /hostel|dorm/i }
    ]
  })
    .sort({ rating: -1, reviewsCount: -1 })
    .limit(30)
    .lean();

  // Related travel guides
  const relatedBlogs = await Blog.find({
    published: true,
    $or: [
      { tags: /hostel|backpacker|budget|solo/i },
      { title: /hostel|backpacker|budget|solo|poshtel/i },
      { tags: /manali|goa|rishikesh|jaipur/i }
    ]
  })
    .limit(6)
    .sort({ createdAt: -1 })
    .lean();

  const totalHostels = hostels.length;

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
        "name": "Hostels with Bathtubs",
        "item": "https://www.hotelswithbathtubs.com/hostels"
      }
    ]
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Do hostels really have private rooms with bathtubs and jacuzzis?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! Modern boutique hostels and poshtels (such as Zostel Plus, The Hosteller, and Generator) offer private deluxe suites, chalets, and penthouses equipped with en-suite soaking tubs or private balcony jacuzzis, combining community atmosphere with private relaxation."
        }
      },
      {
        "@type": "Question",
        "name": "Are the bathtubs private or shared with dormitory guests?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Every hostel room featured on HotelsWithBathtubs comes with a 100% private, en-suite bathtub or private terrace jacuzzi. We strictly filter out properties with shared bathrooms or communal spa areas."
        }
      },
      {
        "@type": "Question",
        "name": "What is a 'poshtel'?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "A poshtel (posh + hostel) blends boutique hotel design, luxury private rooms, and artisanal en-suite amenities with the social lounges, co-working spaces, and community events of a traditional youth hostel."
        }
      },
      {
        "@type": "Question",
        "name": "Can couples stay in hostels with private bathtubs?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. Private rooms in boutique hostels are exceptionally popular among budget-conscious couples and digital nomads seeking romantic private soaking tubs, king beds, and quiet en-suite comfort alongside vibrant communal cafes."
        }
      },
      {
        "@type": "Question",
        "name": "How do I ensure I reserve the exact room with the bathtub on checkout?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Always select the room tier designated as 'Private Jacuzzi Suite', 'Deluxe Chalet with Bathtub', or 'En-suite Soaking Tub' when booking through our partner links to avoid standard dormitory or shower-only room assignments."
        }
      }
    ]
  };

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Top Boutique Hostels with Private Bathtubs",
    "numberOfItems": hostels.slice(0, 10).length,
    "itemListElement": hostels.slice(0, 10).map((h, idx) => ({
      "@type": "ListItem",
      "position": idx + 1,
      "item": {
        "@type": "LodgingBusiness",
        "name": h.name,
        "description": h.description || `Boutique hostel in ${h.city} with private ${h.tubType || 'bathtub'}.`,
        "url": `https://www.hotelswithbathtubs.com/${slugify(h.country || 'india')}/${slugify(h.city)}/${h.slug}`,
        "image": imageUrl(h.image || (h.images && h.images[0])),
        ...(h.price ? { "priceRange": h.price } : {}),
        "address": {
          "@type": "PostalAddress",
          "addressLocality": h.city,
          "addressCountry": h.country || 'India'
        },
        ...(h.rating && Number(h.rating) > 0 && h.reviewsCount && Number(h.reviewsCount) > 0 ? {
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": h.rating,
            "reviewCount": Number(h.reviewsCount)
          }
        } : {})
      }
    }))
  };

  return (
    <>
      <StructuredData data={breadcrumbSchema} />
      <StructuredData data={faqSchema} />
      <StructuredData data={itemListSchema} />

      <main className="min-h-screen bg-slate-50">
        {/* Hero Section in Clean Blue Style */}
        <section className="relative pt-10 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50/60 via-white to-slate-50 border-b border-gray-200">
          <div className="max-w-5xl mx-auto text-center">
            {/* Breadcrumb */}
            <nav className="flex items-center justify-center gap-2 text-xs text-gray-500 mb-6 font-medium">
              <Link href="/" className="hover:text-[#1a6fde] transition-colors">Home</Link>
              <span>/</span>
              <span className="text-gray-900 font-semibold">Hostels with Bathtubs</span>
            </nav>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold mb-4 shadow-2xs">
              <span>🎒</span>
              <span>Boutique Poshtels &amp; Backpacker Sanctuaries</span>
            </div>

            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight mb-4">
              Hostels with Bathtubs: <br className="hidden sm:block" />
              <span className="text-[#1a6fde]">Social Backpacker Vibes, Private Soaking Luxury</span>
            </h1>

            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed mb-8">
              Why choose between meeting fellow travelers and having your own private sanctuary? 
              Discover handpicked boutique poshtels, co-living lodges, and alpine chalets with guaranteed 
              private en-suite bathtubs and jacuzzis.
            </p>

            {/* 4 Core Trust Pillars */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto text-left">
              <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs">
                <span className="text-lg mb-1 block">🛁</span>
                <p className="text-xs font-bold text-gray-900">100% Private Tubs</p>
                <p className="text-[11px] text-gray-500">Never shared dorm baths</p>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs">
                <span className="text-lg mb-1 block">🎒</span>
                <p className="text-xs font-bold text-gray-900">Social Culture</p>
                <p className="text-[11px] text-gray-500">Cafés, bonfires &amp; co-work</p>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs">
                <span className="text-lg mb-1 block">💸</span>
                <p className="text-xs font-bold text-gray-900">Budget Luxury</p>
                <p className="text-[11px] text-gray-500">Fraction of 5-star prices</p>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs">
                <span className="text-lg mb-1 block">🔒</span>
                <p className="text-xs font-bold text-gray-900">Room Guarantee</p>
                <p className="text-[11px] text-gray-500">Room tier checked</p>
              </div>
            </div>
          </div>
        </section>

        {/* Top Backpacker Destinations Shortcut Bar */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400">
                Explore Top Hostels by Destination
              </h2>
            </div>
            <span className="text-xs text-gray-500 font-medium">
              {BACKPACKER_DESTINATIONS.length} Hotspots
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
            {BACKPACKER_DESTINATIONS.map((dest) => (
              <Link
                key={dest.slug}
                href={`/${dest.countrySlug}/${dest.slug}`}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 text-xs font-semibold text-gray-800 hover:text-[#1a6fde] transition-all shrink-0 shadow-2xs"
              >
                <span>{dest.icon}</span>
                <span>{dest.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured Hostels & Poshtels Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
            <div>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-gray-900">
                Verified Hostels &amp; Poshtels with Bathtubs
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Showing {hostels.length} verified stays with confirmed en-suite soaking tubs or private hot tubs.
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-semibold w-fit">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
              {totalHostels} Verified Stays
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
            {hostels.map((hostel) => {
              const countrySlug = slugify(hostel.country || 'india');
              const citySlug = slugify(hostel.city);
              const hotelSlug = hostel.slug;
              const bookingTarget = hostel.bookingUrl || hostel.agodaUrl || hostel.url;

              return (
                <div
                  key={hostel._id?.toString() || hostel.slug}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group"
                >
                  {/* Image Container */}
                  <div className="relative h-52 w-full overflow-hidden bg-gray-100">
                    <Image
                      src={imageUrl(hostel.image || (hostel.images && hostel.images[0]))}
                      alt={`${hostel.name} in ${hostel.city}`}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      {hostel.tubType && (
                        <span className="px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-xs text-white text-[11px] font-bold shadow-xs">
                          🛁 {hostel.tubType}
                        </span>
                      )}
                      <span className="px-2.5 py-1 rounded-full bg-amber-500 text-white text-[11px] font-bold shadow-xs">
                        🎒 Boutique Hostel
                      </span>
                    </div>

                    {hostel.price && (
                      <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-white/95 backdrop-blur-xs text-gray-900 font-extrabold text-xs shadow-xs">
                        ~{hostel.price} <span className="text-[10px] font-normal text-gray-500">/nt</span>
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1.5">
                      <span>📍</span>
                      <span>{hostel.neighborhood ? `${hostel.neighborhood}, ${hostel.city}` : hostel.city}, {hostel.country || 'India'}</span>
                    </div>

                    <h3 className="font-bold text-gray-900 text-base leading-snug line-clamp-2 mb-2 group-hover:text-[#1a6fde] transition-colors">
                      <Link href={`/${countrySlug}/${citySlug}/${hotelSlug}`}>
                        {hostel.name}
                      </Link>
                    </h3>

                    {hostel.roomType && (
                      <div className="mb-3">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                          <span>🏷️</span> {hostel.roomType}
                        </span>
                      </div>
                    )}

                    <p className="text-xs text-gray-600 line-clamp-2 mb-4 leading-relaxed">
                      {hostel.description || `Boutique hostel in ${hostel.city} featuring private en-suite bathtubs, digital nomad co-working spaces, and backpacker community events.`}
                    </p>

                    <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between gap-3">
                      {(hostel.rating && Number(hostel.rating) > 0) || (hostel.reviewsCount && Number(hostel.reviewsCount) > 0) ? (
                        <div className="flex items-center gap-1 text-xs font-bold text-gray-900">
                          {hostel.rating && Number(hostel.rating) > 0 && (
                            <>
                              <span className="text-amber-500">★</span>
                              <span>{hostel.rating}</span>
                            </>
                          )}
                          {hostel.reviewsCount && Number(hostel.reviewsCount) > 0 && (
                            <span className="text-gray-400 font-normal">({hostel.reviewsCount})</span>
                          )}
                        </div>
                      ) : <span />}

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
                            hotelName={hostel.name}
                            cityName={hostel.city}
                            source={hostel.bookingUrl ? 'Booking.com' : 'Agoda'}
                            className="px-3.5 py-1.5 rounded-xl bg-[#1a6fde] hover:bg-[#1559b8] text-white text-xs font-bold shadow-2xs transition-colors"
                          >
                            Check Live Rate &rarr;
                          </OutboundLink>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Poshtel Guide: Why Travelers Love Hostels with Bathtubs */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-200 shadow-xs">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#1a6fde] text-xs font-bold mb-4">
              <span>💡</span>
              <span>The Rise of the Poshtel</span>
            </div>

            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              What is a &quot;Poshtel&quot; and Why Book One with a Bathtub?
            </h2>

            <div className="prose prose-sm sm:prose max-w-none text-gray-600 space-y-4 leading-relaxed font-jakarta">
              <p>
                The travel industry has witnessed a dramatic shift: travelers no longer want to choose between 
                the sterile isolation of traditional business hotels and the chaotic lack of privacy of old-school dormitories. 
                Enter the <strong>Poshtel</strong> — a luxury boutique hostel combining sleek architectural design, 
                artisanal coffee shops, high-speed fiber internet, and <strong>private en-suite rooms with bathtubs</strong>.
              </p>
              <p>
                When you stay in a poshtel or boutique hostel with an in-room tub, you get the best of both worlds:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                <li>
                  <strong>Social Energy Without Compromise:</strong> Attend rooftop yoga, sunset bonfire jams, 
                  and guided city treks during the day, then retreat to your private en-suite sanctuary for a soothing shoulder-deep warm water soak at night.
                </li>
                <li>
                  <strong>Affordable Indulgence:</strong> 5-star resorts charge ₹15,000 to ₹35,000+ per night for rooms with bathtubs. 
                  Boutique poshtels deliver guaranteed private soaking tubs and jacuzzi suites at a fraction of the cost (typically ₹2,500 to ₹5,500).
                </li>
                <li>
                  <strong>Built for Remote Workers &amp; Couples:</strong> Enjoy dedicated co-working tables, reliable plug points, and welcoming couple-friendly check-in policies with zero invasive questioning.
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Backpacker Bathtub FAQs */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-8">
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-gray-500">
              Everything you need to know about booking hostels with private bathtubs.
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
              <h3 className="font-bold text-gray-900 text-sm sm:text-base mb-2">
                Do hostels really have private rooms with bathtubs and jacuzzis?
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Yes! Major boutique hostel chains like Zostel Plus, The Hosteller, and Generator feature premium private chalets and penthouse suites with en-suite soaking tubs or private hot tubs.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
              <h3 className="font-bold text-gray-900 text-sm sm:text-base mb-2">
                Are the bathtubs private or shared with dorm guests?
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Every hostel room featured on HotelsWithBathtubs comes with a 100% private, en-suite in-room bathtub or private terrace jacuzzi. We strictly filter out properties with shared bathrooms.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
              <h3 className="font-bold text-gray-900 text-sm sm:text-base mb-2">
                Can couples stay together in hostels with bathtubs?
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Yes! Private double rooms in boutique poshtels are welcoming, discreet, and judgment-free for adult couples, married and unmarried alike.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
              <h3 className="font-bold text-gray-900 text-sm sm:text-base mb-2">
                How do I ensure I get the room with the bathtub on checkout?
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Always select the specific room tier designated as &quot;Private Jacuzzi Suite&quot;, &quot;Deluxe Chalet with Bath&quot;, or &quot;En-suite Soaking Tub&quot; when booking through our partner links.
              </p>
            </div>
          </div>
        </section>

        {/* Trending Destinations Component for Internal Link Equity */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-gray-200">
          <TrendingDestinations currentCity="" />
        </section>
      </main>
    </>
  );
}
