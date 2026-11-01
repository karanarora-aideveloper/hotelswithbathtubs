'use client';

import { useEffect } from 'react';
import { saveRecentlyViewed, RecentHotel } from '@/lib/recentlyViewed';
import { sendViewHotel } from '@/lib/events';

export default function RecordHotelView({ hotel }: { hotel: RecentHotel }) {
  useEffect(() => {
    saveRecentlyViewed(hotel);
    sendViewHotel({
      hotel_name: hotel.name,
      country: hotel.country,
      city: hotel.city,
    });
  }, [hotel]);

  return null;
}
