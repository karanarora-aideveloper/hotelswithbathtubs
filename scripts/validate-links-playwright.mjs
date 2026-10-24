// Small, rate-limited live validation of outbound links using headless Chromium.
// Read-only: writes results to .cache/ only, never touches the database or all-hotels.json.
//
//   node scripts/validate-links-playwright.mjs --booking 40 --trip 20 [--headed]
//
// If a site shows a CAPTCHA / bot challenge the row is recorded as `blocked` and
// the script does NOT try to get around it.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cachePath = path.join(rootDir, '.cache', 'all-hotels.json');
const args = process.argv.slice(2);
const num = (flag, d) => { const i = args.indexOf(flag); return i === -1 ? d : parseInt(args[i + 1], 10); };
const bookingN = num('--booking', 40);
const tripN = num('--trip', 20);
const delayMs = num('--delay', 4000);
const headed = args.includes('--headed');

const STOP = new Set(['the', 'hotel', 'hotels', 'by', 'and', 'a', 'of', 'in', 'at', 'resort', 'spa', 'suites', 'suite']);
const norm = (s) => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const tokens = (s) => new Set(norm(s).match(/[a-z0-9]+/g)?.filter((t) => !STOP.has(t)) || []);
function nameScore(name, text) {
  const t = tokens(name);
  if (!t.size) return 0;
  const hay = tokens(text);
  let hit = 0;
  for (const x of t) if (hay.has(x)) hit++;
  return hit / t.size;
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms + Math.random() * 1500));
const BLOCK_RE = /captcha|are you a robot|access denied|verify you are human|unusual traffic|just a moment/i;

const all = JSON.parse(fs.readFileSync(cachePath, 'utf8'));

function pick(rows, n) {
  // deterministic spread across the list so regions are mixed
  if (rows.length <= n) return rows;
  const step = rows.length / n;
  return Array.from({ length: n }, (_, i) => rows[Math.floor(i * step)]);
}

const browser = await chromium.launch({ headless: !headed });
const ctx = await browser.newContext({
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  locale: 'en-US',
  extraHTTPHeaders: { 'Accept-Language': 'en-US,en;q=0.9' },
  viewport: { width: 1366, height: 900 },
});

async function safeEval(page, fn, fallback) {
  for (let i = 0; i < 3; i++) {
    try { return await page.evaluate(fn); } catch { await page.waitForTimeout(1500); }
  }
  return fallback;
}

async function load(page, url) {
  try {
    const res = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 25000 });
    await page.waitForLoadState('load', { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(2500);
    return res?.status() ?? 0;
  } catch (e) {
    return `error:${e.message.slice(0, 60)}`;
  }
}

async function checkBooking(page, h) {
  const status = await load(page, h.bookingUrl);
  if (typeof status === 'string') return { classification: 'error', note: status };
  const finalUrl = page.url();
  const title = await page.title().catch(() => '');
  const body = (await safeEval(page, () => document.body?.innerText || '', '')).slice(0, 3000);
  if (BLOCK_RE.test(title) || (!title && body.length < 200)) {
    return { status, finalUrl, title, classification: 'blocked' };
  }
  const hotelId = await safeEval(page,() => {
    const m = document.documentElement.innerHTML.match(/b_hotel_id\s*[:=]\s*['"]?(\d+)/);
    return m ? m[1] : null;
  }, null);
  const h1 = await safeEval(page, () => document.querySelector('h1, h2.pp-header__title')?.textContent?.trim() || '', '');
  const score = Math.max(nameScore(h.name, title), nameScore(h.name, h1));
  let classification;
  if (status === 404 || /searchresults|\/city\/|\/region\/|\/country\//.test(finalUrl) || /^(\d+\+? )?(best|top)?\s*hotels? in /i.test(title) || /\d+ (best )?hotels?/i.test(title)) {
    classification = 'search-page';
  } else if (/\/hotel\/[a-z]{2}\//.test(finalUrl) && (hotelId || score >= 0.6)) {
    classification = score >= 0.6 ? 'property-page' : 'wrong-property';
  } else {
    classification = 'search-page';
  }
  return { status, finalUrl, title, h1, hotelId, nameScore: +score.toFixed(2), classification };
}

async function resolveTrip(page, h) {
  // Trip.com ignores ?keyword= on /hotels/list (renders "0 properties found"), so drive the
  // search box: type the name, take the first suggestion, and read the property id Trip
  // puts in the resulting list URL (searchType=H & optionId=<hotelId>).
  const status = await load(page, 'https://www.trip.com/hotels/');
  if (typeof status === 'string') return { classification: 'error', note: status };
  const t0 = await page.title().catch(() => '');
  if (BLOCK_RE.test(t0)) return { status, title: t0, classification: 'blocked' };
  try {
    const inp = page.locator('input[type="text"]').first();
    await inp.click({ timeout: 8000 });
    await inp.fill(`${h.name} ${h.city}`);
    await page.waitForTimeout(3000);
    const sug = await safeEval(page, () => {
      const els = [...document.querySelectorAll('[class*="suggest" i] li, [class*="suggest" i] [role="option"], [class*="Suggest" i] div')];
      return els.map((e) => e.innerText.split('\n').slice(0, 3).join(' | ')).filter(Boolean).slice(0, 5);
    }, []);
    // click the first suggestion row that mentions the hotel's first token
    const first = [...tokens(h.name)][0] || h.name.split(' ')[0];
    const row = page.locator('li, [role="option"], div').filter({ hasText: new RegExp(first, 'i') }).filter({ hasText: /,/ }).last();
    await row.click({ timeout: 6000 });
    await page.waitForTimeout(800);
    await page.getByText('Search', { exact: true }).first().click({ timeout: 6000 });
    await page.waitForURL(/searchType=|hotels\/detail/, { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(1500);
    const u = new URL(page.url());
    const searchType = u.searchParams.get('searchType');
    const optionId = u.searchParams.get('optionId');
    const destName = u.searchParams.get('destName') || '';
    if (searchType !== 'H' || !optionId) {
      return { status, suggestions: sug, destName, classification: 'unresolved', note: `searchType=${searchType}` };
    }
    // verify: open the candidate detail page and name-match its title
    const detailUrl = `https://www.trip.com/hotels/detail/?hotelId=${optionId}`;
    await sleep(1500);
    await load(page, detailUrl);
    const title = await page.title().catch(() => '');
    const h1 = await safeEval(page, () => document.querySelector('h1')?.textContent?.trim() || '', '');
    const score = Math.max(nameScore(h.name, title), nameScore(h.name, h1), nameScore(h.name, destName));
    return {
      status, destName, hotelId: optionId, title, h1, nameScore: +score.toFixed(2),
      classification: score >= 0.75 ? 'resolved' : 'low-confidence',
      resolvedUrl: score >= 0.75 ? detailUrl : null,
    };
  } catch (e) {
    return { status, classification: 'unresolved', note: e.message.slice(0, 80) };
  }
}

const results = { startedAt: new Date().toISOString(), booking: [], trip: [] };
const out = path.join(rootDir, '.cache', 'validate-links-playwright-report.json');
const save = () => fs.writeFileSync(out, JSON.stringify(results, null, 2));

const page = await ctx.newPage();
let blockedStreak = 0;

const bookingRows = all.filter((h) => h.bookingUrl);
const nouvata = bookingRows.find((h) => /nouvata/i.test(h.name));
const bSample = pick(bookingRows.filter((h) => h !== nouvata), bookingN - (nouvata ? 1 : 0));
if (nouvata) bSample.unshift(nouvata);

for (const h of bSample) {
  const r = await checkBooking(page, h);
  results.booking.push({ name: h.name, city: h.city, country: h.country, url: h.bookingUrl, ...r });
  console.log(`[booking] ${r.classification.padEnd(14)} ${h.name} (${h.city}) ${r.nameScore ?? ''}`);
  blockedStreak = r.classification === 'blocked' ? blockedStreak + 1 : 0;
  save();
  if (blockedStreak >= 3) { console.warn('3 consecutive blocks on Booking.com; stopping that platform.'); break; }
  await sleep(delayMs);
}

blockedStreak = 0;
const tripRows = all.filter((h) => h.tripUrl && !/detail/.test(h.tripUrl));
for (const h of pick(tripRows, tripN)) {
  const r = await resolveTrip(page, h);
  results.trip.push({ name: h.name, city: h.city, country: h.country, url: h.tripUrl, ...r });
  console.log(`[trip]    ${r.classification.padEnd(14)} ${h.name} (${h.city}) ${r.nameScore ?? ''} ${r.destName ?? r.note ?? ''}`);
  blockedStreak = r.classification === 'blocked' ? blockedStreak + 1 : 0;
  save();
  if (blockedStreak >= 3) { console.warn('3 consecutive blocks on Trip.com; stopping that platform.'); break; }
  await sleep(delayMs);
}

results.finishedAt = new Date().toISOString();
const tally = (rows) => rows.reduce((m, r) => ((m[r.classification] = (m[r.classification] || 0) + 1), m), {});
results.summary = { booking: tally(results.booking), trip: tally(results.trip) };
save();
console.log('\nSummary', JSON.stringify(results.summary), '\nReport:', out);
await browser.close();
