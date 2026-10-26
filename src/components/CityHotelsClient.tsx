'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import OutboundLink from '@/components/OutboundLink';
import { isDirectPropertyUrl, getUrlDirectnessTier } from '@/lib/affiliate';
import HotelCardImage from '@/components/HotelCardImage';
import { imageUrl } from '@/lib/imageUrl';
import { slugify } from '@/lib/utils';
import { trackEvent } from '@/lib/analytics';
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
  images?: string[];
  partnerImages?: string[];
  url?: string;
  agodaUrl?: string;
  bookingUrl?: string;
  expediaUrl?: string;
  hotelsComUrl?: string;
  vrboUrl?: string;
  mmtUrl?: string;
  airbnbUrl?: string;
  tripUrl?: string;
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
  const [stayStyle, setStayStyle] = useState<'all' | 'luxury' | 'apartment' | 'boutique' | 'hostel'>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<'all' | 'budget' | 'mid' | 'luxury' | 'ultra'>('all');
  const [selectedTubCategory, setSelectedTubCategory] = useState<string>('all');
  const [selectedPerks, setSelectedPerks] = useState<string[]>([]);
  const [dateOption, setDateOption] = useState<'this-weekend' | 'next-weekend' | 'midweek' | 'custom'>('next-weekend');
  const [customCheckin, setCustomCheckin] = useState<string>('');
  const [customCheckout, setCustomCheckout] = useState<string>('');
  const [showCustomPicker, setShowCustomPicker] = useState<boolean>(false);
  const [weekendDates, setWeekendDates] = useState<{ checkin: string; checkout: string; adults: number } | undefined>(undefined);

  // Pre-calculate human readable ranges for all quick date pills
  const calculatedDatePills = useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0: Sun, 1: Mon, ..., 5: Fri, 6: Sat
    const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const fmtShort = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    // 1. This Weekend
    let daysUntilFriday = (5 - dayOfWeek + 7) % 7;
    if (daysUntilFriday === 0 && today.getHours() >= 18) daysUntilFriday = 7;
    const thisFri = new Date(today);
    thisFri.setDate(today.getDate() + daysUntilFriday);
    const thisSun = new Date(thisFri);
    thisSun.setDate(thisFri.getDate() + 2);

    // 2. Next Weekend (Popular)
    const daysUntilNextFriday = daysUntilFriday === 0 ? 7 : daysUntilFriday + 7;
    const nextFri = new Date(today);
    nextFri.setDate(today.getDate() + daysUntilNextFriday);
    const nextSun = new Date(nextFri);
    nextSun.setDate(nextFri.getDate() + 2);

    // 3. Midweek (Tue–Thu)
    let daysUntilTuesday = (2 - dayOfWeek + 7) % 7;
    if (daysUntilTuesday === 0) daysUntilTuesday = 7;
    const tue = new Date(today);
    tue.setDate(today.getDate() + daysUntilTuesday);
    const thu = new Date(tue);
    thu.setDate(tue.getDate() + 2);

    return {
      'this-weekend': {
        checkin: fmt(thisFri),
        checkout: fmt(thisSun),
        label: 'This Weekend',
        range: `${fmtShort(thisFri)}–${fmtShort(thisSun)}`,
      },
      'next-weekend': {
        checkin: fmt(nextFri),
        checkout: fmt(nextSun),
        label: 'Next Weekend (Popular)',
        range: `${fmtShort(nextFri)}–${fmtShort(nextSun)}`,
      },
      midweek: {
        checkin: fmt(tue),
        checkout: fmt(thu),
        label: 'Midweek (Tue–Thu)',
        range: `${fmtShort(tue)}–${fmtShort(thu)}`,
      },
    };
  }, []);

  useEffect(() => {
    const nextWk = calculatedDatePills['next-weekend'];
    setWeekendDates({ checkin: nextWk.checkin, checkout: nextWk.checkout, adults: 2 });
    setCustomCheckin(nextWk.checkin);
    setCustomCheckout(nextWk.checkout);
  }, [calculatedDatePills]);

  const handleSelectDateOption = useCallback((option: 'this-weekend' | 'next-weekend' | 'midweek') => {
    setDateOption(option);
    setShowCustomPicker(false);
    const opt = calculatedDatePills[option];
    setWeekendDates({ checkin: opt.checkin, checkout: opt.checkout, adults: 2 });
  }, [calculatedDatePills]);

  const handleApplyCustomDates = useCallback((checkin: string, checkout: string) => {
    if (!checkin || !checkout) return;
    setDateOption('custom');
    setCustomCheckin(checkin);
    setCustomCheckout(checkout);
    setWeekendDates({ checkin, checkout, adults: 2 });
  }, []);

  // Deduplicate hotels by URL signature (same hotel added multiple times to DB)
  const uniqueHotels = useMemo(() => {
    const seen = new Set<string>();
    return hotels.filter((h) => {
      const key = [h.url, h.agodaUrl, h.bookingUrl, h.tripUrl, h.name].filter(Boolean).join('|');
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [hotels]);

  // Dynamically resolve currency symbol and thresholds based on city destination
  const { currencySymbol, budgetMax, midMax, ultraMin } = useMemo(() => {
    for (const h of uniqueHotels) {
      const p = h.price || '';
      if (p.includes('€')) return { currencySymbol: '€', budgetMax: 120, midMax: 240, ultraMin: 450 };
      if (p.includes('£')) return { currencySymbol: '£', budgetMax: 100, midMax: 200, ultraMin: 400 };
      if (p.includes('₹')) return { currencySymbol: '₹', budgetMax: 5000, midMax: 12000, ultraMin: 25000 };
      if (p.includes('¥')) return { currencySymbol: '¥', budgetMax: 15000, midMax: 35000, ultraMin: 65000 };
      if (p.includes('฿')) return { currencySymbol: '฿', budgetMax: 2000, midMax: 5000, ultraMin: 10000 };
      if (p.includes('RM')) return { currencySymbol: 'RM', budgetMax: 250, midMax: 600, ultraMin: 1200 };
      if (p.includes('CHF')) return { currencySymbol: 'CHF', budgetMax: 150, midMax: 300, ultraMin: 600 };
      if (p.includes('CA$')) return { currencySymbol: 'CA$', budgetMax: 150, midMax: 300, ultraMin: 550 };
      if (p.includes('A$')) return { currencySymbol: 'A$', budgetMax: 160, midMax: 320, ultraMin: 600 };
    }
    const isIndia = countryName === 'India';
    return {
      currencySymbol: isIndia ? '₹' : '$',
      budgetMax: isIndia ? 5000 : 120,
      midMax: isIndia ? 12000 : 250,
      ultraMin: isIndia ? 25000 : 450,
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
      /stone tub|stone bath|freestanding stone|carved stone/i.test(allText) ||
      allText.includes('marble') ||
      allText.includes('onsen')
    );
  };

  const isApartmentStay = (h: HotelData) => {
    if (h.airbnbUrl) return true;
    const text = `${h.name} ${h.roomType || ''} ${h.description || ''}`.toLowerCase();
    return (
      text.includes('apartment') ||
      text.includes('2bhk') ||
      text.includes('1bhk') ||
      text.includes('3bhk') ||
      text.includes('flat') ||
      text.includes('villa') ||
      text.includes('bungalow') ||
      text.includes('homestay') ||
      text.includes('studio') ||
      text.includes('entire home') ||
      text.includes('b&b')
    );
  };

  const isLuxuryHotelStay = (h: HotelData) => {
    const text = `${h.name} ${h.roomType || ''} ${h.description || ''}`.toLowerCase();
    const p = parsePrice(h.price || '');
    if (p >= ultraMin) return true;
    return (
      text.includes('5-star') ||
      text.includes('five star') ||
      text.includes('resort') ||
      text.includes('palace') ||
      text.includes('grand') ||
      text.includes('taj') ||
      text.includes('oberoi') ||
      text.includes('leela') ||
      text.includes('itc') ||
      text.includes('marriott') ||
      text.includes('hyatt') ||
      text.includes('radisson') ||
      text.includes('shangri-la') ||
      text.includes('sofitel') ||
      text.includes('hilton') ||
      text.includes('kempinski') ||
      text.includes('four seasons') ||
      text.includes('st. regis') ||
      text.includes('rosewood') ||
      text.includes('ritz')
    );
  };

  const isBoutiqueStay = (h: HotelData) => {
    if (isApartmentStay(h)) return false;
    const text = `${h.name} ${h.roomType || ''} ${h.description || ''}`.toLowerCase();
    return (
      text.includes('boutique') ||
      text.includes('manor') ||
      text.includes('heritage') ||
      text.includes('inn') ||
      text.includes('suites') ||
      text.includes('haveli') ||
      text.includes('house') ||
      text.includes('lodge') ||
      text.includes('chateau') ||
      text.includes('historic') ||
      text.includes('villa')
    );
  };

  const isHostelStay = (h: HotelData) => {
    const text = `${h.name} ${h.roomType || ''} ${h.description || ''}`.toLowerCase();
    return (
      text.includes('hostel') ||
      text.includes('zostel') ||
      text.includes('poshtel') ||
      text.includes('backpacker') ||
      text.includes('hosteller') ||
      text.includes('gostops') ||
      text.includes('madpackers') ||
      text.includes('moustache') ||
      text.includes('dorm') ||
      text.includes('bunk')
    );
  };

  const matchesPerk = (h: HotelData, perk: string) => {
    const ams = (h.amenities || []).join(' ').toLowerCase();
    const desc = (h.description || '').toLowerCase();
    const name = h.name.toLowerCase();
    const text = `${name} ${desc} ${ams} ${h.roomType || ''}`.toLowerCase();

    if (perk === 'couple') {
      return (
        text.includes('couple') ||
        text.includes('romantic') ||
        text.includes('honeymoon') ||
        text.includes('private') ||
        isJacuzziHotel(h)
      );
    }
    if (perk === 'pool') {
      return text.includes('pool') || text.includes('swimming');
    }
    if (perk === 'breakfast') {
      return text.includes('breakfast') || ams.includes('breakfast');
    }
    if (perk === 'wifi') {
      return text.includes('wifi') || text.includes('wi-fi') || text.includes('internet');
    }
    if (perk === 'agoda') {
      return !!h.agodaUrl;
    }
    if (perk === 'airbnb') {
      return !!h.airbnbUrl;
    }
    return true;
  };

  const availableTubCategories = useMemo(() => {
    const map = new Map<string, { emoji: string; color: string; count: number }>();
    uniqueHotels.forEach((h) => {
      if (h.tubType) {
        const norm = normalizeTubType(h.tubType);
        const existing = map.get(norm.category);
        if (existing) {
          existing.count++;
        } else {
          map.set(norm.category, { emoji: norm.emoji, color: norm.color, count: 1 });
        }
      }
    });
    return Array.from(map.entries()).map(([category, { emoji, color, count }]) => ({ category, emoji, color, count }));
  }, [uniqueHotels]);

  // Counts for filter badges with zero false-negatives
  const counts = useMemo(() => {
    const jacuzzi = uniqueHotels.filter(isJacuzziHotel).length;
    const soaking = uniqueHotels.filter(isSoakingHotel).length;
    const tripled = uniqueHotels.filter((h) => h.url && (h.agodaUrl || h.bookingUrl)).length;

    return { all: uniqueHotels.length, jacuzzi, soaking, tripled };
  }, [uniqueHotels]);

  const stayStyleCounts = useMemo(() => {
    return {
      all: uniqueHotels.length,
      luxury: uniqueHotels.filter(isLuxuryHotelStay).length,
      apartment: uniqueHotels.filter(isApartmentStay).length,
      boutique: uniqueHotels.filter(isBoutiqueStay).length,
      hostel: uniqueHotels.filter(isHostelStay).length,
    };
  }, [uniqueHotels, ultraMin]);

  const priceRangeCounts = useMemo(() => {
    let budget = 0;
    let mid = 0;
    let luxury = 0;
    let ultra = 0;
    uniqueHotels.forEach((h) => {
      const p = parsePrice(h.price || '');
      if (p > 0) {
        if (p < budgetMax) budget++;
        else if (p <= midMax) mid++;
        else if (p < ultraMin) luxury++;
        else ultra++;
      }
    });
    return { budget, mid, luxury, ultra };
  }, [uniqueHotels, budgetMax, midMax, ultraMin]);

  const perkCounts = useMemo(() => {
    return {
      couple: uniqueHotels.filter((h) => matchesPerk(h, 'couple')).length,
      pool: uniqueHotels.filter((h) => matchesPerk(h, 'pool')).length,
      breakfast: uniqueHotels.filter((h) => matchesPerk(h, 'breakfast')).length,
      wifi: uniqueHotels.filter((h) => matchesPerk(h, 'wifi')).length,
      agoda: uniqueHotels.filter((h) => matchesPerk(h, 'agoda')).length,
      airbnb: uniqueHotels.filter((h) => matchesPerk(h, 'airbnb')).length,
    };
  }, [uniqueHotels]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchTerm.trim()) count++;
    if (selectedCity !== 'all') count++;
    if (stayStyle !== 'all') count++;
    if (selectedTubCategory !== 'all') count++;
    if (priceRange !== 'all') count++;
    if (selectedPerks.length > 0) count += selectedPerks.length;
    if (sortBy !== 'recommended') count++;
    return count;
  }, [searchTerm, selectedCity, stayStyle, selectedTubCategory, priceRange, selectedPerks, sortBy]);

  const togglePerk = (perk: string) => {
    setSelectedPerks((prev) =>
      prev.includes(perk) ? prev.filter((p) => p !== perk) : [...prev, perk]
    );
  };

  // Filtered hotels list
  const [visibleCount, setVisibleCount] = useState(24);
  const observerTarget = useRef<HTMLDivElement>(null);

  const availableCities = useMemo(() => {
    const map = new Map<string, number>();
    for (const h of uniqueHotels) {
      if (h.city) {
        map.set(h.city, (map.get(h.city) || 0) + 1);
      }
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [uniqueHotels]);

  useEffect(() => {
    // Reset visible count when filters change
    setVisibleCount(24);
  }, [searchTerm, selectedFilter, selectedTubCategory, sortBy, priceRange, stayStyle, selectedPerks, selectedCity]);

  const filteredHotels = useMemo(() => {
    const result = uniqueHotels.filter((h) => {
      // Destination / City filter (State Hubs with Multiple Cities)
      if (selectedCity !== 'all' && h.city !== selectedCity) return false;

      // Text search filter
      if (searchTerm.trim()) {
        const q = searchTerm.trim().toLowerCase();
        const matchesName = h.name.toLowerCase().includes(q);
        const matchesCity = (h.city || '').toLowerCase().includes(q);
        const matchesNeighborhood = (h.neighborhood || '').toLowerCase().includes(q);
        const matchesAmenity = h.amenities?.some((a) => a.toLowerCase().includes(q));
        const matchesTub = (h.tubType || '').toLowerCase().includes(q);
        if (!matchesName && !matchesCity && !matchesNeighborhood && !matchesAmenity && !matchesTub) return false;
      }

      // Stay Style filter
      if (stayStyle === 'luxury' && !isLuxuryHotelStay(h)) return false;
      if (stayStyle === 'apartment' && !isApartmentStay(h)) return false;
      if (stayStyle === 'boutique' && !isBoutiqueStay(h)) return false;
      if (stayStyle === 'hostel' && !isHostelStay(h)) return false;

      // Category filter (legacy support)
      if (selectedFilter === 'jacuzzi' && !isJacuzziHotel(h)) return false;
      if (selectedFilter === 'soaking' && !isSoakingHotel(h)) return false;
      if (selectedFilter === 'tripled') {
        if (!(h.url && (h.agodaUrl || h.bookingUrl))) return false;
      }

      // Bathtub Category filter
      if (selectedTubCategory !== 'all') {
        const norm = normalizeTubType(h.tubType);
        if (norm.category !== selectedTubCategory) return false;
      }

      // Price Range filter
      if (priceRange !== 'all' && h.price) {
        const p = parsePrice(h.price);
        if (p > 0) {
          if (priceRange === 'budget' && p >= budgetMax) return false;
          if (priceRange === 'mid' && (p < budgetMax || p >= midMax)) return false;
          if (priceRange === 'luxury' && (p < midMax || p >= ultraMin)) return false;
          if (priceRange === 'ultra' && p < ultraMin) return false;
        }
      }

      // Perks & Deals multi-select filter
      if (selectedPerks.length > 0) {
        const matchesAll = selectedPerks.every((perk) => matchesPerk(h, perk));
        if (!matchesAll) return false;
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
      // Recommended: prioritize stays that have at least one direct property URL, then rating
      const hasDirectA = [a.agodaUrl, a.url, a.bookingUrl, a.airbnbUrl, a.tripUrl].some(isDirectPropertyUrl) ? 0 : 1;
      const hasDirectB = [b.agodaUrl, b.url, b.bookingUrl, b.airbnbUrl, b.tripUrl].some(isDirectPropertyUrl) ? 0 : 1;
      if (hasDirectA !== hasDirectB) return hasDirectA - hasDirectB;
      return (b.rating || 0) - (a.rating || 0);
    });

    return result;
  }, [
    uniqueHotels,
    searchTerm,
    selectedCity,
    stayStyle,
    selectedTubCategory,
    selectedFilter,
    priceRange,
    selectedPerks,
    sortBy,
    budgetMax,
    midMax,
    ultraMin,
  ]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + 24, filteredHotels.length));
        }
      },
      { rootMargin: '400px' }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [filteredHotels.length]);

  // Track dead-end filter pain point (when filter/search yields 0 hotels)
  useEffect(() => {
    if (
      filteredHotels.length === 0 &&
      (selectedFilter !== 'all' ||
        searchTerm.trim() ||
        selectedTubCategory !== 'all' ||
        priceRange !== 'all' ||
        stayStyle !== 'all' ||
        selectedPerks.length > 0)
    ) {
      const timer = setTimeout(() => {
        recordFilterDeadEnd(stayStyle !== 'all' ? stayStyle : selectedTubCategory !== 'all' ? selectedTubCategory : selectedFilter, searchTerm.trim(), cityName);
      }, 750);
      return () => clearTimeout(timer);
    }
  }, [filteredHotels.length, selectedFilter, searchTerm, cityName, selectedTubCategory, priceRange, stayStyle, selectedPerks]);

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
        trackEvent('filter_applied', {
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
    setSelectedCity('all');
    setStayStyle('all');
    setSelectedTubCategory('all');
    setPriceRange('all');
    setSelectedPerks([]);
    setSearchTerm('');
    setSortBy('recommended');
    recordFilterReset(cityName);
    try {
      if (!isUserExcluded()) {
        trackEvent('filter_reset', { city: cityName });
      }
    } catch (_) {}
  };

  // Detect what kind of URL is stored in any booking field
  type UrlProvider = 'makemytrip' | 'booking' | 'expedia' | 'hotelscom' | 'vrbo' | 'agoda' | 'trivago' | 'tripadvisor' | 'google' | 'airbnb' | 'trip' | null;
  function getUrlProvider(url?: string): UrlProvider {
    if (!url) return null;
    const lower = url.toLowerCase();
    if (lower.includes('makemytrip.com')) return 'makemytrip';
    if (lower.includes('booking.com')) return 'booking';
    if (lower.includes('expedia.com')) return 'expedia';
    if (lower.includes('hotels.com')) return 'hotelscom';
    if (lower.includes('vrbo.com')) return 'vrbo';
    if (lower.includes('agoda.com')) return 'agoda';
    if (lower.includes('trip.com')) return 'trip';
    if (lower.includes('airbnb')) return 'airbnb';
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
      booking: { 
        label: 'Check on Booking.com', 
        source: 'Booking.com', 
        className: isPrimary 
          ? 'bg-[#1a6fde] hover:bg-[#1559b8] text-white font-bold text-xs sm:text-[13px] px-3.5 py-2 sm:py-2.5 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 w-full' 
          : 'bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-center py-1.5 px-3 rounded-lg font-semibold transition-colors text-[11px] flex items-center justify-center gap-1 w-full' 
      },
      expedia: { 
        label: 'Check on Expedia', 
        source: 'Expedia', 
        className: isPrimary 
          ? 'bg-[#00256c] hover:bg-[#001c54] text-white font-bold text-xs sm:text-[13px] px-3.5 py-2 sm:py-2.5 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 w-full' 
          : 'bg-amber-50 hover:bg-amber-100 text-[#00256c] border border-amber-300 text-center py-1.5 px-3 rounded-lg font-semibold transition-colors text-[11px] flex items-center justify-center gap-1 w-full' 
      },
      hotelscom: { 
        label: 'Check on Hotels.com', 
        source: 'Hotels.com', 
        className: isPrimary 
          ? 'bg-[#d32f2f] hover:bg-[#b71c1c] text-white font-bold text-xs sm:text-[13px] px-3.5 py-2 sm:py-2.5 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 w-full' 
          : 'bg-red-50 hover:bg-red-100 text-[#d32f2f] border border-red-200 text-center py-1.5 px-3 rounded-lg font-semibold transition-colors text-[11px] flex items-center justify-center gap-1 w-full' 
      },
      vrbo: { 
        label: 'Check on Vrbo', 
        source: 'Vrbo', 
        className: isPrimary 
          ? 'bg-[#1b3b6f] hover:bg-[#12284c] text-white font-bold text-xs sm:text-[13px] px-3.5 py-2 sm:py-2.5 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 w-full' 
          : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 text-center py-1.5 px-3 rounded-lg font-semibold transition-colors text-[11px] flex items-center justify-center gap-1 w-full' 
      },
      makemytrip: { 
        label: 'Check on MakeMyTrip', 
        source: 'MakeMyTrip', 
        className: isPrimary 
          ? 'bg-[#1a6fde] hover:bg-[#1559b8] text-white font-bold text-xs sm:text-[13px] px-3.5 py-2 sm:py-2.5 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 w-full' 
          : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-center py-1.5 px-3 rounded-lg font-semibold transition-colors text-[11px] flex items-center justify-center gap-1 w-full' 
      },
      agoda: { 
        label: 'Check on Agoda', 
        source: 'Agoda', 
        className: isPrimary 
          ? 'bg-[#1a6fde] hover:bg-[#1559b8] text-white font-bold text-xs sm:text-[13px] px-3.5 py-2 sm:py-2.5 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 w-full' 
          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-center py-1.5 px-3 rounded-lg font-semibold transition-colors text-[11px] flex items-center justify-center gap-1 w-full' 
      },
      trip: { 
        label: 'Check on Trip.com', 
        source: 'Trip.com', 
        className: isPrimary 
          ? 'bg-[#2681ff] hover:bg-[#1a6edb] text-white font-bold text-xs sm:text-[13px] px-3.5 py-2 sm:py-2.5 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 w-full' 
          : 'bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-center py-1.5 px-3 rounded-lg font-semibold transition-colors text-[11px] flex items-center justify-center gap-1 w-full' 
      },
      airbnb: { 
        label: 'Check on Airbnb', 
        source: 'Airbnb', 
        className: isPrimary 
          ? 'bg-[#ff5a5f] hover:bg-[#e04c51] text-white font-bold text-xs sm:text-[13px] px-3.5 py-2 sm:py-2.5 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 w-full' 
          : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-center py-1.5 px-3 rounded-lg font-semibold transition-colors text-[11px] flex items-center justify-center gap-1 w-full' 
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
      <OutboundLink href={url} hotelName={hotelName} cityName={city} source={source} dates={weekendDates} className={className}>
        <span className="sm:hidden">{(preferredLabel || label).replace(/^Check on /, '')}</span>
        <span className="hidden sm:inline">{preferredLabel || label}</span>
        <span>&rarr;</span>
      </OutboundLink>
    );
  }

  return (
    <div>
      {/* Comprehensive Multi-Layer Hotel & Bathtub Filters */}
      <div className="bg-white px-4 py-4 sm:px-5 sm:py-5 rounded-2xl border border-gray-200 shadow-sm mb-6 flex flex-col gap-3.5 w-full">
        {/* Row 1: Search, Sort & Reset Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 w-full">
          {/* Quick Hotel Name / Neighborhood Search */}
          <div className="w-full md:w-72 relative shrink-0">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Search ${cityName} hotels, areas...`}
              className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#1a6fde] focus:bg-white focus:ring-2 focus:ring-[#1a6fde]/20 transition-all"
            />
            <svg className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2.5 text-xs text-gray-400 hover:text-gray-700 w-5 h-5 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sort Buttons + Clear */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider hidden lg:inline mr-1">Sort:</span>
            <button
              onClick={() => setSortBy('recommended')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border shrink-0 ${sortBy === 'recommended' ? 'bg-[#1a6fde] text-white border-[#1a6fde] shadow-xs' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-transparent'}`}
            >
              Recommended
            </button>
            <button
              onClick={() => setSortBy('price_asc')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border shrink-0 ${sortBy === 'price_asc' ? 'bg-[#1a6fde] text-white border-[#1a6fde] shadow-xs' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-transparent'}`}
            >
              Price ↑
            </button>
            <button
              onClick={() => setSortBy('price_desc')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border shrink-0 ${sortBy === 'price_desc' ? 'bg-[#1a6fde] text-white border-[#1a6fde] shadow-xs' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-transparent'}`}
            >
              Price ↓
            </button>
            <button
              onClick={() => setSortBy('rating')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border shrink-0 ${sortBy === 'rating' ? 'bg-[#1a6fde] text-white border-[#1a6fde] shadow-xs' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-transparent'}`}
            >
              Top Rated
            </button>
            <button
              onClick={() => setSortBy('reviews')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border shrink-0 ${sortBy === 'reviews' ? 'bg-[#1a6fde] text-white border-[#1a6fde] shadow-xs' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-transparent'}`}
            >
              Most Reviewed
            </button>

            {activeFilterCount > 0 && (
              <button
                onClick={handleResetFilters}
                className="ml-auto md:ml-2 px-3 py-1.5 rounded-full text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all flex items-center gap-1 shrink-0"
                title="Reset all filters"
              >
                <span>✕</span>
                <span>Reset ({activeFilterCount})</span>
              </button>
            )}
          </div>
        </div>

        {/* Destination Filter (State Hubs with Multiple Cities) */}
        {availableCities.length > 1 && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-3 border-t border-gray-100">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider shrink-0 w-24">
              City / Area:
            </span>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
              <button
                onClick={() => setSelectedCity('all')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border shrink-0 ${
                  selectedCity === 'all'
                    ? 'bg-[#1a6fde] text-white border-[#1a6fde] shadow-xs'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                All {cityName} ({uniqueHotels.length})
              </button>
              {availableCities.map(([city, count]) => (
                <button
                  key={city}
                  onClick={() => setSelectedCity(selectedCity === city ? 'all' : city)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border shrink-0 ${
                    selectedCity === city
                      ? 'bg-[#1a6fde] text-white border-[#1a6fde] shadow-xs'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {city} ({count})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Row 2: Stay Type Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-3 border-t border-gray-100">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider shrink-0 w-24">
            Stay Type:
          </span>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            <button
              onClick={() => setStayStyle('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border shrink-0 ${
                stayStyle === 'all'
                  ? 'bg-gray-900 text-white border-gray-900 shadow-xs'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              All Stays ({uniqueHotels.length})
            </button>
            <button
              onClick={() => setStayStyle('luxury')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border shrink-0 ${
                stayStyle === 'luxury'
                  ? 'bg-gray-900 text-white border-gray-900 shadow-xs'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              🏨 5-Star &amp; Luxury ({stayStyleCounts.luxury})
            </button>
            <button
              onClick={() => setStayStyle('apartment')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border shrink-0 ${
                stayStyle === 'apartment'
                  ? 'bg-gray-900 text-white border-gray-900 shadow-xs'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              🏡 Entire Apartments &amp; Villas ({stayStyleCounts.apartment})
            </button>
            <button
              onClick={() => setStayStyle('boutique')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border shrink-0 ${
                stayStyle === 'boutique'
                  ? 'bg-gray-900 text-white border-gray-900 shadow-xs'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              ✨ Boutique Stays ({stayStyleCounts.boutique})
            </button>
            {stayStyleCounts.hostel > 0 && (
              <button
                onClick={() => setStayStyle('hostel')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border shrink-0 ${
                  stayStyle === 'hostel'
                    ? 'bg-gray-900 text-white border-gray-900 shadow-xs'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                🎒 Hostels &amp; Poshtels ({stayStyleCounts.hostel})
              </button>
            )}
          </div>
        </div>

        {/* Row 3: Bathtub Category Filter */}
        {availableTubCategories.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-3 border-t border-gray-100">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider shrink-0 w-24">
              Bathtub:
            </span>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
              <button
                onClick={() => setSelectedTubCategory('all')}
                className={`px-3 py-1.5 rounded-full border text-xs font-bold transition-all shrink-0 ${
                  selectedTubCategory === 'all'
                    ? 'bg-[#1a6fde] text-white border-[#1a6fde] shadow-xs'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-[#1a6fde] hover:text-[#1a6fde]'
                }`}
              >
                All Tub Types
              </button>
              {availableTubCategories.map((cat) => (
                <button
                  key={cat.category}
                  onClick={() => setSelectedTubCategory(cat.category)}
                  className={`px-3 py-1.5 rounded-full border text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                    selectedTubCategory === cat.category
                      ? 'bg-[#1a6fde] text-white border-[#1a6fde] shadow-xs'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-[#1a6fde] hover:text-[#1a6fde]'
                  }`}
                >
                  <span>{cat.emoji}</span>
                  <span>{cat.category}</span>
                  <span className="text-[10px] opacity-75">({cat.count})</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Row 4: Price Range Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-3 border-t border-gray-100">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider shrink-0 w-24">
            Price:
          </span>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            <button
              onClick={() => setPriceRange('all')}
              className={`px-3 py-1.5 rounded-full border text-xs font-bold transition-all shrink-0 ${
                priceRange === 'all'
                  ? 'bg-gray-900 text-white border-gray-900 shadow-xs'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              All Prices
            </button>
            <button
              onClick={() => setPriceRange('budget')}
              className={`px-3 py-1.5 rounded-full border text-xs font-bold transition-all shrink-0 ${
                priceRange === 'budget'
                  ? 'bg-gray-900 text-white border-gray-900 shadow-xs'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              Budget (&lt; {currencySymbol}{budgetMax.toLocaleString()})
              {priceRangeCounts.budget > 0 && <span className="ml-1 text-[10px] opacity-75">({priceRangeCounts.budget})</span>}
            </button>
            <button
              onClick={() => setPriceRange('mid')}
              className={`px-3 py-1.5 rounded-full border text-xs font-bold transition-all shrink-0 ${
                priceRange === 'mid'
                  ? 'bg-gray-900 text-white border-gray-900 shadow-xs'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              Mid-range ({currencySymbol}{budgetMax.toLocaleString()} - {currencySymbol}{midMax.toLocaleString()})
              {priceRangeCounts.mid > 0 && <span className="ml-1 text-[10px] opacity-75">({priceRangeCounts.mid})</span>}
            </button>
            <button
              onClick={() => setPriceRange('luxury')}
              className={`px-3 py-1.5 rounded-full border text-xs font-bold transition-all shrink-0 ${
                priceRange === 'luxury'
                  ? 'bg-gray-900 text-white border-gray-900 shadow-xs'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              Luxury ({currencySymbol}{midMax.toLocaleString()} - {currencySymbol}{ultraMin.toLocaleString()})
              {priceRangeCounts.luxury > 0 && <span className="ml-1 text-[10px] opacity-75">({priceRangeCounts.luxury})</span>}
            </button>
            <button
              onClick={() => setPriceRange('ultra')}
              className={`px-3 py-1.5 rounded-full border text-xs font-bold transition-all shrink-0 ${
                priceRange === 'ultra'
                  ? 'bg-gray-900 text-white border-gray-900 shadow-xs'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              Ultra-Luxury ({currencySymbol}{ultraMin.toLocaleString()}+)
              {priceRangeCounts.ultra > 0 && <span className="ml-1 text-[10px] opacity-75">({priceRangeCounts.ultra})</span>}
            </button>
          </div>
        </div>

        {/* Row 5: Perks & Deals Multi-Select Toggles */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-3 border-t border-gray-100">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider shrink-0 w-24">
            Perks &amp; Deals:
          </span>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            {[
              { id: 'couple', label: '💑 Couple Friendly', count: perkCounts.couple },
              { id: 'pool', label: '🏊 Swimming Pool', count: perkCounts.pool },
              { id: 'breakfast', label: '🍳 Breakfast Included', count: perkCounts.breakfast },
              { id: 'wifi', label: '📶 Free WiFi', count: perkCounts.wifi },
              { id: 'agoda', label: '⚡ Agoda Deals', count: perkCounts.agoda },
              { id: 'airbnb', label: '🏠 Airbnb Stays', count: perkCounts.airbnb },
            ]
              .filter((p) => p.count > 0)
              .map((p) => {
                const isSelected = selectedPerks.includes(p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => togglePerk(p.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border shrink-0 flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-500 hover:text-emerald-700'
                    }`}
                  >
                    <span>{p.label}</span>
                    <span className="text-[10px] opacity-75">({p.count})</span>
                    {isSelected && <span className="text-white text-[11px] ml-0.5">✓</span>}
                  </button>
                );
              })}
          </div>
        </div>

        {/* Row 6: Travel Dates & Booking Window */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-3 border-t border-gray-100">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider shrink-0 w-24">
            Travel Dates:
          </span>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            <button
              type="button"
              onClick={() => handleSelectDateOption('this-weekend')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border shrink-0 flex items-center gap-1.5 cursor-pointer ${
                dateOption === 'this-weekend'
                  ? 'bg-[#1a6fde] text-white border-[#1a6fde] shadow-xs'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-[#1a6fde] hover:text-[#1a6fde]'
              }`}
            >
              <span>🗓️ This Weekend</span>
              <span className={`text-[10px] ml-0.5 ${dateOption === 'this-weekend' ? 'text-white/80' : 'text-gray-400'}`}>
                ({calculatedDatePills['this-weekend'].range})
              </span>
            </button>
            <button
              type="button"
              onClick={() => handleSelectDateOption('next-weekend')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border shrink-0 flex items-center gap-1.5 cursor-pointer ${
                dateOption === 'next-weekend'
                  ? 'bg-[#1a6fde] text-white border-[#1a6fde] shadow-xs'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-[#1a6fde] hover:text-[#1a6fde]'
              }`}
            >
              <span>🗓️ Next Weekend (Popular)</span>
              <span className={`text-[10px] ml-0.5 ${dateOption === 'next-weekend' ? 'text-white/80' : 'text-gray-400'}`}>
                ({calculatedDatePills['next-weekend'].range})
              </span>
            </button>
            <button
              type="button"
              onClick={() => handleSelectDateOption('midweek')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border shrink-0 flex items-center gap-1.5 cursor-pointer ${
                dateOption === 'midweek'
                  ? 'bg-[#1a6fde] text-white border-[#1a6fde] shadow-xs'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-[#1a6fde] hover:text-[#1a6fde]'
              }`}
            >
              <span>💼 Midweek (Tue–Thu)</span>
              <span className={`text-[10px] ml-0.5 ${dateOption === 'midweek' ? 'text-white/80' : 'text-gray-400'}`}>
                ({calculatedDatePills.midweek.range})
              </span>
            </button>
            {weekendDates && (
              <span className="text-[11px] text-gray-500 font-medium ml-1 hidden md:inline whitespace-nowrap">
                Selected: {weekendDates.checkin} → {weekendDates.checkout}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Matchmaker Discovery Callout */}
      <div className="bg-gradient-to-r from-blue-50/80 via-indigo-50/80 to-blue-50/80 border border-blue-200/80 rounded-2xl p-4 sm:p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1a6fde] to-[#0a4fa8] text-white flex items-center justify-center text-lg shrink-0 shadow-xs">
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
          className="bg-[#1a6fde] hover:bg-[#1559b8] text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-xs hover:shadow-md whitespace-nowrap shrink-0"
        >
          Open Matchmaker &rarr;
        </Link>
      </div>

      {/* Booking Verification Tip Banner */}
      <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-3.5 sm:p-5 mb-6 flex items-start gap-3 shadow-2xs">
        <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
          <span className="text-base">💡</span>
        </div>
        <div className="text-xs sm:text-sm text-amber-900 leading-relaxed">
          <strong className="font-bold block mb-0.5">Booking Tip for {cityName} Bathtub Suites:</strong>
          When selecting your room on {countryName.toLowerCase() === 'india' ? 'MakeMyTrip, Agoda, or Booking.com' : 'Booking.com, Expedia, or Agoda'}, ensure your chosen room tier (such as <em>Executive Suite</em> or <em>Deluxe Room with Jacuzzi</em>) explicitly lists the bathtub amenity before confirming.
        </div>
      </div>

      {/* Active Filter Chips & Results Count Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 px-1">
        <div className="text-xs sm:text-sm text-gray-700 font-medium">
          Showing <strong className="text-gray-900 font-black">{filteredHotels.length}</strong> of{' '}
          <span className="text-gray-500">{uniqueHotels.length} verified stays</span> in{' '}
          <span className="font-semibold text-gray-900">{cityName}</span>
          {activeFilterCount > 0 && <span className="text-[#1a6fde] font-semibold ml-1.5">(matching filters)</span>}
        </div>

        {/* Active filter removable pills */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            {stayStyle !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                <span>{stayStyle === 'luxury' ? '🏨 Luxury' : stayStyle === 'apartment' ? '🏡 Apartments' : '✨ Boutique'}</span>
                <button onClick={() => setStayStyle('all')} className="hover:text-rose-600 ml-0.5">✕</button>
              </span>
            )}
            {selectedTubCategory !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-[#1a6fde]">
                <span>{selectedTubCategory}</span>
                <button onClick={() => setSelectedTubCategory('all')} className="hover:text-rose-600 ml-0.5">✕</button>
              </span>
            )}
            {priceRange !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 capitalize">
                <span>{priceRange} Price</span>
                <button onClick={() => setPriceRange('all')} className="hover:text-rose-600 ml-0.5">✕</button>
              </span>
            )}
            {selectedPerks.map((perk) => {
              const labels: Record<string, string> = {
                couple: '💑 Couple Friendly',
                pool: '🏊 Swimming Pool',
                breakfast: '🍳 Breakfast',
                wifi: '📶 Free WiFi',
                agoda: '⚡ Agoda Deals',
                airbnb: '🏠 Airbnb Stays',
              };
              return (
                <span key={perk} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800">
                  <span>{labels[perk] || perk}</span>
                  <button onClick={() => togglePerk(perk)} className="hover:text-rose-600 ml-0.5">✕</button>
                </span>
              );
            })}
            {searchTerm.trim() && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-900">
                <span>&ldquo;{searchTerm}&rdquo;</span>
                <button onClick={() => setSearchTerm('')} className="hover:text-rose-600 ml-0.5">✕</button>
              </span>
            )}
            <button
              onClick={handleResetFilters}
              className="text-xs font-bold text-gray-500 hover:text-rose-600 underline ml-1 cursor-pointer"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Prominent Travel Dates Selector Bar — Dynamic OTA Link Date Injection */}
      <div className="bg-gradient-to-r from-blue-50/70 via-white to-sky-50/70 border border-blue-200/80 rounded-2xl p-4 sm:p-5 mb-6 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1a6fde] to-[#0a4fa8] text-white flex items-center justify-center text-base shrink-0 shadow-xs">
              🗓️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900 text-sm sm:text-base">Target Travel Dates</span>
                <span className="text-[10px] font-bold text-[#1a6fde] bg-blue-100/70 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Live Rates
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Pre-fills real-time check-in &amp; check-out directly into Booking.com, Agoda &amp; Expedia.
              </p>
            </div>
          </div>

          {/* Quick Date Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleSelectDateOption('this-weekend')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border shrink-0 flex items-center gap-1.5 cursor-pointer ${
                dateOption === 'this-weekend'
                  ? 'bg-[#1a6fde] text-white border-[#1a6fde] shadow-xs'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-[#1a6fde] hover:text-[#1a6fde]'
              }`}
            >
              <span>🗓️ This Weekend</span>
              <span className={`text-[10px] ml-0.5 px-1.5 py-0.5 rounded ${dateOption === 'this-weekend' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                {calculatedDatePills['this-weekend'].range}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectDateOption('next-weekend')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border shrink-0 flex items-center gap-1.5 cursor-pointer ${
                dateOption === 'next-weekend'
                  ? 'bg-[#1a6fde] text-white border-[#1a6fde] shadow-xs'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-[#1a6fde] hover:text-[#1a6fde]'
              }`}
            >
              <span>🗓️ Next Weekend (Popular)</span>
              <span className={`text-[10px] ml-0.5 px-1.5 py-0.5 rounded ${dateOption === 'next-weekend' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                {calculatedDatePills['next-weekend'].range}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectDateOption('midweek')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border shrink-0 flex items-center gap-1.5 cursor-pointer ${
                dateOption === 'midweek'
                  ? 'bg-[#1a6fde] text-white border-[#1a6fde] shadow-xs'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-[#1a6fde] hover:text-[#1a6fde]'
              }`}
            >
              <span>💼 Midweek (Tue–Thu)</span>
              <span className={`text-[10px] ml-0.5 px-1.5 py-0.5 rounded ${dateOption === 'midweek' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                {calculatedDatePills.midweek.range}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setShowCustomPicker(!showCustomPicker)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border shrink-0 flex items-center gap-1.5 cursor-pointer ${
                dateOption === 'custom'
                  ? 'bg-[#1a6fde] text-white border-[#1a6fde] shadow-xs'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-[#1a6fde] hover:text-[#1a6fde]'
              }`}
            >
              <span>📅 Custom Dates {showCustomPicker ? '▲' : '▾'}</span>
              {dateOption === 'custom' && customCheckin && (
                <span className="text-[10px] ml-0.5 px-1.5 py-0.5 rounded bg-white/20 text-white">
                  {customCheckin.slice(5)} → {customCheckout.slice(5)}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Custom Date Picker Tray */}
        {showCustomPicker && (
          <div className="mt-4 pt-3.5 border-t border-blue-100/80 flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold text-gray-700">Choose Specific Check-in &amp; Check-out:</span>
            <div className="flex items-center gap-2">
              <label className="text-[11px] text-gray-500">In:</label>
              <input
                type="date"
                value={customCheckin}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => {
                  const val = e.target.value;
                  setCustomCheckin(val);
                  if (customCheckout && val < customCheckout) {
                    handleApplyCustomDates(val, customCheckout);
                  }
                }}
                className="px-2.5 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold text-gray-900 bg-white focus:outline-none focus:border-[#1a6fde]"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-[11px] text-gray-500">Out:</label>
              <input
                type="date"
                value={customCheckout}
                min={customCheckin || new Date().toISOString().split('T')[0]}
                onChange={(e) => {
                  const val = e.target.value;
                  setCustomCheckout(val);
                  if (customCheckin && val > customCheckin) {
                    handleApplyCustomDates(customCheckin, val);
                  }
                }}
                className="px-2.5 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold text-gray-900 bg-white focus:outline-none focus:border-[#1a6fde]"
              />
            </div>
            {customCheckin && customCheckout && customCheckout > customCheckin && (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md">
                ✓ Ready ({customCheckin} → {customCheckout})
              </span>
            )}
          </div>
        )}
      </div>

      {/* Hotel Cards Grid */}
      {filteredHotels.length > 0 ? (
        <>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {filteredHotels.slice(0, visibleCount).map((h, i) => {
            const providerLabel: Record<NonNullable<UrlProvider>, string> = {
              makemytrip: 'MakeMyTrip', booking: 'Booking.com', expedia: 'Expedia', hotelscom: 'Hotels.com', vrbo: 'Vrbo', agoda: 'Agoda', trip: 'Trip.com',
              trivago: 'Trivago', tripadvisor: 'TripAdvisor', google: '', airbnb: 'Airbnb',
            };
            const verifiedSources = [
              ...(h.bookingUrl ? [providerLabel[getUrlProvider(h.bookingUrl) ?? 'google']].filter(Boolean) : []),
              ...(h.expediaUrl ? [providerLabel[getUrlProvider(h.expediaUrl) ?? 'google']].filter(Boolean) : []),
              ...(h.hotelsComUrl ? [providerLabel[getUrlProvider(h.hotelsComUrl) ?? 'google']].filter(Boolean) : []),
              ...(h.vrboUrl ? [providerLabel[getUrlProvider(h.vrboUrl) ?? 'google']].filter(Boolean) : []),
              ...(h.agodaUrl ? [providerLabel[getUrlProvider(h.agodaUrl) ?? 'google']].filter(Boolean) : []),
              ...(h.tripUrl ? [providerLabel[getUrlProvider(h.tripUrl) ?? 'google']].filter(Boolean) : []),
              ...(h.mmtUrl ? [providerLabel[getUrlProvider(h.mmtUrl) ?? 'google']].filter(Boolean) : []),
              ...(h.airbnbUrl ? [providerLabel[getUrlProvider(h.airbnbUrl) ?? 'google']].filter(Boolean) : []),
              ...(h.url ? [providerLabel[getUrlProvider(h.url) ?? 'google']].filter(Boolean) : []),
            ].filter((v, i, a) => a.indexOf(v) === i); // dedupe

            const isIndia = countryName.toLowerCase() === 'india';
            let rawUrls = [h.bookingUrl, h.expediaUrl, h.hotelsComUrl, h.vrboUrl, h.agodaUrl, h.tripUrl, h.mmtUrl, h.airbnbUrl, h.url]
              .filter((u): u is string => !!u)
              .filter((u, idx, arr) => arr.indexOf(u) === idx);

            // For USA & non-India hotels: strictly suppress any MakeMyTrip or Indian reseller links
            if (!isIndia) {
              rawUrls = rawUrls.filter(u => !u.toLowerCase().includes('makemytrip.com') && !u.toLowerCase().includes('ekaro') && !u.toLowerCase().includes('linkredirect'));
            }
            
            const sortedUrls = [...rawUrls].sort((a, b) => {
              const tierA = getUrlDirectnessTier(a);
              const tierB = getUrlDirectnessTier(b);
              if (tierA !== tierB) return tierA - tierB;

              const provA = getUrlProvider(a);
              const provB = getUrlProvider(b);
              if (h.airbnbUrl && !h.bookingUrl && !h.agodaUrl) {
                if (provA === 'airbnb') return -1;
                if (provB === 'airbnb') return 1;
              }
              const priority: Record<string, number> = isIndia
                ? { agoda: 1, booking: 2, makemytrip: 3, expedia: 4, airbnb: 5, trip: 6, trivago: 7, tripadvisor: 8 }
                : { booking: 1, expedia: 2, hotelscom: 3, vrbo: 4, agoda: 5, trip: 6, airbnb: 7, trivago: 8, tripadvisor: 9, makemytrip: 99 };
              return (priority[provA || ''] || 99) - (priority[provB || ''] || 99);
            });

            // Filter out Tier 99 (broken search / generic redirect / fake search) URLs
            const safeUrls = sortedUrls.filter(u => getUrlDirectnessTier(u) < 99);
            const displayUrls = safeUrls;

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
                <HotelCardImage
                  primaryImage={h.image}
                  images={h.images}
                  partnerImages={h.partnerImages}
                  hotelName={h.name}
                  cityName={cityName}
                  countryName={countryName}
                  tubType={h.tubType}
                  priority={i < 2}
                  verifiedSources={verifiedSources}
                  crossVerifiedAt={h.crossVerifiedAt}
                />

                {/* Card Content */}
                <div className="p-3.5 sm:p-4 flex flex-col flex-grow">
                  {/* Hotel Title */}
                  <Link href={`/${slugify(countryName)}/${h.city ? slugify(h.city) : slugify(cityName)}/${h.slug || slugify(h.name)}`} className="group/link mb-1">
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
                  <p className="text-xs text-gray-500 font-medium mb-2 flex items-center gap-1 sm:flex-wrap">
                    <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                    <span className="font-semibold text-gray-700 truncate sm:whitespace-normal">{h.neighborhood ? `${h.neighborhood}, ${h.city || cityName}` : `${h.city || cityName}, ${countryName}`}</span>
                    {h.landmarkDistance && (
                      <span className="hidden sm:inline text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
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
                      <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 font-medium text-[11px] rounded-md">
                        <span>🏷️</span> <span className="line-clamp-1">{h.roomType}</span>
                      </span>
                    )}
                  </div>

                  {/* Description snippet if any */}
                  {h.description && (
                    <p className="hidden sm:block text-[11px] sm:text-xs text-gray-500 mb-2 line-clamp-2 leading-relaxed">
                      {h.description}
                    </p>
                  )}

                  {/* Booking Tip (Compact) */}
                  {h.bookingTip && (
                    <div className="hidden sm:flex bg-amber-50/80 border border-amber-200/60 rounded-lg p-2 mb-2.5 text-[11px] text-amber-900 leading-snug items-start gap-1.5">
                      <span className="shrink-0 text-xs">💡</span>
                      <span className="line-clamp-2"><strong>Tip:</strong> {h.bookingTip}</span>
                    </div>
                  )}

                  {/* Amenities Chips (Modern compact tags) */}
                  <div className="hidden sm:flex flex-wrap items-center gap-1.5 mb-3 pt-2 border-t border-gray-100">
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
                    <div className="flex items-baseline justify-between mb-1">
                      <div>
                        <span className="text-[10px] text-gray-400 font-medium block leading-none mb-0.5">Usual Rate</span>
                        <div className="flex items-baseline">
                          <span className="text-base sm:text-[17px] font-black text-gray-900">
                            {h.price ? (h.price.startsWith('~') ? h.price : `~${h.price}`) : 'See live partner rates'}
                          </span>
                          {h.price && <span className="text-[10px] text-gray-400 font-medium ml-1">/ night</span>}
                        </div>
                      </div>
                      <Link href={`/${slugify(countryName)}/${h.city ? slugify(h.city) : slugify(cityName)}/${h.slug || slugify(h.name)}`} className="hidden sm:inline-block text-[11px] font-bold text-[#1a6fde] hover:underline">
                        View Details &rarr;
                      </Link>
                    </div>

                    <span className="hidden sm:block text-[9.5px] text-gray-400 mb-2 leading-tight">
                      Rates exclude taxes &amp; resort fees — shown at partner checkout
                    </span>

                    {h.roomType && (
                      <div className="hidden sm:block text-[10px] text-emerald-800 bg-emerald-50/80 border border-emerald-200/70 rounded-lg px-2 py-1 mb-2 truncate font-medium">
                        🛁 Select <strong className="font-bold">{h.roomType}</strong> for tub
                      </div>
                    )}

                    <div className="flex flex-col gap-1.5">
                      {displayUrls.length > 0 ? (
                        <>
                          {displayUrls.slice(0, 2).map((u, idx) => (
                            <BookingButton key={idx} url={u} hotelName={h.name} cityName={h.city || cityName} isPrimary={idx === 0} />
                          ))}
                          {displayUrls.length > 2 && (
                            <Link
                              href={`/${slugify(countryName)}/${h.city ? slugify(h.city) : slugify(cityName)}/${h.slug || slugify(h.name)}`}
                              className="text-center text-[11px] font-semibold text-gray-500 hover:text-[#1a6fde] py-1 transition-colors"
                            >
                              Compare all {displayUrls.length} sites &amp; tub guide &rarr;
                            </Link>
                          )}
                        </>
                      ) : (
                        <Link
                          href={`/${slugify(countryName)}/${h.city ? slugify(h.city) : slugify(cityName)}/${h.slug || slugify(h.name)}`}
                          className="bg-[#1a6fde] hover:bg-[#1559b8] text-white font-bold text-xs sm:text-[13px] px-3.5 py-2 sm:py-2.5 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 w-full"
                        >
                          <span>View Live Rates &amp; Availability &rarr;</span>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {visibleCount < filteredHotels.length && (
          <div ref={observerTarget} className="w-full h-20 flex items-center justify-center mt-8">
            <div className="w-6 h-6 border-2 border-[#1a6fde] border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        </>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl p-10 sm:p-14 text-center max-w-lg mx-auto shadow-sm my-8">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-blue-50 text-[#1a6fde] flex items-center justify-center text-2xl shadow-xs">
            🛁
          </div>
          <h3 className="font-heading text-lg sm:text-xl font-bold text-gray-900 mb-2">
            No hotels match your filters
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 mb-6 leading-relaxed">
            We couldn&apos;t find any stays in {cityName} matching all selected filters. Try broadening your criteria or resetting to explore all {uniqueHotels.length} verified stays.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-5 py-2.5 bg-[#1a6fde] hover:bg-[#1559b8] text-white font-bold rounded-xl text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
          >
            Reset All Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}
          </button>
        </div>
      )}
    </div>
  );
}
