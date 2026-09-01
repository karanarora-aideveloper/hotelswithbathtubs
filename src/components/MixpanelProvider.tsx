'use client';

import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { initMixpanel, trackEvent, registerSuperProperties } from '@/lib/analytics';

// Helper to parse city, country and page metadata from current route path
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
    // e.g., /united-states
    return { page_type: 'country_hub', country: parts[0], city: undefined };
  }
  
  if (parts.length === 2) {
    // e.g., /usa/new-york
    return { page_type: 'city_listings', country: parts[0], city: parts[1] };
  }
  
  return { page_type: 'other', country: undefined, city: undefined };
};

function MixpanelTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize Mixpanel once on client mount
  useEffect(() => {
    initMixpanel();
  }, []);

  // Update dynamic super properties (city/country context) and track page_view on route change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const context = getRouteContext(pathname);
      
      // Clean up undefined parameters before registering
      const cleanContext = Object.fromEntries(
        Object.entries(context).filter(([_, v]) => v !== undefined)
      );

      // Register current city & country as super properties so they attach to all subsequent click/exit events
      registerSuperProperties(cleanContext);

      const url = window.location.href;
      trackEvent('page_view', {
        path: pathname,
        url: url,
        title: document.title,
      });
    }
  }, [pathname, searchParams]);

  // Track per-page time spent — fires on every route change (SPA nav) AND on unmount
  useEffect(() => {
    const startTime = Date.now();
    const capturedPath = pathname;
    const capturedContext = getRouteContext(capturedPath);

    return () => {
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      trackEvent('page_time_spent', {
        path: capturedPath,
        time_spent_seconds: timeSpent,
        ...capturedContext,
      });
    };
  }, [pathname]);

  // Track site_exit on tab close / hard navigation — beforeunload + visibilitychange for iOS Safari
  useEffect(() => {
    const startTime = Date.now();

    const handleExit = () => {
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      const context = getRouteContext(window.location.pathname);
      trackEvent('site_exit', {
        time_spent_seconds: timeSpent,
        last_viewed_page: window.location.pathname,
        ...context,
      });
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') handleExit();
    };

    window.addEventListener('beforeunload', handleExit);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('beforeunload', handleExit);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [pathname]);

  // Track generic non-affiliate outbound links (other exits)
  useEffect(() => {
    const handleExitClicks = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      if (!href) return;

      const isExternal = href.startsWith('http://') || href.startsWith('https://');
      const isAffiliateRedirect = href.includes('/out?url=');

      if (isExternal && !isAffiliateRedirect) {
        trackEvent('outbound_exit_click', {
          destination_url: href,
          link_text: target.innerText || target.getAttribute('aria-label') || 'Exit Link',
        });
      }
    };

    document.addEventListener('click', handleExitClicks);
    return () => {
      document.removeEventListener('click', handleExitClicks);
    };
  }, []);

  return null;
}

export default function MixpanelProvider() {
  return (
    <Suspense fallback={null}>
      <MixpanelTracker />
    </Suspense>
  );
}
