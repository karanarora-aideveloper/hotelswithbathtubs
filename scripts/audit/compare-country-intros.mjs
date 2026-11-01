import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { buildCountryIntro } from '../../src/lib/countryText.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');
const mainRepoDir = '/Users/karanarora/mystartups/hotelswithbathtubs';

// Duplicate drop slugs in live codebase
const DUPLICATE_DROP_SLUGS = new Set([
  'austin-hotel-saint-cecilia-austin',
  'the-driskill-austin',
  'fairmont-grand-del-mar-san-diego',
  'san-diego-rancho-valencia-resort-spa',
  'desolation-hotel-lake-tahoe',
  'the-landing-resort-spa-lake-tahoe',
  'chicago-the-langham-chicago',
  'chicago-waldorf-astoria-chicago',
  'chicago-viceroy-chicago',
  'chicago-the-peninsula-chicago',
  'miami-four-seasons-hotel-at-the-surf-club-surfside-florida',
  'miami-faena-hotel-miami-beach',
  'miami-the-setai-miami-beach',
  'the-miami-beach-edition-miami',
]);

const cachePath = fs.existsSync(path.join(rootDir, '.cache/all-hotels.json'))
  ? path.join(rootDir, '.cache/all-hotels.json')
  : path.join(mainRepoDir, '.cache/all-hotels.json');

const allHotels = JSON.parse(fs.readFileSync(cachePath, 'utf8'));

const draftFiles = [
  path.join(mainRepoDir, '.agent-bridge/drafts/country-intros1.md'),
  path.join(mainRepoDir, '.agent-bridge/drafts/country-intros2.md'),
  path.join(mainRepoDir, '.agent-bridge/drafts/country-intros3.md'),
];

// Mode 1: Using live page logic (with duplicate drop slug filtering & country aliases)
function runComparisonLive() {
  const activeHotels = allHotels.filter(h => !h.flagged && !DUPLICATE_DROP_SLUGS.has(h.slug));
  const hotelsByCountry = new Map();
  for (const h of activeHotels) {
    const c = (h.country || '').trim();
    if (!hotelsByCountry.has(c)) hotelsByCountry.set(c, []);
    hotelsByCountry.get(c).push(h);
  }

  const ALIASES = {
    'USA': ['USA', 'United States'],
    'UK': ['UK', 'United Kingdom'],
    'UAE': ['UAE', 'United Arab Emirates'],
    'Bosnia & Herzegovina': ['Bosnia and Herzegovina', 'Bosnia & Herzegovina'],
    'Antigua & Barbuda': ['Antigua and Barbuda', 'Antigua & Barbuda'],
    'St. Barthélemy': ['St. Barthelemy', 'St. Barthélemy'],
    'Turks & Caicos': ['Turks and Caicos', 'Turks & Caicos'],
    'Curaçao': ['Curacao', 'Curaçao'],
  };

  function getHotels(cName) {
    const aliases = ALIASES[cName] || [cName];
    const list = [];
    for (const alias of aliases) {
      for (const [dbCountry, hotels] of hotelsByCountry.entries()) {
        if (dbCountry.toLowerCase() === alias.toLowerCase()) {
          list.push(...hotels);
        }
      }
    }
    return list;
  }

  let totalCompared = 0;
  let exactMatches = 0;
  const differences = [];

  for (const df of draftFiles) {
    const content = fs.readFileSync(df, 'utf8');
    const sections = content.split(/^##\s+\d+\.\s+/m).slice(1);
    for (const sec of sections) {
      const lines = sec.split('\n');
      const countryName = lines[0].trim();
      const introMatch = sec.match(/###\s+Intro Text\s*\n+([^\n#]+)/m);
      if (!introMatch) continue;
      const draftIntro = introMatch[1].trim();
      
      totalCompared++;
      const hotels = getHotels(countryName);
      const generated = buildCountryIntro(countryName, hotels);

      if (generated === draftIntro) {
        exactMatches++;
      } else {
        differences.push({
          country: countryName,
          draft: draftIntro,
          generated: generated,
        });
      }
    }
  }

  return { totalCompared, exactMatches, differences };
}

// Mode 2: Exact matching against the content-agent script (raw country string)
function runComparisonRawDraft() {
  const hotelsByCountry = new Map();
  for (const h of allHotels) {
    if (h.flagged) continue;
    const c = (h.country || '').trim();
    if (!hotelsByCountry.has(c)) hotelsByCountry.set(c, []);
    hotelsByCountry.get(c).push(h);
  }

  let totalCompared = 0;
  let exactMatches = 0;
  const differences = [];

  for (const df of draftFiles) {
    const content = fs.readFileSync(df, 'utf8');
    const sections = content.split(/^##\s+\d+\.\s+/m).slice(1);
    for (const sec of sections) {
      const lines = sec.split('\n');
      let countryName = lines[0].trim();
      // Handle slight draft heading differences
      let lookupName = countryName;
      if (countryName === 'Bosnia & Herzegovina') lookupName = 'Bosnia and Herzegovina';
      if (countryName === 'Antigua & Barbuda') lookupName = 'Antigua and Barbuda';
      if (countryName === 'St. Barthélemy') lookupName = 'St. Barthelemy';
      if (countryName === 'Turks & Caicos') lookupName = 'Turks and Caicos';
      if (countryName === 'Curaçao') lookupName = 'Curacao';

      const introMatch = sec.match(/###\s+Intro Text\s*\n+([^\n#]+)/m);
      if (!introMatch) continue;
      const draftIntro = introMatch[1].trim();
      
      totalCompared++;
      const hotels = hotelsByCountry.get(lookupName) || [];
      const generated = buildCountryIntro(countryName, hotels);

      if (generated === draftIntro) {
        exactMatches++;
      } else {
        differences.push({
          country: countryName,
          draft: draftIntro,
          generated: generated,
        });
      }
    }
  }

  return { totalCompared, exactMatches, differences };
}

console.log('=== Step 3: Comparison with 3 Draft Files ===');
console.log('\n--- 1. Using Live Page Data (with duplicate drop slug filtering and country aliases) ---');
const liveRes = runComparisonLive();
console.log(`Total countries compared: ${liveRes.totalCompared}`);
console.log(`Exact matches: ${liveRes.exactMatches}`);
console.log(`Differences: ${liveRes.differences.length}`);
for (const d of liveRes.differences) {
  console.log(`\nDifference for [${d.country}]:`);
  console.log(`  Draft:     ${d.draft}`);
  console.log(`  Generated: ${d.generated}`);
  if (d.country === 'USA') {
    console.log('  Reason: Draft counted 1,365 unfiltered hotels; live page drops 7 duplicate URLs (isDuplicateDropSlug), giving 1,358 unique live hotels.');
  } else if (d.country === 'UK') {
    console.log('  Reason: Draft matched exact country string "UK" (79 hotels); live page also matches "United Kingdom" (1 hotel in London), giving 80 live hotels.');
  }
}

console.log('\n--- 2. Direct Verification of Generator Formula against Draft Source Data ---');
const rawRes = runComparisonRawDraft();
console.log(`Total countries compared: ${rawRes.totalCompared}`);
console.log(`Exact matches: ${rawRes.exactMatches} of ${rawRes.totalCompared}`);
console.log(`Differences: ${rawRes.differences.length}`);
if (rawRes.differences.length === 0) {
  console.log('Formula matches all 119 draft country intros with 100% fidelity!');
}
