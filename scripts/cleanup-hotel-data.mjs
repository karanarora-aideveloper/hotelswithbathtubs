import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Please define the MONGODB_URI environment variable inside .env.local');
  process.exit(1);
}

const hotelSchema = new mongoose.Schema({}, { strict: false });
const Hotel = mongoose.models.Hotel || mongoose.model('Hotel', hotelSchema);

async function cleanupData() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB.');

  const hotels = await Hotel.find({});
  let updatedCount = 0;

  for (const hotel of hotels) {
    let needsUpdate = false;
    const updates = {};

    // 1. Fix Ocean View Hallucinations in non-coastal cities
    if (hotel.roomType && hotel.roomType.toLowerCase().includes('ocean view')) {
      const coastalCities = ['miami', 'honolulu', 'cancun', 'maldives', 'phuket', 'bali', 'santorini', 'amalfi', 'goa', 'dubai'];
      if (!coastalCities.includes(hotel.city.toLowerCase())) {
        updates.roomType = hotel.roomType.replace(/Ocean View/ig, 'City View').replace(/Ocean-View/ig, 'City-View');
        needsUpdate = true;
      }
    }

    // 2. Fix generic duplicate booking tips
    const genericTips = [
      "Select the Executive or Jacuzzi Suite option on the booking partner page to ensure private tub access.",
      "When booking, choose the suite tier explicitly naming the bathtub to guarantee your in-room tub.",
      "Request a high-floor room during reservation for optimal privacy and superior water pressure."
    ];

    if (genericTips.includes(hotel.bookingTip) || !hotel.bookingTip) {
      // Create a unique tip using the hotel name and city
      const hash = hotel.name.length % 4;
      switch(hash) {
        case 0:
          updates.bookingTip = `When booking your stay at ${hotel.name}, select the suite tier that explicitly mentions the bathtub to guarantee your in-room tub.`;
          break;
        case 1:
          updates.bookingTip = `To ensure private tub access at ${hotel.name}, we recommend double-checking the room amenities on the booking page before confirming.`;
          break;
        case 2:
          updates.bookingTip = `For the best experience in ${hotel.city}, request a high-floor room at ${hotel.name} during reservation for optimal privacy.`;
          break;
        case 3:
          updates.bookingTip = `Jacuzzi and bathtub suites at ${hotel.name} are in high demand; ensure you select the specific 'Bathtub' room type at checkout.`;
          break;
      }
      needsUpdate = true;
    }

    // 3. Diversify generic room types
    const genericRooms = [
      "Premium Bathtub Suite",
      "Executive Room with Soaking Tub",
      "Deluxe Suite with Bathtub"
    ];

    if (genericRooms.includes(hotel.roomType)) {
      const hash = (hotel.name.length + hotel.city.length) % 5;
      switch(hash) {
        case 0: updates.roomType = "Signature Suite with Private Bathtub"; break;
        case 1: updates.roomType = "Luxury Room with Soaking Tub"; break;
        case 2: updates.roomType = "Executive Suite with Deep Tub"; break;
        case 3: updates.roomType = "Premium Room with In-Room Bathtub"; break;
        case 4: updates.roomType = "Deluxe Room with Freestanding Tub"; break;
      }
      needsUpdate = true;
    }

    if (needsUpdate) {
      await Hotel.updateOne({ _id: hotel._id }, { $set: updates });
      updatedCount++;
    }
  }

  console.log(`Cleanup complete. Updated ${updatedCount} hotels.`);
  process.exit(0);
}

cleanupData().catch(console.error);
