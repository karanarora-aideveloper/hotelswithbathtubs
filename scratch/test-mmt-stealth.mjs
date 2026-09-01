/**
 * Test: Can we get MMT hotelIds with Playwright stealth?
 * Tests on 2 hotels from the generic URL list.
 */
import { chromium } from 'playwright-extra';
import StealthPlugin from 'playwright-extra-plugin-stealth';

chromium.use(StealthPlugin());

const TESTS = [
  { name: 'ITC Sonar A Luxury Collection Hotel', city: 'Kolkata', cityCode: 'CTCCU' },
  { name: 'Hotel Hyatt Regency', city: 'Kolkata', cityCode: 'CTCCU' },
];

async function getHotelId(browser, hotelName, city) {
  const searchUrl = `https://www.makemytrip.com/hotels/hotel-listing/?city=${encodeURIComponent(city)}&searchText=${encodeURIComponent(hotelName)}`;

  const page = await browser.newPage();
  let foundHotelId = null;

  // Intercept any XHR/Fetch that returns JSON with hotelId
  page.on('response', async (resp) => {
    const url = resp.url();
    const ct = resp.headers()['content-type'] || '';
    if (!ct.includes('json')) return;
    if (!url.includes('hotel')) return;
    try {
      const text = await resp.text();
      if (!text.includes('hotelId')) return;
      // Extract first hotelId from JSON
      const match = text.match(/"hotelId"\s*:\s*"([^"]+)"/);
      if (match && !foundHotelId) {
        foundHotelId = match[1];
        console.log(`  ✓ Found hotelId via API: ${foundHotelId}`);
        console.log(`  API URL: ${url.slice(0, 100)}`);
      }
    } catch {}
  });

  try {
    console.log(`\nFetching: ${hotelName} in ${city}`);
    await page.goto(searchUrl, { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(3000);
  } catch (e) {
    console.log(`  Nav error: ${e.message.slice(0, 60)}`);
  }

  // Try to find hotelId in page source if API didn't fire
  if (!foundHotelId) {
    try {
      const content = await page.content();
      const match = content.match(/hotelId[=:"'\s]+([A-Z0-9]{15,25})/i);
      if (match) {
        foundHotelId = match[1];
        console.log(`  ✓ Found hotelId in HTML: ${foundHotelId}`);
      }
    } catch {}
  }

  // Try clicking first hotel result
  if (!foundHotelId) {
    try {
      // Check if there's a hotel card we can click to navigate to hotel page
      const hotelLinks = await page.$$eval('a[href*="hotel-details"]', links =>
        links.slice(0, 3).map(l => l.href)
      );
      if (hotelLinks.length > 0) {
        const m = hotelLinks[0].match(/hotelId=([^&]+)/);
        if (m) {
          foundHotelId = m[1];
          console.log(`  ✓ Found hotelId in page link: ${foundHotelId}`);
        }
      }
    } catch {}
  }

  if (!foundHotelId) {
    const title = await page.title().catch(() => 'no title');
    console.log(`  ✗ No hotelId found. Page title: "${title}"`);
  }

  await page.close();
  return foundHotelId;
}

const browser = await chromium.launch({ headless: true });

for (const t of TESTS) {
  const hotelId = await getHotelId(browser, t.name, t.city);
  if (hotelId) {
    const url = `https://www.makemytrip.com/hotels/hotel-details?hotelId=${hotelId}&city=${t.cityCode}&country=IN&checkin=09012026&checkout=09022026`;
    console.log(`  → Fixed URL: ${url}`);
  }
}

await browser.close();
console.log('\nDone.');
