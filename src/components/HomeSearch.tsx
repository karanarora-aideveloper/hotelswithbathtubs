'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { slugify } from '@/lib/utils';
import { useGeo } from '@/lib/useGeo';
import {
  recordSearchZeroResults,
  recordSearchAbandoned,
  recordSearchSelection,
} from '@/lib/gtag';

type Match = { country: string; city: string };

export default function HomeSearch() {
  const router = useRouter();
  const { geo } = useGeo();
  const [locations, setLocations] = useState<Record<string, string[]>>({});
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isNavigating, setIsNavigating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/locations')
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) setLocations(data);
      })
      .catch(console.error);

    // Reset isNavigating on mount in case of back-button navigation
    setIsNavigating(false);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        if (isOpen && query.trim().length >= 3 && !isNavigating) {
          recordSearchAbandoned(query.trim(), query.trim().length);
        }
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, query, isNavigating]);

  // Flatten { "India": ["Kolkata", "Gwalior"] } into a searchable list
  const allMatches: Match[] = Object.entries(locations).flatMap(([country, cities]) =>
    cities.map((city) => ({ country, city }))
  );

  const cleanQuery = query.trim().toLowerCase();
  
  // Sort matches so exact and prefix matches appear first
  const filtered = cleanQuery
    ? allMatches
        .filter((m) => m.city.toLowerCase().includes(cleanQuery))
        .sort((a, b) => {
          const aExact = a.city.toLowerCase() === cleanQuery ? -1 : 1;
          const bExact = b.city.toLowerCase() === cleanQuery ? -1 : 1;
          if (aExact !== bExact) return aExact - bExact;

          const aStarts = a.city.toLowerCase().startsWith(cleanQuery) ? -1 : 1;
          const bStarts = b.city.toLowerCase().startsWith(cleanQuery) ? -1 : 1;
          if (aStarts !== bStarts) return aStarts - bStarts;

          return a.city.localeCompare(b.city);
        })
    : [];

  // Track search zero results when user pauses typing and no results match
  useEffect(() => {
    if (
      isOpen &&
      cleanQuery.length >= 2 &&
      filtered.length === 0 &&
      Object.keys(locations).length > 0
    ) {
      const timer = setTimeout(() => {
        recordSearchZeroResults(query.trim(), 'home_search_empty');
      }, 750);
      return () => clearTimeout(timer);
    }
  }, [isOpen, cleanQuery, filtered.length, locations, query]);

  function getTargetUrl(match: Match) {
    return `/${slugify(match.country)}/${slugify(match.city)}`;
  }

  function goToCity(match: Match) {
    recordSearchSelection(match.city, match.country, query.trim());
    setIsOpen(false);
    setIsNavigating(true);
    router.push(getTargetUrl(match));
  }

  function handleSearchClick() {
    if (filtered.length > 0) {
      const selected = activeIndex >= 0 && activeIndex < filtered.length 
        ? filtered[activeIndex] 
        : filtered[0];
      goToCity(selected);
    } else if (query.trim().length > 0) {
      recordSearchZeroResults(query.trim(), 'home_search_submit');
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!isOpen || filtered.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered.length > 0) {
          goToCity(filtered[0]);
        } else if (query.trim().length > 0) {
          recordSearchZeroResults(query.trim(), 'home_search_enter');
        }
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % filtered.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? filtered.length - 1 : i - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = activeIndex >= 0 && activeIndex < filtered.length 
        ? filtered[activeIndex] 
        : filtered[0];
      goToCity(selected);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  }

  return (
    <div ref={containerRef} className="relative flex-1 w-full">
      <div className="relative z-20 flex flex-col md:flex-row gap-4 items-center w-full">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(-1);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={
              geo.isIndia
                ? "Search city with bathtub (e.g. Goa, Udaipur, Manali)..."
                : "Search city with bathtub (e.g. New York, Las Vegas, Miami)..."
            }
            className="w-full px-4 md:px-6 py-3.5 md:py-4 text-sm sm:text-base md:text-lg font-semibold bg-gray-100 rounded-xl outline-none focus:bg-white focus:ring-4 focus:ring-accent/20 border-2 border-transparent focus:border-accent transition-all"
          />

          {isOpen && query.trim() && (
            <div className="absolute top-full mt-2 left-0 right-0 bg-white border border-border shadow-xl rounded-xl overflow-hidden z-30 max-h-72 overflow-y-auto text-left">
              {filtered.length === 0 ? (
                <div className="p-4 text-sm text-gray-500 text-center">
                  No matching city — we don't have listings there yet.
                </div>
              ) : (
                filtered.map((m, i) => {
                  const targetUrl = getTargetUrl(m);
                  return (
                    <Link
                      key={`${m.country}-${m.city}`}
                      href={targetUrl}
                      prefetch={true}
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={() => {
                        setIsOpen(false);
                        setIsNavigating(true);
                      }}
                      onMouseEnter={() => setActiveIndex(i)}
                      className={`w-full text-left px-4 py-3 text-sm font-semibold border-b border-gray-100 last:border-0 transition-colors flex items-center justify-between block ${
                        i === activeIndex ? 'bg-accent/10 text-accent' : 'text-text-main hover:bg-accent/10 hover:text-accent'
                      }`}
                    >
                      <span className="font-bold">{m.city}, {m.country}</span>
                      <span className="text-xs font-normal text-accent group-hover:underline">View Hotels &rarr;</span>
                    </Link>
                  );
                })
              )}
            </div>
          )}
        </div>

        <button
          onClick={handleSearchClick}
          disabled={isNavigating}
          className={`bg-gradient-to-br from-accent to-accent-hover text-white px-8 md:px-10 py-3 md:py-4 text-base md:text-lg font-bold rounded-xl hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/30 transition-all w-full md:w-auto flex items-center justify-center gap-2 ${
            isNavigating ? 'opacity-80 cursor-wait' : ''
          }`}
        >
          {isNavigating ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Opening...</span>
            </>
          ) : (
            <span>Search</span>
          )}
        </button>
      </div>
    </div>
  );
}
