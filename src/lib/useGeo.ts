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

export function useGeo() {
  const [geo, setGeo] = useState<GeoData>(DEFAULT_GEO);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Fast initial guess via timezone to eliminate UI flash on slow networks
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      if (tz.includes('Calcutta') || tz.includes('Kolkata')) {
        setGeo({
          countryCode: 'IN',
          country: 'India',
          city: '',
          isIndia: true,
          isUS: false,
        });
      }
    } catch (_) {}

    // Verified geolocation from Vercel Edge headers
    fetch('/api/geo')
      .then((res) => res.json())
      .then((data: GeoData) => {
        if (data && data.countryCode) {
          setGeo(data);
        }
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  return { geo, loaded };
}
