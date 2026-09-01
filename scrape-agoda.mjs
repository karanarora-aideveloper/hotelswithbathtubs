import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import fs from 'fs';

puppeteer.use(StealthPlugin());

const CITY = process.argv[2] || 'Gwalior';

async function scrape() {
  console.log(`\n=== 🏨 Agoda Scraper (Puppeteer) — ${CITY} ===`);
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  // Agoda search URL using textToSearch. Adding "Bathtub" to the query to heavily favor those hotels since Agoda's URL filters are complex.
  const searchUrl = `https://www.agoda.com/search?textToSearch=${encodeURIComponent(CITY + ' Bathtub')}`;
  
  try {
    console.log(`Navigating to ${searchUrl}...`);
    await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Wait for some hotel names to load
    await page.waitForSelector('[data-selenium="hotel-name"]', { timeout: 15000 }).catch(() => console.log('Timeout waiting for property cards.'));
    
    console.log('Scrolling to load all results...');
    for (let i = 0; i < 6; i++) {
      await page.evaluate(() => window.scrollBy(0, window.innerHeight * 2));
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    // Extract data from DOM
    const hotels = await page.evaluate(() => {
      // Agoda uses specific data-selenium attributes
      const cards = Array.from(document.querySelectorAll('.PropertyCardItem'));
      return cards.map(card => {
        const titleEl = card.querySelector('[data-selenium="hotel-name"]');
        const linkEl = card.querySelector('a.PropertyCard__Link');
        const imgEl = card.querySelector('img'); // Agoda has multiple image elements, just grab the first
        
        return {
          name: titleEl ? titleEl.innerText.trim() : null,
          url: linkEl ? (linkEl.href.startsWith('http') ? linkEl.href : `https://www.agoda.com${linkEl.getAttribute('href')}`) : null,
          image: imgEl ? (imgEl.src || imgEl.getAttribute('data-src')) : null,
          amenities: ['Bathtub'], // Assuming from search query
          source: 'Agoda'
        };
      }).filter(h => h.name && h.url);
    });

    console.log(`\nFound ${hotels.length} hotels on Agoda for ${CITY}.`);
    
    if (hotels.length > 0) {
      fs.writeFileSync(`agoda_${CITY.toLowerCase()}_hotels.json`, JSON.stringify(hotels, null, 2));
      console.log(`Saved to agoda_${CITY.toLowerCase()}_hotels.json for inspection.`);
    }

  } catch (e) {
    console.log(`  Error during scraping: ${e.message}`);
  } finally {
    await browser.close();
  }
}

scrape().catch(console.error);
