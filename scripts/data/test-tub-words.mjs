// scripts/data/test-tub-words.mjs
// Test suite for shared bathtub evidence classification module (scripts/data/lib/tub-words.mjs).
// Verifies all owner-approved proof terms and strict disqualifiers (1 Nov 2026).

import { classifyTub } from './lib/tub-words.mjs';

const testCases = [
  // =========================================================================
  // DISQUALIFIERS & "DOESN'T COUNT" CASES
  // =========================================================================
  {
    name: 'Double Room with Private Bathroom (bathroom is not a tub)',
    input: { roomName: 'Double Room with Private Bathroom' },
    expected: { isProof: false }
  },
  {
    name: 'Room with Shared Bath (shared bath is a bathroom, not a private tub)',
    input: { roomName: 'Room with Shared Bath' },
    expected: { isProof: false }
  },
  {
    name: 'Deluxe Plunge Pool Suite (pool is not a tub)',
    input: { roomName: 'Deluxe Plunge Pool Suite' },
    expected: { isProof: false }
  },
  {
    name: 'Onsen access (plain onsen is not a room tub)',
    input: { roomName: 'Onsen access' },
    expected: { isProof: false }
  },
  {
    name: 'Bathtub grab bar facility (grab bar is not a tub)',
    input: { facilities: ['Bathtub grab bar'] },
    expected: { isProof: false }
  },
  {
    name: 'Bathtub seat facility (seat is not a tub)',
    input: { facilities: ['Bathtub seat'] },
    expected: { isProof: false }
  },
  {
    name: 'Separate shower/bathtub facility (Agoda label not proof on its own)',
    input: { facilities: ['Separate shower/bathtub'] },
    expected: { isProof: false }
  },
  {
    name: 'Bath or shower facility (Booking.com label not proof)',
    input: { facilities: ['Bath or shower'] },
    expected: { isProof: false }
  },
  {
    name: 'Room with Bath or Shower room name',
    input: { roomName: 'Room with Bath or Shower' },
    expected: { isProof: false }
  },
  {
    name: 'Room with Shower or Bath room name',
    input: { roomName: 'Room with Shower or Bath' },
    expected: { isProof: false }
  },
  {
    name: 'Villa with Private Pool (pool is not a tub)',
    input: { roomName: 'Villa with Private Pool' },
    expected: { isProof: false }
  },
  {
    name: 'Room with External Bath (external bath is a bathroom)',
    input: { roomName: 'Room with External Bath' },
    expected: { isProof: false }
  },
  {
    name: 'Room with Private Bath (private bath refers to bathroom)',
    input: { roomName: 'Room with Private Bath' },
    expected: { isProof: false }
  },
  {
    name: 'Public bath access (public bath is not a private tub)',
    input: { roomName: 'Public bath access' },
    expected: { isProof: false }
  },
  {
    name: 'Public bath facility',
    input: { facilities: ['Public bath'] },
    expected: { isProof: false }
  },
  {
    name: 'Open-air bath access without private/in-room (plain rotenburo)',
    input: { roomName: 'Open-air bath access' },
    expected: { isProof: false }
  },
  {
    name: 'Open-air bath facility without private/in-room',
    input: { facilities: ['Open-air bath'] },
    expected: { isProof: false }
  },
  {
    name: 'Freestanding coat rack room (freestanding without tub/bath)',
    input: { roomName: 'Freestanding coat rack room' },
    expected: { isProof: false }
  },
  {
    name: 'Double Room with Balcony (double without tub/bath/jacuzzi/whirlpool)',
    input: { roomName: 'Double Room with Balcony' },
    expected: { isProof: false }
  },
  {
    name: 'Corner Suite with City View (corner without tub/bath/jacuzzi/whirlpool)',
    input: { roomName: 'Corner Suite with City View' },
    expected: { isProof: false }
  },
  {
    name: 'Standard Twin Room (no tub words)',
    input: { roomName: 'Standard Twin Room' },
    expected: { isProof: false }
  },
  {
    name: 'Standard amenities (no tub facilities)',
    input: { facilities: ['Air conditioning', 'Hairdryer', 'Shower'] },
    expected: { isProof: false }
  },
  {
    name: 'Plunge pool facility',
    input: { facilities: ['Plunge pool'] },
    expected: { isProof: false }
  },
  {
    name: 'Private pool facility',
    input: { facilities: ['Private pool'] },
    expected: { isProof: false }
  },
  {
    name: 'Public onsen room name',
    input: { roomName: 'Room with Public onsen view' },
    expected: { isProof: false }
  },

  // =========================================================================
  // PROOF / "COUNTS" CASES
  // =========================================================================
  {
    name: 'Deluxe Room with Freestanding Tub (Owner approved 1 Nov)',
    input: { roomName: 'Deluxe Room with Freestanding Tub' },
    expected: { isProof: true, wordContains: 'Freestanding' }
  },
  {
    name: 'Suite with Clawfoot Bath (Owner approved 1 Nov)',
    input: { roomName: 'Suite with Clawfoot Bath' },
    expected: { isProof: true, wordContains: 'Clawfoot' }
  },
  {
    name: 'King Room with Roll-top Bath (Owner approved 1 Nov)',
    input: { roomName: 'King Room with Roll-top Bath' },
    expected: { isProof: true, wordContains: 'Roll-top' }
  },
  {
    name: 'Luxury Suite with Roll-top Tub (Owner approved 1 Nov)',
    input: { roomName: 'Luxury Suite with Roll-top Tub' },
    expected: { isProof: true, wordContains: 'Roll-top' }
  },
  {
    name: 'Executive Room with Clawfoot Tub (Owner approved 1 Nov)',
    input: { roomName: 'Executive Room with Clawfoot Tub' },
    expected: { isProof: true, wordContains: 'Clawfoot' }
  },
  {
    name: 'Deluxe Suite with Hydromassage Tub (Owner approved 1 Nov)',
    input: { roomName: 'Deluxe Suite with Hydromassage Tub' },
    expected: { isProof: true, wordContains: 'Hydromassage' }
  },
  {
    name: 'Room with Hydromassage Bath (Owner approved 1 Nov)',
    input: { roomName: 'Room with Hydromassage Bath' },
    expected: { isProof: true, wordContains: 'Hydromassage' }
  },
  {
    name: 'King Suite with Soaking Tub (Owner approved 1 Nov)',
    input: { roomName: 'King Suite with Soaking Tub' },
    expected: { isProof: true, wordContains: 'Soaking tub' }
  },
  {
    name: 'Deluxe Suite with Soaker Tub (Owner approved 1 Nov)',
    input: { roomName: 'Deluxe Suite with Soaker Tub' },
    expected: { isProof: true, wordContains: 'Soaker tub' }
  },
  {
    name: 'Room with Soaking Bath (Owner approved 1 Nov)',
    input: { roomName: 'Room with Soaking Bath' },
    expected: { isProof: true, wordContains: 'Soaking bath' }
  },
  {
    name: 'Suite with Two-person Jacuzzi (Owner approved 1 Nov)',
    input: { roomName: 'Suite with Two-person Jacuzzi' },
    expected: { isProof: true, wordContains: 'Two-person jacuzzi' }
  },
  {
    name: 'Room with Corner Whirlpool (Owner approved 1 Nov)',
    input: { roomName: 'Room with Corner Whirlpool' },
    expected: { isProof: true, wordContains: 'Corner whirlpool' }
  },
  {
    name: 'Suite with Double Tub (Owner approved 1 Nov)',
    input: { roomName: 'Suite with Double Tub' },
    expected: { isProof: true, wordContains: 'Double tub' }
  },
  {
    name: 'Room with Corner Bath (Owner approved 1 Nov)',
    input: { roomName: 'Room with Corner Bath' },
    expected: { isProof: true, wordContains: 'Corner bath' }
  },
  {
    name: 'Double Room with Bath (British room name, Owner approved 1 Nov)',
    input: { roomName: 'Double Room with Bath' },
    expected: { isProof: true, wordContains: 'Room with Bath' }
  },
  {
    name: 'Superior Twin Room with Bath (British room name, Owner approved 1 Nov)',
    input: { roomName: 'Superior Twin Room with Bath' },
    expected: { isProof: true, wordContains: 'Room with Bath' }
  },
  {
    name: 'Traditional Room with Ofuro (Japanese soaking tub, Owner approved 1 Nov)',
    input: { roomName: 'Traditional Room with Ofuro' },
    expected: { isProof: true, wordContains: 'Ofuro' }
  },
  {
    name: 'Japanese Suite with Private Onsen (Owner approved 1 Nov)',
    input: { roomName: 'Japanese Suite with Private Onsen' },
    expected: { isProof: true, wordContains: 'Private onsen' }
  },
  {
    name: 'Deluxe Room with In-Room Onsen (Owner approved 1 Nov)',
    input: { roomName: 'Deluxe Room with In-Room Onsen' },
    expected: { isProof: true, wordContains: 'Private onsen' }
  },
  {
    name: 'Villa with Private Open-Air Bath (Owner approved 1 Nov)',
    input: { roomName: 'Villa with Private Open-Air Bath' },
    expected: { isProof: true, mayBeOutdoor: true, wordContains: 'Private open-air bath' }
  },
  {
    name: 'Suite with Open-Air Tub (Owner approved 1 Nov)',
    input: { roomName: 'Suite with Open-Air Tub' },
    expected: { isProof: true, mayBeOutdoor: true, wordContains: 'Open-air tub' }
  },
  {
    name: 'Chalet with Hot Tub (Hot tub sets mayBeOutdoor, Owner approved 1 Nov)',
    input: { roomName: 'Chalet with Hot Tub' },
    expected: { isProof: true, mayBeOutdoor: true, wordContains: 'Hot tub' }
  },
  {
    name: 'Hot tub facility (Hot tub sets mayBeOutdoor, Owner approved 1 Nov)',
    input: { facilities: ['Hot tub'] },
    expected: { isProof: true, mayBeOutdoor: true, wordContains: 'Hot tub' }
  },
  {
    name: 'Bathtub facility',
    input: { facilities: ['Bathtub'] },
    expected: { isProof: true, wordContains: 'Bathtub' }
  },
  {
    name: 'Whirlpool bathtub facility',
    input: { facilities: ['Whirlpool bathtub'] },
    expected: { isProof: true, wordContains: 'Whirlpool' }
  },
  {
    name: 'Bath facility',
    input: { facilities: ['Bath'] },
    expected: { isProof: true, wordContains: 'Bath' }
  },
  {
    name: 'Spa bath facility',
    input: { facilities: ['Spa bath'] },
    expected: { isProof: true, wordContains: 'Spa bath' }
  },
  {
    name: 'Deluxe Suite with Jetted Tub',
    input: { roomName: 'Deluxe Suite with Jetted Tub' },
    expected: { isProof: true, wordContains: 'Jetted tub' }
  },
  {
    name: 'Villa with Private Pool and Jacuzzi (pool ignored, jacuzzi counts)',
    input: { roomName: 'Villa with Private Pool and Jacuzzi' },
    expected: { isProof: true, wordContains: 'Jacuzzi' }
  },
  {
    name: 'Deluxe Room with Bathtub grab bar and Bathtub (grab bar ignored, bathtub counts)',
    input: { roomName: 'Deluxe Room', facilities: ['Bathtub grab bar', 'Bathtub'] },
    expected: { isProof: true, wordContains: 'Bathtub' }
  }
];

console.log('=============================================================');
console.log('>>> RUNNING TEST SUITE: scripts/data/test-tub-words.mjs');
console.log(`>>> Total test cases: ${testCases.length}`);
console.log('=============================================================\n');

let passedCount = 0;
let failedCount = 0;

for (let i = 0; i < testCases.length; i++) {
  const tc = testCases[i];
  const actual = classifyTub(tc.input);

  let pass = true;
  const failureReasons = [];

  if (actual.isProof !== tc.expected.isProof) {
    pass = false;
    failureReasons.push(`Expected isProof=${tc.expected.isProof}, got ${actual.isProof}`);
  }

  if (tc.expected.mayBeOutdoor !== undefined) {
    if (actual.mayBeOutdoor !== tc.expected.mayBeOutdoor) {
      pass = false;
      failureReasons.push(`Expected mayBeOutdoor=${tc.expected.mayBeOutdoor}, got ${actual.mayBeOutdoor}`);
    }
  }

  if (tc.expected.wordContains) {
    const hasWord = actual.words.some(w => w.toLowerCase().includes(tc.expected.wordContains.toLowerCase()));
    if (!hasWord) {
      pass = false;
      failureReasons.push(`Expected words to contain "${tc.expected.wordContains}", got [${actual.words.join(', ')}]`);
    }
  }

  const idxStr = (i + 1).toString().padStart(2, '0');
  if (pass) {
    passedCount++;
    console.log(`[PASS] Case ${idxStr}: ${tc.name}`);
    console.log(`       Result: isProof=${actual.isProof}, words=[${actual.words.join(', ')}], mayBeOutdoor=${actual.mayBeOutdoor}`);
  } else {
    failedCount++;
    console.error(`[FAIL] Case ${idxStr}: ${tc.name}`);
    failureReasons.forEach(r => console.error(`       -> ${r}`));
    console.error(`       Got: isProof=${actual.isProof}, words=[${actual.words.join(', ')}], mayBeOutdoor=${actual.mayBeOutdoor}`);
  }
}

console.log('\n-------------------------------------------------------------');
console.log(`TEST SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED out of ${testCases.length} total cases.`);
console.log('-------------------------------------------------------------');

if (failedCount > 0) {
  process.exit(1);
} else {
  console.log('ALL TEST CASES PASSED SUCCESSFULLY.\n');
  process.exit(0);
}
