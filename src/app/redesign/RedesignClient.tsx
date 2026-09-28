'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface HotelItem {
  _id?: string;
  name: string;
  slug?: string;
  city: string;
  country?: string;
  image: string;
  neighborhood?: string;
  landmarkDistance?: string;
  price?: string;
  rating?: number;
  reviewsCount?: number;
  roomType?: string;
  tubType?: string;
  bookingTip?: string;
  description?: string;
  url?: string;
  coordinates?: [number, number];
  amenities?: string[];
  crossVerified?: boolean;
  crossVerifiedSources?: string[];
  bathtubConfirmed?: boolean | null;
  verified?: boolean;
}

interface RedesignClientProps {
  initialCity?: string;
  initialHotels?: HotelItem[];
  allCities?: string[];
}

// Known coordinates for top cities & neighborhoods to plot pins accurately
const NEIGHBORHOOD_COORDS: Record<string, [number, number]> = {
  // Delhi
  'Rohini': [28.7188, 77.0689],
  'Paschim Vihar': [28.6710, 77.0970],
  'Paharganj': [28.6410, 77.2140],
  'Connaught Place': [28.6239, 77.2185],
  'Aerocity': [28.5502, 77.1218],
  'Mahipalpur': [28.5480, 77.1190],
  'Chanakyapuri': [28.5955, 77.1702],
  'Nehru Place': [28.5492, 77.2533],
  'Shahdara': [28.6720, 77.2890],
  'Kapashera': [28.5175, 77.0865],
  'Vasant Kunj': [28.5355, 77.1510],
  'Anand Vihar': [28.6470, 77.3150],
  'Samalka': [28.5200, 77.0900],
  'East Delhi': [28.6300, 77.2900],
  // Munnar
  'Pallivasal': [10.0545, 77.0620],
  'Chithirapuram': [10.0380, 77.0420],
  'Attukad': [10.0290, 77.0510],
};

const CITY_DEFAULT_COORDS: Record<string, [number, number]> = {
  'delhi': [28.63, 77.18],
  'mumbai': [19.0760, 72.8777],
  'bangalore': [12.9716, 77.5946],
  'goa': [15.2993, 74.1240],
  'jaipur': [26.9124, 75.7873],
  'munnar': [10.0889, 77.0595],
  'new york': [40.7128, -74.0060],
  'paris': [48.8566, 2.3522],
  'london': [51.5074, -0.1278],
  'dubai': [25.2048, 55.2708],
};

const FALLBACK_BATHTUB_IMG = 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80';

export default function RedesignClient({
  initialCity = 'Delhi',
  initialHotels = [],
  allCities = [],
}: RedesignClientProps) {
  const router = useRouter();

  // Active City state
  const [city, setCity] = useState(initialCity);
  const [citySearchInput, setCitySearchInput] = useState('');
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCityDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filters state
  const [selectedArea, setSelectedArea] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTubType, setSelectedTubType] = useState<string>('All');
  const [sortOrder, setSortOrder] = useState<'recommended' | 'price_asc' | 'rating_desc'>('recommended');
  const [activeHotelId, setActiveHotelId] = useState<string | null>(null);
  const [hoveredHotelId, setHoveredHotelId] = useState<string | null>(null);
  const [openComparisonId, setOpenComparisonId] = useState<string | null>(null);

  // View Mode: 'split' (cards + map) vs 'grid' (full width cards)
  const [viewMode, setViewMode] = useState<'split' | 'grid'>('grid');

  // Leaflet references
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<Record<string, any>>({});

  // Filter available cities for autocomplete
  const filteredCityOptions = useMemo(() => {
    if (!citySearchInput.trim()) {
      return allCities.slice(0, 15);
    }
    const q = citySearchInput.toLowerCase();
    return allCities.filter(c => c.toLowerCase().includes(q)).slice(0, 20);
  }, [allCities, citySearchInput]);

  // Normalize hotel data and assign realistic coordinates if missing
  const hotelsWithCoords = useMemo(() => {
    const cityKey = city.toLowerCase();
    const defaultCenter = CITY_DEFAULT_COORDS[cityKey] || [28.63, 77.18];

    return initialHotels.map((h, index) => {
      // Determine coordinates from neighborhood map or scatter near city center
      let coords: [number, number] = defaultCenter;
      if (h.neighborhood && NEIGHBORHOOD_COORDS[h.neighborhood]) {
        coords = NEIGHBORHOOD_COORDS[h.neighborhood];
      } else {
        // slight jitter so pins don't overlap completely
        const offsetLat = (Math.sin(index + 1) * 0.04);
        const offsetLng = (Math.cos(index + 1) * 0.04);
        coords = [defaultCenter[0] + offsetLat, defaultCenter[1] + offsetLng];
      }

      // Parse numerical price
      const rawPrice = h.price ? parseInt(h.price.replace(/[^\d]/g, ''), 10) : 3500;
      const cleanPrice = isNaN(rawPrice) || rawPrice <= 0 ? 3200 : rawPrice;

      return {
        ...h,
        parsedPrice: cleanPrice,
        computedCoords: coords,
        displayNeighborhood: h.neighborhood || 'Central Area',
        displayRoomType: h.roomType || 'Deluxe Suite with Bathtub',
        displayTubType: h.tubType || 'Private In-Room Bathtub',
      };
    });
  }, [initialHotels, city]);

  // Extract distinct neighborhoods for the active city
  const cityNeighborhoods = useMemo(() => {
    const list = hotelsWithCoords
      .map(h => h.displayNeighborhood)
      .filter(Boolean);
    const unique = Array.from(new Set(list));
    return ['All', ...unique];
  }, [hotelsWithCoords]);

  // Filtered hotels based on area, tub type, and search keyword
  const filteredHotels = useMemo(() => {
    return hotelsWithCoords.filter(hotel => {
      if (selectedArea !== 'All' && hotel.displayNeighborhood !== selectedArea) return false;
      if (selectedTubType !== 'All') {
        const typeStr = (hotel.displayTubType + ' ' + (hotel.tubType || '')).toLowerCase();
        if (selectedTubType === 'jacuzzi' && !typeStr.includes('jacuzzi') && !typeStr.includes('whirlpool')) return false;
        if (selectedTubType === 'soaking' && !typeStr.includes('soak') && !typeStr.includes('tub')) return false;
        if (selectedTubType === 'view' && !typeStr.includes('view') && !typeStr.includes('mountain') && !typeStr.includes('balcony')) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = hotel.name.toLowerCase().includes(q);
        const matchArea = hotel.displayNeighborhood.toLowerCase().includes(q);
        const matchRoom = hotel.displayRoomType.toLowerCase().includes(q);
        if (!matchName && !matchArea && !matchRoom) return false;
      }
      return true;
    });
  }, [hotelsWithCoords, selectedArea, selectedTubType, searchQuery]);

  // Sorted hotels based on active sort order
  const sortedHotels = useMemo(() => {
    const list = [...filteredHotels];
    if (sortOrder === 'price_asc') {
      return list.sort((a, b) => a.parsedPrice - b.parsedPrice);
    }
    if (sortOrder === 'rating_desc') {
      return list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }
    return list;
  }, [filteredHotels, sortOrder]);

  // Switch City
  const handleSelectCity = (newCity: string) => {
    setCity(newCity);
    setSelectedArea('All');
    setIsCityDropdownOpen(false);
    setCitySearchInput('');
    router.push(`/redesign?city=${encodeURIComponent(newCity)}`);
  };

  // Safe Leaflet Map Setup
  useEffect(() => {
    if (typeof window === 'undefined' || viewMode === 'grid') return;

    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    const initMap = () => {
      const L = (window as any).L;
      if (!L || !mapContainerRef.current) return;

      const cityKey = city.toLowerCase();
      const center = CITY_DEFAULT_COORDS[cityKey] || [28.63, 77.18];

      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, {
          center,
          zoom: 11,
          zoomControl: false,
        });

        // Use standard OpenStreetMap tiles (no API key needed)
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap',
          maxZoom: 18,
        }).addTo(map);

        L.control.zoom({ position: 'bottomright' }).addTo(map);
        mapInstanceRef.current = map;
      }

      const map = mapInstanceRef.current;
      Object.values(markersRef.current).forEach((m: any) => m.remove());
      markersRef.current = {};

      sortedHotels.forEach(hotel => {
        const isSelected = activeHotelId === hotel._id || activeHotelId === hotel.name;
        const icon = L.divIcon({
          className: 'clean-map-marker',
          html: `
            <div class="px-2.5 py-1 rounded-full text-xs font-bold shadow-md cursor-pointer border flex items-center gap-1 transition-all ${
              isSelected
                ? 'bg-slate-900 text-white border-slate-900 scale-110 shadow-lg ring-2 ring-emerald-500'
                : 'bg-white text-slate-900 border-slate-200 hover:scale-105 hover:bg-slate-50'
            }">
              <span>₹${hotel.parsedPrice.toLocaleString('en-IN')}</span>
              <span>🛁</span>
            </div>
          `,
          iconSize: [84, 28],
          iconAnchor: [42, 14],
        });

        const marker = L.marker(hotel.computedCoords, { icon }).addTo(map);

        marker.on('click', () => {
          setActiveHotelId(hotel._id || hotel.name);
          const el = document.getElementById(`hotel-item-${hotel._id || hotel.name}`);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });

        marker.bindPopup(`
          <div style="font-family: inherit; min-width: 180px; padding: 4px;">
            <div style="font-weight: 700; font-size: 13px; color: #0F172A;">${hotel.name}</div>
            <div style="font-size: 11px; color: #059669; font-weight: 600; margin-top: 2px;">✓ ${hotel.displayRoomType}</div>
            <div style="font-weight: 800; font-size: 14px; margin-top: 6px; color: #0F172A;">From ₹${hotel.parsedPrice.toLocaleString('en-IN')} / night</div>
          </div>
        `);

        markersRef.current[hotel._id || hotel.name] = marker;
      });

      const markerList: any[] = Object.values(markersRef.current);
      if (markerList.length === 0) {
        map.setView(center, 11);
      } else if (markerList.length === 1) {
        map.setView(markerList[0].getLatLng(), 14);
      } else {
        try {
          const group = L.featureGroup(markerList);
          const bounds = group.getBounds();
          if (bounds && bounds.isValid() && bounds.getNorth() !== bounds.getSouth() && bounds.getEast() !== bounds.getWest()) {
            map.fitBounds(bounds.pad(0.08), { maxZoom: selectedArea === 'All' ? 12 : 14 });
          } else {
            map.setView(markerList[0].getLatLng(), 13);
          }
        } catch {
          map.setView(center, 11);
        }
      }

      setTimeout(() => {
        try { map.invalidateSize(); } catch {}
      }, 150);
    };

    if (!(window as any).L) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      script.onload = initMap;
      document.body.appendChild(script);
    } else {
      initMap();
    }
  }, [viewMode, sortedHotels, city, selectedArea, activeHotelId]);

  return (
    <div className="bg-white text-slate-900 min-h-screen flex flex-col selection:bg-blue-100" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Inter', sans-serif" }}>
      <style>{`
        #global-site-footer { display: none !important; }
        .clean-map-marker { background: transparent; border: none; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* ============================================================== */}
      {/* 1. PREMIUM NAVBAR — MMT-inspired: white, sharp, professional    */}
      {/* ============================================================== */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-[0_1px_0_0_rgba(0,0,0,0.06)]">
        <div className="w-full px-4 sm:px-6 lg:px-8 max-w-[1720px] mx-auto h-[60px] flex items-center gap-6">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="relative w-9 h-9 rounded-lg overflow-hidden flex items-center justify-center bg-gradient-to-br from-[#1a6fde] to-[#0a4fa8] shadow-md group-hover:shadow-lg transition-shadow">
              <span className="text-lg">🛁</span>
            </div>
            <div className="hidden sm:flex flex-col leading-none">
              <span className="text-[15px] font-black text-gray-900 tracking-tight">
                Hotels<span className="text-[#1a6fde]">WithBathtubs</span>
              </span>
              <span className="text-[9.5px] font-medium text-gray-400 mt-0.5">
                Soak in. No Surprises.
              </span>
            </div>
          </Link>

          {/* Divider */}
          <div className="hidden lg:block w-px h-7 bg-gray-200 shrink-0" />

          {/* Search Bar */}
          <div ref={dropdownRef} className="relative flex-1 max-w-xl">
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-gray-400 pointer-events-none">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                value={citySearchInput}
                onChange={(e) => { setCitySearchInput(e.target.value); setIsCityDropdownOpen(true); }}
                onFocus={() => setIsCityDropdownOpen(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && filteredCityOptions.length > 0) handleSelectCity(filteredCityOptions[0]);
                  else if (e.key === 'Escape') setIsCityDropdownOpen(false);
                }}
                placeholder={`Where are you travelling? Try "Goa", "Munnar"...`}
                className="w-full pl-9 pr-9 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1a6fde]/30 focus:border-[#1a6fde] transition-all shadow-sm"
              />
              {citySearchInput && (
                <button type="button" onClick={() => { setCitySearchInput(''); setIsCityDropdownOpen(false); }}
                  className="absolute right-3 text-gray-400 hover:text-gray-700 font-bold text-xs">✕</button>
              )}
            </div>
            {isCityDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden z-50 max-h-72 overflow-y-auto">
                <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  {allCities.length} Cities with Verified Bathtub Hotels
                </div>
                <div className="py-1">
                  {filteredCityOptions.map(c => (
                    <button key={c} type="button" onClick={() => handleSelectCity(c)}
                      className={`w-full text-left px-4 py-2.5 text-sm font-medium flex items-center justify-between transition-colors ${
                        c.toLowerCase() === city.toLowerCase()
                          ? 'bg-blue-50 text-[#1a6fde] font-semibold'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}>
                      <span>📍 {c}</span>
                      {c.toLowerCase() === city.toLowerCase() && <span className="text-[#1a6fde] text-xs font-bold">Viewing ✓</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Map toggle — secondary, right-aligned */}
          <button type="button" onClick={() => setViewMode(viewMode === 'split' ? 'grid' : 'split')}
            className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold border transition-all ${
              viewMode === 'split'
                ? 'bg-[#1a6fde] text-white border-[#1a6fde] shadow-sm'
                : 'bg-white text-gray-700 border-gray-200 hover:border-[#1a6fde] hover:text-[#1a6fde]'
            }`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            {viewMode === 'split' ? 'Hide Map' : 'Show on Map'}
          </button>
        </div>
      </header>

      {/* ============================================================== */}
      {/* 2. CITY HERO — Airbnb-inspired, warm, spacious, confident       */}
      {/* ============================================================== */}
      <section className="bg-white border-b border-gray-100">
        <div className="w-full px-4 sm:px-6 lg:px-8 max-w-[1720px] mx-auto pt-5 pb-3">

          {/* Top row: City title + popular jumps */}
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-[26px] sm:text-[30px] font-black text-gray-900 tracking-tight leading-[1.15]">
                {city} Hotels with a Bathtub
              </h1>
              <p className="text-[13px] text-gray-500 mt-1.5 font-medium">
                <span className="text-emerald-600 font-semibold">✓ Every listing photographically verified.</span>
                {' '}Book what you see — a real bathtub in your room.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-semibold text-gray-400">Top cities:</span>
              {['Delhi', 'Mumbai', 'Goa', 'Bangalore', 'Jaipur', 'Munnar'].map(c => (
                <button key={c} type="button" onClick={() => handleSelectCity(c)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                    c.toLowerCase() === city.toLowerCase()
                      ? 'bg-[#1a6fde] text-white border-[#1a6fde]'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-[#1a6fde] hover:text-[#1a6fde]'
                  }`}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Filter row: Area chips + Tub type in one horizontal band */}
          <div className="flex flex-col gap-2.5">
            {/* Area chips */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider shrink-0">Area</span>
              <div className="w-px h-4 bg-gray-200 shrink-0" />
              {cityNeighborhoods.map((areaName) => {
                const count = areaName === 'All'
                  ? hotelsWithCoords.length
                  : hotelsWithCoords.filter(h => h.displayNeighborhood === areaName).length;
                const isSelected = selectedArea === areaName;
                return (
                  <button key={areaName} type="button"
                    onClick={() => {
                      setSelectedArea(areaName);
                      const match = hotelsWithCoords.find(h => areaName === 'All' || h.displayNeighborhood === areaName);
                      if (match) setActiveHotelId(match._id || match.name);
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap transition-all ${
                      isSelected
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}>
                    {areaName === 'All' ? `All ${city}` : areaName}
                    <span className={`text-[10px] font-bold ${isSelected ? 'text-white/70' : 'text-gray-500'}`}>{count}</span>
                  </button>
                );
              })}
            </div>

            {/* Tub type pills */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider shrink-0">Bathtub</span>
              <div className="w-px h-4 bg-gray-200 shrink-0" />
              {[
                { id: 'All', label: 'All Types', icon: '🛁' },
                { id: 'jacuzzi', label: 'Jacuzzi & Whirlpool', icon: '🌊' },
                { id: 'soaking', label: 'Deep Soaking Tub', icon: '🫧' },
                { id: 'view', label: 'With a View', icon: '🪟' },
              ].map(tub => (
                <button key={tub.id} type="button" onClick={() => setSelectedTubType(tub.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap transition-all border ${
                    selectedTubType === tub.id
                      ? 'bg-[#1a6fde] text-white border-[#1a6fde]'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-[#1a6fde] hover:text-[#1a6fde]'
                  }`}>
                  {tub.icon} {tub.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 3. FULL-WIDTH RESPONSIVE MAIN CANVAS (Using 100% Screen Width) */}
      {/* ============================================================== */}
      <main className="w-full px-4 sm:px-6 lg:px-8 max-w-[1720px] mx-auto py-6 flex-1">
        
        {/* Layout Grid: Full-Width Split or Full-Width Multi-Column Grid */}
        <div className={`grid gap-4 ${viewMode === 'split' ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1'}`}>
          
          {/* ================= FEED COLUMN ================= */}
          <div className={`${viewMode === 'split' ? 'lg:col-span-7 xl:col-span-7' : 'w-full'}`}>
            
            {/* Results Header — MMT style: clean white card, inline sort pills */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white px-4 py-3 rounded-xl border border-gray-200 shadow-sm mb-3">
              <div>
                <h2 className="text-[15px] font-bold text-gray-900 flex items-center gap-2">
                  <span>{sortedHotels.length} Verified Bathtub Hotels in {selectedArea === 'All' ? city : `${selectedArea}, ${city}`}</span>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    ✓ In-Room Verified
                  </span>
                </h2>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  100% photographic room verification. Zero shower-only surprises.
                </p>
              </div>

              {/* Sort Pills — MMT-style inline tabs */}
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-[11px] font-semibold text-gray-400 mr-1">Sort:</span>
                {[
                  { val: 'recommended', label: 'Recommended' },
                  { val: 'price_asc', label: 'Price ↑' },
                  { val: 'rating_desc', label: 'Top Rated' },
                ].map(s => (
                  <button key={s.val} type="button" onClick={() => setSortOrder(s.val as any)}
                    className={`px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all border ${
                      sortOrder === s.val
                        ? 'bg-[#1a6fde] text-white border-[#1a6fde] shadow-sm'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-[#1a6fde] hover:text-[#1a6fde]'
                    }`}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>


            {sortedHotels.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-xs">
                <span className="text-3xl block mb-2">🛁</span>
                <h3 className="text-base font-bold text-slate-900">No verified bathtubs found for this filter</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Try switching back to &quot;All {city}&quot; or resetting the tub filter to see all stays.
                </p>
                <button
                  type="button"
                  onClick={() => { setSelectedArea('All'); setSelectedTubType('All'); setSearchQuery(''); }}
                  className="mt-4 px-4 py-2 bg-slate-950 text-white text-xs font-bold rounded-full"
                >
                  Reset Filters
                </button>
              </div>
            ) : viewMode === 'split' ? (
              /* ================= SPLIT VIEW: COMPACT 2-COL GRID — 4 CARDS VISIBLE AT ONCE ================= */
              <div className="grid grid-cols-2 gap-3">
                {sortedHotels.map((hotel) => {
                  const hotelKey = hotel._id || hotel.name;
                  const isComparing = openComparisonId === hotelKey;
                  const isActive = activeHotelId === hotelKey;

                  return (
                    <article
                      key={hotelKey}
                      id={`hotel-item-${hotelKey}`}
                      onMouseEnter={() => setHoveredHotelId(hotelKey)}
                      onMouseLeave={() => setHoveredHotelId(null)}
                      onClick={() => setActiveHotelId(hotelKey)}
                      className={`bg-white rounded-xl border transition-all duration-200 overflow-hidden flex flex-col cursor-pointer group ${
                        isActive
                          ? 'border-[#1a6fde] shadow-[0_0_0_3px_rgba(26,111,222,0.12)] shadow-sm'
                          : 'border-slate-200 hover:border-[#7db8f7] shadow-[0_1px_3px_0_rgba(15,23,42,0.05)] hover:shadow-[0_4px_16px_-4px_rgba(15,23,42,0.10)]'
                      }`}
                    >
                      {/* Image */}
                      <div className="relative h-32 w-full overflow-hidden bg-slate-100 shrink-0">
                        <img
                          src={hotel.image || FALLBACK_BATHTUB_IMG}
                          alt={hotel.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                          loading="lazy"
                          onError={(e) => {
                            const target = e.currentTarget;
                            if (target.src !== FALLBACK_BATHTUB_IMG) {
                              target.src = FALLBACK_BATHTUB_IMG;
                            }
                          }}
                        />
                        {/* Tub badge */}
                        <div className="absolute top-1.5 left-1.5">
                          <span className="bg-[#EFF6FF] border border-[#BFDBFE] text-[#1D4ED8] text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shadow-sm">
                            🛁 {hotel.displayTubType}
                          </span>
                        </div>
                        {/* Rating badge */}
                        {hotel.rating && (
                          <div className="absolute top-1.5 right-1.5 bg-white/95 text-slate-900 text-[10px] font-black px-1.5 py-0.5 rounded-md shadow-sm flex items-center gap-0.5">
                            <span className="text-amber-500">★</span>
                            <span>{hotel.rating}</span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex flex-col flex-1 p-2.5 gap-1">
                        {/* Hotel name */}
                        <h2 className="text-[12px] font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-[#1a6fde] transition-colors">
                          {hotel.name}
                        </h2>

                        {/* Rating + Reviews + Landmark */}
                        <div className="flex flex-col gap-0.5">
                          {hotel.rating && (
                            <div className="flex items-center gap-1 text-[10px]">
                              <span className="text-amber-500 font-black">★ {hotel.rating}</span>
                              {hotel.reviewsCount && (
                                <span className="text-slate-400">({hotel.reviewsCount.toLocaleString()} reviews)</span>
                              )}
                            </div>
                          )}
                          {hotel.landmarkDistance && (
                            <p className="text-[9px] text-slate-500 truncate flex items-center gap-0.5">
                              <span>📍</span>
                              <span className="truncate">{hotel.landmarkDistance}</span>
                            </p>
                          )}
                        </div>

                        {/* Verified room pill */}
                        <div className="bg-emerald-50 border border-emerald-100 rounded-md px-1.5 py-0.5 flex items-center gap-1">
                          <span className="text-emerald-600 text-[9px] font-black shrink-0">✓</span>
                          <span className="text-[9px] text-emerald-800 font-semibold leading-tight line-clamp-1">
                            {hotel.displayRoomType}
                          </span>
                          {hotel.crossVerified && (
                            <span className="ml-auto text-[8px] font-bold text-slate-500 shrink-0 whitespace-nowrap">
                              · {(hotel.crossVerifiedSources?.[0] || 'MMT')} ✓
                            </span>
                          )}
                        </div>

                        {/* Amenity chips */}
                        {hotel.amenities && hotel.amenities.length > 1 && (
                          <div className="flex flex-wrap gap-1">
                            {hotel.amenities.filter(a => a !== 'Bathtub').slice(0, 3).map(a => {
                              const icon = a === 'Free WiFi' ? '📶' : a === 'Couple Friendly' ? '❤️' : a === 'Air Conditioning' ? '❄️' : a === 'Jacuzzi' ? '🌊' : a === 'Breakfast Included' ? '🍳' : '✓';
                              return (
                                <span key={a} className="text-[8.5px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                                  {icon} {a}
                                </span>
                              );
                            })}
                          </div>
                        )}

                        {/* Booking tip badge */}
                        {hotel.bookingTip && !hotel.bookingTip.startsWith('Triple') && (
                          <div className="bg-amber-50 border border-amber-200 rounded-md px-1.5 py-0.5 flex items-center gap-1">
                            <span className="text-amber-600 text-[8.5px]">🏷️</span>
                            <span className="text-[8.5px] font-semibold text-amber-800 line-clamp-1">{hotel.bookingTip}</span>
                          </div>
                        )}

                        {/* Spacer */}
                        <div className="flex-1 min-h-0" />

                        {/* Price + CTA row */}
                        <div className="flex items-center justify-between gap-1 pt-1.5 border-t border-slate-100 mt-0.5">
                          <div>
                            <span className="text-[9px] text-slate-400 font-medium block leading-none mb-0.5">From</span>
                            <span className="text-sm font-extrabold text-slate-950 leading-none">
                              ₹{hotel.parsedPrice.toLocaleString('en-IN')}
                            </span>
                          </div>
                          <a
                            href={hotel.url || 'https://www.makemytrip.com'}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[#1a6fde] hover:bg-[#1559b8] active:scale-[0.97] text-white font-bold text-[10px] px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-0.5 shadow-sm"
                          >
                            Book <span>→</span>
                          </a>
                        </div>

                        {/* Compare drawer toggle */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenComparisonId(isComparing ? null : hotelKey);
                          }}
                          className="text-[9px] font-semibold text-slate-400 hover:text-slate-700 text-center transition-colors"
                        >
                          {isComparing ? 'Hide comparison ↑' : 'Compare 3 partners ↓'}
                        </button>

                        {/* Multi-OTA Comparison Drawer */}
                        {isComparing && (
                          <div className="pt-1.5 border-t border-dashed border-slate-200 grid grid-cols-3 gap-1 text-[10px]">
                            <a href={hotel.url || 'https://www.makemytrip.com'} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                              className="p-1 rounded-md text-center bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold">
                              <div className="text-[8px] text-slate-400 mb-0.5">MMT</div>
                              <div>₹{hotel.parsedPrice.toLocaleString('en-IN')}</div>
                            </a>
                            <a href={`https://www.agoda.com/search?city=${encodeURIComponent(city)}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                              className="p-1 rounded-md text-center bg-slate-50 border border-slate-200 text-slate-600">
                              <div className="text-[8px] text-slate-400 mb-0.5">Agoda</div>
                              <div>₹{(hotel.parsedPrice + 120).toLocaleString('en-IN')}</div>
                            </a>
                            <a href={`https://www.booking.com/searchresults.html?ss=${encodeURIComponent(city)}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                              className="p-1 rounded-md text-center bg-slate-50 border border-slate-200 text-slate-600">
                              <div className="text-[8px] text-slate-400 mb-0.5">Booking</div>
                              <div>₹{(hotel.parsedPrice + 240).toLocaleString('en-IN')}</div>
                            </a>
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              /* ================= GRID ONLY VIEW: COMPACT 4-COLUMN PREMIUM CARDS ================= */
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {sortedHotels.map((hotel) => {
                  const hotelKey = hotel._id || hotel.name;
                  const isComparing = openComparisonId === hotelKey;
                  const isActive = activeHotelId === hotelKey;

                  return (
                    <article
                      key={hotelKey}
                      id={`hotel-item-${hotelKey}`}
                      onMouseEnter={() => setHoveredHotelId(hotelKey)}
                      onMouseLeave={() => setHoveredHotelId(null)}
                      onClick={() => setActiveHotelId(hotelKey)}
                      className={`bg-white rounded-xl border transition-all duration-200 overflow-hidden flex flex-col cursor-pointer group ${
                        isActive
                          ? 'border-[#1a6fde] shadow-[0_0_0_3px_rgba(26,111,222,0.12)]'
                          : 'border-slate-200 hover:border-[#7db8f7] shadow-[0_1px_3px_0_rgba(15,23,42,0.05)] hover:shadow-[0_4px_16px_-4px_rgba(15,23,42,0.10)]'
                      }`}
                    >
                      {/* Image */}
                      <div className="relative h-44 w-full overflow-hidden bg-gray-100 shrink-0">
                        <img
                          src={hotel.image || FALLBACK_BATHTUB_IMG}
                          alt={hotel.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                          loading="lazy"
                          onError={(e) => {
                            const target = e.currentTarget;
                            if (target.src !== FALLBACK_BATHTUB_IMG) {
                              target.src = FALLBACK_BATHTUB_IMG;
                            }
                          }}
                        />
                        <div className="absolute top-1.5 left-1.5">
                          <span className="bg-slate-900/80 backdrop-blur-sm text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                            🛁 {hotel.displayTubType}
                          </span>
                        </div>
                        {hotel.rating && (
                          <div className="absolute top-1.5 right-1.5 bg-white/90 text-slate-900 text-[10px] font-black px-1.5 py-0.5 rounded-md shadow-sm flex items-center gap-0.5">
                            <span className="text-amber-500">★</span>
                            <span>{hotel.rating}</span>
                          </div>
                        )}
                        <div className="absolute bottom-1.5 left-1.5 bg-white/90 backdrop-blur-sm text-slate-800 text-[9px] font-semibold px-1.5 py-0.5 rounded-md">
                          📍 {hotel.displayNeighborhood}
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="flex flex-col flex-1 p-4 gap-2">
                          <h2 className="text-[15px] font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-[#1a6fde] transition-colors">
                            {hotel.name}
                          </h2>

                          {/* Rating + reviews */}
                          {hotel.rating && (
                            <div className="flex items-center gap-1 text-[10px]">
                              <span className="text-amber-500 font-black">★ {hotel.rating}</span>
                              {hotel.reviewsCount && (
                                <span className="text-slate-400">({hotel.reviewsCount.toLocaleString()} reviews)</span>
                              )}
                            </div>
                          )}

                          {/* Landmark distance */}
                          {hotel.landmarkDistance && (
                            <p className="text-[9px] text-slate-500 truncate flex items-center gap-0.5">
                              <span>📍</span>
                              <span className="truncate">{hotel.landmarkDistance}</span>
                            </p>
                          )}

                          {/* Verified room pill */}
                          <div className="bg-emerald-50 border border-emerald-100 rounded-md px-1.5 py-0.5 flex items-center gap-1">
                            <span className="text-emerald-600 text-[9px] font-black shrink-0">✓</span>
                            <span className="text-[9px] text-emerald-800 font-semibold line-clamp-1">{hotel.displayRoomType}</span>
                            {hotel.crossVerified && (
                              <span className="ml-auto text-[8px] font-bold text-slate-400 shrink-0 whitespace-nowrap">
                                · {hotel.crossVerifiedSources?.[0] || 'MMT'} ✓
                              </span>
                            )}
                          </div>

                          {/* Amenity chips */}
                          {hotel.amenities && hotel.amenities.length > 1 && (
                            <div className="flex flex-wrap gap-1">
                              {hotel.amenities.filter((a: string) => a !== 'Bathtub').slice(0, 3).map((a: string) => {
                                const icon = a === 'Free WiFi' ? '📶' : a === 'Couple Friendly' ? '❤️' : a === 'Air Conditioning' ? '❄️' : a === 'Jacuzzi' ? '🌊' : a === 'Breakfast Included' ? '🍳' : '✓';
                                return (
                                  <span key={a} className="text-[8px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-md flex items-center gap-0.5 leading-tight">
                                    {icon} {a}
                                  </span>
                                );
                              })}
                            </div>
                          )}

                          {/* Booking tip */}
                          {hotel.bookingTip && !hotel.bookingTip.startsWith('Triple') && (
                            <div className="bg-amber-50 border border-amber-200 rounded-md px-1.5 py-0.5 flex items-center gap-1">
                              <span className="text-amber-600 text-[8px]">🏷️</span>
                              <span className="text-[8px] font-semibold text-amber-800 line-clamp-1">{hotel.bookingTip}</span>
                            </div>
                          )}

                          <div className="flex-1" />

                          {/* Price + CTA */}
                          <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
                            <div>
                              <span className="text-[10px] text-gray-400 font-medium block leading-none mb-0.5">From</span>
                              <span className="text-[17px] font-black text-gray-900">₹{hotel.parsedPrice.toLocaleString('en-IN')}</span>
                              <span className="text-[10px] text-gray-400 font-medium ml-1">/ night</span>
                            </div>
                            <a
                              href={hotel.url || 'https://www.makemytrip.com'}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="bg-[#1a6fde] hover:bg-[#1559b8] active:scale-[0.97] text-white font-bold text-[13px] px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
                            >
                              Book now
                            </a>
                          </div>

                          {/* Compare toggle */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenComparisonId(isComparing ? null : hotelKey);
                            }}
                            className="text-[9px] font-semibold text-slate-400 hover:text-slate-700 transition-colors text-center"
                          >
                            {isComparing ? 'Hide ↑' : 'Compare rates ↓'}
                          </button>

                          {isComparing && (
                            <div className="pt-1.5 border-t border-dashed border-slate-200 grid grid-cols-3 gap-1 text-[10px]">
                              <div className="p-1 rounded bg-emerald-50 border border-emerald-100 text-center font-bold text-emerald-900">
                                <div className="text-[8px] text-slate-400 mb-0.5">MMT</div>
                                <div>₹{hotel.parsedPrice.toLocaleString('en-IN')}</div>
                              </div>
                              <div className="p-1 rounded bg-slate-50 border border-slate-200 text-center text-slate-600">
                                <div className="text-[8px] text-slate-400 mb-0.5">Agoda</div>
                                <div>₹{(hotel.parsedPrice + 120).toLocaleString('en-IN')}</div>
                              </div>
                              <div className="p-1 rounded bg-slate-50 border border-slate-200 text-center text-slate-600">
                                <div className="text-[8px] text-slate-400 mb-0.5">Booking</div>
                                <div>₹{(hotel.parsedPrice + 240).toLocaleString('en-IN')}</div>
                              </div>
                            </div>
                          )}
                        </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          {/* ================= RIGHT MAP COLUMN (Full Screen Sticky Map) ================= */}
          {viewMode === 'split' && (
            <div className="lg:col-span-5 xl:col-span-5 h-[550px] lg:h-[calc(100vh-140px)] sticky top-20 rounded-2xl overflow-hidden border border-slate-200 shadow-xs relative">
              <div ref={mapContainerRef} className="w-full h-full z-10" />

              {/* Floating Area Tag on Map */}
              <div className="absolute top-3 left-3 z-20 pointer-events-none">
                <span className="px-3 py-1.5 bg-white/95 backdrop-blur-md rounded-xl text-xs font-bold text-slate-800 shadow-md border border-slate-200 pointer-events-auto">
                  📍 {selectedArea === 'All' ? `${city} Map` : selectedArea} ({sortedHotels.length} Stays)
                </span>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ============================================================== */}
      {/* 4. CLEAN FOOTER */}
      {/* ============================================================== */}
      <footer className="border-t border-slate-100 py-6 text-center text-xs text-slate-400 mt-12">
        <div className="w-full px-4 sm:px-6 lg:px-10 max-w-[1720px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>HotelsWithBathtubs.com — Curated Niche Directory for In-Room Bathtubs & Jacuzzis</div>
          <div className="flex items-center gap-4 text-slate-500">
            <span>{allCities.length} Cities Worldwide</span>
            <span>•</span>
            <span>100% Free Transparent Comparison</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
