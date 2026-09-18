const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function run() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const hotels = await client.db().collection('hotels').find({ image: /hotelswithbathtubs\/images\// }).toArray();
  console.log('Remaining R2 images:', hotels.length);
  if (hotels.length > 0) {
      hotels.slice(0, 5).forEach(h => console.log(h.image));
  }
  await client.close();
}
run();
