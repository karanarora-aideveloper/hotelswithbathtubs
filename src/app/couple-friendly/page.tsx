import { Metadata } from 'next';
import Link from 'next/link';
import connectToDatabase from '@/lib/mongodb';
import Hotel from '@/models/Hotel';
import Blog from '@/models/Blog';
import StructuredData from '@/components/StructuredData';
import { slugify } from '@/lib/utils';
import { isHotelConfirmed, getLinkedPartners, getPartnerUrl } from '@/lib/evidence';
import { COUNTRIES_WITH_HOTELS } from '@/lib/countries';
import CoupleFriendlyHotelsClient, {
  CoupleHotel,
  CompactHotel,
} from '@/components/CoupleFriendlyHotelsClient';
import TrendingDestinations from '@/components/TrendingDestinations';
import LazyEmailCapture from '@/components/LazyEmailCapture';

export const revalidate = 86400; // Daily revalidation

const currentYear = new Date().getFullYear();

interface RawHotel {
  _id: { toString(): string };
  name: string;
  city?: string;
  country?: string;
  image?: string;
  slug?: string;
  tubType?: string;
  roomType?: string;
  importBatch?: string | null;
  bookingTubLabels?: string[] | null;
  bookingUrl?: string | null;
  agodaUrl?: string | null;
  mmtUrl?: string | null;
  makemytripUrl?: string | null;
  cleartripUrl?: string | null;
  easemytripUrl?: string | null;
  airbnbUrl?: string | null;
  tripUrl?: string | null;
  expediaUrl?: string | null;
  hotelsComUrl?: string | null;
  vrboUrl?: string | null;
  url?: string | null;
}

interface RawBlog {
  _id: { toString(): string };
  title: string;
  slug: string;
  excerpt?: string;
}

export const metadata: Metadata = {
  title: 'Couple-Friendly Hotels with Bathtubs',
  description: 'Couple-friendly hotels and romantic suites featuring private in-room bathtubs and jacuzzis. Unmarried couples welcome, private suites.',
  alternates: {
    canonical: 'https://www.hotelswithbathtubs.com/couple-friendly',
  },
  openGraph: {
    title: `Couple-Friendly Hotels with Bathtubs (${currentYear})`,
    description: 'Discover romantic hotels and suites with private in-room bathtubs & jacuzzis. Welcoming stays for couples.',
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
    description: 'Discover romantic hotels and suites with private in-room bathtubs & jacuzzis.',
    images: ['https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp'],
  },
};

const ROMANTIC_DESTINATIONS = [
  { name: 'Napa Valley', country: 'USA', slug: 'napa', countrySlug: 'usa', cityPattern: /napa/i, icon: '🍷' },
  { name: 'Key West', country: 'USA', slug: 'key-west', countrySlug: 'usa', cityPattern: /key west/i, icon: '🌴' },
  { name: 'Aspen', country: 'USA', slug: 'aspen', countrySlug: 'usa', cityPattern: /aspen/i, icon: '🏔️' },
  { name: 'Charleston', country: 'USA', slug: 'charleston', countrySlug: 'usa', cityPattern: /charleston/i, icon: '🌸' },
  { name: 'Miami Beach', country: 'USA', slug: 'miami', countrySlug: 'usa', cityPattern: /miami/i, icon: '🌊' },
  { name: 'Las Vegas', country: 'USA', slug: 'las-vegas', countrySlug: 'usa', cityPattern: /las vegas/i, icon: '✨' },
  { name: 'Santorini', country: 'Greece', slug: 'santorini', countrySlug: 'greece', cityPattern: /santorini/i, icon: '🇬🇷' },
  { name: 'Paris', country: 'France', slug: 'paris', countrySlug: 'france', cityPattern: /paris/i, icon: '🗼' },
  { name: 'Bora Bora', country: 'French Polynesia', slug: 'bora-bora', countrySlug: 'french-polynesia', cityPattern: /bora bora/i, icon: '🏝️' },
  { name: 'Goa', country: 'India', slug: 'goa', countrySlug: 'india', cityPattern: /goa/i, icon: '🏖️' },
  { name: 'Udaipur', country: 'India', slug: 'udaipur', countrySlug: 'india', cityPattern: /udaipur/i, icon: '🏰' },
  { name: 'Munnar', country: 'India', slug: 'munnar', countrySlug: 'india', cityPattern: /munnar/i, icon: '⛰️' },
  { name: 'Manali', country: 'India', slug: 'manali', countrySlug: 'india', cityPattern: /manali/i, icon: '❄️' },
  { name: 'Jaipur', country: 'India', slug: 'jaipur', countrySlug: 'india', cityPattern: /jaipur/i, icon: '👑' },
];

function resolveCountryCode(countryStr?: string): string | null {
  if (!countryStr) return null;
  const s = countryStr.trim();
  const lower = s.toLowerCase();
  if (lower === 'usa' || lower === 'united states' || lower === 'us') return 'US';
  if (lower === 'uk' || lower === 'united kingdom' || lower === 'great britain') return 'GB';
  if (lower === 'uae' || lower === 'united arab emirates') return 'AE';
  const found = COUNTRIES_WITH_HOTELS.find(
    (c) =>
      c.name.toLowerCase() === lower ||
      c.code.toLowerCase() === lower ||
      c.slug === lower.replace(/\s+/g, '-')
  );
  if (found) return found.code;
  return null;
}

function compressUrl(u?: string | null): string {
  if (!u) return '';
  return u
    .replace('https://www.booking.com/hotel/', '^bh/')
    .replace('https://www.booking.com', '^b')
    .replace('https://www.agoda.com', '^a')
    .replace('https://www.makemytrip.com', '^m')
    .replace('https://www.airbnb.com/rooms/', '^ar/')
    .replace('https://www.airbnb.com', '^r')
    .replace('https://www.trip.com', '^t')
    .replace('?aid=304142', '^aid');
}

function toCompactHotel(h: RawHotel): CompactHotel {
  const partners = getLinkedPartners(h)
    .slice(0, 3)
    .map((p) => [p, compressUrl(getPartnerUrl(h, p))] as [string, string])
    .filter(([, url]) => Boolean(url));

  const tubLower = (h.tubType || '').toLowerCase();
  const tubIdx = tubLower.includes('hot tub')
    ? 2
    : tubLower.includes('jetted') || tubLower.includes('jacuzzi') || tubLower.includes('whirlpool') || tubLower.includes('hydro')
    ? 1
    : 0;

  return [
    h._id.toString(),
    h.name,
    h.city || '',
    h.country || '',
    h.image ? h.image.split('/').pop() || '' : '',
    h.slug || slugify(h.name),
    tubIdx,
    isHotelConfirmed(h) ? 1 : 0,
    h.roomType || '',
    partners,
  ];
}

function toCoupleHotel(h: RawHotel): CoupleHotel {
  const countrySlug = slugify(h.country || '');
  const citySlug = slugify(h.city || '');
  const hotelSlug = h.slug || slugify(h.name);
  const partners = getLinkedPartners(h)
    .slice(0, 3)
    .map((p) => ({
      partner: p,
      url: getPartnerUrl(h, p) || '',
    }))
    .filter((p) => Boolean(p.url));

  const tubLower = (h.tubType || '').toLowerCase();
  const tubLabel = tubLower.includes('hot tub')
    ? 'hot tub'
    : tubLower.includes('jetted') || tubLower.includes('jacuzzi') || tubLower.includes('whirlpool') || tubLower.includes('hydro')
    ? 'jetted tub'
    : 'bathtub';

  return {
    id: h._id.toString(),
    name: h.name,
    city: h.city || '',
    country: h.country || '',
    image: h.image ? h.image.split('/').pop() || '' : '',
    url: `/${countrySlug}/${citySlug}/${hotelSlug}`,
    tubLabel,
    confirmed: isHotelConfirmed(h),
    roomType: h.roomType || '',
    partners,
  };
}

export default async function CoupleFriendlyPage() {
  await connectToDatabase();

  // Query qualifying hotels whose tub is a bathtub, jacuzzi, whirlpool, hot tub, spa or jetted tub
  const rawHotels = (await Hotel.find({
    flagged: { $ne: true },
    $or: [
      { tubType: /jacuzzi|whirlpool|hot tub|spa|jetted|soaking|bathtub/i },
      { bookingTubLabels: { $in: ['Bath', 'Spa tub', 'Hot tub', 'Whirlpool'] } },
      { amenities: /jacuzzi|hot tub|bathtub|whirlpool/i },
    ],
  })
    .select('_id name city country image slug tubType roomType importBatch bookingTubLabels bookingUrl agodaUrl mmtUrl makemytripUrl cleartripUrl easemytripUrl airbnbUrl tripUrl expediaUrl hotelsComUrl vrboUrl url')
    .lean()) as unknown as RawHotel[];

  // Group hotels by country code
  const groupedHotels: Record<string, RawHotel[]> = {};
  for (const h of rawHotels) {
    const code = resolveCountryCode(h.country);
    if (!code) continue;
    if (!groupedHotels[code]) groupedHotels[code] = [];
    groupedHotels[code].push(h);
  }

  // Sort helper: confirmed first, then partners count (no rating sort)
  const sortHotels = (a: RawHotel, b: RawHotel) => {
    const confA = isHotelConfirmed(a) ? 1 : 0;
    const confB = isHotelConfirmed(b) ? 1 : 0;
    if (confB !== confA) return confB - confA;
    const partA = getLinkedPartners(a).length;
    const partB = getLinkedPartners(b).length;
    return partB - partA;
  };

  // Build per-country lists for countries with >= 3 hotels, max 12 hotels each
  const countryHotelsData: Record<string, CompactHotel[]> = {};
  for (const [code, list] of Object.entries(groupedHotels)) {
    if (list.length < 3) continue;
    list.sort(sortHotels);
    countryHotelsData[code] = list.slice(0, 12).map(toCompactHotel);
  }

  // Global top 12 hotels (for SSR / fallback)
  const allSorted = [...rawHotels].sort(sortHotels);
  const globalHotels: CoupleHotel[] = allSorted.slice(0, 12).map(toCoupleHotel);

  // Count qualifying hotels for destination tiles; remove tiles where N < 3
  const destinationCounts = await Promise.all(
    ROMANTIC_DESTINATIONS.map(async (dest) => {
      const count = await Hotel.countDocuments({
        city: dest.cityPattern,
        flagged: { $ne: true },
        $or: [
          { tubType: /jacuzzi|whirlpool|hot tub|spa|jetted|soaking|bathtub/i },
          { bookingTubLabels: { $in: ['Bath', 'Spa tub', 'Hot tub', 'Whirlpool'] } },
          { amenities: /jacuzzi|hot tub|bathtub|whirlpool/i },
        ],
      });
      return { ...dest, count };
    })
  );
  const activeDestinations = destinationCounts.filter((d) => d.count >= 3);

  // Related travel guides
  const romanticBlogs = (await Blog.find({
    published: true,
    $or: [
      { tags: /romantic|honeymoon|jacuzzi/i },
      { title: /romantic|honeymoon|couples|jacuzzi/i },
    ],
  })
    .limit(6)
    .sort({ createdAt: -1 })
    .lean()) as unknown as RawBlog[];

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://www.hotelswithbathtubs.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Couple Stays',
        item: 'https://www.hotelswithbathtubs.com/couple-friendly',
      },
    ],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Are unmarried couples allowed to book hotels with bathtubs?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. There is no law prohibiting unmarried consenting adults (18+) from booking or staying together in a hotel room, provided both guests present valid government-issued photo identification at check-in.',
        },
      },
      {
        '@type': 'Question',
        name: 'What ID proof do couples need to present at hotel check-in?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Both guests must carry original government-issued photo ID proofs. In India, accepted IDs include Aadhaar Card, Passport, Voter ID, or Driving License. For international travel, valid passports are required.',
        },
      },
      {
        '@type': 'Question',
        name: 'Are the bathtubs and jacuzzis private?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Listings in our catalog specify bathtubs or jacuzzis located inside the guest room or private suite balcony, rather than a shared spa.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can local couples check into these hotels?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Most luxury and boutique hotels welcome local residents for staycations, weekend getaways, and celebrations. A few budget chains may restrict local IDs, but partner hotels featured in our directory generally welcome local guests with valid ID.',
        },
      },
      {
        '@type': 'Question',
        name: 'How can we make sure our room has a bathtub upon arrival?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Standard rooms often only offer walk-in showers. Always select room tiers specifically labeled Deluxe Room with Bathtub, Jacuzzi Suite, Executive Room with Whirlpool, or similar when booking through partner links.',
        },
      },
    ],
  };

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Romantic Stays with Private In-Room Bathtubs & Jacuzzis',
    numberOfItems: globalHotels.length,
    itemListElement: globalHotels.map((h, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      url: `https://www.hotelswithbathtubs.com${h.url}`,
      name: h.name,
      item: {
        '@type': 'LodgingBusiness',
        name: h.name,
        address: {
          '@type': 'PostalAddress',
          addressLocality: h.city,
          addressCountry: h.country,
        },
      },
    })),
  };

  return (
    <>
      <StructuredData data={breadcrumbSchema} />
      <StructuredData data={faqSchema} />
      <StructuredData data={itemListSchema} />

      <main className="min-h-screen bg-[#f5f6f8]">
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 text-xs sm:text-sm font-medium text-[#5b6478] flex items-center gap-1.5">
          <Link href="/" prefetch={false} className="hover:text-[#b08d57] transition-colors">
            Home
          </Link>
          <span>&rsaquo;</span>
          <span className="text-[#14213d] font-semibold">Couple Stays</span>
        </div>

        {/* Hero Section in Style B */}
        <header className="relative pt-10 pb-12 sm:pt-14 sm:pb-16 px-4 sm:px-6 lg:px-8 text-center bg-white border-b border-[#e3e7ef]">
          <div className="max-w-4xl mx-auto flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#e9eef7] border border-[#e3e7ef] text-[#14213d] text-xs font-bold uppercase tracking-wider mb-4 shadow-2xs">
              <span>💖</span> Romantic Stays · Private In-Room Tubs
            </div>
            <h1 className="font-playfair text-3xl sm:text-5xl lg:text-6xl font-bold text-[#14213d] mb-4 leading-tight tracking-tight">
              Hotels with Private In-Room Bathtubs &amp; Jacuzzis
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-[#5b6478] font-normal max-w-2xl mx-auto leading-relaxed">
              Independent records of hotel suites featuring private in-room bathtubs and jacuzzis, with check-in and ID requirements clearly explained.
            </p>
          </div>
        </header>

        {/* Trust Strip */}
        <div className="max-w-5xl mx-4 sm:mx-auto -mt-6 relative z-10 bg-white rounded-2xl shadow-sm border border-[#e3e7ef] p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#e3f2ee] text-[#1f6f5c] flex items-center justify-center font-bold text-lg shrink-0">
              🔒
            </div>
            <div>
              <p className="font-bold text-[#14213d] text-sm">Private In-Room Tubs</p>
              <p className="text-xs text-[#5b6478]">Inside your private room or suite rather than a shared wellness facility.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#e9eef7] text-[#1a6fde] flex items-center justify-center font-bold text-lg shrink-0">
              🪪
            </div>
            <div>
              <p className="font-bold text-[#14213d] text-sm">Valid Photo ID Check-in</p>
              <p className="text-xs text-[#5b6478]">18+ consenting adults with valid government photo identification.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#f5f6f8] text-[#5b6478] flex items-center justify-center font-bold text-lg shrink-0 border border-[#e3e7ef]">
              📋
            </div>
            <div>
              <p className="font-bold text-[#14213d] text-sm">Room Tier Details</p>
              <p className="text-xs text-[#5b6478]">Catalogued from Booking.com, Agoda, and partner room categories.</p>
            </div>
          </div>
        </div>

        {/* Dynamic Country Hotel Listings */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <CoupleFriendlyHotelsClient
            countryHotelsData={countryHotelsData}
            initialHotels={globalHotels}
          />
        </section>

        {/* Romantic Destinations Grid with Plain Blurbs */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-t border-[#e3e7ef]">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-[#14213d] mb-2">
              Explore Romantic Destinations
            </h2>
            <p className="text-xs sm:text-sm text-[#5b6478]">
              Browse catalogued hotel suites with private in-room bathtubs across popular destinations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {activeDestinations.map((dest) => (
              <Link
                key={dest.slug}
                href={`/${dest.countrySlug}/${dest.slug}`}
                className="group p-4 rounded-2xl border border-[#e3e7ef] bg-white hover:border-[#b08d57] hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{dest.icon}</span>
                    <span className="text-xs font-semibold text-[#5b6478] group-hover:text-[#b08d57] transition-colors">
                      {dest.country} &rarr;
                    </span>
                  </div>
                  <h3 className="font-playfair font-bold text-[#14213d] text-base group-hover:text-[#b08d57] transition-colors">
                    {dest.name}
                  </h3>
                  <p className="text-xs text-[#5b6478] mt-1 font-medium">
                    {dest.count} hotels with a tub in the room
                  </p>
                </div>
                <div className="mt-3 pt-3 border-t border-[#e3e7ef] flex items-center justify-between text-xs font-bold text-[#1a6fde] group-hover:text-[#b08d57] transition-colors">
                  <span>Browse stays</span>
                  <span>&rsaquo;</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Couples Guide & Legal Rights Section */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="bg-white border border-[#e3e7ef] rounded-3xl p-6 sm:p-10 shadow-xs">
            <h2 className="font-playfair text-xl sm:text-2xl font-bold text-[#14213d] mb-4">
              Hotel Check-in Checklist: Know Your Rights
            </h2>
            <div className="space-y-4 text-xs sm:text-sm text-[#5b6478] leading-relaxed">
              <p>
                To ensure a smooth and seamless check-in experience when reserving a private room with a bathtub, keep these essential verification steps in mind:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                <div className="p-4 rounded-xl bg-[#e9eef7]/60 border border-[#e3e7ef]">
                  <h3 className="font-bold text-[#14213d] text-sm mb-1">🪪 Carry Valid Government Photo IDs</h3>
                  <p className="text-xs text-[#5b6478]">
                    Both guests must present original government-issued photo ID (Aadhaar, Passport, or Driving License in India; valid passports for international stays).
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white border border-[#e3e7ef]">
                  <h3 className="font-bold text-[#14213d] text-sm mb-1">⚖️ Consenting Adults (18+) Rights</h3>
                  <p className="text-xs text-[#5b6478]">
                    Under Indian law and international standards, consenting adults aged 18+ have the legal right to stay together in licensed hotels with valid identification.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[#e3f2ee]/60 border border-[#e3e7ef]">
                  <h3 className="font-bold text-[#14213d] text-sm mb-1">🛁 Confirm the Room Tier</h3>
                  <p className="text-xs text-[#5b6478]">
                    Standard rooms often only offer walk-in showers. Always reserve the room category explicitly named &ldquo;Suite with Bathtub&rdquo; or &ldquo;Jacuzzi King&rdquo; to secure your tub.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white border border-[#e3e7ef]">
                  <h3 className="font-bold text-[#14213d] text-sm mb-1">✨ Private In-Room Soaking</h3>
                  <p className="text-xs text-[#5b6478]">
                    We catalogue rooms where partner listings specify a bathtub, jacuzzi, or whirlpool inside the guest room quarters rather than a shared facility.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Romantic Travel Guides */}
        {romanticBlogs.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-[#e3e7ef]">
            <h2 className="font-playfair text-xl sm:text-2xl font-bold text-[#14213d] mb-6">
              Travel Guides &amp; Inspiration
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {romanticBlogs.map((b: RawBlog) => (
                <Link
                  key={b.slug}
                  href={`/blog/${b.slug}`}
                  className="group bg-white p-5 rounded-2xl border border-[#e3e7ef] hover:border-[#b08d57] hover:shadow-xs transition-all"
                >
                  <p className="font-playfair font-bold text-[#14213d] group-hover:text-[#b08d57] text-sm leading-snug line-clamp-2">
                    {b.title}
                  </p>
                  <p className="text-xs text-[#5b6478] mt-2 line-clamp-2 leading-relaxed">
                    {b.excerpt}
                  </p>
                  <span className="text-xs font-bold text-[#1a6fde] mt-3 inline-block group-hover:text-[#b08d57] transition-colors">
                    Read Guide &rarr;
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* FAQs */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h2 className="font-playfair text-2xl font-bold text-[#14213d] mb-6 text-center">
            Frequently Asked Questions: Check-in &amp; Room Details
          </h2>
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-[#e3e7ef]">
              <h3 className="font-bold text-[#14213d] text-sm sm:text-base mb-1">
                Are unmarried couples allowed to book hotels with bathtubs?
              </h3>
              <p className="text-xs sm:text-sm text-[#5b6478] leading-relaxed">
                Yes. There is no law preventing unmarried adult couples (18+) from sharing a hotel room, provided both guests carry valid government photo IDs.
              </p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-[#e3e7ef]">
              <h3 className="font-bold text-[#14213d] text-sm sm:text-base mb-1">
                What IDs are required for check-in?
              </h3>
              <p className="text-xs sm:text-sm text-[#5b6478] leading-relaxed">
                Both guests must present a valid government-issued photo ID. Accepted documents in India include Aadhaar Card, Passport, Voter ID, or Driving License. For international trips, valid passports are required.
              </p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-[#e3e7ef]">
              <h3 className="font-bold text-[#14213d] text-sm sm:text-base mb-1">
                Are the bathtubs and jacuzzis private?
              </h3>
              <p className="text-xs sm:text-sm text-[#5b6478] leading-relaxed">
                Yes. We catalogue rooms where booking partner listings indicate a private bathtub or jacuzzi in the room or suite, rather than a shared spa.
              </p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-[#e3e7ef]">
              <h3 className="font-bold text-[#14213d] text-sm sm:text-base mb-1">
                Can local couples book a stay in the same city?
              </h3>
              <p className="text-xs sm:text-sm text-[#5b6478] leading-relaxed">
                Yes. Luxury and boutique properties regularly host local couples for weekend staycations, birthdays, and anniversaries with valid identification.
              </p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-[#e3e7ef]">
              <h3 className="font-bold text-[#14213d] text-sm sm:text-base mb-1">
                How can we make sure our room has a bathtub upon arrival?
              </h3>
              <p className="text-xs sm:text-sm text-[#5b6478] leading-relaxed">
                Standard rooms often only offer walk-in showers. Always select room tiers specifically labeled Deluxe Room with Bathtub, Jacuzzi Suite, Executive Room with Whirlpool, or similar when booking through partner links.
              </p>
            </div>
          </div>
        </section>

        {/* Secret Drop Email Capture */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-10">
          <LazyEmailCapture destinationName="Top Romantic Getaways" />
        </div>

        {/* Global Catalog Footer / Trending Destinations */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-[#e3e7ef]">
          <TrendingDestinations currentCity="" />
        </div>
      </main>
    </>
  );
}
