'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getCountryDisplayName,
  guessCountryFromTimeZone,
} from '@/lib/countries';

export type GeoData = {
  countryCode: string;
  country: string;
  city: string;
  isIndia: boolean;
  isUS: boolean;
};

const DEFAULT_GEO: GeoData = {
  countryCode: 'XX',
  country: '',
  city: '',
  isIndia: false,
  isUS: false,
};

let sharedGeoPromise: Promise<GeoData> | null = null;

export function getCachedGeo(): GeoData | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem('hwb_geo');
    if (raw) {
      const parsed = JSON.parse(raw) as GeoData;
      if (parsed && typeof parsed.countryCode === 'string') {
        return parsed;
      }
    }
  } catch {
    // Ignore storage errors
  }
  return null;
}

export function fetchSharedGeo(): Promise<GeoData> {
  const cached = getCachedGeo();
  if (cached) return Promise.resolve(cached);

  if (!sharedGeoPromise) {
    sharedGeoPromise = fetch('/api/geo')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: GeoData) => {
        if (data && typeof data.countryCode === 'string') {
          try {
            sessionStorage.setItem('hwb_geo', JSON.stringify(data));
          } catch {
            // Ignore storage errors
          }
        }
        return data;
      })
      .catch(() => {
        const fallback = DEFAULT_GEO;
        try {
          sessionStorage.setItem('hwb_geo', JSON.stringify(fallback));
        } catch {}
        return fallback;
      });
  }
  return sharedGeoPromise;
}

export function setCountry(code: string) {
  const upper = (code || '').trim().toUpperCase();
  try {
    localStorage.setItem('hwb_country', upper);
  } catch {
    // Ignore storage errors
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('hwb_country_change', { detail: upper })
    );
  }
}

export function useGeo() {
  const [geo, setGeo] = useState<GeoData>(DEFAULT_GEO);
  const [loaded, setLoaded] = useState(false);

  const resolveGeo = useCallback(() => {
    // 1. Saved hwb_country wins over everything
    try {
      const saved = localStorage.getItem('hwb_country');
      if (saved && saved.trim() !== '') {
        const code = saved.trim().toUpperCase();
        const countryName = getCountryDisplayName(code);
        setGeo({
          countryCode: code,
          country: countryName,
          city: '',
          isIndia: code === 'IN',
          isUS: code === 'US',
        });
        setLoaded(true);
        return;
      }
    } catch {
      // Ignore storage errors
    }

    // Reuse sessionStorage value hwb_geo when it's already there
    const sessionGeo = getCachedGeo();
    if (sessionGeo) {
      setGeo(sessionGeo);
      setLoaded(true);
      return;
    }

    // Preliminary client time-zone guess before network request settles
    const initialTzGuess = guessCountryFromTimeZone();
    if (initialTzGuess) {
      setGeo({
        countryCode: initialTzGuess.countryCode,
        country: initialTzGuess.country,
        city: '',
        isIndia: initialTzGuess.countryCode === 'IN',
        isUS: initialTzGuess.countryCode === 'US',
      });
    }

    // 2. Verified geolocation from edge headers (shared promise)
    fetchSharedGeo().then((data) => {
      // If localStorage was updated while fetch was in flight, saved wins
      try {
        const savedNow = localStorage.getItem('hwb_country');
        if (savedNow && savedNow.trim() !== '') return;
      } catch {
        // Ignore storage errors
      }

      if (data && data.countryCode && data.countryCode !== 'XX') {
        setGeo(data);
        setLoaded(true);
        return;
      }

      // 3. Fallback to time-zone guess if edge geo returned "XX"
      const tzGuess = guessCountryFromTimeZone();
      if (tzGuess) {
        setGeo({
          countryCode: tzGuess.countryCode,
          country: tzGuess.country,
          city: '',
          isIndia: tzGuess.countryCode === 'IN',
          isUS: tzGuess.countryCode === 'US',
        });
      } else {
        // 4. Else "unknown"
        setGeo(DEFAULT_GEO);
      }
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    resolveGeo();

    const handleCountryChange = () => {
      resolveGeo();
    };

    window.addEventListener('hwb_country_change', handleCountryChange);
    window.addEventListener('storage', handleCountryChange);
    return () => {
      window.removeEventListener('hwb_country_change', handleCountryChange);
      window.removeEventListener('storage', handleCountryChange);
    };
  }, [resolveGeo]);

  return { geo, loaded, setCountry };
}
