import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const BlogSchema = new mongoose.Schema({
  title: String,
  slug: { type: String, required: true, unique: true },
  excerpt: String,
  content: String,
  date: String,
  published: { type: Boolean, default: true },
  publishedAt: Date,
  tags: [String],
  coverImage: String,
}, { timestamps: true });

const post = {
  title: 'Hotels with Bathtub in Delhi: 10 Verified Stays for Couples (2026)',
  slug: 'hotel-with-bathtub-in-delhi',
  date: 'August 2026',
  excerpt: '10 Delhi hotels with private in-room bathtubs for couples — triple-verified 2026. The Leela Palace, Oberoi, ITC Maurya & more from ₹6,000/night. Confirmed soaking tubs, not shared spas.',
  tags: ['Delhi', 'India', 'Couples', 'Luxury', 'Bathtub'],
  published: true,
  publishedAt: new Date('2026-08-25'),
  coverImage: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
  content: `# Hotels with Bathtub in Delhi: 10 Verified Stays for Couples (2026)

Delhi is one of India's best cities for in-room bathtub hotels — and one of the most confusing to book. Many five-star properties list "bathtub" in their amenity list but only offer it in specific room categories. Book the wrong tier and you get a standing shower.

This guide covers 10 Delhi hotels with private in-room bathtubs that are verified across Booking.com, Agoda, and MakeMyTrip — so you know exactly which room type to select.

---

## What to Know Before Booking a Bathtub Hotel in Delhi

**Always book by room category, not just hotel name.** A property like ITC Maurya has 440 rooms — only the ITC One floor and suites guarantee a bathtub. Standard Towers rooms do not.

**Delhi geography matters.** Luxury hotel clusters: Chanakyapuri (diplomatic enclave), Connaught Place/Lutyens, Aerocity (near IGI Airport), and Gurugram (tech corridor, technically NCR). Pick your cluster based on whether you're sightseeing, transiting, or staycationing.

**Best value window.** January–February and July–August are off-peak for business travel — five-star suite rates drop 25–35%.

---

## Top 10 Hotels with Bathtubs in Delhi

### 1. The Leela Palace New Delhi ⭐⭐⭐⭐⭐
*Chanakyapuri · Booking.com score: 9.6*

The Leela Palace on Diplomatic Enclave Road is the most opulent bathtub hotel in Delhi. Royal Club rooms and all suite categories feature oversized Italian marble bathrooms with deep soaking tubs. The Presidential Suite's bathroom is larger than most Delhi hotel rooms.

**Best for:** The most lavish in-room bathtub experience in the capital — bar none.

**Must-book room:** Royal Club Room — soaking tub, Leela Palace butler service, and access to the Royal Club Lounge. At ₹18,000–22,000/night, it's Delhi's finest value-luxury ratio.

---

### 2. The Oberoi New Delhi ⭐⭐⭐⭐⭐
*Dr. Zakir Hussain Marg · Booking.com score: 9.5*

The Oberoi's location opposite Golf Links is unmatched — green views, calm streets, and proximity to both Lodi Garden and Khan Market. Luxury rooms and above feature deep soaking tubs with a separate rain shower setup in Oberoi's signature black-and-white marble bathrooms.

**Best for:** Couples who want a quiet, design-forward hotel away from Delhi's traffic corridors.

**Must-book room:** Luxury Room — the starting category that guarantees a soaking tub. Don't book Deluxe; it's a shower-only tier.

---

### 3. ITC Maurya, a Luxury Collection Hotel ⭐⭐⭐⭐⭐
*Diplomatic Enclave · Booking.com score: 9.4*

ITC Maurya is one of Delhi's most storied addresses — every visiting US President has stayed here. The ITC One floor and above offer private in-room bathtubs with premium ITC bath amenity kits. The hotel's Bukhara restaurant is a bonus if you're spending the weekend.

**Best for:** History buffs and couples who want the ITC Maurya prestige alongside a private tub.

**Must-book room:** ITC One room — specifically request "bathtub room" at booking; the floor has both tub and shower-only configurations.

---

### 4. Taj Mahal Hotel, New Delhi ⭐⭐⭐⭐⭐
*Mansingh Road · Booking.com score: 9.4*

The Taj Mahal Hotel on Mansingh Road sits at the heart of Lutyens Delhi — walking distance from India Gate and Khan Market. Taj Club rooms on upper floors include deep soaking tubs, and the hotel's Sunday brunch is a Delhi institution.

**Best for:** First-time Delhi visitors who want a heritage luxury address with confirmed bathtub access.

**Must-book room:** Taj Club Room — bathtub confirmed, access to Taj Club Lounge, and the best city views in the building.

---

### 5. The Imperial, New Delhi ⭐⭐⭐⭐⭐
*Janpath · Booking.com score: 9.3*

Built in 1931, The Imperial is Delhi's most atmospheric luxury hotel — Art Deco corridors, original colonial-era artwork, and a location on Janpath that puts you steps from Connaught Place. Imperial Suites feature clawfoot-inspired soaking tubs in oversized heritage bathrooms.

**Best for:** Couples who want character over modernity — no glass towers, just a beautifully restored 95-year-old building.

**Must-book room:** Imperial Suite — heritage bathtub, private butler, and the most distinctive bathroom in Delhi.

---

### 6. Hyatt Regency Delhi ⭐⭐⭐⭐⭐
*Bhikaji Cama Place · Booking.com score: 9.2*

A 40-storey tower in the Ring Road corridor, Hyatt Regency Delhi offers some of the city's best skyline views from upper-floor Regency Club rooms. Regency Club Suites feature separate soaking tubs and access to the Regency Club Lounge — Delhi's best club lounge product for the price.

**Best for:** Business-leisure couples who want airport proximity (30 min to IGI) plus a private tub.

**Must-book room:** Regency Club Suite — soaking tub confirmed, breakfast included, dedicated check-in.

---

### 7. Roseate House New Delhi ⭐⭐⭐⭐⭐
*Aerocity · Booking.com score: 9.3*

The design standout of Delhi's Aerocity hotel cluster. Roseate House is a boutique luxury property with a garden campus that feels more Rajasthan retreat than airport hotel. The Roseate Suite bathrooms feature freestanding soaking tubs surrounded by greenery — unusual for the Aerocity zone.

**Best for:** Couples transiting through Delhi who want a bathtub hotel within 5 minutes of IGI Terminal 3.

**Must-book room:** Roseate Suite — freestanding tub, garden view, the most distinctive stay in Aerocity.

---

### 8. Pullman New Delhi Aerocity ⭐⭐⭐⭐⭐
*Aerocity · Booking.com score: 9.1*

Accor's flagship Delhi property is a step above the standard business-hotel experience. Executive rooms on the Club Millésime floor include deep soaking tubs and complimentary evening cocktails. At ₹7,000–9,000/night for a suite with bathtub, it's Delhi's best airport-adjacent value.

**Best for:** Budget-conscious couples who want a verified bathtub without the Leela or Oberoi price tag.

**Must-book room:** Club Millésime Suite — soaking tub confirmed, breakfast + evening drinks included.

---

### 9. The Lalit New Delhi ⭐⭐⭐⭐⭐
*Barakhamba Road · Booking.com score: 9.0*

A 460-room tower at Connaught Place with easy Metro access. The Lalit Grand Presidential Suite features one of Delhi's most theatrical bathrooms — a freestanding tub on a raised platform with double-height ceilings. Royal Suites also confirm bathtubs.

**Best for:** Couples who want a central Connaught Place location with confirmed in-room bathtub access.

**Must-book room:** Royal Suite — bathtub confirmed. The base room categories are shower-only.

---

### 10. Sheraton New Delhi Hotel ⭐⭐⭐⭐
*Saket · Booking.com score: 9.0*

The most accessible bathtub hotel on this list price-wise. Sheraton Saket's Junior Suites feature deep soaking tubs and are consistently available at ₹6,000–8,000/night — making it the best entry point into the Delhi bathtub hotel category.

**Best for:** Couples on a moderate budget who want a verified private bathtub without compromising on service quality.

**Must-book room:** Junior Suite — always confirm "bathtub" is listed in the room amenities before booking.

---

## Delhi Bathtub Hotels: Quick Comparison

| Hotel | Area | Bathtub Type | Min Rate |
|-------|------|--------------|----------|
| The Leela Palace | Chanakyapuri | Marble soaking tub | ₹18,000 |
| The Oberoi | Golf Links | Deep soaking tub | ₹16,000 |
| ITC Maurya | Diplomatic Enclave | Soaking tub, butler | ₹15,000 |
| Taj Mahal Hotel | Mansingh Road | Deep soaking tub | ₹14,000 |
| The Imperial | Janpath | Heritage soaking tub | ₹12,000 |
| Hyatt Regency | Bhikaji Cama | Soaking tub, skyline | ₹10,000 |
| Roseate House | Aerocity | Freestanding, garden | ₹12,000 |
| Pullman Aerocity | Aerocity | Deep soaking tub | ₹7,500 |
| The Lalit | Barakhamba | Freestanding, suite | ₹11,000 |
| Sheraton Saket | Saket | Soaking tub | ₹6,000 |

---

## Booking Tips for Delhi Bathtub Hotels

**1. Always verify the room category.** Use Booking.com's room-level amenity filter or check "Room info & price" → "What's included" before confirming. The word "bathtub" must appear — "bath" often means shower only in hotel marketing copy.

**2. Best areas by purpose:**
- *Sightseeing (monuments, museums):* Lutyens zone — Taj Mahal Hotel, The Imperial, The Oberoi
- *Airport transit:* Aerocity — Roseate House, Pullman
- *Business district staycation:* Bhikaji Cama / Saket — Hyatt Regency, Sheraton

**3. Book direct for upgrades.** ITC properties and The Leela Palace regularly upgrade direct bookings with bathtub rooms. Mention your occasion at time of booking.

**4. Avoid peak conference season.** October–November and February–March bring large MICE events to Delhi; rates spike 40–60% and upgrade odds drop.

---

## Final Word

Delhi has some of India's finest bathtub hotel experiences — from The Leela Palace's marble soaking tub overlooking the Diplomatic Enclave to The Imperial's heritage clawfoot setup from 1931. The key is booking the right room tier.

Browse all verified [hotels with bathtubs in Delhi](/india/delhi) — every property on our city page is triple-checked across Booking.com, Agoda, and MakeMyTrip to confirm the bathtub is in your specific room category.

For a broader luxury India guide, see [best hotels with private jacuzzis for couples across India](/blog/best-hotels-private-jacuzzi-couples-india).

*Last updated: August 2026. Booking.com scores reflect guest ratings at time of publication.*
`,
};

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected');
  const Blog = mongoose.models.Blog || mongoose.model('Blog', BlogSchema);
  const existing = await Blog.findOne({ slug: post.slug });
  if (existing) {
    await Blog.updateOne({ slug: post.slug }, { $set: post });
    console.log('✅ Updated:', post.slug);
  } else {
    await Blog.create(post);
    console.log('✅ Created:', post.slug);
  }
  await mongoose.disconnect();
  console.log('✅ Done');
}

run().catch(e => { console.error(e); process.exit(1); });
