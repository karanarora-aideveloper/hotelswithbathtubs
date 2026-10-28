const GENERIC_STOP_WORDS = new Set([
  'hotel', 'hotels', 'resort', 'resorts', 'spa', 'suites', 'suite', 'inn', 'lodge',
  'the', 'a', 'an', 'and', 'in', 'at', 'of', 'by', 'city', 'new', 'york', 'delhi',
  'luxury', 'boutique', 'international', 'collection'
]);

export function normalizeName(name) {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/\s*\(.*?\)/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

export function getSignificantWords(name) {
  return (name || '')
    .toLowerCase()
    .replace(/\s*\(.*?\)/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1 && !GENERIC_STOP_WORDS.has(w));
}

export function getSignificantWordOverlap(name1, name2) {
  const w1 = new Set(getSignificantWords(name1));
  const w2 = new Set(getSignificantWords(name2));
  if (w1.size === 0 || w2.size === 0) return 0;
  let common = 0;
  for (const w of w1) {
    if (w2.has(w)) common++;
  }
  return common / Math.max(w1.size, w2.size);
}

export function haversineKm(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function extractStreetNumber(addrStr) {
  if (!addrStr) return null;
  const m = addrStr.trim().match(/^(\d+[\w\-]*)/);
  if (m) return m[1].toLowerCase();
  const m2 = addrStr.match(/\b(\d+)\b/);
  return m2 ? m2[1] : null;
}

export const TOWN_ALIASES = {
  'paradise': ['las vegas', 'paradise'],
  'las vegas': ['las vegas', 'paradise', 'north las vegas'],
  'new york': ['new york', 'new york city', 'brooklyn', 'queens', 'manhattan'],
  'new york city': ['new york', 'new york city', 'brooklyn', 'queens', 'manhattan'],
  'orlando': ['orlando', 'kissimmee', 'lake buena vista', 'celebration'],
  'san diego': ['san diego', 'poway', 'el cajon', 'otay mesa', 'la jolla', 'coronado'],
  'portland': ['portland', 'gresham', 'interlachen', 'parkrose'],
  'miami': ['miami', 'miami beach', 'coral gables', 'doral'],
  'los angeles': ['los angeles', 'santa monica', 'west hollywood', 'beverly hills', 'burbank', 'north hollywood', 'hollywood', 'venice', 'playa del rey'],
  'washington': ['washington', 'washington dc', 'georgetown'],
  'washington dc': ['washington', 'washington dc', 'georgetown'],
  'san francisco': ['san francisco', 'fisherman\'s wharf'],
  'napa': ['napa', 'sonoma', 'st helena', 'calistoga', 'yountville'],
  'denver': ['denver', 'denver airport area', 'aurora'],
  'gatlinburg': ['gatlinburg', 'pigeon forge', 'sevierville'],
  'sedona': ['sedona', 'oak creek', 'village of oak creek']
};

export function townMatches(candTown, candCitySlug, targetAddress) {
  if (!targetAddress) return false;
  const addrLower = targetAddress.toLowerCase();
  const t = (candTown || '').toLowerCase();
  const c = (candCitySlug || '').replace(/-/g, ' ').toLowerCase();

  if (t && addrLower.includes(t)) return true;
  if (c && addrLower.includes(c)) return true;

  const aliases = TOWN_ALIASES[t] || TOWN_ALIASES[c] || [];
  for (const a of aliases) {
    if (addrLower.includes(a)) return true;
  }
  return false;
}

export function matchHotelAddress(candidate, targetAddress, targetTitle) {
  const candStreet = candidate.address?.street || '';
  const candTown = candidate.town || '';
  const candCitySlug = candidate.citySlug || '';
  const num1 = extractStreetNumber(candStreet);
  const num2 = extractStreetNumber(targetAddress);

  const tMatch = townMatches(candTown, candCitySlug, targetAddress);

  if (!num1) {
    // No street number on candidate: require both name match and town match, mark match_weak
    if (!tMatch) return { pass: false, reason: 'town_mismatch_no_street_num' };
    const nameMatch = normalizeName(candidate.name) === normalizeName((targetTitle || '').split(',')[0]);
    const overlap = getSignificantWordOverlap(candidate.name, targetTitle || '');
    if (nameMatch || overlap >= 0.75) {
      return { pass: true, matchWeak: true, reason: 'name_and_town_match_no_street_num' };
    }
    return { pass: false, reason: 'name_mismatch_no_street_num' };
  }

  if (!num2) {
    return { pass: false, reason: 'target_missing_street_num' };
  }

  if (num1 !== num2) {
    return { pass: false, reason: `street_number_mismatch_${num1}_vs_${num2}` };
  }

  if (!tMatch) {
    return { pass: false, reason: `town_mismatch_${candTown}_vs_target` };
  }

  return { pass: true, matchWeak: false, streetNum: num1 };
}

