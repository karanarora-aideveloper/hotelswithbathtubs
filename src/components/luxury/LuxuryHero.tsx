'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { sendSearch } from '@/lib/events';
import { useGeo } from '@/lib/useGeo';
import { getCountryDisplayName } from '@/lib/countries';

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

export interface LuxuryHeroStats {
  totalHotels: number;
  totalCountries: number;
  provenCount: number;
}

interface LuxuryHeroProps {
  stats?: LuxuryHeroStats;
  popularCitiesMap?: Record<string, { city: string; countrySlug: string }[]>;
}

const DEFAULT_STATS: LuxuryHeroStats = {
  totalHotels: 5286,
  totalCountries: 119,
  provenCount: 497,
};

const DEFAULT_GLOBAL_CITIES = [
  { city: 'Las Vegas', countrySlug: 'usa' },
  { city: 'Delhi', countrySlug: 'india' },
  { city: 'Orlando', countrySlug: 'usa' },
  { city: 'Houston', countrySlug: 'usa' },
  { city: 'San Diego', countrySlug: 'usa' },
];

export default function LuxuryHero({ stats, popularCitiesMap }: LuxuryHeroProps) {
  const router = useRouter();
  const { geo } = useGeo();

  const [query, setQuery] = useState('');
  const [selectedTub, setSelectedTub] = useState<'all' | 'bathtub' | 'jetted' | 'hot' | 'soaking'>('all');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [searchData, setSearchData] = useState<SearchData | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isFetchingSearch = useRef(false);

  const heroStats = stats || DEFAULT_STATS;

  // Track localStorage hwb_country directly for instant response to test changes
  const [storedCountry, setStoredCountry] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const checkStored = () => {
      setStoredCountry(localStorage.getItem('hwb_country'));
    };
    checkStored();
    window.addEventListener('storage', checkStored);
    window.addEventListener('hwb_country_change', checkStored);
    return () => {
      window.removeEventListener('storage', checkStored);
      window.removeEventListener('hwb_country_change', checkStored);
    };
  }, []);

  // Resolve active country code and display name
  const effectiveCountryCode = (storedCountry || geo.countryCode || '').trim().toUpperCase();

  // Resolve popular cities for chips
  const { popularCities, popularLabel } = useMemo(() => {
    if (popularCitiesMap && effectiveCountryCode) {
      const countryCities = popularCitiesMap[effectiveCountryCode];
      if (countryCities && countryCities.length >= 5) {
        const name = getCountryDisplayName(effectiveCountryCode);
        return {
          popularCities: countryCities.slice(0, 5),
          popularLabel: `Popular in ${name}:`,
        };
      }
    }
    // Fallback when country has fewer than 5 cities or no hotels
    const globalList = popularCitiesMap?.['GLOBAL'] || DEFAULT_GLOBAL_CITIES;
    return {
      popularCities: globalList.slice(0, 5),
      popularLabel: 'Popular destinations:',
    };
  }, [popularCitiesMap, effectiveCountryCode]);

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

  const buildTargetUrl = (baseUrl: string) => {
    if (selectedTub === 'all') return baseUrl;
    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}tub=${selectedTub}`;
  };

  const navigateToItem = (item: SearchItem) => {
    sendSearch({
      term: query.trim() || item.title,
      results_count: filtered.length || 1,
      country: item.subtitle,
      city: item.title,
    });
    setIsOpen(false);
    router.push(buildTargetUrl(item.url));
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
    <div className="relative bg-[#0a142d]">
      {/* High-priority LCP Preload */}
      <link
        rel="preload"
        as="image"
        href="https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/shangri-la-the-shard-london-london-1.webp"
        fetchPriority="high"
      />

      {/* Hero Section matching Option A mockup */}
      <div
        className="hero-section relative min-h-[640px] md:min-h-[620px] h-[calc(100svh-64px)] flex items-center justify-center overflow-hidden bg-cover bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/shangri-la-the-shard-london-london-1.webp')",
          backgroundPosition: 'center 60%',
        }}
      >
        {/* Navy gradient overlay matching rgba(10,20,45,.35) to rgba(10,20,45,.55) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(180deg, rgba(10, 20, 45, 0.35), rgba(10, 20, 45, 0.55))',
          }}
        />

        {/* Hero container matching shared page width */}
        <div className="relative z-10 w-full max-w-[1200px] mx-auto px-4 sm:px-8 text-center text-white flex flex-col items-center justify-center">
          <div className="w-full">
            {/* Eyebrow: computed from data */}
            <div className="text-[12px] tracking-[0.24em] uppercase text-white/90 mb-3 font-semibold font-manrope">
              {heroStats.totalHotels.toLocaleString()} hotels · {heroStats.totalCountries} countries
            </div>

            {/* Title H1 */}
            <h1 className="w-full font-playfair text-white text-[38px] sm:text-[54px] md:text-[64px] leading-[1.05] font-semibold mb-3 tracking-tight">
              Find a room with a bathtub
            </h1>

            {/* Lead */}
            <p className="text-white/92 text-[15px] sm:text-[18px] leading-[1.4] mb-6 sm:mb-7 font-manrope max-w-2xl mx-auto">
              We show the exact room to book, and whether a booking site lists the tub.
            </p>

            {/* Search card: Centered white card with Where, Tub type, Search button */}
            <div
              ref={containerRef}
              onMouseEnter={loadSearchData}
              className="relative w-full max-w-xl mx-auto bg-white rounded-[16px] p-2 flex flex-col sm:flex-row items-stretch shadow-[0_18px_50px_rgba(10,20,45,0.25)] text-left gap-0 text-[#14213d]"
            >
              <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-stretch w-full gap-0">
                {/* Where input */}
                <div className="flex-1 px-4 py-2 sm:py-2.5 sm:border-r border-[#e3e7ef] border-b sm:border-b-0">
                  <label
                    htmlFor="destination-hotel-search"
                    className="block text-[11px] tracking-[0.12em] uppercase text-[#14213d] mb-1 font-bold font-manrope"
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
                    className="w-full text-[15px] font-medium text-[#14213d] placeholder-[#888888] focus:outline-none bg-transparent font-manrope border-0 p-0"
                  />
                </div>

                {/* Tub type select */}
                <div className="flex-1 px-4 py-2 sm:py-2.5 sm:border-r border-[#e3e7ef] border-b sm:border-b-0 relative">
                  <label
                    htmlFor="tub-type-select"
                    className="block text-[11px] tracking-[0.12em] uppercase text-[#14213d] mb-1 font-bold font-manrope"
                  >
                    Tub type
                  </label>
                  <div className="relative">
                    <select
                      id="tub-type-select"
                      aria-label="Tub type"
                      value={selectedTub}
                      onChange={(e) => setSelectedTub(e.target.value as 'all' | 'bathtub' | 'jetted' | 'hot' | 'soaking')}
                      className="w-full text-[15px] font-medium text-[#14213d] bg-transparent border-0 p-0 focus:outline-none cursor-pointer appearance-none pr-5 font-manrope"
                    >
                      <option value="all">Any tub</option>
                      <option value="bathtub">Bathtub</option>
                      <option value="jetted">Jetted tub</option>
                      <option value="hot">Hot tub</option>
                      <option value="soaking">Soaking tub</option>
                    </select>
                    <span className="absolute right-0 top-1/2 -translate-y-1/2 text-xs text-[#5b6478] pointer-events-none">
                      ▾
                    </span>
                  </div>
                </div>

                {/* Search Button */}
                <button
                  type="submit"
                  className="bg-[#b08d57] hover:bg-[#9c7b48] text-white border-0 rounded-[12px] px-8 py-3.5 sm:py-0 font-bold text-[16px] font-manrope shrink-0 cursor-pointer transition-colors shadow-xs mt-2 sm:mt-0"
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

            {/* Popular in {Country}: pills */}
            <div className="flex flex-wrap gap-2 items-center justify-center text-[13px] text-white mt-4 sm:mt-5 font-manrope">
              <span className="opacity-90">{popularLabel}</span>
              {popularCities.map((c) => (
                <Link
                  key={c.city}
                  href={buildTargetUrl(`/${c.countrySlug}/${c.city.toLowerCase().replace(/\s+/g, '-')}`)}
                  prefetch={false}
                  className="px-3.5 py-1.5 rounded-full bg-white/16 hover:bg-white/25 border border-white/35 text-white font-semibold text-[13px] transition-all backdrop-blur-xs"
                >
                  {c.city}
                </Link>
              ))}
            </div>

            {/* Proof line: computed from data */}
            <div className="inline-flex items-center justify-center gap-2 text-[14px] text-white/95 mt-5 sm:mt-6 font-manrope">
              <span className="w-2 h-2 rounded-full bg-[#3ccf8e] shrink-0 inline-block" />
              <span>{heroStats.provenCount.toLocaleString()} hotels have the tub proven on a booking site</span>
            </div>
          </div>
        </div>

        {/* Photo credit bottom right */}
        <div className="absolute right-4 sm:right-6 bottom-4 text-white/75 text-[11px] font-manrope pointer-events-none">
          Photo: Shangri-La The Shard, London
        </div>
      </div>
    </div>
  );
}
