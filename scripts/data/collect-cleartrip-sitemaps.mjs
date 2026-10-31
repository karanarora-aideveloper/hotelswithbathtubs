import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const worktreeDir = path.resolve(__dirname, '../..');

const cacheHotelsPath = path.resolve(worktreeDir, '../hotelswithbathtubs/.cache/all-hotels.json');
const pagesDir = path.join(worktreeDir, 'data-collect', 'pages', 'cleartrip');
const privateDir = path.join(worktreeDir, 'data-collect', 'private');
const planCsvPath = path.join(privateDir, 'cleartrip-in-plan.csv');
const notFoundCsvPath = path.join(privateDir, 'not-found-cleartrip.csv');

// Ensure directories exist
fs.mkdirSync(pagesDir, { recursive: true });
fs.mkdirSync(privateDir, { recursive: true });

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const MIN_GAP_MS = 10500; // strictly >= 10s between requests

const INDIA_SITEMAP_FILES = [
  'city-locality-1.xml',
  'city-locality-2.xml',
  'city-locality-amenity-1.xml',
  'city-locality-amenity-2.xml',
  'city-star-category-1.xml',
  'city-star-category-2.xml',
  'city-amenity-1.xml',
  'city-property-1.xml'
];

const CITY_ALIASES = {
  'bengaluru': ['bengaluru', 'bangalore'],
  'bangalore': ['bengaluru', 'bangalore'],
  'mumbai': ['mumbai', 'bombay'],
  'bombay': ['mumbai', 'bombay'],
  'kochi': ['kochi', 'cochin'],
  'cochin': ['kochi', 'cochin'],
  'gurugram': ['gurugram', 'gurgaon'],
  'gurgaon': ['gurugram', 'gurgaon'],
  'delhi': ['delhi', 'new-delhi', 'newdelhi'],
  'new delhi': ['delhi', 'new-delhi', 'newdelhi']
};

const STOP_WORDS = new Set([
  'hotel', 'hotels', 'resort', 'resorts', 'spa', 'spas', 'the', 'a', 'an', 'and', 'in', 'at', 'of', 'by', 'near'
]);

let lastRequestTime = 0;

async function waitEnforcedGap() {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (lastRequestTime > 0 && elapsed < MIN_GAP_MS) {
    const toWait = MIN_GAP_MS - elapsed;
    await new Promise(r => setTimeout(r, toWait));
  }
  lastRequestTime = Date.now();
}

function detectBlock(status, bodyText) {
  if (status === 403 || status === 429) {
    return `HTTP ${status}`;
  }
  const lower = bodyText.toLowerCase();
  if (
    lower.includes('verify you are human') ||
    lower.includes("verify that you're not a robot") ||
    lower.includes('unusual traffic') ||
    lower.includes('cf-browser-verification') ||
    lower.includes('challenge-container')
  ) {
    return 'Verification/Challenge text detected in response';
  }
  return null;
}

async function fetchWithRetry(url, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await waitEnforcedGap();
      const reqTime = new Date().toISOString();
      const res = await fetch(url, {
        headers: { 'User-Agent': USER_AGENT }
      });
      const text = await res.text();
      const block = detectBlock(res.status, text);
      if (block) {
        throw new Error(`BLOCKED: ${block}`);
      }
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${text.slice(0, 100)}`);
      }
      return { text, reqTime, status: res.status };
    } catch (err) {
      if (err.message.startsWith('BLOCKED:')) throw err;
      if (attempt === maxRetries) throw err;
      console.warn(`   [retry] Fetch failed for ${url} (${err.message}). Retrying (attempt ${attempt}/${maxRetries})...`);
      await new Promise(r => setTimeout(r, 3000));
    }
  }
}

export function matchCity(hotelCity, urlSlug) {
  if (!hotelCity || !urlSlug) return false;
  const normHotelCity = hotelCity.toLowerCase().trim();
  const validVariants = CITY_ALIASES[normHotelCity] || [normHotelCity];
  for (const variant of validVariants) {
    const slugVariant = variant.replace(/\s+/g, '-');
    const re = new RegExp(`(^|-)${slugVariant}(-|$)`, 'i');
    if (re.test(urlSlug)) return true;
    const words = variant.split(/\s+/);
    if (words.length > 1 && words.every(w => new RegExp(`(^|-)${w}(-|$)`, 'i').test(urlSlug))) {
      return true;
    }
  }
  return false;
}

export function getDistinctiveWords(hotelName, hotelCity) {
  const cityWords = new Set(
    (hotelCity || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(Boolean)
  );

  const aliases = CITY_ALIASES[(hotelCity || '').toLowerCase().trim()] || [];
  for (const a of aliases) {
    for (const w of a.split(/[\s\-]+/)) {
      cityWords.add(w.toLowerCase());
    }
  }

  const words = (hotelName || '')
    .toLowerCase()
    .replace(/\s*\(.*?\)/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1 && !STOP_WORDS.has(w) && !cityWords.has(w));

  return [...new Set(words)];
}

export function getUrlTokens(urlStr) {
  try {
    const u = new URL(urlStr);
    return u.pathname
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(Boolean);
  } catch {
    return [];
  }
}

export function escapeCsv(val) {
  if (val == null) return '""';
  const s = String(val);
  if (s.includes('"') || s.includes(',') || s.includes('\n') || s.includes('\r')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return `"${s}"`;
}

async function main() {
  console.log('=== CLEARTRIP-IN-1: India Sitemap Collector & Matcher ===');
  console.log(`Starting run at ${new Date().toISOString()}`);

  // Step 1: Fetch sitemap index
  const indexUrl = 'https://www.cleartrip.com/hotels/seo-sitemap/hotel-sitemap-index.xml';
  console.log(`\nFetching sitemap index: ${indexUrl}...`);
  const indexResult = await fetchWithRetry(indexUrl);
  console.log(`Index fetched at ${indexResult.reqTime} (${indexResult.text.length} bytes)`);

  const sitemapIndexLocs = [...indexResult.text.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]);
  console.log(`Total sitemaps listed in index: ${sitemapIndexLocs.length}`);

  // Filter to India-covering sitemap files
  const fetchLogs = [];
  const allUrlsMap = new Map(); // url -> Array of sitemap filenames

  console.log('\nFetching sitemap files covering India hotels (waiting >= 10s between requests):');
  for (let i = 0; i < INDIA_SITEMAP_FILES.length; i++) {
    const filename = INDIA_SITEMAP_FILES[i];
    const fullUrl = `https://www.cleartrip.com/hotels/seo-sitemap/${filename}`;
    const gzFilePath = path.join(pagesDir, `${filename}.gz`);

    const tBefore = Date.now();
    const result = await fetchWithRetry(fullUrl);
    const gapSeconds = lastRequestTime > 0 ? ((Date.now() - tBefore) / 1000).toFixed(1) : 'N/A';

    // Save gzipped
    const gzipped = zlib.gzipSync(Buffer.from(result.text, 'utf-8'));
    fs.writeFileSync(gzFilePath, gzipped);

    // Extract locs
    const locs = [...result.text.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]);
    for (const loc of locs) {
      if (!allUrlsMap.has(loc)) {
        allUrlsMap.set(loc, []);
      }
      allUrlsMap.get(loc).push(filename);
    }

    fetchLogs.push({
      filename,
      requestTime: result.reqTime,
      status: result.status,
      urlsCount: locs.length,
      gzSize: gzipped.length
    });

    console.log(`  [${i + 1}/${INDIA_SITEMAP_FILES.length}] ${filename}: status ${result.status}, ${locs.length} URLs, fetched at ${result.reqTime}`);
  }

  console.log(`\nExtracted ${allUrlsMap.size} unique URLs across all ${INDIA_SITEMAP_FILES.length} India sitemaps.`);

  // Step 2 & 3: Match our India hotels
  console.log(`\nLoading India hotels from ${cacheHotelsPath}...`);
  const allHotels = JSON.parse(fs.readFileSync(cacheHotelsPath, 'utf8'));
  const indiaHotels = allHotels.filter(h => h.country === 'India');
  console.log(`Loaded ${indiaHotels.length} India hotels.`);

  // Pre-process sitemap URLs with their pathname and tokens for fast matching
  const processedSitemapUrls = [];
  for (const [url] of allUrlsMap.entries()) {
    let slug = '';
    try {
      slug = new URL(url).pathname.split('/').filter(Boolean).pop() || '';
    } catch {}
    const tokens = new Set(getUrlTokens(url));
    processedSitemapUrls.push({ url, slug, tokens });
  }

  const results = [];
  const cityMatchCounts = {};

  for (const hotel of indiaHotels) {
    const hotelCity = hotel.city || '';
    const distinctiveWords = getDistinctiveWords(hotel.name, hotelCity);

    const candidates = [];
    if (distinctiveWords.length > 0) {
      for (const item of processedSitemapUrls) {
        if (!matchCity(hotelCity, item.slug)) continue;

        const allMatched = distinctiveWords.every(w => item.tokens.has(w));
        if (allMatched) {
          candidates.push(item.url);
        }
      }
    }

    let status = 'not_found';
    let matchedWordsStr = distinctiveWords.join(' ');
    let cleartripUrl = '';

    if (candidates.length === 1) {
      status = 'match';
      cleartripUrl = candidates[0];
      cityMatchCounts[hotelCity] = (cityMatchCounts[hotelCity] || 0) + 1;
    } else if (candidates.length > 1) {
      status = 'ambiguous';
      cleartripUrl = candidates.join('; ');
    } else {
      status = 'not_found';
      cleartripUrl = '';
    }

    results.push({
      hotelId: hotel._id,
      name: hotel.name,
      city: hotelCity,
      slug: hotel.slug,
      cleartripUrl,
      status,
      matchedWords: matchedWordsStr,
      address: hotel.address || '',
      town: hotel.town || hotelCity,
      state: hotel.state || '',
      candidateCount: candidates.length
    });
  }

  // Summary counts
  const matchTotal = results.filter(r => r.status === 'match').length;
  const ambiguousTotal = results.filter(r => r.status === 'ambiguous').length;
  const notFoundTotal = results.filter(r => r.status === 'not_found').length;

  // Write cleartrip-in-plan.csv
  // columns: hotel id, name, city, our slug, cleartrip URL, status, matched words
  const planRows = [
    'hotel id,name,city,our slug,cleartrip URL,status,matched words',
    ...results.map(r => [
      escapeCsv(r.hotelId),
      escapeCsv(r.name),
      escapeCsv(r.city),
      escapeCsv(r.slug),
      escapeCsv(r.cleartripUrl),
      escapeCsv(r.status),
      escapeCsv(r.matchedWords)
    ].join(','))
  ];
  fs.writeFileSync(planCsvPath, planRows.join('\n'), 'utf8');
  console.log(`\nWrote ${results.length} rows to ${planCsvPath}`);

  // Write not-found-cleartrip.csv
  // columns: name,town,state,address,last query,result,date
  const notFoundRows = [
    'name,town,state,address,last query,result,date',
    ...results.map(r => [
      escapeCsv(r.name),
      escapeCsv(r.town),
      escapeCsv(r.state),
      escapeCsv(r.address),
      escapeCsv(`${r.matchedWords} ${r.city}`.trim()),
      escapeCsv(r.status === 'match' ? 'match' : (r.status === 'ambiguous' ? `ambiguous (${r.candidateCount} matches)` : 'not_found')),
      escapeCsv('2026-10-31')
    ].join(','))
  ];
  fs.writeFileSync(notFoundCsvPath, notFoundRows.join('\n'), 'utf8');
  console.log(`Wrote ${results.length} rows to ${notFoundCsvPath}`);

  // Output Definition of Done artifacts
  console.log('\n=============================================================');
  console.log('>>> DEFINITION OF DONE ITEM 1: Fetched Sitemap Files & Times');
  console.log('=============================================================');
  for (let i = 0; i < fetchLogs.length; i++) {
    const l = fetchLogs[i];
    let gapInfo = '';
    if (i > 0) {
      const prevTime = new Date(fetchLogs[i - 1].requestTime).getTime();
      const currTime = new Date(l.requestTime).getTime();
      const diffSec = ((currTime - prevTime) / 1000).toFixed(1);
      gapInfo = ` (gap: ${diffSec}s)`;
    }
    console.log(`${i + 1}. ${l.filename} | Time: ${l.requestTime} | Status: ${l.status} | URLs: ${l.urlsCount} | GzBytes: ${l.gzSize}${gapInfo}`);
  }

  console.log('\n=============================================================');
  console.log('>>> DEFINITION OF DONE ITEM 2: Totals & Matches per City');
  console.log('=============================================================');
  console.log(`India hotels: ${indiaHotels.length}`);
  console.log(`match: ${matchTotal}`);
  console.log(`ambiguous: ${ambiguousTotal}`);
  console.log(`not_found: ${notFoundTotal}`);

  // Top 10 biggest cities by hotel inventory
  const cityTotals = {};
  for (const h of indiaHotels) {
    cityTotals[h.city] = (cityTotals[h.city] || 0) + 1;
  }
  const top10Cities = Object.entries(cityTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  console.log('\nMatches for 10 biggest cities (by hotel inventory):');
  for (const [cityName, totalInCity] of top10Cities) {
    const matchesInCity = cityMatchCounts[cityName] || 0;
    console.log(`- ${cityName}: ${matchesInCity} matches / ${totalInCity} hotels (${((matchesInCity / totalInCity) * 100).toFixed(1)}%)`);
  }

  console.log('\n=============================================================');
  console.log('>>> DEFINITION OF DONE ITEM 3: 15 Random Matches & 5 Ambiguous');
  console.log('=============================================================');
  const matches = results.filter(r => r.status === 'match');
  console.log(`\n--- 15 RANDOM MATCH ROWS (out of ${matches.length} matches) ---`);
  // Pick 15 random matches (or all if < 15)
  const pickedMatches = [];
  const matchCopy = [...matches];
  const matchCountToPick = Math.min(15, matchCopy.length);
  for (let i = 0; i < matchCountToPick; i++) {
    const idx = Math.floor(Math.random() * matchCopy.length);
    pickedMatches.push(matchCopy.splice(idx, 1)[0]);
  }
  pickedMatches.forEach((m, idx) => {
    console.log(`MATCH ${idx + 1}:`);
    console.log(`  Hotel: ${m.name} (${m.hotelId})`);
    console.log(`  City: ${m.city} | Slug: ${m.slug}`);
    console.log(`  Distinctive Words: "${m.matchedWords}"`);
    console.log(`  Cleartrip URL: ${m.cleartripUrl}`);
  });

  const ambiguous = results.filter(r => r.status === 'ambiguous');
  console.log(`\n--- 5 RANDOM AMBIGUOUS ROWS (out of ${ambiguous.length} ambiguous) ---`);
  const pickedAmbiguous = [];
  const ambCopy = [...ambiguous];
  const ambCountToPick = Math.min(5, ambCopy.length);
  for (let i = 0; i < ambCountToPick; i++) {
    const idx = Math.floor(Math.random() * ambCopy.length);
    pickedAmbiguous.push(ambCopy.splice(idx, 1)[0]);
  }
  pickedAmbiguous.forEach((a, idx) => {
    console.log(`AMBIGUOUS ${idx + 1}:`);
    console.log(`  Hotel: ${a.name} (${a.hotelId})`);
    console.log(`  City: ${a.city} | Slug: ${a.slug}`);
    console.log(`  Distinctive Words: "${a.matchedWords}"`);
    console.log(`  Candidate Count: ${a.candidateCount}`);
    console.log(`  Cleartrip URLs: ${a.cleartripUrl}`);
  });
}

main().catch(err => {
  console.error('\nFATAL ERROR in cleartrip sitemap collector:', err);
  process.exit(1);
});
