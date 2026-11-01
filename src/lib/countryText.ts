/**
 * Data-based intro text generator for country pages.
 * Approved in drafts/country-intros1.md, country-intros2.md, country-intros3.md.
 */

export interface CountryHotelLike {
  city?: string | null;
  tubType?: string | null;
  [key: string]: any;
}

const THE_COUNTRIES = new Set([
  'usa',
  'uk',
  'philippines',
  'bahamas',
  'cook islands',
  'dominican republic',
  'faroe islands',
  'uae',
  'seychelles',
  'netherlands',
  'maldives',
  'united kingdom',
]);

export function buildCountryIntro(countryName: string, countryHotels: CountryHotelLike[]): string {
  if (!countryHotels || countryHotels.length === 0) return '';
  const total = countryHotels.length;
  const hotelNoun = total === 1 ? 'hotel' : 'hotels';
  const totalFormatted = total.toLocaleString('en-US');

  const inPrefix = THE_COUNTRIES.has((countryName || '').toLowerCase().trim())
    ? `in the ${countryName}`
    : `in ${countryName}`;

  let hasBathtub = false;
  let hasJetted = false;
  let hasHotTub = false;
  for (const h of countryHotels) {
    const tub = (h.tubType || '').toLowerCase();
    if (/hot[- ]tub/i.test(tub)) {
      hasHotTub = true;
    } else if (/jacuzzi|whirlpool|jetted|hydro/i.test(tub)) {
      hasJetted = true;
    } else {
      hasBathtub = true;
    }
  }

  let tubPhrase = 'bathtub';
  if (hasBathtub && hasJetted && hasHotTub) tubPhrase = 'bathtub, jetted tub or hot tub';
  else if (hasBathtub && hasJetted) tubPhrase = 'bathtub or jetted tub';
  else if (hasBathtub && hasHotTub) tubPhrase = 'bathtub or hot tub';
  else if (hasBathtub) tubPhrase = 'bathtub';
  else if (hasJetted && hasHotTub) tubPhrase = 'jetted tub or hot tub';
  else if (hasJetted) tubPhrase = 'jetted tub';
  else if (hasHotTub) tubPhrase = 'hot tub';

  const sentence1 = `We list ${totalFormatted} ${hotelNoun} ${inPrefix} with a ${tubPhrase} in the room.`;

  const cityCountMap = new Map<string, number>();
  for (const h of countryHotels) {
    const c = h.city?.trim() || 'Unknown';
    cityCountMap.set(c, (cityCountMap.get(c) || 0) + 1);
  }

  const sortedCities = [...cityCountMap.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const totalCitiesCount = sortedCities.length;
  const topCities = sortedCities.slice(0, 5);
  const topCitiesSum = topCities.reduce((sum, [, count]) => sum + count, 0);
  const coversAll = topCitiesSum === total;

  const formattedCities = topCities.map(([c, count]) => `${c} (${count.toLocaleString('en-US')})`);
  let citiesText = '';
  if (formattedCities.length === 1) {
    citiesText = formattedCities[0];
  } else if (formattedCities.length === 2) {
    citiesText = `${formattedCities[0]} and ${formattedCities[1]}`;
  } else {
    citiesText = `${formattedCities.slice(0, -1).join(', ')} and ${formattedCities[formattedCities.length - 1]}`;
  }

  let sentence2 = '';
  if (total === 1) {
    sentence2 = `This hotel is in ${citiesText}.`;
  } else if (totalCitiesCount <= 2) {
    sentence2 = `All listings are in ${citiesText}.`;
  } else if (coversAll) {
    sentence2 = `These hotels are in ${citiesText}.`;
  } else {
    sentence2 = `Most are in ${citiesText}.`;
  }

  const sentence3 = 'Pick a city below to see each hotel and the room to book.';

  return `${sentence1} ${sentence2} ${sentence3}`;
}
