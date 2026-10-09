import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(rootDir, '.env.local') });
dotenv.config({ path: path.join(rootDir, '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found.');
  process.exit(1);
}

function cleanTokens(str) {
  return (str || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/gi, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !['the', 'hotel', 'resort', 'spa', 'and', 'palace', 'villas', 'suites', 'room', 'rooms'].includes(w));
}

function jaccardSimilarity(a, b) {
  const setA = new Set(cleanTokens(a));
  const setB = new Set(cleanTokens(b));
  if (setA.size === 0 || setB.size === 0) return 0;
  const intersection = new Set([...setA].filter((x) => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return intersection.size / union.size;
}

async function runDeepAudit() {
  console.log('🔍 Connecting to MongoDB for comprehensive duplicate audit...');
  await mongoose.connect(MONGODB_URI);
  const Hotel = mongoose.model('Hotel', new mongoose.Schema({}, { strict: false }), 'hotels');

  const hotels = await Hotel.find({ flagged: { $ne: true } })
    .select('name city country slug image url bookingUrl agodaUrl airbnbUrl tripUrl _id rating price')
    .lean();

  console.log(`Auditing ${hotels.length} active hotel documents across all cities...`);

  // Group by City
  const cityGroups = new Map();
  for (const h of hotels) {
    const key = `${(h.country || '').trim().toLowerCase()}:${(h.city || '').trim().toLowerCase()}`;
    if (!cityGroups.has(key)) cityGroups.set(key, []);
    cityGroups.get(key).push(h);
  }

  const duplicates = [];

  for (const [cityKey, list] of cityGroups.entries()) {
    const seenPairs = new Set();

    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const h1 = list[i];
        const h2 = list[j];
        const pairKey = [h1._id.toString(), h2._id.toString()].sort().join('_');
        if (seenPairs.has(pairKey)) continue;

        let reason = null;

        // 1. Exact name match (case-insensitive)
        if (h1.name.trim().toLowerCase() === h2.name.trim().toLowerCase()) {
          reason = 'EXACT_NAME_MATCH';
        }
        // 2. High token similarity (>= 0.75)
        else {
          const sim = jaccardSimilarity(h1.name, h2.name);
          if (sim >= 0.75) {
            reason = `HIGH_NAME_SIMILARITY (${(sim * 100).toFixed(0)}%)`;
          }
        }

        // 3. Exact same Booking URL or exact same image if names are somewhat similar (>= 0.5)
        if (!reason && h1.bookingUrl && h2.bookingUrl && h1.bookingUrl === h2.bookingUrl) {
          const sim = jaccardSimilarity(h1.name, h2.name);
          if (sim >= 0.4) {
            reason = 'IDENTICAL_BOOKING_URL';
          }
        }

        if (reason) {
          seenPairs.add(pairKey);
          duplicates.push({
            city: cityKey,
            reason,
            h1: { id: h1._id, name: h1.name, slug: h1.slug, rating: h1.rating, price: h1.price },
            h2: { id: h2._id, name: h2.name, slug: h2.slug, rating: h2.rating, price: h2.price },
          });
        }
      }
    }
  }

  console.log(`\n========================================`);
  console.log(`TOTAL DUPLICATE PAIRS FOUND: ${duplicates.length}`);
  console.log(`========================================\n`);

  for (let idx = 0; idx < duplicates.length; idx++) {
    const d = duplicates[idx];
    console.log(`[${idx + 1}] Reason: ${d.reason} in "${d.city}"`);
    console.log(`    A: [${d.h1.id}] "${d.h1.name}" (${d.h1.slug}) - ${d.h1.price || 'N/A'}`);
    console.log(`    B: [${d.h2.id}] "${d.h2.name}" (${d.h2.slug}) - ${d.h2.price || 'N/A'}`);
  }

  await mongoose.disconnect();
}

runDeepAudit().catch((err) => {
  console.error('Audit failed:', err);
  process.exit(1);
});
