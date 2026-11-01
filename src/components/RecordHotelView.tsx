'use client';

import { useEffect } from 'react';
import { saveRecentlyViewed, RecentHotel } from '@/lib/recentlyViewed';

export default function RecordHotelView({ hotel }: { hotel: RecentHotel }) {
  useEffect(() => {
    saveRecentlyViewed(hotel);
  }, [hotel]);

  return null;
}
