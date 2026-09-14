#!/usr/bin/env node

const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });


const blogs = [
  {
    title: "The Best Jacuzzi Suites in Berlin for a Romantic Weekend",
    slug: "best-jacuzzi-suites-berlin-romantic-weekend",
    excerpt: "Discover Berlin's most exclusive luxury hotels featuring private bathtubs and jacuzzis, perfect for an unforgettable romantic escape in the German capital.",
    content: `Berlin is a city where history meets avant-garde luxury. For couples seeking a romantic getaway, the German capital offers a surprising array of opulent hotels equipped with private, in-room jacuzzis and deep soaking bathtubs.

## 1. Hotel Adlon Kempinski Berlin
Located next to the iconic Brandenburg Gate, this legendary hotel offers royal suites with expansive marble bathrooms. The deep soaking tubs are perfectly situated for a relaxing evening after exploring the city's historic sites.

## 2. The Ritz-Carlton, Berlin
Situated at Potsdamer Platz, The Ritz-Carlton brings a touch of Art Deco glamour to Berlin. Their luxury suites feature heated bathroom floors, rain showers, and classic freestanding bathtubs.

## 3. Waldorf Astoria Berlin
Offering panoramic views of the Berlin skyline and the Memorial Church, the Waldorf Astoria is synonymous with modern elegance. Enjoy a glass of champagne in your private jacuzzi suite as the city lights up below.

## Why Choose Berlin for Romance?
Berlin's incredible culinary scene, world-class museums, and vibrant nightlife make it a top-tier destination for couples. Returning to a private spa-like bathroom makes the experience truly unforgettable.`,
    coverImage: "https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/luxury-bathtub-berlin-hotel-adlon-kempinski-berlin.webp",
    published: true,
    tags: ["Berlin", "Germany", "Jacuzzi", "Romantic Weekend", "Couples"]
  },
  {
    title: "Venice’s Most Opulent Hotel Bathtubs Overlooking the Grand Canal",
    slug: "venice-opulent-hotel-bathtubs-grand-canal",
    excerpt: "Experience the magic of Venice from the comfort of a private bathtub overlooking the Grand Canal. A guide to Italy's most romantic water-view suites.",
    content: `There is no city quite like Venice, and there is no better way to experience its romantic charm than from a private bathtub in a historic palazzo overlooking the Grand Canal.

## The Gritti Palace
A quintessential Venetian experience, The Gritti Palace offers suites adorned with rare antiques, Murano glass chandeliers, and spectacular marble bathrooms. Soak in a deep tub while listening to the gentle lapping of the canal outside your window.

## Aman Venice
Located in a 16th-century palazzo, Aman Venice offers minimalist luxury against a backdrop of historic frescoes. Their signature suites feature magnificent freestanding bathtubs that perfectly blend modern design with Renaissance opulence.

## Belmond Hotel Cipriani
Situated on Giudecca Island, Hotel Cipriani offers a serene escape from the bustling city. The lagoon-view suites feature sprawling bathrooms equipped with premium jacuzzis and exclusive Italian luxury toiletries.

A trip to Venice is a once-in-a-lifetime romantic event. Elevate your stay by booking a suite that offers not just a bed, but a private sanctuary.`,
    coverImage: "https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/luxury-bathtub-venice-the-gritti-palace.webp",
    published: true,
    tags: ["Venice", "Italy", "Grand Canal", "Luxury", "Honeymoon"]
  },
  {
    title: "Top 5 Luxury Hotels with Private Hot Tubs in Cancun",
    slug: "top-5-luxury-hotels-private-hot-tubs-cancun",
    excerpt: "Upgrade your Caribbean vacation with our curated list of Cancun's best beachfront resorts featuring private in-room hot tubs and jacuzzis.",
    content: `Cancun is famous for its pristine white-sand beaches and turquoise waters. For travelers looking to maximize their relaxation, booking a suite with a private hot tub is an absolute must. 

## 1. Le Blanc Spa Resort
This adults-only, all-inclusive luxury resort is consistently ranked as one of the best in Mexico. Every suite features a two-person whirlpool tub, luxurious BVLGARI bath amenities, and a dedicated butler to draw your bath.

## 2. NIZUC Resort & Spa
Nestled in a private enclave at Punta Nizuc, this resort blends modern luxury with Mayan heritage. Their Ocean Suites feature stunning private plunge pools and deep soaking tubs on outdoor terraces.

## 3. The Ritz-Carlton, Cancun
Experience classic luxury with breathtaking ocean views. The suites at The Ritz-Carlton feature sprawling marble bathrooms with deep soaking tubs, rain showers, and Asprey luxury toiletries.

## 4. Secrets The Vine Cancun
A chic, contemporary resort offering adults-only luxury. The suites boast private balconies with ocean views and luxurious in-room hot tubs perfect for a sunset soak.

## 5. Live Aqua Beach Resort Cancun
Known for its sensory experiences, this resort offers aromatherapy menus and private hydrotherapy tubs in their premium suites, ensuring a deeply relaxing and romantic stay.`,
    coverImage: "https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/luxury-bathtub-cancun-le-blanc-spa-resort.webp",
    published: true,
    tags: ["Cancun", "Mexico", "Hot Tubs", "Beachfront", "All-Inclusive"]
  },
  {
    title: "Cape Town’s Most Breathtaking Bathtub Views",
    slug: "cape-town-breathtaking-bathtub-views",
    excerpt: "From Table Mountain to the Atlantic Ocean, discover the luxury hotels in Cape Town that offer the most spectacular views right from your private bathtub.",
    content: `Cape Town is a city of dramatic landscapes, where rugged mountains meet the crashing ocean. For a truly immersive luxury experience, you need a hotel room that frames this natural beauty—ideally from the comfort of a warm, deep soaking tub.

## The Silo Hotel
Located above the Zeitz Museum of Contemporary Art Africa, The Silo Hotel is famous for its pillowed glass windows. The bathrooms here are architectural marvels, featuring freestanding bathtubs that offer sweeping, uninterrupted views of Table Mountain and the V&A Waterfront.

## Ellerman House
An exclusive mansion perched on the slopes of Lion's Head in Bantry Bay. Ellerman House offers unparalleled privacy and luxury. The cliffside suites feature opulent bathrooms with bathtubs looking straight out over the Atlantic Ocean.

## Belmond Mount Nelson Hotel
Known as the "Pink Lady" of Cape Town, this historic hotel sits at the foot of Table Mountain. The newly renovated suites offer classic luxury, featuring spacious marble bathrooms with deep soaking tubs and premium African botanical bath products.

Whether you are finishing a safari or enjoying the Winelands, these Cape Town bathtubs offer the perfect romantic retreat.`,
    coverImage: "https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/luxury-bathtub-cape-town-the-silo-hotel.webp",
    published: true,
    tags: ["Cape Town", "South Africa", "Table Mountain", "Views", "Luxury"]
  },
  {
    title: "A Guide to Vienna’s Imperial Spa Suites",
    slug: "vienna-imperial-spa-suites-guide",
    excerpt: "Explore the opulent, palatial luxury of Vienna's top hotels, featuring grand marble bathrooms, classic freestanding tubs, and unparalleled imperial charm.",
    content: `Vienna is a city steeped in imperial history and classical elegance. When visiting the Austrian capital, staying in a hotel that reflects this grand heritage is a must. Here are the top hotels offering opulent private bathtubs and spa suites.

## Hotel Sacher Wien
Famous for its Sachertorte, this historic hotel also boasts some of the most luxurious suites in Vienna. The bathrooms are a masterclass in classic elegance, featuring extensive marble, heated floors, and deep, classic soaking tubs.

## The Ritz-Carlton, Vienna
Composed of four historic palaces, The Ritz-Carlton offers a seamless blend of Renaissance architecture and modern luxury. Their premium suites feature expansive spa-like bathrooms with freestanding bathtubs and exclusive luxury amenities.

## Park Hyatt Vienna
Located in a former bank building in the Goldenes Quartier, the Park Hyatt exudes sophistication. The suites feature incredibly spacious bathrooms clad in mother-of-pearl and marble, offering enormous soaking tubs that guarantee a relaxing evening after a night at the Opera.

Experience the grandeur of the Habsburgs by booking one of these magnificent imperial suites.`,
    coverImage: "https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/luxury-bathtub-vienna-hotel-sacher-wien.webp",
    published: true,
    tags: ["Vienna", "Austria", "Imperial", "Spa Suites", "Romantic"]
  }
];

async function run() {
  console.log('🚀 Seeding Phase 3 Blogs...');
  const client = await MongoClient.connect(process.env.MONGODB_URI); const db = client.db();
  for (const b of blogs) {
    await db.collection('blogs').updateOne({ slug: b.slug }, { $set: b }, { upsert: true });
    console.log(`✅ Seeded blog: ${b.title}`);
  }
  console.log('🎉 Done!');
  process.exit(0);
}

run().catch(console.error);
