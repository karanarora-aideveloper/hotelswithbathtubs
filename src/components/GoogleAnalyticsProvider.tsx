'use client';

import { useEffect, Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { applyGAExclusion, setRuntimeGAId } from '@/lib/gtag';
import { sendPageView } from '@/lib/events';

function GoogleAnalyticsTracker({ gaId }: { gaId?: string }) {
  const pathname = usePathname();

  // Check exclusion on mount and when gaId changes
  useEffect(() => {
    if (gaId) {
      setRuntimeGAId(gaId);
    }
    applyGAExclusion(gaId);
  }, [gaId]);

  // Route transition & Pageview tracking
  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Exclude internal admin or API routes
    if (pathname.startsWith('/admin') || pathname.startsWith('/api')) return;

    sendPageView({
      page_location: window.location.href,
      page_path: pathname,
      page_title: document.title,
    });
  }, [pathname]);

  return null;
}

export default function GoogleAnalyticsProvider({ gaId }: { gaId?: string }) {
  return (
    <Suspense fallback={null}>
      <GoogleAnalyticsTracker gaId={gaId} />
    </Suspense>
  );
}
