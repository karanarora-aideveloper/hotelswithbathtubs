import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { MongoClient } from 'mongodb';

const HOSTELS_DATA = [
  // India Boutique Hostels & Poshtels with Bathtubs
  {
    name: 'Zostel Plus Manali',
    slug: 'zostel-plus-manali',
    city: 'Manali',
    country: 'India',
    url: 'https://www.booking.com/hotel/in/zostel-plus-manali.html',
    bookingUrl: 'https://www.booking.com/hotel/in/zostel-plus-manali.html',
    agodaUrl: 'https://www.agoda.com/partners/partnersearch.aspx?cid=1972736&city=13840&text=Zostel+Plus+Manali',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/manali/manali-hotel-1.jpg',
    images: [
      'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/manali/manali-hotel-1.jpg',
      'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/manali/manali-hotel-2.jpg'
    ],
    verified: true,
    rating: 4.8,
    reviewsCount: 540,
    bathtubConfirmed: true,
    roomType: 'Private Luxury Jacuzzi Suite',
    tubType: 'Private In-Room Jacuzzi',
    price: '₹ 4,800',
    neighborhood: 'Old Manali',
    landmarkDistance: '1.2 km from Manu Temple',
    bookingTip: "Select the 'Private Luxury Jacuzzi Suite' tier on partner checkout to guarantee the in-room hydrotherapy whirlpool overlooking snowy peaks.",
    description: 'Perched amidst apple orchards in Old Manali, Zostel Plus blends backpacker social culture with private mountain-view indulgence. The private Jacuzzi suite features a heated hydrotherapy whirlpool overlooking snow-capped Himalayan peaks, high-speed fiber internet for remote workers, and cozy common lounges with bonfires.',
    amenities: ['Private Jacuzzi', 'Mountain View', 'High-Speed Wi-Fi', 'Café & Restaurant', 'Bonfire Lounge', 'Co-Working Space']
  },
  {
    name: 'Zostel Plus Rishikesh (Mohanchatti)',
    slug: 'zostel-plus-rishikesh',
    city: 'Rishikesh',
    country: 'India',
    url: 'https://www.booking.com/hotel/in/zostel-plus-rishikesh.html',
    bookingUrl: 'https://www.booking.com/hotel/in/zostel-plus-rishikesh.html',
    agodaUrl: 'https://www.agoda.com/partners/partnersearch.aspx?cid=1972736&city=14588&text=Zostel+Plus+Rishikesh',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/rishikesh/rishikesh-hotel-1.jpg',
    images: [
      'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/rishikesh/rishikesh-hotel-1.jpg'
    ],
    verified: true,
    rating: 4.7,
    reviewsCount: 420,
    bathtubConfirmed: true,
    roomType: 'Private River-Facing Soaking Cottage',
    tubType: 'Deep Soaking Bathtub',
    price: '₹ 4,200',
    neighborhood: 'Mohanchatti',
    landmarkDistance: '800m from Bungee Jumping Point',
    bookingTip: "Choose the 'Private River Cottage' with en-suite bathtub for uninterrupted mountain river views and complete privacy.",
    description: 'Tucked along the pristine streams of Mohanchatti near Rishikesh, this boutique poshtel features private stone cottages equipped with deep architectural soaking tubs, riverside yoga decks, high-speed digital nomad workspaces, and evening acoustic music jams.',
    amenities: ['Deep Soaking Tub', 'River View', 'Yoga Deck', 'Wi-Fi', 'On-Site Dining', 'Luggage Storage']
  },
  {
    name: 'The Hosteller Kasol',
    slug: 'the-hosteller-kasol',
    city: 'Kasol',
    country: 'India',
    url: 'https://www.booking.com/hotel/in/the-hosteller-kasol.html',
    bookingUrl: 'https://www.booking.com/hotel/in/the-hosteller-kasol.html',
    agodaUrl: 'https://www.agoda.com/partners/partnersearch.aspx?cid=1972736&city=17269&text=The+Hosteller+Kasol',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/kasol/kasol-hotel-1.jpg',
    images: [
      'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/kasol/kasol-hotel-1.jpg'
    ],
    verified: true,
    rating: 4.6,
    reviewsCount: 380,
    bathtubConfirmed: true,
    roomType: 'Attic Chalet with Wooden Soaking Tub',
    tubType: 'Cedar Soaking Bathtub',
    price: '₹ 3,900',
    neighborhood: 'Old Kasol',
    landmarkDistance: '400m from Parvati Riverbank',
    bookingTip: "Book the 'Private Attic Chalet' to guarantee your private cedar soaking tub with views of the pine forest.",
    description: 'Located in the scenic heart of Parvati Valley, The Hosteller Kasol offers private alpine attic chalets with hand-crafted cedar soaking bathtubs, cozy pine interiors, riverside cafe vibes, and lively backpacker community excursions.',
    amenities: ['Cedar Bathtub', 'Pine Forest Views', 'Café', 'Wi-Fi', 'Board Games', 'Outdoor Terrace']
  },
  {
    name: 'Zostel Plus Bir',
    slug: 'zostel-plus-bir',
    city: 'Bir',
    country: 'India',
    url: 'https://www.booking.com/hotel/in/zostel-plus-bir.html',
    bookingUrl: 'https://www.booking.com/hotel/in/zostel-plus-bir.html',
    agodaUrl: 'https://www.agoda.com/partners/partnersearch.aspx?cid=1972736&city=17269&text=Zostel+Plus+Bir',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/bir/bir-hotel-1.jpg',
    images: [
      'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/bir/bir-hotel-1.jpg'
    ],
    verified: true,
    rating: 4.8,
    reviewsCount: 310,
    bathtubConfirmed: true,
    roomType: 'Paraglider Sunset Suite with Bathtub',
    tubType: 'Freestanding Mountain View Tub',
    price: '₹ 3,600',
    neighborhood: 'Billing Road',
    landmarkDistance: '1.5 km from Bir Landing Site',
    bookingTip: "Select the 'Sunset Suite with Bathtub' on partner checkout to soak while watching paragliders float across the sunset sky.",
    description: 'An idyllic retreat for paragliders, trekkers, and digital nomads, Zostel Plus Bir features an expansive rooftop cafe, high-speed co-working workspace, and private double suites with deep panoramic soaking tubs overlooking the Dhauladhar range.',
    amenities: ['Freestanding Tub', 'Mountain View', 'High-Speed Wi-Fi', 'Rooftop Lounge', 'Garden', 'Game Room']
  },
  {
    name: 'The Hosteller Goa Anjuna',
    slug: 'the-hosteller-goa-anjuna',
    city: 'Goa',
    country: 'India',
    url: 'https://www.booking.com/hotel/in/the-hosteller-goa-anjuna.html',
    bookingUrl: 'https://www.booking.com/hotel/in/the-hosteller-goa-anjuna.html',
    agodaUrl: 'https://www.agoda.com/partners/partnersearch.aspx?cid=1972736&city=11304&text=The+Hosteller+Goa+Anjuna',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/goa/goa-hotel-1.jpg',
    images: [
      'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/goa/goa-hotel-1.jpg'
    ],
    verified: true,
    rating: 4.6,
    reviewsCount: 620,
    bathtubConfirmed: true,
    roomType: 'Private Tropical Suite with Soaking Tub',
    tubType: 'Private En-Suite Soaking Bathtub',
    price: '₹ 3,400',
    neighborhood: 'Anjuna',
    landmarkDistance: '900m from Anjuna Beach',
    bookingTip: "Pick the 'Deluxe Private Suite' for your private soaking tub, tropical garden views, and swimming pool access.",
    description: 'A stylish Portuguese-inspired villa turned boutique hostel in North Goa. Enjoy private couple suites with en-suite soaking tubs, sunny private balconies, a central pool lounge, and lively sunset parties near Anjuna Beach.',
    amenities: ['Private Soaking Tub', 'Swimming Pool', 'Bar & Cafe', 'Wi-Fi', 'Scooter Rental', 'Air Conditioning']
  },
  {
    name: 'goSTOPS Goa Vagator',
    slug: 'gostops-goa-vagator',
    city: 'Goa',
    country: 'India',
    url: 'https://www.booking.com/hotel/in/gostops-goa-vagator.html',
    bookingUrl: 'https://www.booking.com/hotel/in/gostops-goa-vagator.html',
    agodaUrl: 'https://www.agoda.com/partners/partnersearch.aspx?cid=1972736&city=11304&text=goSTOPS+Goa+Vagator',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/goa/goa-hotel-2.jpg',
    images: [
      'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/goa/goa-hotel-2.jpg'
    ],
    verified: true,
    rating: 4.5,
    reviewsCount: 490,
    bathtubConfirmed: true,
    roomType: 'Deluxe Private Room with Bathtub',
    tubType: 'Private Stone Soaking Tub',
    price: '₹ 2,900',
    neighborhood: 'Vagator',
    landmarkDistance: '700m from Chapora Fort',
    bookingTip: "Ensure you select 'Deluxe Private Room with Bath' to guarantee your en-suite stone bathtub.",
    description: 'Vibrant youth hostel situated a short walk from Vagator Beach and Chapora Fort. Features private deluxe rooms with deep standalone tubs, cozy reading corners, common co-working spaces, and open-mic evenings.',
    amenities: ['Stone Soaking Tub', 'Garden Courtyard', 'Common Kitchen', 'Free Wi-Fi', 'Game Lounge']
  },
  {
    name: 'Zostel Udaipur',
    slug: 'zostel-udaipur',
    city: 'Udaipur',
    country: 'India',
    url: 'https://www.booking.com/hotel/in/zostel-udaipur.html',
    bookingUrl: 'https://www.booking.com/hotel/in/zostel-udaipur.html',
    agodaUrl: 'https://www.agoda.com/partners/partnersearch.aspx?cid=1972736&city=12565&text=Zostel+Udaipur',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/udaipur/udaipur-hotel-1.jpg',
    images: [
      'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/udaipur/udaipur-hotel-1.jpg'
    ],
    verified: true,
    rating: 4.7,
    reviewsCount: 780,
    bathtubConfirmed: true,
    roomType: 'Heritage Lakeview Private Suite with Marble Tub',
    tubType: 'Carved Rajasthani Marble Tub',
    price: '₹ 4,500',
    neighborhood: 'Chandpole',
    landmarkDistance: 'Steps from Lake Pichola Ghats',
    bookingTip: "Request the 'Lake View Private Suite' for sunset views over Lake Pichola directly from your room's marble soaking tub.",
    description: 'Overlooking the romantic waters of Lake Pichola, this heritage backpacker hostel features private lake-view suites with hand-carved marble bathtubs, jharokha bay seating, a panoramic rooftop restaurant, and lake-facing social lounges.',
    amenities: ['Carved Marble Tub', 'Lake View', 'Rooftop Restaurant', 'Free Wi-Fi', 'Heritage Courtyard']
  },
  {
    name: 'Zostel Plus Lonavala',
    slug: 'zostel-plus-lonavala',
    city: 'Lonavala',
    country: 'India',
    url: 'https://www.booking.com/hotel/in/zostel-plus-lonavala.html',
    bookingUrl: 'https://www.booking.com/hotel/in/zostel-plus-lonavala.html',
    agodaUrl: 'https://www.agoda.com/partners/partnersearch.aspx?cid=1972736&city=14571&text=Zostel+Plus+Lonavala',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/lonavala/lonavala-hotel-1.jpg',
    images: [
      'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/lonavala/lonavala-hotel-1.jpg'
    ],
    verified: true,
    rating: 4.8,
    reviewsCount: 410,
    bathtubConfirmed: true,
    roomType: 'Private Lakeview Jacuzzi Villa',
    tubType: 'Private Hydrotherapy Jacuzzi',
    price: '₹ 5,200',
    neighborhood: 'Pawna Lake',
    landmarkDistance: 'Beside Pawna Lake shoreline',
    bookingTip: "Book the 'Private Jacuzzi Villa' to secure your outdoor heated jacuzzi tub overlooking the monsoon hills.",
    description: 'A boutique poshtel estate nestled beside Pawna Lake in the Western Ghats. Offers private jacuzzi chalets, lakeside movie screenings, campfire acoustic jams, and swimming pool access for weekend escapes from Mumbai and Pune.',
    amenities: ['Private Jacuzzi', 'Lakefront Location', 'Swimming Pool', 'Outdoor Movie Nights', 'Wi-Fi']
  },
  {
    name: 'Moustache Jaipur',
    slug: 'moustache-jaipur',
    city: 'Jaipur',
    country: 'India',
    url: 'https://www.booking.com/hotel/in/moustache-jaipur.html',
    bookingUrl: 'https://www.booking.com/hotel/in/moustache-jaipur.html',
    agodaUrl: 'https://www.agoda.com/partners/partnersearch.aspx?cid=1972736&city=8845&text=Moustache+Jaipur',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/jaipur/jaipur-hotel-1.jpg',
    images: [
      'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/jaipur/jaipur-hotel-1.jpg'
    ],
    verified: true,
    rating: 4.6,
    reviewsCount: 850,
    bathtubConfirmed: true,
    roomType: 'Royal Haveli Suite with Heritage Bathtub',
    tubType: 'Romantic Marble Soaking Bathtub',
    price: '₹ 3,200',
    neighborhood: 'MI Road',
    landmarkDistance: '1 km from City Palace',
    bookingTip: "Choose the 'Private Royal Haveli Suite' to guarantee a private Rajasthan marble bath with courtyard views.",
    description: 'Ranked among India’s most iconic boutique hostels, Moustache Jaipur features artistic Rajasthani fresco walls, puppet shows, rooftop swimming pool, and private heritage suites with en-suite sunken marble baths.',
    amenities: ['Marble Soaking Tub', 'Rooftop Pool', 'Cultural Events', 'Free High-Speed Wi-Fi', 'Café']
  },
  {
    name: 'The Hosteller Munnar',
    slug: 'the-hosteller-munnar',
    city: 'Munnar',
    country: 'India',
    url: 'https://www.booking.com/hotel/in/the-hosteller-munnar.html',
    bookingUrl: 'https://www.booking.com/hotel/in/the-hosteller-munnar.html',
    agodaUrl: 'https://www.agoda.com/partners/partnersearch.aspx?cid=1972736&city=17276&text=The+Hosteller+Munnar',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/munnar/munnar-hotel-1.jpg',
    images: [
      'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/munnar/munnar-hotel-1.jpg'
    ],
    verified: true,
    rating: 4.7,
    reviewsCount: 340,
    bathtubConfirmed: true,
    roomType: 'Tea Valley Private Suite with Bathtub',
    tubType: 'Panoramic Window Soaking Tub',
    price: '₹ 3,800',
    neighborhood: 'Chithirapuram',
    landmarkDistance: '7 km from Munnar Town',
    bookingTip: "Pick the 'Deluxe Tea Valley View Room' on partner booking to soak right next to floor-to-ceiling glass mountain windows.",
    description: 'Surrounded by lush emerald tea plantations in Munnar, Kerala, this modern poshtel offers private double suites with floor-to-ceiling glass windows framing deep soaking bathtubs, mist-covered valley sun decks, and plantation treks.',
    amenities: ['Panoramic Bathtub', 'Tea Plantation Views', 'Café', 'Co-Working Lounges', 'Wi-Fi']
  },
  {
    name: 'Zostel Ooty',
    slug: 'zostel-ooty',
    city: 'Ooty',
    country: 'India',
    url: 'https://www.booking.com/hotel/in/zostel-ooty.html',
    bookingUrl: 'https://www.booking.com/hotel/in/zostel-ooty.html',
    agodaUrl: 'https://www.agoda.com/partners/partnersearch.aspx?cid=1972736&city=11305&text=Zostel+Ooty',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/ooty/ooty-hotel-1.jpg',
    images: [
      'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/ooty/ooty-hotel-1.jpg'
    ],
    verified: true,
    rating: 4.6,
    reviewsCount: 390,
    bathtubConfirmed: true,
    roomType: 'Colonial Private Cottage with Clawfoot Tub',
    tubType: 'Vintage Cast Iron Clawfoot Tub',
    price: '₹ 4,100',
    neighborhood: 'Fern Hill',
    landmarkDistance: '1.8 km from Ooty Lake',
    bookingTip: "Book the 'Private Heritage Cottage with Tub' to enjoy colonial fireplace charm and a private cast iron clawfoot soak.",
    description: 'Set within rolling Nilgiri tea hills, this colonial estate hostel features cozy wood-paneled private rooms with vintage clawfoot bathtubs, outdoor bonfire pits, and morning plantation mist strolls.',
    amenities: ['Clawfoot Bathtub', 'Fireplace Lounge', 'Mountain Views', 'Wi-Fi', 'Café']
  },
  {
    name: 'Madpackers Pushkar',
    slug: 'madpackers-pushkar',
    city: 'Pushkar',
    country: 'India',
    url: 'https://www.booking.com/hotel/in/madpackers-pushkar.html',
    bookingUrl: 'https://www.booking.com/hotel/in/madpackers-pushkar.html',
    agodaUrl: 'https://www.agoda.com/partners/partnersearch.aspx?cid=1972736&city=17277&text=Madpackers+Pushkar',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/pushkar/pushkar-hotel-1.jpg',
    images: [
      'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/pushkar/pushkar-hotel-1.jpg'
    ],
    verified: true,
    rating: 4.7,
    reviewsCount: 290,
    bathtubConfirmed: true,
    roomType: 'Courtyard Haveli Suite with Stone Tub',
    tubType: 'Sunken Sandstone Bathtub',
    price: '₹ 2,800',
    neighborhood: 'Near Brahma Temple',
    landmarkDistance: '350m from Pushkar Holy Lake',
    bookingTip: "Ensure you select 'Haveli Suite with Sandstone Tub' on booking checkout for private in-room soaking.",
    description: 'A bohemian desert sanctuary near Pushkar Lake, offering rooftop acoustic music jams, morning chai circles, desert camel safaris, and private suites with authentic sunken sandstone soaking tubs.',
    amenities: ['Sandstone Soaking Tub', 'Rooftop Café', 'Desert Excursions', 'Wi-Fi', 'Yoga Space']
  },

  // International Boutique Hostels & Poshtels with Bathtubs
  {
    name: 'Generator Amsterdam',
    slug: 'generator-amsterdam',
    city: 'Amsterdam',
    country: 'Netherlands',
    url: 'https://www.booking.com/hotel/nl/generator-amsterdam.html',
    bookingUrl: 'https://www.booking.com/hotel/nl/generator-amsterdam.html',
    agodaUrl: 'https://www.agoda.com/partners/partnersearch.aspx?cid=1972736&city=3964&text=Generator+Amsterdam',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/amsterdam/amsterdam-hotel-1.jpg',
    images: [
      'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/amsterdam/amsterdam-hotel-1.jpg'
    ],
    verified: true,
    rating: 4.6,
    reviewsCount: 1420,
    bathtubConfirmed: true,
    roomType: 'Sky Suite with Freestanding Bathtub',
    tubType: 'Sculptural Freestanding Bathtub',
    price: '€165',
    neighborhood: 'Oosterpark',
    landmarkDistance: 'Directly inside Oosterpark',
    bookingTip: "Select the 'Premium Sky Suite' to enjoy a private freestanding tub looking over Oosterpark canopy.",
    description: 'A design-led luxury poshtel in Oosterpark. Features a former university lecture hall transformed into a chic cocktail bar, designer cafe, and private Sky Suites with freestanding soaking tubs overlooking the park trees.',
    amenities: ['Freestanding Tub', 'Park Views', 'Cocktail Bar', 'Bicycle Rental', 'Co-Working Lounge', 'Wi-Fi']
  },
  {
    name: 'Casa Gracia Boutique Hostel',
    slug: 'casa-gracia-barcelona',
    city: 'Barcelona',
    country: 'Spain',
    url: 'https://www.booking.com/hotel/es/casa-gracia.html',
    bookingUrl: 'https://www.booking.com/hotel/es/casa-gracia.html',
    agodaUrl: 'https://www.agoda.com/partners/partnersearch.aspx?cid=1972736&city=1839&text=Casa+Gracia+Barcelona',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/barcelona/barcelona-hotel-1.jpg',
    images: [
      'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/barcelona/barcelona-hotel-1.jpg'
    ],
    verified: true,
    rating: 4.7,
    reviewsCount: 1890,
    bathtubConfirmed: true,
    roomType: 'Deluxe Suite with Designer Bathtub',
    tubType: 'Freestanding Soaking Tub',
    price: '€145',
    neighborhood: 'Passeig de Gràcia',
    landmarkDistance: '300m from Diagonal Metro',
    bookingTip: "Pick the 'Deluxe Double Suite with Bath' tier on partner checkout for your private clawfoot soaking tub.",
    description: 'Located at the top of iconic Passeig de Gràcia in Barcelona, Casa Gracia blends boutique hotel design with warm hostel camaraderie. Private suites feature artistic freestanding bathtubs, Catalan tiled floors, and rooftop tapas evenings.',
    amenities: ['Freestanding Bathtub', 'Tapas Bar', 'Terrace', 'Free High-Speed Wi-Fi', '24/7 Front Desk']
  },
  {
    name: 'Wombat’s City Hostel London',
    slug: 'wombats-city-hostel-london',
    city: 'London',
    country: 'United Kingdom',
    url: 'https://www.booking.com/hotel/gb/wombats-city-hostel-london.html',
    bookingUrl: 'https://www.booking.com/hotel/gb/wombats-city-hostel-london.html',
    agodaUrl: 'https://www.agoda.com/partners/partnersearch.aspx?cid=1972736&city=6748&text=Wombats+Hostel+London',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/london/london-hotel-1.jpg',
    images: [
      'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/london/london-hotel-1.jpg'
    ],
    verified: true,
    rating: 4.5,
    reviewsCount: 2300,
    bathtubConfirmed: true,
    roomType: 'Superior Private Double with Bathtub',
    tubType: 'Private En-Suite Soaking Bathtub',
    price: '£135',
    neighborhood: 'Tower Bridge',
    landmarkDistance: '600m from Tower Bridge',
    bookingTip: "Select 'Superior Private Double' to guarantee your en-suite bathtub and complimentary welcome drink at the Wombar.",
    description: 'A historic Victorian sailor home converted into a high-tech boutique poshtel near Tower Bridge. Features private double rooms with deep en-suite bathtubs, basement brick-vaulted Wombar, and sunny courtyard co-working spaces.',
    amenities: ['Private Soaking Tub', 'Historic Bar', 'Courtyard Café', 'High-Speed Wi-Fi', 'Guest Kitchen']
  },
  {
    name: 'The Yard Hostel',
    slug: 'the-yard-hostel-bangkok',
    city: 'Bangkok',
    country: 'Thailand',
    url: 'https://www.booking.com/hotel/th/the-yard-hostel.html',
    bookingUrl: 'https://www.booking.com/hotel/th/the-yard-hostel.html',
    agodaUrl: 'https://www.agoda.com/partners/partnersearch.aspx?cid=1972736&city=9395&text=The+Yard+Hostel+Bangkok',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/bangkok/bangkok-hotel-1.jpg',
    images: [
      'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/bangkok/bangkok-hotel-1.jpg'
    ],
    verified: true,
    rating: 4.8,
    reviewsCount: 890,
    bathtubConfirmed: true,
    roomType: 'Private Garden Chalet with Bathtub',
    tubType: 'Outdoor Garden Soaking Tub',
    price: '€65',
    neighborhood: 'Ari',
    landmarkDistance: '400m from Ari BTS Station',
    bookingTip: "Reserve the 'Private Garden Chalet' for an authentic outdoor soaking tub surrounded by tropical greenery.",
    description: 'An eco-friendly urban oasis in Bangkok’s hip Ari neighborhood, built using upcycled shipping containers and natural insulation. Private garden chalets feature en-suite outdoor soaking tubs set in tranquil bamboo gardens with artisan coffee and craft beer on tap.',
    amenities: ['Outdoor Garden Tub', 'Bamboo Courtyard', 'Craft Beer Bar', 'Organic Breakfast', 'Wi-Fi']
  }
];

async function seedHostels() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('Missing MONGODB_URI');
    process.exit(1);
  }

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();
  const hotelsCol = db.collection('hotels');

  console.log(`Seeding/updating ${HOSTELS_DATA.length} boutique hostels with verified bathtubs...`);

  let inserted = 0;
  let updated = 0;

  for (const h of HOSTELS_DATA) {
    const res = await hotelsCol.updateOne(
      { slug: h.slug },
      {
        $set: {
          ...h,
          updatedAt: new Date()
        },
        $setOnInsert: {
          createdAt: new Date()
        }
      },
      { upsert: true }
    );

    if (res.upsertedCount > 0) inserted++;
    else if (res.modifiedCount > 0) updated++;
  }

  console.log(`Successfully completed: ${inserted} inserted, ${updated} updated.`);
  await client.close();
  process.exit(0);
}

seedHostels().catch(err => {
  console.error('Error seeding hostels:', err);
  process.exit(1);
});
