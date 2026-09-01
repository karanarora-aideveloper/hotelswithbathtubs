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

async function check() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully.');

    const hotels = await Hotel.find({ flagged: { $ne: true } });
    console.log(`Checking ${hotels.length} active hotels...`);

    const genericMMT = [];
    const genericAgoda = [];
    const genericBooking = [];

    for (const h of hotels) {
      // Check MakeMyTrip (url)
      if (h.url) {
        const u = h.url.toLowerCase();
        // Specific MMT detail links usually contain "hotel-details" or a specific pattern, but generic might be /hotels/ or just main domain
        if (
          !u.includes('hotel-details') &&
          !u.includes('detail') &&
          !u.includes('hotelid=') &&
          (u.includes('makemytrip.com/hotels') || u === 'https://www.makemytrip.com' || u === 'https://makemytrip.com')
        ) {
          genericMMT.push({ name: h.name, city: h.city, url: h.url });
        }
      }

      // Check Agoda
      if (h.agodaUrl) {
        const u = h.agodaUrl.toLowerCase();
        // Specific Agoda links usually contain pages with ".html" or specific hotels. Generic might be main domain or city listing
        if (
          !u.includes('.html') &&
          !u.includes('hotel/') &&
          (u.includes('agoda.com') || u === 'https://www.agoda.com' || u === 'https://agoda.com')
        ) {
          genericAgoda.push({ name: h.name, city: h.city, url: h.agodaUrl });
        }
      }

      // Check Booking.com
      if (h.bookingUrl) {
        const u = h.bookingUrl.toLowerCase();
        if (
          !u.includes('.html') &&
          !u.includes('hotel/') &&
          (u.includes('booking.com') || u === 'https://www.booking.com' || u === 'https://booking.com')
        ) {
          genericBooking.push({ name: h.name, city: h.city, url: h.bookingUrl });
        }
      }
    }

    console.log(`\n--- Generic MakeMyTrip Links: ${genericMMT.length} ---`);
    genericMMT.slice(0, 10).forEach(x => console.log(`- ${x.name} (${x.city}): ${x.url}`));
    if (genericMMT.length > 10) console.log(`... and ${genericMMT.length - 10} more`);

    console.log(`\n--- Generic Agoda Links: ${genericAgoda.length} ---`);
    genericAgoda.slice(0, 10).forEach(x => console.log(`- ${x.name} (${x.city}): ${x.url}`));
    if (genericAgoda.length > 10) console.log(`... and ${genericAgoda.length - 10} more`);

    console.log(`\n--- Generic Booking.com Links: ${genericBooking.length} ---`);
    genericBooking.slice(0, 10).forEach(x => console.log(`- ${x.name} (${x.city}): ${x.url}`));
    if (genericBooking.length > 10) console.log(`... and ${genericBooking.length - 10} more`);

  } catch (err) {
    console.error('Error running check:', err);
  } finally {
    mongoose.disconnect();
  }
}

check();
