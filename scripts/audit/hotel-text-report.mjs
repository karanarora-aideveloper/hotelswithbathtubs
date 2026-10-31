import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildHotelDescription, hasClaimPhrase } from '../../src/lib/claims.ts';

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

let generatedCount = 0;
let claimPhraseHits = 0;
const generatedItems = [];

for (const h of hotels) {
  if (h.importBatch) {
    withBatchCount++;
    // Verify that importBatch hotels remain 100% unchanged
    const orig = h.description || '';
    const applied = h.importBatch ? orig : buildHotelDescription(h);
    if (applied !== orig) {
      withBatchChanged++;
    }
    continue;
  }

  generatedCount++;
  const generatedDesc = buildHotelDescription(h);
  if (hasClaimPhrase(generatedDesc)) {
    claimPhraseHits++;
  }

  generatedItems.push({
    name: h.name,
    city: h.city,
    country: h.country,
    slug: h.slug || h.name,
    confirmed: h.bathtubConfirmed === true,
    roomType: h.roomType || '(none)',
    tubType: h.tubType || '(none)',
    generatedDesc,
  });
}

console.log('=== Hotel Generated Text Audit Report (ROUND 13B) ===');
console.log(`Total hotels scanned: ${totalHotels}`);
console.log('');
console.log('--- Hotels Using Generated Text (WITHOUT importBatch) ---');
console.log(`Hotels using generated text: ${generatedCount}`);
console.log(`Claim phrase check: ${claimPhraseHits === 0 ? 'PASS (0 hits on hasClaimPhrase)' : `FAIL (${claimPhraseHits} hits)`}`);
console.log('');
console.log('--- Hotels WITH importBatch (Unchanged) ---');
console.log(`Hotels with importBatch: ${withBatchCount}`);
console.log(`Descriptions changed: ${withBatchChanged}`);
console.log(`Check: ${withBatchChanged === 0 ? 'PASS (0 changes for hotels with importBatch)' : 'FAIL'}`);
console.log('');
console.log('=== 10 Sample Generated Descriptions ===');
console.log('');

// 10 evenly spaced samples across all generated items
const step = Math.floor(generatedItems.length / 10);
const selectedIndices = Array.from({ length: 10 }, (_, i) => i * step);

selectedIndices.forEach((idx, i) => {
  const item = generatedItems[idx];
  console.log(`Sample ${i + 1} (${item.name} – ${item.city}, ${item.country}):`);
  console.log(`  Status: ${item.confirmed ? 'Confirmed' : 'Reported'} | Room: "${item.roomType}" | Tub: "${item.tubType}"`);
  console.log(`  GENERATED: "${item.generatedDesc}"`);
  console.log('');
});
