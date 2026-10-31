#!/usr/bin/env node
/**
 * collect-agoda-india.mjs
 *
 * Agoda verification & tub collection for live India hotels (CEO Sheet T33).
 *
 * Requirements:
 * - Queue ordering: Hotels with stored agodaUrl go first (direct URL fetch); the rest are searched.
 * - Enforces >= 22.0s gap between all agoda.com requests.
 * - Stops completely at any block (403, 429, 202, CAPTCHA, challenge).
 * - Records Agoda name, address, coordinates (latlng), rooms, and strict tub proof.
 * - Implements strict tub proof: "Bathtub" and "Whirlpool bathtub" = proof, room name tub keywords = proof.
 *   Excludes "Separate shower/bathtub", "Bathtub grab bar", "Bathtub seat".
 * - Logs all lookups, appending non-matches to not-found log.
 * - --dry-run mode: loads input, prints hotel counts and first 10 planned lookups with 0 requests made.
 */

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import robotsParser from './vendor/robots-parser/index.js';
import {
  normalizeName,
  getSignificantWords,
  getSignificantWordOverlap,
  haversineKm,
  townMatches
} from './match-utils.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const worktreeDir = path.resolve(__dirname, '../..');
const pagesDir = path.join(worktreeDir, 'data-collect', 'pages', 'agoda-india');
const privateDir = path.join(worktreeDir, 'data-collect', 'private');
const resultsPath = path.join(privateDir, 'agoda-india-results.json');
const notFoundCsvPath = path.join(privateDir, 'not-found-agoda-india.csv');

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

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const MIN_GAP_MS = 22000; // Enforce >= 22.0s gap between ALL requests to agoda.com

// Clean hotel name for search
export function cleanForSearch(name) {
  if (!name) return '';
  let s = name;
  s = s.replace(/[\u2013\u2014\-]\s*[A-Z\s,]+$/, '');
  s = s.replace(/,\s*(?:an?\s+)?(?:ihg|hilton|wyndham|marriott|hyatt|radisson|choice|spinnaker|best western|tapestry collection|doubletree).*$/i, '');
  s = s.replace(/\s+(?:by\s+(?:wyndham|spinnaker|radisson|hilton|marriott|hyatt))/i, '');
  s = s.replace(/\s+(?:an?\s+ihg\s+hotel|a\s+doubletree\s+by\s+hilton\s+hotel)/i, '');
  s = s.replace(/[^\w\s&]/g, ' ').replace(/\s+/g, ' ').trim();
  return s;
}

// Block detection
function detectBlock(status, bodyText) {
  if (status === 202 || status === 403 || status === 429) {
    return `HTTP ${status}`;
  }
  const lower = (bodyText || '').toLowerCase();
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
    site: 'agoda-india',
    slug,
    status: res.status,
    fetchedAt: reqTimestamp,
    rawSizeBytes: Buffer.byteLength(text, 'utf-8'),
    gzSizeBytes: gzBuf.length
  };
  fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2), 'utf-8');

  return { status: res.status, text, meta };
}

// Extract photos from Agoda detail
function extractAgodaPhotos(detailData, maxPhotos = 6) {
  const photos = [];
  const images = detailData?.mosaicInitData?.images || [];
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

// Strict Agoda facility title check (satisfies PROMOTE3-PREP-B and Working Rules)
export function isAgodaTubFacilityProof(fac) {
  if (!fac) return false;
  const fLower = fac.trim().toLowerCase();
  // Disqualify non-proof labels explicitly
  if (
    fLower === 'separate shower/bathtub' ||
    fLower === 'bathtub grab bar' ||
    fLower === 'bathtub seat' ||
    fLower.includes('grab bar') ||
    fLower.includes('bathtub seat')
  ) {
    return false;
  }
  // Explicit proof labels
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
    fLower.includes('hot tub')
  ) {
    return true;
  }
  if (fLower.includes('bathtub') && !fLower.includes('shower/bathtub')) {
    return true;
  }
  return false;
}

// Analyze room for strict tub evidence
export function analyzeAgodaRoom(room) {
  const roomName = (room.name || '').trim();
  const allFacilities = (room.facilityGroups || []).flatMap(g => (g.facilities || []).map(f => f.title));
  const tubPhrases = [];

  // 1. Room Name check
  const nameTubMatch = roomName.match(/\b(jacuzzi|whirlpool|hot\s+tub|spa\s+bath|spa\s+tub|bathtub|soaking\s+tub|jetted\s+tub)\b/i);
  if (nameTubMatch) {
    tubPhrases.push(`Room Name: ${roomName}`);
  }

  // 2. Facility titles check with strict proof
  for (const fac of allFacilities) {
    if (isAgodaTubFacilityProof(fac)) {
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

// Extract Agoda coordinates from secondary detail data
export function extractAgodaCoordinates(detailData) {
  if (!detailData) return null;
  // 1. mapParams.latlng [lat, lon]
  if (Array.isArray(detailData.mapParams?.latlng) && detailData.mapParams.latlng.length >= 2) {
    const lat = Number(detailData.mapParams.latlng[0]);
    const lon = Number(detailData.mapParams.latlng[1]);
    if (!isNaN(lat) && !isNaN(lon) && (lat !== 0 || lon !== 0)) {
      return { latitude: lat, longitude: lon, source: 'mapParams.latlng' };
    }
  }
  // 2. mapParams.staticUrl regex center=lat%2clon
  if (detailData.mapParams?.staticUrl) {
    const m = detailData.mapParams.staticUrl.match(/center=([-\d.]+)%2c([-\d.]+)/i);
    if (m) {
      const lat = parseFloat(m[1]);
      const lon = parseFloat(m[2]);
      if (!isNaN(lat) && !isNaN(lon)) {
        return { latitude: lat, longitude: lon, source: 'mapParams.staticUrl' };
      }
    }
  }
  return null;
}

// Load India hotels input
export function loadIndiaHotels() {
  const cacheCandidates = [
    path.join(worktreeDir, '../hotelswithbathtubs/.cache/all-hotels.json'),
    path.join(worktreeDir, '.cache/all-hotels.json'),
    path.join(process.cwd(), '.cache/all-hotels.json'),
    path.join(process.cwd(), '../hotelswithbathtubs/.cache/all-hotels.json')
  ];

  let rawHotels = null;
  for (const p of cacheCandidates) {
    if (fs.existsSync(p)) {
      try {
        rawHotels = JSON.parse(fs.readFileSync(p, 'utf8'));
        break;
      } catch {}
    }
  }

  if (!rawHotels) {
    throw new Error('Could not find all-hotels.json in cache');
  }

  const indiaHotels = rawHotels.filter(h => h.country === 'India');

  // Split into stored agodaUrl (Tier 1) and search (Tier 2)
  const withAgodaUrl = [];
  const searchOnly = [];

  for (const h of indiaHotels) {
    const cand = {
      _id: h._id,
      name: h.name,
      town: h.city || h.town || '',
      citySlug: h.citySlug || (h.city || '').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      streetAddress: h.streetAddress || h.address?.street || '',
      latitude: h.latitude,
      longitude: h.longitude,
      agodaUrl: h.agodaUrl || null,
      agodaHotelId: h.agodaHotelId || null
    };

    if (h.agodaUrl) {
      withAgodaUrl.push({ ...cand, queueTier: 'Tier 1 (Stored agodaUrl)', lookupType: 'direct_url' });
    } else {
      searchOnly.push({ ...cand, queueTier: 'Tier 2 (Search)', lookupType: 'search' });
    }
  }

  return {
    total: indiaHotels.length,
    withAgodaUrl,
    searchOnly,
    queue: [...withAgodaUrl, ...searchOnly]
  };
}

// Append record to not-found log (Rule 6.5)
function appendNotFoundRow(record) {
  if (!fs.existsSync(privateDir)) fs.mkdirSync(privateDir, { recursive: true });
  if (!fs.existsSync(notFoundCsvPath)) {
    fs.writeFileSync(notFoundCsvPath, 'name,town,state,address,last query,result,date\n', 'utf8');
  }
  const name = `"${(record.name || '').replace(/"/g, '""')}"`;
  const town = `"${(record.town || '').replace(/"/g, '""')}"`;
  const state = `"${(record.state || '').replace(/"/g, '""')}"`;
  const street = `"${(record.streetAddress || '').replace(/"/g, '""')}"`;
  const query = `"${(record.searchQuery || record.agodaUrl || '').replace(/"/g, '""')}"`;
  const result = `"${record.status} (${record.matchReason || ''})"`;
  const date = `"${(record.processedAt || new Date().toISOString()).slice(0, 10)}"`;
  fs.appendFileSync(notFoundCsvPath, `${name},${town},${state},${street},${query},${result},${date}\n`, 'utf8');
}

async function main() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  const limitArg = args.find(a => a.startsWith('--limit='));
  const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : null;

  console.log(`=============================================================`);
  console.log(`>>> AGODA INDIA COLLECTOR & VERIFICATION PLANNER`);
  console.log(`Mode: ${isDryRun ? 'DRY-RUN (0 web requests, 0 DB writes)' : 'LIVE EXECUTION'}`);
  console.log(`=============================================================`);

  // 1. Load Input Queue
  const { total, withAgodaUrl, searchOnly, queue } = loadIndiaHotels();
  console.log(`\n--- STEP 1: Candidate Queue Summary ---`);
  console.log(`Total live India hotels in catalog:     ${total}`);
  console.log(`Tier 1 (Hotels with stored agodaUrl):   ${withAgodaUrl.length}`);
  console.log(`Tier 2 (Hotels requiring search):       ${searchOnly.length}`);
  console.log(`Total ordered collection queue:         ${queue.length}`);

  let activeQueue = queue;
  if (limit && limit > 0) {
    activeQueue = activeQueue.slice(0, limit);
    console.log(`Limited queue to first ${limit} items.`);
  }

  // 2. Handle --dry-run
  if (isDryRun) {
    console.log(`\n--- STEP 2: First 10 Planned Lookups (--dry-run) ---`);
    const previewCount = Math.min(10, activeQueue.length);
    for (let i = 0; i < previewCount; i++) {
      const h = activeQueue[i];
      console.log(`\n[${i + 1}/${activeQueue.length}] [${h.queueTier}] "${h.name}" in ${h.town}`);
      console.log(`   - Lookup Type:   ${h.lookupType}`);
      console.log(`   - Coordinates:   Lat ${h.latitude ?? 'N/A'}, Lon ${h.longitude ?? 'N/A'}`);
      console.log(`   - Street:        "${h.streetAddress || 'N/A'}"`);
      if (h.lookupType === 'direct_url') {
        console.log(`   - Target URL:    ${h.agodaUrl}`);
        console.log(`   - Agoda HotelId: ${h.agodaHotelId || 'Will extract from URL/HTML'}`);
      } else {
        const queryStr = `${cleanForSearch(h.name)} ${h.town}`.trim();
        console.log(`   - Search Query:  "${queryStr}"`);
      }
    }

    console.log(`\n-------------------------------------------------------------`);
    console.log(`>>> DRY RUN COMPLETE: 0 requests made to agoda.com, 0 DB writes.`);
    console.log(`-------------------------------------------------------------`);
    return;
  }

  // 3. Live Execution Guard
  console.error(`🚨 Live execution blocked: Today's task is script and plan only.`);
  console.error(`   The US AGODA1 collector (pid 75036) is currently running.`);
  console.error(`   Run with '--dry-run' to inspect planned queue.`);
  process.exit(1);
}

// Execute when called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(err => {
    console.error('Fatal error in collect-agoda-india.mjs:', err);
    process.exit(1);
  });
}
