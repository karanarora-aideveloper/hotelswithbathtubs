'use client';

import { sendGA4Event } from '@/lib/gtag';
import { isUserExcluded } from '@/lib/exclusion';
import { hasAnalyticsConsent } from '@/lib/consent';

export type PageType = 'home' | 'destination' | 'hotel' | 'blog' | 'matchmaker' | 'other';

export type BookingPartner =
  | 'booking'
  | 'agoda'
  | 'makemytrip'
  | 'cleartrip'
  | 'easemytrip'
  | 'expedia'
  | 'other';

export type BookingPlacement =
  | 'city_card'
  | 'hotel_page'
  | 'matchmaker'
  | 'blog'
  | 'other';

export interface CoreEventParams {
  page_type: PageType;
  country: string;
  city: string;
  hotel_name?: string;
  visitor_country?: string;
  [key: string]: unknown;
}

/**
 * Normalizes partner URLs/strings into one of the 7 allowed partners:
 * 'booking' | 'agoda' | 'makemytrip' | 'cleartrip' | 'easemytrip' | 'expedia' | 'other'
 */
export function normalizePartner(urlOrName?: string): BookingPartner {
  if (!urlOrName) return 'other';
  const lower = urlOrName.toLowerCase();
  if (lower.includes('booking.com') || lower === 'booking') return 'booking';
  if (lower.includes('agoda.com') || lower === 'agoda') return 'agoda';
  if (
    lower.includes('makemytrip.com') ||
    lower.includes('linkredirect.in') ||
    lower.includes('ekaro.in') ||
    lower === 'makemytrip' ||
    lower === 'mmt'
  ) {
    return 'makemytrip';
  }
  if (lower.includes('cleartrip.com') || lower === 'cleartrip') return 'cleartrip';
  if (lower.includes('easemytrip.com') || lower === 'easemytrip' || lower === 'emt') return 'easemytrip';
  if (lower.includes('expedia.com') || lower === 'expedia') return 'expedia';
  return 'other';
}

/**
 * Normalizes placement strings into one of the 5 allowed placements:
 * 'city_card' | 'hotel_page' | 'matchmaker' | 'blog' | 'other'
 */
export function normalizePlacement(sourceOrPlacement?: string): BookingPlacement {
  if (!sourceOrPlacement) return 'other';
  const lower = sourceOrPlacement.toLowerCase();
  if (lower.includes('matchmaker')) return 'matchmaker';
  if (lower.includes('city') || lower.includes('card')) return 'city_card';
  if (lower.includes('hotel') || lower.includes('detail')) return 'hotel_page';
  if (lower.includes('blog')) return 'blog';
  return 'other';
}

/**
 * Automatically infers page_type, country, and city from window.location if not explicitly provided
 */
export function getRouteContext(pathname?: string): {
  page_type: PageType;
  country: string;
  city: string;
} {
  const path = pathname || (typeof window !== 'undefined' ? window.location.pathname : '');
  const segments = path.split('/').filter(Boolean);

  if (segments.length === 0) {
    return { page_type: 'home', country: '', city: '' };
  }

  if (segments[0] === 'matchmaker') {
    return { page_type: 'matchmaker', country: '', city: '' };
  }

  if (segments[0] === 'blog') {
    return { page_type: 'blog', country: '', city: '' };
  }

  // e.g. /usa or /india
  if (segments.length === 1) {
    return { page_type: 'destination', country: segments[0], city: '' };
  }

  // e.g. /usa/sedona or /usa/sedona/jacuzzi
  if (segments.length === 2 || (segments.length === 3 && segments[2] === 'jacuzzi')) {
    return { page_type: 'destination', country: segments[0], city: segments[1] };
  }

  // e.g. /usa/sedona/the-joy-sedona
  if (segments.length >= 3) {
    return { page_type: 'hotel', country: segments[0], city: segments[1] };
  }

  return { page_type: 'other', country: '', city: '' };
}

/**
 * Safely reads the visitor country if available (from localStorage or preliminary geo)
 */
export function getVisitorCountry(): string {
  if (typeof window === 'undefined') return '';
  try {
    const saved = localStorage.getItem('hwb_country');
    if (saved && saved.trim() !== '') return saved.trim();
  } catch {}
  return '';
}

/**
 * Combines core parameters for all GA4 events:
 * page_type, country, city, hotel_name (when present), and visitor_country
 */
function buildCoreParams(params?: Partial<CoreEventParams>): CoreEventParams {
  const route = getRouteContext();
  const visitor_country = params?.visitor_country ?? getVisitorCountry();

  return {
    page_type: params?.page_type || route.page_type,
    country: params?.country ?? route.country,
    city: params?.city ?? route.city,
    ...(params?.hotel_name ? { hotel_name: params.hotel_name } : {}),
    ...(visitor_country ? { visitor_country } : {}),
  };
}

/**
 * Checks consent and exclusion before dispatching
 */
function shouldSendEvent(): boolean {
  if (typeof window === 'undefined') return false;
  if (isUserExcluded()) return false;
  if (!hasAnalyticsConsent()) return false;
  return true;
}

// ==========================================
// THE 10 GA4 STREAMLINED EVENTS
// ==========================================

let lastPageViewPath = '';
let lastPageViewTime = 0;

/**
 * 1. page_view - GA4 baseline navigation (fires on route load/change)
 */
export function sendPageView(params?: Partial<CoreEventParams> & { page_location?: string; page_path?: string; page_title?: string }) {
  if (!shouldSendEvent()) return;
  const path = params?.page_path || (typeof window !== 'undefined' ? window.location.pathname : '');
  const now = Date.now();
  if (path === lastPageViewPath && now - lastPageViewTime < 250) return;
  lastPageViewPath = path;
  lastPageViewTime = now;

  const core = buildCoreParams(params);
  const payload = {
    ...core,
    page_location: params?.page_location || (typeof window !== 'undefined' ? window.location.href : ''),
    page_path: path,
    page_title: params?.page_title || (typeof document !== 'undefined' ? document.title : ''),
  };
  sendGA4Event('page_view', payload);
}

let lastDestKey = '';
let lastDestTime = 0;

/**
 * 2. view_destination - A city or country page loads
 */
export function sendViewDestination(params?: Partial<CoreEventParams>) {
  if (!shouldSendEvent()) return;
  const key = `${params?.country || ''}:${params?.city || ''}`;
  const now = Date.now();
  if (key === lastDestKey && now - lastDestTime < 250) return;
  lastDestKey = key;
  lastDestTime = now;

  const core = buildCoreParams({ ...params, page_type: 'destination' });
  sendGA4Event('view_destination', core);
}

let lastHotelKey = '';
let lastHotelTime = 0;

/**
 * 3. view_hotel - A hotel page loads
 */
export function sendViewHotel(params: Partial<CoreEventParams> & { hotel_name: string }) {
  if (!shouldSendEvent()) return;
  const key = `${params?.hotel_name || ''}:${params?.country || ''}:${params?.city || ''}`;
  const now = Date.now();
  if (key === lastHotelKey && now - lastHotelTime < 250) return;
  lastHotelKey = key;
  lastHotelTime = now;

  const core = buildCoreParams({ ...params, page_type: 'hotel' });
  sendGA4Event('view_hotel', core);
}

/**
 * 4. booking_click - Any booking-site partner button is clicked (key conversion event)
 */
export function sendBookingClick(params: {
  partner: BookingPartner | string;
  placement: BookingPlacement | string;
  hotel_name?: string;
  country?: string;
  city?: string;
  visitor_country?: string;
}) {
  if (!shouldSendEvent()) return;
  const core = buildCoreParams({
    hotel_name: params.hotel_name,
    country: params.country,
    city: params.city,
    visitor_country: params.visitor_country,
  });
  const payload = {
    ...core,
    partner: normalizePartner(params.partner),
    placement: normalizePlacement(params.placement),
  };
  sendGA4Event('booking_click', payload);
}

/**
 * 5. search - A search result is chosen, or a search yields 0 results
 */
export function sendSearch(params: {
  term: string;
  results_count: number;
  country?: string;
  city?: string;
}) {
  if (!shouldSendEvent()) return;
  const core = buildCoreParams({
    country: params.country,
    city: params.city,
  });
  const payload = {
    ...core,
    term: params.term,
    results_count: params.results_count,
  };
  sendGA4Event('search', payload);
}

/**
 * 6. filter_used - A filter pill or sort option is changed
 */
export function sendFilterUsed(params: {
  filter: string;
  results_count: number;
  country?: string;
  city?: string;
}) {
  if (!shouldSendEvent()) return;
  const core = buildCoreParams({
    country: params.country,
    city: params.city,
  });
  const payload = {
    ...core,
    filter: params.filter,
    results_count: params.results_count,
  };
  sendGA4Event('filter_used', payload);
}

/**
 * 7. wishlist_add - A hotel heart/favorite is toggled ON
 */
export function sendWishlistAdd(params: {
  hotel_name: string;
  country?: string;
  city?: string;
}) {
  if (!shouldSendEvent()) return;
  const core = buildCoreParams({
    hotel_name: params.hotel_name,
    country: params.country,
    city: params.city,
  });
  sendGA4Event('wishlist_add', core);
}

/**
 * 8. matchmaker_start - The first matchmaker quiz answer is tapped
 */
export function sendMatchmakerStart(params?: Partial<CoreEventParams>) {
  if (!shouldSendEvent()) return;
  const core = buildCoreParams({ ...params, page_type: 'matchmaker' });
  sendGA4Event('matchmaker_start', core);
}

/**
 * 9. matchmaker_complete - Matchmaker results screen is shown with tailored matches
 */
export function sendMatchmakerComplete(params: {
  answers: string;
  country?: string;
  city?: string;
}) {
  if (!shouldSendEvent()) return;
  const core = buildCoreParams({
    page_type: 'matchmaker',
    country: params.country,
    city: params.city,
  });
  const payload = {
    ...core,
    answers: params.answers,
  };
  sendGA4Event('matchmaker_complete', payload);
}

/**
 * 10. page_not_found - 404 page is rendered
 */
export function sendPageNotFound(params: {
  path: string;
  referrer?: string;
}) {
  if (!shouldSendEvent()) return;
  const core = buildCoreParams({ page_type: 'other' });
  const payload = {
    ...core,
    path: params.path,
    referrer: params.referrer || '',
  };
  sendGA4Event('page_not_found', payload);
}
