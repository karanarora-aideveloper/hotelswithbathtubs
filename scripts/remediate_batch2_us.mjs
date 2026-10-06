import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const R2_BASE = 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/';

const BATCH2_REMEDIATIONS = [
  // Gatlinburg
  {
    slug: 'margaritaville-resort-gatlinburg',
    name: 'Margaritaville Resort Gatlinburg',
    city: 'Gatlinburg',
    image: `${R2_BASE}bathtub-margaritaville-resort-gatlinburg.webp`,
    roomType: 'King Suite with Fireplace and Jacuzzi',
    tubType: 'whirlpool',
    bookingTip: 'Request an upper-floor River View King Suite with in-room Whirlpool tub and stone fireplace for the ultimate Smoky Mountain retreat.'
  },
  {
    slug: 'bearskin-lodge-on-the-river-gatlinburg',
    name: 'Bearskin Lodge on the River',
    city: 'Gatlinburg',
    image: `${R2_BASE}bathtub-bearskin-lodge-gatlinburg.webp`,
    roomType: 'Riverfront King Suite with Whirlpool',
    tubType: 'whirlpool',
    bookingTip: 'Book the Riverfront King Suite directly on the stream with exposed wooden beams and an in-room whirlpool tub.'
  },
  {
    slug: 'the-park-vista-doubletree-gatlinburg',
    name: 'The Park Vista - a DoubleTree by Hilton Hotel',
    city: 'Gatlinburg',
    image: `${R2_BASE}bathtub-the-park-vista-gatlinburg.webp`,
    roomType: 'Mountain View Whirlpool King Suite',
    tubType: 'whirlpool',
    bookingTip: 'Select the high-floor Whirlpool King Room overlooking Mount LeConte for panoramic mountain sunset soaks.'
  },

  // Palm Springs
  {
    slug: 'the-parker-palm-springs',
    name: 'The Parker Palm Springs',
    city: 'Palm Springs',
    image: `${R2_BASE}bathtub-the-parker-palm-springs.webp`,
    roomType: 'Gene Autry Villa with Clawfoot Tub',
    tubType: 'clawfoot',
    bookingTip: 'Opt for the Gene Autry Villa or Estate Room designed by Jonathan Adler featuring a freestanding deep clawfoot tub.'
  },
  {
    slug: 'korakia-pensione-palm-springs',
    name: 'Korakia Pensione Palm Springs',
    city: 'Palm Springs',
    image: `${R2_BASE}bathtub-korakia-pensione-palm-springs.webp`,
    roomType: 'Moroccan Villa with Stone Tub',
    tubType: 'soaking',
    bookingTip: 'Reserve the Moroccan Villa featuring an artisanal carved stone bathtub and citrus courtyard lantern views.'
  },
  {
    slug: 'lhorizon-resort-spa-palm-springs',
    name: "L'Horizon Resort & Spa Palm Springs",
    city: 'Palm Springs',
    image: `${R2_BASE}bathtub-lhorizon-resort-palm-springs.webp`,
    roomType: 'Premier Bungalow with Outdoor Soaking Bath',
    tubType: 'outdoor',
    bookingTip: 'Choose the Steve Chase Bungalow or Premier Bungalow for a private fenced outdoor stone soaking tub beneath palm trees.'
  },

  // Poconos
  {
    slug: 'cove-haven-resort-poconos',
    name: 'Cove Haven Resort',
    city: 'Poconos',
    image: `${R2_BASE}bathtub-cove-haven-resort-poconos.webp`,
    roomType: 'Champagne Tower Suite with Private Pool & Tub',
    tubType: 'whirlpool',
    bookingTip: 'Book the legendary four-story Champagne Tower Suite featuring a 7-foot tall champagne glass whirlpool tub and private heated indoor pool.'
  },
  {
    slug: 'paradise-stream-resort-poconos',
    name: 'Paradise Stream Resort',
    city: 'Poconos',
    image: `${R2_BASE}bathtub-paradise-stream-resort-poconos.webp`,
    roomType: 'Garden of Eden Apple Suite with Heart Tub',
    tubType: 'heart-shaped',
    bookingTip: 'Reserve the Garden of Eden Apple Suite featuring the world-famous red heart-shaped whirlpool tub and wood-burning fireplace.'
  },
  {
    slug: 'the-french-manor-inn-and-spa-poconos',
    name: 'The French Manor Inn and Spa',
    city: 'Poconos',
    image: `${R2_BASE}bathtub-the-french-manor-poconos.webp`,
    roomType: 'Chateau Suite with Fireplace and Jacuzzi',
    tubType: 'jacuzzi',
    bookingTip: 'Request the La Maisonneuve Suite featuring a private stone-accented jacuzzi overlooking the Pocono Mountain crest.'
  },

  // Sedona
  {
    slug: 'lauberge-de-sedona',
    name: "L'Auberge de Sedona",
    city: 'Sedona',
    image: `${R2_BASE}bathtub-lauberge-de-sedona.webp`,
    roomType: 'Creekside Cottage with Soaking Tub',
    tubType: 'soaking',
    bookingTip: 'Select the Creekside Cottage with outdoor cedar shower and deep indoor soaking tub steps from bubbling Oak Creek.'
  },
  {
    slug: 'enchantment-resort-sedona',
    name: 'Enchantment Resort Sedona',
    city: 'Sedona',
    image: `${R2_BASE}bathtub-enchantment-resort-sedona.webp`,
    roomType: 'Casita Suite with Fireplace and Soaking Tub',
    tubType: 'soaking',
    bookingTip: 'Opt for a Junior Suite or One-Bedroom Casita with beehive fireplace and deep tub directly facing the red rock canyon walls.'
  },
  {
    slug: 'amara-resort-and-spa-sedona',
    name: 'Amara Resort and Spa',
    city: 'Sedona',
    image: `${R2_BASE}bathtub-amara-resort-sedona.webp`,
    roomType: 'Spa King Suite with Deep Tub',
    tubType: 'soaking',
    bookingTip: 'Book the Creekside Spa King Suite with deep Italian marble soaking tub and views of Cleopatra Rock.'
  }
];

async function remediate() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB Atlas.');

  const collection = mongoose.connection.collection('hotels');
  let updatedCount = 0;

  for (const item of BATCH2_REMEDIATIONS) {
    const res = await collection.updateOne(
      { slug: item.slug },
      {
        $set: {
          name: item.name,
          image: item.image,
          roomType: item.roomType,
          tubType: item.tubType,
          bookingTip: item.bookingTip,
          country: 'United States',
          updatedAt: new Date()
        }
      }
    );

    if (res.matchedCount > 0) {
      updatedCount++;
      console.log(`✅ Remediated [${item.city}] ${item.name} (${item.slug})`);
    } else {
      console.warn(`⚠️ Could not find listing with slug: ${item.slug}`);
    }
  }

  console.log(`\n🎉 Successfully remediated ${updatedCount}/${BATCH2_REMEDIATIONS.length} US regional properties!`);
  await mongoose.disconnect();
}

remediate().catch(console.error);
