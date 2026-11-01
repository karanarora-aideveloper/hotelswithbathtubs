'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useGeo } from '@/lib/useGeo';
import { useMounted, FavoriteButton } from '@/components/Favorites';
import { getCountryDisplayName, getFlagEmoji } from '@/lib/countries';
import CountrySelector from '@/components/CountrySelector';
import HotelCardImage from '@/components/HotelCardImage';
import OutboundLink from '@/components/OutboundLink';
import { slugify } from '@/lib/utils';

export type CoupleHotel = {
  id: string;
  name: string;
  city: string;
  country: string;
  image: string;
  url: string;
  tubLabel: string;
  confirmed: boolean;
  roomType?: string;
  partners: Array<{ partner: string; url: string }>;
};

// Compact representation to keep payload strictly under 300 KB:
// [id, name, city, country, image, slug, tubIdx, confirmed, roomType, [[partner, url], ...]]
export type CompactHotel = [
  string,
  string,
  string,
  string,
  string,
  string,
  number,
  number,
  string,
  Array<[string, string]>
];

const TUB_LABELS = ['bathtub', 'jetted tub', 'hot tub'];

function expandUrl(u: string): string {
  return u
    .replace('^bh/', 'https://www.booking.com/hotel/')
    .replace('^b', 'https://www.booking.com')
    .replace('^a', 'https://www.agoda.com')
    .replace('^m', 'https://www.makemytrip.com')
    .replace('^ar/', 'https://www.airbnb.com/rooms/')
    .replace('^r', 'https://www.airbnb.com')
    .replace('^t', 'https://www.trip.com')
    .replace('^aid', '?aid=304142');
}

function expandHotel(ch: CompactHotel): CoupleHotel {
  const [id, name, city, country, image, slug, tubIdx, confirmed, roomType, partners] = ch;
  const countrySlug = slugify(country);
  const citySlug = slugify(city);
  return {
    id,
    name,
    city,
    country,
    image,
    url: `/${countrySlug}/${citySlug}/${slug}`,
    tubLabel: TUB_LABELS[tubIdx] || 'bathtub',
    confirmed: Boolean(confirmed),
    roomType,
    partners: partners.map(([p, u]) => ({ partner: p, url: expandUrl(u) })),
  };
}

interface CoupleFriendlyHotelsClientProps {
  countryHotelsData: Record<string, CompactHotel[]>;
  initialHotels: CoupleHotel[];
}

export default function CoupleFriendlyHotelsClient({
  countryHotelsData,
  initialHotels,
}: CoupleFriendlyHotelsClientProps) {
  const { geo } = useGeo();
  const mounted = useMounted();
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  const hasCountryList = Boolean(
    mounted &&
      geo.countryCode &&
      countryHotelsData[geo.countryCode] &&
      countryHotelsData[geo.countryCode].length > 0
  );

  const activeHotels = useMemo(() => {
    if (hasCountryList && geo.countryCode && countryHotelsData[geo.countryCode]) {
      return countryHotelsData[geo.countryCode].map(expandHotel);
    }
    return initialHotels;
  }, [hasCountryList, geo.countryCode, countryHotelsData, initialHotels]);

  const currentCountryName = hasCountryList
    ? getCountryDisplayName(geo.countryCode) || geo.countryCode
    : '';
  const currentFlag = hasCountryList ? getFlagEmoji(geo.countryCode) : '';

  return (
    <div>
      {/* Country Modal Dialog */}
      <CountrySelector
        variant="modal"
        isOpen={isSelectorOpen}
        onOpenChange={setIsSelectorOpen}
      />

      {/* Header and Switch Line */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 pb-6 border-b border-[#e3e7ef]">
        <div>
          <div
            id="country-switch-line"
            className="text-sm sm:text-base text-[#5b6478] font-medium flex items-center gap-1.5 mb-2"
          >
            <span>
              {hasCountryList
                ? `Showing ${currentFlag} ${currentCountryName} · `
                : 'Showing all countries · '}
            </span>
            <button
              type="button"
              onClick={() => setIsSelectorOpen(true)}
              className="text-[#1a6fde] hover:underline font-semibold cursor-pointer inline-flex items-center"
            >
              Change
            </button>
          </div>
          <h2 className="font-playfair text-2xl sm:text-3xl lg:text-4xl font-bold text-[#14213d] tracking-tight">
            {hasCountryList
              ? `Romantic stays with a tub in the room in ${currentCountryName}`
              : 'Romantic stays with a tub in the room'}
          </h2>
        </div>
        <p className="text-xs text-[#5b6478] max-w-sm">
          Rooms catalogued with a private bathtub, jetted tub, or hot tub in the room or suite.
        </p>
      </div>

      {/* Hotel Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {activeHotels.map((h, i) => {
          const countrySlug = slugify(h.country);
          const citySlug = slugify(h.city);

          return (
            <div
              key={h.id || i}
              data-hotel-card="true"
              data-hotel-name={h.name}
              data-hotel-position={i + 1}
              className="bg-white rounded-2xl border border-[#e3e7ef] shadow-[0_4px_18px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col group transition-all"
            >
              {/* Photo with Badge and Favorite icon */}
              <HotelCardImage
                primaryImage={h.image}
                hotelName={h.name}
                cityName={h.city}
                countryName={h.country}
                tubType={h.tubLabel}
                priority={i < 2}
                className="relative h-[200px] w-full bg-[#f5f6f8] shrink-0 overflow-hidden group/image"
              >
                {/* Badge: Green when confirmed, muted grey when reported */}
                {h.confirmed ? (
                  <span className="absolute left-3 top-3 z-10 bg-[#e3f2ee] text-[#1f6f5c] text-[11px] font-bold px-2.5 py-1.5 rounded-full shadow-xs pointer-events-none">
                    ✓ Tub proven · Booking.com
                  </span>
                ) : (
                  <span className="absolute left-3 top-3 z-10 bg-[#e3e7ef] text-[#5b6478] text-[11px] font-bold px-2.5 py-1.5 rounded-full shadow-xs pointer-events-none">
                    Reported, not yet confirmed
                  </span>
                )}

                {/* Favorite button */}
                <div
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  className="absolute right-3 top-3 z-10 w-[34px] h-[34px] rounded-full bg-white/92 backdrop-blur-xs flex items-center justify-center shadow-xs"
                >
                  <FavoriteButton
                    hotel={{
                      _id: h.id,
                      name: h.name,
                      city: h.city,
                      country: h.country,
                      image: h.image,
                      tubType: h.tubLabel,
                      countrySlug,
                      citySlug,
                    }}
                    className="w-full h-full flex items-center justify-center cursor-pointer"
                  />
                </div>
              </HotelCardImage>

              {/* Card Body */}
              <div className="p-4 flex flex-col flex-grow">
                {/* Hotel Name */}
                <Link href={h.url} prefetch={false} className="group/link mb-1">
                  <h3 className="font-playfair text-[20px] sm:text-[22px] font-semibold text-[#14213d] leading-[1.15] line-clamp-2 group-hover/link:text-[#b08d57] transition-colors">
                    {h.name}
                  </h3>
                </Link>

                {/* Location */}
                <div className="text-[12px] text-[#5b6478] mt-1 mb-2.5 line-clamp-1">
                  {h.city}, {h.country}
                </div>

                {/* Room Box */}
                <div className="text-[13px] leading-[1.45] bg-[#e9eef7] text-[#14213d] rounded-[10px] p-[9px_11px] mb-3">
                  {h.confirmed ? (
                    h.roomType ? (
                      <>
                        Book the <strong className="font-bold">{h.roomType}</strong> for an in-room {h.tubLabel}
                      </>
                    ) : (
                      <>
                        In-room <strong className="font-bold">{h.tubLabel}</strong>
                      </>
                    )
                  ) : (
                    h.roomType ? (
                      <>
                        Reported room: <strong className="font-bold">{h.roomType}</strong>. Check room details before booking.
                      </>
                    ) : (
                      <>A bathtub is reported; check room details before booking.</>
                    )
                  )}
                </div>

                {/* Booking partner direct buttons & Compare all link */}
                <div className="mt-auto pt-2 flex flex-col gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {h.partners.slice(0, 3).map((p) => (
                      <OutboundLink
                        key={p.partner}
                        href={p.url}
                        source={p.partner}
                        hotelName={h.name}
                        cityName={h.city}
                        className="inline-flex items-center justify-center border-[1.5px] border-[#b08d57] text-[#b08d57] hover:bg-[#b08d57] hover:text-white rounded-[9px] px-2.5 sm:px-3 py-1.5 font-bold text-[11px] sm:text-xs transition-colors whitespace-nowrap text-center"
                      >
                        {p.partner} ›
                      </OutboundLink>
                    ))}
                  </div>
                  <Link
                    href={h.url}
                    prefetch={false}
                    className="text-[11px] font-semibold text-[#5b6478] hover:text-[#b08d57] transition-colors inline-flex items-center gap-1 self-start pt-0.5"
                  >
                    Compare all ›
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
