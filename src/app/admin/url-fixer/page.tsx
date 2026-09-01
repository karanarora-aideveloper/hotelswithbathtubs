'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';

interface Hotel {
  _id: string;
  name: string;
  city: string;
  country: string;
  url: string;
  image: string;
  amenities: string[];
}

interface Stats {
  total: number;
  fixed: number;
  remaining: number;
  remainingInFilter: number;
}

export default function UrlFixerPage() {
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [cities, setCities] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [error, setError] = useState('');
  const [lastSaved, setLastSaved] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchNext = useCallback(async (city = selectedCity) => {
    setLoading(true);
    setNewUrl('');
    setError('');
    setLastSaved('');
    try {
      const params = new URLSearchParams();
      if (city) params.set('city', city);
      const res = await fetch(`/api/admin/url-fixer?${params}`);
      const data = await res.json();
      setHotel(data.hotel || null);
      setStats(data.stats);
      setCities(data.cities || []);
      setDone(!data.hotel);
      if (data.hotel) {
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    } finally {
      setLoading(false);
    }
  }, [selectedCity]);

  useEffect(() => {
    fetchNext();
  }, []);

  const handleSave = async () => {
    if (!hotel || !newUrl.trim() || saving) return;
    setError('');

    // Quick client-side validation
    if (!newUrl.includes('makemytrip.com') || !newUrl.includes('hotelId')) {
      setError('Must be a makemytrip.com hotel-details URL with hotelId parameter.');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/admin/url-fixer', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hotelId: hotel._id, newUrl: newUrl.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to save');
        return;
      }
      setLastSaved(hotel.name);
      await fetchNext();
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => {
    if (!hotel || loading) return;
    fetchNext();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') handleSkip();
  };

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    setDone(false);
    fetchNext(city);
  };

  // Extract hotelId from a pasted URL for preview
  const extractedId = (() => {
    try {
      const u = new URL(newUrl);
      return u.searchParams.get('hotelId') || '';
    } catch {
      return '';
    }
  })();

  const fixedPct = stats ? Math.round((stats.fixed / stats.total) * 100) : 0;

  // Build MMT search URL for the current hotel
  const mmtSearchUrl = hotel
    ? `https://www.makemytrip.com/hotels/hotel-listing/?city=${encodeURIComponent(hotel.city)}&searchText=${encodeURIComponent(hotel.name)}`
    : '';

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">MMT URL Fixer</h1>
          <p className="text-gray-500 text-sm mt-1">
            Replace generic hotel-listing search URLs with specific hotel-details deep links.
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
            <div className="text-xs text-gray-500 mt-0.5">Total MMT hotels</div>
          </div>
          <div className="bg-green-50 rounded-xl border border-green-200 p-4 text-center">
            <div className="text-2xl font-bold text-green-700">{stats.fixed}</div>
            <div className="text-xs text-green-600 mt-0.5">Specific URL ✓</div>
          </div>
          <div className="bg-amber-50 rounded-xl border border-amber-200 p-4 text-center">
            <div className="text-2xl font-bold text-amber-700">{stats.remaining}</div>
            <div className="text-xs text-amber-600 mt-0.5">Generic (to fix)</div>
          </div>
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-4 text-center">
            <div className="text-2xl font-bold text-blue-700">
              {selectedCity ? stats.remainingInFilter : stats.remaining}
            </div>
            <div className="text-xs text-blue-600 mt-0.5">
              {selectedCity ? `Left in ${selectedCity}` : 'Left total'}
            </div>
          </div>
        </div>
      )}

      {/* Progress bar */}
      {stats && (
        <div className="mb-6">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>{fixedPct}% fixed</span>
            <span>{stats.fixed} / {stats.total}</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-500"
              style={{ width: `${fixedPct}%` }}
            />
          </div>
        </div>
      )}

      {/* Last saved toast */}
      {lastSaved && (
        <div className="mb-4 px-4 py-2.5 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 flex items-center gap-2">
          <span>✓</span>
          <span>Saved <strong>{lastSaved}</strong></span>
        </div>
      )}

      {/* How to use */}
      <div className="mb-5 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800">
        <strong>How to fix:</strong> Click <span className="font-mono text-xs bg-blue-100 px-1 py-0.5 rounded">Open on MMT ↗</span> → find the hotel → copy its URL from the address bar → paste below → Save.
        The URL must contain <span className="font-mono text-xs">hotelId=</span> to be valid.
        Press <kbd className="bg-blue-100 border border-blue-300 rounded px-1 py-0.5 font-mono text-[11px]">Enter</kbd> to save,
        <kbd className="bg-blue-100 border border-blue-300 rounded px-1 py-0.5 font-mono text-[11px]">Esc</kbd> to skip.
      </div>

      {/* Main card */}
      {loading ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center text-gray-400">
          Loading…
        </div>
      ) : done ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center">
          <div className="text-4xl mb-3">🎉</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {selectedCity ? `${selectedCity} is done!` : 'All MMT URLs fixed!'}
          </h2>
          <p className="text-gray-500">
            {selectedCity
              ? `Switch to another city or clear the filter to continue.`
              : `Every MMT hotel now has a specific URL with hotelId.`}
          </p>
        </div>
      ) : hotel ? (
        <div className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Image */}
            <div className="relative h-56 md:h-auto min-h-[240px] bg-gray-100">
              <Image
                src={hotel.image}
                alt={hotel.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                unoptimized
              />
              <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
                {hotel.amenities.slice(0, 3).map(a => (
                  <span key={a} className="text-[11px] bg-black/60 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">
                    {a}
                  </span>
                ))}
              </div>
            </div>

            {/* Info + URL input */}
            <div className="p-7 flex flex-col justify-between">
              <div>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  {hotel.city}, {hotel.country}
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-4 leading-tight">{hotel.name}</h2>

                {/* Current bad URL */}
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Current (generic) URL</p>
                  <div className="text-xs font-mono text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 break-all">
                    {hotel.url}
                  </div>
                </div>

                {/* Open on MMT */}
                <a
                  href={mmtSearchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2.5 rounded-lg transition-colors mb-5 shadow-sm"
                >
                  Open on MMT ↗
                </a>

                {/* URL input */}
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                    Paste specific hotel-details URL
                  </p>
                  <input
                    ref={inputRef}
                    type="text"
                    value={newUrl}
                    onChange={e => { setNewUrl(e.target.value); setError(''); }}
                    onKeyDown={handleKeyDown}
                    placeholder="https://www.makemytrip.com/hotels/hotel-details?hotelId=..."
                    className="w-full text-xs font-mono border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                  />
                  {extractedId && (
                    <p className="text-xs text-green-600 mt-1.5 flex items-center gap-1">
                      <span>✓</span> hotelId: <span className="font-mono font-semibold">{extractedId}</span>
                    </p>
                  )}
                  {error && (
                    <p className="text-xs text-red-600 mt-1.5">{error}</p>
                  )}
                </div>
              </div>

              {/* Buttons */}
              <div className="mt-5 grid grid-cols-2 gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving || !newUrl.trim()}
                  className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors text-sm shadow-sm"
                >
                  {saving ? 'Saving…' : '✓ Save URL'}
                </button>
                <button
                  onClick={handleSkip}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-40 text-gray-700 font-bold py-3 rounded-xl transition-colors text-sm"
                >
                  Skip →
                </button>
              </div>
              <p className="text-center text-xs text-gray-400 mt-2">
                <kbd className="bg-gray-100 border border-gray-300 rounded px-1.5 py-0.5 font-mono text-[11px]">Enter</kbd> save &nbsp;·&nbsp;
                <kbd className="bg-gray-100 border border-gray-300 rounded px-1.5 py-0.5 font-mono text-[11px]">Esc</kbd> skip
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
