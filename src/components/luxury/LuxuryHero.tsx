'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { sendSearch } from '@/lib/events';

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

export default function LuxuryHero() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [searchData, setSearchData] = useState<SearchData | null>(null);
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
      const win = window as unknown as {
        requestIdleCallback: (cb: () => void, opt?: { timeout: number }) => number;
        cancelIdleCallback: (id: number) => void;
      };
      const id = win.requestIdleCallback(
        () => {
          loadSearchData();
        },
        { timeout: 3500 }
      );
      return () => win.cancelIdleCallback(id);
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
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    sendSearch({
      term: query.trim() || item.title,
      results_count: filtered.length || 1,
      country: item.subtitle,
      city: item.title,
    });
    setIsOpen(false);
    router.push(item.url);
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (filtered.length > 0) {
      const selected = activeIndex >= 0 && activeIndex < filtered.length ? filtered[activeIndex] : filtered[0];
      navigateToItem(selected);
    } else if (query.trim().length > 0) {
      sendSearch({ term: query.trim(), results_count: 0 });
      setIsOpen(true);
    } else {
      // Default jump to destinations
      const el = document.getElementById('destinations');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative bg-[#f5f6f8]">
      {/* React 19 auto-hoisted LCP Preload */}
      <link
        rel="preload"
        as="image"
        href="https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/bathtub-the-oberoi-udaivilas-udaipur.webp"
        fetchPriority="high"
      />

      {/* Hero Container matching Style B mockup */}
      <div
        className="relative min-h-[430px] sm:h-[460px] md:h-[500px] bg-center bg-cover flex flex-col justify-end px-[18px] py-[22px] sm:px-8 sm:py-8 overflow-hidden"
        style={{
          backgroundImage:
            'url(https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/bathtub-the-oberoi-udaivilas-udaipur.webp)',
        }}
      >
        {/* Dark gradient overlay matching mockup */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/25 pointer-events-none" />

        <div className="relative z-10 max-w-4xl w-full mx-auto">
          <div className="text-[11px] tracking-[0.22em] uppercase text-[#f3e7cf] mb-[10px] font-medium font-manrope">
            Hotels in many countries
          </div>
          <h1 className="font-playfair text-white text-[32px] sm:text-[38px] md:text-[44px] leading-[1.05] font-semibold mb-[10px] tracking-tight">
            Find a room with a bathtub
          </h1>
          <p className="text-[#eeeeee] text-[14px] leading-[1.5] mb-[16px] max-w-xl font-manrope">
            We show the exact room to book, and whether a booking site lists the tub.
          </p>

          {/* Search Bar matching Style B mockup */}
          <div
            ref={containerRef}
            onMouseEnter={loadSearchData}
            className="relative w-full max-w-xl bg-white rounded-[14px] p-[6px] flex gap-[6px] shadow-[0_10px_30px_rgba(0,0,0,0.25)] text-left"
          >
            <form onSubmit={handleSearchSubmit} className="flex items-center w-full gap-[6px]">
              <div className="flex-1 px-[10px] sm:px-[12px] py-[6px] sm:py-[8px]">
                <label
                  htmlFor="destination-hotel-search"
                  className="block text-[10px] tracking-[0.12em] uppercase text-[#333333] mb-[2px] font-bold font-manrope"
                >
                  Where
                </label>
                <input
                  id="destination-hotel-search"
                  aria-label="City or hotel search"
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
                  placeholder="City or hotel"
                  className="w-full text-[14px] font-medium text-[#14213d] placeholder-[#888888] focus:outline-none bg-transparent font-manrope border-0 p-0"
                />
              </div>
              <button
                type="submit"
                className="bg-[#b08d57] hover:bg-[#9c7b48] text-white border-0 rounded-[10px] px-[18px] sm:px-[22px] py-[10px] sm:py-[12px] font-bold text-[14px] font-manrope shrink-0 cursor-pointer transition-colors shadow-xs"
              >
                Search
              </button>
            </form>

            {/* Autocomplete Dropdown */}
            {isOpen && cleanQuery && !searchData && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-[14px] shadow-2xl border border-[#e3e7ef] p-3 text-center text-xs text-[#5b6478] z-50 font-manrope">
                Searching stays...
              </div>
            )}
            {isOpen && filtered.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-[14px] shadow-2xl border border-[#e3e7ef] overflow-hidden z-50 font-manrope">
                <div className="p-2.5 border-b border-[#e3e7ef] text-[10.5px] font-bold tracking-wider uppercase text-[#5b6478] bg-[#f5f6f8]">
                  Suggested Destinations &amp; Hotels
                </div>
                <div className="divide-y divide-[#e3e7ef] max-h-72 overflow-y-auto">
                  {filtered.map((item, idx) => (
                    <button
                      key={item.url + idx}
                      type="button"
                      onClick={() => navigateToItem(item)}
                      className={`w-full px-4 py-2.5 text-left flex items-center justify-between hover:bg-[#f5f6f8] transition-colors cursor-pointer ${
                        activeIndex === idx ? 'bg-[#f5f6f8]' : ''
                      }`}
                    >
                      <div>
                        <span className="block text-xs font-semibold text-[#14213d]">{item.title}</span>
                        <span className="block text-[11px] text-[#5b6478]">{item.subtitle}</span>
                      </div>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#e9eef7] text-[#14213d]">
                        {item.badge}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
