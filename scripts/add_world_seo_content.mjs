import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seoFilePath = path.join(__dirname, '..', 'src', 'lib', 'seo.ts');
let content = fs.readFileSync(seoFilePath, 'utf8');

const NEW_SEO_ENTRIES = `
  // Italy - Lake Como
  'lake-como-italy': {
    intro: 'Lake Como is the world’s quintessential romantic lake sanctuary, where neoclassical villas meet sparkling alpine waters. Discover legendary historic palaces featuring lake-facing marble soaking tubs, private balcony whirlpools, and panoramic suites framing Bellagio.',
    amenities: [
      'Panoramic lake-facing Italian marble soaking bathtubs',
      'Balcony and terrace hydrotherapy jacuzzis overlooking Bellagio and the Alps',
      'Monolithic hand-carved Carrara marble baths in 16th-century villas',
      'Acqua di Parma luxury bath amenities and plush velvet robes',
      'Private floating pool and connected lakeside soaking setups'
    ],
    whyChoose: [
      'The world’s most sought-after wedding, anniversary, and honeymoon destination',
      'Unmatched historic grandeur at iconic estates like Grand Hotel Tremezzo and Villa d’Este',
      'Private wooden boat charters departing directly from lakeside hotel docks',
      'Every lake-view bathtub suite individually verified across booking partners'
    ]
  },

  // Italy - Capri
  'capri-italy': {
    intro: 'Capri rises majestically from the Tyrrhenian Sea, enchanting lovers with its sheer limestone cliffs and azure waters. Experience cliffside 5-star suites featuring private heated plunge pools, Faraglioni-facing outdoor jacuzzis, and artisan ceramic soaking baths.',
    amenities: [
      'Cliff-edge outdoor soaking tubs 1,000 feet above the Bay of Naples',
      'Faraglioni rock-facing private whirlpool jacuzzi terraces',
      'Traditional hand-painted Caprese ceramic tiled master bathrooms',
      'Private heated infinity plunge pools with integrated hydro jets',
      'Fragrant lemon-blossom and Mediterranean herbal aromatherapy bath preparations'
    ],
    whyChoose: [
      'Breathtaking coastal vistas overlooking the Amalfi Coast and Mount Vesuvius',
      'World-renowned luxury shopping and Michelin-starred cliffside dining',
      'Complete privacy and romantic seclusion in Anacapri and Capri town',
      'Triple-checked listings guaranteeing private in-room and terrace tubs'
    ]
  },

  // Greece - Mykonos
  'mykonos-greece': {
    intro: 'Mykonos blends whitewashed Cycladic charm with glamorous Aegean coastal luxury. Unwind in iconic cave suites featuring private heated indoor jacuzzis, cliffside plunge tubs, and sunset-facing Aegean whirlpools.',
    amenities: [
      'Whitewashed cave suites with heated indoor hydrotherapy jacuzzis',
      'Private sunset-facing Aegean terrace plunge tubs',
      'Cycladic minimalist stone-carved deep soaking bathtubs',
      'Champagne turn-down service with organic Greek olive oil bath amenities',
      'Panoramic views of the iconic Mykonos windmills and Delos island'
    ],
    whyChoose: [
      'World-famous sunset views, cosmopolitan nightlife, and golden beach clubs',
      'Iconic cave pool architecture engineered for ultimate couple romance',
      'Minutes from Little Venice, beach clubs, and seaside tavernas',
      'Guaranteed private hydrotherapy amenities confirmed on booking'
    ]
  },

  // Hong Kong
  'hong-kong-hong-kong': {
    intro: 'Hong Kong offers an unmatched urban luxury experience where towering skyscrapers meet Victoria Harbour. Indulge in 100th-floor skyline suites featuring deep circular marble soaking tubs, integrated mirror televisions, and dramatic harbor views.',
    amenities: [
      'Floor-to-ceiling Victoria Harbour-view circular marble soaking bathtubs',
      'Skyline high-floor master ensuites equipped with integrated mirror TVs',
      'Freestanding limestone and sculpted composite stone deep tubs',
      'Dual vanity stations with thermostatic walk-in rainforest glass showers',
      'Exclusive Diptyque and Le Labo luxury bath amenities'
    ],
    whyChoose: [
      'Spectacular nightly views of the Symphony of Lights from your bathtub',
      'World-class Michelin-starred dining and premier luxury shopping at your doorstep',
      'Legendary Asian hospitality at flagships like The Ritz-Carlton and Rosewood',
      'Individually verified skyline soaking baths across all booking platforms'
    ]
  },

  // Macau
  'macau-macau': {
    intro: 'Macau, the Las Vegas of the East, is home to world-record architectural marvels and palatial casino resorts. Experience architectural suites with custom sculptural soaking tubs, Italian marble whirlpool jacuzzis, and views of dancing fountains.',
    amenities: [
      'Futuristic Zaha Hadid designed sculptural soaking bathtubs',
      'Performance Lake fountain-facing Italian marble whirlpool jacuzzis',
      'Gold-leaf detailed palatial master bathrooms with dual rain showers',
      'Hermès and Bulgari bespoke luxury bath and body essentials',
      'High-tech automated bath filler controls and ambient chromotherapy lighting'
    ],
    whyChoose: [
      'Ultra-luxury suite experiences offering world-class entertainment and shopping',
      'Michelin-starred Portuguese and Cantonese fine dining within the resort',
      'Exceptional suite square footage and opulent bathroom craftsmanship',
      'Triple-checked suite listings with confirmed private jetted whirlpools'
    ]
  },

  // Canada - Whistler
  'whistler-canada': {
    intro: 'Whistler is North America’s premier alpine ski resort nestled in the rugged Coast Mountains of British Columbia. Relax in luxury mountain chalets featuring private cedarwood hot tubs, double soaker tubs beside basalt gas fireplaces, and snowy forest views.',
    amenities: [
      'Private outdoor cedarwood hot tubs overlooking Blackcomb Mountain snowfields',
      'Deep double soaking bathtubs positioned beside roaring stone gas fireplaces',
      'Heated slate bathroom floors and alpine eucalyptus steam showers',
      'Natural glacial lake-view freestanding stone soaking tubs',
      'Mountain-herb and botanical bath salts designed for post-ski recovery'
    ],
    whyChoose: [
      'World-class ski-in/ski-out access across Whistler and Blackcomb mountains',
      'Cozy, romantic winter ambiance paired with five-star luxury resort amenities',
      'Year-round outdoor recreation from alpine skiing to championship golf and hiking',
      'Verified in-room fireplaces and private tubs guaranteed on booking'
    ]
  },

  // France - Courchevel
  'courchevel-france': {
    intro: 'Courchevel 1850 is the apex of French Alps high-altitude luxury. Discover prestigious ski-in/ski-out palaces featuring private chromotherapy bathtubs, hand-painted fresco master ensuites, and heated outdoor terrace jacuzzis overlooking snow-clad pine forests.',
    amenities: [
      'Private heated terrace jacuzzis surrounded by snow-covered alpine peaks',
      'In-suite chromotherapy hydrotherapy bathtubs and private hammams',
      'Hand-carved Savoyard wooden details and vintage clawfoot tubs',
      'Guerlain and Biologique Recherche customized alpine bath amenities',
      'Direct ski-in/ski-out access from your private chalet ski room'
    ],
    whyChoose: [
      'The world’s most prestigious winter sports destination in Les Trois Vallées',
      'Unrivaled density of Michelin-starred restaurants and high-fashion boutiques',
      'Unmatched privacy, bespoke butler service, and alpine glamour',
      'Triple-verified suite amenities ensuring confirmed private whirlpools and tubs'
    ]
  },

  // France - Chamonix
  'chamonix-france': {
    intro: 'Chamonix-Mont-Blanc is the legendary birthplace of mountaineering beneath Western Europe’s highest peak. Enjoy cozy Savoyard chalet suites featuring private outdoor hot tubs facing Mont Blanc, rustic roll-top baths, and crackling wood fireplaces.',
    amenities: [
      'Outdoor cedar hot tubs with direct views of the Mont Blanc glacier',
      'Rustic roll-top and freestanding copper bathtubs beside fireplaces',
      'Private sauna and alpine steam shower en-suite combinations',
      'Organic mountain arnica and pine-infused recovery bath salts',
      'Private balconies framing the dramatic Aiguille du Midi spires'
    ],
    whyChoose: [
      'Awe-inspiring vistas of Mont Blanc and the Chamonix Valley',
      'Authentic alpine atmosphere combined with refined French gastronomy',
      'World-famous skiing, mountaineering, and scenic cable car ascents',
      'All listings verified with confirmed in-room tubs and heating'
    ]
  },

  // Japan - Niseko
  'niseko-japan': {
    intro: 'Niseko, located on Japan’s northern island of Hokkaido, is renowned worldwide for its Champagne powder snow. Rejuvenate in luxury ryokans and modern ski chalets featuring private indoor and open-air natural volcanic hot spring onsens overlooking Mount Yotei.',
    amenities: [
      'Private open-air rotenburo onsen baths fed by natural mineral volcanic springs',
      'Aromatic Japanese Hinoki cedarwood deep soaking tubs with Mount Yotei views',
      'Floor-to-ceiling glass-walled master bathrooms framing falling snow',
      'Traditional Japanese yukata robes and organic herbal bath rituals',
      'Ski-in/ski-out convenience with private heated ski gear drying rooms'
    ],
    whyChoose: [
      'The world’s finest powder snow paired with authentic Japanese onsen culture',
      'Incredible Hokkaido gastronomy featuring fresh seafood, wagyu, and ramen',
      'Tranquil birch forest setting providing deep restorative relaxation',
      'Individually verified natural spring onsens and private in-room tubs'
    ]
  },

  // Japan - Mount Fuji
  'mount-fuji-japan': {
    intro: 'Mount Fuji and the Fuji Five Lakes region represent Japan’s spiritual and natural pinnacle. Experience tranquil lakeside ryokans and forest retreats boasting private open-air onsens with direct, unobstructed reflections of Mount Fuji across Lake Kawaguchiko.',
    amenities: [
      'Private balcony onsen baths with front-row panoramic Mount Fuji views',
      'Traditional wooden Hinoki and volcanic rock deep soaking tubs',
      'Mineral-rich thermal spring water straight from Mount Fuji aquifers',
      'Private cloud terrace seating with fire pits and forest soaking baths',
      'Multi-course seasonal Kaiseki dining served in private suites'
    ],
    whyChoose: [
      'Iconic, unforgettable views of Mount Fuji from your private hot tub',
      'Deep cultural immersion in centuries-old Japanese hospitality (omotenashi)',
      'Serene lakeside walking trails, maple corridors, and cherry blossom vistas',
      'Guaranteed private onsen tubs confirmed across all booking channels'
    ]
  },

  // Thailand - Koh Samui
  'koh-samui-thailand': {
    intro: 'Koh Samui is Thailand’s premier tropical island sanctuary in the Gulf of Thailand. Indulge in hillside and beachfront pool villas featuring sunken open-air terrazzo bathtubs, private infinity plunge pools, and uninterrupted ocean sunset panoramas.',
    amenities: [
      'Sunken outdoor terrazzo soaking bathtubs surrounded by tropical palms',
      'Private infinity plunge pools with integrated hydro massage jets',
      'Ocean-facing oversized circular couple bathtubs',
      'Traditional Thai coconut and lemongrass herbal bath infusions',
      'Direct access to powdery private beaches and coral reef coves'
    ],
    whyChoose: [
      'Idyllic tropical island escape perfect for honeymoons and romantic retreats',
      'Luxurious pool villa living with total privacy and personalized butler service',
      'World-class wellness spas and beachside candlelit seafood dining',
      'Triple-checked private tub and plunge pool amenities on every listing'
    ]
  },

  // Thailand - Chiang Mai
  'chiang-mai-thailand': {
    intro: 'Chiang Mai, the cultural crown of Northern Thailand, is enveloped by misty jungle hills and historic Lanna heritage. Stay in colonial teak homesteads and riverfront sanctuaries featuring vintage clawfoot bathtubs and open-air garden soaking baths.',
    amenities: [
      'Vintage freestanding Victorian clawfoot bathtubs in heritage teak suites',
      'Ping River-facing open-air courtyard soaking tubs with tropical greenery',
      'Private outdoor rain showers surrounded by scented jasmine and frangipani',
      'Traditional Lanna herbal steam and aromatic essential oil bath preparations',
      'Private daybed verandas overlooking lush paddy fields and misty mountains'
    ],
    whyChoose: [
      'Rich cultural heritage, centuries-old Buddhist temples, and artisan markets',
      'Peaceful, unhurried northern pace ideal for romance and mindful wellness',
      'Award-winning Lanna cuisine and riverfront boutique luxury',
      'Verified in-room bathtubs confirmed across MakeMyTrip, Agoda, and Booking.com'
    ]
  },

  // Mexico - Tulum
  'tulum-mexico': {
    intro: 'Tulum brings bohemian eco-luxury to the sparkling turquoise Caribbean coast of the Yucatan Peninsula. Unwind in candlelit jungle treehouses and beachfront suites with hand-carved Mayan stone bathtubs, copper soaking tubs, and private plunge pools.',
    amenities: [
      'Custom hand-carved Mayan limestone bathtubs filled with fresh cenote water',
      'Freestanding hammered copper soaking tubs on private jungle decks',
      'Rooftop plunge pools overlooking the emerald jungle canopy and Caribbean Sea',
      'Artisanal copal incense and locally crafted botanical bath amenities',
      'Open-air wooden architecture designed for sea breeze and stargazing'
    ],
    whyChoose: [
      'Trendsetting boho-chic beach vibe with world-class wellness and yoga retreats',
      'Direct proximity to ancient Mayan ruins, sacred cenotes, and coral reefs',
      'Innovative organic gastronomy and intimate candlelit beach clubs',
      'Individually verified unique bathtub features across all platforms'
    ]
  },

  // Mexico - Los Cabos
  'los-cabos-mexico': {
    intro: 'Los Cabos is where golden desert cliffs plunge into the azure waters of the Pacific Ocean and Sea of Cortez. Experience cliffside 5-star suites featuring private terrace plunge pools, outdoor fire pits, and deep rainforest marble soaking tubs.',
    amenities: [
      'Private cliffside terrace plunge pools and deep marble soaking baths',
      'Direct ocean-view outdoor hydrotherapy jacuzzis for whale watching',
      'Handcrafted Mexican tile master bathrooms with dual rain showers',
      'Mezcal turn-down amenities and ocean-mineral bath soak preparations',
      'Private beachfront palapa cabanas with attentive butler service'
    ],
    whyChoose: [
      'Dramatic natural beauty where arid desert landscapes meet crashing ocean waves',
      'Prime seasonal whale-watching right from your private terrace hot tub',
      'Championship oceanfront golf courses and farm-to-table culinary scenes',
      'Triple-checked suite listings guaranteeing private soaking tubs and plunge pools'
    ]
  },

  // Turkey - Istanbul
  'istanbul-turkey': {
    intro: 'Istanbul bridges Europe and Asia with millennia of imperial history along the Bosphorus Strait. Reside in restored Ottoman palaces featuring private Turkish marble hammams, deep freestanding soaking tubs, and Asian-shore vistas.',
    amenities: [
      'Private en-suite Turkish marble hammam baths with heated stone slabs',
      'Bosphorus-facing freestanding marble bathtubs watching passing ships',
      'Handcrafted Ottoman Iznik tiles and ornate brass fixtures',
      'Traditional Turkish olive oil soaps and rosewater bath amenities',
      'Historical palace high ceilings with crystal chandeliers and waterfront terraces'
    ],
    whyChoose: [
      'Unmatched historic atmosphere staying in authentic Ottoman Sultan palaces',
      'Breathtaking waterfront views spanning two continents from your suite',
      'Minutes from the Hagia Sophia, Blue Mosque, and the Grand Bazaar',
      'Every historic tub suite verified across Booking.com and Agoda'
    ]
  },

  // UK - The Cotswolds
  'the-cotswolds-uk': {
    intro: 'The Cotswolds is England’s most enchanting rural escape, famed for honey-stone villages and rolling green hills. Discover historic coaching inns and luxury farm estates featuring outdoor copper roll-top bathtubs on private decks and roaring log fires.',
    amenities: [
      'Private outdoor copper roll-top bathtubs on secluded wooden sundecks',
      'Freestanding cast-iron clawfoot baths positioned beside inglenook fireplaces',
      'English countryside garden-view deep soaking marble tubs',
      'Bramley and Cowshed organic wildflower herbal bath essentials',
      'Rustic timber beams and plush goose-down bedding for cozy British evenings'
    ],
    whyChoose: [
      'Quintessential British countryside romance with charming thatched-roof pubs',
      'Scenic walking paths along the Cotswold Way and picturesque village lanes',
      'World-class farm-to-table gastropubs and boutique country house spas',
      'Verified roll-top and clawfoot tubs confirmed across all booking channels'
    ]
  },

  // UK - Bath
  'bath-uk': {
    intro: 'Bath is England’s UNESCO World Heritage city of Roman antiquities and Georgian architecture. Experience luxury spa hotels featuring in-room thermal mineral water bathtubs fed directly from the city’s ancient thermal springs.',
    amenities: [
      'Private in-room roll-top baths piped with natural warm Roman thermal waters',
      'Georgian architectural master bathrooms with freestanding clawfoot tubs',
      'Historic Bath stone interiors with heated limestone floors',
      'Aromatherapy Associates therapeutic bath oils and mineral body scrubs',
      'Direct internal access to subterranean Roman-style thermal bath spas'
    ],
    whyChoose: [
      'The only destination in the UK where you can bathe in natural thermal waters',
      'Architectural marvels including the Royal Crescent and the Roman Baths',
      'Idyllic romantic weekend getaway just 90 minutes from London',
      'Individually verified thermal baths and clawfoot tubs on every listing'
    ]
  },

  // St. Barthélemy
  'st.-barthelemy-st.-barthelemy': {
    intro: 'St. Barthélemy is the Caribbean’s undisputed capital of French Riviera glamour and celebrity seclusion. Discover ultra-luxury villas and boutique hotels featuring private oceanfront plunge pools, jetted coral reef jacuzzis, and deep stone soaking tubs.',
    amenities: [
      'Private heated infinity plunge pools with integrated hydromassage jets',
      'Ocean-jutting cliffside jacuzzi tubs overlooking Saint Jean Bay',
      'Freestanding open-air soaking tubs with panoramic Caribbean Sea views',
      'Ligne St Barth signature tropical avocado and coconut bath essentials',
      'Private sundecks with direct VIP beach access and yacht tenders'
    ],
    whyChoose: [
      'The pinnacle of Caribbean ultra-luxury with complete privacy and elite security',
      'World-class French gastronomy and chic beachside champagne lounges',
      'Unspoiled powder-white sand beaches and crystalline turquoise coves',
      '100% verified private tub suites across Booking.com and luxury channels'
    ]
  },
  'st-barthelemy-st-barthelemy': {
    intro: 'St. Barthélemy is the Caribbean’s undisputed capital of French Riviera glamour and celebrity seclusion. Discover ultra-luxury villas and boutique hotels featuring private oceanfront plunge pools, jetted coral reef jacuzzis, and deep stone soaking tubs.',
    amenities: [
      'Private heated infinity plunge pools with integrated hydromassage jets',
      'Ocean-jutting cliffside jacuzzi tubs overlooking Saint Jean Bay',
      'Freestanding open-air soaking tubs with panoramic Caribbean Sea views',
      'Ligne St Barth signature tropical avocado and coconut bath essentials',
      'Private sundecks with direct VIP beach access and yacht tenders'
    ],
    whyChoose: [
      'The pinnacle of Caribbean ultra-luxury with complete privacy and elite security',
      'World-class French gastronomy and chic beachside champagne lounges',
      'Unspoiled powder-white sand beaches and crystalline turquoise coves',
      '100% verified private tub suites across Booking.com and luxury channels'
    ]
  },

  // Anguilla
  'anguilla-anguilla': {
    intro: 'Anguilla is the Caribbean’s hidden gem for connoisseurs of tranquil beaches and culinary excellence. Retreat to Greco-Moorish beachfront villas with private sunken marble bathtubs, private plunge pools, and steps to powdery white sands.',
    amenities: [
      'Sunken Italian marble soaking tubs overlooking Maundays Bay',
      'Private cliffside terrace plunge pools and open-air rain showers',
      'Freestanding composite stone soaking bathtubs with ocean breezes',
      'Fresh tropical floral bath setups with sea salt and coconut milk soaks',
      'Direct beachfront access with personalized beach butler services'
    ],
    whyChoose: [
      'Consistently voted home to the Caribbean’s best white sand beaches',
      'Unrivaled culinary scene spanning upscale French cuisine to beach shacks',
      'Serene, uncrowded luxury atmosphere designed for couples and honeymooners',
      'Triple-checked listings guaranteeing private in-room and terrace tubs'
    ]
  },

  // Belgium - Brussels
  'brussels-belgium': {
    intro: 'Brussels combines grand historic architecture with world-renowned culinary artistry. Stay in five-star hotels moments from the Grand Place featuring Italian Carrara marble soaking tubs, skyline views over the Royal Palace, and Art Nouveau design.',
    amenities: [
      'Oversized Italian Carrara marble bathtubs with separate walk-in rain showers',
      'High-floor suites with bathtub vistas over Brussels historic skyline',
      'Belgian chocolate turn-down treats and luxury bath salts',
      'Soundproofed master bedrooms with plush velvet furnishings',
      'Antique brass fixtures and heated designer towel rails'
    ],
    whyChoose: [
      'Steps from the breathtaking Grand Place, Manneken Pis, and Royal Museums',
      'World capital of artisanal chocolate, fine pralines, and historic breweries',
      'Centrally located European capital with premier boutique luxury hotels',
      'Verified in-room bathtubs confirmed across Booking.com and Agoda'
    ]
  },

  // Belgium - Bruges
  'bruges-belgium': {
    intro: 'Bruges is Europe’s fairy-tale medieval city of cobblestone lanes, swan-filled canals, and soaring spires. Experience 15th-century ducal residences and canal-side boutique stays with heritage marble soaking tubs and romantic jetted whirlpools.',
    amenities: [
      'Canal-facing romantic roll-top and vintage clawfoot bathtubs',
      '15th-century palace suites with original frescoes and marble tubs',
      'Private en-suite whirlpool jacuzzis for relaxing after canal walks',
      'Plush bathrobes, slippers, and artisanal Belgian lavender bath oils',
      'Quiet courtyard gardens with centuries-old trees and peaceful fountains'
    ],
    whyChoose: [
      'One of Europe’s most romantic and best-preserved medieval towns',
      'Enchanting horse-drawn carriage rides and picturesque canal cruises',
      'Intimate boutique properties offering authentic aristocratic charm',
      'Triple-checked suite listings with confirmed private bathtubs'
    ]
  },

  // South Africa - Kruger National Park
  'kruger-national-park-south-africa': {
    intro: 'Greater Kruger National Park and Sabi Sand are the world’s ultimate safari luxury wilderness. Experience open-air bush bathtubs and private heated plunge pools overlooking the Sand River, where elephants and leopards roam freely.',
    amenities: [
      'Open-air bush soaking bathtubs directly overlooking wildlife riverbanks',
      'Private heated infinity plunge pools carved into ancient granite rocks',
      'Glass-walled master suites framing untamed African savanna landscapes',
      'African botanical and marula oil organic bath preparations',
      'Outdoor rain showers under the southern hemisphere starlit skies'
    ],
    whyChoose: [
      'The world’s premier Big Five game viewing with expert trackers and rangers',
      'Unmatched safari luxury, vintage wine cellars, and campfire boma dining',
      'Complete wilderness privacy in exclusive private game reserves',
      'Every safari lodge bathtub individually verified for guaranteed views'
    ]
  },

  // Tanzania - Serengeti
  'serengeti-tanzania': {
    intro: 'The Serengeti is the stage of the Great Migration across vast golden savannas. Stay in ultra-luxury tented camps and hillside lodges with freestanding copper soaking tubs and private plunge pools positioned directly behind active animal watering holes.',
    amenities: [
      'Freestanding copper and canvas-side soaking bathtubs with savanna views',
      'Watering-hole facing private terrace pools watching elephants and zebras',
      'Edwardian colonial-style roll-top bathtubs in historic manor estates',
      'Eco-luxe organic African botanicals and hot water delivered by butler',
      'Solar-heated private plunge pools overlooking the migratory plains'
    ],
    whyChoose: [
      'Witness the awe-inspiring Great Migration from your private suite deck',
      'Intimate luxury tented living with five-star hotel comforts and dining',
      'Breathtaking sunrise hot air balloon safaris directly from camp',
      'Verified private tubs confirmed across Booking.com and safari specialists'
    ]
  },

  // Bhutan
  'bhutan-bhutan': {
    intro: 'Bhutan, the Kingdom of Happiness, is nestled high in the pristine eastern Himalayas. Rejuvenate in tranquil mountain lodges featuring traditional Bhutanese hot-stone herbal baths, wood-burning bukhari stoves, and pine valley vistas.',
    amenities: [
      'Traditional Bhutanese river-stone heated baths infused with wild Artemisia herbs',
      'Monolithic terrazzo soaking bathtubs positioned beside wood-burning stoves',
      'Pine forest-facing picture-window master bathrooms with valley vistas',
      'Himalayan mineral bath salts and organic mountain botanical oils',
      'Hand-woven yak wool blankets and crackling cedarwood fireplaces'
    ],
    whyChoose: [
      'Spiritual and cultural sanctuary with preserved ancient Buddhist traditions',
      'Pristine Himalayan landscapes, dzongs, and the iconic Tiger’s Nest monastery',
      'World-leading sustainable luxury hospitality at Amankora and Six Senses',
      'Guaranteed private hot-stone and soaking tubs confirmed on booking'
    ]
  },

  // Australia - Melbourne
  'melbourne-australia': {
    intro: 'Melbourne is Australia’s cultural and culinary capital, celebrated for its hidden laneways and riverside skyline. Stay in 5-star Southbank and heritage precinct hotels featuring sunken Italian marble spa tubs, integrated mirror TVs, and Yarra River views.',
    amenities: [
      'Sunken Italian marble whirlpool spa tubs with city skyline views',
      'Deep soaking bathtubs with integrated waterproof mirror televisions',
      'Dual vanity stations with frameless glass thermostatic rain showers',
      'Appelles Australian botanical luxury apothecary bath essentials',
      'Floor-to-ceiling panoramic views over the Yarra River and Port Phillip Bay'
    ],
    whyChoose: [
      'Australia’s top dining, coffee culture, and live arts entertainment scene',
      'Premier luxury accommodations within walking distance of Crown precinct',
      'Convenient base for day trips to Yarra Valley wineries and Great Ocean Road',
      'Triple-checked listings guaranteeing private in-room spa baths and tubs'
    ]
  },

  // Australia - Hamilton Island
  'hamilton-island-australia': {
    intro: 'Hamilton Island is the jewel of the Whitsundays on the doorstep of the Great Barrier Reef. Unwind in exclusive pavilions featuring private infinity plunge pools, timber sun decks, and freestanding stone soaking tubs overlooking the turquoise Coral Sea.',
    amenities: [
      'Freestanding composite stone soaking bathtubs facing the Coral Sea',
      'Private infinity plunge pools with integrated hydromassage jets',
      'Spacious timber sundecks positioned for panoramic Whitsunday sunsets',
      'Australian native botanical bath oils and plush organic cotton towels',
      'Complimentary private VIP golf buggies to explore the island'
    ],
    whyChoose: [
      'World-famous luxury at qualia and direct access to Whitehaven Beach',
      'Snorkeling and scenic helicopter flights over the Great Barrier Reef and Heart Reef',
      'Idyllic tropical climate and pristine island waters ideal for romance',
      'Individually verified oceanfront bathtubs across all booking channels'
    ]
  },

  // Puerto Rico
  'puerto-rico-puerto-rico': {
    intro: 'Puerto Rico combines Spanish colonial history with lush Caribbean rainforests and golden coastlines. Discover historic 17th-century convent stays and oceanfront reserve pavilions with open-air deep soaking bathtubs and private plunge pools.',
    amenities: [
      'Open-air deep soaking bathtubs set within private beachfront garden pavilions',
      'Private oceanfront terrace plunge pools and outdoor rainforest showers',
      'Historic Spanish colonial clawfoot tubs in restored Old San Juan suites',
      'Locally distilled rum turn-down service and organic coffee-scrub bath salts',
      'Direct beachfront access on former Rockefeller private estate grounds'
    ],
    whyChoose: [
      'Effortless travel with direct flights and rich cultural heritage in Old San Juan',
      'Pristine beaches bordered by El Yunque National Forest and bioluminescent bays',
      'Ultra-luxury hospitality at Dorado Beach and historic boutique sanctuaries',
      'Every in-room and outdoor tub verified across Booking.com and partner OTAs'
    ]
  }
`;

const insertTarget = '};\n\nexport function getCityContent';
if (!content.includes(insertTarget)) {
  console.error('Could not find insertTarget in src/lib/seo.ts');
  process.exit(1);
}

const updatedContent = content.replace(insertTarget, `${NEW_SEO_ENTRIES}\n${insertTarget}`);
fs.writeFileSync(seoFilePath, updatedContent, 'utf8');
console.log('✅ Successfully added all 27 bespoke destination SEO entries to src/lib/seo.ts!');
