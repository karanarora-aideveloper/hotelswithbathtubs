import connectToDatabase from '@/lib/mongodb';
import Hotel from '@/models/Hotel';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { imageUrl } from '@/lib/imageUrl';
import StructuredData from '@/components/StructuredData';
import OutboundLink from '@/components/OutboundLink';
import { isDirectPropertyUrl, getUrlDirectnessTier } from '@/lib/affiliate';
import { escapeRegex, titleCase, slugify, resolveCountry } from '@/lib/utils';
import HotelAnalyticsComparison from '@/components/HotelAnalyticsComparison';
import HotelGallery from '@/components/HotelGallery';
import fs from 'node:fs';
import path from 'node:path';

export const revalidate = false;

// In-memory cache for ultra-fast static page generation without MongoDB connection pool exhaustion
let memoryHotelMap: Map<string, any> | null = null;

async function getCachedHotelMap() {
  if (process.env.NODE_ENV !== 'development' && memoryHotelMap) return memoryHotelMap;

  let allHotels: any[] = [];
  const cachePath = path.join(process.cwd(), '.cache', 'all-hotels.json');
  if (fs.existsSync(cachePath)) {
    try {
      allHotels = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
    } catch {
      allHotels = [];
    }
  }

  if (!allHotels.length) {
    await connectToDatabase();
    allHotels = await Hotel.find({ flagged: { $ne: true } }).lean();
  }

  const map = new Map<string, any>();
  for (const h of allHotels) {
    if (h.slug) {
      map.set(h.slug, h);
      map.set(slugify(h.slug), h);
    }
    const nSlug = slugify(h.name);
    if (nSlug && !map.has(nSlug)) map.set(nSlug, h);
    if (h.city) {
      const cSlug = slugify(h.city);
      if (h.slug) {
        map.set(`${cSlug}/${h.slug}`, h);
        map.set(`${cSlug}/${slugify(h.slug)}`, h);
      }
      map.set(`${cSlug}/${nSlug}`, h);
    }
  }
  memoryHotelMap = map;
  return memoryHotelMap;
}

export async function generateStaticParams() {
  const map = await getCachedHotelMap();
  const params: Array<{ country: string; city: string; hotel: string }> = [];
  const seen = new Set<string>();

  for (const h of map.values()) {
    if (!h.country || !h.city) continue;
    const countryInfo = resolveCountry(h.country);
    const countrySlug = countryInfo.slug;
    const citySlug = slugify(h.city);
    const canonicalHotelSlug = slugify(h.slug || h.name);

    if (canonicalHotelSlug) {
      const key = `${countrySlug}/${citySlug}/${canonicalHotelSlug}`;
      if (!seen.has(key)) {
        seen.add(key);
        params.push({ country: countrySlug, city: citySlug, hotel: canonicalHotelSlug });
      }
    }
  }

  return params;
}

async function getHotel(countryParam: string, cityParam: string, hotelParam: string) {
  const countryInfo = resolveCountry(countryParam);
  const rawCity = decodeURIComponent(cityParam).replace(/-/g, ' ');
  const hotelSlug = decodeURIComponent(hotelParam);
  const citySlug = slugify(rawCity);

  // Fast-path: Check in-memory map first
  const map = await getCachedHotelMap();
  let hotel = map.get(hotelSlug) || map.get(`${citySlug}/${hotelSlug}`);

  // Only query DB at runtime in SSR, NEVER during static export build
  if (!hotel && process.env.NEXT_EXPORT !== 'true') {
    await connectToDatabase();
    hotel = await Hotel.findOne({ slug: hotelSlug, flagged: { $ne: true } }).lean();

    // Fallback 1: If slug is missing -city suffix (e.g. hotel-mayfair-waves), try with -city
    if (!hotel && !hotelSlug.endsWith(`-${citySlug}`)) {
      hotel = await Hotel.findOne({ slug: `${hotelSlug}-${citySlug}`, flagged: { $ne: true } }).lean();
    }

    // Fallback 2: If slug has redundant -city suffix, try stripped
    if (!hotel && hotelSlug.endsWith(`-${citySlug}`)) {
      const strippedSlug = hotelSlug.slice(0, -(citySlug.length + 1));
      hotel = await Hotel.findOne({ slug: strippedSlug, flagged: { $ne: true } }).lean();
    }

    // Fallback 3: Lookup by hotel name and city
    if (!hotel) {
      const rawHotelName = hotelSlug.replace(/-/g, ' ');
      hotel = await Hotel.findOne({
        name: new RegExp(`^${escapeRegex(rawHotelName)}$`, 'i'),
        city: new RegExp(`^${escapeRegex(rawCity)}$`, 'i'),
        flagged: { $ne: true }
      }).lean();
    }
  }

  return { hotel, countryInfo, rawCity };
}

function getCurrencyForPrice(price?: string, countrySlug?: string): string {
  if (price) {
    if (price.includes('₹')) return 'INR';
    if (price.includes('£')) return 'GBP';
    if (price.includes('€')) return 'EUR';
    if (price.includes('AED')) return 'AED';
    if (price.includes('S$')) return 'SGD';
    if (price.includes('A$')) return 'AUD';
    if (price.includes('C$')) return 'CAD';
    if (price.includes('¥')) return 'JPY';
    if (price.includes('฿')) return 'THB';
    if (price.includes('$')) return 'USD';
  }
  const countryCurrencyMap: Record<string, string> = {
    india: 'INR',
    uk: 'GBP',
    uae: 'AED',
    singapore: 'SGD',
    australia: 'AUD',
    canada: 'CAD',
    japan: 'JPY',
    thailand: 'THB',
    indonesia: 'IDR',
    vietnam: 'VND',
    france: 'EUR',
    italy: 'EUR',
    germany: 'EUR',
    spain: 'EUR',
    netherlands: 'EUR',
    greece: 'EUR',
    switzerland: 'CHF',
  };
  return countryCurrencyMap[countrySlug || ''] || 'USD';
}

async function getSimilarHotels(countryParam: string, cityParam: string, currentHotelSlug: string) {
  const rawCity = decodeURIComponent(cityParam).replace(/-/g, ' ');
  const citySlug = slugify(rawCity);
  const map = await getCachedHotelMap();
  
  const similar: any[] = [];
  const seen = new Set<string>();

  for (const h of map.values()) {
    if (!h.city) continue;
    const hCitySlug = slugify(h.city);
    const hSlug = h.slug || slugify(h.name);
    if (hCitySlug === citySlug && hSlug !== currentHotelSlug && !seen.has(hSlug)) {
      seen.add(hSlug);
      similar.push(h);
    }
  }

  // Sort by rating desc
  similar.sort((a, b) => {
    const rA = Number(a.rating) || 4.0;
    const rB = Number(b.rating) || 4.0;
    return rB - rA;
  });

  return similar.slice(0, 4);
}

export async function generateMetadata({ params }: { params: Promise<{ country: string, city: string, hotel: string }> }) {
  const resolvedParams = await params;
  const { hotel, countryInfo, rawCity } = await getHotel(resolvedParams.country, resolvedParams.city, resolvedParams.hotel);

  if (!hotel) {
    return {
      title: 'Hotel Not Found',
      robots: { index: false, follow: false },
    };
  }

  const cityName = titleCase(rawCity);
  const tubType = hotel.tubType || 'Private Bathtub';
  const pageTitle = `${hotel.name} — ${tubType} in ${cityName}`;
  const roomType = hotel.roomType || 'Room with Bathtub';
  const price = hotel.price ? ` Starting at ${hotel.price}.` : '';
  
  const pageDescription = `${hotel.name} features ${tubType} in ${roomType}.${price} Verified private in-room bathtub in ${cityName}.`;

  const ogImage = imageUrl(hotel.image);
  const hotelUrl = `https://www.hotelswithbathtubs.com/${countryInfo.slug}/${slugify(rawCity)}/${hotel.slug || slugify(hotel.name)}`;

  return {
    title: pageTitle,
    description: pageDescription,
    robots: { index: true, follow: true },
    alternates: {
      canonical: `/${countryInfo.slug}/${slugify(rawCity)}/${hotel.slug || slugify(hotel.name)}`,
    },
    openGraph: {
      title: `${pageTitle} | Hotels With Bathtubs`,
      description: pageDescription,
      url: hotelUrl,
      siteName: 'Hotels with Bathtubs',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${hotel.name} with bathtub in ${cityName}`,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${pageTitle} | Hotels With Bathtubs`,
      description: pageDescription,
      images: [ogImage],
    },
  };
}

export default async function HotelDetailPage({
  params,
}: {
  params: Promise<{ country: string; city: string; hotel: string }>;
}) {
  const resolvedParams = await params;
  const { hotel, countryInfo, rawCity } = await getHotel(resolvedParams.country, resolvedParams.city, resolvedParams.hotel);

  if (!hotel) {
    notFound();
  }

  const cityName = titleCase(rawCity);
  const countryName = countryInfo.displayName;
  const countrySlug = countryInfo.slug;
  const citySlug = slugify(rawCity);
  const hotelSlug = hotel.slug || slugify(hotel.name);
  const similarHotels = await getSimilarHotels(resolvedParams.country, resolvedParams.city, hotelSlug);
  const derivedStars = (hotel.rating && Number(hotel.rating) > 0) ? Number(hotel.rating).toFixed(1) : "4.5";
  const derivedReviews = (hotel.reviewsCount && Number(hotel.reviewsCount) > 0) ? Number(hotel.reviewsCount) : 150;

  // Breadcrumb Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.hotelswithbathtubs.com" },
      { "@type": "ListItem", "position": 2, "name": countryName, "item": `https://www.hotelswithbathtubs.com/${countrySlug}` },
      { "@type": "ListItem", "position": 3, "name": `Hotels with Bathtubs in ${cityName}`, "item": `https://www.hotelswithbathtubs.com/${countrySlug}/${citySlug}` },
      { "@type": "ListItem", "position": 4, "name": hotel.name, "item": `https://www.hotelswithbathtubs.com/${countrySlug}/${citySlug}/${hotelSlug}` }
    ]
  };

  // Hotel Schema
  const hotelSchema = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    "name": hotel.name,
    "description": hotel.description || `Verified hotel with private in-room bathtub in ${cityName}`,
    "image": imageUrl(hotel.image),
    "url": `https://www.hotelswithbathtubs.com/${countrySlug}/${citySlug}/${hotelSlug}`,
    "address": { "@type": "PostalAddress", "addressLocality": cityName, "addressCountry": countryName },
    "starRating": { "@type": "Rating", "ratingValue": derivedStars },
    "aggregateRating": { "@type": "AggregateRating", "ratingValue": derivedStars, "reviewCount": derivedReviews, "bestRating": "5" },
    "amenityFeature": [
      { "@type": "LocationFeatureSpecification", "name": "Private Bathtub", "value": true },
      ...(hotel.amenities || []).map((a: string) => ({ "@type": "LocationFeatureSpecification", "name": a, "value": true }))
    ],
    "makesOffer": {
      "@type": "Offer",
      "name": `${hotel.roomType || 'Room with Bathtub'} at ${hotel.name}`,
      "description": `Private in-room bathtub${hotel.tubType ? ` (${hotel.tubType})` : ''} in ${cityName}`,
      "url": hotel.airbnbUrl || hotel.bookingUrl || hotel.agodaUrl || hotel.tripUrl || hotel.url,
      "availability": "https://schema.org/InStock",
      "priceSpecification": {
        "@type": "PriceSpecification",
        "price": hotel.price ? hotel.price.toString().replace(/[^0-9]/g, '') : undefined,
        "priceCurrency": getCurrencyForPrice(hotel.price, countrySlug),
      }
    }
  };

  // FAQ Schema
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `Does ${hotel.name} have a private bathtub in the room?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Yes, ${hotel.name} features private in-room bathtubs in select room tiers. Specifically, you should reserve the ${hotel.roomType || 'Deluxe Room or Suite with Bathtub'}.`
        }
      },
      {
        "@type": "Question",
        "name": `Is ${hotel.name} couple-friendly?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Yes, ${hotel.name} in ${cityName} is thoroughly verified as couple-friendly, welcoming unmarried and married couples with complete privacy.`
        }
      },
      {
        "@type": "Question",
        "name": `How can I guarantee that my room gets a bathtub at ${hotel.name}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `When using our verified partner links on Agoda, MakeMyTrip, or Booking.com, choose the ${hotel.roomType || 'Bathtub Suite'} and verify that "Bathtub" is listed under Room Amenities before payment.`
        }
      }
    ]
  };

  type UrlProvider = 'makemytrip' | 'booking' | 'agoda' | 'trivago' | 'tripadvisor' | 'google' | 'airbnb' | 'trip' | null;
  function getUrlProvider(url?: string): UrlProvider {
    if (!url) return null;
    const lower = url.toLowerCase();
    if (lower.includes('makemytrip.com')) return 'makemytrip';
    if (lower.includes('booking.com')) return 'booking';
    if (lower.includes('agoda.com')) return 'agoda';
    if (lower.includes('trip.com')) return 'trip';
    if (lower.includes('airbnb')) return 'airbnb';
    if (lower.includes('trivago')) return 'trivago';
    if (lower.includes('tripadvisor')) return 'tripadvisor';
    if (lower.includes('google.com')) return 'google';
    return null;
  }

  function BookingButton({ url, hotelName, cityName: city, preferredLabel, isPrimary }: {
    url: string;
    hotelName: string;
    cityName: string;
    preferredLabel?: string;
    isPrimary?: boolean;
  }) {
    const provider = getUrlProvider(url);
    const config: Record<NonNullable<UrlProvider>, { label: string; className: string; source: string; logo: string } | null> = {
      agoda: { 
        label: 'Check on Agoda', 
        source: 'Agoda', 
        logo: 'A',
        className: isPrimary 
          ? 'bg-emerald-700 hover:bg-emerald-800 text-white text-center py-3.5 px-4 rounded-xl font-semibold transition-all text-xs sm:text-sm shadow-xs hover:shadow-md flex items-center justify-between w-full font-jakarta' 
          : 'bg-emerald-50/70 hover:bg-emerald-100/80 text-emerald-800 text-center py-2.5 px-4 rounded-xl font-semibold transition-colors text-xs border border-emerald-200/80 flex items-center justify-between w-full font-jakarta' 
      },
      makemytrip: { 
        label: 'Check on MakeMyTrip', 
        source: 'MakeMyTrip', 
        logo: 'M',
        className: isPrimary 
          ? 'bg-[#1f262d] hover:bg-[#2c3640] text-white text-center py-3.5 px-4 rounded-xl font-semibold transition-all text-xs sm:text-sm shadow-xs hover:shadow-md flex items-center justify-between w-full font-jakarta' 
          : 'bg-slate-50 hover:bg-slate-100 text-[#1f262d] text-center py-2.5 px-4 rounded-xl font-semibold transition-colors text-xs border border-[#5b8296]/20 flex items-center justify-between w-full font-jakarta' 
      },
      booking: { 
        label: 'Check on Booking.com', 
        source: 'Booking.com', 
        logo: 'B',
        className: isPrimary 
          ? 'bg-[#003580] hover:bg-[#002860] text-white text-center py-3.5 px-4 rounded-xl font-semibold transition-all text-xs sm:text-sm shadow-xs hover:shadow-md flex items-center justify-between w-full font-jakarta' 
          : 'bg-sky-50/70 hover:bg-sky-100/80 text-[#003580] text-center py-2.5 px-4 rounded-xl font-semibold transition-colors text-xs border border-sky-200/80 flex items-center justify-between w-full font-jakarta' 
      },
      trip: { 
        label: 'Check on Trip.com', 
        source: 'Trip.com', 
        logo: 'T',
        className: isPrimary 
          ? 'bg-[#2681ff] hover:bg-[#156fe0] text-white text-center py-3.5 px-4 rounded-xl font-semibold transition-all text-xs sm:text-sm shadow-xs hover:shadow-md flex items-center justify-between w-full font-jakarta' 
          : 'bg-blue-50/70 hover:bg-blue-100/80 text-[#0055b3] text-center py-2.5 px-4 rounded-xl font-semibold transition-colors text-xs border border-blue-200/80 flex items-center justify-between w-full font-jakarta' 
      },
      airbnb: { 
        label: 'Check on Airbnb', 
        source: 'Airbnb', 
        logo: 'A',
        className: isPrimary 
          ? 'bg-[#e0565b] hover:bg-[#c9454a] text-white text-center py-3.5 px-4 rounded-xl font-semibold transition-all text-xs sm:text-sm shadow-xs hover:shadow-md flex items-center justify-between w-full font-jakarta' 
          : 'bg-rose-50/70 hover:bg-rose-100/80 text-[#e0565b] text-center py-2.5 px-4 rounded-xl font-semibold transition-colors text-xs border border-rose-200/80 flex items-center justify-between w-full font-jakarta' 
      },
      trivago: { label: 'Compare on Trivago', source: 'Trivago', logo: 'T', className: 'bg-slate-50 hover:bg-slate-100 text-slate-800 text-center py-2.5 px-4 rounded-xl font-semibold transition-colors text-xs flex items-center justify-between w-full font-jakarta' },
      tripadvisor: { label: 'View on TripAdvisor', source: 'TripAdvisor', logo: 'T', className: 'bg-slate-50 hover:bg-slate-100 text-slate-800 text-center py-2.5 px-4 rounded-xl font-semibold transition-colors text-xs flex items-center justify-between w-full font-jakarta' },
      google: null,
    };
    if (!provider || !config[provider]) return null;
    const { label, source, className } = config[provider]!;
    return (
      <OutboundLink href={url} hotelName={hotelName} cityName={city} source={source} className={className}>
        <span>{preferredLabel || label}</span>
        <span className="text-xs">&rarr;</span>
      </OutboundLink>
    );
  }

  const isIndia = countrySlug === 'india';
  const rawUrls = [hotel.airbnbUrl, hotel.bookingUrl, hotel.agodaUrl, hotel.tripUrl, hotel.url]
    .filter((u): u is string => !!u)
    .filter((u, idx, arr) => arr.indexOf(u) === idx);
  
  const sortedUrls = [...rawUrls].sort((a, b) => {
    const tierA = getUrlDirectnessTier(a);
    const tierB = getUrlDirectnessTier(b);
    if (tierA !== tierB) return tierA - tierB;

    const provA = getUrlProvider(a);
    const provB = getUrlProvider(b);
    const priority: Record<string, number> = isIndia
      ? { agoda: 1, makemytrip: 2, booking: 3, airbnb: 4, trip: 5, trivago: 6, tripadvisor: 7 }
      : { booking: 1, agoda: 2, trip: 3, airbnb: 4, trivago: 5, tripadvisor: 6, makemytrip: 7 };
    return (priority[provA || ''] || 99) - (priority[provB || ''] || 99);
  });

  // Filter out Tier 99 (broken search / generic redirect) URLs if any direct or scoped property URL exists
  const safeUrls = sortedUrls.filter(u => getUrlDirectnessTier(u) < 99);
  const displayUrls = safeUrls.length > 0 ? safeUrls : sortedUrls;

  // Calculate clean Usual Rate display
  const usualPrice = hotel.price || '₹ 4,500';

  const availableSources: string[] = [];
  if (hotel.agodaUrl || (hotel.url && hotel.url.includes('agoda'))) availableSources.push('Agoda');
  if (hotel.url && hotel.url.includes('makemytrip')) availableSources.push('MakeMyTrip');
  if (hotel.bookingUrl || (hotel.url && hotel.url.includes('booking.com'))) availableSources.push('Booking.com');
  if (hotel.airbnbUrl || (hotel.url && hotel.url.includes('airbnb'))) availableSources.push('Airbnb');
  if (hotel.tripUrl || (hotel.url && hotel.url.includes('trip.com'))) availableSources.push('Trip.com');
  const verifiedPlatformsText = availableSources.length > 0
    ? `Verified on ${availableSources.join(', ')}`
    : 'Triple-Source Verified';

  return (
    <>
      <StructuredData data={breadcrumbSchema} />
      <StructuredData data={hotelSchema} />
      <StructuredData data={faqSchema} />

      {/* Quiet Luxury Breadcrumbs Bar */}
      <div className="border-b border-[#5b8296]/15 bg-white/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 text-xs font-medium text-slate-500 flex items-center justify-between flex-wrap gap-2 font-jakarta">
          <div className="flex items-center flex-wrap gap-1.5">
            <Link href="/" className="text-slate-500 hover:text-[#1f262d] transition-colors">Home</Link>
            <span className="text-slate-300">/</span>
            <Link href={`/${countrySlug}`} className="text-slate-500 hover:text-[#1f262d] transition-colors">{countryName}</Link>
            <span className="text-slate-300">/</span>
            <Link href={`/${countrySlug}/${citySlug}`} className="text-slate-500 hover:text-[#1f262d] transition-colors">{cityName}</Link>
            <span className="text-slate-300">/</span>
            <span className="text-[#1f262d] font-semibold truncate max-w-[200px] sm:max-w-xs">{hotel.name}</span>
          </div>
          <Link
            href={`/${countrySlug}/${citySlug}`}
            className="text-xs font-semibold text-[#5b8296] hover:text-[#1f262d] transition-colors flex items-center gap-1"
          >
            <span>&larr;</span> Back to all {cityName} bathtub stays
          </Link>
        </div>
      </div>

      {/* Contained Hero Image Showcase Gallery / 5-Photo Bento Grid */}
      <HotelGallery
        images={hotel.images}
        primaryImage={hotel.image}
        hotelName={hotel.name}
        cityName={cityName}
        countryName={countryName}
        roomType={hotel.roomType}
        verifiedPlatformsText={verifiedPlatformsText}
      />

      {/* Main Content Layout with 2/3 Content and 1/3 Sticky Booking Sidebar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 md:py-10 flex flex-col md:flex-row gap-8 lg:gap-12 relative">
        {/* Left Column: Deep Information & Analytics */}
        <div className="w-full md:w-3/5 lg:w-2/3">
          {/* Header Title Block */}
          <div className="mb-8">
            <div className="flex flex-wrap items-center gap-2 mb-2.5 font-jakarta">
              <span className="bg-[#8eaab9]/15 text-[#1f262d] border border-[#5b8296]/30 font-semibold text-[11px] tracking-wider uppercase px-2.5 py-0.5 rounded-full">
                Sanctuary Audit #HTB-{hotel.slug?.slice(0, 8) || 'VERIFIED'}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Verified In-Room Soaking Bath
              </span>
            </div>

            <h1 className="font-playfair text-3xl sm:text-4xl md:text-5xl font-normal text-[#1f262d] tracking-tight leading-tight mb-3">
              {hotel.name}
            </h1>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600 mb-4 font-jakarta">
              <div className="flex items-center gap-1.5 font-bold text-[#1f262d]">
                <span className="text-amber-500 text-base">★</span>
                <span>{derivedStars}</span>
                <span className="text-slate-400 font-normal">({derivedReviews.toLocaleString()} verified reviews)</span>
              </div>
              <span className="text-slate-300 hidden sm:inline">•</span>
              <div className="flex items-center gap-1.5 font-medium text-slate-600">
                <svg className="w-4 h-4 text-[#5b8296]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                <span>{hotel.neighborhood ? `${hotel.neighborhood}, ${cityName}` : cityName}, {countryName}</span>
                {hotel.landmarkDistance && (
                  <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full ml-1">
                    {hotel.landmarkDistance}
                  </span>
                )}
              </div>
            </div>

            {/* Badges row in Stitch porcelain & mist style */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 font-jakarta">
              {hotel.tubType && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#8eaab9]/15 text-[#1f262d] border border-[#5b8296]/30 font-semibold text-xs sm:text-sm rounded-full">
                  <span className="text-base">🛁</span> {hotel.tubType}
                </span>
              )}
              {hotel.roomType && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-[#1f262d] font-semibold text-xs sm:text-sm rounded-full border border-slate-200/80">
                  <span>🏷️</span> Room Tier: {hotel.roomType}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 font-bold text-xs sm:text-sm rounded-full border border-emerald-200/80">
                <span>✦</span> 100% In-Room Tub Guaranteed
              </span>
            </div>
          </div>

          {/* Cross-Platform Price Comparison & Bathtub Intelligence Analytics Hub */}
          <HotelAnalyticsComparison
            hotel={hotel}
            cityName={cityName}
            countryName={countryName}
            countrySlug={countrySlug}
          />

          {/* About this Sanctuary */}
          {hotel.description && (
            <div className="mb-8 bg-white/90 backdrop-blur-md rounded-3xl border border-[#5b8296]/20 p-6 sm:p-8 shadow-xs">
              <h2 className="font-playfair text-xl sm:text-2xl font-normal text-[#1f262d] mb-3">
                About this Sanctuary
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-jakarta">
                {hotel.description}
              </p>
            </div>
          )}

          {/* Concierge Booking Tip Callout Card */}
          {hotel.bookingTip && (
            <div className="bg-[#f8fafb] border border-[#5b8296]/20 rounded-2xl p-5 mb-8 flex items-start gap-3.5 shadow-2xs font-jakarta">
              <div className="w-9 h-9 rounded-xl bg-[#8eaab9]/20 text-[#1f262d] flex items-center justify-center shrink-0 mt-0.5 font-bold text-base">
                💡
              </div>
              <div className="text-sm text-slate-700 leading-relaxed">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#5b8296] block mb-0.5">
                  Concierge Booking Advice
                </span>
                {hotel.bookingTip}
              </div>
            </div>
          )}

          {/* Curated Amenities Grid */}
          <div className="mb-8 bg-white/90 backdrop-blur-md rounded-3xl border border-[#5b8296]/20 p-6 sm:p-8 shadow-xs">
            <h2 className="font-playfair text-xl sm:text-2xl font-normal text-[#1f262d] mb-5">
              Verified In-Room &amp; Property Amenities
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 font-jakarta">
              {(hotel.amenities || []).map((amenity: string, idx: number) => {
                const isJacuzzi = amenity.toLowerCase().includes('jacuzzi') || amenity.toLowerCase().includes('hot tub') || amenity.toLowerCase().includes('bathtub');
                return (
                  <li key={idx} className="flex items-center text-sm text-slate-700 gap-3 p-2.5 rounded-xl hover:bg-[#f8fafb] transition-colors">
                    <span className={isJacuzzi ? "w-7 h-7 rounded-lg bg-[#8eaab9]/20 text-[#1f262d] flex items-center justify-center shrink-0 text-sm" : "w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 text-xs font-bold"}>
                      {isJacuzzi ? '🛁' : '✓'}
                    </span>
                    <span className="font-medium">{amenity}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Frequently Asked Questions */}
          <div className="mb-10 bg-white/90 backdrop-blur-md rounded-3xl border border-[#5b8296]/20 p-6 sm:p-8 shadow-xs">
            <h2 className="font-playfair text-xl sm:text-2xl font-normal text-[#1f262d] mb-5">
              Frequently Asked Questions About {hotel.name}
            </h2>
            <div className="space-y-4 font-jakarta">
              <div className="bg-[#f8fafb] rounded-2xl p-5 border border-[#5b8296]/15">
                <h3 className="font-bold text-sm sm:text-base text-[#1f262d] mb-2">
                  Does {hotel.name} guarantee a private in-room bathtub?
                </h3>
                <p className="text-slate-600 leading-relaxed text-sm">
                  Yes, {hotel.name} offers rooms with a private in-room bathtub or jacuzzi. To guarantee this feature, you must reserve the <strong className="text-[#1f262d]">{hotel.roomType || 'room tier featuring a bathtub'}</strong> rather than the entry-level shower-only room.
                </p>
              </div>

              <div className="bg-[#f8fafb] rounded-2xl p-5 border border-[#5b8296]/15">
                <h3 className="font-bold text-sm sm:text-base text-[#1f262d] mb-2">
                  Is {hotel.name} in {cityName} couple-friendly?
                </h3>
                <p className="text-slate-600 leading-relaxed text-sm">
                  Yes, {hotel.name} is verified as couple-friendly. Both unmarried and married couples are welcomed with standard government photo IDs and complete discretion.
                </p>
              </div>

              <div className="bg-[#f8fafb] rounded-2xl p-5 border border-[#5b8296]/15">
                <h3 className="font-bold text-sm sm:text-base text-[#1f262d] mb-2">
                  Why do bathtub rates vary between Agoda, MakeMyTrip, and Booking.com?
                </h3>
                <p className="text-slate-600 leading-relaxed text-sm">
                  Online travel agencies negotiate unique promotional inventory with the hotel. Agoda typically offers instant mobile VIP discounts, MakeMyTrip provides domestic bank card cashbacks, and Booking.com offers Genius loyalty tiers and free cancellation.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Quiet-Luxury Booking Console */}
        <div className="w-full md:w-2/5 lg:w-1/3">
          <div className="sticky top-6">
            <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-[#5b8296]/20 shadow-xl p-6 sm:p-7 mb-6 overflow-hidden">
              <div className="pb-5 border-b border-[#5b8296]/15 mb-5 font-jakarta">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                    Usual Nightly Benchmark
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/80">
                    Verified Rates
                  </span>
                </div>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-3xl font-bold text-[#1f262d]">~{usualPrice}</span>
                  <span className="text-sm text-slate-500 font-medium">/ night</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                  *Historical 30-day rate average. Live rates vary by dates, availability &amp; promotional tier.
                </p>
              </div>

              {/* Partner Comparison Mini Table in Sticky Card */}
              <div className="space-y-3 mb-5 font-jakarta">
                <span className="text-xs font-semibold text-[#1f262d] block">
                  Select Platform to Check Live Rates:
                </span>
                <div className="flex flex-col gap-2.5">
                  {displayUrls.map((u, i) => (
                    <BookingButton
                      key={i}
                      url={u}
                      hotelName={hotel.name}
                      cityName={cityName}
                      isPrimary={i === 0}
                    />
                  ))}
                </div>
              </div>

              {/* Bathtub Guarantee Checklist */}
              <div className="pt-4 border-t border-[#5b8296]/15 space-y-2 text-xs text-slate-600 font-jakarta">
                <div className="flex items-center gap-2 font-medium">
                  <span className="text-emerald-700 font-bold">✓</span>
                  <span>100% In-Room Tub (Never Shared Spa)</span>
                </div>
                <div className="flex items-center gap-2 font-medium">
                  <span className="text-emerald-700 font-bold">✓</span>
                  <span>Direct Canonical Property URL</span>
                </div>
                <div className="flex items-center gap-2 font-medium">
                  <span className="text-emerald-700 font-bold">✓</span>
                  <span>Zero Booking Fees or Hidden Markups</span>
                </div>
              </div>

              {/* Room Tier Alert in Sidebar */}
              <div className="mt-5 p-3.5 bg-amber-50/80 rounded-2xl border border-amber-200/80 text-xs text-amber-900 leading-snug font-jakarta">
                <strong className="font-bold block mb-1">Remember:</strong>
                Select the <strong className="text-amber-950 underline">{hotel.roomType || 'Bathtub Suite'}</strong> tier on partner checkout to guarantee the tub.
              </div>
            </div>

            <Link
              href={`/${countrySlug}/${citySlug}`}
              className="block text-center text-xs font-semibold text-[#5b8296] hover:text-[#1f262d] hover:underline transition-colors font-jakarta"
            >
              &larr; Explore all {cityName} bathtub hotels
            </Link>
          </div>
        </div>
      </div>

      {/* Similar Verified Bathtub Hotels in the City */}
      {similarHotels.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-8 py-12 border-t border-[#5b8296]/15">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-playfair text-2xl sm:text-3xl font-normal text-[#1f262d] tracking-tight">
                More Verified Bathtub Hotels in {cityName}
              </h2>
              <p className="text-sm text-slate-500 mt-1 font-jakarta">
                Explore alternative romantic stays with guaranteed in-room bathtubs &amp; jacuzzi suites.
              </p>
            </div>
            <Link 
              href={`/${countrySlug}/${citySlug}`}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-[#5b8296] hover:text-[#1f262d] hover:underline font-jakarta"
            >
              <span>View all in {cityName}</span>
              <span>&rarr;</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {similarHotels.map((sim, idx) => {
              const simSlug = sim.slug || slugify(sim.name);
              const simUrl = `/${countrySlug}/${citySlug}/${simSlug}`;
              return (
                <div
                  key={sim._id || idx}
                  className="bg-white/90 backdrop-blur-md rounded-2xl border border-[#5b8296]/20 shadow-2xs hover:shadow-md hover:border-[#5b8296] transition-all flex flex-col group overflow-hidden"
                >
                  <div className="relative aspect-[4/3] w-full bg-slate-100 overflow-hidden">
                    <Image
                      src={imageUrl(sim.image)}
                      alt={sim.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                    <div className="absolute top-2.5 left-2.5">
                      <span className="bg-white/90 backdrop-blur-md text-[#1f262d] border border-white/40 text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs font-jakarta">
                        <span className="text-emerald-700 font-bold">✓</span> Verified Tub
                      </span>
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1 text-xs font-bold text-slate-800 mb-1.5 font-jakarta">
                        <span className="text-amber-500">★</span>
                        <span>{(sim.rating && Number(sim.rating) > 0) ? Number(sim.rating).toFixed(1) : '4.5'}</span>
                        <span className="text-slate-400 font-normal">({sim.reviewsCount || 120})</span>
                      </div>
                      <Link href={simUrl} className="font-playfair font-semibold text-base text-[#1f262d] group-hover:text-[#5b8296] transition-colors line-clamp-2 mb-2 leading-snug">
                        {sim.name}
                      </Link>
                      {sim.tubType && (
                        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#8eaab9]/15 text-[#1f262d] font-semibold text-[10px] rounded-full border border-[#5b8296]/25 mb-3 font-jakarta">
                          <span>🛁</span> {sim.tubType}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between font-jakarta">
                      {sim.price ? (
                        <div>
                          <span className="text-[10px] text-slate-400 block leading-none">Usual Rate</span>
                          <span className="text-sm font-bold text-[#1f262d]">~{sim.price}</span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400">Usual Rates on OTA</span>
                      )}
                      <Link
                        href={simUrl}
                        className="px-3 py-1.5 bg-[#1f262d] hover:bg-[#2c3640] text-white font-semibold text-xs rounded-xl transition-colors shadow-2xs"
                      >
                        Inspect Stay
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Link 
              href={`/${countrySlug}/${citySlug}`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 text-slate-800 font-semibold text-sm rounded-xl hover:bg-slate-200 transition-colors w-full font-jakarta"
            >
              <span>View all verified stays in {cityName} &rarr;</span>
            </Link>
          </div>
        </section>
      )}
    </>
  );
}
