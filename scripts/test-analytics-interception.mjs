import puppeteer from 'puppeteer';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = 'http://localhost:3000';

function extractEvents(urlStr, postData) {
  const events = [];
  try {
    const url = new URL(urlStr);
    const en = url.searchParams.get('en');
    if (en) events.push(en);
  } catch (e) {}

  if (postData && typeof postData === 'string') {
    // Post data may be newline-separated or query string formatted
    const lines = postData.split('\n');
    for (const line of lines) {
      try {
        const params = new URLSearchParams(line);
        const en = params.get('en');
        if (en) events.push(en);
      } catch (e) {}
    }
  }
  return events;
}

async function runScenario(scenarioName, path, consentValue) {
  console.log(`\n============================================================`);
  console.log(`Scenario: ${scenarioName} | Path: ${path} | Consent: ${consentValue}`);
  console.log(`============================================================`);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  const intercepted = [];
  const interceptedEvents = [];

  await page.setRequestInterception(true);

  page.on('request', (req) => {
    const reqUrl = req.url();
    if (reqUrl.includes('/g/collect')) {
      const method = req.method();
      const postData = req.postData();
      const events = extractEvents(reqUrl, postData);
      intercepted.push({ method, url: reqUrl, postData, events });
      interceptedEvents.push(...events);
      // Respond 204
      req.respond({
        status: 204,
        contentType: 'text/plain',
        body: '',
      });
    } else {
      req.continue();
    }
  });

  // Set localStorage before loading page
  await page.evaluateOnNewDocument((c) => {
    localStorage.setItem('hwb_consent', c);
  }, consentValue);

  const fullUrl = `${BASE_URL}${path}?include_analytics=true`;
  console.log(`Navigating to ${fullUrl}...`);
  await page.goto(fullUrl, { waitUntil: 'load', timeout: 30000 });

  console.log('Waiting 10 seconds...');
  await new Promise((r) => setTimeout(r, 10000));

  const dataLayer = await page.evaluate(() => {
    if (!window.dataLayer) return null;
    return window.dataLayer.map((entry) => {
      if (entry && (typeof entry === 'object' || Array.isArray(entry))) {
        // If it looks like Arguments or Array
        if (typeof entry[0] !== 'undefined') {
          return Array.from(entry);
        }
      }
      return entry;
    });
  });

  await browser.close();

  console.log(`--- dataLayer (${dataLayer ? dataLayer.length : 0} items) ---`);
  if (dataLayer) {
    dataLayer.forEach((item, idx) => {
      console.log(`[${idx}]`, JSON.stringify(item));
    });
  }

  console.log(`--- Intercepted /g/collect Requests (${intercepted.length}) ---`);
  intercepted.forEach((req, idx) => {
    console.log(`Request #${idx + 1}: [${req.method}] ${req.url}`);
    if (req.postData) {
      console.log(`  Body: ${req.postData}`);
    }
    console.log(`  Events: ${req.events.join(', ') || 'none'}`);
  });

  console.log(`--- Summary of intercepted en= events ---`);
  console.log(`Total events intercepted: ${interceptedEvents.length}`);
  console.log(`Events: ${JSON.stringify(interceptedEvents)}`);

  return {
    dataLayer,
    intercepted,
    interceptedEvents,
  };
}

async function main() {
  console.log('Starting GA4 Interception Tests...');

  // DoD 1: consent = granted
  const r1 = await runScenario(
    'DoD 1: Destination Page (Granted)',
    '/usa/sedona',
    'granted'
  );

  const r2 = await runScenario(
    'DoD 1: Hotel Page (Granted)',
    '/usa/sedona/the-joy-sedona-sedona',
    'granted'
  );

  // DoD 2: consent = denied
  const r3 = await runScenario(
    'DoD 2: Destination Page (Denied)',
    '/usa/sedona',
    'denied'
  );

  const r4 = await runScenario(
    'DoD 2: Hotel Page (Denied)',
    '/usa/sedona/the-joy-sedona-sedona',
    'denied'
  );

  console.log('\n============================================================');
  console.log('ALL TESTS FINISHED');
  console.log('============================================================');
}

main().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
