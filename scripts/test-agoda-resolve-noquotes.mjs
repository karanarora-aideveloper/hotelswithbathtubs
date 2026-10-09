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

  const testHotels = [
    "Roseate House New Delhi Aerocity",
    "The Imperial New Delhi",
    "Taj Palace New Delhi",
    "Novotel New Delhi Aerocity",
    "Pullman New Delhi Aerocity"
  ];

  for (const name of testHotels) {
    const query = encodeURIComponent(`site:agoda.com ${name} hotel`);
    const url = `https://html.duckduckgo.com/html/?q=${query}`;
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    
    const firstMatch = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('.result__url'))
        .map(el => el.innerText.trim())
        .filter(u => u.includes('agoda.com') && u.includes('/hotel/'));
      return links[0];
    });
    console.log(`${name} => https://${firstMatch}`);
  }
  
  await browser.close();
}
run().catch(console.error);
