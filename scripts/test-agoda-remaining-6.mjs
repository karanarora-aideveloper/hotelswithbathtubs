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

  const queries = [
    { name: "The Imperial New Delhi", query: "the imperial hotel new delhi and ncr agoda" },
    { name: "The Grand New Delhi, Vasant Kunj", query: "the grand new delhi vasant kunj agoda hotel" },
    { name: "The Aura Luxury Hotel, Shahdara", query: "hotel aura new delhi railway station agoda" },
    { name: "The Umrao Hotel & Resort", query: "the umrao hotel agoda new delhi" },
    { name: "The Park New Delhi, Connaught Place", query: "the park new delhi connaught place agoda hotel" },
    { name: "The Diplomat, Chanakyapuri", query: "the diplomat hotel chanakyapuri new delhi agoda" }
  ];

  for (const item of queries) {
    const q = encodeURIComponent(item.query);
    const url = `https://html.duckduckgo.com/html/?q=${q}`;
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    
    const results = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.result__url'))
        .map(el => el.innerText.trim())
        .filter(u => u.includes('agoda.com') && (u.includes('/hotel/') || u.includes('-hotel')));
    });
    console.log(`${item.name} => ${results[0]}`);
  }

  await browser.close();
}
run().catch(console.error);
