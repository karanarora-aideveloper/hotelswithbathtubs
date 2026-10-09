'use client';

import { useState } from 'react';
import Link from 'next/link';
import ProgressiveImage from '@/components/ProgressiveImage';
import { resolveCountry, slugify } from '@/lib/utils';

interface CityCardProps {
  city: string;
  country: string;
  hotelCount: number;
  image: string;
  isInternational?: boolean;
  priority?: boolean;
  minPrice?: string;
  rating?: number;
  totalReviews?: number;
  hasJacuzzi?: boolean;
}

export function getCountryFlag(country: string): string {
  const c = country.toLowerCase().trim();
  if (c === 'india') return '🇮🇳';
  if (c === 'usa' || c === 'united states') return '🇺🇸';
  if (c === 'uk' || c === 'united kingdom' || c === 'england') return '🇬🇧';
  if (c === 'france') return '🇫🇷';
  if (c === 'greece') return '🇬🇷';
  if (c === 'japan') return '🇯🇵';
  if (c === 'uae' || c === 'united arab emirates' || c === 'dubai') return '🇦🇪';
  if (c === 'singapore') return '🇸🇬';
  if (c === 'italy') return '🇮🇹';
  if (c === 'thailand') return '🇹🇭';
  if (c === 'indonesia' || c === 'bali') return '🇮🇩';
  if (c === 'maldives') return '🇲🇻';
  if (c === 'switzerland') return '🇨🇭';
  if (c === 'spain') return '🇪🇸';
  if (c === 'australia') return '🇦🇺';
  if (c === 'canada') return '🇨🇦';
  if (c === 'germany') return '🇩🇪';
  if (c === 'turkey') return '🇹🇷';
  if (c === 'mexico') return '🇲🇽';
  if (c === 'netherlands') return '🇳🇱';
  return '📍';
}

export default function CityCard({
  city,
  country,
  hotelCount,
  image,
  isInternational = false,
  priority = false,
  minPrice,
  rating = 4.8,
  totalReviews = 0,
  hasJacuzzi = false,
}: CityCardProps) {
  const [clicked, setClicked] = useState(false);

  const countrySlug = resolveCountry(country).slug;
  const citySlug = slugify(city);
  const targetUrl = `/${countrySlug}/${citySlug}`;
  const flag = getCountryFlag(country);

  const handleClick = () => {
    setClicked(true);
    // Auto-reset clicked state after 4 seconds in case user presses back button
    setTimeout(() => setClicked(false), 4000);
  };

  const reviewsFormatted = totalReviews > 0
    ? totalReviews >= 1000
      ? `${(totalReviews / 1000).toFixed(1)}k+ guest reviews`
      : `${totalReviews} guest reviews`
    : 'Triple-verified stays';

  const defaultPrice = country.toLowerCase() === 'india' ? 'From ₹2,499' : 'From $149';
  const displayPrice = minPrice ? (minPrice.startsWith('From') ? minPrice : `From ${minPrice}`) : defaultPrice;

  return (
    <Link
      href={targetUrl}
      prefetch={false}
      onClick={handleClick}
      style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 400px' }}
      className={`relative overflow-hidden rounded-2xl border border-gray-200/80 shadow-md transition-all duration-300 flex flex-col group text-left cursor-pointer bg-gray-900 aspect-[3/4] sm:aspect-[4/5] min-h-[360px] ${
        clicked
          ? 'ring-2 ring-[#1a6fde] border-[#1a6fde] shadow-lg opacity-90 scale-[0.99]'
          : 'hover:-translate-y-1.5 hover:shadow-2xl hover:border-[#1a6fde]'
      }`}
    >
      {/* Background Image with Zoom Effect */}
      <ProgressiveImage
        src={image}
        alt={`Hotels with private bathtubs in ${city}, ${country}`}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700 ease-out"
        priority={priority}
      />

      {/* Multi-Stop Gradient Vignettes for Perfect Legibility */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/75 via-black/35 to-transparent z-[1] pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/95 via-black/60 to-transparent z-[1] pointer-events-none" />

      {/* Top Floating Glassmorphic Badges */}
      <div className="relative z-[2] p-3.5 sm:p-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/45 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold shadow-xs">
          <span>{flag}</span>
          <span className="line-clamp-1">{country}</span>
        </div>

        <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-[11px] font-extrabold shadow-xs whitespace-nowrap">
          <span className="text-[10px] text-white/80 font-normal">from</span>
          <span>{displayPrice.replace('From ', '')}</span>
          <span className="text-[9px] text-white/70 font-normal">/nt</span>
        </div>
      </div>

      {/* Spacer to push content to bottom */}
      <div className="flex-1 z-[2]" />

      {/* Bottom Overlaid Information */}
      <div className="relative z-[2] p-4 sm:p-5 flex flex-col gap-2">
        {/* Verification & Tub Type Badges */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-emerald-500/90 backdrop-blur-xs text-white border border-emerald-400/40 shadow-xs">
            <span className="font-black">✓</span>
            <span>{hotelCount} Verified Tubs</span>
          </span>
          {hasJacuzzi && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-blue-500/85 backdrop-blur-xs text-white border border-blue-400/30 shadow-xs">
              <span>🌊</span>
              <span>Jacuzzi Suites</span>
            </span>
          )}
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-amber-500/90 backdrop-blur-xs text-white border border-amber-400/30 shadow-xs ml-auto">
            <span className="text-amber-200 font-black">★</span>
            <span>{rating}</span>
          </span>
        </div>

        {/* City Heading & Review Stats */}
        <div className="mt-0.5">
          <h3 className="font-heading text-2xl sm:text-[26px] font-black text-white leading-tight drop-shadow-md tracking-tight group-hover:text-sky-300 transition-colors">
            {city}
          </h3>
          <p className="text-[11px] sm:text-xs text-white/80 font-medium line-clamp-1 mt-0.5 flex items-center gap-1.5 drop-shadow-xs">
            <span>{reviewsFormatted}</span>
            <span className="opacity-60">•</span>
            <span className="text-emerald-300 font-semibold">100% In-Room</span>
          </p>
        </div>

        {/* Interactive Action CTA Bar */}
        <div
          className={`mt-1.5 flex items-center justify-between py-2.5 px-3.5 rounded-xl font-bold text-xs sm:text-[13px] transition-all duration-200 border backdrop-blur-md shadow-sm ${
            clicked
              ? 'bg-[#1a6fde] text-white border-[#1a6fde] shadow-md'
              : 'bg-white/15 hover:bg-white text-white hover:text-gray-900 border-white/25 group-hover:bg-[#1a6fde] group-hover:border-[#1a6fde] group-hover:text-white'
          }`}
        >
          {clicked ? (
            <>
              <span>Opening {city}...</span>
              <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </>
          ) : (
            <>
              <span>Explore {hotelCount} Verified Stays</span>
              <svg
                className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
