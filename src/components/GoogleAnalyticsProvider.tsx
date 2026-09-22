'use client';

import { useEffect, useRef, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  sendGA4Event,
  initPageSession,
  updateMaxScroll,
  updateLastVisibleSection,
  recordExitIntent,
  recordRageClick,
  dispatchUserChurn,
  applyGAExclusion,
  isGAExcluded,
  setRuntimeGAId,
} from '@/lib/gtag';

// Parse country, city, and page_type from route pathname
const getRouteContext = (path: string) => {
  const parts = path.split('/').filter(Boolean);
  if (parts.length === 0) {
    return { page_type: 'homepage', country: undefined, city: undefined };
  }

  if (parts[0] === 'blog') {
    if (parts.length > 1) {
      return { page_type: 'blog_post', blog_slug: parts[1], country: undefined, city: undefined };
    }
    return { page_type: 'blog_index', country: undefined, city: undefined };
  }

  if (parts[0] === 'admin' || parts[0] === 'api') {
    return { page_type: 'admin', country: undefined, city: undefined };
  }

  if (parts.length === 1) {
    return { page_type: 'country_hub', country: parts[0], city: undefined };
  }

  if (parts.length === 2) {
    return { page_type: 'city_listings', country: parts[0], city: parts[1] };
  }

  return { page_type: 'other', country: undefined, city: undefined };
};

function GoogleAnalyticsTracker({ gaId }: { gaId?: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const firedScrollMilestones = useRef<Set<number>>(new Set());
  const exitIntentFired = useRef<boolean>(false);
  const clickHistory = useRef<Array<{ time: number; x: number; y: number; target: HTMLElement }>>([]);

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
    if (isGAExcluded()) return;

    const context = getRouteContext(pathname);
    // Do not track internal admin/api routes
    if (context.page_type === 'admin') return;

    // Initialize churn tracking session for new route
    initPageSession(pathname, context.page_type, context.country, context.city);
    firedScrollMilestones.current.clear();
    exitIntentFired.current = false;
    clickHistory.current = [];

    const url = window.location.href;
    const title = document.title;

    // Send standard GA4 page_view
    sendGA4Event('page_view', {
      page_location: url,
      page_path: pathname,
      page_title: title,
      page_type: context.page_type,
      country: context.country || 'all',
      city: context.city || 'all',
    });
  }, [pathname, searchParams]);

  // Churn dispatch on SPA route change
  useEffect(() => {
    const context = getRouteContext(pathname);
    if (context.page_type === 'admin') return;

    return () => {
      // Dispatches churn telemetry when user navigates away to another page
      dispatchUserChurn();
    };
  }, [pathname]);

  // Churn dispatch on tab close, browser switch, or app minimize (beforeunload / visibilitychange / pagehide)
  useEffect(() => {
    const context = getRouteContext(pathname);
    if (context.page_type === 'admin') return;

    const handleExit = () => {
      dispatchUserChurn();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        handleExit();
      }
    };

    window.addEventListener('beforeunload', handleExit);
    window.addEventListener('pagehide', handleExit);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleExit);
      window.removeEventListener('pagehide', handleExit);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [pathname]);

  // Scroll depth tracking (25%, 50%, 75%, 90%, 100%)
  useEffect(() => {
    const context = getRouteContext(pathname);
    if (context.page_type === 'admin') return;

    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const winHeight = window.innerHeight;
      const docHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.offsetHeight
      );

      const totalScrollable = docHeight - winHeight;
      if (totalScrollable <= 0) return;

      const scrollPercent = Math.min(100, Math.round((scrollTop / totalScrollable) * 100));
      updateMaxScroll(scrollPercent);

      const milestones = [25, 50, 75, 90, 100];
      for (const milestone of milestones) {
        if (scrollPercent >= milestone && !firedScrollMilestones.current.has(milestone)) {
          firedScrollMilestones.current.add(milestone);
          sendGA4Event('scroll_depth', {
            percent: milestone,
            page_path: pathname,
            page_type: context.page_type,
            country: context.country,
            city: context.city,
          });
        }
      }
    };

    let ticking = false;
    const scrollListener = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', scrollListener, { passive: true });
    return () => window.removeEventListener('scroll', scrollListener);
  }, [pathname]);

  // Section Observer to identify exact last section viewed before churn
  useEffect(() => {
    const context = getRouteContext(pathname);
    if (context.page_type === 'admin') return;

    const sections = document.querySelectorAll(
      'header, main > section, article, footer, [id], [data-section]'
    );

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement;
            const identifier =
              target.getAttribute('data-section') ||
              target.id ||
              target.tagName.toLowerCase() + (target.className ? '.' + target.className.split(' ')[0] : '');
            if (identifier) {
              updateLastVisibleSection(identifier);
            }
          }
        }
      },
      { threshold: 0.3 }
    );

    sections.forEach((sec) => observer.observe(sec));

    return () => observer.disconnect();
  }, [pathname]);

  // Desktop Exit Intent Detection (Mouse moving to top window boundary)
  useEffect(() => {
    const context = getRouteContext(pathname);
    if (context.page_type === 'admin') return;

    const startTime = Date.now();

    const handleMouseLeave = (e: MouseEvent) => {
      if (exitIntentFired.current) return;

      // When cursor leaves top boundary with fast vertical velocity
      if (e.clientY <= 15 && e.movementY < 0) {
        exitIntentFired.current = true;
        const timeSpent = Math.round((Date.now() - startTime) / 1000);
        recordExitIntent(timeSpent);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [pathname]);

  // Rage Click Detection (3+ clicks within 1000ms in a small radius -> indicates user frustration)
  useEffect(() => {
    const context = getRouteContext(pathname);
    if (context.page_type === 'admin') return;

    const handleClick = (e: MouseEvent) => {
      const now = Date.now();
      const target = e.target as HTMLElement;
      if (!target) return;

      // Keep only clicks within last 1200ms
      clickHistory.current = clickHistory.current.filter((c) => now - c.time < 1200);

      clickHistory.current.push({
        time: now,
        x: e.clientX,
        y: e.clientY,
        target,
      });

      if (clickHistory.current.length >= 3) {
        const first = clickHistory.current[0];
        const last = clickHistory.current[clickHistory.current.length - 1];
        const dist = Math.hypot(last.x - first.x, last.y - first.y);

        // If 3 clicks happened within 40px radius
        if (dist < 40) {
          recordRageClick(
            target.tagName.toLowerCase(),
            target.innerText || target.getAttribute('aria-label') || '',
            target.className || ''
          );
          clickHistory.current = []; // Reset after firing
        }
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
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
