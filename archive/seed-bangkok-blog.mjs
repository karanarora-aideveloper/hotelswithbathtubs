// Seed Bangkok blog post
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const BlogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  excerpt: { type: String },
  coverImage: { type: String },
  date: { type: String },
  tags: [String],
  published: { type: Boolean, default: true },
  publishedAt: { type: Date },
}, { timestamps: true });

const post = {
  title: 'Hotels with Bathtubs in Bangkok: The 2026 Definitive Guide',
  slug: 'hotels-with-bathtubs-in-bangkok',
  date: 'August 2026',
  excerpt: 'From rooftop soaking tubs overlooking the Chao Phraya to legendary riverside suites at Mandarin Oriental — the definitive guide to Bangkok hotels with private in-room bathtubs.',
  coverImage: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
  tags: ['Bangkok', 'Thailand', 'International', 'Luxury', 'Couples', 'Honeymoon'],
  published: true,
  publishedAt: new Date('2026-08-24'),
  content: `# Hotels with Bathtubs in Bangkok: The 2026 Definitive Guide

Bangkok is one of the world's great hotel cities. From the legendary riverside palaces that have hosted heads of state for over a century to striking new sky-high towers above the Chao Phraya, the Thai capital delivers a calibre of luxury hospitality — and bathtub suite — that rivals anywhere on earth.

Whether you're planning a honeymoon, an anniversary escape, or simply want to soak in a deep freestanding tub with a river winking below you at golden hour, this guide covers every verified Bangkok property worth booking.

---

## Why Bangkok for a Bathtub Hotel Stay?

- **Year-round warmth** — tropical weather means robes and soaking tubs, not heavy coats
- **River and skyline views** — the Chao Phraya River is Bangkok's greatest natural asset; riverside tub rooms frame a picture unlike any other city
- **Legendary hotel history** — Bangkok's grand dames like Mandarin Oriental and The Peninsula have been refining bathtub luxury since the 19th century
- **Outstanding value** — five-star suites with private bathtubs often cost 30–50% less than equivalent rooms in Hong Kong, Singapore, or Tokyo

---

## Top Hotels with Bathtubs in Bangkok

### 1. Capella Bangkok ⭐⭐⭐⭐⭐
*Charoenkrung · Booking.com score: 9.8*

Opened in 2021, Capella Bangkok instantly claimed the title of best new hotel in Southeast Asia. All 101 suites and villas face the Chao Phraya River, and every one includes a deep soaking tub positioned to frame the water. The Riverview Suite places a freestanding tub beside a floor-to-ceiling river panorama — a genuinely singular experience.

**Best for:** Couples seeking the most design-forward bathtub suite experience in Bangkok.

**Must-book room:** The Riverview Suite — your freestanding tub faces the river, and at dusk the water turns gold below you.

---

### 2. Mandarin Oriental Bangkok ⭐⭐⭐⭐⭐
*Charoenkrung · Booking.com score: 9.7*

The oldest hotel in Thailand, open since 1879, and arguably the most storied hotel address in all of Asia. The Oriental Wing suites feature deep marble soaking tubs with riverside views — a living piece of Bangkok history. Past guests include Joseph Conrad, Somerset Maugham, and Noël Coward. The service remains peerless.

**Best for:** Travellers who want to stay somewhere with a genuine sense of history — a bathtub suite as pilgrimage.

**Must-book room:** The Authors Suite — named after one of MO's literary guests, it features a marble bathroom with a deep soaking tub and private terrace facing the river.

---

### 3. The Peninsula Bangkok ⭐⭐⭐⭐⭐
*Charoen Nakhon · Booking.com score: 9.6*

The Peninsula's Bangkok outpost sits on the west bank of the Chao Phraya, directly opposite the Grand Palace. River Suites feature marble bathrooms with separate deep soaking tubs angled toward the river — at night, the illuminated temples across the water create one of Bangkok's most photographed bathtub backdrops.

**Best for:** Classic luxury travellers who want impeccable Peninsula service and the best Grand Palace view from a bathtub.

**Must-book room:** Deluxe River Suite — the tub sits beside a wall of glass facing the Chao Phraya and the glittering Grand Palace.

---

### 4. Rosewood Bangkok ⭐⭐⭐⭐⭐
*Ploenchit · Booking.com score: 9.5*

A sky-high statement of contemporary Thai design, Rosewood Bangkok opened in 2019 in a striking 30-storey tower above Ploenchit. Estate Suites on upper floors feature freestanding soaking tubs behind floor-to-ceiling windows with a panoramic Bangkok city-and-sky canvas. The hotel's rooftop bar, Lennon's, is among the city's best.

**Best for:** City-view enthusiasts and those who prefer Sukhumvit/Ploenchit's walkability over the riverside.

**Must-book room:** Rosewood Suite — the freestanding tub is positioned directly against the window; the Bangkok skyline at night is extraordinary.

---

### 5. Four Seasons Hotel Bangkok at Chao Phraya ⭐⭐⭐⭐⭐
*Charoenkrung · Booking.com score: 9.5*

Opened in 2020, the Four Seasons Bangkok is a 73-storey dual-tower complex with a direct Chao Phraya river frontage. River Suites feature deep soaking tubs positioned facing the water, and the hotel's three pools — including an 80-metre outdoor lap pool beside the river — make it one of Bangkok's most complete luxury resort experiences.

**Best for:** Families or couples who want full resort facilities combined with a genuine river-view bathtub suite.

**Must-book room:** Four Seasons Suite — the master bathroom has a freestanding tub beside a corner window framing both the river and the city skyline.

---

### 6. 137 Pillars Suites & Residences Bangkok ⭐⭐⭐⭐⭐
*Sukhumvit · Booking.com score: 9.4*

A contemporary boutique tower in the heart of Sukhumvit, 137 Pillars' Penthouse Suites offer some of Bangkok's most dramatic bathtub moments: a rooftop terrace with a private outdoor soaking tub, a plunge pool, and 360-degree skyline views. Intimate, design-forward, and thoroughly instagrammable.

**Best for:** Design-conscious couples and honeymooners who want something boutique over a mega-hotel.

**Must-book room:** The Penthouse Suite — private rooftop terrace, outdoor soaking tub, and nothing but Bangkok sky above you.

---

### 7. The Athenee Hotel Bangkok ⭐⭐⭐⭐⭐
*Ploenchit · Booking.com score: 9.3*

A long-standing grande dame on Wireless Road, The Athenee's Heritage Suites are Bangkok's best-kept secret for classic bathtub luxury. Deep marble soaking tubs in bathrooms the size of small apartments, with butler service and direct access to the Ploenchit BTS sky-train station next door.

**Best for:** Repeat Bangkok visitors and business-leisure travellers who want easy city access with genuine suite luxury.

**Must-book room:** Heritage Suite — the bathroom is genuinely enormous; a double soaking tub and separate rain shower.

---

### 8. Anantara Riverside Bangkok Resort ⭐⭐⭐⭐⭐
*Riverside · Booking.com score: 9.2*

Spread across a 11-acre riverside garden, Anantara Riverside feels like a tropical resort dropped into the heart of Bangkok. Deluxe River Suites feature outdoor terraces with private soaking tubs positioned above the riverbank — listening to the river traffic from the tub at dusk is one of Bangkok's quieter pleasures.

**Best for:** Couples who want a resort immersion within Bangkok — garden walks, cooking classes, and a private riverside tub.

**Must-book room:** Deluxe River Suite — outdoor private terrace, soaking tub, and unobstructed Chao Phraya river views.

---

## Booking Tips for Bangkok Bathtub Hotels

**1. Riverside vs Sukhumvit.** Riverside hotels (Capella, Mandarin Oriental, Four Seasons) offer the best bathtub views but are 20–30 minutes from BTS Skytrain by taxi during peak hours. Sukhumvit/Ploenchit hotels (Rosewood, 137 Pillars, Athenee) put you steps from the sky-train, restaurants, and nightlife.

**2. Check "Suite" specifically.** Most Bangkok hotels only include bathtubs in suite-tier rooms. Always confirm the amenity list shows "bathtub" — not just "shower" or "rain shower" — before booking.

**3. Book during shoulder season.** March–May is hot but often discounted; September–October is rainy but room rates drop 25–40% even at five-star properties. A private bathtub makes a rain day excellent.

**4. Ask about river-view upgrades.** At Mandarin Oriental and The Peninsula, request a river-view room explicitly — the difference between a garden-view and a river-view room is significant, and some properties will upgrade for a modest premium if you ask at check-in.

---

## Bangkok Bathtub Hotels: At a Glance

| Hotel | Area | Bathtub Type | Score |
|-------|------|--------------|-------|
| Capella Bangkok | Charoenkrung | Freestanding, river view | 9.8 |
| Mandarin Oriental Bangkok | Charoenkrung | Marble soaking tub, riverside | 9.7 |
| The Peninsula Bangkok | Charoen Nakhon | Deep soaking tub, Grand Palace view | 9.6 |
| Rosewood Bangkok | Ploenchit | Freestanding, skyline panorama | 9.5 |
| Four Seasons at Chao Phraya | Charoenkrung | Freestanding, river + city view | 9.5 |
| 137 Pillars Suites | Sukhumvit | Rooftop outdoor soaking tub | 9.4 |
| The Athenee Hotel | Ploenchit | Double marble soaking tub | 9.3 |
| Anantara Riverside | Riverside | Outdoor private terrace tub | 9.2 |

---

## Final Word

Bangkok's bathtub hotel scene is among the best in Asia — arguably second only to Hong Kong for sheer variety. Whether you want the most storied address in Southeast Asia (Mandarin Oriental), a sleek contemporary river suite (Capella), or a rooftop outdoor tub with the Bangkok skyline as your backdrop (Rosewood, 137 Pillars), the city delivers.

Browse all verified Bangkok bathtub hotels at [Hotels with Bathtubs – Bangkok](/thailand/bangkok) — each listing is cross-verified across Booking.com, MakeMyTrip, and Agoda to confirm the bathtub amenity is real and in your room category.

*Last updated: August 2026. Booking.com scores reflect guest ratings at time of publication.*
`,
};

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI not found');
  await mongoose.connect(uri);
  console.log('✅ Connected to MongoDB');

  const Blog = mongoose.models.Blog || mongoose.model('Blog', BlogSchema);

  const existing = await Blog.findOne({ slug: post.slug });
  if (existing) {
    await Blog.updateOne({ slug: post.slug }, { $set: post });
    console.log('✅ Updated existing Bangkok blog post');
  } else {
    await Blog.create(post);
    console.log('✅ Created Bangkok blog post');
  }
  await mongoose.disconnect();
}

seed().catch(err => { console.error('❌', err); process.exit(1); });
