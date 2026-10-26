// Collects partner photo addresses (Booking.com's image CDN) for hotels with a verified Booking.com
// link, for decision D8: show partner photos by link, with our R2 copies as the fallback.
// Stores up to 8 photo URLs per hotel in the `partnerImages` field. Read-only on Booking.com.
//
//   node scripts/collect-partner-photos.mjs --workers 2 --limit 20     (dry run, prints results)
//   node scripts/collect-partner-photos.mjs --workers 2 --apply        (writes MongoDB + .cache, resumable)
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';
import dotenv from 'dotenv';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: path.join(rootDir, '.env.local'), quiet: true });
const args = process.argv.slice(2);
const opt = (f, d) => { const i = args.indexOf(f); return i === -1 ? d : args[i + 1]; };
const WORKERS = parseInt(opt('--workers', '2'), 10);
const LIMIT = parseInt(opt('--limit', '0'), 10);
const APPLY = args.includes('--apply');
const CHANNEL = opt('--channel', 'chrome');           // system Google Chrome; pass --channel '' for Playwright's own
const statePath = path.join(rootDir, '.cache', 'partner-photos-state.json');
const cachePath = path.join(rootDir, '.cache', 'all-hotels.json');

const all = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
const state = fs.existsSync(statePath) ? JSON.parse(fs.readFileSync(statePath, 'utf8')) : {};
let queue = all.filter((h) => h.bookingUrl && !state[h._id]);
// US first (decision D1), then India, then the rest
const rank = (h) => (/^(usa|united states)$/i.test(h.country) ? 0 : /^india$/i.test(h.country) ? 1 : 2);
queue.sort((a, b) => rank(a) - rank(b));
if (LIMIT) queue = queue.slice(0, LIMIT);
console.log(`${queue.length} hotels to process · workers=${WORKERS} · ${APPLY ? 'APPLY' : 'dry run'}`);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms + Math.random() * 800));
// Normalise every Booking.com photo to its 1024px version; the site picks smaller sizes by URL.
const normalise = (u) => u.replace(/\/(max\d+(x\d+)?|square\d+|\d+x\d+)\//, '/max1024x768/').replace(/^https:\/\/[a-z]-xx\.bstatic\.com/, 'https://cf.bstatic.com');

async function collect(page, h) {
  await page.goto(h.bookingUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2500);
  const finalUrl = page.url();
  if (!/\/hotel\/[a-z]{2}\//.test(finalUrl) || /searchresults|closed_msg/.test(finalUrl)) return { status: 'not-hotel-page' };
  const urls = await page.evaluate(() => {
    const og = document.querySelector('meta[property="og:image"]')?.content || '';
    const imgs = [...document.querySelectorAll('img')].map((i) => i.currentSrc || i.src);
    return [og, ...imgs].filter((s) => /bstatic\.com\/xdata\/images\/hotel\//.test(s));
  }).catch(() => []);
  const seen = new Set(); const photos = [];
  for (const u of urls) {
    const n = normalise(u.split('&')[0]);
    const id = n.match(/\/(\d+)\.(jpg|jpeg|webp)/)?.[1];
    if (!id || seen.has(id)) continue;
    seen.add(id); photos.push(n);
    if (photos.length >= 8) break;
  }
  return photos.length ? { status: 'ok', photos } : { status: 'no-photos' };
}

let pending = [];
let col = null, mongoose = null;
async function flush(force = false) {
  if (!APPLY || (!force && pending.length < 40)) return;
  const batch = pending; pending = [];
  const rows = batch.filter((r) => r.photos);
  try {
  if (rows.length) {
    if (!col) {
      mongoose = (await import('mongoose')).default;
      await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 20000 });
      col = mongoose.connection.db.collection('hotels');
    }
    await col.bulkWrite(rows.map((r) => ({ updateOne: { filter: { _id: new mongoose.Types.ObjectId(r._id) }, update: { $set: { partnerImages: r.photos } } } })));
    const byId = new Map(all.map((h) => [String(h._id), h]));
    for (const r of rows) { const h = byId.get(String(r._id)); if (h) h.partnerImages = r.photos; }
    fs.writeFileSync(cachePath + '.tmp', JSON.stringify(all)); fs.renameSync(cachePath + '.tmp', cachePath);
  }
  for (const r of batch) state[r._id] = r.status;
  fs.writeFileSync(statePath, JSON.stringify(state));
  } catch (e) {
    // a dropped database connection must not kill the run: keep the batch and retry with the next one
    console.warn('flush failed, will retry:', e.message.slice(0, 100));
    pending = batch.concat(pending);
    if (col) { await mongoose.disconnect().catch(() => {}); col = null; }
  }
}

const browser = await chromium.launch({ headless: true, ...(CHANNEL ? { channel: CHANNEL } : {}) });
const tally = {}; let done = 0; const t0 = Date.now();
async function worker() {
  const ctx = await browser.newContext({ userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36', locale: 'en-US' });
  await ctx.route('**/*', (r) => (['image', 'font', 'media'].includes(r.request().resourceType()) ? r.abort() : r.continue()));
  const page = await ctx.newPage();
  while (queue.length) {
    const h = queue.shift();
    let r;
    try { r = await collect(page, h); } catch (e) { r = { status: 'error' }; }
    tally[r.status] = (tally[r.status] || 0) + 1;
    pending.push({ _id: h._id, ...r });
    if (!APPLY && done < 5) console.log(' ', h.name, '|', r.status, r.photos?.[0] || '');
    if (++done % 20 === 0) console.log(`[${done}] ${Math.round(done / ((Date.now() - t0) / 3600000))}/h ${JSON.stringify(tally)}`);
    await flush();
    await sleep(1500);
  }
  await ctx.close();
}
process.on('SIGINT', async () => { await flush(true).catch(() => {}); process.exit(0); });
await Promise.all(Array.from({ length: WORKERS }, worker));
await flush(true);
await browser.close();
if (mongoose) await mongoose.disconnect();
console.log('Done.', JSON.stringify(tally));
