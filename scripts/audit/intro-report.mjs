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

console.log('=== Kept Intro Sentences Containing Tub Word Stems (DoD 2) ===');
const tubStemRegex = /\b(bathtubs?|tubs?|jacuzzis?|whirlpools?|hot[- ]tubs?|soak(?:s|ing|ed)?)\b/i;
const violations = [];
for (const p of pairs) {
  if (p.filtered) {
    const keptSentences = splitIntoSentences(p.filtered);
    for (const s of keptSentences) {
      if (tubStemRegex.test(s)) {
        violations.push({ slug: p.slug, sentence: s });
      }
    }
  }
}
if (violations.length === 0) {
  console.log('None. (0 kept sentences contain tub word stems)');
} else {
  console.log(`Found ${violations.length} violations:`);
  for (const v of violations) {
    console.log(`  - [${v.slug}]: "${v.sentence}"`);
  }
}

console.log('');
console.log('=== After-Text for Requested Cities (DoD 3) ===');
const dod3Cities = ['zermatt', 'sydney', 'pune', 'kota', 'valparai'];
for (const target of dod3Cities) {
  const found = pairs.find((p) => p.slug.toLowerCase().includes(target));
  if (found) {
    console.log(`City: ${found.slug}`);
    console.log(`  BEFORE:     "${found.original}"`);
    console.log(`  AFTER-TEXT: ${found.filtered ? `"${found.filtered}"` : '[REMOVED COMPLETELY]'}`);
    console.log('');
  } else {
    console.log(`City ${target}: NOT FOUND`);
  }
}
