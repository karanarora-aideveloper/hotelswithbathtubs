import puppeteer from 'puppeteer';

const CITY = 'Gwalior';
const checkin = new Date();
checkin.setDate(checkin.getDate() + 7);
const checkout = new Date(checkin);
checkout.setDate(checkout.getDate() + 1);

const formatDate = (d) => {
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${mm}${dd}${yyyy}`;
};

const url = `https://www.makemytrip.com/hotels/hotel-listing/?city=${encodeURIComponent(CITY)}&checkin=${formatDate(checkin)}&checkout=${formatDate(checkout)}&roomStayQualifier=2e0e&locusId=CT${CITY.substring(0,3).toUpperCase()}&country=IN&locusType=city&searchText=${encodeURIComponent(CITY)}`;

console.log(url);

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
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  
  await new Promise(r => setTimeout(r, 10000));
  await page.screenshot({ path: `scratch/test_url_result.png` });
  await browser.close();
}

test();
