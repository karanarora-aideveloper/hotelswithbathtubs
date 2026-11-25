/**
 * Custom SERP-optimized Google page titles for top 20 cities (TEXT-APPLY1 / Sheet T50).
 * All other cities use the standard getCityPageTitle template in src/lib/seo.ts.
 */

type TitleFormatter = (count: number) => string;

// Current year, so titles never look a year old (was hard-coded "(2026)").
const Y = new Date().getFullYear();

const SPECIAL_CITY_TITLES: Record<string, TitleFormatter> = {
  'india:kolkata': (count) => `Hotels with Bathtub in Kolkata: ${count} ${count === 1 ? 'Hotel' : 'Hotels'} (${Y})`,
  'usa:new-york': () => `NYC Hotels with Soaking Tubs and Bathtubs (${Y})`,
  'india:ahmedabad': (count) => `Hotels with Bathtub in Ahmedabad: ${count} ${count === 1 ? 'Hotel' : 'Hotels'} (${Y})`,
  'india:delhi': (count) => `Hotels with Bathtub in Delhi: ${count} ${count === 1 ? 'Hotel' : 'Hotels'} (${Y})`,
  'india:manali': (count) => `Hotels with Bathtub in Manali: ${count} ${count === 1 ? 'Hotel' : 'Hotels'} (${Y})`,
  'india:lucknow': (count) => `Hotels with Bathtub in Lucknow: ${count} ${count === 1 ? 'Hotel' : 'Hotels'} (${Y})`,
  'india:indore': (count) => `Hotels with Bathtub in Indore: ${count} ${count === 1 ? 'Hotel' : 'Hotels'} (${Y})`,
  'usa:miami': () => `Miami Hotels with Jacuzzi and Bathtub (${Y})`,
  'usa:orlando': () => `Orlando Hotels with Jacuzzi in Room (${Y})`,
  'india:bhopal': (count) => `Hotels with Bathtub in Bhopal: ${count} ${count === 1 ? 'Hotel' : 'Hotels'} (${Y})`,
  'singapore:singapore': (count) => `Hotels with Bathtub in Singapore: ${count} ${count === 1 ? 'Hotel' : 'Hotels'} (${Y})`,
  'thailand:bangkok': (count) => `Hotels with Bathtub in Bangkok: ${count} ${count === 1 ? 'Hotel' : 'Hotels'} (${Y})`,
  'india:bangalore': (count) => `Hotels with Bathtub in Bangalore: ${count} ${count === 1 ? 'Hotel' : 'Hotels'} (${Y})`,
  'india:mumbai': (count) => `Hotels with Bathtub in Mumbai: ${count} ${count === 1 ? 'Hotel' : 'Hotels'} (${Y})`,
  'spain:barcelona': () => `Barcelona Hotels with Hot Tub and Bathtub (${Y})`,
  'india:udaipur': (count) => `Hotels with Bathtub in Udaipur: ${count} ${count === 1 ? 'Hotel' : 'Hotels'} (${Y})`,
  'india:mount-abu': () => `Mount Abu Hotels with Bathtub and Jacuzzi (${Y})`,
  'usa:los-angeles': () => `Los Angeles Hotels with Jacuzzi in Room (${Y})`,
  'uk:london': (count) => `London Hotels with Baths & Bathtubs: ${count} ${count === 1 ? 'Hotel' : 'Hotels'} (${Y})`,
  'united-kingdom:london': (count) => `London Hotels with Baths & Bathtubs: ${count} ${count === 1 ? 'Hotel' : 'Hotels'} (${Y})`,
  'india:jaipur': (count) => `Hotels with Bathtub in Jaipur: ${count} ${count === 1 ? 'Hotel' : 'Hotels'} (${Y})`,
};

export function getSpecialCityTitle(countrySlug: string, citySlug: string, count: number): string | null {
  const key = `${countrySlug.toLowerCase()}:${citySlug.toLowerCase()}`;
  const formatter = SPECIAL_CITY_TITLES[key];
  if (!formatter) return null;
  return formatter(count);
}
