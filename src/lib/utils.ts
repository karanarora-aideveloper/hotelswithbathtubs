/**
 * Slugifies a given text string (e.g., replaces spaces/special characters with hyphens).
 */
export function slugify(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-');
}

/**
 * Capitalizes the first letter of each word in a hyphenated or spaced string.
 */
export function titleCase(str: string): string {
  if (!str) return '';
  return str
    .split(/[- ]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Escapes regex special characters to prevent RegExp injection/NoSQL injection vulnerabilities.
 */
export function escapeRegex(text: string): string {
  if (!text) return '';
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

const countryMap: Record<string, { dbCountry: string; slug: string; displayName: string }> = {
  'usa': { dbCountry: 'USA', slug: 'usa', displayName: 'USA' },
  'united-states': { dbCountry: 'USA', slug: 'usa', displayName: 'USA' },
  'united states': { dbCountry: 'USA', slug: 'usa', displayName: 'USA' },
  'uk': { dbCountry: 'UK', slug: 'uk', displayName: 'UK' },
  'united-kingdom': { dbCountry: 'UK', slug: 'uk', displayName: 'UK' },
  'united kingdom': { dbCountry: 'UK', slug: 'uk', displayName: 'UK' },
  'uae': { dbCountry: 'UAE', slug: 'uae', displayName: 'UAE' },
  'united-arab-emirates': { dbCountry: 'UAE', slug: 'uae', displayName: 'UAE' },
  'united arab emirates': { dbCountry: 'UAE', slug: 'uae', displayName: 'UAE' },
  'india': { dbCountry: 'India', slug: 'india', displayName: 'India' },
  'singapore': { dbCountry: 'Singapore', slug: 'singapore', displayName: 'Singapore' },
  'thailand': { dbCountry: 'Thailand', slug: 'thailand', displayName: 'Thailand' },
  'malaysia': { dbCountry: 'Malaysia', slug: 'malaysia', displayName: 'Malaysia' },
  'japan': { dbCountry: 'Japan', slug: 'japan', displayName: 'Japan' },
  'france': { dbCountry: 'France', slug: 'france', displayName: 'France' },
  'indonesia': { dbCountry: 'Indonesia', slug: 'indonesia', displayName: 'Indonesia' },
  'italy': { dbCountry: 'Italy', slug: 'italy', displayName: 'Italy' },
  'netherlands': { dbCountry: 'Netherlands', slug: 'netherlands', displayName: 'Netherlands' },
  'the-netherlands': { dbCountry: 'Netherlands', slug: 'netherlands', displayName: 'Netherlands' },
  'greece': { dbCountry: 'Greece', slug: 'greece', displayName: 'Greece' },
  'switzerland': { dbCountry: 'Switzerland', slug: 'switzerland', displayName: 'Switzerland' },
  'canada': { dbCountry: 'Canada', slug: 'canada', displayName: 'Canada' },
  'spain': { dbCountry: 'Spain', slug: 'spain', displayName: 'Spain' },
  'maldives': { dbCountry: 'Maldives', slug: 'maldives', displayName: 'Maldives' },
  'turkey': { dbCountry: 'Turkey', slug: 'turkey', displayName: 'Turkey' },
  'australia': { dbCountry: 'Australia', slug: 'australia', displayName: 'Australia' },
  'mexico': { dbCountry: 'Mexico', slug: 'mexico', displayName: 'Mexico' },
  'new-zealand': { dbCountry: 'New Zealand', slug: 'new-zealand', displayName: 'New Zealand' },
};

export function resolveCountry(raw: string): { dbCountry: string; slug: string; displayName: string; regex: RegExp } {
  const key = (raw || '').toLowerCase().trim().replace(/\s+/g, '-');
  const mapped = countryMap[key] || countryMap[(raw || '').toLowerCase().trim()];
  if (mapped) {
    return {
      ...mapped,
      regex: new RegExp(`^(${escapeRegex(mapped.dbCountry)}|${escapeRegex(mapped.displayName)}|${escapeRegex(raw)})$`, 'i')
    };
  }
  const clean = titleCase(raw);
  const slug = slugify(raw);
  return {
    dbCountry: clean,
    slug,
    displayName: clean,
    regex: new RegExp(`^${escapeRegex(raw.replace(/-/g, ' '))}$`, 'i')
  };
}
