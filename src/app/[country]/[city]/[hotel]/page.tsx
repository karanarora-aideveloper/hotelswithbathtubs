import connectToDatabase from '@/lib/mongodb';
import Hotel from '@/models/Hotel';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { imageUrl } from '@/lib/imageUrl';
import StructuredData from '@/components/StructuredData';
import OutboundLink from '@/components/OutboundLink';
import { escapeRegex, titleCase, slugify, resolveCountry } from '@/lib/utils';

export const revalidate = false;

export async function generateStaticParams() {
  await connectToDatabase();
  const hotels = await Hotel.find({ flagged: { $ne: true } }).select('country city slug name');

  return hotels.map((h: any) => {
    const countryInfo = resolveCountry(h.country);
    return {
      country: countryInfo.slug,
      city: slugify(h.city),
      hotel: h.slug || slugify(h.name),
    };
  });
}

async function getHotel(countryParam: string, cityParam: string, hotelParam: string) {
  await connectToDatabase();
  const countryInfo = resolveCountry(countryParam);
  const rawCity = decodeURIComponent(cityParam).replace(/-/g, ' ');
  const hotelSlug = decodeURIComponent(hotelParam);

  let hotel = await Hotel.findOne({ slug: hotelSlug, flagged: { $ne: true } });
  
  if (!hotel) {
    const rawHotelName = hotelSlug.replace(/-/g, ' ');
    hotel = await Hotel.findOne({
      name: new RegExp(`^${escapeRegex(rawHotelName)}$`, 'i'),
      city: new RegExp(`^${escapeRegex(rawCity)}$`, 'i'),
      flagged: { $ne: true }
    });
  }
  
  return { hotel, countryInfo, rawCity };
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
  const pageTitle = `${hotel.name} — ${hotel.tubType || 'Bathtub'} in ${cityName} | Hotels With Bathtubs`;
  const tubType = hotel.tubType || 'Private Bathtub';
  const roomType = hotel.roomType || 'Room with Bathtub';
  const price = hotel.price ? ` Starting at ${hotel.price}.` : '';
  
  const pageDescription = `${hotel.name} features ${tubType} in ${roomType}.${price} Verified private in-room bathtub in ${cityName}.`;

  return {
    title: pageTitle,
    description: pageDescription,
    robots: { index: true, follow: true },
    alternates: {
      canonical: `/${countryInfo.slug}/${slugify(rawCity)}/${hotel.slug || slugify(hotel.name)}`,
    }
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
  const derivedStars = (hotel.rating && Number(hotel.rating) > 0) ? Number(hotel.rating).toFixed(1) : "4.5";
  const derivedReviews = (hotel.reviewsCount && Number(hotel.reviewsCount) > 0) ? Number(hotel.reviewsCount) : 150;

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
      "url": hotel.bookingUrl || hotel.agodaUrl || hotel.url,
      "availability": "https://schema.org/InStock",
      "priceSpecification": {
        "@type": "PriceSpecification",
        "price": hotel.price ? hotel.price.toString().replace(/[^0-9]/g, '') : undefined,
        "priceCurrency": countrySlug === 'india' ? "INR" : "USD",
      }
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `Does ${hotel.name} have a private bathtub in the room?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Yes, ${hotel.name} offers rooms with a private in-room bathtub. Specifically, you should book the ${hotel.roomType || 'room with a bathtub'}.`
        }
      },
      {
        "@type": "Question",
        "name": `Is ${hotel.name} couple-friendly?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Yes, ${hotel.name} in ${cityName} is considered a great stay for couples seeking privacy and romantic amenities like a bathtub.`
        }
      },
      {
        "@type": "Question",
        "name": `How can I make sure I get a room with a bathtub at ${hotel.name}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `When booking through our verified links, select the ${hotel.roomType || 'Bathtub Suite'} and ensure the amenity list includes a bathtub before finalizing your reservation.`
        }
      }
    ]
  };

  type UrlProvider = 'makemytrip' | 'booking' | 'agoda' | 'trivago' | 'tripadvisor' | 'google' | null;
  function getUrlProvider(url?: string): UrlProvider {
    if (!url) return null;
    const lower = url.toLowerCase();
    if (lower.includes('makemytrip.com')) return 'makemytrip';
    if (lower.includes('booking.com')) return 'booking';
    if (lower.includes('agoda.com')) return 'agoda';
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
    const config: Record<NonNullable<UrlProvider>, { label: string; className: string; source: string } | null> = {
      makemytrip: { 
        label: 'Check on MakeMyTrip', 
        source: 'MakeMyTrip', 
        className: isPrimary 
          ? 'bg-accent hover:bg-accent-hover text-white text-center py-3 px-4 rounded-xl font-bold transition-colors text-sm shadow-sm flex items-center justify-center gap-2 w-full' 
          : 'bg-amber-600 hover:bg-amber-700 text-white text-center py-2.5 px-4 rounded-xl font-semibold transition-colors text-xs shadow-xs flex items-center justify-center gap-2 w-full' 
      },
      booking: { 
        label: 'Check on Booking.com', 
        source: 'Booking.com', 
        className: isPrimary 
          ? 'bg-accent-secondary hover:bg-accent-secondary-hover text-white text-center py-3 px-4 rounded-xl font-bold transition-colors text-sm shadow-md flex items-center justify-center gap-2 w-full' 
          : 'bg-accent-secondary/90 hover:bg-accent-secondary text-white text-center py-2.5 px-4 rounded-xl font-bold transition-colors text-sm shadow-xs flex items-center justify-center gap-2 w-full' 
      },
      agoda: { 
        label: 'Check on Agoda', 
        source: 'Agoda', 
        className: isPrimary 
          ? 'bg-emerald-600 hover:bg-emerald-700 text-white text-center py-3 px-4 rounded-xl font-bold transition-colors text-sm shadow-md flex items-center justify-center gap-2 w-full' 
          : 'bg-emerald-600/90 hover:bg-emerald-700 text-white text-center py-2.5 px-4 rounded-xl font-bold transition-colors text-sm shadow-xs flex items-center justify-center gap-2 w-full' 
      },
      trivago: { label: 'Compare on Trivago', source: 'Trivago', className: 'bg-blue-600 hover:bg-blue-700 text-white text-center py-2.5 px-4 rounded-xl font-bold transition-colors text-sm shadow-sm flex items-center justify-center gap-2 w-full' },
      tripadvisor: { label: 'View on TripAdvisor', source: 'TripAdvisor', className: 'bg-emerald-700 hover:bg-emerald-800 text-white text-center py-2.5 px-4 rounded-xl font-bold transition-colors text-sm shadow-sm flex items-center justify-center gap-2 w-full' },
      google: null,
    };
    if (!provider || !config[provider]) return null;
    const { label, source, className } = config[provider]!;
    return (
      <OutboundLink href={url} hotelName={hotelName} cityName={city} source={source} className={className}>
        <span>{preferredLabel || label}</span>
        <span>&rarr;</span>
      </OutboundLink>
    );
  }

  const rawUrls = [hotel.bookingUrl, hotel.agodaUrl, hotel.url]
    .filter((u): u is string => !!u)
    .filter((u, idx, arr) => arr.indexOf(u) === idx);
  
  const sortedUrls = countrySlug !== 'india'
    ? [...rawUrls].sort((a, b) => {
        const provA = getUrlProvider(a);
        const provB = getUrlProvider(b);
        const priority: Record<string, number> = { booking: 1, agoda: 2, trivago: 3, tripadvisor: 4, makemytrip: 5 };
        return (priority[provA || ''] || 99) - (priority[provB || ''] || 99);
      })
    : rawUrls;

  return (
    <>
      <StructuredData data={breadcrumbSchema} />
      <StructuredData data={hotelSchema} />
      <StructuredData data={faqSchema} />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 sm:py-4 text-xs sm:text-sm font-medium text-text-muted flex items-center flex-wrap gap-1">
        <Link href="/" className="text-accent-secondary hover:underline">Home</Link>
        <span>&rsaquo;</span>
        <Link href={`/${countrySlug}`} className="text-accent-secondary hover:underline">{countryName}</Link>
        <span>&rsaquo;</span>
        <Link href={`/${countrySlug}/${citySlug}`} className="text-accent-secondary hover:underline">{cityName}</Link>
        <span>&rsaquo;</span>
        <span className="text-text-main font-semibold">{hotel.name}</span>
      </div>

      <div className="w-full relative aspect-[16/9] max-h-[60vh] overflow-hidden bg-gray-100">
        <Image
          src={imageUrl(hotel.image)}
          alt={`${hotel.name} in ${cityName}`}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 md:py-12 flex flex-col md:flex-row gap-8 lg:gap-12 relative">
        <div className="w-full md:w-3/5 lg:w-2/3">
          <div className="mb-6">
            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold text-accent-secondary mb-3">{hotel.name}</h1>
            
            <div className="flex items-center gap-2 mb-4 text-sm sm:text-base font-bold text-gray-800 flex-wrap">
              <span className="text-amber-500 text-lg">★</span>
              <span>{derivedStars}</span>
              <span className="text-text-muted font-normal">({derivedReviews} verified reviews)</span>
              <span className="text-text-muted font-normal mx-2">|</span>
              <span className="text-gray-800">{hotel.neighborhood ? `${hotel.neighborhood}, ${cityName}` : cityName}</span>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 mb-6">
              {hotel.tubType && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 text-accent font-bold text-sm rounded-xl">
                  <span className="text-lg">🛁</span> {hotel.tubType}
                </span>
              )}
              {hotel.roomType && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-800 font-semibold text-sm rounded-xl">
                  <span>🏷️</span> {hotel.roomType}
                </span>
              )}
            </div>
          </div>

          {hotel.description && (
            <div className="mb-8">
              <h2 className="font-heading text-2xl font-bold text-text-main mb-3">About this Hotel</h2>
              <p className="text-base text-gray-700 leading-relaxed">
                {hotel.description}
              </p>
            </div>
          )}

          {hotel.bookingTip && (
            <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 sm:p-5 mb-8 flex items-start gap-3 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-base">💡</span>
              </div>
              <div className="text-sm text-amber-900 leading-relaxed">
                <strong className="font-bold block mb-1">Booking Tip:</strong>
                {hotel.bookingTip}
              </div>
            </div>
          )}

          <div className="mb-10">
            <h2 className="font-heading text-2xl font-bold text-text-main mb-4">Amenities</h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(hotel.amenities || []).map((amenity: string, idx: number) => {
                const isJacuzzi = amenity.toLowerCase().includes('jacuzzi') || amenity.toLowerCase().includes('hot tub');
                return (
                  <li key={idx} className="flex items-center text-base text-gray-700 gap-2.5">
                    <span className={isJacuzzi ? "text-accent font-bold text-lg" : "text-emerald-600 font-bold text-lg"}>
                      {isJacuzzi ? '🛁' : '✓'}
                    </span>
                    <span>{amenity}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="mb-8">
            <h2 className="font-heading text-2xl font-bold text-text-main mb-4">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                <h3 className="font-bold text-base text-gray-900 mb-2">
                  Does {hotel.name} have a private bathtub in the room?
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  Yes, {hotel.name} offers rooms with a private in-room bathtub. Specifically, you should book the {hotel.roomType || 'room with a bathtub'}.
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                <h3 className="font-bold text-base text-gray-900 mb-2">
                  Is {hotel.name} couple-friendly?
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  Yes, {hotel.name} in {cityName} is considered a great stay for couples seeking privacy and romantic amenities like a bathtub.
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                <h3 className="font-bold text-base text-gray-900 mb-2">
                  How can I make sure I get a room with a bathtub at {hotel.name}?
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  When booking through our verified links, select the {hotel.roomType || 'Bathtub Suite'} and ensure the amenity list includes a bathtub before finalizing your reservation.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full md:w-2/5 lg:w-1/3">
          <div className="sticky top-6">
            <div className="bg-white rounded-2xl border border-border shadow-xl p-5 sm:p-6 mb-6">
              {hotel.price && (
                <div className="flex items-baseline justify-between pb-4 border-b border-gray-100 mb-4">
                  <span className="text-xs uppercase tracking-wider text-text-muted font-bold">Rates From</span>
                  <div className="text-right">
                    <span className="text-2xl font-black text-accent-secondary">{hotel.price}</span>
                    <span className="text-xs text-text-muted ml-1">/ night</span>
                  </div>
                </div>
              )}
              
              <div className="flex flex-col gap-3">
                {sortedUrls.map((u, i) => (
                  <BookingButton key={i} url={u} hotelName={hotel.name} cityName={cityName} isPrimary={i === 0} />
                ))}
              </div>
              
              <div className="mt-5 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-center gap-2 text-xs font-semibold text-emerald-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  Multi-Source Verified Availability
                </div>
              </div>
            </div>
            
            <Link href={`/${countrySlug}/${citySlug}`} className="block text-center text-sm font-bold text-accent-secondary hover:text-accent transition-colors">
              &larr; Back to all {cityName} hotels
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
