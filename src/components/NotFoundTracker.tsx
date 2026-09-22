'use client';

import { useEffect } from 'react';
import { record404Error } from '@/lib/gtag';

export default function NotFoundTracker() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      record404Error(window.location.pathname, document.referrer);
    }
  }, []);

  return null;
}
