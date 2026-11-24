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
  | 'trip'
  | 'airbnb'
  | 'hotels_com'
  | 'vrbo'
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
 * Normalizes partner URLs/strings into one of the allowed partners:
 * 'booking' | 'agoda' | 'makemytrip' | 'cleartrip' | 'easemytrip' | 'expedia' | 'trip' | 'airbnb' | 'hotels_com' | 'vrbo' | 'other'.
 * Order matters: makemytrip/cleartrip/easemytrip contain "trip.com", so they are checked before Trip.com.
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
  if (lower.includes('expedia.') || lower === 'expedia') return 'expedia';
  if (lower.includes('trip.com') || lower === 'trip') return 'trip';
  if (lower.includes('airbnb.') || lower === 'airbnb') return 'airbnb';
  if (lower.includes('hotels.com')) return 'hotels_com';
  if (lower.includes('vrbo.com') || lower === 'vrbo') return 'vrbo';
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
  if (
    lower.includes('city') ||
    lower.includes('card') ||
    lower.includes('hub') ||
    lower.includes('wishlist') ||
    lower.includes('featured')
  ) {
    return 'city_card';
  }
  if (
    lower.includes('hotel') ||
    lower.includes('detail') ||
    lower.includes('wheretobook') ||
    lower.includes('analytics')
  ) {
    return 'hotel_page';
  }
  if (lower.includes('blog') || lower.includes('guide')) return 'blog';
  return 'other';
}

/**
 * Normalizes country strings/slugs to display names matching hotel data ("USA", "India", etc.).
 * Returns empty string if no country.
 */
export function formatCountryName(raw?: string): string {
  if (!raw || !raw.trim()) return '';
  const clean = raw.trim();
  const lower = clean.toLowerCase().replace(/[\s_]+/g, '-');
  if (lower === 'usa' || lower === 'united-states' || lower === 'us') return 'USA';
  if (lower === 'uk' || lower === 'united-kingdom' || lower === 'great-britain' || lower === 'gb') return 'UK';
  if (lower === 'uae' || lower === 'united-arab-emirates') return 'UAE';
  if (lower === 'india' || lower === 'in') return 'India';
  return clean
    .split(/[- ]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Normalizes city strings/slugs to display names matching hotel data ("Sedona", "Las Vegas", etc.).
 * Returns empty string if no city.
 */
export function formatCityName(raw?: string): string {
  if (!raw || !raw.trim()) return '';
  const clean = raw.trim();
  return clean
    .split(/[- ]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
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
    return { page_type: 'destination', country: formatCountryName(segments[0]), city: '' };
  }

  // e.g. /usa/sedona or /usa/sedona/jacuzzi
  if (segments.length === 2 || (segments.length === 3 && segments[2] === 'jacuzzi')) {
    return {
      page_type: 'destination',
      country: formatCountryName(segments[0]),
      city: formatCityName(segments[1]),
    };
  }

  // e.g. /usa/sedona/the-joy-sedona
  if (segments.length >= 3) {
    return {
      page_type: 'hotel',
      country: formatCountryName(segments[0]),
      city: formatCityName(segments[1]),
    };
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
 * page_type, country, city, hotel_name (when present), and visitor_country.
 * Country and city are always normalized to display names ("USA", "India", "Sedona")
 * or empty string when absent.
 */
function buildCoreParams(params?: Partial<CoreEventParams>): CoreEventParams {
  const route = getRouteContext();
  const visitor_country = params?.visitor_country ?? getVisitorCountry();

  const rawCountry = params?.country !== undefined ? params.country : route.country;
  const rawCity = params?.city !== undefined ? params.city : route.city;

  const country = formatCountryName(rawCountry);
  const city = formatCityName(rawCity);

  return {
    page_type: params?.page_type || route.page_type,
    country,
    city,
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
// THE GA4 EVENTS (10 funnel events + ui_click + scroll_depth)
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
  /** 'affiliate' when the link is wrapped in an affiliate network link, else 'direct' */
  link_type?: 'affiliate' | 'direct';
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
    link_type: params.link_type || 'direct',
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
  const core = buildCoreParams({ ...params, page_type: 'matchmaker', country: '', city: '' });
  sendGA4Event('matchmaker_start', core);
}

/**
 * 9. matchmaker_complete - Matchmaker results screen is shown with tailored matches.
 * Per spec, region is recorded in answers, and country is left empty.
 */
export function sendMatchmakerComplete(params: {
  answers: string;
  country?: string;
  city?: string;
}) {
  if (!shouldSendEvent()) return;
  const core = buildCoreParams({
    page_type: 'matchmaker',
    country: '',
    city: '',
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


// ==========================================
// TAP TRACKING: one event for every meaningful tap (ANALYTICS-TAPS1, 24 Nov 2026)
// ==========================================

export type UiElement =
  | 'hotel_card'
  | 'destination_link'
  | 'guide_link'
  | 'matchmaker_link'
  | 'internal_link'
  | 'outbound_link'
  | 'contact_link'
  | 'gallery'
  | 'button'
  | string;

export type UiSection = 'header' | 'footer' | 'breadcrumb' | 'main';

export interface UiClick {
  element: UiElement;
  section: UiSection;
  label: string;
  target: string;
}

function cleanLabel(raw: string | null | undefined): string {
  return (raw || '').replace(/\s+/g, ' ').trim().slice(0, 60);
}

/**
 * Works out what was tapped from the DOM. Returns null for taps we don't record:
 * empty space, form fields, and booking buttons (those send booking_click instead).
 * Reads only link addresses and visible labels, never anything a visitor typed.
 */
export function classifyClick(start: Element | null): UiClick | null {
  if (!start || typeof start.closest !== 'function') return null;
  if (start.closest('[data-track="off"]')) return null;

  const link = start.closest('a[href]') as HTMLAnchorElement | null;
  const tracked = start.closest('[data-track]') as HTMLElement | null;
  const button = start.closest('button, [role="button"], summary') as HTMLElement | null;
  if (!link && !tracked && !button) return null;

  const section: UiSection = start.closest('footer')
    ? 'footer'
    : start.closest('[aria-label*="readcrumb"]')
    ? 'breadcrumb'
    : start.closest('header')
    ? 'header'
    : 'main';

  if (link) {
    const href = link.getAttribute('href') || '';
    // Booking buttons go through /out and already send booking_click
    if (href.startsWith('/out?') || href.includes('/out?url=')) return null;
    const label = cleanLabel(link.getAttribute('aria-label') || link.textContent || link.getAttribute('title'));
    if (/^(mailto:|tel:)/i.test(href)) {
      return { element: 'contact_link', section, label, target: href.split(':')[0].toLowerCase() };
    }
    let url: URL;
    try {
      url = new URL(href, window.location.origin);
    } catch {
      return null;
    }
    if (url.origin !== window.location.origin) {
      return { element: 'outbound_link', section, label, target: url.hostname.replace(/^www\./, '') };
    }
    const path = url.pathname.replace(/\/+$/, '') || '/';
    const type = getRouteContext(path).page_type;
    const element: UiElement =
      type === 'hotel'
        ? 'hotel_card'
        : type === 'destination'
        ? 'destination_link'
        : type === 'blog'
        ? 'guide_link'
        : type === 'matchmaker'
        ? 'matchmaker_link'
        : 'internal_link';
    return { element, section, label, target: path };
  }

  if (tracked) {
    return {
      element: tracked.dataset.track || 'button',
      section,
      label: cleanLabel(tracked.dataset.trackLabel || button?.getAttribute('aria-label') || ''),
      target: '',
    };
  }

  const el = button as HTMLElement;
  // Skip buttons that only submit a form field the visitor typed into: the label is still safe, so keep them
  return {
    element: 'button',
    section,
    label: cleanLabel(el.getAttribute('aria-label') || el.getAttribute('title') || el.textContent),
    target: '',
  };
}

let lastUiKey = '';
let lastUiTime = 0;

/**
 * 11. ui_click - any meaningful tap that is not a booking button:
 * hotel cards, city/country links, guide links, header/footer links, outbound links, gallery, buttons.
 */
export function sendUiClick(click: UiClick) {
  if (!shouldSendEvent()) return;
  const key = `${click.element}|${click.section}|${click.target}|${click.label}`;
  const now = Date.now();
  if (key === lastUiKey && now - lastUiTime < 500) return;
  lastUiKey = key;
  lastUiTime = now;
  sendGA4Event('ui_click', { ...buildCoreParams(), ...click });
}

/**
 * 12. scroll_depth - how far a visitor scrolls on a hotel page (25, 50, 75, 90 percent; once each per page).
 */
export function sendScrollDepth(percent: number) {
  if (!shouldSendEvent()) return;
  sendGA4Event('scroll_depth', { ...buildCoreParams(), percent });
}
