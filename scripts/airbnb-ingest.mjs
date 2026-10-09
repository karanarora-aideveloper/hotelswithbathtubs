import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { ApifyClient } from 'apify-client';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Setup Apify (The user will need to add APIFY_API_TOKEN to .env.local)
const apifyClient = new ApifyClient({
  token: process.env.APIFY_API_TOKEN || 'YOUR_APIFY_TOKEN_HERE',
});

// We map common bathtub amenities returned by typical Apify Airbnb scrapers
const BATHTUB_AMENITIES = ['Bathtub', 'Hot tub', 'Jacuzzi', 'Private hot tub', 'Soaking tub'];

async function ingestAirbnbProperties(city, country, limit = 50) {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB.');

  const Hotel = mongoose.connection.collection('hotels');

  console.log(`Starting Apify Scrape for ${city}, ${country}...`);

  try {
    // Calling a known, reliable Airbnb scraper Actor (e.g., dtrh/airbnb-scraper)
    const run = await apifyClient.actor('dtrh/airbnb-scraper').call({
      locationQuery: `${city}, ${country}`,
      maxListings: limit,
      // You can add specific filters here depending on the actor's schema
    });

    console.log(`Scrape finished. Fetching results from dataset ${run.defaultDatasetId}...`);
    const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();

    console.log(`Found ${items.length} total properties in ${city}. Filtering for bathtubs...`);

    let ingested = 0;

    for (const item of items) {
      // Ensure it has a bathtub
      const hasBathtub = item.amenities && item.amenities.some(a => BATHTUB_AMENITIES.includes(a.name || a));
      
      if (!hasBathtub) continue;

      // Ensure it doesn't already exist
      const existing = await Hotel.findOne({ url: item.url });
      if (existing) continue;

      // Extract high-res image
      const imageUrl = item.photos && item.photos.length > 0 ? item.photos[0].pictureUrl : null;
      if (!imageUrl) continue;

      const newProperty = {
        name: item.name,
        slug: item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
        city: city,
        country: country,
        url: item.url, // Canonical Airbnb URL
        airbnbUrl: item.url,
        image: imageUrl,
        verified: true,
        amenities: item.amenities.map(a => a.name || a).slice(0, 10),
        description: item.description,
        rating: item.stars,
        reviewsCount: item.reviewsCount,
        bathtubConfirmed: true,
        tubType: item.amenities.find(a => BATHTUB_AMENITIES.includes(a.name || a))?.name || 'Bathtub',
        roomType: item.roomType || 'Entire Home/Apt',
        price: item.price ? `\$${item.price}` : null
      };

      await Hotel.insertOne(newProperty);
      console.log(`[+] Ingested Airbnb-exclusive property: ${item.name}`);
      ingested++;
    }

    console.log(`\nIngestion Complete! Added ${ingested} new Airbnb properties for ${city}.`);
  } catch (err) {
    console.error('Error during Apify ingestion:', err.message);
  }

  process.exit(0);
}

// Example usage: node scripts/airbnb-ingest.mjs "Bali" "Indonesia"
const city = process.argv[2] || 'Bali';
const country = process.argv[3] || 'Indonesia';

ingestAirbnbProperties(city, country).catch(console.error);
