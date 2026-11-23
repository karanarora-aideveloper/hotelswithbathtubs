#!/usr/bin/env node
/**
 * scripts/data/collect-booking-links2b.mjs
 *
 * LINKS2B: Booking.com Collection Restart under Strict After-Block Rules (CEO Sheet T13)
 *
 * Hard Limits Enforced in Code (Rule 6.2b):
 * 1. 72-Hour Cooldown: Refuses to start if current time is < 72 hours after block time (2026-10-30T01:48:35.306Z / 30 Oct 07:18:35 IST).
 * 2. 20s Minimum Gap: Enforces >= 20,000 ms between all requests to booking.com.
 * 3. Daily Cap: Tracks daily requests in `data-collect/private/links2b-daily.json` and stops at 400 hotels per IST date.
 * 4. Permanent Block Halt: On any block (403, 429, CAPTCHA, challenge), writes BLOCKED into counter file and halts permanently until manually cleared.
 *
 * Queue Order:
 * - Group 1: Hidden US candidates whose AGODA1 status is not_found or wrong_hotel and that have no Booking.com found result.
 * - Group 2: All other hidden US candidates without a Booking.com found result.
 * - Skips any candidate already in `links2-results.json` with status found.
 */

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { MongoClient, ObjectId } from 'mongodb';
import * as cheerio from 'cheerio';
import dotenv from 'dotenv';
import { savePage as realSavePage, closeBrowser, BlockError } from './saver.mjs';
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

// -------------------------------------------------------------
// HARD LIMITS CONFIGURATION (Rule 6.2b)
// -------------------------------------------------------------
// Exact block time from data-collect/links2-progress.md line 10: 2026-10-30T01:48:35.306Z
export const BLOCK_TIMESTAMP_ISO = '2026-10-30T01:48:35.306Z'; // 30 Oct 2026, 07:18:35 IST
export const COOLDOWN_HOURS = 72;
export const EARLIEST_ALLOWED_MS = new Date(BLOCK_TIMESTAMP_ISO).getTime() + (COOLDOWN_HOURS * 60 * 60 * 1000);
export const EARLIEST_ALLOWED_ISO = new Date(EARLIEST_ALLOWED_MS).toISOString();

export const MIN_REQUEST_GAP_MS = 20000; // >= 20.0s gap between ALL booking.com requests
export const DAILY_CAP = 400; // Maximum 400 hotels per IST date

export const defaultDailyCounterPath = path.join(privateDir, 'links2b-daily.json');
export const defaultResultsPath = path.join(privateDir, 'links2b-results.json');
export const defaultNotFoundPath = path.join(privateDir, 'not-found-booking-links2b.csv');
export const previousLinks2Path = path.join(privateDir, 'links2-results.json');
export const agoda1ResultsPath = path.join(privateDir, 'agoda1-results.json');

// Injectable dependencies for unit testing
let currentSavePage = realSavePage;
export function setSavePage(fn) {
  currentSavePage = fn;
}
export function getSavePage() {
  return currentSavePage;
}
export async function savePage(...args) {
  return currentSavePage(...args);
}

let nowFn = () => Date.now();
export function setNowFn(fn) {
  nowFn = fn;
}
export function getNow() {
  return nowFn();
}

let sleepFn = (ms) => new Promise(r => setTimeout(r, ms));
export function setSleepFn(fn) {
  sleepFn = fn;
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

// Helper: IST Date String (UTC + 5:30)
export function getIstDateStr(date = new Date(getNow())) {
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const istTime = new Date(date.getTime() + istOffsetMs);
  return istTime.toISOString().slice(0, 10);
}

// Hard Limit 1 Checker: 72-Hour After-Block Cooldown
export function checkCooldown() {
  const now = getNow();
  if (now < EARLIEST_ALLOWED_MS) {
    const remainingMs = EARLIEST_ALLOWED_MS - now;
    const remainingHours = (remainingMs / (1000 * 60 * 60)).toFixed(2);
    return {
      allowed: false,
      nowIso: new Date(now).toISOString(),
      blockTimeIso: BLOCK_TIMESTAMP_ISO,
      earliestAllowedIso: EARLIEST_ALLOWED_ISO,
      remainingHours,
      message: `REFUSING TO START: 72-hour after-block cooldown active until ${EARLIEST_ALLOWED_ISO} (${remainingHours} hours remaining).`
    };
  }
  return {
    allowed: true,
    nowIso: new Date(now).toISOString(),
    blockTimeIso: BLOCK_TIMESTAMP_ISO,
    earliestAllowedIso: EARLIEST_ALLOWED_ISO,
    remainingHours: 0
  };
}

// Hard Limit 3 & 4: Daily Counter & Block Management
export function readDailyCounter(filePath = defaultDailyCounterPath) {
  if (!fs.existsSync(filePath)) {
    const initial = {
      status: 'OK',
      blocked: null,
      dailyCounts: {}
    };
    fs.writeFileSync(filePath, JSON.stringify(initial, null, 2), 'utf8');
    return initial;
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return { status: 'OK', blocked: null, dailyCounts: {} };
  }
}

export function writeDailyCounter(data, filePath = defaultDailyCounterPath) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

// Hard Limit 2: Enforce >= 20.0s Gap Between ALL Requests
let lastRequestTime = 0;
export function setLastRequestTime(t) {
  lastRequestTime = t;
}
export function getLastRequestTime() {
  return lastRequestTime;
}

export async function waitEnforcedGap() {
  const now = getNow();
  if (lastRequestTime > 0) {
    const elapsed = now - lastRequestTime;
    if (elapsed < MIN_REQUEST_GAP_MS) {
      const waitTime = MIN_REQUEST_GAP_MS - elapsed;
      console.log(`   [rate-limit] Waiting ${(waitTime / 1000).toFixed(2)}s to respect hard ${MIN_REQUEST_GAP_MS / 1000}s gap...`);
      await sleepFn(waitTime);
    }
  }
}

export function markRequestMade(time = getNow()) {
  lastRequestTime = time;
}

// Clean hotel name for search
export function cleanHotelNameForSearch(name) {
  if (!name) return '';
  let cleaned = name;
  cleaned = cleaned.replace(/\s+(?:b&b|bed\s+and\s+breakfast|bed\s*&\s*breakfast|b\s*&\s*b)(?:\s+(?:inn|spa|and|&).*|$)/i, '');
  cleaned = cleaned.replace(/,\s*(?:an?\s+)?(?:ihg|hilton|wyndham|marriott|hyatt|radisson|choice|best western|doubletree).*$/i, '');
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

// Log lookup to not-found CSV (Rule 6.5)
export function logNotFoundRecord(record, filePath = defaultNotFoundPath) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, 'name,town,state,address,last query,result,date\n', 'utf8');
  }
  const name = `"${(record.name || '').replace(/"/g, '""')}"`;
  const town = `"${(record.town || '').replace(/"/g, '""')}"`;
  const state = `"${(record.state || '').replace(/"/g, '""')}"`;
  const address = `"${(record.address || record.street || '').replace(/"/g, '""')}"`;
  const lastQuery = `"${(record.query || '').replace(/"/g, '""')}"`;
  const result = `"${(record.status || '')}${record.reason ? ' (' + record.reason + ')' : ''}"`;
  const date = `"${(record.processedAt || new Date().toISOString()).slice(0, 10)}"`;
  fs.appendFileSync(filePath, `${name},${town},${state},${address},${lastQuery},${result},${date}\n`, 'utf8');
}

// Queue Builder Function: Step 2 & 3
export async function buildRestartQueue(db) {
  // 1. Load links2 found keys
  const links2FoundKeys = new Set();
  if (fs.existsSync(previousLinks2Path)) {
    try {
      const d = JSON.parse(fs.readFileSync(previousLinks2Path, 'utf8'));
      const list = Array.isArray(d) ? d : (d.results || []);
      for (const r of list) {
        if (r.status === 'found' && r.key) {
          links2FoundKeys.add(r.key);
        }
      }
    } catch (err) {
      console.warn('Warning loading previous links2 results:', err.message);
    }
  }

  // 2. Load AGODA1 misses (not_found or wrong_hotel) joined by hotelId
  const agoda1MissHotelIds = new Map();
  if (fs.existsSync(agoda1ResultsPath)) {
    try {
      const d = JSON.parse(fs.readFileSync(agoda1ResultsPath, 'utf8'));
      const list = Array.isArray(d) ? d : (d.results || []);
      for (const r of list) {
        if ((r.status === 'not_found' || r.status === 'wrong_hotel') && r.hotelId) {
          agoda1MissHotelIds.set(r.hotelId, r.status);
        }
      }
    } catch (err) {
      console.warn('Warning loading agoda1 results:', err.message);
    }
  }

  // 3. Query all hidden candidates in MongoDB
  const allHidden = await db.collection('hotel_candidates')
    .find({ status: 'hidden' })
    .sort({ key: 1 })
    .toArray();

  const group1_agodaMisses = [];
  const group2_otherHidden = [];

  for (const cand of allHidden) {
    const candId = cand._id.toString();
    const candKey = cand.key;

    // Skip every hotel already in links2-results.json with status found
    if (links2FoundKeys.has(candKey)) {
      continue;
    }
    // Skip if hotel has bookingUrl or bookingLinks
    if (cand.bookingUrl || (cand.bookingLinks && cand.bookingLinks.length > 0)) {
      continue;
    }

    if (agoda1MissHotelIds.has(candId)) {
      group1_agodaMisses.push({
        ...cand,
        queueTier: 'Group 1 (AGODA1 Misses)',
        agodaStatus: agoda1MissHotelIds.get(candId)
      });
    } else {
      group2_otherHidden.push({
        ...cand,
        queueTier: 'Group 2 (Other Hidden Candidates)'
      });
    }
  }

  return {
    group1: group1_agodaMisses,
    group2: group2_otherHidden,
    totalQueue: [...group1_agodaMisses, ...group2_otherHidden]
  };
}

// Main Collection Loop Runner (Step 1)
export async function runCollector(options = {}) {
  const {
    db = null,
    candidates = null,
    dailyCounterPath = defaultDailyCounterPath,
    resultsFilePath = defaultResultsPath,
    notFoundFilePath = defaultNotFoundPath,
    isDryRun = false,
    isWrite = false,
    limit = null,
    folderName = 'booking-links2'
  } = options;

  // Hard Limit 4: Check if permanent block halt is active
  const dailyData = readDailyCounter(dailyCounterPath);
  if (dailyData.blocked) {
    const blockMsg = `🚨 FATAL: Permanent block halt is active in ${dailyCounterPath}:\n   ${dailyData.blocked}\n   Refusing to run. A person must verify booking.com access and manually clear the 'blocked' field before this collector can ever run.`;
    console.error(blockMsg);
    if (!isDryRun) {
      const err = new Error(blockMsg);
      err.isBlockHalt = true;
      throw err;
    }
  }

  // Hard Limit 1: 72-Hour After-Block Cooldown Check
  const cooldown = checkCooldown();
  console.log('\n--- 1. AFTER-BLOCK COOLDOWN CHECK (72 HOURS) ---');
  console.log(`Block Time:                 ${cooldown.blockTimeIso} (30 Oct 2026, 07:18:35 IST)`);
  console.log(`Earliest Allowed Start:     ${cooldown.earliestAllowedIso} (02 Nov 2026, 07:18:35 IST)`);
  console.log(`Current Evaluation Time:    ${cooldown.nowIso}`);
  console.log(`Cooldown Remaining:         ${cooldown.remainingHours} hours`);
  console.log(`Cooldown Status:            ${cooldown.allowed ? 'EXPIRED (RUN ALLOWED)' : 'ACTIVE (RUN BLOCKED)'}`);

  if (!isDryRun && !cooldown.allowed) {
    console.error(`\n🚨 ${cooldown.message}`);
    console.error(`   Hard Limit 1 enforced. 0 requests made to booking.com.`);
    const err = new Error(cooldown.message);
    err.isCooldownActive = true;
    throw err;
  }

  // Hard Limit 3: Daily Cap Check
  const todayIst = getIstDateStr();
  const todayProcessed = dailyData.dailyCounts[todayIst] || 0;
  console.log('\n--- 2. DAILY RATE LIMIT CHECK (400 / IST DAY) ---');
  console.log(`Today's IST Date:           ${todayIst}`);
  console.log(`Processed Today:            ${todayProcessed} / ${DAILY_CAP}`);

  if (!isDryRun && todayProcessed >= DAILY_CAP) {
    console.error(`\n🚨 STOP: Daily limit of ${DAILY_CAP} hotels reached for IST date ${todayIst}.`);
    console.error(`   Hard Limit 3 enforced. Halting until next IST date.`);
    return { stoppedDailyCap: true, processedCount: 0 };
  }

  // Prepare Candidate Queue
  let queue = candidates;
  if (!queue && db) {
    const queueData = await buildRestartQueue(db);
    console.log('\n--- 4. CANDIDATE QUEUE ORDER & PARTITIONING ---');
    console.log(`Group 1 (AGODA1 misses, no Booking.com check): ${queueData.group1.length}`);
    console.log(`Group 2 (Other hidden cands, no Booking check): ${queueData.group2.length}`);
    console.log(`Total Queued Candidates:                       ${queueData.totalQueue.length}`);
    queue = queueData.totalQueue;
  }

  if (!queue) {
    throw new Error('No candidate queue provided or DB connection available.');
  }

  if (limit && limit > 0) {
    queue = queue.slice(0, limit);
  }

  // Handle Dry-Run Mode
  if (isDryRun) {
    console.log('\n--- 5. FIRST 10 QUEUED HOTELS (--dry-run) ---');
    const preview = queue.slice(0, 10);
    preview.forEach((h, idx) => {
      console.log(`\n[${idx + 1}/${preview.length}] [${h.queueTier || 'Queued'}] "${h.name}"`);
      console.log(`   - Location: ${h.town}, ${h.state}`);
      console.log(`   - Key:      ${h.key}`);
      console.log(`   - Query:    "${cleanHotelNameForSearch(h.name)} ${h.town}"`);
    });

    console.log('\n-------------------------------------------------------------');
    console.log('>>> DRY RUN COMPLETE: Confirmed 0 requests made, 0 DB writes.');
    console.log('-------------------------------------------------------------');
    return { isDryRun: true, queueCount: queue.length };
  }

  // -------------------------------------------------------------
  // Live Collection Loop (Copied from collect-booking-links2.mjs)
  // -------------------------------------------------------------
  console.log('\n--- 6. EXECUTING COLLECTION LOOP ---');
  const d = new Date(getNow());
  d.setDate(d.getDate() + 30);
  const checkin = d.toISOString().slice(0, 10);
  d.setDate(d.getDate() + 1);
  const checkout = d.toISOString().slice(0, 10);

  const stats = {
    processed: 0,
    found: 0,
    tubConfirmed: 0,
    noTub: 0,
    notFound: 0,
    redirected: 0,
    wrongHotel: 0,
    blocks: 0
  };

  const resultsMap = {};
  if (fs.existsSync(resultsFilePath)) {
    try {
      const saved = JSON.parse(fs.readFileSync(resultsFilePath, 'utf8'));
      const list = Array.isArray(saved) ? saved : (saved.results || []);
      for (const r of list) resultsMap[r.key] = r;
    } catch {}
  }

  for (let idx = 0; idx < queue.length; idx++) {
    const hotel = queue[idx];

    // Hard Limit 3: Stop when today's count reaches 400
    const currentTodayCount = dailyData.dailyCounts[todayIst] || 0;
    if (currentTodayCount >= DAILY_CAP) {
      console.log(`\n🚨 STOPPING: Daily limit of ${DAILY_CAP} hotels reached for IST date ${todayIst}.`);
      break;
    }

    console.log(`\n[${idx + 1}/${queue.length}] Hotel: "${hotel.name}" (${hotel.town}, ${hotel.state}) key: ${hotel.key}`);

    const cleanName = cleanHotelNameForSearch(hotel.name);
    const queryStr = `${cleanName} ${hotel.town}`;
    const searchUrl = `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(queryStr)}&checkin=${checkin}&checkout=${checkout}`;
    const searchSlug = `search-links2b-${(hotel.key || hotel.name).replace(/[^a-zA-Z0-9]+/g, '-')}`;

    let searchGzPath = null;
    let searchMeta = null;

    try {
      // Hard Limit 2: waitEnforcedGap before request and markRequestMade after
      await waitEnforcedGap();
      const saveRes = await savePage(folderName, searchUrl, searchSlug, { minDelayMs: MIN_REQUEST_GAP_MS });
      markRequestMade();
      searchGzPath = saveRes.gzPath;
      searchMeta = saveRes.meta;
    } catch (err) {
      // Hard Limit 4: Block detection
      if (err instanceof BlockError || err.name === 'BlockError' || err.status === 403 || err.status === 429) {
        console.error(`\n🚨 CRITICAL BLOCK DETECTED: ${err.message}`);
        dailyData.status = 'BLOCKED';
        dailyData.blocked = `BLOCKED at ${new Date(getNow()).toISOString()} on ${searchUrl} (Key: ${hotel.key}): ${err.message}`;
        writeDailyCounter(dailyData, dailyCounterPath);
        stats.blocks++;
        throw err;
      }
      throw err;
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
        address: hotel.address?.street || '',
        status: 'search_redirected',
        query: queryStr,
        cardsCount: 0,
        processedAt: new Date(getNow()).toISOString()
      };
      resultsMap[hotel.key] = record;
      fs.writeFileSync(resultsFilePath, JSON.stringify({ results: Object.values(resultsMap) }, null, 2), 'utf8');
      logNotFoundRecord(record, notFoundFilePath);

      // Increment daily counter (Hard Limit 3)
      dailyData.dailyCounts[todayIst] = (dailyData.dailyCounts[todayIst] || 0) + 1;
      writeDailyCounter(dailyData, dailyCounterPath);
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
        address: hotel.address?.street || '',
        status: 'not_found',
        query: queryStr,
        cardsCount,
        processedAt: new Date(getNow()).toISOString()
      };
      resultsMap[hotel.key] = record;
      fs.writeFileSync(resultsFilePath, JSON.stringify({ results: Object.values(resultsMap) }, null, 2), 'utf8');
      logNotFoundRecord(record, notFoundFilePath);

      // Increment daily counter (Hard Limit 3)
      dailyData.dailyCounts[todayIst] = (dailyData.dailyCounts[todayIst] || 0) + 1;
      writeDailyCounter(dailyData, dailyCounterPath);
      continue;
    }

    console.log(`  -> Search matched card: "${matched.title}" -> ${matched.cleanUrl}`);

    // Fetch Detail Page
    const hotelSlug = `hotel-links2b-${(hotel.key || hotel.name).replace(/[^a-zA-Z0-9]+/g, '-')}`;
    let hotelGzPath = null;
    let hotelMeta = null;

    try {
      // Hard Limit 2: waitEnforcedGap before request and markRequestMade after
      await waitEnforcedGap();
      const hotelSaveRes = await savePage(folderName, matched.cleanUrl, hotelSlug, { minDelayMs: MIN_REQUEST_GAP_MS });
      markRequestMade();
      hotelGzPath = hotelSaveRes.gzPath;
      hotelMeta = hotelSaveRes.meta;
    } catch (err) {
      // Hard Limit 4: Block detection
      if (err instanceof BlockError || err.name === 'BlockError' || err.status === 403 || err.status === 429) {
        console.error(`\n🚨 CRITICAL BLOCK DETECTED during detail fetch: ${err.message}`);
        dailyData.status = 'BLOCKED';
        dailyData.blocked = `BLOCKED at ${new Date(getNow()).toISOString()} on ${matched.cleanUrl} (Key: ${hotel.key}): ${err.message}`;
        writeDailyCounter(dailyData, dailyCounterPath);
        stats.blocks++;
        throw err;
      }
      throw err;
    }

    // Parse Detail Page & Run Strict F1 Address Check
    const detailBuf = fs.readFileSync(hotelGzPath);
    const detailHtml = zlib.gunzipSync(detailBuf).toString('utf-8');
    const facts = parseBookingHtml(detailHtml, hotelMeta || {});

    const matchRes = matchHotelAddress(hotel, facts.address, facts.pageTitle);
    const candNum = extractStreetNumber(hotel.address?.street);
    const bkNum = extractStreetNumber(facts.address);

    if (!matchRes.pass) {
      console.log(`  -> F1 FAIL (wrong hotel): "${hotel.name}" vs "${facts.pageTitle}" | Reason: ${matchRes.reason}`);
      stats.processed++;
      stats.wrongHotel++;
      const record = {
        key: hotel.key,
        name: hotel.name,
        town: hotel.town,
        state: hotel.state,
        address: hotel.address?.street || '',
        status: 'wrong_hotel',
        query: queryStr,
        bookingPageTitle: facts.pageTitle,
        bookingAddress: facts.address,
        bookingUrl: matched.cleanUrl,
        reason: matchRes.reason,
        processedAt: new Date(getNow()).toISOString()
      };
      resultsMap[hotel.key] = record;
      fs.writeFileSync(resultsFilePath, JSON.stringify({ results: Object.values(resultsMap) }, null, 2), 'utf8');
      logNotFoundRecord(record, notFoundFilePath);

      // Increment daily counter (Hard Limit 3)
      dailyData.dailyCounts[todayIst] = (dailyData.dailyCounts[todayIst] || 0) + 1;
      writeDailyCounter(dailyData, dailyCounterPath);
      continue;
    }

    // F1 Match Passed!
    stats.processed++;
    stats.found++;
    const tubRooms = facts.tubRooms || [];
    const roomNameStatus = tubRooms.length > 0 ? 'confirmed_booking' : 'no_tub_on_booking';
    if (tubRooms.length > 0) stats.tubConfirmed++;
    else stats.noTub++;

    console.log(`  -> F1 PASS! "${facts.pageTitle}" [Tub rooms: ${tubRooms.length}]`);

    const record = {
      key: hotel.key,
      name: hotel.name,
      town: hotel.town,
      state: hotel.state,
      address: hotel.address?.street || '',
      status: 'found',
      bookingUrl: matched.cleanUrl,
      tubRoomsCount: tubRooms.length,
      tubRooms,
      photosCount: (facts.photos || []).length,
      roomNameStatus,
      processedAt: new Date(getNow()).toISOString()
    };
    resultsMap[hotel.key] = record;
    fs.writeFileSync(resultsFilePath, JSON.stringify({ results: Object.values(resultsMap) }, null, 2), 'utf8');

    // Increment daily counter (Hard Limit 3)
    dailyData.dailyCounts[todayIst] = (dailyData.dailyCounts[todayIst] || 0) + 1;
    writeDailyCounter(dailyData, dailyCounterPath);
  }

  return { stats, dailyData };
}

async function main() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');

  console.log('=============================================================');
  console.log('>>> LINKS2B: Booking.com Collection Restart under Hard Limits');
  console.log(`Mode: ${isDryRun ? 'DRY-RUN (0 web requests, 0 DB writes)' : 'LIVE EXECUTION'}`);
  console.log('=============================================================');

  const uri = getMongoUri();
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();

  const hotelsCount = await db.collection('hotels').countDocuments();
  console.log(`\n--- 3. DATABASE INTEGRITY ---`);
  console.log(`Live 'hotels' count:        ${hotelsCount} (MUST be 5,287)`);

  try {
    await runCollector({
      db,
      isDryRun,
      isWrite: false
    });
  } catch (err) {
    if (err.isCooldownActive || err.isBlockHalt) {
      process.exit(1);
    }
    console.error('Collector execution error:', err);
    process.exit(1);
  } finally {
    await client.close();
  }
}

// Execute when called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(err => {
    console.error('Fatal error in collect-booking-links2b.mjs:', err);
    process.exit(1);
  });
}
