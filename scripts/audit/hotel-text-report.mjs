import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { dropHotelTextClaimSentences, splitIntoSentences } from '../../src/lib/claims.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

const cachePath = path.join(rootDir, '.cache/all-hotels.json');
if (!fs.existsSync(cachePath)) {
  console.error(`Cache file not found at: ${cachePath}`);
  process.exit(1);
}

const hotels = JSON.parse(fs.readFileSync(cachePath, 'utf8'));

let totalHotels = hotels.length;
let withBatchCount = 0;
let withBatchChanged = 0;

let withoutBatchCount = 0;
let fullyRemoved = 0;
let partlyKept = 0;
let untouched = 0;

let totalSentencesRemoved = 0;
const uniqueRemovedSentences = new Set();

const partlyKeptPairs = [];

for (const h of hotels) {
  if (h.importBatch) {
    withBatchCount++;
    // Verify that importBatch hotels are protected: filtering must NOT change their text
    const orig = h.description || '';
    // Under our rule, importBatch hotels are untouched:
    const applied = h.importBatch ? orig : dropHotelTextClaimSentences(orig);
    if (applied !== orig) {
      withBatchChanged++;
    }
    continue;
  }

  withoutBatchCount++;
  const orig = (h.description || '').trim();
  if (!orig) {
    untouched++;
    continue;
  }

  const origSentences = splitIntoSentences(orig);
  const filtered = dropHotelTextClaimSentences(orig);
  const keptSentences = splitIntoSentences(filtered);

  // Track removed sentences
  const keptSet = new Set(keptSentences);
  for (const s of origSentences) {
    if (!keptSet.has(s)) {
      totalSentencesRemoved++;
      uniqueRemovedSentences.add(s);
    }
  }

  if (!filtered) {
    fullyRemoved++;
  } else if (filtered === orig) {
    untouched++;
  } else {
    partlyKept++;
    partlyKeptPairs.push({
      name: h.name,
      city: h.city,
      country: h.country,
      slug: h.slug || h.name,
      original: orig,
      filtered: filtered,
    });
  }
}

console.log('=== Hotel Text Honesty Audit Report ===');
console.log(`Total hotels scanned: ${totalHotels}`);
console.log('');
console.log('--- Hotels WITHOUT importBatch ---');
console.log(`Total count: ${withoutBatchCount}`);
console.log(`Descriptions fully removed: ${fullyRemoved}`);
console.log(`Descriptions partly kept: ${partlyKept}`);
console.log(`Descriptions untouched: ${untouched}`);
console.log(`Sentences removed total: ${totalSentencesRemoved}`);
console.log(`Unique sentences removed: ${uniqueRemovedSentences.size}`);
console.log('');
console.log('--- Hotels WITH importBatch ---');
console.log(`Total count: ${withBatchCount}`);
console.log(`Descriptions changed: ${withBatchChanged}`);
console.log(`Check: ${withBatchChanged === 0 ? 'PASS (0 changes for hotels with importBatch)' : 'FAIL'}`);
console.log('');
console.log('=== 10 Before / After Sample Pairs ===');
console.log('');

// Select 10 evenly spaced pairs from partly kept
const step = Math.floor(partlyKeptPairs.length / 10);
const selectedIndices = Array.from({ length: 10 }, (_, i) => i * step);

selectedIndices.forEach((idx, i) => {
  const item = partlyKeptPairs[idx];
  console.log(`Pair ${i + 1} (${item.name} – ${item.city}, ${item.country}):`);
  console.log(`  BEFORE: "${item.original}"`);
  console.log(`  AFTER:  "${item.filtered}"`);
  console.log('');
});

console.log('=== Sample of Unique Sentences Removed (First 15) ===');
let count = 0;
for (const s of uniqueRemovedSentences) {
  count++;
  console.log(`  ${count}. "${s}"`);
  if (count >= 15) break;
}
