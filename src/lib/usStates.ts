export interface USStateConfig {
  slug: string;
  name: string;
  shortName: string;
  cities: string[];
  heroImage: string;
  tagline: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  highlights: {
    region: string;
    description: string;
  }[];
  faqs: {
    question: string;
    answer: string;
  }[];
}

export const US_STATE_HUBS: Record<string, USStateConfig> = {
  'california': {
    slug: 'california',
    name: 'California',
    shortName: 'California',
    cities: ['Los Angeles', 'San Francisco', 'San Diego', 'Lake Tahoe', 'Napa', 'Palm Springs'],
    heroImage: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/los-angeles-the-beverly-hills-hotel-1.webp',
    tagline: 'From Napa Valley vineyard soaking tubs to Pacific Coast jacuzzi suites and alpine mountain retreats.',
    metaTitle: 'Hotels with Bathtub in California: Top Jacuzzi & Soaking Suites (2026)',
    metaDescription: 'Discover 60+ verified hotels with private in-room bathtubs, jacuzzi suites & deep soaking tubs across California. Napa, LA, Lake Tahoe & San Diego.',
    intro: 'California offers one of America’s most diverse landscapes for romantic bathtub getaways. Whether you seek cedar hot tubs tucked among Napa Valley vineyards, oceanfront whirlpool baths overlooking the Pacific in San Diego and Los Angeles, mid-century desert soaking spas in Palm Springs, or fireside jetted jacuzzis after a day skiing in Lake Tahoe, every property in our California guide features guaranteed private in-room tubs.',
    highlights: [
      {
        region: 'Napa Valley & Wine Country',
        description: 'Boutique estate retreats featuring private outdoor soaking tubs, courtyard spa baths, and vineyard-view whirlpools paired with world-class wine tastings.'
      },
      {
        region: 'Greater Los Angeles & Southern Coast',
        description: 'Iconic Beverly Hills luxury suites, Santa Monica ocean-breeze jetted tubs, and San Diego waterfront resorts with private couple jacuzzi suites.'
      },
      {
        region: 'Lake Tahoe & The High Sierra',
        description: 'Alpine ski chalets and mountain lodges equipped with deep jetted hot tubs and fireside tubs for winter snow retreats.'
      },
      {
        region: 'Palm Springs & Coachella Valley',
        description: 'Mid-century modern desert hideaways with private courtyard bathtubs, mineral-spring spa suites, and starry-night jetted tubs.'
      }
    ],
    faqs: [
      {
        question: 'Which hotels in California have the best private in-room bathtubs or jacuzzis?',
        answer: 'Top verified stays across California include Bardessono and Archer Hotel in Napa Valley, The Beverly Hills Hotel and Shutters on the Beach in Los Angeles, The US Grant in San Diego, and Nordic spa chalets in Lake Tahoe. All rooms have been hand-checked to confirm authentic in-room tubs.'
      },
      {
        question: 'What are the top romantic destinations in California for a bathtub getaway?',
        answer: 'Napa Valley is celebrated for private outdoor soaking tubs and vineyard views, Lake Tahoe is famous for winter mountain hot tub cabins, and the coastal stretches of Los Angeles and San Diego offer oceanfront jetted jacuzzi suites.'
      },
      {
        question: 'What is the typical nightly rate for a jacuzzi suite in California?',
        answer: 'Nightly rates typically range from $180 to $350 for boutique and upscale city hotels, scaling to $600 to $1,200+ per night for world-class luxury resorts in Napa Valley, Beverly Hills, and beachfront San Diego.'
      },
      {
        question: 'How do I ensure my California hotel room has a private tub rather than a shared facility?',
        answer: 'When booking through our partner links, always select specific room tiers labeled "Jacuzzi Suite", "Spa Tub Suite", "King Room with Soaking Tub", or "Executive Suite with Whirlpool". Standard entry-level rooms often only feature standing showers.'
      }
    ]
  },

  'florida': {
    slug: 'florida',
    name: 'Florida',
    shortName: 'Florida',
    cities: ['Miami', 'Key West', 'Orlando'],
    heroImage: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/miami-faena-hotel-miami-beach-1.webp',
    tagline: 'Oceanfront South Beach jacuzzi suites, tropical Key West garden tubs, and Orlando luxury spa retreats.',
    metaTitle: 'Hotels with Bathtub in Florida: Top 45+ Jacuzzi Suites (2026)',
    metaDescription: 'Find verified hotels with private in-room bathtubs and jacuzzi suites in Florida. Hand-checked romantic suites in Miami, Key West & Orlando.',
    intro: 'From the sun-drenched art deco coastline of Miami Beach to the laid-back Victorian porches of Key West and the world-class resort spas of Orlando, Florida is a premier destination for warm-weather relaxation. Our curated Florida selection focuses strictly on accommodations featuring private, in-suite whirlpool jacuzzis, freestanding deep soaking tubs, and secluded balcony baths.',
    highlights: [
      {
        region: 'Miami & South Beach',
        description: 'Glamorous ocean-view art deco suites, marble deep soaking tubs, and private terrace jacuzzis overlooking Biscayne Bay and the Atlantic Ocean.'
      },
      {
        region: 'Key West & The Florida Keys',
        description: 'Romantic historic conch houses and tropical boutique inns with secluded courtyard soaking tubs, garden jacuzzis, and sunset view verandas.'
      },
      {
        region: 'Orlando & Central Florida',
        description: 'Sprawling luxury resort suites, family-friendly villas with master bedroom hydrotherapy whirlpools, and peaceful lakeside spa retreats.'
      }
    ],
    faqs: [
      {
        question: 'Where can I find oceanfront hotels with jetted tubs in Florida?',
        answer: 'Miami Beach offers prime oceanfront jacuzzi suites at top properties like Faena Hotel Miami Beach, 1 Hotel South Beach, and The Setai. Key West also features intimate waterfront stays with private outdoor jetted tubs.'
      },
      {
        question: 'Are there romantic hotels with private jacuzzis in Key West?',
        answer: 'Yes, Key West is one of the most romantic destinations in the country, featuring historic inns and boutique villas with private courtyard hot tubs and suites with oversized indoor jacuzzi baths.'
      },
      {
        question: 'What are typical rates for Florida bathtub and jacuzzi suites?',
        answer: 'Rates generally start around $165 to $260 per night in Orlando and off-peak coastal areas, while peak-season winter rates in Miami Beach and Key West typically range from $350 to $850+ per night.'
      },
      {
        question: 'Do Florida hotels have private balcony tubs?',
        answer: 'Several luxury coastal properties in Miami Beach and the Keys offer suites with private ocean-view balcony soaking tubs and jetted hydrotherapy baths.'
      }
    ]
  },

  'hawaii': {
    slug: 'hawaii',
    name: 'Hawaii',
    shortName: 'Hawaii',
    cities: ['Honolulu', 'Maui'],
    heroImage: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/honolulu-pacific-monarch-hotel-1.webp',
    tagline: 'Pacific oceanfront sunset tubs, open-air lanai jetted baths, and tropical Hawaiian paradise retreats.',
    metaTitle: 'Hotels with Bathtub in Hawaii: Top Oceanfront Jacuzzi Stays (2026)',
    metaDescription: 'Discover verified Hawaii hotels & resorts with private in-room bathtubs & oceanfront jacuzzi suites across Honolulu, Oahu & Maui.',
    intro: 'Nothing rivals soaking in a deep tub while listening to Pacific surf and watching the Hawaiian sunset. From the iconic skyline of Waikiki Beach in Honolulu to the pristine shores of Kaanapali and Wailea in Maui, our Hawaii collection features verified luxury resorts and intimate condos equipped with private deep soaking tubs and in-room hydrotherapy whirlpools.',
    highlights: [
      {
        region: 'Honolulu & Oahu',
        description: 'Waikiki high-rise towers with deep soaking tubs overlooking Diamond Head, luxury oceanfront penthouse suites, and peaceful North Shore sanctuaries.'
      },
      {
        region: 'Maui (Wailea & Kaanapali)',
        description: 'World-renowned 5-star beachfront resorts featuring private lanai soaking baths, freestanding marble tubs with ocean views, and tropical garden spa suites.'
      }
    ],
    faqs: [
      {
        question: 'Which Hawaii resorts feature rooms with private bathtubs facing the ocean?',
        answer: 'Top ocean-view soaking tub options include luxury properties along Waikiki Beach in Honolulu and beachfront resorts along Wailea and Kaanapali in Maui. Many feature floor-to-ceiling bathroom windows framing Pacific horizons.'
      },
      {
        question: 'Are there hotels with private hot tubs on the balcony in Hawaii?',
        answer: 'Yes, select top-tier suites and oceanfront penthouses in Maui and Oahu offer private whirlpool hot tubs positioned directly on spacious private lanais.'
      },
      {
        question: 'What is the price range for a bathtub suite in Hawaii?',
        answer: 'Due to premium island resort demand, verified bathtub suites generally start around $280 to $450 per night, with 5-star luxury beachfront suites ranging from $750 to $1,800+ per night.'
      }
    ]
  },

  'texas': {
    slug: 'texas',
    name: 'Texas',
    shortName: 'Texas',
    cities: ['Austin', 'Houston', 'Dallas', 'San Antonio'],
    heroImage: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/austin-commodore-perry-estate-auberge-resorts-collection-austin-1.webp',
    tagline: 'Hill Country estate soaking tubs, Houston Galleria luxury suites, and chic Dallas boutique jacuzzi baths.',
    metaTitle: 'Hotels with Bathtub in Texas: Top Jacuzzi & Spa Suites (2026)',
    metaDescription: 'Explore 24+ verified Texas hotels with private in-room bathtubs & jacuzzi suites across Austin, Houston, and Dallas. Hand-checked for couples.',
    intro: 'Texas combines Southern hospitality with vibrant metropolitan culture and serene Hill Country escapes. Whether you are planning a romantic weekend getaway in Austin with artisanal soaking tubs, a shopping and spa trip to Houston with marble soaking baths, or an upscale stay in Dallas featuring jetted jacuzzi suites, our Texas directory verifies every room tier.',
    highlights: [
      {
        region: 'Austin & Texas Hill Country',
        description: 'Boutique historic estates like Commodore Perry, downtown high-rises with deep soaking tubs overlooking Lady Bird Lake, and romantic South Congress boutique retreats.'
      },
      {
        region: 'Houston Metropolitan & Galleria',
        description: 'Refined Uptown and Downtown luxury hotel suites with deep European soaking tubs, marble walk-in bathrooms, and indulgent couple spa amenities.'
      },
      {
        region: 'Dallas & Fort Worth',
        description: 'Uptown Dallas boutique hotels with whirlpool suites, art-district architectural residences, and skyline-facing jetted baths.'
      }
    ],
    faqs: [
      {
        question: 'What are the top romantic hotels with tubs in Texas?',
        answer: 'Outstanding properties include Commodore Perry Estate and Hotel Saint Cecilia in Austin, The Post Oak Hotel at Uptown in Houston, and The Ritz-Carlton Dallas. Each offers exquisite private bathing spaces.'
      },
      {
        question: 'Are there affordable hotels with jacuzzis in room in Texas?',
        answer: 'Yes, both Dallas and Houston offer numerous comfortable 3- and 4-star properties with jetted king suites starting between $140 and $210 per night.'
      },
      {
        question: 'Do Austin hotels have private outdoor tubs?',
        answer: 'Select boutique properties in Austin and surrounding Hill Country feature secluded courtyard clawfoot tubs or private outdoor soaking baths surrounded by native greenery.'
      }
    ]
  },

  'massachusetts': {
    slug: 'massachusetts',
    name: 'Massachusetts',
    shortName: 'Massachusetts',
    cities: ['Boston'],
    heroImage: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/boston-harbor-hotel-boston-1.webp',
    tagline: 'Historic Back Bay clawfoot soaking tubs, Boston Harbor waterfront suites, and Beacon Hill boutique romance.',
    metaTitle: 'Hotels with Bathtub in Massachusetts: Boston Jacuzzi Suites (2026)',
    metaDescription: 'Discover verified Massachusetts & Boston hotels with private in-room bathtubs, deep soaking tubs & jacuzzi suites. Verified stays for couples.',
    intro: 'Rich with American heritage and New England charm, Massachusetts is ideal for cozy romantic getaways. Our Massachusetts collection highlights Boston’s premier luxury hotels and historic brownstones featuring deep soaking tubs overlooking Boston Harbor, Back Bay, and the Charles River.',
    highlights: [
      {
        region: 'Boston Harbor & Waterfront',
        description: 'Five-star waterfront hotels with deep marble soaking tubs framing sweeping views of Boston Harbor, historic wharves, and passing sailboats.'
      },
      {
        region: 'Back Bay & Beacon Hill',
        description: 'Gaslit cobblestone streets and Victorian brownstone boutique suites featuring authentic clawfoot tubs and jetted hydrotherapy baths.'
      }
    ],
    faqs: [
      {
        question: 'Which Boston hotels have deep soaking bathtubs?',
        answer: 'Premier options include Boston Harbor Hotel, The Langham Boston, Four Seasons Hotel One Dalton Street, and The Whitney Hotel in Beacon Hill. Each features spacious marble bathrooms with dedicated soaking tubs.'
      },
      {
        question: 'What is the average cost for a bathtub suite in Boston?',
        answer: 'Rates generally start around $220 to $340 per night for upscale boutique stays, reaching $550 to $900+ for waterfront luxury hotel suites.'
      },
      {
        question: 'Are bathtub hotels in Boston convenient for sightseeing?',
        answer: 'Yes, our featured properties are situated in central Back Bay, Downtown Waterfront, and Beacon Hill, placing you within walking distance of the Freedom Trail, Boston Common, and top dining.'
      }
    ]
  },

  'new-york-state': {
    slug: 'new-york-state',
    name: 'New York State',
    shortName: 'New York',
    cities: ['New York'],
    heroImage: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/the-greenwich-hotel-new-york-1.webp',
    tagline: 'Manhattan skyline soaking tubs, Tribeca loft deep baths, and Central Park luxury couple suites.',
    metaTitle: 'Hotels with Bathtub in New York: Top NYC Jacuzzi Suites (2026)',
    metaDescription: 'Find verified hotels with private in-room bathtubs & jacuzzi suites in New York State & NYC. Deep soaking tubs with Manhattan skyline views.',
    intro: 'New York offers some of the most spectacular hotel bathrooms in the world. After a day exploring Manhattan’s world-class museums, Broadway theaters, and Michelin-starred dining, nothing compares to relaxing in a private soaking tub overlooking the city skyline. Our New York guide hand-checks every room to guarantee private in-room tubs.',
    highlights: [
      {
        region: 'Manhattan (SoHo, Tribeca & Village)',
        description: 'Artisanal boutique hotels like The Greenwich Hotel featuring handcrafted stone baths, custom Japanese soaking tubs, and serene bamboo spa ambiance.'
      },
      {
        region: 'Midtown & Central Park',
        description: 'Iconic luxury towers with floor-to-ceiling marble bathrooms, deep jetted tubs, and panoramic views over Central Park and Fifth Avenue.'
      }
    ],
    faqs: [
      {
        question: 'Which New York hotels have rooms with skyline-view bathtubs?',
        answer: 'Renowned hotels offering skyline and park view soaking tubs include The Greenwich Hotel in Tribeca, The Standard High Line, and luxury towers across Central Park South and Midtown.'
      },
      {
        question: 'Are there hotels with private jetted jacuzzis in New York City?',
        answer: 'Yes, select specialty suites across Manhattan feature dedicated whirlpool jetted tubs designed for two, perfect for anniversaries and romantic celebrations.'
      },
      {
        question: 'What do bathtub hotel rooms in NYC typically cost?',
        answer: 'New York rates for rooms with confirmed soaking tubs generally start from $260 to $420 per night, with premier 5-star suites ranging from $700 to $1,500+.'
      }
    ]
  },

  'illinois': {
    slug: 'illinois',
    name: 'Illinois',
    shortName: 'Illinois',
    cities: ['Chicago'],
    heroImage: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/chicago-trump-international-hotel-tower-chicago-1.webp',
    tagline: 'Magnificent Mile skyline soaking tubs, Chicago River luxury suites, and Michigan Lake views.',
    metaTitle: 'Hotels with Bathtub in Illinois: Chicago Jacuzzi Suites (2026)',
    metaDescription: 'Explore verified Illinois & Chicago hotels with private in-room bathtubs & jacuzzi suites. Panoramic Lake Michigan & skyline view soaking tubs.',
    intro: 'Illinois boasts world-famous architectural beauty, cultural attractions, and dramatic lakefront vistas. Centered around Chicago’s iconic Magnificent Mile and Loop, our Illinois collection highlights verified hotel suites featuring deep soaking tubs and hydrotherapy whirlpools overlooking the Chicago River and Lake Michigan.',
    highlights: [
      {
        region: 'Magnificent Mile & River North',
        description: 'Architectural skyscrapers with floor-to-ceiling windows, deep freestanding tubs, and spa bathrooms adjacent to Chicago’s finest shopping and dining.'
      },
      {
        region: 'The Loop & Millennium Park',
        description: 'Historic architectural landmarks and contemporary towers with luxury suites providing quiet sanctuary and deep relaxation.'
      }
    ],
    faqs: [
      {
        question: 'What are the best hotels in Chicago with private bathtubs?',
        answer: 'Top verified properties include Trump International Hotel & Tower Chicago, The Peninsula Chicago, and Waldorf Astoria Chicago, renowned for their opulent soaking baths and city panoramas.'
      },
      {
        question: 'Can I find affordable jacuzzi rooms in Chicago?',
        answer: 'Yes, quality 3- and 4-star properties just outside the immediate Magnificent Mile core offer jetted whirlpool rooms starting from $160 to $240 per night.'
      },
      {
        question: 'Do Chicago hotels have bathtubs with lake views?',
        answer: 'Several luxury high-rises along Michigan Avenue and the lakefront offer suites where the bathtub is positioned directly beside picture windows facing Lake Michigan.'
      }
    ]
  },

  'colorado': {
    slug: 'colorado',
    name: 'Colorado',
    shortName: 'Colorado',
    cities: ['Aspen', 'Denver'],
    heroImage: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/aspen-hotel-jerome-auberge-resorts-collection-aspen-1.webp',
    tagline: 'Rocky Mountain alpine hot tubs, ski chalet fireside jacuzzis, and luxury Aspen spa retreats.',
    metaTitle: 'Hotels with Bathtub in Colorado: Rocky Mountain Jacuzzi Suites (2026)',
    metaDescription: 'Find verified Colorado hotels & mountain chalets with private in-room bathtubs & hot tubs. Aspen ski-in ski-out luxury suites verified for couples.',
    intro: 'Colorado is America’s premier alpine playground, where crisp mountain air and snow-dusted peaks make a hot soak the ultimate reward. From historic Victorian mountain lodges like Hotel Jerome in Aspen to ski-in/ski-out chalets with private balcony hot tubs, our Colorado collection guarantees authentic in-room tubs and jetted spas.',
    highlights: [
      {
        region: 'Aspen & Roaring Fork Valley',
        description: 'World-class ski resorts, historic luxury hotels, and alpine lodges featuring fireside jetted tubs, steam showers, and private mountain-view hot tubs.'
      }
    ],
    faqs: [
      {
        question: 'Which Colorado hotels have private in-room hot tubs or jacuzzis?',
        answer: 'In Aspen, premier properties including Hotel Jerome (Auberge Resorts) and luxury ski chalets feature in-room whirlpool tubs, stone soaking baths, and private heated outdoor spas.'
      },
      {
        question: 'What is the best time of year for a Colorado hot tub getaway?',
        answer: 'Winter (December to March) offers magical snowy backdrops for fireside soaking, while summer and early fall (July to September) provide crisp mountain breezes and hiking retreats.'
      },
      {
        question: 'What are typical rates for Colorado mountain jacuzzi suites?',
        answer: 'In premier resort towns like Aspen, winter ski-season rates typically range from $380 to $1,100+ per night, while shoulder spring and autumn seasons offer great value.'
      }
    ]
  },

  'nevada': {
    slug: 'nevada',
    name: 'Nevada',
    shortName: 'Nevada',
    cities: ['Las Vegas'],
    heroImage: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/the-venetian-resort-las-vegas-las-vegas-1.webp',
    tagline: 'Las Vegas Strip oversized jacuzzi suites, Bellagio fountain views, and penthouse Roman tubs.',
    metaTitle: 'Hotels with Bathtub in Nevada: Las Vegas Jacuzzi Suites (2026)',
    metaDescription: 'Discover verified Nevada hotels with private in-room jacuzzi suites & deep soaking tubs on the Las Vegas Strip. Hand-verified romantic couple stays.',
    intro: 'Nevada is the world capital of entertainment and luxury hospitality. The Las Vegas Strip features some of the grandest suites ever created, boasting oversized Italian marble jetted tubs, Roman hydrotherapy baths, and penthouse jacuzzis with sweeping views of the neon skyline and dancing fountains.',
    highlights: [
      {
        region: 'The Las Vegas Strip',
        description: 'World-famous mega-resorts including The Venetian, Bellagio, and Skylofts at MGM Grand, featuring spacious Roman jetted bathtubs and private couple spa suites.'
      }
    ],
    faqs: [
      {
        question: 'Which hotels on the Las Vegas Strip have jetted jacuzzis in the room?',
        answer: 'The Venetian Resort, The Palazzo, Bellagio, Skylofts at MGM Grand, and Caesars Palace feature dedicated suites equipped with deep Roman soaking tubs and jetted whirlpool spas.'
      },
      {
        question: 'Are there Strip-view hotel rooms with bathtubs in Las Vegas?',
        answer: 'Yes, select fountain-view suites at Bellagio and upper-floor luxury towers offer deep bathtubs positioned to enjoy dazzling Strip neon and fountain shows directly from the tub.'
      },
      {
        question: 'What are typical prices for a jacuzzi suite in Las Vegas?',
        answer: 'Midweek rates can be surprisingly accessible, starting around $130 to $220 per night, while weekend and convention rates typically range from $280 to $650+ per night.'
      }
    ]
  },

  'south-carolina': {
    slug: 'south-carolina',
    name: 'South Carolina',
    shortName: 'South Carolina',
    cities: ['Charleston'],
    heroImage: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/charleston-springhill-suites-by-marriott-charleston-riverview-1.webp',
    tagline: 'Historic Charleston French Quarter clawfoot tubs, veranda jetted suites, and Southern hospitality.',
    metaTitle: 'Hotels with Bathtub in South Carolina: Charleston Stays (2026)',
    metaDescription: 'Explore verified South Carolina & Charleston hotels with private in-room bathtubs & jacuzzi suites. Romantic Southern historic inns and waterfront stays.',
    intro: 'South Carolina charms travelers with moss-draped live oaks, historic cobblestone streets, and warm coastal breezes. Centered in romantic Charleston, our South Carolina directory showcases boutique carriage houses and waterfront hotels featuring antique clawfoot tubs, marble soaking baths, and jetted couple suites.',
    highlights: [
      {
        region: 'Historic Charleston & French Quarter',
        description: 'Stately antebellum mansions, boutique inns with garden courtyards, and suites with freestanding cast-iron soaking tubs and jetted hydrotherapy baths.'
      }
    ],
    faqs: [
      {
        question: 'What are the best romantic hotels with bathtubs in Charleston?',
        answer: 'Charleston is renowned for romantic historic boutique stays featuring clawfoot tubs and jetted suites, including riverside properties and downtown historic quarter inns.'
      },
      {
        question: 'Are there waterfront hotels with tubs in South Carolina?',
        answer: 'Yes, Charleston Riverview and harborfront properties offer rooms with scenic water views and private soaking baths.'
      },
      {
        question: 'What is the price range for a bathtub room in Charleston?',
        answer: 'Rates typically range from $160 to $280 per night for quality hotels, scaling to $400 to $650 per night for luxury historic inns in the historic district.'
      }
    ]
  },

  'arizona': {
    slug: 'arizona',
    name: 'Arizona',
    shortName: 'Arizona',
    cities: ['Scottsdale', 'Sedona', 'Phoenix'],
    heroImage: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/the-phoenician-a-luxury-collection-resort-scottsdale-scottsdale-1.webp',
    tagline: 'Sedona Red Rock vortex soaking tubs, Sonoran Desert casita baths, and Scottsdale luxury resort spas.',
    metaTitle: 'Hotels with Bathtub in Arizona: Sedona & Scottsdale Jacuzzis (2026)',
    metaDescription: 'Discover verified Arizona hotels & desert resorts with private in-room bathtubs & jacuzzi suites across Sedona and Scottsdale. Hand-checked for couples.',
    intro: 'Arizona offers magical desert sunsets, dramatic red rock canyons, and world-renowned wellness sanctuaries. From Sedona’s mystical red rock views to Scottsdale’s luxurious Sonoran Desert oasis resorts, our Arizona collection highlights private outdoor tubs, deep copper soaking baths, and jetted casita spa suites.',
    highlights: [
      {
        region: 'Sedona & Red Rock Country',
        description: 'Canyon-view lodges and creek-side retreats featuring private outdoor jetted tubs, private patio hot tubs, and deep soaking tubs beneath starry skies.'
      },
      {
        region: 'Scottsdale & Sonoran Desert',
        description: 'Five-star desert resorts including The Phoenician, featuring sprawling private bathroom sanctuaries with deep Roman tubs and hydrotherapy suites.'
      }
    ],
    faqs: [
      {
        question: 'Where can I find hotels with private outdoor hot tubs in Sedona?',
        answer: 'Several luxury lodges and boutique canyon casitas in Sedona offer private outdoor hot tubs situated on secluded patios with unobstructed views of iconic red rock formations.'
      },
      {
        question: 'Which Scottsdale resorts have the best soaking tubs?',
        answer: 'The Phoenician, Four Seasons Resort Scottsdale at Troon North, and Sanctuary Camelback Mountain offer exceptional luxury suites with freestanding deep soaking tubs.'
      },
      {
        question: 'What are typical rates for an Arizona desert bathtub retreat?',
        answer: 'Nightly rates generally range from $190 to $320 for boutique stays and $450 to $950+ for premier luxury wellness resorts in peak spring and autumn months.'
      }
    ]
  },

  'tennessee': {
    slug: 'tennessee',
    name: 'Tennessee',
    shortName: 'Tennessee',
    cities: ['Nashville', 'Gatlinburg'],
    heroImage: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/nashville-the-hermitage-hotel-nashville-1.webp',
    tagline: 'Great Smoky Mountain rustic hot tub cabins, Gatlinburg jacuzzi suites, and Nashville boutique luxury.',
    metaTitle: 'Hotels with Bathtub in Tennessee: Nashville & Gatlinburg (2026)',
    metaDescription: 'Find verified Tennessee hotels & mountain cabins with private in-room bathtubs & jacuzzi suites across Nashville & Gatlinburg. Hand-checked for couples.',
    intro: 'Tennessee brings together the vibrant musical pulse of Nashville with the misty, forested beauty of the Great Smoky Mountains in Gatlinburg. Whether you crave a high-end luxury soak at The Hermitage Hotel in downtown Nashville or a secluded mountain cabin featuring a heart-shaped jacuzzi and private outdoor hot tub in Gatlinburg, our directory verifies every listing.',
    highlights: [
      {
        region: 'Great Smoky Mountains & Gatlinburg',
        description: 'Cozy timber cabins and mountain chalets equipped with jetted whirlpool tubs, fireside baths, and covered hot tub decks overlooking misty ridges.'
      },
      {
        region: 'Nashville & Music City',
        description: 'Historic grandeur at The Hermitage Hotel and stylish boutique properties in The Gulch and Music Row featuring deep marble soaking tubs.'
      }
    ],
    faqs: [
      {
        question: 'Are there cabins with heart-shaped jacuzzis in Gatlinburg?',
        answer: 'Yes, Gatlinburg and the Smokies are famous for classic romantic cabins and mountain suites featuring in-room heart-shaped jacuzzis, fireside jetted tubs, and private outdoor hot tubs.'
      },
      {
        question: 'Which luxury hotels in Nashville have private bathtubs?',
        answer: 'The Hermitage Hotel in downtown Nashville features five-star Italian marble bathrooms with deep soaking tubs. Other top boutique hotels in The Gulch and Midtown also feature confirmed deep tubs.'
      },
      {
        question: 'What are typical nightly rates for Tennessee jacuzzi accommodations?',
        answer: 'Rates in Gatlinburg and Nashville typically start from $140 to $220 per night, with luxury suites and prime mountain chalets ranging between $280 and $550 per night.'
      }
    ]
  },

  'georgia': {
    slug: 'georgia',
    name: 'Georgia',
    shortName: 'Georgia',
    cities: ['Atlanta', 'Savannah'],
    heroImage: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/bathtub-the-st-regis-atlanta.webp',
    tagline: 'From historic Savannah squares with clawfoot soaking tubs to Buckhead Atlanta skyline jacuzzi suites.',
    metaTitle: 'Hotels with Bathtub in Georgia: Top 25+ Jacuzzi & Soaking Suites (2026)',
    metaDescription: 'Find verified hotels with private in-room bathtubs and jacuzzi suites in Georgia. Hand-checked romantic suites in Atlanta & Savannah.',
    intro: 'Georgia effortlessly blends deep Southern heritage with vibrant urban sophistication. From the Spanish-moss-canopied squares and 19th-century Victorian verandas of historic Savannah to the glittering skyline towers and lush residential avenues of Buckhead Atlanta, our Georgia guide features hand-verified private in-room bathtubs, deep soaking tubs, and couple jacuzzi suites.',
    highlights: [
      {
        region: 'Historic Savannah & Riverfront',
        description: 'Romantic Queen Anne mansions and waterfront boutique hotels on Columbia and Chippewa Squares featuring antique clawfoot tubs, private verandas, and silver-service breakfasts.'
      },
      {
        region: 'Atlanta (Buckhead & Midtown)',
        description: 'High-design Buckhead towers, Midtown arts-district retreats, and historic Peachtree landmarks featuring Japanese soaking tubs, freestanding stone baths, and heated floor jacuzzi suites.'
      }
    ],
    faqs: [
      {
        question: 'Which hotels in Georgia have the best private in-room bathtubs or jacuzzis?',
        answer: 'Standout stays include The St. Regis Atlanta and Nobu Hotel in Buckhead, The Kehoe House and The Gastonian on Savannah historic squares, and The Perry Lane Hotel along the riverfront.'
      },
      {
        question: 'What are typical nightly rates for a bathtub suite in Georgia?',
        answer: 'Rates typically range from $185 to $295 for boutique hotels in Midtown Atlanta and historic Savannah, scaling to $380 to $600+ for Five-Star luxury stays like The St. Regis or Waldorf Astoria.'
      }
    ]
  },

  'pennsylvania': {
    slug: 'pennsylvania',
    name: 'Pennsylvania',
    shortName: 'Pennsylvania',
    cities: ['Philadelphia', 'Poconos'],
    heroImage: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/bathtub-the-rittenhouse-hotel-philadelphia.webp',
    tagline: 'From Rittenhouse Square marble soaking tubs to iconic Pocono Mountains couples jacuzzi retreats.',
    metaTitle: 'Hotels with Bathtub in Pennsylvania: Top Jacuzzi & Spa Suites (2026)',
    metaDescription: 'Discover verified hotels with in-room bathtubs and jacuzzi suites across Pennsylvania. Philadelphia luxury hotels & Pocono couples resorts.',
    intro: 'Pennsylvania offers an unmatched spectrum of bathtub getaways, spanning the high-culture urban sophistication of Philadelphia to the timeless romantic mountain hideaways of the Pocono Mountains. Whether you dream of soaking 57 floors above Center City at the Four Seasons or relaxing in an iconic heart-shaped whirlpool spa nestled among Pocono pine forests, every room in our guide has been verified.',
    highlights: [
      {
        region: 'Philadelphia (Rittenhouse Square & Old City)',
        description: 'Forbes Five-Star skyline towers, historic 19th-century boutique row houses, and Avenue of the Arts landmarks with deep marble soaking tubs.'
      },
      {
        region: 'Pocono Mountains',
        description: 'Classic all-inclusive romance resorts and cozy alpine chalets equipped with in-suite whirlpool jacuzzis, fireside champagne baths, and private indoor pools.'
      }
    ],
    faqs: [
      {
        question: 'Which Philadelphia hotels offer the best in-room bathtubs?',
        answer: 'Top recommendations include Four Seasons Hotel Philadelphia at Comcast Center (freestanding tubs 57 floors high), The Rittenhouse Hotel overlooking Rittenhouse Square, and Guild House Hotel in Washington Square West.'
      },
      {
        question: 'Are there hotels with whirlpool jacuzzis in the Poconos?',
        answer: 'Yes, the Poconos is historically famous for couples romance suites featuring in-room heart-shaped whirlpool jacuzzis and multi-level Champagne Tower spa tubs.'
      }
    ]
  },

  'washington': {
    slug: 'washington',
    name: 'Washington State',
    shortName: 'Washington',
    cities: ['Seattle'],
    heroImage: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/bathtub-four-seasons-hotel-seattle.webp',
    tagline: 'Puget Sound waterfront soaking tubs, Elliott Bay views, and cozy Pacific Northwest fireside suites.',
    metaTitle: 'Hotels with Bathtub in Washington State: Top Seattle Jacuzzi Suites (2026)',
    metaDescription: 'Verified hotels with private in-room bathtubs and jacuzzi suites in Washington State. Elliott Bay views, Seattle luxury hotels & soaking tubs.',
    intro: 'Framed by Puget Sound, Mount Rainier, and evergreen forests, Washington State offers quintessential Pacific Northwest serenity. In downtown Seattle, luxurious waterfront suites place deep soaking tubs next to floor-to-ceiling glass framing ferries gliding across Elliott Bay, while historic boutique hotels in Pioneer Square and Belltown deliver fireside whirlpool baths.',
    highlights: [
      {
        region: 'Downtown Seattle & Waterfront',
        description: 'Five-star waterfront sanctuaries and boutique retreats overlooking Pike Place Market, Elliott Bay, and the Olympic Mountains with deep soaking tubs.'
      }
    ],
    faqs: [
      {
        question: 'Which hotels in Seattle have bathtubs with water views?',
        answer: 'Four Seasons Hotel Seattle, The Edgewater Hotel (over Elliott Bay), and Inn at the Market feature rooms with deep soaking tubs and Puget Sound vistas.'
      },
      {
        question: 'What is the average price for a hotel with a bathtub in Seattle?',
        answer: 'Boutique and upscale hotels typically start around $220 to $310 per night, while premier waterfront five-star properties range from $450 to $700 per night.'
      }
    ]
  },

  'oregon': {
    slug: 'oregon',
    name: 'Oregon',
    shortName: 'Oregon',
    cities: ['Portland'],
    heroImage: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/bathtub-the-allison-inn-and-spa-oregon.webp',
    tagline: 'Willamette Valley vineyard soaking tubs, Willamette Riverfront suites, and historic downtown Portland boutique retreats.',
    metaTitle: 'Hotels with Bathtub in Oregon: Top Portland & Wine Country Suites (2026)',
    metaDescription: 'Find verified hotels with private in-room bathtubs in Oregon. Portland boutique hotels, Willamette Valley vineyard soaking tubs & spa suites.',
    intro: 'Oregon combines rich culinary culture, lush Willamette Valley vineyards, and rugged Pacific Northwest landscapes. Whether you are retreating to a vineyard spa with deep soaking tubs overlooking pinot noir vines or booking a historic boutique hideaway in downtown Portland with clawfoot bathtubs, our Oregon collection ensures guaranteed in-room tubs.',
    highlights: [
      {
        region: 'Portland & Willamette Valley',
        description: 'Boutique urban gems in Pearl District and Downtown, paired with world-class vineyard spa resorts in Newberg featuring deep mineral soaking tubs.'
      }
    ],
    faqs: [
      {
        question: 'Where can I find the best hotels with bathtubs in Oregon?',
        answer: 'The Allison Inn & Spa in Willamette Wine Country, Sentinel Hotel in Downtown Portland (private terrace whirlpool hot tubs), and The Nines on Pioneer Square are the highest rated.'
      },
      {
        question: 'What are typical nightly rates in Portland for bathtub rooms?',
        answer: 'Downtown Portland boutique hotels range from $185 to $265 per night, with premier vineyard resort suites at $480 to $650 per night.'
      }
    ]
  },

  'north-carolina': {
    slug: 'north-carolina',
    name: 'North Carolina',
    shortName: 'North Carolina',
    cities: ['Asheville'],
    heroImage: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/bathtub-the-omni-grove-park-inn-asheville.webp',
    tagline: 'Blue Ridge Mountain stone soaking tubs, Biltmore Estate luxury, and romantic historic Asheville inns.',
    metaTitle: 'Hotels with Bathtub in North Carolina: Top Asheville Jacuzzi Suites (2026)',
    metaDescription: 'Discover verified hotels with private in-room bathtubs in North Carolina. Blue Ridge Mountain views, Biltmore Village luxury & Asheville jacuzzi suites.',
    intro: 'Nestled in the majestic Blue Ridge Mountains, North Carolina is a premier romantic mountain destination. From George Vanderbilt’s historic 8,000-acre Biltmore Estate to the legendary granite halls of The Omni Grove Park Inn, our North Carolina guide features mountain-view soaking tubs, subterranean rock spas, and romantic Arts and Crafts suites with two-person jetted jacuzzis.',
    highlights: [
      {
        region: 'Asheville & The Blue Ridge Mountains',
        description: 'Granite boulder lodges, Victorian historic district B&Bs, and Biltmore Village retreats featuring two-person whirlpool tubs and mountain panoramas.'
      }
    ],
    faqs: [
      {
        question: 'Which hotels in Asheville, NC have private in-room jacuzzi or soaking tubs?',
        answer: 'The Omni Grove Park Inn, The Inn on Biltmore Estate, Grand Bohemian Hotel Asheville, and 1900 Inn on Montford feature confirmed private soaking tubs or jetted jacuzzis.'
      },
      {
        question: 'What is the best time of year to visit Asheville for a romantic mountain getaway?',
        answer: 'Autumn (October–November) offers world-renowned Blue Ridge fall foliage, while winter brings cozy fireplace and hot tub retreats with snow-capped mountain views.'
      }
    ]
  }
};

export function isStateSlug(slug: string): boolean {
  if (!slug) return false;
  return slug.toLowerCase() in US_STATE_HUBS;
}

export function getStateBySlug(slug: string): USStateConfig | undefined {
  if (!slug) return undefined;
  return US_STATE_HUBS[slug.toLowerCase()];
}

export function getAllStateSlugs(): string[] {
  return Object.keys(US_STATE_HUBS);
}

export function getAllStates(): USStateConfig[] {
  return Object.values(US_STATE_HUBS);
}

export function getStateForCity(cityName: string): USStateConfig | undefined {
  if (!cityName) return undefined;
  const lower = cityName.trim().toLowerCase();
  return Object.values(US_STATE_HUBS).find((state) =>
    state.cities.some((c) => c.toLowerCase() === lower)
  );
}
