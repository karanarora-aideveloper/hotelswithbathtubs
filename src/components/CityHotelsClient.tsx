'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import OutboundLink from '@/components/OutboundLink';
import { imageUrl } from '@/lib/imageUrl';

type HotelData = {
  _id?: string;
  name: string;
  city: string;
  country: string;
  image: string;
  url?: string;
  agodaUrl?: string;
  bookingUrl?: string;
  amenities: string[];
  description?: string;
  rating?: number;
  reviewsCount?: number;
  roomType?: string;
  tubType?: string;
  bookingTip?: string;
};

const DEFAULT_HOTEL_IMAGE = 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp';

function HotelCardImage({
  src,
  alt,
  priority,
}: {
  src: string;
  alt: string;
  priority: boolean;
}) {
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill
      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
      className="object-cover group-hover:scale-105 transition-transform duration-500"
      loading={priority ? undefined : 'lazy'}
      priority={priority}
      onError={() => {
        if (imgSrc !== DEFAULT_HOTEL_IMAGE) {
          setImgSrc(DEFAULT_HOTEL_IMAGE);
        }
      }}
    />
  );
}

export default function CityHotelsClient({
  hotels,
  cityName,
  countryName,
}: {
  hotels: HotelData[];
  cityName: string;
  countryName: string;
}) {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'jacuzzi' | 'soaking' | 'tripled'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Deduplicate hotels by URL signature (same hotel added multiple times to DB)
  const uniqueHotels = useMemo(() => {
    const seen = new Set<string>();
    return hotels.filter((h) => {
      const key = [h.url, h.agodaUrl, h.bookingUrl, h.name].filter(Boolean).join('|');
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [hotels]);

  // Counts for filter badges
  const counts = useMemo(() => {
    const jacuzzi = uniqueHotels.filter((h) =>
      h.amenities?.some((a) => a.toLowerCase().includes('jacuzzi') || a.toLowerCase().includes('hot tub'))
    ).length;

    const soaking = uniqueHotels.filter((h) =>
      h.amenities?.some((a) => a.toLowerCase().includes('bathtub') && !a.toLowerCase().includes('jacuzzi'))
    ).length;

    const tripled = uniqueHotels.filter((h) => h.url && (h.agodaUrl || h.bookingUrl)).length;

    return { all: uniqueHotels.length, jacuzzi, soaking, tripled };
  }, [uniqueHotels]);

  // Filtered hotels list
  const filteredHotels = useMemo(() => {
    return uniqueHotels.filter((h) => {
      // Text search filter
      if (searchTerm.trim()) {
        const matchesName = h.name.toLowerCase().includes(searchTerm.trim().toLowerCase());
        const matchesAmenity = h.amenities?.some((a) =>
          a.toLowerCase().includes(searchTerm.trim().toLowerCase())
        );
        if (!matchesName && !matchesAmenity) return false;
      }

      // Category filter
      if (selectedFilter === 'jacuzzi') {
        return h.amenities?.some(
          (a) => a.toLowerCase().includes('jacuzzi') || a.toLowerCase().includes('hot tub')
        );
      }
      if (selectedFilter === 'soaking') {
        return h.amenities?.some(
          (a) => a.toLowerCase().includes('bathtub') && !a.toLowerCase().includes('jacuzzi')
        );
      }
      if (selectedFilter === 'tripled') {
        return h.url && (h.agodaUrl || h.bookingUrl);
      }

      return true;
    });
  }, [uniqueHotels, selectedFilter, searchTerm]);

  // Detect what kind of URL is stored in any booking field
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

  // Render the right button for any booking URL
  function BookingButton({ url, hotelName, cityName: city, preferredLabel }: {
    url: string;
    hotelName: string;
    cityName: string;
    preferredLabel?: string;
  }) {
    const provider = getUrlProvider(url);
    const config: Record<NonNullable<UrlProvider>, { label: string; className: string; source: string } | null> = {
      makemytrip: { label: 'Check on MakeMyTrip', source: 'MakeMyTrip', className: 'bg-accent hover:bg-accent-hover text-white text-center py-3 px-4 rounded-xl font-bold transition-colors text-sm shadow-sm flex items-center justify-center gap-2' },
      booking:    { label: 'Check on Booking.com', source: 'Booking.com', className: 'bg-accent-secondary hover:bg-accent-secondary-hover text-white text-center py-2.5 px-4 rounded-xl font-bold transition-colors text-sm shadow-sm flex items-center justify-center gap-2' },
      agoda:      { label: 'Check on Agoda', source: 'Agoda', className: 'bg-emerald-600 hover:bg-emerald-700 text-white text-center py-2.5 px-4 rounded-xl font-bold transition-colors text-sm shadow-sm flex items-center justify-center gap-2' },
      trivago:    { label: 'Compare on Trivago', source: 'Trivago', className: 'bg-blue-600 hover:bg-blue-700 text-white text-center py-2.5 px-4 rounded-xl font-bold transition-colors text-sm shadow-sm flex items-center justify-center gap-2' },
      tripadvisor:{ label: 'View on TripAdvisor', source: 'TripAdvisor', className: 'bg-emerald-700 hover:bg-emerald-800 text-white text-center py-2.5 px-4 rounded-xl font-bold transition-colors text-sm shadow-sm flex items-center justify-center gap-2' },
      google:     null, // don't show Google search links as booking buttons
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

  return (
    <div>
      {/* Interactive Bathtub & Feature Filters */}
      <div className="bg-white border border-border rounded-2xl p-4 sm:p-5 shadow-2xs mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          <span className="text-xs font-bold text-text-muted uppercase tracking-wider hidden lg:inline mr-1">
            Filter Tubs:
          </span>
          <button
            onClick={() => setSelectedFilter('all')}
            aria-pressed={selectedFilter === 'all'}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 ${
              selectedFilter === 'all'
                ? 'bg-accent-secondary text-white shadow-sm'
                : 'bg-gray-100 text-text-main hover:bg-gray-200'
            }`}
          >
            <span>All Tubs</span>
            <span className={`px-1.5 py-0.5 rounded-full text-2xs ${selectedFilter === 'all' ? 'bg-white/20' : 'bg-gray-200'}`}>
              {counts.all}
            </span>
          </button>

          {counts.jacuzzi > 0 && (
            <button
              onClick={() => setSelectedFilter('jacuzzi')}
              aria-pressed={selectedFilter === 'jacuzzi'}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 ${
                selectedFilter === 'jacuzzi'
                  ? 'bg-accent text-white shadow-sm'
                  : 'bg-gray-100 text-text-main hover:bg-gray-200'
              }`}
            >
              <span>🛁 In-Room Jacuzzi</span>
              <span className={`px-1.5 py-0.5 rounded-full text-2xs ${selectedFilter === 'jacuzzi' ? 'bg-white/20' : 'bg-gray-200'}`}>
                {counts.jacuzzi}
              </span>
            </button>
          )}

          {counts.soaking > 0 && (
            <button
              onClick={() => setSelectedFilter('soaking')}
              aria-pressed={selectedFilter === 'soaking'}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 ${
                selectedFilter === 'soaking'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-gray-100 text-text-main hover:bg-gray-200'
              }`}
            >
              <span>✨ Deep Soaking Tubs</span>
              <span className={`px-1.5 py-0.5 rounded-full text-2xs ${selectedFilter === 'soaking' ? 'bg-white/20' : 'bg-gray-200'}`}>
                {counts.soaking}
              </span>
            </button>
          )}

          {counts.tripled > 0 && (
            <button
              onClick={() => setSelectedFilter('tripled')}
              aria-pressed={selectedFilter === 'tripled'}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 ${
                selectedFilter === 'tripled'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-gray-100 text-text-main hover:bg-gray-200'
              }`}
            >
              <span>✓ Multi-Platform Verified</span>
              <span className={`px-1.5 py-0.5 rounded-full text-2xs ${selectedFilter === 'tripled' ? 'bg-white/20' : 'bg-gray-200'}`}>
                {counts.tripled}
              </span>
            </button>
          )}
        </div>

        {/* Quick Hotel Name / Amenity Search */}
        <div className="w-full md:w-64 relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search hotel name..."
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-text-main placeholder-text-muted focus:outline-hidden focus:border-accent focus:bg-white transition-all"
          />
          <svg
            className="w-4 h-4 text-text-muted absolute left-3 top-2.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-2.5 text-xs text-text-muted hover:text-text-main"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Booking Verification Tip Banner */}
      <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 sm:p-5 mb-8 flex items-start gap-3 shadow-2xs">
        <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-base">💡</span>
        </div>
        <div className="text-xs sm:text-sm text-amber-900 leading-relaxed">
          <strong className="font-bold block mb-0.5">Booking Tip for {cityName} Bathtub Suites:</strong>
          When selecting your room on MakeMyTrip, Agoda, or Booking.com, ensure your chosen room tier (such as <em>Executive Suite</em> or <em>Deluxe Room with Jacuzzi</em>) explicitly lists the bathtub amenity before confirming.
        </div>
      </div>

      {/* Hotel Cards Grid */}
      {filteredHotels.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredHotels.map((h, i) => {
            const providerLabel: Record<NonNullable<UrlProvider>, string> = {
              makemytrip: 'MakeMyTrip', booking: 'Booking.com', agoda: 'Agoda',
              trivago: 'Trivago', tripadvisor: 'TripAdvisor', google: '',
            };
            const verifiedSources = [
              ...(h.url ? [providerLabel[getUrlProvider(h.url) ?? 'google']].filter(Boolean) : []),
              ...(h.agodaUrl ? [providerLabel[getUrlProvider(h.agodaUrl) ?? 'google']].filter(Boolean) : []),
              ...(h.bookingUrl ? [providerLabel[getUrlProvider(h.bookingUrl) ?? 'google']].filter(Boolean) : []),
            ].filter((v, i, a) => a.indexOf(v) === i); // dedupe

            return (
              <div
                key={h._id || i}
                className="bg-white rounded-2xl overflow-hidden border border-border shadow-sm hover:-translate-y-1.5 hover:shadow-xl hover:border-gray-300 transition-all flex flex-col group"
              >
                <div className="relative overflow-hidden aspect-[16/10]">
                  <HotelCardImage
                    src={imageUrl(h.image)}
                    alt={`${h.name} - Hotel with Bathtub in ${cityName}`}
                    priority={i < 2}
                  />
                  <span className="absolute top-4 left-4 bg-emerald-700/95 backdrop-blur-xs text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300"></span>
                    <span>✓ Verified on {verifiedSources.join(', ')}</span>
                  </span>
                </div>

                <div className="p-6 flex flex-col flex-grow">
                  <h2 className="font-heading text-xl font-bold text-accent-secondary mb-1">{h.name}</h2>
                  {h.rating && h.reviewsCount && (
                    <div className="flex items-center gap-1.5 mb-2 text-sm font-bold text-gray-800">
                      <span className="text-amber-500 text-base">★</span>
                      <span>{h.rating}</span>
                      <span className="text-text-muted text-xs font-normal">({h.reviewsCount} verified reviews)</span>
                    </div>
                  )}
                  <p className="text-sm text-text-muted font-medium mb-3 flex items-center gap-1">
                    <svg className="w-4 h-4 text-accent flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                    <span>{cityName}, {countryName}</span>
                  </p>

                  {/* Room Category & Tub Badges */}
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    {h.tubType && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-accent/10 text-accent font-bold text-2xs rounded-lg">
                        <span>🛁</span> {h.tubType}
                      </span>
                    )}
                    {h.roomType && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-800 font-semibold text-2xs rounded-lg">
                        <span>🏷️</span> {h.roomType}
                      </span>
                    )}
                  </div>

                  {h.description && (
                    <p className="text-xs text-text-muted mb-3 line-clamp-2 leading-relaxed">
                      {h.description}
                    </p>
                  )}

                  {/* Dynamic Hotel Booking Tip */}
                  {h.bookingTip && (
                    <div className="bg-amber-50/90 border border-amber-200/80 rounded-xl p-2.5 mb-4 text-2xs text-amber-900 leading-relaxed flex items-start gap-1.5">
                      <span className="flex-shrink-0 text-xs">💡</span>
                      <span><strong>Tip:</strong> {h.bookingTip}</span>
                    </div>
                  )}

                  <ul className="mt-auto border-t border-border pt-4 mb-6 space-y-2">
                    {h.amenities.map((amenity: string, idx: number) => {
                      const isJacuzzi = amenity.toLowerCase().includes('jacuzzi') || amenity.toLowerCase().includes('hot tub');
                      return (
                        <li key={idx} className="flex items-center text-sm font-semibold text-text-main gap-2">
                          <span className={isJacuzzi ? "text-accent font-bold" : "text-emerald-600 font-bold"}>
                            {isJacuzzi ? '🛁' : '✓'}
                          </span>
                          <span>{amenity}</span>
                        </li>
                      );
                    })}
                  </ul>

                  <div className="flex flex-col gap-2">
                    {[h.url, h.agodaUrl, h.bookingUrl]
                      .filter((u): u is string => !!u)
                      .filter((u, idx, arr) => arr.indexOf(u) === idx)
                      .map((u, i) => <BookingButton key={i} url={u} hotelName={h.name} cityName={cityName} />)
                    }
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-border rounded-2xl p-12 text-center max-w-lg mx-auto">
          <p className="text-3xl mb-3">🛁</p>
          <h3 className="font-heading text-lg font-bold text-accent-secondary mb-2">
            No hotels match your filter
          </h3>
          <p className="text-xs text-text-muted mb-4">
            Try resetting your bathtub filter or clearing the search keyword.
          </p>
          <button
            onClick={() => {
              setSelectedFilter('all');
              setSearchTerm('');
            }}
            className="px-4 py-2 bg-accent text-white font-bold rounded-xl text-xs shadow-sm hover:bg-accent-hover transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
