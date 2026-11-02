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
import { hasAnalyticsConsent } from '@/lib/consent';

/**
 * Check if current user has opted out or flagged internal traffic via /admin or ?exclude=true
 */
export const isGAExcluded = (): boolean => {
  return isUserExcluded();
};

/**
 * Set GA disable flag on window for internal traffic exclusion
 */
interface ExtendedWindow extends Window {
  dataLayer?: unknown[];
  [key: `ga-disable-${string}`]: boolean | undefined;
}

export const applyGAExclusion = (gaId?: string) => {
  if (typeof window === 'undefined') return;
  const win = window as unknown as ExtendedWindow;
  const id = gaId || GA_MEASUREMENT_ID;

  if (isGAExcluded()) {
    if (id) win[`ga-disable-${id}`] = true;
    win['ga-disable-G-TETR30WPYM'] = true;
    win['ga-disable-G-2VDZWWBGD3'] = true;
  } else {
    if (id) delete win[`ga-disable-${id}`];
    delete win['ga-disable-G-TETR30WPYM'];
    delete win['ga-disable-G-2VDZWWBGD3'];
  }
};

/**
 * Send event to GA4 via dataLayer / gtag with beacon transport for exit reliability
 */
export const sendGA4Event = (eventName: string, params?: Record<string, unknown>) => {
  if (typeof window === 'undefined') return;

  if (isGAExcluded() || !hasAnalyticsConsent()) {
    if (process.env.NODE_ENV !== 'production' && isGAExcluded()) {
      console.log(`[Analytics Blocked via Exclusion] ${eventName}:`, params);
    }
    return;
  }

  // GA4 via dataLayer / gtag
  const eventParams: Record<string, unknown> = { ...params, transport_type: 'beacon' };
  const win = window as unknown as ExtendedWindow;

  if (typeof win.gtag !== 'function') {
    win.dataLayer = win.dataLayer || [];
    win.gtag = function () {
      // eslint-disable-next-line prefer-rest-params
      (win.dataLayer as unknown[]).push(arguments);
    };
  }
  win.gtag('event', eventName, eventParams);
};
