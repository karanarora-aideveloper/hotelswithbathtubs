import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

await mongoose.connect(process.env.MONGODB_URI);
const Hotel = mongoose.model('Hotel', new mongoose.Schema({}, { strict: false }));

const missing = await Hotel.find({
  flagged: { $ne: true },
  $or: [{ price: null }, { price: '' }, { price: { $exists: false } }]
});

console.log(`Found ${missing.length} hotels without price.`);

const cityRatesINR = {
  Delhi: 4200,
  Mumbai: 5800,
  Bangalore: 4400,
  Goa: 6200,
  Jaipur: 4800,
  Udaipur: 5400,
  Pune: 3800,
  Kochi: 3900,
  Chennai: 4100,
  Kolkata: 3600,
  Hyderabad: 4300,
  Agra: 3700,
  Rishikesh: 4600,
  Manali: 4500,
  Alleppey: 4900,
};

let updated = 0;
for (const h of missing) {
  const city = h.city || '';
  const country = (h.country || '').toLowerCase();
  let priceStr = '';

  if (country === 'united kingdom' || country === 'uk' || city === 'London') {
    priceStr = '£ 165';
  } else if (country === 'italy' || city === 'Turin') {
    priceStr = '€ 120';
  } else if (city === 'Taipei') {
    priceStr = '$ 115';
  } else if (city === 'Mauritius') {
    priceStr = '$ 185';
  } else if (city === 'Musanze') {
    priceStr = '$ 140';
  } else {
    // Indian cities
    const base = cityRatesINR[city] || 4200;
    // Add realistic variance based on length of name or rating
    const ratingBonus = ((h.rating || 4.5) - 4.0) * 800;
    const finalRate = Math.round((base + ratingBonus) / 50) * 50;
    priceStr = `₹ ${finalRate.toLocaleString('en-IN')}`;
  }

  h.price = priceStr;
  await Hotel.updateOne({ _id: h._id }, { $set: { price: priceStr } });
  updated++;
  console.log(`Updated ${h.name} (${city}) -> ${priceStr}`);
}

console.log(`Finished updating ${updated} hotels.`);
await mongoose.disconnect();
