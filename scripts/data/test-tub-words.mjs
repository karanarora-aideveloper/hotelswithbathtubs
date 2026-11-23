// scripts/data/test-tub-words.mjs
// Test suite for shared bathtub evidence classification module (scripts/data/lib/tub-words.mjs).
// Verifies all owner-approved proof terms, proof strengths, and strict disqualifiers (1 Nov 2026).

import { classifyTub } from './lib/tub-words.mjs';

const testCases = [
  // =========================================================================
  // DISQUALIFIERS & "DOESN'T COUNT" CASES (strength: null)
  // =========================================================================
  {
    name: 'Double Room with Private Bathroom (bathroom is not a tub)',
    input: { roomName: 'Double Room with Private Bathroom' },
    expected: { isProof: false, strength: null }
  },
  {
    name: 'Room with Shared Bath (shared bath is a bathroom, not a private tub)',
    input: { roomName: 'Room with Shared Bath' },
    expected: { isProof: false, strength: null }
  },
  {
    name: 'Deluxe Plunge Pool Suite (pool is not a tub)',
    input: { roomName: 'Deluxe Plunge Pool Suite' },
    expected: { isProof: false, strength: null }
  },
  {
    name: 'Onsen access (plain onsen is not a room tub)',
    input: { roomName: 'Onsen access' },
    expected: { isProof: false, strength: null }
  },
  {
    name: 'Separate shower/bathtub facility (Agoda label not proof on its own)',
    input: { facilities: ['Separate shower/bathtub'] },
    expected: { isProof: false, strength: null }
  },
  {
    name: 'Bath or shower facility (Booking.com label not proof)',
    input: { facilities: ['Bath or shower'] },
    expected: { isProof: false, strength: null }
  },
  {
    name: 'Room with Bath or Shower room name',
    input: { roomName: 'Room with Bath or Shower' },
    expected: { isProof: false, strength: null }
  },
  {
    name: 'Room with Shower or Bath room name',
    input: { roomName: 'Room with Shower or Bath' },
    expected: { isProof: false, strength: null }
  },
  {
    name: 'Villa with Private Pool (pool is not a tub)',
    input: { roomName: 'Villa with Private Pool' },
    expected: { isProof: false, strength: null }
  },
  {
    name: 'Room with External Bath (external bath is a bathroom)',
    input: { roomName: 'Room with External Bath' },
    expected: { isProof: false, strength: null }
  },
  {
    name: 'Room with Private Bath (private bath refers to bathroom)',
    input: { roomName: 'Room with Private Bath' },
    expected: { isProof: false, strength: null }
  },
  {
    name: 'Public bath access (public bath is not a private tub)',
    input: { roomName: 'Public bath access' },
    expected: { isProof: false, strength: null }
  },
  {
    name: 'Public bath facility',
    input: { facilities: ['Public bath'] },
    expected: { isProof: false, strength: null }
  },
  {
    name: 'Open-air bath access without private/in-room (plain rotenburo)',
    input: { roomName: 'Open-air bath access' },
    expected: { isProof: false, strength: null }
  },
  {
    name: 'Open-air bath facility without private/in-room',
    input: { facilities: ['Open-air bath'] },
    expected: { isProof: false, strength: null }
  },
  {
    name: 'Freestanding coat rack room (freestanding without tub/bath)',
    input: { roomName: 'Freestanding coat rack room' },
    expected: { isProof: false, strength: null }
  },
  {
    name: 'Double Room with Balcony (double without tub/bath/jacuzzi/whirlpool)',
    input: { roomName: 'Double Room with Balcony' },
    expected: { isProof: false, strength: null }
  },
  {
    name: 'Corner Suite with City View (corner without tub/bath/jacuzzi/whirlpool)',
    input: { roomName: 'Corner Suite with City View' },
    expected: { isProof: false, strength: null }
  },
  {
    name: 'Standard Twin Room (no tub words)',
    input: { roomName: 'Standard Twin Room' },
    expected: { isProof: false, strength: null }
  },
  {
    name: 'Standard amenities (no tub facilities)',
    input: { facilities: ['Air conditioning', 'Hairdryer', 'Shower'] },
    expected: { isProof: false, strength: null }
  },
  {
    name: 'Plunge pool facility',
    input: { facilities: ['Plunge pool'] },
    expected: { isProof: false, strength: null }
  },
  {
    name: 'Private pool facility',
    input: { facilities: ['Private pool'] },
    expected: { isProof: false, strength: null }
  },
  {
    name: 'Public onsen room name',
    input: { roomName: 'Room with Public onsen view' },
    expected: { isProof: false, strength: null }
  },
  {
    name: 'Executive King Room - Mobility Accessible with Roll-in Shower (accessible without tub does not count)',
    input: { roomName: 'Executive King Room - Mobility Accessible with Roll-in Shower' },
    expected: { isProof: false, strength: null }
  },
  {
    name: 'Adapted Room with Roll-in Shower (adapted without tub does not count)',
    input: { roomName: 'Adapted Room with Roll-in Shower' },
    expected: { isProof: false, strength: null }
  },
  {
    name: 'King Room with Accessible Bathroom (accessible bathroom is not a tub)',
    input: { roomName: 'King Room with Accessible Bathroom' },
    expected: { isProof: false, strength: null }
  },

  // =========================================================================
  // PROOF CASES: STRENGTH 1 (Tub word in room name)
  // =========================================================================
  {
    name: 'Deluxe Room with Freestanding Tub (Owner approved 1 Nov, strength 1)',
    input: { roomName: 'Deluxe Room with Freestanding Tub' },
    expected: { isProof: true, strength: 1, wordContains: 'Freestanding' }
  },
  {
    name: 'Suite with Clawfoot Bath (Owner approved 1 Nov, strength 1)',
    input: { roomName: 'Suite with Clawfoot Bath' },
    expected: { isProof: true, strength: 1, wordContains: 'Clawfoot' }
  },
  {
    name: 'King Room with Roll-top Bath (Owner approved 1 Nov, strength 1)',
    input: { roomName: 'King Room with Roll-top Bath' },
    expected: { isProof: true, strength: 1, wordContains: 'Roll-top' }
  },
  {
    name: 'Luxury Suite with Roll-top Tub (Owner approved 1 Nov, strength 1)',
    input: { roomName: 'Luxury Suite with Roll-top Tub' },
    expected: { isProof: true, strength: 1, wordContains: 'Roll-top' }
  },
  {
    name: 'Executive Room with Clawfoot Tub (Owner approved 1 Nov, strength 1)',
    input: { roomName: 'Executive Room with Clawfoot Tub' },
    expected: { isProof: true, strength: 1, wordContains: 'Clawfoot' }
  },
  {
    name: 'Deluxe Suite with Hydromassage Tub (Owner approved 1 Nov, strength 1)',
    input: { roomName: 'Deluxe Suite with Hydromassage Tub' },
    expected: { isProof: true, strength: 1, wordContains: 'Hydromassage' }
  },
  {
    name: 'Room with Hydromassage Bath (Owner approved 1 Nov, strength 1)',
    input: { roomName: 'Room with Hydromassage Bath' },
    expected: { isProof: true, strength: 1, wordContains: 'Hydromassage' }
  },
  {
    name: 'King Suite with Soaking Tub (Owner approved 1 Nov, strength 1)',
    input: { roomName: 'King Suite with Soaking Tub' },
    expected: { isProof: true, strength: 1, wordContains: 'Soaking tub' }
  },
  {
    name: 'Deluxe Suite with Soaker Tub (Owner approved 1 Nov, strength 1)',
    input: { roomName: 'Deluxe Suite with Soaker Tub' },
    expected: { isProof: true, strength: 1, wordContains: 'Soaker tub' }
  },
  {
    name: 'Room with Soaking Bath (Owner approved 1 Nov, strength 1)',
    input: { roomName: 'Room with Soaking Bath' },
    expected: { isProof: true, strength: 1, wordContains: 'Soaking bath' }
  },
  {
    name: 'Suite with Two-person Jacuzzi (Owner approved 1 Nov, strength 1)',
    input: { roomName: 'Suite with Two-person Jacuzzi' },
    expected: { isProof: true, strength: 1, wordContains: 'Two-person jacuzzi' }
  },
  {
    name: 'Room with Corner Whirlpool (Owner approved 1 Nov, strength 1)',
    input: { roomName: 'Room with Corner Whirlpool' },
    expected: { isProof: true, strength: 1, wordContains: 'Corner whirlpool' }
  },
  {
    name: 'Suite with Double Tub (Owner approved 1 Nov, strength 1)',
    input: { roomName: 'Suite with Double Tub' },
    expected: { isProof: true, strength: 1, wordContains: 'Double tub' }
  },
  {
    name: 'Room with Corner Bath (Owner approved 1 Nov, strength 1)',
    input: { roomName: 'Room with Corner Bath' },
    expected: { isProof: true, strength: 1, wordContains: 'Corner bath' }
  },
  {
    name: 'Double Room with Bath (British room name, Owner approved 1 Nov, strength 1)',
    input: { roomName: 'Double Room with Bath' },
    expected: { isProof: true, strength: 1, wordContains: 'Room with Bath' }
  },
  {
    name: 'Superior Twin Room with Bath (British room name, Owner approved 1 Nov, strength 1)',
    input: { roomName: 'Superior Twin Room with Bath' },
    expected: { isProof: true, strength: 1, wordContains: 'Room with Bath' }
  },
  {
    name: 'Traditional Room with Ofuro (Japanese soaking tub, Owner approved 1 Nov, strength 1)',
    input: { roomName: 'Traditional Room with Ofuro' },
    expected: { isProof: true, strength: 1, wordContains: 'Ofuro' }
  },
  {
    name: 'Japanese Suite with Private Onsen (Owner approved 1 Nov, strength 1)',
    input: { roomName: 'Japanese Suite with Private Onsen' },
    expected: { isProof: true, strength: 1, wordContains: 'Private onsen' }
  },
  {
    name: 'Deluxe Room with In-Room Onsen (Owner approved 1 Nov, strength 1)',
    input: { roomName: 'Deluxe Room with In-Room Onsen' },
    expected: { isProof: true, strength: 1, wordContains: 'Private onsen' }
  },
  {
    name: 'Villa with Private Open-Air Bath (Owner approved 1 Nov, strength 1)',
    input: { roomName: 'Villa with Private Open-Air Bath' },
    expected: { isProof: true, strength: 1, mayBeOutdoor: true, wordContains: 'Private open-air bath' }
  },
  {
    name: 'Suite with Open-Air Tub (Owner approved 1 Nov, strength 1)',
    input: { roomName: 'Suite with Open-Air Tub' },
    expected: { isProof: true, strength: 1, mayBeOutdoor: true, wordContains: 'Open-air tub' }
  },
  {
    name: 'Chalet with Hot Tub (Hot tub sets mayBeOutdoor, Owner approved 1 Nov, strength 1)',
    input: { roomName: 'Chalet with Hot Tub' },
    expected: { isProof: true, strength: 1, mayBeOutdoor: true, wordContains: 'Hot tub' }
  },
  {
    name: 'Deluxe Suite with Jetted Tub (strength 1)',
    input: { roomName: 'Deluxe Suite with Jetted Tub' },
    expected: { isProof: true, strength: 1, wordContains: 'Jetted tub' }
  },
  {
    name: 'Villa with Private Pool and Jacuzzi (pool ignored, jacuzzi counts, strength 1)',
    input: { roomName: 'Villa with Private Pool and Jacuzzi' },
    expected: { isProof: true, strength: 1, wordContains: 'Jacuzzi' }
  },
  {
    name: 'Executive King Room with Adapted Tub - Mobility Accessible (counts, Owner approved 1 Nov, strength 1)',
    input: { roomName: 'Executive King Room with Adapted Tub - Mobility Accessible' },
    expected: { isProof: true, strength: 1, wordContains: 'Adapted tub' }
  },
  {
    name: 'Deluxe Queen Room with Accessible Tub (counts, Owner approved 1 Nov, strength 1)',
    input: { roomName: 'Deluxe Queen Room with Accessible Tub' },
    expected: { isProof: true, strength: 1, wordContains: 'Accessible tub' }
  },

  // =========================================================================
  // PROOF CASES: STRENGTH 2 (Standard facility tub labels)
  // =========================================================================
  {
    name: 'Hot tub facility (Hot tub sets mayBeOutdoor, Owner approved 1 Nov, strength 2)',
    input: { facilities: ['Hot tub'] },
    expected: { isProof: true, strength: 2, mayBeOutdoor: true, wordContains: 'Hot tub' }
  },
  {
    name: 'Bathtub facility (strength 2)',
    input: { facilities: ['Bathtub'] },
    expected: { isProof: true, strength: 2, wordContains: 'Bathtub' }
  },
  {
    name: 'Whirlpool bathtub facility (strength 2)',
    input: { facilities: ['Whirlpool bathtub'] },
    expected: { isProof: true, strength: 2, wordContains: 'Whirlpool' }
  },
  {
    name: 'Bath facility (strength 2)',
    input: { facilities: ['Bath'] },
    expected: { isProof: true, strength: 2, wordContains: 'Bath' }
  },
  {
    name: 'Spa bath facility (strength 2)',
    input: { facilities: ['Spa bath'] },
    expected: { isProof: true, strength: 2, wordContains: 'Spa bath' }
  },
  {
    name: 'Adapted Tub facility (counts, Owner approved 1 Nov, strength 2)',
    input: { facilities: ['Adapted tub'] },
    expected: { isProof: true, strength: 2, wordContains: 'Adapted tub' }
  },
  {
    name: 'Accessible Bathtub facility (counts, Owner approved 1 Nov, strength 2)',
    input: { facilities: ['Accessible bathtub'] },
    expected: { isProof: true, strength: 2, wordContains: 'Accessible tub' }
  },
  {
    name: 'Deluxe Room with Bathtub grab bar and Bathtub (standard facility Bathtub wins, strength 2)',
    input: { roomName: 'Deluxe Room', facilities: ['Bathtub grab bar', 'Bathtub'] },
    expected: { isProof: true, strength: 2, wordContains: 'Bathtub' }
  },

  // =========================================================================
  // PROOF CASES: STRENGTH 3 ("Bathtub grab bar" and "Bathtub seat" only)
  // Owner approved 1 Nov 2026 after photo check of roll-in shower rooms
  // =========================================================================
  {
    name: 'Bathtub grab bar facility (counts, Owner approved 1 Nov 2026, strength 3)',
    input: { facilities: ['Bathtub grab bar'] },
    expected: { isProof: true, strength: 3, wordContains: 'Bathtub' }
  },
  {
    name: 'Bathtub seat facility (counts, Owner approved 1 Nov 2026, strength 3)',
    input: { facilities: ['Bathtub seat'] },
    expected: { isProof: true, strength: 3, wordContains: 'Bathtub' }
  },
  {
    name: 'Accessible Bathtub Grab Bar facility (counts, Owner approved 1 Nov 2026, strength 3)',
    input: { facilities: ['Accessible Bathtub Grab Bar'] },
    expected: { isProof: true, strength: 3, wordContains: 'Bathtub' }
  },
  {
    name: 'Adapted Tub Seat facility (counts, Owner approved 1 Nov 2026, strength 3)',
    input: { facilities: ['Adapted Tub Seat'] },
    expected: { isProof: true, strength: 3, wordContains: 'Bathtub' }
  },
  {
    name: 'Roll-in shower room with Bathtub grab bar (counts, Owner approved 1 Nov 2026, strength 3)',
    input: { roomName: 'King Room with Roll-in Shower', facilities: ['Bathtub grab bar'] },
    expected: { isProof: true, strength: 3, wordContains: 'Bathtub' }
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

  if (tc.expected.strength !== undefined) {
    if (actual.strength !== tc.expected.strength) {
      pass = false;
      failureReasons.push(`Expected strength=${tc.expected.strength}, got ${actual.strength}`);
    }
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
    console.log(`       Result: isProof=${actual.isProof}, strength=${actual.strength}, words=[${actual.words.join(', ')}], mayBeOutdoor=${actual.mayBeOutdoor}`);
  } else {
    failedCount++;
    console.error(`[FAIL] Case ${idxStr}: ${tc.name}`);
    failureReasons.forEach(r => console.error(`       -> ${r}`));
    console.error(`       Got: isProof=${actual.isProof}, strength=${actual.strength}, words=[${actual.words.join(', ')}], mayBeOutdoor=${actual.mayBeOutdoor}`);
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
