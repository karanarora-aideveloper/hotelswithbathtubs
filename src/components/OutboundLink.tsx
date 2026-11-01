'use client';

import { sendBookingClick } from '@/lib/events';
import { wrapOutboundAffiliateLink, type TripDates } from '@/lib/affiliate';

export default function OutboundLink({
  href,
  children,
  className,
  hotelName,
  cityName,
  source,
  dates,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  hotelName?: string;
  cityName?: string;
  source?: string;
  dates?: TripDates;
}) {
  const affiliateLink = wrapOutboundAffiliateLink(href, undefined, dates);
  const outHref = href.startsWith('/out?')
    ? href
    : `/out?url=${encodeURIComponent(affiliateLink)}`;

  return (
    <a
      href={outHref}
      target="_blank"
      rel="noopener noreferrer nofollow sponsored"
      className={className}
      onClick={() => {
        // Fire GA4 booking_click key conversion event
        sendBookingClick({
          partner: source || affiliateLink,
          placement: source || 'other',
          hotel_name: hotelName,
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
