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
fs.mkdirSync(pagesDir, { recursive: true });

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const MIN_GAP_MS = 21000; // strictly >= 20.0s gap

const PILOT_TARGETS = [
  {
    city: 'Goa',
    slug: 'hotels-in-calangute-goa',
    url: 'https://www.cleartrip.com/hotels/hotels-in-calangute-goa'
  },
  {
    city: 'Jaipur',
    slug: 'hotels-in-bani-park-jaipur',
    url: 'https://www.cleartrip.com/hotels/hotels-in-bani-park-jaipur'
  },
  {
    city: 'Delhi',
    slug: 'hotels-in-connaught-place-new-delhi',
    url: 'https://www.cleartrip.com/hotels/hotels-in-connaught-place-new-delhi'
  }
];

// Robots.txt rules from https://www.cleartrip.com/robots.txt
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
    console.log(`   Waiting ${(toWait / 1000).toFixed(1)}s to enforce >= 20s gap...`);
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
  if (!name || name.length > 80) {
    name = (slugPart || '').replace(/-/g, ' ');
  }
  return name.trim();
}

async function main() {
  console.log('=== CLEARTRIP-IN-2-PILOT: 3 City Listing Pages Pilot ===');
  console.log(`Starting pilot at ${new Date().toISOString()}`);

  // Load our India hotels
  const allHotels = JSON.parse(fs.readFileSync(cacheHotelsPath, 'utf8'));
  const indiaHotels = allHotels.filter(h => h.country === 'India');

  // Step 1: Robots.txt verification
  console.log('\n--- Checking robots.txt for the 3 target URLs ---');
  for (const t of PILOT_TARGETS) {
    const check = checkRobotsAllowed(t.url);
    t.robotsCheck = check;
    console.log(`- ${t.url}`);
    console.log(`  Allowed: ${check.allowed} (Rule: ${check.matchedRule})`);
    if (!check.allowed) {
      throw new Error(`URL disallowed by robots.txt: ${t.url}`);
    }
  }

  // Step 2: Sequential fetch with >= 20s gaps
  console.log('\n--- Fetching the 3 listing pages (strictly >= 20s gap) ---');
  const fetchResults = [];

  for (let i = 0; i < PILOT_TARGETS.length; i++) {
    const t = PILOT_TARGETS[i];
    const tBeforeWait = Date.now();
    await waitEnforcedGap();
    const reqStartTime = new Date().toISOString();

    let gapFromPrev = 'N/A (first request)';
    if (i > 0) {
      gapFromPrev = `${((Date.now() - tBeforeWait) / 1000).toFixed(1)}s`;
    }

    console.log(`\n[${i + 1}/3] Requesting ${t.url}...`);
    console.log(`  Request Time: ${reqStartTime} | Gap: ${gapFromPrev}`);

    const res = await fetch(t.url, {
      headers: { 'User-Agent': USER_AGENT }
    });

    const bodyText = await res.text();
    const blockReason = detectBlock(res.status, bodyText);
    if (blockReason) {
      console.error(`\nCRITICAL BLOCK DETECTED on ${t.url}: ${blockReason}`);
      process.exit(1);
    }

    if (!res.ok) {
      console.error(`\nHTTP ERROR ${res.status} on ${t.url}`);
      process.exit(1);
    }

    // Save gzipped file
    const gzPath = path.join(pagesDir, `${t.slug}.html.gz`);
    const gzBuffer = zlib.gzipSync(Buffer.from(bodyText, 'utf-8'));
    fs.writeFileSync(gzPath, gzBuffer);

    // Save meta json
    const metaPath = path.join(pagesDir, `${t.slug}.meta.json`);
    fs.writeFileSync(metaPath, JSON.stringify({
      url: t.url,
      slug: t.slug,
      city: t.city,
      status: res.status,
      fetchedAt: reqStartTime,
      rawSizeBytes: bodyText.length,
      gzSizeBytes: gzBuffer.length
    }, null, 2));

    console.log(`  Status: ${res.status} | Raw Bytes: ${bodyText.length} | GzBytes: ${gzBuffer.length}`);
    console.log(`  Saved to: ${gzPath}`);

    fetchResults.push({
      ...t,
      status: res.status,
      reqTime: reqStartTime,
      gapFromPrev,
      rawBytes: bodyText.length,
      gzBytes: gzBuffer.length,
      html: bodyText
    });
  }

  // Step 3: Analyze content for hotel page links and JSON data
  console.log('\n=============================================================');
  console.log('>>> ANALYZING SAVED PAGES FOR HOTEL DETAIL LINKS & DATA');
  console.log('=============================================================');

  const pageAnalyses = [];

  for (const page of fetchResults) {
    const $ = cheerio.load(page.html);
    console.log(`\nAnalyzing ${page.city} (${page.slug})...`);

    // 1. Search HTML DOM for anchor tags pointing to hotel details
    const domHotelLinks = [];
    const allLinksCount = $('a').length;

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
        domHotelLinks.push({
          url: fullUrl,
          hotelId,
          name: hotelName,
          source: 'HTML'
        });
      }
    });

    // 2. Search <script> tags for JSON data (e.g. Next.js, Redux, preloaded state)
    const jsonHotelLinks = [];
    $('script').each((_, el) => {
      const scriptContent = $(el).html() || '';
      if (scriptContent.includes('/hotels/details/') || scriptContent.includes('hotelDetails') || scriptContent.includes('hotelName')) {
        // Look for details URL pattern in script
        const urlMatches = [...scriptContent.matchAll(/\/hotels\/details\/([a-z0-9\-]+)-(\d+)/gi)];
        for (const m of urlMatches) {
          const slugPart = m[1];
          const hotelId = m[2];
          const fullUrl = `https://www.cleartrip.com/hotels/details/${slugPart}-${hotelId}`;
          const hotelName = slugPart.replace(/-/g, ' ');
          jsonHotelLinks.push({
            url: fullUrl,
            hotelId,
            name: hotelName,
            source: 'JSON'
          });
        }
      }
    });

    // Deduplicate by hotelId
    const uniqueHotels = new Map();
    for (const h of [...domHotelLinks, ...jsonHotelLinks]) {
      const key = h.hotelId || h.url;
      if (!uniqueHotels.has(key)) {
        uniqueHotels.set(key, h);
      }
    }

    const uniqueList = [...uniqueHotels.values()];
    console.log(`  Total <a> links on page: ${allLinksCount}`);
    console.log(`  Hotel detail links in HTML DOM: ${domHotelLinks.length}`);
    console.log(`  Hotel detail links in embedded JSON: ${jsonHotelLinks.length}`);
    console.log(`  Total unique hotels extracted: ${uniqueList.length}`);

    // Match extracted hotels against our hotels in this city
    const targetHotelsInCity = indiaHotels.filter(h => {
      const c = (h.city || '').toLowerCase();
      if (page.city === 'Delhi') return c === 'delhi' || c === 'new delhi';
      return c === page.city.toLowerCase();
    });

    console.log(`  Matching against our ${targetHotelsInCity.length} hotels in ${page.city}...`);
    const matchResults = [];

    for (const our of targetHotelsInCity) {
      const distinctiveWords = getDistinctiveWords(our.name, our.city);
      const candidates = [];
      if (distinctiveWords.length > 0) {
        for (const cand of uniqueList) {
          const candTokens = new Set(
            cand.name.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean)
          );
          if (distinctiveWords.every(w => candTokens.has(w))) {
            candidates.push(cand);
          }
        }
      }

      let status = 'not_found';
      let cleartripUrl = '';
      if (candidates.length === 1) {
        status = 'match';
        cleartripUrl = candidates[0].url;
      } else if (candidates.length > 1) {
        status = 'ambiguous';
        cleartripUrl = candidates.map(c => c.url).join('; ');
      }

      matchResults.push({
        hotelId: our._id,
        name: our.name,
        city: our.city,
        slug: our.slug,
        status,
        cleartripUrl,
        candidatesCount: candidates.length,
        distinctiveWords: distinctiveWords.join(' ')
      });
    }

    const matchesCount = matchResults.filter(r => r.status === 'match').length;
    const ambiguousCount = matchResults.filter(r => r.status === 'ambiguous').length;
    const notFoundCount = matchResults.filter(r => r.status === 'not_found').length;

    pageAnalyses.push({
      page,
      domHotelLinks,
      jsonHotelLinks,
      uniqueList,
      targetHotelsCount: targetHotelsInCity.length,
      matchResults,
      matchesCount,
      ambiguousCount,
      notFoundCount
    });
  }

  // Definition of done output
  console.log('\n=============================================================');
  console.log('>>> DEFINITION OF DONE ITEM 1: Robots.txt & Request Timings');
  console.log('=============================================================');
  for (const pa of pageAnalyses) {
    const p = pa.page;
    console.log(`URL: ${p.url}`);
    console.log(`  Robots.txt Check: ${p.robotsCheck.allowed ? 'ALLOWED' : 'DISALLOWED'} (${p.robotsCheck.matchedRule})`);
    console.log(`  Request Time: ${p.reqTime} | Status: ${p.status} | Gap from previous: ${p.gapFromPrev}`);
  }

  console.log('\n=============================================================');
  console.log('>>> DEFINITION OF DONE ITEM 2: HTML Bytes, Links Count, Samples & Location');
  console.log('=============================================================');
  for (const pa of pageAnalyses) {
    const p = pa.page;
    console.log(`\nPage: ${p.city} (${p.url})`);
    console.log(`  HTML Bytes: ${p.rawBytes} (Gzipped: ${p.gzBytes} bytes)`);
    console.log(`  Hotel-Page Links Found: ${pa.uniqueList.length} (HTML DOM: ${pa.domHotelLinks.length}, JSON Script: ${pa.jsonHotelLinks.length})`);
    console.log(`  Location: ${pa.domHotelLinks.length > 0 ? 'HTML DOM (<a> tags)' : (pa.jsonHotelLinks.length > 0 ? 'Embedded JSON scripts' : 'None')}`);
    console.log(`  Sample 5 links with hotel names:`);
    const samples = pa.uniqueList.slice(0, 5);
    if (samples.length === 0) {
      console.log('    (None found)');
    } else {
      samples.forEach((s, idx) => {
        console.log(`    ${idx + 1}. [${s.source}] "${s.name}" -> ${s.url}`);
      });
    }
  }

  console.log('\n=============================================================');
  console.log('>>> DEFINITION OF DONE ITEM 3: Name Matches Against Our Hotels');
  console.log('=============================================================');
  for (const pa of pageAnalyses) {
    const p = pa.page;
    console.log(`\nCity: ${p.city} (${pa.targetHotelsCount} hotels in our DB):`);
    console.log(`  match: ${pa.matchesCount}`);
    console.log(`  ambiguous: ${pa.ambiguousCount}`);
    console.log(`  not_found: ${pa.notFoundCount}`);

    const matches = pa.matchResults.filter(r => r.status === 'match');
    if (matches.length > 0) {
      console.log(`  Matched hotels:`);
      matches.forEach(m => {
        console.log(`    - "${m.name}" (${m.distinctiveWords}) -> ${m.cleartripUrl}`);
      });
    }
    const amb = pa.matchResults.filter(r => r.status === 'ambiguous');
    if (amb.length > 0) {
      console.log(`  Ambiguous hotels:`);
      amb.forEach(a => {
        console.log(`    - "${a.name}" (${a.distinctiveWords}) -> ${a.candidatesCount} candidates`);
      });
    }
  }

  console.log('\n=============================================================');
  console.log('>>> DEFINITION OF DONE ITEM 4: Recommendation');
  console.log('=============================================================');
  // Check whether hotel links are present in raw HTML/JSON
  const totalHotelLinksFound = pageAnalyses.reduce((acc, pa) => acc + pa.uniqueList.length, 0);
  console.log(`Total hotel links found across 3 pages: ${totalHotelLinksFound}`);

  // Unique cities count in India inventory
  const uniqueIndiaCities = new Set(indiaHotels.map(h => (h.city || '').trim().toLowerCase())).size;
  const totalSeconds = uniqueIndiaCities * 20;
  const totalHours = (totalSeconds / 3600).toFixed(2);

  if (totalHotelLinksFound > 0) {
    console.log(`RECOMMENDATION: (a) Crawl listing pages`);
    console.log(`  Details: ${totalHotelLinksFound} hotel detail links were successfully extracted from the listing pages without running a headless browser.`);
    console.log(`  Scale: Crawling 1 listing page per unique India city (${uniqueIndiaCities} cities) at 20s/page requires ~${uniqueIndiaCities} requests (~${totalSeconds}s = ~${totalHours} hours).`);
  } else {
    console.log(`RECOMMENDATION: (b) Stop`);
    console.log(`  Details: Hotel detail links are not present in static HTML or embedded JSON without client-side JavaScript execution.`);
  }

  console.log('\n=============================================================');
  console.log('>>> DEFINITION OF DONE ITEM 5: 3 Corrected CSV Rows');
  console.log('=============================================================');
  const planContent = fs.readFileSync(path.join(worktreeDir, 'data-collect', 'private', 'cleartrip-in-plan.csv'), 'utf8');
  const planLines = planContent.split('\n');
  const correctedRows = planLines.filter(l => l.includes('not_found (listing_page_only)'));
  correctedRows.forEach(r => console.log(r));
}

main().catch(err => {
  console.error('\nFATAL ERROR in cleartrip pilot:', err);
  process.exit(1);
});
