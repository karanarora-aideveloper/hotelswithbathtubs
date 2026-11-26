#!/usr/bin/env node
/**
 * PROMOTE3 stage 2 (26 Nov 2026, founder in chat: "bring more US hotels' data today").
 * Publishes the stage 2 hotels from data-collect/private/promote3-planned.json: US towns that each
 * get 3-4 hotels at once, so every new town page has enough hotels to be shown to Google.
 *
 *   node scripts/data/promote3-stage2-write.mjs             # dry run: checks + counts, no writes
 *   node scripts/data/promote3-stage2-write.mjs --write     # insert hotels, mark candidates published
 *   node scripts/data/promote3-stage2-write.mjs --rollback [--write]   # delete this batch, candidates back to hidden
 *
 * Checks re-run against today's database (the plan is from 31 Oct): slug, old slug and redirect
 * clashes, same name+town, same street address, candidate already published. A record failing any
 * check is skipped, not written. Town names that exist in several states get the state suffix the
 * site already uses ("Springfield MO"), so a new town never lands on another state's page.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
dotenv.config({ path: path.join(ROOT, '.env.local'), quiet: true });
const WRITE = process.argv.includes('--write');
const ROLLBACK = process.argv.includes('--rollback');
// Date part = when the Agoda tub listing was last seen (1-4 Nov); the site shows it as "Proof saved".
const BATCH_ID = 'PROMOTE3-S2-2026-11-04';

const { hasClaimPhrase } = await import(path.join(ROOT, 'src/lib/claims.ts'));
const slugify = (t) => (t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
  .replace(/&+/g, 'and').replace(/['’]/g, '').replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
const n = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

const client = new MongoClient(process.env.MONGODB_URI);
await client.connect();
const db = client.db();
const hotels = db.collection('hotels');
const cands = db.collection('hotel_candidates');
const before = await hotels.countDocuments();
const usBefore = await hotels.countDocuments({ country: 'USA' });

if (ROLLBACK) {
  const batch = await hotels.find({ importBatch: BATCH_ID }, { projection: { _id: 1 } }).toArray();
  console.log(`${WRITE ? 'ROLLBACK' : 'DRY RUN rollback'}: ${batch.length} hotels in ${BATCH_ID} (hotels now ${before})`);
  if (WRITE && batch.length) {
    const ids = batch.map((h) => h._id);
    const c = await cands.updateMany({ hotelId: { $in: ids } }, { $set: { status: 'hidden', updatedAt: new Date().toISOString() }, $unset: { hotelId: '' } });
    const d = await hotels.deleteMany({ importBatch: BATCH_ID });
    console.log(`Deleted ${d.deletedCount} hotels, ${c.modifiedCount} candidates back to hidden. Hotels ${before} -> ${await hotels.countDocuments()}`);
  }
  await client.close();
  process.exit(0);
}

const planned = JSON.parse(fs.readFileSync(path.join(ROOT, 'data-collect/private/promote3-planned.json'), 'utf8'))
  .filter((r) => r.stage === 'stage 2');

const live = await hotels.find({}, { projection: { slug: 1, previousSlugs: 1, name: 1, city: 1, streetAddress: 1 } }).toArray();
const slugs = new Set(live.flatMap((h) => [h.slug, ...(h.previousSlugs || [])]));
const nameCity = new Set(live.map((h) => `${n(h.name)}|${n(h.city)}`));
const addrs = new Set(live.filter((h) => h.streetAddress).map((h) => n(h.streetAddress)));
const redirects = fs.readFileSync(path.join(ROOT, 'scripts/redirects.mjs'), 'utf8');
const liveCitySlugs = new Set(live.map((h) => slugify(h.city)));

const skipped = [];
const docs = [];
const seen = new Set();
const now = new Date().toISOString();
for (const r of planned) {
  // Town name: the planner gave ambiguous towns a state slug ("conway-ar") but left city "Conway".
  const city = slugify(r.city) === r.citySlug ? r.city : `${r.city} ${r.state}`;
  const why = [];
  if (slugify(city) !== r.citySlug) why.push(`town slug ${slugify(city)} != ${r.citySlug}`);
  if (slugs.has(r.slug) || seen.has(r.slug)) why.push('slug taken');
  if (redirects.includes(`/${r.slug}'`)) why.push('slug is a redirect source');
  if (nameCity.has(`${n(r.name)}|${n(r.city)}`) || nameCity.has(`${n(r.name)}|${n(city)}`)) why.push('same name+town live');
  if (r.streetAddress && addrs.has(n(r.streetAddress))) why.push('same street address live');
  if (r.country !== 'USA' || !r.agodaUrl?.startsWith('https://www.agoda.com/') || /aid=/.test(r.url + r.agodaUrl)) why.push('bad country/link');
  if (hasClaimPhrase(r.description)) why.push('claim phrase in description');
  const cand = r._candidateId ? await cands.findOne({ _id: new ObjectId(r._candidateId) }, { projection: { status: 1 } }) : null;
  if (!cand || cand.status === 'published') why.push('candidate missing or already published');
  if (why.length) { skipped.push({ name: r.name, city: r.city, why }); continue; }
  seen.add(r.slug);
  docs.push({
    _candidateId: r._candidateId,
    doc: {
      name: r.name, slug: r.slug, city, country: 'USA', url: r.url, agodaUrl: r.agodaUrl,
      streetAddress: r.streetAddress || '', postalCode: r.postalCode || '',
      latitude: r.latitude, longitude: r.longitude,
      bathtubConfirmed: r.bathtubConfirmed === true,
      roomType: r.roomType || '', tubType: r.tubType || 'Bathtub', amenities: r.amenities || ['Bathtub'],
      description: r.description, bookingTip: '', verified: false, crossVerified: false,
      image: r.image, images: r.images?.length ? r.images : [r.image],
      partnerImages: Array.isArray(r.partnerImages) ? r.partnerImages : [],
      importBatch: BATCH_ID, factSource: r.factSource || { source: 'tubhotels' },
      platformChecks: r.platformChecks || [], agodaFactsSeenAt: r.agodaFactsSeenAt || '2026-10-31',
      agodaTubLabels: r.agodaTubLabels || [],
      bookingTubLabels: r.bathtubConfirmed === true ? (r.agodaTubLabels?.length ? r.agodaTubLabels : [r.tubType || 'Bathtub']) : [],
      createdAt: now, updatedAt: now,
    },
  });
}

const towns = new Map();
for (const { doc } of docs) towns.set(slugify(doc.city), (towns.get(slugify(doc.city)) || 0) + 1);
const newTowns = [...towns.keys()].filter((t) => !liveCitySlugs.has(t)).length;
const thin = [...towns.entries()].filter(([t, c]) => !liveCitySlugs.has(t) && c < 3).length;
console.log(`${WRITE ? 'WRITE' : 'DRY RUN'} ${BATCH_ID}: ${docs.length} of ${planned.length} stage 2 hotels pass, ${skipped.length} skipped`);
console.log(`  tub listed by Agoda (confirmed): ${docs.filter((d) => d.doc.bathtubConfirmed).length}; reported only: ${docs.filter((d) => !d.doc.bathtubConfirmed).length}`);
console.log(`  towns: ${towns.size} (${newTowns} new, ${thin} new towns under 3 hotels); renamed with state: ${docs.filter((d) => d.doc.city.match(/ [A-Z]{2}$/)).length} hotels`);
console.log(`  hotels: ${before} (USA ${usBefore})`);
for (const s of skipped) console.log(`  skip: ${s.name} (${s.city}): ${s.why.join('; ')}`);

if (WRITE && docs.length) {
  const res = await hotels.insertMany(docs.map((d) => d.doc));
  let c = 0;
  for (let i = 0; i < docs.length; i++) {
    const u = await cands.updateOne({ _id: new ObjectId(docs[i]._candidateId), status: { $ne: 'published' } }, { $set: { status: 'published', hotelId: res.insertedIds[i], updatedAt: now } });
    c += u.modifiedCount;
  }
  console.log(`Inserted ${res.insertedCount}; ${c} candidates marked published. Hotels ${before} -> ${await hotels.countDocuments()} (USA ${usBefore} -> ${await hotels.countDocuments({ country: 'USA' })})`);
  console.log(`Undo: node scripts/data/promote3-stage2-write.mjs --rollback --write`);
}
await client.close();
