'use client';

import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';
import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { isUserExcluded } from '@/lib/exclusion';
import { getRouteContext } from '@/lib/routeContext';

function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isUserExcluded()) return;

    const context = getRouteContext(pathname);
    if (context.page_type === 'admin') return;

    const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');
    const deviceCategory = window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop';
    const viewportSize = `${window.innerWidth}x${window.innerHeight}`;

    // Register super properties so ALL subsequent autocaptured events inherit context
    try {
      posthog.register({
        current_page_type: context.page_type,
        current_country: context.country || 'global',
        current_city: context.city || 'global',
        device_category: deviceCategory,
      });
    } catch (_) {}

    // Capture standard pageview with rich retention & churn attributes
    posthog.capture('$pageview', {
      $current_url: url,
      page_path: pathname,
      page_type: context.page_type,
      country: context.country || 'global',
      city: context.city || 'global',
      hotel: context.hotel,
      device_category: deviceCategory,
      viewport_size: viewportSize,
      referrer: document.referrer || 'direct',
      // Person Properties for Cohort & Retention Analysis
      $set_once: {
        initial_landing_page: pathname,
        initial_referrer: document.referrer || 'direct',
        initial_country: context.country || 'global',
        initial_city: context.city || 'global',
        initial_device_category: deviceCategory,
      },
      $set: {
        last_visited_page: pathname,
        last_visited_city: context.city || 'none',
        last_visited_country: context.country || 'none',
        last_device_category: deviceCategory,
        last_active_at: new Date().toISOString(),
      },
    });

    // Explicit hotel detail view event for hotel-level conversion funnels
    if (context.page_type === 'hotel_detail' && context.hotel) {
      posthog.capture('hotel_detail_view', {
        hotel_slug: context.hotel,
        city: context.city,
        country: context.country,
        page_path: pathname,
      });
    }
  }, [pathname, searchParams]);

  return null;
}

export function PostHogProviderWrapper({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key) return;

    // Check if user is excluded (admin or developer)
    if (isUserExcluded()) {
      try {
        posthog.opt_out_capturing();
      } catch (_) {}
      return;
    }

    posthog.init(key, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
      // Always maintain person profiles for anonymous travelers to calculate accurate D1/D7 retention
      person_profiles: 'always',
      // Full session recordings — see exact drop-offs, hesitation, and rage clicks
      session_recording: {
        maskAllInputs: false,
        maskInputOptions: { password: true },
      },
      // Autocapture: captures clicks, inputs, buttons, and navigation
      autocapture: {
        url_allowlist: ['hotelswithbathtubs.com'],
        element_allowlist: ['a', 'button', 'form', 'input', 'select'],
      },
      // Manual pageview tracking in PostHogPageView above
      capture_pageview: false,
      respect_dnt: false,
      loaded: (ph) => {
        if (process.env.NODE_ENV === 'development' || isUserExcluded()) {
          ph.opt_out_capturing();
        }
      },
    });
  }, []);

  return (
    <PostHogProvider client={posthog}>
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      {children}
    </PostHogProvider>
  );
}

// ─── Typed PostHog event helpers ──────────────────────────────────────────────

export function phCapture(event: string, props?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  if (isUserExcluded()) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[PostHog Blocked via Exclusion] ${event}:`, props);
    }
    return;
  }
  try {
    posthog.capture(event, props);
  } catch (_) {}
}

export function phIdentify(userId: string, traits?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  if (isUserExcluded()) return;
  try {
    posthog.identify(userId, traits);
  } catch (_) {}
}
