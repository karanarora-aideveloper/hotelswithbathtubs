import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
import robotsParser from './vendor/robots-parser/index.js';
import {
  normalizeName,
  getSignificantWords,
  getSignificantWordOverlap,
  extractStreetNumber,
  townMatches,
  matchHotelAddress
} from './match-utils.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const worktreeDir = path.resolve(__dirname, '../..');
const pagesDir = path.join(worktreeDir, 'data-collect', 'pages', 'agoda1');
const privateDir = path.join(worktreeDir, 'data-collect', 'private');
const resultsPath = path.join(privateDir, 'agoda1-results.json');
const progressFilePath = path.join(worktreeDir, 'data-collect', 'agoda1-progress.md');

// Load environment config
const envCandidates = [
  path.resolve(worktreeDir, '.env.local'),
  path.resolve(worktreeDir, '../hotelswithbathtubs/.env.local'),
  path.resolve(process.cwd(), '.env.local'),
  path.resolve(process.cwd(), '../hotelswithbathtubs/.env.local')
];
for (const p of envCandidates) {
  if (fs.existsSync(p)) {
    dotenv.config({ path: p, quiet: true });
    break;
  }
}

function getMongoUri() {
  if (process.env.MONGODB_URI) return process.env.MONGODB_URI;
  throw new Error('MONGODB_URI not found in environment');
}

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const MIN_GAP_MS = 22000; // Enforce >= 22.0s gap between ALL requests to agoda.com

// Clean hotel name for search
export function cleanForSearch(name) {
  if (!name) return '';
  let s = name;
  s = s.replace(/[\u2013\u2014\-]\s*[A-Z\s,]+$/, ''); // trailing dashes e.g. - Houston
  s = s.replace(/,\s*(?:an?\s+)?(?:ihg|hilton|wyndham|marriott|hyatt|radisson|choice|spinnaker|best western|tapestry collection|doubletree).*$/i, '');
  s = s.replace(/\s+(?:by\s+(?:wyndham|spinnaker|radisson|hilton|marriott|hyatt))/i, '');
  s = s.replace(/\s+(?:an?\s+ihg\s+hotel|a\s+doubletree\s+by\s+hilton\s+hotel)/i, '');
  s = s.replace(/,\s*(?:ca|tx|fl|ny|tn|co|ga|nc|va|sc|az|oh|mo|il|pa|nj|ma|wa|or|nv)\b.*$/i, '');
  s = s.replace(/[^\w\s&]/g, ' ').replace(/\s+/g, ' ').trim();
  return s;
}

// Block detection
function detectBlock(status, bodyText) {
  if (status === 202 || status === 403 || status === 429) {
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

// Database retry helper for transient network/DNS blips
async function withDbRetry(fn, maxRetries = 5, delayMs = 3000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === maxRetries) throw err;
      console.warn(`   [db-retry] DB operation failed (${err.message}). Retrying in ${delayMs / 1000}s (attempt ${attempt}/${maxRetries})...`);
      await new Promise(r => setTimeout(r, delayMs));
    }
  }
}

let lastRequestTime = 0;

async function honestFetch(url, slug) {
  const now = Date.now();
  if (lastRequestTime > 0) {
    const elapsed = now - lastRequestTime;
    if (elapsed < MIN_GAP_MS) {
      const waitTime = MIN_GAP_MS - elapsed;
      console.log(`   [rate-limit] Waiting ${(waitTime / 1000).toFixed(2)}s to respect honest ${MIN_GAP_MS / 1000}s gap...`);
      await new Promise(r => setTimeout(r, waitTime));
    }
  }

  const reqTimestamp = new Date().toISOString();
  let res;
  let text = '';
  
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      res = await fetch(url, {
        headers: {
          'User-Agent': USER_AGENT,
          'Accept': 'application/json, text/html, */*',
          'Accept-Language': 'en-US,en;q=0.9'
        }
      });
      text = await res.text();
      break;
    } catch (err) {
      if (attempt === 3) {
        lastRequestTime = Date.now();
        throw new Error(`Network error fetching ${url}: ${err.message}`);
      }
      console.warn(`   [net-retry] Transient network error (${err.message}) on ${url}. Retrying in 5s (attempt ${attempt}/3)...`);
      await new Promise(r => setTimeout(r, 5000));
    }
  }

  lastRequestTime = Date.now();

  // Check for block
  const blockReason = detectBlock(res.status, text);
  if (blockReason) {
    const blockErr = new Error(`BLOCK DETECTED: ${blockReason} at ${url}`);
    blockErr.isBlock = true;
    blockErr.url = url;
    blockErr.status = res.status;
    blockErr.time = reqTimestamp;
    throw blockErr;
  }

  // Save page (.html.gz and .meta.json)
  if (!fs.existsSync(pagesDir)) {
    fs.mkdirSync(pagesDir, { recursive: true });
  }

  const gzBuf = zlib.gzipSync(Buffer.from(text, 'utf-8'));
  const gzPath = path.join(pagesDir, `${slug}.html.gz`);
  const metaPath = path.join(pagesDir, `${slug}.meta.json`);

  fs.writeFileSync(gzPath, gzBuf);
  const meta = {
    url,
    site: 'agoda1',
    slug,
    status: res.status,
    fetchedAt: reqTimestamp,
    rawSizeBytes: Buffer.byteLength(text, 'utf-8'),
    gzSizeBytes: gzBuf.length
  };
  fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2), 'utf-8');

  return { status: res.status, text, meta };
}

// Extract up to 6 photo URLs from Agoda secondary data
function extractAgodaPhotos(detailData, maxPhotos = 6) {
  const photos = [];
  const images = detailData.mosaicInitData?.images || [];
  for (const img of images) {
    let loc = img.location || img.locationMediumRectangle;
    if (loc) {
      if (loc.startsWith('//')) loc = 'https:' + loc;
      if (!photos.includes(loc)) {
        photos.push(loc);
        if (photos.length >= maxPhotos) break;
      }
    }
  }
  return photos;
}

// Analyze room for tub evidence
function analyzeAgodaRoom(room) {
  const roomName = (room.name || '').trim();
  const allFacilities = (room.facilityGroups || []).flatMap(g => (g.facilities || []).map(f => f.title));
  const tubPhrases = [];

  // 1. Room Name check
  const nameTubMatch = roomName.match(/\b(jacuzzi|whirlpool|hot\s+tub|spa\s+bath|spa\s+tub|bathtub|soaking\s+tub|jetted\s+tub)\b/i);
  if (nameTubMatch) {
    tubPhrases.push(`Room Name: ${roomName}`);
  }

  // 2. Facility titles check
  for (const fac of allFacilities) {
    const fLower = fac.toLowerCase();
    if (
      fLower === 'bathtub' ||
      fLower === 'whirlpool bathtub' ||
      fLower === 'hot tub' ||
      fLower === 'spa tub' ||
      fLower === 'jacuzzi' ||
      fLower === 'spa bath' ||
      fLower === 'open-air bath' ||
      fLower.includes('whirlpool') ||
      fLower.includes('jacuzzi') ||
      fLower.includes('hot tub') ||
      fLower.includes('bathtub')
    ) {
      tubPhrases.push(fac);
    }
  }

  const uniqueTubPhrases = Array.from(new Set(tubPhrases));
  return {
    roomName,
    hasTub: uniqueTubPhrases.length > 0,
    tubPhrases: uniqueTubPhrases,
    allFacilitiesCount: allFacilities.length
  };
}

// Compute gap statistics from saved pages
function getGapStats() {
  if (!fs.existsSync(pagesDir)) {
    return { totalRequests: 0, minGapMs: null, gapsUnder20s: 0 };
  }
  const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.meta.json'));
  const metas = [];
  for (const f of files) {
    try {
      const m = JSON.parse(fs.readFileSync(path.join(pagesDir, f), 'utf8'));
      if (m.fetchedAt) metas.push(m);
    } catch {}
  }
  metas.sort((a, b) => new Date(a.fetchedAt).getTime() - new Date(b.fetchedAt).getTime());

  if (metas.length < 2) {
    return { totalRequests: metas.length, minGapMs: null, gapsUnder20s: 0 };
  }

  let minGapMs = Infinity;
  let gapsUnder20s = 0;

  for (let i = 1; i < metas.length; i++) {
    const prev = new Date(metas[i - 1].fetchedAt).getTime();
    const curr = new Date(metas[i].fetchedAt).getTime();
    const diff = curr - prev;
    if (diff < minGapMs) minGapMs = diff;
    if (diff < 20000) gapsUnder20s++;
  }

  return {
    totalRequests: metas.length,
    minGapMs: minGapMs === Infinity ? null : minGapMs,
    gapsUnder20s
  };
}

// Append checkpoint to data-collect/agoda1-progress.md
function appendProgressCheckpoint(progressFile, stats, gapStats, isFinal = false) {
  const timestamp = new Date().toISOString();
  let text = '';
  if (!fs.existsSync(progressFile)) {
    text += `# AGODA1 Progress Report\n\n`;
    text += `Started: ${timestamp}\n\n`;
    text += `| Time | Processed | Found | Tub Room Shown | Not Found | Wrong Hotel | Blocks | Min Gap (s) | Gaps < 20s |\n`;
    text += `|---|---|---|---|---|---|---|---|---|\n`;
  }

  const minGapSec = gapStats.minGapMs != null ? (gapStats.minGapMs / 1000).toFixed(2) : 'N/A';
  text += `| ${timestamp.slice(0, 19).replace('T', ' ')} | ${stats.processed} | ${stats.found} | ${stats.tubRoomShown} | ${stats.notFound} | ${stats.wrongHotel} | ${stats.blocks} | ${minGapSec} | ${gapStats.gapsUnder20s} |\n`;

  if (isFinal) {
    text += `\n### Final Summary (${timestamp})\n\n`;
    text += `- **Total Processed:** ${stats.processed} / ${stats.total}\n`;
    text += `- **Found & Matched:** ${stats.found}\n`;
    text += `  - **Tub Room Shown:** ${stats.tubRoomShown}\n`;
    text += `  - **No Tub Shown:** ${stats.found - stats.tubRoomShown}\n`;
    text += `- **Not Found:** ${stats.notFound}\n`;
    text += `- **Wrong Hotel (F1 Mismatch):** ${stats.wrongHotel}\n`;
    text += `- **Blocks Encountered:** ${stats.blocks}\n`;
    text += `- **Request Gap Stats:**\n`;
    text += `  - Total requests: ${gapStats.totalRequests}\n`;
    text += `  - Smallest gap: ${minGapSec}s (Target >= 20.0s)\n`;
    text += `  - Gaps under 20 seconds: ${gapStats.gapsUnder20s} (Target: 0)\n`;
  }

  fs.appendFileSync(progressFile, text, 'utf8');
}

async function main() {
  const args = process.argv.slice(2);
  const isWrite = args.includes('--write');
  const limitArg = args.find(a => a.startsWith('--limit='));
  const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : null;

  console.log(`=============================================================`);
  console.log(`>>> RUNNING AGODA1: Agoda Collection for Hidden US Hotels`);
  console.log(`Mode: ${isWrite ? 'WRITE (updates hotel_candidates)' : 'DRY-RUN (read-only)'}`);
  if (limit) console.log(`Limit: testing first ${limit} hotels only`);
  console.log(`=============================================================`);

  // 1. Robots.txt Verification
  console.log(`\n--- STEP 1: Robots.txt Verification ---`);
  const robotsUrl = 'https://www.agoda.com/robots.txt';
  const robotsRes = await fetch(robotsUrl, { headers: { 'User-Agent': USER_AGENT } });
  const robotsTxt = await robotsRes.text();
  const parser = robotsParser(robotsUrl, robotsTxt);

  const testSearchUrl = 'https://www.agoda.com/api/cronos/search/GetUnifiedSuggestResult/3/1/1/0/en-us/?searchText=Basin+Park+Hotel+Eureka+Springs';
  const isSearchAllowedUserAgent = parser.isAllowed(testSearchUrl, '*');
  const isSearchAllowedGooglebot = parser.isAllowed(testSearchUrl, 'Googlebot');

  console.log(`Robots.txt URL: ${robotsUrl}`);
  console.log(`Search Address Tested: ${testSearchUrl}`);
  console.log(`Allowed for User-agent *: ${isSearchAllowedUserAgent !== false ? 'ALLOWED' : 'DISALLOWED'}`);
  console.log(`Allowed for User-agent Googlebot: ${isSearchAllowedGooglebot !== false ? 'ALLOWED' : 'DISALLOWED'}`);

  if (isSearchAllowedUserAgent === false) {
    console.error(`🚨 STOP: Search address disallowed by robots.txt! Stopping as required.`);
    process.exit(1);
  }

  // 2. Database Connection & Verification
  console.log(`\n--- STEP 2: Database Connection & Integrity Check ---`);
  const client = new MongoClient(getMongoUri());
  await client.connect();
  const db = client.db();

  const initialHotelsCount = await db.collection('hotels').countDocuments();
  console.log(`Initial 'hotels' collection count: ${initialHotelsCount} (MUST remain 5,287)`);
  if (initialHotelsCount !== 5287) {
    console.warn(`WARNING: hotels count is ${initialHotelsCount}, expected 5287.`);
  }

  // Backfill the 31 candidates found in AGODA-TEST if needed
  if (isWrite) {
    const testResultsFile = path.join(privateDir, 'agoda-test-results.json');
    if (fs.existsSync(testResultsFile)) {
      try {
        const testData = JSON.parse(fs.readFileSync(testResultsFile, 'utf8'));
        const foundFromTest = (testData.results || []).filter(r => r.group !== '40 live' && r.status === 'found');
        let backfilled = 0;
        for (const ft of foundFromTest) {
          const doc = await db.collection('hotel_candidates').findOne({ _id: new ObjectId(ft.hotelId) });
          if (doc && (!doc.agodaLinks || doc.agodaLinks.length === 0)) {
            // Find saved gz in agoda-test to extract photos
            const indexStr = String(ft.index).padStart(3, '0');
            const testPagesDir = path.join(worktreeDir, 'data-collect', 'pages', 'agoda-test');
            let photos = [];
            if (fs.existsSync(testPagesDir)) {
              const gzFiles = fs.readdirSync(testPagesDir).filter(f => f.startsWith(`hotel-${indexStr}-`) && f.endsWith('.html.gz'));
              if (gzFiles.length > 0) {
                const gzBuf = fs.readFileSync(path.join(testPagesDir, gzFiles[0]));
                const jsonStr = zlib.gunzipSync(gzBuf).toString('utf8');
                const detail = JSON.parse(jsonStr);
                photos = extractAgodaPhotos(detail, 6);
              }
            }
            await db.collection('hotel_candidates').updateOne(
              { _id: doc._id },
              {
                $set: {
                  agodaLinks: [{ url: ft.agodaUrl, seenAt: ft.processedAt || new Date().toISOString() }],
                  agodaFacts: {
                    pageTitle: ft.agodaTitle,
                    address: ft.agodaAddress,
                    tubRooms: (ft.tubRooms || []).map(r => ({ roomName: r.roomName, labels: r.tubPhrases })),
                    photos,
                    fetchedAt: ft.processedAt || new Date().toISOString()
                  },
                  updatedAt: new Date().toISOString()
                }
              }
            );
            backfilled++;
          }
        }
        if (backfilled > 0) {
          console.log(`Backfilled agodaLinks & agodaFacts for ${backfilled} candidates found in AGODA-TEST.`);
        }
      } catch (err) {
        console.warn('Warning during AGODA-TEST backfill:', err.message);
      }
    }
  }

  // 3. Candidate Queue Construction
  console.log(`\n--- STEP 3: Queue Construction (Strict 3-Tier Ordering) ---`);
  // Tier 1: Hidden candidates whose Booking.com result is not_found, search_redirected or wrong_hotel
  const tier1 = await db.collection('hotel_candidates').find({
    'platformChecks.platform': { $ne: 'agoda.com' },
    platformChecks: {
      $elemMatch: {
        platform: 'booking.com',
        result: { $in: ['not_found', 'search_redirected', 'wrong_hotel'] }
      }
    }
  }).sort({ _id: 1 }).toArray();
  const tier1Ids = new Set(tier1.map(c => c._id.toString()));

  // Tier 2: Hidden candidates never checked, from towns with 5+ hotels first, biggest towns first
  const townsAgg = await db.collection('hotel_candidates').aggregate([
    { $group: { _id: '$address.locality', count: { $sum: 1 } } },
    { $match: { count: { $gte: 5 }, _id: { $ne: null } } },
    { $sort: { count: -1 } }
  ]).toArray();

  const tier2 = [];
  const tier2Ids = new Set();
  for (const t of townsAgg) {
    const candsInTown = await db.collection('hotel_candidates').find({
      'address.locality': t._id,
      'platformChecks.platform': { $ne: 'agoda.com' },
      $or: [
        { platformChecks: { $exists: false } },
        { platformChecks: { $size: 0 } },
        { platformChecks: null }
      ]
    }).sort({ _id: 1 }).toArray();

    for (const c of candsInTown) {
      const id = c._id.toString();
      if (!tier1Ids.has(id) && !tier2Ids.has(id)) {
        tier2.push(c);
        tier2Ids.add(id);
      }
    }
  }

  // Tier 3: All other hidden US candidates
  const allOthers = await db.collection('hotel_candidates').find({
    'platformChecks.platform': { $ne: 'agoda.com' }
  }).sort({ _id: 1 }).toArray();

  const tier3 = [];
  for (const c of allOthers) {
    const id = c._id.toString();
    if (!tier1Ids.has(id) && !tier2Ids.has(id)) {
      tier3.push(c);
    }
  }

  let fullQueue = [
    ...tier1.map(c => ({ ...c, tier: 'Tier 1 (Booking misses)' })),
    ...tier2.map(c => ({ ...c, tier: 'Tier 2 (Never checked, 5+ towns)' })),
    ...tier3.map(c => ({ ...c, tier: 'Tier 3 (All other hidden candidates)' }))
  ];

  console.log(`Tier 1 (Booking misses):                 ${tier1.length}`);
  console.log(`Tier 2 (Never checked, 5+ towns):         ${tier2.length}`);
  console.log(`Tier 3 (All other hidden candidates):    ${tier3.length}`);
  console.log(`Total ordered candidate queue:           ${fullQueue.length}`);

  if (limit && limit > 0) {
    fullQueue = fullQueue.slice(0, limit);
    console.log(`Limited queue to first ${limit} candidates.`);
  }

  // Load existing results if resumable
  if (!fs.existsSync(privateDir)) fs.mkdirSync(privateDir, { recursive: true });
  let resultsMap = {};
  if (fs.existsSync(resultsPath)) {
    try {
      const saved = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
      if (Array.isArray(saved.results)) {
        for (const r of saved.results) {
          resultsMap[r.hotelId] = r;
        }
        console.log(`Loaded ${Object.keys(resultsMap).length} results from ${resultsPath}`);
      }
    } catch {}
  }

  const stats = {
    total: fullQueue.length,
    processed: 0,
    found: 0,
    tubRoomShown: 0,
    notFound: 0,
    wrongHotel: 0,
    blocks: 0
  };

  let stopBlockError = null;

  // 4. Processing Loop
  console.log(`\n--- STEP 4: Processing Candidates with Honest 22s Gap ---`);
  for (let idx = 0; idx < fullQueue.length; idx++) {
    const cand = fullQueue[idx];
    try {
      const candId = cand._id.toString();
    const candName = cand.name;
    const candTown = cand.address?.locality || cand.town || '';
    const candStreet = cand.address?.street || '';
    const candCitySlug = cand.citySlug || '';
    const candStreetNum = extractStreetNumber(candStreet);

    console.log(`\n[${idx + 1}/${fullQueue.length}] [${cand.tier}] "${candName}" in ${candTown} (Street: "${candStreet}")`);

    // Skip if already in resultsMap or has agoda.com platformCheck
    if (resultsMap[candId]) {
      const cached = resultsMap[candId];
      console.log(`   -> Already processed (status: ${cached.status}), skipping.`);
      stats.processed++;
      if (cached.status === 'found') {
        stats.found++;
        if (cached.hasTubRoom) stats.tubRoomShown++;
      } else if (cached.status === 'not_found') {
        stats.notFound++;
      } else if (cached.status === 'wrong_hotel') {
        stats.wrongHotel++;
      }
      continue;
    }

    const liveCand = await withDbRetry(() => db.collection('hotel_candidates').findOne({ _id: cand._id }));
    const hasAgodaCheck = (liveCand?.platformChecks || []).some(c => c.platform === 'agoda.com');
    if (hasAgodaCheck) {
      console.log(`   -> Candidate already has agoda.com platformCheck, skipping.`);
      stats.processed++;
      continue;
    }

    const cleanQueryName = cleanForSearch(candName);
    const queryStr = `${cleanQueryName} ${candTown}`.trim();
    const searchUrl = `https://www.agoda.com/api/cronos/search/GetUnifiedSuggestResult/3/1/1/0/en-us/?searchText=${encodeURIComponent(queryStr)}`;
    const searchSlug = `search-${String(idx + 1).padStart(5, '0')}-${normalizeName(candName).slice(0, 30)}`;

    let searchData = null;
    try {
      const res = await honestFetch(searchUrl, searchSlug);
      searchData = JSON.parse(res.text);
    } catch (err) {
      if (err.isBlock) {
        console.error(`🚨 CRITICAL BLOCK ON SEARCH: ${err.message}`);
        stopBlockError = { time: err.time, url: err.url, status: err.status, atIndex: idx + 1 };
        stats.blocks++;
        break;
      }
      console.error(`   Error fetching search: ${err.message}`);
      continue;
    }

    const hotelSuggestions = (searchData.ViewModelList || []).filter(v => v.IsHotel);
    let matchedHotel = null;
    let wrongHotelCandidate = null;

    for (const sug of hotelSuggestions) {
      const sugCity = sug.CityName || '';
      const tMatch = townMatches(candTown, candCitySlug, sugCity);

      const candNorm = normalizeName(cleanQueryName);
      const sugNorm = normalizeName(sug.Name);
      const overlap = getSignificantWordOverlap(cleanQueryName, sug.Name);

      if (tMatch && (candNorm === sugNorm || overlap >= 0.5)) {
        matchedHotel = sug;
        break;
      } else if (tMatch) {
        wrongHotelCandidate = sug;
      }
    }

    if (!matchedHotel) {
      const status = wrongHotelCandidate ? 'wrong_hotel' : 'not_found';
      console.log(`   -> Result: ${status} (No matching hotel in ${candTown})`);
      stats.processed++;
      if (status === 'wrong_hotel') stats.wrongHotel++;
      else stats.notFound++;

      const record = {
        hotelId: candId,
        name: candName,
        town: candTown,
        street: candStreet,
        streetNum: candStreetNum,
        status,
        searchQuery: queryStr,
        agodaId: null,
        agodaName: null,
        agodaTitle: null,
        agodaAddress: null,
        agodaStreetNum: null,
        agodaUrl: null,
        f1Check: { pass: false, reason: 'not_found_in_search' },
        rooms: [],
        tubRooms: [],
        hasTubRoom: false,
        tubPhrases: [],
        processedAt: new Date().toISOString()
      };

      resultsMap[candId] = record;
      fs.writeFileSync(resultsPath, JSON.stringify({ results: Object.values(resultsMap), stopBlockError }, null, 2));

      if (isWrite) {
        const checkEntry = {
          platform: 'agoda.com',
          result: status,
          query: queryStr,
          checkedAt: new Date().toISOString()
        };
        const existingChecks = (cand.platformChecks || []).filter(c => c.platform !== 'agoda.com');
        existingChecks.push(checkEntry);
        await withDbRetry(() => db.collection('hotel_candidates').updateOne(
          { _id: cand._id },
          { $set: { platformChecks: existingChecks, updatedAt: new Date().toISOString() } }
        ));
      }

      // Checkpoint check
      if (stats.processed > 0 && stats.processed % 1000 === 0) {
        console.log(`\n>>> CHECKPOINT at ${stats.processed} candidates. Appending to agoda1-progress.md...`);
        const gapStats = getGapStats();
        appendProgressCheckpoint(progressFilePath, stats, gapStats, false);
        try {
          execSync(`git add data-collect/agoda1-progress.md && git commit -m "chore(data): agoda1 progress checkpoint (${stats.processed} processed)"`, {
            cwd: worktreeDir,
            stdio: 'inherit'
          });
        } catch (gitErr) {
          console.warn('Warning committing progress report:', gitErr.message);
        }
      }
      continue;
    }

    // Hotel found in suggestions! Fetch secondary detail data
    console.log(`   Suggest matched: "${matchedHotel.Name}" (ID: ${matchedHotel.ObjectId}, City: "${matchedHotel.CityName}")`);
    const detailUrl = `https://www.agoda.com/api/cronos/property/BelowFoldParams/GetSecondaryData?hotel_id=${matchedHotel.ObjectId}&all=false&isHostPropertiesEnabled=true`;
    const detailSlug = `hotel-${String(idx + 1).padStart(5, '0')}-${normalizeName(matchedHotel.Name).slice(0, 30)}`;

    let detailData = null;
    try {
      const res = await honestFetch(detailUrl, detailSlug);
      detailData = JSON.parse(res.text);
    } catch (err) {
      if (err.isBlock) {
        console.error(`🚨 CRITICAL BLOCK ON DETAIL: ${err.message}`);
        stopBlockError = { time: err.time, url: err.url, status: err.status, atIndex: idx + 1 };
        stats.blocks++;
        break;
      }
      console.error(`   Error fetching detail: ${err.message}`);
      continue;
    }

    const agodaAddressObj = detailData.hotelInfo?.address || {};
    const agodaFullAddress = agodaAddressObj.full || agodaAddressObj.address || '';
    const agodaStreetNum = extractStreetNumber(agodaFullAddress);
    const agodaName = detailData.hotelInfo?.englishName || detailData.hotelInfo?.name || matchedHotel.Name;
    const agodaTitle = `Best Price on ${agodaName} in ${agodaAddressObj.cityName || candTown} + Reviews!`;
    const rawCleanUrl = detailData.searchbox?.config?.defaultSearchURL || matchedHotel.ResultUrl || '';
    const agodaCleanUrl = rawCleanUrl.startsWith('http')
      ? rawCleanUrl.split('?')[0]
      : `https://www.agoda.com${rawCleanUrl.split('?')[0]}`;

    // F1 Match Check
    const candidateObj = {
      name: candName,
      streetAddress: candStreet,
      town: candTown,
      citySlug: candCitySlug,
      address: { street: candStreet, locality: candTown }
    };
    const f1 = matchHotelAddress(candidateObj, agodaFullAddress, agodaName);

    console.log(`   F1 Address Check: candNum="${candStreetNum}", agodaNum="${agodaStreetNum}" -> ${f1.pass ? 'PASS (F1)' : 'FAIL (' + f1.reason + ')'}`);

    if (!f1.pass) {
      const status = f1.reason && f1.reason.includes('street_number_mismatch') ? 'wrong_hotel' : 'not_found';
      console.log(`   -> Result: ${status} (${f1.reason})`);
      stats.processed++;
      if (status === 'wrong_hotel') stats.wrongHotel++;
      else stats.notFound++;

      const record = {
        hotelId: candId,
        name: candName,
        town: candTown,
        street: candStreet,
        streetNum: candStreetNum,
        status,
        searchQuery: queryStr,
        agodaId: matchedHotel.ObjectId,
        agodaName,
        agodaTitle,
        agodaAddress: agodaFullAddress,
        agodaStreetNum,
        agodaUrl: agodaCleanUrl,
        f1Check: f1,
        rooms: [],
        tubRooms: [],
        hasTubRoom: false,
        tubPhrases: [],
        processedAt: new Date().toISOString()
      };

      resultsMap[candId] = record;
      fs.writeFileSync(resultsPath, JSON.stringify({ results: Object.values(resultsMap), stopBlockError }, null, 2));

      if (isWrite) {
        const checkEntry = {
          platform: 'agoda.com',
          result: status,
          query: queryStr,
          checkedAt: new Date().toISOString()
        };
        const existingChecks = (cand.platformChecks || []).filter(c => c.platform !== 'agoda.com');
        existingChecks.push(checkEntry);
        await withDbRetry(() => db.collection('hotel_candidates').updateOne(
          { _id: cand._id },
          { $set: { platformChecks: existingChecks, updatedAt: new Date().toISOString() } }
        ));
      }

      if (stats.processed > 0 && stats.processed % 1000 === 0) {
        console.log(`\n>>> CHECKPOINT at ${stats.processed} candidates. Appending to agoda1-progress.md...`);
        const gapStats = getGapStats();
        appendProgressCheckpoint(progressFilePath, stats, gapStats, false);
        try {
          execSync(`git add data-collect/agoda1-progress.md && git commit -m "chore(data): agoda1 progress checkpoint (${stats.processed} processed)"`, {
            cwd: worktreeDir,
            stdio: 'inherit'
          });
        } catch (gitErr) {
          console.warn('Warning committing progress report:', gitErr.message);
        }
      }
      continue;
    }

    // F1 PASSED!
    const masterRooms = detailData.datelessMasterRoomInfo || [];
    const analyzedRooms = masterRooms.map(r => analyzeAgodaRoom(r));
    const tubRooms = analyzedRooms.filter(r => r.hasTub);
    const hasTubRoom = tubRooms.length > 0;
    const allTubPhrases = Array.from(new Set(tubRooms.flatMap(r => r.tubPhrases)));
    const photos = extractAgodaPhotos(detailData, 6);

    console.log(`   -> Result: FOUND! Rooms: ${masterRooms.length}, Tub Rooms: ${tubRooms.length}, Photos: ${photos.length}`);
    if (tubRooms.length > 0) {
      console.log(`      Tub wording: ${allTubPhrases.join(' | ')}`);
    }

    stats.processed++;
    stats.found++;
    if (hasTubRoom) stats.tubRoomShown++;

    const record = {
      hotelId: candId,
      name: candName,
      town: candTown,
      street: candStreet,
      streetNum: candStreetNum,
      status: 'found',
      searchQuery: queryStr,
      agodaId: matchedHotel.ObjectId,
      agodaName,
      agodaTitle,
      agodaAddress: agodaFullAddress,
      agodaStreetNum,
      agodaUrl: agodaCleanUrl,
      f1Check: f1,
      rooms: analyzedRooms.map(r => ({ roomName: r.roomName, hasTub: r.hasTub, tubPhrases: r.tubPhrases })),
      tubRooms: tubRooms.map(r => ({ roomName: r.roomName, labels: r.tubPhrases })),
      hasTubRoom,
      tubPhrases: allTubPhrases,
      photos,
      processedAt: new Date().toISOString()
    };

    resultsMap[candId] = record;
    fs.writeFileSync(resultsPath, JSON.stringify({ results: Object.values(resultsMap), stopBlockError }, null, 2));

    if (isWrite) {
      const checkEntry = {
        platform: 'agoda.com',
        result: 'found',
        query: queryStr,
        checkedAt: new Date().toISOString()
      };
      const existingChecks = (cand.platformChecks || []).filter(c => c.platform !== 'agoda.com');
      existingChecks.push(checkEntry);

      const existingLinks = cand.agodaLinks || [];
      if (!existingLinks.some(l => l.url === agodaCleanUrl)) {
        existingLinks.push({ url: agodaCleanUrl, seenAt: new Date().toISOString() });
      }

      const agodaFacts = {
        pageTitle: agodaTitle,
        address: agodaFullAddress,
        tubRooms: tubRooms.map(r => ({ roomName: r.roomName, labels: r.tubPhrases })),
        photos,
        fetchedAt: new Date().toISOString()
      };

      await withDbRetry(() => db.collection('hotel_candidates').updateOne(
        { _id: cand._id },
        {
          $set: {
            platformChecks: existingChecks,
            agodaLinks: existingLinks,
            agodaFacts,
            updatedAt: new Date().toISOString()
          }
        }
      ));
    }

    // Checkpoint every 1,000 processed candidates
    if (stats.processed > 0 && stats.processed % 1000 === 0) {
      console.log(`\n>>> CHECKPOINT at ${stats.processed} candidates. Appending to agoda1-progress.md...`);
      const gapStats = getGapStats();
      appendProgressCheckpoint(progressFilePath, stats, gapStats, false);
      try {
        execSync(`git add data-collect/agoda1-progress.md && git commit -m "chore(data): agoda1 progress checkpoint (${stats.processed} processed)"`, {
          cwd: worktreeDir,
          stdio: 'inherit'
        });
      } catch (gitErr) {
        console.warn('Warning committing progress report:', gitErr.message);
      }
    }
  } catch (err) {
    if (err.isBlock) {
      console.error(`🚨 CRITICAL BLOCK: ${err.message}`);
      stopBlockError = { time: err.time, url: err.url, status: err.status, atIndex: idx + 1 };
      stats.blocks++;
      break;
    }
    console.error(`   [error] Unexpected error processing candidate ${cand.name}: ${err.message}. Continuing...`);
  }
}

  // 5. Final Verification & Checkpoint Report
  const finalGapStats = getGapStats();
  console.log(`\n=============================================================`);
  console.log(`>>> AGODA1 RUN FINISHED`);
  console.log(`>>> Processed:             ${stats.processed} / ${stats.total}`);
  console.log(`>>> Found & matched:       ${stats.found} (Tub room shown: ${stats.tubRoomShown})`);
  console.log(`>>> Not found:             ${stats.notFound}`);
  console.log(`>>> Wrong hotel (F1 fail): ${stats.wrongHotel}`);
  console.log(`>>> Blocks:                ${stats.blocks}`);
  console.log(`>>> Smallest request gap:  ${finalGapStats.minGapMs != null ? (finalGapStats.minGapMs / 1000).toFixed(2) + 's' : 'N/A'}`);
  console.log(`>>> Gaps under 20 seconds: ${finalGapStats.gapsUnder20s} (Target: 0)`);
  if (stopBlockError) {
    console.log(`>>> 🚨 STOPPED ON BLOCK at ${stopBlockError.url} at ${stopBlockError.time}`);
  }
  console.log(`=============================================================`);

  appendProgressCheckpoint(progressFilePath, stats, finalGapStats, true);
  try {
    execSync(`git add data-collect/agoda1-progress.md && git commit -m "chore(data): agoda1 final checkpoint (${stats.processed} processed)"`, {
      cwd: worktreeDir,
      stdio: 'inherit'
    });
  } catch (gitErr) {
    console.warn('Warning committing final progress report:', gitErr.message);
  }

  // 6. Database Integrity Verification
  const finalHotelsCount = await db.collection('hotels').countDocuments();
  console.log(`\n--- DB INTEGRITY VERIFICATION ---`);
  console.log(`Initial 'hotels' count: ${initialHotelsCount}`);
  console.log(`Final 'hotels' count:   ${finalHotelsCount}`);
  if (initialHotelsCount === finalHotelsCount) {
    console.log(`✅ VERIFIED: 'hotels' collection untouched (strictly ${finalHotelsCount})!`);
  } else {
    console.error(`🚨 MISMATCH: 'hotels' collection changed from ${initialHotelsCount} to ${finalHotelsCount}!`);
  }

  // 7. Overlap Analysis Across All Candidates
  const allCandidates = await db.collection('hotel_candidates').find({}).toArray();
  let overlapBookingOnly = 0;
  let overlapAgodaOnly = 0;
  let overlapBoth = 0;
  let overlapNeither = 0;

  for (const c of allCandidates) {
    const hasBooking = (c.bookingLinks && c.bookingLinks.length > 0) || (c.platformChecks || []).some(p => p.platform === 'booking.com' && p.result === 'found');
    const hasAgoda = (c.agodaLinks && c.agodaLinks.length > 0) || (c.platformChecks || []).some(p => p.platform === 'agoda.com' && p.result === 'found');

    if (hasBooking && hasAgoda) overlapBoth++;
    else if (hasBooking) overlapBookingOnly++;
    else if (hasAgoda) overlapAgodaOnly++;
    else overlapNeither++;
  }

  console.log(`\n--- OVERLAP ANALYSIS ACROSS ALL ${allCandidates.length} CANDIDATES ---`);
  console.log(`- Both Booking & Agoda: ${overlapBoth}`);
  console.log(`- Booking only:         ${overlapBookingOnly}`);
  console.log(`- Agoda only:           ${overlapAgodaOnly}`);
  console.log(`- Neither:              ${overlapNeither}`);

  await client.close();
}

main().catch(err => {
  console.error(`\n🚨 Fatal runner error:`, err);
  process.exit(1);
});
