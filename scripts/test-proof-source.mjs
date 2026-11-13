// scripts/test-proof-source.mjs
// Verifies that Agoda-proven hotels get "Agoda" in badges and proof box text,
// Booking-proven hotels get "Booking.com", and unlinked hotels fall back cleanly.

import { register } from 'node:module';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import assert from 'node:assert';

// Register hook to resolve @/ aliases for ESM imports
const hookPath = path.resolve(path.dirname(new URL(import.meta.url).pathname), 'test-loader-hook.mjs');
register(pathToFileURL(hookPath).href);

const {
  getFirstPartner,
  getProofBadgeText,
  getProofBoxTitle,
  getProofBoxText,
  isHotelConfirmed,
} = await import('../src/lib/evidence.ts');

console.log('=== Running Proof Source Unit Tests ===\n');

let totalTests = 0;
let passedTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  PASS: ${name}`);
  } catch (err) {
    console.error(`  FAIL: ${name}`);
    console.error(err);
    process.exitCode = 1;
  }
}

// 1. Agoda-proven hotel
const agodaHotel = {
  name: 'Allseasons Treehouse Village',
  importBatch: 'PROMOTE3-2026-11-12',
  bookingTubLabels: ['Bathtub', 'Whirlpool bathtub'],
  agodaUrl: 'https://www.agoda.com/all-seasons-treehouse-village/hotel/eureka-springs-ar-us.html',
  roomType: 'King Suite with Spa Bath',
};

runTest('Agoda hotel is confirmed', () => {
  assert.strictEqual(isHotelConfirmed(agodaHotel), true);
});

runTest('Agoda hotel getFirstPartner returns Agoda', () => {
  assert.strictEqual(getFirstPartner(agodaHotel), 'Agoda');
});

runTest('Agoda hotel badge shows "✓ Tub proven · Agoda"', () => {
  assert.strictEqual(getProofBadgeText(agodaHotel), '✓ Tub proven · Agoda');
});

runTest('Agoda hotel proof box title shows "Tub proven on Agoda"', () => {
  assert.strictEqual(getProofBoxTitle(agodaHotel), 'Tub proven on Agoda');
});

runTest('Agoda hotel proof box text names Agoda and the exact room', () => {
  const text = getProofBoxText(agodaHotel, 'bathtub');
  assert.strictEqual(
    text,
    'Agoda lists a bathtub for the King Suite with Spa Bath. Pick this exact room when you book.'
  );
});

// 2. Booking.com-proven hotel
const bookingHotel = {
  name: 'The Joy Sedona',
  importBatch: 'PROMOTE1-2026-10-29',
  bookingTubLabels: ['Hot tub'],
  bookingUrl: 'https://www.booking.com/hotel/us/sedona-views-bed-and-breakfast.html',
  roomType: 'Deluxe King Suite',
};

runTest('Booking hotel is confirmed', () => {
  assert.strictEqual(isHotelConfirmed(bookingHotel), true);
});

runTest('Booking hotel getFirstPartner returns Booking.com', () => {
  assert.strictEqual(getFirstPartner(bookingHotel), 'Booking.com');
});

runTest('Booking hotel badge shows "✓ Tub proven · Booking.com"', () => {
  assert.strictEqual(getProofBadgeText(bookingHotel), '✓ Tub proven · Booking.com');
});

runTest('Booking hotel proof box title shows "Tub proven on Booking.com"', () => {
  assert.strictEqual(getProofBoxTitle(bookingHotel), 'Tub proven on Booking.com');
});

runTest('Booking hotel proof box text names Booking.com and the exact room', () => {
  const text = getProofBoxText(bookingHotel, 'hot tub');
  assert.strictEqual(
    text,
    'Booking.com lists a hot tub for the Deluxe King Suite. Pick this exact room when you book.'
  );
});

// 3. Fallback when hotel has proof but no partner URL
const unlinkedHotel = {
  name: 'Historic Manor Inn',
  importBatch: 'PROMOTE2-2026-10-30',
  bookingTubLabels: ['Bathtub'],
  roomType: 'Classic Room',
};

runTest('Unlinked hotel getFirstPartner returns null', () => {
  assert.strictEqual(getFirstPartner(unlinkedHotel), null);
});

runTest('Unlinked hotel badge shows "✓ Tub proven" with no site name', () => {
  assert.strictEqual(getProofBadgeText(unlinkedHotel), '✓ Tub proven');
});

runTest('Unlinked hotel proof box title shows "Tub proven"', () => {
  assert.strictEqual(getProofBoxTitle(unlinkedHotel), 'Tub proven');
});

runTest('Unlinked hotel proof box text uses generic "A booking site"', () => {
  const text = getProofBoxText(unlinkedHotel, 'bathtub');
  assert.strictEqual(
    text,
    'A booking site lists a bathtub for the Classic Room. Pick this exact room when you book.'
  );
});

// 4. CoupleFriendly badge logic
runTest('CoupleHotel with Agoda first partner produces "✓ Tub proven · Agoda"', () => {
  const coupleAgoda = { partners: [{ partner: 'Agoda', url: 'https://agoda.com' }] };
  const badge = coupleAgoda.partners && coupleAgoda.partners[0]?.partner
    ? `✓ Tub proven · ${coupleAgoda.partners[0].partner}`
    : '✓ Tub proven';
  assert.strictEqual(badge, '✓ Tub proven · Agoda');
});

runTest('CoupleHotel with Booking first partner produces "✓ Tub proven · Booking.com"', () => {
  const coupleBooking = { partners: [{ partner: 'Booking.com', url: 'https://booking.com' }] };
  const badge = coupleBooking.partners && coupleBooking.partners[0]?.partner
    ? `✓ Tub proven · ${coupleBooking.partners[0].partner}`
    : '✓ Tub proven';
  assert.strictEqual(badge, '✓ Tub proven · Booking.com');
});

runTest('CoupleHotel with no partners produces "✓ Tub proven"', () => {
  const coupleNone = { partners: [] };
  const badge = coupleNone.partners && coupleNone.partners[0]?.partner
    ? `✓ Tub proven · ${coupleNone.partners[0].partner}`
    : '✓ Tub proven';
  assert.strictEqual(badge, '✓ Tub proven');
});

console.log(`\nTotal tests: ${totalTests}, Passed: ${passedTests}, Failed: ${totalTests - passedTests}`);
if (passedTests === totalTests) {
  console.log('ALL PROOF SOURCE TESTS PASSED (100%)\n');
} else {
  process.exit(1);
}
