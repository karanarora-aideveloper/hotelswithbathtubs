'use client';

import { useState } from 'react';
import Link from 'next/link';
import { imageUrl, DEFAULT_HOTEL_IMAGE } from '@/lib/imageUrl';
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
  rating,
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
    : 'Rooms with bathtubs';

  const defaultPrice = country.toLowerCase() === 'india' ? 'From ₹2,499' : 'From $149';
  const displayPrice = minPrice ? (minPrice.startsWith('From') ? minPrice : `From ${minPrice}`) : defaultPrice;

  return (
    <Link
      href={targetUrl}
      prefetch={false}
      onClick={handleClick}
      style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 380px' }}
      className={`bg-white rounded-2xl border border-slate-200/90 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_32px_rgba(15,23,42,0.08)] hover:border-[#1a6fde]/50 transition-all duration-300 flex flex-col group text-left cursor-pointer overflow-hidden ${
        clicked
          ? 'ring-2 ring-[#1a6fde] border-[#1a6fde] shadow-lg opacity-95 scale-[0.99]'
          : 'hover:-translate-y-1.5'
      }`}
    >
      {/* Top Media Window */}
      <div className="relative w-full h-36 sm:h-52 overflow-hidden bg-slate-100">
        <img
          src={imageUrl(image)}
          alt={`Hotels with private bathtubs in ${city}, ${country}`}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700 ease-out"
          onError={(e) => {
            (e.target as HTMLImageElement).src = DEFAULT_HOTEL_IMAGE;
          }}
        />

        {/* Soft bottom vignette to separate photo from card body */}
        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/25 to-transparent pointer-events-none" />

        {/* Floating Glassmorphic Badges */}
        <div className="absolute inset-x-0 top-0 p-3 sm:p-3.5 flex items-center justify-between gap-2 z-[2]">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md border border-white/60 text-slate-800 text-[11px] font-bold shadow-xs">
            <span>{flag}</span>
            <span className="line-clamp-1">{country}</span>
          </div>

          <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md border border-white/60 text-slate-900 text-[11px] font-black shadow-xs whitespace-nowrap">
            <span className="text-[10px] text-slate-500 font-normal">from</span>
            <span>{displayPrice.replace('From ', '')}</span>
            <span className="text-[9px] text-slate-400 font-normal">/nt</span>
          </div>
        </div>
      </div>

      {/* Bottom Information Body */}
      <div className="p-3 sm:p-5 flex flex-col justify-between flex-1 bg-white">
        <div>
          {/* Bathtub Status & Tub Type Badges */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200/80 shadow-2xs">
              <span>🛁</span>
              <span>{hotelCount} {hotelCount === 1 ? 'Room with Tub' : 'Rooms with Bathtubs'}</span>
            </span>
            {hasJacuzzi && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200/80 shadow-2xs">
                <span>🌊</span>
                <span>Jacuzzi</span>
              </span>
            )}
            {typeof rating === 'number' && rating > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200/80 shadow-2xs ml-auto">
                <span className="text-amber-500 font-black">★</span>
                <span>{rating}</span>
              </span>
            )}
          </div>

          {/* City Heading & Review Stats */}
          <div className="mt-2.5">
            <h3 className="font-heading text-lg sm:text-[22px] font-black text-slate-900 group-hover:text-[#1a6fde] transition-colors leading-snug tracking-tight">
              {city}
            </h3>
            <p className="text-xs text-slate-500 font-medium line-clamp-1 mt-1 flex items-center gap-1.5">
              <span>{reviewsFormatted}</span>
              <span className="hidden sm:inline opacity-40">•</span>
              <span className="hidden sm:inline text-emerald-700 font-semibold">In-Room Tubs</span>
            </p>
          </div>
        </div>

        {/* Divider & Action Footer */}
        <div className="mt-3 sm:mt-4 pt-3 border-t border-slate-100 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="hidden sm:block text-xs text-slate-400 font-normal">Best verified rate</span>
            <span className="text-[15px] font-extrabold text-slate-900">{displayPrice}</span>
          </div>

          <div
            className={`flex items-center justify-center gap-1.5 py-1.5 px-3.5 rounded-xl font-bold text-xs transition-all duration-200 border shadow-2xs ${
              clicked
                ? 'bg-[#1a6fde] text-white border-[#1a6fde]'
                : 'bg-slate-50 group-hover:bg-[#1a6fde] text-slate-700 group-hover:text-white border-slate-200/70 group-hover:border-[#1a6fde]'
            }`}
          >
            {clicked ? (
              <>
                <span>Opening...</span>
                <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </>
            ) : (
              <>
                <span>Explore Stays</span>
                <svg
                  className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform"
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
      </div>
    </Link>
  );
}
