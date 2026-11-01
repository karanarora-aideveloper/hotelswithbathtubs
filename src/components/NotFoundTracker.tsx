'use client';

import { useEffect } from 'react';
import { sendPageNotFound } from '@/lib/events';

export default function NotFoundTracker() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sendPageNotFound({
        path: window.location.pathname,
        referrer: document.referrer || '',
      });
    }
  }, []);

  return null;
}
