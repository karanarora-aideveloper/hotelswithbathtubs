const mongoose = require('mongoose');
const https = require('https');
require('dotenv').config({ path: '.env.local' });

function checkUrl(url) {
  if (!url || !url.startsWith('http')) return Promise.resolve({ status: 'MISSING' });
  return new Promise(resolve => {
    const req = https.request(url, { method: 'HEAD', timeout: 4000, headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      resolve({ status: res.statusCode });
    });
    req.on('error', () => resolve({ status: 'ERR' }));
    req.on('timeout', () => { req.destroy(); resolve({ status: 'TIMEOUT' }); });
    req.end();
  });
}

async function fixAgodaLinks() {
  console.log('🔌 Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI);
  const Hotel = mongoose.models.Hotel || mongoose.model('Hotel', new mongoose.Schema({}, { strict: false }));
  
  const hotels = await Hotel.find({ agodaUrl: { $exists: true, $ne: '' } })
    .select('_id name agodaUrl')
    .lean();
    
  console.log(`📋 Loaded ${hotels.length} hotels with Agoda links to verify.`);
  
  let fixedCount = 0;
  
  for (let i = 0; i < hotels.length; i += 20) {
    const chunk = hotels.slice(i, i + 20);
    const results = await Promise.all(chunk.map(async h => {
      const { status } = await checkUrl(h.agodaUrl);
      return { id: h._id, status };
    }));
    
    for (const r of results) {
      if (![200, 202].includes(r.status)) {
        await Hotel.updateOne({ _id: r.id }, { $unset: { agodaUrl: 1 } });
        fixedCount++;
      }
    }
    process.stdout.write(`  Processed ${Math.min(i + 20, hotels.length)}/${hotels.length} (Unset ${fixedCount} broken links)...\r`);
  }
  
  console.log(`\n✅ Done! Removed ${fixedCount} broken Agoda links.`);
  await mongoose.disconnect();
}

fixAgodaLinks().catch(err => { console.error(err); process.exit(1); });
