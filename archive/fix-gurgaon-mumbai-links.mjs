import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const BlogSchema = new mongoose.Schema({ slug: String, content: String }, { timestamps: true });

const fixes = [
  // ── Gurgaon blog → /india/gurgaon ─────────────────────────────────────────
  {
    slug: 'hotel-with-bathtub-in-gurgaon',
    cityPath: '/india/gurgaon',
    append: `\n<hr>\n<p>Browse all verified <a href="/india/gurgaon"><strong>bathtub hotels in Gurgaon for couples</strong></a> — every property triple-checked across Booking.com, Agoda &amp; MakeMyTrip. Cyber City, Sohna Road &amp; Golf Course Road options confirmed with private in-room tubs from ₹4,500/night.</p>\n`,
  },

  // ── Mumbai staycations blog → /india/mumbai ────────────────────────────────
  {
    slug: 'mumbai-staycations-best-luxury-hotels-with-deep-soaking-tubs',
    cityPath: '/india/mumbai',
    append: `\n<hr>\n<p>Browse all verified <a href="/india/mumbai"><strong>hotels with bathtubs in Mumbai</strong></a> — every listing triple-checked across Booking.com, Agoda &amp; MakeMyTrip. From Juhu beach suites to Marine Drive luxury rooms, all confirmed with private in-room tubs.</p>\n`,
  },

  // ── Ultimate guide → inject Mumbai link ───────────────────────────────────
  {
    slug: 'ultimate-guide-hotels-with-bathtubs',
    cityPath: '/india/mumbai',
    append: `\n<p>For Mumbai specifically, browse verified <a href="/india/mumbai"><strong>hotels with bathtubs in Mumbai</strong></a> — Taj Mahal Palace, Four Seasons Worli &amp; boutique sea-view stays confirmed with private tubs.</p>\n`,
  },

  // ── Best jacuzzi couples India → inject Mumbai link ───────────────────────
  {
    slug: 'best-hotels-private-jacuzzi-couples-india',
    cityPath: '/india/mumbai',
    append: `\n<p>Mumbai couples guide: see verified <a href="/india/mumbai"><strong>hotels with private jacuzzis in Mumbai</strong></a> — Taj Lands End, ITC Grand Central &amp; Four Seasons Worli all offer confirmed jacuzzi suites.</p>\n`,
  },
];

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected');
  const Blog = mongoose.models.Blog || mongoose.model('Blog', BlogSchema);

  for (const { slug, cityPath, append } of fixes) {
    const doc = await Blog.findOne({ slug });
    if (!doc) { console.log(`⚠️  Not found: ${slug}`); continue; }
    if (doc.content.includes(cityPath)) {
      console.log(`⏭️  ${slug} already links to ${cityPath}`); continue;
    }
    await Blog.updateOne({ slug }, { $set: { content: doc.content + append } });
    console.log(`✅ ${slug} → linked to ${cityPath}`);
  }

  await mongoose.disconnect();
  console.log('✅ Done');
}

run().catch(e => { console.error(e); process.exit(1); });
