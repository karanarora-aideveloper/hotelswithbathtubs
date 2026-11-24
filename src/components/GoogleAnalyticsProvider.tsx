'use client';

import { useEffect, Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { applyGAExclusion, setRuntimeGAId } from '@/lib/gtag';
import { sendPageView, classifyClick, sendUiClick, sendScrollDepth, getRouteContext } from '@/lib/events';

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

  // Tap tracking: one delegated listener for the whole site (capture phase, so it also
  // sees taps on elements that stop propagation). Sends ui_click; never reads typed input.
  useEffect(() => {
    if (pathname.startsWith('/admin') || pathname.startsWith('/api')) return;
    const onClick = (e: MouseEvent) => {
      const click = classifyClick(e.target as Element | null);
      if (click) sendUiClick(click);
    };
    document.addEventListener('click', onClick, { capture: true, passive: true });
    return () => document.removeEventListener('click', onClick, { capture: true });
  }, [pathname]);

  // Scroll depth on hotel pages: 25 / 50 / 75 / 90 percent, each sent once per page.
  useEffect(() => {
    if (getRouteContext(pathname).page_type !== 'hotel') return;
    const marks = [25, 50, 75, 90];
    const sent = new Set<number>();
    let queued = false;
    const check = () => {
      queued = false;
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;
      const percent = (window.scrollY / scrollable) * 100;
      for (const m of marks) {
        if (percent >= m && !sent.has(m)) {
          sent.add(m);
          sendScrollDepth(m);
        }
      }
    };
    const onScroll = () => {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(check);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
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
