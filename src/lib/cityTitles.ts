/**
 * Custom SERP-optimized Google page titles for top 20 cities (TEXT-APPLY1 / Sheet T50).
 * All other cities use the standard getCityPageTitle template in src/lib/seo.ts.
 */

type TitleFormatter = (count: number) => string;

const SPECIAL_CITY_TITLES: Record<string, TitleFormatter> = {
  'india:kolkata': (count) => `Hotels with Bathtub in Kolkata: ${count} ${count === 1 ? 'Hotel' : 'Hotels'} (2026)`,
  'usa:new-york': () => 'NYC Hotels with Soaking Tubs and Bathtubs (2026)',
  'india:ahmedabad': (count) => `Hotels with Bathtub in Ahmedabad: ${count} ${count === 1 ? 'Hotel' : 'Hotels'} (2026)`,
  'india:delhi': (count) => `Hotels with Bathtub in Delhi: ${count} ${count === 1 ? 'Hotel' : 'Hotels'} (2026)`,
  'india:manali': (count) => `Hotels with Bathtub in Manali: ${count} ${count === 1 ? 'Hotel' : 'Hotels'} (2026)`,
  'india:lucknow': (count) => `Hotels with Bathtub in Lucknow: ${count} ${count === 1 ? 'Hotel' : 'Hotels'} (2026)`,
  'india:indore': (count) => `Hotels with Bathtub in Indore: ${count} ${count === 1 ? 'Hotel' : 'Hotels'} (2026)`,
  'usa:miami': () => 'Miami Hotels with Jacuzzi and Bathtub (2026)',
  'usa:orlando': () => 'Orlando Hotels with Jacuzzi in Room (2026)',
  'india:bhopal': (count) => `Hotels with Bathtub in Bhopal: ${count} ${count === 1 ? 'Hotel' : 'Hotels'} (2026)`,
  'singapore:singapore': (count) => `Hotels with Bathtub in Singapore: ${count} ${count === 1 ? 'Hotel' : 'Hotels'} (2026)`,
  'thailand:bangkok': (count) => `Hotels with Bathtub in Bangkok: ${count} ${count === 1 ? 'Hotel' : 'Hotels'} (2026)`,
  'india:bangalore': (count) => `Hotels with Bathtub in Bangalore: ${count} ${count === 1 ? 'Hotel' : 'Hotels'} (2026)`,
  'india:mumbai': (count) => `Hotels with Bathtub in Mumbai: ${count} ${count === 1 ? 'Hotel' : 'Hotels'} (2026)`,
  'spain:barcelona': () => 'Barcelona Hotels with Hot Tub and Bathtub (2026)',
  'india:udaipur': (count) => `Hotels with Bathtub in Udaipur: ${count} ${count === 1 ? 'Hotel' : 'Hotels'} (2026)`,
  'india:mount-abu': () => 'Mount Abu Hotels with Bathtub and Jacuzzi (2026)',
  'usa:los-angeles': () => 'Los Angeles Hotels with Jacuzzi in Room (2026)',
  'uk:london': (count) => `London Hotels with Bathtubs: ${count} ${count === 1 ? 'Hotel' : 'Hotels'} (2026)`,
  'united-kingdom:london': (count) => `London Hotels with Bathtubs: ${count} ${count === 1 ? 'Hotel' : 'Hotels'} (2026)`,
  'india:jaipur': (count) => `Hotels with Bathtub in Jaipur: ${count} ${count === 1 ? 'Hotel' : 'Hotels'} (2026)`,
};

export function getSpecialCityTitle(countrySlug: string, citySlug: string, count: number): string | null {
  const key = `${countrySlug.toLowerCase()}:${citySlug.toLowerCase()}`;
  const formatter = SPECIAL_CITY_TITLES[key];
  if (!formatter) return null;
  return formatter(count);
}
