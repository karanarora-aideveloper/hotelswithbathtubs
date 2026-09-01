const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const topCityPhotos = {
  'Sydney': 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=85',
  'Banff': 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=85',
  'Paris': 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=85',
  'Santorini': 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=85',
  'Bali': 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=85',
  'Rome': 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=85',
  'Kyoto': 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=85',
  'Tokyo': 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=85',
  'Kuala Lumpur': 'https://images.unsplash.com/photo-1596436889106-be35e843f974?auto=format&fit=crop&w=1200&q=85',
  'Maldives': 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1200&q=85',
  'Amsterdam': 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1200&q=85',
  'Singapore': 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=1200&q=85',
  'Barcelona': 'https://images.unsplash.com/photo-1583037189850-1921ae7c6c22?auto=format&fit=crop&w=1200&q=85',
  'Zermatt': 'https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=1200&q=85',
  'Zurich': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=85',
  'Bangkok': 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1200&q=85',
  'Phuket': 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=85',
  'Cappadocia': 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=85',
  'Abu Dhabi': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=85',
  'Dubai': 'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?auto=format&fit=crop&w=1200&q=85',
  'Edinburgh': 'https://images.unsplash.com/photo-1541971875076-8f970d573be6?auto=format&fit=crop&w=1200&q=85',
  'London': 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=85',
  'Aspen': 'https://images.unsplash.com/photo-1517840905240-472988babdf9?auto=format&fit=crop&w=1200&q=85',
  'Austin': 'https://images.unsplash.com/photo-1563911302283-d2bc129e7570?auto=format&fit=crop&w=1200&q=85',
  'Baltimore': 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1200&q=85',
  'Boston': 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=85',
  'Chicago': 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=85',
  'Kansas City': 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=85',
  'Las Vegas': 'https://images.unsplash.com/photo-1581351721010-8cf859cb14a4?auto=format&fit=crop&w=1200&q=85',
  'Los Angeles': 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=85',
  'Miami': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=85',
  'Nashville': 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=85',
  'New Orleans': 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=85',
  'New York': 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=85',
  'San Diego': 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=85',
  'San Francisco': 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=85',
  'Seattle': 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=85'
};

async function applyTopPhotos() {
  await mongoose.connect(process.env.MONGODB_URI);
  const Hotel = mongoose.models.Hotel || mongoose.model('Hotel', new mongoose.Schema({}, { strict: false }));

  for (const [city, imgUrl] of Object.entries(topCityPhotos)) {
    const firstHotel = await Hotel.findOne({ 
      city: new RegExp(`^${city}$`, 'i'),
      country: { $ne: 'India' },
      flagged: { $ne: true }
    });
    if (firstHotel) {
      await Hotel.updateOne({ _id: firstHotel._id }, { $set: { image: imgUrl } });
      console.log(`✅ Set cover photo for ${city}: ${firstHotel.name}`);
    }
  }

  // Verify uniqueness across destination cards
  const pipeline = [
    { $match: { country: { $ne: 'India' }, flagged: { $ne: true } } },
    {
      $group: {
        _id: { city: "$city", country: "$country" },
        image: { $first: "$image" }
      }
    }
  ];

  const cities = await Hotel.aggregate(pipeline);
  const imageSet = new Set(cities.map(c => c.image));
  console.log(`\n🎉 Total International Destinations: ${cities.length}`);
  console.log(`🎉 Unique City Destination Cover Photos: ${imageSet.size} / ${cities.length}`);

  await mongoose.disconnect();
}

applyTopPhotos().catch(console.error);
