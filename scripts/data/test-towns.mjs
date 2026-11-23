import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(process.cwd(), '../hotelswithbathtubs/.env.local');
dotenv.config({ path: envPath, quiet: true });
if (!process.env.MONGODB_URI) {
  dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), quiet: true });
}
const client = new MongoClient(process.env.MONGODB_URI);
await client.connect();
const db = client.db();

function slugify(name) {
  return name.toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// 1. Existing USA hotels
const existingUsHotels = await db.collection('hotels').find({ country: 'USA' }).toArray();
const existingCityMap = new Map(); // slug -> Set of states
const existingCityDisplay = new Map(); // slug -> display name
for (const h of existingUsHotels) {
  if (h.city) {
    const s = slugify(h.city);
    existingCityDisplay.set(s, h.city);
    // Find state if any
    let st = '';
    if (h.description) {
      const m = h.description.match(/,\s*([A-Z]{2})\./);
      if (m) st = m[1];
    }
    if (!existingCityMap.has(s)) existingCityMap.set(s, new Set());
    if (st) existingCityMap.get(s).add(st);
  }
}

// 2. Candidates
const candidates = await db.collection('hotel_candidates').find({
  'platformChecks.platform': 'booking.com',
  'platformChecks.checkedAt': { $gte: '2026-10-29' },
  'platformChecks.result': 'found'
}).toArray();

console.log('Candidates count:', candidates.length);

const attached = candidates.filter(c => c.citySlug);
const unattached = candidates.filter(c => !c.citySlug);
console.log('Attached to existing citySlug:', attached.length);
console.log('Unattached (new town / suburb):', unattached.length);

// Check attached
for (const c of attached) {
  const disp = existingCityDisplay.get(c.citySlug);
  if (!disp) console.log('MISSING existing city for slug:', c.citySlug, c.name);
}

// Check new towns
const townStateMap = new Map(); // townSlug -> Map(state -> array of hotels)
for (const c of unattached) {
  const townName = c.town || c.address?.locality || 'Unknown';
  const townSlug = slugify(townName);
  const state = c.state || c.address?.region || '';
  if (!townStateMap.has(townSlug)) townStateMap.set(townSlug, new Map());
  const stMap = townStateMap.get(townSlug);
  if (!stMap.has(state)) stMap.set(state, []);
  stMap.get(state).push(c);
}

console.log('\nChecking clashes for unattached towns:');
const clashList = [];

for (const [tSlug, stMap] of townStateMap.entries()) {
  const states = Array.from(stMap.keys());
  const existingDisp = existingCityDisplay.get(tSlug);
  if (existingDisp) {
    const existingStates = Array.from(existingCityMap.get(tSlug) || []);
    console.log(`Potential clash with existing city: slug "${tSlug}" ("${existingDisp}", states: ${existingStates.join(',')}) vs candidate states: ${states.join(',')}`);
    for (const [st, hList] of stMap.entries()) {
      // If candidate state is different from existing city state, it's a clash!
      // If candidate state is the SAME as existing city state, is it the same city or a different town?
      // Wait, what does the brief say?
      // "if a new town's page address (e.g. /usa/portland) is already used by an existing city in a different state, or two new towns share a name, use "{Town} {ST}" as the city name (e.g. "Portland ME", "Columbus GA"). List every one."
      const isDiffState = existingStates.length > 0 && !existingStates.includes(st);
      clashList.push({
        type: 'existing_city',
        tSlug,
        existingDisp,
        existingStates,
        candidateState: st,
        count: hList.length,
        isDiffState
      });
    }
  }

  if (states.length > 1) {
    console.log(`Clash between new towns with same name in different states: slug "${tSlug}" in states: ${states.join(', ')}`);
    for (const st of states) {
      clashList.push({
        type: 'two_new_towns',
        tSlug,
        candidateState: st,
        count: stMap.get(st).length
      });
    }
  }
}

console.log('\nAll Clashes:');
console.log(clashList);

await client.close();
