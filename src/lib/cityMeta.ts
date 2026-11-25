import { isJacuzziRoom } from '@/lib/utils';
import { getLinkedPartners } from '@/lib/evidence';
import { isHotelConfirmed } from '@/lib/hotelText';
import { primaryNeighborhood } from '@/lib/location';

// GROWTH-FIX1 (25 Nov 2026): city titles and descriptions are written from each city's own
// data, so search results differ per city instead of repeating one template sentence.

export type CityMetaHotel = {
  tubType?: string | null;
  roomType?: string | null;
  amenities?: unknown;
  neighborhood?: string | null;
  importBatch?: string | null;
  bookingTubLabels?: string[] | null;
  bookingUrl?: string | null;
  agodaUrl?: string | null;
  mmtUrl?: string | null;
  makemytripUrl?: string | null;
  cleartripUrl?: string | null;
  easemytripUrl?: string | null;
  airbnbUrl?: string | null;
  tripUrl?: string | null;
  expediaUrl?: string | null;
  hotelsComUrl?: string | null;
  vrboUrl?: string | null;
  url?: string | null;
};

export const CITY_META_FIELDS =
  'tubType roomType amenities neighborhood importBatch bookingTubLabels bookingUrl agodaUrl mmtUrl makemytripUrl cleartripUrl easemytripUrl airbnbUrl tripUrl expediaUrl hotelsComUrl vrboUrl url';

export type CityStats = {
  count: number;
  jacuzzi: number;
  bathtub: number;
  confirmed: number;
  partners: string[];
  areas: string[];
};

export function cityStats(hotels: CityMetaHotel[], cityName: string): CityStats {
  const partnerCount = new Map<string, number>();
  const areaCount = new Map<string, number>();
  let jacuzzi = 0;
  let confirmed = 0;
  for (const h of hotels) {
    if (isJacuzziRoom(h)) jacuzzi++;
    if (isHotelConfirmed(h)) confirmed++;
    for (const p of getLinkedPartners(h)) partnerCount.set(p, (partnerCount.get(p) || 0) + 1);
    const area = primaryNeighborhood(h.neighborhood, cityName);
    if (area && area.toLowerCase() !== cityName.toLowerCase()) areaCount.set(area, (areaCount.get(area) || 0) + 1);
  }
  const byCount = (m: Map<string, number>) => [...m.entries()].sort((a, b) => b[1] - a[1]).map(([k]) => k);
  return {
    count: hotels.length,
    jacuzzi,
    bathtub: hotels.length - jacuzzi,
    confirmed,
    partners: byCount(partnerCount).filter((p) => p !== 'Airbnb').slice(0, 3),
    areas: byCount(areaCount).filter((a) => (areaCount.get(a) || 0) >= 2).slice(0, 2),
  };
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

function listJoin(items: string[]): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

/** Search-result title, at most about 60 characters, most specific wording first. */
export function buildCityTitle(cityName: string, countrySlug: string, s: CityStats, year: number): string {
  const uk = countrySlug === 'uk' || countrySlug === 'united-kingdom';
  const tubPhrase = uk ? 'Baths' : 'Bathtub';
  const hotels = plural(s.count, 'Hotel', 'Hotels');
  const candidates: string[] = [];
  if (s.jacuzzi >= 2) {
    candidates.push(`${cityName} Hotels with Jacuzzi & ${tubPhrase}: ${hotels} (${year})`);
    candidates.push(`${cityName} Hotels with Jacuzzi & ${tubPhrase} (${year})`);
  }
  candidates.push(`Hotels with ${tubPhrase} in ${cityName}: ${hotels} (${year})`);
  candidates.push(`Hotels with ${tubPhrase} in ${cityName} (${year})`);
  candidates.push(`${tubPhrase} Hotels in ${cityName} (${year})`);
  return candidates.find((t) => t.length <= 60) || candidates[candidates.length - 1];
}

/** Meta description from the city's own numbers, at most about 155 characters. */
export function buildCityDescription(cityName: string, countrySlug: string, s: CityStats): string {
  const uk = countrySlug === 'uk' || countrySlug === 'united-kingdom';
  const tub = uk ? 'bath' : 'bathtub';
  const parts: string[] = [];
  if (s.jacuzzi > 0 && s.bathtub > 0) {
    parts.push(`${plural(s.count, 'hotel', 'hotels')} in ${cityName} with a private ${tub} or jacuzzi in the room: ${s.jacuzzi} with a jacuzzi or hot tub, ${s.bathtub} with a ${tub}.`);
  } else if (s.jacuzzi > 0) {
    parts.push(`${plural(s.count, 'hotel', 'hotels')} in ${cityName} with a jacuzzi or hot tub in the room.`);
  } else {
    parts.push(`${plural(s.count, 'hotel', 'hotels')} in ${cityName} with a private ${tub} in the room.`);
  }
  if (s.confirmed > 0) parts.push(`${s.confirmed} checked on Booking.com.`);
  if (s.areas.length) parts.push(`In ${listJoin(s.areas)} and more.`);
  parts.push('See the exact room to book' + (s.partners.length ? ` on ${listJoin(s.partners)}.` : '.'));
  let out = '';
  for (const p of parts) {
    const next = out ? `${out} ${p}` : p;
    if (next.length > 155) continue;
    out = next;
  }
  return out || parts[0].slice(0, 155);
}
