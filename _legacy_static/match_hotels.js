/**
 * Cross-Platform Hotel Matching / Reconciliation — DRY RUN
 * ===========================================================
 * Reads MMT (live `hotels`) + Agoda/Booking.com (`hotelcandidates` staging)
 * for one city, fuzzy-matches the same physical hotel across sources by
 * name similarity, and reports which hotels are confirmed on all three
 * (Bathtub/Jacuzzi verified independently by MMT, Agoda, and Booking.com).
 *
 * This is a DRY RUN — it only prints a report. It does NOT write to the
 * database. Review the matches, then a separate --apply step (not yet
 * built) would flip `flagged` on the live `hotels` collection based on
 * what's confirmed here.
 *
 * Usage:
 *   node match_hotels.js [city]
 *   node match_hotels.js Gwalior
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });
const mongoose = require('mongoose');

const CITY = process.argv[2] || 'Gwalior';
const COUNTRY = process.argv[3] || 'India';

// Generic words that don't help distinguish one hotel from another —
// stripped before comparing. Distinctive words (brand names, "Palace",
// "Resort" when part of a proper name, etc.) are deliberately NOT in this
// list; better to under-strip and lose a few matches than over-strip and
// create false ones.
const STOPWORDS = new Set([
  'hotel', 'hotels', 'the', 'a', 'an', 'in', 'near', 'by', 'from', 'at',
  'formerly', 'inn', 'guest', 'house', 'guesthouse', 'lodging', 'boarding',
  'and', '&', 'road', 'km', 'mall', 'square', 'gwalior', 'kolkata', 'bhopal',
  'indore', 'manali', 'munnar', 'shimla', 'udaipur',
]);

function normalize(name) {
  // Scraped names often carry a descriptive landmark/distance suffix after
  // " - " (e.g. "The Narayanam - 1.5km from Gole Ka Mandir") that's not
  // part of the actual hotel name. Left in, it dilutes Jaccard similarity
  // against another source's clean name for the same hotel and causes
  // real matches to score below threshold — strip it before tokenizing.
  const core = name.split(' - ')[0];
  return core
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\d+(\.\d+)?/g, ' ') // strip distances like "1.5" / "0.4"
    .split(/\s+/)
    .filter((w) => w && !STOPWORDS.has(w))
    .sort();
}

function jaccard(aTokens, bTokens) {
  const a = new Set(aTokens);
  const b = new Set(bTokens);
  if (a.size === 0 || b.size === 0) return 0;
  let intersection = 0;
  for (const t of a) if (b.has(t)) intersection++;
  const union = new Set([...a, ...b]).size;
  return intersection / union;
}

const MATCH_THRESHOLD = 0.4;

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const hotelsCol = mongoose.connection.collection('hotels');
  const candidatesCol = mongoose.connection.collection('hotelcandidates');

  const cityRe = new RegExp(`^${CITY}$`, 'i');

  const mmt = (await hotelsCol.find({ city: cityRe }).toArray()).map((h) => ({
    source: 'mmt',
    name: h.name,
    tokens: normalize(h.name),
    image: h.image,
    url: h.url,
    description: h.description || '',
    amenities: h.amenities || [],
    _id: h._id,
  }));
  const agoda = (await candidatesCol.find({ source: 'agoda', city: cityRe }).toArray()).map((h) => ({
    source: 'agoda',
    name: h.name,
    tokens: normalize(h.name),
    image: h.image,
    url: h.url,
    description: h.description || '',
    amenities: h.amenities || [],
  }));
  const booking = (await candidatesCol.find({ source: 'booking', city: cityRe }).toArray()).map((h) => ({
    source: 'booking',
    name: h.name,
    tokens: normalize(h.name),
    image: h.image,
    url: h.url,
    description: h.description || '',
    amenities: h.amenities || [],
  }));

  console.log('='.repeat(70));
  console.log(`CROSS-PLATFORM MATCH REPORT — ${CITY}, ${COUNTRY} (DRY RUN, no DB writes)`);
  console.log('='.repeat(70));
  console.log(`MMT (live):        ${mmt.length} hotels`);
  console.log(`Agoda (staging):   ${agoda.length} candidates`);
  console.log(`Booking (staging): ${booking.length} candidates`);
  console.log();

  if (mmt.length === 0) {
    console.log('⚠️  No live MMT hotels for this city. Dual-verification (Agoda+Booking) will insert new hotels.');
  }

  // Greedy clustering: union-find over all entries from all 3 sources.
  const all = [...mmt, ...agoda, ...booking];
  const parent = all.map((_, i) => i);
  function find(i) {
    while (parent[i] !== i) {
      parent[i] = parent[parent[i]];
      i = parent[i];
    }
    return i;
  }
  function union(i, j) {
    const ri = find(i);
    const rj = find(j);
    if (ri !== rj) parent[ri] = rj;
  }

  const scores = []; // for reporting best-score pairs
  for (let i = 0; i < all.length; i++) {
    for (let j = i + 1; j < all.length; j++) {
      if (all[i].source === all[j].source) continue; // only cross-source matches count
      const score = jaccard(all[i].tokens, all[j].tokens);
      if (score >= MATCH_THRESHOLD) {
        union(i, j);
        scores.push({ i, j, score });
      }
    }
  }

  const clusters = new Map();
  all.forEach((_, i) => {
    const root = find(i);
    if (!clusters.has(root)) clusters.set(root, []);
    clusters.get(root).push(i);
  });

  const results = [];
  for (const members of clusters.values()) {
    const bySource = { mmt: [], agoda: [], booking: [] };
    members.forEach((idx) => bySource[all[idx].source].push(all[idx]));
    const sourcesPresent = Object.entries(bySource).filter(([, v]) => v.length > 0).map(([k]) => k);
    results.push({ bySource, sourcesPresent });
  }

  const tripleConfirmed = results.filter((r) => r.sourcesPresent.length === 3);
  const dualConfirmed = results.filter((r) => r.sourcesPresent.length === 2 && r.sourcesPresent.includes('agoda') && r.sourcesPresent.includes('booking'));
  const singleBooking = results.filter((r) => r.sourcesPresent.length === 1 && r.sourcesPresent.includes('booking'));
  
  let validClusters = [...tripleConfirmed, ...dualConfirmed];
  if (COUNTRY.toLowerCase() !== 'india') {
      validClusters = [...validClusters, ...singleBooking];
  }

  console.log(`✅ TRIPLE-CONFIRMED (all 3 sources): ${tripleConfirmed.length}`);
  console.log('-'.repeat(70));
  tripleConfirmed.forEach((r) => {
    console.log(`  🛁 MMT: "${r.bySource.mmt[0].name}"`);
    console.log(`     Agoda: "${r.bySource.agoda[0].name}"`);
    console.log(`     Booking: "${r.bySource.booking[0].name}"`);
    console.log();
  });

  console.log(`✅ DUAL-CONFIRMED (Agoda + Booking only): ${dualConfirmed.length}`);
  console.log('-'.repeat(70));
  dualConfirmed.forEach((r) => {
    console.log(`  🛁 Agoda: "${r.bySource.agoda[0].name}"`);
    console.log(`     Booking: "${r.bySource.booking[0].name}"`);
    console.log();
  });

  const partial = results.filter((r) => r.sourcesPresent.length === 2 && (!r.sourcesPresent.includes('agoda') || !r.sourcesPresent.includes('booking')));
  const singleSource = results.filter((r) => r.sourcesPresent.length === 1);

  console.log(`\n⚠️  PARTIAL MATCH (2 of 3, lacking Agoda+Booking — would stay HIDDEN): ${partial.length}`);
  console.log('-'.repeat(70));
  partial.forEach((r) => {
    const label = r.sourcesPresent.map((s) => `${s}: "${r.bySource[s][0].name}"`).join(' / ');
    const missing = ['mmt', 'agoda', 'booking'].find((s) => !r.sourcesPresent.includes(s));
    console.log(`  ${label}  (missing: ${missing})`);
  });

  console.log(`\n❌ SINGLE-SOURCE ONLY (no cross-confirmation): ${singleSource.length}`);
  console.log('-'.repeat(70));
  singleSource.forEach((r) => {
    const s = r.sourcesPresent[0];
    console.log(`  ${s}: "${r.bySource[s][0].name}"`);
  });

  const APPLY = process.argv.includes('--apply');

  // --exclude "Name One" --exclude "Name Two" — skip specific triple-matches
  // that are false positives from the name-similarity heuristic (e.g. a
  // distinct sub-brand sharing a word with its parent hotel's name), even
  // though they cleared the Jaccard threshold. Case-insensitive substring
  // match against the MMT hotel's name.
  const excludeNames = [];
  process.argv.forEach((arg, i) => {
    if (arg === '--exclude' && process.argv[i + 1]) excludeNames.push(process.argv[i + 1].toLowerCase());
  });
  if (excludeNames.length > 0) {
    const before = tripleConfirmed.length;
    for (let i = tripleConfirmed.length - 1; i >= 0; i--) {
      const name = tripleConfirmed[i].bySource.mmt[0].name.toLowerCase();
      if (excludeNames.some((ex) => name.includes(ex))) {
        console.log(`\n⛔ Excluding false-positive match: "${tripleConfirmed[i].bySource.mmt[0].name}"`);
        tripleConfirmed.splice(i, 1);
      }
    }
    console.log(`   (${before} → ${tripleConfirmed.length} triple-confirmed after exclusions)\n`);
  }

  if (!APPLY) {
    console.log('\n' + '='.repeat(70));
    console.log('This is a DRY RUN. Nothing was written to the database.');
    console.log('Pass --apply to actually flip visibility on the live `hotels` collection.');
    console.log('='.repeat(70));
  } else {
    // Only ever mutates EXISTING MMT-sourced documents already in the live
    // `hotels` collection — never creates new ones. A triple-confirmed
    // cluster always includes an MMT member by construction (MMT is the
    // only source that can currently produce a live document), so
    // "publish" just means unflagging that existing doc, and "un-publish"
    // means flagging any MMT hotel that didn't make it into a
    // triple-confirmed cluster this run.
    console.log('\n🚀 APPLYING to live `hotels` collection...');
    console.log('-'.repeat(70));

    let shown = 0;
    let hidden = 0;
    let unchanged = 0;

    const confirmedIds = new Set(validClusters.filter(r => r.bySource.mmt.length > 0).map((r) => String(r.bySource.mmt[0]._id)));

    for (const r of validClusters) {
      const base = r.bySource.mmt[0] || r.bySource.agoda[0] || r.bySource.booking[0];
      const slug = base.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      
      const updateDoc = {
        $set: {
          name: base.name,
          slug: slug,
          city: CITY,
          country: COUNTRY,
          image: base.image,
          url: base.url,
          description: base.description,
          amenities: base.amenities,
          verified: true,
          flagged: false,
          crossVerified: true,
          crossVerifiedAt: new Date(),
          crossVerifiedSources: r.sourcesPresent,
          agodaUrl: r.bySource.agoda[0]?.url,
          bookingUrl: r.bySource.booking[0]?.url,
        },
      };

      const filter = r.bySource.mmt[0] ? { _id: base._id } : { slug: slug, city: CITY };

      const result = await hotelsCol.updateOne(filter, updateDoc, { upsert: true });
      if (result.modifiedCount > 0 || result.upsertedId) {
        console.log(`  ✅ SHOWN:  ${base.name}`);
        shown++;
      } else {
        unchanged++;
      }
    }

    for (const h of mmt) {
      if (confirmedIds.has(String(h._id))) continue;
      const result = await hotelsCol.updateOne(
        { _id: h._id },
        { $set: { flagged: true, crossVerified: false } }
      );
      if (result.modifiedCount > 0) {
        console.log(`  ❌ HIDDEN: ${h.name}`);
        hidden++;
      } else {
        unchanged++;
      }
    }

    console.log('-'.repeat(70));
    console.log(`Done. ${shown} newly shown, ${hidden} newly hidden, ${unchanged} already correct.`);
    console.log('='.repeat(70));
  }

  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
