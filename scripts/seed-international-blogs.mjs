import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('Please define the MONGODB_URI environment variable inside .env.local');
  process.exit(1);
}

const blogSchema = new mongoose.Schema({
  title: String,
  slug: { type: String, unique: true },
  content: String,
  author: String,
  published: Boolean,
  tags: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Blog = mongoose.models.Blog || mongoose.model('Blog', blogSchema);

const blogs = [
  {
    title: 'Paris Hotels with Bathtubs Overlooking the Eiffel Tower',
    slug: 'paris-hotels-with-bathtubs-overlooking-eiffel-tower',
    author: 'Karan Arora',
    published: true,
    tags: ['Paris', 'Honeymoon', 'France', 'Luxury', 'Eiffel Tower'],
    content: `
# Paris Hotels with Bathtubs Overlooking the Eiffel Tower

Paris is the global capital of romance, and there is no more iconic romantic experience than soaking in a private bathtub while gazing out at the glittering lights of the Eiffel Tower. Whether you are planning a honeymoon, an anniversary trip, or the ultimate Valentine's Day surprise, securing a suite with an Eiffel Tower view from the bathroom is the pinnacle of Parisian luxury.

In this guide, we dive into the most exclusive Palace-grade hotels and hidden boutique gems in Paris that offer guaranteed private bathtubs with views of the *Iron Lady*.

## 1. Four Seasons Hotel George V Paris
Located in the Golden Triangle, the **Four Seasons Hotel George V** is legendary for its floral displays and three Michelin-starred restaurants. But its true secret lies in the Eiffel Suites. The marble-clad bathrooms in these top-tier suites feature deep soaking freestanding tubs positioned directly against floor-to-ceiling windows, offering an unobstructed view of the Eiffel Tower. 

**Pro Tip:** Request the Penthouse or the Eiffel Suite when booking. 

## 2. Hôtel Plaza Athénée
If you've seen *Sex and the City* or *Emily in Paris*, you know the **Plaza Athénée**. Famous for its red geraniums and Haussmann architecture, the Haute Couture Suite features a stunning silver-leaf soaking tub with a direct, framed view of the Eiffel Tower. You can literally sip vintage champagne in the bubbles while watching the tower sparkle on the hour.

## 3. Shangri-La Hotel, Paris
Formerly the palace of Prince Roland Bonaparte, the **Shangri-La** offers some of the closest views of the Eiffel Tower in the entire city. The Terrace Eiffel View Rooms and La Suite Shangri-La boast extraordinary bathroom layouts where the deep soaking bathtubs look directly out over the Seine River and the tower.

## Why You Must Book Early
Eiffel Tower view bathtub suites are incredibly rare—most Palace hotels only have 2 to 4 of these specific configurations. They often book out 6 to 8 months in advance, especially during the summer, Fashion Week, and December.

Always use the **Hotels with Bathtubs** directory to verify that the specific suite you are clicking on explicitly includes the "Private Bathtub" amenity tag before confirming your reservation.
    `
  },
  {
    title: 'Top 5 Luxury Hotels with Private Hot Tubs in Dubai',
    slug: 'top-5-luxury-hotels-with-private-hot-tubs-in-dubai',
    author: 'Karan Arora',
    published: true,
    tags: ['Dubai', 'UAE', 'Jacuzzi', 'Luxury', 'Middle East'],
    content: `
# Top 5 Luxury Hotels with Private Hot Tubs in Dubai

Dubai is synonymous with unmatched luxury, architectural marvels, and opulent hospitality. When standard luxury isn't enough, upgrading to a suite with a private hot tub or a deep soaking bathtub with skyline views elevates your desert getaway to royal status.

Here are the top hotels in Dubai offering the most spectacular private Jacuzzis and bathtubs.

## 1. Burj Al Arab Jumeirah
The world's only "seven-star" hotel doesn't just offer bathtubs; it offers full-scale private spa experiences. Every single duplex suite in the **Burj Al Arab** features a massive, circular Jacuzzi tub surrounded by mosaic tiles and full-size Hermes amenities. The mirrored ceilings and panoramic views of the Arabian Gulf make this the ultimate soaking experience.

## 2. Atlantis The Royal
Dubai's newest ultra-luxury resort has redefined the skyline. The Sky Pool Villas and Signature Penthouses at **Atlantis The Royal** feature private outdoor plunge pools, but their indoor marble bathrooms are equally jaw-dropping. The freestanding bathtubs overlook the Palm Jumeirah and the fire-and-water fountains below.

## 3. Five Palm Jumeirah Dubai
Known as Dubai's hottest party hotel, **Five Palm Jumeirah** balances high-energy beach clubs with intimate luxury. The Luxe Sea View rooms and Four-Bedroom suites feature massive stone bathtubs and, in some penthouse layouts, private terrace Jacuzzis overlooking the Dubai Marina skyline.

## What to Look For
When booking in Dubai, pay attention to the view classification. A "City View" tub will overlook the bustling Sheikh Zayed Road or Downtown Dubai (Burj Khalifa views), while a "Sea View" tub will look out over the Arabian Gulf or the Palm Jumeirah.
    `
  },
  {
    title: 'London’s Most Historic Hotels with Deep Soaking Tubs',
    slug: 'londons-most-historic-hotels-with-deep-soaking-tubs',
    author: 'Karan Arora',
    published: true,
    tags: ['London', 'UK', 'Europe', 'Historic', 'Bathtubs'],
    content: `
# London’s Most Historic Hotels with Deep Soaking Tubs

After a long day exploring the British Museum, walking through Hyde Park, or shopping in Mayfair, there is nothing quite like retreating to a historic London hotel and drawing a warm bath. London's grand dame hotels are famous for their traditional, Victorian-style clawfoot tubs and modern marble soaking baths.

Here is where to find the best in-room bathtubs in the UK capital.

## 1. The Savoy
A London institution on the Strand, **The Savoy** seamlessly blends Edwardian and Art Deco design. The river-view suites feature massive, classic clawfoot bathtubs with Penhaligon's bath amenities. You can soak in the tub while watching the boats drift down the River Thames.

## 2. The Ritz London
Located in Piccadilly, **The Ritz** offers unadulterated Louis XVI luxury. The bathrooms are entirely clad in pink marble, and the deep soaking tubs feature gold-plated swan-neck faucets. It is an incredibly regal experience that transports you straight to the Gilded Age.

## 3. The Ned
For a more modern, trendy take on historic luxury, **The Ned** in the City of London (housed in a former Midland Bank building) offers Soho House-style design. The Heritage suites feature freestanding roll-top bathtubs placed right in the bedroom, complete with Cowshed spa products.

## Booking Advice
Historic London hotels often have smaller entry-level rooms due to the age of the buildings. To guarantee a bathtub, you must avoid "Classic" or "Superior" rooms, which often only feature rainfall showers. Always look for "Deluxe", "Executive", or "Suite" categories when browsing our verified London listings.
    `
  },
  {
    title: 'Bali Honeymoon Villas with Private Outdoor Bathtubs',
    slug: 'bali-honeymoon-villas-with-private-outdoor-bathtubs',
    author: 'Karan Arora',
    published: true,
    tags: ['Bali', 'Indonesia', 'Honeymoon', 'Villas', 'Outdoor Tubs'],
    content: `
# Bali Honeymoon Villas with Private Outdoor Bathtubs

Bali is the ultimate honeymoon destination, offering a blend of spiritual tranquility, jungle serenity, and oceanfront luxury. One of the defining features of a Balinese honeymoon villa is the private outdoor bathtub—a stunning stone or copper tub set amidst tropical gardens, koi ponds, or overlooking the rainforest canopy.

Here are the best resorts in Bali offering guaranteed private outdoor soaking tubs.

## 1. Viceroy Bali (Ubud)
Perched on the edge of the Valley of the Kings, the **Viceroy Bali** is a family-owned luxury resort. The Terrace Villas not only feature private infinity pools but also massive, romantic outdoor bathtubs nestled in private pavilions. The resort staff can arrange a "flower bath," filling the tub with thousands of fresh rose and marigold petals before you arrive.

## 2. Bulgari Resort Bali (Uluwatu)
Set on a clifftop 150 meters above the Indian Ocean, the **Bulgari Resort** blends Italian luxury with traditional Balinese design. The Ocean View Villas feature enormous black terrazzo bathtubs. While technically indoors, the floor-to-ceiling glass walls slide entirely open, transforming the bathroom into an open-air sanctuary overlooking the sea.

## 3. Four Seasons Resort Bali at Sayan
Famous for its dramatic suspension bridge entrance, the **Four Seasons Sayan** immerses you in the Ayung River valley. The Riverfront Villas feature deep freestanding soaking tubs on private wooden decks, allowing you to bathe while listening to the sounds of the rushing river and the jungle wildlife.

## The Famous "Flower Bath"
When booking your Bali villa through our verified directory, be sure to contact the hotel concierge a week before your arrival to request a traditional Balinese Flower Bath. It is highly Instagrammable and the perfect romantic surprise for your partner.
    `
  }
];

async function seedBlogs() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB.');

  let inserted = 0;
  for (const b of blogs) {
    const exists = await Blog.findOne({ slug: b.slug });
    if (!exists) {
      await Blog.create(b);
      console.log(`Inserted blog: ${b.title}`);
      inserted++;
    } else {
      console.log(`Blog already exists: ${b.title}`);
    }
  }

  console.log(`Done. Inserted ${inserted} blogs.`);
  process.exit(0);
}

seedBlogs().catch(console.error);
