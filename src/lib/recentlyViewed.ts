'use client';

export interface RecentHotel {
  id: string;
  name: string;
  city: string;
  country: string;
  image: string;
  url: string;
}

const STORAGE_KEY = 'hwb_recent';
const MAX_RECENT = 20;

export function getRecentlyViewed(): RecentHotel[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.slice(0, MAX_RECENT);
    }
    return [];
  } catch {
    return [];
  }
}

export function saveRecentlyViewed(hotel: RecentHotel): void {
  if (typeof window === 'undefined') return;
  if (!hotel || !hotel.id || !hotel.name) return;

  try {
    const existing = getRecentlyViewed();
    const filtered = existing.filter(
      (h) => h.id !== hotel.id && h.url !== hotel.url
    );
    const updated = [hotel, ...filtered].slice(0, MAX_RECENT);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    window.dispatchEvent(new CustomEvent('hwb_recent_updated'));
  } catch {
    // Gracefully handle storage disabled/blocked
  }
}

export function clearRecentlyViewed(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('hwb_recent_updated'));
  } catch {
    // Gracefully handle storage disabled/blocked
  }
}
