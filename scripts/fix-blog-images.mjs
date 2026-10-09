import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Please define MONGODB_URI in .env.local');
  process.exit(1);
}

const R2_BASE = 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images';

// Explicit verified mapping for known blogs
const explicitMappings = {
  // Delhi
  'hotel-with-bathtub-in-delhi': `${R2_BASE}/delhi/the-leela-palace-new-delhi.webp`,
  'delhi-mahipalpur-hotels-with-bathtub-jacuzzi': `${R2_BASE}/airport-hotel-ramhan-palace-mahipalpur-with-bath-tub.webp`,
  'delhi-weekend-getaways-exploring-the-best-in-room-bathtubs': `${R2_BASE}/jacuzzi-roseate-house-new-delhi-aerocity.webp`,

  // India Cities & Regions
  'a-couples-guide-to-udaipur-royal-heritage-hotels-with-bath-suites': `${R2_BASE}/the-oberoi-udaivilas-udaipur.webp`,
  'bangalores-hidden-gems-boutique-hotels-with-private-jacuzzis': `${R2_BASE}/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp`,
  'hotels-with-bathtub-in-bangalore-couple-stays': `${R2_BASE}/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp`,
  'escaping-to-lonavala-private-bathtubs-with-mountain-views': `${R2_BASE}/bathtub-the-machan-lonavala.webp`,
  'top-couple-resorts-in-lonavala-with-bathtubs': `${R2_BASE}/bathtub-the-machan-lonavala.webp`,
  'mumbai-staycations-best-luxury-hotels-with-deep-soaking-tubs': `${R2_BASE}/the-taj-mahal-palace-mumbai.webp`,
  'why-goa-is-the-ultimate-destination-for-private-jacuzzi-villas': `${R2_BASE}/alila-diwa-goa-a-hyatt-brand-with-bathtub-room.webp`,
  'hotel-with-bathtub-in-gurgaon': `${R2_BASE}/bathtub-the-leela-ambience-gurugram.webp`,
  'hotel-with-bathtub-in-jaipur': `${R2_BASE}/the-oberoi-rajvilas-jaipur.webp`,
  'hotel-with-bathtub-in-kolkata': `${R2_BASE}/the-oberoi-grand-kolkata.webp`,
  'kolkata-hotels-with-bathtub-couples-guide': `${R2_BASE}/the-oberoi-grand-kolkata.webp`,
  'kolkata-jacuzzi-hotels-romantic-staycation': `${R2_BASE}/the-oberoi-grand-kolkata.webp`,
  'hotel-with-bathtub-in-lucknow': `${R2_BASE}/taj-mahal-lucknow.webp`,
  'hotel-with-bathtub-in-rishikesh': `${R2_BASE}/aloha-on-the-ganges-by-leisure-hotels-rishikesh-with-bathtub.webp`,
  'romantic-resorts-in-ooty-for-couples-with-bathtubs': `${R2_BASE}/savoy-ihcl-seleqtions-ooty.webp`,
  'manali-munnar-honeymoon-jacuzzi-resorts': `${R2_BASE}/broad-bean-resort-spa-hotel-munnar-with-romantic-jacuzzi-in-room.webp`,
  'best-honeymoon-places-in-india-with-private-jacuzzis': `${R2_BASE}/the-oberoi-udaivilas-udaipur.webp`,
  'private-jacuzzi-suites-india': `${R2_BASE}/alila-diwa-goa-a-hyatt-brand-with-bathtub-room.webp`,
  'best-hotels-private-jacuzzi-couples-india': `${R2_BASE}/the-oberoi-rajvilas-jaipur.webp`,
  'budget-romantic-getaway-india': `${R2_BASE}/airport-hotel-ramhan-palace-mahipalpur-with-bath-tub.webp`,
  'honeymoon-hotels-freestanding-bathtubs-india': `${R2_BASE}/the-taj-mahal-palace-mumbai.webp`,
  'top-romantic-hotels-with-bathtubs-in-bhopal-for-couples': `${R2_BASE}/jehan-numa-palace-hotel-bhopal.webp`,

  // International
  'bali-villas-private-pool-bathtub': `${R2_BASE}/luxury-bathtub-bali-viceroy-bali.webp`,
  'bali-honeymoon-villas-with-private-outdoor-bathtubs': `${R2_BASE}/luxury-bathtub-bali-viceroy-bali.webp`,
  'dubai-hotels-with-private-jacuzzi': `${R2_BASE}/luxury-bathtub-dubai-burj-al-arab-jumeirah.webp`,
  'top-5-luxury-hotels-with-private-hot-tubs-in-dubai': `${R2_BASE}/luxury-bathtub-dubai-burj-al-arab-jumeirah.webp`,
  'hotels-with-bathtubs-in-london': `${R2_BASE}/luxury-bathtub-london-the-savoy.webp`,
  'londons-most-historic-hotels-with-deep-soaking-tubs': `${R2_BASE}/luxury-bathtub-london-the-savoy.webp`,
  'las-vegas-hotels-with-jacuzzi-in-room': `${R2_BASE}/luxury-bathtub-las-vegas-waldorf-astoria-las-vegas.webp`,
  'nyc-hotels-with-soaking-tubs': `${R2_BASE}/luxury-bathtub-new-york-the-mark.webp`,
  'best-hotels-with-jacuzzi-in-room-nyc': `${R2_BASE}/luxury-bathtub-new-york-the-mark.webp`,
  'romantic-hotels-with-private-hot-tubs-near-nyc-upstate': `${R2_BASE}/luxury-bathtub-new-york-the-mark.webp`,
  'hotels-with-bathtubs-in-singapore': `${R2_BASE}/luxury-bathtub-singapore-the-fullerton-bay-hotel-singapore.webp`,
  'hotels-with-bathtubs-in-bangkok': `${R2_BASE}/luxury-bathtub-bangkok-capella-bangkok.webp`,
  'best-jacuzzi-suites-berlin-romantic-weekend': `${R2_BASE}/luxury-bathtub-berlin-the-ritz-carlton-berlin.webp`,
  'venice-opulent-hotel-bathtubs-grand-canal': `${R2_BASE}/luxury-bathtub-venice-the-gritti-palace.webp`,
  'top-5-luxury-hotels-private-hot-tubs-cancun': `${R2_BASE}/luxury-bathtub-cancun-live-aqua-beach-resort-cancun.webp`,
  'cape-town-breathtaking-bathtub-views': `${R2_BASE}/luxury-bathtub-cape-town-belmond-mount-nelson-hotel.webp`,
  'vienna-imperial-spa-suites-guide': `${R2_BASE}/luxury-bathtub-vienna-park-hyatt-vienna.webp`,

  // General romance & advice
  'how-a-private-in-room-bathtub-transformed-my-anniversary-date': `${R2_BASE}/delhi/the-leela-palace-new-delhi.webp`,
  'how-to-plan-the-perfect-anniversary-surprise-in-a-jacuzzi-suite': `${R2_BASE}/jacuzzi-roseate-house-new-delhi-aerocity.webp`,
  'the-psychology-of-relaxation-why-couples-need-a-spa-bath-retreat': `${R2_BASE}/alila-diwa-goa-a-hyatt-brand-with-bathtub-room.webp`,
  'ultimate-guide-hotels-with-bathtubs': `${R2_BASE}/delhi/the-leela-palace-new-delhi.webp`,
  'accessible-hotels-bathtubs-mobility': `${R2_BASE}/bathtub-hotel-novotel-new-delhi-aerocity-international-airport.webp`,
  'verify-hotel-amenities-accurate-booking': `${R2_BASE}/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp`,
  'hotel-bathtub-booking-checklist-how-to-confirm-before-booking': `${R2_BASE}/bathtub-the-machan-lonavala.webp`,
  'luxury-hotels-unique-bathtub-experiences-panoramic-views-designer-tubs': `${R2_BASE}/the-oberoi-udaivilas-udaipur.webp`,
};

async function fixBlogImages() {
  await mongoose.connect(MONGODB_URI);
  const Blog = mongoose.model('Blog', new mongoose.Schema({}, { strict: false }));

  console.log('Connected to MongoDB. Verifying URLs before updating...');

  for (const [slug, url] of Object.entries(explicitMappings)) {
    try {
      const res = await fetch(url, { method: 'HEAD' });
      if (!res.ok) {
        console.warn(`[WARN] URL 404 for ${slug}: ${url}`);
        // Fall back to known guaranteed image
        explicitMappings[slug] = `${R2_BASE}/delhi/the-leela-palace-new-delhi.webp`;
      }
    } catch (e) {
      console.warn(`[ERROR] URL error for ${slug}: ${e.message}`);
    }
  }

  let updatedCount = 0;
  for (const [slug, imageUrl] of Object.entries(explicitMappings)) {
    const res = await Blog.updateOne({ slug }, { $set: { image: imageUrl } });
    if (res.matchedCount > 0) {
      updatedCount++;
      console.log(`[UPDATED] ${slug} -> ${imageUrl}`);
    }
  }

  console.log(`\nDone! Successfully updated ${updatedCount} blogs.`);
  process.exit(0);
}

fixBlogImages();
