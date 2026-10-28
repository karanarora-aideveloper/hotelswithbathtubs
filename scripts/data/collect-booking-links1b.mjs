// scripts/data/collect-booking-links1b.mjs
// Retries not-found and wrong-hotel candidates on Booking.com using Method A (dates + cleaned query).
// Obey robots.txt, 10s wait, stop on first block, strict F1 address check, strict F2 tub reading.
// Writes only to hotel_candidates when --write is passed.

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { MongoClient } from 'mongodb';
import * as cheerio from 'cheerio';
import dotenv from 'dotenv';
import { savePage, closeBrowser, BlockError } from './saver.mjs';
import { parseBookingHtml, parseSavedBookingFile } from './parse-booking.mjs';
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

export function cleanHotelNameForSearch(name) {
  if (!name) return '';
  let cleaned = name;
  // Remove decorative B&B / bed and breakfast suffixes
  cleaned = cleaned.replace(/\s+(?:b&b|bed\s+and\s+breakfast|bed\s*&\s*breakfast|b\s*&\s*b)(?:\s+(?:inn|spa|and|&).*|$)/i, '');
  // Clean up trailing punctuation
  cleaned = cleaned.replace(/[,\-\.\/]+$/, '').trim();
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
    // Only allow town mismatch if name was completely exact and overlap was 1.0
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

async function main() {
  const args = process.argv.slice(2);
  const isWrite = args.includes('--write');
  const limitArg = args.find(a => a.startsWith('--limit='));
  const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : null;
  const startArg = args.find(a => a.startsWith('--start='));
  const startIdx = startArg ? parseInt(startArg.split('=')[1], 10) : 0;

  console.log('=============================================================');
  console.log('>>> RUNNING LINKS1B: Retry Not-Found / Wrong Hotels on Booking');
  console.log(`>>> Mode: ${isWrite ? 'WRITE TO DATABASE' : 'DRY RUN (no DB writes)'}`);
  if (limit) console.log(`>>> Limit: ${limit} hotels`);
  if (startIdx > 0) console.log(`>>> Starting at index: ${startIdx}`);
  console.log('=============================================================');

  const uri = getMongoUri();
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();

  // 1. Sanity check hotels count
  const hotelsCount = await db.collection('hotels').countDocuments();
  console.log(`Verified current hotels collection count: ${hotelsCount} (must be 4470)`);
  if (hotelsCount !== 4470) {
    console.error(`FATAL: Expected 4470 hotels in 'hotels', found ${hotelsCount}`);
    await client.close();
    process.exit(1);
  }

  // 2. Load candidates needing retry:
  // Candidates in city pages (citySlug != null) where bookingLinks is empty or absent
  let retryCandidates = await db.collection('hotel_candidates')
    .find({
      citySlug: { $ne: null },
      $or: [
        { bookingLinks: { $exists: false } },
        { bookingLinks: { $size: 0 } }
      ]
    })
    .sort({ key: 1 })
    .toArray();

  console.log(`Found ${retryCandidates.length} candidate hotels needing retry.`);

  const reverseArg = args.includes('--reverse');
  if (reverseArg) {
    retryCandidates.reverse();
    console.log(`>>> Running in REVERSE order from end of list`);
  }

  if (startIdx > 0 || limit) {
    retryCandidates = retryCandidates.slice(startIdx, limit ? startIdx + limit : undefined);
    console.log(`Processing slice of ${retryCandidates.length} candidate hotels.`);
  }

  // Load results tracking file
  const resultsPath = path.join(privateDir, 'links1b-retry-results.json');
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

  const results = [];
  let foundCount = 0;
  let notFoundCount = 0;
  let redirectedCount = 0;
  let wrongHotelCount = 0;
  let tubRoomCount = 0;
  let noTubCount = 0;
  let stopBlockError = null;

  // Compute checkin and checkout 30 days ahead
  const d = new Date();
  d.setDate(d.getDate() + 30);
  const checkin = d.toISOString().slice(0, 10);
  d.setDate(d.getDate() + 1);
  const checkout = d.toISOString().slice(0, 10);
  console.log(`Method A dates: checkin=${checkin}, checkout=${checkout}`);

  try {
    for (let i = 0; i < retryCandidates.length; i++) {
      const hotel = retryCandidates[i];
      console.log(`\n[${i + 1}/${retryCandidates.length}] Hotel: "${hotel.name}" (${hotel.town}, ${hotel.state}) [${hotel.citySlug}] key: ${hotel.key}`);

      // Check in MongoDB directly if already linked by another worker
      const liveCand = await db.collection('hotel_candidates').findOne({ _id: hotel._id });
      if (liveCand && liveCand.bookingLinks && liveCand.bookingLinks.length > 0) {
        console.log(`  -> Already linked in DB with ${liveCand.bookingLinks[0].url}, skipping.`);
        continue;
      }

      if (resultsMap[hotel.key] && resultsMap[hotel.key].status !== 'stop_block') {
        const cached = resultsMap[hotel.key];
        console.log(`  -> Already processed in saved retry results with status: ${cached.status}`);
        results.push(cached);
        if (cached.status === 'found') {
          foundCount++;
          if (cached.tubRoomsCount > 0) tubRoomCount++;
          else noTubCount++;
        } else if (cached.status === 'not_found') {
          notFoundCount++;
        } else if (cached.status === 'search_redirected') {
          redirectedCount++;
        } else if (cached.status === 'wrong_hotel') {
          wrongHotelCount++;
        }
        continue;
      }

      // Method A: cleaned name + town only (no state, no B&B suffix), with checkin/checkout dates
      const cleanName = cleanHotelNameForSearch(hotel.name);
      const queryStr = `${cleanName} ${hotel.town}`;
      const searchUrl = `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(queryStr)}&checkin=${checkin}&checkout=${checkout}`;
      const searchSlug = `search-retry-${hotel.key.replace(/\|/g, '-')}`;

      let searchGzPath = null;
      let searchMeta = null;
      try {
        const saveRes = await savePage('booking-links1', searchUrl, searchSlug, { minDelayMs: 10000 });
        searchGzPath = saveRes.gzPath;
        searchMeta = saveRes.meta;
      } catch (err) {
        if (err instanceof BlockError || err.name === 'BlockError') {
          console.error(`\n🚨 CRITICAL: BlockError during search for ${hotel.key}: ${err.message}`);
          stopBlockError = {
            atKey: hotel.key,
            hotelName: hotel.name,
            url: searchUrl,
            error: err.message,
            atIndex: i + 1
          };
          break;
        }
        console.warn(`\n[warning] Transient error searching ${hotel.key}: ${err.message}. Retrying once...`);
        await closeBrowser();
        await new Promise(r => setTimeout(r, 5000));
        try {
          const saveRes = await savePage('booking-links1', searchUrl, searchSlug, { minDelayMs: 10000 });
          searchGzPath = saveRes.gzPath;
          searchMeta = saveRes.meta;
        } catch (retryErr) {
          if (retryErr instanceof BlockError || retryErr.name === 'BlockError') {
            console.error(`\n🚨 CRITICAL: BlockError during search retry for ${hotel.key}: ${retryErr.message}`);
            stopBlockError = {
              atKey: hotel.key,
              hotelName: hotel.name,
              url: searchUrl,
              error: retryErr.message,
              atIndex: i + 1
            };
            break;
          }
          throw retryErr;
        }
      }

      // Parse search results
      const searchBuf = fs.readFileSync(searchGzPath);
      const searchHtml = zlib.gunzipSync(searchBuf).toString('utf-8');
      const { cardsCount, matched } = parseBookingSearchResults(searchHtml, hotel);

      // Check if redirected to homepage or empty cards
      const isRedirect = cardsCount === 0 || (searchMeta && searchMeta.finalUrl && !searchMeta.finalUrl.includes('searchresults'));
      if (isRedirect) {
        console.log(`  -> Search redirected to homepage / 0 cards.`);
        redirectedCount++;
        const record = {
          key: hotel.key,
          name: hotel.name,
          town: hotel.town,
          state: hotel.state,
          citySlug: hotel.citySlug,
          status: 'search_redirected',
          query: queryStr,
          cardsCount: 0,
          processedAt: new Date().toISOString()
        };
        results.push(record);
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
        notFoundCount++;
        const record = {
          key: hotel.key,
          name: hotel.name,
          town: hotel.town,
          state: hotel.state,
          citySlug: hotel.citySlug,
          status: 'not_found',
          query: queryStr,
          cardsCount,
          processedAt: new Date().toISOString()
        };
        results.push(record);
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

      // Step 3: Fetch detail page to verify F1 address and F2 tub
      const hotelSlug = `hotel-retry-${hotel.key.replace(/\|/g, '-')}`;
      let hotelGzPath = null;
      let hotelMeta = null;
      try {
        const hotelSaveRes = await savePage('booking-links1', matched.cleanUrl, hotelSlug, { minDelayMs: 10000 });
        hotelGzPath = hotelSaveRes.gzPath;
        hotelMeta = hotelSaveRes.meta;
      } catch (err) {
        if (err instanceof BlockError || err.name === 'BlockError') {
          console.error(`\n🚨 CRITICAL: BlockError during hotel detail fetch for ${hotel.key}: ${err.message}`);
          stopBlockError = {
            atKey: hotel.key,
            hotelName: hotel.name,
            url: matched.cleanUrl,
            error: err.message,
            atIndex: i + 1
          };
          break;
        }
        console.warn(`\n[warning] Transient error fetching hotel ${hotel.key}: ${err.message}. Retrying once...`);
        await closeBrowser();
        await new Promise(r => setTimeout(r, 5000));
        try {
          const hotelSaveRes = await savePage('booking-links1', matched.cleanUrl, hotelSlug, { minDelayMs: 10000 });
          hotelGzPath = hotelSaveRes.gzPath;
          hotelMeta = hotelSaveRes.meta;
        } catch (retryErr) {
          if (retryErr instanceof BlockError || retryErr.name === 'BlockError') {
            console.error(`\n🚨 CRITICAL: BlockError during hotel detail retry for ${hotel.key}: ${retryErr.message}`);
            stopBlockError = {
              atKey: hotel.key,
              hotelName: hotel.name,
              url: matched.cleanUrl,
              error: retryErr.message,
              atIndex: i + 1
            };
            break;
          }
          throw retryErr;
        }
      }

      // Step 4: Parse hotel page facts & evaluate F1 address check
      const detailBuf = fs.readFileSync(hotelGzPath);
      const detailHtml = zlib.gunzipSync(detailBuf).toString('utf-8');
      const facts = parseBookingHtml(detailHtml, hotelMeta || {});

      const matchRes = matchHotelAddress(hotel, facts.address, facts.pageTitle);
      const candNum = extractStreetNumber(hotel.address?.street);
      const bkNum = extractStreetNumber(facts.address);

      if (!matchRes.pass) {
        console.log(`  -> F1 FAIL (wrong hotel): "${hotel.name}" (${hotel.address?.street}, ${hotel.town}) vs "${facts.pageTitle}" | "${facts.address}" [candNum: ${candNum} vs bkNum: ${bkNum}] | Reason: ${matchRes.reason}`);
        wrongHotelCount++;
        const record = {
          key: hotel.key,
          name: hotel.name,
          town: hotel.town,
          state: hotel.state,
          citySlug: hotel.citySlug,
          status: 'wrong_hotel',
          query: queryStr,
          bookingPageTitle: facts.pageTitle,
          bookingAddress: facts.address,
          bookingUrl: matched.cleanUrl,
          reason: matchRes.reason,
          processedAt: new Date().toISOString()
        };
        results.push(record);
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

      // F1 Match passed!
      foundCount++;
      const tubRooms = facts.tubRooms || [];
      const roomNameStatus = tubRooms.length > 0 ? 'confirmed_booking' : 'no_tub_on_booking';
      if (tubRooms.length > 0) tubRoomCount++;
      else noTubCount++;

      console.log(`  -> F1 PASS! "${facts.pageTitle}" [Address: ${facts.address} | candNum: ${candNum} vs bkNum: ${bkNum}]`);
      console.log(`     Tub rooms: ${tubRooms.length} (${roomNameStatus})`);
      if (tubRooms.length > 0) {
        tubRooms.slice(0, 3).forEach(r => console.log(`      * "${r}"`));
      }

      const todayStr = new Date().toISOString().split('T')[0];
      const bookingLinkObj = {
        platform: 'booking.com',
        url: matched.cleanUrl,
        seenAt: todayStr
      };

      const bookingFactsObj = {
        pageTitle: facts.pageTitle,
        address: facts.address,
        score10: facts.score10,
        reviewCount: facts.reviewCount,
        tubRooms,
        tubRoomsCount: tubRooms.length,
        fetchedAt: hotelMeta?.fetchedAt || new Date().toISOString()
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
        citySlug: hotel.citySlug,
        status: 'found',
        cleanUrl: matched.cleanUrl,
        pageTitle: facts.pageTitle,
        address: facts.address,
        tubRooms,
        tubRoomsCount: tubRooms.length,
        roomNameStatus,
        processedAt: new Date().toISOString()
      };
      results.push(record);
      resultsMap[hotel.key] = record;
      fs.writeFileSync(resultsPath, JSON.stringify({ results: Object.values(resultsMap), stopBlockError }, null, 2));
    }
  } finally {
    await closeBrowser();
  }

  console.log('\n=============================================================');
  console.log('>>> LINKS1B RETRY RUN FINISHED');
  console.log(`>>> Processed in this run: ${results.length}`);
  console.log(`>>> Found & matched:      ${foundCount} (with tub: ${tubRoomCount}, no tub: ${noTubCount})`);
  console.log(`>>> Not found:            ${notFoundCount}`);
  console.log(`>>> Search redirected:    ${redirectedCount}`);
  console.log(`>>> Wrong hotel (F1 fail): ${wrongHotelCount}`);
  if (stopBlockError) {
    console.log(`>>> 🚨 STOPPED ON BLOCK at ${stopBlockError.hotelName} (${stopBlockError.url})`);
  } else {
    console.log(`>>> 0 blocks encountered.`);
  }
  console.log('=============================================================');

  // Re-export not-found CSV from current DB state
  console.log(`\nRe-exporting data-collect/private/not-found-booking.csv...`);
  const remainingUnlinked = await db.collection('hotel_candidates')
    .find({
      citySlug: { $ne: null },
      $or: [
        { bookingLinks: { $exists: false } },
        { bookingLinks: { $size: 0 } }
      ]
    })
    .sort({ key: 1 })
    .toArray();

  const csvRows = remainingUnlinked.map(c => {
    const lastCheck = (c.platformChecks || []).slice(-1)[0] || {};
    const addr = (c.address?.street || c.address?.formatted || '').replace(/"/g, '""');
    const q = (lastCheck.query || `${c.name}, ${c.town}, ${c.state}`).replace(/"/g, '""');
    const res = lastCheck.result || 'not_found';
    const date = (lastCheck.checkedAt || new Date().toISOString()).slice(0, 10);
    return `"${c.name}","${c.town}","${c.state}","${addr}","${q}","${res}","${date}"`;
  });

  const csvHeader = 'name,town,state,address,last query,result,date\n';
  const csvPath = path.join(privateDir, 'not-found-booking.csv');
  fs.writeFileSync(csvPath, csvHeader + csvRows.join('\n') + '\n', 'utf8');
  console.log(`Wrote ${remainingUnlinked.length} rows to ${csvPath}`);

  // Final check
  const countHotelsFinal = await db.collection('hotels').countDocuments();
  const countCandidatesFinal = await db.collection('hotel_candidates').countDocuments();
  const countCandidatesLinked = await db.collection('hotel_candidates').countDocuments({ 'bookingLinks.0': { $exists: true } });
  const countCandidatesHidden = await db.collection('hotel_candidates').countDocuments({ status: 'hidden' });

  console.log(`\nFinal DB Verification:`);
  console.log(`  hotels count: ${countHotelsFinal} (must be 4470)`);
  console.log(`  hotel_candidates count: ${countCandidatesFinal} (must be 6035)`);
  console.log(`  hotel_candidates hidden: ${countCandidatesHidden} (must be 6035)`);
  console.log(`  hotel_candidates with link: ${countCandidatesLinked}`);

  await client.close();
}

main().catch(err => {
  console.error('Fatal error in main:', err);
  process.exit(1);
});
