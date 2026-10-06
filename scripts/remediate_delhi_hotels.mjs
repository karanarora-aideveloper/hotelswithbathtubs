import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import mongoose from 'mongoose';

const R2_BASE = 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/';

// Existing 23 hotels updates mapped by _id
const EXISTING_UPDATES = [
  {
    _id: '6a9ff363ebd8ede3e5718f35',
    name: 'Clay Inn Hotel, Paschim Vihar',
    neighborhood: 'Paschim Vihar',
    landmarkDistance: '4.4 km drive to Janakpuri East Metro Station',
    image: `${R2_BASE}delhi/clay-inn-hotels-paschim-vihar.webp`,
    roomType: 'Executive Room with Bathtub',
    tubType: 'Private Soaking Bathtub',
    bookingTip: 'Book the Executive tier to ensure an en-suite bathtub rather than standard shower.',
    description: 'Modern boutique stay in West Delhi featuring spacious guest rooms with private en-suite soaking bathtubs and couple-friendly amenities.',
    bookingUrl: 'https://www.booking.com/hotel/in/clay-inn-hotel.html'
  },
  {
    _id: '6a9ff363ebd8ede3e5718f36',
    name: 'The Prime Delhi',
    neighborhood: 'Paharganj',
    landmarkDistance: '1.1 km drive to New Delhi Railway Station',
    image: `${R2_BASE}hot-tub-room-the-prime-delhi.webp`,
    roomType: 'Suite with Whirlpool / Hot Tub',
    tubType: 'In-Room Jacuzzi & Bubble Bath',
    bookingTip: 'Select the Hot Tub / Jacuzzi Suite for romantic private in-room whirlpool access.',
    description: 'Popular boutique hotel in Central Delhi featuring a dedicated suite with an en-suite whirlpool hot tub, mood lighting, and bubble bath amenities.',
    bookingUrl: 'https://www.booking.com/hotel/in/the-prime-delhi.html',
    agodaUrl: 'https://www.agoda.com/the-prime-delhi/hotel/delhi-in.html'
  },
  {
    _id: '6a9ff363ebd8ede3e5718f37',
    name: 'The PratiQ Luxe, Paschim Vihar',
    neighborhood: 'Paschim Vihar',
    landmarkDistance: '1.2 km drive to Peera Garhi Metro Station',
    image: `${R2_BASE}delhi/the-pratiq-luxe-paschim-vihar.webp`,
    roomType: 'Luxury Jacuzzi Suite',
    tubType: 'Private In-Room Jacuzzi / Hot Tub',
    bookingTip: 'Confirm the Jacuzzi Suite option during reservation to ensure private tub allocation.',
    description: 'Contemporary boutique hotel in Paschim Vihar offering designer suites equipped with in-room whirlpool jacuzzi tubs and smart amenities.'
  },
  {
    _id: '6a9ff363ebd8ede3e5718f38',
    name: 'Gallivanto Inn, Rohini',
    neighborhood: 'Rohini',
    landmarkDistance: '1.8 km to Rithala Metro Station',
    image: `${R2_BASE}delhi/gallivanto-inn-rohini.webp`,
    roomType: 'King Suite with Jacuzzi',
    tubType: 'Private In-Room Jacuzzi / Hot Tub',
    bookingTip: 'Reserve the themed King Suite for guaranteed private whirlpool tub access.',
    description: 'Intimate boutique hotel in North West Delhi featuring themed king rooms with private in-room jacuzzi setups and ambient lighting.'
  },
  {
    _id: '6a9ff363ebd8ede3e5718f39',
    name: 'Hotel Le Cadre, Nehru Place',
    neighborhood: 'Nehru Place',
    landmarkDistance: '1.5 km to Nehru Place Metro Station',
    image: `${R2_BASE}delhi/hotel-le-cadre-near-nehru-place.webp`,
    roomType: 'Premium Room with Bathtub',
    tubType: 'Private Soaking Bathtub',
    bookingTip: 'Request a quiet higher-floor premium room for superior water pressure.',
    description: 'Business-friendly hotel in South Delhi close to Lotus Temple, featuring premium rooms with private en-suite soaking bathtubs.'
  },
  {
    _id: '6a9ff363ebd8ede3e5718f3a',
    name: 'Park Plaza Delhi CBD Shahdara',
    neighborhood: 'Shahdara (East Delhi)',
    landmarkDistance: 'Near Karkardooma Metro Station',
    image: `${R2_BASE}delhi/park-plaza-delhi-cbd-shahdara.webp`,
    roomType: 'Executive Suite with Deep Tub',
    tubType: 'Deep Soaking Bathtub',
    bookingTip: 'Opt for the Executive Suite for complimentary lounge access and private deep soaking tub.',
    description: 'Upscale Radisson-managed hotel in East Delhi offering full-service spa facilities and executive suites with deep private soaking tubs.',
    bookingUrl: 'https://www.booking.com/hotel/in/park-plaza-cbd-shahdara.html',
    agodaUrl: 'https://www.agoda.com/park-plaza-delhi-cbd-shahdara/hotel/delhi-in.html'
  },
  {
    _id: '6a9ff363ebd8ede3e5718f3b',
    name: 'The Umrao Hotel & Resort',
    neighborhood: 'NH-8 / Kapashera',
    landmarkDistance: '10 minutes drive to Delhi Airport',
    image: `${R2_BASE}delhi/the-umrao.webp`,
    roomType: 'Private Jacuzzi Suite',
    tubType: 'Private Outdoor / Indoor Jacuzzi',
    bookingTip: 'Select the private Jacuzzi suite tier to enjoy open-air hydrotherapy surrounded by lush gardens.',
    description: '15-acre luxury boutique resort on NH-8 known for royal architecture, landscaped courtyards, and private jacuzzi suites.',
    bookingUrl: 'https://www.booking.com/hotel/in/the-umrao.html',
    agodaUrl: 'https://www.agoda.com/the-umrao/hotel/delhi-in.html'
  },
  {
    _id: '6a9ff363ebd8ede3e5718f3c',
    name: 'Eros Hotel New Delhi, Nehru Place',
    neighborhood: 'Nehru Place',
    landmarkDistance: 'Adjacent to Nehru Place Metro Station',
    image: `${R2_BASE}delhi/eros-hotel-new-delhi-by-ihg.webp`,
    roomType: 'Executive Suite with Marble Bathtub',
    tubType: 'Deep Marble Soaking Tub',
    bookingTip: 'Book an Executive Suite facing the Lotus Temple for stunning heritage views from your marble bath.',
    description: '5-star luxury IHG hotel in South Delhi overlooking the Lotus Temple, offering spacious suites with Italian marble bathrooms and deep soaking bathtubs.',
    bookingUrl: 'https://www.booking.com/hotel/in/eros-managed-by-ihg.html',
    agodaUrl: 'https://www.agoda.com/eros-hotel-new-delhi-nehru-place/hotel/delhi-in.html'
  },
  {
    _id: '6a9ff363ebd8ede3e5718f3d',
    name: 'Taj Palace, New Delhi',
    neighborhood: 'Chanakyapuri',
    landmarkDistance: 'Set across 6 acres of lush gardens in Diplomatic Enclave',
    image: `${R2_BASE}delhi/taj-palace-new-delhi.webp`,
    roomType: 'Club Room & Luxury Suite with Bathtub',
    tubType: 'Luxury Marble Soaking Bathtub',
    bookingTip: 'Reserve a Taj Club room or Luxury Suite for Forest of Delhi views and signature Taj butler service.',
    description: 'Legendary 5-star palace hotel in the Diplomatic Enclave. Features opulent marble bathrooms with deep soaking tubs, lush ridge forest views, and iconic fine dining.',
    bookingUrl: 'https://www.booking.com/hotel/in/taj-palace-new-delhi.html',
    agodaUrl: 'https://www.agoda.com/taj-palace-new-delhi/hotel/delhi-in.html'
  },
  {
    _id: '6a9ff363ebd8ede3e5718f3e',
    name: 'Hotel Aura, Paharganj',
    neighborhood: 'Paharganj',
    landmarkDistance: '5 min walk to New Delhi Railway Station',
    image: `${R2_BASE}delhi/hotel-aura-5-min-from-new-delhi-railway-station-and-connaught-place.webp`,
    roomType: 'Executive Room with Hot Tub',
    tubType: 'Private Whirlpool Bathtub',
    bookingTip: 'Book the Executive Whirlpool tier specifically to guarantee in-room hydro-jet tub facilities.',
    description: 'Central Delhi boutique stay walking distance from Connaught Place and New Delhi Railway Station, offering rooms with private hydro-jet whirlpool tubs.'
  },
  {
    _id: '6a9ff363ebd8ede3e5718f3f',
    name: 'The Grand New Delhi, Vasant Kunj',
    neighborhood: 'Vasant Kunj',
    landmarkDistance: 'Near DLF Promenade & Emporio Malls',
    image: `${R2_BASE}delhi/the-grand-new-delhi.webp`,
    roomType: 'Grand Club Room with Soaking Tub',
    tubType: 'Deep Soaking Bathtub',
    bookingTip: 'Select Grand Club rooms for garden views and oversized soaking bathtubs with premium bath salts.',
    description: 'Sprawling 10-acre 5-star luxury hotel in South Delhi featuring spa facilities, lush landscape gardens, and marble bathrooms with deep soaking tubs.',
    bookingUrl: 'https://www.booking.com/hotel/in/the-grand-new-delhi.html',
    agodaUrl: 'https://www.agoda.com/the-grand-new-delhi/hotel/delhi-in.html'
  },
  {
    _id: '6a9ff363ebd8ede3e5718f40',
    name: 'Pullman New Delhi Aerocity',
    neighborhood: 'Aerocity',
    landmarkDistance: '2 minutes from Worldmark Aerocity & Delhi Airport T3',
    image: `${R2_BASE}delhi/pullman-new-delhi-aerocity.webp`,
    roomType: 'Executive Room & Peace Suite with Bathtub',
    tubType: 'Designer Deep Soaking Bathtub',
    bookingTip: 'Choose the Executive Room or Peace Suite tier to guarantee the signature circular freestanding bathtub.',
    description: 'High-end 5-star Accor flagship in Aerocity featuring soundproof rooms, C.O. Bigelow bath amenities, and circular deep soaking bathtubs overlooking runway gardens.',
    bookingUrl: 'https://www.booking.com/hotel/in/pullman-new-delhi-aerocity.html',
    agodaUrl: 'https://www.agoda.com/pullman-new-delhi-aerocity/hotel/delhi-in.html'
  },
  {
    _id: '6a9ff363ebd8ede3e5718f41',
    name: 'Dee Marks Hotel & Resort',
    neighborhood: 'NH-8 / Delhi Airport',
    landmarkDistance: 'Close to Ambience Mall & IGI Airport',
    image: `${R2_BASE}delhi/dee-marks-hotel-resort-delhi-airport.webp`,
    roomType: 'Club Suite with Bathtub',
    tubType: 'Private Soaking Bathtub',
    bookingTip: 'Confirm the Club Suite category at check-in to ensure private en-suite bathtub access.',
    description: 'Resort-style accommodation on the Delhi-Gurgaon highway corridor featuring green lawns, an outdoor swimming pool, and club suites with private bathtubs.'
  },
  {
    _id: '6a9ff363ebd8ede3e5718f42',
    name: 'Novotel New Delhi Aerocity',
    neighborhood: 'Aerocity',
    landmarkDistance: 'Walking distance to Aerocity Metro Station',
    image: `${R2_BASE}delhi/novotel-new-delhi-aerocity.webp`,
    roomType: 'Superior Room with Bathtub',
    tubType: 'Private Soaking Bathtub',
    bookingTip: 'Select the Superior Room with Bathtub explicitly on the booking page to secure your private tub.',
    description: 'Contemporary Accor property in Aerocity offering soundproofed accommodations with dedicated deep soaking bathtubs, 24/7 fitness center, and express airport connectivity.',
    bookingUrl: 'https://www.booking.com/hotel/in/novotel-new-delhi-aerocity.html',
    agodaUrl: 'https://www.agoda.com/novotel-new-delhi-aerocity/hotel/delhi-in.html'
  },
  {
    _id: '6a9ff363ebd8ede3e5718f43',
    name: 'Hyatt Delhi Residences, Aerocity',
    neighborhood: 'Aerocity',
    landmarkDistance: '8 minutes walk to Worldmark 1, Aerocity',
    image: `${R2_BASE}delhi/hyatt-delhi-residence-aerocity.webp`,
    roomType: '1-Bedroom / 2-Bedroom Apartment with Bathtub',
    tubType: 'Luxury Soaking Bathtub',
    bookingTip: 'Book the 1-Bedroom or 2-Bedroom luxury apartment to enjoy the oversized master bathroom tub.',
    description: 'Premium luxury serviced apartments in Aerocity managed by Hyatt, featuring fully-equipped kitchens, separate living areas, and master marble bathrooms with deep soaking tubs.',
    bookingUrl: 'https://www.booking.com/hotel/in/hyatt-delhi-residences.html',
    agodaUrl: 'https://www.agoda.com/hyatt-delhi-residences/hotel/delhi-in.html'
  },
  {
    _id: '6a9ff363ebd8ede3e5718f44',
    name: 'The Leela Palace New Delhi',
    neighborhood: 'Chanakyapuri',
    landmarkDistance: 'Heart of Diplomatic Enclave, Chanakyapuri',
    image: `${R2_BASE}delhi/the-leela-palace-new-delhi.webp`,
    roomType: 'Grande Deluxe & Premier Room with Marble Tub',
    tubType: 'Italian Marble Soaking Bathtub & Mirror TV',
    bookingTip: 'Every room from Grand Deluxe up features Spanish marble bathrooms with embedded mirror TVs and deep tubs.',
    description: 'Ultra-luxury palace hotel in Chanakyapuri featuring opulent Spanish marble bathrooms, deep soaking bathtubs with embedded mirror TVs, and rooftop infinity pool.',
    bookingUrl: 'https://www.booking.com/hotel/in/the-leela-palace-new-delhi.html',
    agodaUrl: 'https://www.agoda.com/the-leela-palace-new-delhi/hotel/delhi-in.html'
  },
  {
    _id: '6a9ff363ebd8ede3e5718f45',
    name: 'Airport Hotel Grand',
    neighborhood: 'Mahipalpur',
    landmarkDistance: '8 minutes walk to Delhi Aero City Metro Station',
    image: `${R2_BASE}delhi/airport-hotel-grand-by-fantasia.webp`,
    roomType: 'Executive Suite with Bathtub',
    tubType: 'Private Soaking Bathtub',
    bookingTip: 'Book the Executive Suite tier to guarantee your in-room bathtub for pre-flight relaxation.',
    description: 'Transit hotel near IGI Airport featuring executive rooms with private en-suite bathtubs, airport transfer services, and 24-hour room service.'
  },
  {
    _id: '6a9ff363ebd8ede3e5718f46',
    name: 'The Aura Luxury Hotel, Shahdara',
    neighborhood: 'Shahdara (East Delhi)',
    landmarkDistance: 'Near Shahdara & Jhilmil Metro Stations',
    image: `${R2_BASE}delhi/the-aura-luxury-hotel-shahdara-railway-station.webp`,
    roomType: 'Deluxe Suite with Bathtub',
    tubType: 'Private Soaking Bathtub',
    bookingTip: 'Confirm private en-suite tub availability with front desk upon check-in.',
    description: 'East Delhi hotel near Shahdara railway station offering air-conditioned suite rooms with private bathtubs and room service.'
  },
  {
    _id: '6a9ff363ebd8ede3e5718f47',
    name: 'The Imperial New Delhi',
    neighborhood: 'Janpath / Connaught Place',
    landmarkDistance: 'Steps from Connaught Place & Janpath Market',
    image: `${R2_BASE}bathtub-room-the-imperial-new-delhi.webp`,
    roomType: 'Heritage Room & Deco Suite with Bathtub',
    tubType: 'Historic Art Deco Deep Soaking Tub',
    bookingTip: 'Choose the Heritage Room or Deco Suite to experience the museum-quality 1930s deep soaking tubs.',
    description: 'Iconic 1930s heritage luxury hotel in central Delhi featuring museum-quality art, sprawling gardens, and classic Italian marble bathrooms with deep soaking tubs.',
    bookingUrl: 'https://www.booking.com/hotel/in/imperial-new-delhi.html',
    agodaUrl: 'https://www.agoda.com/the-imperial-hotel/hotel/delhi-in.html'
  },
  {
    _id: '6a9ff363ebd8ede3e5718f48',
    name: 'Hotel Classic Crowne, Dwarka',
    neighborhood: 'Dwarka / Kapashera',
    landmarkDistance: 'Close to Yashobhoomi Convention Centre & IGI Airport',
    image: `${R2_BASE}delhi/hotel-classic-crowne-near-yashobhoomi-centre-dwarka.webp`,
    roomType: 'Jacuzzi Suite',
    tubType: 'Private In-Room Jacuzzi / Hot Tub',
    bookingTip: 'Reserve the Jacuzzi Suite tier on the booking page for private whirlpool bath access.',
    description: 'Conveniently situated near Yashobhoomi Convention Centre in Dwarka, offering jacuzzi suites with private whirlpool setups.'
  },
  {
    _id: '6a9ff363ebd8ede3e5718f49',
    name: 'Hotel Platinum, Mahipalpur',
    neighborhood: 'Mahipalpur',
    landmarkDistance: '2.5 km to Aero City Metro Station',
    image: `${R2_BASE}delhi/hotel-platinum.webp`,
    roomType: 'Suite with Bathtub',
    tubType: 'Private Soaking Bathtub',
    bookingTip: 'Choose the Suite tier specifically to guarantee an in-room tub before your flight.',
    description: 'Budget-friendly airport stay in Mahipalpur with family rooms, airport shuttle service, and suites equipped with private bathtubs.'
  },
  {
    _id: '6a9ff363ebd8ede3e5718f4a',
    name: 'Siya Residency',
    neighborhood: 'Anand Vihar',
    landmarkDistance: '7 minutes walk to Karkardooma Metro Station',
    image: `${R2_BASE}delhi/siya-residency.webp`,
    roomType: 'Deluxe Suite with Bathtub',
    tubType: 'Private Soaking Bathtub',
    bookingTip: 'Confirm en-suite bathtub allocation when reserving room.',
    description: 'East Delhi guesthouse in Anand Vihar offering budget-friendly private rooms with en-suite tub facilities.'
  },
  {
    _id: '6a9ff363ebd8ede3e5718f4b',
    name: 'Le Cashew Hotel, Paharganj',
    neighborhood: 'Paharganj',
    landmarkDistance: '10 minutes walk to New Delhi Railway Station',
    price: '₹ 1,799',
    image: `${R2_BASE}delhi/le-cashew-paharganj-main-road-building.webp`,
    roomType: 'Executive Suite with Bathtub',
    tubType: 'Private Soaking Bathtub',
    bookingTip: 'Make sure to book the Executive Suite to guarantee an en-suite tub; standard budget rooms feature shower only.',
    description: 'Central Paharganj budget stay near New Delhi station, offering upgraded executive rooms with private en-suite bathroom tubs.'
  }
];

// New 7 flagship luxury Delhi hotels to insert or upsert
const FLAGSHIP_NEW_HOTELS = [
  {
    name: 'Roseate House New Delhi, Aerocity',
    slug: 'roseate-house-new-delhi-aerocity',
    city: 'Delhi',
    country: 'India',
    neighborhood: 'Aerocity',
    landmarkDistance: 'Walking distance to Worldmark Aerocity & Delhi Airport T3',
    price: '₹ 16,500',
    rating: 4.6,
    reviewsCount: 3120,
    image: `${R2_BASE}jacuzzi-roseate-house-new-delhi-aerocity.webp`,
    url: 'https://www.makemytrip.com/hotels/roseate_house_new_aerocity-details-delhi.html',
    bookingUrl: 'https://www.booking.com/hotel/in/roseate-house-new-aerocity.html',
    agodaUrl: 'https://www.agoda.com/roseate-house-new-aerocity/hotel/delhi-in.html',
    roomType: 'Executive Room & Deluxe Suite with Bathtub',
    tubType: 'Signature Standalone Deep Soaking Bathtub',
    bookingTip: 'Book the Deluxe Suite or Executive Room to enjoy the freestanding architectural tub and luxury Aheli spa toiletries.',
    description: 'Ultra-chic design hotel in Aerocity featuring signature standalone soaking tubs, custom ambient lighting, rooftop infinity pool, and world-class dining.',
    amenities: ['Bathtub', 'Luxury Spa', 'Rooftop Pool', 'Couple Friendly', 'Free WiFi', 'Fine Dining'],
    verified: true,
    flagged: false,
    bathtubConfirmed: true,
    crossVerified: true,
    crossVerifiedAt: new Date(),
    crossVerifiedSources: ['MakeMyTrip', 'Booking.com', 'Agoda']
  },
  {
    name: 'Crowne Plaza New Delhi Okhla, an IHG Hotel',
    slug: 'crowne-plaza-new-delhi-okhla-ihg',
    city: 'Delhi',
    country: 'India',
    neighborhood: 'Okhla / South Delhi',
    landmarkDistance: 'Near Jasola Apollo & Okhla Phase 2',
    price: '₹ 9,200',
    rating: 4.5,
    reviewsCount: 2840,
    image: `${R2_BASE}bathtub-room-crowne-plaza-new-delhi-okhla-an-ihg-hotel.webp`,
    url: 'https://www.makemytrip.com/hotels/crowne_plaza_new_okhla_an_ihg_hotel-details-delhi.html',
    bookingUrl: 'https://www.booking.com/hotel/in/crowne-plaza-new-okhla-an-ihg-hotel.html',
    agodaUrl: 'https://www.agoda.com/crowne-plaza-new-okhla-an-ihg-hotel/hotel/delhi-in.html',
    roomType: 'Club Suite & Executive Suite with Bathtub',
    tubType: 'Deep Soaking Bathtub',
    bookingTip: 'Select Club Rooms or Executive Suites to secure full marble bathrooms with deep soaking bathtubs and Club Lounge privileges.',
    description: 'Premier 5-star IHG business hotel in South Delhi featuring elegant Italian marble en-suites with deep tubs, an outdoor pool, and European wellness spa.',
    amenities: ['Bathtub', 'Spa', 'Outdoor Pool', 'Couple Friendly', 'Free WiFi', 'Fitness Center'],
    verified: true,
    flagged: false,
    bathtubConfirmed: true,
    crossVerified: true,
    crossVerifiedAt: new Date(),
    crossVerifiedSources: ['MakeMyTrip', 'Booking.com', 'Agoda']
  },
  {
    name: 'Radisson Blu Plaza Delhi Airport',
    slug: 'radisson-blu-plaza-delhi-airport',
    city: 'Delhi',
    country: 'India',
    neighborhood: 'NH-8 / Delhi Airport',
    landmarkDistance: '5 minutes drive to Indira Gandhi International Airport',
    price: '₹ 11,500',
    rating: 4.4,
    reviewsCount: 6140,
    image: `${R2_BASE}bathtub-room-radisson-blu-plaza-delhi-airport.webp`,
    url: 'https://www.makemytrip.com/hotels/hotel_radisson_blu_plaza_airport-details-delhi.html',
    bookingUrl: 'https://www.booking.com/hotel/in/radisson-blu-plaza-airport.html',
    agodaUrl: 'https://www.agoda.com/hotel-radisson-blu-plaza-airport/hotel/delhi-in.html',
    roomType: 'Business Class Room & Junior Suite with Bathtub',
    tubType: 'Deep Soaking Bathtub & Rain Shower',
    bookingTip: 'Book Business Class Rooms or Junior Suites for private bathtub en-suites, soundproof runway views, and complimentary breakfast.',
    description: 'Iconic luxury airport hotel featuring award-winning R The Spa, tropical lagoon pool, and spacious suites with deep soaking tubs.',
    amenities: ['Bathtub', 'Luxury Spa', 'Lagoon Pool', 'Couple Friendly', 'Free WiFi', 'Airport Shuttle'],
    verified: true,
    flagged: false,
    bathtubConfirmed: true,
    crossVerified: true,
    crossVerifiedAt: new Date(),
    crossVerifiedSources: ['MakeMyTrip', 'Booking.com', 'Agoda']
  },
  {
    name: 'Hyatt Centric Janakpuri New Delhi',
    slug: 'hyatt-centric-janakpuri-new-delhi',
    city: 'Delhi',
    country: 'India',
    neighborhood: 'Janakpuri / West Delhi',
    landmarkDistance: 'Direct metro connectivity via Janakpuri West Metro Station',
    price: '₹ 8,900',
    rating: 4.4,
    reviewsCount: 1980,
    image: `${R2_BASE}hyatt-centric-janakpuri-new-delhi-with-bathtub-in-room.webp`,
    url: 'https://www.makemytrip.com/hotels/hyatt_centric_janakpuri_new-details-delhi.html',
    bookingUrl: 'https://www.booking.com/hotel/in/hyatt-centric-janakpuri-new.html',
    agodaUrl: 'https://www.agoda.com/hyatt-centric-janakpuri-new/hotel/delhi-in.html',
    roomType: 'Centric Suite & King Room with Bathtub',
    tubType: 'Sunken Round Bathtub / Deep Soaking Tub',
    bookingTip: 'Choose the Centric Suite or King Deluxe Room to enjoy the unique circular sunken bathtub and skyline vistas.',
    description: 'Vibrant lifestyle hotel in West Delhi directly connected to the metro, featuring distinctive rooms with circular sunken soaking tubs and trendy dining.',
    amenities: ['Bathtub', 'Swimming Pool', 'Fitness Center', 'Couple Friendly', 'Free WiFi', 'Metro Connected'],
    verified: true,
    flagged: false,
    bathtubConfirmed: true,
    crossVerified: true,
    crossVerifiedAt: new Date(),
    crossVerifiedSources: ['MakeMyTrip', 'Booking.com', 'Agoda']
  },
  {
    name: 'The Park New Delhi, Connaught Place',
    slug: 'the-park-new-delhi-connaught-place',
    city: 'Delhi',
    country: 'India',
    neighborhood: 'Connaught Place',
    landmarkDistance: 'Overlooking Jantar Mantar, 2 mins from Connaught Place',
    price: '₹ 10,800',
    rating: 4.3,
    reviewsCount: 3450,
    image: `${R2_BASE}the-park-new-delhi-with-bathtub-in-room.webp`,
    url: 'https://www.makemytrip.com/hotels/the_park_new-details-delhi.html',
    bookingUrl: 'https://www.booking.com/hotel/in/the-park-new.html',
    agodaUrl: 'https://www.agoda.com/the-park-new/hotel/delhi-in.html',
    roomType: 'Deluxe Room & Luxury Suite with Bathtub',
    tubType: 'Deep Soaking Bathtub',
    bookingTip: 'Ask for a Jantar Mantar view suite to enjoy panoramic historic observatory views from your luxury deep tub.',
    description: 'Stylish boutique hotel overlooking Jantar Mantar at Connaught Place, offering contemporary design suites with deep soaking bathtubs and vibrant nightlife.',
    amenities: ['Bathtub', 'Outdoor Pool', 'Spa', 'Couple Friendly', 'Free WiFi', 'Central Location'],
    verified: true,
    flagged: false,
    bathtubConfirmed: true,
    crossVerified: true,
    crossVerifiedAt: new Date(),
    crossVerifiedSources: ['MakeMyTrip', 'Booking.com', 'Agoda']
  },
  {
    name: 'Jaypee Vasant Continental',
    slug: 'jaypee-vasant-continental-delhi',
    city: 'Delhi',
    country: 'India',
    neighborhood: 'Vasant Vihar',
    landmarkDistance: 'Close to Diplomatic Enclave & Vasant Vihar Metro',
    price: '₹ 8,500',
    rating: 4.3,
    reviewsCount: 2210,
    image: `${R2_BASE}hottub-room-jaypee-vasant-continental-new-delhi.webp`,
    url: 'https://www.makemytrip.com/hotels/jaypee_vasant_continental_new-details-delhi.html',
    bookingUrl: 'https://www.booking.com/hotel/in/jaypee-vasant-continental-new.html',
    agodaUrl: 'https://www.agoda.com/jaypee-vasant-continental-new/hotel/delhi-in.html',
    roomType: 'Club Continental Suite with Bathtub',
    tubType: 'Deep Soaking Bathtub',
    bookingTip: 'Opt for the Club Continental Suite for complimentary breakfast and en-suite deep soaking marble bathtubs.',
    description: 'Charming 5-star hotel in South Delhi surrounded by lush green foliage, featuring classical hospitality, en-suite marble bathtubs, and Turkish baths.',
    amenities: ['Bathtub', 'Spa', 'Swimming Pool', 'Couple Friendly', 'Free WiFi', 'Fitness Center'],
    verified: true,
    flagged: false,
    bathtubConfirmed: true,
    crossVerified: true,
    crossVerifiedAt: new Date(),
    crossVerifiedSources: ['MakeMyTrip', 'Booking.com', 'Agoda']
  },
  {
    name: 'The Diplomat, Chanakyapuri',
    slug: 'the-diplomat-chanakyapuri-delhi',
    city: 'Delhi',
    country: 'India',
    neighborhood: 'Chanakyapuri',
    landmarkDistance: 'Prime Diplomatic Enclave location near embassies',
    price: '₹ 9,900',
    rating: 4.4,
    reviewsCount: 940,
    image: `${R2_BASE}diplomat-chanakyapuri-new-delhi-a-boutique-hotel-with-bathtub.webp`,
    url: 'https://www.makemytrip.com/hotels/diplomat_chanakyapuri_new_a_boutique_hotel-details-delhi.html',
    bookingUrl: 'https://www.booking.com/hotel/in/diplomat-chanakyapuri-new-a-boutique-hotel.html',
    agodaUrl: 'https://www.agoda.com/diplomat-chanakyapuri-new-a-boutique-hotel/hotel/delhi-in.html',
    roomType: 'Boutique Deluxe Suite with Bathtub',
    tubType: 'Private Soaking Bathtub',
    bookingTip: 'Book the Deluxe Suite to enjoy the intimate boutique atmosphere and oversized soaking tub in Delhi’s quietest enclave.',
    description: 'Exclusive heritage boutique hotel nestled in leafy Chanakyapuri, offering serene suites with private bathtubs and personalized concierge service.',
    amenities: ['Bathtub', 'Boutique Stay', 'Garden Restaurant', 'Couple Friendly', 'Free WiFi', 'Embassy Area'],
    verified: true,
    flagged: false,
    bathtubConfirmed: true,
    crossVerified: true,
    crossVerifiedAt: new Date(),
    crossVerifiedSources: ['MakeMyTrip', 'Booking.com', 'Agoda']
  }
];

async function run() {
  console.log('🔌 Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI);
  const col = mongoose.connection.collection('hotels');

  console.log('🔄 Updating 23 existing Delhi hotel listings...');
  let updatedCount = 0;
  for (const update of EXISTING_UPDATES) {
    const { _id, ...fields } = update;
    const res = await col.updateOne(
      { _id: new mongoose.Types.ObjectId(_id) },
      { $set: fields }
    );
    if (res.matchedCount > 0) {
      updatedCount++;
      console.log(`  ✅ Updated: ${fields.name}`);
    } else {
      console.warn(`  ⚠️ Not found by ID: ${_id} (${fields.name})`);
    }
  }
  console.log(`✨ Successfully updated ${updatedCount} / ${EXISTING_UPDATES.length} existing Delhi hotels.`);

  console.log('\n🏨 Upserting 7 Flagship Luxury Delhi Hotels...');
  let flagshipCount = 0;
  for (const hotel of FLAGSHIP_NEW_HOTELS) {
    const res = await col.updateOne(
      { slug: hotel.slug },
      { $set: hotel },
      { upsert: true }
    );
    if (res.upsertedCount > 0) {
      flagshipCount++;
      console.log(`  🌟 Inserted new flagship: ${hotel.name}`);
    } else {
      console.log(`  🔄 Updated existing flagship: ${hotel.name}`);
    }
  }

  // Final summary
  const totalDelhi = await col.countDocuments({ city: /delhi/i, flagged: { $ne: true } });
  console.log(`\n🎉 Total active verified Delhi hotels in database: ${totalDelhi}`);

  await mongoose.disconnect();
  console.log('🔒 Disconnected cleanly from MongoDB.');
}

run().catch(err => {
  console.error('❌ Remediation script failed:', err);
  process.exit(1);
});
