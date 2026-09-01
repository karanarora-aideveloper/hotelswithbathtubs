import puppeteer from 'puppeteer';

async function test() {
  const browser = await puppeteer.launch({
    channel: 'chrome',
    headless: false,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
      '--disable-http2',
      '--disable-quic'
    ]
  });

  const page = await browser.newPage();
  
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
  });

  console.log('Navigating...');
  // Use the exact URL that worked before
  await page.goto('https://www.makemytrip.com/hotels/hotel-listing/?city=Gwalior', { waitUntil: 'domcontentloaded', timeout: 30000 });
  
  console.log('Waiting 5s...');
  await new Promise(r => setTimeout(r, 5000));
  
  console.log('Clicking SEARCH...');
  const searchBtn = await page.$('#hsw_search_button');
  if (searchBtn) {
    await searchBtn.click();
    console.log('Clicked search button!');
  } else {
    console.log('Could not find search button');
  }

  await new Promise(r => setTimeout(r, 10000));
  await page.screenshot({ path: `scratch/test_click_result.png` });
  await browser.close();
}

test();
