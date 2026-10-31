'use client';

/**
 * User Recurrence & Retention Engine for Hotels With Bathtubs
 *
 * Tracks user sessions, repeat visits, churn history, and lifetime engagement
 * without collecting any Personally Identifiable Information (PII).
 *
 * In the UK, EEA, and Switzerland, non-essential analytics storage is blocked
 * until the visitor explicitly accepts cookie consent.
 */

import { hasAnalyticsConsent, clearAnalyticsStorage, STORAGE_KEYS } from './consent';

export { STORAGE_KEYS };

export interface UserRecurrenceData {
  userId: string;
  isReturningUser: boolean;
  sessionNumber: number;
  daysSinceFirstVisit: number;
  daysSinceLastVisit: number;
  lifetimeTimeSpentSeconds: number;
  lifetimeHotelsViewed: number;
  lifetimeConversions: number;
  hasEverConverted: boolean;
  previousChurnType?: string;
}

// Generate an anonymous unique visitor ID
function generateAnonymousId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `hwb_${crypto.randomUUID()}`;
  }
  return `hwb_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

let cachedRecurrence: UserRecurrenceData | null = null;
let sessionInitialized = false;

export function resetRecurrenceCache(): void {
  cachedRecurrence = null;
  sessionInitialized = false;
}

/**
 * Initializes or retrieves user recurrence status for the current session.
 * A new session is counted if > 30 minutes have elapsed since the user was last active.
 *
 * In consent-required regions (UK/EU/CH), if consent is not granted,
 * returns an in-memory anonymous object without writing to localStorage or cookies.
 */
export function getUserRecurrenceData(
  countryCode?: string,
  explicitConsent?: string
): UserRecurrenceData {
  if (typeof window === 'undefined') {
    return {
      userId: 'anonymous_ssr',
      isReturningUser: false,
      sessionNumber: 1,
      daysSinceFirstVisit: 0,
      daysSinceLastVisit: 0,
      lifetimeTimeSpentSeconds: 0,
      lifetimeHotelsViewed: 0,
      lifetimeConversions: 0,
      hasEverConverted: false,
    };
  }

  // Check consent for UK/EU/CH
  if (!hasAnalyticsConsent(countryCode, explicitConsent)) {
    return {
      userId: 'anonymous_unconsented',
      isReturningUser: false,
      sessionNumber: 1,
      daysSinceFirstVisit: 0,
      daysSinceLastVisit: 0,
      lifetimeTimeSpentSeconds: 0,
      lifetimeHotelsViewed: 0,
      lifetimeConversions: 0,
      hasEverConverted: false,
    };
  }

  if (cachedRecurrence && sessionInitialized) {
    return cachedRecurrence;
  }

  const now = Date.now();

  try {
    // 1. Visitor ID
    let userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
    if (!userId) {
      userId = generateAnonymousId();
      localStorage.setItem(STORAGE_KEYS.USER_ID, userId);
      // Also mirror to cookie for cross-subdomain / SSR availability
      document.cookie = `${STORAGE_KEYS.USER_ID}=${userId}; path=/; max-age=31536000; SameSite=Lax`;
    }

    // 2. Timestamps
    const firstSeenStr = localStorage.getItem(STORAGE_KEYS.FIRST_SEEN);
    const firstSeen = firstSeenStr ? parseInt(firstSeenStr, 10) : now;
    if (!firstSeenStr) {
      localStorage.setItem(STORAGE_KEYS.FIRST_SEEN, now.toString());
    }

    const lastSeenStr = localStorage.getItem(STORAGE_KEYS.LAST_SEEN);
    const lastSeen = lastSeenStr ? parseInt(lastSeenStr, 10) : now;

    // 3. Session Detection (New session if > 30 minutes since last active)
    const SESSION_TIMEOUT_MS = 30 * 60 * 1000;
    let sessionCount = parseInt(localStorage.getItem(STORAGE_KEYS.SESSION_COUNT) || '0', 10);
    const isNewSession = !lastSeenStr || (now - lastSeen) > SESSION_TIMEOUT_MS;

    if (isNewSession && !sessionInitialized) {
      sessionCount += 1;
      localStorage.setItem(STORAGE_KEYS.SESSION_COUNT, sessionCount.toString());
    } else if (sessionCount === 0) {
      sessionCount = 1;
      localStorage.setItem(STORAGE_KEYS.SESSION_COUNT, '1');
    }

    // 4. Lifetime Stats
    const lifetimeTime = parseInt(localStorage.getItem(STORAGE_KEYS.LIFETIME_TIME) || '0', 10);
    const lifetimeHotels = parseInt(localStorage.getItem(STORAGE_KEYS.LIFETIME_HOTELS) || '0', 10);
    const lifetimeConversions = parseInt(localStorage.getItem(STORAGE_KEYS.LIFETIME_CONVERSIONS) || '0', 10);
    const hasConverted = localStorage.getItem(STORAGE_KEYS.HAS_CONVERTED) === 'true';
    const previousChurnType = localStorage.getItem(STORAGE_KEYS.LAST_CHURN_TYPE) || undefined;

    // Calculate elapsed day offsets
    const MS_PER_DAY = 24 * 60 * 60 * 1000;
    const daysSinceFirstVisit = Math.floor(Math.max(0, now - firstSeen) / MS_PER_DAY);
    const daysSinceLastVisit = Math.floor(Math.max(0, now - lastSeen) / MS_PER_DAY);

    // Update last seen heartbeat
    localStorage.setItem(STORAGE_KEYS.LAST_SEEN, now.toString());
    sessionInitialized = true;

    cachedRecurrence = {
      userId,
      isReturningUser: sessionCount > 1,
      sessionNumber: sessionCount,
      daysSinceFirstVisit,
      daysSinceLastVisit,
      lifetimeTimeSpentSeconds: lifetimeTime,
      lifetimeHotelsViewed: lifetimeHotels,
      lifetimeConversions,
      hasEverConverted: hasConverted,
      previousChurnType,
    };

    return cachedRecurrence;
  } catch {
    return {
      userId: 'fallback_anonymous',
      isReturningUser: false,
      sessionNumber: 1,
      daysSinceFirstVisit: 0,
      daysSinceLastVisit: 0,
      lifetimeTimeSpentSeconds: 0,
      lifetimeHotelsViewed: 0,
      lifetimeConversions: 0,
      hasEverConverted: false,
    };
  }
}

/**
 * Updates cumulative lifetime metrics and saves churn outcome.
 */
export function recordSessionRecurrenceUpdate({
  timeSpentSeconds,
  hotelsViewedCount,
  converted,
  churnType,
  lastClickedUrl,
}: {
  timeSpentSeconds: number;
  hotelsViewedCount: number;
  converted: boolean;
  churnType?: string;
  lastClickedUrl?: string;
}) {
  if (typeof window === 'undefined') return;
  if (!hasAnalyticsConsent()) return;

  try {
    const currentLifetime = parseInt(localStorage.getItem(STORAGE_KEYS.LIFETIME_TIME) || '0', 10);
    localStorage.setItem(STORAGE_KEYS.LIFETIME_TIME, (currentLifetime + timeSpentSeconds).toString());

    if (hotelsViewedCount > 0) {
      const currentHotels = parseInt(localStorage.getItem(STORAGE_KEYS.LIFETIME_HOTELS) || '0', 10);
      localStorage.setItem(STORAGE_KEYS.LIFETIME_HOTELS, (currentHotels + hotelsViewedCount).toString());
    }

    if (converted) {
      const currentConversions = parseInt(localStorage.getItem(STORAGE_KEYS.LIFETIME_CONVERSIONS) || '0', 10);
      localStorage.setItem(STORAGE_KEYS.LIFETIME_CONVERSIONS, (currentConversions + 1).toString());
      localStorage.setItem(STORAGE_KEYS.HAS_CONVERTED, 'true');
    }

    if (churnType) {
      localStorage.setItem(STORAGE_KEYS.LAST_CHURN_TYPE, churnType);
    }

    if (lastClickedUrl) {
      localStorage.setItem(STORAGE_KEYS.LAST_EXIT_LINK, lastClickedUrl);
    }

    localStorage.setItem(STORAGE_KEYS.LAST_SEEN, Date.now().toString());
  } catch (_) {}
}
