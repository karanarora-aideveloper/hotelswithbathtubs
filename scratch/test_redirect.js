const mongoose = require('mongoose');

const MONGODB_URI = "process.env.MONGODB_URI";

const HotelSchema = new mongoose.Schema({
  name: String,
  city: String,
  country: String,
  url: String,
  agodaUrl: String,
  bookingUrl: String,
  flagged: Boolean,
});

const Hotel = mongoose.models.Hotel || mongoose.model('Hotel', HotelSchema);

// Reuse the actual helper logic (mocked here or imported from built files if possible, but let's just write the exact function to verify its behavior on the DB records)
function getSpecificHotelLink(hotel) {
  const isMmtSpecific = (u) => {
    if (!u) return false;
    const lower = u.toLowerCase();
    return (
      (lower.includes('hotel-details') || lower.includes('hotelid=')) &&
      !lower.includes('hotel-listing')
    );
  };

  const isAgodaSpecific = (u) => {
    if (!u) return false;
    const lower = u.toLowerCase();
    return lower.includes('agoda.com') && (lower.includes('.html') || lower.includes('/hotel/'));
  };

  const isBookingSpecific = (u) => {
    if (!u) return false;
    const lower = u.toLowerCase();
    return lower.includes('booking.com') && (lower.includes('.html') || lower.includes('/hotel/'));
  };

  if (isBookingSpecific(hotel.bookingUrl)) {
    return hotel.bookingUrl;
  }
  if (isAgodaSpecific(hotel.agodaUrl)) {
    return hotel.agodaUrl;
  }
  if (isMmtSpecific(hotel.url)) {
    return hotel.url;
  }

  return null;
}

async function test() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB.');

    const cities = ['Gwalior', 'Saputara', 'Ooty', 'Matheran'];

    for (const city of cities) {
      const rawHotels = await Hotel.find({
        city: new RegExp(`^${city}$`, 'i'),
        flagged: { $ne: true }
      });

      console.log(`\nCity: ${city} (Hotels count: ${rawHotels.length})`);
      if (rawHotels.length === 1) {
        const hotel = rawHotels[0];
        console.log(`  Hotel: ${hotel.name}`);
        const specificLink = getSpecificHotelLink(hotel);
        if (specificLink) {
          console.log(`  🚀 REDIRECTING to specific link: ${specificLink}`);
        } else {
          console.log('  ⚠️ NO REDIRECT: No specific/non-generic booking link found. Showing city page normally.');
        }
      } else {
        console.log('  ❌ NO REDIRECT: City has multiple hotels.');
      }
    }

  } catch (err) {
    console.error('Error during test:', err);
  } finally {
    mongoose.disconnect();
  }
}

test();
