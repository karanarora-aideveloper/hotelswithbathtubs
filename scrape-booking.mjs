import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import fs from 'fs';

puppeteer.use(StealthPlugin());

const CITY = process.argv[2] || 'Gwalior';

async function scrape() {
  console.log(`\n=== 🏨 Booking.com Scraper (Puppeteer) — ${CITY} ===`);
  const browser = await puppeteer.launch({
    headless: false, // Booking heavily blocks headless, keep false for local runs
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  // Navigate to Booking.com with Hot Tub filter (nflt=hotelfacility=63)
  const searchUrl = `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(CITY)}&nflt=hotelfacility%3D63`;
  
  try {
    console.log(`Navigating to ${searchUrl}...`);
    await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Wait for property cards to load
    await page.waitForSelector('[data-testid="property-card"]', { timeout: 15000 }).catch(() => console.log('Timeout waiting for property cards.'));
    
    // Scroll down to load images and more results
    console.log('Scrolling to load all results...');
    for (let i = 0; i < 5; i++) {
      await page.evaluate(() => window.scrollBy(0, window.innerHeight * 2));
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    // Extract data from DOM
    const hotels = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('[data-testid="property-card"]'));
      return cards.map(card => {
        const titleEl = card.querySelector('[data-testid="title"]');
        const linkEl = card.querySelector('a[data-testid="title-link"]');
        const imgEl = card.querySelector('[data-testid="image"]');
        
        return {
          name: titleEl ? titleEl.innerText.trim() : null,
          url: linkEl ? linkEl.href : null,
          image: imgEl ? imgEl.src : null,
          amenities: ['Bathtub', 'Hot Tub'], // Implied by the filter
          source: 'Booking.com'
        };
      }).filter(h => h.name && h.url);
    });

    console.log(`\nFound ${hotels.length} hotels on Booking.com for ${CITY}.`);
    
    if (hotels.length > 0) {
      fs.writeFileSync(`booking_${CITY.toLowerCase()}_hotels.json`, JSON.stringify(hotels, null, 2));
      console.log(`Saved to booking_${CITY.toLowerCase()}_hotels.json for inspection.`);
    }

  } catch (e) {
    console.log(`  Error during scraping: ${e.message}`);
  } finally {
    await browser.close();
  }
}

scrape().catch(console.error);
