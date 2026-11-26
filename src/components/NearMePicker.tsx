'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useGeo } from '@/lib/useGeo';
import { COUNTRIES_WITH_HOTELS } from '@/lib/countries';
import { slugify } from '@/lib/utils';

/** [city, citySlug, countrySlug, countryName, hotelCount, confirmedCount] */
export type NearMeCity = [string, string, string, string, number, number];

// Suggests cities in the visitor's own country (and their city, when we cover it), from the
// country and city our edge already reads for pricing and consent. No browser location prompt.
export default function NearMePicker({ cities }: { cities: NearMeCity[] }) {
  const { geo, loaded } = useGeo();
  const [query, setQuery] = useState('');

  const countrySlug = useMemo(
    () => COUNTRIES_WITH_HOTELS.find((c) => c.code === geo.countryCode)?.slug || '',
    [geo.countryCode],
  );
  const inCountry = useMemo(() => cities.filter((c) => c[2] === countrySlug), [cities, countrySlug]);
  const hereCity = useMemo(() => {
    const s = geo.city ? slugify(geo.city) : '';
    return s ? inCountry.find((c) => c[1] === s) || null : null;
  }, [geo.city, inCountry]);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    return cities.filter((c) => c[0].toLowerCase().includes(q) || c[3].toLowerCase().includes(q)).slice(0, 12);
  }, [cities, query]);

  const cityLink = (c: NearMeCity, big = false) => (
    <Link
      key={`${c[2]}/${c[1]}`}
      href={`/${c[2]}/${c[1]}`}
      prefetch={false}
      className={`block rounded-xl border border-border px-4 py-3 hover:border-accent transition-colors ${big ? 'bg-accent/5' : ''}`}
    >
      <span className="font-semibold text-text-main">{c[0]}</span>
      <span className="block text-xs text-text-muted mt-0.5">
        {c[3]} · {c[4]} {c[4] === 1 ? 'hotel' : 'hotels'}{c[5] > 0 ? ` · ${c[5]} confirmed` : ''}
      </span>
    </Link>
  );

  return (
    <div className="mb-12">
      <label htmlFor="near-me-search" className="block text-sm font-semibold text-text-main mb-2">
        Search a city or country
      </label>
      <input
        id="near-me-search"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="e.g. Chicago, Goa, Japan"
        autoComplete="off"
        className="w-full max-w-md rounded-full border border-border px-4 py-2.5 text-sm mb-4 focus:outline-none focus:border-accent"
      />
      {matches.length > 0 && <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">{matches.map((c) => cityLink(c))}</div>}
      {query.trim().length >= 2 && matches.length === 0 && (
        <p className="text-sm text-text-muted mb-8">No city found for &quot;{query.trim()}&quot;. Try a nearby larger city.</p>
      )}

      {loaded && hereCity && (
        <section className="mb-8">
          <h2 className="font-heading text-xl font-bold text-accent-secondary mb-3">In {hereCity[0]}</h2>
          <div className="max-w-md">{cityLink(hereCity, true)}</div>
        </section>
      )}

      {loaded && inCountry.length > 0 && (
        <section className="mb-8">
          <h2 className="font-heading text-xl font-bold text-accent-secondary mb-3">
            Cities in {inCountry[0][3]}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {inCountry.filter((c) => c !== hereCity).slice(0, 12).map((c) => cityLink(c))}
          </div>
          <p className="text-xs text-text-muted mt-3">
            Based on the country your connection comes from. Not right? Search above or pick from the list below.
          </p>
        </section>
      )}
    </div>
  );
}
