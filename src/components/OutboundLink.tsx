'use client';

import { sendBookingClick, getRouteContext, normalizePlacement, normalizePartner, type BookingPlacement } from '@/lib/events';
import { usePathname } from 'next/navigation';
import { wrapOutboundAffiliateLink, type TripDates } from '@/lib/affiliate';

export default function OutboundLink({
  href,
  children,
  className,
  hotelName,
  cityName,
  countryName,
  source,
  placement,
  dates,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  hotelName?: string;
  cityName?: string;
  countryName?: string;
  source?: string;
  placement?: BookingPlacement | string;
  dates?: TripDates;
}) {
  const pathname = usePathname();
  // sid page type comes from the route (same on server and client, so no hydration mismatch);
  // the visitor country is filled in by the /out edge function.
  const affiliateLink = wrapOutboundAffiliateLink(href, { pageType: getRouteContext(pathname || '').page_type }, dates);
  // Placement: explicit prop first, then the page type, then `source`
  let resolvedPlacement: BookingPlacement = 'other';
  if (placement) {
    resolvedPlacement = normalizePlacement(placement);
  } else {
    const pageType = getRouteContext(pathname || '').page_type;
    if (pageType === 'hotel') resolvedPlacement = 'hotel_page';
    else if (pageType === 'destination') resolvedPlacement = 'city_card';
    else if (pageType === 'matchmaker') resolvedPlacement = 'matchmaker';
    else if (pageType === 'blog') resolvedPlacement = 'blog';
    else resolvedPlacement = normalizePlacement(source);
  }
  // `from`, `pl` and `h` are only for the /out click log (page path, placement, hotel). Nothing personal.
  const outParams = new URLSearchParams({ url: affiliateLink });
  if (pathname) outParams.set('from', pathname);
  outParams.set('pl', resolvedPlacement);
  if (hotelName) outParams.set('h', hotelName.slice(0, 120));
  const outHref = `/out?${outParams.toString()}`;

  return (
    <a
      href={outHref}
      target="_blank"
      rel="sponsored nofollow noopener noreferrer"
      className={className}
      onClick={() => {
        // Fire GA4 booking_click key conversion event
        // Partner comes from the destination address; `source` is only a fallback
        // (many callers pass a placement name like "matchmaker_cta" there).
        const partnerFromUrl = normalizePartner(href);
        sendBookingClick({
          partner: partnerFromUrl !== 'other' ? partnerFromUrl : source || href,
          link_type: affiliateLink !== href && /jdoqocy\.com|anrdoezrs\.net/.test(affiliateLink) ? 'affiliate' : 'direct',
          placement: resolvedPlacement,
          hotel_name: hotelName,
          country: countryName,
          city: cityName,
        });

        // Track to internal /api/track-click via beacon if available
        try {
          const clickId = `clk_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
          const pagePath = typeof window !== 'undefined' ? window.location.pathname : '';
          const pathSegments = pagePath.split('/').filter(Boolean);
          const countryName = pathSegments.length >= 1 ? pathSegments[0] : '';

          const clickPayload = {
            clickId,
            hotelName: hotelName || 'Unknown Hotel',
            cityName: cityName || '',
            countryName,
            provider: source || 'other',
            destinationUrl: affiliateLink,
            pagePath,
            referrer: typeof document !== 'undefined' ? document.referrer : '',
            deviceCategory:
              typeof window !== 'undefined'
                ? window.innerWidth < 768
                  ? 'mobile'
                  : window.innerWidth < 1024
                  ? 'tablet'
                  : 'desktop'
                : 'desktop',
            clickedAt: new Date().toISOString(),
          };

          const body = JSON.stringify(clickPayload);
          if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
            navigator.sendBeacon('/api/track-click', body);
          } else if (typeof fetch !== 'undefined') {
            fetch('/api/track-click', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body,
              keepalive: true,
            }).catch(() => {});
          }
        } catch {}
      }}
    >
      {children}
    </a>
  );
}
