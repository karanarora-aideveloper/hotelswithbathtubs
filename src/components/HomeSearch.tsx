'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
  countries?: [string, string, number][]; // [name, slug, count]
  cities?: [string, string, string, string, number][]; // [name, country, countrySlug, citySlug, count]
  hotels?: [string, string, string, string][]; // [name, city, country, url]
};

export default function HomeSearch() {
  const router = useRouter();
  const { geo } = useGeo();
  const [searchData, setSearchData] = useState<SearchData | null>(null);
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isNavigating, setIsNavigating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load search index on mount
  useEffect(() => {
    fetch('/search-data.json')
      .then((res) => {
        if (res.ok) return res.json();
        // Fallback to locations.json if search-data.json not ready
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
      .catch(console.error);

    setIsNavigating(false);
  }, []);

  // Handle clicking outside the search component
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

  // Clean, tokenized query matching
  const cleanQuery = query.toLowerCase().replace(/,/g, ' ').replace(/\s+/g, ' ').trim();
  const tokens = useMemo(() => cleanQuery.split(' ').filter(Boolean), [cleanQuery]);

  // Compute matched items
  const filtered: SearchItem[] = useMemo(() => {
    if (!cleanQuery || !searchData) return [];

    const results: SearchItem[] = [];

    // Helper: checks if all query tokens are present in target string
    const matchAllTokens = (target: string) => {
      const lower = target.toLowerCase();
      return tokens.every((t) => lower.includes(t));
    };

    // 1. Search Cities (Priority)
    if (searchData.cities) {
      for (const [cityName, countryName, countrySlug, citySlug, count] of searchData.cities) {
        const fullCityString = `${cityName} ${countryName}`;
        if (matchAllTokens(fullCityString)) {
          const isExact = cityName.toLowerCase() === cleanQuery;
          const isPrefix = cityName.toLowerCase().startsWith(cleanQuery);
          results.push({
            type: 'city',
            title: cityName,
            subtitle: countryName,
            url: `/${countrySlug}/${citySlug}`,
            badge: `${count} ${count === 1 ? 'hotel' : 'hotels'}`,
            count: isExact ? 1000 : isPrefix ? 500 : 100,
          });
        }
      }
    }

    // 2. Search Hotels (Direct hotel match, e.g. "Mayfair", "The Greenwich")
    if (searchData.hotels) {
      for (const [hotelName, cityName, countryName, url] of searchData.hotels) {
        const fullHotelString = `${hotelName} ${cityName} ${countryName}`;
        if (matchAllTokens(fullHotelString)) {
          const isExact = hotelName.toLowerCase() === cleanQuery;
          const isPrefix = hotelName.toLowerCase().startsWith(cleanQuery);
          results.push({
            type: 'hotel',
            title: hotelName,
            subtitle: `${cityName}, ${countryName}`,
            url,
            badge: 'Bathtub Hotel',
            count: isExact ? 900 : isPrefix ? 400 : 50,
          });
        }
      }
    }

    // 3. Search Countries
    if (searchData.countries) {
      for (const [countryName, countrySlug, count] of searchData.countries) {
        if (matchAllTokens(countryName)) {
          const isExact = countryName.toLowerCase() === cleanQuery;
          results.push({
            type: 'country',
            title: countryName,
            subtitle: `Explore all bathtub hotels in ${countryName}`,
            url: `/${countrySlug}`,
            badge: `${count} cities`,
            count: isExact ? 800 : 20,
          });
        }
      }
    }

    // Sort by relevance score
    results.sort((a, b) => (b.count || 0) - (a.count || 0));

    // Limit to top 8 distinct items for snappy presentation
    return results.slice(0, 8);
  }, [cleanQuery, tokens, searchData]);

  // Zero results tracking when user pauses
  useEffect(() => {
    if (
      isOpen &&
      cleanQuery.length >= 2 &&
      filtered.length === 0 &&
      searchData &&
      (searchData.cities?.length || 0) > 0
    ) {
      const timer = setTimeout(() => {
        recordSearchZeroResults(query.trim(), 'home_search_empty');
      }, 750);
      return () => clearTimeout(timer);
    }
  }, [isOpen, cleanQuery, filtered.length, searchData, query]);

  function navigateToItem(item: SearchItem) {
    recordSearchSelection(item.title, item.subtitle, query.trim());
    setIsOpen(false);
    setIsNavigating(true);
    router.push(item.url);
  }

  function handleSearchClick() {
    if (filtered.length > 0) {
      const selected = activeIndex >= 0 && activeIndex < filtered.length ? filtered[activeIndex] : filtered[0];
      navigateToItem(selected);
    } else if (query.trim().length > 0) {
      recordSearchZeroResults(query.trim(), 'home_search_submit');
      setIsOpen(true);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!isOpen || filtered.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered.length > 0) {
          navigateToItem(filtered[0]);
        } else if (query.trim().length > 0) {
          recordSearchZeroResults(query.trim(), 'home_search_enter');
          setIsOpen(true);
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
      const selected = activeIndex >= 0 && activeIndex < filtered.length ? filtered[activeIndex] : filtered[0];
      navigateToItem(selected);
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
                ? 'Search city or hotel (e.g. Puri, Goa, Udaipur, Taj)...'
                : 'Search city or hotel (e.g. New York, Miami, Four Seasons)...'
            }
            className="w-full px-4 md:px-6 py-3.5 md:py-4 text-sm sm:text-base md:text-lg font-semibold bg-gray-100 rounded-xl outline-none focus:bg-white focus:ring-4 focus:ring-accent/20 border-2 border-transparent focus:border-accent transition-all pr-10"
          />

          {query && (
            <button
              onClick={() => {
                setQuery('');
                setIsOpen(false);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}

          {isOpen && query.trim() && (
            <div className="absolute top-full mt-2 left-0 right-0 bg-white border border-border shadow-2xl rounded-2xl overflow-hidden z-30 max-h-96 overflow-y-auto text-left divide-y divide-gray-100 animate-in fade-in slide-in-from-top-1 duration-150">
              {filtered.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-2xl mb-2">🔍</p>
                  <p className="text-sm font-semibold text-gray-800">
                    No results for &ldquo;{query}&rdquo;
                  </p>
                  <p className="text-xs text-gray-500 mt-1 mb-4">
                    Try searching for another city, hotel name, or popular destination:
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {(geo.isIndia
                      ? [
                          { name: 'Puri', url: '/india/puri' },
                          { name: 'Goa', url: '/india/goa' },
                          { name: 'Udaipur', url: '/india/udaipur' },
                          { name: 'Manali', url: '/india/manali' },
                          { name: 'Jaipur', url: '/india/jaipur' },
                        ]
                      : [
                          { name: 'New York', url: '/usa/new-york' },
                          { name: 'Miami', url: '/usa/miami' },
                          { name: 'Las Vegas', url: '/usa/las-vegas' },
                          { name: 'Chicago', url: '/usa/chicago' },
                          { name: 'London', url: '/uk/london' },
                        ]
                    ).map((sug) => (
                      <Link
                        key={sug.name}
                        href={sug.url}
                        onClick={() => setIsOpen(false)}
                        className="text-xs font-semibold px-3 py-1.5 bg-gray-100 hover:bg-accent/10 hover:text-accent text-gray-700 rounded-lg transition-colors"
                      >
                        {sug.name} &rarr;
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                filtered.map((item, i) => (
                  <Link
                    key={`${item.type}-${item.url}`}
                    href={item.url}
                    prefetch={true}
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={() => {
                      setIsOpen(false);
                      setIsNavigating(true);
                      recordSearchSelection(item.title, item.subtitle, query.trim());
                    }}
                    onMouseEnter={() => setActiveIndex(i)}
                    className={`w-full text-left px-4 py-3.5 text-sm transition-colors flex items-center justify-between group ${
                      i === activeIndex
                        ? 'bg-accent/10 text-accent'
                        : 'text-text-main hover:bg-accent/10 hover:text-accent'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-lg flex-shrink-0">
                        {item.type === 'hotel' ? '🏨' : item.type === 'city' ? '📍' : '🌍'}
                      </span>
                      <div className="truncate">
                        <div className="font-bold text-gray-900 group-hover:text-accent truncate">
                          {item.title}
                        </div>
                        <div className="text-xs text-gray-500 truncate">{item.subtitle}</div>
                      </div>
                    </div>
                    {item.badge && (
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 group-hover:bg-accent/20 group-hover:text-accent flex-shrink-0 ml-3">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                ))
              )}
            </div>
          )}
        </div>

        <button
          onClick={handleSearchClick}
          disabled={isNavigating}
          className={`bg-gradient-to-br from-accent to-accent-hover text-white px-8 md:px-10 py-3.5 md:py-4 text-base md:text-lg font-bold rounded-xl hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/30 transition-all w-full md:w-auto flex items-center justify-center gap-2 flex-shrink-0 ${
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
