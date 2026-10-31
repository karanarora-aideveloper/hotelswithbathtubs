import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { dropIntroClaimSentences, splitIntoSentences } from '../../src/lib/claims.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

const seoPath = path.join(rootDir, 'src/lib/seo.ts');
const seoContent = fs.readFileSync(seoPath, 'utf8');

// Match each intro handling escaped quotes (\' or \") inside string literals
const regex = /['"]([^'"]+)['"]:\s*\{\s*intro:\s*(?:'((?:\\.|[^'\\])*)'|"((?:\\.|[^"\\])*)"|`((?:\\.|[^`\\])*)`)/g;
const matches = [...seoContent.matchAll(regex)];

let introsTotal = 0;
let introsFullyRemoved = 0;
let introsPartlyKept = 0;
let introsFullyKept = 0;
let sentencesRemovedTotal = 0;

const pairs = [];

for (const m of matches) {
  const slug = m[1];
  const rawText = m[2] !== undefined ? m[2] : (m[3] !== undefined ? m[3] : m[4]);
  const original = rawText
    .replace(/\\'/g, "'")
    .replace(/\\"/g, '"')
    .replace(/\\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  introsTotal++;

  const origSentences = splitIntoSentences(original);
  const filtered = dropIntroClaimSentences(original);
  const keptSentences = splitIntoSentences(filtered);

  const removedCount = origSentences.length - keptSentences.length;
  sentencesRemovedTotal += removedCount;

  if (keptSentences.length === 0) {
    introsFullyRemoved++;
  } else if (keptSentences.length < origSentences.length) {
    introsPartlyKept++;
  } else {
    introsFullyKept++;
  }

  pairs.push({ slug, original, filtered });
}

console.log('=== Hand-Written City Intros Honesty Report ===');
console.log(`Intros Total: ${introsTotal}`);
console.log(`Intros Fully Removed: ${introsFullyRemoved}`);
console.log(`Intros Partly Kept: ${introsPartlyKept}`);
console.log(`Intros Fully Kept: ${introsFullyKept}`);
console.log(`Sentences Removed: ${sentencesRemovedTotal}`);
console.log('');
console.log('=== 10 Before / After Sample Pairs ===');
console.log('');

// 10 evenly spaced samples across the dataset
const sampleIndices = [0, 36, 72, 108, 144, 180, 216, 252, 288, 324];

sampleIndices.forEach((idx, i) => {
  const item = pairs[idx];
  console.log(`Pair ${i + 1} (${item.slug}):`);
  console.log(`  BEFORE: "${item.original}"`);
  console.log(`  AFTER:  ${item.filtered ? `"${item.filtered}"` : '[REMOVED COMPLETELY]'}`);
  console.log('');
});
