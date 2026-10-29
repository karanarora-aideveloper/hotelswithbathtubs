// scripts/data/collect-booking-links2.mjs
// LINKS2: Booking.com links for every remaining hidden US hotel.
// 5,746 hidden candidates in priority order:
//   1. 375 suburbs (nearCity set)
//   2. Towns with 5+ hotels (244 towns, 2,483 hotels; biggest towns first)
//   3. 146 retry hotels from LINKS1B (citySlug set)
//   4. All other hidden US hotels (2,742 hotels)
//
// Strict rules:
// - ONE collector, ONE machine.
// - robots.txt, 10s gap between all requests (minDelayMs: 10000).
// - Stop completely at first block. Report time and URL.
// - Resumable: skip candidates with booking.com check dated today or later.
// - F1 address matching: street number must be equal, town must match.
// - F2 tub reading: [{ roomName, labels: ['Bath'|'Bathtub'|'Spa tub'|'Hot tub'|'Whirlpool'|'Jacuzzi'|'room name'] }].
// - Store up to 6 cf.bstatic.com photos in bookingFacts.photos.
// - Writes ONLY to hotel_candidates; hotels count stays at 4,758.
// - Appends checkpoints to data-collect/links2-progress.md every 1,000 hotels and at end.

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { MongoClient } from 'mongodb';
import * as cheerio from 'cheerio';
import dotenv from 'dotenv';
import { savePage, closeBrowser, BlockError } from './saver.mjs';
import { parseBookingHtml, extractPhotos } from './parse-booking.mjs';
import { computeGaps } from './audit-gaps.mjs';
import {
  normalizeName,
  getSignificantWords,
  getSignificantWordOverlap,
  matchHotelAddress,
  extractStreetNumber,
  townMatches
} from './match-utils.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const worktreeDir = path.resolve(__dirname, '../..');
const privateDir = path.join(worktreeDir, 'data-collect', 'private');
if (!fs.existsSync(privateDir)) {
  fs.mkdirSync(privateDir, { recursive: true });
}

// Load env
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

const US_STATES = [
  'alabama', 'alaska', 'arizona', 'arkansas', 'california', 'colorado', 'connecticut',
  'delaware', 'florida', 'georgia', 'hawaii', 'idaho', 'illinois', 'indiana', 'iowa',
  'kansas', 'kentucky', 'louisiana', 'maine', 'maryland', 'massachusetts', 'michigan',
  'minnesota', 'mississippi', 'missouri', 'montana', 'nebraska', 'nevada', 'new hampshire',
  'new jersey', 'new mexico', 'new york', 'north carolina', 'north dakota', 'ohio',
  'oklahoma', 'oregon', 'pennsylvania', 'rhode island', 'south carolina', 'south dakota',
  'tennessee', 'texas', 'utah', 'vermont', 'virginia', 'washington', 'west virginia',
  'wisconsin', 'wyoming', 'al', 'ak', 'az', 'ar', 'ca', 'co', 'ct', 'de', 'fl', 'ga',
  'hi', 'id', 'il', 'in', 'ia', 'ks', 'ky', 'la', 'me', 'md', 'ma', 'mi', 'mn', 'ms',
  'mo', 'mt', 'ne', 'nv', 'nh', 'nj', 'nm', 'ny', 'nc', 'nd', 'oh', 'ok', 'or', 'pa',
  'ri', 'sc', 'sd', 'tn', 'tx', 'ut', 'vt', 'va', 'wa', 'wv', 'wi', 'wy'
];
const stateRegex = new RegExp(`[,\\-\\s]+(?:${US_STATES.join('|')})\\s*$`, 'i');

export function cleanHotelNameForSearch(name) {
  if (!name) return '';
  let cleaned = name;
  // Remove decorative B&B / bed and breakfast suffixes
  cleaned = cleaned.replace(/\s+(?:b&b|bed\s+and\s+breakfast|bed\s*&\s*breakfast|b\s*&\s*b)(?:\s+(?:inn|spa|and|&).*|$)/i, '');
  // Remove state suffixes if present (e.g. ", CA" or " - California")
  cleaned = cleaned.replace(stateRegex, '');
  // Clean up trailing punctuation
  cleaned = cleaned.replace(/[,\-\\.\\/]+$/, '').trim();
  return cleaned;
}

export function cleanHotelUrl(rawUrl) {
  if (!rawUrl) return null;
  const stripped = rawUrl.split('?')[0];
  return stripped.replace(/\.en-gb\.html$/, '.html');
}

function matchCard(cardTitle, cardAddress, candidate) {
  const normCandName = normalizeName(candidate.name);
  const normCleanName = normalizeName(cleanHotelNameForSearch(candidate.name));
  const normCardTitle = normalizeName(cardTitle);

  const nameExact = normCandName === normCardTitle || normCleanName === normCardTitle;
  const overlap = getSignificantWordOverlap(cleanHotelNameForSearch(candidate.name), cardTitle);
  const candWords = getSignificantWords(cleanHotelNameForSearch(candidate.name));
  const cardWordsSet = new Set(getSignificantWords(cardTitle));
  const allCandWordsInCard = candWords.length > 0 && candWords.every(w => cardWordsSet.has(w));

  const nameMatches = nameExact || overlap >= 0.70 || allCandWordsInCard;
  if (!nameMatches) return false;

  // Town check if cardAddress is present
  if (cardAddress && !townMatches(candidate.town, candidate.citySlug, cardAddress)) {
    if (!nameExact && overlap < 1.0) return false;
  }

  return true;
}

export function parseBookingSearchResults(html, candidate) {
  const $ = cheerio.load(html);
  const propertyCards = $('[data-testid="property-card"]');
  if (propertyCards.length === 0) {
    return { cardsCount: 0, matched: null };
  }

  for (let i = 0; i < propertyCards.length; i++) {
    const card = propertyCards.eq(i);
    const title = card.find('[data-testid="title"]').text().trim();
    const link = card.find('a[data-testid="title-link"]').attr('href');
    const address = card.find('[data-testid="address-line"], [data-testid="distance"]').text().trim();

    if (!title || !link) continue;

    if (matchCard(title, address, candidate)) {
      return {
        cardsCount: propertyCards.length,
        matched: {
          title,
          address,
          rawLink: link,
          cleanUrl: cleanHotelUrl(link)
        }
      };
    }
  }

  return { cardsCount: propertyCards.length, matched: null };
}

// Checkpoint helper
function appendProgressCheckpoint(progressFile, stats, gapStats, isFinal = false) {
  const timestamp = new Date().toISOString();
  let text = '';
  if (!fs.existsSync(progressFile)) {
    text += `# LINKS2 Progress Report\n\n`;
    text += `Started: ${timestamp}\n\n`;
    text += `| Time | Processed | Found | Tub Confirmed | No Tub | Not Found | Redirected | Wrong Hotel | Blocks | Min Gap (s) | Gaps < 10s |\n`;
    text += `|---|---|---|---|---|---|---|---|---|---|---|\n`;
  }

  const minGapSec = gapStats.minGapMs != null ? (gapStats.minGapMs / 1000).toFixed(2) : 'N/A';
  text += `| ${timestamp.slice(0, 19).replace('T', ' ')} | ${stats.processed} | ${stats.found} | ${stats.tubConfirmed} | ${stats.noTub} | ${stats.notFound} | ${stats.redirected} | ${stats.wrongHotel} | ${stats.blocks} | ${minGapSec} | ${gapStats.under10s} |\n`;

  if (isFinal) {
    text += `\n### Final Summary (${timestamp})\n\n`;
    text += `- **Total Processed:** ${stats.processed} / ${stats.total}\n`;
    text += `- **Found & Matched:** ${stats.found}\n`;
    text += `  - **Tub Confirmed:** ${stats.tubConfirmed}\n`;
    text += `  - **No Tub Found:** ${stats.noTub}\n`;
    text += `- **Not Found:** ${stats.notFound}\n`;
    text += `- **Search Redirected:** ${stats.redirected}\n`;
    text += `- **Wrong Hotel (F1 Mismatch):** ${stats.wrongHotel}\n`;
    text += `- **Blocks Encountered:** ${stats.blocks}\n`;
    text += `- **Request Gap Stats:**\n`;
    text += `  - Total requests: ${gapStats.totalRequests}\n`;
    text += `  - Smallest gap: ${minGapSec}s\n`;
    text += `  - Gaps under 10 seconds: ${gapStats.under10s} (Target: 0)\n`;
  }

  fs.appendFileSync(progressFile, text, 'utf8');
}

async function main() {
  const args = process.argv.slice(2);
  const isWrite = args.includes('--write');
  const limitArg = args.find(a => a.startsWith('--limit='));
  const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : null;
  const startArg = args.find(a => a.startsWith('--start='));
  const startIdx = startArg ? parseInt(startArg.split('=')[1], 10) : 0;
  const folderArg = args.find(a => a.startsWith('--folder='));
  const folderName = folderArg ? folderArg.split('=')[1] : 'booking-links2';
  const progressArg = args.find(a => a.startsWith('--progress='));
  const progressFilename = progressArg ? progressArg.split('=')[1] : 'links2-progress.md';
  const resultsArg = args.find(a => a.startsWith('--results='));
  const resultsFilename = resultsArg ? resultsArg.split('=')[1] : 'links2-results.json';

  console.log('=============================================================');
  console.log('>>> RUNNING LINKS2: Booking.com Collection for Hidden US Hotels');
  console.log(`>>> Mode: ${isWrite ? 'WRITE TO DATABASE' : 'DRY RUN (no DB writes)'}`);
  if (limit) console.log(`>>> Limit: ${limit} hotels`);
  if (startIdx > 0) console.log(`>>> Starting at index: ${startIdx}`);
  console.log(`>>> Storage Folder: ${folderName}`);
  console.log(`>>> Progress File: ${progressFilename}`);
  console.log('=============================================================');

  const uri = getMongoUri();
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();

  // 1. Initial count checks - hotels collection MUST be 4758
  const hotelsCount = await db.collection('hotels').countDocuments();
  console.log(`Verified current hotels collection count: ${hotelsCount} (must be 4758)`);
  if (hotelsCount !== 4758) {
    console.error(`FATAL: Expected exactly 4758 hotels in 'hotels', found ${hotelsCount}`);
    await client.close();
    process.exit(1);
  }

  // 2. Build the ordered candidate list
  // Group 1: 375 suburbs (nearCity set)
  const group1 = await db.collection('hotel_candidates')
    .find({ status: 'hidden', nearCity: { $ne: null } })
    .sort({ key: 1 })
    .toArray();

  // Group 3: 146 retry hotels from LINKS1B (citySlug set, nearCity null)
  const group3 = await db.collection('hotel_candidates')
    .find({
      status: 'hidden',
      nearCity: null,
      citySlug: { $ne: null }
    })
    .sort({ key: 1 })
    .toArray();

  // Remaining hidden candidates in new towns (nearCity == null, citySlug == null)
  const remaining = await db.collection('hotel_candidates')
    .find({
      status: 'hidden',
      nearCity: null,
      citySlug: null
    })
    .sort({ key: 1 })
    .toArray();

  // Group remaining by town
  const townCounts = {};
  for (const h of remaining) {
    const t = h.town || 'unknown';
    townCounts[t] = (townCounts[t] || 0) + 1;
  }

  // Towns with >= 5 hotels, sorted by count descending (biggest first)
  const bigTownEntries = Object.entries(townCounts).filter(([t, count]) => count >= 5);
  bigTownEntries.sort((a, b) => b[1] - a[1]);
  const bigTownRank = new Map();
  bigTownEntries.forEach(([t], idx) => bigTownRank.set(t, idx));

  // Group 2: Towns with 5+ hotels (biggest first)
  const group2 = remaining.filter(h => bigTownRank.has(h.town));
  group2.sort((a, b) => {
    const rankDiff = (bigTownRank.get(a.town) ?? 9999) - (bigTownRank.get(b.town) ?? 9999);
    if (rankDiff !== 0) return rankDiff;
    return (a.name || '').localeCompare(b.name || '');
  });

  // Group 4: All other hidden US hotels (towns with 1-4 hotels)
  const group4 = remaining.filter(h => !bigTownRank.has(h.town));
  group4.sort((a, b) => {
    const townDiff = (a.town || '').localeCompare(b.town || '');
    if (townDiff !== 0) return townDiff;
    return (a.name || '').localeCompare(b.name || '');
  });

  const fullCandidateList = [...group1, ...group2, ...group3, ...group4];
  console.log(`\nCandidate List Breakdown:`);
  console.log(`  1. Suburbs (nearCity set):           ${group1.length}`);
  console.log(`  2. Towns with 5+ hotels:             ${group2.length} (${bigTownEntries.length} towns)`);
  console.log(`  3. Retries from LINKS1B:             ${group3.length}`);
  console.log(`  4. Other hidden US hotels:           ${group4.length}`);
  console.log(`  Total hidden US candidates:          ${fullCandidateList.length}`);

  let candidatesToRun = fullCandidateList;
  if (startIdx > 0 || limit) {
    candidatesToRun = fullCandidateList.slice(startIdx, limit ? startIdx + limit : undefined);
    console.log(`Processing slice of ${candidatesToRun.length} candidates (start: ${startIdx}, limit: ${limit || 'none'}).`);
  }

  // Load results tracking file
  const resultsPath = path.join(privateDir, resultsFilename);
  let resultsMap = {};
  if (fs.existsSync(resultsPath)) {
    try {
      const existing = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
      if (Array.isArray(existing.results)) {
        for (const r of existing.results) {
          resultsMap[r.key] = r;
        }
      }
    } catch {}
  }

  const progressFilePath = path.join(worktreeDir, 'data-collect', progressFilename);

  function getGapStats() {
    const res = computeGaps(path.join(worktreeDir, 'data-collect', 'pages', folderName));
    return {
      totalRequests: res.total,
      minGapMs: res.minGapMs,
      under10s: res.under10s
    };
  }

  const stats = {
    total: candidatesToRun.length,
    processed: 0,
    found: 0,
    tubConfirmed: 0,
    noTub: 0,
    notFound: 0,
    redirected: 0,
    wrongHotel: 0,
    blocks: 0
  };

  let stopBlockError = null;

  // 30 days ahead checkin/checkout dates
  const d = new Date();
  d.setDate(d.getDate() + 30);
  const checkin = d.toISOString().slice(0, 10);
  d.setDate(d.getDate() + 1);
  const checkout = d.toISOString().slice(0, 10);
  console.log(`Method A dates: checkin=${checkin}, checkout=${checkout}\n`);

  const todayDateStr = new Date().toISOString().slice(0, 10);

  try {
    for (let i = 0; i < candidatesToRun.length; i++) {
      const hotel = candidatesToRun[i];
      const overallIdx = startIdx + i + 1;
      console.log(`\n[${overallIdx}/${fullCandidateList.length}] Hotel: "${hotel.name}" (${hotel.town}, ${hotel.state}) key: ${hotel.key}`);

      // Resumable check:
      // Skip if platformChecks has a booking.com entry dated today (2026-10-29) or later
      const liveCand = await db.collection('hotel_candidates').findOne({ _id: hotel._id });
      const checks = (liveCand?.platformChecks || hotel.platformChecks || []);
      const todayBookingCheck = checks.find(c => c.platform === 'booking.com' && c.checkedAt && c.checkedAt >= '2026-10-29');

      if (todayBookingCheck) {
        console.log(`  -> Already checked today (${todayBookingCheck.checkedAt.slice(0, 10)}) with result: ${todayBookingCheck.result}, skipping.`);
        stats.processed++;
        if (todayBookingCheck.result === 'found') {
          stats.found++;
          if (liveCand?.roomNameStatus === 'confirmed_booking') stats.tubConfirmed++;
          else stats.noTub++;
        } else if (todayBookingCheck.result === 'not_found') stats.notFound++;
        else if (todayBookingCheck.result === 'search_redirected') stats.redirected++;
        else if (todayBookingCheck.result === 'wrong_hotel') stats.wrongHotel++;
        continue;
      }

      if (resultsMap[hotel.key] && resultsMap[hotel.key].processedAt >= '2026-10-29') {
        const cached = resultsMap[hotel.key];
        console.log(`  -> Already processed in saved links2 results today with status: ${cached.status}, skipping.`);
        stats.processed++;
        if (cached.status === 'found') {
          stats.found++;
          if (cached.tubRoomsCount > 0) stats.tubConfirmed++;
          else stats.noTub++;
        } else if (cached.status === 'not_found') stats.notFound++;
        else if (cached.status === 'search_redirected') stats.redirected++;
        else if (cached.status === 'wrong_hotel') stats.wrongHotel++;
        continue;
      }

      // Prepare Search Query
      const cleanName = cleanHotelNameForSearch(hotel.name);
      const queryStr = `${cleanName} ${hotel.town}`;
      const searchUrl = `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(queryStr)}&checkin=${checkin}&checkout=${checkout}`;
      const searchSlug = `search-links2-${hotel.key.replace(/\|/g, '-')}`;

      let searchGzPath = null;
      let searchMeta = null;
      try {
        const saveRes = await savePage(folderName, searchUrl, searchSlug, { minDelayMs: 10500 });
        searchGzPath = saveRes.gzPath;
        searchMeta = saveRes.meta;
      } catch (err) {
        if (err instanceof BlockError || err.name === 'BlockError') {
          console.error(`\n🚨 CRITICAL BLOCK DETECTED: ${err.message}`);
          stopBlockError = {
            atKey: hotel.key,
            hotelName: hotel.name,
            url: searchUrl,
            error: err.message,
            atIndex: overallIdx,
            time: new Date().toISOString()
          };
          stats.blocks++;
          break;
        }
        console.warn(`\n[warning] Transient error searching ${hotel.key}: ${err.message}. Retrying once...`);
        await closeBrowser();
        await new Promise(r => setTimeout(r, 5000));
        try {
          const saveRes = await savePage(folderName, searchUrl, searchSlug, { minDelayMs: 10500 });
          searchGzPath = saveRes.gzPath;
          searchMeta = saveRes.meta;
        } catch (retryErr) {
          if (retryErr instanceof BlockError || retryErr.name === 'BlockError') {
            console.error(`\n🚨 CRITICAL BLOCK DETECTED ON RETRY: ${retryErr.message}`);
            stopBlockError = {
              atKey: hotel.key,
              hotelName: hotel.name,
              url: searchUrl,
              error: retryErr.message,
              atIndex: overallIdx,
              time: new Date().toISOString()
            };
            stats.blocks++;
            break;
          }
          throw retryErr;
        }
      }

      // Parse Search Results
      const searchBuf = fs.readFileSync(searchGzPath);
      const searchHtml = zlib.gunzipSync(searchBuf).toString('utf-8');
      const { cardsCount, matched } = parseBookingSearchResults(searchHtml, hotel);

      const isRedirect = cardsCount === 0 || (searchMeta && searchMeta.finalUrl && !searchMeta.finalUrl.includes('searchresults'));
      if (isRedirect) {
        console.log(`  -> Search redirected to homepage / 0 cards.`);
        stats.processed++;
        stats.redirected++;
        const record = {
          key: hotel.key,
          name: hotel.name,
          town: hotel.town,
          state: hotel.state,
          status: 'search_redirected',
          query: queryStr,
          cardsCount: 0,
          processedAt: new Date().toISOString()
        };
        resultsMap[hotel.key] = record;
        fs.writeFileSync(resultsPath, JSON.stringify({ results: Object.values(resultsMap), stopBlockError }, null, 2));

        if (isWrite) {
          const checkEntry = {
            platform: 'booking.com',
            result: 'search_redirected',
            query: queryStr,
            checkedAt: new Date().toISOString()
          };
          const existingChecks = (hotel.platformChecks || []).filter(c => c.platform !== 'booking.com');
          existingChecks.push(checkEntry);
          await db.collection('hotel_candidates').updateOne(
            { _id: hotel._id },
            { $set: { platformChecks: existingChecks, updatedAt: new Date().toISOString() } }
          );
        }
        continue;
      }

      if (!matched) {
        console.log(`  -> Not found in ${cardsCount} search cards.`);
        stats.processed++;
        stats.notFound++;
        const record = {
          key: hotel.key,
          name: hotel.name,
          town: hotel.town,
          state: hotel.state,
          status: 'not_found',
          query: queryStr,
          cardsCount,
          processedAt: new Date().toISOString()
        };
        resultsMap[hotel.key] = record;
        fs.writeFileSync(resultsPath, JSON.stringify({ results: Object.values(resultsMap), stopBlockError }, null, 2));

        if (isWrite) {
          const checkEntry = {
            platform: 'booking.com',
            result: 'not_found',
            query: queryStr,
            checkedAt: new Date().toISOString()
          };
          const existingChecks = (hotel.platformChecks || []).filter(c => c.platform !== 'booking.com');
          existingChecks.push(checkEntry);
          await db.collection('hotel_candidates').updateOne(
            { _id: hotel._id },
            { $set: { platformChecks: existingChecks, updatedAt: new Date().toISOString() } }
          );
        }
        continue;
      }

      console.log(`  -> Search matched card: "${matched.title}" -> ${matched.cleanUrl}`);

      // Fetch Detail Page
      const hotelSlug = `hotel-links2-${hotel.key.replace(/\|/g, '-')}`;
      let hotelGzPath = null;
      let hotelMeta = null;
      try {
        const hotelSaveRes = await savePage(folderName, matched.cleanUrl, hotelSlug, { minDelayMs: 10500 });
        hotelGzPath = hotelSaveRes.gzPath;
        hotelMeta = hotelSaveRes.meta;
      } catch (err) {
        if (err instanceof BlockError || err.name === 'BlockError') {
          console.error(`\n🚨 CRITICAL BLOCK DETECTED during detail fetch: ${err.message}`);
          stopBlockError = {
            atKey: hotel.key,
            hotelName: hotel.name,
            url: matched.cleanUrl,
            error: err.message,
            atIndex: overallIdx,
            time: new Date().toISOString()
          };
          stats.blocks++;
          break;
        }
        console.warn(`\n[warning] Transient error fetching hotel ${hotel.key}: ${err.message}. Retrying once...`);
        await closeBrowser();
        await new Promise(r => setTimeout(r, 5000));
        try {
          const hotelSaveRes = await savePage(folderName, matched.cleanUrl, hotelSlug, { minDelayMs: 10500 });
          hotelGzPath = hotelSaveRes.gzPath;
          hotelMeta = hotelSaveRes.meta;
        } catch (retryErr) {
          if (retryErr instanceof BlockError || retryErr.name === 'BlockError') {
            console.error(`\n🚨 CRITICAL BLOCK DETECTED ON RETRY: ${retryErr.message}`);
            stopBlockError = {
              atKey: hotel.key,
              hotelName: hotel.name,
              url: matched.cleanUrl,
              error: retryErr.message,
              atIndex: overallIdx,
              time: new Date().toISOString()
            };
            stats.blocks++;
            break;
          }
          throw retryErr;
        }
      }

      // Parse Hotel Detail Page & Run Strict F1 Address Check
      const detailBuf = fs.readFileSync(hotelGzPath);
      const detailHtml = zlib.gunzipSync(detailBuf).toString('utf-8');
      const facts = parseBookingHtml(detailHtml, hotelMeta || {});

      const matchRes = matchHotelAddress(hotel, facts.address, facts.pageTitle);
      const candNum = extractStreetNumber(hotel.address?.street);
      const bkNum = extractStreetNumber(facts.address);

      if (!matchRes.pass) {
        console.log(`  -> F1 FAIL (wrong hotel): "${hotel.name}" (${hotel.address?.street}, ${hotel.town}) vs "${facts.pageTitle}" | "${facts.address}" [cand: ${candNum} vs bk: ${bkNum}] | Reason: ${matchRes.reason}`);
        stats.processed++;
        stats.wrongHotel++;
        const record = {
          key: hotel.key,
          name: hotel.name,
          town: hotel.town,
          state: hotel.state,
          status: 'wrong_hotel',
          query: queryStr,
          bookingPageTitle: facts.pageTitle,
          bookingAddress: facts.address,
          bookingUrl: matched.cleanUrl,
          reason: matchRes.reason,
          processedAt: new Date().toISOString()
        };
        resultsMap[hotel.key] = record;
        fs.writeFileSync(resultsPath, JSON.stringify({ results: Object.values(resultsMap), stopBlockError }, null, 2));

        if (isWrite) {
          const checkEntry = {
            platform: 'booking.com',
            result: 'wrong_hotel',
            query: queryStr,
            checkedAt: new Date().toISOString()
          };
          const existingChecks = (hotel.platformChecks || []).filter(c => c.platform !== 'booking.com');
          existingChecks.push(checkEntry);
          await db.collection('hotel_candidates').updateOne(
            { _id: hotel._id },
            {
              $set: {
                bookingLinks: [],
                roomNameStatus: 'pending',
                platformChecks: existingChecks,
                updatedAt: new Date().toISOString()
              },
              $unset: { bookingFacts: '' }
            }
          );
        }
        continue;
      }

      // F1 Match Passed!
      stats.processed++;
      stats.found++;
      const tubRooms = facts.tubRooms || []; // [{ roomName, labels }]
      const roomNameStatus = tubRooms.length > 0 ? 'confirmed_booking' : 'no_tub_on_booking';
      if (tubRooms.length > 0) stats.tubConfirmed++;
      else stats.noTub++;

      console.log(`  -> F1 PASS! "${facts.pageTitle}" [Address: ${facts.address} | cand: ${candNum} vs bk: ${bkNum}]`);
      console.log(`     Tub rooms: ${tubRooms.length} (${roomNameStatus}) | Photos: ${facts.photos.length}`);
      if (tubRooms.length > 0) {
        tubRooms.slice(0, 3).forEach(r => console.log(`      * "${r.roomName}" [labels: ${r.labels.join(', ')}]`));
      }

      const bookingLinkObj = {
        platform: 'booking.com',
        url: matched.cleanUrl,
        seenAt: todayDateStr
      };

      const bookingFactsObj = {
        pageTitle: facts.pageTitle,
        address: facts.address,
        score10: facts.score10,
        reviewCount: facts.reviewCount,
        tubRooms, // [{ roomName, labels }]
        tubRoomsCount: tubRooms.length,
        photos: facts.photos, // up to 6 cf.bstatic.com URLs
        fetchedAt: hotelMeta?.fetchedAt || new Date().toISOString(),
        matchWeak: matchRes.matchWeak || false,
        streetNum: matchRes.streetNum || null
      };

      const checkEntry = {
        platform: 'booking.com',
        result: 'found',
        query: queryStr,
        checkedAt: new Date().toISOString()
      };

      if (isWrite) {
        const existingChecks = (hotel.platformChecks || []).filter(c => c.platform !== 'booking.com');
        existingChecks.push(checkEntry);
        await db.collection('hotel_candidates').updateOne(
          { _id: hotel._id },
          {
            $set: {
              bookingLinks: [bookingLinkObj],
              bookingFacts: bookingFactsObj,
              roomNameStatus,
              platformChecks: existingChecks,
              updatedAt: new Date().toISOString()
            }
          }
        );
      }

      const record = {
        key: hotel.key,
        name: hotel.name,
        town: hotel.town,
        state: hotel.state,
        status: 'found',
        cleanUrl: matched.cleanUrl,
        pageTitle: facts.pageTitle,
        address: facts.address,
        tubRooms,
        tubRoomsCount: tubRooms.length,
        photosCount: facts.photos.length,
        roomNameStatus,
        processedAt: new Date().toISOString()
      };
      resultsMap[hotel.key] = record;
      fs.writeFileSync(resultsPath, JSON.stringify({ results: Object.values(resultsMap), stopBlockError }, null, 2));

      // Checkpoint every 1,000 processed candidates
      if (stats.processed > 0 && stats.processed % 1000 === 0) {
        console.log(`\n>>> CHECKPOINT at ${stats.processed} candidates. Appending to ${progressFilename}...`);
        const gapStats = getGapStats();
        appendProgressCheckpoint(progressFilePath, stats, gapStats, false);
        try {
          execSync(`git add data-collect/${progressFilename} && git commit -m "chore(data): links2 progress checkpoint (${stats.processed} processed)"`, {
            cwd: worktreeDir,
            stdio: 'inherit'
          });
        } catch (gitErr) {
          console.warn('Warning committing progress report:', gitErr.message);
        }
      }
    }
  } finally {
    await closeBrowser();
  }

  const finalGapStats = getGapStats();
  console.log('\n=============================================================');
  console.log('>>> LINKS2 RUN FINISHED');
  console.log(`>>> Processed:             ${stats.processed} / ${stats.total}`);
  console.log(`>>> Found & matched:       ${stats.found} (tub: ${stats.tubConfirmed}, no tub: ${stats.noTub})`);
  console.log(`>>> Not found:             ${stats.notFound}`);
  console.log(`>>> Search redirected:     ${stats.redirected}`);
  console.log(`>>> Wrong hotel (F1 fail):  ${stats.wrongHotel}`);
  console.log(`>>> Blocks:                ${stats.blocks}`);
  console.log(`>>> Smallest request gap:  ${finalGapStats.minGapMs != null ? (finalGapStats.minGapMs / 1000).toFixed(2) + 's' : 'N/A'}`);
  console.log(`>>> Gaps under 10 seconds: ${finalGapStats.under10s}`);
  if (stopBlockError) {
    console.log(`>>> 🚨 STOPPED ON BLOCK at ${stopBlockError.hotelName} (${stopBlockError.url}) at ${stopBlockError.time}`);
  }
  console.log('=============================================================');

  // Append final checkpoint report
  appendProgressCheckpoint(progressFilePath, stats, finalGapStats, true);
  try {
    execSync(`git add data-collect/${progressFilename} && git commit -m "chore(data): links2 final checkpoint (${stats.processed} processed)"`, {
      cwd: worktreeDir,
      stdio: 'inherit'
    });
  } catch (gitErr) {
    console.warn('Warning committing final progress report:', gitErr.message);
  }

  // Export not-found CSV
  console.log(`\nExporting data-collect/private/not-found-booking.csv...`);
  const remainingUnlinked = await db.collection('hotel_candidates')
    .find({
      status: 'hidden',
      $or: [
        { bookingLinks: { $exists: false } },
        { bookingLinks: { $size: 0 } }
      ]
    })
    .sort({ key: 1 })
    .toArray();

  const csvRows = remainingUnlinked.map(c => {
    const lastCheck = (c.platformChecks || []).filter(p => p.platform === 'booking.com').slice(-1)[0] || {};
    const addr = (c.address?.street || c.address?.formatted || '').replace(/"/g, '""');
    const q = (lastCheck.query || `${c.name}, ${c.town}, ${c.state}`).replace(/"/g, '""');
    const res = lastCheck.result || 'pending';
    const date = (lastCheck.checkedAt || '').slice(0, 10);
    return `"${c.name}","${c.town}","${c.state}","${addr}","${q}","${res}","${date}"`;
  });

  const csvHeader = 'name,town,state,address,last query,result,date\n';
  const csvPath = path.join(privateDir, 'not-found-booking.csv');
  fs.writeFileSync(csvPath, csvHeader + csvRows.join('\n') + '\n', 'utf8');
  console.log(`Wrote ${remainingUnlinked.length} unlinked candidates to ${csvPath}`);

  // Final sanity check on hotels collection
  const countHotelsFinal = await db.collection('hotels').countDocuments();
  console.log(`\nFinal DB Verification:`);
  console.log(`  hotels count: ${countHotelsFinal} (must be exactly 4758)`);
  if (countHotelsFinal !== 4758) {
    console.error(`🚨 ALERT: hotels count changed! Expected 4758, got ${countHotelsFinal}`);
  }

  await client.close();
}

main().catch(err => {
  console.error('Fatal error in main:', err);
  process.exit(1);
});
