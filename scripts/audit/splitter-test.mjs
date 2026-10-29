import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { splitIntoSentences, dropClaimSentences } from '../../src/lib/claims.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

const cachePath = path.join(rootDir, '.cache/all-hotels.json');
if (!fs.existsSync(cachePath)) {
  console.error(`Error: ${cachePath} does not exist`);
  process.exit(1);
}

const hotels = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
const descriptions = hotels.map((h) => h.description).filter(Boolean);

let loseCount = 0;
for (const desc of descriptions) {
  const sentences = splitIntoSentences(desc);
  const joined = sentences.join(' ').replace(/\s+/g, ' ').trim();
  const original = desc.replace(/\s+/g, ' ').trim();
  if (joined !== original) {
    loseCount++;
  }
}

console.log(`${loseCount} of ${descriptions.length} lose text`);

// Required specific test cases
const cases = [
  {
    name: 'Taj Rishikesh 12.5-acre',
    input: 'Spectacular 12.5-acre hillside retreat with panoramic Himalayan views.',
    expected: 'Spectacular 12.5-acre hillside retreat with panoramic Himalayan views.',
    fn: (s) => dropClaimSentences(s),
  },
  {
    name: 'Booking.com domain',
    input: 'Always check the cancellation policy on Booking.com before you book.',
    expected: 'Always check the cancellation policy on Booking.com before you book.',
    fn: (s) => dropClaimSentences(s),
  },
  {
    name: 'Iconic palace drop verified',
    input: 'Iconic palace with a private 1.3km beach. Every room verified.',
    expected: 'Iconic palace with a private 1.3km beach.',
    fn: (s) => dropClaimSentences(s),
  },
];

let allCasesPass = true;
for (const tc of cases) {
  const result = tc.fn(tc.input);
  if (result !== tc.expected) {
    console.error(`FAIL: ${tc.name}\n  Expected: "${tc.expected}"\n  Got:      "${result}"`);
    allCasesPass = false;
  } else {
    console.log(`PASS: ${tc.name} -> "${result}"`);
  }
}

if (loseCount > 0 || !allCasesPass) {
  process.exit(1);
}
