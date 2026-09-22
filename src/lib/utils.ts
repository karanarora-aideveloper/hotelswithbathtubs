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
  'french-polynesia': { dbCountry: 'French Polynesia', slug: 'french-polynesia', displayName: 'French Polynesia' },
  'french polynesia': { dbCountry: 'French Polynesia', slug: 'french-polynesia', displayName: 'French Polynesia' },
  'seychelles': { dbCountry: 'Seychelles', slug: 'seychelles', displayName: 'Seychelles' },
  'mauritius': { dbCountry: 'Mauritius', slug: 'mauritius', displayName: 'Mauritius' },
  'fiji': { dbCountry: 'Fiji', slug: 'fiji', displayName: 'Fiji' },
  'germany': { dbCountry: 'Germany', slug: 'germany', displayName: 'Germany' },
  'portugal': { dbCountry: 'Portugal', slug: 'portugal', displayName: 'Portugal' },
  'south-africa': { dbCountry: 'South Africa', slug: 'south-africa', displayName: 'South Africa' },
  'south africa': { dbCountry: 'South Africa', slug: 'south-africa', displayName: 'South Africa' },
  'austria': { dbCountry: 'Austria', slug: 'austria', displayName: 'Austria' },
  'czechia': { dbCountry: 'Czechia', slug: 'czechia', displayName: 'Czechia' },
  'czech-republic': { dbCountry: 'Czechia', slug: 'czechia', displayName: 'Czechia' },
  'czech republic': { dbCountry: 'Czechia', slug: 'czechia', displayName: 'Czechia' },
  'hungary': { dbCountry: 'Hungary', slug: 'hungary', displayName: 'Hungary' },
  'ireland': { dbCountry: 'Ireland', slug: 'ireland', displayName: 'Ireland' },
  'brazil': { dbCountry: 'Brazil', slug: 'brazil', displayName: 'Brazil' },
  'costa-rica': { dbCountry: 'Costa Rica', slug: 'costa-rica', displayName: 'Costa Rica' },
  'costa rica': { dbCountry: 'Costa Rica', slug: 'costa-rica', displayName: 'Costa Rica' },
  'saint-lucia': { dbCountry: 'Saint Lucia', slug: 'saint-lucia', displayName: 'Saint Lucia' },
  'saint lucia': { dbCountry: 'Saint Lucia', slug: 'saint-lucia', displayName: 'Saint Lucia' },
  'st-lucia': { dbCountry: 'Saint Lucia', slug: 'saint-lucia', displayName: 'Saint Lucia' },
  'st lucia': { dbCountry: 'Saint Lucia', slug: 'saint-lucia', displayName: 'Saint Lucia' },
  'jamaica': { dbCountry: 'Jamaica', slug: 'jamaica', displayName: 'Jamaica' },
  'bahamas': { dbCountry: 'Bahamas', slug: 'bahamas', displayName: 'Bahamas' },
  'the-bahamas': { dbCountry: 'Bahamas', slug: 'bahamas', displayName: 'Bahamas' },
  'dominican-republic': { dbCountry: 'Dominican Republic', slug: 'dominican-republic', displayName: 'Dominican Republic' },
  'dominican republic': { dbCountry: 'Dominican Republic', slug: 'dominican-republic', displayName: 'Dominican Republic' },
  'turks-and-caicos': { dbCountry: 'Turks and Caicos', slug: 'turks-and-caicos', displayName: 'Turks & Caicos' },
  'turks and caicos': { dbCountry: 'Turks and Caicos', slug: 'turks-and-caicos', displayName: 'Turks & Caicos' },
  'barbados': { dbCountry: 'Barbados', slug: 'barbados', displayName: 'Barbados' },
  'aruba': { dbCountry: 'Aruba', slug: 'aruba', displayName: 'Aruba' },
  'iceland': { dbCountry: 'Iceland', slug: 'iceland', displayName: 'Iceland' },
  'norway': { dbCountry: 'Norway', slug: 'norway', displayName: 'Norway' },
  'finland': { dbCountry: 'Finland', slug: 'finland', displayName: 'Finland' },
  'sweden': { dbCountry: 'Sweden', slug: 'sweden', displayName: 'Sweden' },
  'denmark': { dbCountry: 'Denmark', slug: 'denmark', displayName: 'Denmark' },
  'south-korea': { dbCountry: 'South Korea', slug: 'south-korea', displayName: 'South Korea' },
  'south korea': { dbCountry: 'South Korea', slug: 'south-korea', displayName: 'South Korea' },
  'korea': { dbCountry: 'South Korea', slug: 'south-korea', displayName: 'South Korea' },
  'taiwan': { dbCountry: 'Taiwan', slug: 'taiwan', displayName: 'Taiwan' },
  'vietnam': { dbCountry: 'Vietnam', slug: 'vietnam', displayName: 'Vietnam' },
  'sri-lanka': { dbCountry: 'Sri Lanka', slug: 'sri-lanka', displayName: 'Sri Lanka' },
  'sri lanka': { dbCountry: 'Sri Lanka', slug: 'sri-lanka', displayName: 'Sri Lanka' },
  'croatia': { dbCountry: 'Croatia', slug: 'croatia', displayName: 'Croatia' },
  'morocco': { dbCountry: 'Morocco', slug: 'morocco', displayName: 'Morocco' },
  'tanzania': { dbCountry: 'Tanzania', slug: 'tanzania', displayName: 'Tanzania' },
  'chile': { dbCountry: 'Chile', slug: 'chile', displayName: 'Chile' },
  'argentina': { dbCountry: 'Argentina', slug: 'argentina', displayName: 'Argentina' },
  'peru': { dbCountry: 'Peru', slug: 'peru', displayName: 'Peru' },
  'colombia': { dbCountry: 'Colombia', slug: 'colombia', displayName: 'Colombia' },
  'poland': { dbCountry: 'Poland', slug: 'poland', displayName: 'Poland' },
  'slovenia': { dbCountry: 'Slovenia', slug: 'slovenia', displayName: 'Slovenia' },
  'qatar': { dbCountry: 'Qatar', slug: 'qatar', displayName: 'Qatar' },
  'oman': { dbCountry: 'Oman', slug: 'oman', displayName: 'Oman' },
  'bahrain': { dbCountry: 'Bahrain', slug: 'bahrain', displayName: 'Bahrain' },
  'jordan': { dbCountry: 'Jordan', slug: 'jordan', displayName: 'Jordan' },
  'saudi-arabia': { dbCountry: 'Saudi Arabia', slug: 'saudi-arabia', displayName: 'Saudi Arabia' },
  'saudi arabia': { dbCountry: 'Saudi Arabia', slug: 'saudi-arabia', displayName: 'Saudi Arabia' },
  'philippines': { dbCountry: 'Philippines', slug: 'philippines', displayName: 'Philippines' },
  'the-philippines': { dbCountry: 'Philippines', slug: 'philippines', displayName: 'Philippines' },
  'cambodia': { dbCountry: 'Cambodia', slug: 'cambodia', displayName: 'Cambodia' },
  'laos': { dbCountry: 'Laos', slug: 'laos', displayName: 'Laos' },
  'nepal': { dbCountry: 'Nepal', slug: 'nepal', displayName: 'Nepal' },
  'estonia': { dbCountry: 'Estonia', slug: 'estonia', displayName: 'Estonia' },
  'latvia': { dbCountry: 'Latvia', slug: 'latvia', displayName: 'Latvia' },
  'lithuania': { dbCountry: 'Lithuania', slug: 'lithuania', displayName: 'Lithuania' },
  'georgia': { dbCountry: 'Georgia', slug: 'georgia', displayName: 'Georgia' },
  'azerbaijan': { dbCountry: 'Azerbaijan', slug: 'azerbaijan', displayName: 'Azerbaijan' },
  'cyprus': { dbCountry: 'Cyprus', slug: 'cyprus', displayName: 'Cyprus' },
  'malta': { dbCountry: 'Malta', slug: 'malta', displayName: 'Malta' },
  'tunisia': { dbCountry: 'Tunisia', slug: 'tunisia', displayName: 'Tunisia' },
  'egypt': { dbCountry: 'Egypt', slug: 'egypt', displayName: 'Egypt' },
  'uzbekistan': { dbCountry: 'Uzbekistan', slug: 'uzbekistan', displayName: 'Uzbekistan' },
  'kazakhstan': { dbCountry: 'Kazakhstan', slug: 'kazakhstan', displayName: 'Kazakhstan' },
  'mongolia': { dbCountry: 'Mongolia', slug: 'mongolia', displayName: 'Mongolia' },
  'belize': { dbCountry: 'Belize', slug: 'belize', displayName: 'Belize' },
  'guatemala': { dbCountry: 'Guatemala', slug: 'guatemala', displayName: 'Guatemala' },
  'panama': { dbCountry: 'Panama', slug: 'panama', displayName: 'Panama' },
  'kenya': { dbCountry: 'Kenya', slug: 'kenya', displayName: 'Kenya' },
  'rwanda': { dbCountry: 'Rwanda', slug: 'rwanda', displayName: 'Rwanda' },
  'zimbabwe': { dbCountry: 'Zimbabwe', slug: 'zimbabwe', displayName: 'Zimbabwe' },
  'namibia': { dbCountry: 'Namibia', slug: 'namibia', displayName: 'Namibia' },
  'montenegro': { dbCountry: 'Montenegro', slug: 'montenegro', displayName: 'Montenegro' },
  'albania': { dbCountry: 'Albania', slug: 'albania', displayName: 'Albania' },
  'bosnia-and-herzegovina': { dbCountry: 'Bosnia and Herzegovina', slug: 'bosnia-and-herzegovina', displayName: 'Bosnia and Herzegovina' },
  'bosnia and herzegovina': { dbCountry: 'Bosnia and Herzegovina', slug: 'bosnia-and-herzegovina', displayName: 'Bosnia and Herzegovina' },
  'bosnia': { dbCountry: 'Bosnia and Herzegovina', slug: 'bosnia-and-herzegovina', displayName: 'Bosnia and Herzegovina' },
  'north-macedonia': { dbCountry: 'North Macedonia', slug: 'north-macedonia', displayName: 'North Macedonia' },
  'north macedonia': { dbCountry: 'North Macedonia', slug: 'north-macedonia', displayName: 'North Macedonia' },
  'macedonia': { dbCountry: 'North Macedonia', slug: 'north-macedonia', displayName: 'North Macedonia' },
  'cape-verde': { dbCountry: 'Cape Verde', slug: 'cape-verde', displayName: 'Cape Verde' },
  'cape verde': { dbCountry: 'Cape Verde', slug: 'cape-verde', displayName: 'Cape Verde' },
  'cabo-verde': { dbCountry: 'Cape Verde', slug: 'cape-verde', displayName: 'Cape Verde' },
  'cabo verde': { dbCountry: 'Cape Verde', slug: 'cape-verde', displayName: 'Cape Verde' },
  'bermuda': { dbCountry: 'Bermuda', slug: 'bermuda', displayName: 'Bermuda' },
  'greenland': { dbCountry: 'Greenland', slug: 'greenland', displayName: 'Greenland' },
  'faroe-islands': { dbCountry: 'Faroe Islands', slug: 'faroe-islands', displayName: 'Faroe Islands' },
  'faroe islands': { dbCountry: 'Faroe Islands', slug: 'faroe-islands', displayName: 'Faroe Islands' },
  'cook-islands': { dbCountry: 'Cook Islands', slug: 'cook-islands', displayName: 'Cook Islands' },
  'cook islands': { dbCountry: 'Cook Islands', slug: 'cook-islands', displayName: 'Cook Islands' },
  'samoa': { dbCountry: 'Samoa', slug: 'samoa', displayName: 'Samoa' },
  'vanuatu': { dbCountry: 'Vanuatu', slug: 'vanuatu', displayName: 'Vanuatu' },
  'new-caledonia': { dbCountry: 'New Caledonia', slug: 'new-caledonia', displayName: 'New Caledonia' },
  'new caledonia': { dbCountry: 'New Caledonia', slug: 'new-caledonia', displayName: 'New Caledonia' },
  'madagascar': { dbCountry: 'Madagascar', slug: 'madagascar', displayName: 'Madagascar' },
  'mozambique': { dbCountry: 'Mozambique', slug: 'mozambique', displayName: 'Mozambique' },
  'botswana': { dbCountry: 'Botswana', slug: 'botswana', displayName: 'Botswana' },
  'zambia': { dbCountry: 'Zambia', slug: 'zambia', displayName: 'Zambia' },
  'honduras': { dbCountry: 'Honduras', slug: 'honduras', displayName: 'Honduras' },
  'nicaragua': { dbCountry: 'Nicaragua', slug: 'nicaragua', displayName: 'Nicaragua' },
  'curacao': { dbCountry: 'Curacao', slug: 'curacao', displayName: 'Curaçao' },
  'curaçao': { dbCountry: 'Curacao', slug: 'curacao', displayName: 'Curaçao' },
  'antigua-and-barbuda': { dbCountry: 'Antigua and Barbuda', slug: 'antigua-and-barbuda', displayName: 'Antigua & Barbuda' },
  'antigua and barbuda': { dbCountry: 'Antigua and Barbuda', slug: 'antigua-and-barbuda', displayName: 'Antigua & Barbuda' },
  'antigua': { dbCountry: 'Antigua and Barbuda', slug: 'antigua-and-barbuda', displayName: 'Antigua & Barbuda' },
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
