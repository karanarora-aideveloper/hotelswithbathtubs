import connectToDatabase from '@/lib/mongodb';
import Hotel from '@/models/Hotel';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { imageUrl } from '@/lib/imageUrl';
import StructuredData from '@/components/StructuredData';
import OutboundLink from '@/components/OutboundLink';
import { getUrlDirectnessTier } from '@/lib/affiliate';
import { escapeRegex, buildCityRegex, titleCase, slugify, resolveCountry, getCountryCurrency, normalizePrice } from '@/lib/utils';
import HotelAnalyticsComparison from '@/components/HotelAnalyticsComparison';
import HotelGallery from '@/components/HotelGallery';
import { getCityGeoCoordinates } from '@/lib/geoData';
import { isValidNeighborhood, isValidStreetAddress, sanitizePlaceholderText, cleanLandmarkDistance, isPlaceholderLandmark } from '@/lib/location';
import { getEvidenceLine, getLinkedPartners, sanitizeBookingTip, getBathtubLabel, sanitizeHotelData, buildDataDescription } from '@/lib/evidence';
import { isDuplicateDropSlug } from '@/data/duplicateHotels';
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
  for (const rawH of allHotels) {
    if (isDuplicateDropSlug(rawH.slug)) continue;
    const h = sanitizeHotelData(rawH);
    const cleanH = {
      ...h,
      description: sanitizePlaceholderText(h.description),
      landmarkDistance: cleanLandmarkDistance(h.landmarkDistance),
      bookingTip: h.bookingTip,
      amenities: h.amenities,
    };
    if (cleanH.slug) {
      map.set(cleanH.slug, cleanH);
      map.set(slugify(cleanH.slug), cleanH);
    }
    const nSlug = slugify(cleanH.name);
    if (nSlug && !map.has(nSlug)) map.set(nSlug, cleanH);
    if (cleanH.city) {
      const cSlug = slugify(cleanH.city);
      if (cleanH.slug) {
        map.set(`${cSlug}/${cleanH.slug}`, cleanH);
        map.set(`${cSlug}/${slugify(cleanH.slug)}`, cleanH);
      }
      map.set(`${cSlug}/${nSlug}`, cleanH);
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

  if (isDuplicateDropSlug(hotelSlug)) {
    return { hotel: null, countryInfo, rawCity };
  }

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
        city: buildCityRegex(rawCity),
        flagged: { $ne: true }
      }).lean();
    }
  }

  const cleanHotel = hotel ? sanitizeHotelData({
    ...hotel,
    description: sanitizePlaceholderText(hotel.description),
    landmarkDistance: cleanLandmarkDistance(hotel.landmarkDistance),
  }) : null;

  return { hotel: cleanHotel, countryInfo, rawCity };
}

function getCurrencyForPrice(price?: string, countrySlug?: string): string {
  if (price) {
    if (price.includes('₹')) return 'INR';
    if (price.includes('£')) return 'GBP';
    if (price.includes('€')) return 'EUR';
    if (price.includes('CHF') || price.includes('Fr')) return 'CHF';
    if (price.includes('AED')) return 'AED';
    if (price.includes('S$')) return 'SGD';
    if (price.includes('A$')) return 'AUD';
    if (price.includes('C$')) return 'CAD';
    if (price.includes('¥')) return 'JPY';
    if (price.includes('฿')) return 'THB';
    if (price.includes('$')) return 'USD';
  }
  return getCountryCurrency(countrySlug || '');
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

  return similar.slice(0, 8);
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
  const tubType = hotel.tubType || 'Bathtub';
  let displayName = hotel.name;
  if (displayName.length > 40) {
    const splitMatch = displayName.match(/^([^|•–-]+)[|•–-]/);
    if (splitMatch && splitMatch[1].trim().length >= 5) {
      displayName = splitMatch[1].trim();
    }
  }
  if (displayName.length > 42) {
    const lastSpace = displayName.slice(0, 42).lastIndexOf(' ');
    if (lastSpace > 20) {
      displayName = displayName.slice(0, lastSpace).trim();
    }
  }

  // Target title under 65 chars: shorten tub type to first part or simplify, never cut mid-word or append "..."
  const shortTub = tubType.split(/\s*(?:&|and|,|\/|\+)\s*/i)[0].trim() || 'Bathtub';
  const titleCandidates = [
    `${displayName} – Room with ${tubType}, ${cityName}`,
    `${displayName} – ${tubType}, ${cityName}`,
    `${displayName} – Room with ${shortTub}, ${cityName}`,
    `${displayName} – ${shortTub}, ${cityName}`,
    `${displayName} – Bathtub, ${cityName}`,
    `${displayName}, ${cityName}`,
    displayName,
  ];

  let pageTitle = titleCandidates.find((c) => c.length <= 65) || displayName.slice(0, 65);

  const roomType = hotel.roomType || 'Room with Bathtub';
  let pageDescription = `Stay at ${displayName} in ${cityName}. Book the ${roomType} for an in-room ${tubType.toLowerCase()}.`;
  if (pageDescription.length > 155) {
    pageDescription = `Book the ${roomType} at ${displayName}, ${cityName} for an in-room ${tubType.toLowerCase()}.`;
    if (pageDescription.length > 155) {
      pageDescription = `Private in-room ${tubType.toLowerCase()} at ${displayName} in ${cityName}.`;
      if (pageDescription.length > 155) {
        pageDescription = `In-room bathtub at ${displayName}, ${cityName}.`;
        if (pageDescription.length > 155) {
          pageDescription = `Hotel rooms with in-room bathtubs in ${cityName}.`;
        }
      }
    }
  }

  const hotelSlug = slugify(hotel.slug || hotel.name);
  const ogImage = imageUrl(hotel.image);
  const hotelUrl = `https://www.hotelswithbathtubs.com/${countryInfo.slug}/${slugify(rawCity)}/${hotelSlug}`;

  return {
    title: {
      absolute: pageTitle,
    },
    description: pageDescription,
    robots: { index: true, follow: true },
    alternates: {
      canonical: `https://www.hotelswithbathtubs.com/${countryInfo.slug}/${slugify(rawCity)}/${hotelSlug}`,
    },
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: hotelUrl,
      siteName: 'Hotels with Bathtubs',
      locale: countryInfo.slug === 'uk' ? 'en_GB' : 'en_US',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${displayName} with bathtub in ${cityName}`,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
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
  const hotelSlug = slugify(hotel.slug || hotel.name);
  const similarHotels = await getSimilarHotels(resolvedParams.country, resolvedParams.city, hotelSlug);
  const hasRealRating = hotel.rating && Number(hotel.rating) > 0;
  const hasRealReviews = hotel.reviewsCount && Number(hotel.reviewsCount) > 0;

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

  // Parse a single numeric nightly price ("$1,234.50" -> "1234.50"); ranges or junk yield no offer
  const schemaPrice = (() => {
    const raw = hotel.price?.toString() ?? '';
    const nums = raw.match(/\d[\d,]*(?:\.\d+)?/g);
    if (!nums || nums.length !== 1) return undefined;
    const n = Number(nums[0].replace(/,/g, ''));
    return n > 0 ? String(n) : undefined;
  })();

  // Hotel Schema (Google LodgingBusiness compliant with GeoCoordinates & UnitPriceSpecification)
  const hotelSchema = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    "name": hotel.name,
    "description": hotel.description || buildDataDescription(hotel),
    "image": imageUrl(hotel.image),
    "url": `https://www.hotelswithbathtubs.com/${countrySlug}/${citySlug}/${hotelSlug}`,
    "address": {
      "@type": "PostalAddress",
      ...(isValidStreetAddress(hotel.streetAddress) ? { "streetAddress": hotel.streetAddress } : {}),
      "addressLocality": cityName,
      "addressCountry": countryName,
      ...(hotel.postalCode ? { "postalCode": hotel.postalCode } : {})
    },
    // No aggregateRating: scores come from third-party booking partners, which Google's
    // review-snippet policy disallows marking up as the site's own ratings.
    "amenityFeature": [
      { "@type": "LocationFeatureSpecification", "name": "Private Bathtub", "value": true },
      ...(hotel.amenities || []).map((a: string) => ({ "@type": "LocationFeatureSpecification", "name": a, "value": true }))
    ],
    ...(schemaPrice ? {
      "makesOffer": {
        "@type": "Offer",
        "name": `${hotel.roomType || 'Room with Bathtub'} at ${hotel.name}`,
        "description": `Private in-room bathtub${hotel.tubType ? ` (${hotel.tubType})` : ''} in ${cityName}`,
        "url": `https://www.hotelswithbathtubs.com/${countrySlug}/${citySlug}/${hotelSlug}`,
        "priceSpecification": {
          "@type": "UnitPriceSpecification",
          "price": schemaPrice,
          "priceCurrency": getCurrencyForPrice(hotel.price, countrySlug),
          "unitText": "NIGHT"
        }
      }
    } : {})
  };

  // FAQPage schema intentionally omitted: rich results are limited to gov/health sites,
  // and the templated answers did not match the visible FAQ.

  type UrlProvider = 'makemytrip' | 'booking' | 'expedia' | 'hotelscom' | 'agoda' | 'trivago' | 'tripadvisor' | 'google' | 'airbnb' | 'trip' | null;
  function getUrlProvider(url?: string): UrlProvider {
    if (!url) return null;
    const lower = url.toLowerCase();
    if (lower.includes('makemytrip.com')) return 'makemytrip';
    if (lower.includes('booking.com')) return 'booking';
    if (lower.includes('expedia.com')) return 'expedia';
    if (lower.includes('hotels.com')) return 'hotelscom';
    if (lower.includes('agoda.com')) return 'agoda';
    if (lower.includes('trip.com')) return 'trip';
    if (lower.includes('airbnb')) return 'airbnb';
    if (lower.includes('trivago')) return 'trivago';
    if (lower.includes('tripadvisor')) return 'tripadvisor';
    if (lower.includes('google.com')) return 'google';
    return null;
  }

  const isIndia = countrySlug === 'india';
  let rawUrls = [hotel.bookingUrl, hotel.expediaUrl, hotel.hotelsComUrl, hotel.vrboUrl, hotel.agodaUrl, hotel.tripUrl, hotel.mmtUrl, hotel.airbnbUrl, hotel.url]
    .filter((u): u is string => !!u)
    .filter((u, idx, arr) => arr.indexOf(u) === idx);

  // For USA / non-India hotels, strictly suppress MakeMyTrip links
  if (!isIndia) {
    rawUrls = rawUrls.filter(u => !u.toLowerCase().includes('makemytrip.com') && !u.toLowerCase().includes('ekaro') && !u.toLowerCase().includes('linkredirect'));
  }
  
  const sortedUrls = [...rawUrls].sort((a, b) => {
    const tierA = getUrlDirectnessTier(a);
    const tierB = getUrlDirectnessTier(b);
    if (tierA !== tierB) return tierA - tierB;

    const provA = getUrlProvider(a);
    const provB = getUrlProvider(b);
    const priority: Record<string, number> = isIndia
      ? { agoda: 1, booking: 2, makemytrip: 3, expedia: 4, airbnb: 5, trip: 6, trivago: 7, tripadvisor: 8 }
      : { booking: 1, expedia: 2, hotelscom: 3, vrbo: 4, agoda: 5, trip: 6, airbnb: 7, trivago: 8, tripadvisor: 9, makemytrip: 99 };
    return (priority[provA || ''] || 99) - (priority[provB || ''] || 99);
  });

  // Filter out Tier 99 (broken search / generic redirect / fake search) URLs
  const safeUrls = sortedUrls.filter(u => getUrlDirectnessTier(u) < 99);
  const displayUrls = safeUrls;

  const rawPrice = normalizePrice(hotel.price) || hotel.price;
  const displayPrice = rawPrice ? rawPrice.replace(/^~\s*/, '') : '';

  const availableSources: string[] = [];
  const cleanBooking = (hotel.bookingUrl && !hotel.bookingUrl.includes('searchresults')) || (hotel.url && hotel.url.includes('booking.com') && !hotel.url.includes('searchresults'));
  if (cleanBooking) availableSources.push('Booking.com');
  if (hotel.expediaUrl || hotel.hotelsComUrl || hotel.vrboUrl) availableSources.push('Expedia');
  const cleanAgoda = (hotel.agodaUrl && getUrlDirectnessTier(hotel.agodaUrl) < 99) || (hotel.url && hotel.url.includes('agoda') && getUrlDirectnessTier(hotel.url) < 99);
  if (cleanAgoda) availableSources.push('Agoda');
  const cleanMmt = (hotel.mmtUrl && !hotel.mmtUrl.includes('hotel-listing') && !hotel.mmtUrl.includes('searchText=')) || (hotel.url && hotel.url.includes('makemytrip') && !hotel.url.includes('hotel-listing') && !hotel.url.includes('searchText='));
  if (isIndia && cleanMmt) availableSources.push('MakeMyTrip');
  const cleanAirbnb = (hotel.airbnbUrl && hotel.airbnbUrl.includes('/rooms/')) || (hotel.url && hotel.url.includes('airbnb') && hotel.url.includes('/rooms/'));
  if (cleanAirbnb) availableSources.push('Airbnb');
  const cleanTrip = (hotel.tripUrl && !hotel.tripUrl.includes('/hotels/list') && !hotel.tripUrl.includes('keyword=')) || (hotel.url && hotel.url.includes('trip.com') && !hotel.url.includes('/hotels/list') && !hotel.url.includes('keyword='));
  if (cleanTrip) availableSources.push('Trip.com');
  const listedPlatformsText = availableSources.length > 0
    ? `Listed on ${availableSources.join(', ')}`
    : 'Listed on partner platforms';

  const linkedPartners = getLinkedPartners(hotel);
  const cleanTip = sanitizeBookingTip(hotel.bookingTip, linkedPartners, hotel.roomType);
  const evidence = getEvidenceLine(hotel);

  return (
    <>
      <StructuredData data={breadcrumbSchema} />
      <StructuredData data={hotelSchema} />

      {/* Quiet Luxury Breadcrumbs Bar */}
      <div className="border-b border-[#5b8296]/15 bg-white/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 text-xs font-medium text-slate-500 flex items-center justify-between flex-wrap gap-2 font-jakarta">
          <div className="flex items-center flex-wrap gap-1.5">
            <Link href="/" prefetch={false} className="text-slate-500 hover:text-[#1f262d] transition-colors">Home</Link>
            <span className="text-slate-300">/</span>
            <Link href={`/${countrySlug}`} prefetch={false} className="text-slate-500 hover:text-[#1f262d] transition-colors">{countryName}</Link>
            <span className="text-slate-300">/</span>
            <Link href={`/${countrySlug}/${citySlug}`} prefetch={false} className="text-slate-500 hover:text-[#1f262d] transition-colors">{cityName}</Link>
            <span className="text-slate-300">/</span>
            <span className="text-[#1f262d] font-semibold truncate max-w-[200px] sm:max-w-xs">{hotel.name}</span>
          </div>
          <Link
            href={`/${countrySlug}/${citySlug}`}
            prefetch={false}
            className="text-xs font-semibold text-[#5b8296] hover:text-[#1f262d] transition-colors flex items-center gap-1"
          >
            <span>&larr;</span> Back to all {cityName} bathtub stays
          </Link>
        </div>
      </div>

      {/* Contained Hero Image Showcase Gallery / 5-Photo Bento Grid */}
      <HotelGallery
        images={hotel.images}
        partnerImages={hotel.partnerImages}
        primaryImage={hotel.image}
        hotelName={hotel.name}
        cityName={cityName}
        countryName={countryName}
        roomType={hotel.roomType}
        listedPlatformsText={listedPlatformsText}
        bathtubLabel={getBathtubLabel(hotel)}
      />

      {/* Main Content Layout with 2/3 Content and 1/3 Sticky Booking Sidebar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 md:py-10 flex flex-col md:flex-row gap-8 lg:gap-12 relative">
        {/* Left Column: Deep Information & Analytics */}
        <div className="w-full md:w-3/5 lg:w-2/3">
          {/* Header Title Block */}
          <div className="mb-8">
            <div className="flex flex-wrap items-center gap-2 mb-2.5 font-jakarta">
              <span className={`border font-semibold text-[11px] tracking-wider uppercase px-2.5 py-0.5 rounded-full ${
                hotel.bathtubConfirmed
                  ? 'bg-[#8eaab9]/15 text-[#1f262d] border-[#5b8296]/30'
                  : 'bg-amber-50 text-amber-800 border-amber-200/80'
              }`}>
                {getBathtubLabel(hotel)}
              </span>
            </div>

            <h1 className="font-playfair text-3xl sm:text-4xl md:text-5xl font-normal text-[#1f262d] tracking-tight leading-tight mb-3">
              {hotel.name}
            </h1>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600 mb-4 font-jakarta">
              <div className="flex items-center gap-1.5 font-medium text-slate-600">
                <svg className="w-4 h-4 text-[#5b8296]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                <span>
                  {hotel.neighborhood && isValidNeighborhood(hotel.neighborhood)
                    ? `${hotel.neighborhood}, ${cityName}`
                    : cityName}, {countryName}
                </span>
                {hotel.landmarkDistance && !isPlaceholderLandmark(hotel.landmarkDistance) && (
                  <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full ml-1">
                    {hotel.landmarkDistance}
                  </span>
                )}
              </div>
            </div>

            {/* P2 Honest Evidence Line */}
            <div className="inline-flex flex-wrap items-center gap-1.5 px-4 py-2 bg-slate-50 text-slate-700 text-xs sm:text-sm rounded-2xl border border-slate-200/80 font-jakarta">
              <span>{evidence.textPrefix}</span>
              {evidence.roomType && <strong className="font-bold text-slate-900">{evidence.roomType}</strong>}
              <span>{evidence.textSuffix}</span>
              <Link href="/how-we-check-bathtubs" className="text-[#1a6fde] hover:underline font-semibold ml-1">
                How we check
              </Link>
            </div>
          </div>

          {/* Cross-Platform Price Comparison & Bathtub Intelligence Analytics Hub */}
          <HotelAnalyticsComparison
            hotel={{
              name: hotel.name,
              price: hotel.price || null,
              rating: hotel.rating,
              reviewsCount: hotel.reviewsCount,
              tubType: hotel.tubType,
              roomType: hotel.roomType,
              description: hotel.description,
              bookingTip: cleanTip,
              url: hotel.url,
              agodaUrl: hotel.agodaUrl,
              bookingUrl: hotel.bookingUrl,
              airbnbUrl: hotel.airbnbUrl,
              tripUrl: hotel.tripUrl,
              mmtUrl: hotel.mmtUrl,
              expediaUrl: hotel.expediaUrl,
              hotelsComUrl: hotel.hotelsComUrl,
              vrboUrl: hotel.vrboUrl,
              neighborhood: isValidNeighborhood(hotel.neighborhood) ? hotel.neighborhood : undefined,
              landmarkDistance: cleanLandmarkDistance(hotel.landmarkDistance),
              updatedAt: hotel.updatedAt,
              amenities: hotel.amenities,
            }}
            cityName={cityName}
            countryName={countryName}
            countrySlug={countrySlug}
          />

          {/* Bathtub facts (Server-rendered, deterministic, hotel-specific facts) */}
          <div className="mb-8 bg-white/90 backdrop-blur-md rounded-3xl border border-[#5b8296]/20 p-6 sm:p-8 shadow-xs">
            <h2 className="font-playfair text-xl sm:text-2xl font-normal text-[#1f262d] mb-4">
              Bathtub facts for {hotel.name}
            </h2>
            <div className="space-y-3 font-jakarta text-sm sm:text-[15px] text-slate-700 leading-relaxed">
              {hotel.roomType && (
                <p className="flex items-start gap-2.5">
                  <span className="text-emerald-700 font-bold shrink-0 mt-0.5">✓</span>
                  <span>Book the <strong className="font-semibold text-slate-900">{hotel.roomType}</strong> for a private in-room bathtub.</span>
                </p>
              )}

              {hotel.tubType && (
                <p className="flex items-start gap-2.5">
                  <span className="text-emerald-700 font-bold shrink-0 mt-0.5">✓</span>
                  <span>Features an in-room <strong className="font-semibold text-slate-900">{hotel.tubType}</strong> inside the private guest accommodation.</span>
                </p>
              )}

              {isValidNeighborhood(hotel.neighborhood) && (
                <p className="flex items-start gap-2.5">
                  <span className="text-emerald-700 font-bold shrink-0 mt-0.5">✓</span>
                  <span>Situated in the <strong className="font-semibold text-slate-900">{hotel.neighborhood}</strong> area of {cityName}, {countryName}.</span>
                </p>
              )}

              {hotel.landmarkDistance && !isPlaceholderLandmark(hotel.landmarkDistance) && (
                <p className="flex items-start gap-2.5">
                  <span className="text-emerald-700 font-bold shrink-0 mt-0.5">✓</span>
                  <span>Location highlight: {hotel.landmarkDistance}.</span>
                </p>
              )}

              {cleanTip && (
                <p className="flex items-start gap-2.5 bg-amber-50/70 border border-amber-200/60 rounded-xl p-3 text-amber-950">
                  <span className="shrink-0 text-base">💡</span>
                  <span><strong>Booking tip:</strong> {cleanTip}</span>
                </p>
              )}
            </div>
          </div>

          {/* About this Property */}
          {hotel.description && (
            <div className="mb-8 bg-white/90 backdrop-blur-md rounded-3xl border border-[#5b8296]/20 p-6 sm:p-8 shadow-xs">
              <h2 className="font-playfair text-xl sm:text-2xl font-normal text-[#1f262d] mb-3">
                About this Property
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-jakarta">
                {hotel.description}
              </p>
            </div>
          )}

          {/* Concierge Booking Tip Callout Card */}
          {cleanTip && (
            <div className="bg-[#f8fafb] border border-[#5b8296]/20 rounded-2xl p-5 mb-8 flex items-start gap-3.5 shadow-2xs font-jakarta">
              <div className="w-9 h-9 rounded-xl bg-[#8eaab9]/20 text-[#1f262d] flex items-center justify-center shrink-0 mt-0.5 font-bold text-base">
                💡
              </div>
              <div className="text-sm text-slate-700 leading-relaxed">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#5b8296] block mb-0.5">
                  Concierge Booking Advice
                </span>
                {cleanTip}
              </div>
            </div>
          )}

          {/* Curated Amenities Grid */}
          <div className="mb-8 bg-white/90 backdrop-blur-md rounded-3xl border border-[#5b8296]/20 p-6 sm:p-8 shadow-xs">
            <h2 className="font-playfair text-xl sm:text-2xl font-normal text-[#1f262d] mb-5">
              In-Room &amp; Property Amenities
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
                  Which room at {hotel.name} has the bathtub?
                </h3>
                <p className="text-slate-600 leading-relaxed text-sm">
                  {hotel.name} features an in-room bathtub in the <strong className="text-[#1f262d]">{hotel.roomType || 'room tier featuring a bathtub'}</strong>. {evidence.fullPlainText} <Link href="/how-we-check-bathtubs" className="text-[#1a6fde] hover:underline font-medium">How we check</Link>
                </p>
              </div>

              <div className="bg-[#f8fafb] rounded-2xl p-5 border border-[#5b8296]/15">
                <h3 className="font-bold text-sm sm:text-base text-[#1f262d] mb-2">
                  What is the booking tip for {hotel.name}?
                </h3>
                <p className="text-slate-600 leading-relaxed text-sm">
                  {cleanTip}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Navigation */}
        <div className="w-full md:w-2/5 lg:w-1/3">
          <div className="sticky top-6">
            <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-[#5b8296]/20 shadow-xs p-6 mb-6">
              <div className="space-y-3 font-jakarta text-center">
                <Link
                  href={`/${countrySlug}/${citySlug}`}
                  className="block text-xs font-semibold text-[#5b8296] hover:text-[#1f262d] hover:underline transition-colors"
                >
                  &larr; Explore all {cityName} bathtub hotels
                </Link>
                <div className="pt-2 border-t border-[#5b8296]/15 flex items-center justify-center gap-2.5 text-[11px] text-slate-500">
                  <Link href="/soaking-tub-hotels" className="hover:text-[#1a6fde] hover:underline">
                    🛁 Top 50 Soaking Tubs
                  </Link>
                  <span>&bull;</span>
                  <Link href="/hotels-with-hot-tub-in-room" className="hover:text-[#1a6fde] hover:underline">
                    ♨️ In-Room Hot Tubs
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Reservation Drawer (< 768px) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-gray-200 px-4 py-2.5 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-black text-gray-900 leading-tight truncate">
              {displayPrice ? `about ${displayPrice} / night` : 'Check today\'s price'}
            </span>
          </div>
          <p className="text-[10px] text-emerald-700 font-semibold truncate flex items-center gap-1 mt-0.5">
            <span>🛁</span> {hotel.roomType || 'Bathtub Room'}
          </p>
        </div>

        {displayUrls[0] && (
          <OutboundLink
            href={displayUrls[0]}
            hotelName={hotel.name}
            cityName={cityName}
            source="mobile_sticky_bar"
            className="px-4 py-2.5 bg-[#1a6fde] hover:bg-[#1559b8] active:scale-95 text-white text-xs font-bold rounded-xl shadow-sm transition-all shrink-0 flex items-center gap-1.5"
          >
            <span>Book Now</span>
            <span>&rarr;</span>
          </OutboundLink>
        )}
      </div>

      {/* Similar Bathtub Hotels in the City */}
      {similarHotels.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-8 py-12 border-t border-[#5b8296]/15">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-playfair text-2xl sm:text-3xl font-normal text-[#1f262d] tracking-tight">
                More rooms with a bathtub in {cityName}
              </h2>
              <p className="text-sm text-slate-500 mt-1 font-jakarta">
                More rooms with a bathtub in {cityName}.
              </p>
            </div>
            <a 
              href={`/${countrySlug}/${citySlug}`}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-[#5b8296] hover:text-[#1f262d] hover:underline font-jakarta"
            >
              <span>View all in {cityName}</span>
              <span>&rarr;</span>
            </a>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            {similarHotels.map((sim, idx) => {
              const simSlug = sim.slug || slugify(sim.name);
              const simUrl = `/${countrySlug}/${citySlug}/${simSlug}`;
              return (
                <div
                  key={sim._id || idx}
                  className="bg-white/90 backdrop-blur-md rounded-2xl border border-[#5b8296]/20 shadow-2xs hover:shadow-md hover:border-[#5b8296] transition-all flex flex-col group overflow-hidden"
                >
                  <a href={simUrl} className="block relative aspect-[4/3] w-full bg-slate-100 overflow-hidden">
                    <img
                      src={imageUrl(sim.image)}
                      alt={sim.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                    <div className="absolute top-2.5 left-2.5">
                      <span className="bg-white/90 backdrop-blur-md text-[#1f262d] border border-white/40 text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs font-jakarta">
                        {sim.bathtubConfirmed && <span className="text-emerald-700 font-bold">✓</span>}
                        {getBathtubLabel(sim)}
                      </span>
                    </div>
                  </a>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <a href={simUrl} className="font-playfair font-semibold text-base text-[#1f262d] group-hover:text-[#5b8296] transition-colors line-clamp-2 mb-2 leading-snug">
                        {sim.name}
                      </a>
                      {sim.tubType && (
                        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#8eaab9]/15 text-[#1f262d] font-semibold text-[10px] rounded-full border border-[#5b8296]/25 mb-3 font-jakarta">
                          <span>🛁</span> {sim.tubType}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between font-jakarta">
                      {sim.price ? (
                        <div>
                          <span className="text-sm font-bold text-[#1f262d]">About {sim.price.replace(/^~\s*/, '')} a night</span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400">Check partner rates</span>
                      )}
                      <a
                        href={simUrl}
                        className="px-3 py-1.5 bg-[#1f262d] hover:bg-[#2c3640] text-white font-semibold text-xs rounded-xl transition-colors shadow-2xs"
                      >
                        View room
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <a 
              href={`/${countrySlug}/${citySlug}`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 text-slate-800 font-semibold text-sm rounded-xl hover:bg-slate-200 transition-colors w-full font-jakarta"
            >
              <span>View all stays in {cityName} &rarr;</span>
            </a>
          </div>
        </section>
      )}
    </>
  );
}
