'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

interface Hotel {
  _id: string;
  name: string;
  city: string;
  country: string;
  image: string;
  url?: string;
  agodaUrl?: string;
  bookingUrl?: string;
  amenities: string[];
  crossVerified?: boolean;
  crossVerifiedSources?: string[];
}

interface Stats {
  total: number;
  confirmed: number;
  flagged: number;
  unreviewed: number;
  unreviewedInFilter: number;
}

export default function ReviewQueuePage() {
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [cities, setCities] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [lastAction, setLastAction] = useState<'confirm' | 'flag' | null>(null);
  const [done, setDone] = useState(false);

  const fetchNext = useCallback(async (city = selectedCity) => {
    setLoading(true);
    setLastAction(null);
    try {
      const params = new URLSearchParams();
      if (city) params.set('city', city);
      const res = await fetch(`/api/admin/review?${params}`);
      const data = await res.json();
      setHotel(data.hotel || null);
      setStats(data.stats);
      setCities(data.cities || []);
      setDone(!data.hotel);
    } finally {
      setLoading(false);
    }
  }, [selectedCity]);

  useEffect(() => {
    fetchNext();
  }, []);

  const act = useCallback(async (action: 'confirm' | 'flag') => {
    if (!hotel || acting) return;
    setActing(true);
    setLastAction(action);
    try {
      await fetch(`/api/admin/hotels/${hotel._id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      // Short pause so user sees feedback before next hotel loads
      await new Promise(r => setTimeout(r, 350));
      await fetchNext();
    } finally {
      setActing(false);
    }
  }, [hotel, acting, fetchNext]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLSelectElement || e.target instanceof HTMLInputElement) return;
      if (e.key === 'y' || e.key === 'Y') act('confirm');
      if (e.key === 'n' || e.key === 'N') act('flag');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [act]);

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    setDone(false);
    fetchNext(city);
  };

  const confirmPct = stats ? Math.round((stats.confirmed / stats.total) * 100) : 0;
  const reviewedPct = stats ? Math.round(((stats.confirmed + stats.flagged) / stats.total) * 100) : 0;

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bathtub Review Queue</h1>
          <p className="text-gray-500 text-sm mt-1">
            Check each hotel on the booking site, then confirm or flag it. Flagged hotels are hidden from the live site immediately.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Filter by city</span>
          <select
            value={selectedCity}
            onChange={e => handleCityChange(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="">All cities</option>
            {cities.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats bar */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-xs text-gray-500 mt-0.5">Total active</div>
          </div>
          <div className="bg-green-50 rounded-xl border border-green-200 p-4 text-center">
            <div className="text-2xl font-bold text-green-700">{stats.confirmed}</div>
            <div className="text-xs text-green-600 mt-0.5">Confirmed ✓</div>
          </div>
          <div className="bg-red-50 rounded-xl border border-red-200 p-4 text-center">
            <div className="text-2xl font-bold text-red-700">{stats.flagged}</div>
            <div className="text-xs text-red-600 mt-0.5">Flagged (hidden)</div>
          </div>
          <div className="bg-amber-50 rounded-xl border border-amber-200 p-4 text-center">
            <div className="text-2xl font-bold text-amber-700">
              {selectedCity ? stats.unreviewedInFilter : stats.unreviewed}
            </div>
            <div className="text-xs text-amber-600 mt-0.5">
              {selectedCity ? `Left in ${selectedCity}` : 'Left to review'}
            </div>
          </div>
        </div>
      )}

      {/* Progress bar */}
      {stats && (
        <div className="mb-6">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>{reviewedPct}% reviewed · {confirmPct}% confirmed bathtub</span>
            <span>{stats.confirmed + stats.flagged} / {stats.total}</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden flex">
            <div
              className="h-full bg-green-500 transition-all duration-500"
              style={{ width: `${confirmPct}%` }}
            />
            <div
              className="h-full bg-red-400 transition-all duration-500"
              style={{ width: `${Math.round((stats.flagged / stats.total) * 100)}%` }}
            />
          </div>
          <div className="flex gap-4 mt-1.5">
            <span className="text-[11px] text-gray-400 flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-sm bg-green-500"></span> Confirmed</span>
            <span className="text-[11px] text-gray-400 flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-sm bg-red-400"></span> Flagged</span>
            <span className="text-[11px] text-gray-400 flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-sm bg-gray-200"></span> Unreviewed</span>
          </div>
        </div>
      )}

      {/* Main card */}
      {loading ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center text-gray-400">
          Loading…
        </div>
      ) : done ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center">
          <div className="text-4xl mb-3">🎉</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {selectedCity ? `${selectedCity} is done!` : 'All hotels reviewed!'}
          </h2>
          <p className="text-gray-500">
            {selectedCity
              ? `Switch to another city or clear the filter to continue.`
              : `Every hotel has been reviewed. Confirmed: ${stats?.confirmed}, Flagged: ${stats?.flagged}.`}
          </p>
        </div>
      ) : hotel ? (
        <div className={`bg-white border-2 rounded-2xl overflow-hidden shadow-sm transition-colors duration-200 ${
          acting && lastAction === 'confirm' ? 'border-green-400' :
          acting && lastAction === 'flag' ? 'border-red-400' :
          'border-gray-200'
        }`}>
          <div className="grid md:grid-cols-2 gap-0">
            {/* Image */}
            <div className="relative h-64 md:h-auto min-h-[280px] bg-gray-100">
              <Image
                src={hotel.image}
                alt={hotel.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                unoptimized
              />
              {/* Amenity chips over image */}
              <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
                {hotel.amenities.map(a => (
                  <span key={a} className="text-[11px] bg-black/60 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">
                    {a}
                  </span>
                ))}
              </div>
            </div>

            {/* Info + actions */}
            <div className="p-8 flex flex-col justify-between">
              <div>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  {hotel.city}, {hotel.country}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">{hotel.name}</h2>

                {/* Verification status */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {hotel.crossVerified ? (
                    <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full font-medium">
                      ✓ Cross-verified ({hotel.crossVerifiedSources?.join(', ')})
                    </span>
                  ) : (
                    <span className="text-xs bg-gray-50 text-gray-500 border border-gray-200 px-2.5 py-1 rounded-full">
                      Not cross-verified
                    </span>
                  )}
                </div>

                {/* Booking links — open to manually check */}
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Check on booking sites</p>
                <div className="flex flex-wrap gap-2 mb-8">
                  {hotel.url && (
                    <a
                      href={hotel.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm bg-orange-50 text-orange-700 border border-orange-200 px-3 py-1.5 rounded-lg font-medium hover:bg-orange-100 transition-colors flex items-center gap-1.5"
                    >
                      MakeMyTrip ↗
                    </a>
                  )}
                  {hotel.agodaUrl && (
                    <a
                      href={hotel.agodaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm bg-red-50 text-red-700 border border-red-200 px-3 py-1.5 rounded-lg font-medium hover:bg-red-100 transition-colors flex items-center gap-1.5"
                    >
                      Agoda ↗
                    </a>
                  )}
                  {hotel.bookingUrl && (
                    <a
                      href={hotel.bookingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center gap-1.5"
                    >
                      Booking.com ↗
                    </a>
                  )}
                  {!hotel.url && !hotel.agodaUrl && !hotel.bookingUrl && (
                    <span className="text-sm text-gray-400 italic">No booking links available</span>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <button
                    onClick={() => act('confirm')}
                    disabled={acting}
                    className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-colors text-sm shadow-sm"
                  >
                    <span className="text-lg">✅</span>
                    <span>Has Bathtub</span>
                  </button>
                  <button
                    onClick={() => act('flag')}
                    disabled={acting}
                    className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-colors text-sm shadow-sm"
                  >
                    <span className="text-lg">🚩</span>
                    <span>No Bathtub</span>
                  </button>
                </div>
                <p className="text-center text-xs text-gray-400">
                  Keyboard: <kbd className="bg-gray-100 border border-gray-300 rounded px-1.5 py-0.5 font-mono text-[11px]">Y</kbd> confirm &nbsp;·&nbsp;
                  <kbd className="bg-gray-100 border border-gray-300 rounded px-1.5 py-0.5 font-mono text-[11px]">N</kbd> flag
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
