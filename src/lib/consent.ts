'use client';

export const CONSENT_REGIONS = new Set([
  'AT', 'BE', 'BG', 'CH', 'CY', 'CZ', 'DE', 'DK', 'EE', 'ES',
  'FI', 'FR', 'GB', 'GR', 'HR', 'HU', 'IE', 'IS', 'IT', 'LI',
  'LT', 'LU', 'LV', 'MT', 'NL', 'NO', 'PL', 'PT', 'RO', 'SE',
  'SI', 'SK',
]);

export const STORAGE_KEYS = {
  USER_ID: 'hwb_user_id',
  SESSION_COUNT: 'hwb_session_count',
  FIRST_SEEN: 'hwb_first_seen',
  LAST_SEEN: 'hwb_last_seen',
  LAST_SESSION_TIME: 'hwb_last_session_time',
  LIFETIME_TIME: 'hwb_lifetime_time',
  LIFETIME_HOTELS: 'hwb_lifetime_hotels',
  LIFETIME_CONVERSIONS: 'hwb_lifetime_conversions',
  HAS_CONVERTED: 'hwb_has_converted',
  LAST_CHURN_TYPE: 'hwb_last_churn_type',
  LAST_EXIT_LINK: 'hwb_last_exit_link',
} as const;

export function isConsentRegion(countryCode?: string | null): boolean {
  if (!countryCode) return false;
  return CONSENT_REGIONS.has(countryCode.toUpperCase());
}

/**
 * Checks whether non-essential analytics storage and tracking is permitted.
 *
 * Rules:
 * - If savedConsent === 'granted': ALLOWED.
 * - If savedConsent === 'denied': BLOCKED.
 * - In UK/EU/CH (CONSENT_REGIONS): BLOCKED until visitor clicks Accept.
 * - Outside UK/EU/CH (e.g. US, IN): ALLOWED by default.
 */
export function hasAnalyticsConsent(
  countryCode?: string | null,
  savedConsent?: string | null
): boolean {
  let consent = savedConsent;
  if (consent === undefined && typeof window !== 'undefined') {
    try {
      consent = localStorage.getItem('hwb_consent');
    } catch {}
  }

  if (consent === 'granted') return true;
  if (consent === 'denied') return false;

  let code = countryCode;
  if (!code && typeof window !== 'undefined') {
    try {
      const cachedGeo = sessionStorage.getItem('hwb_geo');
      if (cachedGeo) {
        const parsed = JSON.parse(cachedGeo);
        code = parsed?.countryCode;
      }
    } catch {}
  }

  if (code) {
    if (CONSENT_REGIONS.has(code.toUpperCase())) {
      return false;
    }
    return true;
  }

  if (typeof window !== 'undefined') {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      if (tz.startsWith('Europe/') || tz === 'Atlantic/Reykjavik') {
        return false;
      }
    } catch {}
  }

  return true;
}

/**
 * Removes non-essential analytics keys from localStorage and document.cookie.
 */
export function clearAnalyticsStorage(): void {
  if (typeof window === 'undefined') return;

  try {
    for (const key of Object.values(STORAGE_KEYS)) {
      localStorage.removeItem(key);
    }
    // Also remove legacy htb_ prefixed keys if present
    localStorage.removeItem('htb_uid');
    localStorage.removeItem('htb_session_count');
    localStorage.removeItem('htb_first_seen');
    localStorage.removeItem('htb_last_seen');
    localStorage.removeItem('htb_last_session_time');
    localStorage.removeItem('htb_lifetime_time_seconds');
    localStorage.removeItem('htb_lifetime_hotels_count');
    localStorage.removeItem('htb_lifetime_conversions');
    localStorage.removeItem('htb_has_ever_converted');
    localStorage.removeItem('htb_last_churn_type');
    localStorage.removeItem('htb_last_exit_link');

    // Expire cookies
    document.cookie = `${STORAGE_KEYS.USER_ID}=; path=/; max-age=0; SameSite=Lax`;
    document.cookie = `htb_uid=; path=/; max-age=0; SameSite=Lax`;
  } catch {}
}
