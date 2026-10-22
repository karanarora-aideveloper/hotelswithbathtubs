import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import mongoose from 'mongoose';

const LUXURY_95_BY_NAME = {
  'Hotel Adlon Kempinski Berlin': 'Legendary 5-star landmark beside the Brandenburg Gate, offering palatial suites with deep en-suite marble bathtubs, private jetted whirlpools, and discreet luxury service.',
  'The Ritz-Carlton, Berlin': 'Art Deco glamour at Potsdamer Platz featuring bespoke suites equipped with heated marble bathrooms, deep soaking tubs, and lavish city-skyline views.',
  'Waldorf Astoria Berlin': 'Sophisticated West Berlin retreat near Kurfürstendamm featuring floor-to-ceiling panoramic bathrooms with freestanding soaking tubs overlooking the Berlin skyline.',
  'Regent Berlin': 'Classic Biedermeier-style luxury on historic Gendarmenmarkt, showcasing classical suites with spacious Roman-style deep soaking marble bathtubs.',
  'Hotel de Rome': 'Rocco Forte luxury residence in a converted 19th-century bank on Bebelplatz, featuring expansive stone-clad bathrooms with deep soaking tubs and historic charm.',
  'The Charles Hotel': 'Rocco Forte sanctuary overlooking Munich Old Botanical Garden, boasting light-flooded suites with mosaic limestone bathrooms and deep soaking tubs.',
  'Mandarin Oriental, Munich': 'Intimate Bavarian luxury in Munich old town, featuring lavish Asian-inspired suites with heated marble bathroom floors and deep private soaking baths.',
  'Hotel Vier Jahreszeiten Kempinski': 'Grand historic hotel on Maximilianstrasse offering aristocratic suites with expansive private spa-style jacuzzi baths and bespoke Bavarian elegance.',
  'Bayerischer Hof': 'Historic Munich landmark near Promenadeplatz, featuring individually styled luxury suites with indulgent private whirlpools and rooftop wellness amenities.',
  'Rosewood Munich': 'Splendid restoration of two landmark baroque buildings, presenting opulent suites with custom freestanding soaking tubs, underfloor heating, and bespoke bath amenities.',
  'Hotel Sacher Wien': 'Vienna quintessential historic grand hotel opposite the State Opera, featuring regal suites with deep marble bathtubs, heated floors, and old-world Austrian splendor.',
  'The Ritz-Carlton, Vienna': 'Four historic 19th-century palaces on the Schubertring Ringstrasse, offering lavish suites with oversized marble soaking tubs and bespoke Guerlain spa amenities.',
  'Park Hyatt Vienna': 'Housed in a 100-year-old former bank palace in the Goldenes Quartier, boasting palatial marble bathrooms with deep soaking bathtubs and jetted spa features.',
  'Palais Coburg Residenz': 'Historic luxury residence set atop Vienna former fortress walls, featuring imperial multi-room suites with private whirlpool bathtubs and tranquil garden views.',
  'Hotel Imperial': 'Legendary 1873 palace hotel on the Ringstrasse, offering majestic royal suites adorned with silk tapestries and palatial baths with deep marble soaking tubs.',
  'Hotel Sacher Salzburg': 'Picturesque riverside grande dame on the Salzach River, providing romantic suites with deep marble soaking tubs and storybook views of Hohensalzburg Fortress.',
  'Schloss Mönchstein': 'Fairy-tale castle perched atop Mönchsberg rock above Salzburg, featuring private panoramic suites with luxury jacuzzi whirlpool tubs overlooking the city spires.',
  'Goldener Hirsch': 'Historic 600-year-old country-manor hotel on the Getreidegasse, blending traditional Austrian craftsmanship with contemporary luxury marble soaking baths.',
  'Bristol Salzburg': 'Refined Makartplatz heritage hotel beloved by classical music maestros, featuring classic suites with deep en-suite tubs and panoramic Old Town vistas.',
  'IMLAUER Hotel Pitter Salzburg': 'Historic 1864 hotel with a panoramic rooftop restaurant, offering Executive Suites with deep in-room whirlpool bathtubs and views of the Bavarian Alps.',
  'Four Seasons Hotel Prague': 'Riverside sanctuary steps from Charles Bridge, boasting baroque-inspired suites with dramatic deep soaking bathtubs framing views of Prague Castle.',
  'Mandarin Oriental, Prague': 'Converted 14th-century monastery in Mala Strana, offering serene vaulted suites with deep stone soaking tubs and underfloor-heated limestone bathrooms.',
  'Alchymist Grand Hotel': 'Ornate baroque palace in Mala Strana featuring romantic suites draped in gilding and crystal, complemented by private jetted spa whirlpool baths.',
  'Aria Hotel Prague': 'Music-inspired boutique hotel in Mala Strana with direct access to Vrtba Garden, featuring artistic suites with deep en-suite soaking tubs and Italian mosaic tile.',
  'The Emblem Hotel': 'Art Deco-inspired boutique retreat in Old Town Prague, showcasing penthouse suites with freestanding soaking tubs and access to a rooftop jacuzzi spa.',
  'Four Seasons Hotel Gresham Palace': 'Art Nouveau architectural jewel beside the Chain Bridge, offering grand Danube-facing suites with deep marble soaking tubs and heated floors.',
  'Aria Hotel Budapest': 'Glamorous music-themed retreat beside St. Stephen’s Basilica, featuring modern luxury suites with custom bathtubs and a panoramic rooftop lounge.',
  'The Ritz-Carlton, Budapest': 'Elegant hotel in central Erzsébet Square, offering neoclassical suites with oversized deep marble soaking tubs and luxury Asprey bath amenities.',
  'Kempinski Hotel Corvinus': 'Contemporary luxury in the heart of downtown Budapest, featuring executive corner suites with sleek deep soaking bathtubs and skyline views.',
  'Matild Palace': 'Iconic UNESCO heritage Belle Époque palace at the foot of Elisabeth Bridge, featuring handcrafted suites with bespoke marble tubs and Hungarian craftsmanship.',
  'Four Seasons Hotel Ritz Lisbon': 'Mid-century landmark overlooking Eduardo VII Park, presenting grand terrace suites with opulent marble bathrooms and deep soaking tubs.',
  'Bairro Alto Hotel': 'Boutique 18th-century palace in Lisbon bohemian quarter, featuring designer suites with freestanding clawfoot bathtubs and river-facing vistas.',
  'Olissippo Lapa Palace': 'Aristocratic 19th-century hill-top palace set in subtropical gardens, offering classic Portuguese suites with marble jacuzzis and Tagus River vistas.',
  'Tivoli Avenida Liberdade': 'Chic grand hotel on Lisbon high-fashion boulevard, boasting elegant luxury suites with deep soaking bathtubs and a lush tropical pool garden.',
  'EPIC SANA Lisboa': 'Modern luxury haven in Amoreiras featuring contemporary designer suites with deep freestanding bathtubs and panoramic vistas across Lisbon.',
  'The Merrion Hotel': 'Georgian landmark opposite Government Buildings, offering historic townhouse suites with deep freestanding cast-iron soaking tubs and Italian marble.',
  'The Shelbourne': 'Historic Dublin institution on St. Stephen Green, featuring grand heritage suites with deep soaking tubs, heritage chandeliers, and opulent marble baths.',
  'The Westbury': 'Refined luxury retreat off Grafton Street, featuring contemporary suites with bespoke Italian marble bathrooms, deep soaking tubs, and heated towel racks.',
  'InterContinental Dublin': 'Tranquil Ballsbridge resort hotel surrounded by landscaped gardens, offering expansive suites with oversized marble bathrooms and deep soaking bathtubs.',
  'Conrad Dublin': 'Sleek modern hotel facing the National Concert Hall, featuring sophisticated suites with contemporary deep soaking bathtubs and personalized luxury amenities.',
  'Four Seasons Hotel Madrid': 'Glamorous restoration of seven historic buildings in Canalejas, featuring opulent palace suites with circular marble soaking tubs and private terraces.',
  'Mandarin Oriental Ritz, Madrid': 'Belle Époque palace restored by Gilles & Boissier near El Retiro, boasting majestic suites with freestanding clawfoot tubs and classical gilded details.',
  'Rosewood Villa Magna': 'Sophisticated sanctuary in Salamanca, featuring light-drenched suites with custom travertine bathrooms, deep soaking baths, and bespoke Spanish craft.',
  'Hotel Santo Mauro': 'Palatial 19th-century mansion of the Duke of Santo Mauro in Chamberí, featuring intimate aristocratic suites with antique-framed deep soaking bathtubs.',
  'The Madrid EDITION': 'Ian Schrager design masterpiece near Puerta del Sol, offering sleek penthouses with custom freestanding circular soaking bathtubs and rooftop panoramas.',
  'The Gritti Palace': 'Immortal 15th-century noble palazzo on the Grand Canal, featuring master suites adorned with Rubelli silks, antique mirrors, and deep marble soaking baths.',
  'Hotel Danieli': 'Legendary 14th-century Venetian Gothic palace steps from Piazza San Marco, featuring opulent doge-style suites with grand marble soaking tubs.',
  'Aman Venice': '16th-century Palazzo Papadopoli on the Grand Canal, showcasing museum-quality Tiepolo frescoes alongside minimalist deep soaking bathtubs in palatial suites.',
  'Belmond Hotel Cipriani': 'Venetian island paradise on Giudecca, offering secluded lagoon-facing suites with private jetted whirlpools and lush private gardens.',
  'St. Regis Venice': 'Contemporary avant-garde palace opposite Santa Maria della Salute, featuring canal-side terrace suites with bespoke freestanding marble soaking tubs.',
  'Four Seasons Hotel Firenze': 'Renaissance palazzo surrounded by Giardino della Gherardesca botanical gardens, featuring frescoed suites with regal sunken marble soaking baths.',
  'The St. Regis Florence': 'Brunelleschi-designed riverside palazzo on the Arno, offering Renaissance suites adorned with custom frescoes and deep private soaking marble bathtubs.',
  'Hotel Savoy': 'Rocco Forte property on Piazza della Repubblica, featuring contemporary Italian suites styled by Olga Polizzi with mosaic-clad deep soaking tubs.',
  'Portrait Firenze': 'Ferragamo family riverside boutique hotel overlooking Ponte Vecchio, featuring haute couture suites with bespoke stone bathrooms and deep soaking tubs.',
  'Villa Cora': '19th-century aristocratic mansion set on the Florentine hills near Boboli Gardens, offering gilded royal suites with private jetted whirlpools and rose gardens.',
  'Armani Hotel Milano': 'Minimalist haute couture haven in Quadrilatero della Moda designed by Giorgio Armani, featuring curved limestone bathrooms with deep sunken soaking tubs.',
  'Bulgari Hotel Milano': 'Discreet boutique jewel set in private 18th-century gardens near Montenapoleone, offering suites with black Zimbabwean granite soaking tubs and private green terraces.',
  'Mandarin Oriental, Milan': 'Chic retreat spanning four 18th-century palazzi in the fashion district, featuring elegant suites with black-and-white marble bathrooms and deep soaking tubs.',
  'Four Seasons Hotel Milano': 'Converted 15th-century convent in Via Gesù, showcasing tranquil courtyard suites with vaulted ceilings and oversized Carrara marble soaking bathtubs.',
  'Park Hyatt Milan': 'Palatial boutique residence steps from the Duomo, boasting Milanese travertine suites with deep soaking baths and octagonal glass cupola views.',
  'The Silo Hotel': 'Architectural marvel above the Zeitz MOCAA in the V&A Waterfront, featuring pillow-glass pillowed suites with iconic freestanding tubs framing Table Mountain.',
  'Belmond Mount Nelson Hotel': 'Historic pink grande dame at the foot of Table Mountain, featuring classic garden-estate suites with deep freestanding soaking bathtubs.',
  'Ellerman House': 'Exclusive cliffside mansion in Bantry Bay, offering ocean-view suites with private spa tubs and dramatic Atlantic sunset panoramas.',
  'One&Only Cape Town': 'Urban island sanctuary on the Victoria & Albert marina, featuring sprawling waterfront suites with oversized oval bathtubs and private balconies.',
  'Cape Grace': 'Maritime-inspired boutique hotel on a private quay, featuring romantic harbor-facing suites with handcrafted French-oak furnishings and deep soaking baths.',
  'Copacabana Palace, A Belmond Hotel': 'Art Deco oceanfront legend on Copacabana beach, offering iconic presidential suites with deep marble soaking bathtubs and private sea terraces.',
  'Fasano Rio de Janeiro': 'Philippe Starck-designed luxury hotel on Ipanema Beach, featuring retro-chic suites with deep oval bathtubs and views of the Two Brothers peaks.',
  'Emiliano Rio': 'Sophisticated beachfront hotel on Copacabana with articulated facade screens, featuring contemporary suites with deep wooden soaking tubs and Atlantic vistas.',
  'Hotel Santa Teresa Rio MGallery': 'Chic hillside colonial plantation retreat in bohemian Santa Teresa, featuring suites with hand-carved stone soaking tubs and panoramic bay views.',
  'Fairmont Rio de Janeiro Copacabana': 'Glamorous Posto 6 oceanfront haven, featuring mid-century suites with deep soaking bathtubs and vistas of Sugarloaf Mountain.',
  'Le Blanc Spa Resort': 'Adults-only all-inclusive luxury sanctuary featuring chic white-on-white oceanfront suites with double whirlpool tubs and personalized butler service.',
  'NIZUC Resort & Spa': 'Secluded Mayan-modern retreat in Punta Nizuc, featuring pavilion suites with private plunge pools, mangrove views, and deep freestanding soaking tubs.',
  'The Ritz-Carlton, Cancun': 'Classic Caribbean luxury resort featuring private ocean-view balcony suites with deep marble soaking tubs and gentle turquoise sea breezes.',
  'Secrets The Vine Cancun': 'Contemporary adults-only high-rise in the Hotel Zone, boasting sleek glass suites with freestanding soaking bathtubs and Caribbean panoramas.',
  'Live Aqua Beach Resort Cancun': 'Sensory beachfront adults-only resort featuring aromatherapy-infused suites with hydrotherapy soaking tubs and ocean views.',
  'Four Seasons Hotel Mexico City': 'Hacienda-style retreat around a central fountain courtyard on Paseo de la Reforma, featuring colonial suites with deep marble soaking baths.',
  'The St. Regis Mexico City': 'Soaring Cesar Pelli skyscraper along Paseo de la Reforma, offering bespoke suites with panoramic window-side soaking tubs and signature St. Regis butler service.',
  'Las Alcobas': 'Intimate boutique jewel in affluent Polanco, featuring custom suites with hydro-massage soaking tubs, steam showers, and artisanal Mexican amenities.',
  'Sofitel Mexico City Reforma': 'French art de vivre meets Mexican heritage, offering sky-high suites with deep freestanding soaking tubs framing views of the Angel of Independence.',
  'W Mexico City': 'Energetic luxury retreat in trendy Polanco, featuring avant-garde suites with peek-a-boo terrazzo bathrooms and oversized deep soaking tubs.',
  'Gran Hotel Costa Rica': 'Historic 1930s architectural gem on the pedestrian boulevard, featuring refined suites with deep soaking tubs overlooking the National Theatre.',
  'Costa Rica Marriott Hotel Hacienda Belen': 'Colonial coffee plantation hacienda surrounded by tropical greenery, featuring suites with deep soaking tubs and mountain views.',
  'Hotel Grano de Oro': 'Charming Victorian tropical mansion in Barrio Don Bosco, featuring garden-courtyard suites with private open-air whirlpool jacuzzis.',
  'InterContinental Costa Rica': 'Urban resort in upscale Escazu, boasting club suites with deep marble soaking tubs and access to a tranquil tropical pool oasis.',
  'Studio Hotel Boutique': 'Art-focused boutique haven in Santa Ana displaying curated Costa Rican artwork, featuring designer suites with deep relaxation bathtubs.',
  'Park Hyatt Auckland': 'Waterfront sanctuary on Wynyard Quarter, offering tranquil harbor-view suites with custom stone soaking tubs and Māori-inspired artworks.',
  'The Hotel Britomart': 'New Zealand first 5-Green Star hotel, featuring handcrafted timber suites with organic deep soaking bathtubs and artisan ceramic finishes.',
  'Sofitel Auckland Viaduct Harbour': 'French-inspired marina hotel offering private balcony suites with deep French bathtubs and views of superyachts in Viaduct Basin.',
  'Cordis, Auckland': 'Refined Upper Queen Street landmark offering Pinnacle Tower suites with marble bathrooms, deep soaking baths, and bespoke Chuan Spa products.',
  'Hilton Auckland': 'Unique cruise-ship style hotel projecting 300 meters into Waitemata Harbour, featuring bow-view suites with deep soaking tubs and open ocean vistas.',
  'Eichardt\'s Private Hotel': 'Historic waterfront boutique jewel on Lake Wakatipu, featuring intimate fireplace suites with deep stone soaking tubs and dramatic alpine panoramas.',
  'The Rees Hotel': 'Lakeside haven on the shores of Lake Wakatipu, boasting terrace apartments with Italian spa tubs framing panoramic views of The Remarkables.',
  'Blanket Bay': 'World-renowned alpine luxury lodge at the northern tip of Lake Wakatipu, featuring timber-hewn suites with stone fireplaces and deep soaking baths.',
  'Matakauri Lodge': 'Spectacular alpine retreat perched above Lake Wakatipu, featuring glass-walled suites with dramatic bathtub views of Cecil Peak and The Remarkables.',
  'Kamana Lakehouse': 'High-altitude boutique retreat overlooking Lake Wakatipu, offering contemporary suites with private cedar hot tubs and majestic mountain panoramas.',
};

function cleanTitle(str) {
  if (!str) return '';
  return str
    .replace(/^[*•\s\-\|~]+/g, '')
    .replace(/[*•\s\-\|~]+$/g, '')
    .replace(/•/g, ' - ')
    .trim();
}

function generateTailoredVacationRentalDescription(hotel) {
  const name = cleanTitle(hotel.name);
  const city = hotel.city || '';
  const room = cleanTitle(hotel.roomType || 'Private Suite');
  const tub = hotel.tubType || 'Deep Soaking Bathtub';
  const tubLower = tub.toLowerCase();
  const tubPhrase = tubLower.includes('jacuzzi') || tubLower.includes('hot tub') || tubLower.includes('whirlpool')
    ? 'private in-room jetted spa tub'
    : 'deep en-suite soaking bathtub';

  const isAlpine = ['Zakopane', 'Aspen', 'Interlaken', 'Zermatt', 'Courchevel', 'Chamonix', 'Bled', 'Rovaniemi', 'Tromso', 'Tromsø', 'Innsbruck'].some(c => city.toLowerCase().includes(c.toLowerCase()));
  const isIslandOrCoast = ['Santorini', 'Mykonos', 'Gran Canaria', 'Tenerife', 'Paphos', 'Funchal', 'Ponta Delgada', 'Dubrovnik', 'Positano', 'Capri', 'Nice', 'Miami', 'Key West', 'Maui', 'Honolulu', 'Cancun'].some(c => city.toLowerCase().includes(c.toLowerCase()));
  const isHistoricCity = ['London', 'Paris', 'Rome', 'Florence', 'Venice', 'Prague', 'Vienna', 'Budapest', 'Edinburgh', 'Dublin', 'Madrid', 'Barcelona', 'Lisbon', 'Riga', 'Vilnius', 'Berlin', 'Munich'].some(c => city.toLowerCase().includes(c.toLowerCase()));

  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) hash = (hash * 31 + name.charCodeAt(i)) & 0xffffffff;
  const variant = Math.abs(hash) % 4;

  if (isAlpine) {
    if (variant === 0) {
      return `Charming alpine retreat in ${city}, featuring a ${tubPhrase} inside the ${room}. Perfect for warming up after mountain adventures and snowy outdoor trails.`;
    } else if (variant === 1) {
      return `Scenic mountain getaway situated in ${city}, providing a ${tubPhrase} alongside tranquil alpine panoramas in its ${room}.`;
    } else if (variant === 2) {
      return `Cozy high-altitude escape in ${city}, highlighted by a ${tubPhrase} in the ${room} designed for serene relaxation and romantic winter evenings.`;
    } else {
      return `Peaceful lodge accommodation in ${city}, offering private soaking comfort with an in-room ${tubLower} and panoramic mountain vistas from the ${room}.`;
    }
  }

  if (isIslandOrCoast) {
    if (variant === 0) {
      return `Coastal sanctuary in ${city}, featuring a ${tubPhrase} in the ${room}. Designed for sun-drenched relaxation and sunset soaking by the sea.`;
    } else if (variant === 1) {
      return `Idyllic seaside retreat situated in ${city}, complete with a ${tubPhrase} and ocean breezes throughout its stylish ${room}.`;
    } else if (variant === 2) {
      return `Boutique coastal hideaway in ${city}, highlighted by a private ${tubLower} inside the ${room} for serene romantic unwinding after a day on the water.`;
    } else {
      return `Sun-kissed escape in ${city}, offering guaranteed private soaking with an en-suite ${tubLower} and tranquil views from its ${room}.`;
    }
  }

  if (isHistoricCity) {
    if (variant === 0) {
      return `Refined city retreat in central ${city}, featuring a ${tubPhrase} inside the ${room}. An elegant sanctuary for relaxing after exploring historic streets.`;
    } else if (variant === 1) {
      return `Chic urban haven in ${city}, providing an en-suite ${tubPhrase} in its ${room} alongside stylish modern comforts and effortless neighborhood access.`;
    } else if (variant === 2) {
      return `Intimate boutique stay situated in ${city}, highlighted by a private ${tubLower} in the ${room} designed for evening soaking and romantic getaways.`;
    } else {
      return `Character-rich pied-à-terre in ${city}, offering private bathing luxury with a dedicated ${tubLower} inside its ${room}.`;
    }
  }

  if (variant === 0) {
    return `Inviting private accommodation in ${city}, featuring a ${tubPhrase} inside the ${room} for couples and relaxation seekers.`;
  } else if (variant === 1) {
    return `Comfortable boutique retreat located in ${city}, complete with a ${tubPhrase} in its spacious ${room}.`;
  } else if (variant === 2) {
    return `Relaxing private stay in ${city}, highlighted by an en-suite ${tubLower} inside the ${room} for peaceful, undisturbed unwinding.`;
  } else {
    return `Stylish getaway in ${city}, offering a guaranteed private ${tubLower} within its well-appointed ${room}.`;
  }
}

async function run() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const col = db.collection('hotels');

  const operations = [];

  // 1. Process 95 Luxury hotels by name
  for (const [name, desc] of Object.entries(LUXURY_95_BY_NAME)) {
    operations.push({
      updateMany: {
        filter: { name: { $regex: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i') } },
        update: { $set: { description: desc, updatedAt: new Date() } }
      }
    });
  }

  if (operations.length > 0) {
    console.log(`Executing ${operations.length} luxury updates...`);
    const res = await col.bulkWrite(operations);
    console.log(`✅ Luxury updates executed: modified ${res.modifiedCount} docs.`);
  }

  // 2. Fetch all hotels that still have "Experience unparalleled luxury" OR "offers a verified private"
  const boilerplateHotels = await col.find({
    $or: [
      { description: { $regex: 'Experience unparalleled luxury' } },
      { description: { $regex: 'offers a verified private' } }
    ]
  }).toArray();

  console.log(`Found ${boilerplateHotels.length} remaining boilerplate hotels to rewrite...`);
  const bpOps = [];
  for (const h of boilerplateHotels) {
    const desc = generateTailoredVacationRentalDescription(h);
    bpOps.push({
      updateOne: {
        filter: { _id: h._id },
        update: { $set: { description: desc, updatedAt: new Date() } }
      }
    });
  }

  if (bpOps.length > 0) {
    console.log(`Executing ${bpOps.length} boilerplate updates...`);
    const res2 = await col.bulkWrite(bpOps);
    console.log(`✅ Boilerplate updates executed: modified ${res2.modifiedCount} docs.`);
  }

  // 3. Verify counts in DB
  const countLuxuryAfter = await col.countDocuments({ description: { $regex: 'Experience unparalleled luxury' } });
  const countBpAfter = await col.countDocuments({ description: { $regex: 'offers a verified private' } });
  console.log(`\nVerification in MongoDB:`);
  console.log(`- "Experience unparalleled luxury": ${countLuxuryAfter}`);
  console.log(`- "offers a verified private": ${countBpAfter}`);

  await mongoose.disconnect();
  console.log('Finished updating MongoDB.');
}

run().catch(console.error);
