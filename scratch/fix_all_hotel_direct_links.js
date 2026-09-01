const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

function slugifyMmt(name) {
  return name.toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/(^_|_$)/g, '');
}

function slugifyBooking(name) {
  return name.toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const countryCodeMap = {
  'India': 'in',
  'USA': 'us',
  'United States': 'us',
  'Maldives': 'mv',
  'Greece': 'gr',
  'France': 'fr',
  'Italy': 'it',
  'United Kingdom': 'gb',
  'UK': 'gb',
  'Switzerland': 'ch',
  'Japan': 'jp',
  'Indonesia': 'id',
  'Thailand': 'th',
  'Singapore': 'sg',
  'UAE': 'ae',
  'United Arab Emirates': 'ae',
  'Australia': 'au',
  'Canada': 'ca',
  'Netherlands': 'nl',
  'Mexico': 'mx',
  'South Africa': 'za',
  'Spain': 'es',
  'Portugal': 'pt',
  'Austria': 'at',
  'Germany': 'de',
  'Turkey': 'tr',
  'Vietnam': 'vn',
  'Malaysia': 'my',
  'New Zealand': 'nz'
};

async function fixAllHotelLinks() {
  await mongoose.connect(process.env.MONGODB_URI);
  const Hotel = mongoose.models.Hotel || mongoose.model('Hotel', new mongoose.Schema({}, { strict: false }));

  const hotels = await Hotel.find({}).lean();
  console.log(`Processing direct hotel links for ${hotels.length} hotels...`);

  let updatedCount = 0;

  for (const hotel of hotels) {
    let updates = {};
    const countryCode = countryCodeMap[hotel.country] || 'in';
    const citySlug = slugifyBooking(hotel.city);
    const hotelSlugBooking = slugifyBooking(hotel.name);
    const hotelSlugMmt = slugifyMmt(hotel.name);

    // 1. Fix MakeMyTrip URLs with expired search queries / listing URLs
    if (hotel.country === 'India' || !hotel.country) {
      if (!hotel.url || hotel.url.includes('hotel-listing') || hotel.url.includes('checkin=') || hotel.url.includes('searchText=')) {
        updates.url = `https://www.makemytrip.com/hotels/${hotelSlugMmt}-details-${citySlug}.html`;
      }
    } else {
      // International hotels should default to Booking.com direct link if url is missing or generic
      if (!hotel.url || hotel.url.includes('makemytrip') || hotel.url.includes('hotel-listing')) {
        updates.url = `https://www.booking.com/hotel/${countryCode}/${hotelSlugBooking}.html`;
      }
    }

    // 2. Fix Booking.com search URLs
    if (hotel.bookingUrl && (hotel.bookingUrl.includes('search.html') || hotel.bookingUrl.includes('ss='))) {
      updates.bookingUrl = `https://www.booking.com/hotel/${countryCode}/${hotelSlugBooking}.html`;
    } else if (!hotel.bookingUrl) {
      updates.bookingUrl = `https://www.booking.com/hotel/${countryCode}/${hotelSlugBooking}.html`;
    }

    // 3. Fix Agoda search URLs
    if (hotel.agodaUrl && (hotel.agodaUrl.includes('search?') || hotel.agodaUrl.includes('textToSearch='))) {
      updates.agodaUrl = `https://www.agoda.com/${hotelSlugBooking}/hotel/${citySlug}-${countryCode}.html`;
    } else if (!hotel.agodaUrl) {
      updates.agodaUrl = `https://www.agoda.com/${hotelSlugBooking}/hotel/${citySlug}-${countryCode}.html`;
    }

    if (Object.keys(updates).length > 0) {
      await Hotel.updateOne({ _id: hotel._id }, { $set: updates });
      updatedCount++;
    }
  }

  console.log(`\n🎉 Successfully updated direct property URLs for ${updatedCount} hotels!`);

  // Specifically verify Gwalior
  const gwalior = await Hotel.find({ city: /gwalior/i }).lean();
  console.log('\n=== GWALIOR DIRECT PROPERTY LINKS ===');
  gwalior.forEach(h => {
    console.log(`🏨 ${h.name}`);
    console.log(`   MMT:     ${h.url}`);
    console.log(`   Booking: ${h.bookingUrl}`);
    console.log(`   Agoda:   ${h.agodaUrl}`);
  });

  await mongoose.disconnect();
}

fixAllHotelLinks().catch(console.error);
