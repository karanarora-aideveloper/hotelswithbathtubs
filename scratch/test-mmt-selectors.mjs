import { chromium } from 'playwright';
import fs from 'fs';

async function testMMT() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();
  
  await page.goto('https://www.makemytrip.com/hotels/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);
  
  await page.screenshot({ path: 'scratch/mmt-homepage.png' });
  fs.writeFileSync('scratch/mmt-homepage.html', await page.content());
  
  await browser.close();
  console.log('Saved screenshot and HTML to scratch/');
}

testMMT().catch(console.error);
