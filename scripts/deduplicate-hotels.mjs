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

// Exactly confirmed redundant duplicate document IDs to prune:
const DUPLICATE_DOCS_TO_DELETE = [
  // 1. Panchgani: Prefixed duplicate of Antilia Villa
  { id: '6a90457b8566320ebd9fcaae', canonicalId: '6a90457a8566320ebd9fcaa3', reason: 'City-prefixed duplicate of Antilia Villa' },
  // 2. Mandarmani: Prefixed duplicate of Sweet Dream Beach Resort
  { id: '6a90457c8566320ebd9fcabe', canonicalId: '6a90457c8566320ebd9fcac1', reason: 'City-prefixed duplicate of Sweet Dream Beach Resort' },
  // 3. Rajkot: Prefixed duplicate of Nova Hotel New Crossroad
  { id: '6a9045848566320ebd9fcb17', canonicalId: '6a9045848566320ebd9fcb21', reason: 'City-prefixed duplicate of Nova Hotel New Crossroad' },
  // 4. Amritsar: Redundant listing of Taj Swarna (same MMT URL)
  { id: '6a9045888566320ebd9fcb4c', canonicalId: '6a9045878566320ebd9fcb3d', reason: 'Duplicate listing of Taj Swarna (identical MMT URL)' },
  // 5. Amritsar: Duplicate listing of Holiday Inn Ranjit Avenue
  { id: '6a9045888566320ebd9fcb48', canonicalId: '6a9045878566320ebd9fcb40', reason: 'Duplicate listing of Holiday Inn Ranjit Avenue' },
  // 6. Pune: Duplicate listing of Hotel Conrad
  { id: '6a90458a8566320ebd9fcb61', canonicalId: '6a90458a8566320ebd9fcb60', reason: 'Duplicate listing of Hotel Conrad' },
  // 7. Faridabad: Prefixed duplicate of Vivanta Surajkund NCR
  { id: '6a90458c8566320ebd9fcb7a', canonicalId: '6a90458b8566320ebd9fcb74', reason: 'City-prefixed duplicate of Vivanta Surajkund NCR' },
  // 8. Nashik: Redundant duplicate with trailing "2"
  { id: '6a90458d8566320ebd9fcb88', canonicalId: '6a90458d8566320ebd9fcb8a', reason: 'Duplicate listing with trailing "2" for Viveda Wellness Resort' },
  // 9. Chandigarh: Inverted name duplicate of Hotel Wyndham Mohali
  { id: '6a90458e8566320ebd9fcb94', canonicalId: '6a90458e8566320ebd9fcb90', reason: 'Inverted name duplicate of Hotel Wyndham Mohali' },
  // 10. Chandigarh: Duplicate listing of Hyatt Regency
  { id: '6a90458e8566320ebd9fcb98', canonicalId: '6a90458e8566320ebd9fcb91', reason: 'Duplicate listing of Hyatt Regency Chandigarh' },
  // 11. Mahabalipuram: Prefixed duplicate of Sheraton Grand Chennai Resort Spa
  { id: '6a9045908566320ebd9fcbac', canonicalId: '6a9045908566320ebd9fcbaf', reason: 'City-prefixed duplicate of Sheraton Grand Chennai Resort Spa' },
  // 12. Zirakpur: Prefixed duplicate of Urban Homestay Wood Cottage
  { id: '6a9045938566320ebd9fcbca', canonicalId: '6a9045938566320ebd9fcbc9', reason: 'City-prefixed duplicate of Urban Homestay Wood Cottage' },
  // 13. Igatpuri: Redundant duplicate of Tropical Retreat Luxury Resort & Spa
  { id: '6a9045968566320ebd9fcbed', canonicalId: '6a9045968566320ebd9fcbec', reason: 'Duplicate listing of Tropical Retreat Luxury Resort & Spa' },
  // 14. Lavasa: Inverted name duplicate of Hotel Lake Facing Premium Retreat
  { id: '6a90459b8566320ebd9fcc26', canonicalId: '6a90459b8566320ebd9fcc25', reason: 'Inverted name duplicate of Hotel Lake Facing Premium Retreat' },
  // 15. Panvel: Redundant duplicate of Visava Amusement Park & Resort (same MMT URL)
  { id: '6a90459c8566320ebd9fcc2f', canonicalId: '6aa7ccfe6e88c43638d73a9b', reason: 'Lower detail duplicate of Visava Amusement Park & Resort' },
  // 16. Tromso: Incomplete duplicate name of St Elisabeth Hotel & Spa
  { id: '6aaf97d9f34b7c7289d7dec6', canonicalId: '6aaf97d9f34b7c7289d7dec5', reason: 'Incomplete duplicate name of St Elisabeth Hotel & Spa' },
  // 17. Kotor: Redundant listing of Blanc & Bleu
  { id: '6ab20186f34b7c7289d7fa9b', canonicalId: '6ab20186f34b7c7289d7fa99', reason: 'Duplicate listing of Boutique Hotel and Spa Blanc & Bleu' },
  // 18. Samarkand: Exact duplicate listing of Boulevard
  { id: '6ac8aef59fb631706447ed37', canonicalId: '6aafdc22f34b7c7289d7e25c', reason: 'Exact name duplicate of Boulevard Samarkand' },
  // 19. Aswan: Exact duplicate listing of Mostafa Nubian Guesthouse
  { id: '6ac8ad139fb631706447ead7', canonicalId: '6ac8ad139fb631706447ead6', reason: 'Exact duplicate listing of Mostafa Nubian Guesthouse' },
  // 20. Mangalore: Pre-rebrand duplicate of Vivanta Mangalore Old Port Road
  { id: '6ac8c0092f66532e90cfbb3f', canonicalId: '6ac8c0092f66532e90cfbb40', reason: 'Pre-rebrand name (The Gateway Hotel) duplicate of Vivanta Mangalore' },
  // 21. Bukhara: Redundant listing of Shergiron Plaza
  { id: '6aafdcd3f34b7c7289d7e269', canonicalId: '6aafdcd2f34b7c7289d7e266', reason: 'Redundant duplicate listing of Shergiron Plaza' },
  // 22. Cross-city Airbnb duplicate: The Hidden Eden in Pune (actual location Karjat)
  { id: '6ac789bad3013ec62bd9df18', canonicalId: '6ac8ad829fb631706447eb63', reason: 'Cross-city Airbnb room duplicate in Pune (actual location Karjat)' },
  // 23. Cross-city Airbnb duplicate: Luka Seaside ECR in Mahabalipuram (retained in Chennai)
  { id: '6ac8ad949fb631706447eb7b', canonicalId: '6ac78a4dd3013ec62bd9df30', reason: 'Cross-city Airbnb room duplicate in Mahabalipuram (retained in Chennai)' },
  // 24-35. Saranda properties duplicated into Ksamil
  { id: '6ab20393f34b7c7289d7facc', canonicalId: '6ab202e9f34b7c7289d7fab3', reason: 'Saranda property duplicated into Ksamil: Grand Hotel Saranda' },
  { id: '6ab20393f34b7c7289d7fac6', canonicalId: '6ab202e9f34b7c7289d7fab4', reason: 'Saranda property duplicated into Ksamil: Jako Premium Hotel' },
  { id: '6ab20393f34b7c7289d7facf', canonicalId: '6ab202e9f34b7c7289d7fab7', reason: 'Saranda property duplicated into Ksamil: La Onda Luxury Suites' },
  { id: '6ab20393f34b7c7289d7faca', canonicalId: '6ab202e9f34b7c7289d7fab8', reason: 'Saranda property duplicated into Ksamil: Dian Boutique Hotel' },
  { id: '6ab20393f34b7c7289d7fac8', canonicalId: '6ab202e9f34b7c7289d7fab9', reason: 'Saranda property duplicated into Ksamil: Duplex Penthouse with Jacuzzi' },
  { id: '6ab20393f34b7c7289d7facb', canonicalId: '6ab202e9f34b7c7289d7faba', reason: 'Saranda property duplicated into Ksamil: Elite Sea View Jacuzzi Penthouses' },
  { id: '6ab20393f34b7c7289d7fad0', canonicalId: '6ab202e9f34b7c7289d7fabb', reason: 'Saranda property duplicated into Ksamil: Seaview Deda 02' },
  { id: '6ab20393f34b7c7289d7fac7', canonicalId: '6ab202e9f34b7c7289d7fabc', reason: 'Saranda property duplicated into Ksamil: Heavenly Rest Luxury Hotel' },
  { id: '6ab20393f34b7c7289d7fac9', canonicalId: '6ab202e9f34b7c7289d7fabd', reason: 'Saranda property duplicated into Ksamil: Paris Luxury Penthouse' },
  { id: '6ab20393f34b7c7289d7face', canonicalId: '6ab202eaf34b7c7289d7fabe', reason: 'Saranda property duplicated into Ksamil: Luxury Seaview Studios' },
  { id: '6ab20393f34b7c7289d7fac5', canonicalId: '6ab202eaf34b7c7289d7fac0', reason: 'Saranda property duplicated into Ksamil: Lago Calmo Villa' },
  { id: '6ab20392f34b7c7289d7fac2', canonicalId: '6ab202eaf34b7c7289d7fac1', reason: 'Saranda property duplicated into Ksamil: Luciano Rooms' }
];

async function deduplicate() {
  console.log(`Connecting to MongoDB...`);
  await mongoose.connect(MONGODB_URI);
  const Hotel = mongoose.model('Hotel', new mongoose.Schema({}, { strict: false }), 'hotels');

  const isDryRun = process.argv.includes('--dry-run');

  console.log(`\n========================================`);
  console.log(`DEDUPLICATION AUDIT: ${DUPLICATE_DOCS_TO_DELETE.length} confirmed duplicates`);
  console.log(`MODE: ${isDryRun ? 'DRY RUN (no documents deleted)' : 'LIVE EXECUTION'}`);
  console.log(`========================================\n`);

  const idsToDelete = DUPLICATE_DOCS_TO_DELETE.map(d => d.id);
  const docsToDelete = await Hotel.find({ _id: { $in: idsToDelete } }).lean();

  console.log(`Found ${docsToDelete.length} of ${idsToDelete.length} target documents in DB.`);

  for (const item of DUPLICATE_DOCS_TO_DELETE) {
    const doc = docsToDelete.find(d => d._id.toString() === item.id);
    const canonical = await Hotel.findById(item.canonicalId).lean();
    if (doc) {
      console.log(`\n❌ [DELETE] [${doc._id}] "${doc.name}" in ${doc.city}, ${doc.country}`);
      console.log(`   Slug: ${doc.slug}`);
      console.log(`   Reason: ${item.reason}`);
      console.log(`   ✅ [KEEP CANONICAL] [${canonical?._id}] "${canonical?.name}" in ${canonical?.city}, ${canonical?.country} (slug: ${canonical?.slug})`);
    } else {
      console.log(`⚠️ Document ${item.id} already removed or not found.`);
    }
  }

  // Also fix Agoda URL for Shahdara Aura Hotel
  const auraShahdara = await Hotel.findById('6a9ff363ebd8ede3e5718f46');
  if (auraShahdara) {
    console.log(`\n🔧 Fixing Agoda URL for The Aura Luxury Hotel, Shahdara...`);
    if (!isDryRun) {
      await Hotel.updateOne(
        { _id: auraShahdara._id },
        { $set: { agodaUrl: 'https://www.agoda.com/search?text=The%20Aura%20Luxury%20Hotel%20Shahdara%20Delhi' } }
      );
      console.log(`   Fixed Agoda URL.`);
    }
  }

  if (!isDryRun) {
    console.log(`\nDeleting ${idsToDelete.length} duplicate documents from MongoDB...`);
    const result = await Hotel.deleteMany({ _id: { $in: idsToDelete } });
    console.log(`✅ Successfully deleted ${result.deletedCount} duplicate documents.`);

    const remainingCount = await Hotel.countDocuments({ flagged: { $ne: true } });
    console.log(`📊 Clean Active Hotels remaining in MongoDB: ${remainingCount}`);
  }

  await mongoose.disconnect();
}

deduplicate().catch((err) => {
  console.error('Deduplication failed:', err);
  process.exit(1);
});
