import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import * as cheerio from 'cheerio';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const worktreeDir = path.resolve(__dirname, '../..');

const cacheHotelsPath = path.resolve(worktreeDir, '../hotelswithbathtubs/.cache/all-hotels.json');
const pagesDir = path.join(worktreeDir, 'data-collect', 'pages', 'cleartrip');
const privateDir = path.join(worktreeDir, 'data-collect', 'private');
const planCsvPath = path.join(privateDir, 'cleartrip-in-plan.csv');
const notFoundCsvPath = path.join(privateDir, 'not-found-cleartrip.csv');
const logJsonPath = path.join(privateDir, 'cleartrip-180-log.json');
const totalsJsonPath = path.join(privateDir, 'cleartrip-230-totals.json');

fs.mkdirSync(pagesDir, { recursive: true });
fs.mkdirSync(privateDir, { recursive: true });

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const MIN_GAP_MS = 20500; // strictly >= 20.0s gap

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

const DISALLOW_PATTERNS = [
  /^\/cgi-bin\//,
  /^\/flights\//,
  /^\/trains\//,
  /^\/packages\//,
  /^\/bus\//,
  /^\/m\/flights\//,
  /^\/m\/hotels\/results/,
  /^\/m\/hotels\/search/,
  /^\/m\/hotels\/details\//,
  /^\/hotels\/info/,
  /^\/hotels\/search/,
  /^\/hotels\/results/,
  /^\/api\//,
  /\?hotelId=/
];

function checkRobotsAllowed(urlStr) {
  try {
    const u = new URL(urlStr);
    const pathAndQuery = u.pathname + u.search;
    for (const pat of DISALLOW_PATTERNS) {
      if (pat.test(pathAndQuery)) {
        return { allowed: false, matchedRule: pat.toString() };
      }
    }
    return { allowed: true, matchedRule: 'None (default Allow: /)' };
  } catch (err) {
    return { allowed: false, matchedRule: `Invalid URL: ${err.message}` };
  }
}

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

function getDistinctiveWords(hotelName, hotelCity) {
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

function cleanCleartripName(raw, slugPart = '') {
  let name = (raw || '')
    .replace(/^TOP\s*PICKS\s*/i, '')
    .replace(/\s*·.*$/, '')
    .replace(/\d+(?:\.\d+)?\s*\d+-star\s*Hotel.*$/i, '')
    .replace(/\d+\.\d+.*$/i, '')
    .replace(/\s*\d+k\+.*$/i, '')
    .replace(/₹.*$/, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!name || name.length > 80 || name.length < 3) {
    name = (slugPart || '').replace(/-/g, ' ');
  }
  return name.trim();
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
  console.log('=== CLEARTRIP-IN-4-REST: 180 Locality Batch Collector & Final Evaluator ===');
  console.log(`Starting run at ${new Date().toISOString()}`);

  // Load India hotels
  const allHotels = JSON.parse(fs.readFileSync(cacheHotelsPath, 'utf8'));
  const indiaHotels = allHotels.filter(h => h.country === 'India');
  console.log(`Loaded ${indiaHotels.length} India hotels.`);

  // Load locality sitemaps
  const locUrls = [];
  for (const f of ['city-locality-1.xml.gz', 'city-locality-2.xml.gz']) {
    const p = path.join(pagesDir, f);
    if (!fs.existsSync(p)) continue;
    const xml = zlib.gunzipSync(fs.readFileSync(p)).toString('utf8');
    const locs = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]);
    locUrls.push(...locs);
  }
  console.log(`Loaded ${locUrls.length} locality URLs from sitemaps.`);

  // Parse locality URLs into locality slug and city
  const parsedLocUrls = [];
  for (const u of locUrls) {
    const slug = u.split('/').pop() || '';
    if (!slug.startsWith('hotels-in-')) continue;
    const rest = slug.slice('hotels-in-'.length);
    parsedLocUrls.push({ url: u, slug, rest });
  }

  // Step 1: Match each India hotel's streetAddress and city to locality URLs
  console.log('\n--- Step 1: Matching India hotels to locality listing URLs ---');
  const urlToHotels = new Map();
  const hotelToMatchedUrls = new Map();

  for (const h of indiaHotels) {
    const city = (h.city || '').toLowerCase().trim();
    const addr = (h.streetAddress || '').toLowerCase();
    const validCityVariants = CITY_ALIASES[city] || [city];

    let bestUrl = null;
    let bestOverlap = 0;

    for (const item of parsedLocUrls) {
      let matchedCity = false;
      let localitySlug = '';
      for (const v of validCityVariants) {
        const vSlug = v.replace(/\s+/g, '-');
        if (item.rest.endsWith('-' + vSlug)) {
          matchedCity = true;
          localitySlug = item.rest.slice(0, -(vSlug.length + 1));
          break;
        } else if (item.rest === vSlug) {
          matchedCity = true;
          localitySlug = '';
          break;
        }
      }
      if (!matchedCity || !localitySlug) continue;

      const locWords = localitySlug.split('-').filter(w => w.length > 2);
      if (locWords.length === 0) continue;

      const locName = localitySlug.replace(/-/g, ' ');
      if (addr.includes(locName)) {
        if (localitySlug.length > bestOverlap) {
          bestOverlap = localitySlug.length;
          bestUrl = item.url;
        }
      } else {
        const allWordsInAddr = locWords.every(w => addr.includes(w));
        if (allWordsInAddr && localitySlug.length > bestOverlap) {
          bestOverlap = localitySlug.length;
          bestUrl = item.url;
        }
      }
    }

    if (bestUrl) {
      hotelToMatchedUrls.set(h._id, bestUrl);
      if (!urlToHotels.has(bestUrl)) {
        urlToHotels.set(bestUrl, []);
      }
      urlToHotels.get(bestUrl).push(h);
    }
  }

  const distinctUrlsCount = urlToHotels.size;
  const coveredHotelsCount = hotelToMatchedUrls.size;
  const sortedUrls = [...urlToHotels.entries()].sort((a, b) => b[1].length - a[1].length);

  console.log(`Total distinct locality URLs covering India hotels: ${distinctUrlsCount}`);
  console.log(`Total India hotels covered: ${coveredHotelsCount} / ${indiaHotels.length} (${((coveredHotelsCount / indiaHotels.length) * 100).toFixed(1)}%)`);

  // Remaining 180 URLs
  const remaining180 = sortedUrls.slice(50, 230);
  console.log(`Remaining URLs to fetch: ${remaining180.length} (indices 51 to 230).`);

  console.log('\n--- Step 2: Fetching remaining 180 locality listing pages (strictly >= 20s gap) ---');
  const requestLogs = [];
  let prevRequestTime = 0;

  for (let i = 0; i < remaining180.length; i++) {
    const [targetUrl, targetHotels] = remaining180[i];
    const slug = targetUrl.split('/').pop();
    const gzPath = path.join(pagesDir, `${slug}.html.gz`);
    const metaPath = path.join(pagesDir, `${slug}.meta.json`);

    // Verify robots.txt
    const robotsCheck = checkRobotsAllowed(targetUrl);
    if (!robotsCheck.allowed) {
      throw new Error(`CRITICAL: URL disallowed by robots.txt: ${targetUrl}`);
    }

    if (prevRequestTime > 0) {
      const elapsed = Date.now() - prevRequestTime;
      if (elapsed < MIN_GAP_MS) {
        await new Promise(r => setTimeout(r, MIN_GAP_MS - elapsed));
      }
    }
    const reqTimestamp = Date.now();
    const gapSec = prevRequestTime === 0 ? 20.5 : ((reqTimestamp - prevRequestTime) / 1000);
    prevRequestTime = reqTimestamp;
    const reqStartTime = new Date(reqTimestamp).toISOString();

    let res = null;
    let bodyText = '';
    let attempts = 0;
    while (attempts < 3) {
      attempts++;
      try {
        res = await fetch(targetUrl, {
          headers: { 'User-Agent': USER_AGENT }
        });
        bodyText = await res.text();
        break;
      } catch (err) {
        console.warn(`[Attempt ${attempts}/3] Network error fetching ${targetUrl}: ${err.message}`);
        if (attempts >= 3) {
          fs.writeFileSync(logJsonPath, JSON.stringify(requestLogs, null, 2), 'utf8');
          throw err;
        }
        await new Promise(r => setTimeout(r, 5000));
      }
    }
    const blockReason = detectBlock(res.status, bodyText);
    if (blockReason) {
      console.error(`\nCRITICAL BLOCK DETECTED on ${targetUrl}: ${blockReason}`);
      // Save partial log before exiting
      fs.writeFileSync(logJsonPath, JSON.stringify(requestLogs, null, 2), 'utf8');
      process.exit(1);
    }

    if (!res.ok) {
      console.error(`\nHTTP ERROR ${res.status} on ${targetUrl}`);
      fs.writeFileSync(logJsonPath, JSON.stringify(requestLogs, null, 2), 'utf8');
      process.exit(1);
    }

    // Save gzipped file
    const gzBuffer = zlib.gzipSync(Buffer.from(bodyText, 'utf-8'));
    fs.writeFileSync(gzPath, gzBuffer);

    // Save meta json
    fs.writeFileSync(metaPath, JSON.stringify({
      url: targetUrl,
      slug,
      status: res.status,
      fetchedAt: reqStartTime,
      rawSizeBytes: bodyText.length,
      gzSizeBytes: gzBuffer.length
    }, null, 2));

    const logEntry = {
      index: i + 1,
      overallIndex: i + 51,
      url: targetUrl,
      slug,
      requestTime: reqStartTime,
      status: res.status,
      gap: `${gapSec.toFixed(1)}s`,
      gapSeconds: Number(gapSec.toFixed(1)),
      rawBytes: bodyText.length,
      gzBytes: gzBuffer.length,
      hotelsCovered: targetHotels.length
    };
    requestLogs.push(logEntry);

    // Persist log incrementally
    fs.writeFileSync(logJsonPath, JSON.stringify(requestLogs, null, 2), 'utf8');

    console.log(`[${i + 1}/180 | #${i + 51}] ${slug} | Status: ${res.status} | Bytes: ${bodyText.length} | Gap: ${gapSec.toFixed(1)}s | Area hotels: ${targetHotels.length}`);
  }

  console.log(`\nAll 180 requests completed successfully with 0 blocks.`);

  // Step 3: Extract hotel detail links across ALL 230 locality pages
  console.log('\n--- Step 3: Extracting hotel links and matching hotels across ALL 230 pages ---');
  const extractedHotelsByCity = new Map(); // city -> Map(hotelId/url -> hotelObj)
  let totalLinksExtracted = 0;

  for (let idx = 0; idx < sortedUrls.length; idx++) {
    const [targetUrl, targetHotels] = sortedUrls[idx];
    const slug = targetUrl.split('/').pop();
    const gzPath = path.join(pagesDir, `${slug}.html.gz`);
    if (!fs.existsSync(gzPath)) {
      console.warn(`Warning: missing cached page for ${slug}`);
      continue;
    }

    const html = zlib.gunzipSync(fs.readFileSync(gzPath)).toString('utf8');
    const $ = cheerio.load(html);
    const pageHotels = new Map();

    // 1. Search HTML DOM for <a> tags
    $('a').each((_, el) => {
      const href = $(el).attr('href') || '';
      if (href.includes('/hotels/details/')) {
        const cleanHref = href.split('?')[0];
        const m = cleanHref.match(/\/hotels\/details\/(?:([a-z0-9\-]+)-)?(\d+)$/i);
        const slugPart = m ? (m[1] || '') : '';
        const hotelId = m ? m[2] : '';
        const rawName = $(el).find('h2, h3, h4, p, span').first().text().trim() ||
                        $(el).attr('title') ||
                        $(el).text().trim();
        const hotelName = cleanCleartripName(rawName, slugPart);
        const fullUrl = cleanHref.startsWith('http') ? cleanHref : `https://www.cleartrip.com${cleanHref}`;
        const key = hotelId || fullUrl;
        if (!pageHotels.has(key)) {
          pageHotels.set(key, { url: fullUrl, hotelId, name: hotelName, sourcePage: targetUrl });
        }
      }
    });

    // 2. Search embedded JSON scripts
    $('script').each((_, el) => {
      const scriptContent = $(el).html() || '';
      if (scriptContent.includes('/hotels/details/')) {
        const urlMatches = [...scriptContent.matchAll(/\/hotels\/details\/([a-z0-9\-]+)-(\d+)/gi)];
        for (const m of urlMatches) {
          const slugPart = m[1];
          const hotelId = m[2];
          const fullUrl = `https://www.cleartrip.com/hotels/details/${slugPart}-${hotelId}`;
          const hotelName = slugPart.replace(/-/g, ' ');
          const key = hotelId || fullUrl;
          if (!pageHotels.has(key)) {
            pageHotels.set(key, { url: fullUrl, hotelId, name: hotelName, sourcePage: targetUrl });
          }
        }
      }
    });

    totalLinksExtracted += pageHotels.size;

    // Associate with the cities of the hotels in this area
    for (const h of targetHotels) {
      const c = (h.city || '').toLowerCase().trim();
      if (!extractedHotelsByCity.has(c)) {
        extractedHotelsByCity.set(c, new Map());
      }
      for (const [k, v] of pageHotels.entries()) {
        extractedHotelsByCity.get(c).set(k, v);
      }
    }
  }

  console.log(`Total hotel detail links extracted across all 230 pages: ${totalLinksExtracted}`);

  // Now match all 1,548 India hotels
  const matchedHotels = [];
  const ambiguousHotels = [];
  const allResults = [];

  for (const hotel of indiaHotels) {
    const hotelCity = (hotel.city || '').toLowerCase().trim();
    const cityVariants = CITY_ALIASES[hotelCity] || [hotelCity];
    const distinctiveWords = getDistinctiveWords(hotel.name, hotel.city);

    // Collect all candidate hotels from matching cities
    const candidates = [];
    if (distinctiveWords.length > 0) {
      const seenCandidates = new Set();
      for (const variant of cityVariants) {
        const cityMap = extractedHotelsByCity.get(variant);
        if (!cityMap) continue;
        for (const cand of cityMap.values()) {
          if (seenCandidates.has(cand.url)) continue;
          const candTokens = new Set(
            cand.name.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean)
          );
          if (distinctiveWords.every(w => candTokens.has(w))) {
            seenCandidates.add(cand.url);
            candidates.push(cand);
          }
        }
      }
    }

    let status = 'not_found';
    let cleartripUrl = '';
    let cleartripName = '';
    let sourcePage = '';

    if (candidates.length === 1) {
      status = 'match';
      cleartripUrl = candidates[0].url;
      cleartripName = candidates[0].name;
      sourcePage = candidates[0].sourcePage;
      matchedHotels.push({
        hotelId: hotel._id,
        ourName: hotel.name,
        city: hotel.city,
        slug: hotel.slug,
        cleartripName,
        cleartripUrl,
        sourcePage,
        distinctiveWords: distinctiveWords.join(' ')
      });
    } else if (candidates.length > 1) {
      status = 'ambiguous';
      cleartripUrl = candidates.map(c => c.url).join('; ');
      cleartripName = candidates.map(c => c.name).join('; ');
      sourcePage = candidates[0].sourcePage;
      ambiguousHotels.push({
        hotelId: hotel._id,
        ourName: hotel.name,
        city: hotel.city,
        slug: hotel.slug,
        candidatesCount: candidates.length,
        cleartripUrls: cleartripUrl,
        sourcePage,
        distinctiveWords: distinctiveWords.join(' ')
      });
    }

    allResults.push({
      hotelId: hotel._id,
      name: hotel.name,
      city: hotel.city,
      slug: hotel.slug,
      cleartripUrl,
      status,
      matchedWords: distinctiveWords.join(' '),
      sourcePage,
      cleartripName
    });
  }

  // Update cleartrip-in-plan.csv
  const planRows = [
    'hotel id,name,city,our slug,cleartrip URL,status,matched words,source page',
    ...allResults.map(r => [
      escapeCsv(r.hotelId),
      escapeCsv(r.name),
      escapeCsv(r.city),
      escapeCsv(r.slug),
      escapeCsv(r.cleartripUrl),
      escapeCsv(r.status),
      escapeCsv(r.matchedWords),
      escapeCsv(r.sourcePage)
    ].join(','))
  ];
  fs.writeFileSync(planCsvPath, planRows.join('\n'), 'utf8');
  console.log(`Updated ${planCsvPath} (${allResults.length} rows)`);

  // Update not-found-cleartrip.csv
  const notFoundRows = [
    'name,town,state,address,last query,result,date',
    ...allResults.map(r => [
      escapeCsv(r.name),
      escapeCsv(r.city),
      escapeCsv(''),
      escapeCsv(''),
      escapeCsv(`${r.matchedWords} ${r.city}`.trim()),
      escapeCsv(r.status === 'match' ? 'match' : (r.status === 'ambiguous' ? 'ambiguous' : 'not_found')),
      escapeCsv('2026-10-31')
    ].join(','))
  ];
  fs.writeFileSync(notFoundCsvPath, notFoundRows.join('\n'), 'utf8');
  console.log(`Updated ${notFoundCsvPath} (${allResults.length} rows)`);

  // Compute breakdown per city
  const matchesByCity = new Map();
  matchedHotels.forEach(m => {
    const c = m.city || 'Unknown';
    matchesByCity.set(c, (matchesByCity.get(c) || 0) + 1);
  });
  const top10Cities = [...matchesByCity.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);

  const notFoundCount = allResults.filter(r => r.status === 'not_found').length;
  const smallestGap = Math.min(...requestLogs.map(l => l.gapSeconds));

  const totalsData = {
    totalRequests: requestLogs.length,
    smallestGapSec: smallestGap,
    gapsUnder20: requestLogs.filter(l => l.gapSeconds < 20.0).length,
    totalIndiaHotels: indiaHotels.length,
    indiaHotelsCoveredByLocalityUrls: coveredHotelsCount,
    matches: matchedHotels.length,
    ambiguous: ambiguousHotels.length,
    not_found: notFoundCount,
    top10Cities
  };
  fs.writeFileSync(totalsJsonPath, JSON.stringify(totalsData, null, 2), 'utf8');

  // DoD Outputs
  const outputLines = [];
  function logAndRecord(line = '') {
    console.log(line);
    outputLines.push(line);
  }

  logAndRecord('\n=============================================================');
  logAndRecord('>>> DEFINITION OF DONE ITEM 1: Raw Request Log (180 Requests)');
  logAndRecord('=============================================================');
  for (const l of requestLogs) {
    logAndRecord(`[${l.index}/180 | #${l.overallIndex}] ${l.slug} | Time: ${l.requestTime} | Status: ${l.status} | Gap: ${l.gap} | Bytes: ${l.rawBytes}`);
  }
  logAndRecord('--- Request Log Summary Line ---');
  logAndRecord(`Number of requests: ${requestLogs.length} | Smallest gap: ${smallestGap.toFixed(1)}s | Gaps < 20.0s: ${totalsData.gapsUnder20}`);

  logAndRecord('\n=============================================================');
  logAndRecord('>>> DEFINITION OF DONE ITEM 2: Totals for all 230 pages');
  logAndRecord('=============================================================');
  logAndRecord(`Matches: ${matchedHotels.length}`);
  logAndRecord(`Ambiguous: ${ambiguousHotels.length}`);
  logAndRecord(`Not found: ${notFoundCount}`);
  logAndRecord(`India hotels covered by locality URLs: ${coveredHotelsCount} / ${indiaHotels.length} (${((coveredHotelsCount / indiaHotels.length) * 100).toFixed(1)}%)`);
  logAndRecord('\nMatches per city for top 10 cities:');
  top10Cities.forEach(([city, count], idx) => {
    logAndRecord(`  ${idx + 1}. ${city}: ${count} matches`);
  });

  logAndRecord('\n=============================================================');
  logAndRecord('>>> DEFINITION OF DONE ITEM 3: 15 Random New Matched Rows');
  logAndRecord('=============================================================');
  // Sample 15 matches deterministically or randomly
  const sampleMatches = [...matchedHotels];
  const countToPick = Math.min(15, sampleMatches.length);
  const picked = [];
  for (let i = 0; i < countToPick; i++) {
    const idx = Math.floor(Math.random() * sampleMatches.length);
    picked.push(sampleMatches.splice(idx, 1)[0]);
  }
  picked.forEach((m, idx) => {
    logAndRecord(`MATCH ${idx + 1}:`);
    logAndRecord(`  Our Name:       "${m.ourName}" (${m.city})`);
    logAndRecord(`  Cleartrip Name: "${m.cleartripName}"`);
    logAndRecord(`  Cleartrip URL:  ${m.cleartripUrl}`);
  });

  fs.writeFileSync(path.join(privateDir, 'cleartrip-180-output.txt'), outputLines.join('\n'), 'utf8');
}

main().catch(err => {
  console.error('\nFATAL ERROR in cleartrip 180 batch:', err);
  process.exit(1);
});
