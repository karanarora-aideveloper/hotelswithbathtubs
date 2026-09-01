// Inject internal link from Delhi blog → /india/delhi city page
// Also inject from Manali blog → /india/manali (same blog-vs-city-page split)
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const BlogSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  content: { type: String },
}, { timestamps: true });

const fixes = [
  {
    slug: 'delhi-weekend-getaways-exploring-the-best-in-room-bathtubs',
    cityPath: '/india/delhi',
    cityLabel: 'hotels with bathtubs in Delhi',
    appendHtml: `
<hr>
<p>Ready to book? Browse all verified <a href="/india/delhi"><strong>hotels with bathtubs in Delhi</strong></a> — every property triple-checked across Booking.com, Agoda &amp; MakeMyTrip to confirm the bathtub is in your room, not a shared spa. Covers central Delhi, Aerocity, Connaught Place &amp; Gurugram.</p>
`,
  },
  {
    slug: 'manali-hotels-with-bathtub',
    cityPath: '/india/manali',
    cityLabel: 'hotels with bathtubs in Manali',
    appendHtml: `
<hr>
<p>Browse all verified <a href="/india/manali"><strong>hotels with bathtubs in Manali</strong></a> — every listing triple-checked across Booking.com, Agoda &amp; MakeMyTrip. Mountain-view soaking tubs, private jacuzzis &amp; honeymoon suites, all confirmed.</p>
`,
  },
  {
    slug: 'hotel-with-bathtub-in-kolkata',
    cityPath: '/india/kolkata',
    cityLabel: 'hotels with bathtubs in Kolkata',
    appendHtml: `
<hr>
<p>Browse the full verified list of <a href="/india/kolkata"><strong>hotels with bathtubs in Kolkata</strong></a> — every property triple-checked across Booking.com, Agoda &amp; MakeMyTrip. ITC Sonar, The Park, JW Marriott &amp; more, all confirmed with in-room tubs.</p>
`,
  },
  {
    slug: 'hotel-with-bathtub-in-lucknow',
    cityPath: '/india/lucknow',
    cityLabel: 'hotels with bathtubs in Lucknow',
    appendHtml: `
<hr>
<p>Browse all verified <a href="/india/lucknow"><strong>hotels with bathtubs in Lucknow</strong></a> — triple-checked across Booking.com, Agoda &amp; MakeMyTrip. Private soaking tubs for couples from ₹3,500/night.</p>
`,
  },
];

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected');
  const Blog = mongoose.models.Blog || mongoose.model('Blog', BlogSchema);

  for (const { slug, cityPath, appendHtml } of fixes) {
    const doc = await Blog.findOne({ slug });
    if (!doc) { console.log(`⚠️  Not found: ${slug}`); continue; }
    if (doc.content.includes(cityPath)) {
      console.log(`⏭️  ${slug} already links to ${cityPath}`);
      continue;
    }
    await Blog.updateOne({ slug }, { $set: { content: doc.content + appendHtml } });
    console.log(`✅ ${slug} → appended link to ${cityPath}`);
  }

  await mongoose.disconnect();
  console.log('✅ Done');
}

run().catch(e => { console.error(e); process.exit(1); });
