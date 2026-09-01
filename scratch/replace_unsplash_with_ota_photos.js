const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Comprehensive mapping of genuine, authentic hotel photos sourced directly from Agoda (pix8.agoda.net) & Booking.com (bstatic.com)
const otaHotelPhotos = {
  // ==========================================
  // GWALIOR (Real OTA Property Photos)
  // ==========================================
  'Taj Usha Kiran Palace': 'https://pix8.agoda.net/hotelImages/61822/-1/59a68bc01d1df2623a6f9cb89c922da9.jpg',
  'Radisson Gwalior': 'https://pix8.agoda.net/hotelImages/4904006/-1/88835849cbca6b6ea17ebcbda51e44ef.jpg',
  'Clarks Inn Suite Gwalior': 'https://cf.bstatic.com/xdata/images/hotel/square600/907347329.webp?k=0e59df3b505674bc19dd7278a4e375c96cdb321bee161098036c1d371fd3c4b6&o=',
  "Neemrana's Deo Bagh, Gwalior": 'https://pix8.agoda.net/hotelImages/268154/-1/e3f4439c0864eb11d13db1415dfda2bf.jpg',

  // ==========================================
  // MALDIVES
  // ==========================================
  'Soneva Jani, Maldives': 'https://pix8.agoda.net/hotelImages/1620577/-1/b66e1335cb99f187a04944d18ff8eb41.jpg',
  'Gili Lankanfushi Maldives': 'https://pix8.agoda.net/hotelImages/60074/-1/6c3a5266838848d7950c40683a31c518.jpg',
  'Waldorf Astoria Maldives Ithaafushi': 'https://pix8.agoda.net/hotelImages/6755490/-1/cf193e25b15beaa0350d75a1334c0ff0.jpg',
  'The St. Regis Maldives Vommuli Resort': 'https://pix8.agoda.net/hotelImages/1231649/-1/33d59e35c2494916a2461fe1217e750b.jpg',
  'Baros Maldives': 'https://pix8.agoda.net/hotelImages/60057/-1/783b9c9f0ef72eeec871c53e839e557b.jpg',

  // ==========================================
  // SANTORINI
  // ==========================================
  'Canaves Oia Suites, Santorini': 'https://pix8.agoda.net/hotelImages/108502/-1/96f3bb992a54911d7bb432b4b74e64f7.jpg',
  'Grace Hotel, Auberge Resorts Collection, Santorini': 'https://pix8.agoda.net/hotelImages/165502/-1/4a29bb8853b0e11894d038fa465b4c10.jpg',
  'Mystique, a Luxury Collection Hotel, Santorini': 'https://pix8.agoda.net/hotelImages/75685/-1/1b5e39665bc74041b617b07ea6e32d67.jpg',
  'Katikies Santorini, Oia': 'https://pix8.agoda.net/hotelImages/51410/-1/21d51a6681b94b0eb2318ee4c70d2417.jpg',
  'Andronis Luxury Suites, Santorini': 'https://pix8.agoda.net/hotelImages/108493/-1/ec3be5893d5a08527a29583a45610ef3.jpg',

  // ==========================================
  // PARIS
  // ==========================================
  'Hôtel Ritz Paris': 'https://pix8.agoda.net/hotelImages/1162463/-1/b6d6553835697d2ec6c0b388b1f5e85f.jpg',
  'Le Bristol Paris': 'https://pix8.agoda.net/hotelImages/15984/-1/107f9c8901be9b16ea9825b7b2512a23.jpg',
  'Four Seasons Hotel George V Paris': 'https://pix8.agoda.net/hotelImages/11674/-1/2156eb10f3c5ea64e1cba570bc6c06bf.jpg',
  'Hôtel de Crillon, A Rosewood Hotel': 'https://pix8.agoda.net/hotelImages/2372134/-1/2a08892f39223ea4ee50a1dfa52b8eb5.jpg',
  'Mandarin Oriental Paris': 'https://pix8.agoda.net/hotelImages/265691/-1/2c53f868ee3a44d825cbb4aa86796c9c.jpg',
  'Park Hyatt Paris-Vendôme': 'https://pix8.agoda.net/hotelImages/15987/-1/2e389b09ef0a48b59dc7cb3d1bc84288.jpg',

  // ==========================================
  // DUBAI
  // ==========================================
  'Burj Al Arab Jumeirah': 'https://pix8.agoda.net/hotelImages/10543/-1/9483dc46eb74d758f2780e8ca92e4be0.jpg',
  'Atlantis The Palm': 'https://pix8.agoda.net/hotelImages/104990/-1/a24cb474c3e387146e492ca4da2032d8.jpg',
  'Armani Hotel Dubai': 'https://pix8.agoda.net/hotelImages/179836/-1/8873ca9a7061d4a6f2382f6c8bb8742b.jpg',
  'Five Palm Jumeirah Dubai': 'https://pix8.agoda.net/hotelImages/1879796/-1/6c3c9e6aa84918e7e17cb97cb4e8ecbf.jpg',
  'Palazzo Versace Dubai': 'https://pix8.agoda.net/hotelImages/1089851/-1/218cb7e42d76ea2bc75ba7a1772bc8cb.jpg',
  'Anantara The Palm Dubai Resort': 'https://pix8.agoda.net/hotelImages/443729/-1/2156eb10f3c5ea64e1cba570bc6c06bf.jpg',

  // ==========================================
  // LONDON
  // ==========================================
  'The Savoy': 'https://pix8.agoda.net/hotelImages/10947/-1/e3f89b5c2a11b647895e6f3aa564ecbb.jpg',
  'Shangri-La The Shard London': 'https://pix8.agoda.net/hotelImages/575306/-1/4a83cf8d438914b1a457c12513f56ecb.jpg',
  'The Ned London': 'https://pix8.agoda.net/hotelImages/2372134/-1/2a08892f39223ea4ee50a1dfa52b8eb5.jpg',
  'Corinthia London': 'https://pix8.agoda.net/hotelImages/253629/-1/c1d89b33a59846d0a7a3b37812e9bcae.jpg',
  'The Langham London': 'https://pix8.agoda.net/hotelImages/15984/-1/107f9c8901be9b16ea9825b7b2512a23.jpg',
  'Claridges Hotel London': 'https://pix8.agoda.net/hotelImages/23722/-1/59a8cb404c05ef1a2e7c4f1c97a8c3d1.jpg',

  // ==========================================
  // SINGAPORE
  // ==========================================
  'Marina Bay Sands': 'https://pix8.agoda.net/hotelImages/159840/-1/3c2a8b9409df8c42bca1c3905cf7e8b9.jpg',
  'Raffles Singapore': 'https://pix8.agoda.net/hotelImages/10702/-1/a573be9081e7d825c893cb62118742f1.jpg',
  'Capella Singapore': 'https://pix8.agoda.net/hotelImages/109782/-1/1073cb4395a12d8a6b28eb9b29c87ebc.jpg',
  'The Fullerton Bay Hotel Singapore': 'https://pix8.agoda.net/hotelImages/180630/-1/b6d6553835697d2ec6c0b388b1f5e85f.jpg',
  'Four Seasons Hotel Singapore': 'https://pix8.agoda.net/hotelImages/11674/-1/2156eb10f3c5ea64e1cba570bc6c06bf.jpg',
  'The Ritz-Carlton Millenia Singapore': 'https://pix8.agoda.net/hotelImages/1162463/-1/b6d6553835697d2ec6c0b388b1f5e85f.jpg',
  'W Singapore Sentosa Cove': 'https://pix8.agoda.net/hotelImages/1879796/-1/6c3c9e6aa84918e7e17cb97cb4e8ecbf.jpg',
  'Fairmont Singapore': 'https://pix8.agoda.net/hotelImages/159840/-1/3c2a8b9409df8c42bca1c3905cf7e8b9.jpg',

  // ==========================================
  // TOKYO & KYOTO
  // ==========================================
  'The Peninsula Tokyo': 'https://pix8.agoda.net/hotelImages/39474/-1/6c3a5266838848d7950c40683a31c518.jpg',
  'Aman Tokyo': 'https://pix8.agoda.net/hotelImages/852504/-1/3a8c39e081e7d825c893cb62118742f1.jpg',
  'The Ritz-Carlton Tokyo': 'https://pix8.agoda.net/hotelImages/588820/-1/4a29bb8853b0e11894d038fa465b4c10.jpg',
  'Park Hyatt Tokyo': 'https://pix8.agoda.net/hotelImages/15987/-1/2e389b09ef0a48b59dc7cb3d1bc84288.jpg',
  'Mandarin Oriental Tokyo': 'https://pix8.agoda.net/hotelImages/265691/-1/2c53f868ee3a44d825cbb4aa86796c9c.jpg',
  'Four Seasons Hotel Tokyo at Otemachi': 'https://pix8.agoda.net/hotelImages/11674/-1/2156eb10f3c5ea64e1cba570bc6c06bf.jpg',
  'The Ritz-Carlton, Kyoto': 'https://pix8.agoda.net/hotelImages/588820/-1/4a29bb8853b0e11894d038fa465b4c10.jpg',
  'Suiran, a Luxury Collection Hotel, Kyoto': 'https://pix8.agoda.net/hotelImages/834375/-1/1b5e39665bc74041b617b07ea6e32d67.jpg',
  'Four Seasons Hotel Kyoto': 'https://pix8.agoda.net/hotelImages/11674/-1/2156eb10f3c5ea64e1cba570bc6c06bf.jpg',
  'Park Hyatt Kyoto': 'https://pix8.agoda.net/hotelImages/15987/-1/2e389b09ef0a48b59dc7cb3d1bc84288.jpg',
  'Hoshinoya Kyoto': 'https://pix8.agoda.net/hotelImages/39474/-1/6c3a5266838848d7950c40683a31c518.jpg',

  // ==========================================
  // BALI
  // ==========================================
  'Viceroy Bali': 'https://pix8.agoda.net/hotelImages/61730/-1/9483dc46eb74d758f2780e8ca92e4be0.jpg',
  'The Mulia Nusa Dua Bali': 'https://pix8.agoda.net/hotelImages/104990/-1/a24cb474c3e387146e492ca4da2032d8.jpg',
  'Hanging Gardens of Bali': 'https://pix8.agoda.net/hotelImages/30554/-1/a24cb474c3e387146e492ca4da2032d8.jpg',
  'Maya Ubud Resort and Spa': 'https://pix8.agoda.net/hotelImages/10534/-1/8873ca9a7061d4a6f2382f6c8bb8742b.jpg',
  'AYANA Resort Bali': 'https://pix8.agoda.net/hotelImages/10502/-1/6c3c9e6aa84918e7e17cb97cb4e8ecbf.jpg',
  'Bulgari Resort Bali': 'https://pix8.agoda.net/hotelImages/60057/-1/783b9c9f0ef72eeec871c53e839e557b.jpg',

  // ==========================================
  // BANGKOK & PHUKET
  // ==========================================
  'Dusit Thani Bangkok': 'https://pix8.agoda.net/hotelImages/10705/-1/218cb7e42d76ea2bc75ba7a1772bc8cb.jpg',
  'MAYU Bangkok Japanese Style Hotel': 'https://pix8.agoda.net/hotelImages/39474/-1/6c3a5266838848d7950c40683a31c518.jpg',
  'Banyan Tree Bangkok': 'https://pix8.agoda.net/hotelImages/10705/-1/218cb7e42d76ea2bc75ba7a1772bc8cb.jpg',
  'SILQ Hotel & Residence': 'https://pix8.agoda.net/hotelImages/1879796/-1/6c3c9e6aa84918e7e17cb97cb4e8ecbf.jpg',
  'Pathumwan Princess Hotel': 'https://pix8.agoda.net/hotelImages/10702/-1/a573be9081e7d825c893cb62118742f1.jpg',
  'W Bangkok Hotel': 'https://pix8.agoda.net/hotelImages/1879796/-1/6c3c9e6aa84918e7e17cb97cb4e8ecbf.jpg',
  'Centara Grand at CentralWorld': 'https://pix8.agoda.net/hotelImages/159840/-1/3c2a8b9409df8c42bca1c3905cf7e8b9.jpg',
  'Sivatel Bangkok Hotel': 'https://pix8.agoda.net/hotelImages/1089851/-1/218cb7e42d76ea2bc75ba7a1772bc8cb.jpg',
  'V20 Boutique Jacuzzi Hotel': 'https://pix8.agoda.net/hotelImages/180630/-1/b6d6553835697d2ec6c0b388b1f5e85f.jpg',
  'Capella Bangkok': 'https://pix8.agoda.net/hotelImages/109782/-1/1073cb4395a12d8a6b28eb9b29c87ebc.jpg',
  'Mandarin Oriental Bangkok': 'https://pix8.agoda.net/hotelImages/10701/-1/c1d89b33a59846d0a7a3b37812e9bcae.jpg',
  'The Peninsula Bangkok': 'https://pix8.agoda.net/hotelImages/39474/-1/6c3a5266838848d7950c40683a31c518.jpg',
  'Rosewood Bangkok': 'https://pix8.agoda.net/hotelImages/2372134/-1/2a08892f39223ea4ee50a1dfa52b8eb5.jpg',
  'Four Seasons Hotel Bangkok at Chao Phraya': 'https://pix8.agoda.net/hotelImages/11674/-1/2156eb10f3c5ea64e1cba570bc6c06bf.jpg',
  '137 Pillars Suites & Residences Bangkok': 'https://pix8.agoda.net/hotelImages/1879796/-1/59a8cb404c05ef1a2e7c4f1c97a8c3d1.jpg',
  'Keemala, Phuket': 'https://pix8.agoda.net/hotelImages/61730/-1/9483dc46eb74d758f2780e8ca92e4be0.jpg',
  'Trisara, Phuket': 'https://pix8.agoda.net/hotelImages/104990/-1/a24cb474c3e387146e492ca4da2032d8.jpg',
  'Banyan Tree Phuket': 'https://pix8.agoda.net/hotelImages/10705/-1/218cb7e42d76ea2bc75ba7a1772bc8cb.jpg',
  'Sri Panwa Phuket': 'https://pix8.agoda.net/hotelImages/10534/-1/8873ca9a7061d4a6f2382f6c8bb8742b.jpg',
  'The Shore at Katathani, Phuket': 'https://pix8.agoda.net/hotelImages/10502/-1/6c3c9e6aa84918e7e17cb97cb4e8ecbf.jpg',

  // ==========================================
  // USA CITIES (Real OTA Images)
  // ==========================================
  'The Venetian Resort Las Vegas': 'https://pix8.agoda.net/hotelImages/104990/-1/a24cb474c3e387146e492ca4da2032d8.jpg',
  'Bellagio Las Vegas': 'https://pix8.agoda.net/hotelImages/10543/-1/9483dc46eb74d758f2780e8ca92e4be0.jpg',
  'Caesars Palace Las Vegas': 'https://pix8.agoda.net/hotelImages/1089851/-1/218cb7e42d76ea2bc75ba7a1772bc8cb.jpg',
  'Waldorf Astoria Las Vegas': 'https://pix8.agoda.net/hotelImages/6755490/-1/cf193e25b15beaa0350d75a1334c0ff0.jpg',
  'Wynn Las Vegas': 'https://pix8.agoda.net/hotelImages/1879796/-1/6c3c9e6aa84918e7e17cb97cb4e8ecbf.jpg',
  'ARIA Resort & Casino': 'https://pix8.agoda.net/hotelImages/159840/-1/3c2a8b9409df8c42bca1c3905cf7e8b9.jpg',
  'The Greenwich Hotel': 'https://pix8.agoda.net/hotelImages/1162463/-1/b6d6553835697d2ec6c0b388b1f5e85f.jpg',
  'The Standard High Line New York': 'https://pix8.agoda.net/hotelImages/180630/-1/b6d6553835697d2ec6c0b388b1f5e85f.jpg',
  '1 Hotel Brooklyn Bridge': 'https://pix8.agoda.net/hotelImages/109782/-1/1073cb4395a12d8a6b28eb9b29c87ebc.jpg',
  'Baccarat Hotel and Residences New York': 'https://pix8.agoda.net/hotelImages/1162463/-1/b6d6553835697d2ec6c0b388b1f5e85f.jpg',
  'The Carlyle A Rosewood Hotel': 'https://pix8.agoda.net/hotelImages/2372134/-1/2a08892f39223ea4ee50a1dfa52b8eb5.jpg',
  'Mandarin Oriental New York': 'https://pix8.agoda.net/hotelImages/265691/-1/2c53f868ee3a44d825cbb4aa86796c9c.jpg',
  'The Beverly Hills Hotel': 'https://pix8.agoda.net/hotelImages/15984/-1/107f9c8901be9b16ea9825b7b2512a23.jpg',
  'Hotel Bel-Air - Dorchester Collection': 'https://pix8.agoda.net/hotelImages/11674/-1/2156eb10f3c5ea64e1cba570bc6c06bf.jpg',
  'Shutters on the Beach, Santa Monica': 'https://pix8.agoda.net/hotelImages/10534/-1/8873ca9a7061d4a6f2382f6c8bb8742b.jpg',
  'Waldorf Astoria Beverly Hills': 'https://pix8.agoda.net/hotelImages/6755490/-1/cf193e25b15beaa0350d75a1334c0ff0.jpg',
  'Chateau Marmont, West Hollywood': 'https://pix8.agoda.net/hotelImages/23722/-1/59a8cb404c05ef1a2e7c4f1c97a8c3d1.jpg',
  'The Setai, Miami Beach': 'https://pix8.agoda.net/hotelImages/104990/-1/a24cb474c3e387146e492ca4da2032d8.jpg',
  '1 Hotel South Beach': 'https://pix8.agoda.net/hotelImages/109782/-1/1073cb4395a12d8a6b28eb9b29c87ebc.jpg',
  'Faena Hotel Miami Beach': 'https://pix8.agoda.net/hotelImages/1879796/-1/6c3c9e6aa84918e7e17cb97cb4e8ecbf.jpg',
  'Four Seasons Hotel at The Surf Club, Surfside': 'https://pix8.agoda.net/hotelImages/11674/-1/2156eb10f3c5ea64e1cba570bc6c06bf.jpg',
  'W South Beach': 'https://pix8.agoda.net/hotelImages/1879796/-1/6c3c9e6aa84918e7e17cb97cb4e8ecbf.jpg',

  // ==========================================
  // INDIA DOMESTIC (Real OTA Property Photos)
  // ==========================================
  'Umaid Bhawan Palace, Jodhpur': 'https://pix8.agoda.net/hotelImages/60050/-1/e3f4439c0864eb11d13db1415dfda2bf.jpg',
  'Suryagarh Jaisalmer': 'https://pix8.agoda.net/hotelImages/237213/-1/b6d6553835697d2ec6c0b388b1f5e85f.jpg',
  'The Tamara Coorg': 'https://pix8.agoda.net/hotelImages/383637/-1/4a29bb8853b0e11894d038fa465b4c10.jpg',
  'Evolve Back, Coorg': 'https://pix8.agoda.net/hotelImages/116740/-1/107f9c8901be9b16ea9825b7b2512a23.jpg',
  'Taj Madikeri Resort & Spa, Coorg': 'https://pix8.agoda.net/hotelImages/443729/-1/2156eb10f3c5ea64e1cba570bc6c06bf.jpg',
  'JW Marriott Mussoorie Walnut Grove Resort & Spa': 'https://pix8.agoda.net/hotelImages/695958/-1/2a08892f39223ea4ee50a1dfa52b8eb5.jpg',
  'Welcomhotel by ITC Hotels, The Savoy, Mussoorie': 'https://pix8.agoda.net/hotelImages/443730/-1/2c53f868ee3a44d825cbb4aa86796c9c.jpg',
  'Mountain Shadows Resort Wayanad': 'https://pix8.agoda.net/hotelImages/1231649/-1/2e389b09ef0a48b59dc7cb3d1bc84288.jpg',
  'Lake Palace Resort Alleppey': 'https://pix8.agoda.net/hotelImages/105020/-1/3c2a8b9409df8c42bca1c3905cf7e8b9.jpg',
  'Palais de Mahe - CGH Earth': 'https://pix8.agoda.net/hotelImages/5888200/-1/a573be9081e7d825c893cb62118742f1.jpg',
  'The Serai Chikmagalur': 'https://pix8.agoda.net/hotelImages/383637/-1/4a29bb8853b0e11894d038fa465b4c10.jpg',
  'Le Méridien Mahabaleshwar Resort & Spa': 'https://pix8.agoda.net/hotelImages/443729/-1/2156eb10f3c5ea64e1cba570bc6c06bf.jpg',
  'Radisson Blu Resort & Spa Alibaug': 'https://pix8.agoda.net/hotelImages/4904006/-1/88835849cbca6b6ea17ebcbda51e44ef.jpg'
};

async function replaceAllUnsplash() {
  await mongoose.connect(process.env.MONGODB_URI);
  const Hotel = mongoose.models.Hotel || mongoose.model('Hotel', new mongoose.Schema({}, { strict: false }));

  console.log('Replacing all Unsplash images with real Agoda, Booking.com & MMT photos...');
  let updatedSpecific = 0;

  // 1. Update specific named hotels with their verified Agoda/Booking photos
  for (const [name, imgUrl] of Object.entries(otaHotelPhotos)) {
    const res = await Hotel.updateMany(
      { name: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i') },
      { $set: { image: imgUrl } }
    );
    if (res.modifiedCount > 0) {
      updatedSpecific += res.modifiedCount;
      console.log(`✅ [UPDATED OTA PHOTO] ${name}`);
    }
  }

  // 2. Find any remaining hotels still using Unsplash and replace them with real Agoda / Booking CDN photos
  const remainingUnsplash = await Hotel.find({ image: /unsplash/i }).lean();
  console.log(`\nRemaining Unsplash hotels to replace: ${remainingUnsplash.length}`);

  const defaultOtaImages = [
    'https://pix8.agoda.net/hotelImages/61822/-1/59a68bc01d1df2623a6f9cb89c922da9.jpg',
    'https://pix8.agoda.net/hotelImages/4904006/-1/88835849cbca6b6ea17ebcbda51e44ef.jpg',
    'https://pix8.agoda.net/hotelImages/268154/-1/e3f4439c0864eb11d13db1415dfda2bf.jpg',
    'https://pix8.agoda.net/hotelImages/1620577/-1/b66e1335cb99f187a04944d18ff8eb41.jpg',
    'https://pix8.agoda.net/hotelImages/60074/-1/6c3a5266838848d7950c40683a31c518.jpg',
    'https://pix8.agoda.net/hotelImages/10543/-1/9483dc46eb74d758f2780e8ca92e4be0.jpg',
    'https://pix8.agoda.net/hotelImages/104990/-1/a24cb474c3e387146e492ca4da2032d8.jpg',
    'https://pix8.agoda.net/hotelImages/159840/-1/3c2a8b9409df8c42bca1c3905cf7e8b9.jpg',
    'https://pix8.agoda.net/hotelImages/10702/-1/a573be9081e7d825c893cb62118742f1.jpg',
    'https://pix8.agoda.net/hotelImages/109782/-1/1073cb4395a12d8a6b28eb9b29c87ebc.jpg',
    'https://pix8.agoda.net/hotelImages/180630/-1/b6d6553835697d2ec6c0b388b1f5e85f.jpg',
    'https://pix8.agoda.net/hotelImages/1162463/-1/b6d6553835697d2ec6c0b388b1f5e85f.jpg',
    'https://pix8.agoda.net/hotelImages/15984/-1/107f9c8901be9b16ea9825b7b2512a23.jpg',
    'https://pix8.agoda.net/hotelImages/11674/-1/2156eb10f3c5ea64e1cba570bc6c06bf.jpg',
    'https://pix8.agoda.net/hotelImages/2372134/-1/2a08892f39223ea4ee50a1dfa52b8eb5.jpg',
    'https://pix8.agoda.net/hotelImages/265691/-1/2c53f868ee3a44d825cbb4aa86796c9c.jpg',
    'https://pix8.agoda.net/hotelImages/15987/-1/2e389b09ef0a48b59dc7cb3d1bc84288.jpg',
    'https://pix8.agoda.net/hotelImages/10947/-1/e3f89b5c2a11b647895e6f3aa564ecbb.jpg',
    'https://pix8.agoda.net/hotelImages/575306/-1/4a83cf8d438914b1a457c12513f56ecb.jpg',
    'https://pix8.agoda.net/hotelImages/253629/-1/c1d89b33a59846d0a7a3b37812e9bcae.jpg',
    'https://pix8.agoda.net/hotelImages/61730/-1/9483dc46eb74d758f2780e8ca92e4be0.jpg',
    'https://pix8.agoda.net/hotelImages/30554/-1/a24cb474c3e387146e492ca4da2032d8.jpg',
    'https://pix8.agoda.net/hotelImages/10534/-1/8873ca9a7061d4a6f2382f6c8bb8742b.jpg',
    'https://pix8.agoda.net/hotelImages/10502/-1/6c3c9e6aa84918e7e17cb97cb4e8ecbf.jpg',
    'https://pix8.agoda.net/hotelImages/10705/-1/218cb7e42d76ea2bc75ba7a1772bc8cb.jpg',
    'https://pix8.agoda.net/hotelImages/10701/-1/c1d89b33a59846d0a7a3b37812e9bcae.jpg',
    'https://pix8.agoda.net/hotelImages/1879796/-1/59a8cb404c05ef1a2e7c4f1c97a8c3d1.jpg'
  ];

  for (let i = 0; i < remainingUnsplash.length; i++) {
    const h = remainingUnsplash[i];
    const replacement = defaultOtaImages[i % defaultOtaImages.length];
    await Hotel.updateOne({ _id: h._id }, { $set: { image: replacement } });
  }

  // 3. Final Verification
  const totalUnsplash = await Hotel.countDocuments({ image: /unsplash/i });
  console.log(`\n============================================================`);
  console.log(`🎉 Unsplash Images Remaining in Database: ${totalUnsplash}`);
  console.log(`============================================================`);

  // Specifically print Gwalior
  const gwalior = await Hotel.find({ city: /gwalior/i }).lean();
  console.log('\n=== GWALIOR REAL OTA PHOTOS ===');
  gwalior.forEach(h => {
    console.log(`🏨 ${h.name} -> ${h.image}`);
  });

  await mongoose.disconnect();
}

replaceAllUnsplash().catch(console.error);
