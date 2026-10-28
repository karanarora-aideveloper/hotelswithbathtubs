import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';
import robotsParser from './vendor/robots-parser/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const worktreeDir = path.resolve(__dirname, '../..');
const pagesBaseDir = path.join(worktreeDir, 'data-collect', 'pages');

const lastFetchTime = {};
const robotsCache = {};
let activeBrowser = null;

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

export class BlockError extends Error {
  constructor(reason, status, url) {
    super(`BLOCK DETECTED: ${reason} (HTTP ${status}) at ${url}`);
    this.name = 'BlockError';
    this.reason = reason;
    this.status = status;
    this.url = url;
  }
}

export async function getRobots(origin) {
  if (robotsCache[origin]) return robotsCache[origin];
  const robotsUrl = `${origin}/robots.txt`;
  console.log(`[saver] Fetching robots.txt for ${origin}...`);
  try {
    const res = await fetch(robotsUrl, { headers: { 'User-Agent': USER_AGENT } });
    const text = await res.text();
    const parser = robotsParser(robotsUrl, text);
    robotsCache[origin] = parser;
    return parser;
  } catch (err) {
    console.error(`[saver] Error fetching robots.txt from ${robotsUrl}:`, err.message);
    throw err;
  }
}

export async function isAllowedByRobots(url) {
  const parsed = new URL(url);
  const parser = await getRobots(parsed.origin);
  const allowed = parser.isAllowed(url, '*');
  return allowed !== false; // null or true is allowed
}

export async function ensureDelay(hostname, minDelayMs = 10000) {
  const last = lastFetchTime[hostname];
  const now = Date.now();
  if (last) {
    const elapsed = now - last;
    if (elapsed < minDelayMs) {
      const waitTime = minDelayMs - elapsed;
      console.log(`[saver] Waiting ${(waitTime / 1000).toFixed(2)}s to respect honest ${minDelayMs / 1000}s rate limit for ${hostname}...`);
      await new Promise(r => setTimeout(r, waitTime));
    }
  }
  lastFetchTime[hostname] = Date.now();
}

async function getBrowser() {
  if (!activeBrowser || (typeof activeBrowser.isConnected === 'function' && !activeBrowser.isConnected())) {
    activeBrowser = await puppeteer.launch({
      executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
  }
  return activeBrowser;
}

export async function closeBrowser() {
  if (activeBrowser) {
    await activeBrowser.close();
    activeBrowser = null;
  }
}

function detectBlock(html, status, url) {
  if (status === 202 || status === 403 || status === 429) {
    return `HTTP ${status}`;
  }
  const lower = html.toLowerCase();
  if (
    lower.includes('verify you are human') ||
    lower.includes("verify that you're not a robot") ||
    lower.includes('unusual traffic') ||
    lower.includes('cf-browser-verification') ||
    lower.includes('challenge-container')
  ) {
    return 'Verification/Challenge text detected in page';
  }
  // Check for suspicious tiny pages
  if (html.length < 5000 && !url.endsWith('.xml')) {
    return `Abnormally small page length (${html.length} bytes)`;
  }
  return null;
}

export async function savePage(site, url, filenameSlug, options = {}) {
  const parsedUrl = new URL(url);
  const outDir = path.join(pagesBaseDir, site);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const gzPath = path.join(outDir, `${filenameSlug}.html.gz`);
  const metaPath = path.join(outDir, `${filenameSlug}.meta.json`);

  if (options.skipIfExists && fs.existsSync(gzPath) && fs.existsSync(metaPath)) {
    console.log(`[saver] Page already saved at ${gzPath}, skipping fetch.`);
    const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
    return { skipped: false, cached: true, gzPath, metaPath, meta };
  }

  // 1. Check robots.txt
  const allowed = await isAllowedByRobots(url);
  if (!allowed) {
    console.log(`[saver] URL disallowed by robots.txt: ${url}`);
    return { skipped: true, reason: 'disallowed_by_robots_txt', url };
  }

  // 2. Slow and honest: at least 10s between pages on the same host
  await ensureDelay(parsedUrl.hostname, 10000);

  console.log(`[saver] [${site}] Fetching: ${url}`);
  let html = '';
  let finalStatus = 200;

  try {
    if (site === 'booking' || site.startsWith('booking')) {
      const browser = await getBrowser();
      const page = await browser.newPage();
      page.setDefaultNavigationTimeout(45000);
      await page.setUserAgent(USER_AGENT);

      page.on('response', res => {
        if (res.url().includes(filenameSlug) || res.url().includes('/hotel/') || res.url().includes('searchresults')) {
          finalStatus = res.status();
        }
      });

      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 35000 });
      } catch (e) {
        // May throw on reload/redirect, which is handled below
      }

      // Check if redirect / challenge is running
      let currentUrl = page.url();
      let currentContent = await page.content().catch(() => '');
      if (currentUrl.includes('chal_t') || finalStatus === 202 || currentContent.includes('challenge-container') || currentContent.includes('challenge.js')) {
        console.log(`[saver] Challenge redirect detected, waiting for final page load...`);
        await page.waitForNavigation({ waitUntil: 'load', timeout: 20000 }).catch(() => {});
        await new Promise(r => setTimeout(r, 4000));
      }

      try {
        html = await page.content();
      } catch (err) {
        if (err.message && (err.message.includes('detached') || err.message.includes('destroyed') || err.message.includes('navigation'))) {
          console.log(`[saver] Frame detached/navigated during content read, waiting 2s for settled page...`);
          await new Promise(r => setTimeout(r, 2000));
          html = await page.content();
        } else {
          throw err;
        }
      }
      await page.close().catch(() => {});
    } else {
      // S2 (Trip) and S3 (Cleartrip) use standard honest fetch
      const res = await fetch(url, {
        headers: {
          'User-Agent': USER_AGENT,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        }
      });
      finalStatus = res.status;
      html = await res.text();
    }
  } catch (err) {
    console.error(`[saver] Network/browser error fetching ${url}:`, err.message);
    throw err;
  }

  // 3. Stop at the first sign of a block
  const blockReason = detectBlock(html, finalStatus, url);
  if (blockReason) {
    const blockErr = new BlockError(blockReason, finalStatus, url);
    console.error(`[saver] 🚨 CRITICAL STOP: ${blockErr.message}`);
    throw blockErr;
  }

  // 4. Save raw HTML gzipped + metadata
  const gzBuffer = zlib.gzipSync(Buffer.from(html, 'utf-8'));
  fs.writeFileSync(gzPath, gzBuffer);

  const meta = {
    url,
    site,
    slug: filenameSlug,
    status: finalStatus,
    fetchedAt: new Date().toISOString(),
    rawSizeBytes: Buffer.byteLength(html, 'utf-8'),
    gzSizeBytes: gzBuffer.length
  };
  fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2), 'utf-8');

  console.log(`[saver] Saved ${filenameSlug}.html.gz (${(gzBuffer.length / 1024).toFixed(1)} KB gzipped)`);
  return { success: true, gzPath, metaPath, meta };
}
