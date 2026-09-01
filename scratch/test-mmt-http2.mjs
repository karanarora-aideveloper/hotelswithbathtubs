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

  console.log('Navigating to MMT...');
  try {
    const response = await page.goto('https://www.makemytrip.com/hotels/hotel-listing/?city=Gwalior', { waitUntil: 'domcontentloaded', timeout: 30000 });
    console.log('Response Status:', response.status());
    const bodyText = await page.evaluate(() => document.body.innerText.trim());
    console.log('Body Text (first 200 chars):', bodyText.slice(0, 200));
  } catch (e) {
    console.error('Error:', e);
  }
  await new Promise(r => setTimeout(r, 5000));
  await browser.close();
}

test();
