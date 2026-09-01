const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const hotelPhotoMap = {
  // Gwalior
  'Taj Usha Kiran Palace': 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=85',
  'Radisson Gwalior': 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=85',
  'Clarks Inn Suite Gwalior': 'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1200&q=85',
  "Neemrana's Deo Bagh, Gwalior": 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=85',

  // Jaisalmer
  'Suryagarh Jaisalmer': 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=85',
  'Jaisalmer Marriott Resort & Spa': 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=85',
  'The Serai, Jaisalmer - SUJÁN Luxury': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=85',

  // Jodhpur
  'Umaid Bhawan Palace, Jodhpur': 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=85',
  'RAAS Jodhpur - Luxury Heritage': 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=85',
  'Taj Hari Mahal, Jodhpur': 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=85',

  // Coorg
  'The Tamara Coorg': 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=85',
  'Evolve Back, Coorg': 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1200&q=85',
  'Taj Madikeri Resort & Spa, Coorg': 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=85',
  'The Ibnii - Eco Luxury Resort': 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=85',
  'Heritage Resort Coorg': 'https://images.unsplash.com/photo-1563911302283-d2bc129e7570?auto=format&fit=crop&w=1200&q=85',

  // Wayanad
  'Mountain Shadows Resort Wayanad': 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=85',
  'Vythiri Village Resort': 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=85',
  'Morickap Resort Wayanad': 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=85',
  'Contour Island Resort & Spa': 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1200&q=85',
  'Wild Planet Resort': 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=85',

  // Alleppey
  'Lake Palace Resort Alleppey': 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1200&q=85',
  'Ramada by Wyndham Alleppey': 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=85',
  'Vasundhara Sarovar Premiere': 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=1200&q=85',
  'Punnamada Resort': 'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?auto=format&fit=crop&w=1200&q=85',
  'Uday Backwater Resort': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=85',

  // Mussoorie
  'JW Marriott Mussoorie Walnut Grove Resort & Spa': 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=85',
  'Welcomhotel by ITC Hotels, The Savoy, Mussoorie': 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=85',
  'Jaypee Residency Manor, Mussoorie': 'https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=1200&q=85',
  'Rokeby Manor, Landour': 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=85',
  'Fortune Resort Grace, Mussoorie': 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=85',

  // Pondicherry
  'Palais de Mahe - CGH Earth': 'https://images.unsplash.com/photo-1583037189850-1921ae7c6c22?auto=format&fit=crop&w=1200&q=85',
  'The Promenade Pondicherry': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=85',
  'Le Dupleix Pondicherry': 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=85',
  'Ocean Spray Resort Pondicherry': 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=85',
  'Accord Puducherry': 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=85',

  // Chikmagalur
  'The Serai Chikmagalur': 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=85',
  'Trivik Hotels & Resorts, Mullayanagiri, Chikmagalur': 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1200&q=85',

  // Mahabaleshwar
  'Le Méridien Mahabaleshwar Resort & Spa': 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=85',
  'Courtyard by Marriott Mahabaleshwar': 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=85',

  // Alibaug
  'Radisson Blu Resort & Spa Alibaug': 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=85',

  // Others
  'Azad Hind Beach Resort': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=85',
  'Grand Beach Resort': 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=85',
  'Hotel Sher Bengal Beach Resort': 'https://images.unsplash.com/photo-1563911302283-d2bc129e7570?auto=format&fit=crop&w=1200&q=85',
  'Brunton Boatyard': 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=85',
  'Hotel Aamby Valley City': 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1200&q=85',
  'Norbu The Montanna Ihcl Seleqtions': 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=85',
  'Hotel Radisson Blu': 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=85',
  'Romantic Bathtub Freesia Resort By Express Inn': 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=85',
  'Hotel Radisson Blu Plaza Airport': 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=85',
  'Hotel Mount Regency In': 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=85',
  'City Connect by Downtown': 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=85'
};

async function updateRemainingImages() {
  await mongoose.connect(process.env.MONGODB_URI);
  const Hotel = mongoose.models.Hotel || mongoose.model('Hotel', new mongoose.Schema({}, { strict: false }));

  console.log('Updating images for Gwalior and other remaining domestic hotels...');
  let updatedCount = 0;

  for (const [name, imgUrl] of Object.entries(hotelPhotoMap)) {
    const res = await Hotel.updateMany(
      { name: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i') },
      { $set: { image: imgUrl } }
    );
    if (res.modifiedCount > 0) {
      updatedCount += res.modifiedCount;
      console.log(`✅ [UPDATED] ${name} (${res.modifiedCount} matches)`);
    } else {
      console.log(`⚠️  [NOT FOUND] ${name}`);
    }
  }

  console.log(`\n🎉 Total domestic hotels updated: ${updatedCount}`);

  // Specifically check Gwalior
  const gwaliorHotels = await Hotel.find({ city: /gwalior/i }).lean();
  console.log('\n=== GWALIOR HOTELS STATUS ===');
  gwaliorHotels.forEach(h => {
    console.log(`🏨 ${h.name} -> ${h.image}`);
  });

  await mongoose.disconnect();
}

updateRemainingImages().catch(console.error);
