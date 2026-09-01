import puppeteerExtra from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteerExtra.use(StealthPlugin());

const TESTS = [
  { name: 'ITC Sonar A Luxury Collection Hotel', city: 'Kolkata', cityCode: 'CTCCU' },
  { name: 'Hotel Hyatt Regency', city: 'Kolkata', cityCode: 'CTCCU' },
];

async function getHotelId(browser, hotelName, city) {
  const searchUrl = `https://www.makemytrip.com/hotels/hotel-listing/?city=${encodeURIComponent(city)}&searchText=${encodeURIComponent(hotelName)}`;

  const page = await browser.newPage();
  let foundHotelId = null;

  await page.setRequestInterception(true);
  page.on('request', req => req.continue());

  page.on('response', async (resp) => {
    const url = resp.url();
    const ct = resp.headers()['content-type'] || '';
    if (!ct.includes('json')) return;
    if (!url.includes('hotel')) return;
    try {
      const text = await resp.text();
      if (!text.includes('hotelId')) return;
      const match = text.match(/"hotelId"\s*:\s*"([^"]+)"/);
      if (match && !foundHotelId) {
        foundHotelId = match[1];
        console.log(`  ✓ Found hotelId via API: ${foundHotelId}`);
        console.log(`  API URL: ${url.slice(0, 120)}`);
      }
    } catch {}
  });

  try {
    console.log(`\nFetching: ${hotelName} in ${city}`);
    await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 25000 });
    await new Promise(r => setTimeout(r, 3000));
  } catch (e) {
    console.log(`  Nav error: ${e.message.slice(0, 80)}`);
  }

  // Try to find hotelId in links on page
  if (!foundHotelId) {
    try {
      const links = await page.$$eval('a', as => as.map(a => a.href).filter(h => h.includes('hotelId')));
      if (links.length > 0) {
        const m = links[0].match(/hotelId=([^&]+)/);
        if (m) {
          foundHotelId = m[1];
          console.log(`  ✓ Found hotelId in page link: ${foundHotelId}`);
        }
      }
    } catch {}
  }

  if (!foundHotelId) {
    const title = await page.title().catch(() => 'no title');
    console.log(`  ✗ No hotelId. Page title: "${title}"`);
    // Take screenshot for debugging
    await page.screenshot({ path: `/tmp/mmt-debug-${Date.now()}.png` }).catch(() => {});
    console.log(`  Screenshot saved to /tmp/`);
  }

  await page.close();
  return foundHotelId;
}

const browser = await puppeteerExtra.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});

for (const t of TESTS) {
  const hotelId = await getHotelId(browser, t.name, t.city);
  if (hotelId) {
    const url = `https://www.makemytrip.com/hotels/hotel-details?hotelId=${hotelId}&city=${t.cityCode}&country=IN&checkin=09012026&checkout=09022026`;
    console.log(`  → Fixed URL: ${url}`);
  }
}

await browser.close();
console.log('\nDone.');
