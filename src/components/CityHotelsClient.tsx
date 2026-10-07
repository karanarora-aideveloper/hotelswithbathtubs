'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import OutboundLink from '@/components/OutboundLink';
import ProgressiveImage from '@/components/ProgressiveImage';
import { imageUrl } from '@/lib/imageUrl';
import { slugify } from '@/lib/utils';
import posthog from 'posthog-js';
import { isUserExcluded } from '@/lib/exclusion';
import {
  recordHotelImpression,
  recordFilterDeadEnd,
  recordFilterReset,
  recordFilterChange,
} from '@/lib/gtag';

type HotelData = {
  _id?: string;
  name: string;
  slug?: string;
  city: string;
  country: string;
  image: string;
  url?: string;
  agodaUrl?: string;
  bookingUrl?: string;
  amenities: string[];
  description?: string;
  rating?: number;
  reviewsCount?: number;
  roomType?: string;
  tubType?: string;
  bookingTip?: string;
  price?: string;
  neighborhood?: string;
  landmarkDistance?: string;
  crossVerifiedAt?: string;
};


const parsePrice = (p: string) => parseInt(p?.replace(/[^0-9]/g, '') || '0', 10);

export function normalizeTubType(tubType?: string): { category: string; emoji: string; color: string } {
  if (!tubType) return { category: 'Standard Bathtub', emoji: '🚿', color: 'gray' };
  const lower = tubType.toLowerCase();
  if (lower.includes('jacuzzi') || lower.includes('whirlpool') || lower.includes('jet') || lower.includes('hydro')) {
    return { category: 'Jacuzzi / Whirlpool', emoji: '🌊', color: 'blue' };
  }
  if (lower.includes('claw') || lower.includes('clawfoot') || lower.includes('vintage') || lower.includes('victorian') || lower.includes('cast-iron') || lower.includes('cast iron')) {
    return { category: 'Clawfoot Tub', emoji: '🛁', color: 'amber' };
  }
  if (lower.includes('outdoor') || lower.includes('open-air') || lower.includes('balcony') || lower.includes('hot tub') || lower.includes('heated')) {
    return { category: 'Outdoor Hot Tub', emoji: '♨️', color: 'orange' };
  }
  if (lower.includes('roman')) {
    return { category: 'Roman Tub', emoji: '🏛️', color: 'stone' };
  }
  if (lower.includes('onsen') || lower.includes('cedar') || lower.includes('hinoki') || lower.includes('japanese')) {
    return { category: 'Onsen / Cedarwood', emoji: '🌿', color: 'green' };
  }
  if (lower.includes('plunge') || lower.includes('pool')) {
    return { category: 'Plunge Pool + Tub', emoji: '🏊', color: 'teal' };
  }
  if (lower.includes('deep') || lower.includes('soaking') || lower.includes('freestanding') || lower.includes('marble') || lower.includes('stone') || lower.includes('italian')) {
    return { category: 'Deep Soaking Tub', emoji: '🛁', color: 'indigo' };
  }
  return { category: 'Standard Bathtub', emoji: '🚿', color: 'gray' };
}

const colorStyles: Record<string, string> = {
  blue: 'bg-blue-100 text-blue-800 border-blue-200',
  indigo: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  amber: 'bg-amber-100 text-amber-800 border-amber-200',
  orange: 'bg-orange-100 text-orange-800 border-orange-200',
  stone: 'bg-stone-100 text-stone-800 border-stone-200',
  green: 'bg-green-100 text-green-800 border-green-200',
  teal: 'bg-teal-100 text-teal-800 border-teal-200',
  gray: 'bg-gray-100 text-gray-800 border-gray-200',
};

export default function CityHotelsClient({
  hotels,
  cityName,
  countryName,
}: {
  hotels: HotelData[];
  cityName: string;
  countryName: string;
}) {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'jacuzzi' | 'soaking' | 'tripled'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'recommended' | 'rating' | 'price_asc' | 'price_desc' | 'reviews'>('recommended');
  const [priceRange, setPriceRange] = useState<'all' | 'budget' | 'mid' | 'luxury'>('all');
  const [selectedTubCategory, setSelectedTubCategory] = useState<string>('all');

  // Deduplicate hotels by URL signature (same hotel added multiple times to DB)
  const uniqueHotels = useMemo(() => {
    const seen = new Set<string>();
    return hotels.filter((h) => {
      const key = [h.url, h.agodaUrl, h.bookingUrl, h.name].filter(Boolean).join('|');
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [hotels]);

  // Dynamically resolve currency symbol and thresholds based on city destination
  const { currencySymbol, budgetMax, luxuryMin } = useMemo(() => {
    for (const h of uniqueHotels) {
      const p = h.price || '';
      if (p.includes('€')) return { currencySymbol: '€', budgetMax: 180, luxuryMin: 400 };
      if (p.includes('£')) return { currencySymbol: '£', budgetMax: 150, luxuryMin: 350 };
      if (p.includes('₹')) return { currencySymbol: '₹', budgetMax: 8000, luxuryMin: 22000 };
      if (p.includes('¥')) return { currencySymbol: '¥', budgetMax: 25000, luxuryMin: 60000 };
      if (p.includes('฿')) return { currencySymbol: '฿', budgetMax: 3000, luxuryMin: 9000 };
      if (p.includes('RM')) return { currencySymbol: 'RM', budgetMax: 400, luxuryMin: 1200 };
      if (p.includes('CHF')) return { currencySymbol: 'CHF', budgetMax: 250, luxuryMin: 600 };
      if (p.includes('CA$')) return { currencySymbol: 'CA$', budgetMax: 220, luxuryMin: 500 };
      if (p.includes('A$')) return { currencySymbol: 'A$', budgetMax: 250, luxuryMin: 550 };
    }
    const isIndia = countryName === 'India';
    return {
      currencySymbol: isIndia ? '₹' : '$',
      budgetMax: isIndia ? 8000 : 180,
      luxuryMin: isIndia ? 22000 : 400,
    };
  }, [uniqueHotels, countryName]);

  // Comprehensive bathtub feature matchers (inspects tubType, roomType, and amenities)
  const isJacuzziHotel = (h: HotelData) => {
    const tub = (h.tubType || '').toLowerCase();
    const room = (h.roomType || '').toLowerCase();
    const ams = (h.amenities || []).join(' ').toLowerCase();
    return (
      tub.includes('jacuzzi') ||
      tub.includes('whirlpool') ||
      tub.includes('hydro') ||
      tub.includes('hot tub') ||
      tub.includes('jet') ||
      room.includes('jacuzzi') ||
      room.includes('whirlpool') ||
      ams.includes('jacuzzi') ||
      ams.includes('whirlpool') ||
      ams.includes('hot tub')
    );
  };

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
      allText.includes('stone') ||
      allText.includes('marble') ||
      allText.includes('onsen')
    );
  };

  const availableTubCategories = useMemo(() => {
    const map = new Map<string, {emoji: string; color: string}>();
    uniqueHotels.forEach(h => {
      if (h.tubType) {
        const norm = normalizeTubType(h.tubType);
        map.set(norm.category, {emoji: norm.emoji, color: norm.color});
      }
    });
    return Array.from(map.entries()).map(([category, {emoji, color}]) => ({category, emoji, color}));
  }, [uniqueHotels]);

  // Counts for filter badges with zero false-negatives
  const counts = useMemo(() => {
    const jacuzzi = uniqueHotels.filter(isJacuzziHotel).length;
    const soaking = uniqueHotels.filter(isSoakingHotel).length;
    const tripled = uniqueHotels.filter((h) => h.url && (h.agodaUrl || h.bookingUrl)).length;

    return { all: uniqueHotels.length, jacuzzi, soaking, tripled };
  }, [uniqueHotels]);

  // Filtered hotels list
  const filteredHotels = useMemo(() => {
    let result = uniqueHotels.filter((h) => {
      // Text search filter
      if (searchTerm.trim()) {
        const matchesName = h.name.toLowerCase().includes(searchTerm.trim().toLowerCase());
        const matchesAmenity = h.amenities?.some((a) =>
          a.toLowerCase().includes(searchTerm.trim().toLowerCase())
        );
        if (!matchesName && !matchesAmenity) return false;
      }

      // Category filter
      if (selectedFilter === 'jacuzzi' && !isJacuzziHotel(h)) return false;
      if (selectedFilter === 'soaking' && !isSoakingHotel(h)) return false;
      if (selectedFilter === 'tripled') {
        if (!(h.url && (h.agodaUrl || h.bookingUrl))) return false;
      }

      if (selectedTubCategory !== 'all') {
        const norm = normalizeTubType(h.tubType);
        if (norm.category !== selectedTubCategory) return false;
      }

      if (priceRange !== 'all' && h.price) {
        const p = parsePrice(h.price);
        if (priceRange === 'budget' && p >= budgetMax) return false;
        if (priceRange === 'mid' && (p < budgetMax || p >= luxuryMin)) return false;
        if (priceRange === 'luxury' && p < luxuryMin) return false;
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
      return 0; // recommended preserves order
    });

    return result;
  }, [uniqueHotels, selectedFilter, searchTerm, selectedTubCategory, priceRange, sortBy, budgetMax, luxuryMin]);

  // Track dead-end filter pain point (when filter/search yields 0 hotels)
  useEffect(() => {
    if (filteredHotels.length === 0 && (selectedFilter !== 'all' || searchTerm.trim() || selectedTubCategory !== 'all' || priceRange !== 'all')) {
      recordFilterDeadEnd(selectedFilter, searchTerm.trim(), cityName);
    }
  }, [filteredHotels.length, selectedFilter, searchTerm, cityName]);

  // Track hotel card impressions as cards enter the viewport
  useEffect(() => {
    const cards = document.querySelectorAll<HTMLElement>('[data-hotel-card]');
    if (cards.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            const name = el.getAttribute('data-hotel-name');
            const pos = parseInt(el.getAttribute('data-hotel-position') || '1', 10);
            const hasPrice = el.getAttribute('data-has-price') === 'true';
            if (name) {
              recordHotelImpression(name, pos, hasPrice);
            }
          }
        });
      },
      { threshold: 0.3 }
    );

    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, [filteredHotels]);

  const handleFilterClick = (filter: 'all' | 'jacuzzi' | 'soaking' | 'tripled') => {
    setSelectedFilter(filter);
    recordFilterChange(filter, counts[filter]);
    try {
      if (!isUserExcluded()) {
        posthog.capture('filter_applied', {
          filter_type: 'category',
          filter_value: filter,
          result_count: counts[filter],
          city: cityName,
          country: countryName,
        });
      }
    } catch (_) {}
  };

  const handleResetFilters = () => {
    setSelectedFilter('all');
    setSearchTerm('');
    setPriceRange('all');
    setSelectedTubCategory('all');
    setSortBy('recommended');
    recordFilterReset(cityName);
    try {
      if (!isUserExcluded()) {
        posthog.capture('filter_reset', { city: cityName });
      }
    } catch (_) {}
  };

  // Detect what kind of URL is stored in any booking field
  type UrlProvider = 'makemytrip' | 'booking' | 'agoda' | 'trivago' | 'tripadvisor' | 'google' | null;
  function getUrlProvider(url?: string): UrlProvider {
    if (!url) return null;
    const lower = url.toLowerCase();
    if (lower.includes('makemytrip.com')) return 'makemytrip';
    if (lower.includes('booking.com')) return 'booking';
    if (lower.includes('agoda.com')) return 'agoda';
    if (lower.includes('trivago')) return 'trivago';
    if (lower.includes('tripadvisor')) return 'tripadvisor';
    if (lower.includes('google.com')) return 'google';
    return null;
  }

  // Render the right button for any booking URL
  function BookingButton({ url, hotelName, cityName: city, preferredLabel, isPrimary }: {
    url: string;
    hotelName: string;
    cityName: string;
    preferredLabel?: string;
    isPrimary?: boolean;
  }) {
    const provider = getUrlProvider(url);
    const config: Record<NonNullable<UrlProvider>, { label: string; className: string; source: string } | null> = {
      makemytrip: { 
        label: 'Check on MakeMyTrip', 
        source: 'MakeMyTrip', 
        className: isPrimary 
          ? 'bg-[#1a6fde] hover:bg-[#1559b8] text-white font-bold text-xs sm:text-[13px] px-3.5 py-2 sm:py-2.5 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 w-full' 
          : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-center py-1.5 px-3 rounded-lg font-semibold transition-colors text-[11px] flex items-center justify-center gap-1 w-full' 
      },
      booking: { 
        label: 'Check on Booking.com', 
        source: 'Booking.com', 
        className: isPrimary 
          ? 'bg-[#1a6fde] hover:bg-[#1559b8] text-white font-bold text-xs sm:text-[13px] px-3.5 py-2 sm:py-2.5 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 w-full' 
          : 'bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-center py-1.5 px-3 rounded-lg font-semibold transition-colors text-[11px] flex items-center justify-center gap-1 w-full' 
      },
      agoda: { 
        label: 'Check on Agoda', 
        source: 'Agoda', 
        className: isPrimary 
          ? 'bg-[#1a6fde] hover:bg-[#1559b8] text-white font-bold text-xs sm:text-[13px] px-3.5 py-2 sm:py-2.5 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 w-full' 
          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-center py-1.5 px-3 rounded-lg font-semibold transition-colors text-[11px] flex items-center justify-center gap-1 w-full' 
      },
      trivago: { 
        label: 'Compare on Trivago', 
        source: 'Trivago', 
        className: isPrimary 
          ? 'bg-[#1a6fde] hover:bg-[#1559b8] text-white font-bold text-xs sm:text-[13px] px-3.5 py-2 sm:py-2.5 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 w-full' 
          : 'bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-center py-1.5 px-3 rounded-lg font-semibold transition-colors text-[11px] flex items-center justify-center gap-1 w-full' 
      },
      tripadvisor: { 
        label: 'View on TripAdvisor', 
        source: 'TripAdvisor', 
        className: isPrimary 
          ? 'bg-[#1a6fde] hover:bg-[#1559b8] text-white font-bold text-xs sm:text-[13px] px-3.5 py-2 sm:py-2.5 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 w-full' 
          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-center py-1.5 px-3 rounded-lg font-semibold transition-colors text-[11px] flex items-center justify-center gap-1 w-full' 
      },
      google: null, // don't show Google search links as booking buttons
    };
    if (!provider || !config[provider]) return null;
    const { label, source, className } = config[provider]!;
    return (
      <OutboundLink href={url} hotelName={hotelName} cityName={city} source={source} className={className}>
        <span>{preferredLabel || label}</span>
        <span>&rarr;</span>
      </OutboundLink>
    );
  }

  return (
    <div>
      {/* Interactive Bathtub & Feature Filters */}
      <div className="bg-white px-4 py-3 rounded-xl border border-gray-200 shadow-sm mb-4 flex flex-col gap-4 w-full min-w-0">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full min-w-0">
          {/* Quick Hotel Name / Amenity Search */}
          <div className="w-full md:w-64 relative flex-shrink-0">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search hotel name..."
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:border-[#1a6fde] focus:bg-white transition-all"
            />
            <svg className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2.5 text-xs text-gray-500 hover:text-gray-900"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sort Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full md:w-auto">
            <button
              onClick={() => setSortBy('recommended')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border flex-shrink-0 ${sortBy === 'recommended' ? 'bg-[#1a6fde] text-white border-[#1a6fde]' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-transparent'}`}
            >
              Recommended
            </button>
            <button
              onClick={() => setSortBy('price_asc')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border flex-shrink-0 ${sortBy === 'price_asc' ? 'bg-[#1a6fde] text-white border-[#1a6fde]' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-transparent'}`}
            >
              Price ↑
            </button>
            <button
              onClick={() => setSortBy('rating')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border flex-shrink-0 ${sortBy === 'rating' ? 'bg-[#1a6fde] text-white border-[#1a6fde]' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-transparent'}`}
            >
              Top Rated
            </button>
          </div>
        </div>

        {/* Tub Category Filter Row */}
        {availableTubCategories.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full py-1">
            <button
              onClick={() => setSelectedTubCategory('all')}
              className={`px-3 py-1.5 rounded-full border text-xs font-bold transition-all flex-shrink-0 ${selectedTubCategory === 'all' ? 'bg-[#1a6fde] text-white border-[#1a6fde]' : 'bg-white text-gray-600 border-gray-200 hover:border-[#1a6fde] hover:text-[#1a6fde]'}`}
            >
              All Types
            </button>
            {availableTubCategories.map(cat => (
              <button
                key={cat.category}
                onClick={() => setSelectedTubCategory(cat.category)}
                className={`px-3 py-1.5 rounded-full border text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 ${selectedTubCategory === cat.category ? 'bg-[#1a6fde] text-white border-[#1a6fde]' : 'bg-white text-gray-600 border-gray-200 hover:border-[#1a6fde] hover:text-[#1a6fde]'}`}
              >
                <span>{cat.emoji}</span> {cat.category}
              </button>
            ))}
          </div>
        )}

        {/* Price Filter Row */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full py-1">
          <button
            onClick={() => setPriceRange('all')}
            className={`px-3 py-1.5 rounded-full border text-xs font-bold transition-all flex-shrink-0 ${priceRange === 'all' ? 'bg-gray-900 text-white border-gray-900' : 'bg-gray-100 text-gray-700 border-transparent hover:bg-gray-200'}`}
          >
            All Prices
          </button>
          <button
            onClick={() => setPriceRange('budget')}
            className={`px-3 py-1.5 rounded-full border text-xs font-bold transition-all flex-shrink-0 ${priceRange === 'budget' ? 'bg-gray-900 text-white border-gray-900' : 'bg-gray-100 text-gray-700 border-transparent hover:bg-gray-200'}`}
          >
            Budget ({"<"} {currencySymbol}{budgetMax.toLocaleString()})
          </button>
          <button
            onClick={() => setPriceRange('mid')}
            className={`px-3 py-1.5 rounded-full border text-xs font-bold transition-all flex-shrink-0 ${priceRange === 'mid' ? 'bg-gray-900 text-white border-gray-900' : 'bg-gray-100 text-gray-700 border-transparent hover:bg-gray-200'}`}
          >
            Mid-range ({currencySymbol}{budgetMax.toLocaleString()} - {currencySymbol}{luxuryMin.toLocaleString()})
          </button>
          <button
            onClick={() => setPriceRange('luxury')}
            className={`px-3 py-1.5 rounded-full border text-xs font-bold transition-all flex-shrink-0 ${priceRange === 'luxury' ? 'bg-gray-900 text-white border-gray-900' : 'bg-gray-100 text-gray-700 border-transparent hover:bg-gray-200'}`}
          >
            Luxury ({currencySymbol}{luxuryMin.toLocaleString()}+)
          </button>
        </div>
      </div>

      {/* Matchmaker Discovery Callout */}
      <div className="bg-gradient-to-r from-blue-50/80 via-indigo-50/80 to-blue-50/80 border border-blue-200/80 rounded-2xl p-4 sm:p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1a6fde] to-[#0a4fa8] text-white flex items-center justify-center text-lg flex-shrink-0 shadow-xs">
            ✨
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-sm sm:text-base leading-snug">
              Looking for a specific bathtub style or anniversary getaway?
            </h3>
            <p className="text-xs text-gray-600 mt-0.5">
              Take our 30-second Dream Soak Matchmaker to match by tub experience, romantic vibe, and budget worldwide.
            </p>
          </div>
        </div>
        <Link
          href="/matchmaker"
          className="bg-[#1a6fde] hover:bg-[#1559b8] text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-xs hover:shadow-md whitespace-nowrap flex-shrink-0"
        >
          Open Matchmaker &rarr;
        </Link>
      </div>

      {/* Booking Verification Tip Banner */}
      <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-3.5 sm:p-5 mb-8 flex items-start gap-3 shadow-2xs">
        <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-base">💡</span>
        </div>
        <div className="text-xs sm:text-sm text-amber-900 leading-relaxed">
          <strong className="font-bold block mb-0.5">Booking Tip for {cityName} Bathtub Suites:</strong>
          When selecting your room on MakeMyTrip, Agoda, or Booking.com, ensure your chosen room tier (such as <em>Executive Suite</em> or <em>Deluxe Room with Jacuzzi</em>) explicitly lists the bathtub amenity before confirming.
        </div>
      </div>

      {/* Hotel Cards Grid */}
      {filteredHotels.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {filteredHotels.map((h, i) => {
            const providerLabel: Record<NonNullable<UrlProvider>, string> = {
              makemytrip: 'MakeMyTrip', booking: 'Booking.com', agoda: 'Agoda',
              trivago: 'Trivago', tripadvisor: 'TripAdvisor', google: '',
            };
            const verifiedSources = [
              ...(h.url ? [providerLabel[getUrlProvider(h.url) ?? 'google']].filter(Boolean) : []),
              ...(h.agodaUrl ? [providerLabel[getUrlProvider(h.agodaUrl) ?? 'google']].filter(Boolean) : []),
              ...(h.bookingUrl ? [providerLabel[getUrlProvider(h.bookingUrl) ?? 'google']].filter(Boolean) : []),
            ].filter((v, i, a) => a.indexOf(v) === i); // dedupe

            const isUSOrGlobal = countryName.toLowerCase() !== 'india';
            const rawUrls = [h.bookingUrl, h.agodaUrl, h.url]
              .filter((u): u is string => !!u)
              .filter((u, idx, arr) => arr.indexOf(u) === idx);
            
            const sortedUrls = isUSOrGlobal
              ? [...rawUrls].sort((a, b) => {
                  const provA = getUrlProvider(a);
                  const provB = getUrlProvider(b);
                  const priority: Record<string, number> = { booking: 1, agoda: 2, trivago: 3, tripadvisor: 4, makemytrip: 5 };
                  return (priority[provA || ''] || 99) - (priority[provB || ''] || 99);
                })
              : rawUrls;

            return (
              <div
                key={h._id || i}
                id={`hotel-${slugify(h.name)}`}
                data-hotel-card="true"
                data-hotel-name={h.name}
                data-hotel-position={i + 1}
                data-has-price={!!h.price}
                className="bg-white rounded-2xl border border-gray-200 shadow-xs hover:shadow-md hover:border-[#1a6fde] hover:shadow-[0_0_0_3px_rgba(26,111,222,0.12)] transition-all flex flex-col group scroll-mt-24 overflow-hidden"
              >
                {/* Image & Badges */}
                <div className="relative h-48 sm:h-44 w-full bg-gray-100 shrink-0 overflow-hidden">
                  <ProgressiveImage
                    src={h.image}
                    alt={`${h.name} - Hotel with Bathtub in ${cityName}`}
                    priority={i < 2}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  {verifiedSources.length > 0 && (
                    <div className="absolute top-3 left-3 group/tooltip flex z-20">
                      <span className="bg-emerald-500/90 text-white border border-emerald-400/30 text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs backdrop-blur-xs cursor-help">
                        <span className="font-black">✓</span>
                        <span className="inline sm:hidden">Verified</span>
                        <span className="hidden sm:inline">Verified on {verifiedSources.join(', ')}</span>
                        <button type="button" className="ml-0.5 opacity-80 hover:opacity-100 bg-white/20 text-white rounded-full w-3.5 h-3.5 flex items-center justify-center text-[9px] outline-none">i</button>
                      </span>
                      <div className="absolute top-full left-0 mt-1.5 w-60 p-2.5 bg-gray-900 text-white text-[11px] rounded-xl shadow-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible group-focus-within/tooltip:opacity-100 group-focus-within/tooltip:visible transition-all z-30 pointer-events-none">
                        We manually check every hotel across Booking.com, Agoda, and MakeMyTrip to confirm the specific room tier includes a private bathtub. Last verified: {h.crossVerifiedAt || 'Sep 2026'}.
                      </div>
                    </div>
                  )}

                  {/* Pinterest Save Button */}
                  <a
                    href={`https://www.pinterest.com/pin/create/button/?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : 'https://www.hotelswithbathtubs.com')}&media=${encodeURIComponent(imageUrl(h.image))}&description=${encodeURIComponent(`${h.name} - Verified Luxury Hotel with Private Bathtub in ${cityName}, ${countryName}. Guaranteed private in-room soaking tub. Plan your stay on HotelsWithBathtubs.com`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute top-3 right-3 bg-red-600/95 hover:bg-red-700 text-white text-[11px] font-bold px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-full shadow-md flex items-center gap-1 z-10 transition-all opacity-90 sm:opacity-0 group-hover:opacity-100"
                    title="Save to Pinterest"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                      <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345-.09.375-.291 1.199-.334 1.357-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.546.535 6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
                    </svg>
                    <span>Save</span>
                  </a>
                </div>

                {/* Card Content */}
                <div className="p-3.5 sm:p-4 flex flex-col flex-grow">
                  {/* Hotel Title */}
                  <Link href={`/${slugify(countryName)}/${slugify(cityName)}/${h.slug || slugify(h.name)}`} className="group/link mb-1">
                    <h2 className="text-sm sm:text-[15px] font-bold text-gray-900 leading-snug line-clamp-1 group-hover/link:text-[#1a6fde] transition-colors">{h.name}</h2>
                  </Link>

                  {/* Rating & Reviews */}
                  {h.rating ? (
                    <div className="flex items-center gap-1.5 text-[11px] mb-1.5">
                      <span className="inline-flex items-center gap-0.5 bg-amber-50 text-amber-800 font-bold px-1.5 py-0.5 rounded border border-amber-200/70">
                        <span className="text-amber-500 font-black">★</span> {h.rating}
                      </span>
                      {h.reviewsCount && (
                        <span className="text-gray-400 text-2xs">({h.reviewsCount.toLocaleString()} reviews)</span>
                      )}
                    </div>
                  ) : null}

                  {/* Neighborhood Location & Distance */}
                  <p className="text-xs text-gray-500 font-medium mb-2 flex items-center gap-1 flex-wrap">
                    <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                    <span className="font-semibold text-gray-700">{h.neighborhood ? `${h.neighborhood}, ${cityName}` : `${cityName}, ${countryName}`}</span>
                    {h.landmarkDistance && (
                      <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                        {h.landmarkDistance}
                      </span>
                    )}
                  </p>

                  {/* Room Category & Tub Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-2">
                    {h.tubType && (() => {
                      const norm = normalizeTubType(h.tubType);
                      const style = colorStyles[norm.color] || colorStyles.gray;
                      return (
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 font-bold text-[11px] rounded-md border ${style}`}>
                          <span>{norm.emoji}</span> {norm.category}
                        </span>
                      );
                    })()}
                    {h.roomType && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 font-medium text-[11px] rounded-md">
                        <span>🏷️</span> <span className="line-clamp-1">{h.roomType}</span>
                      </span>
                    )}
                  </div>

                  {/* Description snippet if any */}
                  {h.description && (
                    <p className="text-[11px] sm:text-xs text-gray-500 mb-2 line-clamp-2 leading-relaxed">
                      {h.description}
                    </p>
                  )}

                  {/* Booking Tip (Compact) */}
                  {h.bookingTip && (
                    <div className="bg-amber-50/80 border border-amber-200/60 rounded-lg p-2 mb-2.5 text-[11px] text-amber-900 leading-snug flex items-start gap-1.5">
                      <span className="shrink-0 text-xs">💡</span>
                      <span className="line-clamp-2"><strong>Tip:</strong> {h.bookingTip}</span>
                    </div>
                  )}

                  {/* Amenities Chips (Modern compact tags) */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-3 pt-2 border-t border-gray-100">
                    {h.amenities.slice(0, 3).map((amenity: string, idx: number) => {
                      const isJacuzzi = amenity.toLowerCase().includes('jacuzzi') || amenity.toLowerCase().includes('hot tub');
                      return (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-600 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-md"
                        >
                          <span className={isJacuzzi ? "text-[#1a6fde]" : "text-emerald-600"}>
                            {isJacuzzi ? '🛁' : '✓'}
                          </span>
                          <span>{amenity}</span>
                        </span>
                      );
                    })}
                    {h.amenities.length > 3 && (
                      <span className="text-[10px] font-medium text-gray-400">
                        +{h.amenities.length - 3} more
                      </span>
                    )}
                  </div>

                  <div className="flex-1" />

                  {/* Price & CTA Buttons */}
                  <div className="pt-2.5 border-t border-gray-100 mt-auto">
                    {h.price && (
                      <div className="flex items-baseline justify-between mb-2">
                        <div>
                          <span className="text-[10px] text-gray-400 font-medium block leading-none mb-0.5">Starting from</span>
                          <span className="text-base sm:text-[17px] font-black text-gray-900">{h.price}</span>
                          <span className="text-[10px] text-gray-400 font-medium ml-1">/ night</span>
                        </div>
                        <Link href={`/${slugify(countryName)}/${slugify(cityName)}/${h.slug || slugify(h.name)}`} className="text-[11px] font-bold text-[#1a6fde] hover:underline">
                          View Details &rarr;
                        </Link>
                      </div>
                    )}

                    <div className="flex flex-col gap-1.5">
                      {sortedUrls.map((u, idx) => (
                        <BookingButton key={idx} url={u} hotelName={h.name} cityName={cityName} isPrimary={idx === 0} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-border rounded-2xl p-12 text-center max-w-lg mx-auto">
          <p className="text-3xl mb-3">🛁</p>
          <h3 className="font-heading text-lg font-bold text-accent-secondary mb-2">
            No hotels match your filter
          </h3>
          <p className="text-xs text-text-muted mb-4">
            Try resetting your bathtub filter or clearing the search keyword.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 bg-accent text-white font-bold rounded-xl text-xs shadow-sm hover:bg-accent-hover transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
