'use client';

/**
 * Universal exclusion helper for Hotels With Bathtubs
 * Blocks GA4, PostHog session recordings, and Mixpanel for admin & developer devices.
 */

export function isUserExcluded(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    if ((window as any).__HWB_ANALYTICS_EXCLUDED__ === true) return true;
    if (localStorage.getItem('ignore_ga') === 'true') return true;
    if (localStorage.getItem('ignore_analytics') === 'true') return true;
    if (document.cookie.includes('ignore_analytics=true')) return true;

    // Check URL query parameters (e.g. ?exclude=true or ?admin=true or ?ignore_analytics=true)
    const params = new URLSearchParams(window.location.search);
    if (
      params.get('exclude') === 'true' ||
      params.get('admin_mode') === 'true' ||
      params.get('ignore_analytics') === 'true' ||
      params.get('ignore_ga') === 'true' ||
      params.get('dev') === 'true'
    ) {
      setUserExcluded(true);
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

export function setUserExcluded(excluded: boolean) {
  if (typeof window === 'undefined') return;
  try {
    if (excluded) {
      localStorage.setItem('ignore_ga', 'true');
      localStorage.setItem('ignore_analytics', 'true');
      document.cookie = 'ignore_analytics=true; path=/; max-age=31536000; SameSite=Lax';
      (window as any).__HWB_ANALYTICS_EXCLUDED__ = true;
      (window as any)['ga-disable-G-TETR30WPYM'] = true;
      (window as any)['ga-disable-G-2VDZWWBGD3'] = true;

      // Disable PostHog capturing immediately if initialized
      try {
        if (typeof (window as any).posthog?.opt_out_capturing === 'function') {
          (window as any).posthog.opt_out_capturing();
        }
      } catch (_) {}

      console.log(
        '%c[Analytics Exclusion] This device is EXCLUDED from GA4, PostHog, and Mixpanel.',
        'background: #0f172a; color: #10b981; font-weight: bold; padding: 4px 8px; border-radius: 4px;'
      );
    } else {
      localStorage.removeItem('ignore_ga');
      localStorage.removeItem('ignore_analytics');
      document.cookie = 'ignore_analytics=; path=/; max-age=0; SameSite=Lax';
      (window as any).__HWB_ANALYTICS_EXCLUDED__ = false;
      delete (window as any)['ga-disable-G-TETR30WPYM'];
      delete (window as any)['ga-disable-G-2VDZWWBGD3'];

      try {
        if (typeof (window as any).posthog?.opt_in_capturing === 'function') {
          (window as any).posthog.opt_in_capturing();
        }
      } catch (_) {}

      console.log(
        '%c[Analytics Exclusion] Tracking re-enabled on this device.',
        'background: #0f172a; color: #f59e0b; font-weight: bold; padding: 4px 8px; border-radius: 4px;'
      );
    }
  } catch (_) {}
}
