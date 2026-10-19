'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import CityCard from '@/components/CityCard';
import { resolveCountry, slugify } from '@/lib/utils';

export type CountryCityCardItem = {
  _id: { city: string; country: string };
  hotelCount: number;
  image: string;
  minPrice: string;
  rating?: number;
  totalReviews: number;
  hasJacuzzi: boolean;
};

// Compact serialized form for non-initial cities: [city, country, hotelCount, image, minPrice, hasJacuzzi]
export type CountryCityLinkItem = [string, string, number, string, string, boolean];

interface CountryCitiesClientProps {
  initialCities: CountryCityCardItem[];
  remainingCities: CountryCityLinkItem[];
}

const STREAM_BATCH_SIZE = 16;

export default function CountryCitiesClient({ initialCities, remainingCities }: CountryCitiesClientProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [remainingVisible, setRemainingVisible] = useState(0);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const totalCount = initialCities.length + remainingCities.length;
  const displayedRemaining = isExpanded ? remainingCities.slice(0, remainingVisible) : [];
  const shownCount = initialCities.length + displayedRemaining.length;
  const hasMoreToStream = isExpanded && remainingVisible < remainingCities.length;

  useEffect(() => {
    if (!hasMoreToStream) return;
    const target = sentinelRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setRemainingVisible((prev) => Math.min(prev + STREAM_BATCH_SIZE, remainingCities.length));
        }
      },
      { rootMargin: '600px 0px' }
    );

    observer.observe(target);
    return () => {
      observer.disconnect();
    };
  }, [hasMoreToStream, remainingCities.length]);

  const handleExpand = () => {
    setIsExpanded(true);
    setRemainingVisible(STREAM_BATCH_SIZE);
  };

  const handleCollapse = () => {
    setIsExpanded(false);
    setRemainingVisible(0);
  };

  const handleLoadAll = () => {
    setRemainingVisible(remainingCities.length);
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-8">
        {initialCities.map((item, idx) => (
          <CityCard
            key={`${item._id.city}-${item._id.country}`}
            city={item._id.city}
            country={item._id.country}
            hotelCount={item.hotelCount}
            image={item.image}
            priority={idx < 4}
            minPrice={item.minPrice}
            rating={item.rating}
            totalReviews={item.totalReviews}
            hasJacuzzi={item.hasJacuzzi}
          />
        ))}
        {displayedRemaining.map((item) => (
          <CityCard
            key={`${item[0]}-${item[1]}`}
            city={item[0]}
            country={item[1]}
            hotelCount={item[2]}
            image={item[3]}
            minPrice={item[4]}
            hasJacuzzi={item[5]}
          />
        ))}
      </div>

      {hasMoreToStream && (
        <div ref={sentinelRef} className="h-10 w-full flex items-center justify-center my-6" aria-hidden="true">
          <div className="flex items-center gap-2 text-xs text-slate-600 font-medium bg-white px-4 py-2 rounded-full border border-slate-200 shadow-2xs animate-pulse">
            <div className="w-2 h-2 rounded-full bg-[#1a6fde] animate-ping" />
            <span>Loading verified destinations ({shownCount} of {totalCount})...</span>
          </div>
        </div>
      )}

      {!isExpanded && remainingCities.length > 0 && (
        <div className="mt-8 space-y-4">
          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={handleExpand}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#1a6fde] hover:bg-[#1559b8] text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <span>Show All {totalCount} Destination Cards</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          <div className="pt-4 border-t border-slate-200/80 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-xs">
            <span className="text-slate-400 font-medium mr-1">More Destinations:</span>
            {remainingCities.map((item) => {
              const countrySlug = resolveCountry(item[1]).slug;
              return (
                <Link
                  key={`${item[0]}-${item[1]}`}
                  href={`/${countrySlug}/${slugify(item[0])}`}
                  prefetch={false}
                  className="px-2.5 py-1 bg-white hover:bg-[#1a6fde] hover:text-white hover:border-[#1a6fde] border border-slate-200 rounded-lg text-slate-700 transition-colors text-xs font-medium shadow-2xs"
                >
                  {item[0]} ({item[2]})
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {isExpanded && (
        <div className="mt-10 pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-muted">
          <div className="flex items-center gap-2 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>
              Showing {Math.min(shownCount, totalCount)} of {totalCount} destinations
            </span>
            {hasMoreToStream && (
              <button
                type="button"
                onClick={handleLoadAll}
                className="ml-2 text-accent font-semibold hover:underline cursor-pointer"
              >
                Load all {totalCount} now
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={handleCollapse}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors cursor-pointer"
          >
            <span>Show Fewer</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 15l7-7 7 7" />
            </svg>
          </button>
        </div>
      )}
    </>
  );
}
