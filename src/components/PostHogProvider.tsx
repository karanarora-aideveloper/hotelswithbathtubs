'use client';

import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';
import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { isUserExcluded } from '@/lib/exclusion';
import { getRouteContext } from '@/lib/routeContext';
import { getUserRecurrenceData } from '@/lib/userRecurrence';

function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const repeatVisitTracked = useRef<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isUserExcluded()) return;

    const context = getRouteContext(pathname);
    if (context.page_type === 'admin') return;

    const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');
    const deviceCategory = window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop';
    const viewportSize = `${window.innerWidth}x${window.innerHeight}`;

    // Read user recurrence & lifetime metrics
    const recurrence = getUserRecurrenceData();

    // Anonymous Person Identification for accurate cross-session cohorts
    try {
      if (recurrence.userId) {
        posthog.identify(recurrence.userId);
      }
    } catch (_) {}

    // Register super properties so ALL subsequent autocaptured events inherit context
    try {
      posthog.register({
        current_page_type: context.page_type,
        current_country: context.country || 'global',
        current_city: context.city || 'global',
        device_category: deviceCategory,
        user_type: recurrence.isReturningUser ? 'returning' : 'new',
        session_number: recurrence.sessionNumber,
        has_ever_converted: recurrence.hasEverConverted,
      });
    } catch (_) {}

    // Track explicit repeat visitor event in PostHog
    if (recurrence.isReturningUser && !repeatVisitTracked.current) {
      repeatVisitTracked.current = true;
      try {
        posthog.capture('user_repeat_visit', {
          session_number: recurrence.sessionNumber,
          days_since_last_visit: recurrence.daysSinceLastVisit,
          previous_churn_type: recurrence.previousChurnType || 'unknown',
          has_ever_converted: recurrence.hasEverConverted,
          page_path: pathname,
        });
      } catch (_) {}
    }

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
      user_type: recurrence.isReturningUser ? 'returning' : 'new',
      session_number: recurrence.sessionNumber,
      days_since_last_visit: recurrence.daysSinceLastVisit,
      // Person Properties for Cohort & Retention Analysis
      $set_once: {
        initial_landing_page: pathname,
        initial_referrer: document.referrer || 'direct',
        initial_country: context.country || 'global',
        initial_city: context.city || 'global',
        initial_device_category: deviceCategory,
        first_seen_date: new Date().toISOString(),
      },
      $set: {
        is_returning_user: recurrence.isReturningUser,
        session_count: recurrence.sessionNumber,
        days_since_first_visit: recurrence.daysSinceFirstVisit,
        days_since_last_visit: recurrence.daysSinceLastVisit,
        lifetime_time_spent_seconds: recurrence.lifetimeTimeSpentSeconds,
        has_ever_converted: recurrence.hasEverConverted,
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
        user_type: recurrence.isReturningUser ? 'returning' : 'new',
        session_number: recurrence.sessionNumber,
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

    // Guard against multiple initializations
    if ((posthog as any).__loaded) return;

    posthog.init(key, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
      // Always maintain person profiles for anonymous travelers to calculate accurate D1/D7 retention
      person_profiles: 'always',
      // Full session recordings — inspect exact drop-offs, hesitation, and rage clicks
      session_recording: {
        maskAllInputs: false,
        maskInputOptions: { password: true },
      },
      // Autocapture: captures clicks, inputs, buttons, and navigation across all subdomains
      autocapture: {
        element_allowlist: ['a', 'button', 'form', 'input', 'select'],
      },
      // Manual pageview tracking in PostHogPageView above
      capture_pageview: false,
      respect_dnt: false,
      loaded: (ph) => {
        if (isUserExcluded()) {
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
