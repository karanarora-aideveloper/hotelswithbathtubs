let runtimeGAId = '';

export const setRuntimeGAId = (id: string) => {
  if (id) runtimeGAId = id;
};

export const getGAId = (): string => {
  return (
    runtimeGAId ||
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ||
    process.env.NEXT_PUBLIC_GA_ID ||
    ''
  );
};

export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ||
  process.env.NEXT_PUBLIC_GA_ID ||
  '';

import { isUserExcluded } from '@/lib/exclusion';
import posthog from 'posthog-js';
import {
  getUserRecurrenceData,
  recordSessionRecurrenceUpdate,
} from '@/lib/userRecurrence';

/**
 * Check if current user has opted out or flagged internal traffic via /admin or ?exclude=true
 */
export const isGAExcluded = (): boolean => {
  return isUserExcluded();
};

/**
 * Set GA disable flag on window for internal traffic exclusion
 */
export const applyGAExclusion = (gaId?: string) => {
  if (typeof window === 'undefined') return;
  const id = gaId || GA_MEASUREMENT_ID;

  if (isGAExcluded()) {
    if (id) window[`ga-disable-${id}`] = true;
    window['ga-disable-G-TETR30WPYM'] = true;
    window['ga-disable-G-2VDZWWBGD3'] = true;
  } else {
    if (id) delete window[`ga-disable-${id}`];
    delete window['ga-disable-G-TETR30WPYM'];
    delete window['ga-disable-G-2VDZWWBGD3'];
  }
};

/**
 * Send event to GA4 and PostHog in lockstep with beacon transport for exit reliability
 */
export const sendGA4Event = (eventName: string, params?: Record<string, any>) => {
  if (typeof window === 'undefined') return;

  if (isGAExcluded()) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Analytics Blocked via Exclusion] ${eventName}:`, params);
    }
    return;
  }

  // 1. Google Analytics 4 via dataLayer / gtag
  const eventParams = { ...params, transport_type: 'beacon' };
  
  if (typeof (window as any).gtag === 'function') {
    (window as any).gtag('event', eventName, eventParams);
  } else if (Array.isArray((window as any).dataLayer)) {
    (window as any).dataLayer.push(['event', eventName, eventParams]);
  }

  // 2. PostHog Event Stream
  try {
    if (eventName !== 'page_view') {
      if (eventName === 'user_churn') {
        posthog.capture('user_churn', {
          ...params,
          $set: {
            last_churn_type: params?.churn_type,
            last_exit_link: params?.last_clicked_url,
            last_clicked_text: params?.last_clicked_text,
            last_max_scroll: params?.max_scroll_depth,
            last_time_spent_seconds: params?.time_spent_seconds,
            last_active_time_seconds: params?.active_time_seconds,
          },
        });
      } else if (eventName === 'hotel_booking_click') {
        posthog.capture('hotel_booking_click', {
          ...params,
          $set: {
            has_converted: true,
            last_booked_hotel: params?.hotel_name || params?.hotelName,
            last_booking_source: params?.booking_source || params?.bookingSource,
            last_destination_url: params?.destination_url || params?.destinationUrl,
          },
        });
      } else {
        posthog.capture(eventName, params);
      }
    }
  } catch (_) {}
};

// ==========================================
// CHURN & PAIN-POINT STATE MACHINE
// Keeps running context for the current page session
// ==========================================

export interface PageSessionState {
  pagePath: string;
  pageType: string;
  country?: string;
  city?: string;
  startTime: number;
  lastActiveTime: number;
  activeTimeSeconds: number;
  maxScrollPercent: number;
  lastVisibleSection: string;
  hotelsViewedCount: number;
  viewedHotelNames: Set<string>;
  hasConverted: boolean;
  conversionDetails?: {
    hotelName?: string;
    bookingSource?: string;
    destinationUrl?: string;
  };
  lastClickedUrl?: string;
  lastClickedText?: string;
  lastClickedType?: string;
  timeToLastClickSeconds?: number;
  exitTrigger: 'link_click' | 'tab_close_or_nav' | 'idle_timeout' | 'unknown';
  hadSearchZeroResults: boolean;
  lastFailedSearch?: string;
  hadFilterDeadEnd: boolean;
  lastFailedFilter?: string;
  hadRageClick: boolean;
  rageClickDetails?: string;
  churnDispatched: boolean;
}

let currentSession: PageSessionState = {
  pagePath: '',
  pageType: 'unknown',
  startTime: Date.now(),
  lastActiveTime: Date.now(),
  activeTimeSeconds: 0,
  maxScrollPercent: 0,
  lastVisibleSection: 'top',
  hotelsViewedCount: 0,
  viewedHotelNames: new Set<string>(),
  hasConverted: false,
  exitTrigger: 'unknown',
  hadSearchZeroResults: false,
  hadFilterDeadEnd: false,
  hadRageClick: false,
  churnDispatched: false,
};

/**
 * Reset and initialize session state for a new route
 */
export const initPageSession = (
  pagePath: string,
  pageType: string,
  country?: string,
  city?: string
) => {
  const now = Date.now();
  currentSession = {
    pagePath,
    pageType,
    country,
    city,
    startTime: now,
    lastActiveTime: now,
    activeTimeSeconds: 0,
    maxScrollPercent: 0,
    lastVisibleSection: 'top',
    hotelsViewedCount: 0,
    viewedHotelNames: new Set<string>(),
    hasConverted: false,
    exitTrigger: 'unknown',
    hadSearchZeroResults: false,
    hadFilterDeadEnd: false,
    hadRageClick: false,
    churnDispatched: false,
  };
};

/**
 * Record active interaction heartbeat (mouse, scroll, keypress, touch)
 */
export const recordActiveHeartbeat = () => {
  const now = Date.now();
  const elapsedSinceLastActive = (now - currentSession.lastActiveTime) / 1000;
  // If active within last 5 seconds, increment active time
  if (elapsedSinceLastActive <= 5) {
    currentSession.activeTimeSeconds += Math.round(elapsedSinceLastActive);
  }
  currentSession.lastActiveTime = now;
};

/**
 * Categorize clicked link target
 */
export const categorizeLink = (href: string): string => {
  if (!href) return 'unknown';
  const lower = href.toLowerCase();
  if (
    lower.includes('agoda.com') ||
    lower.includes('makemytrip.com') ||
    lower.includes('booking.com') ||
    lower.includes('trip.com') ||
    lower.includes('airbnb') ||
    lower.includes('trivago') ||
    lower.includes('tripadvisor')
  ) {
    return 'outbound_affiliate';
  }
  if (lower.includes('pinterest.com') || lower.includes('facebook') || lower.includes('instagram') || lower.includes('twitter')) {
    return 'external_social';
  }
  if (lower.startsWith('http') && !lower.includes('hotelswithbathtubs.com')) {
    return 'external_outbound';
  }
  if (lower.includes('/blog')) {
    return 'internal_blog';
  }
  if (lower.split('/').filter(Boolean).length >= 3) {
    return 'internal_hotel';
  }
  if (lower.split('/').filter(Boolean).length === 2) {
    return 'internal_city';
  }
  if (lower === '/' || lower.split('/').filter(Boolean).length === 1) {
    return 'internal_nav';
  }
  return 'internal_other';
};

/**
 * Record any link or button clicked by the user
 */
export const recordUserClick = (
  url: string,
  text: string,
  type?: string
) => {
  currentSession.lastClickedUrl = url;
  currentSession.lastClickedText = (text || '').trim().slice(0, 80);
  currentSession.lastClickedType = type || categorizeLink(url);
  currentSession.timeToLastClickSeconds = Math.max(1, Math.round((Date.now() - currentSession.startTime) / 1000));
  currentSession.exitTrigger = 'link_click';
  recordActiveHeartbeat();
};

/**
 * Update maximum scroll depth reached on page
 */
export const updateMaxScroll = (percent: number) => {
  recordActiveHeartbeat();
  if (percent > currentSession.maxScrollPercent) {
    currentSession.maxScrollPercent = Math.min(100, Math.round(percent));
  }
};

/**
 * Update last visible section or hotel card
 */
export const updateLastVisibleSection = (sectionName: string) => {
  currentSession.lastVisibleSection = sectionName;
};

/**
 * Record a hotel card impression in viewport
 */
export const recordHotelImpression = (
  hotelName: string,
  position: number,
  hasPrice: boolean
) => {
  if (!currentSession.viewedHotelNames.has(hotelName)) {
    currentSession.viewedHotelNames.add(hotelName);
    currentSession.hotelsViewedCount = currentSession.viewedHotelNames.size;
    currentSession.lastVisibleSection = `hotel_card_${position}_${hotelName.slice(0, 20)}`;

    sendGA4Event('hotel_card_view', {
      hotel_name: hotelName,
      hotel_position: position,
      has_price: hasPrice,
      city: currentSession.city,
      country: currentSession.country,
      page_path: currentSession.pagePath,
    });
  }
};

/**
 * Record outbound booking click (Marks session as successfully converted, not churned)
 */
export const recordBookingConversion = (params: {
  hotelName?: string;
  cityName?: string;
  countryName?: string;
  bookingSource?: string;
  destinationUrl?: string;
}) => {
  currentSession.hasConverted = true;
  currentSession.conversionDetails = {
    hotelName: params.hotelName,
    bookingSource: params.bookingSource,
    destinationUrl: params.destinationUrl,
  };
  currentSession.lastClickedUrl = params.destinationUrl;
  currentSession.lastClickedText = `Book on ${params.bookingSource || 'Partner'}`;
  currentSession.lastClickedType = 'outbound_affiliate';
  currentSession.timeToLastClickSeconds = Math.max(1, Math.round((Date.now() - currentSession.startTime) / 1000));
  currentSession.exitTrigger = 'link_click';

  sendGA4Event('hotel_booking_click', {
    hotel_name: params.hotelName,
    city_name: params.cityName || currentSession.city,
    country_name: params.countryName || currentSession.country,
    booking_source: params.bookingSource,
    destination_url: params.destinationUrl,
    time_to_click_seconds: currentSession.timeToLastClickSeconds,
    max_scroll_depth: currentSession.maxScrollPercent,
    hotels_viewed_count: currentSession.hotelsViewedCount,
  });
};

/**
 * Record search with 0 results (Crucial User Pain Point)
 */
export const recordSearchZeroResults = (searchTerm: string, source: string) => {
  currentSession.hadSearchZeroResults = true;
  currentSession.lastFailedSearch = searchTerm;

  sendGA4Event('search_zero_results', {
    search_term: searchTerm,
    search_source: source,
    page_path: currentSession.pagePath,
    page_type: currentSession.pageType,
  });
};

/**
 * Record search query abandoned without selection
 */
export const recordSearchAbandoned = (searchTerm: string, charactersTyped: number) => {
  sendGA4Event('search_abandoned', {
    search_term: searchTerm,
    chars_count: charactersTyped,
    page_path: currentSession.pagePath,
  });
};

/**
 * Record successful destination search selection
 */
export const recordSearchSelection = (city: string, country: string, query: string) => {
  sendGA4Event('search_selection', {
    selected_city: city,
    selected_country: country,
    search_term: query,
    page_path: currentSession.pagePath,
  });
};

/**
 * Record filter resulting in 0 hotels (Crucial User Pain Point)
 */
export const recordFilterDeadEnd = (
  filterType: string,
  filterQuery: string,
  cityName: string
) => {
  currentSession.hadFilterDeadEnd = true;
  currentSession.lastFailedFilter = `${filterType}:${filterQuery}`;

  sendGA4Event('filter_dead_end', {
    filter_type: filterType,
    filter_query: filterQuery,
    city_name: cityName,
    page_path: currentSession.pagePath,
  });
};

/**
 * Record filter reset after dead end
 */
export const recordFilterReset = (cityName: string) => {
  sendGA4Event('filter_reset', {
    city_name: cityName,
    page_path: currentSession.pagePath,
  });
};

/**
 * Record filter change
 */
export const recordFilterChange = (filterType: string, resultCount: number) => {
  sendGA4Event('filter_applied', {
    filter_type: filterType,
    result_count: resultCount,
    city_name: currentSession.city,
    page_path: currentSession.pagePath,
  });
};

/**
 * Record rage click (Rapid clicks indicating user frustration / pain point)
 */
export const recordRageClick = (elementTag: string, elementText: string, elementClass: string) => {
  currentSession.hadRageClick = true;
  currentSession.rageClickDetails = `${elementTag}:${elementText.slice(0, 30)}`;

  sendGA4Event('rage_click', {
    element_tag: elementTag,
    element_text: elementText.slice(0, 50),
    element_class: elementClass.slice(0, 50),
    page_path: currentSession.pagePath,
    page_type: currentSession.pageType,
  });
};

/**
 * Record exit intent (Desktop user moving mouse toward close/tab bar)
 */
export const recordExitIntent = (timeSpentSeconds: number) => {
  sendGA4Event('exit_intent', {
    time_spent_seconds: timeSpentSeconds,
    max_scroll_depth: currentSession.maxScrollPercent,
    last_visible_section: currentSession.lastVisibleSection,
    last_clicked_url: currentSession.lastClickedUrl || 'none',
    page_path: currentSession.pagePath,
    page_type: currentSession.pageType,
    city: currentSession.city,
    country: currentSession.country,
  });
};

/**
 * Track 404 error hit
 */
export const record404Error = (path: string, referrer: string) => {
  sendGA4Event('page_not_found', {
    missing_path: path,
    referrer: referrer || 'direct',
  });
};

/**
 * Evaluate session outcome and dispatch user_churn event upon exit/unload
 */
export const dispatchUserChurn = (explicitExitTrigger?: 'link_click' | 'tab_close_or_nav') => {
  if (!currentSession.pagePath || currentSession.churnDispatched) return;
  currentSession.churnDispatched = true;

  if (explicitExitTrigger) {
    currentSession.exitTrigger = explicitExitTrigger;
  } else if (currentSession.exitTrigger === 'unknown') {
    currentSession.exitTrigger = 'tab_close_or_nav';
  }

  const now = Date.now();
  const timeSpentSeconds = Math.max(1, Math.round((now - currentSession.startTime) / 1000));
  const activeTimeSeconds = Math.max(1, Math.min(timeSpentSeconds, currentSession.activeTimeSeconds || Math.round(timeSpentSeconds * 0.75)));
  const idleTimeSeconds = Math.max(0, timeSpentSeconds - activeTimeSeconds);
  const scrollDepth = currentSession.maxScrollPercent;

  // Read anonymous user retention / recurrence data
  const recurrence = getUserRecurrenceData();

  // Determine granular churn category
  let churnType:
    | 'converted_exit'
    | 'quick_bounce'
    | 'shallow_browse'
    | 'search_abandoned'
    | 'filter_dead_end'
    | 'engaged_no_click'
    | 'rage_click_churn'
    | 'outbound_exit_unconverted'
    | 'standard_exit';

  if (currentSession.hasConverted) {
    churnType = 'converted_exit';
  } else if (currentSession.hadRageClick) {
    churnType = 'rage_click_churn';
  } else if (currentSession.hadFilterDeadEnd) {
    churnType = 'filter_dead_end';
  } else if (currentSession.hadSearchZeroResults) {
    churnType = 'search_abandoned';
  } else if (currentSession.lastClickedType === 'external_social' || currentSession.lastClickedType === 'external_outbound') {
    churnType = 'outbound_exit_unconverted';
  } else if (timeSpentSeconds < 8 && scrollDepth < 20) {
    churnType = 'quick_bounce';
  } else if (timeSpentSeconds < 25 && scrollDepth < 35) {
    churnType = 'shallow_browse';
  } else if (timeSpentSeconds >= 25 && scrollDepth >= 35) {
    churnType = 'engaged_no_click';
  } else {
    churnType = 'standard_exit';
  }

  // Update persistent user retention stats
  recordSessionRecurrenceUpdate({
    timeSpentSeconds,
    hotelsViewedCount: currentSession.hotelsViewedCount,
    converted: currentSession.hasConverted,
    churnType,
    lastClickedUrl: currentSession.lastClickedUrl,
  });

  // Construct comprehensive churn telemetry payload
  const churnPayload = {
    churn_type: churnType,
    page_path: currentSession.pagePath,
    page_type: currentSession.pageType,
    country: currentSession.country || 'unknown',
    city: currentSession.city || 'unknown',
    // Time Analytics
    time_spent_seconds: timeSpentSeconds,
    active_time_seconds: activeTimeSeconds,
    idle_time_seconds: idleTimeSeconds,
    time_to_last_click_seconds: currentSession.timeToLastClickSeconds || 0,
    // Click & Exit Link Telemetry
    last_clicked_url: currentSession.lastClickedUrl || 'none',
    last_clicked_text: currentSession.lastClickedText || 'none',
    last_clicked_type: currentSession.lastClickedType || 'none',
    exit_trigger: currentSession.exitTrigger,
    // Engagement Depth
    max_scroll_depth: scrollDepth,
    last_visible_section: currentSession.lastVisibleSection,
    hotels_viewed_count: currentSession.hotelsViewedCount,
    has_converted: currentSession.hasConverted,
    // User Recurrence & Cohort Telemetry
    user_type: recurrence.isReturningUser ? 'returning' : 'new',
    session_number: recurrence.sessionNumber,
    days_since_first_visit: recurrence.daysSinceFirstVisit,
    days_since_last_visit: recurrence.daysSinceLastVisit,
    has_ever_converted: recurrence.hasEverConverted || currentSession.hasConverted,
    lifetime_time_spent_seconds: recurrence.lifetimeTimeSpentSeconds + timeSpentSeconds,
    // Pain point diagnostics
    failed_search: currentSession.lastFailedSearch || '',
    failed_filter: currentSession.lastFailedFilter || '',
  };

  sendGA4Event('user_churn', churnPayload);
};
