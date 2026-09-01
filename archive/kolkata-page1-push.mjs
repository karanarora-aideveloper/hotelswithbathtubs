// Kolkata page-1 push
// 1. Fix excerpt for kolkata-hotels-with-bathtub-couples-guide
// 2. Fix excerpt for hotel-with-bathtub-in-kolkata (existing one is vague)
// 3. Inject Kolkata section into 3 India-wide posts (adds internal links to /india/kolkata)
// 4. Seed a new blog post targeting "kolkata hotel with jacuzzi" / anniversary angle
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
  publishedAt: { type: Date },
  tags: [String],
  coverImage: { type: String },
}, { timestamps: true });

// ── 1. Excerpt fixes ────────────────────────────────────────────────────────
const excerptFixes = [
  {
    slug: 'kolkata-hotels-with-bathtub-couples-guide',
    // GSC: NOT YET APPEARING — needs to be found by Google. Strong meta helps.
    excerpt: '10 romantic Kolkata hotels with private bathtubs for couples — 2026 verified. Heritage suites at ITC Sonar, rooftop tubs at JW Marriott & budget couple rooms from ₹3,000/night.',
  },
  {
    slug: 'hotel-with-bathtub-in-kolkata',
    // GSC: pos 12.5, 67 impr, 2 clicks — the old excerpt is too generic
    excerpt: '12 Kolkata hotels with in-room bathtubs — triple-verified 2026. ITC Sonar, Park Kolkata, Westin Rajarhat & boutique options from ₹2,800/night. Soaking tubs & jacuzzi suites for couples.',
  },
];

// ── 2. Kolkata section to inject into India-wide posts ──────────────────────
// Appended before the final word / conclusion section in each post.
const kolkataSection = `

---

## Hotels with Bathtubs in Kolkata

Kolkata is an underrated bathtub hotel destination — 40+ verified properties across the city, from ITC Sonar's iconic riverside suites with freestanding soaking tubs to boutique heritage hotels in the old quarter. The city's grand hotels punch well above their price point relative to Mumbai or Delhi.

Top picks: ITC Royal Bengal, The Park Kolkata, JW Marriott Kolkata, and Westin Rajarhat all offer verified in-room bathtubs across multiple room categories.

Browse all verified [hotels with bathtubs in Kolkata](/india/kolkata) — each triple-checked on Booking.com, Agoda & MakeMyTrip.

`;

const injectTargets = [
  { slug: 'ultimate-guide-hotels-with-bathtubs', before: '## Final' },
  { slug: 'best-hotels-private-jacuzzi-couples-india', before: '## Final' },
  { slug: 'best-honeymoon-places-in-india-with-private-jacuzzis', before: '## Final' },
];

// ── 3. New blog post ────────────────────────────────────────────────────────
const newPost = {
  title: 'Kolkata Jacuzzi Hotels: Top Picks for a Romantic Staycation',
  slug: 'kolkata-jacuzzi-hotels-romantic-staycation',
  date: 'August 2026',
  excerpt: '8 Kolkata hotels with private jacuzzis & soaking tubs — perfect for anniversary, honeymoon & romantic staycations. Verified 2026. ITC Sonar, Park Kolkata & more from ₹3,500/night.',
  tags: ['Kolkata', 'India', 'Couples', 'Jacuzzi', 'Romantic', 'Staycation'],
  published: true,
  publishedAt: new Date('2026-08-24'),
  coverImage: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
  content: `# Kolkata Jacuzzi Hotels: Top Picks for a Romantic Staycation

Kolkata is India's most underrated luxury hotel destination. The City of Joy has 40+ hotels with verified in-room bathtubs and jacuzzis — many at price points 30–40% below equivalent properties in Mumbai or Delhi. Whether you're planning an anniversary surprise, a honeymoon stopover, or simply a weekend staycation from city stress, Kolkata's hotel scene delivers.

This guide covers the top 8 picks with confirmed private jacuzzis or soaking tubs, along with booking tips specific to Kolkata's hotel geography.

---

## Why Kolkata for a Jacuzzi Hotel Staycation?

- **Exceptional value** — five-star suite with private jacuzzi from ₹6,000/night vs ₹10,000+ in Delhi or Mumbai
- **Heritage ambience** — Kolkata's grand hotels are housed in genuine 19th–20th century buildings with character no new-build can replicate
- **Less crowded than you'd expect** — the city's luxury hotels are quieter than their Delhi counterparts, which means more attentive service and often complimentary upgrades at check-in
- **Weekend getaway from the city itself** — if you live in Kolkata, a staycation at ITC Sonar or the Park is genuinely transportive

---

## Top Kolkata Jacuzzi & Bathtub Hotels

### 1. ITC Sonar — A Luxury Collection Hotel ⭐⭐⭐⭐⭐
*New Town · Booking.com score: 9.5*

Set across a landscaped lake campus in New Town, ITC Sonar is Kolkata's most design-forward luxury hotel. Royal Suite bathrooms feature freestanding soaking tubs beside floor-to-ceiling windows overlooking the water — a genuinely cinematic bathtub experience. The property's award-winning spa and multiple dining restaurants make it ideal for a full-immersion staycation.

**Best for:** Anniversary celebrations and honeymooners who want the city's most complete luxury property.

**Must-book room:** The Luxury Suite — deep soaking tub, lake view, and direct access to the ITC spa.

---

### 2. The Park Kolkata ⭐⭐⭐⭐⭐
*Park Street · Booking.com score: 9.3*

The Park on Park Street occupies the most storied address in Kolkata's social geography. Its Luxury Suites feature deep soaking bathtubs and interiors that feel more Mayfair boutique than generic five-star. Being steps from Park Street's restaurants and Flurys means you're in the cultural heart of the city.

**Best for:** Design-conscious couples who want Park Street energy plus private-tub luxury.

**Must-book room:** Luxury Suite — the bathtub is the centrepiece of a bathroom twice the size of most Kolkata hotel rooms.

---

### 3. JW Marriott Hotel Kolkata ⭐⭐⭐⭐⭐
*EM Bypass · Booking.com score: 9.2*

The JW Marriott on EM Bypass is Kolkata's most complete convention-and-leisure property. Executive Suites feature separate soaking tubs and rain showers in marble-clad bathrooms. The hotel's infinity pool, spa, and six dining options make it an easy choice for a weekend that doesn't require leaving the building.

**Best for:** Couples who want resort-style full facilities alongside private-tub luxury.

**Must-book room:** Executive Suite — oversized bathroom with a soaking tub, separate rain shower, and a sitting room overlooking the EM Bypass flyover at night.

---

### 4. The Westin Kolkata Rajarhat ⭐⭐⭐⭐⭐
*Rajarhat · Booking.com score: 9.1*

The Westin Kolkata's Heavenly Suites live up to their name — oversized bathrooms with deep soaking tubs and Westin's signature Heavenly Bath amenities. Located in Rajarhat's business district, it's slightly removed from the city but offers exceptional value: suite-tier rooms at 20–30% below comparable properties in other cities.

**Best for:** Business-leisure travellers and couples who prioritise bathroom quality over city-centre location.

---

### 5. ITC Royal Bengal ⭐⭐⭐⭐⭐
*Kolkata CBD · Booking.com score: 9.4*

ITC's second Kolkata property, Royal Bengal opened to critical acclaim and immediately became the city's most in-demand luxury address. Grand Suites feature private terraces and bathroom setups with freestanding soaking tubs positioned to maximise light from oversized windows.

**Best for:** Couples who want ITC's legendary service culture at the brand's newest property.

---

### 6. Vivanta Kolkata, EM Bypass ⭐⭐⭐⭐
*EM Bypass · Booking.com score: 9.0*

Taj's Vivanta brand hits a sweet spot in Kolkata — luxury-adjacent quality at genuinely approachable prices. The Vivanta Suites include soaking tubs and are often available at 35–40% below Kolkata's five-star properties. For couples who want a private tub without the five-star price tag, this is the pick.

**Best for:** Couples on a moderate budget who want a private bathtub without compromise on cleanliness or service.

---

### 7. The Lalit Great Eastern Kolkata ⭐⭐⭐⭐⭐
*BBD Bagh · Booking.com score: 8.9*

The Great Eastern is one of Asia's oldest hotels, open since 1840. The Lalit's restoration preserved the Victorian grandeur — Heritage Suites feature clawfoot-style soaking tubs in heritage bathrooms that no amount of money could replicate in a new-build. Staying here is a piece of Kolkata history.

**Best for:** History enthusiasts and couples who want the most characterful bathtub experience in the city.

---

### 8. Taj City Centre New Town, Kolkata ⭐⭐⭐⭐⭐
*New Town · Booking.com score: 9.2*

The newest Taj property in Kolkata, City Centre New Town offers contemporary Taj luxury in a purpose-built hotel adjacent to the New Town commercial hub. Taj Club Rooms on upper floors include bathtubs and access to the Taj Club Lounge — the city's best value upgrade for couples.

**Best for:** First-time Kolkata visitors who want the Taj name and service without the heritage property prices.

---

## Booking Tips for Kolkata Jacuzzi Hotels

**1. Specify "bathtub" at booking, not just "suite."** Several Kolkata hotels offer suites without bathtubs in some categories — always confirm the amenity list shows a tub before booking.

**2. Rajarhat vs city centre.** New Town and Rajarhat hotels (ITC Sonar, JW Marriott, Westin) are 20–25 minutes from central Kolkata by cab during off-peak hours, but significantly longer during rush hour. Park Street hotels (The Park) are walkable to restaurants and museums.

**3. Book directly for upgrades.** Kolkata's five-star hotels frequently upgrade guests who book direct — especially ITC properties. Mention your occasion at the time of booking.

**4. Best value months.** March–June and September–November are shoulder season in Kolkata — hotel rates drop 20–30%, even at ITC Sonar and Taj properties.

---

## Kolkata Jacuzzi Hotels: At a Glance

| Hotel | Area | Bathtub Type | Score | Est. Rate |
|-------|------|--------------|-------|-----------|
| ITC Sonar | New Town | Freestanding, lake view | 9.5 | ₹7,500+ |
| ITC Royal Bengal | CBD | Freestanding, terrace | 9.4 | ₹8,000+ |
| The Park Kolkata | Park Street | Deep soaking tub | 9.3 | ₹6,000+ |
| Taj City Centre New Town | New Town | Soaking tub, Club floor | 9.2 | ₹7,000+ |
| JW Marriott Kolkata | EM Bypass | Marble soaking tub | 9.2 | ₹6,500+ |
| Vivanta Kolkata | EM Bypass | Soaking tub | 9.0 | ₹4,000+ |
| The Westin Rajarhat | Rajarhat | Deep soaking tub | 9.1 | ₹5,500+ |
| The Lalit Great Eastern | BBD Bagh | Heritage clawfoot style | 8.9 | ₹5,000+ |

---

## Final Word

Kolkata is quietly one of India's best bathtub hotel cities — 40+ verified properties, exceptional service culture, and prices that make Mumbai or Delhi feel extravagant by comparison. Whether you want ITC Sonar's cinematic lake-view tub, the Great Eastern's Victorian clawfoot heritage, or a value pick at Vivanta, the city delivers.

Browse all verified [hotels with bathtubs in Kolkata](/india/kolkata) — each property is triple-checked across Booking.com, MakeMyTrip, and Agoda to confirm the bathtub is real and in your room category.

For a broader romantic India guide, see [best hotels with private jacuzzis for couples across India](/blog/best-hotels-private-jacuzzi-couples-india).

*Last updated: August 2026. Booking.com scores reflect guest ratings at time of publication.*
`,
};

// ── Runner ──────────────────────────────────────────────────────────────────
async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI not found');
  await mongoose.connect(uri);
  console.log('✅ Connected to MongoDB');

  const Blog = mongoose.models.Blog || mongoose.model('Blog', BlogSchema);

  // 1. Fix excerpts
  console.log('\n── Fixing excerpts ──');
  for (const { slug, excerpt } of excerptFixes) {
    const doc = await Blog.findOne({ slug });
    if (!doc) { console.log(`⚠️  Not found: ${slug}`); continue; }
    await Blog.updateOne({ slug }, { $set: { excerpt } });
    console.log(`✅ ${slug} → new excerpt (${excerpt.length} chars)`);
  }

  // 2. Inject Kolkata section into India-wide posts
  console.log('\n── Injecting internal links ──');
  for (const { slug, before } of injectTargets) {
    const doc = await Blog.findOne({ slug });
    if (!doc) { console.log(`⚠️  Not found: ${slug}`); continue; }
    if (doc.content.includes('/india/kolkata')) {
      console.log(`⏭️  ${slug} already links to /india/kolkata`);
      continue;
    }
    // Find insertion point
    const idx = doc.content.indexOf(before);
    let newContent;
    if (idx !== -1) {
      newContent = doc.content.slice(0, idx) + kolkataSection + doc.content.slice(idx);
    } else {
      // Append at end
      newContent = doc.content + kolkataSection;
    }
    await Blog.updateOne({ slug }, { $set: { content: newContent } });
    console.log(`✅ ${slug} → Kolkata section injected`);
  }

  // 3. Seed new blog post
  console.log('\n── Seeding new blog post ──');
  const existing = await Blog.findOne({ slug: newPost.slug });
  if (existing) {
    await Blog.updateOne({ slug: newPost.slug }, { $set: newPost });
    console.log(`✅ Updated: ${newPost.slug}`);
  } else {
    await Blog.create(newPost);
    console.log(`✅ Created: ${newPost.slug}`);
  }

  await mongoose.disconnect();
  console.log('\n✅ Kolkata push complete');
}

run().catch(err => { console.error('❌', err); process.exit(1); });
