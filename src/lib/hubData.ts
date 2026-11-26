// Data for the two search hubs (HUBS-1): /hotels-with-bathtub and /hotels-with-bathtub-near-me.
// One pass over the hotels: per city, how many hotels and how many are confirmed (Booking.com
// lists a bathtub or jacuzzi for the room). Reads MongoDB or the build snapshot.
import connectToDatabase from '@/lib/mongodb';
import Hotel from '@/models/Hotel';
import { resolveCountry, slugify } from '@/lib/utils';
import { isHotelConfirmed } from '@/lib/hotelText';
import { shouldIndexDestination } from '@/lib/indexing';

export type HubCity = {
  city: string;
  citySlug: string;
  country: string;
  countrySlug: string;
  hotelCount: number;
  confirmedCount: number;
  /** City pages with 3+ hotels are the ones we show to Google (indexing.ts). */
  indexed: boolean;
};

export type HubCountry = {
  name: string;
  slug: string;
  hotelCount: number;
  confirmedCount: number;
  cities: HubCity[];
};

export type HubData = {
  totalHotels: number;
  totalConfirmed: number;
  cities: HubCity[];
  countries: HubCountry[];
};

let cached: Promise<HubData> | null = null;

export function getHubData(): Promise<HubData> {
  if (!cached) cached = build();
  return cached;
}

async function build(): Promise<HubData> {
  await connectToDatabase();
  type HubHotel = { city?: string; country?: string; importBatch?: string; bookingTubLabels?: string[] };
  const hotels = (await Hotel.find({ flagged: { $ne: true } })
    .select('city country importBatch bookingTubLabels')
    .lean()) as unknown as HubHotel[];

  const cityMap = new Map<string, HubCity>();
  for (const h of hotels) {
    const city = (h.city || '').trim();
    const country = (h.country || '').trim();
    if (!city || !country) continue;
    const info = resolveCountry(country);
    const citySlug = slugify(city);
    const key = `${info.slug}/${citySlug}`;
    let c = cityMap.get(key);
    if (!c) {
      c = { city, citySlug, country: info.displayName, countrySlug: info.slug, hotelCount: 0, confirmedCount: 0, indexed: false };
      cityMap.set(key, c);
    }
    c.hotelCount++;
    if (isHotelConfirmed(h)) c.confirmedCount++;
  }

  const cities = [...cityMap.values()]
    .map((c) => ({ ...c, indexed: shouldIndexDestination(c.hotelCount) }))
    .sort((a, b) => b.hotelCount - a.hotelCount || a.city.localeCompare(b.city));

  const countryMap = new Map<string, HubCountry>();
  for (const c of cities) {
    let k = countryMap.get(c.countrySlug);
    if (!k) {
      k = { name: c.country, slug: c.countrySlug, hotelCount: 0, confirmedCount: 0, cities: [] };
      countryMap.set(c.countrySlug, k);
    }
    k.hotelCount += c.hotelCount;
    k.confirmedCount += c.confirmedCount;
    k.cities.push(c);
  }
  const countries = [...countryMap.values()].sort((a, b) => b.hotelCount - a.hotelCount || a.name.localeCompare(b.name));

  return {
    totalHotels: cities.reduce((s, c) => s + c.hotelCount, 0),
    totalConfirmed: cities.reduce((s, c) => s + c.confirmedCount, 0),
    cities,
    countries,
  };
}

/** Rounds down for headline claims: 6,344 → "6,300+". */
export function roundedCount(n: number): string {
  if (n < 100) return String(n);
  const step = n >= 1000 ? 100 : 10;
  return `${(Math.floor(n / step) * step).toLocaleString('en-US')}+`;
}
