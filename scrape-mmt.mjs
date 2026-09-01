/**
 * MMT Scraper — Powered by ScrapingAnt API
 * ============================================================
 * Solution: Uses ScrapingAnt Cloud Browser with Residential Proxies.
 * To bypass MakeMyTrip's Akamai Deep-Link block (200-OK), we visit the 
 * homepage first, then use window.location.href to redirect to the search page.
 */

import * as dotenv from 'dotenv';
import fs from 'fs';
import * as cheerio from 'cheerio'; 

dotenv.config({ path: '.env.local' });

const CITY = process.argv[2] || 'Gwalior';

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function fetchWithScrapingAnt(targetUrl, jsSnippet = null, redirectWait = 10000) {
  const apiUrl = new URL('https://api.scrapingant.com/v2/general');
  // We ALWAYS start the cloud browser at the MMT homepage to bypass deep-link detection!
  apiUrl.searchParams.append('url', 'https://www.makemytrip.com/hotels/');
  apiUrl.searchParams.append('x-api-key', process.env.SCRAPINGANT_API_KEY);
  apiUrl.searchParams.append('browser', 'true');
  apiUrl.searchParams.append('proxy_type', 'residential');
  apiUrl.searchParams.append('proxy_country', 'IN');

  const finalSnippet = `
    window.location.href = '${targetUrl}';
    await new Promise(r => setTimeout(r, ${redirectWait}));
    ${jsSnippet || ''}
  `;
  
  apiUrl.searchParams.append('js_snippet', Buffer.from(finalSnippet).toString('base64'));

  for (let attempt = 1; attempt <= 10; attempt++) {
    try {
      const res = await fetch(apiUrl.toString());
      const text = await res.text();
      
      if (res.ok && !text.includes('200-OK')) {
        return text;
      }
      if (res.status === 409) {
        console.log(`  ⏳ Concurrency limit (attempt ${attempt}). Waiting 15s...`);
        await new Promise(r => setTimeout(r, 15000));
        continue;
      }
      console.log(`  ⚠️ Attempt ${attempt} failed: ${res.status}`);
      await new Promise(r => setTimeout(r, 15000));
    } catch (e) {
      console.log(`  ⚠️ Request error: ${e.message}`);
      await new Promise(r => setTimeout(r, 15000));
    }
  }
  return null;
}

async function scrape() {
  console.log(`\n============================================================`);
  console.log(`🏨 MMT Scraper (ScrapingAnt) — ${CITY}`);
  console.log(`============================================================\n`);

  // Calculate a check-in date 14 days from today to avoid "past date" errors
  const today = new Date();
  const checkinDate = new Date(today);
  checkinDate.setDate(today.getDate() + 14);
  const checkoutDate = new Date(today);
  checkoutDate.setDate(today.getDate() + 15);

  const pad = (n) => n.toString().padStart(2, '0');
  const checkin = `${pad(checkinDate.getMonth() + 1)}${pad(checkinDate.getDate())}${checkinDate.getFullYear()}`;
  const checkout = `${pad(checkoutDate.getMonth() + 1)}${pad(checkoutDate.getDate())}${checkoutDate.getFullYear()}`;
  // Map city names to MMT internal locusId codes (usually CT + IATA airport code)
  const MMT_CITY_CODES = {
    'gwalior': 'CTGWL',
    'kolkata': 'CTCCU',
    'new delhi': 'CTDEL',
    'mumbai': 'CTBOM',
    'bangalore': 'CTBLR',
    'chennai': 'CTMAA',
    'hyderabad': 'CTHYD',
    'pune': 'CTPNQ',
    'goa': 'CTGOI',
    'jaipur': 'CTJAI'
  };

  const locusId = MMT_CITY_CODES[CITY.toLowerCase()] || 'CT' + CITY.substring(0, 3).toUpperCase();
  
  // URL Structure with built-in Jacuzzi/Bathtub filter!
  const searchUrl = `https://www.makemytrip.com/hotels/hotel-listing/?_uCurrency=INR&checkin=${checkin}&checkout=${checkout}&city=${locusId}&country=IN&filterData=ROOM_AMENITIES%7CJacuzzi%2CJacuzzi%2FBathtub&locusId=${locusId}&locusType=city&reference=hotel&roomStayQualifier=2e0e&rsc=1e2e0e&searchText=${encodeURIComponent(CITY)}&type=city`;

  console.log(`Fetching listings via ScrapingAnt with Bathtub Filter...`);
  
  // Custom JS snippet to scroll down and load all properties on the listing page
  const scrollSnippet = `
    let lastHeight = 0;
    while(true) {
      window.scrollTo(0, document.body.scrollHeight);
      await new Promise(resolve => setTimeout(resolve, 2000));
      let newHeight = document.body.scrollHeight;
      if (newHeight === lastHeight) break;
      lastHeight = newHeight;
    }
  `;

  const html = await fetchWithScrapingAnt(searchUrl, scrollSnippet, 15000);
  if (!html) {
    console.log(`❌ Failed to fetch listings.`);
    process.exit(1);
  }

  const $ = cheerio.load(html);
  const hotels = [];
  
  // MMT property cards
  $('.listingRow').each((i, el) => {
    const name = $(el).find('#hlistpg_hotel_name').text().trim();
    if (!name) return;

    let link = $(el).find('a').attr('href');
    if (link) {
      if (link.startsWith('//')) link = 'https:' + link;
      else if (link.startsWith('/')) link = 'https://www.makemytrip.com' + link;
    }

    const price = $(el).find('#hlistpg_hotel_shown_price').text().trim() || 'Price unavailable';
    const rating = $(el).find('#hlistpg_hotel_user_rating').text().trim() || 'N/A';
    
    let img = $(el).find('img').first().attr('src');
    if (img && img.startsWith('//')) img = 'https:' + img;

    console.log(`     ✅ Found: ${name} (Price: ${price}, Rating: ${rating})`);

    hotels.push({
      name,
      slug: slugify(name),
      city: CITY,
      url: link,
      image: img,
      price,
      rating,
      amenities: ['Bathtub', 'Jacuzzi'], // Inferred from URL filter
      source: 'MMT'
    });
  });

  console.log(`\n============================================================`);
  console.log(`✅ ${CITY.toUpperCase()}: ${hotels.length} hotels with bathtubs`);
  console.log(`============================================================\n`);

  fs.writeFileSync(`mmt_${CITY.toLowerCase()}_hotels.json`, JSON.stringify(hotels, null, 2));
}

scrape();
