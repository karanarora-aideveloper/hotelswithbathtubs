const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const targetCity = process.argv[2] || 'gwalior';

async function checkUrl(url) {
  if (!url) return { status: 'EMPTY' };
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      redirect: 'follow'
    });
    return { status: res.status, url: res.url };
  } catch (err) {
    return { status: 'ERR', message: err.message };
  }
}

async function auditCity() {
  await mongoose.connect(process.env.MONGODB_URI);
  const Hotel = mongoose.models.Hotel || mongoose.model('Hotel', new mongoose.Schema({}, { strict: false }));

  const hotels = await Hotel.find({ city: new RegExp(`^${targetCity}$`, 'i') }).lean();
  console.log(`\n============================================================`);
  console.log(`🔍 AUDITING CITY: ${targetCity.toUpperCase()} (${hotels.length} hotels)`);
  console.log(`============================================================\n`);

  if (hotels.length === 0) {
    console.log(`❌ No hotels found in database for city: "${targetCity}".`);
    await mongoose.disconnect();
    return;
  }

  for (let i = 0; i < hotels.length; i++) {
    const h = hotels[i];
    console.log(`\n[${i + 1}/${hotels.length}] 🏨 ${h.name} (${h.country} - ${h.city})`);
    
    // Check Image
    const imgCheck = await checkUrl(h.image);
    console.log(`  📸 Image:   [${imgCheck.status}] ${h.image?.substring(0, 70)}...`);

    // Check MMT
    if (h.url) {
      const mmtCheck = await checkUrl(h.url);
      console.log(`  🇮🇳 MMT:     [${mmtCheck.status}] ${h.url}`);
    }

    // Check Booking
    if (h.bookingUrl) {
      const bCheck = await checkUrl(h.bookingUrl);
      console.log(`  🌐 Booking: [${bCheck.status}] ${h.bookingUrl}`);
    }

    // Check Agoda
    if (h.agodaUrl) {
      const aCheck = await checkUrl(h.agodaUrl);
      console.log(`  🏨 Agoda:   [${aCheck.status}] ${h.agodaUrl}`);
    }
  }

  console.log(`\n============================================================`);
  console.log(`✅ Completed audit for ${targetCity.toUpperCase()}`);
  console.log(`============================================================\n`);

  await mongoose.disconnect();
}

auditCity().catch(console.error);
