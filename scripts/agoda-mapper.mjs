import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
puppeteer.use(StealthPlugin());

async function runAgodaMapper() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB.');
  const Hotel = mongoose.connection.collection('hotels');

  // Find hotels that have bookingUrl or url but NO agodaUrl
  const hotelsToFix = await Hotel.find({ agodaUrl: { $exists: false } }).toArray();
  console.log(`Found ${hotelsToFix.length} hotels without an Agoda link. Starting restoration...`);

  const browser = await puppeteer.launch({ 
    headless: true, 
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  let restored = 0;
  // Run for a small batch to not get IP banned by Google
  for (const hotel of hotelsToFix.slice(0, 50)) {
    try {
      const query = encodeURIComponent(`site:agoda.com "${hotel.name}" "${hotel.city}"`);
      await page.goto(`https://www.google.com/search?q=${query}`, { waitUntil: 'networkidle2' });
      
      const links = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('a'))
          .map(a => a.href)
          .filter(href => href.includes('agoda.com') && (href.includes('/hotel/') || href.includes('-hotel.html') || href.includes('-resort.html') || href.match(/\/[a-z\-]+-[a-z]+\.html/)));
      });

      if (links.length > 0) {
        // Find the most likely exact match
        let bestLink = links[0].split('?')[0]; // Strip query params
        // Re-append the Agoda affiliate CID
        const finalAgodaUrl = `${bestLink}?cid=1972736`;
        
        await Hotel.updateOne(
          { _id: hotel._id },
          { $set: { agodaUrl: finalAgodaUrl } }
        );
        console.log(`[✔] RESTORED Agoda: ${hotel.name} -> ${finalAgodaUrl}`);
        restored++;
      } else {
        console.log(`[ ] No valid Agoda link found for: ${hotel.name}`);
      }
      
      // Delay to respect Google limits
      await new Promise(r => setTimeout(r, 3000));
    } catch (err) {
      console.log(`[!] Error on ${hotel.name}: ${err.message}`);
    }
  }

  await browser.close();
  console.log(`\n🎉 Agoda Restoration Batch Complete! Restored ${restored} links.`);
  process.exit(0);
}

runAgodaMapper().catch(console.error);
