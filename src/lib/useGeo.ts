'use client';

import { useState, useEffect } from 'react';

export type GeoData = {
  countryCode: string;
  country: string;
  city: string;
  isIndia: boolean;
  isUS: boolean;
};

const DEFAULT_GEO: GeoData = {
  countryCode: 'US',
  country: 'USA',
  city: '',
  isIndia: false,
  isUS: true,
};

function getInitialGeo(): GeoData {
  if (typeof window !== 'undefined') {
    try {
      const cached = sessionStorage.getItem('hwb_geo');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.countryCode) {
          return parsed;
        }
      }
    } catch {
      // Ignore
    }

    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      if (tz.includes('Calcutta') || tz.includes('Kolkata')) {
        return {
          countryCode: 'IN',
          country: 'India',
          city: '',
          isIndia: true,
          isUS: false,
        };
      }
    } catch {
      // Ignore
    }
  }
  return DEFAULT_GEO;
}

export function useGeo() {
  const [geo, setGeo] = useState<GeoData>(getInitialGeo);
  const [loaded, setLoaded] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = sessionStorage.getItem('hwb_geo');
        if (cached) return true;
      } catch {
        // Ignore
      }
    }
    return false;
  });

  useEffect(() => {
    // If already cached in sessionStorage, initial state already used it
    try {
      const cached = sessionStorage.getItem('hwb_geo');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.countryCode) {
          return;
        }
      }
    } catch {
      // Ignore storage errors
    }

    // Verified geolocation from edge headers (served by /api/geo)
    fetch('/api/geo')
      .then((res) => res.json())
      .then((data: GeoData) => {
        if (data && data.countryCode) {
          setGeo(data);
          try {
            sessionStorage.setItem('hwb_geo', JSON.stringify(data));
          } catch {
            // Ignore storage errors
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  return { geo, loaded };
}
