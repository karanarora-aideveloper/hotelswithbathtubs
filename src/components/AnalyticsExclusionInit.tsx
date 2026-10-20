'use client';

import { useEffect } from 'react';
import { isUserExcluded } from '@/lib/exclusion';

// Run immediately during client bundle evaluation before React tree renders
if (typeof window !== 'undefined') {
  try {
    isUserExcluded();
  } catch (_) {}
}

export default function AnalyticsExclusionInit({ gaId }: { gaId?: string }) {
  if (typeof window !== 'undefined') {
    try {
      isUserExcluded(gaId);
    } catch (_) {}
  }

  useEffect(() => {
    try {
      isUserExcluded(gaId);
    } catch (_) {}
  }, [gaId]);

  return null;
}
