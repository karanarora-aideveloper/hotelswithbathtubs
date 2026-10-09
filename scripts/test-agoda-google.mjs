import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
puppeteer.use(StealthPlugin());

async function run() {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36');

  // Let's test DuckDuckGo HTML search for site:agoda.com
  const query = encodeURIComponent('site:agoda.com/ "The Prime" Delhi hotel');
  const url = `https://html.duckduckgo.com/html/?q=${query}`;
  console.log('Searching DuckDuckGo:', url);
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  
  const results = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.result__url'))
      .map(el => el.innerText.trim())
      .filter(u => u.includes('agoda.com') && u.includes('/hotel/'));
  });
  console.log('Results:', results);
  
  await browser.close();
}
run().catch(console.error);
