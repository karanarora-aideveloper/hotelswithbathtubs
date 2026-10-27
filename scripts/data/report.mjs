import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const worktreeDir = path.resolve(__dirname, '../..');
const mainDir = path.resolve(worktreeDir, '..', 'hotelswithbathtubs');

const proposalsDir = path.join(worktreeDir, 'data-collect', 'proposals');
const bookingFactsPath = path.join(proposalsDir, 'booking-facts.json');
const tripLinksPath = path.join(proposalsDir, 'trip-links.json');
const cleartripLinksPath = path.join(proposalsDir, 'cleartrip-links.json');
const needsOwnerSavePath = path.join(worktreeDir, 'data-collect', 'needs-owner-save.json');

console.log('===============================================================');
console.log('       DATA ROUND 1 PILOT REPORT: REAL FACTS & PARTNER LINKS   ');
console.log('===============================================================\n');

// 1. S1 Booking.com Report
console.log('---------------------------------------------------------------');
console.log('### S1: Booking.com Facts Pilot (Target: 30 Hotels)');
console.log('---------------------------------------------------------------');
if (fs.existsSync(bookingFactsPath)) {
  const bookingFacts = JSON.parse(fs.readFileSync(bookingFactsPath, 'utf8'));
  const total = bookingFacts.length;
  console.log(`Total Pilot Hotels Processed: ${total} / 30`);

  const fieldCounts = {
    lat: bookingFacts.filter(h => h.lat != null).length,
    lng: bookingFacts.filter(h => h.lng != null).length,
    address: bookingFacts.filter(h => !!h.address).length,
    district: bookingFacts.filter(h => !!h.district).length,
    score10: bookingFacts.filter(h => h.score10 != null).length,
    reviewCount: bookingFacts.filter(h => h.reviewCount != null).length,
    rooms: bookingFacts.filter(h => Array.isArray(h.rooms) && h.rooms.length > 0).length,
    roomsWithBath: bookingFacts.filter(h => Array.isArray(h.rooms) && h.rooms.some(r => r.bathWords?.length > 0)).length
  };

  console.log('\nPer-Field Fill Rates:');
  console.log(`- Latitude:       ${fieldCounts.lat} / ${total} (${((fieldCounts.lat/total)*100).toFixed(1)}%)`);
  console.log(`- Longitude:      ${fieldCounts.lng} / ${total} (${((fieldCounts.lng/total)*100).toFixed(1)}%)`);
  console.log(`- Address:        ${fieldCounts.address} / ${total} (${((fieldCounts.address/total)*100).toFixed(1)}%)`);
  console.log(`- District/Area:  ${fieldCounts.district} / ${total} (${((fieldCounts.district/total)*100).toFixed(1)}%)`);
  console.log(`- Guest Score:    ${fieldCounts.score10} / ${total} (${((fieldCounts.score10/total)*100).toFixed(1)}%)`);
  console.log(`- Review Count:   ${fieldCounts.reviewCount} / ${total} (${((fieldCounts.reviewCount/total)*100).toFixed(1)}%)`);
  console.log(`- Room List:      ${fieldCounts.rooms} / ${total} (${((fieldCounts.rooms/total)*100).toFixed(1)}%)`);
  console.log(`- Has Bath Word:  ${fieldCounts.roomsWithBath} / ${total} (${((fieldCounts.roomsWithBath/total)*100).toFixed(1)}%)`);

  console.log('\nSample 5 Hotels (Parsed Object next to Live Link):');
  const samples = bookingFacts.slice(0, 5);
  samples.forEach((h, idx) => {
    console.log(`\n[${idx + 1}] ${h.slug}`);
    console.log(`Live Link: ${h.sourceUrl}`);
    console.log('Parsed Object:', JSON.stringify({
      hotelId: h.hotelId,
      lat: h.lat,
      lng: h.lng,
      address: h.address,
      district: h.district,
      score10: h.score10,
      reviewCount: h.reviewCount,
      roomCount: h.rooms?.length || 0,
      roomsWithBathWords: h.rooms?.filter(r => r.bathWords?.length > 0) || []
    }, null, 2));
  });
} else {
  console.log(`❌ ${bookingFactsPath} not found.`);
}

// 2. S2 Trip.com Report
console.log('\n---------------------------------------------------------------');
console.log('### S2: Trip.com Exact Partner Links Pilot');
console.log('---------------------------------------------------------------');
if (fs.existsSync(tripLinksPath)) {
  const tripLinks = JSON.parse(fs.readFileSync(tripLinksPath, 'utf8'));
  const allHotels = JSON.parse(fs.readFileSync(path.join(mainDir, '.cache', 'all-hotels.json'), 'utf8'));

  const nyHotels = allHotels.filter(h => h.city && h.city.toLowerCase() === 'new york');
  const delhiHotels = allHotels.filter(h => h.city && h.city.toLowerCase() === 'delhi');

  const nyHigh = tripLinks.filter(l => l.confidence === 'high' && nyHotels.some(h => h._id === l.hotelId));
  const nyReview = tripLinks.filter(l => l.confidence === 'review' && nyHotels.some(h => h._id === l.hotelId));

  const delhiHigh = tripLinks.filter(l => l.confidence === 'high' && delhiHotels.some(h => h._id === l.hotelId));
  const delhiReview = tripLinks.filter(l => l.confidence === 'review' && delhiHotels.some(h => h._id === l.hotelId));

  console.log(`New York Listings (${nyHotels.length} total):`);
  console.log(`- High Confidence Matches:   ${nyHigh.length}`);
  console.log(`- Review Confidence Matches: ${nyReview.length}`);

  console.log(`\nDelhi Listings (${delhiHotels.length} total):`);
  console.log(`- High Confidence Matches:   ${delhiHigh.length}`);
  console.log(`- Review Confidence Matches: ${delhiReview.length}`);

  const highMatches = tripLinks.filter(l => l.confidence === 'high');
  console.log(`\nHigh Matches Sample (up to 10):`);
  highMatches.slice(0, 10).forEach((m, idx) => {
    console.log(`${idx + 1}. Our Name:   "${m.ourName}"`);
    console.log(`   Their Name: "${m.theirName}"`);
    console.log(`   Trip URL:   ${m.tripUrl} (ID: ${m.tripHotelId})`);
    console.log(`   Evidence:   ${m.evidenceFile}\n`);
  });
} else {
  console.log(`❌ ${tripLinksPath} not found.`);
}

// 3. S3 Cleartrip Report
console.log('---------------------------------------------------------------');
console.log('### S3: Cleartrip Exact Partner Links Pilot (India)');
console.log('---------------------------------------------------------------');
if (fs.existsSync(cleartripLinksPath)) {
  const cleartripLinks = JSON.parse(fs.readFileSync(cleartripLinksPath, 'utf8'));
  const allHotels = JSON.parse(fs.readFileSync(path.join(mainDir, '.cache', 'all-hotels.json'), 'utf8'));
  const delhiHotels = allHotels.filter(h => h.city && h.city.toLowerCase() === 'delhi');

  const delhiHigh = cleartripLinks.filter(l => l.confidence === 'high' && delhiHotels.some(h => h._id === l.hotelId));
  const delhiReview = cleartripLinks.filter(l => l.confidence === 'review' && delhiHotels.some(h => h._id === l.hotelId));

  console.log(`Delhi Listings (${delhiHotels.length} total):`);
  console.log(`- High Confidence Matches:   ${delhiHigh.length}`);
  console.log(`- Review Confidence Matches: ${delhiReview.length}`);

  const highMatches = cleartripLinks.filter(l => l.confidence === 'high');
  console.log(`\nHigh Matches Sample (up to 10):`);
  highMatches.slice(0, 10).forEach((m, idx) => {
    console.log(`${idx + 1}. Our Name:      "${m.ourName}"`);
    console.log(`   Their Name:    "${m.theirName}"`);
    console.log(`   Cleartrip URL: ${m.tripUrl} (ID: ${m.tripHotelId})`);
    console.log(`   Evidence:      ${m.evidenceFile}\n`);
  });
} else {
  console.log(`❌ ${cleartripLinksPath} not found.`);
}

// 4. Needs Owner Save List
console.log('---------------------------------------------------------------');
console.log('### Needs Owner Save List:');
console.log('---------------------------------------------------------------');
if (fs.existsSync(needsOwnerSavePath)) {
  const needsSave = JSON.parse(fs.readFileSync(needsOwnerSavePath, 'utf8'));
  console.log(JSON.stringify(needsSave, null, 2));
} else {
  console.log('None (all target cities resolved from allowed pages).');
}
console.log('===============================================================\n');
