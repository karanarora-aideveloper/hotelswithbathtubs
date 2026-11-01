export interface CountryEntry {
  code: string;
  name: string;
  flag: string;
  slug: string;
}

// Convert 2-letter ISO country code to Unicode Flag Emoji
export function getFlagEmoji(countryCode: string): string {
  if (!countryCode || countryCode === 'XX' || countryCode.length !== 2) {
    return '🌍';
  }
  const upper = countryCode.toUpperCase();
  const codePoints = upper
    .split('')
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

// Authoritative mapping of countries where HotelsWithBathtubs has hotel inventory
export const COUNTRIES_WITH_HOTELS: CountryEntry[] = [
  // Top Featured Destinations
  { code: 'US', name: 'United States', flag: '🇺🇸', slug: 'usa' },
  { code: 'IN', name: 'India', flag: '🇮🇳', slug: 'india' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', slug: 'uk' },
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪', slug: 'uae' },
  { code: 'FR', name: 'France', flag: '🇫🇷', slug: 'france' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', slug: 'japan' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭', slug: 'thailand' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', slug: 'singapore' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹', slug: 'italy' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸', slug: 'spain' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', slug: 'germany' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', slug: 'australia' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', slug: 'canada' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩', slug: 'indonesia' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭', slug: 'switzerland' },
  { code: 'GR', name: 'Greece', flag: '🇬🇷', slug: 'greece' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱', slug: 'netherlands' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽', slug: 'mexico' },
  { code: 'TR', name: 'Turkey', flag: '🇹🇷', slug: 'turkey' },
  { code: 'MV', name: 'Maldives', flag: '🇲🇻', slug: 'maldives' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾', slug: 'malaysia' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦', slug: 'south-africa' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹', slug: 'portugal' },
  { code: 'AT', name: 'Austria', flag: '🇦🇹', slug: 'austria' },
  { code: 'CZ', name: 'Czechia', flag: '🇨🇿', slug: 'czechia' },
  { code: 'HU', name: 'Hungary', flag: '🇭🇺', slug: 'hungary' },
  { code: 'IE', name: 'Ireland', flag: '🇮🇪', slug: 'ireland' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿', slug: 'new-zealand' },
  { code: 'FJ', name: 'Fiji', flag: '🇫🇯', slug: 'fiji' },
  { code: 'MU', name: 'Mauritius', flag: '🇲🇺', slug: 'mauritius' },
  { code: 'SC', name: 'Seychelles', flag: '🇸🇨', slug: 'seychelles' },
  { code: 'PF', name: 'French Polynesia', flag: '🇵🇫', slug: 'french-polynesia' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷', slug: 'brazil' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷', slug: 'argentina' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱', slug: 'chile' },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴', slug: 'colombia' },
  { code: 'CR', name: 'Costa Rica', flag: '🇨🇷', slug: 'costa-rica' },
  { code: 'HR', name: 'Croatia', flag: '🇭🇷', slug: 'croatia' },
  { code: 'DK', name: 'Denmark', flag: '🇩🇰', slug: 'denmark' },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬', slug: 'egypt' },
  { code: 'FI', name: 'Finland', flag: '🇫🇮', slug: 'finland' },
  { code: 'IS', name: 'Iceland', flag: '🇮🇸', slug: 'iceland' },
  { code: 'JO', name: 'Jordan', flag: '🇯🇴', slug: 'jordan' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪', slug: 'kenya' },
  { code: 'MA', name: 'Morocco', flag: '🇲🇦', slug: 'morocco' },
  { code: 'NO', name: 'Norway', flag: '🇳🇴', slug: 'norway' },
  { code: 'PE', name: 'Peru', flag: '🇵🇪', slug: 'peru' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭', slug: 'philippines' },
  { code: 'PL', name: 'Poland', flag: '🇵🇱', slug: 'poland' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', slug: 'saudi-arabia' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷', slug: 'south-korea' },
  { code: 'LK', name: 'Sri Lanka', flag: '🇱🇰', slug: 'sri-lanka' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪', slug: 'sweden' },
  { code: 'TW', name: 'Taiwan', flag: '🇹🇼', slug: 'taiwan' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳', slug: 'vietnam' },
  { code: 'BE', name: 'Belgium', flag: '🇧🇪', slug: 'belgium' },
  { code: 'BS', name: 'Bahamas', flag: '🇧🇸', slug: 'bahamas' },
  { code: 'BB', name: 'Barbados', flag: '🇧🇧', slug: 'barbados' },
  { code: 'BM', name: 'Bermuda', flag: '🇧🇲', slug: 'bermuda' },
  { code: 'KH', name: 'Cambodia', flag: '🇰🇭', slug: 'cambodia' },
  { code: 'CY', name: 'Cyprus', flag: '🇨🇾', slug: 'cyprus' },
  { code: 'DO', name: 'Dominican Republic', flag: '🇩🇴', slug: 'dominican-republic' },
  { code: 'EC', name: 'Ecuador', flag: '🇪🇨', slug: 'ecuador' },
  { code: 'EE', name: 'Estonia', flag: '🇪🇪', slug: 'estonia' },
  { code: 'GE', name: 'Georgia', flag: '🇬🇪', slug: 'georgia' },
  { code: 'GT', name: 'Guatemala', flag: '🇬🇹', slug: 'guatemala' },
  { code: 'HK', name: 'Hong Kong', flag: '🇭🇰', slug: 'hong-kong' },
  { code: 'JM', name: 'Jamaica', flag: '🇯🇲', slug: 'jamaica' },
  { code: 'LA', name: 'Laos', flag: '🇱🇦', slug: 'laos' },
  { code: 'LV', name: 'Latvia', flag: '🇱🇻', slug: 'latvia' },
  { code: 'LT', name: 'Lithuania', flag: '🇱🇹', slug: 'lithuania' },
  { code: 'LU', name: 'Luxembourg', flag: '🇱🇺', slug: 'luxembourg' },
  { code: 'MO', name: 'Macau', flag: '🇲🇴', slug: 'macau' },
  { code: 'MT', name: 'Malta', flag: '🇲🇹', slug: 'malta' },
  { code: 'MC', name: 'Monaco', flag: '🇲🇨', slug: 'monaco' },
  { code: 'ME', name: 'Montenegro', flag: '🇲🇪', slug: 'montenegro' },
  { code: 'NP', name: 'Nepal', flag: '🇳🇵', slug: 'nepal' },
  { code: 'OM', name: 'Oman', flag: '🇴🇲', slug: 'oman' },
  { code: 'PA', name: 'Panama', flag: '🇵🇦', slug: 'panama' },
  { code: 'PR', name: 'Puerto Rico', flag: '🇵🇷', slug: 'puerto-rico' },
  { code: 'QA', name: 'Qatar', flag: '🇶🇦', slug: 'qatar' },
  { code: 'RO', name: 'Romania', flag: '🇷🇴', slug: 'romania' },
  { code: 'RS', name: 'Serbia', flag: '🇷🇸', slug: 'serbia' },
  { code: 'SK', name: 'Slovakia', flag: '🇸🇰', slug: 'slovakia' },
  { code: 'SI', name: 'Slovenia', flag: '🇸🇮', slug: 'slovenia' },
  { code: 'TZ', name: 'Tanzania', flag: '🇹🇿', slug: 'tanzania' },
  { code: 'UY', name: 'Uruguay', flag: '🇺🇾', slug: 'uruguay' },
];

const CODE_SET = new Set(COUNTRIES_WITH_HOTELS.map((c) => c.code));

const CODE_TO_NAME: Record<string, string> = {
  'US': 'USA',
  'IN': 'India',
  'GB': 'UK',
  'AE': 'UAE',
  'SG': 'Singapore',
  'TH': 'Thailand',
  'MY': 'Malaysia',
  'JP': 'Japan',
  'FR': 'France',
  'ID': 'Indonesia',
  'IT': 'Italy',
  'NL': 'Netherlands',
  'GR': 'Greece',
  'CH': 'Switzerland',
  'CA': 'Canada',
  'AU': 'Australia',
  'ES': 'Spain',
  'DE': 'Germany',
  'MX': 'Mexico',
  'TR': 'Turkey',
  'MV': 'Maldives',
  'ZA': 'South Africa',
  'PT': 'Portugal',
  'AT': 'Austria',
  'IE': 'Ireland',
  'NZ': 'New Zealand',
};

// Returns true if HotelsWithBathtubs has inventory in the given country
export function isCountryWithHotels(codeOrName: string): boolean {
  if (!codeOrName || codeOrName === 'XX') return false;
  const upper = codeOrName.trim().toUpperCase();
  if (CODE_SET.has(upper)) return true;

  const lower = codeOrName.trim().toLowerCase();
  return COUNTRIES_WITH_HOTELS.some(
    (c) =>
      c.code.toLowerCase() === lower ||
      c.name.toLowerCase() === lower ||
      c.slug === lower
  );
}

export function getCountryDisplayName(countryCode: string): string {
  if (!countryCode || countryCode === 'XX') return '';
  const upper = countryCode.toUpperCase();
  if (CODE_TO_NAME[upper]) return CODE_TO_NAME[upper];
  const found = COUNTRIES_WITH_HOTELS.find((c) => c.code === upper);
  return found ? found.name : countryCode;
}

export function guessCountryFromTimeZone(
  timeZone?: string
): { countryCode: string; country: string } | null {
  const tz =
    (timeZone ||
      (typeof Intl !== 'undefined'
        ? Intl.DateTimeFormat().resolvedOptions().timeZone
        : '')) ||
    '';
  if (!tz) return null;

  if (/Calcutta|Kolkata/i.test(tz)) return { countryCode: 'IN', country: 'India' };
  if (/London/i.test(tz)) return { countryCode: 'GB', country: 'UK' };
  if (/Dubai/i.test(tz)) return { countryCode: 'AE', country: 'UAE' };
  if (
    /New_York|Chicago|Denver|Los_Angeles|Phoenix|Anchorage|Honolulu|Detroit|Boise|Indiana/i.test(
      tz
    )
  ) {
    return { countryCode: 'US', country: 'USA' };
  }
  if (/Paris/i.test(tz)) return { countryCode: 'FR', country: 'France' };
  if (/Tokyo/i.test(tz)) return { countryCode: 'JP', country: 'Japan' };
  if (/Bangkok/i.test(tz)) return { countryCode: 'TH', country: 'Thailand' };
  if (/Singapore/i.test(tz)) return { countryCode: 'SG', country: 'Singapore' };
  if (/Kuala_Lumpur/i.test(tz)) return { countryCode: 'MY', country: 'Malaysia' };
  if (/Jakarta/i.test(tz)) return { countryCode: 'ID', country: 'Indonesia' };
  if (/Rome/i.test(tz)) return { countryCode: 'IT', country: 'Italy' };
  if (/Berlin/i.test(tz)) return { countryCode: 'DE', country: 'Germany' };
  if (/Madrid/i.test(tz)) return { countryCode: 'ES', country: 'Spain' };
  if (/Amsterdam/i.test(tz)) return { countryCode: 'NL', country: 'Netherlands' };
  if (/Athens/i.test(tz)) return { countryCode: 'GR', country: 'Greece' };
  if (/Zurich/i.test(tz)) return { countryCode: 'CH', country: 'Switzerland' };
  if (/Toronto|Vancouver|Montreal|Edmonton|Winnipeg/i.test(tz)) {
    return { countryCode: 'CA', country: 'Canada' };
  }
  if (/Sydney|Melbourne|Brisbane|Perth|Adelaide/i.test(tz)) {
    return { countryCode: 'AU', country: 'Australia' };
  }

  return null;
}
