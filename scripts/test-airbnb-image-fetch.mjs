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
  
  const testUrl = 'https://www.airbnb.co.in/rooms/1781688294609656950';
  console.log(`Navigating to: ${testUrl}`);
  await page.goto(testUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
  
  const ogImage = await page.$eval('meta[property="og:image"]', el => el.content).catch(() => null);
  const twitterImage = await page.$eval('meta[name="twitter:image"]', el => el.content).catch(() => null);
  const title = await page.title();
  
  console.log('Title:', title);
  console.log('OG Image:', ogImage);
  console.log('Twitter Image:', twitterImage);
  
  await browser.close();
}
run().catch(console.error);
