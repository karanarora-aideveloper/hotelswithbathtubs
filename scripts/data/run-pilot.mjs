import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { savePage, closeBrowser } from './saver.mjs';
import { parseSavedBookingFile } from './parse-booking.mjs';
import { extractTripHotelsFromHtml, matchTripHotels } from './match-trip.mjs';
import { extractCleartripHotelsFromHtml, matchCleartripHotels } from './match-cleartrip.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const worktreeDir = path.resolve(__dirname, '../..');
const mainDir = path.resolve(worktreeDir, '..', 'hotelswithbathtubs');

const proposalsDir = path.join(worktreeDir, 'data-collect', 'proposals');
if (!fs.existsSync(proposalsDir)) {
  fs.mkdirSync(proposalsDir, { recursive: true });
}

const allHotels = JSON.parse(fs.readFileSync(path.join(mainDir, '.cache', 'all-hotels.json'), 'utf8'));

// -------------------------------------------------------------
// S1: Booking.com Facts Pilot (30 hotels)
// -------------------------------------------------------------
async function runS1() {
  console.log('\n=============================================================');
  console.log('>>> RUNNING S1: Booking.com Facts Pilot (30 Hotels)');
  console.log('=============================================================');

  function getHotels(city, country, count) {
    return allHotels
      .filter(h => h.city && h.city.toLowerCase() === city.toLowerCase() &&
                   h.country && h.country.toLowerCase() === country.toLowerCase() &&
                   h.bookingUrl)
      .slice(0, count);
  }

  const ny = getHotels('New York', 'USA', 5);
  const chi = getHotels('Chicago', 'USA', 5);
  const lv = getHotels('Las Vegas', 'USA', 5);
  const delhi = getHotels('Delhi', 'India', 5);
  const mum = getHotels('Mumbai', 'India', 5);
  const goa = getHotels('Goa', 'India', 5);

  const pilotHotels = [...ny, ...chi, ...lv, ...delhi, ...mum, ...goa];
  console.log(`Selected ${pilotHotels.length} hotels for S1 pilot:`);
  pilotHotels.forEach((h, i) => console.log(`  ${i + 1}. [${h.country}/${h.city}] ${h.name} (${h.slug})`));

  const bookingFacts = [];

  for (let i = 0; i < pilotHotels.length; i++) {
    const hotel = pilotHotels[i];
    console.log(`\n[S1 ${i + 1}/${pilotHotels.length}] Processing ${hotel.name} (${hotel.slug})...`);

    const result = await savePage('booking', hotel.bookingUrl, hotel.slug, { skipIfExists: true });
    if (result.skipped) {
      console.log(`  Skipped: ${result.reason}`);
      continue;
    }

    const facts = parseSavedBookingFile(result.gzPath);
    bookingFacts.push({
      hotelId: hotel._id,
      slug: hotel.slug,
      sourceUrl: hotel.bookingUrl,
      fetchedAt: result.meta?.fetchedAt || new Date().toISOString(),
      lat: facts.lat,
      lng: facts.lng,
      address: facts.address,
      district: facts.district,
      score10: facts.score10,
      reviewCount: facts.reviewCount,
      rooms: facts.rooms
    });
  }

  await closeBrowser();

  const outPath = path.join(proposalsDir, 'booking-facts.json');
  fs.writeFileSync(outPath, JSON.stringify(bookingFacts, null, 2), 'utf8');
  console.log(`\n[S1 Done] Saved ${bookingFacts.length} hotel facts to ${outPath}`);
  return bookingFacts;
}

// -------------------------------------------------------------
// S2: Trip.com Exact Partner Links Pilot
// -------------------------------------------------------------
async function runS2(s1Facts = []) {
  console.log('\n=============================================================');
  console.log('>>> RUNNING S2: Trip.com Exact Partner Links Pilot');
  console.log('=============================================================');

  const s1FactsMap = {};
  for (const f of s1Facts) {
    s1FactsMap[f.hotelId] = f;
  }

  const nyHotels = allHotels.filter(h => h.city && h.city.toLowerCase() === 'new york');
  const delhiHotels = allHotels.filter(h => h.city && h.city.toLowerCase() === 'delhi');

  console.log(`Database listings: New York=${nyHotels.length}, Delhi=${delhiHotels.length}`);

  // Fetch New York hotel list page
  const nyListUrl = 'https://www.trip.com/hotels/new-york-hotels-list-633/';
  console.log(`Saving Trip.com New York list page: ${nyListUrl}`);
  const nyResult = await savePage('trip', nyListUrl, 'new-york-hotels-list-633', { skipIfExists: true });

  const gzBuffer = fs.readFileSync(nyResult.gzPath);
  const zlib = (await import('node:zlib')).default;
  const nyHtml = zlib.gunzipSync(gzBuffer).toString('utf-8');

  const tripHotels = extractTripHotelsFromHtml(nyHtml, 'data-collect/pages/trip/new-york-hotels-list-633.html.gz');
  console.log(`Extracted ${tripHotels.length} partner hotel links from New York list page.`);

  const nyMatches = matchTripHotels(nyHotels, tripHotels, s1FactsMap);
  console.log(`New York matches: ${nyMatches.filter(m => m.confidence === 'high').length} high, ${nyMatches.filter(m => m.confidence === 'review').length} review`);

  // Delhi: Check if list page exists or put on needs-owner-save.json
  const needsOwnerSavePath = path.join(worktreeDir, 'data-collect', 'needs-owner-save.json');
  let needsOwnerSave = [];
  if (fs.existsSync(needsOwnerSavePath)) {
    try {
      needsOwnerSave = JSON.parse(fs.readFileSync(needsOwnerSavePath, 'utf8'));
    } catch {}
  }

  // Record Delhi on needs-owner-save
  const existingDelhi = needsOwnerSave.find(item => item.city.toLowerCase() === 'delhi' && item.platform === 'Trip.com');
  if (!existingDelhi) {
    needsOwnerSave.push({
      city: 'Delhi',
      country: 'India',
      platform: 'Trip.com',
      reason: 'No public city list page linked from directory pages (returns 404 for static list URLs; Trip.com uses client-side search). Owner can save search page by hand to web_pages/trip/delhi.html.',
      attemptedUrls: [
        'https://www.trip.com/hotels/delhi-hotels-list-704/',
        'https://www.trip.com/hotels/new-delhi-hotels-list-1004/',
        'https://www.trip.com/hotels/delhi-hotels-list-c2423/'
      ],
      ourListingsCount: delhiHotels.length
    });
    fs.writeFileSync(needsOwnerSavePath, JSON.stringify(needsOwnerSave, null, 2), 'utf8');
    console.log(`[S2] Recorded Delhi in ${needsOwnerSavePath}`);
  }

  // Also check if owner saved search page exists at web_pages/trip/delhi.html
  const ownerDelhiPage = path.join(mainDir, 'web_pages', 'trip', 'delhi.html');
  if (fs.existsSync(ownerDelhiPage)) {
    console.log(`[S2] Found owner-saved Delhi search page at ${ownerDelhiPage}! Parsing...`);
    const ownerHtml = fs.readFileSync(ownerDelhiPage, 'utf8');
    const ownerTripHotels = extractTripHotelsFromHtml(ownerHtml, 'web_pages/trip/delhi.html');
    const delhiMatches = matchTripHotels(delhiHotels, ownerTripHotels, s1FactsMap);
    nyMatches.push(...delhiMatches);
  } else {
    console.log(`[S2] Note: No owner-saved page found at web_pages/trip/delhi.html. Delhi listings marked as pending owner save.`);
  }

  const outPath = path.join(proposalsDir, 'trip-links.json');
  fs.writeFileSync(outPath, JSON.stringify(nyMatches, null, 2), 'utf8');
  console.log(`\n[S2 Done] Saved ${nyMatches.length} Trip.com proposals to ${outPath}`);
  return nyMatches;
}

// -------------------------------------------------------------
// S3: Cleartrip Exact Partner Links Pilot (India)
// -------------------------------------------------------------
async function runS3(s1Facts = []) {
  console.log('\n=============================================================');
  console.log('>>> RUNNING S3: Cleartrip Exact Partner Links Pilot (India)');
  console.log('=============================================================');

  const s1FactsMap = {};
  for (const f of s1Facts) {
    s1FactsMap[f.hotelId] = f;
  }

  const delhiHotels = allHotels.filter(h => h.city && h.city.toLowerCase() === 'delhi');
  console.log(`Targeting ${delhiHotels.length} Delhi hotels in our database.`);

  // 1. Fetch Delhi city page
  const cityUrl = 'https://www.cleartrip.com/hotels/hotels-in-new-delhi';
  console.log(`Fetching Cleartrip Delhi city page: ${cityUrl}...`);
  const cityResult = await savePage('cleartrip', cityUrl, 'hotels-in-new-delhi', { skipIfExists: true });

  // 2. Fetch locality pages from sitemap
  console.log('Fetching Cleartrip sitemap index to locate Delhi locality pages...');
  const sitemapXml = await fetch('https://www.cleartrip.com/hotels/seo-sitemap/city-locality-1.xml').then(r => r.text());
  const locUrls = [...sitemapXml.matchAll(/<loc>(https:\/\/[^<]+)<\/loc>/g)].map(m => m[1]);
  const delhiLocUrls = locUrls.filter(u => u.endsWith('-new-delhi') || u.endsWith('-delhi'));

  console.log(`Found ${delhiLocUrls.length} Delhi locality pages in Cleartrip sitemap.`);

  const zlib = (await import('node:zlib')).default;
  const allCleartripHotels = [];

  // Extract from city page first
  const cityGz = fs.readFileSync(cityResult.gzPath);
  const cityHtml = zlib.gunzipSync(cityGz).toString('utf-8');
  allCleartripHotels.push(...extractCleartripHotelsFromHtml(cityHtml, 'data-collect/pages/cleartrip/hotels-in-new-delhi.html.gz'));

  // Fetch localities
  for (let i = 0; i < delhiLocUrls.length; i++) {
    const locUrl = delhiLocUrls[i];
    const slug = locUrl.split('/').pop();
    console.log(`\n[S3 Locality ${i + 1}/${delhiLocUrls.length}] Saving ${slug}...`);

    try {
      const locResult = await savePage('cleartrip', locUrl, slug, { skipIfExists: true });
      if (locResult.gzPath && fs.existsSync(locResult.gzPath)) {
        const gzBuf = fs.readFileSync(locResult.gzPath);
        const locHtml = zlib.gunzipSync(gzBuf).toString('utf-8');
        const extracted = extractCleartripHotelsFromHtml(locHtml, `data-collect/pages/cleartrip/${slug}.html.gz`);
        allCleartripHotels.push(...extracted);
      }
    } catch (err) {
      if (err.name === 'BlockError') {
        console.error(`Stopping S3 pilot due to block: ${err.message}`);
        break;
      }
      console.warn(`Error on locality ${slug}: ${err.message}`);
    }
  }

  // Deduplicate cleartrip hotels by cleartripHotelId
  const uniqueCleartrip = [];
  const seenIds = new Set();
  for (const h of allCleartripHotels) {
    if (!seenIds.has(h.cleartripHotelId)) {
      seenIds.add(h.cleartripHotelId);
      uniqueCleartrip.push(h);
    }
  }
  console.log(`\nExtracted ${uniqueCleartrip.length} total unique Cleartrip hotels across Delhi.`);

  const cleartripMatches = matchCleartripHotels(delhiHotels, uniqueCleartrip, s1FactsMap);
  console.log(`Delhi matches: ${cleartripMatches.filter(m => m.confidence === 'high').length} high, ${cleartripMatches.filter(m => m.confidence === 'review').length} review`);

  const outPath = path.join(proposalsDir, 'cleartrip-links.json');
  fs.writeFileSync(outPath, JSON.stringify(cleartripMatches, null, 2), 'utf8');
  console.log(`\n[S3 Done] Saved ${cleartripMatches.length} Cleartrip proposals to ${outPath}`);
  return cleartripMatches;
}

// -------------------------------------------------------------
// Main Orchestrator
// -------------------------------------------------------------
async function main() {
  const step = process.argv[2] || 'all';
  console.log(`Starting Data Round 1 Pilot (mode: ${step})...`);

  let s1Facts = [];
  if (step === 'all' || step === 's1') {
    s1Facts = await runS1();
  } else if (fs.existsSync(path.join(proposalsDir, 'booking-facts.json'))) {
    s1Facts = JSON.parse(fs.readFileSync(path.join(proposalsDir, 'booking-facts.json'), 'utf8'));
  }

  if (step === 'all' || step === 's2') {
    await runS2(s1Facts);
  }

  if (step === 'all' || step === 's3') {
    await runS3(s1Facts);
  }

  console.log('\nPilot run complete! Run `node scripts/data/report.mjs` to view full audit report.');
}

main().catch(err => {
  console.error('Pilot execution error:', err);
  process.exit(1);
});
