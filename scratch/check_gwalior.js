import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const uri = process.env.MONGODB_URI;

async function checkGwalior() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    const collection = db.collection('hotels');
    const gwaliorHotels = await collection.find({ city: { $regex: 'gwalior', $options: 'i' } }).toArray();
    console.log(`Found ${gwaliorHotels.length} hotels in Gwalior.`);
    if (gwaliorHotels.length > 0) {
      console.log(gwaliorHotels.map(h => ({ name: h.name, flagged: h.flagged })));
    }
    
    // Also check all cities to see if Gwalior is there under a different name
    const cities = await collection.distinct('city');
    console.log('All distinct cities:', cities);
  } finally {
    await client.close();
  }
}

checkGwalior();
