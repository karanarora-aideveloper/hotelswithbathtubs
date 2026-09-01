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
      '--disable-quic',
      '--window-size=1400,900'
    ]
  });

  const page = await browser.newPage();
  
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
  });

  console.log('Navigating to MMT Homepage...');
  await page.goto('https://www.makemytrip.com/hotels/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  
  console.log('Waiting 5s...');
  await new Promise(r => setTimeout(r, 5000));
  
  console.log('Navigating via window.location.href...');
  const checkin = '10102024';
  const checkout = '10112024';
  const searchUrl = `https://www.makemytrip.com/hotels/hotel-listing/?city=Gwalior&checkin=${checkin}&checkout=${checkout}&roomStayQualifier=2e0e&locusId=CTGWA&country=IN&locusType=city&searchText=Gwalior`;
  
  await page.evaluate((url) => {
    window.location.href = url;
  }, searchUrl);

  console.log('Waiting 15s for load...');
  await new Promise(r => setTimeout(r, 15000));
  
  const text = await page.evaluate(() => document.body.innerText.substring(0, 100));
  console.log('Page starts with:', text);
  
  await page.screenshot({ path: `scratch/test_redirect_result.png` });
  await browser.close();
}

test();
