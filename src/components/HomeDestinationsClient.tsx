'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import CityCard from '@/components/CityCard';
import { useGeo } from '@/lib/useGeo';
import { resolveCountry, slugify } from '@/lib/utils';

type CityItem = {
  _id: { city: string; country: string };
  hotelCount: number;
  image: string;
};

interface HomeDestinationsClientProps {
  usaCities: CityItem[];
  internationalCities: CityItem[];
  indiaCities: CityItem[];
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
  badgeLabel,
  cities,
  isInternational = false,
  comingSoonCard = false,
  pillPrefix = 'More Destinations:',
  maxPills,
  remainingCitiesFormatter,
}: FlashDestinationSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [visibleCount, setVisibleCount] = useState(12);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  const totalCount = cities.length;
  if (totalCount === 0) return null;

  const displayedCities = isExpanded ? cities.slice(0, visibleCount) : cities.slice(0, 12);
  const remainingCities = cities.slice(12);
  const hasMoreToStream = isExpanded && visibleCount < totalCount;

  // Flash List Progressive Virtual Streaming via IntersectionObserver
  useEffect(() => {
    if (!hasMoreToStream) return;
    const target = sentinelRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          // Stream next batch of 16 cards smoothly at 60fps
          setVisibleCount((prev) => Math.min(prev + 16, totalCount));
        }
      },
      { rootMargin: '600px 0px' }
    );

    observer.observe(target);
    return () => {
      observer.disconnect();
    };
  }, [hasMoreToStream, totalCount]);

  const handleExpand = () => {
    setIsExpanded(true);
    setVisibleCount(24);
  };

  const handleCollapse = () => {
    setIsExpanded(false);
    setVisibleCount(12);
    if (sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleLoadAll = () => {
    setVisibleCount(totalCount);
  };

  const pillsToRender = maxPills ? remainingCities.slice(0, maxPills) : remainingCities;
  const overflowPillsCount = maxPills && remainingCities.length > maxPills ? remainingCities.length - maxPills : 0;

  return (
    <div id={id} ref={sectionRef} className="scroll-mt-32">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 border-b border-gray-200 pb-4 gap-3">
        <div>
          {hubUrl ? (
            <Link href={hubUrl} className="group inline-flex items-center gap-2 hover:text-accent transition-colors">
              <span className="text-xl">{emoji}</span>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-accent-secondary group-hover:text-accent transition-colors">
                {title}
              </h2>
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xl">{emoji}</span>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-accent-secondary">
                {title}
              </h2>
            </div>
          )}
          <p className="text-text-muted text-xs sm:text-sm mt-1">{subtitle}</p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {badgeLabel && (
            <span className="px-3 py-1 bg-accent-secondary/10 text-accent-secondary font-semibold text-xs sm:text-sm rounded-full whitespace-nowrap">
              {badgeLabel}
            </span>
          )}
          {hubUrl && hubLabel && (
            <Link
              href={hubUrl}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-accent/10 hover:bg-accent hover:text-white text-accent font-semibold text-xs sm:text-sm rounded-full whitespace-nowrap transition-all group shadow-2xs"
            >
              <span>{hubLabel}</span>
              <span className="group-hover:translate-x-0.5 transition-transform">→</span>
            </Link>
          )}
        </div>
      </div>

      {/* Grid of Destination Cards (Lazy loaded & content-visibility optimized) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-8">
        {displayedCities.map((item) => (
          <CityCard
            key={`${item._id.city}-${item._id.country}`}
            city={item._id.city}
            country={item._id.country}
            hotelCount={item.hotelCount}
            image={item.image}
            isInternational={isInternational}
            priority={false}
          />
        ))}

        {/* Coming soon placeholder for Global Escapes */}
        {comingSoonCard && isExpanded && (
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-dashed border-gray-300 p-6 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center mb-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <p className="font-heading text-base font-bold text-accent-secondary mb-1">More Cities Coming Soon</p>
            <p className="text-xs text-text-muted leading-relaxed mb-3">Continuously adding verified boutique stays across Europe &amp; Asia.</p>
            <span className="text-2xs font-semibold text-accent uppercase tracking-wider">Audited Weekly</span>
          </div>
        )}
      </div>

      {/* Sentinel for Flash List Infinite Scroll */}
      {hasMoreToStream && (
        <div ref={sentinelRef} className="h-10 w-full flex items-center justify-center my-6" aria-hidden="true">
          <div className="flex items-center gap-2 text-xs text-text-muted font-medium bg-gray-50 px-4 py-2 rounded-full border border-gray-200 shadow-2xs animate-pulse">
            <div className="w-2 h-2 rounded-full bg-accent animate-ping" />
            <span>Streaming verified destinations ({visibleCount} of {totalCount})...</span>
          </div>
        </div>
      )}

      {/* Unexpanded Action Bar & Quick Links */}
      {!isExpanded && remainingCities.length > 0 && (
        <div className="mt-8 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleExpand}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-accent-secondary hover:bg-accent text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <span>Show All {totalCount} {title.split(' ')[0]} Destination Cards</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {remainingCitiesFormatter && (
            <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-xs">
              <span className="text-text-muted font-medium mr-1">{pillPrefix}</span>
              {pillsToRender.map((item) => {
                const formatted = remainingCitiesFormatter(item);
                return (
                  <Link
                    key={`${item._id.city}-${item._id.country}`}
                    href={formatted.href}
                    prefetch={false}
                    className="px-2.5 py-1 bg-white hover:bg-accent hover:text-white border border-gray-200 rounded-lg text-text-main transition-colors text-xs font-medium shadow-2xs"
                  >
                    {formatted.label}
                  </Link>
                );
              })}
              {overflowPillsCount > 0 && (
                <button
                  type="button"
                  onClick={handleExpand}
                  className="px-2.5 py-1 bg-accent/10 text-accent hover:bg-accent hover:text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  +{overflowPillsCount} more worldwide →
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Expanded Controls: Show Collapse & Jump Controls */}
      {isExpanded && (
        <div className="mt-10 pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-muted">
          <div className="flex items-center gap-2 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>
              Showing {Math.min(visibleCount, totalCount)} of {totalCount} destinations in {title}
            </span>
            {hasMoreToStream && (
              <button
                type="button"
                onClick={handleLoadAll}
                className="ml-2 text-accent font-semibold hover:underline"
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
            <span>Collapse to Top 12</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 15l7-7 7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

export default function HomeDestinationsClient({
  usaCities,
  internationalCities,
  indiaCities,
}: HomeDestinationsClientProps) {
  const { geo } = useGeo();
  const [selectedTab, setSelectedTab] = useState<'auto' | 'usa' | 'india' | 'global' | 'all'>('auto');
  const [filterQuery, setFilterQuery] = useState('');
  const [filterVisibleCount, setFilterVisibleCount] = useState(16);
  const filterSentinelRef = useRef<HTMLDivElement>(null);

  // Combine all destinations for instantaneous 0ms client-side filter
  const allDestinations = useMemo(() => {
    return [...usaCities, ...internationalCities, ...indiaCities];
  }, [usaCities, internationalCities, indiaCities]);

  // Load manual user preference from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('hwb_region_tab');
      if (saved && ['auto', 'usa', 'india', 'global', 'all'].includes(saved)) {
        setSelectedTab(saved as any);
      }
    } catch (_) {}
  }, []);

  const handleTabChange = (tab: 'auto' | 'usa' | 'india' | 'global' | 'all') => {
    setSelectedTab(tab);
    try {
      localStorage.setItem('hwb_region_tab', tab);
    } catch (_) {}
  };

  // Instant In-Section Destination Filter Results
  const normalizedFilter = filterQuery.trim().toLowerCase();
  const filteredMatches = useMemo(() => {
    if (!normalizedFilter) return [];
    return allDestinations.filter(
      (c) =>
        c._id.city.toLowerCase().includes(normalizedFilter) ||
        c._id.country.toLowerCase().includes(normalizedFilter)
    );
  }, [allDestinations, normalizedFilter]);

  // Reset filter visible count when query changes
  useEffect(() => {
    setFilterVisibleCount(16);
  }, [normalizedFilter]);

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

  const isIndiaVisitor = geo.isIndia;

  const renderUSASection = () => (
    <FlashDestinationSection
      id="section-usa"
      emoji="🇺🇸"
      title="United States Luxury Escapes"
      subtitle="Premier American city stays and romantic getaways featuring verified in-room jacuzzis & deep soaking tubs"
      hubUrl="/usa"
      hubLabel={`Explore All ${usaCities.length} US Destinations`}
      badgeLabel={`${usaCities.length} Destinations`}
      cities={usaCities}
      isInternational={true}
      pillPrefix="More US Destinations:"
      remainingCitiesFormatter={(item) => ({
        href: `/usa/${slugify(item._id.city)}`,
        label: `${item._id.city} (${item.hotelCount})`,
      })}
    />
  );

  const renderInternationalSection = () => (
    <FlashDestinationSection
      id="section-global"
      emoji="🌍"
      title="Global Romantic Escapes"
      subtitle="World-class luxury destinations in Europe, Asia & the Middle East with verified private tubs"
      badgeLabel={`${internationalCities.length} Global Cities`}
      cities={internationalCities}
      isInternational={true}
      comingSoonCard={true}
      pillPrefix="More Global Escapes:"
      maxPills={32}
      remainingCitiesFormatter={(item) => {
        const countrySlug = resolveCountry(item._id.country).slug;
        return {
          href: `/${countrySlug}/${slugify(item._id.city)}`,
          label: `${item._id.city}, ${item._id.country} (${item.hotelCount})`,
        };
      }}
    />
  );

  const renderIndiaSection = () => (
    <FlashDestinationSection
      id="section-india"
      emoji="🇮🇳"
      title="India Getaways"
      subtitle="Top romantic destinations across India featuring verified private jacuzzi suites & in-room soaking tubs"
      hubUrl="/india"
      hubLabel={`Explore All ${indiaCities.length} Indian Cities`}
      badgeLabel={`${indiaCities.length} Indian Cities`}
      cities={indiaCities}
      isInternational={false}
      pillPrefix="More India Getaways:"
      remainingCitiesFormatter={(item) => ({
        href: `/india/${slugify(item._id.city)}`,
        label: `${item._id.city} (${item.hotelCount})`,
      })}
    />
  );

  return (
    <div className="space-y-8">
      {/* Interactive Region Selection Bar + Instant Search */}
      <div className="bg-gray-50/95 border border-border rounded-2xl p-3 sm:p-4 shadow-2xs w-full flex flex-col gap-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Quick-Access Region Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full min-w-0 pb-1 lg:pb-0">
            <button
              onClick={() => handleTabChange('auto')}
              className={`px-4 py-2 min-h-[40px] rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer ${
                selectedTab === 'auto'
                  ? 'bg-accent-secondary text-white shadow-sm'
                  : 'bg-white text-text-main border border-gray-200 hover:bg-gray-100'
              }`}
            >
              <span>📍 For You</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${selectedTab === 'auto' ? 'bg-white/20' : 'bg-gray-100'}`}>
                {isIndiaVisitor ? '🇮🇳 India' : '🇺🇸 USA'}
              </span>
            </button>

            <button
              onClick={() => handleTabChange('usa')}
              className={`px-4 py-2 min-h-[40px] rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer ${
                selectedTab === 'usa'
                  ? 'bg-accent-secondary text-white shadow-sm'
                  : 'bg-white text-text-main border border-gray-200 hover:bg-gray-100'
              }`}
            >
              <span>🇺🇸 United States</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${selectedTab === 'usa' ? 'bg-white/20' : 'bg-gray-100'}`}>
                {usaCities.length}
              </span>
            </button>

            <button
              onClick={() => handleTabChange('india')}
              className={`px-4 py-2 min-h-[40px] rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer ${
                selectedTab === 'india'
                  ? 'bg-accent-secondary text-white shadow-sm'
                  : 'bg-white text-text-main border border-gray-200 hover:bg-gray-100'
              }`}
            >
              <span>🇮🇳 India</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${selectedTab === 'india' ? 'bg-white/20' : 'bg-gray-100'}`}>
                {indiaCities.length}
              </span>
            </button>

            <button
              onClick={() => handleTabChange('global')}
              className={`px-4 py-2 min-h-[40px] rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer ${
                selectedTab === 'global'
                  ? 'bg-accent-secondary text-white shadow-sm'
                  : 'bg-white text-text-main border border-gray-200 hover:bg-gray-100'
              }`}
            >
              <span>🌍 Global</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${selectedTab === 'global' ? 'bg-white/20' : 'bg-gray-100'}`}>
                {internationalCities.length}
              </span>
            </button>

            <button
              onClick={() => handleTabChange('all')}
              className={`px-4 py-2 min-h-[40px] rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer ${
                selectedTab === 'all'
                  ? 'bg-accent text-white shadow-sm'
                  : 'bg-white text-text-main border border-gray-200 hover:bg-gray-100'
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
              className="w-full pl-9 pr-8 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent shadow-2xs transition-all placeholder:text-gray-400"
            />
            <svg
              className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
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
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 w-5 h-5 flex items-center justify-center rounded-full hover:bg-gray-100 text-xs font-bold cursor-pointer"
                aria-label="Clear filter"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Region detection prompt */}
        <div className="text-2xs text-text-muted font-medium flex items-center justify-between border-t border-gray-200/60 pt-2 px-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>
              Detected location: <strong>{geo.country}</strong> {isIndiaVisitor ? '(🇮🇳 India layout active)' : '(🇺🇸 USA layout active)'}
            </span>
          </div>
          <span className="text-gray-400 hidden sm:inline">Flash List progressive streaming active</span>
        </div>
      </div>

      {/* When filtering by text, render Instant Matches Grid */}
      {normalizedFilter ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <div>
              <h3 className="font-heading text-xl sm:text-2xl font-bold text-accent-secondary">
                Search Results for &ldquo;{filterQuery}&rdquo;
              </h3>
              <p className="text-xs text-text-muted mt-0.5">
                Found {filteredMatches.length} matching verified bathtub destinations
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFilterQuery('')}
              className="text-xs font-bold text-accent hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Clear Filter</span>
              <span>✕</span>
            </button>
          </div>

          {filteredMatches.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-8">
                {filteredMatches.slice(0, filterVisibleCount).map((item) => (
                  <CityCard
                    key={`filter-${item._id.city}-${item._id.country}`}
                    city={item._id.city}
                    country={item._id.country}
                    hotelCount={item.hotelCount}
                    image={item.image}
                    isInternational={item._id.country.toLowerCase() !== 'india'}
                    priority={false}
                  />
                ))}
              </div>

              {filterVisibleCount < filteredMatches.length && (
                <div ref={filterSentinelRef} className="h-10 w-full flex items-center justify-center my-4" aria-hidden="true">
                  <div className="flex items-center gap-2 text-xs text-text-muted font-medium bg-gray-50 px-4 py-2 rounded-full border border-gray-200 shadow-2xs animate-pulse">
                    <div className="w-2 h-2 rounded-full bg-accent animate-ping" />
                    <span>Streaming matching destinations ({filterVisibleCount} of {filteredMatches.length})...</span>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 text-center max-w-md mx-auto my-12">
              <span className="text-3xl mb-2 block">🔍</span>
              <h4 className="font-heading font-bold text-gray-800 text-base mb-1">No destinations found</h4>
              <p className="text-xs text-text-muted mb-4">
                No verified bathtub stays match &ldquo;{filterQuery}&rdquo;. Try searching for popular hubs like Paris, New York, Goa, London, or Tokyo.
              </p>
              <button
                type="button"
                onClick={() => setFilterQuery('')}
                className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
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

          {/* Auto or All: Render in geo-prioritized order */}
          {(selectedTab === 'auto' || selectedTab === 'all') && (
            <div className="space-y-16">
              {isIndiaVisitor ? (
                <>
                  {renderIndiaSection()}
                  {renderUSASection()}
                  {renderInternationalSection()}
                </>
              ) : (
                <>
                  {renderUSASection()}
                  {renderInternationalSection()}
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
