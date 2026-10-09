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
  await page.goto('http://localhost:3000/india/delhi', { waitUntil: 'networkidle2' });

  const cards = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('[data-hotel-card="true"]')).slice(12, 17).map(card => {
      const name = card.getAttribute('data-hotel-name');
      const buttons = Array.from(card.querySelectorAll('a[target="_blank"]')).map(a => ({
        label: a.innerText.trim(),
        href: a.href
      })).filter(b => !b.href.includes('pinterest'));
      return { name, buttons };
    });
  });

  console.log(JSON.stringify(cards, null, 2));
  await browser.close();
}
run().catch(console.error);
