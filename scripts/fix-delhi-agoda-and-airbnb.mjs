import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const Hotel = mongoose.connection.collection('hotels');

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36');

  // PART 1: Fix Airbnb Images for Delhi
  console.log('\n--- PART 1: Fetching Real Images for Airbnb Delhi Hotels ---');
  const airbnbHotels = await Hotel.find({ city: 'Delhi', airbnbUrl: { $exists: true, $ne: '' } }).toArray();
  for (const h of airbnbHotels) {
    if (h.image && !h.image.includes('search-bar-icons') && h.image.startsWith('http')) {
      console.log(`Skipping (already has image): ${h.name}`);
      continue;
    }
    const targetUrl = h.airbnbUrl || h.url;
    console.log(`Fetching image for: ${h.name} (${targetUrl})`);
    try {
      await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
      const ogImage = await page.$eval('meta[property="og:image"]', el => el.content).catch(() => null);
      if (ogImage) {
        console.log(`  -> Got image: ${ogImage}`);
        await Hotel.updateOne({ _id: h._id }, { $set: { image: ogImage } });
      } else {
        console.log(`  -> No og:image found`);
      }
    } catch (err) {
      console.error(`  -> Failed to fetch image: ${err.message}`);
    }
  }

  // PART 2: Fix Agoda Direct Hotel URLs for Delhi
  console.log('\n--- PART 2: Resolving Exact Agoda Hotel Pages for Delhi ---');
  const delhiHotels = await Hotel.find({ 
    city: 'Delhi',
    $or: [
      { agodaUrl: { $regex: 'search' } },
      { agodaUrl: { $regex: 'partnersearch' } },
      { agodaUrl: { $exists: false } },
      { agodaUrl: '' }
    ]
  }).toArray();

  console.log(`Found ${delhiHotels.length} Delhi hotels needing exact Agoda page resolution`);

  for (const h of delhiHotels) {
    // Skip airbnb exclusives for agoda
    if (h.airbnbUrl && !h.bookingUrl && !h.url?.includes('makemytrip')) continue;

    console.log(`Resolving Agoda for: ${h.name}`);
    try {
      const query = encodeURIComponent(`site:agoda.com ${h.name} Delhi hotel`);
      const ddgUrl = `https://html.duckduckgo.com/html/?q=${query}`;
      await page.goto(ddgUrl, { waitUntil: 'domcontentloaded', timeout: 10000 });

      const directUrl = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('.result__url'))
          .map(el => el.innerText.trim())
          .filter(u => u.includes('agoda.com') && u.includes('/hotel/'));
        return links[0] ? `https://${links[0].replace(/^https?:\/\//, '')}` : null;
      });

      if (directUrl) {
        console.log(`  -> Exact Agoda URL: ${directUrl}`);
        await Hotel.updateOne({ _id: h._id }, { $set: { agodaUrl: directUrl } });
      } else {
        console.log(`  -> No exact match found, keeping fallback`);
      }
      await new Promise(r => setTimeout(r, 600)); // slight pause to respect DDG
    } catch (err) {
      console.error(`  -> Error resolving Agoda: ${err.message}`);
    }
  }

  await browser.close();
  console.log('\n✅ All Delhi Airbnb images and Agoda exact links updated in MongoDB!');
  process.exit(0);
}
run().catch(console.error);
