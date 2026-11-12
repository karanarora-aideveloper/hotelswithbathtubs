// src/lib/hotelSlugMatch.ts

export const GENERIC_SLUG_MATCH_WORDS = new Set([
  'hotel', 'hotels', 'resort', 'resorts', 'suite', 'suites',
  'the', 'a', 'an', 'and', 'by', 'of', 'in', 'at', 'with', 'for',
  'collection', 'luxury', 'boutique', 'inn', 'lodge', 'spa',
  'bathtub', 'bathtubs', 'hothtub', 'tub', 'tubs', 'bath', 'baths',
  'jacuzzi', 'whirlpool', 'romantic', 'couples',
]);

/**
 * Extracts distinctive lowercase word tokens (length >= 2) from a string,
 * excluding generic stop words, city name tokens, and country name tokens.
 */
export function getDistinctiveTokens(
  text: string | undefined | null,
  cityName: string = '',
  countryName: string = ''
): string[] {
  if (!text) return [];

  const cityTokens = (cityName || '').toLowerCase().replace(/[^a-z0-9]/g, ' ').split(/\s+/).filter(Boolean);
  const countryTokens = (countryName || '').toLowerCase().replace(/[^a-z0-9]/g, ' ').split(/\s+/).filter(Boolean);
  const stopSet = new Set([...GENERIC_SLUG_MATCH_WORDS, ...cityTokens, ...countryTokens]);

  return text
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 2 && !stopSet.has(w));
}

/**
 * Checks whether a hotel's slug matches its name.
 * A hotel is considered a match if at least one distinctive name word appears in its slug.
 * If the hotel name has no distinctive tokens (e.g. only stop words), it defaults to true.
 */
export function isHotelSlugMatch(
  hotel: { name?: string | null; slug?: string | null; city?: string | null; country?: string | null },
  cityName: string = '',
  countryName: string = ''
): boolean {
  const slug = (hotel.slug || '').toLowerCase();
  if (!slug) return false;

  const resolvedCity = cityName || hotel.city || '';
  const resolvedCountry = countryName || hotel.country || '';

  const nameTokens = getDistinctiveTokens(hotel.name, resolvedCity, resolvedCountry);
  if (nameTokens.length === 0) return true;

  const slugTokens = getDistinctiveTokens(slug, resolvedCity, resolvedCountry);
  const slugTokenSet = new Set(slugTokens);

  return nameTokens.some((t) => slugTokenSet.has(t) || slug.includes(t));
}
