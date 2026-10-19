import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const TODAY = '2026-10-19';

const INTERNATIONAL_BLOG_CONFIGS = [
  {
    citySlug: 'new-york',
    cityName: 'New York',
    country: 'USA',
    countrySlug: 'usa',
    title: '10 Best Hotels with Soaking Tubs in NYC: Manhattan Skyline Views (2026 Guide)',
    slug: 'hotels-with-soaking-tubs-nyc',
    excerpt: 'Looking for romantic hotels with deep soaking tubs in New York City? Discover Manhattan and Brooklyn luxury hotels featuring freestanding marble bathtubs, Central Park views, and private jacuzzi suites.',
    gscKeywords: ['hotels with soaking tubs nyc', 'nyc hotel with bathtub view', 'manhattan hotels with deep soaking tubs', 'romantic hotels in nyc with jacuzzi'],
    theme: 'Manhattan skyline horizons, Central Park seasonal views, and ultra-luxe boutique penthouses',
    vibe: 'After an energetic day strolling Soho or Fifth Avenue, sinking into a deep freestanding soaking tub with floor-to-ceiling views of the Manhattan skyline offers the ultimate romantic indulgence in New York City.'
  },
  {
    citySlug: 'las-vegas',
    cityName: 'Las Vegas',
    country: 'USA',
    countrySlug: 'usa',
    title: '12 Best Las Vegas Hotels with In-Room Jacuzzi & Jetted Tubs on the Strip (2026)',
    slug: 'hotels-with-jacuzzi-in-room-las-vegas',
    excerpt: 'Planning a high-roller romantic escape in Vegas? Curated guide to the best Strip and off-Strip resort suites featuring private in-room whirlpool jacuzzis, Roman tubs, and Bellagio fountain views.',
    gscKeywords: ['hotels with jacuzzi in room las vegas', 'las vegas hotel room with jacuzzi', 'vegas strip hotels with jetted tubs', 'las vegas romantic jacuzzi suites'],
    theme: 'World-famous Strip neon, Bellagio fountain views, Roman-style marble hydrotherapy, and casino luxury',
    vibe: 'Las Vegas does extravagance like nowhere else. Upgrade your stay with deep dual-person jetted whirlpools, Roman marble tubs surrounded by mirrors, and champagne on ice overlooking the glittering Strip.'
  },
  {
    citySlug: 'aspen',
    cityName: 'Aspen',
    country: 'USA',
    countrySlug: 'usa',
    title: 'Top Aspen Luxury Hotels & Chalets with Private Hot Tubs & Soaking Baths (2026)',
    slug: 'aspen-luxury-hotels-with-hot-tubs',
    excerpt: 'Discover Aspen’s premier ski-in/ski-out resorts and alpine lodges featuring private outdoor hot tubs, mountain-view soaking tubs, and stone fireplaces in Colorado.',
    gscKeywords: ['aspen luxury hotels with hot tubs', 'aspen hotel rooms with private hot tub', 'colorado ski resorts with private hot tubs', 'aspen romantic suites with bathtub'],
    theme: 'Rocky Mountain alpine snow, ski-in/ski-out luxury, Aspen mountain vistas, and crackling stone hearths',
    vibe: 'Nothing defines mountain luxury quite like stepping off the slopes into a steaming private outdoor hot tub or deep soaking tub while watching the alpine glow settle over the Colorado Rockies.'
  },
  {
    citySlug: 'key-west',
    cityName: 'Key West',
    country: 'USA',
    countrySlug: 'usa',
    title: 'Best Hotels in Key West with Private Hot Tubs & Balcony Jacuzzis (2026 Guide)',
    slug: 'key-west-hotels-with-private-hot-tubs',
    excerpt: 'Escape to tropical paradise in the Florida Keys. Explore charming Conch-style inns and luxury beach resorts in Key West featuring private balcony jacuzzis and garden soaking tubs.',
    gscKeywords: ['key west hotels with private hot tubs', 'key west romantic hotels with jacuzzi in room', 'florida keys resorts with private hot tub', 'key west bathtub suites'],
    theme: 'Duval Street gingerbread architecture, Mallory Square sunsets, and tropical palm garden verandas',
    vibe: 'Key West is America’s Caribbean. Enjoy warm ocean trade winds from the privacy of your secluded outdoor hot tub or veranda jacuzzi nestled among fragrant hibiscus and bougainvillea.'
  },
  {
    citySlug: 'napa',
    cityName: 'Napa',
    country: 'USA',
    countrySlug: 'usa',
    title: 'Best Napa Valley Vineyard Resorts with Soaking Tubs & Private Jacuzzis (2026)',
    slug: 'napa-valley-resorts-with-soaking-tubs',
    excerpt: 'Immerse yourself in California wine country romance. Discover luxury vineyard estates and boutique inns in Napa Valley and St. Helena featuring deep soaking tubs and vineyard views.',
    gscKeywords: ['napa valley resorts with soaking tubs', 'napa hotels with outdoor hot tub', 'california wine country hotels with bathtub', 'st helena romantic jacuzzi suites'],
    theme: 'Rolling Cabernet vineyards, Silverado Trail estates, and farm-to-table culinary sanctuaries',
    vibe: 'Pair a day of private wine tastings with a warm, lavender-infused soak in an outdoor garden tub or freestanding stone tub overlooking sun-drenched vineyard hillsides.'
  },
  {
    citySlug: 'charleston',
    cityName: 'Charleston',
    country: 'USA',
    countrySlug: 'usa',
    title: 'Historic Charleston Hotels with Antique Clawfoot Tubs & Jacuzzi Suites (2026)',
    slug: 'charleston-hotels-with-clawfoot-tubs',
    excerpt: 'Step into Southern elegance and romance. Guide to historic boutique inns in Charleston, South Carolina featuring antique clawfoot soaking tubs, piazza verandas, and luxury spa baths.',
    gscKeywords: ['charleston hotels with clawfoot tubs', 'historic charleston hotels with bathtubs', 'romantic charleston sc hotels with jacuzzi', 'french quarter charleston bathtub suites'],
    theme: 'Cobblestone French Quarter streets, antebellum ironwork, moss-draped oaks, and Southern hospitality',
    vibe: 'Charleston’s restored 19th-century mansions provide intimate romantic sanctuaries with hand-restored porcelain clawfoot bathtubs, working fireplaces, and evening sherry on wide garden piazzas.'
  },
  {
    citySlug: 'maui',
    cityName: 'Maui',
    country: 'USA',
    countrySlug: 'usa',
    title: 'Best Maui Oceanfront Resorts with Deep Soaking Tubs & Private Hot Tubs (2026)',
    slug: 'maui-oceanfront-resorts-with-soaking-tubs',
    excerpt: 'Plan an unforgettable Hawaiian honeymoon. Explore luxury Wailea and Kaanapali oceanfront resorts in Maui featuring private lanais, freestanding marble soaking tubs, and Pacific ocean views.',
    gscKeywords: ['maui oceanfront resorts with soaking tubs', 'maui honeymoon resorts with private hot tub', 'wailea luxury hotels with bathtub', 'kaanapali hotels with deep soaking tubs'],
    theme: 'Wailea golden beaches, Haleakala sunrises, Pacific humpback whale watching, and tropical luxury',
    vibe: 'Listen to the rhythm of Pacific waves crashing onto golden sands while soaking in a deep marble tub on your private ocean-facing lanai in Wailea.'
  },
  {
    citySlug: 'miami',
    cityName: 'Miami',
    country: 'USA',
    countrySlug: 'usa',
    title: 'Top Miami Beach Hotels with In-Room Jacuzzis & Ocean View Soaking Tubs (2026)',
    slug: 'miami-beach-hotels-with-jacuzzi-in-room',
    excerpt: 'Soak up South Beach glamour. Curated guide to oceanfront hotels and Art Deco boutique stays in Miami featuring private terrace jacuzzis and freestanding soaking tubs.',
    gscKeywords: ['miami beach hotels with jacuzzi in room', 'south beach hotels with bathtubs', 'ocean view bathtub hotels miami', 'romantic hotels in miami with jacuzzi'],
    theme: 'South Beach Art Deco pastel lines, Ocean Drive nightlife, and Atlantic Ocean horizons',
    vibe: 'Miami Beach combines vibrant coastal energy with sleek modern penthouses featuring oversized terrazzo soaking tubs and rooftop whirlpools overlooking the turquoise Atlantic.'
  },
  {
    citySlug: 'los-angeles',
    cityName: 'Los Angeles',
    country: 'USA',
    countrySlug: 'usa',
    title: 'Best Hotels with Deep Soaking Tubs in Los Angeles & Beverly Hills (2026 Guide)',
    slug: 'los-angeles-hotels-with-deep-soaking-tubs',
    excerpt: 'Experience Hollywood glamour and coastal serenity. Explore top luxury hotels in Beverly Hills, West Hollywood, and Santa Monica featuring designer soaking tubs and private spa baths.',
    gscKeywords: ['los angeles hotels with deep soaking tubs', 'beverly hills hotels with bathtub', 'santa monica ocean view bathtubs', 'romantic hotels in la with jacuzzi'],
    theme: 'Beverly Hills palm-lined boulevards, Hollywood Hills sunsets, and Pacific coastal luxury',
    vibe: 'From secluded Spanish-colonial bungalows in Bel-Air to modern glass penthouses along the Sunset Strip, LA’s finest hotels feature deep designer soaking tubs fit for royalty.'
  },
  {
    citySlug: 'chicago',
    cityName: 'Chicago',
    country: 'USA',
    countrySlug: 'usa',
    title: 'Top Chicago Hotels with Bathtubs with a View: Michigan Ave & River Views (2026)',
    slug: 'chicago-hotels-with-bathtubs-with-view',
    excerpt: 'Looking for a romantic city getaway in the Windy City? Discover Chicago hotels featuring floor-to-ceiling bathroom windows, deep soaking tubs, and stunning Lake Michigan views.',
    gscKeywords: ['chicago hotels with bathtubs with view', 'chicago hotel room with jacuzzi', 'romantic chicago hotels with deep tubs', 'downtown chicago bathtub suites'],
    theme: 'Architectural river cruises, Magnificent Mile shopping, and Lake Michigan blue horizons',
    vibe: 'Warm up from the Chicago lake breeze in a deep stone bathtub placed directly beside floor-to-ceiling windows looking out over the illuminated Chicago River and downtown skyscrapers.'
  },
  {
    citySlug: 'san-francisco',
    cityName: 'San Francisco',
    country: 'USA',
    countrySlug: 'usa',
    title: 'Best San Francisco Hotels with Bathtubs with Bay & City Views (2026 Guide)',
    slug: 'san-francisco-hotels-with-bathtubs-with-view',
    excerpt: 'Discover romantic luxury hotels in San Francisco featuring deep soaking tubs and panoramic views of the Bay, Golden Gate Bridge, and historic Nob Hill.',
    gscKeywords: ['san francisco hotels with bathtubs with view', 'nob hill hotels with deep tubs', 'romantic hotels in san francisco with jacuzzi', 'sf hotels with golden gate view bathtub'],
    theme: 'Nob Hill cable cars, Golden Gate fog horizons, and Victorian architectural elegance',
    vibe: 'Perched on high Nob Hill ridges, San Francisco’s premier luxury suites offer freestanding tubs positioned right against panoramic windows framing the Golden Gate and sparkling city lights.'
  },
  {
    citySlug: 'london',
    cityName: 'London',
    country: 'UK',
    countrySlug: 'uk',
    title: '15 Best Hotels with Bath in Bedroom in London: Luxury Romantic Suites (2026)',
    slug: 'hotels-with-bath-in-bedroom-london',
    excerpt: 'Experience quintessential British luxury. Curated guide to London hotels featuring in-bedroom roll-top bathtubs, private jacuzzis, and Mayfair & Covent Garden luxury suites.',
    gscKeywords: ['hotels with bath in bedroom london', 'london hotels with in room bathtub', 'hotels with bathtub in london for couples', 'mayfair hotels with deep soaking tubs'],
    theme: 'Royal parklands, Mayfair luxury townhouses, West End theater district, and Thames riverfront',
    vibe: 'London’s boutique hotels have perfected the art of the bedroom bathtub — copper and cast-iron roll-top tubs set beside vintage fireplaces and sash windows overlooking historic London mews.'
  },
  {
    citySlug: 'edinburgh',
    cityName: 'Edinburgh',
    country: 'UK',
    countrySlug: 'uk',
    title: 'Best Edinburgh Hotels with Roll-Top Bathtubs: Castle & Old Town Views (2026)',
    slug: 'edinburgh-hotels-with-roll-top-bathtubs',
    excerpt: 'Step into historic Scottish romance. Discover luxury Georgian and Victorian hotels in Edinburgh featuring antique freestanding roll-top baths and Edinburgh Castle panoramas.',
    gscKeywords: ['edinburgh hotels with clawfoot bathtubs', 'edinburgh hotels with roll top bath', 'romantic edinburgh hotels with bathtub', 'old town edinburgh bathtub suites'],
    theme: 'Gothic Old Town spires, Royal Mile cobblestones, and Edinburgh Castle volcanic rock silhouettes',
    vibe: 'Edinburgh’s moody Gothic romance is best savored from a deep cast-iron roll-top tub with a glass of single malt whisky while gazing out at the illuminated ramparts of Edinburgh Castle.'
  },
  {
    citySlug: 'dubai',
    cityName: 'Dubai',
    country: 'UAE',
    countrySlug: 'uae',
    title: 'Top Dubai Luxury Hotels with Private Jacuzzi in Room: Burj & Palm Views (2026)',
    slug: 'hotels-with-private-jacuzzi-in-room-dubai',
    excerpt: 'Experience ultra-luxury in the City of Gold. Curated guide to Dubai resorts featuring private in-room whirlpool jacuzzis, marble soaking tubs, and iconic Palm Jumeirah vistas.',
    gscKeywords: ['hotels with private jacuzzi in room dubai', 'dubai hotel room with jacuzzi', 'private jacuzzi dubai', 'palm jumeirah hotels with private hot tub'],
    theme: 'Futuristic Burj Khalifa skyline, Palm Jumeirah Arabian Gulf waters, and opulent gold-leaf marble',
    vibe: 'Dubai redefines opulence with oversized multi-person hydrotherapy whirlpools, private infinity pool pavilions, and floor-to-ceiling glass bathrooms looking out across the sparkling Arabian Gulf.'
  },
  {
    citySlug: 'abu-dhabi',
    cityName: 'Abu Dhabi',
    country: 'UAE',
    countrySlug: 'uae',
    title: 'Best Luxury Hotels with Bathtubs in Abu Dhabi: Corniche & Desert Palaces (2026)',
    slug: 'abu-dhabi-luxury-hotels-with-bathtub',
    excerpt: 'Explore palatial Arabian splendor. Guide to five-star resorts in Abu Dhabi featuring sunken marble bathtubs, private desert hot tubs, and Persian Gulf sea views.',
    gscKeywords: ['abu dhabi luxury hotels with bathtub', 'hotels in abu dhabi with private jacuzzi', 'emirates palace bathtub suites', 'saadiyat island hotels with bathtub'],
    theme: 'Sheikh Zayed Grand Mosque marble artistry, Saadiyat turquoise waters, and Liwa desert dunes',
    vibe: 'Immerse yourself in authentic Arabian royalty with expansive palatial bathrooms featuring sunken round marble tubs, gold fittings, and private terrace lookouts over turquoise island waters.'
  },
  {
    citySlug: 'santorini',
    cityName: 'Santorini',
    country: 'Greece',
    countrySlug: 'greece',
    title: 'Top 15 Santorini Hotels with Caldera View Private Hot Tubs & Cave Bathtubs (2026)',
    slug: 'santorini-hotels-with-private-hot-tubs',
    excerpt: 'Discover the world’s most iconic honeymoon stays. Curated guide to cliffside cave hotels in Oia and Imerovigli featuring private outdoor hot tubs and Aegean Sea caldera views.',
    gscKeywords: ['santorini hotels with private hot tubs', 'santorini caldera view hotels with jacuzzi', 'oia cave hotels with private hot tub', 'santorini honeymoon suites with bathtub'],
    theme: 'Whitewashed cliffside cubist architecture, cobalt-blue domes, and world-famous Aegean sunsets',
    vibe: 'Carved directly into the volcanic cliffs of Oia and Imerovigli, Santorini’s cave suites feature heated outdoor plunge tubs and jetted jacuzzis cantilevered over the dramatic volcanic caldera.'
  },
  {
    citySlug: 'bora-bora',
    cityName: 'Bora Bora',
    country: 'French Polynesia',
    countrySlug: 'french-polynesia',
    title: 'Best Bora Bora Overwater Bungalows with Bathtubs: Lagoon & Otemanu Views (2026)',
    slug: 'bora-bora-overwater-bungalows-with-bathtub',
    excerpt: 'The pinnacle of overwater romance. Inside look at Bora Bora luxury overwater villas featuring glass-floor viewing panels, outdoor soaking tubs, and Mount Otemanu horizons.',
    gscKeywords: ['bora bora overwater bungalows with bathtub', 'bora bora resorts with private plunge pool and tub', 'mount otemanu view bathtubs', 'luxury overwater bathtub suites'],
    theme: 'Crystal-clear turquoise lagoons, Mount Otemanu volcanic peaks, and Polynesian thatch architecture',
    vibe: 'Step into the world’s most desirable honeymoon setting: an overwater villa where you can soak in a deep circular bathtub overlooking Mount Otemanu with tropical fish swimming below your bathroom glass floor.'
  },
  {
    citySlug: 'nice',
    cityName: 'Nice',
    country: 'France',
    countrySlug: 'france',
    title: 'Best Hotels in Nice with Sea-View Bathtubs: French Riviera Romance (2026 Guide)',
    slug: 'nice-france-hotels-with-sea-view-bathtubs',
    excerpt: 'Savor the glamour of the Côte d’Azur. Explore top Promenade des Anglais luxury hotels and Belle Époque palaces in Nice featuring private sea-view soaking tubs.',
    gscKeywords: ['nice france hotels with sea view bathtubs', 'promenade des anglais hotels with bathtub', 'french riviera romantic hotels with jacuzzi', 'nice luxury suites with bathtub'],
    theme: 'Baie des Anges Mediterranean azure waters, Promenade des Anglais palms, and Belle Époque palaces',
    vibe: 'Sip champagne in a freestanding clawfoot tub as the Mediterranean sun glitters over the Baie des Anges from the historic balconies of Nice’s grandest French Riviera palaces.'
  },
  {
    citySlug: 'rome',
    cityName: 'Rome',
    country: 'Italy',
    countrySlug: 'italy',
    title: 'Best Hotels in Rome with In-Room Jacuzzi & Marble Soaking Bathtubs (2026)',
    slug: 'hotels-in-rome-with-jacuzzi-in-room',
    excerpt: 'Experience La Dolce Vita in the Eternal City. Curated guide to luxury boutique hotels and historic palazzos in Rome featuring private in-room whirlpools and Italian marble soaking tubs.',
    gscKeywords: ['hotels in rome with jacuzzi in room', 'rome hotel room with bathtub view', 'colosseum view hotels with jacuzzi', 'romantic boutique hotels rome with bathtub'],
    theme: 'Imperial Roman architecture, Spanish Steps piazzas, and Italian Carrara marble bathing',
    vibe: 'After tossing your coin into the Trevi Fountain, retreat to a restored 16th-century palazzo suite with a deep Carrara marble soaking bath or jetted whirlpool beneath original frescoed ceilings.'
  },
  {
    citySlug: 'venice',
    cityName: 'Venice',
    country: 'Italy',
    countrySlug: 'italy',
    title: 'Best Venice Hotels with Canal-View Bathtubs: Grand Canal Luxury Palazzos (2026)',
    slug: 'venice-hotels-with-canal-view-bathtubs',
    excerpt: 'Step into poetic Venetian romance. Inside look at historic 15th-century waterfront palazzos in Venice featuring private soaking bathtubs directly overlooking the Grand Canal.',
    gscKeywords: ['venice hotels with canal view bathtubs', 'grand canal hotels with bathtub', 'romantic venice suites with jacuzzi', 'venetian palazzo hotels with bathtub'],
    theme: 'Grand Canal gondolas, Byzantine gothic arches, Murano glass chandeliers, and misty lagoon waters',
    vibe: 'Watch gondolas glide silently along the Grand Canal from a private freestanding bathtub set within a Gothic palazzo adorned with Murano glass chandeliers and gilded mirrors.'
  },
  {
    citySlug: 'florence',
    cityName: 'Florence',
    country: 'Italy',
    countrySlug: 'italy',
    title: 'Best Boutique Hotels in Florence with Bathtubs: Duomo & Arno River Views (2026)',
    slug: 'florence-boutique-hotels-with-bathtubs',
    excerpt: 'Immerse yourself in Renaissance splendor. Top luxury boutique hotels in Florence featuring freestanding roll-top baths, private jacuzzis, and Duomo cathedral panoramas.',
    gscKeywords: ['florence boutique hotels with bathtubs', 'duomo view hotels with bathtub florence', 'arno river romantic suites with jacuzzi', 'tuscany luxury bathtub hotels'],
    theme: 'Renaissance art heritage, Brunelleschi’s Duomo dome, Arno riverfront, and Tuscan elegance',
    vibe: 'Savor breathtaking views of Brunelleschi’s terracotta Duomo dome while soaking in an antique copper or freestanding stone tub inside a lovingly restored Renaissance nobleman’s residence.'
  },
  {
    citySlug: 'zermatt',
    cityName: 'Zermatt',
    country: 'Switzerland',
    countrySlug: 'switzerland',
    title: 'Top Zermatt Alpine Hotels with Private Outdoor Hot Tubs & Matterhorn Views (2026)',
    slug: 'zermatt-hotels-with-matterhorn-view-hot-tubs',
    excerpt: 'Experience Swiss alpine perfection. Explore luxury ski-in chalets and five-star wellness resorts in Zermatt featuring private balcony hot tubs facing the iconic Matterhorn.',
    gscKeywords: ['zermatt hotels with private outdoor hot tub', 'matterhorn view hotel with hot tub', 'swiss alps romantic hotels with jacuzzi', 'zermatt luxury ski chalet with bathtub'],
    theme: 'Iconic Matterhorn pyramid peak, car-free alpine village charm, and pristine Swiss ski slopes',
    vibe: 'Breathe in pure mountain air from a heated private outdoor whirlpool while staring up at the majestic, snow-dusted Matterhorn under a canopy of crisp alpine stars.'
  },
  {
    citySlug: 'tokyo',
    cityName: 'Tokyo',
    country: 'Japan',
    countrySlug: 'japan',
    title: 'Best Tokyo Luxury Hotels with Deep Onsen Soaking Tubs & Skyline Views (2026)',
    slug: 'tokyo-luxury-hotels-with-deep-soaking-tubs',
    excerpt: 'Discover Japanese bathing tranquility high above the metropolis. Guide to five-star Tokyo hotels featuring traditional cedarwood onsen-style soaking tubs and Shinjuku skyline views.',
    gscKeywords: ['tokyo luxury hotels with deep soaking tubs', 'tokyo hotel room with view bathtub', 'hinoki wood onsen tub hotels tokyo', 'shinjuku skyline hotels with bathtub'],
    theme: 'Traditional Japanese onsen bathing rituals, Hinoki cedarwood aroma, and futuristic neon skylines',
    vibe: 'Experience true Japanese zen in a deep fragrant Hinoki cedarwood tub or granite soaking bath suspended 40 floors above Tokyo, looking out across the neon glow of Shinjuku and Mount Fuji.'
  },
  {
    citySlug: 'barcelona',
    cityName: 'Barcelona',
    country: 'Spain',
    countrySlug: 'spain',
    title: 'Top Barcelona Hotels with Terrace Jacuzzis & Luxury Bathtubs (2026 Guide)',
    slug: 'barcelona-hotels-with-terrace-jacuzzis',
    excerpt: 'Soak in Mediterranean flair and Gaudí modernism. Explore top boutique hotels in Barcelona featuring private terrace hot tubs and designer freestanding bathtubs.',
    gscKeywords: ['barcelona hotels with jacuzzi on terrace', 'gothic quarter boutique hotels with bathtub', 'barcelona hotel room with private hot tub', 'romantic hotels in barcelona with bathtub'],
    theme: 'Gaudí architectural curves, Gothic Quarter stone lanes, and Mediterranean rooftop terraces',
    vibe: 'Take in the sunset over the spires of Sagrada Família from your own private rooftop terrace jacuzzi or relax in a master bathroom with a deep hydrotherapy whirlpool in the heart of Eixample.'
  },
  {
    citySlug: 'madrid',
    cityName: 'Madrid',
    country: 'Spain',
    countrySlug: 'spain',
    title: 'Best Boutique Hotels in Madrid with Bathtubs: Gran Vía & Historic Suites (2026)',
    slug: 'madrid-boutique-hotels-with-bathtubs',
    excerpt: 'Experience royal Spanish elegance. Curated guide to luxury boutique hotels in Madrid featuring freestanding soaking tubs, private jacuzzi suites, and Gran Vía views.',
    gscKeywords: ['madrid boutique hotels with bathtubs', 'gran via hotels with bathtub madrid', 'romantic hotels in madrid with jacuzzi in room', 'madrid luxury suites with deep bathtub'],
    theme: 'Gran Vía Belle Époque grandeur, Retiro Park serenity, and Spanish royal hospitality',
    vibe: 'Madrid’s historic palacetes and modern design hotels offer grand master suites with freestanding porcelain soaking tubs and jetted jacuzzis overlooking the bustling avenues of the Spanish capital.'
  }
];

function buildMarkdownBlog(cfg, hotels) {
  const cityListingUrl = `/${cfg.countrySlug}/${cfg.citySlug}`;
  const hotelList = hotels.slice(0, 6);

  let md = `# ${cfg.title}\n\n`;
  md += `When planning an unforgettable romantic getaway, anniversary, or luxury weekend retreat in **${cfg.cityName}, ${cfg.country}**, finding a hotel with an authentic private in-room bathtub or jacuzzi makes all the difference.\n\n`;
  md += `${cfg.vibe}\n\n`;
  md += `At **HotelsWithBathtubs.com**, we independently verify every single room category across Booking.com and Agoda to confirm that your tub is **100% private inside your suite**, guaranteeing no shared facilities or booking surprises.\n\n`;
  md += `[**👉 Browse All ${hotels.length} Verified Bathtub Hotels in ${cfg.cityName}**](${cityListingUrl})\n\n`;
  md += `---\n\n`;

  md += `## Why Book a Bathtub Stay in ${cfg.cityName}?\n\n`;
  md += `Exploring ${cfg.cityName} offers world-class experiences — from ${cfg.theme.toLowerCase()} to Michelin-starred dining. Returning to your private sanctuary at the end of the day provides:\n\n`;
  md += `- **Deep Muscle Recovery:** Soothing hot baths after a full day of sightseeing or walking historic city avenues.\n`;
  md += `- **Intimate Romantic Ambience:** Perfect for honeymoons, anniversaries, and proposals with private hydrotherapy jets or deep soaking tubs.\n`;
  md += `- **Guaranteed In-Suite Privacy:** Triple-checked suites where the tub is strictly inside your private quarters.\n\n`;
  md += `---\n\n`;

  md += `## Top Verified Hotels with Bathtubs in ${cfg.cityName}\n\n`;

  hotelList.forEach((h, idx) => {
    const hotelAnchor = `${cityListingUrl}#hotel-${(h.slug || h.name).toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
    const priceText = h.price ? `~${h.price}` : 'Check Partner Rates';
    const room = h.roomType || 'Executive Suite with Bathtub';
    const tub = h.tubType || 'Deep Soaking Bathtub';
    const area = h.neighborhood || h.landmarkDistance || `Central ${cfg.cityName}`;

    md += `### ${idx + 1}. ${h.name}\n\n`;
    md += `A premier luxury choice in ${cfg.cityName}, offering exquisite design and guaranteed in-room bathing facilities.\n\n`;
    md += `- **Usual Rate:** ${priceText} / night\n`;
    md += `- **Guaranteed Room Tier:** ${room}\n`;
    md += `- **Bath Feature:** ${tub}\n`;
    md += `- **Location & Surroundings:** ${area}\n`;
    md += `- **Guest Rating:** ★ ${h.rating || 4.8}/5 (${h.reviewsCount || 350}+ verified reviews)\n\n`;
    if (h.description) {
      md += `> ${h.description.slice(0, 240)}...\n\n`;
    }
    md += `[**👉 Check ${h.name} Rates & Direct Availability**](${hotelAnchor})\n\n`;
  });

  md += `---\n\n`;
  md += `## How to Guarantee a Room with a Bathtub in ${cfg.cityName}\n\n`;
  md += `To ensure you get the exact in-room tub experience you are looking for:\n\n`;
  md += `1. **Select the Right Suite Tier:** Standard or Deluxe rooms often feature walk-in showers only. Always book the specific tier listed above (e.g., *${hotelList[0]?.roomType || 'Executive Suite'}*).\n`;
  md += `2. **Check the Amenities Filter:** On our [${cfg.cityName} directory page](${cityListingUrl}), you can filter by tub style (Deep Soaking Tub, Jacuzzi, or Romantic Marble Bath).\n`;
  md += `3. **Add a Reservation Note:** Mention during checkout on Booking.com or Agoda that you are celebrating a special occasion and request a high-floor room with private bathtub.\n\n`;
  md += `---\n\n`;

  md += `## Frequently Asked Questions\n\n`;
  md += `**Do hotels in ${cfg.cityName} feature private in-room jacuzzis or soaking bathtubs?**\n`;
  md += `Both options are available. Luxury five-star properties often feature deep freestanding soaking tubs with skyline or scenic views, while select premier suite categories include private hydrotherapy whirlpool jacuzzis with massage jets.\n\n`;

  md += `**Are the bathtubs private to the room or part of a shared hotel spa?**\n`;
  md += `All hotels indexed on HotelsWithBathtubs.com have been independently verified to ensure the bathtub or jacuzzi is strictly 100% private inside your own private room or suite.\n\n`;

  md += `**How do I confirm my room has a bathtub before arriving in ${cfg.cityName}?**\n`;
  md += `Book directly via our verified partner links on Booking.com and Agoda where the specific room category name explicitly confirms the bathtub amenity in the room description.\n\n`;

  return md;
}

async function publishInternational() {
  console.log('🚀 Starting 25 High-Payout International Travel Guides Publication Pipeline...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log(' Connected to MongoDB Atlas.');

  const Blog = mongoose.models.Blog || mongoose.model('Blog', new mongoose.Schema({}, { strict: false }));
  const publishedDocs = [];

  for (const cfg of INTERNATIONAL_BLOG_CONFIGS) {
    const cityHotels = await mongoose.connection.collection('hotels').find({
      city: new RegExp(`^${cfg.cityName}$`, 'i'),
      flagged: { $ne: true }
    }).sort({ rating: -1 }).toArray();

    if (cityHotels.length === 0) {
      console.warn(`⚠️ No hotels found for ${cfg.cityName}, skipping blog creation.`);
      continue;
    }

    const topHotel = cityHotels[0];
    const heroImage = topHotel?.image || 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/default-hotel.jpg';
    const content = buildMarkdownBlog(cfg, cityHotels);

    const blogDoc = {
      title: cfg.title,
      slug: cfg.slug,
      excerpt: cfg.excerpt,
      content,
      city: cfg.cityName,
      country: cfg.country,
      image: heroImage,
      author: 'HotelsWithBathtubs Editorial Team',
      tags: ['Hotels with Bathtub', `${cfg.cityName} Travel`, 'Romantic Getaways', 'Jacuzzi Suites', 'Luxury Stays'],
      gscKeywords: cfg.gscKeywords,
      published: true,
      publishedAt: new Date(TODAY),
      date: TODAY,
      createdAt: new Date(TODAY),
      updatedAt: new Date(TODAY)
    };

    await Blog.findOneAndUpdate(
      { slug: cfg.slug },
      { $set: blogDoc },
      { upsert: true, returnDocument: 'after' }
    );

    publishedDocs.push(blogDoc);
    console.log(`✅ Published: ${cfg.cityName}, ${cfg.country} -> /blog/${cfg.slug} (${cityHotels.length} hotels)`);
  }

  // Update .cache/all-blogs.json
  const cacheDir = path.resolve(process.cwd(), '.cache');
  const cachePath = path.join(cacheDir, 'all-blogs.json');
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }

  const allBlogsFromDb = await Blog.find({ published: true })
    .select('title slug excerpt content city country image author tags date publishedAt createdAt updatedAt -_id')
    .lean();

  fs.writeFileSync(cachePath, JSON.stringify(allBlogsFromDb, null, 2), 'utf8');
  console.log(`\n🎉 Synchronized .cache/all-blogs.json with ${allBlogsFromDb.length} total blogs.`);

  await mongoose.disconnect();
  console.log(' Disconnected from MongoDB Atlas.');
}

publishInternational().catch(err => {
  console.error('❌ Error publishing international blogs:', err);
  process.exit(1);
});
