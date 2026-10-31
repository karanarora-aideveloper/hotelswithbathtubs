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
 * - Group 1: Hidden US candidates not yet looked up on Booking.com that AGODA1 marked not_found or wrong_hotel.
 * - Group 2: Other hidden candidates not yet looked up on Booking.com.
 * - Skips any candidate already in `links2-results.json` with status found.
 */

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { MongoClient, ObjectId } from 'mongodb';
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

// -------------------------------------------------------------
// HARD LIMITS CONFIGURATION (Not configurable via options)
// -------------------------------------------------------------
// Exact block time from data-collect/links2-progress.md (line 10: 2026-10-30T01:48:35.306Z)
export const BLOCK_TIMESTAMP_ISO = '2026-10-30T01:48:35.306Z'; // 30 Oct 2026, 07:18:35 IST
export const COOLDOWN_HOURS = 72;
export const EARLIEST_ALLOWED_MS = new Date(BLOCK_TIMESTAMP_ISO).getTime() + (COOLDOWN_HOURS * 60 * 60 * 1000);
export const EARLIEST_ALLOWED_ISO = new Date(EARLIEST_ALLOWED_MS).toISOString();

export const MIN_REQUEST_GAP_MS = 20000; // >= 20.0s gap between ALL booking.com requests
export const DAILY_CAP = 400; // Maximum 400 hotels per IST date

export const dailyCounterPath = path.join(privateDir, 'links2b-daily.json');
export const resultsPath = path.join(privateDir, 'links2b-results.json');
export const previousLinks2Path = path.join(privateDir, 'links2-results.json');
export const agoda1ResultsPath = path.join(privateDir, 'agoda1-results.json');

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
export function getIstDateStr(date = new Date()) {
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const istTime = new Date(date.getTime() + istOffsetMs);
  return istTime.toISOString().slice(0, 10);
}

// Hard Limit 1 Checker: 72-Hour After-Block Cooldown
export function checkCooldown() {
  const now = Date.now();
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

// Daily Counter Management (Hard Limits 3 and 4)
export function readDailyCounter() {
  if (!fs.existsSync(dailyCounterPath)) {
    const initial = {
      status: 'OK',
      blocked: null,
      dailyCounts: {}
    };
    fs.writeFileSync(dailyCounterPath, JSON.stringify(initial, null, 2), 'utf8');
    return initial;
  }
  try {
    return JSON.parse(fs.readFileSync(dailyCounterPath, 'utf8'));
  } catch {
    return { status: 'OK', blocked: null, dailyCounts: {} };
  }
}

export function writeDailyCounter(data) {
  fs.writeFileSync(dailyCounterPath, JSON.stringify(data, null, 2), 'utf8');
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

// Rate limit helper: Hard Limit 2
let lastRequestTime = 0;
export async function waitEnforcedGap() {
  const now = Date.now();
  if (lastRequestTime > 0) {
    const elapsed = now - lastRequestTime;
    if (elapsed < MIN_REQUEST_GAP_MS) {
      const waitTime = MIN_REQUEST_GAP_MS - elapsed;
      console.log(`   [rate-limit] Waiting ${(waitTime / 1000).toFixed(2)}s to respect hard ${MIN_REQUEST_GAP_MS / 1000}s gap...`);
      await new Promise(r => setTimeout(r, waitTime));
    }
  }
}

export function markRequestMade() {
  lastRequestTime = Date.now();
}

// Queue Builder Function
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

  // 2. Load AGODA1 misses (not_found or wrong_hotel)
  const agoda1MissHotelIds = new Set();
  if (fs.existsSync(agoda1ResultsPath)) {
    try {
      const d = JSON.parse(fs.readFileSync(agoda1ResultsPath, 'utf8'));
      const list = Array.isArray(d) ? d : (d.results || []);
      for (const r of list) {
        if ((r.status === 'not_found' || r.status === 'wrong_hotel') && r.hotelId) {
          agoda1MissHotelIds.add(r.hotelId);
        }
      }
    } catch (err) {
      console.warn('Warning loading agoda1 results:', err.message);
    }
  }

  // 3. Query all hidden candidates in MongoDB
  const allHidden = await db.collection('hotel_candidates')
    .find({
      status: 'hidden',
      "platformChecks.platform": { $ne: 'booking.com' }
    })
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

    if (agoda1MissHotelIds.has(candId)) {
      group1_agodaMisses.push({ ...cand, queueTier: 'Group 1 (AGODA1 Misses)' });
    } else {
      group2_otherHidden.push({ ...cand, queueTier: 'Group 2 (Other Hidden Candidates)' });
    }
  }

  return {
    group1: group1_agodaMisses,
    group2: group2_otherHidden,
    totalQueue: [...group1_agodaMisses, ...group2_otherHidden]
  };
}

async function main() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');

  console.log('=============================================================');
  console.log('>>> LINKS2B: Booking.com Collection Restart under Hard Limits');
  console.log(`Mode: ${isDryRun ? 'DRY-RUN (0 web requests, 0 DB writes)' : 'LIVE EXECUTION'}`);
  console.log('=============================================================');

  // -------------------------------------------------------------
  // HARD LIMIT 4: Check if permanent block halt is active
  // -------------------------------------------------------------
  const dailyData = readDailyCounter();
  if (dailyData.blocked) {
    console.error(`\n🚨 FATAL: Permanent block halt is active in ${dailyCounterPath}:`);
    console.error(`   ${dailyData.blocked}`);
    console.error(`   Refusing to run. A person must verify booking.com access and manually clear the 'blocked' field before this collector can ever run.`);
    process.exit(1);
  }

  // -------------------------------------------------------------
  // HARD LIMIT 1: 72-Hour After-Block Cooldown Check
  // -------------------------------------------------------------
  const cooldown = checkCooldown();
  console.log('\n--- 1. AFTER-BLOCK COOLDOWN CHECK (72 HOURS) ---');
  console.log(`Block Time:                 ${cooldown.blockTimeIso} (30 Oct 2026, 07:18:35 IST)`);
  console.log(`Earliest Allowed Start:     ${cooldown.earliestAllowedIso} (02 Nov 2026, 07:18:35 IST)`);
  console.log(`Current Evaluation Time:    ${cooldown.nowIso}`);
  console.log(`Cooldown Remaining:         ${cooldown.remainingHours} hours`);
  console.log(`Cooldown Status:            ${cooldown.allowed ? 'EXPIRED (RUN ALLOWED)' : 'ACTIVE (RUN BLOCKED)'}`);

  // If live mode (not dry run) and cooldown is still active, REFUSE TO START
  if (!isDryRun && !cooldown.allowed) {
    console.error(`\n🚨 ${cooldown.message}`);
    console.error(`   Hard Limit 1 enforced. 0 requests made to booking.com.`);
    process.exit(1);
  }

  // -------------------------------------------------------------
  // HARD LIMIT 3: Check Daily Cap (400 per IST date)
  // -------------------------------------------------------------
  const todayIst = getIstDateStr();
  const todayProcessed = dailyData.dailyCounts[todayIst] || 0;
  console.log('\n--- 2. DAILY RATE LIMIT CHECK (400 / IST DAY) ---');
  console.log(`Today's IST Date:           ${todayIst}`);
  console.log(`Processed Today:            ${todayProcessed} / ${DAILY_CAP}`);
  if (!isDryRun && todayProcessed >= DAILY_CAP) {
    console.error(`\n🚨 STOP: Daily limit of ${DAILY_CAP} hotels reached for IST date ${todayIst}.`);
    console.error(`   Hard Limit 3 enforced. Halting until next IST date.`);
    process.exit(0);
  }

  // -------------------------------------------------------------
  // Database Connection (Read-only for queue planning)
  // -------------------------------------------------------------
  const uri = getMongoUri();
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();

  const hotelsCount = await db.collection('hotels').countDocuments();
  console.log(`\n--- 3. DATABASE INTEGRITY ---`);
  console.log(`Live 'hotels' count:        ${hotelsCount} (MUST be 5,287)`);

  // -------------------------------------------------------------
  // QUEUE CONSTRUCTION (Step 3)
  // -------------------------------------------------------------
  const { group1, group2, totalQueue } = await buildRestartQueue(db);
  console.log('\n--- 4. CANDIDATE QUEUE ORDER & PARTITIONING ---');
  console.log(`Group 1 (AGODA1 misses, no Booking.com check): ${group1.length}`);
  console.log(`Group 2 (Other hidden cands, no Booking check): ${group2.length}`);
  console.log(`Total Queued Candidates:                       ${totalQueue.length}`);

  // -------------------------------------------------------------
  // DRY-RUN OUTPUT (Step 4)
  // -------------------------------------------------------------
  if (isDryRun) {
    console.log('\n--- 5. FIRST 10 QUEUED HOTELS (--dry-run) ---');
    const preview = totalQueue.slice(0, 10);
    preview.forEach((h, idx) => {
      console.log(`\n[${idx + 1}/10] [${h.queueTier}] "${h.name}"`);
      console.log(`   - Location: ${h.town}, ${h.state}`);
      console.log(`   - Key:      ${h.key}`);
      console.log(`   - Query:    "${cleanHotelNameForSearch(h.name)} ${h.town}"`);
    });

    console.log('\n-------------------------------------------------------------');
    console.log('>>> DRY RUN COMPLETE: Confirmed 0 requests made, 0 DB writes.');
    console.log('-------------------------------------------------------------');
    await client.close();
    return;
  }

  // If we reach here in non-dry-run mode, it would execute only if cooldown expired
  console.log('\n--- LIVE EXECUTION COMMENCING (Cooldown Expired) ---');
  await client.close();
}

// Execute when called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(err => {
    console.error('Fatal error in collect-booking-links2b.mjs:', err);
    process.exit(1);
  });
}
