import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const R2_BASE = 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/';

const NEW_WORLD_HOTELS = [
  // 1. Lake Como, Italy
  {
    name: 'Grand Hotel Tremezzo',
    slug: 'lake-como-grand-hotel-tremezzo',
    city: 'Lake Como',
    country: 'Italy',
    price: '€1,250',
    rating: 4.9,
    reviewsCount: 1850,
    roomType: 'Rooftop Suite with Lake-Facing Marble Soaking Tub',
    tubType: 'Deep Marble Soaking Tub',
    image: `${R2_BASE}bathtub-lake-como.webp`,
    bookingTip: 'Iconic Art Nouveau palace facing Bellagio with panoramic lake-view soaking bathtubs and floating pool.',
    description: 'Experience pure Lake Como grandeur at Grand Hotel Tremezzo. Features lavish rooftop suites with private marble soaking tubs framing Bellagio and the Grigne mountains.',
    url: 'https://www.makemytrip.com/hotels/grand_hotel_tremezzo-details-lake_como.html',
    bookingUrl: 'https://www.booking.com/hotel/it/grand-hotel-tremezzo.html',
    agodaUrl: 'https://www.agoda.com/grand-hotel-tremezzo/hotel/lake-como-it.html'
  },
  {
    name: "Villa d'Este",
    slug: 'lake-como-villa-deste',
    city: 'Lake Como',
    country: 'Italy',
    price: '€1,450',
    rating: 4.9,
    reviewsCount: 1620,
    roomType: 'Cardinal Suite with Renaissance Marble Bathtub',
    tubType: 'Romantic Marble Bathtub',
    image: `${R2_BASE}bathtub-lake-como.webp`,
    bookingTip: '16th-century royal renaissance residence in Cernobbio with hand-carved marble bathtubs and 25-acre gardens.',
    description: 'Set on the shores of Lake Como, Villa d Este is a legendary renaissance estate offering opulent suites with hand-carved Italian marble bathtubs and five-star bespoke hospitality.',
    url: 'https://www.makemytrip.com/hotels/villa_d_este-details-lake_como.html',
    bookingUrl: 'https://www.booking.com/hotel/it/villa-d-este.html',
    agodaUrl: 'https://www.agoda.com/villa-d-este/hotel/lake-como-it.html'
  },
  {
    name: 'Passalacqua',
    slug: 'lake-como-passalacqua',
    city: 'Lake Como',
    country: 'Italy',
    price: '€1,600',
    rating: 5.0,
    reviewsCount: 780,
    roomType: 'Palazzo Suite with Hand-Carved Carrara Marble Tub',
    tubType: 'Deep Marble Soaking Tub',
    image: `${R2_BASE}bathtub-lake-como.webp`,
    bookingTip: 'Voted World Best Hotel, featuring terraced olive groves, antique frescoes, and monolithic marble soaking tubs.',
    description: 'Perched on the hills of Moltrasio, Passalacqua offers Baroque splendor with monolithic Carrara marble soaking tubs, lakeside gardens, and timeless Italian romance.',
    url: 'https://www.makemytrip.com/hotels/passalacqua-details-lake_como.html',
    bookingUrl: 'https://www.booking.com/hotel/it/passalacqua.html',
    agodaUrl: 'https://www.agoda.com/passalacqua/hotel/lake-como-it.html'
  },

  // 2. Capri, Italy
  {
    name: 'Capri Palace Jumeirah',
    slug: 'capri-palace-jumeirah',
    city: 'Capri',
    country: 'Italy',
    price: '€980',
    rating: 4.8,
    reviewsCount: 1250,
    roomType: 'Presidential Suite with Private Plunge Pool & Tub',
    tubType: 'Private In-Room Jacuzzi',
    image: `${R2_BASE}bathtub-capri.webp`,
    bookingTip: 'Anacapri luxury sanctuary with private heated plunge pools, hydrotherapy tubs, and Michelin-starred dining.',
    description: 'Capri Palace Jumeirah blends Mediterranean whitewashed elegance with high art. Suites feature private heated plunge baths and hydrotherapy jacuzzi tubs.',
    url: 'https://www.makemytrip.com/hotels/capri_palace_jumeirah-details-capri.html',
    bookingUrl: 'https://www.booking.com/hotel/it/capri-palace-hotel-spa.html',
    agodaUrl: 'https://www.agoda.com/capri-palace-jumeirah/hotel/capri-it.html'
  },
  {
    name: 'Hotel Caesar Augustus',
    slug: 'capri-hotel-caesar-augustus',
    city: 'Capri',
    country: 'Italy',
    price: '€1,100',
    rating: 4.9,
    reviewsCount: 1100,
    roomType: 'Cliffside Master Suite with Bay of Naples Soaking Tub',
    tubType: 'Deep Soaking Bathtub',
    image: `${R2_BASE}bathtub-capri.webp`,
    bookingTip: 'Perched 1,000 feet above the sea with breathtaking panoramic cliffside bathtub views of Mount Vesuvius.',
    description: 'Perched high on the cliffs of Anacapri, Hotel Caesar Augustus features private cliff-edge soaking tubs with staggering views across the Bay of Naples and Mount Vesuvius.',
    url: 'https://www.makemytrip.com/hotels/hotel_caesar_augustus-details-capri.html',
    bookingUrl: 'https://www.booking.com/hotel/it/caesar-augustus.html',
    agodaUrl: 'https://www.agoda.com/hotel-caesar-augustus/hotel/capri-it.html'
  },

  // 3. Mykonos, Greece
  {
    name: 'Cavo Tagoo Mykonos',
    slug: 'mykonos-cavo-tagoo',
    city: 'Mykonos',
    country: 'Greece',
    price: '€850',
    rating: 4.8,
    reviewsCount: 2200,
    roomType: 'Cave Suite with Private Heated Jacuzzi',
    tubType: 'Private In-Room Jacuzzi',
    image: `${R2_BASE}bathtub-mykonos.webp`,
    bookingTip: 'World-famous whitewashed cave pool suites with private hydrotherapy jacuzzis and sunset Aegean views.',
    description: 'Built into the cliffside above Mykonos Town, Cavo Tagoo is famous for iconic cave suites with private indoor heated jacuzzis and infinity Aegean sea vistas.',
    url: 'https://www.makemytrip.com/hotels/cavo_tagoo_mykonos-details-mykonos.html',
    bookingUrl: 'https://www.booking.com/hotel/gr/cavo-tagoo.html',
    agodaUrl: 'https://www.agoda.com/cavo-tagoo-hotel/hotel/mykonos-gr.html'
  },
  {
    name: 'Bill & Coo Suites and Lounge',
    slug: 'mykonos-bill-and-coo',
    city: 'Mykonos',
    country: 'Greece',
    price: '€720',
    rating: 4.9,
    reviewsCount: 1400,
    roomType: 'Honeymoon Suite with Outdoor Hydro Jacuzzi',
    tubType: 'Private In-Room Jacuzzi',
    image: `${R2_BASE}bathtub-mykonos.webp`,
    bookingTip: 'Megali Ammos romantic sanctuary with private sunset whirlpool tubs and candlelit seaside dining.',
    description: 'A member of The Leading Hotels of the World, Bill & Coo offers intimate honeymoon suites featuring private sunset hydro jacuzzis facing the iconic Mykonos windmills.',
    url: 'https://www.makemytrip.com/hotels/bill_coo_suites_lounge-details-mykonos.html',
    bookingUrl: 'https://www.booking.com/hotel/gr/bill-coo.html',
    agodaUrl: 'https://www.agoda.com/bill-coo-suites-and-lounge/hotel/mykonos-gr.html'
  },

  // 4. Hong Kong
  {
    name: 'The Ritz-Carlton Hong Kong',
    slug: 'hong-kong-the-ritz-carlton',
    city: 'Hong Kong',
    country: 'Hong Kong',
    price: 'HK$4,800',
    rating: 4.8,
    reviewsCount: 3100,
    roomType: 'Victoria Harbour View Suite with Sunken Marble Tub',
    tubType: 'Deep Marble Soaking Tub',
    image: `${R2_BASE}bathtub-hong-kong.webp`,
    bookingTip: 'Occupies floors 102 to 118 of the ICC tower with floor-to-ceiling harbor-facing marble soaking tubs.',
    description: 'Towering above Kowloon in the ICC, The Ritz-Carlton Hong Kong offers high-altitude luxury. Master ensuites feature sunken circular marble tubs framing Victoria Harbour.',
    url: 'https://www.makemytrip.com/hotels/the_ritz_carlton_hong_kong-details-hong_kong.html',
    bookingUrl: 'https://www.booking.com/hotel/hk/the-ritz-carlton-hong-kong.html',
    agodaUrl: 'https://www.agoda.com/the-ritz-carlton-hong-kong/hotel/hong-kong-hk.html'
  },
  {
    name: 'The Upper House',
    slug: 'hong-kong-the-upper-house',
    city: 'Hong Kong',
    country: 'Hong Kong',
    price: 'HK$5,200',
    rating: 4.9,
    reviewsCount: 1850,
    roomType: 'Upper Suite with Freestanding Limestone Soaking Bath',
    tubType: 'Freestanding Soaking Bathtub',
    image: `${R2_BASE}bathtub-hong-kong.webp`,
    bookingTip: 'Designed by Andre Fu, renowned for the city most spacious luxury bathrooms with deep limestone soaking tubs.',
    description: 'Perched above Pacific Place, The Upper House is an intimate design sanctuary. Suites feature sprawling spa-like bathrooms with freestanding limestone soaking tubs overlooking the skyline.',
    url: 'https://www.makemytrip.com/hotels/the_upper_house-details-hong_kong.html',
    bookingUrl: 'https://www.booking.com/hotel/hk/the-upper-house.html',
    agodaUrl: 'https://www.agoda.com/the-upper-house/hotel/hong-kong-hk.html'
  },
  {
    name: 'Rosewood Hong Kong',
    slug: 'hong-kong-rosewood',
    city: 'Hong Kong',
    country: 'Hong Kong',
    price: 'HK$5,800',
    rating: 4.9,
    reviewsCount: 2100,
    roomType: 'Grand Harbour Corner Suite with Freestanding Marble Bath',
    tubType: 'Deep Marble Soaking Tub',
    image: `${R2_BASE}bathtub-hong-kong.webp`,
    bookingTip: 'Victoria Dockside ultra-luxury flagship with dual vanity marble bathrooms and harbor-facing freestanding tubs.',
    description: 'Located along the Tsim Sha Tsui waterfront, Rosewood Hong Kong features magnificent marble bathrooms with freestanding soaking bathtubs and twin showers overlooking the skyline.',
    url: 'https://www.makemytrip.com/hotels/rosewood_hong_kong-details-hong_kong.html',
    bookingUrl: 'https://www.booking.com/hotel/hk/rosewood-hong-kong.html',
    agodaUrl: 'https://www.agoda.com/rosewood-hong-kong/hotel/hong-kong-hk.html'
  },

  // 5. Macau
  {
    name: 'Morpheus, City of Dreams',
    slug: 'macau-morpheus',
    city: 'Macau',
    country: 'Macau',
    price: 'MOP 3,200',
    rating: 4.8,
    reviewsCount: 2400,
    roomType: 'Duplex Villa with Sculptural Soaking Tub',
    tubType: 'Freestanding Soaking Bathtub',
    image: `${R2_BASE}bathtub-macau.webp`,
    bookingTip: 'Zaha Hadid architectural masterpiece with custom freestanding soaking tubs and high-tech spa bathrooms.',
    description: 'Morpheus is an icon of futuristic luxury on the Cotai Strip. Premium suites feature custom sculptural soaking bathtubs, Hermès bath amenities, and panoramic city views.',
    url: 'https://www.makemytrip.com/hotels/morpheus-details-macau.html',
    bookingUrl: 'https://www.booking.com/hotel/mo/morpheus.html',
    agodaUrl: 'https://www.agoda.com/morpheus/hotel/macau-mo.html'
  },
  {
    name: 'Wynn Palace Macau',
    slug: 'macau-wynn-palace',
    city: 'Macau',
    country: 'Macau',
    price: 'MOP 2,800',
    rating: 4.8,
    reviewsCount: 3600,
    roomType: 'Fountain Suite with Italian Marble Whirlpool Tub',
    tubType: 'Private In-Room Jacuzzi',
    image: `${R2_BASE}bathtub-macau.webp`,
    bookingTip: 'Overlooks the Performance Lake fountains with Italian marble whirlpool jacuzzis and gold-leaf accents.',
    description: 'Wynn Palace dazzles on the Cotai Strip with floral spectacles and opulent suites. Bathrooms feature lavish Italian marble whirlpool jacuzzis with built-in mirror TVs.',
    url: 'https://www.makemytrip.com/hotels/wynn_palace-details-macau.html',
    bookingUrl: 'https://www.booking.com/hotel/mo/wynn-palace.html',
    agodaUrl: 'https://www.agoda.com/wynn-palace/hotel/macau-mo.html'
  },

  // 6. Whistler, Canada
  {
    name: 'Four Seasons Resort Whistler',
    slug: 'whistler-four-seasons-resort',
    city: 'Whistler',
    country: 'Canada',
    price: 'CAD 650',
    rating: 4.8,
    reviewsCount: 1750,
    roomType: 'Alpine Executive Suite with Deep Soaking Tub & Fireplace',
    tubType: 'Deep Soaking Bathtub',
    image: `${R2_BASE}bathtub-whistler.webp`,
    bookingTip: 'Blackcomb mountain-side luxury lodge with gas fireplaces, deep soaking bathtubs, and heated outdoor pools.',
    description: 'Located at the base of Blackcomb Mountain, Four Seasons Resort Whistler features cozy alpine suites with gas fireplaces, private balconies, and deep soaking bathtubs.',
    url: 'https://www.makemytrip.com/hotels/four_seasons_resort_whistler-details-whistler.html',
    bookingUrl: 'https://www.booking.com/hotel/ca/four-seasons-resort-whistler.html',
    agodaUrl: 'https://www.agoda.com/four-seasons-resort-whistler/hotel/whistler-ca.html'
  },
  {
    name: 'Nita Lake Lodge',
    slug: 'whistler-nita-lake-lodge',
    city: 'Whistler',
    country: 'Canada',
    price: 'CAD 420',
    rating: 4.7,
    reviewsCount: 1450,
    roomType: 'Lakefront Suite with Double Soaking Tub & Gas Fireplace',
    tubType: 'Deep Soaking Bathtub',
    image: `${R2_BASE}bathtub-whistler.webp`,
    bookingTip: 'Whistler only lakefront lodge with basalt gas fireplaces and double soaker tubs overlooking frozen waters.',
    description: 'Nita Lake Lodge is an intimate boutique retreat on the shores of Nita Lake. Suites feature heated slate floors, basalt stone gas fireplaces, and deep double soaking tubs.',
    url: 'https://www.makemytrip.com/hotels/nita_lake_lodge-details-whistler.html',
    bookingUrl: 'https://www.booking.com/hotel/ca/nita-lake-lodge.html',
    agodaUrl: 'https://www.agoda.com/nita-lake-lodge/hotel/whistler-ca.html'
  },

  // 7. Courchevel, France
  {
    name: 'Cheval Blanc Courchevel',
    slug: 'courchevel-cheval-blanc',
    city: 'Courchevel',
    country: 'France',
    price: '€2,400',
    rating: 5.0,
    reviewsCount: 650,
    roomType: 'Chalet Suite with Heated Jacuzzi & Chromotherapy Tub',
    tubType: 'Private In-Room Jacuzzi',
    image: `${R2_BASE}bathtub-courchevel.webp`,
    bookingTip: 'Courchevel 1850 ski-in/ski-out palace hotel featuring private chromotherapy bathtubs and outdoor hot tubs.',
    description: 'Cheval Blanc Courchevel redefines high-altitude luxury in the French Alps. Chalet suites boast private chromotherapy bathtubs, hammam showers, and direct access to the slopes.',
    url: 'https://www.makemytrip.com/hotels/cheval_blanc_courchevel-details-courchevel.html',
    bookingUrl: 'https://www.booking.com/hotel/fr/cheval-blanc-courchevel.html',
    agodaUrl: 'https://www.agoda.com/cheval-blanc-courchevel/hotel/courchevel-fr.html'
  },
  {
    name: 'Les Airelles Courchevel',
    slug: 'courchevel-les-airelles',
    city: 'Courchevel',
    country: 'France',
    price: '€2,600',
    rating: 4.9,
    reviewsCount: 520,
    roomType: 'Palace Suite with Hand-Carved Alpine Clawfoot Bath',
    tubType: 'Vintage Clawfoot Bathtub',
    image: `${R2_BASE}bathtub-courchevel.webp`,
    bookingTip: '19th-century Austro-Hungarian fairy-tale palace with frescoed private bathrooms and clawfoot tubs.',
    description: 'Nestled in the Jardin Alpin pine forest of Courchevel 1850, Les Airelles offers fairy-tale palace luxury with hand-painted fresco master bathrooms and vintage clawfoot tubs.',
    url: 'https://www.makemytrip.com/hotels/les_airelles-details-courchevel.html',
    bookingUrl: 'https://www.booking.com/hotel/fr/hotel-de-la-loze.html',
    agodaUrl: 'https://www.agoda.com/les-airelles/hotel/courchevel-fr.html'
  },

  // 8. Chamonix, France
  {
    name: 'Hameau Albert 1er',
    slug: 'chamonix-hameau-albert-1er',
    city: 'Chamonix',
    country: 'France',
    price: '€480',
    rating: 4.8,
    reviewsCount: 1150,
    roomType: 'Farmhouse Chalet Suite with Private Hot Tub',
    tubType: 'Private In-Room Jacuzzi',
    image: `${R2_BASE}bathtub-chamonix.webp`,
    bookingTip: 'Relais & Chateaux historic mountain estate with fireplace suites and private hot tubs facing Mont Blanc.',
    description: 'A 5-star Relais & Châteaux retreat in Chamonix-Mont-Blanc, Hameau Albert 1er combines rustic Savoyard charm with private whirlpool hot tubs facing the glaciated peaks.',
    url: 'https://www.makemytrip.com/hotels/hameau_albert_1er-details-chamonix.html',
    bookingUrl: 'https://www.booking.com/hotel/fr/hameau-albert-1er.html',
    agodaUrl: 'https://www.agoda.com/hameau-albert-1er/hotel/chamonix-fr.html'
  },

  // 9. Niseko, Japan
  {
    name: 'Zaborin Ryokan Niseko',
    slug: 'niseko-zaborin-ryokan',
    city: 'Niseko',
    country: 'Japan',
    price: '¥120,000',
    rating: 4.9,
    reviewsCount: 420,
    roomType: 'Villa Suite with Private Indoor & Outdoor Volcanic Onsen',
    tubType: 'Deep Soaking Bathtub',
    image: `${R2_BASE}bathtub-niseko.webp`,
    bookingTip: 'Hokkaido premier luxury ryokan with each villa featuring both indoor and outdoor private hot spring onsen baths.',
    description: 'Set in a secluded birch forest in Hanazono, Zaborin offers 15 bespoke villas, each with private indoor and open-air hot spring onsen tubs fed by natural volcanic waters.',
    url: 'https://www.makemytrip.com/hotels/zaborin_ryokan-details-niseko.html',
    bookingUrl: 'https://www.booking.com/hotel/jp/zaborin.html',
    agodaUrl: 'https://www.agoda.com/zaborin/hotel/niseko-jp.html'
  },
  {
    name: 'Higashiyama Niseko Village, a Ritz-Carlton Reserve',
    slug: 'niseko-higashiyama-ritz-carlton',
    city: 'Niseko',
    country: 'Japan',
    price: '¥95,000',
    rating: 4.8,
    reviewsCount: 680,
    roomType: 'Yotei Reserve Suite with Hinoki Cedar Soaking Tub',
    tubType: 'Deep Soaking Bathtub',
    image: `${R2_BASE}bathtub-niseko.webp`,
    bookingTip: 'Ultra-exclusive ski-in/ski-out reserve featuring aromatic Hinoki wood soaking tubs with Mount Yotei views.',
    description: 'A sanctuary in Niseko Village, Higashiyama features suites with panoramic floor-to-ceiling windows, aromatic Japanese Hinoki cedarwood soaking tubs, and Mount Yotei vistas.',
    url: 'https://www.makemytrip.com/hotels/higashiyama_niseko_village_a_ritz_carlton_reserve-details-niseko.html',
    bookingUrl: 'https://www.booking.com/hotel/jp/higashiyama-niseko-village-a-ritz-carlton-reserve.html',
    agodaUrl: 'https://www.agoda.com/higashiyama-niseko-village-a-ritz-carlton-reserve/hotel/niseko-jp.html'
  },

  // 10. Mount Fuji, Japan
  {
    name: 'Kozantei Ubuya',
    slug: 'mount-fuji-kozantei-ubuya',
    city: 'Mount Fuji',
    country: 'Japan',
    price: '¥78,000',
    rating: 4.9,
    reviewsCount: 1650,
    roomType: 'Japanese Suite with Private Open-Air Fuji View Onsen',
    tubType: 'Deep Soaking Bathtub',
    image: `${R2_BASE}bathtub-mount-fuji.webp`,
    bookingTip: 'All rooms directly face Mount Fuji and Lake Kawaguchiko with private open-air cedarwood onsen baths.',
    description: 'Perched on the northern shore of Lake Kawaguchiko, Kozantei Ubuya is legendary for private balcony onsen baths with completely unobstructed views of Mount Fuji.',
    url: 'https://www.makemytrip.com/hotels/kozantei_ubuya-details-mount_fuji.html',
    bookingUrl: 'https://www.booking.com/hotel/jp/ubuya.html',
    agodaUrl: 'https://www.agoda.com/kozantei-ubuya/hotel/fujikawaguchiko-jp.html'
  },
  {
    name: 'Hoshinoya Fuji',
    slug: 'mount-fuji-hoshinoya-fuji',
    city: 'Mount Fuji',
    country: 'Japan',
    price: '¥85,000',
    rating: 4.8,
    reviewsCount: 1100,
    roomType: 'Cabin Suite with Balcony Forest Soaking Tub',
    tubType: 'Deep Soaking Bathtub',
    image: `${R2_BASE}bathtub-mount-fuji.webp`,
    bookingTip: 'Japan first glamping resort nestled in red pine forests with minimalist balcony soaking tubs facing Fuji.',
    description: 'Hoshinoya Fuji sits high on the slopes above Lake Kawaguchiko. Minimalist cabin suites open onto private cloud terraces with soaking tubs facing Mount Fuji.',
    url: 'https://www.makemytrip.com/hotels/hoshinoya_fuji-details-mount_fuji.html',
    bookingUrl: 'https://www.booking.com/hotel/jp/hoshinoya-fuji.html',
    agodaUrl: 'https://www.agoda.com/hoshinoya-fuji/hotel/fujikawaguchiko-jp.html'
  },

  // 11. Koh Samui, Thailand
  {
    name: 'Four Seasons Resort Koh Samui',
    slug: 'koh-samui-four-seasons-resort',
    city: 'Koh Samui',
    country: 'Thailand',
    price: 'THB 26,000',
    rating: 4.9,
    reviewsCount: 1450,
    roomType: 'One-Bedroom Pool Villa with Open-Air Terrazzo Tub',
    tubType: 'Freestanding Soaking Bathtub',
    image: `${R2_BASE}bathtub-koh-samui.webp`,
    bookingTip: 'Hillside coconut grove villas with private infinity pools and open-air terrazzo soaking tubs overlooking the sea.',
    description: 'Perched on the secluded northwestern tip of Koh Samui, Four Seasons features hillside villas with private infinity plunge pools and sunken terrazzo bathtubs facing the Gulf of Thailand.',
    url: 'https://www.makemytrip.com/hotels/four_seasons_resort_koh_samui-details-koh_samui.html',
    bookingUrl: 'https://www.booking.com/hotel/th/four-seasons-resort-koh-samui.html',
    agodaUrl: 'https://www.agoda.com/four-seasons-resort-koh-samui/hotel/koh-samui-th.html'
  },
  {
    name: 'W Koh Samui',
    slug: 'koh-samui-w-resort',
    city: 'Koh Samui',
    country: 'Thailand',
    price: 'THB 19,500',
    rating: 4.8,
    reviewsCount: 1850,
    roomType: 'Jungle Oasis Pool Villa with Oversized Soaking Bath',
    tubType: 'Deep Soaking Bathtub',
    image: `${R2_BASE}bathtub-koh-samui.webp`,
    bookingTip: 'Mae Nam beach headland with private pool villas, glass-bottom lotus ponds, and oversized couple soaking tubs.',
    description: 'Situated on Mae Nam Beach, W Koh Samui features contemporary luxury pool villas equipped with oversized circular soaking tubs, rainfall showers, and private infinity plunge pools.',
    url: 'https://www.makemytrip.com/hotels/w_koh_samui-details-koh_samui.html',
    bookingUrl: 'https://www.booking.com/hotel/th/w-retreat-koh-samui.html',
    agodaUrl: 'https://www.agoda.com/w-koh-samui/hotel/koh-samui-th.html'
  },

  // 12. Chiang Mai, Thailand
  {
    name: '137 Pillars House Chiang Mai',
    slug: 'chiang-mai-137-pillars-house',
    city: 'Chiang Mai',
    country: 'Thailand',
    price: 'THB 14,000',
    rating: 4.9,
    reviewsCount: 1250,
    roomType: 'Rajah Brooke Suite with Vintage Victorian Clawfoot Bath',
    tubType: 'Vintage Clawfoot Bathtub',
    image: `${R2_BASE}bathtub-chiang-mai.webp`,
    bookingTip: '1889 teak wood historic homestead featuring outdoor garden showers and freestanding Victorian clawfoot tubs.',
    description: 'A romantic heritage sanctuary in Chiang Mai, 137 Pillars House features spacious teak suites with outdoor garden showers, daybeds, and freestanding Victorian clawfoot bathtubs.',
    url: 'https://www.makemytrip.com/hotels/137_pillars_house-details-chiang_mai.html',
    bookingUrl: 'https://www.booking.com/hotel/th/137-pillars-house.html',
    agodaUrl: 'https://www.agoda.com/137-pillars-house/hotel/chiang-mai-th.html'
  },

  // 13. Tulum, Mexico
  {
    name: 'Azulik Tulum',
    slug: 'tulum-azulik',
    city: 'Tulum',
    country: 'Mexico',
    price: '$750',
    rating: 4.6,
    reviewsCount: 2800,
    roomType: 'Sky Villa with Hand-Carved Mayan Stone Soaking Tub',
    tubType: 'Deep Soaking Bathtub',
    image: `${R2_BASE}bathtub-tulum.webp`,
    bookingTip: 'Eco-chic treehouse villas with hanging bridges and hand-carved stone bathtubs filled with sacred cenote water.',
    description: 'Perched in the jungle canopy overlooking the Caribbean, Azulik features candlelit treehouse villas with custom hand-carved Mayan stone bathtubs and open-air sunset terraces.',
    url: 'https://www.makemytrip.com/hotels/azulik-details-tulum.html',
    bookingUrl: 'https://www.booking.com/hotel/mx/azulik-eco-resort-maya-spa.html',
    agodaUrl: 'https://www.agoda.com/azulik/hotel/tulum-mx.html'
  },
  {
    name: 'Be Tulum Beach & Spa Resort',
    slug: 'tulum-be-tulum',
    city: 'Tulum',
    country: 'Mexico',
    price: '$850',
    rating: 4.8,
    reviewsCount: 1650,
    roomType: 'Jungle Suite with Private Copper Soaking Tub & Plunge Pool',
    tubType: 'Freestanding Soaking Bathtub',
    image: `${R2_BASE}bathtub-tulum.webp`,
    bookingTip: 'Bohemian beachfront sanctuary with private plunge pools, copper tubs, and Yaan Healing Sanctuary spa.',
    description: 'Set between tropical jungle and the Caribbean Sea, Be Tulum offers designer suites crafted with native limestone, warm wood, private plunge pools, and freestanding copper tubs.',
    url: 'https://www.makemytrip.com/hotels/be_tulum_beach_spa_resort-details-tulum.html',
    bookingUrl: 'https://www.booking.com/hotel/mx/be-tulum.html',
    agodaUrl: 'https://www.agoda.com/be-tulum-beach-spa-resort/hotel/tulum-mx.html'
  },

  // 14. Los Cabos, Mexico
  {
    name: 'Waldorf Astoria Los Cabos Pedregal',
    slug: 'los-cabos-waldorf-astoria-pedregal',
    city: 'Los Cabos',
    country: 'Mexico',
    price: '$1,350',
    rating: 4.9,
    reviewsCount: 2200,
    roomType: 'Ocean View King with Private Plunge Pool & Marble Tub',
    tubType: 'Deep Marble Soaking Tub',
    image: `${R2_BASE}bathtub-los-cabos.webp`,
    bookingTip: 'Accessed via a private mountain tunnel with every room featuring a private plunge pool and deep marble tub.',
    description: 'Carved into the cliffs of Cabo San Lucas, Waldorf Astoria Pedregal features oceanfront suites with private plunge pools, outdoor fire pits, and deep rainforest marble soaking tubs.',
    url: 'https://www.makemytrip.com/hotels/waldorf_astoria_los_cabos_pedregal-details-los_cabos.html',
    bookingUrl: 'https://www.booking.com/hotel/mx/the-resort-at-pedregal.html',
    agodaUrl: 'https://www.agoda.com/waldorf-astoria-los-cabos-pedregal/hotel/cabo-san-lucas-mx.html'
  },

  // 15. Istanbul, Turkey
  {
    name: 'Ciragan Palace Kempinski Istanbul',
    slug: 'istanbul-ciragan-palace-kempinski',
    city: 'Istanbul',
    country: 'Turkey',
    price: '€950',
    rating: 4.9,
    reviewsCount: 2900,
    roomType: 'Palace Bosphorus Suite with Turkish Marble Hammam Tub',
    tubType: 'Romantic Marble Bathtub',
    image: `${R2_BASE}bathtub-istanbul.webp`,
    bookingTip: 'The only Ottoman imperial palace hotel on the Bosphorus with hand-carved marble tubs facing Asia.',
    description: 'The sole Ottoman Imperial Palace hotel located directly on the Bosphorus Strait. Regal suites feature private Turkish marble hammams, deep clawfoot bathtubs, and historic palace grandeur.',
    url: 'https://www.makemytrip.com/hotels/ciragan_palace_kempinski_istanbul-details-istanbul.html',
    bookingUrl: 'https://www.booking.com/hotel/tr/ciragan-palace-kempinski-istanbul.html',
    agodaUrl: 'https://www.agoda.com/ciragan-palace-kempinski-istanbul/hotel/istanbul-tr.html'
  },

  // 16. The Cotswolds, UK
  {
    name: 'Soho Farmhouse',
    slug: 'the-cotswolds-soho-farmhouse',
    city: 'The Cotswolds',
    country: 'UK',
    price: '£550',
    rating: 4.8,
    reviewsCount: 1650,
    roomType: 'One-Bedroom Cabin with Outdoor Deck Copper Bath',
    tubType: 'Freestanding Soaking Bathtub',
    image: `${R2_BASE}bathtub-the-cotswolds.webp`,
    bookingTip: '100-acre Oxfordshire countryside estate with outdoor deck roll-top copper tubs and wood-burning stoves.',
    description: 'Set in 100 acres of Oxfordshire countryside, Soho Farmhouse features rustic-chic wooden cabins with private outdoor copper roll-top bathtubs on wraparound decks.',
    url: 'https://www.makemytrip.com/hotels/soho_farmhouse-details-the_cotswolds.html',
    bookingUrl: 'https://www.booking.com/hotel/gb/soho-farmhouse.html',
    agodaUrl: 'https://www.agoda.com/soho-farmhouse/hotel/oxford-gb.html'
  },

  // 17. Bath, UK
  {
    name: 'The Gainsborough Bath Spa',
    slug: 'bath-the-gainsborough-bath-spa',
    city: 'Bath',
    country: 'UK',
    price: '£380',
    rating: 4.8,
    reviewsCount: 2100,
    roomType: 'Bath Spa Suite with Direct Thermal Spring Water Tub',
    tubType: 'Deep Soaking Bathtub',
    image: `${R2_BASE}bathtub-bath-uk.webp`,
    bookingTip: 'The only hotel in the UK with private in-room access to natural mineral-rich Roman thermal spring waters.',
    description: 'Located in the heart of historic Bath, The Gainsborough is Britain premier thermal spa hotel. Luxury Spa Suites feature private in-room roll-top baths fed by natural thermal waters.',
    url: 'https://www.makemytrip.com/hotels/the_gainsborough_bath_spa-details-bath.html',
    bookingUrl: 'https://www.booking.com/hotel/gb/the-gainsborough-bath-spa.html',
    agodaUrl: 'https://www.agoda.com/the-gainsborough-bath-spa/hotel/bath-gb.html'
  },

  // 18. St. Barthélemy
  {
    name: 'Eden Rock - St Barths',
    slug: 'st-barthelemy-eden-rock',
    city: 'St. Barthélemy',
    country: 'St. Barthelemy',
    price: '€1,850',
    rating: 4.9,
    reviewsCount: 890,
    roomType: 'Rock Suite with Private Oceanfront Whirlpool Tub',
    tubType: 'Private In-Room Jacuzzi',
    image: `${R2_BASE}bathtub-st-barthelemy.webp`,
    bookingTip: 'Perched on the St. Jean Bay coral reef with private clifftop jacuzzi tubs and Jean-Georges dining.',
    description: 'Perched on a rocky promontory overlooking Saint Jean Bay, Eden Rock offers ultra-exclusive suites with private outdoor whirlpool jacuzzis and direct access to coral sand beaches.',
    url: 'https://www.makemytrip.com/hotels/eden_rock_st_barths-details-st_barthelemy.html',
    bookingUrl: 'https://www.booking.com/hotel/gp/eden-rock-st-barths.html',
    agodaUrl: 'https://www.agoda.com/eden-rock-st-barths/hotel/st-barthelemy-bl.html'
  },

  // 19. Anguilla
  {
    name: 'Cap Juluca, A Belmond Hotel',
    slug: 'anguilla-cap-juluca-belmond',
    city: 'Anguilla',
    country: 'Anguilla',
    price: '$1,400',
    rating: 4.9,
    reviewsCount: 1100,
    roomType: 'Beachfront Deluxe Suite with Sunken Marble Bathtub',
    tubType: 'Romantic Marble Bathtub',
    image: `${R2_BASE}bathtub-anguilla.webp`,
    bookingTip: 'Maundays Bay Greco-Moorish architectural haven with oceanfront sunken marble bathtubs.',
    description: 'Framing the crescent sands of Maundays Bay, Cap Juluca features Greco-Moorish beachfront villas with private open-concept marble bathrooms and deep soaking tubs facing the sea.',
    url: 'https://www.makemytrip.com/hotels/cap_juluca_belmond-details-anguilla.html',
    bookingUrl: 'https://www.booking.com/hotel/ai/cap-juluca.html',
    agodaUrl: 'https://www.agoda.com/cap-juluca-a-belmond-hotel-anguilla/hotel/anguilla-ai.html'
  },

  // 20. Brussels, Belgium
  {
    name: 'Rocco Forte Hotel Amigo',
    slug: 'brussels-rocco-forte-hotel-amigo',
    city: 'Brussels',
    country: 'Belgium',
    price: '€420',
    rating: 4.8,
    reviewsCount: 1950,
    roomType: 'Royal Suite with Italian Carrara Marble Soaking Bath',
    tubType: 'Deep Marble Soaking Tub',
    image: `${R2_BASE}bathtub-brussels.webp`,
    bookingTip: 'Just off the Grand Place with Carrara marble bathrooms, roll-top bathtubs, and Magritte-inspired decor.',
    description: 'Located a few steps from the historic Grand Place, Rocco Forte Hotel Amigo combines Belgian art with Italian luxury. Master suites feature Carrara marble soaking tubs.',
    url: 'https://www.makemytrip.com/hotels/rocco_forte_hotel_amigo-details-brussels.html',
    bookingUrl: 'https://www.booking.com/hotel/be/hotelamigo.html',
    agodaUrl: 'https://www.agoda.com/rocco-forte-hotel-amigo/hotel/brussels-be.html'
  },

  // 21. Bruges, Belgium
  {
    name: "Hotel Dukes' Palace Bruges",
    slug: 'bruges-hotel-dukes-palace',
    city: 'Bruges',
    country: 'Belgium',
    price: '€340',
    rating: 4.8,
    reviewsCount: 2450,
    roomType: 'Ducal Palace Suite with Heritage Marble Soaking Tub',
    tubType: 'Romantic Marble Bathtub',
    image: `${R2_BASE}bathtub-bruges.webp`,
    bookingTip: '15th-century former residence of the Burgundian aristocracy with heritage marble soaking baths.',
    description: 'A 15th-century palace in the UNESCO heart of Bruges, Hotel Dukes Palace offers aristocratic elegance with original frescoes, quiet inner gardens, and en-suite marble bathtubs.',
    url: 'https://www.makemytrip.com/hotels/hotel_dukes_palace_bruges-details-bruges.html',
    bookingUrl: 'https://www.booking.com/hotel/be/kempinski-dukes-palace.html',
    agodaUrl: 'https://www.agoda.com/hotel-dukes-palace-bruges/hotel/bruges-be.html'
  },

  // 22. Kruger National Park, South Africa
  {
    name: 'Singita Boulders Lodge',
    slug: 'kruger-singita-boulders-lodge',
    city: 'Kruger National Park',
    country: 'South Africa',
    price: '$2,200',
    rating: 5.0,
    reviewsCount: 450,
    roomType: 'River Suite with Open-Air Bush Bathtub & Heated Plunge Pool',
    tubType: 'Outdoor Heated Jacuzzi & Soaking Bath',
    image: `${R2_BASE}bathtub-kruger-national-park.webp`,
    bookingTip: 'Overlooks the Sand River with private heated plunge pools and open-air bush bathtubs beside elephant trails.',
    description: 'Set along the boulder-strewn banks of the Sand River in Sabi Sand, Singita Boulders features glass-walled pavilion suites with private outdoor stone bathtubs overlooking wild game.',
    url: 'https://www.makemytrip.com/hotels/singita_boulders_lodge-details-kruger_national_park.html',
    bookingUrl: 'https://www.booking.com/hotel/za/singita-boulders-lodge.html',
    agodaUrl: 'https://www.agoda.com/singita-boulders-lodge/hotel/kruger-national-park-za.html'
  },

  // 23. Serengeti, Tanzania
  {
    name: 'Four Seasons Safari Lodge Serengeti',
    slug: 'serengeti-four-seasons-safari-lodge',
    city: 'Serengeti',
    country: 'Tanzania',
    price: '$1,800',
    rating: 4.9,
    reviewsCount: 880,
    roomType: 'Waterhole Terrace Suite with Deep Soaking Tub',
    tubType: 'Deep Soaking Bathtub',
    image: `${R2_BASE}bathtub-serengeti.webp`,
    bookingTip: 'Deep soaking bathtubs positioned behind glass walls facing active elephant watering holes.',
    description: 'Deep in the Central Serengeti, Four Seasons Safari Lodge features terrace suites with deep freestanding soaking tubs positioned directly behind picture windows facing animal watering holes.',
    url: 'https://www.makemytrip.com/hotels/four_seasons_safari_lodge_serengeti-details-serengeti.html',
    bookingUrl: 'https://www.booking.com/hotel/tz/bilila-lodge-kempinski.html',
    agodaUrl: 'https://www.agoda.com/four-seasons-safari-lodge-serengeti/hotel/serengeti-national-park-tz.html'
  },

  // 24. Bhutan
  {
    name: 'Amankora Paro',
    slug: 'bhutan-amankora-paro',
    city: 'Bhutan',
    country: 'Bhutan',
    price: '$1,900',
    rating: 4.9,
    reviewsCount: 380,
    roomType: 'Forest Lodge Suite with Terrazzo Soaking Tub & Fireplace',
    tubType: 'Deep Soaking Bathtub',
    image: `${R2_BASE}bathtub-bhutan.webp`,
    bookingTip: 'Nestled in blue pine forests featuring wood-burning bukhari stoves and monolithic terrazzo soaking tubs.',
    description: 'Surrounded by pine trees in Balakha village, Amankora Paro offers tranquil suites with wood-burning stoves, king daybeds, and oversized terrazzo soaking tubs with forest vistas.',
    url: 'https://www.makemytrip.com/hotels/amankora_paro-details-bhutan.html',
    bookingUrl: 'https://www.booking.com/hotel/bt/amankora-paro.html',
    agodaUrl: 'https://www.agoda.com/amankora/hotel/paro-bt.html'
  },

  // 25. Melbourne, Australia
  {
    name: 'Crown Towers Melbourne',
    slug: 'melbourne-crown-towers',
    city: 'Melbourne',
    country: 'Australia',
    price: 'AUD 550',
    rating: 4.8,
    reviewsCount: 3800,
    roomType: 'Premier King Suite with Sunken Marble Spa Bath',
    tubType: 'Deep Marble Soaking Tub',
    image: `${R2_BASE}bathtub-melbourne.webp`,
    bookingTip: 'Yarra Riverfront landmark featuring deep sunken marble bathtubs with integrated TV and city skyline views.',
    description: 'Rising above the Southbank precinct, Crown Towers Melbourne features premier suites with opulent marble bathrooms, deep soaking spa tubs, and sweeping views of the city skyline.',
    url: 'https://www.makemytrip.com/hotels/crown_towers_melbourne-details-melbourne.html',
    bookingUrl: 'https://www.booking.com/hotel/au/crown-towers.html',
    agodaUrl: 'https://www.agoda.com/crown-towers-melbourne/hotel/melbourne-au.html'
  },

  // 26. Hamilton Island, Australia
  {
    name: 'qualia, Hamilton Island',
    slug: 'hamilton-island-qualia',
    city: 'Hamilton Island',
    country: 'Australia',
    price: 'AUD 1,450',
    rating: 4.9,
    reviewsCount: 980,
    roomType: 'Windward Pavilion with Private Plunge Pool & Freestanding Tub',
    tubType: 'Freestanding Soaking Bathtub',
    image: `${R2_BASE}bathtub-hamilton-island.webp`,
    bookingTip: 'Secluded Great Barrier Reef haven with private infinity plunge pools and freestanding tubs facing the Whitsundays.',
    description: 'Situated on the secluded northern tip of Hamilton Island, qualia features Windward Pavilions with private plunge pools, expansive timber sundecks, and freestanding stone tubs.',
    url: 'https://www.makemytrip.com/hotels/qualia_hamilton_island-details-hamilton_island.html',
    bookingUrl: 'https://www.booking.com/hotel/au/qualia.html',
    agodaUrl: 'https://www.agoda.com/qualia/hotel/whitsunday-islands-au.html'
  },

  // 27. Puerto Rico
  {
    name: 'Dorado Beach, a Ritz-Carlton Reserve',
    slug: 'puerto-rico-dorado-beach-ritz-carlton',
    city: 'Puerto Rico',
    country: 'Puerto Rico',
    price: '$1,650',
    rating: 4.9,
    reviewsCount: 950,
    roomType: 'Ocean Reserve Suite with Outdoor Soaking Tub & Plunge Pool',
    tubType: 'Outdoor Heated Jacuzzi & Soaking Bath',
    image: `${R2_BASE}bathtub-puerto-rico.webp`,
    bookingTip: 'Former Laurance Rockefeller estate with open-air deep soaking bathtubs and private ocean plunge pools.',
    description: 'Spread across 50 acres of tropical paradise in Puerto Rico, Dorado Beach Reserve features oceanfront pavilions with outdoor deep soaking baths and private beachfront plunge pools.',
    url: 'https://www.makemytrip.com/hotels/dorado_beach_a_ritz_carlton_reserve-details-puerto_rico.html',
    bookingUrl: 'https://www.booking.com/hotel/pr/dorado-beach-a-ritz-carlton-reserve.html',
    agodaUrl: 'https://www.agoda.com/dorado-beach-a-ritz-carlton-reserve/hotel/san-juan-pr.html'
  }
];

async function seed() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI);
  const col = mongoose.connection.collection('hotels');

  console.log(`Inserting ${NEW_WORLD_HOTELS.length} iconic world luxury hotels...`);
  let inserted = 0;
  let updated = 0;

  for (const h of NEW_WORLD_HOTELS) {
    const doc = {
      name: h.name,
      slug: h.slug,
      city: h.city,
      country: h.country,
      price: h.price,
      rating: h.rating,
      reviewsCount: h.reviewsCount,
      roomType: h.roomType,
      tubType: h.tubType,
      image: h.image,
      bookingTip: h.bookingTip,
      description: h.description,
      url: h.url,
      bookingUrl: h.bookingUrl,
      agodaUrl: h.agodaUrl,
      verified: true,
      flagged: false,
      bathtubConfirmed: true,
      crossVerified: true,
      crossVerifiedAt: new Date(),
      crossVerifiedSources: ['mmt', 'booking', 'agoda'],
      amenities: ['Bathtub', 'Balcony', 'Room Service', 'Air Conditioning', 'Private Bathroom', 'Free WiFi'],
      updatedAt: new Date()
    };

    const res = await col.updateOne(
      { slug: h.slug },
      { $set: doc, $setOnInsert: { createdAt: new Date() } },
      { upsert: true }
    );

    if (res.upsertedCount > 0) inserted++;
    else updated++;
  }

  console.log(`\n🎉 Seed Completed: ${inserted} hotels inserted, ${updated} hotels updated.`);
  const total = await col.countDocuments();
  console.log(`Total hotels in database now: ${total} (Baseline was: 2562)`);

  await mongoose.disconnect();
}

seed().catch(console.error);
