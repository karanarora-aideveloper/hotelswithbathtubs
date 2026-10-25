// Iteration runner: validate and repair Booking.com + Agoda links for EVERY hotel, with a real browser.
//
//   node scripts/repair-all-links.mjs --workers 4 --apply          (resumable; Ctrl-C safe)
//   node scripts/repair-all-links.mjs --limit 20                    (dry run on 20 hotels)
//
// Decisions per hotel (nothing is ever replaced with a search URL):
//   Booking.com  ok          -> keep (store the canonical address if Booking redirected to a new slug)
//                dead        -> search Booking.com by name + city, verify the opened page names this hotel
//                               and city, replace; if nothing verifies -> bookingUrl = null
//                unverified  -> bot challenge never cleared: keep the old link, flag it, do NOT null it
//   Agoda        lands on the Agoda homepage or another hotel -> agodaUrl = null
//   Trip.com     /hotels/list?keyword= (renders "0 properties found") -> tripUrl = null (resolved later)
//   legacy url   if it equalled the old Booking link it is updated / nulled with it
// State is checkpointed to .cache/link-repair-state.json; DB + .cache/all-hotels.json are written in
// batches, and the first-seen old values are appended to .cache/link-repair-backup-all.jsonl.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';
import dotenv from 'dotenv';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: path.join(rootDir, '.env.local'), quiet: true });
const args = process.argv.slice(2);
const opt = (f, d) => { const i = args.indexOf(f); return i === -1 ? d : args[i + 1]; };
const WORKERS = parseInt(opt('--workers', '4'), 10);
const LIMIT = parseInt(opt('--limit', '0'), 10);
const APPLY = args.includes('--apply');
// Multi-machine options: a second machine runs a shard with --no-db and its own --tag; its results are
// pulled back and applied from this machine (scripts/apply-remote-results.mjs), so the database
// credentials never leave the primary machine.
const NODB = args.includes('--no-db');
const TAG = opt('--tag', 'agoda');
const SHARD = opt('--shard', '');
const IDS_FILE = opt('--ids-file', '');     // process exactly these hotel ids (retry pass), ignoring other done-state          // "K/N": take every Nth hotel starting at K
const CHROMIUM_PATH = opt('--chromium', '');
const SKIP_AGODA = args.includes('--skip-agoda'); // Agoda throttles automated checks; handled in a separate pass
const ONLY = (opt('--only', '') || '').toLowerCase().split('|').filter(Boolean);
const SKIP_CITIES = new Set((opt('--skip-cities', 'surat,tirupati')).split(',').map((s) => s.trim()));
const BATCH = 40;
const AID = '304142';

const STOP = new Set(['the', 'hotel', 'hotels', 'by', 'and', 'a', 'of', 'in', 'at', 'resort', 'spa', 'suites', 'suite', 'collection']);
const norm = (s) => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const tokens = (s) => new Set(norm(s).match(/[a-z0-9]+/g)?.filter((t) => !STOP.has(t)) || []);
// Our names often carry an area suffix ("The Oberoi, Mumbai (Nariman Point)"), which Booking.com omits.
// Score the full name and the "core" name (before a comma / bracket / dash / slash) and take the better.
const coreName = (n) => (n || '').replace(/\(.*?\)/g, ' ').split(/,| - | – | \| |\//)[0].trim();
const frac = (name, text) => {
  const t = tokens(name); if (!t.size) return 0;
  const hay = tokens(text); let hit = 0;
  for (const x of t) if (hay.has(x)) hit++;
  return hit / t.size;
};
const score = (name, text) => Math.max(frac(name, text), frac(coreName(name), text));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms + Math.random() * 1000));
const ALIASES = [['bengaluru', 'bangalore'], ['mumbai', 'bombay'], ['gurugram', 'gurgaon'], ['kolkata', 'calcutta'], ['chennai', 'madras'], ['kochi', 'cochin'], ['pune', 'poona'], ['mysuru', 'mysore'], ['thiruvananthapuram', 'trivandrum'], ['varanasi', 'benares'], ['prayagraj', 'allahabad'], ['panaji', 'panjim'], ['new delhi', 'delhi'], ['ho chi minh city', 'saigon'], ['kyoto', 'kyoto'], ['istanbul', 'istanbul']];
const cityWords = (c) => {
  const n = norm(c); const w = [n.match(/[a-z0-9]+/g)?.[0] || ''];
  for (const g of ALIASES) if (g.some((x) => n.includes(x))) w.push(...g.map((x) => x.split(' ')[0]));
  return [...new Set(w.filter(Boolean))];
};
const cityIn = (text, city) => { const t = norm(text); return cityWords(city).some((w) => t.includes(w)); };

const cachePath = path.join(rootDir, '.cache', 'all-hotels.json');
const mainStatePath = path.join(rootDir, '.cache', 'link-repair-state.json');
const statePath = TAG ? path.join(rootDir, '.cache', `link-repair-state.${TAG}.json`) : mainStatePath;
const backupPath = path.join(rootDir, '.cache', TAG ? `link-repair-backup-all.${TAG}.jsonl` : 'link-repair-backup-all.jsonl');
const all = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
const state = fs.existsSync(statePath) ? JSON.parse(fs.readFileSync(statePath, 'utf8')) : {};
const mainState = TAG && fs.existsSync(mainStatePath) ? JSON.parse(fs.readFileSync(mainStatePath, 'utf8')) : {};

const PENDING = fs.existsSync(path.join(rootDir, '.cache', 'agoda-search-pending.json')) ? JSON.parse(fs.readFileSync(path.join(rootDir, '.cache', 'agoda-search-pending.json'), 'utf8')) : {};
for (const h of all) if (!h.agodaUrl && PENDING[h._id]) h.agodaUrl = PENDING[h._id];   // old id-only link, emptied in the data on purpose
let queue = all.filter((h) => !state[h._id] && h.agodaUrl);
// India first (most traffic), then the rest

if (ONLY.length) queue = all.filter((h) => ONLY.some((o) => norm(h.name).includes(o)));
const TAIL = parseInt(opt('--tail', '0'), 10);
if (TAIL) queue = queue.slice(-TAIL);
if (IDS_FILE) { const ids = new Set(JSON.parse(fs.readFileSync(IDS_FILE, 'utf8')).map(String)); queue = all.filter((h) => ids.has(String(h._id)) && !state[h._id]); }
if (SHARD) { const [ks, n] = SHARD.split('/'); const keep = new Set(ks.split(',').map(Number)); queue = queue.filter((_, i) => keep.has(i % Number(n))); }   // e.g. 2,3,4,5,6/7
if (args.includes('--reverse')) queue.reverse();   // work from the other end of the list so two machines meet in the middle
if (LIMIT) queue = queue.slice(0, LIMIT);
console.log(`${queue.length} hotels to process (${Object.keys(state).length} already done) · workers=${WORKERS} · ${APPLY ? 'APPLY' : 'dry run'}`);

// --scrapfly: use Scrapfly's cloud Chrome (Unblock Mode is NOT enabled) instead of a local browser.
const SCRAPFLY = args.includes('--scrapfly');
if (SCRAPFLY && !process.env.SCRAPFLY_API_KEY) { console.error('SCRAPFLY_API_KEY missing in .env.local'); process.exit(1); }
const scrapflyUrl = () => `wss://browser.scrapfly.io?api_key=${process.env.SCRAPFLY_API_KEY}&proxy_pool=public_datacenter_pool&os=linux&browser_brand=chrome&target_url=${encodeURIComponent('https://www.booking.com')}&block_images=true&block_fonts=true&block_media=true&timeout=1800`;
// --cfrun: Cloudflare Browser Run (cloud Chrome that identifies itself as a bot; no bypass features).
//   needs CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN (permission: Browser Rendering - Edit) in .env.local
const CFRUN = args.includes('--cfrun');
if (CFRUN && !(process.env.CLOUDFLARE_ACCOUNT_ID && process.env.CLOUDFLARE_API_TOKEN)) { console.error('CLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_API_TOKEN missing in .env.local'); process.exit(1); }
const cfRunUrl = () => `wss://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/browser-run/devtools/browser?keep_alive=600000`;
const meter = { bytes: 0, browserSeconds: 0 };
const browser = (SCRAPFLY || CFRUN) ? null : await chromium.launch({ headless: true, ...(CHROMIUM_PATH ? { executablePath: CHROMIUM_PATH, args: ['--no-sandbox', '--disable-dev-shm-usage'] } : {}) });
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

class Tab {
  constructor(page) { this.page = page; }
  async open(url) {
    try {
      const res = await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 25000 });
      await this.page.waitForLoadState('load', { timeout: 10000 }).catch(() => {});
      await this.page.waitForTimeout(1200);
      return res?.status() ?? 0;
    } catch { return 0; }
  }
  async ev(fn, fallback) {
    for (let i = 0; i < 3; i++) { try { return await this.page.evaluate(fn); } catch { await this.page.waitForTimeout(1000); } }
    return fallback;
  }
  async read() {
    const title = await this.page.title().catch(() => '');
    const h1 = await this.ev(() => document.querySelector('h1, h2.pp-header__title')?.textContent?.trim() || '', '');
    const hotelId = await this.ev(() => document.documentElement.innerHTML.match(/b_hotel_id\s*[:=]\s*['"]?(\d+)/)?.[1] || null, null);
    const addr = await this.ev(() => document.querySelector('[data-node_tt_id="location_score_tooltip"], .hp_address_subtitle, [data-testid="address"]')?.textContent?.trim() || '', '');
    return { title, h1, hotelId, addr, finalUrl: this.page.url() };
  }

  // 'ok' | 'dead' | 'challenge'
  async inspectBooking(url, hotel) {
    let status = await this.open(url);
    let r = await this.read();
    const looksChallenge = (s, x) => s === 202 || /chal_t=/.test(x.finalUrl) || (!x.title && !x.h1) || /^Loading https:/.test(x.title);
    for (let i = 0; i < 2 && looksChallenge(status, r) && !/searchresults|closed_msg/.test(r.finalUrl + r.title); i++) {
      await this.page.waitForTimeout(6000);
      r = await this.read();
      if (!r.h1 && looksChallenge(status, r)) { status = await this.open(url); r = await this.read(); }
      else status = 200;
    }
    const nameScore = Math.max(score(hotel.name, r.title), score(hotel.name, r.h1));
    const isSearch = /searchresults|closed_msg|\/city\/|\/region\//.test(r.finalUrl + r.title) || /^Search hotels in/i.test(r.title);
    const cityOk = cityIn(`${r.title} ${r.h1} ${r.addr} ${r.finalUrl}`, hotel.city);
    const strongName = nameScore >= 0.99 && tokens(coreName(hotel.name)).size >= 2;
    const onHotelPage = /\/hotel\/[a-z]{2}\//.test(r.finalUrl) && !isSearch;
    let verdict;
    if (onHotelPage && status === 200 && nameScore >= 0.6 && (cityOk || r.hotelId || strongName)) verdict = 'ok';
    else if (status === 404 || isSearch || (onHotelPage && status === 200 && r.h1 && nameScore < 0.4)) verdict = 'dead';
    else if (looksChallenge(status, r)) verdict = 'challenge';
    else if (status === 200 && r.title && !onHotelPage) verdict = 'dead'; // redirected away from a hotel page
    else verdict = 'challenge'; // page failed to load or is unreadable: unknown, never treated as dead
    return { verdict, status, ...r, nameScore: +nameScore.toFixed(2) };
  }

  async searchBooking(hotel) {
    const core = coreName(hotel.name) || hotel.name;
    let loaded = false;
    // Booking.com's search returns nothing for accented queries ("Hôtel Ritz Paris"), so strip accents,
    // and do not repeat the city when the hotel name already contains it.
    const plain = norm(core);
    const withCity = norm(hotel.city) && plain.includes(norm(hotel.city)) ? plain : `${plain} ${norm(hotel.city)}`;
    for (const q of [withCity, plain]) {
      await this.open(`https://www.booking.com/searchresults.html?ss=${encodeURIComponent(q)}&aid=${AID}&lang=en-us&group_adults=2&no_rooms=1`);
      await this.page.waitForSelector('[data-testid="property-card"]', { timeout: 7000 }).catch(() => {});
      const cands = await this.ev(() => {
        const out = []; const seen = new Set();
        for (const card of document.querySelectorAll('[data-testid="property-card"]')) {
          const a = card.querySelector('a[data-testid="title-link"], a[href*="/hotel/"]');
          if (!a) continue;
          const href = a.href.split('?')[0];
          if (seen.has(href)) continue; seen.add(href);
          out.push({ href, name: card.querySelector('[data-testid="title"]')?.textContent?.trim() || a.textContent.trim(), loc: card.querySelector('[data-testid="address"]')?.textContent?.trim() || '' });
        }
        return out.slice(0, 8);
      }, []);
      if (cands.length) return { cands, loaded: true };
      const body = await this.ev(() => document.body?.innerText?.slice(0, 4000) || '', '');
      // Booking.com sends an unknown name back to its homepage: a definitive "no such property" answer
      if (/properties? found|no properties|couldn.t find|0 properties/i.test(body) || /^https:\/\/www\.booking\.com\/?(\?.*)?$/.test(this.page.url())) loaded = true;
      await sleep(1500);
    }
    return { cands: [], loaded };
  }

  async checkAgoda(url, hotel) {
    await this.open(url);
    const title = await this.page.title().catch(() => '');
    const finalUrl = this.page.url();
    const h1 = await this.ev(() => document.querySelector('h1')?.textContent?.trim() || '', '');
    const onHome = /agoda\.com\/([a-z]{2}-[a-z]{2}\/?)?(\?|$)/.test(finalUrl);
    const s = Math.max(score(hotel.name, title), score(hotel.name, h1), score(hotel.name, finalUrl));
    const blocked = /captcha|access denied|just a moment/i.test(title);
    const loadedOk = !!title && /agoda\.com/.test(finalUrl);
    return { dead: loadedOk && !blocked && (onHome || s < 0.5), blocked: blocked || !loadedOk, finalUrl, title, nameScore: +s.toFixed(2) };
  }
}

// ---------------- Agoda-specific logic ----------------
const AGODA_HOME = /agoda\.com\/([a-z]{2}-[a-z]{2}\/?)?(\?.*)?$/;
const cleanAgoda = (u) => {
  try { const x = new URL(u, 'https://www.agoda.com'); return `https://www.agoda.com${x.pathname.replace(/^\/[a-z]{2}-[a-z]{2}\//, '/')}`; } catch { return null; }
};

// Opens an Agoda property page and decides whether it is this hotel.
//   ok -> the page names this hotel (and city) | bad -> homepage, search page or another hotel | unknown -> blocked/unreadable
Tab.prototype.checkAgodaPage = async function (url, hotel) {
  await this.open(url);
  await this.page.waitForSelector('h1', { timeout: 9000 }).catch(() => {});
  const finalUrl = this.page.url();
  const title = await this.page.title().catch(() => '');
  const h1 = await this.ev(() => document.querySelector('h1')?.textContent?.trim() || '', '');
  if (/captcha|access denied|just a moment|are you a robot/i.test(title)) return { verdict: 'unknown', finalUrl, title, h1 };
  if (AGODA_HOME.test(finalUrl) || /\/search\?/.test(finalUrl)) return { verdict: 'bad', finalUrl, title, h1 };
  if (!/\/hotel\//.test(finalUrl) || !h1) return { verdict: 'unknown', finalUrl, title, h1 };
  const s = Math.max(score(hotel.name, h1), score(hotel.name, title));
  const cityOk = cityIn(`${h1} ${title} ${finalUrl}`, hotel.city);
  const strong = s >= 0.99 && tokens(coreName(hotel.name)).size >= 2;
  if (s >= 0.6 && (cityOk || strong)) return { verdict: 'ok', finalUrl, title, h1, nameScore: +s.toFixed(2), cleanUrl: cleanAgoda(finalUrl) };
  return { verdict: 'bad', finalUrl, title, h1, nameScore: +s.toFixed(2) };
};

// Old links carried only Agoda's internal property id. Agoda's partner route lands on the city list with
// that property pinned near the top; pick the card that names this hotel and verify its own page.
Tab.prototype.resolveAgodaById = async function (id, hotel) {
  await this.open(`https://www.agoda.com/partners/partnersearch.aspx?hid=${id}&cid=1972736`);
  await this.page.waitForSelector('a[href*="/hotel/"]', { timeout: 9000 }).catch(() => {});
  await this.page.waitForTimeout(1500);
  const cur = this.page.url();
  if (/\/hotel\//.test(cur) && !/\/search\?/.test(cur)) return this.checkAgodaPage(cur, hotel);   // landed straight on the property
  const cards = await this.ev(() => {
    const out = [];
    for (const a of document.querySelectorAll('a[href*="/hotel/"]')) {
      const card = a.closest('[data-selenium="hotel-item"], li, [data-element-name="property-card"]') || a;
      const name = (card.querySelector('[data-selenium="hotel-name"], h3')?.textContent || a.textContent || '').trim().slice(0, 80);
      if (name) out.push({ name, href: a.getAttribute('href') });
      if (out.length >= 10) break;
    }
    return out;
  }, []);
  if (process.env.AGODA_DEBUG) console.log('   cards for', hotel.name, '=>', JSON.stringify(cards.slice(0, 5)), 'url', cur.slice(0, 80));
  if (!cards.length) return { verdict: 'unknown' };
  const best = cards.map((c) => ({ ...c, s: score(hotel.name, c.name) })).filter((c) => c.s >= 0.6).sort((a, b) => b.s - a.s)[0];
  if (!best) return { verdict: 'bad', note: 'no matching card' };
  await sleep(800);
  return this.checkAgodaPage(`https://www.agoda.com${cleanAgoda(best.href).replace('https://www.agoda.com', '')}`, hotel);
};

async function processHotel(tab, h) {
  const row = { _id: h._id, name: h.name, city: h.city, country: h.country, old: { agodaUrl: h.agodaUrl || null }, set: {}, notes: [] };
  const url = h.agodaUrl;
  const idMatch = url.match(/selectedproperty=(\d+)/) || url.match(/[?&]hid=(\d+)/);
  let r;
  const attempt = () => (idMatch ? tab.resolveAgodaById(idMatch[1], h) : tab.checkAgodaPage(url, h));
  r = await attempt();
  // Agoda sometimes serves a blank page under load: wait and try once more before giving up.
  for (let i = 0; i < 2 && r.verdict === 'unknown'; i++) { await sleep(6000); r = await attempt(); }

  if (r.verdict === 'ok') {
    const clean = r.cleanUrl;
    if (clean && clean !== url) { row.set.agodaUrl = clean; row.agoda = idMatch || clean !== url.split('?')[0] ? 'replaced' : 'ok'; }
    else row.agoda = 'ok';
    if (row.agoda === 'ok') delete row.set.agodaUrl;
  } else if (r.verdict === 'bad' || idMatch) {
    // An id-only search link is known to land on a city list or the homepage, so if it could not be
    // resolved to a property page it is emptied (a page-style link that merely could not be read is kept).
    row.set.agodaUrl = null; row.agoda = 'nulled';
  } else {
    row.agoda = 'unverified'; row.notes.push(r.note || 'page unreadable; link kept');
  }
  row.booking = row.agoda;     // reuse the progress counters
  return row;
}

// ---- persistence ----
let pending = [];
let dbReady = null;
async function getCol() {
  if (!dbReady) {
    const mongoose = (await import('mongoose')).default;
    for (let i = 0; i < 4 && !dbReady; i++) {
      try {
        await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 20000 });
        dbReady = { mongoose, col: mongoose.connection.db.collection('hotels') };
      } catch (e) { console.warn('Mongo connect failed, retrying:', e.message.slice(0, 80)); await sleep(5000); }
    }
    if (!dbReady) throw new Error('Mongo unreachable');
  }
  return dbReady;
}
const byId = new Map(all.map((h) => [String(h._id), h]));
let flushing = false;
async function flush(force = false) {
  if ((!APPLY && !NODB) || flushing) return;
  if (!force && pending.length < BATCH) return;
  flushing = true;
  try {
    const batch = pending; pending = [];
    if (NODB) { for (const r of batch) state[r._id] = r._state; fs.writeFileSync(statePath, JSON.stringify(state)); return; }
    const rows = batch.filter((r) => Object.keys(r.set).length);
    try {
      if (rows.length) {
        const { mongoose, col } = await getCol();
        await col.bulkWrite(rows.map((r) => ({ updateOne: { filter: { _id: new mongoose.Types.ObjectId(r._id) }, update: { $set: { ...r.set, updatedAt: new Date() } } } })));
        fs.appendFileSync(backupPath, rows.map((r) => JSON.stringify({ _id: r._id, name: r.name, old: r.old, set: r.set })).join('\n') + '\n');
        for (const r of rows) { const h = byId.get(String(r._id)); if (h) Object.assign(h, r.set, { updatedAt: new Date().toISOString() }); }
        fs.writeFileSync(cachePath + '.tmp', JSON.stringify(all));
        fs.renameSync(cachePath + '.tmp', cachePath);
      }
      // state is recorded only after the database write succeeded
      for (const r of batch) state[r._id] = r._state;
      fs.writeFileSync(statePath, JSON.stringify(state));
    } catch (e) {
      console.warn('flush failed, will retry with next batch:', e.message.slice(0, 100));
      pending = batch.concat(pending);
    }
  } finally { flushing = false; }
}

// ---- run ----
let done = 0, challengeStreak = 0;
const t0 = Date.now();
const tally = {};
const bump = (k) => { tally[k] = (tally[k] || 0) + 1; };

async function worker(id) {
  const wStart = Date.now();
  let remote = null;
  let ctx;
  if (SCRAPFLY || CFRUN) {
    remote = CFRUN
      ? await chromium.connectOverCDP(cfRunUrl(), { headers: { Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}` } })
      : await chromium.connectOverCDP(scrapflyUrl());
    ctx = remote.contexts()[0] || (await remote.newContext());
    ctx.on('requestfinished', async (req) => { try { meter.bytes += (await req.sizes()).responseBodySize + (await req.sizes()).responseHeadersSize; } catch {} });
  } else {
    ctx = await browser.newContext({ userAgent: UA, locale: 'en-US', viewport: { width: 1366, height: 900 } });
  }
  // images, fonts and video are not needed to read titles/headings: skipping them cuts load time a lot
  await ctx.route('**/*', (route) => (['image', 'font', 'media'].includes(route.request().resourceType()) ? route.abort() : route.continue()));
  const tab = new Tab(await ctx.newPage());
  while (queue.length) {
    const h = queue.shift();
    let row;
    try { row = await processHotel(tab, h); }
    catch (e) { row = { _id: h._id, name: h.name, city: h.city, set: {}, old: {}, notes: [`error: ${e.message.slice(0, 80)}`], booking: 'error' }; }
    row._state = { b: row.booking, a: row.agoda, t: row.trip, set: row.set, notes: row.notes, name: row.name, old: row.old };
    pending.push(row);
    bump(`booking:${row.booking || '-'}`); if (row.agoda) bump(`agoda:${row.agoda}`);
    done++;
    if (row.agoda === 'nulled' || row.agoda === 'replaced') console.log(`  AGODA ${row.agoda.toUpperCase()}: ${row.name} (${row.city}) ${row.set.agodaUrl ?? ''}`);
    challengeStreak = row.booking === 'unverified' ? challengeStreak + 1 : 0;
    if (done % 10 === 0) {
      const rate = done / ((Date.now() - t0) / 3600000);
      console.log(`[${done}/${done + queue.length}] ${Math.round(rate)}/h · ETA ${(queue.length / rate).toFixed(1)}h · ${JSON.stringify(tally)}`);
    }
    if (challengeStreak >= 6) { console.warn('Many unresolved bot challenges in a row; pausing 5 min.'); challengeStreak = 0; await sleep(300000); }
    if (pending.length >= BATCH) await flush();
    await sleep(1200);
  }
  if (SCRAPFLY || CFRUN) { meter.browserSeconds += (Date.now() - wStart) / 1000; await remote.close().catch(() => {}); }
  else await ctx.close();
}

process.on('SIGINT', async () => { console.log('\nInterrupted; saving...'); await flush(true).catch(() => {}); process.exit(0); });
await Promise.all(Array.from({ length: WORKERS }, (_, i) => worker(i)));
await flush(true);
if (browser) await browser.close();
if (dbReady) await dbReady.mongoose.disconnect();
console.log('\nDone.', JSON.stringify(tally));
if (CFRUN) {
  const hrs = meter.browserSeconds / 3600;
  console.log(`Browser Run usage: ${meter.browserSeconds.toFixed(0)} browser-seconds (${hrs.toFixed(2)} h ≈ $${(Math.max(hrs - 0, 0) * 0.09).toFixed(2)} at $0.09/h beyond the 10 h included) for ${done} hotels; wall clock ${((Date.now() - t0) / 1000).toFixed(0)}s`);
}
if (SCRAPFLY) {
  const mb = meter.bytes / 1048576;
  const credits = meter.browserSeconds / 30 + mb * 7;
  console.log(`Scrapfly usage: ${meter.browserSeconds.toFixed(0)} browser-seconds, ${mb.toFixed(1)} MB → ≈${credits.toFixed(0)} credits for ${done} hotels (≈${(credits / Math.max(done, 1)).toFixed(1)} per hotel); wall clock ${((Date.now() - t0) / 1000).toFixed(0)}s`);
}
