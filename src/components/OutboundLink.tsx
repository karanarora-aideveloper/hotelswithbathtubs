'use client';

import { trackEvent } from '@/lib/analytics';
import { recordBookingConversion } from '@/lib/gtag';
import { wrapOutboundAffiliateLink } from '@/lib/affiliate';

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
        // Track to Mixpanel
        trackEvent('hotel_booking_click', {
          hotel_name: hotelName,
          city_name: cityName,
          booking_source: source || 'MakeMyTrip',
          destination_url: affiliateLink,
        });

        // Track to Google Analytics 4 & mark session converted
        recordBookingConversion({
          hotelName,
          cityName,
          bookingSource: source || 'MakeMyTrip',
          destinationUrl: affiliateLink,
        });
      }}
    >
      {children}
    </a>
  );
}
