'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import OutboundLink from '@/components/OutboundLink';
import ProgressiveImage from '@/components/ProgressiveImage';
import { sendMatchmakerStart, sendMatchmakerComplete } from '@/lib/events';
import { isHotelConfirmed, getLinkedPartners } from '@/lib/evidence';

export interface MatchmakerHotel {
  name: string;
  city: string;
  country: string;
  countrySlug: string;
  citySlug: string;
  pageUrl: string;
  image: string;
  price?: string;
  numPrice?: number;
  rating?: number;
  reviewsCount?: number;
  roomType?: string;
  tubType?: string;
  amenities?: string[];
  bookingTip?: string;
  bathtubConfirmed?: boolean;
  importBatch?: string;
  bookingTubLabels?: string[];
  bookingUrl?: string;
  agodaUrl?: string;
  airbnbUrl?: string;
  tripUrl?: string;
  mmtUrl?: string;
  url?: string;
}

export type VibeId = 'honeymoon' | 'city_break' | 'mountains' | 'beach_islands' | 'spa_soaking';
export type TubId = 'jetted' | 'soaking' | 'hot_tub' | 'freestanding' | 'clawfoot' | 'onsen';
export type RegionId = 'worldwide' | 'usa' | 'india' | 'europe' | 'asia';
export type TravelerId = 'couple' | 'family' | 'solo' | 'friends';

export const VIBE_OPTIONS = [
  {
    id: 'honeymoon' as const,
    label: 'Honeymoon & anniversary',
    tagline: 'Rooms with a tub for two',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/fragrant-nature-a-five-star-classified-hotel-agra-1.webp',
  },
  {
    id: 'city_break' as const,
    label: 'City break',
    tagline: 'Hotels in cities',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/h-tel-ritz-paris-paris-1.webp',
  },
  {
    id: 'mountains' as const,
    label: 'Mountains',
    tagline: 'Hotels in mountain regions',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/villa-camellia-balacola-ooty-ooty-5029-1.webp',
  },
  {
    id: 'beach_islands' as const,
    label: 'Beach & islands',
    tagline: 'Hotels near beaches and islands',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/elegant-2-bhk-apartments-in-peaceful-siolim-9-1.webp',
  },
  {
    id: 'spa_soaking' as const,
    label: 'Spa & soaking',
    tagline: 'Rooms with a soaking or hydrotherapy tub',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/capella-bangkok-bangkok-1.webp',
  },
];

export const TUB_OPTIONS = [
  {
    id: 'jetted' as const,
    label: 'Jetted tub (jacuzzi & whirlpool)',
    tagline: 'Whirlpool and hydro-massage tubs',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/matild-palace-budapest-1.webp',
  },
  {
    id: 'soaking' as const,
    label: 'Deep soaking tub',
    tagline: 'Deep soaking bathtubs',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/mandarin-oriental-bangkok-bangkok-1.webp',
  },
  {
    id: 'hot_tub' as const,
    label: 'Hot tub',
    tagline: 'Hot tub in or by the room',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/indoor-pool-hot-tub-theater-games-views-punta-cana-6730-1.webp',
  },
  {
    id: 'freestanding' as const,
    label: 'Freestanding bathtub',
    tagline: 'Stand-alone centerpiece bathtubs',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/shangri-la-the-shard-london-london-1.webp',
  },
  {
    id: 'clawfoot' as const,
    label: 'Vintage clawfoot tub',
    tagline: 'Classic cast-iron bathtubs',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/bathtub-taj-lake-palace-udaipur.webp',
  },
  {
    id: 'onsen' as const,
    label: 'Japanese Hinoki / Onsen',
    tagline: 'Cedarwood and onsen tubs',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/kyoto-the-ritz-carlton-kyoto-1.webp',
  },
];

export const REGION_OPTIONS = [
  {
    id: 'worldwide' as const,
    label: 'Anywhere worldwide',
    tagline: 'Bathtub stays across all countries',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/bathtub-geneva.webp',
  },
  {
    id: 'usa' as const,
    label: 'United States',
    tagline: 'Hotels across the United States',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/pool-hot-tub-huge-theater-mini-golf-sleeps-19-austin-2164-1.webp',
  },
  {
    id: 'india' as const,
    label: 'India',
    tagline: 'Hotels across India',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/the-raj-palace-jaipur-1.webp',
  },
  {
    id: 'europe' as const,
    label: 'Europe',
    tagline: 'Hotels across European countries',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/le-bristol-paris-paris-1.webp',
  },
  {
    id: 'asia' as const,
    label: 'Asia & Islands',
    tagline: 'Hotels across Asia and island destinations',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/the-peninsula-bangkok-bangkok-1.webp',
  },
];

export const TRAVELER_OPTIONS = [
  {
    id: 'couple' as const,
    label: 'Couple',
    tagline: 'Stays for two guests',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/the-leela-palace-jaipur-1.webp',
  },
  {
    id: 'family' as const,
    label: 'Family',
    tagline: 'Stays for families',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/four-seasons-hotel-tokyo-at-otemachi-tokyo-1.webp',
  },
  {
    id: 'solo' as const,
    label: 'Solo',
    tagline: 'Stays for solo travelers',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/four-seasons-hotel-george-v-paris-paris-1.webp',
  },
  {
    id: 'friends' as const,
    label: 'Friends',
    tagline: 'Stays for groups and friends',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/the-peninsula-tokyo-tokyo-1.webp',
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

const CITY_BREAK_CITIES = new Set([
  'paris', 'new york', 'london', 'tokyo', 'singapore', 'dubai', 'rome',
  'barcelona', 'amsterdam', 'berlin', 'mumbai', 'chicago',
]);

const MOUNTAIN_CITIES = new Set([
  'aspen', 'banff', 'zermatt', 'lake tahoe', 'swiss alps', 'jackson hole',
  'manali', 'munnar', 'ooty', 'shimla', 'coorg', 'whistler', 'queenstown',
]);

const BEACH_CITIES = new Set([
  'maldives', 'bali', 'bora bora', 'phuket', 'goa', 'hawaii', 'cancun',
  'santorini', 'amalfi', 'fiji', 'seychelles', 'koh samui', 'miami',
]);

function matchesVibe(allText: string, city: string, vibe: VibeId): boolean {
  if (vibe === 'honeymoon') {
    return (
      allText.includes('honeymoon') ||
      allText.includes('balcony') ||
      allText.includes('caldera') ||
      allText.includes('sunset') ||
      allText.includes('suite') ||
      allText.includes('couple')
    );
  }
  if (vibe === 'city_break') {
    return (
      CITY_BREAK_CITIES.has(city) ||
      allText.includes('skyline') ||
      allText.includes('city view') ||
      allText.includes('downtown') ||
      allText.includes('urban')
    );
  }
  if (vibe === 'mountains') {
    return (
      MOUNTAIN_CITIES.has(city) ||
      allText.includes('mountain') ||
      allText.includes('alpine') ||
      allText.includes('fireplace') ||
      allText.includes('valley') ||
      allText.includes('forest')
    );
  }
  if (vibe === 'beach_islands') {
    return (
      BEACH_CITIES.has(city) ||
      allText.includes('beach') ||
      allText.includes('ocean') ||
      allText.includes('sea') ||
      allText.includes('island') ||
      allText.includes('lagoon') ||
      allText.includes('coast')
    );
  }
  if (vibe === 'spa_soaking') {
    return (
      allText.includes('spa') ||
      allText.includes('wellness') ||
      allText.includes('sauna') ||
      allText.includes('hydro') ||
      allText.includes('massage') ||
      allText.includes('soaking')
    );
  }
  return false;
}

function matchesTub(allText: string, tub: TubId): boolean {
  if (tub === 'jetted') {
    return (
      allText.includes('jacuzzi') ||
      allText.includes('whirlpool') ||
      allText.includes('hydro') ||
      allText.includes('jetted') ||
      allText.includes('spa bath')
    );
  }
  if (tub === 'soaking') {
    return (
      allText.includes('soaking') ||
      allText.includes('deep soak') ||
      allText.includes('stone') ||
      allText.includes('marble') ||
      allText.includes('sunken')
    );
  }
  if (tub === 'hot_tub') {
    return (
      allText.includes('hot tub') ||
      allText.includes('outdoor tub') ||
      allText.includes('balcony tub') ||
      allText.includes('open-air') ||
      allText.includes('patio')
    );
  }
  if (tub === 'freestanding') {
    return (
      allText.includes('freestanding') ||
      allText.includes('stand-alone') ||
      allText.includes('sculptural')
    );
  }
  if (tub === 'clawfoot') {
    return (
      allText.includes('clawfoot') ||
      allText.includes('claw-foot') ||
      allText.includes('rolltop') ||
      allText.includes('roll-top') ||
      allText.includes('vintage tub')
    );
  }
  if (tub === 'onsen') {
    return (
      allText.includes('onsen') ||
      allText.includes('hinoki') ||
      allText.includes('cedarwood')
    );
  }
  return false;
}

function matchesRegion(country: string, region: RegionId): boolean {
  if (region === 'worldwide') return true;
  if (region === 'usa') return country === 'usa' || country === 'united states';
  if (region === 'india') return country === 'india';
  if (region === 'europe') return EUROPE_COUNTRIES.has(country);
  if (region === 'asia') return ASIA_COUNTRIES.has(country);
  return false;
}

function matchesTraveler(allText: string, traveler: TravelerId): boolean {
  if (traveler === 'couple') {
    return (
      allText.includes('couple') ||
      allText.includes('romantic') ||
      allText.includes('king') ||
      allText.includes('honeymoon') ||
      allText.includes('suite')
    );
  }
  if (traveler === 'family') {
    return (
      allText.includes('family') ||
      allText.includes('suite') ||
      allText.includes('villa') ||
      allText.includes('apartment') ||
      allText.includes('two')
    );
  }
  if (traveler === 'solo') {
    return (
      allText.includes('single') ||
      allText.includes('queen') ||
      allText.includes('studio') ||
      allText.includes('cozy')
    );
  }
  if (traveler === 'friends') {
    return (
      allText.includes('twin') ||
      allText.includes('double') ||
      allText.includes('two') ||
      allText.includes('suite')
    );
  }
  return false;
}

interface ScoredHotel {
  hotel: MatchmakerHotel;
  matchScore: number;
}

export default function DreamSoakMatchmaker({
  initialVibe,
  initialTub,
  initialRegion,
  embedded = false,
}: {
  initialVibe?: VibeId;
  initialTub?: TubId;
  initialRegion?: RegionId;
  embedded?: boolean;
}) {
  const [selectedVibe, setSelectedVibe] = useState<VibeId | null>(initialVibe || null);
  const [selectedTub, setSelectedTub] = useState<TubId | null>(initialTub || null);
  const [selectedRegion, setSelectedRegion] = useState<RegionId | null>(initialRegion || null);
  const [selectedTraveler, setSelectedTraveler] = useState<TravelerId | null>(null);

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [animating, setAnimating] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const [allHotels, setAllHotels] = useState<MatchmakerHotel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const hasRequestedData = useRef(false);

  // Lazy-load matchmaker data
  const loadData = useCallback(() => {
    if (hasRequestedData.current) return;
    hasRequestedData.current = true;
    fetch('/matchmaker-data.json')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: MatchmakerHotel[]) => {
        const cleanData: MatchmakerHotel[] = (Array.isArray(data) ? data : []).map((h) => ({
          ...h,
          importBatch: h.importBatch || '',
          bookingTubLabels: Array.isArray(h.bookingTubLabels) ? h.bookingTubLabels : [],
          bathtubConfirmed: Boolean(h.importBatch && Array.isArray(h.bookingTubLabels) && h.bookingTubLabels.length > 0),
          amenities: Array.isArray(h.amenities) ? h.amenities : [],
        }));
        setAllHotels(cleanData);
        setLoading(false);
      })
      .catch((err) => {
        console.warn('[DreamSoakMatchmaker] Failed to fetch matchmaker-data.json:', err);
        setLoading(false);
      });
  }, []);

  // Load data immediately or on intersection
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const v = params.get('vibe') as VibeId;
      const t = params.get('tub') as TubId;
      const r = params.get('region') as RegionId;
      const tr = params.get('traveler') as TravelerId;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (v && VIBE_OPTIONS.some((o) => o.id === v)) setSelectedVibe(v);
      if (t && TUB_OPTIONS.some((o) => o.id === t)) setSelectedTub(t);
      if (r && REGION_OPTIONS.some((o) => o.id === r)) setSelectedRegion(r);
      if (tr && TRAVELER_OPTIONS.some((o) => o.id === tr)) setSelectedTraveler(tr);
      if (v && t && r && tr) setCurrentStep(5);
      if (params.has('vibe') || params.has('tub') || params.has('region') || params.has('traveler')) {
        loadData();
        return;
      }
    }

    const node = containerRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      loadData();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadData();
          observer.disconnect();
        }
      },
      { rootMargin: '400px 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [loadData]);

  // Compute option counts and apply the "fewer than 3 hotels" hiding rule
  // 1. Step 1 (Vibe) visible options
  const visibleVibes = useMemo(() => {
    return VIBE_OPTIONS.map((vibe) => {
      let count = 0;
      for (const h of allHotels) {
        const country = (h.country || '').toLowerCase().trim();
        const city = (h.city || '').toLowerCase().trim();
        const allText = `${h.name || ''} ${h.tubType || ''} ${h.roomType || ''} ${(h.amenities || []).join(' ')}`.toLowerCase();
        if (selectedRegion && !matchesRegion(country, selectedRegion)) continue;
        if (matchesVibe(allText, city, vibe.id)) count++;
      }
      return { ...vibe, count };
    }).filter((vibe) => vibe.count >= 3);
  }, [allHotels, selectedRegion]);

  // 2. Step 2 (Tub style) visible options: given selectedVibe and selectedRegion if set
  const visibleTubs = useMemo(() => {
    return TUB_OPTIONS.map((tub) => {
      let count = 0;
      for (const h of allHotels) {
        const country = (h.country || '').toLowerCase().trim();
        const city = (h.city || '').toLowerCase().trim();
        const allText = `${h.name || ''} ${h.tubType || ''} ${h.roomType || ''} ${(h.amenities || []).join(' ')}`.toLowerCase();
        if (selectedVibe && !matchesVibe(allText, city, selectedVibe)) continue;
        if (selectedRegion && !matchesRegion(country, selectedRegion)) continue;
        if (matchesTub(allText, tub.id)) count++;
      }
      return { ...tub, count };
    }).filter((tub) => tub.count >= 3);
  }, [allHotels, selectedVibe, selectedRegion]);

  // 3. Step 3 (Region) visible options: given selectedVibe and selectedTub if set
  const visibleRegions = useMemo(() => {
    return REGION_OPTIONS.map((reg) => {
      let count = 0;
      for (const h of allHotels) {
        const country = (h.country || '').toLowerCase().trim();
        const city = (h.city || '').toLowerCase().trim();
        const allText = `${h.name || ''} ${h.tubType || ''} ${h.roomType || ''} ${(h.amenities || []).join(' ')}`.toLowerCase();
        if (selectedVibe && !matchesVibe(allText, city, selectedVibe)) continue;
        if (selectedTub && !matchesTub(allText, selectedTub)) continue;
        if (matchesRegion(country, reg.id)) count++;
      }
      return { ...reg, count };
    }).filter((reg) => reg.count >= 3);
  }, [allHotels, selectedVibe, selectedTub]);

  // 4. Step 4 (Who's coming) visible options: given selectedVibe, selectedTub, selectedRegion
  const visibleTravelers = useMemo(() => {
    return TRAVELER_OPTIONS.map((trav) => {
      let count = 0;
      for (const h of allHotels) {
        const country = (h.country || '').toLowerCase().trim();
        const city = (h.city || '').toLowerCase().trim();
        const allText = `${h.name || ''} ${h.tubType || ''} ${h.roomType || ''} ${(h.amenities || []).join(' ')}`.toLowerCase();
        if (selectedVibe && !matchesVibe(allText, city, selectedVibe)) continue;
        if (selectedTub && !matchesTub(allText, selectedTub)) continue;
        if (selectedRegion && !matchesRegion(country, selectedRegion)) continue;
        if (matchesTraveler(allText, trav.id)) count++;
      }
      return { ...trav, count };
    }).filter((trav) => trav.count >= 3);
  }, [allHotels, selectedVibe, selectedTub, selectedRegion]);

  // Compute matched hotels with Problem 4 sort order:
  // 1. Confirmed first (isHotelConfirmed)
  // 2. Has booking partners (rentals without booking partners go last)
  // 3. Partner count descending
  // 4. Match score descending
  const matchedHotels: ScoredHotel[] = useMemo(() => {
    if (!allHotels.length) return [];
    const vibe = selectedVibe || 'honeymoon';
    const tub = selectedTub || 'jetted';
    const region = selectedRegion || 'worldwide';
    const traveler = selectedTraveler || 'couple';

    const scored: ScoredHotel[] = [];

    for (const h of allHotels) {
      const country = (h.country || '').toLowerCase().trim();
      const city = (h.city || '').toLowerCase().trim();
      const allText = `${h.name || ''} ${h.tubType || ''} ${h.roomType || ''} ${(h.amenities || []).join(' ')}`.toLowerCase();

      // 1. Region filter
      if (!matchesRegion(country, region)) continue;

      // 2. Tub style filter
      if (!matchesTub(allText, tub)) continue;

      let score = 50;

      // 3. Vibe score
      if (matchesVibe(allText, city, vibe)) score += 20;

      // 4. Traveler ordering
      if (matchesTraveler(allText, traveler)) score += 15;

      scored.push({ hotel: h, matchScore: score });
    }

    // Sort: Confirmed first, then has partners (rentals without partners last), then partner count, then score
    scored.sort((a, b) => {
      const confA = isHotelConfirmed(a.hotel) ? 1 : 0;
      const confB = isHotelConfirmed(b.hotel) ? 1 : 0;
      if (confB !== confA) return confB - confA;

      const partnersA = getLinkedPartners(a.hotel);
      const partnersB = getLinkedPartners(b.hotel);

      const hasPartnersA = partnersA.length > 0 ? 1 : 0;
      const hasPartnersB = partnersB.length > 0 ? 1 : 0;
      if (hasPartnersB !== hasPartnersA) return hasPartnersB - hasPartnersA;

      if (partnersB.length !== partnersA.length) {
        return partnersB.length - partnersA.length;
      }

      return b.matchScore - a.matchScore;
    });

    // Deduplicate by name and city
    const seen = new Set<string>();
    return scored.filter((item) => {
      const key = `${item.hotel.name.toLowerCase()}-${item.hotel.city.toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [allHotels, selectedVibe, selectedTub, selectedRegion, selectedTraveler]);

  // Step transitions
  const transitionTo = (nextStep: number, callback?: () => void) => {
    setAnimating(true);
    setTimeout(() => {
      if (callback) callback();
      setCurrentStep(nextStep);
      setAnimating(false);
    }, 180);
  };

  const handleVibeSelect = (vibe: VibeId) => {
    loadData();
    sendMatchmakerStart();
    transitionTo(2, () => setSelectedVibe(vibe));
  };

  const handleTubSelect = (tub: TubId) => {
    loadData();
    transitionTo(3, () => setSelectedTub(tub));
  };

  const handleRegionSelect = (region: RegionId) => {
    loadData();
    transitionTo(4, () => setSelectedRegion(region));
  };

  const handleTravelerSelect = (traveler: TravelerId) => {
    loadData();
    const vOpt = VIBE_OPTIONS.find((v) => v.id === selectedVibe);
    const tOpt = TUB_OPTIONS.find((t) => t.id === selectedTub);
    const rOpt = REGION_OPTIONS.find((r) => r.id === selectedRegion);
    const trOpt = TRAVELER_OPTIONS.find((tr) => tr.id === traveler);

    const answers = [vOpt?.label, tOpt?.label, rOpt?.label, trOpt?.label]
      .filter(Boolean)
      .join(' / ');

    const country =
      selectedRegion === 'usa'
        ? 'United States'
        : selectedRegion === 'india'
        ? 'India'
        : undefined;

    sendMatchmakerComplete({ answers, country });

    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (selectedVibe) url.searchParams.set('vibe', selectedVibe);
      if (selectedTub) url.searchParams.set('tub', selectedTub);
      if (selectedRegion) url.searchParams.set('region', selectedRegion);
      url.searchParams.set('traveler', traveler);
      window.history.replaceState({}, '', url.toString());
    }

    transitionTo(5, () => setSelectedTraveler(traveler));
  };

  const handleBack = () => {
    if (currentStep > 1) {
      transitionTo(currentStep - 1);
    }
  };

  const handleRestart = useCallback(() => {
    transitionTo(1, () => {
      setSelectedVibe(null);
      setSelectedTub(null);
      setSelectedRegion(null);
      setSelectedTraveler(null);

      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.delete('vibe');
        url.searchParams.delete('tub');
        url.searchParams.delete('region');
        url.searchParams.delete('traveler');
        window.history.replaceState({}, '', url.toString());
      }
    });
  }, []);

  const handleShare = async () => {
    const shareUrl =
      typeof window !== 'undefined'
        ? window.location.href
        : 'https://hotelswithbathtubs.com/matchmaker';
    const shareTitle = 'Our Bathtub Hotel Matches';
    const shareText =
      'Found hotel rooms with private bathtubs matching our trip! Which one do you prefer?';

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  const activeVibe = VIBE_OPTIONS.find((v) => v.id === selectedVibe);
  const activeTub = TUB_OPTIONS.find((t) => t.id === selectedTub);
  const activeRegion = REGION_OPTIONS.find((r) => r.id === selectedRegion);
  const activeTraveler = TRAVELER_OPTIONS.find((tr) => tr.id === selectedTraveler);

  const getPrimaryBooking = (hotel: MatchmakerHotel) => {
    if (hotel.bookingUrl) return { name: 'Booking.com', url: hotel.bookingUrl };
    if (hotel.agodaUrl) return { name: 'Agoda', url: hotel.agodaUrl };
    if (hotel.mmtUrl) return { name: 'MakeMyTrip', url: hotel.mmtUrl };
    if (hotel.url) return { name: 'Partner site', url: hotel.url };
    return null;
  };

  return (
    <div
      id="dream-soak-matchmaker"
      ref={containerRef}
      onMouseEnter={loadData}
      className={`w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 ${
        embedded ? 'border border-[#e3e7ef] rounded-[16px] bg-white p-6 shadow-xs' : ''
      }`}
    >
      {/* Quiz Progress & Navigation Header */}
      {currentStep <= 4 && (
        <div className="mb-6">
          <div className="flex items-center justify-between gap-4 mb-2.5">
            <div>
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="text-xs font-semibold text-[#5b6478] hover:text-[#14213d] transition-colors inline-flex items-center gap-1.5 py-1 px-2 -ml-2 rounded-[6px] hover:bg-gray-100"
                >
                  <span>&larr;</span>
                  <span>Back</span>
                </button>
              ) : (
                <span className="text-xs font-semibold uppercase tracking-wider text-[#b08d57]">
                  Interactive Quiz
                </span>
              )}
            </div>
            <div className="text-xs font-semibold uppercase tracking-wider text-[#5b6478]">
              Question {currentStep} of 4
            </div>
          </div>
          <div className="h-1.5 w-full bg-[#e3e7ef] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#b08d57] transition-all duration-300 ease-out rounded-full"
              style={{ width: `${currentStep * 25}%` }}
            />
          </div>
        </div>
      )}

      {/* Screen 1: Trip Style / Vibe */}
      {currentStep === 1 && (
        <div
          className={`transition-opacity duration-200 ${
            animating ? 'opacity-0 scale-[0.99]' : 'opacity-100 scale-100'
          }`}
        >
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="font-playfair text-2xl sm:text-3xl font-semibold text-[#14213d]">
              What kind of trip are you planning?
            </h1>
            <p className="text-xs sm:text-sm text-[#5b6478] mt-1.5 font-manrope max-w-md mx-auto">
              Tap the style that suits your upcoming getaway.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={`placeholder-${i}`}
                  aria-hidden="true"
                  className="relative overflow-hidden rounded-[14px] border border-[#e3e7ef] bg-[#eef1f6] animate-pulse aspect-[16/10] w-full"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-black/5 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4 space-y-2">
                    <div className="h-4 sm:h-5 bg-gray-300/80 rounded w-2/3" />
                    <div className="h-3 bg-gray-300/50 rounded w-4/5" />
                    <div className="h-4 bg-gray-300/60 rounded-[6px] w-20 mt-1" />
                  </div>
                </div>
              ))
            ) : (
              visibleVibes.map((vibe) => (
                <button
                  key={vibe.id}
                  type="button"
                  onClick={() => handleVibeSelect(vibe.id)}
                  className="group relative overflow-hidden rounded-[14px] border border-[#e3e7ef] bg-white text-left transition-all duration-200 hover:border-[#b08d57] hover:shadow-md active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#b08d57]"
                >
                  <div className="aspect-[16/10] w-full relative overflow-hidden bg-gray-100">
                    <ProgressiveImage
                      src={vibe.image}
                      alt={vibe.label}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-4">
                      <div className="font-playfair font-semibold text-base sm:text-lg text-white leading-snug">
                        {vibe.label}
                      </div>
                      <div className="text-white/80 font-manrope text-xs mt-1 line-clamp-2 leading-relaxed">
                        {vibe.tagline}
                      </div>
                      {vibe.count > 0 && (
                        <div className="text-[11px] font-semibold text-white/90 bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded-[6px] inline-flex items-center gap-1 mt-1.5 font-manrope">
                          <span>{vibe.count.toLocaleString()} hotels</span>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Screen 2: Tub Style */}
      {currentStep === 2 && (
        <div
          className={`transition-opacity duration-200 ${
            animating ? 'opacity-0 scale-[0.99]' : 'opacity-100 scale-100'
          }`}
        >
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="font-playfair text-2xl sm:text-3xl font-semibold text-[#14213d]">
              Which bathtub style do you prefer?
            </h2>
            <p className="text-xs sm:text-sm text-[#5b6478] mt-1.5 font-manrope max-w-md mx-auto">
              Every room featured on our site includes a private in-room or terrace tub.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
            {visibleTubs.map((tub) => (
              <button
                key={tub.id}
                type="button"
                onClick={() => handleTubSelect(tub.id)}
                className="group relative overflow-hidden rounded-[14px] border border-[#e3e7ef] bg-white text-left transition-all duration-200 hover:border-[#b08d57] hover:shadow-md active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#b08d57]"
              >
                <div className="aspect-[16/10] w-full relative overflow-hidden bg-gray-100">
                  <ProgressiveImage
                    src={tub.image}
                    alt={tub.label}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <div className="font-playfair font-semibold text-base sm:text-lg text-white leading-snug">
                      {tub.label}
                    </div>
                    <div className="text-white/80 font-manrope text-xs mt-1 line-clamp-2 leading-relaxed">
                      {tub.tagline}
                    </div>
                    {tub.count > 0 && (
                      <div className="text-[11px] font-semibold text-white/90 bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded-[6px] inline-flex items-center gap-1 mt-1.5 font-manrope">
                        <span>{tub.count.toLocaleString()} hotels</span>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Screen 3: Destination / Region */}
      {currentStep === 3 && (
        <div
          className={`transition-opacity duration-200 ${
            animating ? 'opacity-0 scale-[0.99]' : 'opacity-100 scale-100'
          }`}
        >
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="font-playfair text-2xl sm:text-3xl font-semibold text-[#14213d]">
              Where are you traveling?
            </h2>
            <p className="text-xs sm:text-sm text-[#5b6478] mt-1.5 font-manrope max-w-md mx-auto">
              Choose a specific region or discover stays anywhere worldwide.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
            {visibleRegions.map((reg) => (
              <button
                key={reg.id}
                type="button"
                onClick={() => handleRegionSelect(reg.id)}
                className="group relative overflow-hidden rounded-[14px] border border-[#e3e7ef] bg-white text-left transition-all duration-200 hover:border-[#b08d57] hover:shadow-md active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#b08d57]"
              >
                <div className="aspect-[16/10] w-full relative overflow-hidden bg-gray-100">
                  <ProgressiveImage
                    src={reg.image}
                    alt={reg.label}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <div className="font-playfair font-semibold text-base sm:text-lg text-white leading-snug">
                      {reg.label}
                    </div>
                    <div className="text-white/80 font-manrope text-xs mt-1 line-clamp-2 leading-relaxed">
                      {reg.tagline}
                    </div>
                    {reg.count > 0 && (
                      <div className="text-[11px] font-semibold text-white/90 bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded-[6px] inline-flex items-center gap-1 mt-1.5 font-manrope">
                        <span>{reg.count.toLocaleString()} hotels</span>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Screen 4: Who's coming */}
      {currentStep === 4 && (
        <div
          className={`transition-opacity duration-200 ${
            animating ? 'opacity-0 scale-[0.99]' : 'opacity-100 scale-100'
          }`}
        >
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="font-playfair text-2xl sm:text-3xl font-semibold text-[#14213d]">
              Who is coming on the trip?
            </h2>
            <p className="text-xs sm:text-sm text-[#5b6478] mt-1.5 font-manrope max-w-md mx-auto">
              We tailor room categories and layout recommendations to your party.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 max-w-2xl mx-auto">
            {visibleTravelers.map((trav) => (
              <button
                key={trav.id}
                type="button"
                onClick={() => handleTravelerSelect(trav.id)}
                className="group relative overflow-hidden rounded-[14px] border border-[#e3e7ef] bg-white text-left transition-all duration-200 hover:border-[#b08d57] hover:shadow-md active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#b08d57]"
              >
                <div className="aspect-[16/10] w-full relative overflow-hidden bg-gray-100">
                  <ProgressiveImage
                    src={trav.image}
                    alt={trav.label}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <div className="font-playfair font-semibold text-base sm:text-lg text-white leading-snug">
                      {trav.label}
                    </div>
                    <div className="text-white/80 font-manrope text-xs mt-1 line-clamp-2 leading-relaxed">
                      {trav.tagline}
                    </div>
                    {trav.count > 0 && (
                      <div className="text-[11px] font-semibold text-white/90 bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded-[6px] inline-flex items-center gap-1 mt-1.5 font-manrope">
                        <span>{trav.count.toLocaleString()} hotels</span>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Screen 5: Results Screen */}
      {currentStep === 5 && (
        <div className="animate-fade-in">
          {/* Summary Chips & Action Bar */}
          <div className="bg-white border border-[#e3e7ef] rounded-[16px] p-5 sm:p-6 mb-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-[#b08d57] mb-1">
                  Your Matched Stays
                </div>
                <h2 className="font-playfair text-xl sm:text-2xl font-semibold text-[#14213d]">
                  {loading
                    ? 'Loading your matches...'
                    : `Showing ${Math.min(6, matchedHotels.length)} hotel rooms tailored to your trip`}
                </h2>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={handleRestart}
                  className="px-3.5 py-1.5 text-xs font-semibold text-[#5b6478] bg-[#f5f6f8] hover:bg-gray-200 rounded-[8px] transition-colors"
                >
                  ↺ Start over
                </button>
                <button
                  type="button"
                  onClick={handleShare}
                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#14213d] hover:bg-[#1f2e4d] rounded-[8px] transition-colors inline-flex items-center gap-1.5"
                >
                  <span>{copiedLink ? '✓ Copied' : 'Share matches'}</span>
                  <span>&rarr;</span>
                </button>
              </div>
            </div>

            {/* Answer Pills */}
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-[#eef1f6]">
              {activeVibe && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#f0f4f8] text-[#14213d] text-xs font-medium">
                  <span>✨</span> {activeVibe.label}
                </span>
              )}
              {activeTub && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#f0f4f8] text-[#14213d] text-xs font-medium">
                  <span>🛁</span> {activeTub.label}
                </span>
              )}
              {activeRegion && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#f0f4f8] text-[#14213d] text-xs font-medium">
                  <span>📍</span> {activeRegion.label}
                </span>
              )}
              {activeTraveler && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#f0f4f8] text-[#14213d] text-xs font-medium">
                  <span>👥</span> {activeTraveler.label}
                </span>
              )}
            </div>
          </div>

          {/* Results Grid */}
          {loading ? (
            <div className="min-h-[300px] flex flex-col items-center justify-center p-8 text-center bg-white rounded-2xl border border-[#e3e7ef]">
              <div className="w-8 h-8 rounded-full border-2 border-[#b08d57] border-t-transparent animate-spin mb-3" />
              <p className="text-xs font-medium text-[#5b6478]">Finding matching rooms with tubs...</p>
            </div>
          ) : matchedHotels.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-[#e3e7ef]">
              <p className="text-sm font-semibold text-[#14213d] mb-2">No exact match found</p>
              <p className="text-xs text-[#5b6478] mb-4">
                Try picking a broader region or alternative tub style.
              </p>
              <button
                type="button"
                onClick={handleRestart}
                className="px-4 py-2 bg-[#b08d57] text-white text-xs font-bold rounded-[8px]"
              >
                Reset selections
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {matchedHotels.slice(0, 6).map(({ hotel }) => {
                const proven = isHotelConfirmed(hotel);
                const primaryBooking = getPrimaryBooking(hotel);
                return (
                  <div
                    key={hotel.pageUrl || hotel.name}
                    className="bg-white border border-[#e3e7ef] rounded-[14px] overflow-hidden shadow-xs flex flex-col justify-between transition-all duration-200 hover:shadow-md hover:border-[#b08d57]"
                  >
                    <div>
                      {/* Hotel Image with Proof Badge */}
                      <div className="aspect-[16/10] relative w-full overflow-hidden bg-gray-100">
                        {hotel.image ? (
                          <ProgressiveImage
                            src={hotel.image}
                            alt={hotel.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                            🛁
                          </div>
                        )}
                        <div className="absolute top-2.5 left-2.5">
                          {proven ? (
                            <span className="bg-[#e3f2ee] text-[#1f6f5c] text-[11px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 shadow-xs font-manrope">
                              <span>✓</span> Tub proven · Booking.com
                            </span>
                          ) : (
                            <span className="bg-[#f5f6f8] text-[#5b6478] text-[11px] font-medium px-2 py-0.5 rounded-full inline-flex items-center gap-1 shadow-xs font-manrope">
                              <span>🏷️</span> Reported, not yet confirmed
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Hotel Information */}
                      <div className="p-4">
                        <Link
                          href={hotel.pageUrl}
                          prefetch={false}
                          className="font-playfair text-base sm:text-lg font-semibold text-[#14213d] hover:text-[#b08d57] transition-colors line-clamp-1 block"
                        >
                          {hotel.name}
                        </Link>
                        <div className="text-xs text-[#5b6478] font-manrope mt-0.5">
                          {hotel.city}, {hotel.country}
                        </div>

                        {/* Room Details Box */}
                        <div className="mt-3 p-2.5 rounded-[10px] bg-[#f9fafc] border border-[#eef1f6] text-xs font-manrope text-[#3d4554]">
                          <span className="font-semibold text-[#14213d]">
                            {proven ? 'Room: ' : 'Reported room: '}
                          </span>
                          <span className="text-[#5b6478]">
                            {hotel.roomType || 'Room with private bathtub'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Links */}
                    <div className="p-4 pt-0 flex items-center justify-between gap-2 border-t border-[#f0f2f5] mt-2">
                      {primaryBooking ? (
                        <OutboundLink
                          href={primaryBooking.url}
                          hotelName={hotel.name}
                          cityName={hotel.city}
                          source="matchmaker_cta"
                          className="flex-1 bg-[#14213d] hover:bg-[#1f2e4d] text-white text-xs font-bold py-2 px-3 rounded-[8px] text-center transition-colors font-manrope"
                        >
                          Check {primaryBooking.name}
                        </OutboundLink>
                      ) : (
                        <Link
                          href={hotel.pageUrl}
                          prefetch={false}
                          className="flex-1 bg-[#14213d] hover:bg-[#1f2e4d] text-white text-xs font-bold py-2 px-3 rounded-[8px] text-center transition-colors font-manrope"
                        >
                          View Hotel
                        </Link>
                      )}
                      <Link
                        href={hotel.pageUrl}
                        prefetch={false}
                        className="text-xs font-semibold text-[#b08d57] hover:underline px-2 py-2 whitespace-nowrap font-manrope"
                      >
                        Compare all &rsaquo;
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
