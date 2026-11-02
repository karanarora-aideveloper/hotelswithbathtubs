// scripts/test-home-tub-select.mjs
// Verifies the home page "Tub type" select options for IN, GB, AU via Playwright and Chrome.

import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
  });
  const countries = ['IN', 'GB', 'AU'];

  for (const c of countries) {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto('http://localhost:3000');
    await page.evaluate((code) => {
      localStorage.setItem('hwb_country', code);
      window.dispatchEvent(new CustomEvent('hwb_country_change', { detail: code }));
    }, c);
    await page.reload();
    await page.waitForSelector('#tub-type-select');
    await page.waitForTimeout(500);

    const options = await page.$$eval('#tub-type-select option', (opts) =>
      opts.map((o) => ({ value: o.value, text: o.text.trim() }))
    );

    console.log(`=== hwb_country = ${c} ===`);
    for (const opt of options) {
      console.log(`  <option value="${opt.value}">${opt.text}</option>`);
    }
    console.log('');
    await context.close();
  }

  await browser.close();
})();
