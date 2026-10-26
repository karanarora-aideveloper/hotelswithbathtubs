'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useGeo } from '@/lib/useGeo';
import {
  recordSearchZeroResults,
  recordSearchAbandoned,
  recordSearchSelection,
} from '@/lib/gtag';

export type SearchItem = {
  type: 'city' | 'hotel' | 'country';
  title: string;
  subtitle: string;
  url: string;
  badge?: string;
  count?: number;
};

type SearchData = {
  countries?: [string, string, number][];
  cities?: [string, string, string, string, number][];
  hotels?: [string, string, string, string][];
};

const INDIA_SHORTCUTS = [
  { name: 'Udaipur', href: '/india/udaipur' },
  { name: 'Agra', href: '/india/agra' },
  { name: 'Goa', href: '/india/goa' },
  { name: 'Shimla', href: '/india/shimla' },
  { name: 'Munnar', href: '/india/munnar' },
  { name: 'Mumbai', href: '/india/mumbai' },
  { name: 'Bangalore', href: '/india/bangalore' },
  { name: 'Rishikesh', href: '/india/rishikesh' },
];

const GLOBAL_SHORTCUTS = [
  { name: 'Paris', href: '/france/paris' },
  { name: 'Tokyo', href: '/japan/tokyo' },
  { name: 'New York', href: '/usa/new-york' },
  { name: 'London', href: '/uk/london' },
  { name: 'Dubai', href: '/uae/dubai' },
  { name: 'Rome', href: '/italy/rome' },
  { name: 'Singapore', href: '/singapore/singapore' },
];

export default function LuxuryHero() {
  const router = useRouter();
  const { geo } = useGeo();
  const [userRegion, setUserRegion] = useState<'india' | 'global' | null>(null);
  const activeRegion = userRegion ?? (geo?.isIndia ? 'india' : 'global');
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [selectedTub, setSelectedTub] = useState('all');
  const [searchData, setSearchData] = useState<SearchData | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isFetchingSearch = useRef(false);

  // Lazy-load search index on demand or when browser is idle (zero impact on initial LCP)
  const loadSearchData = React.useCallback(() => {
    if (searchData || isFetchingSearch.current) return;
    isFetchingSearch.current = true;

    fetch('/search-data.json')
      .then((res) => {
        if (res.ok) return res.json();
        return fetch('/locations.json')
          .then((r) => r.json())
          .then((locMap) => {
            const cities: [string, string, string, string, number][] = [];
            const countries: [string, string, number][] = [];
            for (const [country, cityList] of Object.entries(locMap as Record<string, string[]>)) {
              countries.push([country, country.toLowerCase().replace(/\s+/g, '-'), cityList.length]);
              for (const city of cityList) {
                cities.push([
                  city,
                  country,
                  country.toLowerCase().replace(/\s+/g, '-'),
                  city.toLowerCase().replace(/\s+/g, '-'),
                  1,
                ]);
              }
            }
            return { countries, cities, hotels: [] };
          });
      })
      .then((data: SearchData) => {
        setSearchData(data);
      })
      .catch((err) => {
        console.warn('Search index load failed:', err);
      });
  }, [searchData]);

  // Load search data in idle callback after page is fully painted
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if ('requestIdleCallback' in window) {
      const id = (window as any).requestIdleCallback(
        () => {
          loadSearchData();
        },
        { timeout: 3500 }
      );
      return () => (window as any).cancelIdleCallback(id);
    } else {
      const timer = setTimeout(() => {
        loadSearchData();
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [loadSearchData]);

  // Handle outside clicks
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

  // Query filtering
  const cleanQuery = query.toLowerCase().replace(/,/g, ' ').replace(/\s+/g, ' ').trim();
  const tokens = useMemo(() => cleanQuery.split(' ').filter(Boolean), [cleanQuery]);

  const filtered: SearchItem[] = useMemo(() => {
    if (!cleanQuery || !searchData) return [];
    const results: SearchItem[] = [];

    const matchAllTokens = (target: string) => {
      const lower = target.toLowerCase();
      return tokens.every((t) => lower.includes(t));
    };

    if (searchData.cities) {
      for (const [cityName, countryName, countrySlug, citySlug, count] of searchData.cities) {
        if (matchAllTokens(`${cityName} ${countryName}`)) {
          const isExact = cityName.toLowerCase() === cleanQuery;
          const isPrefix = cityName.toLowerCase().startsWith(cleanQuery);
          results.push({
            type: 'city',
            title: cityName,
            subtitle: countryName,
            url: `/${countrySlug}/${citySlug}`,
            badge: `${count} hotels`,
            count: isExact ? 1000 : isPrefix ? 500 : 100,
          });
        }
      }
    }

    if (searchData.hotels) {
      for (const [hotelName, cityName, countryName, url] of searchData.hotels) {
        if (matchAllTokens(`${hotelName} ${cityName} ${countryName}`)) {
          const isExact = hotelName.toLowerCase() === cleanQuery;
          results.push({
            type: 'hotel',
            title: hotelName,
            subtitle: `${cityName}, ${countryName}`,
            url,
            badge: 'Bathtub Hotel',
            count: isExact ? 900 : 50,
          });
        }
      }
    }

    results.sort((a, b) => (b.count || 0) - (a.count || 0));
    return results.slice(0, 6);
  }, [cleanQuery, tokens, searchData]);

  const navigateToItem = (item: SearchItem) => {
    recordSearchSelection(item.title, item.subtitle, query.trim());
    setIsOpen(false);
    setIsNavigating(true);
    router.push(item.url);
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (filtered.length > 0) {
      const selected = activeIndex >= 0 && activeIndex < filtered.length ? filtered[activeIndex] : filtered[0];
      navigateToItem(selected);
    } else if (query.trim().length > 0) {
      recordSearchZeroResults(query.trim(), 'home_luxury_search');
      setIsOpen(true);
    } else {
      // Default jump to destinations
      const el = document.getElementById('destinations');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const shortcuts = activeRegion === 'india' ? INDIA_SHORTCUTS : GLOBAL_SHORTCUTS;

  return (
    <div className="relative bg-[#FAF8F5]">
      {/* React 19 auto-hoisted LCP Preload */}
      <link
        rel="preload"
        as="image"
        href="https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp"
        fetchPriority="high"
      />

      {/* Hero Container with Panoramic Suite Visual */}
      <div className="relative min-h-[580px] sm:min-h-[640px] md:min-h-[700px] flex items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8 pt-16 pb-20">
        {/* Architectural Suite Background */}
        <img
          src="https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp"
          alt="Luxury hotel room with private bathtub in room"
          loading="eager"
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.82]"
        />

        {/* Ambient Darkened Scrim for Typographic Legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/35 to-black/70" />

        {/* Central Editorial Content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center text-white">
          {/* Understated Geo-Indicator */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-xs font-medium tracking-wider mb-6 text-white/90">
            <span>
              {activeRegion === 'india' ? 'Showing verified luxury stays for 🇮🇳 India' : 'Showing verified luxury stays worldwide'}
            </span>
            <button
              type="button"
              onClick={() => setUserRegion(activeRegion === 'india' ? 'global' : 'india')}
              className="text-[#C5A880] hover:text-white underline underline-offset-2 ml-1 cursor-pointer transition-colors"
            >
              (Switch to {activeRegion === 'india' ? 'Global' : 'India'})
            </button>
          </div>

          <h1 className="font-playfair text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal leading-[1.1] tracking-tight mb-5 drop-shadow-md">
            Hotels with Private Bathtubs in Room
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-white/90 font-light max-w-2xl mx-auto mb-10 leading-relaxed font-sans drop-shadow-sm">
            Hand-picked luxury suites across 60 global destinations. <br className="hidden sm:inline" />
            Every bathtub verified inside your private room.
          </p>

          {/* Floating Monolithic Concierge Search Bar */}
          <div
            ref={containerRef}
            onMouseEnter={loadSearchData}
            className="relative max-w-3xl mx-auto bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/50 p-2 sm:p-2.5 text-left text-[#121518]"
          >
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center divide-y sm:divide-y-0 sm:divide-x divide-[#E5E1D8]">
              {/* Destination Search Input */}
              <div className="relative flex-grow px-4 py-2 sm:py-1">
                <label htmlFor="destination-hotel-search" className="block text-[10px] font-semibold tracking-widest uppercase text-[#6B6964] mb-0.5">
                  Destination or Hotel
                </label>
                <input
                  id="destination-hotel-search"
                  aria-label="Destination or Hotel"
                  type="text"
                  value={query}
                  onChange={(e) => {
                    loadSearchData();
                    setQuery(e.target.value);
                    setIsOpen(true);
                    setActiveIndex(-1);
                  }}
                  onFocus={() => {
                    loadSearchData();
                    setIsOpen(true);
                  }}
                  placeholder={activeRegion === 'india' ? 'Udaipur, Agra, Goa, Shimla...' : 'Paris, Tokyo, New York, London...'}
                  className="w-full text-sm font-medium text-[#121518] placeholder-[#9E9B94] focus:outline-none bg-transparent"
                />
              </div>

              {/* Bathtub Architecture Dropdown */}
              <div className="px-4 py-2 sm:py-1 sm:w-56 flex-shrink-0">
                <label htmlFor="bathtub-architecture-select" className="block text-[10px] font-semibold tracking-widest uppercase text-[#6B6964] mb-0.5">
                  Bathtub Architecture
                </label>
                <select
                  id="bathtub-architecture-select"
                  aria-label="Bathtub Architecture"
                  value={selectedTub}
                  onChange={(e) => setSelectedTub(e.target.value)}
                  className="w-full text-xs font-semibold text-[#121518] bg-transparent focus:outline-none cursor-pointer"
                >
                  <option value="all">All Bathtub Styles</option>
                  {activeRegion === 'india' ? (
                    <>
                      <option value="sunken-marble">Sunken Royal Marble</option>
                      <option value="terrace-jacuzzi">Private Terrace Jacuzzi</option>
                      <option value="clawfoot">Heritage Victorian Clawfoot</option>
                      <option value="stone-soaker">Ayurvedic Stone Soaker</option>
                    </>
                  ) : (
                    <>
                      <option value="skyline">Skyline View Soaker</option>
                      <option value="penthouse-jacuzzi">Balcony / Terrace Whirlpool</option>
                      <option value="onsen">Japanese Hinoki Onsen</option>
                      <option value="alpine">Alpine Heated Chalet Tub</option>
                    </>
                  )}
                </select>
              </div>

              {/* Search Action CTA */}
              <div className="p-1 sm:p-0 sm:pl-2 flex-shrink-0 flex items-center">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#121518] hover:bg-[#252A30] text-white text-xs font-semibold tracking-wider transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 transform active:scale-95"
                >
                  <span>Find Hotels</span>
                  <span className="text-[#C5A880] text-sm">&rarr;</span>
                </button>
              </div>
            </form>

            {/* Autocomplete Dropdown */}
            {isOpen && cleanQuery && !searchData && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-2xl border border-[#E5E1D8] p-3 text-center text-xs text-[#6B6964] z-50">
                Searching verified luxury stays...
              </div>
            )}
            {isOpen && filtered.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-2xl border border-[#E5E1D8] overflow-hidden z-50">
                <div className="p-2 border-b border-[#E5E1D8]/60 text-[10.5px] font-semibold tracking-wider uppercase text-[#6B6964]">
                  Suggested Destinations &amp; Hotels
                </div>
                <div className="divide-y divide-[#E5E1D8]/40 max-h-72 overflow-y-auto">
                  {filtered.map((item, idx) => (
                    <button
                      key={item.url + idx}
                      type="button"
                      onClick={() => navigateToItem(item)}
                      className={`w-full px-4 py-2.5 text-left flex items-center justify-between hover:bg-[#F5F2EC] transition-colors cursor-pointer ${
                        activeIndex === idx ? 'bg-[#F5F2EC]' : ''
                      }`}
                    >
                      <div>
                        <span className="block text-xs font-semibold text-[#121518]">{item.title}</span>
                        <span className="block text-[11px] text-[#6B6964]">{item.subtitle}</span>
                      </div>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#EAE6DF] text-[#121518]">
                        {item.badge}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Shortcuts Rail */}
          <div className="mt-6 flex items-center justify-center gap-2 flex-wrap text-xs text-white/80">
            <span className="text-white/60 font-medium">Popular:</span>
            {shortcuts.map((city) => (
              <Link
                key={city.name}
                href={city.href}
                prefetch={false}
                className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-xs text-white text-xs font-medium transition-colors border border-white/15"
              >
                {city.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
