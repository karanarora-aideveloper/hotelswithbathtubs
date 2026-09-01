// Fix meta descriptions for zero-click GSC pages
// These pages are on page 1–2 (pos 9–15) but getting 0 clicks
// Strategy: specific hotel count + year + keyword variant + benefit hook
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const BlogSchema = new mongoose.Schema({
  title: { type: String },
  slug: { type: String, required: true, unique: true },
  excerpt: { type: String },
  content: { type: String },
  date: { type: String },
  published: { type: Boolean, default: true },
}, { timestamps: true });

const updates = [
  {
    slug: 'hotel-with-bathtub-in-lucknow',
    // GSC: pos 10.6, 45 impr, 0 clicks — query: "hotel in lucknow with bathtub"
    excerpt: '7 Lucknow hotels with private in-room bathtubs — triple-verified across Booking.com, Agoda & MakeMyTrip. Couple suites from ₹3,500/night. Soaking tubs, jacuzzis & more. Updated August 2026.',
  },
  {
    slug: 'accessible-hotels-bathtubs-mobility',
    // GSC: pos 13.4, 43 impr, 0 clicks — query: "accessible bathtub hotel"
    excerpt: '12 hotels with accessible bathtubs & walk-in tubs across India — verified for guests with mobility needs. Roll-in showers, grab bars & ADA-friendly rooms. Updated 2026.',
  },
  {
    slug: 'hotel-with-bathtub-in-gurgaon',
    // GSC: pos 11.8, 40 impr, 0 clicks — query: "hotel with bathtub in gurgaon"
    excerpt: '9 Gurgaon hotels with private in-room bathtubs — verified 2026. Couple suites with jacuzzi in Cyber City, Sohna Road & Udyog Vihar. All cross-checked on MakeMyTrip & Agoda.',
  },
  {
    slug: 'delhi-weekend-getaways-exploring-the-best-in-room-bathtubs',
    // GSC: pos 17.7, 41 impr, 0 clicks — query: "delhi weekend getaways bathtubs"
    excerpt: '6 weekend escapes from Delhi with guaranteed in-room bathtubs — Rishikesh river retreats, Jaipur heritage suites & Manali mountain lodges. All verified. Plan your next romantic break.',
  },
  {
    slug: 'hotel-with-bathtub-in-jaipur',
    // GSC: pos 10.2, 31 impr, 0 clicks — query: "bathtub hotel in jaipur for couples"
    excerpt: '11 Jaipur hotels with private bathtubs for couples — 2026 verified guide. Heritage havelis, palace suites & boutique stays with soaking tubs. From ₹4,000/night. Book your Rajasthan escape.',
  },
  {
    slug: 'hotel-with-bathtub-in-rishikesh',
    // GSC: pos 11.0, 30 impr, 0 clicks — query: "hotel in rishikesh with bathtub"
    excerpt: '8 Rishikesh hotels with private in-room bathtubs — riverside retreats with Ganges views & mountain backdrop. Verified on Booking.com & Agoda. Not shared spa tubs — private, in your room.',
  },
];

async function fix() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI not found');
  await mongoose.connect(uri);
  console.log('✅ Connected to MongoDB');

  const Blog = mongoose.models.Blog || mongoose.model('Blog', BlogSchema);

  for (const { slug, excerpt } of updates) {
    const existing = await Blog.findOne({ slug });
    if (!existing) {
      console.log(`⚠️  Not found: ${slug}`);
      continue;
    }
    const old = existing.excerpt?.slice(0, 60) || '(empty)';
    await Blog.updateOne({ slug }, { $set: { excerpt } });
    console.log(`✅ Updated ${slug}`);
    console.log(`   Old: ${old}…`);
    console.log(`   New: ${excerpt.slice(0, 60)}…`);
    console.log(`   Length: ${excerpt.length} chars`);
  }

  await mongoose.disconnect();
  console.log('\n✅ All done');
}

fix().catch(err => { console.error('❌', err); process.exit(1); });
