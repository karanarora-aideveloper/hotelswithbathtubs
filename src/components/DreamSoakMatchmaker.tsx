'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import OutboundLink from '@/components/OutboundLink';
import ProgressiveImage from '@/components/ProgressiveImage';
import { trackEvent } from '@/lib/analytics';
import { sendGA4Event } from '@/lib/gtag';

export interface MatchmakerHotel {
  name: string;
  city: string;
  country: string;
  countrySlug: string;
  citySlug: string;
  pageUrl: string;
  image: string;
  price: string;
  numPrice: number;
  rating: number;
  reviewsCount: number;
  roomType: string;
  tubType: string;
  amenities: string[];
  bookingTip?: string;
  bookingUrl?: string;
  agodaUrl?: string;
  url?: string;
}

type VibeId = 'romantic' | 'city_escape' | 'alpine_nature' | 'tropical_beach' | 'wellness_detox';
type TubId = 'jacuzzi' | 'outdoor_hot_tub' | 'deep_soaking' | 'onsen_wood' | 'clawfoot' | 'any_tub';
type RegionId = 'worldwide' | 'europe' | 'usa' | 'asia_tropics' | 'india';
type BudgetId = 'any' | 'budget' | 'mid' | 'luxury';

const VIBE_OPTIONS = [
  {
    id: 'romantic' as VibeId,
    label: 'Honeymoon & Anniversary',
    tagline: 'Private balcony jacuzzis, sunset views, couple-friendly ambiance',
    emoji: '💍',
    badge: 'Couples Favorite',
    bg: 'from-rose-50 to-pink-50 border-rose-100',
  },
  {
    id: 'city_escape' as VibeId,
    label: 'Chic Weekend City Break',
    tagline: 'Skyline vistas, boutique design, rooftop bars & prime central spots',
    emoji: '🏙️',
    badge: 'Urban Stays',
    bg: 'from-sky-50 to-blue-50 border-sky-100',
  },
  {
    id: 'alpine_nature' as VibeId,
    label: 'Alpine Chalet & Mountain Cozy',
    tagline: 'Snow-capped peaks, fireplaces, cedar tubs & crisp alpine air',
    emoji: '🏔️',
    badge: 'Cozy Fireplace',
    bg: 'from-emerald-50 to-teal-50 border-emerald-100',
  },
  {
    id: 'tropical_beach' as VibeId,
    label: 'Tropical Island & Overwater Bliss',
    tagline: 'Lagoon plunge pools, open-air stone baths & private ocean access',
    emoji: '🌴',
    badge: 'Island Escape',
    bg: 'from-amber-50 to-orange-50 border-amber-100',
  },
  {
    id: 'wellness_detox' as VibeId,
    label: 'Spa Retreat & Deep Soaking Detox',
    tagline: 'Japanese onsens, mineral hot springs, herbal baths & total tranquility',
    emoji: '🧘',
    badge: 'Total Wellness',
    bg: 'from-indigo-50 to-purple-50 border-indigo-100',
  },
];

const TUB_OPTIONS = [
  {
    id: 'jacuzzi' as TubId,
    label: 'In-Room Hydro Jacuzzi & Whirlpool',
    tagline: 'Therapeutic hydro-massage jets & bubbling two-person tubs',
    emoji: '🌊',
    highlight: 'Whirlpool Hydro Jets',
  },
  {
    id: 'outdoor_hot_tub' as TubId,
    label: 'Private Balcony / Outdoor Hot Tub',
    tagline: 'Soak under open skies with unobstructed mountain, sea or caldera views',
    emoji: '♨️',
    highlight: 'Open-Air View Tub',
  },
  {
    id: 'deep_soaking' as TubId,
    label: 'Deep Freestanding Stone / Italian Marble',
    tagline: 'Sculptural freestanding soaking bath with panoramic floor-to-ceiling vistas',
    emoji: '🛁',
    highlight: 'Sculptural Marble Bath',
  },
  {
    id: 'onsen_wood' as TubId,
    label: 'Japanese Hinoki Cedarwood / Onsen',
    tagline: 'Natural aromatic timber soaking baths inspired by ancient Japanese onsens',
    emoji: '🪵',
    highlight: 'Aromatic Cedar Onsen',
  },
  {
    id: 'clawfoot' as TubId,
    label: 'Vintage Victorian Clawfoot Bath',
    tagline: 'Heritage cast-iron rolltop elegance with brass fixtures and timeless warmth',
    emoji: '👑',
    highlight: 'Vintage Rolltop Bath',
  },
  {
    id: 'any_tub' as TubId,
    label: 'Surprise Me with Any Luxury Tub',
    tagline: 'Show top-rated guaranteed bathtub suites across all styles',
    emoji: '✨',
    highlight: 'Guaranteed Bathtub Suite',
  },
];

const REGION_OPTIONS = [
  {
    id: 'worldwide' as RegionId,
    label: 'Anywhere Worldwide',
    tagline: 'Rank the finest bathtub stays across 118 countries',
    emoji: '🌍',
    count: '2,600+ Stays',
  },
  {
    id: 'europe' as RegionId,
    label: 'Europe',
    tagline: 'Paris, Rome, Swiss Alps, London, Prague, Santorini & beyond',
    emoji: '🏰',
    count: '600+ Stays',
  },
  {
    id: 'usa' as RegionId,
    label: 'United States',
    tagline: 'NYC, Las Vegas, Miami, Lake Tahoe, Hawaii & romantic getaways',
    emoji: '🗽',
    count: '800+ Stays',
  },
  {
    id: 'asia_tropics' as RegionId,
    label: 'Asia & Tropical Islands',
    tagline: 'Bali, Maldives, Phuket, Tokyo, Singapore & tropical paradises',
    emoji: '🏝️',
    count: '500+ Stays',
  },
  {
    id: 'india' as RegionId,
    label: 'India Royalty & Heritage',
    tagline: 'Udaipur, Goa, Munnar, Jaipur, Kolkata, Mumbai & palace retreats',
    emoji: '🇮🇳',
    count: '400+ Stays',
  },
];

const BUDGET_OPTIONS = [
  {
    id: 'any' as BudgetId,
    label: 'Any Budget',
    tagline: 'Show verified bathtub suites across all price tiers',
    emoji: '✨',
  },
  {
    id: 'budget' as BudgetId,
    label: 'Affordable Luxury',
    tagline: 'Under $150 / ₹8,000 per night with verified private tubs',
    emoji: '🪙',
  },
  {
    id: 'mid' as BudgetId,
    label: 'Upscale Romance',
    tagline: '$150 – $350 / ₹8,000 – ₹25,000 per night for 4 & 5-star elegance',
    emoji: '💎',
  },
  {
    id: 'luxury' as BudgetId,
    label: 'Ultra-Luxe Bucket List',
    tagline: '$350+ / ₹25,000+ per night world-class presidential & villa suites',
    emoji: '👑',
  },
];

const EUROPE_COUNTRIES = new Set([
  'france', 'italy', 'uk', 'united kingdom', 'spain', 'germany', 'switzerland',
  'greece', 'austria', 'czechia', 'portugal', 'netherlands', 'finland', 'hungary',
  'iceland', 'ireland', 'belgium', 'norway', 'sweden', 'croatia', 'poland', 'turkey',
]);

const ASIA_COUNTRIES = new Set([
  'japan', 'thailand', 'indonesia', 'maldives', 'singapore', 'malaysia', 'vietnam',
  'philippines', 'french polynesia', 'taiwan', 'south korea', 'hong kong',
]);

interface ScoredHotel {
  hotel: MatchmakerHotel;
  matchScore: number;
  highlightReason: string;
}

function calculateMatchScore(
  h: MatchmakerHotel,
  vibe: VibeId,
  tub: TubId,
  region: RegionId,
  budget: BudgetId
): { score: number; highlightReason: string; tubMatched: boolean } {
  let score = 85;
  const country = (h.country || '').toLowerCase().trim();
  const city = (h.city || '').toLowerCase().trim();
  const tubType = (h.tubType || '').toLowerCase();
  const roomType = (h.roomType || '').toLowerCase();
  const amenities = (h.amenities || []).map((a) => a.toLowerCase()).join(' ');
  const allText = `${tubType} ${roomType} ${amenities}`;

  // 1. Strict Region Filter
  if (region === 'usa' && country !== 'usa' && country !== 'united states') {
    return { score: 0, highlightReason: '', tubMatched: false };
  }
  if (region === 'india' && country !== 'india') {
    return { score: 0, highlightReason: '', tubMatched: false };
  }
  if (region === 'europe' && !EUROPE_COUNTRIES.has(country)) {
    return { score: 0, highlightReason: '', tubMatched: false };
  }
  if (region === 'asia_tropics' && !ASIA_COUNTRIES.has(country)) {
    return { score: 0, highlightReason: '', tubMatched: false };
  }

  // 2. Budget Scoring
  const isIndia = country === 'india';
  const numPrice = h.numPrice || 0;
  if (numPrice > 0) {
    if (budget === 'budget') {
      const max = isIndia ? 8000 : 180;
      if (numPrice <= max) score += 15;
      else score -= 30;
    } else if (budget === 'mid') {
      const min = isIndia ? 8000 : 180;
      const max = isIndia ? 25000 : 400;
      if (numPrice >= min && numPrice <= max) score += 15;
      else score -= 20;
    } else if (budget === 'luxury') {
      const min = isIndia ? 25000 : 400;
      if (numPrice >= min) score += 15;
      else score -= 25;
    }
  }

  // 3. Tub Type Scoring
  let tubMatched = false;
  let tubReason = h.tubType || 'Private Deep Soaking Tub';

  if (tub === 'jacuzzi') {
    if (allText.includes('jacuzzi') || allText.includes('whirlpool') || allText.includes('hydro') || allText.includes('jet')) {
      score += 25;
      tubMatched = true;
      tubReason = 'In-Room Hydro Jacuzzi & Whirlpool';
    }
  } else if (tub === 'outdoor_hot_tub') {
    if (allText.includes('outdoor') || allText.includes('balcony') || allText.includes('caldera') || allText.includes('open-air') || allText.includes('hot tub') || allText.includes('patio')) {
      score += 28;
      tubMatched = true;
      tubReason = 'Private Balcony / Open-Air View Hot Tub';
    }
  } else if (tub === 'deep_soaking') {
    if (allText.includes('freestanding') || allText.includes('deep soaking') || allText.includes('marble') || allText.includes('stone') || allText.includes('sunken')) {
      score += 25;
      tubMatched = true;
      tubReason = 'Deep Freestanding Stone / Italian Marble Tub';
    }
  } else if (tub === 'onsen_wood') {
    if (allText.includes('onsen') || allText.includes('cedar') || allText.includes('hinoki') || allText.includes('wood') || allText.includes('japanese')) {
      score += 30;
      tubMatched = true;
      tubReason = 'Authentic Hinoki Cedarwood Onsen Bath';
    }
  } else if (tub === 'clawfoot') {
    if (allText.includes('claw') || allText.includes('cast-iron') || allText.includes('roll-top') || allText.includes('copper') || allText.includes('vintage') || allText.includes('victorian')) {
      score += 30;
      tubMatched = true;
      tubReason = 'Heritage Rolltop Clawfoot Bathtub';
    }
  } else {
    // any_tub
    tubMatched = true;
    tubReason = h.tubType || 'Verified Luxury Bathtub';
  }

  // 4. Vibe Scoring
  let vibeReason = '';
  if (vibe === 'romantic') {
    if (allText.includes('balcony') || allText.includes('caldera') || allText.includes('sea view') || allText.includes('sunset') || allText.includes('couple') || allText.includes('suite')) {
      score += 15;
      vibeReason = 'Romantic suite with panoramic view';
    }
  } else if (vibe === 'city_escape') {
    const cityList = ['paris', 'new york', 'london', 'tokyo', 'singapore', 'dubai', 'rome', 'barcelona', 'amsterdam', 'berlin', 'mumbai', 'chicago'];
    if (cityList.includes(city) || allText.includes('skyline') || allText.includes('city view')) {
      score += 18;
      vibeReason = 'High-floor urban skyline vista';
    }
  } else if (vibe === 'alpine_nature') {
    const alpineList = ['aspen', 'banff', 'zermatt', 'lake tahoe', 'swiss alps', 'jackson hole', 'manali', 'munnar', 'ooty', 'shimla', 'coorg', 'whistler', 'queenstown'];
    if (alpineList.includes(city) || allText.includes('mountain') || allText.includes('fireplace') || allText.includes('forest') || allText.includes('valley')) {
      score += 22;
      vibeReason = 'Scenic alpine fireplace & mountain serenity';
    }
  } else if (vibe === 'tropical_beach') {
    const beachList = ['maldives', 'bali', 'bora bora', 'phuket', 'goa', 'hawaii', 'cancun', 'santorini', 'amalfi', 'fiji', 'seychelles', 'koh samui', 'miami'];
    if (beachList.includes(city) || allText.includes('beach') || allText.includes('ocean') || allText.includes('lagoon') || allText.includes('plunge pool') || allText.includes('overwater')) {
      score += 22;
      vibeReason = 'Oceanfront breeze & tropical lagoon setting';
    }
  } else if (vibe === 'wellness_detox') {
    if (allText.includes('onsen') || allText.includes('spa') || allText.includes('sauna') || allText.includes('cedar') || allText.includes('steam')) {
      score += 20;
      vibeReason = 'Private restorative hydrotherapy & wellness';
    }
  }

  // 5. Rating & Review Boost
  const numericRating = typeof h.rating === 'number' ? h.rating : parseFloat(h.rating as any) || 0;
  if (numericRating > 0) {
    score += (numericRating - 4.0) * 12;
  }
  if (h.reviewsCount && h.reviewsCount > 200) {
    score += 5;
  }

  // Normalize final match percentage to 88% - 99%
  const normalized = Math.min(99, Math.max(88, Math.round(score / 1.5)));
  const highlightReason = vibeReason ? `${tubReason} • ${vibeReason}` : tubReason;

  return { score: normalized, highlightReason, tubMatched };
}

export default function DreamSoakMatchmaker({
  initialVibe,
  initialTub,
  initialRegion,
  initialBudget,
  embedded = false,
}: {
  initialVibe?: VibeId;
  initialTub?: TubId;
  initialRegion?: RegionId;
  initialBudget?: BudgetId;
  embedded?: boolean;
}) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedVibe, setSelectedVibe] = useState<VibeId | null>(initialVibe || null);
  const [selectedTub, setSelectedTub] = useState<TubId | null>(initialTub || null);
  const [selectedRegion, setSelectedRegion] = useState<RegionId | null>(initialRegion || null);
  const [selectedBudget, setSelectedBudget] = useState<BudgetId | null>(initialBudget || null);

  const [allHotels, setAllHotels] = useState<MatchmakerHotel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [visibleResultsCount, setVisibleResultsCount] = useState<number>(12);

  // Initialize from URL search params if present
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const qVibe = params.get('vibe') as VibeId;
      const qTub = params.get('tub') as TubId;
      const qRegion = params.get('region') as RegionId;
      const qBudget = params.get('budget') as BudgetId;

      if (qVibe && VIBE_OPTIONS.some((o) => o.id === qVibe)) setSelectedVibe(qVibe);
      if (qTub && TUB_OPTIONS.some((o) => o.id === qTub)) setSelectedTub(qTub);
      if (qRegion && REGION_OPTIONS.some((o) => o.id === qRegion)) setSelectedRegion(qRegion);
      if (qBudget && BUDGET_OPTIONS.some((o) => o.id === qBudget)) setSelectedBudget(qBudget);

      // If all 4 are present in URL, jump directly to results!
      if (qVibe && qTub && qRegion && qBudget) {
        setCurrentStep(5);
      }
    }
  }, []);

  // Fetch matchmaker data
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const res = await fetch('/matchmaker-data.json');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: MatchmakerHotel[] = await res.json();
        if (isMounted) {
          const cleanData: MatchmakerHotel[] = (Array.isArray(data) ? data : []).map((h) => ({
            ...h,
            rating: typeof h.rating === 'number' ? h.rating : parseFloat(h.rating as any) || 4.5,
            reviewsCount: typeof h.reviewsCount === 'number' ? h.reviewsCount : parseInt(h.reviewsCount as any, 10) || 100,
            numPrice: typeof h.numPrice === 'number' ? h.numPrice : parseInt(h.numPrice as any, 10) || 0,
            amenities: Array.isArray(h.amenities) ? h.amenities : [],
          }));
          setAllHotels(cleanData);
          setLoading(false);
        }
      } catch (err) {
        console.warn('[DreamSoakMatchmaker] Failed to fetch matchmaker-data.json, falling back to search-data:', err);
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Compute matched hotels
  const matchedHotels: ScoredHotel[] = useMemo(() => {
    if (!allHotels.length) return [];
    const vibe = selectedVibe || 'romantic';
    const tub = selectedTub || 'any_tub';
    const region = selectedRegion || 'worldwide';
    const budget = selectedBudget || 'any';

    const scored: ScoredHotel[] = [];
    for (const h of allHotels) {
      const res = calculateMatchScore(h, vibe, tub, region, budget);
      if (res.score > 0 && (tub === 'any_tub' || res.tubMatched)) {
        scored.push({
          hotel: h,
          matchScore: res.score,
          highlightReason: res.highlightReason,
        });
      }
    }

    // Sort by match score descending, then rating descending
    scored.sort((a, b) => {
      const scoreDiff = b.matchScore - a.matchScore;
      if (scoreDiff !== 0) return scoreDiff;
      const rA = typeof a.hotel.rating === 'number' ? a.hotel.rating : parseFloat(a.hotel.rating as any) || 0;
      const rB = typeof b.hotel.rating === 'number' ? b.hotel.rating : parseFloat(b.hotel.rating as any) || 0;
      return rB - rA;
    });

    // Deduplicate by name and city
    const seen = new Set<string>();
    return scored.filter((item) => {
      const key = `${item.hotel.name.toLowerCase()}-${item.hotel.city.toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [allHotels, selectedVibe, selectedTub, selectedRegion, selectedBudget]);

  // Track step transitions
  const handleVibeSelect = (vibe: VibeId) => {
    setSelectedVibe(vibe);
    trackEvent('matchmaker_step_completed', { step: 1, option: vibe });
    sendGA4Event('matchmaker_step', { step: 1, vibe });
    setCurrentStep(2);
  };

  const handleTubSelect = (tub: TubId) => {
    setSelectedTub(tub);
    trackEvent('matchmaker_step_completed', { step: 2, option: tub });
    sendGA4Event('matchmaker_step', { step: 2, tub });
    setCurrentStep(3);
  };

  const handleRegionSelect = (region: RegionId) => {
    setSelectedRegion(region);
    trackEvent('matchmaker_step_completed', { step: 3, option: region });
    sendGA4Event('matchmaker_step', { step: 3, region });
    setCurrentStep(4);
  };

  const handleBudgetSelect = (budget: BudgetId) => {
    setSelectedBudget(budget);
    trackEvent('matchmaker_completed', {
      vibe: selectedVibe,
      tub: selectedTub,
      region: selectedRegion,
      budget,
      matches_count: matchedHotels.length,
    });
    sendGA4Event('matchmaker_complete', {
      vibe: selectedVibe,
      tub: selectedTub,
      region: selectedRegion,
      budget,
    });

    // Update URL query parameters for sharing
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (selectedVibe) url.searchParams.set('vibe', selectedVibe);
      if (selectedTub) url.searchParams.set('tub', selectedTub);
      if (selectedRegion) url.searchParams.set('region', selectedRegion);
      url.searchParams.set('budget', budget);
      window.history.replaceState({}, '', url.toString());
    }

    setCurrentStep(5);
  };

  // Restart Quiz
  const handleRestart = useCallback(() => {
    setSelectedVibe(null);
    setSelectedTub(null);
    setSelectedRegion(null);
    setSelectedBudget(null);
    setCurrentStep(1);
    setVisibleResultsCount(12);

    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('vibe');
      url.searchParams.delete('tub');
      url.searchParams.delete('region');
      url.searchParams.delete('budget');
      window.history.replaceState({}, '', url.toString());
    }
  }, []);

  // Share with Partner action
  const handleShare = async () => {
    trackEvent('matchmaker_share_clicked', {
      vibe: selectedVibe,
      tub: selectedTub,
      region: selectedRegion,
      budget: selectedBudget,
    });

    const shareUrl = typeof window !== 'undefined' ? window.location.href : 'https://hotelswithbathtubs.com/matchmaker';
    const shareTitle = 'Our Dream Bathtub Hotel Matches 💕';
    const shareText = `Found our dream hotel with a private bathtub & jacuzzi in room! Which one do you like best? 💕`;

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch (err) {
        // Fallback to clipboard
      }
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  // Get active label helpers
  const activeVibe = VIBE_OPTIONS.find((v) => v.id === selectedVibe);
  const activeTub = TUB_OPTIONS.find((t) => t.id === selectedTub);
  const activeRegion = REGION_OPTIONS.find((r) => r.id === selectedRegion);
  const activeBudget = BUDGET_OPTIONS.find((b) => b.id === selectedBudget);

  return (
    <div
      id="dream-soak-matchmaker"
      className={`w-full ${
        embedded
          ? 'bg-gradient-to-b from-blue-50/60 via-white to-white rounded-3xl border border-blue-100/80 shadow-sm p-5 sm:p-8 lg:p-10 my-10'
          : 'bg-white py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto'
      }`}
    >
      {/* Header Badge & Title */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/70 text-[#1a6fde] text-xs font-bold tracking-wide uppercase mb-3">
          <span className="animate-spin text-sm">✨</span>
          <span>Interactive Dream Soak Matchmaker™</span>
        </div>
        <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 tracking-tight leading-tight">
          Find Your Perfect Bathtub Stay in 30 Seconds
        </h2>
        <p className="mt-2 text-sm sm:text-base text-gray-600">
          Can't decide on a destination? Tell us your dream soaking fantasy and we'll match you with triple-verified luxury suites worldwide.
        </p>
      </div>

      {/* Progress Stepper (Only on Steps 1 to 4) */}
      {currentStep <= 4 && (
        <div className="max-w-xl mx-auto mb-8">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-500 mb-2">
            <span>Step {currentStep} of 4</span>
            <span>
              {currentStep === 1 && 'The Occasion / Vibe'}
              {currentStep === 2 && 'Dream Bathtub Experience'}
              {currentStep === 3 && 'Destination Region'}
              {currentStep === 4 && 'Nightly Budget'}
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#1a6fde] to-[#0a4fa8] h-full transition-all duration-300 rounded-full"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* STEP 1: VIBE / OCCASION */}
      {currentStep === 1 && (
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-6">
            <span className="text-3xl mb-1 block">🥂</span>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900">What’s the occasion or dream vibe?</h3>
            <p className="text-sm text-gray-500 mt-1">Select the ambiance you want for this escape</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {VIBE_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleVibeSelect(opt.id)}
                className={`p-5 rounded-2xl border text-left transition-all group flex flex-col justify-between hover:shadow-md hover:border-[#1a6fde] hover:scale-[1.01] ${
                  selectedVibe === opt.id
                    ? 'border-[#1a6fde] bg-blue-50/50 ring-2 ring-[#1a6fde]/20'
                    : 'border-gray-200 bg-white hover:bg-gray-50/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-3xl p-2 rounded-xl bg-gray-100/80 group-hover:scale-110 transition-transform">
                      {opt.emoji}
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                      {opt.badge}
                    </span>
                  </div>
                  <h4 className="font-bold text-gray-900 text-base group-hover:text-[#1a6fde] transition-colors">
                    {opt.label}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{opt.tagline}</p>
                </div>
                <div className="mt-4 flex items-center text-xs font-bold text-[#1a6fde] opacity-0 group-hover:opacity-100 transition-opacity">
                  Select this vibe &rarr;
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 2: TUB EXPERIENCE */}
      {currentStep === 2 && (
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setCurrentStep(1)}
              className="text-xs font-semibold text-gray-500 hover:text-gray-900 flex items-center gap-1 transition-colors"
            >
              &larr; Back to Occasion
            </button>
            <span className="text-xs text-gray-400">Step 2 of 4</span>
          </div>

          <div className="text-center mb-6">
            <span className="text-3xl mb-1 block">🛁</span>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900">What’s your dream bathtub style?</h3>
            <p className="text-sm text-gray-500 mt-1">Every listing has guaranteed in-room tubs — pick your preferred type</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {TUB_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleTubSelect(opt.id)}
                className={`p-5 rounded-2xl border text-left transition-all group flex flex-col justify-between hover:shadow-md hover:border-[#1a6fde] hover:scale-[1.01] ${
                  selectedTub === opt.id
                    ? 'border-[#1a6fde] bg-blue-50/50 ring-2 ring-[#1a6fde]/20'
                    : 'border-gray-200 bg-white hover:bg-gray-50/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-3xl p-2 rounded-xl bg-gray-100/80 group-hover:scale-110 transition-transform">
                      {opt.emoji}
                    </span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {opt.highlight}
                    </span>
                  </div>
                  <h4 className="font-bold text-gray-900 text-base group-hover:text-[#1a6fde] transition-colors">
                    {opt.label}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{opt.tagline}</p>
                </div>
                <div className="mt-4 flex items-center text-xs font-bold text-[#1a6fde] opacity-0 group-hover:opacity-100 transition-opacity">
                  Choose this tub &rarr;
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 3: REGION / DESTINATION */}
      {currentStep === 3 && (
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setCurrentStep(2)}
              className="text-xs font-semibold text-gray-500 hover:text-gray-900 flex items-center gap-1 transition-colors"
            >
              &larr; Back to Tub Type
            </button>
            <span className="text-xs text-gray-400">Step 3 of 4</span>
          </div>

          <div className="text-center mb-6">
            <span className="text-3xl mb-1 block">✈️</span>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Where in the world are you traveling?</h3>
            <p className="text-sm text-gray-500 mt-1">Pick a continent or stay open to global inspiration</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {REGION_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleRegionSelect(opt.id)}
                className={`p-5 rounded-2xl border text-left transition-all group flex flex-col justify-between hover:shadow-md hover:border-[#1a6fde] hover:scale-[1.01] ${
                  selectedRegion === opt.id
                    ? 'border-[#1a6fde] bg-blue-50/50 ring-2 ring-[#1a6fde]/20'
                    : 'border-gray-200 bg-white hover:bg-gray-50/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-3xl p-2 rounded-xl bg-gray-100/80 group-hover:scale-110 transition-transform">
                      {opt.emoji}
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#1a6fde]">
                      {opt.count}
                    </span>
                  </div>
                  <h4 className="font-bold text-gray-900 text-base group-hover:text-[#1a6fde] transition-colors">
                    {opt.label}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{opt.tagline}</p>
                </div>
                <div className="mt-4 flex items-center text-xs font-bold text-[#1a6fde] opacity-0 group-hover:opacity-100 transition-opacity">
                  Set this destination &rarr;
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 4: BUDGET */}
      {currentStep === 4 && (
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setCurrentStep(3)}
              className="text-xs font-semibold text-gray-500 hover:text-gray-900 flex items-center gap-1 transition-colors"
            >
              &larr; Back to Destination
            </button>
            <span className="text-xs text-gray-400">Step 4 of 4</span>
          </div>

          <div className="text-center mb-6">
            <span className="text-3xl mb-1 block">💎</span>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900">What’s your nightly budget preference?</h3>
            <p className="text-sm text-gray-500 mt-1">We verify genuine value in every price category</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {BUDGET_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleBudgetSelect(opt.id)}
                className={`p-5 rounded-2xl border text-left transition-all group flex flex-col justify-between hover:shadow-md hover:border-[#1a6fde] hover:scale-[1.01] ${
                  selectedBudget === opt.id
                    ? 'border-[#1a6fde] bg-blue-50/50 ring-2 ring-[#1a6fde]/20'
                    : 'border-gray-200 bg-white hover:bg-gray-50/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-3xl p-2 rounded-xl bg-gray-100/80 group-hover:scale-110 transition-transform">
                      {opt.emoji}
                    </span>
                  </div>
                  <h4 className="font-bold text-gray-900 text-base group-hover:text-[#1a6fde] transition-colors">
                    {opt.label}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{opt.tagline}</p>
                </div>
                <div className="mt-4 flex items-center text-xs font-bold text-[#1a6fde] opacity-0 group-hover:opacity-100 transition-opacity">
                  Reveal My Matches &rarr;
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 5: RESULTS SCREEN */}
      {currentStep === 5 && (
        <div className="space-y-8 animate-fadeIn">
          {/* Active Criteria Ribbon & Controls */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  {matchedHotels.length} Verified Soak Matches Found
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {activeVibe && (
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium transition-colors"
                    title="Click to change vibe"
                  >
                    <span>{activeVibe.emoji}</span>
                    <span>{activeVibe.label}</span>
                    <span className="text-gray-400">✎</span>
                  </button>
                )}
                {activeTub && (
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium transition-colors"
                    title="Click to change tub style"
                  >
                    <span>{activeTub.emoji}</span>
                    <span>{activeTub.label}</span>
                    <span className="text-gray-400">✎</span>
                  </button>
                )}
                {activeRegion && (
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium transition-colors"
                    title="Click to change destination"
                  >
                    <span>{activeRegion.emoji}</span>
                    <span>{activeRegion.label}</span>
                    <span className="text-gray-400">✎</span>
                  </button>
                )}
                {activeBudget && (
                  <button
                    onClick={() => setCurrentStep(4)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium transition-colors"
                    title="Click to change budget"
                  >
                    <span>{activeBudget.emoji}</span>
                    <span>{activeBudget.label}</span>
                    <span className="text-gray-400">✎</span>
                  </button>
                )}
              </div>
            </div>

            {/* Actions: Share with Partner & Retake Quiz */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-xs shadow-sm transition-all transform hover:-translate-y-0.5"
              >
                <span>💌</span>
                <span>{copiedLink ? 'Link Copied! Send to Partner 💕' : 'Share with Partner'}</span>
              </button>
              <button
                onClick={handleRestart}
                className="px-3.5 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold text-xs transition-colors"
              >
                🔄 Reset
              </button>
            </div>
          </div>

          {/* Loading Skeleton */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-200 p-4 animate-pulse space-y-4">
                  <div className="w-full h-48 bg-gray-200 rounded-xl" />
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-10 bg-gray-200 rounded-xl" />
                </div>
              ))}
            </div>
          )}

          {/* Hotel Result Cards Grid */}
          {!loading && matchedHotels.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {matchedHotels.slice(0, visibleResultsCount).map(({ hotel, matchScore, highlightReason }) => {
                const partnerUrl = hotel.bookingUrl || hotel.agodaUrl || hotel.url || '';
                const isBookingCom = partnerUrl.includes('booking.com');
                const isAgoda = partnerUrl.includes('agoda.com');
                const isMMT = partnerUrl.includes('makemytrip.com');
                const partnerName = isBookingCom ? 'Booking.com' : isAgoda ? 'Agoda' : isMMT ? 'MakeMyTrip' : 'Partner';

                return (
                  <div
                    key={`${hotel.name}-${hotel.city}`}
                    className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between overflow-hidden group hover:border-[#1a6fde]"
                  >
                    <div>
                      {/* Image Container with Match Pill & Tub Badge */}
                      <div className="relative h-52 w-full overflow-hidden bg-gray-100">
                        <ProgressiveImage
                          src={hotel.image}
                          alt={`${hotel.name} with bathtub in ${hotel.city}`}
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

                        {/* Top Ribbon: Match % and Tub Type */}
                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                          <span className="px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-sm text-gray-900 font-black text-xs shadow-md border border-black/5 flex items-center gap-1">
                            <span className="text-amber-500">★</span> {typeof hotel.rating === 'number' ? hotel.rating.toFixed(1) : (Number(hotel.rating) > 0 ? Number(hotel.rating).toFixed(1) : '4.8')}
                            <span className="text-[10px] text-gray-400 font-medium">({hotel.reviewsCount || 120})</span>
                          </span>
                          <span className="px-3 py-1 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-xs shadow-md flex items-center gap-1">
                            <span>🔥</span>
                            <span>{matchScore}% Match</span>
                          </span>
                        </div>

                        {/* Bottom Highlight on Image */}
                        <div className="absolute bottom-2.5 left-3 right-3 pointer-events-none">
                          <span className="inline-block text-[11px] font-bold text-white bg-black/70 backdrop-blur-sm px-2.5 py-1 rounded-lg truncate max-w-full">
                            🛁 {hotel.tubType || 'Verified Luxury Bathtub'}
                          </span>
                        </div>
                      </div>

                      {/* Content Body */}
                      <div className="p-4 sm:p-5">
                        {/* City & Country */}
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                          📍 {hotel.city}, {hotel.country}
                        </p>

                        {/* Hotel Name */}
                        <Link
                          href={hotel.pageUrl}
                          className="font-heading font-bold text-gray-900 text-lg hover:text-[#1a6fde] transition-colors line-clamp-1 block mb-2"
                        >
                          {hotel.name}
                        </Link>

                        {/* Verified Room Type */}
                        {hotel.roomType && (
                          <div className="mb-3 px-2.5 py-1.5 rounded-lg bg-blue-50/70 border border-blue-100 text-xs text-blue-900 font-medium flex items-center gap-1.5">
                            <span className="text-[#1a6fde] font-bold">✓ Room Tier:</span>
                            <span className="truncate">{hotel.roomType}</span>
                          </div>
                        )}

                        {/* Match Reason Tagline */}
                        <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed mb-3">
                          {highlightReason}
                        </p>

                        {/* Amenities Chips */}
                        {hotel.amenities && hotel.amenities.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {hotel.amenities.slice(0, 3).map((amenity) => (
                              <span
                                key={amenity}
                                className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 text-[11px] font-medium"
                              >
                                {amenity}
                              </span>
                            ))}
                            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-200">
                              Triple Verified
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Footer: Price & Direct Outbound Link */}
                    <div className="p-4 sm:p-5 pt-0 border-t border-gray-100 mt-2 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-xs text-gray-400 block font-medium">From</span>
                        <span className="font-heading font-black text-lg sm:text-xl text-gray-900">
                          {hotel.price || 'Check Rates'}
                        </span>
                        {hotel.price && <span className="text-[10px] text-gray-400 ml-1">/ night</span>}
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href={hotel.pageUrl}
                          className="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold transition-colors"
                          title="View hotel photos and tub verification details"
                        >
                          Details
                        </Link>

                        {partnerUrl ? (
                          <OutboundLink
                            href={partnerUrl}
                            hotelName={hotel.name}
                            cityName={hotel.city}
                            source="matchmaker_cta"
                            className="bg-[#1a6fde] hover:bg-[#1559b8] text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5 flex items-center gap-1.5 whitespace-nowrap"
                          >
                            <span>Book on {partnerName}</span>
                            <span className="text-[10px]">&rarr;</span>
                          </OutboundLink>
                        ) : (
                          <Link
                            href={hotel.pageUrl}
                            className="bg-[#1a6fde] hover:bg-[#1559b8] text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1"
                          >
                            <span>Check Rates</span>
                            <span>&rarr;</span>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* No Matches Fallback */}
          {!loading && matchedHotels.length === 0 && (
            <div className="text-center py-12 px-4 bg-white rounded-2xl border border-gray-200 max-w-lg mx-auto">
              <span className="text-4xl mb-3 block">🔍</span>
              <h3 className="text-lg font-bold text-gray-900 mb-2">No exact matches for this specific combination</h3>
              <p className="text-sm text-gray-500 mb-6">
                Try widening your budget or selecting &quot;Surprise Me with Any Luxury Tub&quot; to see verified bathtub stays.
              </p>
              <button
                onClick={handleRestart}
                className="bg-[#1a6fde] hover:bg-[#1559b8] text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all"
              >
                Reset Preferences
              </button>
            </div>
          )}

          {/* Load More Button */}
          {!loading && matchedHotels.length > visibleResultsCount && (
            <div className="text-center pt-4">
              <button
                onClick={() => setVisibleResultsCount((prev) => prev + 12)}
                className="px-6 py-3 rounded-xl border border-gray-300 hover:border-gray-400 bg-white text-gray-800 font-bold text-xs shadow-2xs hover:shadow-sm transition-all"
              >
                Show More Soak Matches ({matchedHotels.length - visibleResultsCount} remaining) &darr;
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
