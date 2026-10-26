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
    let cachedGeo: GeoData | null = null;
    try {
      const cached = sessionStorage.getItem('hwb_geo');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.countryCode) {
          cachedGeo = parsed;
          setGeo(parsed);
          setLoaded(true);
        }
      }
    } catch {
      // Ignore storage errors
    }

    if (!cachedGeo) {
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
      } catch {
        // Ignore timezone errors
      }
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
