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

        // Update persistent recurrence profile as a converted buyer
        recordSessionRecurrenceUpdate({
          timeSpentSeconds: 0,
          hotelsViewedCount: 1,
          converted: true,
          lastClickedUrl: affiliateLink,
        });

        // Track to PostHog — links to session recording (if not excluded)
        try {
          if (!isUserExcluded()) {
            posthog.capture('hotel_booking_click', {
              ...eventProps,
              $set: {
                has_ever_converted: true,
                last_booking_source: source,
                last_booked_city: cityName,
                last_booked_hotel: hotelName,
                last_exit_link: affiliateLink,
              },
            });
          }
        } catch (_) {}
      }}
    >
      {children}
    </a>
  );
}
