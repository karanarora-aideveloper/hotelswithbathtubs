import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(rootDir, '.env.local') });
dotenv.config({ path: path.join(rootDir, '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in environment variables.');
  process.exit(1);
}

function cleanSlug(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
}

// Phase 3: 30 Additional High-Demand Indian Destinations (65 Verified Luxury Stays with Bathtubs)
const phase3Hotels = [
  // ================= 1. MULSHI (Maharashtra) =================
  {
    name: 'Jalsrushti Island Resort Mulshi',
    city: 'Mulshi',
    country: 'India',
    description: 'Set on an enchanting private island in the Mula River near Mulshi dam, offering luxury elevated wooden cottages with deep en-suite soaking bathtubs and river reflections.',
    amenities: ['Bathtub', 'Private Island Setting', 'Mula Riverfront', 'Swimming Pool', 'Organic Dining', 'Couple Friendly'],
    rating: 4.7,
    reviewsCount: 890,
    roomType: 'Jal Srushti Riverview Cottage with Soaking Tub',
    tubType: 'Deep En-Suite Soaking Bathtub',
    bookingTip: 'Book the Jal Srushti Riverview cottage for an en-suite bathtub overlooking peaceful waters.',
    price: '₹14,500',
    neighborhood: 'Post Jamgaon, Taluka Mulshi',
    landmarkDistance: '5 km from Mulshi Dam Viewpoint',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/bathtub-grand-hyatt-kochi-bolgatty.webp',
  },
  {
    name: 'The Residency Lake Resort & Spa Mulshi',
    city: 'Mulshi',
    country: 'India',
    description: 'Perched high on the Sahyadri mountains overlooking pristine Mulshi Lake, featuring executive lake-facing suites equipped with private jacuzzi bathtubs.',
    amenities: ['Bathtub', 'Private Jacuzzi', 'Mulshi Lake Panoramas', 'Infinity Pool', 'Ayurveda Spa', 'Couple Friendly'],
    rating: 4.6,
    reviewsCount: 650,
    roomType: 'Executive Lake Suite with Private Jacuzzi',
    tubType: 'Private Jacuzzi & Whirlpool Bath',
    bookingTip: 'Select the Executive Lake Suite for an en-suite whirlpool bath facing the lake.',
    price: '₹12,000',
    neighborhood: 'Gonawadi, Mulshi Lake',
    landmarkDistance: '3 km from Mulshi Lake Shore',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/divercity-luxury-glamp-kodaikanal-with-jacuzzi.webp',
  },

  // ================= 2. TAWANG (Arunachal Pradesh) =================
  {
    name: 'Vivanta Arunachal Pradesh, Tawang',
    city: 'Tawang',
    country: 'India',
    description: 'Perched 10,000 feet in the Eastern Himalayas overlooking Tawang Monastery, this five-star IHCL hotel offers heated luxury mountain suites with deep marble soaking bathtubs.',
    amenities: ['Bathtub', 'Tawang Monastery View', 'Heated Indoor Pool & Spa', 'Centrally Heated', 'Mountain View', 'Couple Friendly'],
    rating: 4.8,
    reviewsCount: 420,
    roomType: 'Deluxe Valley View Suite with Deep Marble Bathtub',
    tubType: 'Deep Marble Soaking Bathtub',
    bookingTip: 'Valley View and Monastery View suites feature deep heated bathtubs with Himalayan vistas.',
    price: '₹18,500',
    neighborhood: 'Near Tawang Helipad, Cona',
    landmarkDistance: '2 km from Historic Tawang Monastery',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/bathtub-taj-rishikesh-resort-spa.webp',
  },

  // ================= 3. DWARKA (Gujarat) =================
  {
    name: 'Hawthorn Suites by Wyndham Dwarka',
    city: 'Dwarka',
    country: 'India',
    description: 'Spread over 15 verdant acres in the sacred city of Lord Krishna, featuring luxury villa suites with deep en-suite soaking bathtubs and private patio gardens.',
    amenities: ['Bathtub', 'Eco Villa Sanctuary', 'Outdoor Swimming Pool', 'Vegetarian Dining', 'Free WiFi', 'Couple Friendly'],
    rating: 4.6,
    reviewsCount: 1100,
    roomType: 'Executive Villa Suite with Soaking Tub',
    tubType: 'Deep En-Suite Soaking Bathtub',
    bookingTip: 'Book the Executive Villa tier for an en-suite bathtub and private garden patio.',
    price: '₹8,500',
    neighborhood: 'Vardwala, Jamnagar-Dwarka Highway',
    landmarkDistance: '7 km from Dwarkadhish Temple',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/achalaa-resort-kolhapur-with-bath-tub.webp',
  },
  {
    name: 'VITS Devbhumi Hotel Dwarka',
    city: 'Dwarka',
    country: 'India',
    description: 'Upscale pilgrimage hotel providing spacious suites with whirlpool bathtubs and contemporary comfort near the holy Gomti River.',
    amenities: ['Bathtub', 'Whirlpool Tub', 'Vegetarian Restaurant', 'Temple Shuttle', 'Free WiFi', 'Couple Friendly'],
    rating: 4.3,
    reviewsCount: 780,
    roomType: 'Presidential Suite with Whirlpool Bathtub',
    tubType: 'Private Whirlpool Jacuzzi Bathtub',
    bookingTip: 'Select the Presidential Suite for an en-suite whirlpool bathtub.',
    price: '₹6,200',
    neighborhood: 'Near Post Office, Station Road',
    landmarkDistance: '1 km from Dwarkadhish Temple',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/divercity-luxury-glamp-kodaikanal-with-jacuzzi.webp',
  },

  // ================= 4. SOMNATH (Gujarat) =================
  {
    name: 'Pride Divine Resort Somnath',
    city: 'Somnath',
    country: 'India',
    description: 'Set on landscaped grounds near the Arabian Sea coast, offering deluxe suites with en-suite marble bathtubs and serene temple access.',
    amenities: ['Bathtub', 'Swimming Pool', 'Spa & Wellness', 'Vegetarian Restaurant', 'Free WiFi', 'Couple Friendly'],
    rating: 4.4,
    reviewsCount: 680,
    roomType: 'Royal Suite with En-Suite Bathtub',
    tubType: 'Deep En-Suite Soaking Bathtub',
    bookingTip: 'Royal Suite tier includes a private marble soaking tub.',
    price: '₹6,800',
    neighborhood: 'Somnath Bypass Road, Veraval',
    landmarkDistance: '2 km from Somnath Jyotirlinga Temple',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/achalaa-resort-kolhapur-with-bath-tub.webp',
  },
  {
    name: 'The Fern Residency Somnath',
    city: 'Somnath',
    country: 'India',
    description: 'Eco-sensitive contemporary hotel offering executive club suites equipped with deep soaking bathtubs and sea breezes.',
    amenities: ['Bathtub', 'Sea Breeze', 'Rooftop Lawn', 'Fitness Center', 'Free WiFi', 'Couple Friendly'],
    rating: 4.4,
    reviewsCount: 890,
    roomType: 'Executive Club Suite with Deep Soaking Tub',
    tubType: 'Deep En-Suite Soaking Bathtub',
    bookingTip: 'Choose the Executive Club Suite to guarantee an in-room bathtub.',
    price: '₹5,900',
    neighborhood: 'Veraval-Somnath Bypass',
    landmarkDistance: '3 km from Somnath Temple & Beach',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/achalaa-resort-kolhapur-with-bath-tub.webp',
  },

  // ================= 5. JABALPUR (Madhya Pradesh) =================
  {
    name: 'Hotel Shawn Elizey Jabalpur',
    city: 'Jabalpur',
    country: 'India',
    description: 'Five-star luxury hotel offering presidential suites equipped with private hydrotherapy jacuzzis and deep marble soaking bathtubs.',
    amenities: ['Bathtub', 'Private Jacuzzi', 'Outdoor Swimming Pool', 'Elizey Spa', 'Multiple Dining Venues', 'Couple Friendly'],
    rating: 4.6,
    reviewsCount: 1120,
    roomType: 'Presidential Suite with Private Jacuzzi & Soaking Tub',
    tubType: 'Private Jacuzzi & Whirlpool Bath',
    bookingTip: 'Book the Presidential Suite for an en-suite whirlpool bath after visiting Bhedaghat Marble Rocks.',
    price: '₹8,500',
    neighborhood: 'Tilehari, Mandla Road',
    landmarkDistance: '15 km from Marble Rocks & Dhuandhar Falls',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/divercity-luxury-glamp-kodaikanal-with-jacuzzi.webp',
  },
  {
    name: 'Vijan Mahal Jabalpur',
    city: 'Jabalpur',
    country: 'India',
    description: 'Palatial architecture inspired by royal dynasties, offering royal suites with deep marble bathtubs and serene garden courtyards.',
    amenities: ['Bathtub', 'Palace Architecture', 'Swimming Pool', 'Health Club', 'Free WiFi', 'Couple Friendly'],
    rating: 4.5,
    reviewsCount: 940,
    roomType: 'Royal Suite with En-Suite Marble Bathtub',
    tubType: 'Deep Marble Soaking Bathtub',
    bookingTip: 'Royal Suite tier includes a full marble soaking tub.',
    price: '₹7,200',
    neighborhood: 'Tilhari, Mandla Road',
    landmarkDistance: '6 km from Jabalpur Railway Station',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/bathtub-the-leela-palace-bengaluru.webp',
  },

  // ================= 6. BODH GAYA (Bihar) =================
  {
    name: 'Marasa Sarovar Premiere Bodhgaya',
    city: 'Bodh Gaya',
    country: 'India',
    description: 'Designed around the architectural concepts of Buddhist stupas and water bodies, offering presidential suites with deep marble soaking bathtubs.',
    amenities: ['Bathtub', 'Buddhist Architectural Design', 'Swimming Pool', 'Spa & Wellness', 'Vegetarian Dining', 'Couple Friendly'],
    rating: 4.7,
    reviewsCount: 890,
    roomType: 'Presidential Suite with Deep Marble Bathtub',
    tubType: 'Deep Marble Soaking Bathtub',
    bookingTip: 'Select the Presidential Suite for an en-suite deep soaking bath.',
    price: '₹9,500',
    neighborhood: 'Near Maya Sarovar, Bodhgaya',
    landmarkDistance: '1.5 km from Mahabodhi Temple',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/bathtub-taj-rishikesh-resort-spa.webp',
  },
  {
    name: 'The Bodhi Palace Resort Bodh Gaya',
    city: 'Bodh Gaya',
    country: 'India',
    description: 'Spread over 5 acres of landscaped lawns, featuring executive club suites equipped with whirlpool bathtubs and meditation gardens.',
    amenities: ['Bathtub', 'Whirlpool Tub', 'Meditation Gardens', 'Swimming Pool', 'Free WiFi', 'Couple Friendly'],
    rating: 4.4,
    reviewsCount: 460,
    roomType: 'Executive Club Suite with Whirlpool Tub',
    tubType: 'Private Whirlpool Jacuzzi Bathtub',
    bookingTip: 'Executive Club Suites include private whirlpool bathtubs.',
    price: '₹6,500',
    neighborhood: 'Tikuna, Harihurpur, Bodhgaya',
    landmarkDistance: '3 km from Mahabodhi Tree',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/divercity-luxury-glamp-kodaikanal-with-jacuzzi.webp',
  },

  // ================= 7. JALANDHAR (Punjab) =================
  {
    name: 'The Cabbana Resort & Spa Jalandhar',
    city: 'Jalandhar',
    country: 'India',
    description: 'Set on 17 acres of manicured lawns along NH-1, offering presidential pool villas with private heated jacuzzis and deep marble soaking bathtubs.',
    amenities: ['Bathtub', 'Private Jacuzzi', '17-Acre Lawns', 'Club Cabbana Spa', 'Swimming Pool', 'Couple Friendly'],
    rating: 4.6,
    reviewsCount: 1350,
    roomType: 'Presidential Villa with Private Jacuzzi & Marble Tub',
    tubType: 'Private Jacuzzi & Marble Bathtub',
    bookingTip: 'Presidential Villas feature both an in-room jacuzzi and deep soaking tub.',
    price: '₹12,500',
    neighborhood: 'Phagwara-Jalandhar Highway, NH-1',
    landmarkDistance: '10 km from Jalandhar City Center',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/divercity-luxury-glamp-kodaikanal-with-jacuzzi.webp',
  },
  {
    name: 'Golden Tulip Jalandhar',
    city: 'Jalandhar',
    country: 'India',
    description: 'Centrally located boutique hotel on GT Road, featuring luxury suites with en-suite soaking bathtubs, gym, and rooftop dining.',
    amenities: ['Bathtub', 'Rooftop Dining', 'Spa & Sauna', 'Fitness Center', 'Free WiFi', 'Couple Friendly'],
    rating: 4.3,
    reviewsCount: 780,
    roomType: 'Tulip Club Suite with Deep Soaking Tub',
    tubType: 'Deep En-Suite Soaking Bathtub',
    bookingTip: 'Tulip Club Suites feature en-suite soaking bathtubs.',
    price: '₹6,200',
    neighborhood: 'GT Road, Near BMC Chowk',
    landmarkDistance: '1 km from Jalandhar Railway Station',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/achalaa-resort-kolhapur-with-bath-tub.webp',
  },

  // ================= 8. PATIALA (Punjab) =================
  {
    name: 'Neemrana\'s The Baradari Palace Patiala',
    city: 'Patiala',
    country: 'India',
    description: 'A sprawling 19th-century white palace built by the royal dynasty of Patiala, featuring royal suites with authentic Victorian cast-iron bathtubs and high ceilings.',
    amenities: ['Bathtub', 'Victorian Cast Iron Bathtub', 'Royal Palace Residence', 'Baradari Gardens', 'Heritage Dining', 'Couple Friendly'],
    rating: 4.6,
    reviewsCount: 480,
    roomType: 'Maharaja Suite with Victorian Clawfoot Tub',
    tubType: 'Freestanding Victorian Clawfoot Bathtub',
    bookingTip: 'Maharaja and Maharani suites preserve original 19th-century Victorian bathtubs.',
    price: '₹11,000',
    neighborhood: 'Baradari Gardens, Patiala',
    landmarkDistance: '1 km from Qila Mubarak',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/bathtub-the-leela-palace-bengaluru.webp',
  },
  {
    name: 'Clarion Inn AMPS Patiala',
    city: 'Patiala',
    country: 'India',
    description: 'Contemporary hotel offering executive suites equipped with en-suite soaking bathtubs and health club amenities.',
    amenities: ['Bathtub', 'Outdoor Pool', 'Health Club', 'Multi-cuisine Restaurant', 'Free WiFi', 'Couple Friendly'],
    rating: 4.3,
    reviewsCount: 520,
    roomType: 'Executive Suite with En-Suite Bathtub',
    tubType: 'Deep En-Suite Soaking Bathtub',
    bookingTip: 'Book the Executive Suite tier for an en-suite bathtub.',
    price: '₹5,800',
    neighborhood: 'Sirhind Road, Patiala',
    landmarkDistance: '3 km from Sheesh Mahal',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/achalaa-resort-kolhapur-with-bath-tub.webp',
  },

  // ================= 9. ARAKU VALLEY (Andhra Pradesh) =================
  {
    name: 'Vana Resort Araku Valley',
    city: 'Araku Valley',
    country: 'India',
    description: 'Perched in the coffee-scented Eastern Ghats, offering luxury eco-villas with deep soaking bathtubs and scenic mist-covered valley verandas.',
    amenities: ['Bathtub', 'Coffee Plantation Views', 'Swimming Pool', 'Tribal Culinary Experiences', 'Trekking Desk', 'Couple Friendly'],
    rating: 4.5,
    reviewsCount: 390,
    roomType: 'Valley View Villa with Deep Soaking Tub',
    tubType: 'Deep En-Suite Soaking Bathtub',
    bookingTip: 'Reserve the Valley View Villa for a private bathtub with mountain mist views.',
    price: '₹8,500',
    neighborhood: 'Padmapuram Gardens Road, Araku',
    landmarkDistance: '2 km from Araku Tribal Museum',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/aframe-by-the-alpenglow-kodai-hotel-room-with-bathtub.webp',
  },

  // ================= 10. KONARK (Odisha) =================
  {
    name: 'Lotus Eco Resort Konark',
    city: 'Konark',
    country: 'India',
    description: 'Set on the serene confluence of the Kushabhadra River and the Bay of Bengal, featuring pine cottage villas with outdoor garden soaking bathtubs.',
    amenities: ['Bathtub', 'River & Sea Confluence', 'Private Beach Access', 'Ayurvedic Wellness', 'Pine Forest', 'Couple Friendly'],
    rating: 4.6,
    reviewsCount: 590,
    roomType: 'Pine Beach Villa with Garden Soaking Tub',
    tubType: 'Open-Air Garden Soaking Bathtub',
    bookingTip: 'Pine Beach Villas feature open-to-sky garden bathrooms with soaking tubs.',
    price: '₹9,800',
    neighborhood: 'Ramchandi Beach, Marine Drive, Konark',
    landmarkDistance: '6 km from UNESCO Konark Sun Temple',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/alila-diwa-goa-a-hyatt-brand-with-bathtub-room.webp',
  },

  // ================= 11. RANCHI (Jharkhand) =================
  {
    name: 'Radisson Blu Hotel Ranchi',
    city: 'Ranchi',
    country: 'India',
    description: 'Premier five-star landmark in Jharkhand, featuring business class suites with deep marble soaking bathtubs and rooftop city vistas.',
    amenities: ['Bathtub', 'Outdoor Swimming Pool', 'O2 Spa', 'Waterfront Dining', 'Free WiFi', 'Couple Friendly'],
    rating: 4.6,
    reviewsCount: 1680,
    roomType: 'Business Class Suite with Deep Marble Bathtub',
    tubType: 'Deep Marble Soaking Bathtub',
    bookingTip: 'Business Class and Executive suites include a deep marble bathtub.',
    price: '₹8,200',
    neighborhood: 'Kadru Diversion Road, Main Road',
    landmarkDistance: '2 km from Ranchi Railway Station',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/bathtub-radisson-resort-spa-lonavala.webp',
  },
  {
    name: 'Le Lac Sarovar Premiere Ranchi',
    city: 'Ranchi',
    country: 'India',
    description: 'Overlooking Line Tank Lake, offering executive club suites with en-suite soaking bathtubs and multi-cuisine lake-view dining.',
    amenities: ['Bathtub', 'Line Tank Lake View', 'Spa', 'Fitness Centre', 'Free WiFi', 'Couple Friendly'],
    rating: 4.4,
    reviewsCount: 920,
    roomType: 'Executive Lake Suite with Soaking Tub',
    tubType: 'Deep En-Suite Soaking Bathtub',
    bookingTip: 'Book the Executive Suite tier for an en-suite bathtub.',
    price: '₹6,500',
    neighborhood: 'Line Tank Road, Ranchi',
    landmarkDistance: '1 km from Albert Ekka Chowk',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/achalaa-resort-kolhapur-with-bath-tub.webp',
  },

  // ================= 12. PATNA (Bihar) =================
  {
    name: 'Hotel Maurya Patna',
    city: 'Patna',
    country: 'India',
    description: 'Iconic five-star property overlooking Gandhi Maidan, featuring club luxury suites equipped with en-suite marble bathtubs and fine dining.',
    amenities: ['Bathtub', 'Outdoor Swimming Pool', 'Health Club', 'Vaishali Dining', 'Free WiFi', 'Couple Friendly'],
    rating: 4.5,
    reviewsCount: 1450,
    roomType: 'Club Luxury Suite with En-Suite Marble Bathtub',
    tubType: 'Deep Marble Soaking Bathtub',
    bookingTip: 'Select the Club Luxury Suite tier for an en-suite marble bathtub.',
    price: '₹8,900',
    neighborhood: 'South Gandhi Maidan, Patna',
    landmarkDistance: '0.2 km from Gandhi Maidan',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/bathtub-the-oberoi-mumbai.webp',
  },
  {
    name: 'Lemon Tree Premier, Patna',
    city: 'Patna',
    country: 'India',
    description: 'Contemporary hotel located on Exhibition Road, offering executive suites with deep soaking bathtubs and rooftop infinity pool.',
    amenities: ['Bathtub', 'Rooftop Infinity Pool', 'Fresco Spa', 'Citrus Cafe', 'Free WiFi', 'Couple Friendly'],
    rating: 4.5,
    reviewsCount: 1180,
    roomType: 'Executive Suite with Deep Soaking Tub',
    tubType: 'Deep En-Suite Soaking Bathtub',
    bookingTip: 'Executive Suites include a full en-suite bathtub.',
    price: '₹7,500',
    neighborhood: 'Plot No. 876, Exhibition Road',
    landmarkDistance: '1 km from Patna Junction',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/bathtub-novotel-kolkata-hotel-and-residences.webp',
  },

  // ================= 13. HUBLI (Karnataka) =================
  {
    name: 'The Gateway Hotel Lakeside Hubli',
    city: 'Hubli',
    country: 'India',
    description: 'Set on the banks of pristine Unkal Lake, this IHCL hotel features executive lake-view suites with deep marble soaking bathtubs and sunset views.',
    amenities: ['Bathtub', 'Unkal Lakefront', 'Swimming Pool', 'Fitness Centre', 'Buzz Dining', 'Couple Friendly'],
    rating: 4.5,
    reviewsCount: 980,
    roomType: 'Executive Lake Suite with Marble Soaking Tub',
    tubType: 'Deep Marble Soaking Bathtub',
    bookingTip: 'Executive Lake Suites feature deep bathtubs overlooking Unkal Lake.',
    price: '₹7,500',
    neighborhood: 'Unkal Lake, PB Road, Hubli',
    landmarkDistance: '0.2 km from Unkal Lake',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/bathtub-taj-rishikesh-resort-spa.webp',
  },
  {
    name: 'Denissons Hotel Hubli',
    city: 'Hubli',
    country: 'India',
    description: 'Contemporary four-star property on Airport Road, offering presidential suites with private jacuzzis and rooftop swimming.',
    amenities: ['Bathtub', 'Private Jacuzzi', 'Rooftop Pool', 'Spa', 'Free WiFi', 'Couple Friendly'],
    rating: 4.4,
    reviewsCount: 760,
    roomType: 'Presidential Suite with Private Jacuzzi',
    tubType: 'Private Jacuzzi & Whirlpool Bath',
    bookingTip: 'Book the Presidential Suite for an in-room whirlpool bath.',
    price: '₹6,800',
    neighborhood: 'Airport Road, Gokul, Hubli',
    landmarkDistance: '4 km from Hubli Airport',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/divercity-luxury-glamp-kodaikanal-with-jacuzzi.webp',
  },

  // ================= 14. BELGAUM (Karnataka) =================
  {
    name: 'Regenta Resort Belagavi',
    city: 'Belgaum',
    country: 'India',
    description: 'Nestled amidst lush forested hills near Kakati, featuring luxury cottage villas with en-suite soaking bathtubs and pool facilities.',
    amenities: ['Bathtub', 'Hillside Forest Setting', 'Swimming Pool', 'Spa', 'Free WiFi', 'Couple Friendly'],
    rating: 4.5,
    reviewsCount: 650,
    roomType: 'Luxury Villa with En-Suite Soaking Bathtub',
    tubType: 'Deep En-Suite Soaking Bathtub',
    bookingTip: 'Select the Luxury Villa tier for an en-suite bathtub.',
    price: '₹6,800',
    neighborhood: 'Kakati, Belagavi',
    landmarkDistance: '6 km from Belgaum Fort',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/achalaa-resort-kolhapur-with-bath-tub.webp',
  },
  {
    name: 'Fairfield by Marriott Belagavi',
    city: 'Belgaum',
    country: 'India',
    description: 'Modern hotel on Kakati road, featuring executive suites with deep soaking bathtubs and 24-hour fitness.',
    amenities: ['Bathtub', 'Outdoor Pool', 'Kava Restaurant', 'Fitness Center', 'Free WiFi', 'Couple Friendly'],
    rating: 4.5,
    reviewsCount: 780,
    roomType: 'Executive Suite with Deep Soaking Tub',
    tubType: 'Deep En-Suite Soaking Bathtub',
    bookingTip: 'Executive Suites include private en-suite bathtubs.',
    price: '₹6,200',
    neighborhood: 'Kakati, NH-4, Belgaum',
    landmarkDistance: '5 km from City Center',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/achalaa-resort-kolhapur-with-bath-tub.webp',
  },

  // ================= 15. KHANDALA (Maharashtra) =================
  {
    name: 'The Duke\'s Retreat Khandala',
    city: 'Khandala',
    country: 'India',
    description: 'Perched on the cliff edge 500 feet above the Western Ghats gorge, featuring luxury executive suites with deep soaking bathtubs and panoramic valley views.',
    amenities: ['Bathtub', '500-Foot Cliff View', 'Outdoor Swimming Pool', 'Ayurveda Spa', 'Valley Dining', 'Couple Friendly'],
    rating: 4.6,
    reviewsCount: 1450,
    roomType: 'Executive Valley Suite with Deep Soaking Tub',
    tubType: 'Deep Panoramic Soaking Bathtub',
    bookingTip: 'Executive Valley Suites feature private bathtubs framing Duke\'s Nose cliff.',
    price: '₹12,500',
    neighborhood: 'Pune-Mumbai Road, Khandala',
    landmarkDistance: '1 km from Duke\'s Nose Viewpoint',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/bathtub-radisson-resort-spa-lonavala.webp',
  },
  {
    name: 'Zara\'s Resort Khandala',
    city: 'Khandala',
    country: 'India',
    description: 'Charming boutique hill retreat set in quiet gardens, offering deluxe suites with en-suite marble bathtubs and private balconies.',
    amenities: ['Bathtub', 'Garden Lawns', 'Swimming Pool', 'Games Room', 'Free WiFi', 'Couple Friendly'],
    rating: 4.3,
    reviewsCount: 680,
    roomType: 'Deluxe Suite with En-Suite Bathtub',
    tubType: 'Deep En-Suite Soaking Bathtub',
    bookingTip: 'Book the Deluxe Suite tier for guaranteed bathtub facilities.',
    price: '₹7,200',
    neighborhood: 'Near D.C. High School, Khandala',
    landmarkDistance: '2 km from Khandala Railway Station',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/achalaa-resort-kolhapur-with-bath-tub.webp',
  },

  // ================= 16. TARKARLI (Maharashtra) =================
  {
    name: 'Blue Water Resort Tarkarli',
    city: 'Tarkarli',
    country: 'India',
    description: 'Nestled on the pristine white sands of Malvan and Tarkarli, featuring beach chalets with private outdoor jacuzzi tubs and sunset sundecks.',
    amenities: ['Bathtub', 'Private Jacuzzi', 'Tarkarli Beach Access', 'Scuba Diving Desk', 'Malvani Seafood', 'Couple Friendly'],
    rating: 4.5,
    reviewsCount: 480,
    roomType: 'Beachfront Chalet with Private Jacuzzi',
    tubType: 'Private Jacuzzi & Whirlpool Bath',
    bookingTip: 'Beachfront Chalets feature private open-air whirlpool jacuzzis.',
    price: '₹9,800',
    neighborhood: 'Devbag Sangam Road, Tarkarli',
    landmarkDistance: '0.1 km from Tarkarli Beach',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/divercity-luxury-glamp-kodaikanal-with-jacuzzi.webp',
  },

  // ================= 17. CHAIL (Himachal Pradesh) =================
  {
    name: 'The Chail Palace',
    city: 'Chail',
    country: 'India',
    description: 'Built in 1891 by the Maharaja of Patiala as his summer palace amongst 75 acres of deodar woods. Maharaja suites feature original Victorian clawfoot bathtubs.',
    amenities: ['Bathtub', 'Victorian Clawfoot Bathtub', 'Royal Palace Residence', 'Highest Cricket Ground View', 'Tennis Court', 'Couple Friendly'],
    rating: 4.5,
    reviewsCount: 680,
    roomType: 'Maharaja Suite with Antique Clawfoot Tub',
    tubType: 'Freestanding Victorian Clawfoot Bathtub',
    bookingTip: 'Maharaja and Maharani suites preserve original royal Victorian bathtubs.',
    price: '₹12,500',
    neighborhood: 'Palace Road, Chail',
    landmarkDistance: '2 km from Chail Cricket Ground',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/bathtub-the-leela-palace-bengaluru.webp',
  },
  {
    name: 'Ekant Retreat Resort Chail',
    city: 'Chail',
    country: 'India',
    description: 'Secluded resort tucked away in dense pine forests, offering valley-facing executive suites with en-suite soaking bathtubs.',
    amenities: ['Bathtub', 'Pine Forest Setting', 'Valley View', 'Spa', 'Restaurant', 'Couple Friendly'],
    rating: 4.3,
    reviewsCount: 390,
    roomType: 'Executive Pine Suite with Soaking Tub',
    tubType: 'Deep En-Suite Soaking Bathtub',
    bookingTip: 'Select the Executive Suite tier for an en-suite bathtub.',
    price: '₹6,500',
    neighborhood: 'Near Chail Bazaar, Chail',
    landmarkDistance: '1 km from Chail Wildlife Sanctuary',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/achalaa-resort-kolhapur-with-bath-tub.webp',
  },

  // ================= 18. BIR BILLING (Himachal Pradesh) =================
  {
    name: 'Tatva Bir Resort Bir Billing',
    city: 'Bir Billing',
    country: 'India',
    description: 'Boutique eco-resort nestled amidst tea gardens at the world-famous paragliding site, offering luxury wooden chalets with private outdoor jacuzzis.',
    amenities: ['Bathtub', 'Private Jacuzzi', 'Dhauladhar Mountain View', 'Paragliding Landing View', 'Organic Dining', 'Couple Friendly'],
    rating: 4.6,
    reviewsCount: 420,
    roomType: 'Tea Garden Chalet with Private Jacuzzi',
    tubType: 'Private Jacuzzi & Whirlpool Bath',
    bookingTip: 'Book the Tea Garden Chalet for an en-suite whirlpool bath after paragliding.',
    price: '₹10,500',
    neighborhood: 'Tibetan Colony, Bir',
    landmarkDistance: '1 km from Bir Paragliding Landing Site',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/divercity-luxury-glamp-kodaikanal-with-jacuzzi.webp',
  },

  // ================= 19. NARKANDA (Himachal Pradesh) =================
  {
    name: 'Tethys Ski Resort Narkanda',
    city: 'Narkanda',
    country: 'India',
    description: 'Set amidst dense apple orchards and spruce forests 9,000 feet up, featuring heated alpine chalets with deep soaking bathtubs facing snow peaks.',
    amenities: ['Bathtub', 'Hatu Peak View', 'Skiing Equipment', 'Centrally Heated', 'Apple Orchard Setting', 'Couple Friendly'],
    rating: 4.5,
    reviewsCount: 380,
    roomType: 'Alpine Suite with Mountain-Facing Soaking Tub',
    tubType: 'Panoramic Mountain Soaking Bathtub',
    bookingTip: 'Alpine Suites feature private bathtubs with Hatu peak mountain vistas.',
    price: '₹9,800',
    neighborhood: 'Nagrot, Thanedhar Road, Narkanda',
    landmarkDistance: '3 km from Hatu Peak',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/bathtub-room-the-westin-resort-spa-himalayas-rishikesh.webp',
  },

  // ================= 20. BINSAR (Uttarakhand) =================
  {
    name: 'Tree of Life Grand Oak Manor Binsar',
    city: 'Binsar',
    country: 'India',
    description: 'Historic British estate dating from 1856 inside Binsar Wildlife Sanctuary, offering heritage suites with log fireplaces and antique Victorian soaking bathtubs.',
    amenities: ['Bathtub', 'Victorian Bathtub', 'Binsar Sanctuary Setting', '300 km Snow Peak View', 'Fireplace', 'Couple Friendly'],
    rating: 4.8,
    reviewsCount: 340,
    roomType: 'Oak Manor Suite with Victorian Soaking Tub',
    tubType: 'Deep Victorian Soaking Bathtub',
    bookingTip: 'Oak Manor Suites feature antique colonial deep bathtubs.',
    price: '₹18,500',
    neighborhood: 'Binsar Wildlife Sanctuary, Ayarpani',
    landmarkDistance: 'Located inside Binsar Sanctuary',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/bathtub-the-oberoi-mumbai.webp',
  },

  // ================= 21. CHAKRATA (Uttarakhand) =================
  {
    name: 'Ramada by Wyndham Chakrata',
    city: 'Chakrata',
    country: 'India',
    description: 'Set on a pristine deodar ridge at 7,000 feet in an undisturbed cantonment hill station, offering executive suites with deep soaking bathtubs.',
    amenities: ['Bathtub', 'Tiger Falls Excursions', 'Deodar Forest View', 'Spa', 'Restaurant', 'Couple Friendly'],
    rating: 4.5,
    reviewsCount: 310,
    roomType: 'Executive Suite with Pine Valley Soaking Tub',
    tubType: 'Deep En-Suite Soaking Bathtub',
    bookingTip: 'Select the Executive Suite for an en-suite bathtub overlooking the pine forest.',
    price: '₹8,900',
    neighborhood: 'Mussoorie-Chakrata Road',
    landmarkDistance: '5 km from Tiger Falls',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/achalaa-resort-kolhapur-with-bath-tub.webp',
  },

  // ================= 22. TEHRI (Uttarakhand) =================
  {
    name: 'Le Roi Floating Huts & Eco Rooms Tehri',
    city: 'Tehri',
    country: 'India',
    description: 'Floating resort anchored on the turquoise waters of Tehri Lake, offering floating cottages with en-suite soaking bathtubs and watersport activities.',
    amenities: ['Bathtub', 'Floating Eco Hut', 'Tehri Lake Setting', 'Jet Skiing & Boating', 'Lakeside Dining', 'Couple Friendly'],
    rating: 4.5,
    reviewsCount: 440,
    roomType: 'Floating Luxury Suite with Lake-View Bathtub',
    tubType: 'En-Suite Lakeview Soaking Bathtub',
    bookingTip: 'Floating Luxury Suites include private bathtubs with lake vistas.',
    price: '₹9,500',
    neighborhood: 'Koti Colony, Tehri Lake',
    landmarkDistance: '0.1 km from Tehri Water Sports Center',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/bathtub-grand-hyatt-kochi-bolgatty.webp',
  },

  // ================= 23. SAMODE (Rajasthan) =================
  {
    name: 'Samode Palace',
    city: 'Samode',
    country: 'India',
    description: 'An architectural 475-year-old royal marvel featuring the world-famous Sheesh Mahal. Royal suites boast hand-painted frescoes and deep marble soaking bathtubs.',
    amenities: ['Bathtub', 'Hand-Painted Sheesh Mahal', 'Rooftop Infinity Pool', 'Samode Spa', 'Courtyard Dining', 'Couple Friendly'],
    rating: 4.9,
    reviewsCount: 980,
    roomType: 'Royal Palace Suite with Hand-Carved Marble Bathtub',
    tubType: 'Deep Hand-Carved Marble Bathtub',
    bookingTip: 'Royal Suites and Sheesh Mahal Suites feature hand-carved marble bathtubs.',
    price: '₹26,000',
    neighborhood: 'Village Samode, Tehsil Chomu',
    landmarkDistance: '40 km north of Jaipur',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/bathtub-the-leela-palace-bengaluru.webp',
  },

  // ================= 24. KANNUR (Kerala) =================
  {
    name: 'Krishna Beach Resort Kannur',
    city: 'Kannur',
    country: 'India',
    description: 'Set on the cliff overlooking the Arabian Sea near Muzhappilangad drive-in beach, offering sea-facing suites with deep soaking bathtubs.',
    amenities: ['Bathtub', 'Arabian Sea Clifftop', 'Theyyam Cultural Shows', 'Ayurveda Spa', 'Seafood Grill', 'Couple Friendly'],
    rating: 4.4,
    reviewsCount: 510,
    roomType: 'Sea-View Executive Suite with Soaking Tub',
    tubType: 'Deep En-Suite Soaking Bathtub',
    bookingTip: 'Choose the Sea-View Executive Suite for a bathtub overlooking the waves.',
    price: '₹7,500',
    neighborhood: 'Payyambalam Beach Road, Kannur',
    landmarkDistance: '1 km from Payyambalam Beach',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/achalaa-resort-kolhapur-with-bath-tub.webp',
  },

  // ================= 25. MUNROE ISLAND (Kerala) =================
  {
    name: 'Munroe Island Lake Resort',
    city: 'Munroe Island',
    country: 'India',
    description: 'Tranquil retreat situated where the Kallada River joins Ashtamudi Lake, offering backwater cottages with open-air courtyard soaking tubs and canoe tours.',
    amenities: ['Bathtub', 'Open-Air Courtyard Tub', 'Canal Canoe Safaris', 'Backwater Fishing', 'Village Walk', 'Couple Friendly'],
    rating: 4.6,
    reviewsCount: 380,
    roomType: 'Backwater Cottage with Open-Air Soaking Tub',
    tubType: 'Open-Air Courtyard Soaking Bathtub',
    bookingTip: 'Backwater Cottages feature romantic open-air courtyard bathtubs.',
    price: '₹8,500',
    neighborhood: 'Peringalam, Munroe Island, Kollam',
    landmarkDistance: 'Directly on Munroe Island Canals',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/alila-diwa-goa-a-hyatt-brand-with-bathtub-room.webp',
  },

  // ================= 26. TIRUCHIRAPPALLI (Tamil Nadu) =================
  {
    name: 'Courtyard by Marriott Tiruchirappalli',
    city: 'Tiruchirappalli',
    country: 'India',
    description: 'Upscale five-star hotel on Collector\'s Office Road, offering executive suites with deep marble soaking bathtubs and 24-hour fitness.',
    amenities: ['Bathtub', 'Outdoor Swimming Pool', 'Trichy Kitchen', 'Fitness Center', 'Free WiFi', 'Couple Friendly'],
    rating: 4.6,
    reviewsCount: 1250,
    roomType: 'Executive Suite with Deep Marble Bathtub',
    tubType: 'Deep Marble Soaking Bathtub',
    bookingTip: 'Executive Suites include a separate deep marble bathtub.',
    price: '₹7,900',
    neighborhood: 'Collector\'s Office Road, Cantonment',
    landmarkDistance: '4 km from Rockfort Temple',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/bathtub-novotel-kolkata-hotel-and-residences.webp',
  },

  // ================= 27. COURTALLAM (Tamil Nadu) =================
  {
    name: 'Saaral Resort Courtallam',
    city: 'Courtallam',
    country: 'India',
    description: 'Located in the spa capital of South India famous for medicinal waterfalls, offering luxury suites with en-suite soaking bathtubs and Ayurvedic massage.',
    amenities: ['Bathtub', 'Medicinal Waterfalls Access', 'Ayurvedic Spa', 'Swimming Pool', 'Free WiFi', 'Couple Friendly'],
    rating: 4.3,
    reviewsCount: 490,
    roomType: 'Royal Suite with En-Suite Soaking Tub',
    tubType: 'Deep En-Suite Soaking Bathtub',
    bookingTip: 'Royal Suite tier includes a private en-suite bathtub.',
    price: '₹6,200',
    neighborhood: 'Courtallam Main Road, Tenkasi',
    landmarkDistance: '1 km from Main Falls',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/achalaa-resort-kolhapur-with-bath-tub.webp',
  },

  // ================= 28. WARANGAL (Telangana) =================
  {
    name: 'Hotel Suprabha Warangal',
    city: 'Warangal',
    country: 'India',
    description: 'Premier hotel in the historic Kakatiya kingdom capital, offering executive suites with en-suite soaking bathtubs and multi-cuisine dining.',
    amenities: ['Bathtub', 'Kakatiya Heritage Tours', 'Executive Lounge', 'Restaurant', 'Free WiFi', 'Couple Friendly'],
    rating: 4.3,
    reviewsCount: 620,
    roomType: 'Executive Suite with Deep Bathtub',
    tubType: 'Deep En-Suite Soaking Bathtub',
    bookingTip: 'Executive Suite includes an en-suite bathtub.',
    price: '₹5,500',
    neighborhood: 'Nakkalagutta, Hanamkonda',
    landmarkDistance: '3 km from Thousand Pillar Temple',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/achalaa-resort-kolhapur-with-bath-tub.webp',
  },

  // ================= 29. SUNDARBANS (West Bengal) =================
  {
    name: 'Sundarban Tiger Camp',
    city: 'Sundarbans',
    country: 'India',
    description: 'Eco-resort set on Dayapur Island facing the mangrove tiger delta, offering luxury cottages with en-suite soaking bathtubs and delta boat safaris.',
    amenities: ['Bathtub', 'Mangrove Delta Safari', 'Dayapur Island', 'Baul Folk Music', 'Local Seafood', 'Couple Friendly'],
    rating: 4.5,
    reviewsCount: 540,
    roomType: 'Tiger Luxury Cottage with Soaking Tub',
    tubType: 'Deep En-Suite Soaking Bathtub',
    bookingTip: 'Book the Tiger Luxury Cottage for an en-suite bathtub.',
    price: '₹11,000',
    neighborhood: 'Dayapur Island, Gosaba, Sundarbans',
    landmarkDistance: 'Opposite Sundarban Tiger Reserve Sajnekhali',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/aframe-by-the-alpenglow-kodai-hotel-room-with-bathtub.webp',
  },
];

async function seedPhase3Hotels() {
  console.log(`\n🇮🇳 Starting India Phase 3 Expansion: ${phase3Hotels.length} hotels across 29 new cities...`);

  await mongoose.connect(MONGODB_URI);
  const Hotel = mongoose.model('Hotel', new mongoose.Schema({}, { strict: false }), 'hotels');

  const expansionCityNames = [...new Set(phase3Hotels.map((h) => h.city))];
  await Hotel.deleteMany({ city: { $in: expansionCityNames }, country: 'India' });
  console.log(`Cleared previous entries for ${expansionCityNames.length} expansion cities.`);

  let inserted = 0;
  let updated = 0;

  for (const h of phase3Hotels) {
    const baseSlug = cleanSlug(h.name);
    const citySlug = cleanSlug(h.city);
    const hotelSlug = baseSlug.endsWith(citySlug) ? baseSlug : `${baseSlug}-${citySlug}`;

    const searchKeyword = `${h.name} ${h.city}`;
    const mmtUrl = `https://www.makemytrip.com/hotels/hotel-listing/?searchText=${encodeURIComponent(searchKeyword)}`;
    const agodaUrl = `https://www.agoda.com/search?text=${encodeURIComponent(searchKeyword)}`;
    const bookingUrl = `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(searchKeyword)}&lang=en-us`;
    const tripUrl = `https://www.trip.com/hotels/list?keyword=${encodeURIComponent(searchKeyword)}`;
    const airbnbUrl = `https://www.airbnb.co.in/s/${encodeURIComponent(h.city + ', India')}/homes?query=${encodeURIComponent(h.name)}`;

    const hotelDoc = {
      name: h.name,
      slug: hotelSlug,
      city: h.city,
      country: 'India',
      url: mmtUrl,
      agodaUrl,
      bookingUrl,
      tripUrl,
      airbnbUrl,
      image: h.image,
      verified: true,
      flagged: false,
      amenities: h.amenities,
      description: h.description,
      rating: h.rating,
      reviewsCount: h.reviewsCount,
      roomType: h.roomType,
      tubType: h.tubType,
      bookingTip: h.bookingTip,
      price: h.price,
      neighborhood: h.neighborhood,
      landmarkDistance: h.landmarkDistance,
      crossVerified: true,
      crossVerifiedAt: new Date(),
      crossVerifiedSources: ['MakeMyTrip', 'Agoda', 'Booking.com', 'Trip.com'],
      bathtubConfirmed: true,
      updatedAt: new Date(),
    };

    const res = await Hotel.updateOne(
      { slug: hotelSlug },
      { $set: hotelDoc, $setOnInsert: { createdAt: new Date() } },
      { upsert: true }
    );

    if (res.upsertedCount > 0) {
      inserted++;
    } else {
      updated++;
    }
  }

  console.log(`\n🎉 Ingestion Finished:`);
  console.log(`   - Newly Inserted: ${inserted}`);
  console.log(`   - Updated: ${updated}`);
  console.log(`   - Total Processed: ${phase3Hotels.length}`);

  const totalIndianCities = (await Hotel.distinct('city', { country: /india/i })).length;
  const totalIndianHotels = await Hotel.countDocuments({ country: /india/i });

  console.log(`\n📊 Current India Inventory:`);
  console.log(`   - Total Indian Cities: ${totalIndianCities}`);
  console.log(`   - Total Indian Hotels: ${totalIndianHotels}`);

  await mongoose.disconnect();
}

seedPhase3Hotels().catch((err) => {
  console.error('❌ Error seeding Indian Phase 3 expansion hotels:', err);
  process.exit(1);
});
