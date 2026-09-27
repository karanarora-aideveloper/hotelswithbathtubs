'use client';

import { trackEvent } from '@/lib/analytics';
import { recordBookingConversion } from '@/lib/gtag';
import { wrapOutboundAffiliateLink } from '@/lib/affiliate';
import posthog from 'posthog-js';


export default function OutboundLink({
  href,
  children,
  className,
  hotelName,
  cityName,
  source
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  hotelName?: string;
  cityName?: string;
  source?: string;
}) {
  const affiliateLink = wrapOutboundAffiliateLink(href);

  return (
    <a
      href={affiliateLink}
      target="_blank"
      rel="noopener noreferrer nofollow sponsored"
      className={className}
      onClick={() => {
        const eventProps = {
          hotel_name: hotelName,
          city_name: cityName,
          booking_source: source || 'unknown',
          destination_url: affiliateLink,
        };

        // Track to Mixpanel
        trackEvent('hotel_booking_click', eventProps);

        // Track to Google Analytics 4 & mark session converted
        recordBookingConversion({
          hotelName,
          cityName,
          bookingSource: source || 'unknown',
          destinationUrl: affiliateLink,
        });

        // Track to PostHog — links to session recording
        try {
          posthog.capture('hotel_booking_click', {
            ...eventProps,
            $set: { last_booking_source: source, last_booked_city: cityName },
          });
        } catch (_) {}
      }}
    >
      {children}
    </a>
  );
}
