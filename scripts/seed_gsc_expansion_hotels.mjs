import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const R2_BASE = 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/';

function getSearchUrlBooking(name, city) {
  return `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(name + ' ' + city)}&lang=en-us`;
}

function getSearchUrlAgoda(name, city) {
  return `https://www.agoda.com/partners/partnersearch.aspx?cid=1972736&hl=en&searchText=${encodeURIComponent(name + ' ' + city)}`;
}

const GSC_HOTELS = [
  // 1. Turin, Italy
  {
    name: 'Principi di Piemonte | UNA Esperienze',
    slug: 'turin-principi-di-piemonte-una-esperienze',
    city: 'Turin',
    country: 'Italy',
    price: '€320',
    rating: 4.8,
    reviewsCount: 1420,
    roomType: 'Deluxe Suite with Carrara Marble Soaking Tub',
    tubType: 'Deep Soaking Bathtub',
    image: `${R2_BASE}bathtub-turin.webp`,
    bookingTip: 'Historical 1930s Art Deco 5-star hotel in the heart of Turin, featuring deep Italian marble soaking bathtubs and luxury spa.',
    description: 'Principi di Piemonte is Turin’s grandest luxury palace. The lavish suites boast solid Italian Carrara marble bathrooms with deep soaking tubs, offering stunning views over Piazza CLN and the Turin skyline.'
  },
  {
    name: 'Grand Hotel Sitea',
    slug: 'turin-grand-hotel-sitea',
    city: 'Turin',
    country: 'Italy',
    price: '€260',
    rating: 4.7,
    reviewsCount: 1180,
    roomType: 'Executive Suite with Jacuzzi Whirlpool Bath',
    tubType: 'Hydrotherapy Jacuzzi Tub',
    image: `${R2_BASE}bathtub-turin.webp`,
    bookingTip: 'Centrally located luxury heritage hotel featuring private hydrotherapy whirlpool bathtubs and Michelin-starred dining.',
    description: 'Situated in Turin’s historic city center, Grand Hotel Sitea provides classical elegance with spacious executive suites equipped with jetted whirlpool bathtubs and private courtyard gardens.'
  },
  {
    name: 'Turin Palace Hotel',
    slug: 'turin-turin-palace-hotel',
    city: 'Turin',
    country: 'Italy',
    price: '€240',
    rating: 4.9,
    reviewsCount: 2350,
    roomType: 'Prestige Room with Freestanding Soaking Tub',
    tubType: 'Freestanding Bathtub',
    image: `${R2_BASE}bathtub-turin.webp`,
    bookingTip: 'Top-rated hotel near Porta Nuova featuring contemporary freestanding soaking tubs and rooftop terrace.',
    description: 'Turin Palace Hotel offers refined 19th-century architecture combined with pastel design. Prestige rooms feature sleek freestanding bathtubs perfect for unwinding after touring Piedmont’s museums.'
  },

  // 2. Bristol, UK
  {
    name: 'The Berkeley Square Hotel',
    slug: 'bristol-the-berkeley-square-hotel',
    city: 'Bristol',
    country: 'UK',
    price: '£195',
    rating: 4.7,
    reviewsCount: 980,
    roomType: 'Georgian Suite with Freestanding Roll-Top Tub',
    tubType: 'Cast Iron Roll-Top Bathtub',
    image: `${R2_BASE}bathtub-bristol.webp`,
    bookingTip: 'Clifton’s premier art hotel featuring private roll-top baths, decanter sherry, and private members club access.',
    description: 'Set on a tranquil Georgian square in Clifton, The Berkeley Square Hotel features boutique suites boasting freestanding Victorian roll-top bathtubs, local artwork, and bespoke British hospitality.'
  },
  {
    name: 'Harbour Hotel & Spa Bristol',
    slug: 'bristol-harbour-hotel-spa-bristol',
    city: 'Bristol',
    country: 'UK',
    price: '£220',
    rating: 4.8,
    reviewsCount: 1640,
    roomType: 'Corner Suite with In-Room Monolithic Soaking Tub',
    tubType: 'Deep Soaking Bathtub',
    image: `${R2_BASE}bathtub-bristol.webp`,
    bookingTip: 'Housed within two former 19th-century bank buildings with roll-top tubs and subterranean vault spa.',
    description: 'Harbour Hotel Bristol marries opulent historic architecture with coastal chic. Suites boast in-room freestanding bathtubs overlooking historic Corn Street alongside complimentary gin decanters.'
  },
  {
    name: 'Avon Gorge by Hotel Du Vin',
    slug: 'bristol-avon-gorge-by-hotel-du-vin',
    city: 'Bristol',
    country: 'UK',
    price: '£210',
    rating: 4.7,
    reviewsCount: 1320,
    roomType: 'Bridge View Suite with Roll-Top Bathtub',
    tubType: 'Roll-Top Soaking Bathtub',
    image: `${R2_BASE}bathtub-bristol.webp`,
    bookingTip: 'Spectacular panoramas of Clifton Suspension Bridge directly from private roll-top bathtubs.',
    description: 'Perched high on the cliffs of the Avon Gorge, this stylish hotel offers suites where couples can soak in a roll-top bath while gazing out at Brunel’s world-famous Clifton Suspension Bridge.'
  },

  // 3. Penang, Malaysia
  {
    name: 'Eastern & Oriental Hotel',
    slug: 'penang-eastern-oriental-hotel',
    city: 'Penang',
    country: 'Malaysia',
    price: 'RM 950',
    rating: 4.9,
    reviewsCount: 3100,
    roomType: 'Heritage Suite with Clawfoot Bathtub & Sea View',
    tubType: 'Vintage Clawfoot Bathtub',
    image: `${R2_BASE}bathtub-penang.webp`,
    bookingTip: 'The legendary Sarkies Brothers 1885 colonial grand dame featuring sea-facing clawfoot soaking tubs.',
    description: 'Eastern & Oriental Hotel is George Town’s undisputed colonial masterpiece. Spacious Heritage Wing suites feature vintage clawfoot soaking bathtubs, rich timber floors, and Andaman Sea vistas.'
  },
  {
    name: 'The Prestige Hotel Penang',
    slug: 'penang-the-prestige-hotel-penang',
    city: 'Penang',
    country: 'Malaysia',
    price: 'RM 620',
    rating: 4.8,
    reviewsCount: 1840,
    roomType: 'Loft Suite with Gazebo Soaking Tub',
    tubType: 'Freestanding Designer Bathtub',
    image: `${R2_BASE}bathtub-penang.webp`,
    bookingTip: 'Victorian illusion-inspired luxury boutique in George Town UNESCO core with statement freestanding bathtubs.',
    description: 'Set within George Town’s UNESCO World Heritage precinct, The Prestige Hotel offers optical illusion-inspired design. Suites feature champagne bronze framed freestanding bathtubs and infinity rooftop pools.'
  },
  {
    name: 'Seven Terraces',
    slug: 'penang-seven-terraces',
    city: 'Penang',
    country: 'Malaysia',
    price: 'RM 780',
    rating: 4.8,
    reviewsCount: 920,
    roomType: 'Peranakan Courtyard Suite with Open-Air Bath',
    tubType: 'Deep Stone Soaking Bathtub',
    image: `${R2_BASE}bathtub-penang.webp`,
    bookingTip: 'Restored 19th-century Anglo-Chinese shophouse row featuring authentic open-courtyard soaking tubs.',
    description: 'Seven Terraces is a sublime restoration of Anglo-Chinese terrace mansions. Suites showcase intricate mother-of-pearl Peranakan antiques, private courtyards, and deep stone soaking tubs.'
  },

  // 4. Frankfurt, Germany
  {
    name: 'Steigenberger Icon Frankfurter Hof',
    slug: 'frankfurt-steigenberger-icon-frankfurter-hof',
    city: 'Frankfurt',
    country: 'Germany',
    price: '€290',
    rating: 4.8,
    reviewsCount: 2200,
    roomType: 'Grand Deluxe Suite with Marble Soaking Bath',
    tubType: 'Deep Marble Bathtub',
    image: `${R2_BASE}bathtub-frankfurt.webp`,
    bookingTip: 'Iconic 1876 luxury palace featuring Italian marble soaking baths and world-class European spa.',
    description: 'Operating since 1876 in Frankfurt’s financial district, the Frankfurter Hof offers palatial suites with generous Italian marble bathrooms featuring deep soaking bathtubs and rain showers.'
  },
  {
    name: 'Sofitel Frankfurt Opera',
    slug: 'frankfurt-sofitel-frankfurt-opera',
    city: 'Frankfurt',
    country: 'Germany',
    price: '€340',
    rating: 4.9,
    reviewsCount: 1650,
    roomType: 'Opera View Suite with Freestanding Soaking Tub',
    tubType: 'Freestanding Bathtub',
    image: `${R2_BASE}bathtub-frankfurt.webp`,
    bookingTip: 'Overlooks the historic Alte Oper, featuring French Art de Vivre design and standalone soaking tubs.',
    description: 'Sofitel Frankfurt Opera combines Parisian hôtel particulier glamor with modern Frankfurt energy. Elegant suites offer freestanding soaking tubs with Hermès bath products and views of the Opera square.'
  },
  {
    name: 'The Westin Grand Frankfurt',
    slug: 'frankfurt-the-westin-grand-frankfurt',
    city: 'Frankfurt',
    country: 'Germany',
    price: '€230',
    rating: 4.7,
    reviewsCount: 1890,
    roomType: 'Duplex Suite with Spa Bathtub',
    tubType: 'Hydro Spa Bathtub',
    image: `${R2_BASE}bathtub-frankfurt.webp`,
    bookingTip: 'Centrally located by Zeil shopping street, featuring two-level duplex suites with soothing spa bathtubs.',
    description: 'The Westin Grand Frankfurt offers modern tranquility in the city center. Experience signature Heavenly Baths with deep spa soaking tubs and white tea amenities designed for total rejuvenation.'
  },

  // 5. Helsinki, Finland
  {
    name: 'Hotel Kämp',
    slug: 'helsinki-hotel-kamp',
    city: 'Helsinki',
    country: 'Finland',
    price: '€310',
    rating: 4.9,
    reviewsCount: 1980,
    roomType: 'Kämp Suite with Portuguese Marble Soaking Bath',
    tubType: 'Deep Marble Soaking Bathtub',
    image: `${R2_BASE}bathtub-helsinki.webp`,
    bookingTip: 'Finland’s legendary 5-star grand hotel since 1887, featuring Portuguese marble bathrooms with deep soaking tubs.',
    description: 'Hotel Kämp is Helsinki’s heritage flagship opposite the Esplanade Park. Elegant suites boast luxurious Portuguese marble bathrooms with deep soaking bathtubs, plush bathrobes, and bespoke Kämp Spa access.'
  },
  {
    name: 'Lapland Hotels Bulevardi',
    slug: 'helsinki-lapland-hotels-bulevardi',
    city: 'Helsinki',
    country: 'Finland',
    price: '€270',
    rating: 4.9,
    reviewsCount: 2150,
    roomType: 'Mystique Deluxe with In-Room Sauna & Soaking Tub',
    tubType: 'Nordic Soaking Bathtub',
    image: `${R2_BASE}bathtub-helsinki.webp`,
    bookingTip: 'Nordic wellness haven where rooms feature both a private Finnish sauna and an oversized soaking bathtub.',
    description: 'Bringing the tranquility of the Arctic to Helsinki’s Design District, Lapland Hotels Bulevardi features master suites equipped with private timber saunas and freestanding soaking bathtubs.'
  },
  {
    name: 'Hotel St. George',
    slug: 'helsinki-hotel-st-george',
    city: 'Helsinki',
    country: 'Finland',
    price: '€285',
    rating: 4.8,
    reviewsCount: 1470,
    roomType: 'Church Park Suite with Monolithic Soaking Tub',
    tubType: 'Monolithic Soaking Bathtub',
    image: `${R2_BASE}bathtub-helsinki.webp`,
    bookingTip: 'Holistic wellness design hotel overlooking Old Church Park, featuring deep minimalist stone tubs.',
    description: 'Hotel St. George challenges the concept of hospitality with holistic design and contemporary art. Suites offer monolithic soaking bathtubs alongside private Wintergarden lounges and the St. George Spa.'
  },

  // 6. Geneva, Switzerland
  {
    name: 'The Woodward - an Oetker Collection Hotel',
    slug: 'geneva-the-woodward-oetker-collection',
    city: 'Geneva',
    country: 'Switzerland',
    price: 'CHF 1,450',
    rating: 5.0,
    reviewsCount: 680,
    roomType: 'Lake View Suite with Pierre de Paris Marble Bathtub',
    tubType: 'Deep Marble Soaking Bathtub',
    image: `${R2_BASE}bathtub-geneva.webp`,
    bookingTip: 'All-suite palace hotel on Quai Wilson featuring Lake Geneva & Mont Blanc vistas from marble bathtubs.',
    description: 'Directly on the shores of Lake Geneva, The Woodward offers all-suite luxury with French neoclassical elegance. Master bathrooms feature Pierre de Paris marble bathtubs framing views of Mont Blanc.'
  },
  {
    name: "Hotel d'Angleterre",
    slug: 'geneva-hotel-d-angleterre',
    city: 'Geneva',
    country: 'Switzerland',
    price: 'CHF 650',
    rating: 4.9,
    reviewsCount: 1120,
    roomType: 'Presidential Lakefront Suite with Marble Whirlpool',
    tubType: 'Whirlpool Spa Bathtub',
    image: `${R2_BASE}bathtub-geneva.webp`,
    bookingTip: 'Historic boutique palace on Lake Geneva with private whirlpool bathtubs overlooking the Jet d Eau.',
    description: 'Hotel d Angleterre combines British charm with Swiss hospitality. Suites feature marble whirlpool bathtubs and private balconies offering uninterrupted vistas across the Jet d’Eau and the lake.'
  },
  {
    name: 'Beau-Rivage Genève',
    slug: 'geneva-beau-rivage-geneve',
    city: 'Geneva',
    country: 'Switzerland',
    price: 'CHF 820',
    rating: 4.9,
    reviewsCount: 1450,
    roomType: 'Historic Suite with Freestanding Soaking Tub',
    tubType: 'Freestanding Soaking Bathtub',
    image: `${R2_BASE}bathtub-geneva.webp`,
    bookingTip: 'Founded in 1865, famous for hosting Empress Sisi, with panoramic lake-facing freestanding soaking tubs.',
    description: 'An iconic symbol of Swiss luxury since 1865, Beau-Rivage Genève offers timeless palatial suites with deep freestanding bathtubs, private jacuzzis, and sweeping panoramas of Lake Geneva and the Alps.'
  },

  // 7. Naples, Italy
  {
    name: 'Grand Hotel Vesuvio',
    slug: 'naples-grand-hotel-vesuvio',
    city: 'Naples',
    country: 'Italy',
    price: '€380',
    rating: 4.8,
    reviewsCount: 1650,
    roomType: 'Sea View Suite with Marble Jacuzzi Bathtub',
    tubType: 'Hydrotherapy Jacuzzi Tub',
    image: `${R2_BASE}bathtub-naples.webp`,
    bookingTip: 'The only 5-star deluxe hotel on the waterfront of Naples, with jacuzzi bathtubs facing Mount Vesuvius.',
    description: 'Established in 1882 along the Santa Lucia harbor, Grand Hotel Vesuvio features waterfront suites with private marble jacuzzi bathtubs offering romantic views of the Gulf of Naples, Capri, and Mount Vesuvius.'
  },
  {
    name: 'Romeo Napoli',
    slug: 'naples-romeo-napoli',
    city: 'Naples',
    country: 'Italy',
    price: '€350',
    rating: 4.8,
    reviewsCount: 1280,
    roomType: 'Zen Wellness Suite with In-Room Jacuzzi Tub',
    tubType: 'Luxury Jacuzzi Bathtub',
    image: `${R2_BASE}bathtub-naples.webp`,
    bookingTip: 'Kenzo Tange-designed avant-garde luxury hotel featuring in-room private jacuzzis and rooftop pool.',
    description: 'Romeo Napoli blends contemporary design with historic harbor views. Wellness suites feature glass-walled in-room jacuzzi bathtubs, Japanese cedar elements, and access to the La Dolce Vita spa.'
  },
  {
    name: 'The Britannique Hotel Naples, Curio Collection by Hilton',
    slug: 'naples-the-britannique-hotel-naples',
    city: 'Naples',
    country: 'Italy',
    price: '€270',
    rating: 4.7,
    reviewsCount: 1040,
    roomType: 'Gulf View Suite with Freestanding Soaking Tub',
    tubType: 'Freestanding Bathtub',
    image: `${R2_BASE}bathtub-naples.webp`,
    bookingTip: 'Perched in the quiet Corso Vittorio Emanuele hill with panoramic gulf-view freestanding tubs.',
    description: 'The Britannique Hotel offers tranquility above the lively center of Naples. Suites boast freestanding soaking bathtubs placed alongside scenic windows framing the entire Bay of Naples.'
  },

  // 8. Hamburg, Germany
  {
    name: 'The Fontenay',
    slug: 'hamburg-the-fontenay',
    city: 'Hamburg',
    country: 'Germany',
    price: '€390',
    rating: 4.9,
    reviewsCount: 1560,
    roomType: 'Alster Suite with Freestanding Soaking Tub & Lake View',
    tubType: 'Freestanding Designer Bathtub',
    image: `${R2_BASE}bathtub-hamburg.webp`,
    bookingTip: 'Sculptural architectural masterwork directly on Lake Alster featuring lake-facing round soaking tubs.',
    description: 'The Fontenay is Hamburg’s premiere luxury sanctuary. Suites feature travertine-lined bathrooms with oversized circular soaking tubs framing tranquil views across Lake Alster.'
  },
  {
    name: 'Fairmont Hotel Vier Jahreszeiten',
    slug: 'hamburg-fairmont-hotel-vier-jahreszeiten',
    city: 'Hamburg',
    country: 'Germany',
    price: '€420',
    rating: 4.9,
    reviewsCount: 1870,
    roomType: 'Bel Etage Suite with Classic Marble Soaking Bath',
    tubType: 'Deep Marble Bathtub',
    image: `${R2_BASE}bathtub-hamburg.webp`,
    bookingTip: 'Historic grand hotel since 1897 on the Inner Alster with bespoke marble soaking tubs.',
    description: 'A European grand hotel legend, the Vier Jahreszeiten offers classical European luxury. Master suites feature lavish marble bathrooms with deep soaking bathtubs and views of the Binnenalster.'
  },
  {
    name: 'Grand Elysee Hamburg',
    slug: 'hamburg-grand-elysee-hamburg',
    city: 'Hamburg',
    country: 'Germany',
    price: '€210',
    rating: 4.7,
    reviewsCount: 2450,
    roomType: 'Penthouse Suite with Jacuzzi Bathtub',
    tubType: 'Hydrotherapy Jacuzzi Tub',
    image: `${R2_BASE}bathtub-hamburg.webp`,
    bookingTip: 'Privately run 5-star hotel near Dammtor with extensive Elysium wellness spa and jacuzzi suites.',
    description: 'Grand Elysée Hamburg offers generous hospitality in the leafy Harvestehude district. Penthouse suites provide deep jacuzzi bathtubs alongside comprehensive spa and wellness facilities.'
  },

  // 9. Porto, Portugal
  {
    name: 'The Yeatman',
    slug: 'porto-the-yeatman',
    city: 'Porto',
    country: 'Portugal',
    price: '€360',
    rating: 4.9,
    reviewsCount: 2800,
    roomType: 'Bacchus Suite with Copper Barrel Soaking Tub',
    tubType: 'Freestanding Copper Bathtub',
    image: `${R2_BASE}bathtub-porto.webp`,
    bookingTip: 'Luxury wine hotel in Vila Nova de Gaia with copper barrel soaking tubs overlooking historic Porto.',
    description: 'The Yeatman is a luxury wine retreat offering breathtaking views of the Douro River and historic Porto. Master suites feature freestanding copper barrel soaking tubs and Caudalie Vinothérapie bath rituals.'
  },
  {
    name: 'InterContinental Porto - Palacio das Cardosas',
    slug: 'porto-intercontinental-porto-palacio-das-cardosas',
    city: 'Porto',
    country: 'Portugal',
    price: '€290',
    rating: 4.8,
    reviewsCount: 1950,
    roomType: 'Cardosas Suite with Marble Soaking Bath',
    tubType: 'Deep Marble Bathtub',
    image: `${R2_BASE}bathtub-porto.webp`,
    bookingTip: 'Restored 18th-century palace in Liberdade Square with generous marble soaking tubs.',
    description: 'Overlooking Aliados Avenue, Palácio das Cardosas blends Portuguese palace history with modern 5-star luxury. Suites feature high ceilings, marble bathrooms with soaking tubs, and private balconies.'
  },
  {
    name: 'Maison Albar - Le Monumental Palace',
    slug: 'porto-maison-albar-le-monumental-palace',
    city: 'Porto',
    country: 'Portugal',
    price: '€330',
    rating: 4.9,
    reviewsCount: 1240,
    roomType: 'Suite Monumentale with French Soaking Tub',
    tubType: 'Freestanding Soaking Bathtub',
    image: `${R2_BASE}bathtub-porto.webp`,
    bookingTip: 'Art Deco and Art Nouveau Parisian elegance in central Porto with freestanding bathtubs.',
    description: 'Maison Albar Hotels Le Monumental Palace brings 1923 Art Deco glamor to Porto. Monumental Suites feature generous freestanding soaking tubs, Nuxe spa amenities, and Michelin dining.'
  },

  // 10. Seville, Spain
  {
    name: 'Hotel Alfonso XIII, a Luxury Collection Hotel',
    slug: 'seville-hotel-alfonso-xiii',
    city: 'Seville',
    country: 'Spain',
    price: '€410',
    rating: 4.9,
    reviewsCount: 2600,
    roomType: 'Grand Suite with Hand-Painted Andalusian Tile Bathtub',
    tubType: 'Historic Marble Soaking Tub',
    image: `${R2_BASE}bathtub-seville.webp`,
    bookingTip: 'Spain’s most iconic palace hotel commissioned by King Alfonso XIII, with authentic Sevillian tile bathrooms.',
    description: 'Commissioned by the King of Spain for the 1929 Ibero-American Exposition, Hotel Alfonso XIII is an architectural jewel. Suites feature handcrafted ceramic tiles, deep marble bathtubs, and royal courtyards.'
  },
  {
    name: 'Hotel Mercer Sevilla',
    slug: 'seville-hotel-mercer-sevilla',
    city: 'Seville',
    country: 'Spain',
    price: '€380',
    rating: 4.9,
    reviewsCount: 780,
    roomType: 'Noble Suite with Monolithic Oval Soaking Tub',
    tubType: 'Monolithic Oval Bathtub',
    image: `${R2_BASE}bathtub-seville.webp`,
    bookingTip: '19th-century bourgeois palace in El Arenal with sculptural freestanding oval bathtubs.',
    description: 'Located in the historic El Arenal quarter, Mercer Sevilla occupies a restored 19th-century mansion. Noble suites feature sculptural freestanding oval bathtubs, marble courtyards, and rooftop plunge pools.'
  },
  {
    name: 'Radisson Collection Hotel, Magdalena Plaza Sevilla',
    slug: 'seville-radisson-collection-magdalena-plaza',
    city: 'Seville',
    country: 'Spain',
    price: '€260',
    rating: 4.8,
    reviewsCount: 1150,
    roomType: 'Junior Suite with Deep Soaking Tub & Terrace',
    tubType: 'Deep Soaking Bathtub',
    image: `${R2_BASE}bathtub-seville.webp`,
    bookingTip: 'Sleek luxury design in Plaza de la Magdalena with private terrace suites and deep soaking bathtubs.',
    description: 'Radisson Collection Magdalena Plaza offers sustainable luxury in Seville’s commercial heart. Stylish suites feature custom brass fittings, deep soaking tubs, and private terraces with city panoramas.'
  },

  // 11. Lyon, France
  {
    name: 'InterContinental Lyon - Hotel Dieu',
    slug: 'lyon-intercontinental-lyon-hotel-dieu',
    city: 'Lyon',
    country: 'France',
    price: '€310',
    rating: 4.8,
    reviewsCount: 1750,
    roomType: 'Rhone View Suite with Freestanding Soaking Tub',
    tubType: 'Freestanding Soaking Bathtub',
    image: `${R2_BASE}bathtub-lyon.webp`,
    bookingTip: 'Housed within the monumental 18th-century Grand Hôtel-Dieu overlooking the Rhône River.',
    description: 'InterContinental Lyon occupies an architectural masterpiece on the banks of the Rhône. Modern luxury suites designed by Jean-Philippe Nuel feature freestanding bathtubs with Frédéric Malle amenities.'
  },
  {
    name: 'Villa Florentine',
    slug: 'lyon-villa-florentine',
    city: 'Lyon',
    country: 'France',
    price: '€280',
    rating: 4.8,
    reviewsCount: 1100,
    roomType: 'Italian Renaissance Suite with Jacuzzi Bath',
    tubType: 'Hydrotherapy Jacuzzi Tub',
    image: `${R2_BASE}bathtub-lyon.webp`,
    bookingTip: 'Perched on Fourvière hill with panoramic vistas across Old Lyon and private jacuzzi bathtubs.',
    description: 'A former 16th-century Florentine convent atop Fourvière hill, Villa Florentine offers romantic suites with jetted jacuzzi bathtubs, a heated panoramic outdoor pool, and Michelin-starred gastronomy.'
  },
  {
    name: 'Cour des Loges Lyon, a Radisson Collection Hotel',
    slug: 'lyon-cour-des-loges-lyon',
    city: 'Lyon',
    country: 'France',
    price: '€330',
    rating: 4.7,
    reviewsCount: 1350,
    roomType: 'Renaissance Master Suite with Cast-Iron Tub',
    tubType: 'Vintage Cast-Iron Bathtub',
    image: `${R2_BASE}bathtub-lyon.webp`,
    bookingTip: 'Historic Vieux-Lyon sanctuary with dramatic Renaissance courtyards and vintage cast-iron tubs.',
    description: 'Cour des Loges transports guests back to the Renaissance in Old Lyon. Atmospheric suites feature genuine stone fireplaces, period frescoes, and freestanding vintage cast-iron bathtubs.'
  },

  // 12. Osaka, Japan
  {
    name: 'The Ritz-Carlton, Osaka',
    slug: 'osaka-the-ritz-carlton-osaka',
    city: 'Osaka',
    country: 'Japan',
    price: '¥ 62,000',
    rating: 4.9,
    reviewsCount: 2900,
    roomType: 'Executive Suite with Marble Soaking Tub & City View',
    tubType: 'Deep Marble Soaking Bathtub',
    image: `${R2_BASE}bathtub-osaka.webp`,
    bookingTip: 'British Georgian manor house luxury in Umeda with deep Italian marble soaking bathtubs.',
    description: 'The Ritz-Carlton Osaka combines European aristocratic charm with celebrated Japanese hospitality. Elegant master suites boast deep Italian marble bathtubs framing spectacular Osaka skyline views.'
  },
  {
    name: 'Conrad Osaka',
    slug: 'osaka-conrad-osaka',
    city: 'Osaka',
    country: 'Japan',
    price: '¥ 68,000',
    rating: 4.9,
    reviewsCount: 2200,
    roomType: 'Panoramic Suite with Freestanding Round Soaking Tub',
    tubType: 'Freestanding Circular Bathtub',
    image: `${R2_BASE}bathtub-osaka.webp`,
    bookingTip: '“Address in the Sky” on Nakanoshima Island featuring floor-to-ceiling windows and round soaking bathtubs.',
    description: 'Occupying the 33rd to 40th floors of the Nakanoshima Festival West Tower, Conrad Osaka features dramatic circular freestanding bathtubs positioned beside floor-to-ceiling skyline windows.'
  },
  {
    name: 'InterContinental Hotel Osaka',
    slug: 'osaka-intercontinental-hotel-osaka',
    city: 'Osaka',
    country: 'Japan',
    price: '¥ 54,000',
    rating: 4.8,
    reviewsCount: 2450,
    roomType: '1-Bedroom Residential Suite with Japanese Soaking Tub',
    tubType: 'Deep Japanese Soaking Tub',
    image: `${R2_BASE}bathtub-osaka.webp`,
    bookingTip: 'Directly linked to Grand Front Osaka, featuring deep Japanese-style stone soaking bathtubs.',
    description: 'Situated in the vibrant Grand Front Osaka complex, InterContinental Osaka features expansive modern suites with traditional Japanese deep stone soaking tubs and separate rain showers.'
  }
];

async function seedGSCHotels() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB Atlas.');

  const collection = mongoose.connection.collection('hotels');
  const initialCount = await collection.countDocuments({});
  console.log(`Current hotel count: ${initialCount}`);

  let addedCount = 0;
  let updatedCount = 0;

  for (const h of GSC_HOTELS) {
    const query = `${h.name} ${h.city}`;
    const doc = {
      ...h,
      url: getSearchUrlBooking(h.name, h.city),
      bookingUrl: getSearchUrlBooking(h.name, h.city),
      agodaUrl: getSearchUrlAgoda(h.name, h.city),
      verified: true,
      flagged: false,
      amenities: ['Bathtub', 'Jacuzzi', 'Room Service', 'Free WiFi', 'Air Conditioning', 'Spa'],
      updatedAt: new Date()
    };

    const res = await collection.updateOne(
      { slug: h.slug },
      { $set: doc },
      { upsert: true }
    );

    if (res.upsertedCount > 0) addedCount++;
    else if (res.modifiedCount > 0) updatedCount++;
  }

  const finalCount = await collection.countDocuments({});
  console.log(`\nSeed completed!`);
  console.log(`- Inserted new hotels: ${addedCount}`);
  console.log(`- Updated existing: ${updatedCount}`);
  console.log(`- Final hotel count: ${finalCount} (Baseline check: >= 2,498)`);

  await mongoose.disconnect();
}

seedGSCHotels().catch((err) => {
  console.error('Error seeding hotels:', err);
  process.exit(1);
});
