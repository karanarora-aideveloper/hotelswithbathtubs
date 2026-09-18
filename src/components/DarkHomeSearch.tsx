'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { slugify } from '@/lib/utils';
import { useGeo } from '@/lib/useGeo';

type Match = { country: string; city: string };

export default function DarkHomeSearch() {
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
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const allMatches: Match[] = Object.entries(locations).flatMap(([country, cities]) =>
    cities.map((city) => ({ country, city }))
  );

  const cleanQuery = query.trim().toLowerCase();
  
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

  function getTargetUrl(match: Match) {
    return `/${slugify(match.country)}/${slugify(match.city)}`;
  }

  function goToCity(match: Match) {
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
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!isOpen || filtered.length === 0) {
      if (e.key === 'Enter' && filtered.length > 0) {
        e.preventDefault();
        goToCity(filtered[0]);
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
    <div ref={containerRef} className="w-full bg-surface-container-lowest/75 backdrop-blur-2xl rounded-xl p-3 md:p-4 mt-6 border border-outline-variant/50 relative">
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 items-center">
        
        {/* Selector: Destination (Search Input) */}
        <div className="col-span-1 lg:col-span-2 p-3.5 rounded-lg bg-surface-container/60 focus-within:bg-surface-container transition-colors border border-white/5 relative">
          <span className="block font-label-uppercase-sm text-label-uppercase-sm text-primary tracking-widest mb-1">
            SANCTUARY / CITY
          </span>
          <div className="flex items-center justify-between text-on-surface">
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
              placeholder={geo.isIndia ? "E.g. Goa, Udaipur, Manali..." : "E.g. New York, Tokyo, Paris..."}
              className="w-full bg-transparent font-body-md text-body-md font-medium outline-none placeholder:text-on-surface-variant/50 text-on-surface"
            />
            <span className="material-symbols-outlined text-primary/70 text-lg ml-2">location_on</span>
          </div>

          {/* Autocomplete Dropdown */}
          {isOpen && query.trim() && (
            <div className="absolute top-[110%] left-0 right-0 bg-surface-container-high border border-outline-variant/50 shadow-2xl rounded-xl overflow-hidden z-30 max-h-72 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="p-4 text-sm text-on-surface-variant text-center font-body-sm">
                  No nocturnal sanctuaries found.
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
                      className={`w-full text-left px-4 py-3 text-sm font-body-sm border-b border-outline-variant/20 last:border-0 transition-colors flex items-center justify-between ${
                        i === activeIndex ? 'bg-primary/10 text-primary' : 'text-on-surface hover:bg-primary/5 hover:text-primary'
                      }`}
                    >
                      <span>{m.city}, <span className="text-on-surface-variant text-xs ml-1">{m.country}</span></span>
                      <span className="text-xs font-label-uppercase-sm tracking-widest text-primary/70">Enter &rarr;</span>
                    </Link>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Dates & Guests (Static Mock) */}
        <div className="p-3.5 rounded-lg bg-surface-container/60 hover:bg-surface-container transition-colors border border-white/5 cursor-not-allowed opacity-70 hidden sm:block">
          <span className="block font-label-uppercase-sm text-label-uppercase-sm text-primary tracking-widest mb-1">
            DATES & GUESTS
          </span>
          <div className="flex items-center justify-between text-on-surface">
            <span className="font-body-md text-body-md font-medium truncate">Any Date • 2 Guests</span>
            <span className="material-symbols-outlined text-primary/70 text-lg">calendar_today</span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSearchClick}
          disabled={isNavigating || !query}
          className={`h-full w-full bg-primary text-on-primary font-label-uppercase-sm text-label-uppercase-sm py-4 rounded-lg hover:bg-primary-fixed transition-all duration-300 shadow-lg shadow-primary/10 flex items-center justify-center gap-2 ${
            isNavigating ? 'opacity-80 cursor-wait' : (query ? '' : 'opacity-50 cursor-not-allowed')
          }`}
        >
          {isNavigating ? (
            <>
              <svg className="animate-spin h-4 w-4 text-on-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>INQUIRING...</span>
            </>
          ) : (
            <span>INQUIRE SANCTUARY</span>
          )}
        </button>
      </div>
    </div>
  );
}
