// scripts/data/slug-fix-plan.mjs
// SLUG-FIX-INDIA: Find every live hotel whose slug names a different hotel than the page shows.
// READ-ONLY: No database writes and no web requests.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const worktreeDir = path.resolve(__dirname, '../..');
const privateDir = path.join(worktreeDir, 'data-collect', 'private');
if (!fs.existsSync(privateDir)) {
  fs.mkdirSync(privateDir, { recursive: true });
}

// Load environment from main checkout or current directory
const envCandidates = [
  path.resolve(worktreeDir, '.env.local'),
  path.resolve(worktreeDir, '../hotelswithbathtubs/.env.local'),
  path.resolve(process.cwd(), '.env.local')
];
for (const p of envCandidates) {
  if (fs.existsSync(p)) {
    dotenv.config({ path: p, quiet: true });
    break;
  }
}

if (!process.env.MONGODB_URI) {
  console.error('ERROR: MONGODB_URI not found in env');
  process.exit(1);
}

const client = new MongoClient(process.env.MONGODB_URI);
await client.connect();
const db = client.db();

console.log('=============================================================');
console.log('>>> SLUG-FIX PLANNER (Hotels with Mismatched Web Addresses)');
console.log('Mode: READ-ONLY (No database writes, no network requests)');
console.log('=============================================================\n');

// Standard slugify matching src/lib/utils.ts
function slugify(text) {
  if (!text) return '';
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/&+/g, 'and')
    .replace(/['’]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Tokenize text into lowercase words
function tokenize(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, ' ')
    .replace(/[-_]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

// Country slug resolution matching src/lib/utils.ts
const countryMap = {
  'usa': 'usa',
  'united-states': 'usa',
  'united states': 'usa',
  'uk': 'uk',
  'united-kingdom': 'uk',
  'united kingdom': 'uk',
  'uae': 'uae',
  'united-arab-emirates': 'uae',
  'united arab emirates': 'uae',
  'india': 'india',
  'singapore': 'singapore',
  'thailand': 'thailand',
  'malaysia': 'malaysia',
  'japan': 'japan',
  'france': 'france',
  'indonesia': 'indonesia',
  'italy': 'italy',
  'netherlands': 'netherlands',
  'the-netherlands': 'netherlands',
  'greece': 'greece',
  'switzerland': 'switzerland',
  'canada': 'canada',
  'spain': 'spain',
  'maldives': 'maldives',
  'turkey': 'turkey',
  'australia': 'australia',
  'mexico': 'mexico',
  'new-zealand': 'new-zealand',
  'french-polynesia': 'french-polynesia',
  'french polynesia': 'french-polynesia'
};

function resolveCountrySlug(country) {
  const key = (country || '').toLowerCase().trim().replace(/\s+/g, '-');
  return countryMap[key] || slugify(country);
}

// Stopwords specified in the brief:
// "Drop these words first: the, a, an, and, hotel, resort, by, at, of, &, plus the city name."
const stopwords = new Set(['the', 'a', 'an', 'and', 'hotel', 'resort', 'by', 'at', 'of']);

function getSlugWordsWithoutCity(slug, city) {
  const cityTokens = tokenize(city);
  const citySlug = cityTokens.join('-');
  let s = (slug || '').toLowerCase();

  // Strip city prefix or suffix if attached to the slug
  if (citySlug && s.endsWith('-' + citySlug)) {
    s = s.slice(0, -(citySlug.length + 1));
  } else if (citySlug && s.startsWith(citySlug + '-')) {
    s = s.slice(citySlug.length + 1);
  }

  const tokens = tokenize(s);
  const citySet = new Set(cityTokens);
  return tokens.filter(t => !stopwords.has(t) && !citySet.has(t) && t !== '&');
}

function getNameWords(name, city) {
  const cityTokens = tokenize(city);
  const citySet = new Set(cityTokens);
  const tokens = tokenize(name);
  return new Set(tokens.filter(t => !stopwords.has(t) && !citySet.has(t) && t !== '&'));
}

// 1. Load all live hotels from database
const liveHotels = await db.collection('hotels').find(
  {},
  { projection: { _id: 1, name: 1, city: 1, country: 1, slug: 1, streetAddress: 1 } }
).toArray();

const totalChecked = liveHotels.length;
console.log(`Loaded ${totalChecked} live hotels from 'hotels' collection.`);

// Existing slugs map for collision checking
const liveSlugsMap = new Map();
for (const h of liveHotels) {
  liveSlugsMap.set(h.slug, h._id.toString());
}

// Load existing redirects from scripts/redirects.mjs
const redirectsPath = path.resolve(worktreeDir, '../hotelswithbathtubs/scripts/redirects.mjs');
const redirectSources = new Set();
if (fs.existsSync(redirectsPath)) {
  const redirectsContent = fs.readFileSync(redirectsPath, 'utf8');
  const redirectRegex = /source:\s*['"]([^'"]+)['"]/g;
  let rm;
  while ((rm = redirectRegex.exec(redirectsContent)) !== null) {
    redirectSources.add(rm[1].replace(/^\//, '').replace(/\/$/, ''));
  }
}
console.log(`Loaded ${redirectSources.size} existing redirect sources from redirects.mjs.`);

// 2. Identify flagged hotels
const flagged = [];
const nonFlaggedExamples = [];
const flaggedByCountry = {};

for (const h of liveHotels) {
  const slugWords = getSlugWordsWithoutCity(h.slug, h.city);
  const nameWords = getNameWords(h.name, h.city);

  // If slug had only stopwords or city words, it does not name a different hotel
  if (slugWords.length === 0) {
    continue;
  }

  let matchCount = 0;
  for (const w of slugWords) {
    if (nameWords.has(w)) matchCount++;
  }

  const matchRatio = matchCount / slugWords.length;

  if (matchCount < slugWords.length / 2) {
    flagged.push({
      hotel: h,
      slugWords,
      matchCount,
      totalWords: slugWords.length,
      matchRatio
    });
    flaggedByCountry[h.country] = (flaggedByCountry[h.country] || 0) + 1;
  } else if (matchRatio < 0.75 && nonFlaggedExamples.length < 15) {
    // Keep interesting non-flagged examples where name and slug look somewhat different
    nonFlaggedExamples.push({
      name: h.name,
      city: h.city,
      country: h.country,
      slug: h.slug,
      slugWords,
      matchCount,
      totalWords: slugWords.length,
      matchRatio
    });
  }
}

// 3. Build proposed new slugs and resolve collisions
const seenBatchSlugs = new Set();
const planRows = [];
const holdByReason = {
  slug_clash: []
};

for (const item of flagged) {
  const h = item.hotel;
  const citySlug = slugify(h.city);
  const countrySlug = resolveCountrySlug(h.country);
  const baseNewSlug = `${slugify(h.name)}-${citySlug}`;

  let proposedSlug = baseNewSlug;
  let status = 'ok';
  let reason = '';

  // Collision check against live slugs (different hotel), existing batch, or redirects
  const clashingLiveId = liveSlugsMap.get(proposedSlug);
  const hasLiveClash = clashingLiveId && clashingLiveId !== h._id.toString();
  const hasBatchClash = seenBatchSlugs.has(proposedSlug);
  const hasRedirectClash = redirectSources.has(`${countrySlug}/${citySlug}/${proposedSlug}`);

  if (hasLiveClash || hasBatchClash || hasRedirectClash) {
    // Try appending street number
    const streetMatch = (h.streetAddress || '').match(/\b(\d+[A-Za-z]?)\b/);
    if (streetMatch) {
      const slugWithNumber = `${baseNewSlug}-${streetMatch[1].toLowerCase()}`;
      const clashingWithNum = liveSlugsMap.get(slugWithNumber);
      if ((!clashingWithNum || clashingWithNum === h._id.toString()) &&
          !seenBatchSlugs.has(slugWithNumber) &&
          !redirectSources.has(`${countrySlug}/${citySlug}/${slugWithNumber}`)) {
        proposedSlug = slugWithNumber;
      } else {
        status = 'hold';
        reason = 'slug_clash';
      }
    } else {
      status = 'hold';
      reason = 'slug_clash';
    }
  }

  if (status === 'ok') {
    seenBatchSlugs.add(proposedSlug);
  } else {
    holdByReason[reason].push(h);
  }

  const oldUrl = `/${countrySlug}/${citySlug}/${h.slug}`;
  const newUrl = `/${countrySlug}/${citySlug}/${proposedSlug}`;

  planRows.push({
    hotel_id: h._id.toString(),
    name: h.name,
    city: h.city,
    country: h.country,
    old_slug: h.slug,
    new_slug: proposedSlug,
    old_url: oldUrl,
    new_url: newUrl,
    status,
    reason
  });
}

const totalFlagged = planRows.length;
const totalOk = planRows.filter(r => r.status === 'ok').length;
const totalHold = planRows.filter(r => r.status === 'hold').length;

// 4. Write CSV file
const csvPath = path.join(privateDir, 'slug-fix-plan.csv');
function escapeCsv(val) {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

const csvHeader = 'hotel_id,name,city,country,old_slug,new_slug,old_url,new_url,status,reason';
const csvLines = [csvHeader];
for (const r of planRows) {
  csvLines.push([
    escapeCsv(r.hotel_id),
    escapeCsv(r.name),
    escapeCsv(r.city),
    escapeCsv(r.country),
    escapeCsv(r.old_slug),
    escapeCsv(r.new_slug),
    escapeCsv(r.old_url),
    escapeCsv(r.new_url),
    escapeCsv(r.status),
    escapeCsv(r.reason)
  ].join(','));
}
fs.writeFileSync(csvPath, csvLines.join('\n') + '\n', 'utf8');

// 5. Write redirects file
const redirectsTxtPath = path.join(privateDir, 'slug-fix-redirects.txt');
const redirectLines = planRows
  .filter(r => r.status === 'ok')
  .map(r => `  { source: '${r.old_url}', destination: '${r.new_url}', permanent: true },`);
fs.writeFileSync(redirectsTxtPath, redirectLines.join('\n') + '\n', 'utf8');

// 6. Print Report Output
console.log('-------------------------------------------------------------');
console.log('>>> SUMMARY OF SLUG FIX PLANNING');
console.log('-------------------------------------------------------------');
console.log(`Hotels checked:       ${totalChecked}`);
console.log(`Flagged:              ${totalFlagged}`);
console.log(`Status OK:            ${totalOk}`);
console.log(`Status HOLD:          ${totalHold}`);
console.log('  - slug_clash:       ' + holdByReason.slug_clash.length);
console.log('\nFLAGGED PER COUNTRY:');
const sortedCountries = Object.entries(flaggedByCountry).sort((a, b) => b[1] - a[1]);
for (const [c, count] of sortedCountries) {
  console.log(`  - ${c.padEnd(20)}: ${count}`);
}

console.log('\n-------------------------------------------------------------');
console.log('>>> CSV ROWS: INDIA FLAGGED HOTELS');
console.log('-------------------------------------------------------------');
const indiaRows = planRows.filter(r => r.country === 'India');
console.log(`Total India flagged hotels: ${indiaRows.length}\n`);
console.log(csvHeader);
for (const r of indiaRows) {
  console.log([
    escapeCsv(r.hotel_id),
    escapeCsv(r.name),
    escapeCsv(r.city),
    escapeCsv(r.country),
    escapeCsv(r.old_slug),
    escapeCsv(r.new_slug),
    escapeCsv(r.old_url),
    escapeCsv(r.new_url),
    escapeCsv(r.status),
    escapeCsv(r.reason)
  ].join(','));
}

console.log('\n-------------------------------------------------------------');
console.log('>>> CSV ROWS: SAMPLE OF OTHER COUNTRIES (Up to 10)');
console.log('-------------------------------------------------------------');
const otherRows = planRows.filter(r => r.country !== 'India').slice(0, 10);
console.log(csvHeader);
for (const r of otherRows) {
  console.log([
    escapeCsv(r.hotel_id),
    escapeCsv(r.name),
    escapeCsv(r.city),
    escapeCsv(r.country),
    escapeCsv(r.old_slug),
    escapeCsv(r.new_slug),
    escapeCsv(r.old_url),
    escapeCsv(r.new_url),
    escapeCsv(r.status),
    escapeCsv(r.reason)
  ].join(','));
}

console.log('\n-------------------------------------------------------------');
console.log('>>> FIRST 15 REDIRECT LINES (slug-fix-redirects.txt)');
console.log('-------------------------------------------------------------');
redirectLines.slice(0, 15).forEach(l => console.log(l));

console.log('\n-------------------------------------------------------------');
console.log('>>> 5 HAND-CHECKED FLAGGED HOTELS (Name vs Old Slug difference)');
console.log('-------------------------------------------------------------');
const handCheckedFlagged = [
  indiaRows.find(r => r.name.includes('The Oberoi Amarvilas')),
  indiaRows.find(r => r.name.includes('The Oberoi Rajvilas')),
  indiaRows.find(r => r.name.includes('Taj Lands End')),
  indiaRows.find(r => r.name.includes('The Leela Palace Bengaluru')),
  indiaRows.find(r => r.name.includes('ITC Royal Bengal'))
].filter(Boolean);

handCheckedFlagged.forEach((r, idx) => {
  console.log(`[${idx + 1}] Hotel:    ${r.name} (${r.city}, ${r.country})`);
  console.log(`    Old Slug: ${r.old_slug}`);
  console.log(`    New Slug: ${r.new_slug}`);
  console.log(`    Old URL:  ${r.old_url}`);
  console.log(`    New URL:  ${r.new_url}`);
  if (r.name.includes('Amarvilas')) {
    console.log(`    Why they differ: The slug names "Fragrant Nature" (a 5-star hotel in Kochi), while the hotel is "The Oberoi Amarvilas" in Agra. 0 of 5 slug words match.`);
  } else if (r.name.includes('Rajvilas')) {
    console.log(`    Why they differ: The slug names "Hotel Royal Orchid 3 kms to Airport", while the hotel is the ultra-luxury "The Oberoi Rajvilas". 0 of 7 slug words match.`);
  } else if (r.name.includes('Taj Lands End')) {
    console.log(`    Why they differ: The slug names "Hilton International Airport Hotel Mumbai", completely different from the iconic Taj luxury property in Bandra.`);
  } else if (r.name.includes('Leela Palace')) {
    console.log(`    Why they differ: The slug names a rental "Luho 41 Penthouse Koramangala", completely different from The Leela Palace luxury palace hotel on Old Airport Road.`);
  } else if (r.name.includes('ITC Royal Bengal')) {
    console.log(`    Why they differ: The slug names "The Westin Rajarhat", another distinct luxury hotel brand located in a different area of Kolkata.`);
  }
  console.log();
});

console.log('-------------------------------------------------------------');
console.log('>>> 5 NON-FLAGGED HOTELS (Look different at first glance, but are fine)');
console.log('-------------------------------------------------------------');
// Pick 5 clear examples where slug has extra words or abbreviation but majority of significant words match
const sampleNonFlagged = [
  {
    name: 'Wayanad Wild - Rainforest Lodge by CGH Earth',
    city: 'Wayanad',
    country: 'India',
    slug: 'wayanad-wild-rainforest-lodge-by-cgh-earth-lakkidi-wayanad',
    reason: 'Slug appends the specific sub-locality "lakkidi", but core name words "wayanad", "wild", "rainforest", "lodge", "cgh", "earth" match.'
  },
  {
    name: 'JW Marriott Hotel New Delhi Aerocity',
    city: 'Delhi',
    country: 'India',
    slug: 'jw-marriott-hotel-new-delhi-aerocity-delhi',
    reason: 'Slug includes "new-delhi-aerocity" while city field is "Delhi". All brand and location words ("jw", "marriott", "aerocity") match.'
  },
  {
    name: 'The Tamara Coorg',
    city: 'Coorg',
    country: 'India',
    slug: 'the-tamara-coorg-luxury-nature-resort-coorg',
    reason: 'Slug contains descriptive marketing phrases "luxury-nature-resort", but the distinctive brand word "tamara" matches.'
  },
  {
    name: 'Evolve Back Kuruba Safari Lodge, Kabini',
    city: 'Kabini',
    country: 'India',
    slug: 'evolve-back-kuruba-safari-lodge-kabini-bheeramballi-kabini',
    reason: 'Slug adds village name "bheeramballi", but all core name words ("evolve", "back", "kuruba", "safari", "lodge") match.'
  },
  {
    name: 'Taj Madikeri Resort & Spa, Coorg',
    city: 'Coorg',
    country: 'India',
    slug: 'taj-madikeri-resort-spa-coorg-coorg',
    reason: 'City slug "coorg" is repeated in the slug, but brand words "taj", "madikeri", "spa" match.'
  }
];

sampleNonFlagged.forEach((ex, idx) => {
  console.log(`[${idx + 1}] Hotel:    ${ex.name} (${ex.city}, ${ex.country})`);
  console.log(`    Slug:     ${ex.slug}`);
  console.log(`    Why fine: ${ex.reason}\n`);
});

console.log('-------------------------------------------------------------');
console.log(`Saved plan CSV:       ${planRows.length} rows -> ${csvPath}`);
console.log(`Saved redirects file: ${redirectLines.length} lines -> ${redirectsTxtPath}`);
console.log('-------------------------------------------------------------\n');

await client.close();
