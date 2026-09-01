// Fix 6 blog posts whose titles duplicate the city page titles
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const BlogSchema = new mongoose.Schema({
  title: String,
  slug: { type: String, unique: true },
  content: String,
  excerpt: String,
  image: String,
  date: String,
  published: Boolean,
  author: String,
}, { timestamps: true });

const fixes = [
  { slug: 'hotel-with-bathtub-in-gurgaon',  title: 'Best Bathtub Hotels in Gurgaon 2026' },
  { slug: 'hotel-with-bathtub-in-jaipur',   title: 'Best Bathtub Hotels in Jaipur 2026' },
  { slug: 'hotel-with-bathtub-in-kolkata',  title: 'Best Bathtub Hotels in Kolkata 2026' },
  { slug: 'hotel-with-bathtub-in-lucknow',  title: 'Best Bathtub Hotels in Lucknow 2026' },
  { slug: 'hotel-with-bathtub-in-rishikesh',title: 'Best Bathtub Hotels in Rishikesh 2026' },
  { slug: 'manali-hotels-with-bathtub',     title: 'Best Bathtub Hotels in Manali 2026' },
];

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected');
  const Blog = mongoose.models.Blog || mongoose.model('Blog', BlogSchema);
  // Show current titles first
  for (const { slug } of fixes) {
    const doc = await Blog.findOne({ slug }).select('title slug');
    console.log(doc ? `  Found: "${doc.title}" [${slug}]` : `  ❌ Not found: ${slug}`);
  }
  console.log('\nApplying fixes...');
  for (const { slug, title } of fixes) {
    const r = await Blog.updateOne({ slug }, { $set: { title } });
    console.log(`${r.modifiedCount ? '✅' : '⚠️ not found'} ${slug} → "${title}"`);
  }
  await mongoose.disconnect();
}
run().catch(e => { console.error(e); process.exit(1); });
