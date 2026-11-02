// scripts/test-tub-words-display.mjs
// Verifies tub terminology mappings per region according to the brief table.

import { tubWord, tubWordsMap } from '../src/lib/tubWords.ts';

const EXPECTED_ROWS = [
  {
    group: 'India, Pakistan, Sri Lanka, Nepal, Bangladesh, Maldives',
    samples: ['IN', 'India', 'PK', 'LK', 'NP', 'BD', 'MV'],
    expected: {
      jetted: 'Jacuzzi',
      bathtub: 'Bathtub',
      hot: 'Hot tub',
      soaking: 'Soaking tub',
    },
  },
  {
    group: 'USA, Canada',
    samples: ['US', 'USA', 'United States', 'CA', 'Canada'],
    expected: {
      jetted: 'Jacuzzi',
      bathtub: 'Bathtub',
      hot: 'Hot tub',
      soaking: 'Soaking tub',
    },
  },
  {
    group: 'UK, Ireland',
    samples: ['GB', 'UK', 'United Kingdom', 'IE', 'Ireland'],
    expected: {
      jetted: 'Jacuzzi',
      bathtub: 'Bath',
      hot: 'Hot tub',
      soaking: 'Soaking bath',
    },
  },
  {
    group: 'Australia, New Zealand',
    samples: ['AU', 'Australia', 'NZ', 'New Zealand'],
    expected: {
      jetted: 'Spa bath',
      bathtub: 'Bath',
      hot: 'Hot tub',
      soaking: 'Soaking tub',
    },
  },
  {
    group: 'Germany, Austria, Switzerland',
    samples: ['DE', 'Germany', 'AT', 'Austria', 'CH', 'Switzerland'],
    expected: {
      jetted: 'Whirlpool',
      bathtub: 'Bathtub',
      hot: 'Hot tub',
      soaking: 'Soaking tub',
    },
  },
  {
    group: 'Every other country (fallback)',
    samples: ['FR', 'France', 'IT', 'Italy', 'JP', 'Japan', 'BR', 'Brazil', '', null, undefined],
    expected: {
      jetted: 'Jacuzzi',
      bathtub: 'Bathtub',
      hot: 'Hot tub',
      soaking: 'Soaking tub',
    },
  },
];

console.log('=== Regional Tub Words Table Test ===\n');

let allPassed = true;
let totalChecks = 0;

for (const row of EXPECTED_ROWS) {
  console.log(`[Group: ${row.group}]`);
  for (const sample of row.samples) {
    const map = tubWordsMap(sample);
    const label = sample === '' ? '(empty string)' : (sample === null ? '(null)' : (sample === undefined ? '(undefined)' : sample));
    let samplePassed = true;

    for (const [type, expectedWord] of Object.entries(row.expected)) {
      totalChecks++;
      const actualWord = tubWord(type, sample);
      if (actualWord !== expectedWord || map[type] !== expectedWord) {
        console.error(`  FAIL for ${label} [${type}]: expected "${expectedWord}", got "${actualWord}"`);
        samplePassed = false;
        allPassed = false;
      }
    }

    if (samplePassed) {
      console.log(`  PASS: ${label} -> jetted: "${map.jetted}", bathtub: "${map.bathtub}", hot: "${map.hot}", soaking: "${map.soaking}"`);
    }
  }
  console.log('');
}

console.log(`Total checks: ${totalChecks}`);
if (allPassed) {
  console.log('ALL REGIONAL TUB WORDS TESTS PASSED (100%)');
  process.exit(0);
} else {
  console.error('SOME TESTS FAILED');
  process.exit(1);
}
