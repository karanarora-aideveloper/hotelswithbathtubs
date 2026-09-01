/**
 * MMT Scraper using Playwright
 * =============================
 * Rewrite of mmt_uc.py in JS/Playwright (replaces the Python + Selenium +
 * undetected-chromedriver version).
 *
 * This script:
 * 1. Opens a headed Chromium window
 * 2. Searches for hotels in a city
 * 3. Applies MMT's own "Room Amenities" filter for Bathtub and/or Jacuzzi —
 *    so MMT itself only returns qualifying hotels, instead of scraping
 *    everything and guessing from page text.
 * 4. Visits each hotel detail page to grab the name + image
 * 5. Downloads hotel images (converts to WebP via sharp)
 * 6. Saves only filtered hotels to MongoDB
 *
 * Usage:
 *   node mmt_playwright.js [city]
 *   node mmt_playwright.js Kolkata
 *   node mmt_playwright.js Manali
 *
 * Note: Playwright does not ship the fingerprint-patching that
 * undetected-chromedriver provided. This script uses a realistic user
 * agent + a couple of common stealth tweaks, but is not guaranteed
 * undetectable the way the old uc-based script aimed to be.
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const sharp = require('sharp');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const workspaceDir = path.join(__dirname, '..');
const assetsDir = path.join(workspaceDir, 'public', 'assets');

const CITY = process.argv[2] || 'Udaipur';

// Which room-amenity checkboxes to select on MMT's listing filter.
// Matches aria-label text exactly (case-sensitive) as rendered by MMT.
const AMENITY_FILTERS = ['Bathtub', 'Jacuzzi'];

const BATHTUB_KEYWORDS = ['bathtub', 'bath tub', 'jacuzzi', 'soaking tub', 'hot tub', 'whirlpool', 'spa bath'];

console.log('\n' + '='.repeat(60));
console.log(`🏨 MMT Playwright Scraper — ${CITY}`);
console.log('='.repeat(60));

function fetchBuffer(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client
      .get(
        url,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            Referer: 'https://www.makemytrip.com/',
          },
        },
        (res) => {
          if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            fetchBuffer(res.headers.location).then(resolve, reject);
            return;
          }
          const chunks = [];
          res.on('data', (c) => chunks.push(c));
          res.on('end', () => resolve(Buffer.concat(chunks)));
          res.on('error', reject);
        }
      )
      .on('error', reject);
  });
}

async function downloadImage(url, slug) {
  if (!url) return null;
  try {
    const webpPath = path.join(assetsDir, `mmt-${slug}.webp`);
    if (fs.existsSync(webpPath)) {
      return `/assets/mmt-${slug}.webp`;
    }
    const buffer = await fetchBuffer(url);
    await sharp(buffer).webp({ quality: 85 }).toFile(webpPath);
    return `/assets/mmt-${slug}.webp`;
  } catch (e) {
    console.log(`    ⚠️ Image download failed: ${String(e.message || e).slice(0, 80)}`);
    return null;
  }
}

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/'/g, '')
    .replace(/,/g, '')
    .slice(0, 50);
}

async function firstLocator(page, selectors) {
  for (const sel of selectors) {
    const loc = page.locator(sel).first();
    if ((await loc.count()) > 0) return loc;
  }
  return null;
}

async function scrape() {
  const validatedHotels = [];
  const appliedFilters = [];

  console.log('Launching Chrome...');
  // Use the real, installed Google Chrome instead of Playwright's bundled
  // Chromium — MMT's bot detection appears to soft-block bundled Chromium's
  // fingerprint (URL/flow succeed, listing content just never renders),
  // while a normal Chrome session goes through fine.
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: false,
    args: ['--disable-blink-features=AutomationControlled'],
  });

  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1400, height: 900 },
    locale: 'en-IN',
  });

  // Minor stealth tweak — hide the automation flag most basic bot checks look for.
  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
  });

  const page = await context.newPage();

  try {
    console.log('Navigating to MMT homepage...');
    await page.goto('https://www.makemytrip.com/hotels/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000);

    // Close login popup — best effort, non-fatal if it fails.
    console.log('Closing login popup...');
    try {
      await page.evaluate(() => {
        const modal = document.querySelector('[class*="modal"], [class*="Modal"]');
        if (modal) modal.style.display = 'none';
      });
      await page.keyboard.press('Escape');
      await page.waitForTimeout(1000);
    } catch (e) {
      console.log(`  ⚠️ Popup-close step failed (${String(e.message || e).slice(0, 80)}), continuing`);
    }

    // Set the city
    console.log(`Setting city to ${CITY}...`);
    const cityInput = await firstLocator(page, ['#city', '[data-cy="city"]', 'input[placeholder*="city" i]']);

    if (cityInput) {
      // MMT's #city field is `readonly` by default — it only becomes
      // editable once MMT's own JS focus handler unlocks it. Playwright's
      // `.fill()` refuses to touch a readonly field outright (unlike
      // Selenium's send_keys), so clear + focus via JS first (mirroring
      // the working Python version) and type with real keyboard events.
      await cityInput.click({ force: true }).catch(() => {});
      await cityInput.evaluate((el) => {
        el.value = '';
        el.focus();
      });
      await page.waitForTimeout(300);
      await page.keyboard.type(CITY, { delay: 60 });
      await page.waitForTimeout(2000);

      const suggestions = page.locator('li[class*="suggest"], .autoSuggestList li, [class*="suggestionItem"]');
      if ((await suggestions.count()) > 0) {
        const text = (await suggestions.first().innerText()).slice(0, 50);
        console.log(`  Clicking: ${text}`);
        await suggestions.first().click({ force: true });
      } else {
        await cityInput.press('Enter');
      }
      await page.waitForTimeout(1000);
    } else {
      console.log('  City input not found, skipping direct-navigation fallback');
    }

    // Picking a city auto-opens a Check-in/Check-out date-range picker that
    // sits on top of the search button — it MUST be given two dates (a
    // click sets check-in, the next click sets check-out) before it closes.
    // Target the exact cells by aria-label (react-day-picker renders it as
    // `.toDateString()`, e.g. "Wed Aug 19 2026") so this doesn't depend on
    // where the days happen to land in the grid.
    const checkinDate = new Date();
    checkinDate.setDate(checkinDate.getDate() + 3);
    const checkoutDate = new Date();
    checkoutDate.setDate(checkoutDate.getDate() + 4);

    console.log(`Selecting dates ${checkinDate.toDateString()} → ${checkoutDate.toDateString()}...`);
    try {
      for (const [label, d] of [
        ['check-in', checkinDate],
        ['check-out', checkoutDate],
      ]) {
        const dateStr = d.toDateString();
        let cell = page.locator(`.DayPicker-Day[aria-label="${dateStr}"]`);
        if ((await cell.count()) === 0) {
          // Target month isn't showing yet — advance the calendar.
          const nextBtn = page.locator('.DayPicker-NavButton--next');
          if ((await nextBtn.count()) > 0) {
            await nextBtn.first().click({ force: true }).catch(() => {});
            await page.waitForTimeout(500);
            cell = page.locator(`.DayPicker-Day[aria-label="${dateStr}"]`);
          }
        }
        if ((await cell.count()) > 0) {
          await cell.first().click({ force: true });
          console.log(`  ✅ Selected ${label}: ${dateStr}`);
        } else {
          console.log(`  ⚠️ Could not find ${label} date cell for ${dateStr}`);
        }
        await page.waitForTimeout(600);
      }
    } catch (e) {
      console.log(`  ⚠️ Date picker step failed (${String(e.message || e).slice(0, 100)}), continuing`);
    }

    // Selecting checkout auto-opens the Rooms & Guests panel next. Defaults
    // (1 room / 2 adults) are fine — just Apply to close the panel.
    try {
      const applyBtn = page.locator('button:has-text("APPLY"), button:has-text("Apply")');
      if ((await applyBtn.count()) > 0) {
        await applyBtn.first().click({ force: true });
        console.log('  ✅ Applied Rooms & Guests defaults');
        await page.waitForTimeout(500);
      }
    } catch (e) {
      console.log(`  ⚠️ Rooms & Guests step failed (${String(e.message || e).slice(0, 100)}), continuing`);
    }

    // Click search
    console.log('Clicking Search...');
    const searchBtn = await firstLocator(page, ['#hsw_search_button', '[data-cy="submit"]', 'button.widgetSearchBtn']);
    if (searchBtn) {
      await searchBtn.click({ force: true });
      console.log('  ✅ Clicked search button');
    }

    // Don't just assume the click navigated — verify it in two separate
    // stages. Re-clicking Search once the URL is *already* correct just
    // to wait for slow content risks a stray second submit landing on a
    // detached/stale button reference — that's what produced a bare
    // text/plain "200-OK" stub response in an earlier run. So: confirm the
    // URL changed first (cheap, reliable), and only retry the click if the
    // URL itself never moved. Once the URL is right, just give the (heavy,
    // 1000+ result) SPA more time to render — no more clicking.
    let urlOk = false;
    try {
      await page.waitForURL(/hotel-listing/i, { timeout: 20000 });
      urlOk = true;
    } catch {
      console.log(`  ⚠️ URL didn't change (url: ${page.url()}) — retrying search click`);
      if (searchBtn) {
        await searchBtn.click({ force: true }).catch(() => {});
        await page.waitForURL(/hotel-listing/i, { timeout: 15000 }).then(
          () => (urlOk = true),
          () => {}
        );
      }
    }

    if (!urlOk) {
      console.log(`  ❌ Search never navigated (url: ${page.url()}, title: ${await page.title()})`);
    } else {
      console.log(`  URL confirmed (${page.url()}), waiting for listing content to render...`);
      const contentMarker = page.locator('a[href*="hotel-details"], :text("Properties")').first();
      const gotContent = await contentMarker
        .waitFor({ state: 'attached', timeout: 40000 })
        .then(() => true)
        .catch(() => false);
      if (gotContent) {
        console.log('  ✅ Listing content rendered');
      } else {
        console.log(`  ⚠️ URL is correct but no listing content showed up (title: ${await page.title()})`);
      }
    }

    console.log('Waiting for results to load...');
    await page.waitForTimeout(5000);

    // Apply the Room Amenities filter (Bathtub and/or Jacuzzi) so MMT itself
    // only returns hotels that actually have the amenity, instead of
    // scraping everything and guessing from page text later.
    console.log(`Applying Room Amenities filter: ${AMENITY_FILTERS.join(' / ')}...`);
    try {
      const amenitiesPanel = page.locator('#ROOM_AMENITIES');
      await amenitiesPanel.waitFor({ state: 'attached', timeout: 15000 });
      await amenitiesPanel.scrollIntoViewIfNeeded();
      await page.waitForTimeout(1000);

      // MMT only renders the first 5 amenity checkboxes by default and hides
      // the rest (Bathtub/Jacuzzi included) behind a "Show N more" toggle.
      const showMore = amenitiesPanel.locator('#hlistpg_proptypes_show_more, :text("Show")');
      if ((await showMore.count()) > 0) {
        await showMore.first().click({ force: true }).catch(() => {});
        await page.waitForTimeout(1000);
      }

      for (const label of AMENITY_FILTERS) {
        const checkbox = amenitiesPanel.locator(`input[aria-label="${label}"]`);
        if ((await checkbox.count()) === 0) {
          console.log(`  ⚠️ "${label}" checkbox not found`);
          continue;
        }
        // The checkbox input is readonly — MMT's click handler lives on the
        // containing <li>, so click that instead of the input itself.
        // force:true since the filter sidebar is prone to the same
        // overlay-interception issue as the search button above.
        const li = checkbox.locator('xpath=ancestor::li[1]');
        await li.click({ force: true });
        await page.waitForTimeout(800);

        if (!(await checkbox.isChecked())) {
          await checkbox.click({ force: true }).catch(() => {});
          await page.waitForTimeout(800);
        }

        if (await checkbox.isChecked()) {
          console.log(`  ✅ "${label}" filter checked`);
          appliedFilters.push(label);
        } else {
          console.log(`  ⚠️ "${label}" checkbox click didn't register as checked`);
        }
      }

      if (appliedFilters.length > 0) {
        console.log('  Waiting for listing to refresh...');
        await page.waitForTimeout(6000); // MMT re-fetches results via AJAX after a filter click
      }
    } catch (e) {
      console.log(`  ⚠️ Could not apply amenity filter (${String(e.message || e).slice(0, 100)})`);
      console.log('     Falling back to per-hotel keyword scan');
    }

    // Scroll to trigger lazy-loading
    console.log('Scrolling to load hotel cards...');
    for (let i = 0; i < 8; i++) {
      await page.evaluate((y) => window.scrollTo(0, y), i * 500);
      await page.waitForTimeout(800);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(3000);

    // Screenshot + page source, for debugging
    await page.screenshot({ path: path.join(workspaceDir, `mmt_${CITY.toLowerCase()}_listing.png`) });
    fs.writeFileSync(path.join(workspaceDir, 'mmt_page.html'), await page.content(), 'utf-8');

    // Collect hotel links
    console.log('\nLooking for hotel links...');
    let hotelLinks = [];
    for (const sel of [
      'a[href*="hotel-details"]',
      'a[href*="hotel-listing"]',
      '.listing a',
      '[class*="listing"] a',
      '[class*="hotel"] a',
    ]) {
      const hrefs = await page.$$eval(sel, (els) =>
        Array.from(new Set(els.map((e) => e.getAttribute('href')).filter((h) => h && h.includes('hotel-details'))))
      );
      const absolute = hrefs.map((h) => new URL(h, 'https://www.makemytrip.com').href);
      if (absolute.length > 0) {
        hotelLinks = absolute;
        console.log(`  Found ${absolute.length} hotel links via '${sel}'`);
        break;
      }
    }

    const filterApplied = appliedFilters.length > 0;

    if (hotelLinks.length === 0) {
      console.log('  No hotel links found on listing page');
      console.log('  Page title:', await page.title());
    } else {
      const toVisit = hotelLinks.slice(0, 20);
      console.log(`\nValidating ${toVisit.length} hotels for BATHTUB/JACUZZI...`);

      for (let i = 0; i < toVisit.length; i++) {
        const link = toVisit[i];
        try {
          await page.goto(link, { waitUntil: 'domcontentloaded' });
          await page.waitForTimeout(4000);

          let hotelName = null;
          for (const sel of ['h1', '.htlName', '[class*="hotelName"]', '[itemprop="name"]']) {
            const loc = page.locator(sel).first();
            if ((await loc.count()) > 0) {
              const text = (await loc.innerText()).trim();
              if (text) {
                hotelName = text;
                break;
              }
            }
          }

          // Every result already passed MMT's own amenity filter, so trust
          // it. Only fall back to a keyword scan of the page body if the
          // filter couldn't be applied above.
          let hasAmenity = filterApplied;
          if (!filterApplied) {
            const pageText = (await page.locator('body').innerText()).toLowerCase();
            hasAmenity = BATHTUB_KEYWORDS.some((kw) => pageText.includes(kw));
          }

          let imgUrl = null;
          for (const sel of ['img[src*="r1imghtlak"]', 'img[src*="r2imghtlak"]', 'img[src*="mmtcdn"]', '.hotelImg img']) {
            const loc = page.locator(sel).first();
            if ((await loc.count()) > 0) {
              imgUrl = await loc.getAttribute('src');
              if (imgUrl) break;
            }
          }

          const status = hasAmenity ? '✅ HAS BATHTUB/JACUZZI' : '❌ No match';
          console.log(`  [${i + 1}] ${hotelName || 'Unknown'} — ${status}`);

          if (hasAmenity && hotelName) {
            const slug = slugify(hotelName);
            const imgPath = imgUrl ? await downloadImage(imgUrl, slug) : null;

            // Best-effort amenity tagging for the record we save — informational,
            // not a gate (the MMT filter already gated which hotels we're here for).
            const bodyTextLower = (await page.locator('body').innerText().catch(() => '')).toLowerCase();
            const amenities = [];
            if (bodyTextLower.includes('bathtub') || bodyTextLower.includes('bath tub')) amenities.push('Bathtub');
            if (bodyTextLower.includes('jacuzzi')) amenities.push('Jacuzzi');
            if (amenities.length === 0) amenities.push(...(appliedFilters.length ? appliedFilters : ['Bathtub']));

            validatedHotels.push({
              name: hotelName,
              city: CITY,
              url: link,
              image: imgPath || '/assets/fallback.webp',
              amenities,
            });
          }

          await page.waitForTimeout(1000);
        } catch (e) {
          console.log(`  [${i + 1}] Error: ${String(e.message || e).slice(0, 80)}`);
        }
      }
    }
  } catch (e) {
    console.log(`\n❌ Main error: ${e.message || e}`);
  } finally {
    await page.waitForTimeout(2000).catch(() => {});
    await browser.close().catch(() => {});
  }

  // Results
  console.log('\n' + '='.repeat(60));
  console.log(`✅ FILTER-VALIDATED HOTELS IN ${CITY.toUpperCase()}: ${validatedHotels.length}`);
  console.log('='.repeat(60));
  for (const h of validatedHotels) {
    console.log(`  🛁 ${h.name} [${h.amenities.join(', ')}]`);
    console.log(`     img: ${h.image}`);
  }

  console.log('\n💾 Connecting to MongoDB Atlas...');
  const MONGODB_URI = process.env.MONGODB_URI;

  if (MONGODB_URI && validatedHotels.length > 0) {
    const hotelSchema = new mongoose.Schema(
      {
        name: String,
        slug: { type: String, unique: true },
        city: String,
        country: String,
        url: String,
        image: String,
        verified: Boolean,
        flagged: { type: Boolean, default: false },
        amenities: [String],
      },
      { timestamps: true }
    );
    const Hotel = mongoose.models.Hotel || mongoose.model('Hotel', hotelSchema);

    try {
      await mongoose.connect(MONGODB_URI);
      let inserted = 0;

      for (const h of validatedHotels) {
        const slug = slugify(h.name);
        const existing = await Hotel.findOne({ slug });
        if (existing && existing.flagged === true) {
          console.log(`  [SKIPPED] Hotel '${h.name}' was previously flagged by Admin.`);
          continue;
        }

        const doc = {
          name: h.name,
          slug,
          city: CITY[0].toUpperCase() + CITY.slice(1).toLowerCase(),
          country: 'India',
          url: h.url,
          image: h.image,
          verified: true,
          amenities: h.amenities,
        };

        const result = await Hotel.updateOne(
          { slug },
          { $set: doc, $setOnInsert: { flagged: false } },
          { upsert: true }
        );
        if (result.upsertedId || result.modifiedCount > 0 || result.matchedCount > 0) inserted++;
      }

      console.log(`✅ Successfully inserted/updated ${inserted} hotels in MongoDB Atlas!`);
      await mongoose.disconnect();
    } catch (e) {
      console.log(`❌ Error saving to MongoDB: ${e.message || e}`);
    }
  } else {
    console.log('❌ No MongoDB URI found or no validated hotels to save.');
  }

  return validatedHotels;
}

scrape();
