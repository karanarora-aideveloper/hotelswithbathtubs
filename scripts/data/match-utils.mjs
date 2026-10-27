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
