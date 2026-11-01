// scripts/audit/confirmed-impact.mjs
// Usage: node scripts/audit/confirmed-impact.mjs
// Analyzes the site-wide and per-city impact of requiring real Booking.com evidence
// (importBatch AND non-empty bookingTubLabels) for confirmed status.

import fs from 'node:fs';
import path from 'node:path';

const DROP = new Set([
  'austin-hotel-saint-cecilia-austin',
  'the-driskill-austin',
  'fairmont-grand-del-mar-san-diego',
  'san-diego-rancho-valencia-resort-spa',
  'desolation-hotel-lake-tahoe',
  'the-landing-resort-spa-lake-tahoe',
  'hyatt-regency-lake-tahoe-resort-spa-and-casino-incline-village-lake-tahoe',
  'hyatt-regency-grand-reserve-puerto-rico-rio-grande-san-juan',
  'disneys-grand-floridian-resort-orlando',
  'fairmont-scottsdale-princess',
  'omni-scottsdale-resort-montelucia',
  '1-hotel-san-francisco',
  'palace-hotel-san-francisco',
]);

const cachePath = path.join(process.cwd(), '.cache', 'all-hotels.json');
const rawHotels = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
const hotels = rawHotels.filter(h => h.flagged !== true && !DROP.has(h.slug));

const isConfirmedOld = (h) => h.bathtubConfirmed === true;
const isConfirmedNew = (h) => Boolean(h.importBatch && Array.isArray(h.bookingTubLabels) && h.bookingTubLabels.length > 0);

const isVacationRental = (hotel) => {
  if (!hotel) return false;
  const hasAirbnb = Boolean(hotel.airbnbUrl || (typeof hotel.url === 'string' && hotel.url.includes('airbnb.')));
  if (!hasAirbnb) return false;
  const hasOther = Boolean(
    hotel.bookingUrl ||
    hotel.agodaUrl ||
    hotel.expediaUrl ||
    hotel.hotelsComUrl ||
    hotel.tripUrl ||
    hotel.mmtUrl ||
    hotel.vrboUrl ||
    (typeof hotel.url === 'string' && !hotel.url.includes('airbnb.'))
  );
  return !hasOther;
};

const isJacuzziRoom = (hotel) => {
  if (!hotel) return false;
  const tub = typeof hotel.tubType === 'string' ? hotel.tubType : '';
  const room = typeof hotel.roomType === 'string' ? hotel.roomType : '';
  const pattern = /jacuzzi|whirlpool|hot tub|jetted|hydro/i;
  return pattern.test(tub) || pattern.test(room);
};

function generateIntroSentence(cityName, cityHotels, isConfirmedFn) {
  const hotelList = cityHotels.filter((h) => !isVacationRental(h));
  const rentalList = cityHotels.filter((h) => isVacationRental(h));

  const hCount = hotelList.length;
  const rCount = rentalList.length;

  let countLead = '';
  if (hCount > 0 && rCount > 0) {
    countLead = `We list ${hCount} ${cityName} ${hCount === 1 ? 'hotel' : 'hotels'} and ${rCount} ${rCount === 1 ? 'vacation rental' : 'vacation rentals'}`;
  } else if (hCount > 0) {
    countLead = `We list ${hCount} ${cityName} ${hCount === 1 ? 'hotel' : 'hotels'}`;
  } else if (rCount > 0) {
    countLead = `We list ${rCount} ${cityName} ${rCount === 1 ? 'vacation rental' : 'vacation rentals'}`;
  }

  const countPhrase = countLead ? `${countLead} with a bathtub in the room` : '';

  const confirmedHotels = cityHotels.filter((h) => isConfirmedFn(h));
  const unconfirmedHotels = cityHotels.filter((h) => !isConfirmedFn(h));
  const confirmedCount = confirmedHotels.length;
  const unconfirmedCount = unconfirmedHotels.length;
  const allConfirmed = cityHotels.length > 0 && unconfirmedCount === 0;

  let jacuzziMix = 0;
  let clawfootMix = 0;
  let soakingMix = 0;
  let enSuiteMix = 0;
  const breakdownSource = allConfirmed ? cityHotels : confirmedHotels;
  for (const h of breakdownSource) {
    if (isJacuzziRoom(h)) jacuzziMix++;
    else if (/clawfoot/i.test(h.tubType || '')) clawfootMix++;
    else if (/soak|deep|freestanding|marble/i.test(h.tubType || '')) soakingMix++;
    else enSuiteMix++;
  }

  const tubParts = [];
  if (jacuzziMix > 0) tubParts.push(`${jacuzziMix} with an in-room jacuzzi${jacuzziMix > 1 ? ' or whirlpool' : ''}`);
  if (soakingMix > 0) tubParts.push(`${soakingMix} with a deep soaking ${soakingMix > 1 ? 'or freestanding tub' : 'tub'}`);
  if (clawfootMix > 0) tubParts.push(`${clawfootMix} with a clawfoot tub`);
  if (enSuiteMix > 0) tubParts.push(`${enSuiteMix} with a private en-suite bathtub`);

  let tubPhrase = '';
  if (tubParts.length === 1) tubPhrase = tubParts[0];
  else if (tubParts.length === 2) tubPhrase = `${tubParts[0]} and ${tubParts[1]}`;
  else if (tubParts.length >= 3) tubPhrase = `${tubParts.slice(0, -1).join(', ')}, and ${tubParts[tubParts.length - 1]}`;

  let introSentence1 = '';
  if (allConfirmed) {
    introSentence1 = countPhrase ? `${countPhrase}: ${tubPhrase}.` : '';
  } else {
    const baseSentence = `${countLead} where a bathtub is listed or reported: ${confirmedCount} confirmed on a booking site, ${unconfirmedCount} reported but not yet confirmed.`;
    if (confirmedCount > 0 && tubPhrase) {
      const confirmedNoun = confirmedCount === 1
        ? (confirmedHotels.some((h) => isVacationRental(h)) ? 'The confirmed rental includes' : 'The confirmed hotel includes')
        : (confirmedHotels.every((h) => isVacationRental(h)) ? 'The confirmed vacation rentals include' : (confirmedHotels.some((h) => isVacationRental(h)) ? 'The confirmed stays include' : 'The confirmed hotels include'));
      introSentence1 = `${baseSentence} ${confirmedNoun} ${tubPhrase}.`;
    } else {
      introSentence1 = baseSentence;
    }
  }
  return introSentence1;
}

// 1. Site-wide totals
const siteConfirmedBefore = hotels.filter(isConfirmedOld).length;
const siteReportedBefore = hotels.filter(h => !isConfirmedOld(h)).length;
const siteConfirmedAfter = hotels.filter(isConfirmedNew).length;
const siteReportedAfter = hotels.filter(h => !isConfirmedNew(h)).length;

console.log('========================================================================================');
console.log('HOTELS WITH BATHTUBS — CONFIRMED IMPACT REPORT (ROUND 14)');
console.log('========================================================================================\n');

console.log('--- 1. SITE-WIDE TOTALS ---');
console.log(`Total live hotels evaluated: ${hotels.length}`);
console.log(`Confirmed Before:  ${siteConfirmedBefore.toString().padStart(5)}  |  Confirmed After:  ${siteConfirmedAfter.toString().padStart(5)}  (diff: -${siteConfirmedBefore - siteConfirmedAfter})`);
console.log(`Reported Before:   ${siteReportedBefore.toString().padStart(5)}  |  Reported After:   ${siteReportedAfter.toString().padStart(5)}  (diff: +${siteReportedAfter - siteReportedBefore})`);

// 2. City aggregation
const cityMap = new Map();
for (const h of hotels) {
  const city = h.city || 'Unknown';
  if (!cityMap.has(city)) cityMap.set(city, []);
  cityMap.get(city).push(h);
}

let siteEmptyFaqCities = 0;
let siteTotalCitiesWithFaqBefore = 0;
for (const [city, list] of cityMap) {
  const cOld = list.filter(isConfirmedOld).length;
  const cNew = list.filter(isConfirmedNew).length;
  const faqOld = (cOld > 0 ? 1 : 0) + (list.filter(h => isConfirmedOld(h) && isJacuzziRoom(h)).length > 0 ? 1 : 0);
  const faqNew = (cNew > 0 ? 1 : 0) + (list.filter(h => isConfirmedNew(h) && isJacuzziRoom(h)).length > 0 ? 1 : 0);
  if (faqOld > 0) siteTotalCitiesWithFaqBefore++;
  if (faqOld > 0 && faqNew === 0) siteEmptyFaqCities++;
}
console.log(`\nSite-wide FAQ hotel lists:`);
console.log(`Total cities with hotels:                     ${cityMap.size}`);
console.log(`Cities with FAQ hotel lists before:           ${siteTotalCitiesWithFaqBefore}`);
console.log(`Cities where all FAQ hotel lists become empty: ${siteEmptyFaqCities}\n`);

// 3. Top 20 cities by hotel count
const sortedCities = [...cityMap.entries()].sort((a, b) => b[1].length - a[1].length);
const top20 = sortedCities.slice(0, 20);

console.log('--- 2. TOP 20 CITIES IMPACT TABLE ---');
console.log('City'.padEnd(18) + 'Total'.padStart(6) + 'Conf (B/A)'.padStart(14) + 'Rep (B/A)'.padStart(14) + 'FAQ Lists (B/A)'.padStart(17) + 'FAQ Empty?'.padStart(12));
console.log('-'.repeat(81));

let top20EmptyFaqCount = 0;
for (const [city, list] of top20) {
  const total = list.length;
  const cOld = list.filter(isConfirmedOld).length;
  const cNew = list.filter(isConfirmedNew).length;
  const rOld = list.filter(h => !isConfirmedOld(h)).length;
  const rNew = list.filter(h => !isConfirmedNew(h)).length;

  const faqOld = (cOld > 0 ? 1 : 0) + (list.filter(h => isConfirmedOld(h) && isJacuzziRoom(h)).length > 0 ? 1 : 0);
  const faqNew = (cNew > 0 ? 1 : 0) + (list.filter(h => isConfirmedNew(h) && isJacuzziRoom(h)).length > 0 ? 1 : 0);

  const becomesEmpty = faqOld > 0 && faqNew === 0;
  if (becomesEmpty) top20EmptyFaqCount++;

  const confStr = `${cOld} -> ${cNew}`;
  const repStr = `${rOld} -> ${rNew}`;
  const faqStr = `${faqOld} -> ${faqNew}`;
  const emptyStr = becomesEmpty ? 'YES (0)' : (faqNew > 0 ? 'No' : 'N/A');

  console.log(
    city.padEnd(18) +
    total.toString().padStart(6) +
    confStr.padStart(14) +
    repStr.padStart(14) +
    faqStr.padStart(17) +
    emptyStr.padStart(12)
  );
}
console.log('-'.repeat(81));
console.log(`Top 20 cities where FAQ hotel lists become empty: ${top20EmptyFaqCount} of 20\n`);

// 4. Before & After intro sentences for specified cities
const sampleCities = ['Delhi', 'Mumbai', 'Goa', 'Boston', 'Las Vegas', 'Branson'];
console.log('--- 3. BEFORE & AFTER INTRO SENTENCES ---');
for (const c of sampleCities) {
  const list = cityMap.get(c) || [];
  console.log(`\n[${c.toUpperCase()}] (${list.length} hotels)`);
  console.log('BEFORE: ' + generateIntroSentence(c, list, isConfirmedOld));
  console.log('AFTER:  ' + generateIntroSentence(c, list, isConfirmedNew));
}
console.log('\n========================================================================================');
