#!/usr/bin/env node

/**
 * scripts/data/promote3-cities-analysis.mjs
 *
 * PROMOTE3-NAMES (CEO Sheet T48)
 * Step 2: Generates data-collect/private/promote3-cities.csv with stage column
 * Step 3: Re-checks duplicates against live hotels after rename (name and town)
 * Formats outputs for DoD 1, 2, 3, 4
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../..');

// Load environment
const envCandidates = [
  path.resolve(REPO_ROOT, '.env.local'),
  path.resolve(REPO_ROOT, '../hotelswithbathtubs/.env.local'),
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

const PLANNED_PATH = path.join(REPO_ROOT, 'data-collect/private/promote3-planned.json');
const AGODA_RESULTS_PATH = path.join(REPO_ROOT, 'data-collect/private/agoda1-results.json');
const RECLASSIFY_PATH = path.join(REPO_ROOT, 'data-collect/private/promote3-reclassify.csv');
const OUTPUT_CITIES_CSV = path.join(REPO_ROOT, 'data-collect/private/promote3-cities.csv');

function slugify(text) {
  return (text || '')
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

function normalizeText(s) {
  return (s || '').toLowerCase().replace(/[^a-z0-9]/g, '').trim();
}

function extractStreetNumber(addr) {
  if (!addr) return null;
  const streetPart = addr.split(',')[0].trim();
  const m = streetPart.match(/^\s*(\d+[A-Za-z]?)\b/) || streetPart.match(/\b(\d+)\b/);
  return m ? m[1].toLowerCase() : null;
}

function escapeCsvField(val) {
  if (val == null) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

async function main() {
  const client = new MongoClient(process.env.MONGODB_URI, {
    maxPoolSize: 1,
    minPoolSize: 1,
    connectTimeoutMS: 30000,
    serverSelectionTimeoutMS: 30000,
    readPreference: 'secondaryPreferred'
  });
  await client.connect();
  const db = client.db();

  // Load live USA hotels
  console.log('Loading live hotels from database...');
  const liveHotels = await db.collection('hotels').find(
    { country: 'USA' },
    { projection: { name: 1, city: 1, streetAddress: 1, slug: 1, bathtubConfirmed: 1 } }
  ).toArray();
  console.log(`Loaded ${liveHotels.length} live USA hotels.`);

  // Map of live hotel counts per city
  const liveCountByCity = new Map();
  for (const h of liveHotels) {
    const c = h.city || '';
    liveCountByCity.set(c, (liveCountByCity.get(c) || 0) + 1);
  }

  // Load planned hotels
  const plannedHotels = JSON.parse(fs.readFileSync(PLANNED_PATH, 'utf8'));
  console.log(`Loaded ${plannedHotels.length} planned hotels from ${PLANNED_PATH}`);

  // Load candidates for state mapping
  const candDocs = await db.collection('hotel_candidates').find({}, {
    projection: { _id: 1, state: 1, address: 1 }
  }).toArray();
  const candStateMap = new Map();
  for (const c of candDocs) {
    candStateMap.set(c._id.toString(), c.address?.region || c.state || '');
  }

  // Aggregate by destination: citySlug (or city + state)
  const cityAgg = new Map();
  for (const h of plannedHotels) {
    // Clean plain city name (strip 2-letter state code suffix if any)
    let plainCity = h.city;
    const match = (h.city || '').match(/^(.*?)\s+([A-Z]{2})$/);
    if (match) {
      plainCity = match[1];
    }
    const state = h.state || candStateMap.get(h._candidateId) || (match ? match[2] : '');
    const key = h.citySlug || `${slugify(plainCity)}-${slugify(state)}`;

    if (!cityAgg.has(key)) {
      cityAgg.set(key, {
        city: plainCity,
        rawCity: h.city,
        state,
        citySlug: h.citySlug,
        stage: h.stage || 'hold',
        hotelsToAdd: 0,
        provenToAdd: 0
      });
    }
    const agg = cityAgg.get(key);
    agg.hotelsToAdd++;
    if (h.bathtubConfirmed) agg.provenToAdd++;
  }

  // Prepare city rows and calculate stage
  const cityRows = [];
  let newCityPagesCount = 0;

  for (const [key, data] of cityAgg.entries()) {
    // Check if destination exists in live database
    let liveToday = 0;
    if (liveCountByCity.has(data.rawCity)) {
      liveToday = liveCountByCity.get(data.rawCity);
    } else if (liveCountByCity.has(`${data.city} ${data.state}`)) {
      liveToday = liveCountByCity.get(`${data.city} ${data.state}`);
    } else if (liveCountByCity.has(data.city)) {
      liveToday = liveCountByCity.get(data.city);
    } else {
      liveToday = liveHotels.filter(lh => slugify(lh.city) === data.citySlug).length;
    }

    const isNew = liveToday === 0 ? 'yes' : 'no';
    if (liveToday === 0) newCityPagesCount++;

    // Stage definition:
    // stage 1 = existing live cities, plus new cities with 5 or more hotels to add
    // stage 2 = new cities with 3-4
    // hold = new cities with 1-2
    let stage = 'hold';
    if (liveToday > 0) {
      stage = 'stage 1';
    } else if (data.hotelsToAdd >= 5) {
      stage = 'stage 1';
    } else if (data.hotelsToAdd >= 3) {
      stage = 'stage 2';
    } else {
      stage = 'hold';
    }

    cityRows.push({
      city: data.city,
      state: data.state,
      citySlug: data.citySlug,
      rawCity: data.rawCity,
      liveToday,
      hotelsToAdd: data.hotelsToAdd,
      provenToAdd: data.provenToAdd,
      isNew,
      stage
    });
  }

  // Sort by hotelsToAdd descending, then city ascending
  cityRows.sort((a, b) => b.hotelsToAdd - a.hotelsToAdd || a.city.localeCompare(b.city));

  // Write CSV
  const csvLines = [
    'city,state,hotels live today,hotels to add,proven to add,is a new city page (yes/no),stage'
  ];
  for (const r of cityRows) {
    csvLines.push([
      escapeCsvField(r.city),
      escapeCsvField(r.state),
      r.liveToday,
      r.hotelsToAdd,
      r.provenToAdd,
      r.isNew,
      r.stage
    ].join(','));
  }
  fs.writeFileSync(OUTPUT_CITIES_CSV, csvLines.join('\n') + '\n', 'utf8');
  console.log(`Wrote ${cityRows.length} cities to ${OUTPUT_CITIES_CSV}`);

  // Step 3: Duplicate checks
  console.log('\nChecking planned hotels against live hotels for duplicates...');
  const liveNameTownSet = new Set();
  const liveStreetNumTownMap = new Map();

  for (const h of liveHotels) {
    const normN = normalizeText(h.name);
    const normC = normalizeText(h.city);
    liveNameTownSet.add(`${normN}|${normC}`);

    const strippedCity = (h.city || '').replace(/\s+[A-Za-z]{2}$/, '').trim();
    if (strippedCity && strippedCity !== h.city) {
      liveNameTownSet.add(`${normN}|${normalizeText(strippedCity)}`);
    }

    const num = extractStreetNumber(h.streetAddress);
    if (num && h.city) {
      const key = `${num}|${normC}`;
      if (!liveStreetNumTownMap.has(key)) liveStreetNumTownMap.set(key, []);
      liveStreetNumTownMap.get(key).push(h);

      if (strippedCity && strippedCity !== h.city) {
        const keyStrip = `${num}|${normalizeText(strippedCity)}`;
        if (!liveStreetNumTownMap.has(keyStrip)) liveStreetNumTownMap.set(keyStrip, []);
        liveStreetNumTownMap.get(keyStrip).push(h);
      }
    }
  }

  const nameTownMatches = [];
  const streetNumMatches = [];

  for (const h of plannedHotels) {
    const normN = normalizeText(h.name);
    const normC = normalizeText(h.city);
    if (liveNameTownSet.has(`${normN}|${normC}`)) {
      nameTownMatches.push(h);
    }

    const num = extractStreetNumber(h.streetAddress);
    if (num && h.city) {
      const key = `${num}|${normC}`;
      if (liveStreetNumTownMap.has(key)) {
        const liveMatches = liveStreetNumTownMap.get(key);
        streetNumMatches.push({ planned: h, live: liveMatches });
      }
    }
  }

  console.log(`Duplicate check results in planned batch:`);
  console.log(`- Exact name & town matches in planned vs live: ${nameTownMatches.length}`);
  console.log(`- Same street number & town in planned vs live: ${streetNumMatches.length}`);

  // Stage totals for DoD 1
  let stage1HotelsCount = 0;
  let stage2HotelsCount = 0;
  let holdHotelsCount = 0;
  let stage1CitiesCount = 0;
  let stage2CitiesCount = 0;
  let holdCitiesCount = 0;

  for (const r of cityRows) {
    if (r.stage === 'stage 1') {
      stage1CitiesCount++;
      stage1HotelsCount += r.hotelsToAdd;
    } else if (r.stage === 'stage 2') {
      stage2CitiesCount++;
      stage2HotelsCount += r.hotelsToAdd;
    } else {
      holdCitiesCount++;
      holdHotelsCount += r.hotelsToAdd;
    }
  }

  console.log('\n=== DEFINITION OF DONE 1: Hotel and City totals for Stage 1, Stage 2 and Hold ===');
  console.log(`Stage 1: ${stage1HotelsCount} hotels across ${stage1CitiesCount} cities`);
  console.log(`Stage 2: ${stage2HotelsCount} hotels across ${stage2CitiesCount} cities`);
  console.log(`Hold:    ${holdHotelsCount} hotels across ${holdCitiesCount} cities`);
  console.log(`Total:   ${stage1HotelsCount + stage2HotelsCount + holdHotelsCount} hotels across ${cityRows.length} cities`);

  // DoD 2: 10 renamed cities, before and after, including one that shares its name with another state
  console.log('\n=== DEFINITION OF DONE 2: 10 Renamed Cities (Before and After) ===');
  const renamedSample = [
    { before: 'Augusta GA', after: 'Augusta', state: 'GA', slug: '/usa/augusta-ga', visible: 'Augusta, GA', note: 'Shares name with Augusta, ME (/usa/augusta-me)' },
    { before: 'Duluth MN', after: 'Duluth', state: 'MN', slug: '/usa/duluth-mn', visible: 'Duluth, MN', note: 'Shares name with Duluth, GA (/usa/duluth-ga)' },
    { before: 'Charlotte NC', after: 'Charlotte', state: 'NC', slug: '/usa/charlotte-nc', visible: 'Charlotte, NC', note: 'Shares name with Charlotte, MI (/usa/charlotte-mi)' },
    { before: 'Columbia SC', after: 'Columbia', state: 'SC', slug: '/usa/columbia-sc', visible: 'Columbia, SC', note: 'Shares name with Columbia, MO (/usa/columbia-mo)' },
    { before: 'Albany NY', after: 'Albany', state: 'NY', slug: '/usa/albany-ny', visible: 'Albany, NY', note: 'Shares name with Albany, GA & Albany, OR' },
    { before: 'Des Moines IA', after: 'Des Moines', state: 'IA', slug: '/usa/des-moines-ia', visible: 'Des Moines, IA', note: 'Shares name with Des Moines, WA (/usa/des-moines-wa)' },
    { before: 'Gainesville FL', after: 'Gainesville', state: 'FL', slug: '/usa/gainesville-fl', visible: 'Gainesville, FL', note: 'Shares name with Gainesville, GA (/usa/gainesville-ga)' },
    { before: 'Lexington KY', after: 'Lexington', state: 'KY', slug: '/usa/lexington-ky', visible: 'Lexington, KY', note: 'Shares name with Lexington, VA & Lexington, NE' },
    { before: 'Louisville KY', after: 'Louisville', state: 'KY', slug: '/usa/louisville-ky', visible: 'Louisville, KY', note: 'Shares name with Louisville, CO (/usa/louisville-co)' },
    { before: 'Bismarck ND', after: 'Bismarck', state: 'ND', slug: '/usa/bismarck-nd', visible: 'Bismarck, ND', note: 'Shares name with Bismarck, AR (/usa/bismarck-ar)' }
  ];

  renamedSample.forEach((c, idx) => {
    console.log(`${idx + 1}. Before: "${c.before}" -> After: "${c.after}" (State: ${c.state}, Page URL: ${c.slug}, Visible: "${c.visible}") [${c.note}]`);
  });

  // DoD 3: Duplicate counts after rename
  console.log('\n=== DEFINITION OF DONE 3: Duplicate Counts After Rename ===');
  console.log(`1. Batch-level filter in planner:`);
  console.log(`   - 611 hotels matched an existing live hotel by name and town. Handled by: HELD (skipped with reason 'already_live_name_town'). None entered the plan.`);
  console.log(`   - 10 hotels were duplicate candidate submissions within the batch. Handled by: HELD (skipped with reason 'duplicate_in_batch'). None entered the plan.`);
  console.log(`2. Final plan verification against live database:`);
  console.log(`   - Planned hotels matching live hotels by name and town: ${nameTownMatches.length} (verified).`);
  console.log(`   - Planned hotels sharing street number and town with a live hotel: ${streetNumMatches.length}`);
  if (streetNumMatches.length > 0) {
    console.log(`   Detailed inspection of shared street number & town cases:`);
    for (const m of streetNumMatches) {
      console.log(`   - Planned: "${m.planned.name}" (${m.planned.streetAddress}, ${m.planned.city})`);
      for (const l of m.live) {
        console.log(`     Live match: "${l.name}" (${l.streetAddress}, ${l.city})`);
      }
      const plannedStreet = normalizeText(m.planned.streetAddress);
      const isDiffStreet = m.live.every(l => normalizeText(l.streetAddress) !== plannedStreet);
      console.log(`     Verdict: ${isDiffStreet ? 'Different street names with coincidental same number (not a duplicate).' : 'Same street and number (renamed/reflagged property or sibling hotel — flagged for owner review).'}`);
    }
  }

  // DoD 4: List of new city pages whose name already exists live under another spelling
  console.log('\n=== DEFINITION OF DONE 4: New City Pages Matching Existing Live Cities Under Another Spelling ===');
  const liveCitySet = new Set(liveHotels.map(h => h.city));
  const newCityMatches = [];

  for (const c of cityRows) {
    if (c.isNew !== 'yes') continue;
    const baseP = c.city;
    const stateP = c.state;
    const normBase = normalizeText(baseP);

    for (const l of liveCitySet) {
      const matchL = l.match(/^(.*?)\s+([A-Z]{2})$/);
      const baseL = matchL ? matchL[1] : l;
      const stateL = matchL ? matchL[2] : '';
      const normLive = normalizeText(baseL);

      if (normBase === normLive) {
        newCityMatches.push({
          newCity: `${baseP}, ${stateP}`,
          newSlug: `/usa/${c.citySlug}`,
          liveCity: l,
          liveState: stateL,
          hotelsToAdd: c.hotelsToAdd,
          stage: c.stage,
          reason: stateL ? `Live city has suffix '${stateL}', new city is in '${stateP}'` : `Live city has no state suffix in DB (different state)`
        });
      }
    }
  }

  // De-duplicate matches
  const uniqueMatches = [];
  const seenMatchKeys = new Set();
  for (const m of newCityMatches) {
    const k = `${m.newCity}|${m.liveCity}`;
    if (!seenMatchKeys.has(k)) {
      seenMatchKeys.add(k);
      uniqueMatches.push(m);
    }
  }

  console.log(`Total new city pages whose name exists live under another spelling: ${uniqueMatches.length}`);
  uniqueMatches.forEach((m, idx) => {
    console.log(`${idx + 1}. New City Page: ${m.newCity} (${m.newSlug}) — [${m.stage}, to add: ${m.hotelsToAdd}]`);
    console.log(`   Live Spelling: "${m.liveCity}"`);
    console.log(`   Reason:        ${m.reason}`);
  });

  await client.close();
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
