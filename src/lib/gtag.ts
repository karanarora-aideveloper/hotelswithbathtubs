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



/**
 * Check if current user has opted out or flagged internal traffic via /admin
 */
export const isGAExcluded = (): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem('ignore_ga') === 'true';
  } catch {
    return false;
  }
};

/**
 * Set GA disable flag on window for internal traffic exclusion
 */
export const applyGAExclusion = (gaId?: string) => {
  if (typeof window === 'undefined') return;
  const id = gaId || GA_MEASUREMENT_ID;
  if (!id) return;

  if (isGAExcluded()) {
    window[`ga-disable-${id}`] = true;
  } else {
    delete window[`ga-disable-${id}`];
  }
};

/**
 * Send raw event to GA4
 */
export const sendGA4Event = (eventName: string, params?: Record<string, any>) => {
  if (typeof window === 'undefined') return;

  if (isGAExcluded()) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[GA4 Blocked via ignore_ga] ${eventName}:`, params);
    }
    return;
  }

  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, params);
  } else if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push(['event', eventName, params]);
  }
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
  maxScrollPercent: number;
  lastVisibleSection: string;
  hotelsViewedCount: number;
  viewedHotelNames: Set<string>;
  hasConverted: boolean;
  conversionDetails?: {
    hotelName?: string;
    bookingSource?: string;
  };
  hadSearchZeroResults: boolean;
  lastFailedSearch?: string;
  hadFilterDeadEnd: boolean;
  lastFailedFilter?: string;
  hadRageClick: boolean;
  rageClickDetails?: string;
}

let currentSession: PageSessionState = {
  pagePath: '',
  pageType: 'unknown',
  startTime: Date.now(),
  maxScrollPercent: 0,
  lastVisibleSection: 'top',
  hotelsViewedCount: 0,
  viewedHotelNames: new Set<string>(),
  hasConverted: false,
  hadSearchZeroResults: false,
  hadFilterDeadEnd: false,
  hadRageClick: false,
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
  currentSession = {
    pagePath,
    pageType,
    country,
    city,
    startTime: Date.now(),
    maxScrollPercent: 0,
    lastVisibleSection: 'top',
    hotelsViewedCount: 0,
    viewedHotelNames: new Set<string>(),
    hasConverted: false,
    hadSearchZeroResults: false,
    hadFilterDeadEnd: false,
    hadRageClick: false,
  };
};

/**
 * Update maximum scroll depth reached on page
 */
export const updateMaxScroll = (percent: number) => {
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
  };

  sendGA4Event('hotel_booking_click', {
    hotel_name: params.hotelName,
    city_name: params.cityName || currentSession.city,
    country_name: params.countryName || currentSession.country,
    booking_source: params.bookingSource,
    destination_url: params.destinationUrl,
    time_to_click_seconds: Math.round((Date.now() - currentSession.startTime) / 1000),
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
export const dispatchUserChurn = () => {
  if (!currentSession.pagePath) return;

  const timeSpentSeconds = Math.max(1, Math.round((Date.now() - currentSession.startTime) / 1000));
  const scrollDepth = currentSession.maxScrollPercent;

  // Determine churn category
  let churnType:
    | 'converted_exit'
    | 'quick_bounce'
    | 'shallow_browse'
    | 'search_abandoned'
    | 'filter_dead_end'
    | 'engaged_no_click'
    | 'rage_click_churn'
    | 'standard_exit';

  if (currentSession.hasConverted) {
    churnType = 'converted_exit';
  } else if (currentSession.hadRageClick) {
    churnType = 'rage_click_churn';
  } else if (currentSession.hadFilterDeadEnd) {
    churnType = 'filter_dead_end';
  } else if (currentSession.hadSearchZeroResults) {
    churnType = 'search_abandoned';
  } else if (timeSpentSeconds < 10 && scrollDepth < 25) {
    churnType = 'quick_bounce';
  } else if (timeSpentSeconds < 30 && scrollDepth < 40) {
    churnType = 'shallow_browse';
  } else if (timeSpentSeconds >= 30 && scrollDepth >= 40) {
    churnType = 'engaged_no_click';
  } else {
    churnType = 'standard_exit';
  }

  sendGA4Event('user_churn', {
    churn_type: churnType,
    page_path: currentSession.pagePath,
    page_type: currentSession.pageType,
    country: currentSession.country || 'unknown',
    city: currentSession.city || 'unknown',
    time_spent_seconds: timeSpentSeconds,
    max_scroll_depth: scrollDepth,
    last_visible_section: currentSession.lastVisibleSection,
    hotels_viewed_count: currentSession.hotelsViewedCount,
    has_converted: currentSession.hasConverted,
    failed_search: currentSession.lastFailedSearch || '',
    failed_filter: currentSession.lastFailedFilter || '',
  });
};
