// Validate and repair Booking.com / Agoda links for ONE city, using a real browser.
//
//   node scripts/repair-city-links.mjs --city surat --country india          (dry run, default)
//   node scripts/repair-city-links.mjs --city surat --country india --apply  (writes DB + .cache)
//
// Rules: a Booking.com link is kept only if the page it opens names this hotel. A dead link is
// re-resolved through Booking.com's own search; the replacement is used only if the opened page
// matches the hotel name AND the city. Otherwise bookingUrl is set to null - never to a search URL.
// Every change is backed up to .cache/link-repair-backup-<city>-<time>.json before writing.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';
import dotenv from 'dotenv';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: path.join(rootDir, '.env.local') });
const args = process.argv.slice(2);
const opt = (f) => { const i = args.indexOf(f); return i === -1 ? null : args[i + 1]; };
const cityArg = (opt('--city') || '').toLowerCase();
const countryArg = (opt('--country') || '').toLowerCase();
const apply = args.includes('--apply');
if (!cityArg) { console.error('--city is required'); process.exit(1); }

const AID = '304142';
const STOP = new Set(['the', 'hotel', 'hotels', 'by', 'and', 'a', 'of', 'in', 'at', 'resort', 'spa', 'suites', 'suite', 'a', 'collection']);
const norm = (s) => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const tokens = (s) => new Set(norm(s).match(/[a-z0-9]+/g)?.filter((t) => !STOP.has(t)) || []);
const score = (name, text) => {
  const t = tokens(name); if (!t.size) return 0;
  const hay = tokens(text); let hit = 0;
  for (const x of t) if (hay.has(x)) hit++;
  return hit / t.size;
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms + Math.random() * 1200));

const cachePath = path.join(rootDir, '.cache', 'all-hotels.json');
const all = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
const hotels = all.filter((h) => norm(h.city) === cityArg && (!countryArg || norm(h.country) === countryArg));
console.log(`${hotels.length} hotels in ${cityArg}${countryArg ? ', ' + countryArg : ''} (${apply ? 'APPLY' : 'dry run'})`);

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  locale: 'en-US', viewport: { width: 1366, height: 900 },
});
const page = await ctx.newPage();

async function open(url) {
  try {
    const res = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 25000 });
    await page.waitForLoadState('load', { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(2500);
    return res?.status() ?? 0;
  } catch { return 0; }
}
async function ev(fn, fallback) {
  for (let i = 0; i < 3; i++) { try { return await page.evaluate(fn); } catch { await page.waitForTimeout(1200); } }
  return fallback;
}

// Opens a Booking.com hotel URL and returns what the page really is.
async function inspectBooking(url, hotel) {
  const status = await open(url);
  const finalUrl = page.url();
  const title = await page.title().catch(() => '');
  const h1 = await ev(() => document.querySelector('h1, h2.pp-header__title')?.textContent?.trim() || '', '');
  const hotelId = await ev(() => document.documentElement.innerHTML.match(/b_hotel_id\s*[:=]\s*['"]?(\d+)/)?.[1] || null, null);
  const addr = await ev(() => document.querySelector('[data-node_tt_id="location_score_tooltip"], .hp_address_subtitle, [data-testid="address"]')?.textContent?.trim() || '', '');
  const nameScore = Math.max(score(hotel.name, title), score(hotel.name, h1));
  const cityOk = norm(`${title} ${h1} ${addr} ${finalUrl}`).includes(norm(hotel.city).split(' ')[0]);
  const isSearch = /searchresults|closed_msg|\/city\/|\/region\//.test(finalUrl + title) || /^Search hotels in/i.test(title);
  const ok = status === 200 && !isSearch && /\/hotel\/[a-z]{2}\//.test(finalUrl) && nameScore >= 0.6 && (cityOk || !!hotelId);
  return { ok, status, finalUrl, title, h1, hotelId, nameScore: +nameScore.toFixed(2), cityOk, isSearch };
}

// Finds candidate property links on Booking.com's own search results for "<name> <city>".
async function searchBooking(hotel) {
  const q = encodeURIComponent(`${hotel.name} ${hotel.city}`);
  await open(`https://www.booking.com/searchresults.html?ss=${q}&aid=${AID}&lang=en-us&group_adults=2&no_rooms=1`);
  await page.waitForTimeout(2500);
  const cands = await ev(() => {
    const out = []; const seen = new Set();
    for (const card of document.querySelectorAll('[data-testid="property-card"]')) {
      const a = card.querySelector('a[data-testid="title-link"], a[href*="/hotel/"]');
      if (!a) continue;
      const href = a.href.split('?')[0];
      if (seen.has(href)) continue; seen.add(href);
      out.push({
        href,
        name: card.querySelector('[data-testid="title"]')?.textContent?.trim() || a.textContent.trim(),
        loc: card.querySelector('[data-testid="address"]')?.textContent?.trim() || '',
      });
    }
    return out.slice(0, 8);
  }, []);
  return cands;
}

const results = [];
for (const h of hotels) {
  const row = { _id: h._id, name: h.name, city: h.city, oldBookingUrl: h.bookingUrl || null };
  console.log(`\n▶ ${h.name}`);
  if (h.bookingUrl) {
    const cur = await inspectBooking(h.bookingUrl, h);
    row.current = cur;
    console.log(`  current: ${cur.ok ? 'OK' : 'DEAD'} status=${cur.status} score=${cur.nameScore} → ${cur.finalUrl.slice(0, 90)}`);
    if (cur.ok) {
      // Booking redirected an old slug to the live one: store the canonical address.
      const canon = cur.finalUrl.split('?')[0] + `?aid=${AID}`;
      const same = new URL(canon).pathname === new URL(h.bookingUrl).pathname;
      row.action = same ? 'keep' : 'replace';
      if (!same) { row.newBookingUrl = canon; row.verify = cur; }
    }
    if (cur.ok) {
      if (h.agodaUrl) {
        await sleep(2500);
        await open(h.agodaUrl);
        const at = await page.title().catch(() => '');
        row.agoda = { url: h.agodaUrl, finalUrl: page.url(), title: at, nameScore: +score(h.name, at + ' ' + page.url()).toFixed(2) };
        console.log(`  agoda: score=${row.agoda.nameScore} ${at.slice(0, 70)}`);
      }
      results.push(row); await sleep(3000); continue;
    }
  }
  await sleep(3000);
  if (h.agodaUrl) {
    await open(h.agodaUrl);
    const at = await page.title().catch(() => '');
    row.agoda = { url: h.agodaUrl, finalUrl: page.url(), title: at, nameScore: +score(h.name, at + ' ' + page.url()).toFixed(2) };
    console.log(`  agoda: score=${row.agoda.nameScore} ${at.slice(0, 70)}`);
    await sleep(2500);
  }
  const cands = await searchBooking(h);
  row.candidates = cands;
  console.log(`  search found ${cands.length} candidates: ${cands.map((c) => c.name).join(' | ').slice(0, 200)}`);
  const ranked = cands
    .map((c) => ({ ...c, s: Math.max(score(h.name, c.name), 0) , cityHit: !c.loc || norm(c.loc + ' ' + c.name).includes(norm(h.city).split(' ')[0]) }))
    .filter((c) => c.s >= 0.6 && c.cityHit)
    .sort((a, b) => b.s - a.s);
  let fixed = null;
  for (const c of ranked.slice(0, 2)) {
    await sleep(3000);
    const url = `${c.href}?aid=${AID}`;
    const v = await inspectBooking(url, h);
    console.log(`  try ${c.name} (${c.s.toFixed(2)}): ${v.ok ? 'VERIFIED' : 'rejected'} status=${v.status} score=${v.nameScore}`);
    if (v.ok) { fixed = { url, verify: v }; break; }
  }
  if (fixed) { row.action = 'replace'; row.newBookingUrl = fixed.url; row.verify = fixed.verify; }
  else { row.action = 'null'; row.newBookingUrl = null; }
  results.push(row);
  await sleep(3000);
}
await browser.close();

const outPath = path.join(rootDir, '.cache', `link-repair-${cityArg}.json`);
fs.writeFileSync(outPath, JSON.stringify(results, null, 2));
console.log('\nPlan:');
for (const r of results) console.log(`  ${r.action.padEnd(8)} ${r.name}  ${r.newBookingUrl ?? (r.action === 'keep' ? '(unchanged)' : 'null (no verified page)')}`);
console.log('Report:', outPath);

if (!apply) { console.log('\nDry run only. Re-run with --apply to write.'); process.exit(0); }

// ---- apply: backup, then write MongoDB and .cache/all-hotels.json ----
// An Agoda link that lands on the Agoda homepage (name score 0) is dead: null it too.
for (const r of results) {
  r.agodaDead = !!(r.agoda && r.agoda.nameScore === 0 && /agoda\.com\/(\?|$)/.test(r.agoda.finalUrl));
}
const changes = results.filter((r) => r.action === 'replace' || r.action === 'null' || r.agodaDead);
const backupPath = path.join(rootDir, '.cache', `link-repair-backup-${cityArg}-${Date.now()}.json`);
fs.writeFileSync(backupPath, JSON.stringify(changes.map((r) => ({ _id: r._id, name: r.name, bookingUrl: r.oldBookingUrl, agodaUrl: r.agoda?.url ?? null })), null, 2));
console.log('Backup:', backupPath);

const mongoose = (await import('mongoose')).default;
await mongoose.connect(process.env.MONGODB_URI);
const col = mongoose.connection.collection('hotels');
for (const r of changes) {
  const set = { updatedAt: new Date() };
  if (r.action === 'replace' || r.action === 'null') set.bookingUrl = r.newBookingUrl;
  if (r.agodaDead) set.agodaUrl = null;
  const res = await col.updateOne({ _id: new mongoose.Types.ObjectId(r._id) }, { $set: set });
  console.log(`  db ${r.name}: matched=${res.matchedCount} modified=${res.modifiedCount}`);
  const h = all.find((x) => String(x._id) === String(r._id));
  if (h) { if ('bookingUrl' in set) h.bookingUrl = set.bookingUrl; if ('agodaUrl' in set) h.agodaUrl = set.agodaUrl; h.updatedAt = set.updatedAt.toISOString(); }
}
fs.writeFileSync(cachePath, JSON.stringify(all));
await mongoose.disconnect();
console.log('Applied.');
