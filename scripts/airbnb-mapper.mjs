import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { search } from 'duck-duck-scrape';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Helper to delay between requests to avoid rate limiting
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function mapAirbnbLinks() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB.');

  const Hotel = mongoose.connection.collection('hotels');
  const hotels = await Hotel.find({ airbnbUrl: { $exists: false }, flagged: { $ne: true } }).toArray();
  
  console.log(`Found ${1} hotels without an Airbnb URL. Commencing mapping...`);

  let matched = 0;

  for (let i = 0; i < hotels.length; i++) {
    const hotel = hotels[i];
    const query = `site:airbnb.com/rooms/ "${hotel.name}" "${hotel.city}"`;
    
    try {
      const results = await search(query);
      const airbnbLink = results.results.find(r => r.url.includes('airbnb.com/rooms/'));

      if (airbnbLink) {
        // Basic sanitization to remove extraneous query params like ?source_impression_id
        const cleanUrl = airbnbLink.url.split('?')[0];
        
        await Hotel.updateOne(
          { _id: hotel._id },
          { $set: { airbnbUrl: cleanUrl } }
        );
        console.log(`[✔] MATCH: ${hotel.name} -> ${cleanUrl}`);
        matched++;
      } else {
        console.log(`[ ] None: ${hotel.name}`);
      }

    } catch (error) {
      console.log(`[!] Error searching for ${hotel.name}: ${error.message}`);
      // Back off heavily if rate limited
      if (error.message.includes('429')) {
        console.log('Rate limit hit. Pausing for 60 seconds...');
        await delay(60000);
      }
    }

    // Gentle delay to avoid DDG rate limits
    await delay(3000);
  }

  console.log(`\nMapping Complete! Successfully mapped ${matched} Airbnb URLs.`);
  process.exit(0);
}

mapAirbnbLinks().catch(console.error);
