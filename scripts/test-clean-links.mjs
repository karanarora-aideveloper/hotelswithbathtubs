import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Import affiliate functions
const {
  AFFILIATES_ENABLED,
  cleanOutboundUrl,
  wrapOutboundAffiliateLink,
  STRIP_PARAM_REGEX,
} = await import('../src/lib/affiliate.ts');

console.log('====================================================');
console.log('🧪 AFFILIATES-OFF TEST SUITE (CEO Sheet T46)');
console.log('====================================================');
console.log(`AFFILIATES_ENABLED: ${AFFILIATES_ENABLED} (expected: false)\n`);

const testCases = [
  {
    name: 'Booking.com aid & label',
    input: 'https://www.booking.com/hotel/us/the-joy-sedona.html?aid=304142&label=gen173nr-1FCAEoggI46AdIM1gEaGyIAQGYATG4ARfIAQzYAQHoAQH4AQuIAgGoAgO4Ap_Eub0GwAIB0gIkYWEzYTcwNjEtYzVlNi00MGViLWI1OWMtZTVkODIzYTYwODlk2AIG4AIB',
  },
  {
    name: 'Agoda cid & tag',
    input: 'https://www.agoda.com/partners/partnersearch.aspx?cid=1972736&hid=12345&tag=affiliate_test',
  },
  {
    name: 'MakeMyTrip wrapped in EarnKaro Linkredirect',
    input: 'https://trackingv3.linkredirect.in/visitretailer/1729?id=1471944&dl=https%3A%2F%2Fwww.makemytrip.com%2Fhotels%2Fhotel-details%2F%3FhotelId%3D201406251213075211',
  },
  {
    name: 'Cleartrip wrapped in Ekaro engine',
    input: 'https://ekaro.in/enkr?url=https%3A%2F%2Fwww.cleartrip.com%2Fhotels%2Fdetails%2F12345&r=1471944',
  },
  {
    name: 'MakeMyTrip wrapped in Cuelinks linksredirect',
    input: 'https://linksredirect.com/?cid=325472&source=api&url=https%3A%2F%2Fwww.makemytrip.com%2Fhotels%2Fhotel-details%2F%3FhotelId%3D201406251213075211%26utm_source%3Dcuelinks%26utm_medium%3Daffiliate',
  },
  {
    name: 'Expedia camref & utm params',
    input: 'https://www.expedia.com/Sedona-Hotels-L-Auberge-De-Sedona.h41113.Hotel-Information?camref=1100l32&utm_source=affiliate',
  },
  {
    name: 'Trip.com Allianceid & SID',
    input: 'https://www.trip.com/hotels/detail/?hotelId=12345&Allianceid=12345&SID=67890',
  },
  {
    name: 'Hotels.com camref',
    input: 'https://www.hotels.com/ho41113/?camref=1100l32',
  },
  {
    name: 'Internal /out wrapped URL',
    input: '/out?url=https%3A%2F%2Fwww.booking.com%2Fhotel%2Fus%2Fthe-joy.html%3Faid%3D304142%26label%3Dtest',
  },
];

console.log('--- 1. Individual ID Type Tests (Before vs After) ---');
let idTestsPassed = true;

for (const tc of testCases) {
  const after = cleanOutboundUrl(tc.input);
  const wrapped = wrapOutboundAffiliateLink(tc.input);

  // Assert no affiliate params remain
  let hasAffiliate = false;
  try {
    const parsed = new URL(after, 'https://www.hotelswithbathtubs.com');
    for (const k of parsed.searchParams.keys()) {
      if (STRIP_PARAM_REGEX.test(k)) {
        hasAffiliate = true;
      }
    }
  } catch {
    hasAffiliate = true;
  }

  const pass = !hasAffiliate && after === wrapped;
  if (!pass) idTestsPassed = false;

  console.log(`[${pass ? 'PASS' : 'FAIL'}] ${tc.name}:`);
  console.log(`  Before: ${tc.input}`);
  console.log(`  After:  ${after}`);
  console.log();
}

console.log('--- 2. Legitimate Parameters & Dates Preservation ---');
const datesPreservationTest = 'https://www.booking.com/hotel/us/the-joy-sedona.html?aid=304142&hotelId=98765';
const cleanedWithDates = wrapOutboundAffiliateLink(datesPreservationTest, undefined, {
  checkin: '2026-11-20',
  checkout: '2026-11-22',
  adults: 2,
});
console.log('Preservation Test:');
console.log('  Input:  ' + datesPreservationTest);
console.log('  Output: ' + cleanedWithDates);
const parsedDates = new URL(cleanedWithDates);
const hasCheckin = parsedDates.searchParams.get('checkin') === '2026-11-20';
const hasCheckout = parsedDates.searchParams.get('checkout') === '2026-11-22';
const hasHotelId = parsedDates.searchParams.get('hotelId') === '98765';
const hasNoAid = !parsedDates.searchParams.has('aid');
const datesPass = hasCheckin && hasCheckout && hasHotelId && hasNoAid;
console.log(`  Checkin preserved: ${hasCheckin}, Checkout preserved: ${hasCheckout}, HotelId preserved: ${hasHotelId}, Aid removed: ${hasNoAid}`);
console.log(`  Status: [${datesPass ? 'PASS' : 'FAIL'}]\n`);

console.log('--- 3. Catalogue Scan: .cache/all-hotels.json ---');
const cachePath = path.join(rootDir, '.cache', 'all-hotels.json');
if (!fs.existsSync(cachePath)) {
  console.error('❌ .cache/all-hotels.json not found!');
  process.exit(1);
}

const hotels = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
const urlFields = ['bookingUrl', 'agodaUrl', 'url', 'expediaUrl', 'hotelsComUrl', 'vrboUrl', 'airbnbUrl', 'tripUrl', 'mmtUrl'];

let totalChecked = 0;
let remainingAffiliateParams = 0;
let invalidUrls = 0;

for (const h of hotels) {
  for (const f of urlFields) {
    const raw = h[f];
    if (raw && typeof raw === 'string' && raw.trim().startsWith('http')) {
      totalChecked++;
      const cleaned = wrapOutboundAffiliateLink(raw);
      try {
        const parsed = new URL(cleaned);
        for (const [k] of parsed.searchParams.entries()) {
          if (STRIP_PARAM_REGEX.test(k)) {
            remainingAffiliateParams++;
          }
        }
      } catch {
        invalidUrls++;
      }
    }
  }
}

console.log(`Total URLs checked across inventory: ${totalChecked}`);
console.log(`Remaining affiliate parameters:      ${remainingAffiliateParams}`);
console.log(`Invalid URLs produced:               ${invalidUrls}`);

if (remainingAffiliateParams === 0 && invalidUrls === 0 && idTestsPassed && datesPass) {
  console.log('\n✅ ALL AFFILIATE-OFF TESTS PASSED (100% CLEAN DIRECT LINKS)!');
} else {
  console.error('\n❌ SOME CHECKS FAILED!');
  process.exit(1);
}
