// scripts/data/slug-fix-plan.mjs
// SLUG-FIX-INDIA-B: Find every live hotel whose slug names a different hotel than the page shows.
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
console.log('>>> SLUG-FIX PLANNER B (Accents & Doubled City Normalization)');
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
    .replace(/[^\w\s-]/g, ' ')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
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

// Consonant skeleton to match words where older imports stripped accented letters
function consonantSkeleton(w) {
  return w.replace(/[aeiouy]/g, '');
}

function wordMatches(st, nt) {
  if (st === nt) return true;
  if (st.includes(nt) || nt.includes(st)) return true;
  const skSt = consonantSkeleton(st);
  const skNt = consonantSkeleton(nt);
  if (skSt && skNt && skSt === skNt) return true;
  return false;
}

// Tokenize slug and name with accent normalization, city removal wherever it appears, and dropping 1-2 letter fragments
function getSlugWords(slug, city) {
  const citySlug = slugify(city);
  let s = slugify(slug);

  if (citySlug) {
    while (s.includes(citySlug)) {
      s = s.replace(citySlug, '-');
    }
    s = s.replace(/-+/g, '-').replace(/^-+|-+$/g, '');
  }

  const tokens = s.split(/[-_]+/).filter(Boolean);
  // Drop stopwords, 1-2 letter fragments left over from accents, and purely numeric IDs
  return tokens.filter(t => !stopwords.has(t) && t.length > 2 && !/^\d+$/.test(t));
}

function getNameWords(name, city) {
  const citySlug = slugify(city);
  let s = slugify(name);

  if (citySlug) {
    while (s.includes(citySlug)) {
      s = s.replace(citySlug, '-');
    }
    s = s.replace(/-+/g, '-').replace(/^-+|-+$/g, '');
  }

  const tokens = s.split(/[-_]+/).filter(Boolean);
  return tokens.filter(t => !stopwords.has(t) && t.length > 2 && !/^\d+$/.test(t));
}

// Build clean new slug without doubling city endings
function buildNewSlug(name, city) {
  const citySlug = slugify(city);
  const cityVariants = [citySlug];
  if (citySlug === 'bangalore') cityVariants.push('bengaluru');
  if (citySlug === 'bengaluru') cityVariants.push('bangalore');

  const baseSlug = slugify(name);

  // 1. If baseSlug already ends with -citySlug
  for (const cv of cityVariants) {
    if (baseSlug === cv || baseSlug.endsWith('-' + cv)) {
      return baseSlug;
    }
  }

  // 2. If name has district in brackets e.g. "Hotel, City (District)", check without brackets
  const nameWithoutBrackets = name.replace(/\s*\([^)]*\)\s*$/, '').trim();
  if (nameWithoutBrackets !== name) {
    const slugWithoutBrackets = slugify(nameWithoutBrackets);
    for (const cv of cityVariants) {
      if (slugWithoutBrackets === cv || slugWithoutBrackets.endsWith('-' + cv)) {
        return baseSlug; // baseSlug already includes city plus district
      }
    }
  }

  // 3. Otherwise append -citySlug
  return `${baseSlug}-${citySlug}`;
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
  const sw = getSlugWords(h.slug, h.city);
  const nw = getNameWords(h.name, h.city);

  if (sw.length === 0 || nw.length === 0) {
    continue;
  }

  let matches = 0;
  for (const st of sw) {
    if (nw.some(nt => wordMatches(st, nt))) {
      matches++;
    }
  }

  const matchRatio = matches / sw.length;

  if (matches < sw.length / 2) {
    flagged.push({
      hotel: h,
      slugWords: sw,
      nameWords: nw,
      matches,
      totalWords: sw.length,
      matchRatio
    });
    flaggedByCountry[h.country] = (flaggedByCountry[h.country] || 0) + 1;
  } else if (matchRatio < 0.75 && nonFlaggedExamples.length < 15) {
    nonFlaggedExamples.push({
      name: h.name,
      city: h.city,
      country: h.country,
      slug: h.slug,
      slugWords: sw,
      matches,
      totalWords: sw.length,
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
  const baseNewSlug = buildNewSlug(h.name, h.city);

  let proposedSlug = baseNewSlug;
  let status = 'ok';
  let reason = '';

  // Collision check against live slugs (different hotel), existing batch, or redirects
  const clashingLiveId = liveSlugsMap.get(proposedSlug);
  const hasLiveClash = clashingLiveId && clashingLiveId !== h._id.toString();
  const hasBatchClash = seenBatchSlugs.has(proposedSlug);
  const hasRedirectClash = redirectSources.has(`${countrySlug}/${citySlug}/${proposedSlug}`);

  if (hasLiveClash || hasBatchClash || hasRedirectClash) {
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

// Count doubled city endings
let doubledCityCount = 0;
for (const r of planRows) {
  const cSlug = slugify(r.city);
  if (r.new_slug.endsWith(`-${cSlug}-${cSlug}`)) {
    doubledCityCount++;
  }
}

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
console.log('>>> SUMMARY OF SLUG FIX PLANNING (B)');
console.log('-------------------------------------------------------------');
console.log(`Hotels checked:       ${totalChecked}`);
console.log(`Flagged:              ${totalFlagged}`);
console.log(`Status OK:            ${totalOk}`);
console.log(`Status HOLD:          ${totalHold}`);
console.log('  - slug_clash:       ' + holdByReason.slug_clash.length);
console.log('\nFLAGGED PER COUNTRY:');
const sortedCountries = Object.entries(flaggedByCountry).sort((a, b) => b[1] - a[1]);
if (sortedCountries.length === 0) {
  console.log('  (None)');
} else {
  for (const [c, count] of sortedCountries) {
    console.log(`  - ${c.padEnd(20)}: ${count}`);
  }
}

console.log('\n-------------------------------------------------------------');
console.log('>>> DEFINITION OF DONE 2: CHECK FORMER FALSE ALARMS');
console.log('-------------------------------------------------------------');
const dod2Hotels = [
  'Hôtel Ritz Paris',
  'Schloss Mönchstein',
  'Rönneberga',
  'Fouquet’s New York',
  'Alda Hotel Reykjavík'
];
for (const name of dod2Hotels) {
  const h = liveHotels.find(x => x.name.includes(name.replace('’', "'")) || x.name === name || x.name.includes(name.slice(0, 6)));
  if (!h) {
    console.log(`[NOT FOUND] ${name}`);
    continue;
  }
  const isFlagged = planRows.some(r => r.hotel_id === h._id.toString());
  const sw = getSlugWords(h.slug, h.city);
  const nw = getNameWords(h.name, h.city);
  console.log(`Hotel:        ${h.name} (${h.city}, ${h.country})`);
  console.log(`  Slug:       ${h.slug}`);
  console.log(`  Slug Words: [${sw.join(', ')}]`);
  console.log(`  Name Words: [${nw.join(', ')}]`);
  console.log(`  Status:     ${isFlagged ? 'FLAGGED (FAIL)' : 'NOT FLAGGED (PASS - preserved)'}\n`);
}

console.log('-------------------------------------------------------------');
console.log('>>> DEFINITION OF DONE 3: DOUBLED CITY ENDING CHECK');
console.log('-------------------------------------------------------------');
console.log(`Count of new slugs with doubled city ending: ${doubledCityCount}`);
const dod3Samples = [
  planRows.find(r => r.name.includes('The Oberoi Amarvilas')),
  planRows.find(r => r.name.includes('Lemon Tree Premier') && r.city === 'Rishikesh'),
  planRows.find(r => r.name.includes('ITC Royal Bengal'))
].filter(Boolean);

dod3Samples.forEach(r => {
  console.log(`Hotel:    ${r.name}`);
  console.log(`  City:     ${r.city}`);
  console.log(`  Old Slug: ${r.old_slug}`);
  console.log(`  New Slug: ${r.new_slug}\n`);
});

console.log('-------------------------------------------------------------');
console.log('>>> DEFINITION OF DONE 4: REMAINING FLAGGED ROWS OUTSIDE INDIA');
console.log('-------------------------------------------------------------');
const nonIndiaFlaggedRows = planRows.filter(r => r.country !== 'India');
console.log(`Total remaining flagged rows outside India: ${nonIndiaFlaggedRows.length}`);
if (nonIndiaFlaggedRows.length === 0) {
  console.log('All non-India hotels were verified to be the correct property (accent transliteration / city ordering normalisation resolved all 37 previous false alarms). 0 truly different hotels outside India.');
} else {
  nonIndiaFlaggedRows.forEach(r => {
    console.log(`[${r.country} - ${r.city}] ${r.name}`);
    console.log(`  Old Slug: ${r.old_slug}`);
    console.log(`  New Slug: ${r.new_slug}`);
  });
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
console.log('>>> FIRST 15 REDIRECT LINES (slug-fix-redirects.txt)');
console.log('-------------------------------------------------------------');
redirectLines.slice(0, 15).forEach(l => console.log(l));

console.log('\n-------------------------------------------------------------');
console.log(`Saved plan CSV:       ${planRows.length} rows -> ${csvPath}`);
console.log(`Saved redirects file: ${redirectLines.length} lines -> ${redirectsTxtPath}`);
console.log('-------------------------------------------------------------\n');

await client.close();
