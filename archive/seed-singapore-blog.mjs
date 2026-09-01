// Seed Singapore blog post
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const BlogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  excerpt: { type: String },
  coverImage: { type: String },
  tags: [String],
  published: { type: Boolean, default: true },
  publishedAt: { type: Date },
}, { timestamps: true });

const post = {
  title: 'Bathtub Hotels in Singapore',
  slug: 'hotels-with-bathtubs-in-singapore',
  excerpt: 'From infinity-view soaking tubs at Marina Bay Sands to freestanding baths at Raffles — the definitive guide to Singapore hotels with private in-room bathtubs.',
  coverImage: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
  tags: ['Singapore', 'International', 'Luxury', 'Couples', 'Hot Tub'],
  published: true,
  publishedAt: new Date('2026-08-23'),
  content: `# Hotels with Bathtubs in Singapore: The 2026 Definitive Guide

Singapore punches far above its size when it comes to luxury hospitality. Packed into 733 km², the city-state hosts some of the world's most iconic hotels — and many of their finest suites come equipped with private in-room bathtubs that frame breathtaking views of Marina Bay, Sentosa, or the glittering city skyline.

Whether you're planning a honeymoon escape, a couple's anniversary trip, or simply want to soak in a deep tub 57 floors above the equator, this guide covers every verified property worth booking.

---

## Why Singapore for a Bathtub Hotel Stay?

- **Year-round warm weather** — no packing heavy coats, just robes
- **World-class service culture** — Singapore consistently ranks #1 in Asia for hotel service standards
- **Compact city** — Marina Bay, Orchard Road, and Sentosa are each under 20 minutes from each other
- **No monsoon surprises** — a private bathtub suite means rain days become spa days

---

## Top Hotels with Bathtubs in Singapore

### 1. Raffles Singapore ⭐⭐⭐⭐⭐
*City Hall · Booking.com score: 9.7*

The original grande dame of Singapore luxury, Raffles reopened after a meticulous three-year restoration in 2019. All 115 suites — no rooms, only suites — feature butler service and freestanding soaking bathtubs positioned beside windows that look onto the lush courtyard gardens.

**Best for:** Honeymooners and anniversary couples who want the most storied address in Singapore.

**Must-book room:** The Palm Court Suite, which includes a separate bathing room with a deep copper-toned freestanding tub.

---

### 2. Marina Bay Sands ⭐⭐⭐⭐⭐
*Marina Bay · Booking.com score: 9.6*

The most photographed hotel in Asia. Marina Bay Sands' Sands SkyPark Suite places a private soaking bathtub on the 57th floor, with unobstructed floor-to-ceiling views of the Singapore Strait and Marina Bay's light show. The infinity pool shared by all MBS guests is an icon — but your private tub is where the real magic happens.

**Best for:** First-time Singapore visitors who want the full wow factor.

**Must-book room:** Sands Premier Suite — bathtub faces the bay; sunrise from the water is unforgettable.

---

### 3. Capella Singapore ⭐⭐⭐⭐⭐
*Sentosa Island · Booking.com score: 9.5*

Hidden in the rainforest-covered hills of Sentosa Island, Capella's colonial-era mansion and contemporary villa wings each offer villas with private plunge pools and in-villa soaking bathtubs open to tropical garden terraces. It's the closest thing to a private jungle retreat with five-star service in Singapore.

**Best for:** Couples wanting total seclusion and privacy.

**Must-book room:** The Capella Villa — your bathtub opens directly onto a private garden. Leave the curtains open at dusk for the jungle soundtrack.

---

### 4. The Fullerton Bay Hotel Singapore ⭐⭐⭐⭐⭐
*Marina Bay · Booking.com score: 9.4*

A boutique jewel on the water's edge, The Fullerton Bay has 100 rooms and suites — each with panoramic Marina Bay views. Premier Bay View Suites feature freestanding bathtubs positioned inches from floor-to-ceiling windows so you can watch the nightly light show from the water.

**Best for:** Design-conscious couples who love intimate boutique properties over mega-resorts.

---

### 5. Four Seasons Hotel Singapore ⭐⭐⭐⭐⭐
*Orchard Road · Booking.com score: 9.3*

A perennial favourite for Singapore repeat visitors, the Four Seasons sits in the heart of Orchard Road's luxury belt. Premier suites feature deep soaking tubs with city garden views — the lush tree canopy over Orchard Boulevard visible from the bath is a rare urban softness.

**Best for:** Shoppers, spa lovers, and guests who prefer the energy of Orchard Road to Marina Bay.

---

### 6. The Ritz-Carlton Millenia Singapore ⭐⭐⭐⭐⭐
*Marina Bay · Booking.com score: 9.3*

The Ritz-Carlton Millenia is famous for its octagonal bathtubs — a design signature that places the bathtub beside a triangular window angled to frame either the Esplanade and Marina Bay or the surrounding city skyline. More than 4,000 artworks hang throughout the hotel.

**Best for:** Art lovers and those who want a private tub with the most distinctive architectural framing in Singapore.

---

### 7. W Singapore – Sentosa Cove ⭐⭐⭐⭐
*Sentosa Island · Booking.com score: 9.2*

Anchored in the Sentosa Cove marina, W Singapore's WOW Suites feature sunken soaking tubs and outdoor terraces facing the yachts and waterway. The energy here is livelier and younger than Capella — expect DJ sets at the WET pool and a late-night crowd at Woobar.

**Best for:** Couples who want to party by day and soak in luxury by night.

---

### 8. Fairmont Singapore ⭐⭐⭐⭐⭐
*City Hall · Booking.com score: 9.1*

Fairmont Singapore's Raffles City location gives you immediate access to one of Singapore's largest shopping centres. Fairmont Suites feature marble-clad soaking bathtubs and oversized walk-in wardrobes — a practical luxe option for longer stays.

**Best for:** Business-leisure travellers who want the tub without Sentosa's resort isolation.

---

## Booking Tips for Singapore Bathtub Hotels

**1. Filter by room type, not just hotel.** Most Singapore hotels offer bathtubs only in suite-tier rooms. When booking, select categories like "Suite with Bathtub", "Premier Suite", or "Club Room" and read the amenity list for "bathtub" before confirming.

**2. Book direct or via Booking.com for bathtub confirmation.** Third-party OTAs like Booking.com now show amenity filters — select "Hot Tub" under facilities when searching to surface properties that guarantee the feature.

**3. Ask for high floors.** In Marina Bay hotels, even a one-floor difference changes whether you see the Esplanade or the rooftop of an adjacent building. Always note your preference in the booking.

**4. Sentosa vs Marina Bay vs Orchard.** Sentosa is 20 minutes from city centre by taxi or Sentosa Express — great for resort immersion, less convenient for city sightseeing. Marina Bay is central. Orchard is the most walkable to restaurants and shops.

---

## Singapore Bathtub Hotels: At a Glance

| Hotel | Area | Bathtub Type | Score |
|-------|------|--------------|-------|
| Raffles Singapore | City Hall | Freestanding | 9.7 |
| Marina Bay Sands | Marina Bay | Soaking tub, bay view | 9.6 |
| Capella Singapore | Sentosa | In-villa soaking tub | 9.5 |
| The Fullerton Bay | Marina Bay | Freestanding bay view | 9.4 |
| Four Seasons | Orchard | Deep soaking tub | 9.3 |
| The Ritz-Carlton Millenia | Marina Bay | Octagonal tub, triangular window | 9.3 |
| W Singapore Sentosa Cove | Sentosa | Sunken soaking tub | 9.2 |
| Fairmont Singapore | City Hall | Marble soaking tub | 9.1 |

---

## Final Word

Singapore's bathtub hotel game is genuinely world-class. Whether you want a Victorian freestanding tub at Raffles, a bay-view soak at Fullerton, or an octagonal tub with art at the Ritz-Carlton Millenia, you're choosing between options that would headline any global luxury list.

Browse all verified Singapore bathtub hotels at [Hotels with Bathtubs – Singapore](/singapore/singapore) — each listing is cross-verified across Booking.com, MakeMyTrip, and Agoda to confirm the bathtub amenity is real and in your room category.

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
    console.log('✅ Updated existing Singapore blog post');
  } else {
    await Blog.create(post);
    console.log('✅ Created Singapore blog post');
  }
  await mongoose.disconnect();
}

seed().catch(err => { console.error('❌', err); process.exit(1); });
