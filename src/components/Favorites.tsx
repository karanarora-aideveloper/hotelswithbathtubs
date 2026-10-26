'use client';

import { useState, useCallback, useSyncExternalStore } from 'react';
import { trackEvent } from '@/lib/analytics';
import { isUserExcluded } from '@/lib/exclusion';

const STORAGE_KEY = 'hwb_favorites';

export type FavoriteHotel = {
  _id: string;
  name: string;
  city: string;
  country: string;
  image: string;
  price?: string;
  rating?: number;
  tubType?: string;
  bookingUrl?: string;
  agodaUrl?: string;
  airbnbUrl?: string;
  tripUrl?: string;
  url?: string;
  countrySlug: string;
  citySlug: string;
};

const emptySubscribe = () => () => {};

export function useMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

let listeners: Array<() => void> = [];
function subscribe(listener: () => void) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function notify() {
  for (const l of listeners) l();
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) notify();
  });
}

const emptyFavorites: FavoriteHotel[] = [];
let cachedFavorites: FavoriteHotel[] = [];
let lastRaw: string | null = null;

function getFavoritesSnapshot(): FavoriteHotel[] {
  if (typeof window === 'undefined') return emptyFavorites;
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || '[]';
    if (raw !== lastRaw) {
      lastRaw = raw;
      cachedFavorites = JSON.parse(raw);
    }
    return cachedFavorites;
  } catch {
    return emptyFavorites;
  }
}

function getServerSnapshot(): FavoriteHotel[] {
  return emptyFavorites;
}

function saveFavorites(favs: FavoriteHotel[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favs));
    notify();
  } catch (_) {}
}

export function useFavorites() {
  const favorites = useSyncExternalStore(subscribe, getFavoritesSnapshot, getServerSnapshot);

  const isFavorite = useCallback(
    (id: string) => favorites.some((f) => f._id === id),
    [favorites]
  );

  const toggleFavorite = useCallback((hotel: FavoriteHotel) => {
    const exists = favorites.some((f) => f._id === hotel._id);
    const next = exists ? favorites.filter((f) => f._id !== hotel._id) : [...favorites, hotel];
    saveFavorites(next);

    // Track analytics (if not excluded)
    try {
      if (!isUserExcluded()) {
        trackEvent('wishlist_action', {
          action: exists ? 'remove' : 'add',
          hotel_name: hotel.name,
          city: hotel.city,
          country: hotel.country,
          tub_type: hotel.tubType,
          price: hotel.price,
          rating: hotel.rating,
          total_wishlist_count: next.length,
        });
      }
    } catch (_) {}
  }, [favorites]);

  const clearAll = useCallback(() => {
    saveFavorites([]);
  }, []);

  return { favorites, isFavorite, toggleFavorite, clearAll };
}

// ─── Heart Button Component ────────────────────────────────────────────────────

export function FavoriteButton({
  hotel,
  className = '',
}: {
  hotel: FavoriteHotel;
  className?: string;
}) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const mounted = useMounted();
  const [pulse, setPulse] = useState(false);

  const saved = mounted && isFavorite(hotel._id);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(hotel);
    setPulse(true);
    setTimeout(() => setPulse(false), 300);
  };

  return (
    <button
      onClick={handleClick}
      aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
      title={saved ? 'Saved to wishlist ❤️' : 'Save to wishlist'}
      className={`transition-all ${pulse ? 'scale-125' : 'scale-100'} ${className}`}
    >
      {saved ? (
        <svg className="w-5 h-5 fill-red-500 text-red-500" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      ) : (
        <svg className="w-5 h-5 stroke-current fill-none text-gray-400 hover:text-red-400" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )}
    </button>
  );
}

// ─── Wishlist Drawer / Page ───────────────────────────────────────────────────

export function WishlistCount() {
  const { favorites } = useFavorites();
  const mounted = useMounted();
  if (!mounted || favorites.length === 0) return null;
  return (
    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-2xs font-black rounded-full w-4 h-4 flex items-center justify-center">
      {favorites.length > 9 ? '9+' : favorites.length}
    </span>
  );
}
