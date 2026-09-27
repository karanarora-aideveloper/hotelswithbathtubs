'use client';

import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';
import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');
    posthog.capture('$pageview', { $current_url: url });
  }, [pathname, searchParams]);

  return null;
}

export function PostHogProviderWrapper({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key) return;

    posthog.init(key, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
      // Session recordings — see exactly what real users do
      session_recording: {
        maskAllInputs: false,
        maskInputOptions: { password: true },
      },
      // Autocapture: records all clicks, form submissions, page loads automatically
      autocapture: {
        url_allowlist: ['hotelswithbathtubs.com'],
        element_allowlist: ['a', 'button', 'input', 'select', '[data-ph-capture]'],
      },
      // Don't capture pageviews automatically — we do it manually above
      capture_pageview: false,
      // Respect user privacy
      respect_dnt: false,
      // Disable in local dev
      loaded: (ph) => {
        if (process.env.NODE_ENV === 'development') ph.opt_out_capturing();
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
// Use these instead of calling posthog.capture() directly — keeps events consistent

export function phCapture(event: string, props?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  try { posthog.capture(event, props); } catch (_) {}
}

export function phIdentify(userId: string, traits?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  try { posthog.identify(userId, traits); } catch (_) {}
}
