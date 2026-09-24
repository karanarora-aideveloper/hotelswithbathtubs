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
}

export default function CityCard({
  city,
  country,
  hotelCount,
  image,
  isInternational = false,
  priority = false
}: CityCardProps) {
  const [clicked, setClicked] = useState(false);

  const countrySlug = resolveCountry(country).slug;
  const citySlug = slugify(city);
  const targetUrl = `/${countrySlug}/${citySlug}`;

  const handleClick = () => {
    setClicked(true);
    // Auto-reset clicked state after 4 seconds in case user presses back button
    setTimeout(() => setClicked(false), 4000);
  };

  return (
    <Link
      href={targetUrl}
      prefetch={false}
      onClick={handleClick}
      style={{ contentVisibility: 'auto', containIntrinsicSize: '380px' }}
      className={`bg-white rounded-2xl overflow-hidden border border-border shadow-sm transition-all flex flex-col group text-left cursor-pointer ${
        clicked 
          ? 'ring-2 ring-accent border-accent shadow-md opacity-90' 
          : 'hover:-translate-y-1.5 hover:shadow-xl hover:border-gray-300'
      }`}
    >
      <div className="relative overflow-hidden aspect-[4/3]">
        <ProgressiveImage
          src={image}
          alt={`Hotels in ${city} with Bathtub`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="group-hover:scale-105 transition-transform duration-500"
          priority={priority}
        />
        {isInternational && (
          <div className="absolute top-3 left-3 bg-accent-secondary/90 backdrop-blur-xs text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-xs">
            {country}
          </div>
        )}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full text-xs font-semibold text-emerald-800 shadow-xs flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>✓ Verified Stays</span>
        </div>
      </div>

      <div className="p-4 sm:p-6 flex flex-col flex-grow">
        <span className="block font-heading text-lg sm:text-xl font-bold text-accent-secondary mb-1 group-hover:text-accent transition-colors">
          {city}
        </span>
        <p className="text-xs sm:text-sm text-text-muted font-medium mb-3.5 sm:mb-5">
          {hotelCount} Verified Hotels {isInternational ? `• ${country}` : ''}
        </p>

        {/* Dynamic Action Button with Loading Spinner */}
        <div
          className={`mt-auto flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm shadow-sm transition-all duration-150 ${
            clicked
              ? 'bg-accent-hover text-white shadow-md'
              : 'bg-accent hover:bg-accent-hover text-white group-hover:shadow-md'
          }`}
        >
          {clicked ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>Opening {city}...</span>
            </>
          ) : (
            <>
              <span>View Hotels</span>
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
