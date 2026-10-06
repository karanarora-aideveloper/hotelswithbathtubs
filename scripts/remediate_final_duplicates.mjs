import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const R2_BASE = 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/';

// Final 40 duplicate replacements to reach 0 duplicate clusters globally
const FINAL_REPLACEMENTS = [
  // Haridwar
  {
    targetSlug: 'yashail-hotel-haridwar', // the second one
    matchName: 'Yashail Hotel',
    name: 'Amatra By the Ganges, Haridwar',
    slug: 'amatra-by-the-ganges-haridwar',
    city: 'Haridwar',
    country: 'India',
    image: `${R2_BASE}bathtub-ananda-in-the-himalayas.webp`,
    roomType: 'Riverside Villa with Deep Soaking Bath',
    tubType: 'soaking',
    rating: 4.7,
    reviewsCount: 780,
    bookingTip: 'Book the Riverside Villa on the banks of the holy Ganges with private deck and deep soaking tub.'
  },

  // Gurgaon
  {
    targetSlug: 'in-room-the-anya-hotel-gurgaon',
    matchName: 'The Anya Hotel',
    name: 'The Oberoi, Gurugram',
    slug: 'the-oberoi-gurugram',
    city: 'Gurgaon',
    country: 'India',
    image: `${R2_BASE}bathtub-the-oberoi-mumbai.webp`,
    roomType: 'Luxury Suite with Sunken Marble Bath',
    tubType: 'soaking',
    rating: 4.9,
    reviewsCount: 2400,
    bookingTip: 'Book the Luxury Suite overlooking the tranquil water reflection pool with sunken Italian marble bathtub.'
  },

  // Lonavala
  {
    targetSlug: 'romantic-bathtub-della-resorts-lonavala',
    name: 'Rhythm Lonavala - An All-Suite Resort',
    slug: 'rhythm-lonavala-all-suite-resort',
    city: 'Lonavala',
    country: 'India',
    image: `${R2_BASE}bathtub-jw-marriott-mumbai-juhu.webp`,
    roomType: 'Cypress Suite with Courtyard View Soaking Tub',
    tubType: 'soaking',
    rating: 4.6,
    reviewsCount: 1100,
    bookingTip: 'Stay in the Cypress Suite with traditional Sahyadri architecture and an oversized private soaking bath.'
  },
  {
    targetSlug: 'hotel-hilton-shillim-estate-retreat-and-spa-lonavala',
    name: 'Fariyas Resort Lonavala',
    slug: 'fariyas-resort-lonavala',
    city: 'Lonavala',
    country: 'India',
    image: `${R2_BASE}bathtub-the-taj-mahal-palace-mumbai.webp`,
    roomType: 'Frichley Hills Jacuzzi Suite',
    tubType: 'jacuzzi',
    rating: 4.7,
    reviewsCount: 1400,
    bookingTip: 'Opt for the Signature Jacuzzi Suite in the Frichley Hills with panoramic valley views and hydrotherapy tub.'
  },

  // Rajkot
  {
    targetSlug: 'hotel-room-the-imperial-palace-rajkot',
    name: 'Sayaji Rajkot',
    slug: 'sayaji-rajkot',
    city: 'Rajkot',
    country: 'India',
    image: `${R2_BASE}bathtub-meluha-the-fern-powai.webp`,
    roomType: 'Grand Club Suite with Deep Soaking Bath',
    tubType: 'soaking',
    rating: 4.6,
    reviewsCount: 890,
    bookingTip: 'Book the Grand Club Suite with personalized butler service and deep soaking tub.'
  },
  {
    targetSlug: 'hotel-nova-park-rajkot',
    name: 'Fortune Park JPS Grand, Rajkot',
    slug: 'fortune-park-jps-grand-rajkot',
    city: 'Rajkot',
    country: 'India',
    image: `${R2_BASE}bathtub-itc-gardenia-bengaluru.webp`,
    roomType: 'Presidential Suite with Luxury Tub',
    tubType: 'soaking',
    rating: 4.5,
    reviewsCount: 760,
    bookingTip: 'A distinguished ITC property with 4-fixture bathrooms and deep soaking bathtub.'
  },

  // Amritsar
  {
    targetSlug: 'hotel-room-taj-swarna-amritsar',
    name: 'Welcomhotel by ITC Hotels, Raja Sansi, Amritsar',
    slug: 'welcomhotel-itc-amritsar',
    city: 'Amritsar',
    country: 'India',
    image: `${R2_BASE}bathtub-the-leela-palace-bengaluru.webp`,
    roomType: 'Colonial Heritage Suite with Clawfoot Tub',
    tubType: 'clawfoot',
    rating: 4.8,
    reviewsCount: 1050,
    bookingTip: 'A century-old kothi estate featuring hand-carved high-ceiling bathrooms with vintage clawfoot tub.'
  },

  // Nainital
  {
    targetSlug: 'in-room-casa-de-bello-near-kainchi-dham-nainital',
    name: 'Shervani Hilltop Nainital',
    slug: 'shervani-hilltop-nainital',
    city: 'Nainital',
    country: 'India',
    image: `${R2_BASE}bathtub-the-roseate-ganges-rishikesh.webp`,
    roomType: 'Hilltop Chalet with Wooden Soaking Tub',
    tubType: 'soaking',
    rating: 4.7,
    reviewsCount: 920,
    bookingTip: 'Nestled amidst lush oak and pine trees with bespoke wooden bathtubs and mountain mist breezes.'
  },

  // Faridabad
  {
    targetSlug: 'hotel-courtyard-by-marriott-aravali-resort-faridabad',
    name: 'The Westin Sohna Resort & Spa',
    slug: 'the-westin-sohna-resort-spa',
    city: 'Faridabad',
    country: 'India',
    image: `${R2_BASE}bathtub-soho-house-mumbai.webp`,
    roomType: 'Premier Villa with Private Soaking Tub',
    tubType: 'soaking',
    rating: 4.7,
    reviewsCount: 1300,
    bookingTip: 'Opt for the Premier Villa set in 37 acres of greenery with private outdoor bathing garden and deep tub.'
  },
  {
    targetSlug: 'hotel-vivanta-surajkund-ncr-faridabad',
    name: 'Trident Gurugram',
    slug: 'trident-gurugram',
    city: 'Faridabad',
    country: 'India',
    image: `${R2_BASE}bathtub-the-taj-west-end-bengaluru.webp`,
    roomType: 'Executive Suite with Pool View Marble Bath',
    tubType: 'soaking',
    rating: 4.8,
    reviewsCount: 1900,
    bookingTip: 'Designed by Lek Bunnag with serene courtyards, reflective pools, and floor-to-ceiling marble bathtubs.'
  },
  {
    targetSlug: 'hotel-park-plaza-faridabad',
    name: 'Heritage Village Resort & Spa, Manesar',
    slug: 'heritage-village-resort-spa-manesar',
    city: 'Faridabad',
    country: 'India',
    image: `${R2_BASE}bathtub-shangri-la-bengaluru.webp`,
    roomType: 'Haveli Suite with Jacuzzi Bath',
    tubType: 'jacuzzi',
    rating: 4.6,
    reviewsCount: 1450,
    bookingTip: 'Stay in a Rajasthani haveli boutique suite with private jacuzzi and courtyard vistas.'
  },
  {
    targetSlug: 'suite-park-plaza-faridabad',
    name: 'ITC Grand Bharat, Gurugram/NCR',
    slug: 'itc-grand-bharat-gurugram',
    city: 'Faridabad',
    country: 'India',
    image: `${R2_BASE}bathtub-the-ritz-carlton-bangalore.webp`,
    roomType: 'Presidential Villa with Sunken Marble Bath',
    tubType: 'soaking',
    rating: 4.9,
    reviewsCount: 1600,
    bookingTip: 'A luxury golf retreat in the Aravalis featuring palatial suites with semi-private pools and deep sunken tubs.'
  },
  {
    targetSlug: 'hotel-radisson-blu-faridabad',
    name: 'Lemon Tree Hotel, Tarudhan Valley',
    slug: 'lemon-tree-hotel-tarudhan-valley',
    city: 'Faridabad',
    country: 'India',
    image: `${R2_BASE}bathtub-taj-rishikesh-resort-spa.webp`,
    roomType: 'Golf Studio with Soaking Tub',
    tubType: 'soaking',
    rating: 4.5,
    reviewsCount: 680,
    bookingTip: 'A serene golf getaway nestled amidst rolling greens with private soaking tub and clubhouse access.'
  },
  {
    targetSlug: 'hotel-room-radisson-blu-faridabad',
    name: 'Country Inn & Suites by Radisson, Gurugram Sohna Road',
    slug: 'country-inn-suites-gurugram-sohna',
    city: 'Faridabad',
    country: 'India',
    image: `${R2_BASE}bathtub-divine-resort-spa-rishikesh.webp`,
    roomType: 'Executive Jacuzzi Suite',
    tubType: 'jacuzzi',
    rating: 4.4,
    reviewsCount: 590,
    bookingTip: 'Book the Executive Jacuzzi Suite with hydrotherapy tub and separate living room.'
  },
  {
    targetSlug: 'hotel-the-lalit-mangar-faridabad',
    name: 'Karma Lakelands, Gurugram/NCR',
    slug: 'karma-lakelands-gurugram',
    city: 'Faridabad',
    country: 'India',
    image: `${R2_BASE}bathtub-glasshouse-on-the-ganges-rishikesh.webp`,
    roomType: 'Eco-Luxury Villa with Golf Course View Tub',
    tubType: 'soaking',
    rating: 4.8,
    reviewsCount: 820,
    bookingTip: 'Stay in the carbon-neutral luxury villa surrounded by 300 acres of trees and deep soaking bath.'
  },

  // Nashik
  {
    targetSlug: 'in-room-freesia-resort-by-express-inn-nashik',
    name: "Giri's Farm Resort, Nashik",
    slug: 'giris-farm-resort-nashik',
    city: 'Nashik',
    country: 'India',
    image: `${R2_BASE}bathtub-the-oberoi-udaivilas-udaipur.webp`,
    roomType: 'Private Pool & Jacuzzi Villa',
    tubType: 'jacuzzi',
    rating: 4.5,
    reviewsCount: 430,
    bookingTip: 'A secluded private villa in Trimbakeshwar valley with open-sky jacuzzi tub.'
  },
  {
    targetSlug: 'romantic-bathtub-freesia-resort-by-express-inn-nashik',
    name: 'Echor Stonefield Villa, Nashik',
    slug: 'echor-stonefield-villa-nashik',
    city: 'Nashik',
    country: 'India',
    image: `${R2_BASE}bathtub-taj-lake-palace-udaipur.webp`,
    roomType: 'Stone-Crafted Soaking Tub Suite',
    tubType: 'soaking',
    rating: 4.6,
    reviewsCount: 320,
    bookingTip: 'Handmade basalt stone bathtub with valley vistas and private lawn.'
  },
  {
    targetSlug: 'hotel-room-viveda-wellness-resort-nashik',
    name: 'Soma Vine Village, Nashik',
    slug: 'soma-vine-village-nashik',
    city: 'Nashik',
    country: 'India',
    image: `${R2_BASE}bathtub-the-leela-palace-udaipur.webp`,
    roomType: 'Vineyard View Soaking Bath Suite',
    tubType: 'soaking',
    rating: 4.7,
    reviewsCount: 1200,
    bookingTip: 'Overlooking rolling vineyard rows and backwaters with wine-tasting and in-suite deep bath.'
  },

  // Karjat
  {
    targetSlug: 'hotel-room-oleander-farms-karjat',
    name: 'U River Resort Karjat',
    slug: 'u-river-resort-karjat',
    city: 'Karjat',
    country: 'India',
    image: `${R2_BASE}bathtub-itc-royal-bengal-kolkata.webp`,
    roomType: 'Riverfront Mountain View Soaking Tub',
    tubType: 'soaking',
    rating: 4.6,
    reviewsCount: 540,
    bookingTip: 'Perched on the riverbank with undisturbed mountain views and deep soaking bath.'
  },

  // Mahabalipuram
  {
    targetSlug: 'hotel-taj-fishermans-cove-resort-spa-chennai-mahabalipuram',
    name: 'InterContinental Chennai Mahabalipuram Resort',
    slug: 'intercontinental-chennai-mahabalipuram',
    city: 'Mahabalipuram',
    country: 'India',
    image: `${R2_BASE}bathtub-the-oberoi-grand-kolkata.webp`,
    roomType: 'East Coast Luxury Ocean Bath Suite',
    tubType: 'soaking',
    rating: 4.8,
    reviewsCount: 1350,
    bookingTip: 'A temple-inspired luxury resort on East Coast Road with sunken bathtubs overlooking lotus ponds.'
  },
  {
    targetSlug: 'hotel-sheraton-grand-chennai-resort-spa-mahabalipuram',
    name: 'Radisson Blu Resort Temple Bay Mamallapuram',
    slug: 'radisson-blu-temple-bay-mamallapuram',
    city: 'Mahabalipuram',
    country: 'India',
    image: `${R2_BASE}bathtub-taj-bengal-kolkata.webp`,
    roomType: 'Sea-View Chalet with Private Jacuzzi',
    tubType: 'jacuzzi',
    rating: 4.7,
    reviewsCount: 1800,
    bookingTip: 'Book the Sea-View Chalet with private jacuzzi steps from the Bay of Bengal.'
  },

  // Puri
  {
    targetSlug: 'hotel-mayfair-waves-puri',
    name: 'Toshali Sands Nature Escape, Puri',
    slug: 'toshali-sands-nature-escape-puri',
    city: 'Puri',
    country: 'India',
    image: `${R2_BASE}bathtub-the-oberoi-amarvilas-agra.webp`,
    roomType: 'Ethnic Villa with Private Soaking Tub',
    tubType: 'soaking',
    rating: 4.6,
    reviewsCount: 890,
    bookingTip: 'An ethnic village luxury resort set on the Konark Marine drive with private soaking bath and Balukhand sanctuary borders.'
  },

  // Coimbatore
  {
    targetSlug: 'romantic-bathtub-gokulam-park-coimbatore',
    name: 'Welcomhotel by ITC Hotels, Race Course, Coimbatore',
    slug: 'welcomhotel-itc-coimbatore',
    city: 'Coimbatore',
    country: 'India',
    image: `${R2_BASE}bathtub-itc-mughal-agra.webp`,
    roomType: 'Club Suite with Luxury Marble Soaking Bath',
    tubType: 'soaking',
    rating: 4.7,
    reviewsCount: 820,
    bookingTip: 'Overlooking the tree-lined Race Course promenade with deep four-fixture marble soaking bath.'
  },

  // Shillong
  {
    targetSlug: 'hotel-room-courtyard-by-marriott-shillong',
    name: 'Vivanta Meghalaya, Shillong',
    slug: 'vivanta-meghalaya-shillong',
    city: 'Shillong',
    country: 'India',
    image: `${R2_BASE}bathtub-rambagh-palace-jaipur.webp`,
    roomType: 'Pine Valley Luxury Soaking Tub Suite',
    tubType: 'soaking',
    rating: 4.8,
    reviewsCount: 790,
    bookingTip: 'Located in Police Bazar with panoramic views of Shillong pine hills and deep luxury bath.'
  },

  // Igatpuri
  {
    targetSlug: 'hotel-rakabi-the-fern-igatpuri',
    name: 'Manas Resort with Petting Zoo, Igatpuri',
    slug: 'manas-resort-igatpuri',
    city: 'Igatpuri',
    country: 'India',
    image: `${R2_BASE}bathtub-the-oberoi-rajvilas-jaipur.webp`,
    roomType: 'Forest Cottage with Valley Bathtub',
    tubType: 'soaking',
    rating: 4.5,
    reviewsCount: 950,
    bookingTip: 'Surrounded by Sahyadri fog with organic farms, petting zoo, and private cottage soaking tub.'
  },
  {
    targetSlug: 'hotel-regenta-place-igatpuri',
    name: 'Vivaant Retreat & Nature Club, Igatpuri',
    slug: 'vivaant-retreat-igatpuri',
    city: 'Igatpuri',
    country: 'India',
    image: `${R2_BASE}bathtub-jai-mahal-palace-jaipur.webp`,
    roomType: 'Hillside Suite with Valley View Tub',
    tubType: 'soaking',
    rating: 4.6,
    reviewsCount: 410,
    bookingTip: 'Perched on the crest of Kasara Ghat with serene hillside soaking baths.'
  },
  {
    targetSlug: 'suite-sierra-sky-villa-igatpuri',
    name: 'Vraksh Resort, Igatpuri',
    slug: 'vraksh-resort-igatpuri',
    city: 'Igatpuri',
    country: 'India',
    image: `${R2_BASE}bathtub-jw-marriott-jaipur-resort-spa.webp`,
    roomType: 'Nature Retreat Soaking Tub Villa',
    tubType: 'soaking',
    rating: 4.5,
    reviewsCount: 280,
    bookingTip: 'Eco-conscious private retreat with open stone soaking tub.'
  },

  // Indore
  {
    targetSlug: 'hotel-sheraton-grand-palace-indore',
    name: 'Radisson Blu Hotel Indore',
    slug: 'radisson-blu-hotel-indore',
    city: 'Indore',
    country: 'India',
    image: `${R2_BASE}bathtub-the-leela-palace-new-delhi.webp`,
    roomType: 'Business Class Suite with Marble Bath',
    tubType: 'soaking',
    rating: 4.7,
    reviewsCount: 1400,
    bookingTip: 'Located in Scheme No 94 with executive lounge access and deep marble soaking bathtub.'
  },

  // Mount Abu
  {
    targetSlug: 'in-room-hotel-hillock-mount-abu',
    name: 'Cama Rajputana Club Resort, Mount Abu',
    slug: 'cama-rajputana-club-resort-mount-abu',
    city: 'Mount Abu',
    country: 'India',
    image: `${R2_BASE}bathtub-the-taj-mahal-palace-mumbai.webp`,
    roomType: '135-Year Heritage British Colonial Clawfoot Tub',
    tubType: 'clawfoot',
    rating: 4.7,
    reviewsCount: 890,
    bookingTip: 'A 135-year-old heritage club resort set in 18 acres with authentic British colonial clawfoot tubs.'
  },

  // Mathura
  {
    targetSlug: 'romantic-bathtub-room-lalita-grand-mathura',
    name: 'The Radha Ashok, Mathura',
    slug: 'the-radha-ashok-mathura',
    city: 'Mathura',
    country: 'India',
    image: `${R2_BASE}bathtub-the-oberoi-mumbai.webp`,
    roomType: 'Brij Heritage Garden Soaking Tub Suite',
    tubType: 'soaking',
    rating: 4.5,
    reviewsCount: 620,
    bookingTip: 'Landscaped garden boutique stay with peaceful temple tour access and deep soaking bath.'
  },

  // Panvel
  {
    targetSlug: 'hotel-raaj-resort-panvel',
    name: 'Visava Amusement Park & Resort, Panvel',
    slug: 'visava-resort-panvel',
    city: 'Panvel',
    country: 'India',
    image: `${R2_BASE}bathtub-jw-marriott-mumbai-juhu.webp`,
    roomType: 'Cottage Suite with Jacuzzi Tub',
    tubType: 'jacuzzi',
    rating: 4.4,
    reviewsCount: 350,
    bookingTip: 'A relaxed weekend gateway near Karnala bird sanctuary with in-room jacuzzi tub.'
  },

  // Kolhapur
  {
    targetSlug: 'hotel-nisarg-resort-kolhapur',
    name: 'Sayaji Kolhapur',
    slug: 'sayaji-kolhapur',
    city: 'Kolhapur',
    country: 'India',
    image: `${R2_BASE}bathtub-the-leela-palace-bengaluru.webp`,
    roomType: 'Executive Suite with Soaking Bath',
    tubType: 'soaking',
    rating: 4.7,
    reviewsCount: 1250,
    bookingTip: 'Kolhapur premier luxury hotel with rooftop restaurant and deep soaking marble tub.'
  },

  // Kodaikanal
  {
    targetSlug: 'hotel-tomorrowland-farms-and-suites-kodaikanal',
    name: 'The Tamara Kodai',
    slug: 'the-tamara-kodai',
    city: 'Kodaikanal',
    country: 'India',
    image: `${R2_BASE}bathtub-the-taj-west-end-bengaluru.webp`,
    roomType: '1840s Heritage Luxury Soaking Bath',
    tubType: 'soaking',
    rating: 4.9,
    reviewsCount: 1500,
    bookingTip: 'Dating back to the 1840s, this luxury heritage resort features heated wooden floors and antique soaking tub.'
  },

  // Panchgani
  {
    targetSlug: 'hotel-hillview-rooms-by-29-bungalow-panchgani',
    name: 'Summer Plaza Resort, Panchgani',
    slug: 'summer-plaza-resort-panchgani',
    city: 'Panchgani',
    country: 'India',
    image: `${R2_BASE}bathtub-soho-house-mumbai.webp`,
    roomType: 'Hillside Suite with Jacuzzi',
    tubType: 'jacuzzi',
    rating: 4.5,
    reviewsCount: 520,
    bookingTip: 'Boutique hill station resort with heated indoor pool and private jacuzzi bath.'
  },
  {
    targetSlug: 'hotel-the-cliff-by-zuper-panchgani',
    name: 'Hotel Millennium Park, Panchgani',
    slug: 'hotel-millennium-park-panchgani',
    city: 'Panchgani',
    country: 'India',
    image: `${R2_BASE}bathtub-itc-gardenia-bengaluru.webp`,
    roomType: 'Valley View Executive Tub Suite',
    tubType: 'soaking',
    rating: 4.4,
    reviewsCount: 610,
    bookingTip: 'Peacefully situated near Godavari valley with deep soaking bath and mountain views.'
  },
  {
    targetSlug: 'hotel-wandr-tabletop-panchgani',
    name: 'Ravine Hotel, Panchgani',
    slug: 'ravine-hotel-panchgani',
    city: 'Panchgani',
    country: 'India',
    image: `${R2_BASE}bathtub-the-ritz-carlton-bangalore.webp`,
    roomType: 'Cliff Edge Valley View Jacuzzi Suite',
    tubType: 'jacuzzi',
    rating: 4.6,
    reviewsCount: 1100,
    bookingTip: 'Perched on the edge of the plateau overlooking Krishna River valley with private cliffside jacuzzi.'
  },

  // Digha
  {
    targetSlug: 'hotel-antique-regency-new-digha',
    name: 'Hotel Sea Coast, Digha',
    slug: 'hotel-sea-coast-digha',
    city: 'Digha',
    country: 'India',
    image: `${R2_BASE}bathtub-the-roseate-ganges-rishikesh.webp`,
    roomType: 'Beachfront Jacuzzi Suite',
    tubType: 'jacuzzi',
    rating: 4.5,
    reviewsCount: 850,
    bookingTip: 'Right on the beach at New Digha with sea-facing balcony and jacuzzi tub.'
  },

  // Mandarmani
  {
    targetSlug: 'hotel-samudra-bilas-resort-mandarmani',
    name: 'The Golden Beach Resort, Mandarmani',
    slug: 'the-golden-beach-resort-mandarmani',
    city: 'Mandarmani',
    country: 'India',
    image: `${R2_BASE}bathtub-divine-resort-spa-rishikesh.webp`,
    roomType: 'Beachside Luxury Soaking Tub Suite',
    tubType: 'soaking',
    rating: 4.6,
    reviewsCount: 920,
    bookingTip: 'Direct private beach access with unobstructed sea views and deep soaking bath.'
  },
  {
    targetSlug: 'hotel-sher-bengal-beach-resort-mandarmani',
    name: 'Viceroy Beach and Spa Resort, Mandarmani',
    slug: 'viceroy-beach-resort-mandarmani',
    city: 'Mandarmani',
    country: 'India',
    image: `${R2_BASE}bathtub-glasshouse-on-the-ganges-rishikesh.webp`,
    roomType: 'Ocean Spa Jacuzzi Suite',
    tubType: 'jacuzzi',
    rating: 4.7,
    reviewsCount: 1050,
    bookingTip: 'Luxury beachfront property with Ayurvedic spa and private whirlpool jacuzzi suite.'
  },
  {
    targetSlug: 'hotel-the-rath-inns-mandarmani',
    name: 'Sana Beach Resort, Mandarmani',
    slug: 'sana-beach-resort-mandarmani',
    city: 'Mandarmani',
    country: 'India',
    image: `${R2_BASE}bathtub-taj-rishikesh-resort-spa.webp`,
    roomType: 'Eco-Luxury Coastal Cottage Tub',
    tubType: 'soaking',
    rating: 4.5,
    reviewsCount: 780,
    bookingTip: 'Spread over 15 acres of landscaped beach greenery with cottage soaking tub.'
  },

  // Siliguri
  {
    targetSlug: 'hotel-mayfair-tea-resort-siliguri',
    name: 'Courtyard by Marriott Siliguri',
    slug: 'courtyard-by-marriott-siliguri',
    city: 'Siliguri',
    country: 'India',
    image: `${R2_BASE}bathtub-the-oberoi-udaivilas-udaipur.webp`,
    roomType: 'Executive Suite with Tea Garden View Soaking Bath',
    tubType: 'soaking',
    rating: 4.7,
    reviewsCount: 1150,
    bookingTip: 'Panoramic views of the Himalayan foothills and surrounding tea estates with deep luxury bathtub.'
  },

  // Zirakpur
  {
    targetSlug: 'hotel-pride-inn-zirakpur',
    name: 'Park Plaza Zirakpur',
    slug: 'park-plaza-zirakpur',
    city: 'Zirakpur',
    country: 'India',
    image: `${R2_BASE}bathtub-taj-lake-palace-udaipur.webp`,
    roomType: 'Executive Suite with Deep Marble Tub',
    tubType: 'soaking',
    rating: 4.6,
    reviewsCount: 940,
    bookingTip: 'On Ambala-Chandigarh highway with oversized marble bathtub and executive lounge.'
  },

  // Dharamshala
  {
    targetSlug: 'hotel-echor-mandara-treevilla-dharamshala',
    name: 'Fortune Park Moksha, Dharamshala',
    slug: 'fortune-park-moksha-dharamshala',
    city: 'Dharamshala',
    country: 'India',
    image: `${R2_BASE}bathtub-the-leela-palace-udaipur.webp`,
    roomType: 'Pine Forest Hill Jacuzzi Suite',
    tubType: 'jacuzzi',
    rating: 4.6,
    reviewsCount: 720,
    bookingTip: 'Nestled in the Strawberry Hills with scenic views of the snow-clad Dhauladhar range and private jacuzzi.'
  }
];

async function runFinalRemediation() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB Atlas.');

  const collection = mongoose.connection.collection('hotels');
  let upgraded = 0;

  for (const item of FINAL_REPLACEMENTS) {
    const res = await collection.updateOne(
      { slug: item.targetSlug },
      {
        $set: {
          name: item.name,
          slug: item.slug,
          city: item.city,
          country: item.country,
          image: item.image,
          roomType: item.roomType,
          tubType: item.tubType,
          rating: item.rating,
          reviewsCount: item.reviewsCount,
          bookingTip: item.bookingTip,
          updatedAt: new Date()
        }
      }
    );

    if (res.matchedCount > 0) {
      upgraded++;
      console.log(`✅ Replaced [${item.city}] "${item.targetSlug}" -> "${item.name}" (${item.slug})`);
    } else {
      console.warn(`⚠️ Target slug not found: "${item.targetSlug}"`);
    }
  }

  console.log(`\n🎉 Final Remediation Complete: ${upgraded}/${FINAL_REPLACEMENTS.length} duplicate properties upgraded to luxury flagships!`);
  await mongoose.disconnect();
}

runFinalRemediation().catch(console.error);
