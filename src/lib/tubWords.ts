// src/lib/tubWords.ts
// Regional tub terminology mapping by destination / visitor country.
// Internal types: 'jetted' | 'bathtub' | 'hot' | 'soaking'

export type InternalTubType = 'jetted' | 'bathtub' | 'hot' | 'soaking';

export type TubWordMap = Record<InternalTubType, string>;

const SOUTH_ASIA = new Set([
  'in', 'pk', 'lk', 'np', 'bd', 'mv',
  'india', 'pakistan', 'sri-lanka', 'sri lanka', 'nepal', 'bangladesh', 'maldives'
]);

const NORTH_AMERICA = new Set([
  'us', 'usa', 'ca',
  'united-states', 'united states', 'united states of america', 'canada'
]);

const UK_IRELAND = new Set([
  'gb', 'uk', 'ie',
  'united-kingdom', 'united kingdom', 'great-britain', 'great britain', 'britain',
  'england', 'scotland', 'wales', 'northern-ireland', 'northern ireland', 'ireland'
]);

const OCEANIA = new Set([
  'au', 'nz',
  'australia', 'new-zealand', 'new zealand'
]);

const DACH = new Set([
  'de', 'at', 'ch',
  'germany', 'deutschland', 'austria', 'österreich', 'osterreich',
  'switzerland', 'schweiz', 'suisse'
]);

function normalizeCountry(country?: string | null): string {
  if (!country) return '';
  return country.trim().toLowerCase().replace(/_/g, '-');
}

export function normalizeTubType(type?: string | null): InternalTubType {
  if (!type) return 'bathtub';
  const lower = type.toLowerCase().trim();
  if (lower === 'jetted' || lower === 'jacuzzi' || lower === 'whirlpool' || lower === 'spa bath' || lower === 'spa') {
    return 'jetted';
  }
  if (lower === 'hot' || lower === 'hot tub' || lower === 'hot_tub' || lower === 'hottub') {
    return 'hot';
  }
  if (lower === 'soaking' || lower === 'soak' || lower === 'soaking tub' || lower === 'soaking bath') {
    return 'soaking';
  }
  if (lower === 'bathtub' || lower === 'bath' || lower === 'tub') {
    return 'bathtub';
  }

  if (lower.includes('hot tub')) return 'hot';
  if (lower.includes('soak')) return 'soaking';
  if (lower.includes('jetted') || lower.includes('jacuzzi') || lower.includes('whirlpool') || lower.includes('hydro') || lower.includes('spa bath')) {
    return 'jetted';
  }
  return 'bathtub';
}

export function tubWordsMap(country?: string | null): TubWordMap {
  const c = normalizeCountry(country);

  // UK & Ireland: Bath, Jacuzzi, Hot tub, Soaking bath
  if (UK_IRELAND.has(c)) {
    return {
      jetted: 'Jacuzzi',
      bathtub: 'Bath',
      hot: 'Hot tub',
      soaking: 'Soaking bath',
    };
  }

  // Australia & New Zealand: Bath, Spa bath, Hot tub, Soaking tub
  if (OCEANIA.has(c)) {
    return {
      jetted: 'Spa bath',
      bathtub: 'Bath',
      hot: 'Hot tub',
      soaking: 'Soaking tub',
    };
  }

  // Germany, Austria, Switzerland: Bathtub, Whirlpool, Hot tub, Soaking tub
  if (DACH.has(c)) {
    return {
      jetted: 'Whirlpool',
      bathtub: 'Bathtub',
      hot: 'Hot tub',
      soaking: 'Soaking tub',
    };
  }

  // South Asia: Bathtub, Jacuzzi, Hot tub, Soaking tub
  if (SOUTH_ASIA.has(c)) {
    return {
      jetted: 'Jacuzzi',
      bathtub: 'Bathtub',
      hot: 'Hot tub',
      soaking: 'Soaking tub',
    };
  }

  // USA, Canada: Bathtub, Jacuzzi, Hot tub, Soaking tub
  if (NORTH_AMERICA.has(c)) {
    return {
      jetted: 'Jacuzzi',
      bathtub: 'Bathtub',
      hot: 'Hot tub',
      soaking: 'Soaking tub',
    };
  }

  // Every other country: Bathtub, Jacuzzi, Hot tub, Soaking tub
  return {
    jetted: 'Jacuzzi',
    bathtub: 'Bathtub',
    hot: 'Hot tub',
    soaking: 'Soaking tub',
  };
}

export function tubWord(type: string, country?: string | null): string {
  const normType = normalizeTubType(type);
  const map = tubWordsMap(country);
  return map[normType];
}
