'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { isDirectPropertyUrl } from '@/lib/affiliate';
import HotelCardImage from '@/components/HotelCardImage';
import { slugify, isVacationRental, isJacuzziRoom } from '@/lib/utils';
import { isValidNeighborhood, isValidStreetAddress } from '@/lib/location';
import { sendViewDestination, sendFilterUsed } from '@/lib/events';
import { isHotelConfirmed, getLinkedPartners, getPartnerUrl } from '@/lib/evidence';
import { FavoriteButton } from '@/components/Favorites';
import OutboundLink from '@/components/OutboundLink';

type HotelData = {
  _id?: string;
  name: string;
  slug?: string;
  city?: string;
  country?: string;
  image?: string;
  images?: string[];
  partnerImages?: string[];
  url?: string;
  bookingUrl?: string;
  agodaUrl?: string;
  mmtUrl?: string;
  cleartripUrl?: string;
  expediaUrl?: string;
  hotelsComUrl?: string;
  vrboUrl?: string;
  tripUrl?: string;
  airbnbUrl?: string;
  price?: string;
  streetAddress?: string;
  rating?: number;
  reviewsCount?: number;
  tubType?: string;
  roomType?: string;
  neighborhood?: string;
  landmarkDistance?: string;
  description?: string;
  bookingTip?: string;
  amenities?: string[];
  importBatch?: string;
  bookingTubLabels?: string[];
  bathtubConfirmed?: boolean;
  crossVerifiedAt?: string;
};

function parsePrice(priceStr?: string): number {
  if (!priceStr) return 0;
  const match = priceStr.replace(/,/g, '').match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
}

export default function CityHotelsClient({
  hotels,
  cityName,
  countryName,
}: {
  hotels: HotelData[];
  cityName: string;
  countryName: string;
}) {
  const [tubProvenOnly, setTubProvenOnly] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'jacuzzi' | 'soaking' | 'tripled'>('all');
  const [selectedTubCategory, setSelectedTubCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'recommended' | 'rating' | 'price_asc' | 'price_desc' | 'reviews'>('recommended');
  const [stayStyle, setStayStyle] = useState<'all' | 'luxury' | 'apartment' | 'boutique' | 'hostel'>('all');
  const [priceRange, setPriceRange] = useState<'all' | 'budget' | 'mid' | 'luxury' | 'ultra'>('all');
  const [showFiltersMenu, setShowFiltersMenu] = useState(false);

  // Progressive loading / Infinite Scroll State
  const [visibleCount, setVisibleCount] = useState<number>(24);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Deduplicate hotels by URL signature
  const uniqueHotels = useMemo(() => {
    const seen = new Set<string>();
    return hotels.filter((h) => {
      const key = [h.url, h.agodaUrl, h.bookingUrl, h.tripUrl, h.name].filter(Boolean).join('|');
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [hotels]);

  // Proven count
  const provenCount = useMemo(() => {
    return uniqueHotels.filter(isHotelConfirmed).length;
  }, [uniqueHotels]);

  // Dynamically resolve currency symbol and thresholds
  const { budgetMax, midMax, ultraMin } = useMemo(() => {
    const isIndia = countryName.toLowerCase() === 'india';
    return {
      budgetMax: isIndia ? 5000 : 120,
      midMax: isIndia ? 12000 : 250,
      ultraMin: isIndia ? 25000 : 450,
    };
  }, [countryName]);

  const isJacuzziHotel = (h: HotelData) => isJacuzziRoom(h);

  const isSoakingHotel = (h: HotelData) => {
    const tub = (h.tubType || '').toLowerCase();
    const room = (h.roomType || '').toLowerCase();
    const ams = (h.amenities || []).join(' ').toLowerCase();
    const allText = `${tub} ${room} ${ams}`;
    return (
      allText.includes('bathtub') ||
      allText.includes('soaking') ||
      allText.includes('freestanding') ||
      allText.includes('clawfoot') ||
      /stone tub|stone bath|freestanding stone|carved stone/i.test(allText) ||
      allText.includes('marble') ||
      allText.includes('onsen')
    );
  };

  const isHotTubHotel = (h: HotelData) => {
    const tub = (h.tubType || '').toLowerCase();
    const room = (h.roomType || '').toLowerCase();
    return tub.includes('hot tub') || room.includes('hot tub');
  };

  const isLuxuryHotelStay = (h: HotelData) => {
    const text = `${h.name} ${h.roomType || ''} ${h.description || ''}`.toLowerCase();
    return (
      text.includes('5-star') ||
      text.includes('five star') ||
      text.includes('resort') ||
      text.includes('palace') ||
      (Number(h.rating) >= 9.0 && (h.reviewsCount || 0) > 20)
    );
  };

  const isApartmentStay = (h: HotelData) => {
    if (h.airbnbUrl) return true;
    const text = `${h.name} ${h.roomType || ''} ${h.description || ''}`.toLowerCase();
    return (
      text.includes('apartment') ||
      text.includes('flat') ||
      text.includes('villa') ||
      text.includes('chalet') ||
      text.includes('condo')
    );
  };

  const isBoutiqueStay = (h: HotelData) => {
    const text = `${h.name} ${h.roomType || ''} ${h.description || ''}`.toLowerCase();
    return (
      text.includes('boutique') ||
      text.includes('inn') ||
      text.includes('bed & breakfast') ||
      text.includes('lodge')
    );
  };

  const isHostelStay = (h: HotelData) => {
    const text = `${h.name} ${h.roomType || ''} ${h.description || ''}`.toLowerCase();
    return text.includes('hostel') || text.includes('poshtel');
  };

  const counts = useMemo(() => {
    let jacuzzi = 0;
    let soaking = 0;
    let tripled = 0;
    for (const h of uniqueHotels) {
      if (isJacuzziHotel(h)) jacuzzi++;
      if (isSoakingHotel(h)) soaking++;
      if (h.url && (h.agodaUrl || h.bookingUrl)) tripled++;
    }
    return {
      all: uniqueHotels.length,
      jacuzzi,
      soaking,
      tripled,
    };
  }, [uniqueHotels]);

  // Main filtering & sorting pipeline
  const filteredHotels = useMemo(() => {
    const result = uniqueHotels.filter((h) => {
      // 1. Proven filter
      if (tubProvenOnly && !isHotelConfirmed(h)) return false;

      // 2. Search keyword filter
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesName = h.name.toLowerCase().includes(term);
        const matchesRoom = (h.roomType || '').toLowerCase().includes(term);
        const matchesNeigh = (h.neighborhood || '').toLowerCase().includes(term);
        if (!matchesName && !matchesRoom && !matchesNeigh) return false;
      }

      // 3. Category filter
      if (selectedFilter === 'jacuzzi' && !isJacuzziHotel(h)) return false;
      if (selectedFilter === 'soaking' && !isSoakingHotel(h)) return false;
      if (selectedFilter === 'tripled') {
        if (!(h.url && (h.agodaUrl || h.bookingUrl))) return false;
      }

      // 4. Hot tub specific filter
      if (selectedTubCategory === 'Hot tub' && !isHotTubHotel(h)) return false;

      // 5. Stay style filter
      if (stayStyle === 'luxury' && !isLuxuryHotelStay(h)) return false;
      if (stayStyle === 'apartment' && !isApartmentStay(h)) return false;
      if (stayStyle === 'boutique' && !isBoutiqueStay(h)) return false;
      if (stayStyle === 'hostel' && !isHostelStay(h)) return false;

      // 6. Price range filter
      if (priceRange !== 'all' && h.price) {
        const p = parsePrice(h.price);
        if (p > 0) {
          if (priceRange === 'budget' && p >= budgetMax) return false;
          if (priceRange === 'mid' && (p < budgetMax || p >= midMax)) return false;
          if (priceRange === 'luxury' && (p < midMax || p >= ultraMin)) return false;
          if (priceRange === 'ultra' && p < ultraMin) return false;
        }
      }

      return true;
    });

    result.sort((a, b) => {
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'reviews') return (b.reviewsCount || 0) - (a.reviewsCount || 0);
      if (sortBy === 'price_asc' || sortBy === 'price_desc') {
        const pA = parsePrice(a.price || '');
        const pB = parsePrice(b.price || '');
        if (pA === pB) return 0;
        if (pA === 0) return 1;
        if (pB === 0) return -1;
        return sortBy === 'price_asc' ? pA - pB : pB - pA;
      }
      // Recommended: confirmed hotels first, then hotels before vacation rentals; within each group, prioritize direct property URL, then rating
      const confA = isHotelConfirmed(a) ? 1 : 0;
      const confB = isHotelConfirmed(b) ? 1 : 0;
      if (confA !== confB) return confB - confA;

      const rentalA = isVacationRental(a) ? 1 : 0;
      const rentalB = isVacationRental(b) ? 1 : 0;
      if (rentalA !== rentalB) return rentalA - rentalB;

      const hasDirectA = [a.agodaUrl, a.url, a.bookingUrl, a.airbnbUrl, a.tripUrl].some(isDirectPropertyUrl) ? 0 : 1;
      const hasDirectB = [b.agodaUrl, b.url, b.bookingUrl, b.airbnbUrl, b.tripUrl].some(isDirectPropertyUrl) ? 0 : 1;
      if (hasDirectA !== hasDirectB) return hasDirectA - hasDirectB;
      return (b.rating || 0) - (a.rating || 0);
    });

    return result;
  }, [
    uniqueHotels,
    tubProvenOnly,
    searchTerm,
    selectedFilter,
    selectedTubCategory,
    stayStyle,
    priceRange,
    sortBy,
    budgetMax,
    midMax,
    ultraMin,
  ]);

  // Reset pagination on filter change
  const filterKey = `${tubProvenOnly}|${searchTerm}|${selectedFilter}|${selectedTubCategory}|${sortBy}|${priceRange}|${stayStyle}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (prevFilterKey !== filterKey) {
    setPrevFilterKey(filterKey);
    setVisibleCount(24);
  }

  // Infinite scroll intersection observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < filteredHotels.length) {
          setVisibleCount((prev) => Math.min(prev + 24, filteredHotels.length));
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) observer.unobserve(currentTarget);
    };
  }, [visibleCount, filteredHotels.length]);

  // Track destination page view
  useEffect(() => {
    sendViewDestination({ country: countryName, city: cityName });
  }, [countryName, cityName]);

  // Handle ?tub= query parameter on load / URL changes
  useEffect(() => {
    function applyTubParam() {
      if (typeof window === 'undefined') return;
      const params = new URLSearchParams(window.location.search);
      const tub = params.get('tub')?.toLowerCase();
      if (!tub) return;
      if (tub === 'jetted') {
        setSelectedFilter('jacuzzi');
      } else if (tub === 'bathtub' || tub === 'soaking') {
        setSelectedFilter('soaking');
      } else if (tub === 'hot') {
        setSelectedTubCategory('Hot tub');
      }
    }
    applyTubParam();
    window.addEventListener('popstate', applyTubParam);
    return () => window.removeEventListener('popstate', applyTubParam);
  }, []);

  const handleFilterClick = (filter: 'all' | 'jacuzzi' | 'soaking' | 'tripled') => {
    setSelectedFilter(filter);
    sendFilterUsed({
      filter,
      results_count: counts[filter],
      country: countryName,
      city: cityName,
    });
  };

  const handleResetFilters = () => {
    setTubProvenOnly(false);
    setSelectedFilter('all');
    setSelectedTubCategory('all');
    setStayStyle('all');
    setPriceRange('all');
    setSearchTerm('');
    setSortBy('recommended');
    sendFilterUsed({
      filter: 'reset',
      results_count: uniqueHotels.length,
      country: countryName,
      city: cityName,
    });
  };

  const handleTubProvenToggle = () => {
    const next = !tubProvenOnly;
    setTubProvenOnly(next);
    sendFilterUsed({
      filter: 'tub_proven',
      results_count: next ? provenCount : uniqueHotels.length,
      country: countryName,
      city: cityName,
    });
  };

  const isAnyFilterActive =
    tubProvenOnly ||
    selectedFilter !== 'all' ||
    selectedTubCategory !== 'all' ||
    stayStyle !== 'all' ||
    priceRange !== 'all' ||
    Boolean(searchTerm.trim());

  return (
    <div className="w-full">
      {/* 1. Filter Bar matching mock-up: one row of pills you can scroll sideways */}
      <div className="bg-[#f5f6f8] border-b border-[#e3e7ef] py-3 px-4 sm:px-6 md:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          {/* Pill 1: ✓ Tub proven */}
          {provenCount > 0 && (
            <button
              type="button"
              onClick={handleTubProvenToggle}
              className={`whitespace-nowrap text-[13px] px-3.5 py-2 rounded-full border transition-all cursor-pointer font-medium shrink-0 ${
                tubProvenOnly
                  ? 'bg-[#14213d] text-white border-[#14213d]'
                  : 'bg-white text-[#14213d] border-[#e3e7ef] hover:border-[#14213d]'
              }`}
            >
              ✓ Tub proven ({provenCount})
            </button>
          )}

          {/* Pill 2: Jetted tub */}
          <button
            type="button"
            onClick={() => handleFilterClick(selectedFilter === 'jacuzzi' ? 'all' : 'jacuzzi')}
            className={`whitespace-nowrap text-[13px] px-3.5 py-2 rounded-full border transition-all cursor-pointer font-medium shrink-0 ${
              selectedFilter === 'jacuzzi'
                ? 'bg-[#14213d] text-white border-[#14213d]'
                : 'bg-white text-[#14213d] border-[#e3e7ef] hover:border-[#14213d]'
            }`}
          >
            Jetted tub
          </button>

          {/* Pill 3: Bathtub */}
          <button
            type="button"
            onClick={() => handleFilterClick(selectedFilter === 'soaking' ? 'all' : 'soaking')}
            className={`whitespace-nowrap text-[13px] px-3.5 py-2 rounded-full border transition-all cursor-pointer font-medium shrink-0 ${
              selectedFilter === 'soaking'
                ? 'bg-[#14213d] text-white border-[#14213d]'
                : 'bg-white text-[#14213d] border-[#e3e7ef] hover:border-[#14213d]'
            }`}
          >
            Bathtub
          </button>

          {/* Pill 4: Hot tub */}
          <button
            type="button"
            onClick={() => setSelectedTubCategory(selectedTubCategory === 'Hot tub' ? 'all' : 'Hot tub')}
            className={`whitespace-nowrap text-[13px] px-3.5 py-2 rounded-full border transition-all cursor-pointer font-medium shrink-0 ${
              selectedTubCategory === 'Hot tub'
                ? 'bg-[#14213d] text-white border-[#14213d]'
                : 'bg-white text-[#14213d] border-[#e3e7ef] hover:border-[#14213d]'
            }`}
          >
            Hot tub
          </button>

          {/* Pill 5: Filters ⌄ */}
          <button
            type="button"
            onClick={() => setShowFiltersMenu(!showFiltersMenu)}
            className={`whitespace-nowrap text-[13px] px-3.5 py-2 rounded-full border transition-all cursor-pointer font-medium shrink-0 flex items-center gap-1 ${
              showFiltersMenu || (isAnyFilterActive && !tubProvenOnly)
                ? 'bg-[#14213d] text-white border-[#14213d]'
                : 'bg-white text-[#14213d] border-[#e3e7ef] hover:border-[#14213d]'
            }`}
          >
            <span>Filters</span>
            <span className="text-[10px]">⌄</span>
          </button>

          {/* Quick Clear when filters active */}
          {isAnyFilterActive && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="whitespace-nowrap text-[12px] px-3 py-1.5 rounded-full text-[#5b6478] hover:text-[#14213d] underline cursor-pointer shrink-0 ml-1"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Expandable Advanced Filters Drawer */}
      {showFiltersMenu && (
        <div className="bg-white border-b border-[#e3e7ef] px-4 sm:px-6 md:px-8 py-4 animate-in fade-in duration-150">
          <div className="max-w-7xl mx-auto space-y-4 text-xs sm:text-sm">
            {/* Search Input */}
            <div>
              <label htmlFor="hotel-search" className="block text-[11px] font-bold text-[#5b6478] uppercase tracking-wider mb-1.5">
                Search Hotels &amp; Neighborhoods
              </label>
              <input
                id="hotel-search"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={`Search ${uniqueHotels.length} hotels in ${cityName}...`}
                className="w-full max-w-md px-3.5 py-2 bg-[#f5f6f8] border border-[#e3e7ef] rounded-xl text-[#14213d] placeholder:text-[#5b6478]/60 focus:outline-none focus:border-[#b08d57]"
              />
            </div>

            {/* Stay Style */}
            <div>
              <span className="block text-[11px] font-bold text-[#5b6478] uppercase tracking-wider mb-1.5">
                Stay Style
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'all' as const, label: 'All Stays' },
                  { id: 'luxury' as const, label: '5-Star & Resorts' },
                  { id: 'apartment' as const, label: 'Apartments & Villas' },
                  { id: 'boutique' as const, label: 'Boutique & Inns' },
                  { id: 'hostel' as const, label: 'Hostels & Poshtels' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setStayStyle(s.id)}
                    className={`px-3 py-1.5 rounded-full border text-xs font-semibold cursor-pointer ${
                      stayStyle === s.id
                        ? 'bg-[#14213d] text-white border-[#14213d]'
                        : 'bg-[#f5f6f8] text-[#14213d] border-[#e3e7ef] hover:border-[#14213d]'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <span className="block text-[11px] font-bold text-[#5b6478] uppercase tracking-wider mb-1.5">
                Guide Price Tier
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'all' as const, label: 'All Prices' },
                  { id: 'budget' as const, label: 'Budget' },
                  { id: 'mid' as const, label: 'Mid-Range' },
                  { id: 'luxury' as const, label: 'Luxury' },
                  { id: 'ultra' as const, label: 'Ultra Luxury' },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPriceRange(p.id)}
                    className={`px-3 py-1.5 rounded-full border text-xs font-semibold cursor-pointer capitalize ${
                      priceRange === p.id
                        ? 'bg-[#14213d] text-white border-[#14213d]'
                        : 'bg-[#f5f6f8] text-[#14213d] border-[#e3e7ef] hover:border-[#14213d]'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Count line matching mock-up: "N hotels · Sort: Recommended ⌄" */}
      <div className="count max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-3.5 flex items-center justify-between text-[13px] text-[#5b6478]">
        <span>
          <b className="text-[#14213d] font-bold">{filteredHotels.length}</b> hotels
        </span>
        <div className="flex items-center gap-1">
          <label htmlFor="sort-select" className="sr-only">Sort by</label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => {
              const val = e.target.value as 'recommended' | 'rating' | 'price_asc' | 'price_desc' | 'reviews';
              setSortBy(val);
              sendFilterUsed({
                filter: `sort_${val}`,
                results_count: filteredHotels.length,
                country: countryName,
                city: cityName,
              });
            }}
            className="bg-transparent text-[#5b6478] text-[13px] font-medium border-0 focus:ring-0 cursor-pointer pr-2"
          >
            <option value="recommended">Sort: Recommended</option>
            <option value="rating">Sort: Highest Rating</option>
            <option value="reviews">Sort: Most Reviews</option>
            <option value="price_asc">Sort: Price (Low to High)</option>
            <option value="price_desc">Sort: Price (High to Low)</option>
          </select>
        </div>
      </div>

      {/* 3. Hotel Cards Grid matching mock-up */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-2">
        {filteredHotels.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredHotels.slice(0, visibleCount).map((h, i) => {
                const tubLower = (h.tubType || '').toLowerCase();
                const tubWords = tubLower.includes('hot tub')
                  ? 'hot tub'
                  : tubLower.includes('jetted') || tubLower.includes('jacuzzi') || tubLower.includes('whirlpool') || tubLower.includes('hydro')
                  ? 'jetted tub'
                  : 'bathtub';

                const linkedPartners = getLinkedPartners(h);

                const countrySlug = slugify(countryName);
                const citySlugResolved = h.city ? slugify(h.city) : slugify(cityName);
                const hotelSlug = h.slug || slugify(h.name);
                const hotelPageUrl = `/${countrySlug}/${citySlugResolved}/${hotelSlug}`;

                return (
                  <div
                    key={h._id || i}
                    id={`hotel-${slugify(h.name)}`}
                    data-hotel-card="true"
                    data-hotel-name={h.name}
                    data-hotel-position={i + 1}
                    data-has-price={false}
                    className="bg-white rounded-2xl border border-[#e3e7ef] shadow-[0_4px_18px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col group transition-all"
                  >
                    {/* Photo with Badge and Favorite icon */}
                    <HotelCardImage
                      primaryImage={h.image || ''}
                      images={h.images}
                      partnerImages={h.partnerImages}
                      hotelName={h.name}
                      cityName={h.city || cityName}
                      countryName={h.country || countryName}
                      tubType={h.tubType}
                      priority={i < 2}
                      className="relative h-[200px] w-full bg-[#f5f6f8] shrink-0 overflow-hidden group/image"
                    >
                      {/* Badge: Green when confirmed, muted grey when reported */}
                      {isHotelConfirmed(h) ? (
                        <span className="absolute left-3 top-3 z-10 bg-[#e3f2ee] text-[#1f6f5c] text-[11px] font-bold px-2.5 py-1.5 rounded-full shadow-xs pointer-events-none">
                          ✓ Tub proven · Booking.com
                        </span>
                      ) : (
                        <span className="absolute left-3 top-3 z-10 bg-[#e3e7ef] text-[#5b6478] text-[11px] font-bold px-2.5 py-1.5 rounded-full shadow-xs pointer-events-none">
                          Reported, not yet confirmed
                        </span>
                      )}

                      {/* Favorite button */}
                      <div
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        className="absolute right-3 top-3 z-10 w-[34px] h-[34px] rounded-full bg-white/92 backdrop-blur-xs flex items-center justify-center shadow-xs"
                      >
                        <FavoriteButton
                          hotel={{
                            _id: String(h._id || h.slug || `${countrySlug}-${citySlugResolved}-${hotelSlug}`),
                            name: h.name,
                            city: h.city || cityName,
                            country: h.country || countryName,
                            image: h.image || '',
                            price: h.price,
                            rating: h.rating,
                            tubType: h.tubType || tubWords,
                            bookingUrl: h.bookingUrl,
                            agodaUrl: h.agodaUrl,
                            airbnbUrl: h.airbnbUrl,
                            tripUrl: h.tripUrl,
                            url: h.url,
                            countrySlug,
                            citySlug: citySlugResolved,
                          }}
                          className="w-full h-full flex items-center justify-center cursor-pointer"
                        />
                      </div>
                    </HotelCardImage>

                    {/* Card Body */}
                    <div className="p-3.5 sm:p-4 flex flex-col flex-grow">
                      {/* Hotel Name */}
                      <Link href={hotelPageUrl} prefetch={false} className="group/link mb-1">
                        <h3 className="font-playfair text-[20px] sm:text-[22px] font-semibold text-[#14213d] leading-[1.15] line-clamp-2 group-hover/link:text-[#b08d57] transition-colors">
                          {h.name}
                        </h3>
                      </Link>

                      {/* Address */}
                      <div className="text-[12px] text-[#5b6478] mt-1 mb-2.5 line-clamp-1">
                        {isValidStreetAddress(h.streetAddress)
                          ? `${h.streetAddress}, ${h.city || cityName}`
                          : (h.neighborhood && isValidNeighborhood(h.neighborhood)
                            ? `${h.neighborhood}, ${h.city || cityName}`
                            : `${h.city || cityName}, ${countryName}`)}
                      </div>

                      {/* Room Box */}
                      <div className="text-[13px] leading-[1.45] bg-[#e9eef7] text-[#14213d] rounded-[10px] p-[9px_11px] mb-3">
                        {isHotelConfirmed(h) ? (
                          h.roomType ? (
                            <>Book the <strong className="font-bold">{h.roomType}</strong> for an in-room {tubWords}</>
                          ) : (
                            <>In-room <strong className="font-bold">{tubWords}</strong></>
                          )
                        ) : (
                          h.roomType ? (
                            <>Reported room: <strong className="font-bold">{h.roomType}</strong>. Check room details before booking.</>
                          ) : (
                            <>A bathtub is reported; check room details before booking.</>
                          )
                        )}
                      </div>

                      {/* Booking partner direct buttons & Compare all link */}
                      <div className="mt-auto pt-2 flex flex-col gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {linkedPartners.slice(0, 3).map((partner) => {
                            const partnerUrl = getPartnerUrl(h, partner);
                            if (!partnerUrl) return null;
                            return (
                              <OutboundLink
                                key={partner}
                                href={partnerUrl}
                                source={partner}
                                hotelName={h.name}
                                cityName={h.city || cityName}
                                className="inline-flex items-center justify-center border-[1.5px] border-[#b08d57] text-[#b08d57] hover:bg-[#b08d57] hover:text-white rounded-[9px] px-2.5 sm:px-3 py-1.5 font-bold text-[11px] sm:text-xs transition-colors whitespace-nowrap text-center"
                              >
                                {partner} ›
                              </OutboundLink>
                            );
                          })}
                        </div>
                        <Link
                          href={hotelPageUrl}
                          prefetch={false}
                          className="text-[11px] font-semibold text-[#5b6478] hover:text-[#b08d57] transition-colors inline-flex items-center gap-1 self-start pt-0.5"
                        >
                          Compare all ›
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Infinite scroll loader trigger & Show More button */}
            {visibleCount < filteredHotels.length && (
              <div ref={observerTarget} className="w-full py-6 flex flex-col items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setVisibleCount((prev) => Math.min(prev + 24, filteredHotels.length))}
                  className="px-5 py-2 rounded-full border border-[#e3e7ef] bg-white text-[#14213d] hover:border-[#14213d] text-xs font-semibold cursor-pointer transition-colors shadow-xs"
                >
                  Show more hotels ({filteredHotels.length - visibleCount} remaining)
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white border border-[#e3e7ef] rounded-2xl p-10 text-center max-w-lg mx-auto shadow-xs my-6">
            <h3 className="font-playfair text-lg sm:text-xl font-semibold text-[#14213d] mb-2">
              No hotels match your filters
            </h3>
            <p className="text-xs sm:text-sm text-[#5b6478] mb-6 leading-relaxed">
              We couldn&apos;t find any stays in {cityName} matching all selected filters. Try broadening your criteria or resetting to explore all {uniqueHotels.length} stays.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-5 py-2.5 bg-[#b08d57] hover:bg-[#9c7b48] text-white font-bold rounded-xl text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
