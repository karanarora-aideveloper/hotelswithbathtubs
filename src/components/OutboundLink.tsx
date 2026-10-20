'use client';

import { trackEvent } from '@/lib/analytics';
import { recordBookingConversion } from '@/lib/gtag';
import { wrapOutboundAffiliateLink, type TripDates } from '@/lib/affiliate';
import { recordSessionRecurrenceUpdate } from '@/lib/userRecurrence';
import posthog from 'posthog-js';
import { isUserExcluded } from '@/lib/exclusion';

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

  // Normalize affiliate provider name
  const getProvider = (url: string, src?: string): string => {
    if (src) return src.toLowerCase();
    const lower = url.toLowerCase();
    if (lower.includes('booking.com') || lower.includes('visitretailer/2732')) return 'booking.com';
    if (lower.includes('agoda.com') || lower.includes('visitretailer/2927')) return 'agoda';
    if (lower.includes('makemytrip.com') || lower.includes('visitretailer/1729') || lower.includes('linkredirect.in') || lower.includes('ekaro.in')) return 'makemytrip';
    if (lower.includes('trip.com')) return 'trip.com';
    if (lower.includes('airbnb.')) return 'airbnb';
    return 'other';
  };

  return (
    <a
      href={affiliateLink}
      target="_blank"
      rel="noopener noreferrer nofollow sponsored"
      className={className}
      onClick={() => {
        const clickId = `clk_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const provider = getProvider(affiliateLink, source);
        const pagePath = typeof window !== 'undefined' ? window.location.pathname : '';
        const referrer = typeof document !== 'undefined' ? document.referrer : '';
        const deviceCategory = typeof window !== 'undefined'
          ? window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop'
          : 'desktop';
        const posthogDistinctId = (posthog as any)?.get_distinct_id?.() || '';
        const posthogSessionId = (posthog as any)?.get_session_id?.() || '';

        // Extract country from pathname e.g. /thailand/bangkok -> thailand
        const pathSegments = pagePath.split('/').filter(Boolean);
        const countryName = pathSegments.length >= 1 ? pathSegments[0] : '';

        const eventProps = {
          click_id: clickId,
          hotel_name: hotelName || 'Unknown Hotel',
          city_name: cityName || '',
          country_name: countryName,
          provider,
          booking_source: source || provider,
          destination_url: affiliateLink,
          page_path: pagePath,
          device_category: deviceCategory,
          posthog_distinct_id: posthogDistinctId,
          posthog_session_id: posthogSessionId,
        };

        // 1. Track to Internal Hotel Clicks Portal (/api/track-click)
        try {
          const clickPayload = {
            clickId,
            hotelName: hotelName || 'Unknown Hotel',
            cityName: cityName || '',
            countryName,
            provider,
            destinationUrl: affiliateLink,
            pagePath,
            referrer,
            deviceCategory,
            userType: typeof window !== 'undefined' && localStorage.getItem('hwb_returning') ? 'returning' : 'new',
            posthogDistinctId,
            posthogSessionId,
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
        } catch (_) {}

        // 2. Track to Mixpanel
        trackEvent('hotel_booking_click', eventProps);

        // 3. Track to Google Analytics 4 & mark session converted
        recordBookingConversion({
          hotelName,
          cityName,
          bookingSource: source || provider,
          destinationUrl: affiliateLink,
        });

        // 4. Update persistent recurrence profile as a converted buyer
        recordSessionRecurrenceUpdate({
          timeSpentSeconds: 0,
          hotelsViewedCount: 1,
          converted: true,
          lastClickedUrl: affiliateLink,
        });

        // 5. Track to PostHog — dedicated hotel link click event
        try {
          if (!isUserExcluded()) {
            posthog.capture('hotel_booking_click', {
              ...eventProps,
              $set: {
                has_ever_converted: true,
                last_booking_source: source || provider,
                last_booked_city: cityName,
                last_booked_hotel: hotelName,
                last_exit_link: affiliateLink,
              },
            });
            posthog.capture('hotel_link_clicked', eventProps);
          }
        } catch (_) {}
      }}
    >
      {children}
    </a>
  );
}
