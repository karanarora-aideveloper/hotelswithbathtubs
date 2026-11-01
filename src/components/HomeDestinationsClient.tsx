'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import CityCard from '@/components/CityCard';
import { useGeo } from '@/lib/useGeo';
import {
  isCountryWithHotels,
  getFlagEmoji,
  getCountryDisplayName,
  COUNTRIES_WITH_HOTELS,
} from '@/lib/countries';

type CityItem = {
  _id: { city: string; country: string };
  hotelCount: number;
  image: string;
  minPrice?: string;
  rating?: number;
  totalReviews?: number;
  hasJacuzzi?: boolean;
};

interface HomeDestinationsClientProps {
  usaCities: CityItem[];
  internationalCities: CityItem[];
  indiaCities: CityItem[];
  totalUsaCount?: number;
  totalInternationalCount?: number;
  totalIndiaCount?: number;
}

interface FlashDestinationSectionProps {
  id: string;
  emoji: string;
  title: string;
  subtitle: string;
  hubUrl?: string;
  hubLabel?: string;
  badgeLabel?: string;
  cities: CityItem[];
  totalCount?: number;
  isInternational?: boolean;
  comingSoonCard?: boolean;
  pillPrefix?: string;
  maxPills?: number;
  remainingCitiesFormatter?: (item: CityItem) => { href: string; label: string };
}

function FlashDestinationSection({
  id,
  emoji,
  title,
  subtitle,
  hubUrl,
  hubLabel,
  cities,
  isInternational = false,
}: FlashDestinationSectionProps) {
  if (cities.length === 0) return null;

  // Show at most 6 city cards per region (REDESIGN-B4C)
  const displayedCities = cities.slice(0, 6);

  return (
    <div id={id} className="scroll-mt-32">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 border-b border-[#e3e7ef] pb-3 gap-2">
        <div>
          {hubUrl ? (
            <Link href={hubUrl} prefetch={false} className="group inline-flex items-center gap-2 hover:text-[#b08d57] transition-colors">
              <span className="text-xl">{emoji}</span>
              <h3 className="font-playfair text-xl sm:text-2xl font-semibold text-[#14213d] group-hover:text-[#b08d57] transition-colors tracking-tight">
                {title}
              </h3>
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xl">{emoji}</span>
              <h3 className="font-playfair text-xl sm:text-2xl font-semibold text-[#14213d] tracking-tight">
                {title}
              </h3>
            </div>
          )}
          <p className="text-[#5b6478] text-xs sm:text-[13px] mt-0.5">{subtitle}</p>
        </div>

        {hubUrl && (
          <Link
            href={hubUrl}
            prefetch={false}
            className="text-xs font-bold text-[#b08d57] hover:underline self-start sm:self-auto inline-flex items-center gap-1 shrink-0 font-manrope"
          >
            <span>{hubLabel || 'View all destinations →'}</span>
          </Link>
        )}
      </div>

      {/* Grid of at most 6 Destination Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {displayedCities.map((item) => (
          <CityCard
            key={`${item._id.city}-${item._id.country}`}
            city={item._id.city}
            country={item._id.country}
            hotelCount={item.hotelCount}
            image={item.image}
            isInternational={isInternational}
            priority={false}
            minPrice={item.minPrice}
            rating={item.rating}
            totalReviews={item.totalReviews}
            hasJacuzzi={item.hasJacuzzi}
          />
        ))}
      </div>

      {/* View All Link below cards */}
      {hubUrl && (
        <div className="mt-4 pt-2 flex justify-end">
          <Link
            href={hubUrl}
            prefetch={false}
            className="text-xs font-bold text-[#b08d57] hover:underline inline-flex items-center gap-1 font-manrope"
          >
            <span>{hubLabel || 'View all destinations →'}</span>
          </Link>
        </div>
      )}
    </div>
  );
}

export default function HomeDestinationsClient({
  usaCities,
  internationalCities,
  indiaCities,
  totalUsaCount,
  totalInternationalCount,
  totalIndiaCount,
}: HomeDestinationsClientProps) {
  const { geo } = useGeo();
  const [selectedTab, setSelectedTab] = useState<'auto' | 'usa' | 'india' | 'global' | 'all'>('auto');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('hwb_region_tab');
      if (saved && ['auto', 'usa', 'india', 'global', 'all'].includes(saved)) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelectedTab(saved as 'auto' | 'usa' | 'india' | 'global' | 'all');
      }
    } catch {}
  }, []);

  const [filterQuery, setFilterQuery] = useState('');
  const [filterVisibleCount, setFilterVisibleCount] = useState(16);
  const filterSentinelRef = useRef<HTMLDivElement>(null);

  // Combine all destinations for instantaneous 0ms client-side filter
  const allDestinations = useMemo(() => {
    return [...usaCities, ...internationalCities, ...indiaCities];
  }, [usaCities, internationalCities, indiaCities]);

  const handleTabChange = (tab: 'auto' | 'usa' | 'india' | 'global' | 'all') => {
    setSelectedTab(tab);
    try {
      localStorage.setItem('hwb_region_tab', tab);
    } catch {}
  };

  // Instant In-Section Destination Filter Results
  const normalizedFilter = filterQuery.trim().toLowerCase();
  const [prevNormalizedFilter, setPrevNormalizedFilter] = useState(normalizedFilter);
  if (prevNormalizedFilter !== normalizedFilter) {
    setPrevNormalizedFilter(normalizedFilter);
    setFilterVisibleCount(16);
  }

  const filteredMatches = useMemo(() => {
    if (!normalizedFilter) return [];
    return allDestinations.filter(
      (c) =>
        c._id.city.toLowerCase().includes(normalizedFilter) ||
        c._id.country.toLowerCase().includes(normalizedFilter)
    );
  }, [allDestinations, normalizedFilter]);

  // Progressive streaming for filter results if many match
  useEffect(() => {
    if (!normalizedFilter || filterVisibleCount >= filteredMatches.length) return;
    const target = filterSentinelRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setFilterVisibleCount((prev) => Math.min(prev + 16, filteredMatches.length));
        }
      },
      { rootMargin: '400px 0px' }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [normalizedFilter, filterVisibleCount, filteredMatches.length]);

  const visitorCode = geo.countryCode && geo.countryCode !== 'XX' ? geo.countryCode : '';
  const hasVisitorInventory = Boolean(visitorCode) && isCountryWithHotels(visitorCode);
  const visitorFlag = getFlagEmoji(visitorCode);
  const visitorDisplayName = getCountryDisplayName(visitorCode);

  const getVisitorCities = (code: string): CityItem[] => {
    if (code === 'GB') {
      const ukMatches = allDestinations.filter((c) => {
        const co = (c._id.country || '').toLowerCase();
        return co === 'uk' || co === 'united kingdom' || co === 'england';
      });
      if (ukMatches.length > 0) return ukMatches;
      return [
        {
          _id: { city: 'London', country: 'UK' },
          hotelCount: 24,
          image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/timeless-victorian-retreat-by-hyde-park-london-1758-1.webp',
          minPrice: '£180',
          rating: 4.8,
          totalReviews: 210,
          hasJacuzzi: true,
        },
      ];
    }
    if (code === 'AE') {
      const aeMatches = allDestinations.filter((c) => {
        const co = (c._id.country || '').toLowerCase();
        return co === 'uae' || co === 'united arab emirates' || co === 'dubai';
      });
      if (aeMatches.length > 0) return aeMatches;
      return [
        {
          _id: { city: 'Dubai', country: 'UAE' },
          hotelCount: 9,
          image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/bathtub-atlantis-the-royal-dubai.webp',
          minPrice: '$299',
          rating: 4.8,
          totalReviews: 120,
          hasJacuzzi: true,
        },
      ];
    }
    const countryEntry = COUNTRIES_WITH_HOTELS.find((x) => x.code === code);
    const slug = countryEntry?.slug || code.toLowerCase();
    const nameLower = countryEntry?.name.toLowerCase() || '';
    const matches = allDestinations.filter((c) => {
      const co = (c._id.country || '').toLowerCase();
      return co === nameLower || co === slug;
    });
    if (matches.length > 0) return matches;
    return [
      {
        _id: { city: countryEntry?.name || 'Capital', country: countryEntry?.name || code },
        hotelCount: 10,
        image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/bathtub-skylofts-at-mgm-grand-las-vegas.webp',
        minPrice: '$199',
        rating: 4.8,
        totalReviews: 50,
        hasJacuzzi: true,
      },
    ];
  };

  const renderVisitorCountrySection = () => {
    if (!visitorCode || !hasVisitorInventory) return null;
    const citiesForCountry = getVisitorCities(visitorCode);
    const entry = COUNTRIES_WITH_HOTELS.find((x) => x.code === visitorCode);
    const countrySlug = entry?.slug || visitorCode.toLowerCase();
    const displayName = visitorDisplayName || visitorCode;
    const title = `${displayName} Destinations`;

    return (
      <FlashDestinationSection
        id={`section-${visitorCode.toLowerCase()}`}
        emoji={visitorFlag}
        title={title}
        subtitle={`Destinations across ${displayName} featuring rooms with a private in-room bathtub`}
        hubUrl={`/${countrySlug}`}
        hubLabel={`View all ${displayName} destinations →`}
        cities={citiesForCountry}
        isInternational={true}
      />
    );
  };

  const renderUSASection = () => (
    <FlashDestinationSection
      id="section-usa"
      emoji="🇺🇸"
      title="United States Destinations"
      subtitle="American city stays featuring in-room jacuzzis & deep soaking tubs"
      hubUrl="/usa"
      hubLabel="View all US destinations →"
      cities={usaCities}
      isInternational={false}
    />
  );

  const renderInternationalSection = () => (
    <FlashDestinationSection
      id="section-global"
      emoji="🌍"
      title="Global Destinations"
      subtitle="Destinations in Europe, Asia & the Middle East with private in-room tubs"
      hubUrl="/destinations"
      hubLabel="View all global destinations →"
      cities={internationalCities}
      isInternational={true}
    />
  );

  const renderIndiaSection = () => (
    <FlashDestinationSection
      id="section-india"
      emoji="🇮🇳"
      title="India Getaways"
      subtitle="Destinations across India featuring private jacuzzi suites & in-room soaking tubs"
      hubUrl="/india"
      hubLabel="View all India destinations →"
      cities={indiaCities}
      isInternational={false}
    />
  );

  return (
    <div className="space-y-8">
      {/* Interactive Region Selection Bar + Instant Search */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-4 shadow-[0_2px_8px_rgba(0,0,0,0.03)] w-full flex flex-col gap-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Quick-Access Region Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full min-w-0 pb-1 lg:pb-0">
            {hasVisitorInventory ? (
              <button
                onClick={() => handleTabChange('auto')}
                className={`px-4 py-2 min-h-[40px] rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer ${
                  selectedTab === 'auto'
                    ? 'bg-[#1a6fde] text-white shadow-sm shadow-[#1a6fde]/25'
                    : 'bg-slate-50 text-slate-700 border border-slate-200/80 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span>📍 For You</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    selectedTab === 'auto'
                      ? 'bg-white/20 text-white'
                      : 'bg-white text-slate-600 border border-slate-200/60'
                  }`}
                >
                  {visitorFlag} {visitorDisplayName}
                </span>
              </button>
            ) : (
              <button
                onClick={() => handleTabChange('auto')}
                className={`px-4 py-2 min-h-[40px] rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer ${
                  selectedTab === 'auto'
                    ? 'bg-[#1a6fde] text-white shadow-sm shadow-[#1a6fde]/25'
                    : 'bg-slate-50 text-slate-700 border border-slate-200/80 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span>🌍 Popular</span>
              </button>
            )}

            <button
              onClick={() => handleTabChange('usa')}
              className={`px-4 py-2 min-h-[40px] rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer ${
                selectedTab === 'usa'
                  ? 'bg-[#1a6fde] text-white shadow-sm shadow-[#1a6fde]/25'
                  : 'bg-slate-50 text-slate-700 border border-slate-200/80 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span>🇺🇸 United States</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${selectedTab === 'usa' ? 'bg-white/20 text-white' : 'bg-white text-slate-600 border border-slate-200/60'}`}>
                {totalUsaCount ?? usaCities.length}
              </span>
            </button>

            <button
              onClick={() => handleTabChange('india')}
              className={`px-4 py-2 min-h-[40px] rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer ${
                selectedTab === 'india'
                  ? 'bg-[#1a6fde] text-white shadow-sm shadow-[#1a6fde]/25'
                  : 'bg-slate-50 text-slate-700 border border-slate-200/80 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span>🇮🇳 India</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${selectedTab === 'india' ? 'bg-white/20 text-white' : 'bg-white text-slate-600 border border-slate-200/60'}`}>
                {totalIndiaCount ?? indiaCities.length}
              </span>
            </button>

            <button
              onClick={() => handleTabChange('global')}
              className={`px-4 py-2 min-h-[40px] rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer ${
                selectedTab === 'global'
                  ? 'bg-[#1a6fde] text-white shadow-sm shadow-[#1a6fde]/25'
                  : 'bg-slate-50 text-slate-700 border border-slate-200/80 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span>🌍 Global</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${selectedTab === 'global' ? 'bg-white/20 text-white' : 'bg-white text-slate-600 border border-slate-200/60'}`}>
                {totalInternationalCount ?? internationalCities.length}
              </span>
            </button>

            <button
              onClick={() => handleTabChange('all')}
              className={`px-4 py-2 min-h-[40px] rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer ${
                selectedTab === 'all'
                  ? 'bg-[#1a6fde] text-white shadow-sm shadow-[#1a6fde]/25'
                  : 'bg-slate-50 text-slate-700 border border-slate-200/80 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span>✨ View All</span>
            </button>
          </div>

          {/* Instant In-Section Destination Filter Search */}
          <div className="relative w-full lg:w-72 flex-shrink-0">
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Filter 280+ destinations..."
              aria-label="Filter destinations by city or country"
              className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#1a6fde]/20 focus:border-[#1a6fde] shadow-2xs transition-all placeholder:text-slate-400 text-slate-900 font-medium"
            />
            <svg
              className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {filterQuery && (
              <button
                type="button"
                onClick={() => setFilterQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 w-5 h-5 flex items-center justify-center rounded-full hover:bg-slate-100 text-xs font-bold cursor-pointer"
                aria-label="Clear filter"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* When filtering by text, render Instant Matches Grid */}
      {normalizedFilter ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
            <div>
              <h3 className="font-heading text-xl sm:text-2xl font-black text-slate-900">
                Search Results for &ldquo;{filterQuery}&rdquo;
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Found {filteredMatches.length} matching bathtub destinations
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFilterQuery('')}
              className="text-xs font-bold text-[#1a6fde] hover:text-[#1559b8] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Clear Filter</span>
              <span>✕</span>
            </button>
          </div>

          {filteredMatches.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
                {filteredMatches.slice(0, filterVisibleCount).map((item) => (
                  <CityCard
                    key={`filter-${item._id.city}-${item._id.country}`}
                    city={item._id.city}
                    country={item._id.country}
                    hotelCount={item.hotelCount}
                    image={item.image}
                    isInternational={item._id.country.toLowerCase() !== 'india'}
                    priority={false}
                    minPrice={item.minPrice}
                    rating={item.rating}
                    totalReviews={item.totalReviews}
                    hasJacuzzi={item.hasJacuzzi}
                  />
                ))}
              </div>

              {filterVisibleCount < filteredMatches.length && (
                <div ref={filterSentinelRef} className="h-10 w-full flex items-center justify-center my-4" aria-hidden="true">
                  <div className="flex items-center gap-2 text-xs text-slate-600 font-medium bg-white px-4 py-2 rounded-full border border-slate-200 shadow-2xs animate-pulse">
                    <div className="w-2 h-2 rounded-full bg-[#1a6fde] animate-ping" />
                    <span>Streaming matching destinations ({filterVisibleCount} of {filteredMatches.length})...</span>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-8 text-center max-w-md mx-auto my-12 shadow-sm">
              <span className="text-3xl mb-2 block">🔍</span>
              <h4 className="font-heading font-bold text-slate-900 text-base mb-1">No destinations found</h4>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                No bathtub stays match &ldquo;{filterQuery}&rdquo;. Try searching for popular hubs like Paris, New York, Goa, London, or Tokyo.
              </p>
              <button
                type="button"
                onClick={() => setFilterQuery('')}
                className="px-5 py-2.5 bg-[#1a6fde] hover:bg-[#1559b8] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
              >
                Reset Filter
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Standard Tabbed Views */
        <>
          {selectedTab === 'usa' && renderUSASection()}
          {selectedTab === 'india' && renderIndiaSection()}
          {selectedTab === 'global' && renderInternationalSection()}

          {/* Auto or All: Render in visitor-country prioritized order */}
          {(selectedTab === 'auto' || selectedTab === 'all') && (
            <div className="space-y-16">
              {visitorCode === 'IN' ? (
                <>
                  {renderIndiaSection()}
                  {renderUSASection()}
                  {renderInternationalSection()}
                </>
              ) : visitorCode === 'US' ? (
                <>
                  {renderUSASection()}
                  {renderInternationalSection()}
                  {renderIndiaSection()}
                </>
              ) : hasVisitorInventory ? (
                <>
                  {renderVisitorCountrySection()}
                  {renderUSASection()}
                  {renderInternationalSection()}
                  {renderIndiaSection()}
                </>
              ) : (
                <>
                  {renderInternationalSection()}
                  {renderUSASection()}
                  {renderIndiaSection()}
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
