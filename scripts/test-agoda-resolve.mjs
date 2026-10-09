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
  
  const hotelName = "The Prime Delhi";
  const searchUrl = `https://www.agoda.com/search?text=${encodeURIComponent(hotelName + ' Delhi')}`;
  console.log(`Navigating to Agoda search: ${searchUrl}`);
  
  await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await new Promise(r => setTimeout(r, 4000));
  
  const currentUrl = page.url();
  console.log('Current URL after redirect/search:', currentUrl);
  
  // Check first hotel link on the page
  const firstHotel = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a[href*="/hotel/"]'));
    return links.map(a => ({ href: a.href, text: a.innerText.trim() })).filter(x => x.text.length > 0)[0];
  });
  console.log('First hotel link found:', firstHotel);
  
  await browser.close();
}
run().catch(console.error);
