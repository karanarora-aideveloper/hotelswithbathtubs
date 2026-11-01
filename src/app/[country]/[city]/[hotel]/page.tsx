import connectToDatabase from '@/lib/mongodb';
import Hotel from '@/models/Hotel';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { imageUrl } from '@/lib/imageUrl';
import StructuredData from '@/components/StructuredData';
import { getUrlDirectnessTier } from '@/lib/affiliate';
import { escapeRegex, buildCityRegex, titleCase, slugify, resolveCountry, getCountryCurrency } from '@/lib/utils';
import WhereToBookRow from '@/components/WhereToBookRow';
import HotelGallery from '@/components/HotelGallery';
import { isValidNeighborhood, isValidStreetAddress, sanitizePlaceholderText, cleanLandmarkDistance, isPlaceholderLandmark } from '@/lib/location';
import { getEvidenceLine, getLinkedPartners, sanitizeBookingTip, getBathtubLabel, getTubWord, sanitizeHotelData, buildDataDescription, isHotelConfirmed } from '@/lib/evidence';
import { buildHotelDescription } from '@/lib/hotelText';
import { isDuplicateDropSlug } from '@/data/duplicateHotels';
import fs from 'node:fs';
import path from 'node:path';

export const revalidate = false;

interface CachedHotel {
  _id?: string;
  name: string;
  slug?: string;
  city?: string;
  country?: string;
  url?: string;
  bookingUrl?: string;
  agodaUrl?: string;
  mmtUrl?: string;
  makemytripUrl?: string;
  cleartripUrl?: string;
  easemytripUrl?: string;
  airbnbUrl?: string;
  tripUrl?: string;
  expediaUrl?: string;
  hotelsComUrl?: string;
  vrboUrl?: string;
  image?: string;
  images?: string[];
  partnerImages?: string[];
  rating?: number | string;
  reviewsCount?: number;
  bathtubConfirmed?: boolean | null;
  roomType?: string;
  tubType?: string;
  bookingTip?: string;
  price?: string;
  neighborhood?: string;
  landmarkDistance?: string;
  streetAddress?: string;
  postalCode?: string;
  importBatch?: string | null;
  bookingTubLabels?: string[] | null;
  updatedAt?: string | Date | null;
  description?: string;
  amenities?: string[];
  [key: string]: unknown;
}

type HotelRecord = CachedHotel;

// In-memory cache for ultra-fast static page generation without MongoDB connection pool exhaustion
let memoryHotelMap: Map<string, HotelRecord> | null = null;

async function getCachedHotelMap() {
  if (process.env.NODE_ENV !== 'development' && memoryHotelMap) return memoryHotelMap;

  let allHotels: HotelRecord[] = [];
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
    allHotels = (await Hotel.find({ flagged: { $ne: true } }).lean()) as unknown as HotelRecord[];
  }

  const map = new Map<string, HotelRecord>();
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
  
  const similar: CachedHotel[] = [];
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
  const hotelName = hotel.name;

  let pageTitle: string;
  let pageDescription: string;

  if (!isHotelConfirmed(hotel)) {
    const reportedTitle = `${hotelName} – Bathtub reported, ${cityName}`;
    const fallbackTitle = `${hotelName}, ${cityName}`;
    if (reportedTitle.length <= 65) {
      pageTitle = reportedTitle;
    } else if (fallbackTitle.length <= 65) {
      pageTitle = fallbackTitle;
    } else {
      pageTitle = hotelName;
    }

    let roomPhrase = '';
    if (hotel.roomType && hotel.roomType.trim()) {
      const rt = hotel.roomType.trim();
      if (/^the\s+/i.test(rt) || /^some\s+rooms/i.test(rt)) {
        roomPhrase = ` in ${rt}`;
      } else {
        roomPhrase = ` in the ${rt}`;
      }
    }
    const descWithRoom = roomPhrase
      ? `${hotelName} in ${cityName}. A bathtub or jetted tub is reported${roomPhrase}; check the room details before you book.`
      : '';
    const descWithoutRoom = `${hotelName} in ${cityName}. A bathtub or jetted tub is reported; check the room details before you book.`;

    if (descWithRoom && descWithRoom.length <= 155) {
      pageDescription = descWithRoom;
    } else {
      pageDescription = descWithoutRoom;
    }
  } else {
    // Target title under 65 chars: shorten tub type to first part or simplify, never cut mid-word or append "..."
    const shortTub = tubType.split(/\s*(?:&|and|,|\/|\+)\s*/i)[0].trim() || 'Bathtub';
    const titleCandidates = [
      `${hotelName} – Room with ${tubType}, ${cityName}`,
      `${hotelName} – ${tubType}, ${cityName}`,
      `${hotelName} – Room with ${shortTub}, ${cityName}`,
      `${hotelName} – ${shortTub}, ${cityName}`,
      `${hotelName} – Bathtub, ${cityName}`,
      `${hotelName}, ${cityName}`,
      hotelName,
    ];

    pageTitle = titleCandidates.find((c) => c.length <= 65) || hotelName;

    const roomType = hotel.roomType || 'Room with Bathtub';
    let pDesc = `Stay at ${hotelName} in ${cityName}. Book the ${roomType} for an in-room ${tubType.toLowerCase()}.`;
    if (pDesc.length > 155) {
      pDesc = `Book the ${roomType} at ${hotelName}, ${cityName} for an in-room ${tubType.toLowerCase()}.`;
      if (pDesc.length > 155) {
        pDesc = `Private in-room ${tubType.toLowerCase()} at ${hotelName} in ${cityName}.`;
        if (pDesc.length > 155) {
          pDesc = `In-room bathtub at ${hotelName}, ${cityName}.`;
          if (pDesc.length > 155) {
            pDesc = `Hotel rooms with in-room bathtubs in ${cityName}.`;
          }
        }
      }
    }
    pageDescription = pDesc;
  }

  // ROUND 13B: For hotels without importBatch, use buildHotelDescription(hotel)
  if (!hotel.importBatch) {
    pageDescription = buildHotelDescription(hotel);
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
          alt: `${hotelName} with bathtub in ${cityName}`,
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
    "description": hotel.importBatch
      ? (hotel.description || buildDataDescription(hotel))
      : buildHotelDescription(hotel),
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
      ...(hotel.amenities || []).filter((a: string) => !/couple[- ]?friendly/i.test(a)).map((a: string) => ({ "@type": "LocationFeatureSpecification", "name": a, "value": true }))
    ],
    ...(schemaPrice ? {
      "makesOffer": {
        "@type": "Offer",
        "name": isHotelConfirmed(hotel)
          ? `${hotel.roomType || 'Room with Bathtub'} at ${hotel.name}`
          : `${hotel.roomType || 'Room'} at ${hotel.name}`,
        "description": isHotelConfirmed(hotel)
          ? `Private in-room bathtub${hotel.tubType ? ` (${hotel.tubType})` : ''} in ${cityName}`
          : `Room with a reported bathtub (not yet confirmed) in ${cityName}`,
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

  interface PartnerUrlHotel {
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

  function getPartnerUrl(h: PartnerUrlHotel, partnerName: string): string {
    switch (partnerName) {
      case 'Booking.com':
        return h.bookingUrl || (h.url && h.url.includes('booking.com') ? h.url : '');
      case 'Agoda':
        return h.agodaUrl || (h.url && h.url.includes('agoda.com') ? h.url : '');
      case 'MakeMyTrip':
        return h.mmtUrl || h.makemytripUrl || (h.url && h.url.includes('makemytrip.com') ? h.url : '');
      case 'Cleartrip':
        return h.cleartripUrl || (h.url && h.url.includes('cleartrip.com') ? h.url : '');
      case 'EaseMyTrip':
        return h.easemytripUrl || (h.url && h.url.includes('easemytrip.com') ? h.url : '');
      case 'Airbnb':
        return h.airbnbUrl || (h.url && h.url.includes('airbnb.com') ? h.url : '');
      case 'Trip.com':
        return h.tripUrl || (h.url && h.url.includes('trip.com') ? h.url : '');
      case 'Expedia':
        return h.expediaUrl || (h.url && h.url.includes('expedia.com') ? h.url : '');
      case 'Hotels.com':
        return h.hotelsComUrl || (h.url && h.url.includes('hotels.com') ? h.url : '');
      case 'Vrbo':
        return h.vrboUrl || (h.url && h.url.includes('vrbo.com') ? h.url : '');
      default:
        return h.url || '';
    }
  }

  const isIndia = countrySlug === 'india';
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

  const allLinkedPartners = getLinkedPartners(hotel);
  const linkedPartners = allLinkedPartners.filter(p => isIndia || p !== 'MakeMyTrip');

  const tubWords = getTubWord(hotel);

  const cleanTip = sanitizeBookingTip(hotel.bookingTip, linkedPartners, hotel.roomType);
  const evidence = getEvidenceLine(hotel);
  const hotelAddress = isValidStreetAddress(hotel.streetAddress)
    ? `${hotel.streetAddress}, ${cityName}, ${countryName}`
    : (hotel.neighborhood && isValidNeighborhood(hotel.neighborhood)
      ? `${hotel.neighborhood}, ${cityName}, ${countryName}`
      : `${cityName}, ${countryName}`);

  return (
    <>
      <StructuredData data={breadcrumbSchema} />
      <StructuredData data={hotelSchema} />

      {/* Breadcrumbs Bar */}
      <div className="border-b border-[#e3e7ef] bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 text-xs text-[#5b6478] flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center flex-wrap gap-1.5">
            <Link href="/" prefetch={false} className="text-[#5b6478] hover:text-[#14213d] transition-colors">Home</Link>
            <span className="text-[#5b6478]/40">/</span>
            <Link href={`/${countrySlug}`} prefetch={false} className="text-[#5b6478] hover:text-[#14213d] transition-colors">{countryName}</Link>
            <span className="text-[#5b6478]/40">/</span>
            <Link href={`/${countrySlug}/${citySlug}`} prefetch={false} className="text-[#5b6478] hover:text-[#14213d] transition-colors">{cityName}</Link>
            <span className="text-[#5b6478]/40">/</span>
            <span className="text-[#14213d] font-semibold truncate max-w-[200px] sm:max-w-xs">{hotel.name}</span>
          </div>
          <Link
            href={`/${countrySlug}/${citySlug}`}
            prefetch={false}
            className="text-xs font-semibold text-[#b08d57] hover:text-[#9c7b48] transition-colors flex items-center gap-1"
          >
            <span>&larr;</span> Back to all {cityName} bathtub stays
          </Link>
        </div>
      </div>

      {/* Contained Hero Image Showcase Gallery with Style B mobile dots */}
      <HotelGallery
        images={hotel.images}
        partnerImages={hotel.partnerImages}
        primaryImage={hotel.image || ''}
        hotelName={hotel.name}
        cityName={cityName}
        countryName={countryName}
        roomType={hotel.roomType}
        listedPlatformsText={listedPlatformsText}
        bathtubLabel={getBathtubLabel(hotel)}
        bathtubConfirmed={isHotelConfirmed(hotel)}
      />

      {/* Main Content Layout matching Style B mockup */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        {/* Hotel Title H1 */}
        <h1 className="font-playfair text-[28px] sm:text-[34px] md:text-[38px] font-semibold text-[#14213d] leading-[1.1] mb-1.5 tracking-tight">
          {hotel.name}
        </h1>

        {/* Address */}
        <div className="text-xs sm:text-[13px] text-[#5b6478] mb-4">
          {hotelAddress}
        </div>

        {/* Proof box matching Style B mockup */}
        <div className="border border-[#e3e7ef] bg-white rounded-[14px] p-3.5 sm:p-4 mb-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          {isHotelConfirmed(hotel) ? (
            <>
              <div className="flex items-center gap-2 font-bold text-[#1f6f5c] text-sm mb-1.5">
                <span className="w-[22px] h-[22px] rounded-full bg-[#e3f2ee] text-[#1f6f5c] flex items-center justify-center text-xs font-bold shrink-0">✓</span>
                <span>Tub proven on Booking.com</span>
              </div>
              <p className="text-xs sm:text-[13px] text-[#5b6478] leading-relaxed m-0">
                Booking.com lists a <strong className="font-semibold text-[#14213d]">{tubWords}</strong> for the <strong className="font-semibold text-[#14213d]">{hotel.roomType || 'room'}</strong>. Pick this exact room when you book.{' '}
                <Link href="/how-we-check-bathtubs" prefetch={false} className="text-[#b08d57] hover:underline font-semibold ml-1">
                  How we check
                </Link>
              </p>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 font-bold text-[#5b6478] text-sm mb-1.5">
                <span className="w-[22px] h-[22px] rounded-full bg-[#e9eef7] text-[#5b6478] flex items-center justify-center text-xs font-bold shrink-0">•</span>
                <span>Reported, not yet confirmed</span>
              </div>
              <p className="text-xs sm:text-[13px] text-[#5b6478] leading-relaxed m-0">
                Reported room: <strong className="font-semibold text-[#14213d]">{hotel.roomType || 'room'}</strong>. Check the room details before booking.{' '}
                <Link href="/how-we-check-bathtubs" prefetch={false} className="text-[#b08d57] hover:underline font-semibold ml-1">
                  How we check
                </Link>
              </p>
            </>
          )}
        </div>

        {/* "Where to book" compare box */}
        <div className="bg-white border border-[#e3e7ef] rounded-[14px] overflow-hidden mb-6 shadow-[0_4px_18px_rgba(0,0,0,0.03)]">
          <div className="p-[12px_14px] font-bold font-playfair text-[19px] text-[#14213d] border-b border-[#e3e7ef]">
            Where to book
          </div>
          {linkedPartners.length > 0 ? (
            linkedPartners.map((partnerName) => {
              const partnerUrl = getPartnerUrl(hotel, partnerName);
              const isConfirmedBooking = partnerName === 'Booking.com' && isHotelConfirmed(hotel);
              return (
                <WhereToBookRow
                  key={partnerName}
                  partnerName={partnerName}
                  url={partnerUrl}
                  hotelName={hotel.name}
                  cityName={cityName}
                  isConfirmedBooking={isConfirmedBooking}
                />
              );
            })
          ) : (
            <div className="p-[12px_14px] text-xs text-[#5b6478]">
              No booking partner linked yet.
            </div>
          )}
        </div>

        {/* Bathtub facts card */}
        <div className="mb-6 bg-white rounded-2xl border border-[#e3e7ef] p-5 sm:p-6 shadow-[0_4px_18px_rgba(0,0,0,0.03)]">
          <h2 className="font-playfair text-xl sm:text-2xl font-semibold text-[#14213d] mb-4">
            Bathtub facts for {hotel.name}
          </h2>
          <div className="space-y-3 text-sm text-[#14213d] leading-relaxed">
            {hotel.roomType && (
              <p className="flex items-start gap-2.5">
                <span className="text-[#1f6f5c] font-bold shrink-0 mt-0.5">✓</span>
                {isHotelConfirmed(hotel) ? (
                  <span>Book the <strong className="font-semibold text-[#14213d]">{hotel.roomType}</strong> for an in-room {tubWords}.</span>
                ) : (
                  <span>Reported room: <strong className="font-semibold text-[#14213d]">{hotel.roomType}</strong>. Check that &apos;Bathtub&apos; is listed in the room details before you pay.</span>
                )}
              </p>
            )}

            {hotel.tubType && isHotelConfirmed(hotel) && (
              <p className="flex items-start gap-2.5">
                <span className="text-[#1f6f5c] font-bold shrink-0 mt-0.5">✓</span>
                <span>Features an in-room <strong className="font-semibold text-[#14213d]">{hotel.tubType}</strong> inside the private guest accommodation.</span>
              </p>
            )}

            {isValidNeighborhood(hotel.neighborhood) && (
              <p className="flex items-start gap-2.5">
                <span className="text-[#1f6f5c] font-bold shrink-0 mt-0.5">✓</span>
                <span>Situated in the <strong className="font-semibold text-[#14213d]">{hotel.neighborhood}</strong> area of {cityName}, {countryName}.</span>
              </p>
            )}

            {hotel.landmarkDistance && !isPlaceholderLandmark(hotel.landmarkDistance) && (
              <p className="flex items-start gap-2.5">
                <span className="text-[#1f6f5c] font-bold shrink-0 mt-0.5">✓</span>
                <span>Location highlight: {hotel.landmarkDistance}.</span>
              </p>
            )}
          </div>
        </div>

        {/* About this Property card */}
        {hotel.description && (
          <div className="mb-6 bg-white rounded-2xl border border-[#e3e7ef] p-5 sm:p-6 shadow-[0_4px_18px_rgba(0,0,0,0.03)]">
            <h2 className="font-playfair text-xl sm:text-2xl font-semibold text-[#14213d] mb-3">
              About this Property
            </h2>
            <p className="text-sm sm:text-base text-[#5b6478] leading-relaxed">
              {hotel.description}
            </p>
          </div>
        )}

        {/* In-Room & Property Amenities card */}
        <div className="mb-6 bg-white rounded-2xl border border-[#e3e7ef] p-5 sm:p-6 shadow-[0_4px_18px_rgba(0,0,0,0.03)]">
          <h2 className="font-playfair text-xl sm:text-2xl font-semibold text-[#14213d] mb-4">
            In-Room &amp; Property Amenities
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            {(hotel.amenities || []).filter((amenity: string) => !/couple[- ]?friendly/i.test(amenity)).map((amenity: string, idx: number) => {
              const isJacuzzi = amenity.toLowerCase().includes('jacuzzi') || amenity.toLowerCase().includes('hot tub') || amenity.toLowerCase().includes('bathtub');
              return (
                <li key={idx} className="flex items-center text-sm text-[#14213d] gap-3 p-2 rounded-xl hover:bg-[#f5f6f8] transition-colors">
                  <span className={isJacuzzi ? "w-7 h-7 rounded-lg bg-[#e3f2ee] text-[#1f6f5c] flex items-center justify-center shrink-0 text-sm" : "w-7 h-7 rounded-lg bg-[#e9eef7] text-[#14213d] flex items-center justify-center shrink-0 text-xs font-bold"}>
                    {isJacuzzi ? '🛁' : '✓'}
                  </span>
                  <span className="font-medium">{amenity}</span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Frequently Asked Questions */}
        <div className="mb-6 bg-white rounded-2xl border border-[#e3e7ef] p-5 sm:p-6 shadow-[0_4px_18px_rgba(0,0,0,0.03)]">
          <h2 className="font-playfair text-xl sm:text-2xl font-semibold text-[#14213d] mb-4">
            Frequently Asked Questions About {hotel.name}
          </h2>
          <div className="space-y-4">
            <div className="bg-[#f5f6f8] rounded-xl p-4 border border-[#e3e7ef]">
              <h3 className="font-bold text-sm sm:text-base text-[#14213d] mb-1.5">
                Which room at {hotel.name} has the bathtub?
              </h3>
              <p className="text-[#5b6478] leading-relaxed text-sm">
                {isHotelConfirmed(hotel) ? (
                  <>{hotel.name} features an in-room bathtub in the <strong className="text-[#14213d]">{hotel.roomType || 'room tier featuring a bathtub'}</strong>. {evidence.fullPlainText} <Link href="/how-we-check-bathtubs" prefetch={false} className="text-[#b08d57] hover:underline font-medium">How we check</Link></>
                ) : (
                  <>A bathtub is reported in the <strong className="text-[#14213d]">{hotel.roomType || 'room'}</strong>, but we haven&apos;t confirmed it yet. Check the room details on {linkedPartners[0] || 'the partner'} before booking. <Link href="/how-we-check-bathtubs" prefetch={false} className="text-[#b08d57] hover:underline font-medium">How we check</Link></>
                )}
              </p>
            </div>

            <div className="bg-[#f5f6f8] rounded-xl p-4 border border-[#e3e7ef]">
              <h3 className="font-bold text-sm sm:text-base text-[#14213d] mb-1.5">
                What is the booking tip for {hotel.name}?
              </h3>
              <p className="text-[#5b6478] leading-relaxed text-sm">
                {cleanTip || 'Check that the room you pick lists a bathtub before you book.'}
              </p>
            </div>
          </div>
        </div>

        {/* Internal navigation links */}
        <div className="bg-white rounded-2xl border border-[#e3e7ef] p-4 sm:p-5 mb-8 shadow-[0_4px_18px_rgba(0,0,0,0.03)]">
          <div className="space-y-2 text-center sm:text-left text-xs text-[#5b6478]">
            <Link
              href={`/${countrySlug}/${citySlug}`}
              prefetch={false}
              className="inline-flex items-center gap-1 font-semibold text-[#b08d57] hover:text-[#9c7b48] hover:underline transition-colors"
            >
              <span>&larr;</span> Explore all {cityName} bathtub hotels
            </Link>
            <div className="pt-2 border-t border-[#e3e7ef] flex items-center justify-center sm:justify-start gap-2.5 text-[11px] text-[#5b6478]">
              <Link href="/soaking-tub-hotels" prefetch={false} className="hover:text-[#b08d57] hover:underline">
                🛁 Top 50 Soaking Tubs
              </Link>
              <span>&bull;</span>
              <Link href="/hotels-with-hot-tub-in-room" prefetch={false} className="hover:text-[#b08d57] hover:underline">
                ♨️ In-Room Hot Tubs
              </Link>
            </div>
          </div>
        </div>

        {/* Similar Bathtub Hotels in the City */}
        {similarHotels.length > 0 && (
          <section className="pt-6 border-t border-[#e3e7ef]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-playfair text-xl sm:text-2xl font-semibold text-[#14213d] tracking-tight">
                  More rooms with a bathtub in {cityName}
                </h2>
                <p className="text-xs text-[#5b6478] mt-0.5">
                  Other hotels in {cityName} with an in-room bathtub.
                </p>
              </div>
              <Link 
                href={`/${countrySlug}/${citySlug}`}
                prefetch={false}
                className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-[#b08d57] hover:text-[#9c7b48] hover:underline"
              >
                <span>View all in {cityName}</span>
                <span>&rarr;</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {similarHotels.map((sim, idx) => {
                const simSlug = sim.slug || slugify(sim.name);
                const simUrl = `/${countrySlug}/${citySlug}/${simSlug}`;
                return (
                  <div
                    key={sim._id || idx}
                    className="bg-white rounded-2xl border border-[#e3e7ef] shadow-[0_4px_18px_rgba(0,0,0,0.04)] hover:shadow-md transition-all flex flex-col group overflow-hidden"
                  >
                    <Link href={simUrl} prefetch={false} className="block relative aspect-[4/3] w-full bg-[#f5f6f8] overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imageUrl(sim.image)}
                        alt={sim.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      />
                      <div className="absolute top-2.5 left-2.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs ${
                          isHotelConfirmed(sim)
                            ? 'bg-[#e3f2ee] text-[#1f6f5c]'
                            : 'bg-[#e3e7ef] text-[#5b6478]'
                        }`}>
                          {isHotelConfirmed(sim) && <span>✓</span>}
                          {getBathtubLabel(sim)}
                        </span>
                      </div>
                    </Link>

                    <div className="p-3.5 flex-1 flex flex-col justify-between">
                      <div>
                        <Link href={simUrl} prefetch={false} className="font-playfair font-semibold text-base text-[#14213d] group-hover:text-[#b08d57] transition-colors line-clamp-2 mb-1.5 leading-snug">
                          {sim.name}
                        </Link>
                        {sim.tubType && (
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#e9eef7] text-[#14213d] font-medium text-[10px] rounded-full mb-2">
                            <span>🛁</span> {sim.tubType}
                          </div>
                        )}
                      </div>

                      <div className="pt-2.5 border-t border-[#e3e7ef] flex items-center justify-end">
                        <Link
                          href={simUrl}
                          prefetch={false}
                          className="border-[1.5px] border-[#b08d57] text-[#b08d57] hover:bg-[#b08d57] hover:text-white font-bold text-xs rounded-[9px] px-3 py-1.5 transition-colors"
                        >
                          View room
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Disclaimer footer matching Style B mockup */}
        <div className="pt-8 pb-4 text-[11px] text-[#5b6478] leading-relaxed text-center">
          Prices change by date and are shown on each booking site. We may earn a commission when you book, at no extra cost to you.
        </div>
      </div>
    </>
  );
}
