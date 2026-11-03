import puppeteer from 'puppeteer';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = 'http://localhost:3000';

async function testHeaderWidths() {
  console.log('\n============================================================');
  console.log('DoD 1: Header Width and Alignment at 1024, 1280, 1440, 1920px');
  console.log('============================================================');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const viewports = [1024, 1280, 1440, 1920];

  for (const width of viewports) {
    const page = await browser.newPage();
    await page.setViewport({ width, height: 900 });
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });

    const measurements = await page.evaluate(() => {
      const header = document.querySelector('header');
      if (!header) return null;

      const container = header.querySelector('div[class*="max-w-[1200px]"]') || header.firstElementChild;
      const containerRect = container.getBoundingClientRect();
      const style = window.getComputedStyle(container);
      const paddingLeft = parseFloat(style.paddingLeft);
      const paddingRight = parseFloat(style.paddingRight);

      const contentLeft = containerRect.left + paddingLeft;
      const contentRight = containerRect.right - paddingRight;

      const logo = header.querySelector('a[href="/"]');
      const logoRect = logo ? logo.getBoundingClientRect() : null;

      const nav = header.querySelector('nav');
      let lastItem = null;
      let lastItemRect = null;

      if (nav) {
        const children = Array.from(nav.children).filter((el) => {
          const r = el.getBoundingClientRect();
          const s = window.getComputedStyle(el);
          return r.width > 0 && s.display !== 'none' && s.visibility !== 'hidden';
        });
        if (children.length > 0) {
          lastItem = children[children.length - 1];
          lastItemRect = lastItem.getBoundingClientRect();
        }
      }

      return {
        containerRect: {
          left: Math.round(containerRect.left),
          right: Math.round(containerRect.right),
          width: Math.round(containerRect.width),
        },
        padding: { left: paddingLeft, right: paddingRight },
        contentEdges: {
          left: Math.round(contentLeft),
          right: Math.round(contentRight),
        },
        logoRect: logoRect ? {
          left: Math.round(logoRect.left),
          right: Math.round(logoRect.right),
          width: Math.round(logoRect.width),
        } : null,
        lastItemRect: lastItemRect ? {
          tag: lastItem.tagName,
          text: (lastItem.innerText || '').slice(0, 30),
          left: Math.round(lastItemRect.left),
          right: Math.round(lastItemRect.right),
          width: Math.round(lastItemRect.width),
        } : null,
      };
    });

    console.log(`\nViewport: ${width}px`);
    console.log(`  Container bounds: left=${measurements.containerRect.left}, right=${measurements.containerRect.right}, width=${measurements.containerRect.width}`);
    console.log(`  Container content area (after ${measurements.padding.left}px padding): [${measurements.contentEdges.left}, ${measurements.contentEdges.right}]`);
    console.log(`  Logo position: left=${measurements.logoRect.left}, right=${measurements.logoRect.right}`);
    console.log(`  Last item ("${measurements.lastItemRect.text}"): left=${measurements.lastItemRect.left}, right=${measurements.lastItemRect.right}`);
    const fitsInside = measurements.lastItemRect.right <= measurements.contentEdges.right;
    console.log(`  Fits inside container content edge (${measurements.lastItemRect.right} <= ${measurements.contentEdges.right}): ${fitsInside ? 'YES (PASS)' : 'NO (OVERFLOW)'}`);

    await page.close();
  }

  await browser.close();
}

async function testGeoRequestCount() {
  console.log('\n============================================================');
  console.log('DoD 2: /api/geo Request Count across Page Loads in Same Tab');
  console.log('============================================================');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const context = await browser.createBrowserContext();
  const page = await context.newPage();

  let countPage1 = 0;
  let countPage2 = 0;
  let countPage3 = 0;
  let currentPageIndex = 1;

  page.on('request', (req) => {
    if (req.url().includes('/api/geo')) {
      if (currentPageIndex === 1) countPage1++;
      else if (currentPageIndex === 2) countPage2++;
      else if (currentPageIndex === 3) countPage3++;
      console.log(`  -> [FETCH] /api/geo on page ${currentPageIndex}: ${req.url()}`);
    }
  });

  console.log('\n1. Navigating to / ...');
  currentPageIndex = 1;
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 1000));
  console.log(`   /api/geo requests on /: ${countPage1}`);

  console.log('\n2. Navigating to /usa/sedona in same tab...');
  currentPageIndex = 2;
  await page.goto(`${BASE_URL}/usa/sedona`, { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 1000));
  console.log(`   /api/geo requests on /usa/sedona: ${countPage2}`);

  console.log('\n3. Navigating to /usa/sedona/the-joy-sedona-sedona in same tab...');
  currentPageIndex = 3;
  await page.goto(`${BASE_URL}/usa/sedona/the-joy-sedona-sedona`, { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 1000));
  console.log(`   /api/geo requests on 3rd page: ${countPage3}`);

  console.log('\nSummary:');
  console.log(`  Page 1 (/): ${countPage1} requests`);
  console.log(`  Page 2 (/usa/sedona): ${countPage2} requests`);
  console.log(`  Page 3 (hotel page): ${countPage3} requests`);
  console.log(`  Total across session: ${countPage1 + countPage2 + countPage3} requests`);

  await browser.close();
}

async function testCountryHeader() {
  console.log('\n============================================================');
  console.log('DoD 3: Country Shown in Header (hwb_country=AE vs unset + Asia/Kolkata)');
  console.log('============================================================');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  // Test 3A: hwb_country set to AE
  {
    const context = await browser.createBrowserContext();
    const page = await context.newPage();
    await page.evaluateOnNewDocument(() => {
      localStorage.setItem('hwb_country', 'AE');
    });
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 1000));

    const countryText = await page.evaluate(() => {
      const button = document.querySelector('header button[aria-label="Select Country"]');
      return button ? button.innerText.trim() : '';
    });

    console.log(`Test 3A (hwb_country='AE'): Header country selector shows: "${countryText}"`);
    await context.close();
  }

  // Test 3B: hwb_country unset, timezone Asia/Kolkata
  {
    const context = await browser.createBrowserContext();
    const page = await context.newPage();
    await page.emulateTimezone('Asia/Kolkata');
    await page.evaluateOnNewDocument(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 1000));

    const countryText = await page.evaluate(() => {
      const button = document.querySelector('header button[aria-label="Select Country"]');
      return button ? button.innerText.trim() : '';
    });

    console.log(`Test 3B (hwb_country unset, tz='Asia/Kolkata'): Header country selector shows: "${countryText}"`);
    await context.close();
  }

  await browser.close();
}

async function main() {
  await testHeaderWidths();
  await testGeoRequestCount();
  await testCountryHeader();
  console.log('\n============================================================');
  console.log('ALL POLISH1 TESTS COMPLETE');
  console.log('============================================================');
}

main().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
