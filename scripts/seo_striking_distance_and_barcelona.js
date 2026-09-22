const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const BlogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    excerpt: { type: String, required: true },
    content: { type: String, required: true },
    date: { type: String, required: true },
    published: { type: Boolean, default: true },
    author: { type: String, default: 'Karan Arora' },
    image: { type: String },
    country: { type: String },
    city: { type: String },
  },
  { timestamps: true }
);

const Blog = mongoose.models.Blog || mongoose.model('Blog', BlogSchema);

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // 1. Update the 5 high-impression Page 2 blogs with exact GSC keyword alignment
  const updates = [
    {
      slug: 'kolkata-jacuzzi-hotels-romantic-staycation',
      title: '8 Best Hotels with Bathtubs & Jacuzzis in Kolkata for Couples (2026 Guide)',
      excerpt: 'Discover top romantic hotels with private in-room bathtubs and jacuzzi suites in Kolkata for couples. Verified 2026 stays with private soaking tubs for anniversaries & getaways.',
      city: 'Kolkata',
      country: 'India',
    },
    {
      slug: 'hotel-with-bathtub-in-jaipur',
      title: 'Best Hotels with Bathtub in Jaipur for Couples (2026 Jacuzzi Suites & Heritage Stays)',
      excerpt: 'Looking for a romantic couple getaway in Jaipur? Explore verified heritage palaces and boutique resorts with private in-room bathtubs and jacuzzi suites.',
      city: 'Jaipur',
      country: 'India',
    },
    {
      slug: 'couple-friendly-hotels-with-bathtub-in-ahmedabad',
      title: 'Top Couple-Friendly Hotels with Bathtub in Ahmedabad (2026 Stays & Jacuzzis)',
      excerpt: 'Looking for a romantic staycation in Ahmedabad? Explore verified couple-friendly hotels with private in-room bathtubs and jacuzzi suites for complete privacy.',
      city: 'Ahmedabad',
      country: 'India',
    },
    {
      slug: 'hotels-with-bathtubs-in-bangkok',
      title: '10 Best Bangkok Hotels with Bathtubs & Chao Phraya Jacuzzi Suites (2026 Guide)',
      excerpt: 'From rooftop skyline soaking tubs to riverside luxury suites along the Chao Phraya, discover the definitive guide to Bangkok hotels with private in-room bathtubs.',
      city: 'Bangkok',
      country: 'Thailand',
    },
    {
      slug: 'hotels-with-bathtubs-in-london',
      title: 'Best Hotels with Bathtubs in London: Luxury Suites & Clawfoot Tubs (2026)',
      excerpt: 'Planning a romantic getaway in London? Explore top verified boutique and 5-star hotels featuring private deep soaking tubs and vintage roll-top baths.',
      city: 'London',
      country: 'UK',
    },
  ];

  for (const item of updates) {
    const res = await Blog.updateOne(
      { slug: item.slug },
      {
        $set: {
          title: item.title,
          excerpt: item.excerpt,
          city: item.city,
          country: item.country,
        },
      }
    );
    console.log(`Updated [${item.slug}]: matched ${res.matchedCount}, modified ${res.modifiedCount}`);
  }

  // 2. Add high-demand Barcelona Balcony & In-Room Bathtub Guide
  const barcelonaGuide = {
    slug: 'barcelona-hotels-with-private-hot-tub-and-balcony-bathtubs',
    title: 'Best Barcelona Hotels with Private Bathtubs & Balcony Jacuzzis (2026 Guide)',
    excerpt: 'Looking for a romantic stay in Barcelona? Explore top verified luxury hotels with private in-room bathtubs, Mediterranean sea-view jacuzzis, and terrace soaking tubs for couples.',
    city: 'Barcelona',
    country: 'Spain',
    author: 'Karan Arora',
    date: '2026-09-22',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/luxury-bathtub-barcelona-hotel-arts-barcelona.webp',
    published: true,
    content: `# Best Barcelona Hotels with Private Bathtubs & Balcony Jacuzzis (2026 Guide)

Barcelona is one of Europe's most intoxicating coastal cities—celebrated for Antoni Gaudí’s surreal modernist architecture, Michelin-starred Catalan gastronomy, and golden Mediterranean beaches. Whether you are visiting for an anniversary, a honeymoon, or a luxury weekend retreat, staying at a **hotel with a private in-room bathtub or balcony jacuzzi in Barcelona** turns a regular city break into a deeply rejuvenating romantic escape.

Unlike standard hotels where spa pools are shared among hundreds of guests, the hand-picked properties below guarantee private, in-room soaking experiences directly inside your suite.

[**👉 Explore All Verified Barcelona Hotels with Private In-Room Bathtubs & Jacuzzis**](/spain/barcelona)

---

## What to Look For in Barcelona Bathtub & Jacuzzi Suites

When reserving a suite with a bathtub in Barcelona, consider these distinctive room features:

- **Mediterranean Sea Views:** High-floor towers overlooking the Port Olímpic and Barceloneta Beach, allowing you to gaze at the sunrise or Mediterranean sunset right from the bath.
- **Modernist Freestanding Soaking Tubs:** Sculptural round or oval bathtubs positioned alongside floor-to-ceiling windows or chic modernist architectural arches.
- **Hydrotherapy Jet Spas:** Deep whirlpool bathtubs equipped with massage jets to soothe tired legs after walking through Park Güell or the Gothic Quarter.

---

## Top Verified Barcelona Hotels with Private Bathtubs & Spa Baths

### 1. Hotel Arts Barcelona (Port Olímpic)
Rising 44 stories above the Mediterranean coastline, **Hotel Arts Barcelona** is a world-renowned Ritz-Carlton property designed by architect Bruce Graham. Its premier Sea View Suites and Executive Suites feature expansive Italian marble bathrooms with deep hydrotherapy soaking tubs framing panoramic ocean vistas.

- **Signature Tub:** Deep marble hydrotherapy tub with direct sea views and Asprey luxury bath amenities.
- **Couples Highlight:** Two-Michelin-starred Enoteca Paco Pérez on-site, plus private penthouse spa access.
- **Explore:** [Check Hotel Arts Barcelona Availability & Rates](/spain/barcelona#hotel-hotel-arts-barcelona)

### 2. Mandarin Oriental, Barcelona (Passeig de Gràcia)
Nestled on Barcelona's most prestigious boulevard, Passeig de Gràcia, this ultra-luxury retreat by designer Patricia Urquiola is housed in a grand mid-century neoclassical building. The signature suites feature oversized circular freestanding bathtubs that serve as artistic centerpieces in custom-designed spa bathrooms.

- **Signature Tub:** Circular designer freestanding soaking tub surrounded by custom screens and aromatic bath oils.
- **Couples Highlight:** Rooftop dipping pool overlooking Casa Batlló, paired with culinary creations at Moments restaurant.
- **Explore:** [Check Mandarin Oriental Barcelona Availability & Rates](/spain/barcelona#hotel-mandarin-oriental-barcelona)

### 3. W Barcelona ("The Sail" / Nova Bocana)
Known locally as *La Vela* (The Sail) for its striking silhouette by architect Ricardo Bofill, **W Barcelona** stands directly on the boardwalk of the Mediterranean Sea. The upper-tier WOW and Extreme WOW Suites feature floor-to-ceiling panoramic glass walls with an ocean-view bathtub placed directly by the windows.

- **Signature Tub:** Freestanding ocean panorama bathtub overlooking the waves, equipped with Davines luxury amenities.
- **Couples Highlight:** Sunset cocktails at Eclipse rooftop lounge and beachfront champagne breakfasts.
- **Explore:** [Check W Barcelona Availability & Rates](/spain/barcelona#hotel-w-barcelona-the-sail)

---

## Essential Tips for Booking Bathtub Suites in Barcelona

1. **Verify Your Specific Room Tier:** Standard entry-level rooms in European historic buildings often only contain walk-in rain showers. Always confirm that your booking confirmation specifies "Suite with Bathtub", "Executive Room with Bath", or "Hydrotherapy Suite".
2. **Book Direct Partner Links:** Using verified partner links guarantees real-time room category verification across Booking.com and Agoda so you don't face surprises at check-in.
3. **Bring Bath Botanicals:** Local Spanish sea salts, dried rosemary, or lavender bath oils make soaking after a day strolling Las Ramblas an unforgettable couple's ritual.

---

## Frequently Asked Questions

**Which hotels in Barcelona feature private in-room bathtubs with sea views?**  
Hotel Arts Barcelona and W Barcelona both offer suites featuring floor-to-ceiling Mediterranean ocean views directly from their private, in-room bathtubs and hydrotherapy spas.

**Are hotel room bathtubs in Barcelona private or shared?**  
All properties curated on Hotels with Bathtubs feature guaranteed private tubs located inside your reserved guest room or suite. We strictly filter out properties where tubs are located in shared hotel wellness facilities.

**What is the best neighborhood to stay in Barcelona for romantic couple getaways?**  
For beachfront sea views and contemporary luxury, stay in Port Olímpic or Nova Bocana. For historic charm, designer shopping, and architecture, stay on Passeig de Gràcia in Eixample.
`,
  };

  const existingBarcelona = await Blog.findOne({ slug: barcelonaGuide.slug });
  if (existingBarcelona) {
    await Blog.updateOne({ slug: barcelonaGuide.slug }, { $set: barcelonaGuide });
    console.log('Updated existing Barcelona guide in MongoDB');
  } else {
    await Blog.create(barcelonaGuide);
    console.log('Created new Barcelona guide in MongoDB');
  }

  await mongoose.disconnect();
  console.log('Done!');
}

run().catch(console.error);
