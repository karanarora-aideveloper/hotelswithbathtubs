import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { MongoClient } from 'mongodb';
import * as cheerio from 'cheerio';
import { savePage, closeBrowser, BlockError } from './saver.mjs';
import { parseBookingHtml, parseSavedBookingFile } from './parse-booking.mjs';
import { normalizeName, getSignificantWords, getSignificantWordOverlap } from './match-utils.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const worktreeDir = path.resolve(__dirname, '../..');
const privateDir = path.join(worktreeDir, 'data-collect', 'private');
if (!fs.existsSync(privateDir)) {
  fs.mkdirSync(privateDir, { recursive: true });
}

function getMongoUri() {
  if (process.env.MONGODB_URI) return process.env.MONGODB_URI;
  const candidatePaths = [
    '/Users/karanarora/my_brain/01_startups/hotelswithbathtubs/.env.local',
    path.resolve(__dirname, '../../../../hotelswithbathtubs/.env.local'),
    path.resolve(process.cwd(), '../hotelswithbathtubs/.env.local'),
    path.resolve(process.cwd(), '.env.local')
  ];
  for (const p of candidatePaths) {
    if (fs.existsSync(p)) {
      const content = fs.readFileSync(p, 'utf8');
      for (const line of content.split('\n')) {
        const m = line.match(/^MONGODB_URI=(.*)$/);
        if (m) {
          return m[1].trim().replace(/^['"]|['"]$/g, '');
        }
      }
    }
  }
  throw new Error('MONGODB_URI not found in environment or .env.local');
}

function norm(s) {
  return (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function cleanHotelUrl(rawUrl) {
  if (!rawUrl) return null;
  const stripped = rawUrl.split('?')[0];
  return stripped.replace(/\.en-gb\.html$/, '.html');
}

function matchCard(cardTitle, cardAddress, candidate) {
  const normCandName = norm(candidate.name);
  const normCardTitle = norm(cardTitle);
  const nameExact = normCandName === normCardTitle;

  const overlap = getSignificantWordOverlap(candidate.name, cardTitle);
  const candWords = getSignificantWords(candidate.name);
  const cardWordsSet = new Set(getSignificantWords(cardTitle));
  const allCandWordsInCard = candWords.length > 0 && candWords.every(w => cardWordsSet.has(w));

  const nameMatches = nameExact || overlap >= 0.75 || allCandWordsInCard;
  if (!nameMatches) return false;

  // Town check
  if (candidate.town && cardAddress) {
    const normCandTown = norm(candidate.town);
    const normAddr = norm(cardAddress);
    if (!normAddr.includes(normCandTown)) {
      // If address doesn't contain town, only allow if name was exact and overlap was 1.0
      if (!nameExact && overlap < 1.0) return false;
    }
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
  console.log('>>> RUNNING LINKS1: Find Booking.com Links for US Candidates');
  console.log(`>>> Mode: ${isWrite ? 'WRITE TO DATABASE' : 'DRY RUN (no DB writes)'}`);
  if (limit) console.log(`>>> Limit: ${limit} hotels`);
  if (startIdx > 0) console.log(`>>> Starting at index: ${startIdx}`);
  console.log('=============================================================');

  const uri = getMongoUri();
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();

  // Verify hotels collection count
  const hotelsCountBefore = await db.collection('hotels').countDocuments();
  console.log(`Verified current hotels collection count: ${hotelsCountBefore}`);
  if (hotelsCountBefore !== 4470) {
    console.error(`ERROR: Expected exactly 4470 hotels in 'hotels' collection, found ${hotelsCountBefore}`);
    await client.close();
    process.exit(1);
  }

  // Load target candidates with citySlug !== null
  let candidates = await db.collection('hotel_candidates')
    .find({ citySlug: { $ne: null } })
    .sort({ key: 1 })
    .toArray();

  console.log(`Found ${candidates.length} candidate hotels with citySlug !== null.`);
  if (startIdx > 0 || limit) {
    candidates = candidates.slice(startIdx, limit ? startIdx + limit : undefined);
    console.log(`Processing slice of ${candidates.length} candidate hotels.`);
  }

  // Load existing results if resuming
  const resultsPath = path.join(privateDir, 'links1-results.json');
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
  let mismatchCount = 0;
  let tubRoomCount = 0;
  let noTubCount = 0;
  let stopBlockError = null;

  try {
    for (let i = 0; i < candidates.length; i++) {
      const hotel = candidates[i];
      console.log(`\n[${i + 1}/${candidates.length}] Hotel: "${hotel.name}" (${hotel.town}, ${hotel.state}) [${hotel.citySlug}] key: ${hotel.key}`);

      // Check if already processed in this run or loaded
      if (resultsMap[hotel.key] && resultsMap[hotel.key].status !== 'stop_block') {
        const cached = resultsMap[hotel.key];
        console.log(`  -> Already processed in saved results with status: ${cached.status}`);
        results.push(cached);
        if (cached.status === 'matched') {
          foundCount++;
          if (cached.tubRooms && cached.tubRooms.length > 0) tubRoomCount++;
          else noTubCount++;
        } else if (cached.status === 'not_found') {
          notFoundCount++;
        } else if (cached.status === 'mismatch') {
          mismatchCount++;
        }
        continue;
      }

      // Step 1: Search Booking.com
      const queryStr = `${hotel.name}, ${hotel.town}, ${hotel.state}`;
      const searchUrl = `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(queryStr)}`;
      const searchSlug = `search-${hotel.key.replace(/\|/g, '-')}`;

      let searchGzPath = null;
      try {
        const saveRes = await savePage('booking-links1', searchUrl, searchSlug, { skipIfExists: true });
        searchGzPath = saveRes.gzPath;
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
        console.warn(`\n[warning] Transient browser error for ${hotel.key}: ${err.message}. Retrying once...`);
        await closeBrowser();
        await new Promise(r => setTimeout(r, 5000));
        try {
          const saveRes = await savePage('booking-links1', searchUrl, searchSlug, { skipIfExists: true });
          searchGzPath = saveRes.gzPath;
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

      // Step 2: Parse search results & match
      const searchBuf = fs.readFileSync(searchGzPath);
      const searchHtml = zlib.gunzipSync(searchBuf).toString('utf-8');
      const { cardsCount, matched } = parseBookingSearchResults(searchHtml, hotel);

      if (!matched) {
        console.log(`  -> Not found in ${cardsCount} search results.`);
        notFoundCount++;
        const record = {
          key: hotel.key,
          name: hotel.name,
          town: hotel.town,
          state: hotel.state,
          citySlug: hotel.citySlug,
          status: 'not_found',
          cardsCount,
          processedAt: new Date().toISOString()
        };
        results.push(record);
        resultsMap[hotel.key] = record;
        fs.writeFileSync(resultsPath, JSON.stringify({ results: Object.values(resultsMap), stopBlockError }, null, 2));
        continue;
      }

      console.log(`  -> Matched card: "${matched.title}" -> ${matched.cleanUrl}`);

      // Step 3: Fetch hotel detail page
      const hotelSlug = `hotel-${hotel.key.replace(/\|/g, '-')}`;
      let hotelGzPath = null;
      let fetchedMeta = null;
      try {
        const hotelSaveRes = await savePage('booking-links1', matched.cleanUrl, hotelSlug, { skipIfExists: true });
        hotelGzPath = hotelSaveRes.gzPath;
        fetchedMeta = hotelSaveRes.meta;
      } catch (err) {
        if (err instanceof BlockError || err.name === 'BlockError') {
          console.error(`\n🚨 CRITICAL: BlockError during hotel fetch for ${hotel.key}: ${err.message}`);
          stopBlockError = {
            atKey: hotel.key,
            hotelName: hotel.name,
            url: matched.cleanUrl,
            error: err.message,
            atIndex: i + 1
          };
          break;
        }
        console.warn(`\n[warning] Transient browser error fetching hotel ${hotel.key}: ${err.message}. Retrying once...`);
        await closeBrowser();
        await new Promise(r => setTimeout(r, 5000));
        try {
          const hotelSaveRes = await savePage('booking-links1', matched.cleanUrl, hotelSlug, { skipIfExists: true });
          hotelGzPath = hotelSaveRes.gzPath;
          fetchedMeta = hotelSaveRes.meta;
        } catch (retryErr) {
          if (retryErr instanceof BlockError || retryErr.name === 'BlockError') {
            console.error(`\n🚨 CRITICAL: BlockError during hotel retry for ${hotel.key}: ${retryErr.message}`);
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

      // Step 4: Parse hotel page facts
      const facts = parseSavedBookingFile(hotelGzPath);
      const rawTitle = facts.pageTitle || '';
      const cleanedTitle = rawTitle.replace(/\s*,\s*Booking\.com.*$/i, '').replace(/\s*\(updated prices.*?\)/i, '').trim();

      const titleExact = norm(hotel.name) === norm(cleanedTitle);
      const titleOverlap = getSignificantWordOverlap(hotel.name, cleanedTitle);
      const titleMatches = titleExact || titleOverlap >= 0.6 || getSignificantWords(hotel.name).every(w => new Set(getSignificantWords(cleanedTitle)).has(w));

      if (!titleMatches) {
        console.log(`  -> Page title mismatch: "${hotel.name}" vs "${facts.pageTitle}" (overlap: ${titleOverlap.toFixed(2)})`);
        mismatchCount++;
        const record = {
          key: hotel.key,
          name: hotel.name,
          town: hotel.town,
          state: hotel.state,
          citySlug: hotel.citySlug,
          status: 'mismatch',
          bookingPageTitle: facts.pageTitle,
          bookingUrl: matched.cleanUrl,
          processedAt: new Date().toISOString()
        };
        results.push(record);
        resultsMap[hotel.key] = record;
        fs.writeFileSync(resultsPath, JSON.stringify({ results: Object.values(resultsMap), stopBlockError }, null, 2));
        continue;
      }

      // Step 5: Extract tub rooms & status
      foundCount++;
      const tubRooms = facts.rooms
        .filter(r => r.bathWords && r.bathWords.length > 0)
        .map(r => r.name);

      const roomNameStatus = tubRooms.length > 0 ? 'confirmed_booking' : 'no_tub_on_booking';
      if (tubRooms.length > 0) tubRoomCount++;
      else noTubCount++;

      console.log(`  -> Match verified! Tub rooms: ${tubRooms.length} (${roomNameStatus})`);
      if (tubRooms.length > 0) {
        tubRooms.slice(0, 3).forEach(r => console.log(`     * "${r}"`));
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
        fetchedAt: fetchedMeta?.fetchedAt || new Date().toISOString()
      };

      // DB update if --write
      if (isWrite) {
        await db.collection('hotel_candidates').updateOne(
          { _id: hotel._id },
          {
            $set: {
              bookingLinks: [bookingLinkObj],
              bookingFacts: bookingFactsObj,
              roomNameStatus
            }
          }
        );
        console.log(`  -> DB updated in hotel_candidates.`);
      }

      const record = {
        key: hotel.key,
        name: hotel.name,
        town: hotel.town,
        state: hotel.state,
        citySlug: hotel.citySlug,
        status: 'matched',
        cleanUrl: matched.cleanUrl,
        pageTitle: facts.pageTitle,
        tubRooms,
        roomNameStatus,
        tubHotelsRoomName: hotel.verifiedRoomName || null,
        processedAt: new Date().toISOString()
      };
      results.push(record);
      resultsMap[hotel.key] = record;
      fs.writeFileSync(resultsPath, JSON.stringify({ results: Object.values(resultsMap), stopBlockError }, null, 2));
    }
  } finally {
    await closeBrowser();
  }

  // Verify hotels count unchanged
  const hotelsCountAfter = await db.collection('hotels').countDocuments();
  console.log(`\nVerified hotels collection count after run: ${hotelsCountAfter} (must be 4470)`);
  if (hotelsCountAfter !== 4470) {
    console.error(`🚨 CRITICAL INTEGRITY ERROR: hotels count changed to ${hotelsCountAfter}!`);
  }

  await client.close();

  // Save final report
  const allSaved = Object.values(resultsMap);
  fs.writeFileSync(resultsPath, JSON.stringify({ results: allSaved, stopBlockError }, null, 2));
  console.log(`\nSaved ${allSaved.length} cumulative results to ${resultsPath}`);

  // Recalculate summary metrics across all processed
  const totalM = allSaved.filter(r => r.status === 'matched').length;
  const totalNF = allSaved.filter(r => r.status === 'not_found').length;
  const totalMM = allSaved.filter(r => r.status === 'mismatch').length;
  const totalTub = allSaved.filter(r => r.status === 'matched' && r.tubRooms && r.tubRooms.length > 0).length;
  const totalNoTub = allSaved.filter(r => r.status === 'matched' && (!r.tubRooms || r.tubRooms.length === 0)).length;

  // Summary output
  console.log('\n=============================================================');
  console.log('>>> LINKS1 EXECUTION SUMMARY (CUMULATIVE)');
  console.log('=============================================================');
  console.log(`Total Candidates Processed: ${allSaved.length}`);
  console.log(`Found and Matched:          ${totalM}`);
  console.log(`Not Found:                  ${totalNF}`);
  console.log(`Mismatch:                   ${totalMM}`);
  console.log(`With Tub Room on Booking:   ${totalTub}`);
  console.log(`No Tub on Booking:          ${totalNoTub}`);
  if (stopBlockError) {
    console.log(`Stops/Blocks Encountered:   YES`);
    console.log(`  At Hotel:                 ${stopBlockError.hotelName} (${stopBlockError.atKey})`);
    console.log(`  URL:                      ${stopBlockError.url}`);
    console.log(`  Reason:                   ${stopBlockError.error}`);
  } else {
    console.log(`Stops/Blocks Encountered:   0 (Clean completion)`);
  }
  console.log('=============================================================');
}

main().catch(err => {
  console.error('Fatal error in collect-booking-links1:', err);
  process.exit(1);
});
