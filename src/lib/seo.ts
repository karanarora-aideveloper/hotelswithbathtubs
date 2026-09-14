// SEO content generation for city pages
import { titleCase } from '@/lib/utils';

export const cityIntroContent: Record<string, { intro: string; amenities: string[]; whyChoose: string[] }> = {
  // India - Goa
  'goa-india': {
    intro: 'Goa offers the ultimate blend of tropical beaches and romantic luxury. Discover verified hotels with private bathtubs and jacuzzi suites ideal for couples seeking intimate getaways along the Arabian Sea coast.',
    amenities: [
      'Oceanfront soaking tubs with panoramic sea views',
      'Private jacuzzi suites designed for romantic retreats',
      'Luxury outdoor rain showers in tropical gardens',
      'Private plunge pools with connected soaking baths',
      'Aromatherapy and Ayurvedic bath preparations'
    ],
    whyChoose: [
      'Top choice for honeymoons and romantic anniversaries',
      'Beachside resort locations with direct sunset vistas',
      'Seamless access to Goa’s coastal nightlife and beach clubs',
      'Triple-verified across MakeMyTrip, Agoda, and Booking.com'
    ]
  },

  // India - Jaipur
  'jaipur-india': {
    intro: 'Jaipur, the iconic Pink City, combines royal heritage with modern opulent comfort. Find premium hotels featuring palace-style marble bathtubs and jacuzzi suites for romantic explorations of Rajasthan.',
    amenities: [
      'Royal Rajasthani hand-carved marble bathtubs',
      'Heated private jacuzzi suites in heritage havelis',
      'Spa-quality bathroom fixtures with antique brass finishings',
      'Courtyard-facing deep soaking tubs'
    ],
    whyChoose: [
      'Stay in converted royal palaces and luxury heritage stays',
      'Minutes from the City Palace, Hawa Mahal, and Amber Fort',
      'Regal hospitality with personalized romantic dining',
      'Verified in-room tub amenities guaranteed on booking'
    ]
  },

  // India - Udaipur
  'udaipur-india': {
    intro: 'Udaipur, the Venice of the East, is renowned for fairy-tale lakefront palaces. Experience deep marble soaking bathtubs and private jacuzzis with direct views over Lake Pichola.',
    amenities: [
      'Lake Pichola-facing private soaking tubs',
      'Heritage marble bathrooms with luxury bath essentials',
      'Palatial jacuzzi suites with ornate jharokhas',
      'Candlelit sunset bath setups with rose petals'
    ],
    whyChoose: [
      'India’s most romantic honeymoon destination',
      'Unmatched panoramic views of the Lake Palace and Aravali hills',
      'Private boat rides and rooftop dining at your doorstep',
      'Verified accommodations for couples and honeymooners'
    ]
  },

  // India - Manali
  'manali-india': {
    intro: 'Manali, nestled in the snow-clad Himalayas, is a top mountain sanctuary for couples. Enjoy steaming cedarwood and hot whirlpool tubs while gazing at snow-capped alpine peaks.',
    amenities: [
      'Snow-view heated indoor bathtubs and jacuzzis',
      'Alpine cedarwood soaking tubs with forest views',
      'Fireplace-adjacent luxury master bathrooms',
      'Mountain spring water bath experiences'
    ],
    whyChoose: [
      'Breathtaking Himalayan mountain and apple orchard views',
      'Ideal winter retreat and summer honeymoon getaway',
      'Cozy mountain cottages and boutique luxury resorts',
      'All listings verified with confirmed in-room heating and bathtubs'
    ]
  },

  // India - Munnar
  'munnar-india': {
    intro: 'Munnar’s misty tea plantations and rolling green hills create an idyllic backdrop for romance. Discover tranquil resorts with deep soaking tubs overlooking emerald valley vistas.',
    amenities: [
      'Tea-garden facing panoramic bathtubs',
      'Private balcony jacuzzi tubs surrounded by mist',
      'Ayurvedic herbal bath therapies and essential oils',
      'Spacious glass-walled bathrooms with valley views'
    ],
    whyChoose: [
      'Serene and peaceful tea estate hideaways',
      'Crisp mountain climate perfect for warm bubble baths',
      'Private villa and luxury glamping options for couples',
      'Accurate room tier verification across all platforms'
    ]
  },

  // India - Shimla
  'shimla-india': {
    intro: 'Shimla blends colonial charm with Himalayan tranquility. Discover classic heritage hotels and modern luxury resorts with private bathtubs framing pine forest views.',
    amenities: [
      'Colonial roll-top and heritage clawfoot bathtubs',
      'Valley-facing luxury jacuzzi suites',
      'Heated bathroom floors and designer fixtures',
      'Aromatherapy bath amenities and plush bathrobes'
    ],
    whyChoose: [
      'Historic Mall Road locations and peaceful forest outskirts',
      'Romantic pine-forested walking trails and scenic vistas',
      'Perfect romantic weekend escape from Delhi NCR',
      'Verified private tub rooms with zero shared amenities'
    ]
  },

  // India - Lucknow
  'lucknow-india': {
    intro: 'Lucknow, the city of Nawabs, blends regal Awadhi heritage with contemporary five-star indulgence. Discover handpicked luxury hotels featuring private marble soaking tubs and jacuzzi suites curated for couples seeking an intimate staycation.',
    amenities: [
      'Palatial marble deep-soaking bathtubs',
      'Gomti River-facing luxury jacuzzi suites',
      'Spacious en-suite master bathrooms with rain showers',
      'Aromatherapy bath oils and complimentary plush bathrobes',
      'Romantic candlelit in-room bath preparations'
    ],
    whyChoose: [
      'Regal Awadhi hospitality and world-famous culinary heritage',
      'Prime Gomti Nagar riverfront and Hazratganj central locations',
      'Ideal for couples anniversaries, honeymoons, and weekend staycations',
      'Triple-verified across Booking.com, Agoda, and MakeMyTrip'
    ]
  },

  // India - Delhi
  'delhi-india': {
    intro: 'Delhi, the historic capital, offers premier 5-star luxury and boutique retreats with private in-room bathtubs and jacuzzis for couples and staycationers.',
    amenities: [
      'High-end freestanding soaking tubs with skyline views',
      'Jacuzzi suites with multi-jet hydrotherapy',
      'Spacious Italian marble bathrooms with rainfall showers',
      'Premium designer bath salts and luxury amenities'
    ],
    whyChoose: [
      'Central locations in Aerocity, South Delhi, and Central Delhi',
      'Ideal for romantic anniversary staycations and weekend getaways',
      'World-class dining and spa facilities on-site',
      'Verified direct booking options across leading OTAs'
    ]
  },

  // India - Mumbai
  'mumbai-india': {
    intro: 'Mumbai offers world-class luxury suites with private soaking tubs overlooking the Arabian Sea and the glittering city skyline for unforgettable romantic escapes.',
    amenities: [
      'High-rise Arabian Sea view soaking tubs',
      'Luxury Italian marble master bathrooms',
      'Temperature-controlled private jacuzzi suites',
      'Spa-grade bath products and walk-in rain showers'
    ],
    whyChoose: [
      'Iconic locations in South Mumbai, Bandra, and Juhu',
      'Exceptional fine dining and nightlife minutes away',
      'Perfect city staycation retreats for couples',
      'Triple-verified in-room bathtub amenities'
    ]
  },

  // India - Bangalore
  'bangalore-india': {
    intro: 'Bangalore blends lush green gardens with high-tech urban luxury. Explore 5-star suites and boutique stays featuring private soaking tubs and jacuzzi amenities.',
    amenities: [
      'Smart temperature-controlled bathtubs',
      'Private balcony jacuzzis with garden vistas',
      'Hydro-massage shower systems and sunken tubs',
      'Luxury organic wellness and bath product sets'
    ],
    whyChoose: [
      'Year-round pleasant weather perfect for couple retreats',
      'Located near premium dining and cafe hubs in Koramangala and Indiranagar',
      'Top-rated 5-star business and leisure properties',
      'Guaranteed private in-room bathtubs across all listings'
    ]
  },

  // India - Kolkata
  'kolkata-india': {
    intro: 'Kolkata, the City of Joy, offers heritage elegance and modern riverside luxury. Discover boutique hotels and grand 5-star stays with private in-room bathtubs.',
    amenities: [
      'Heritage-style freestanding and marble bathtubs',
      'Spacious soaking tubs with ambient mood lighting',
      'Private jacuzzi suites in luxury city properties',
      'Spa therapies and premium bath amenities'
    ],
    whyChoose: [
      'Rich cultural surroundings with world-class Bengali hospitality',
      'Affordable luxury rates compared to other metro destinations',
      'Ideal for couples seeking romantic staycations',
      'Every listing independently validated for bathtub availability'
    ]
  },

  // UAE - Dubai
  'dubai-uae': {
    intro: 'Dubai represents the pinnacle of global luxury, offering spectacular skyline and ocean-view suites with private jacuzzis, gold-accented bathtubs, and overwater villas.',
    amenities: [
      'Floor-to-ceiling glass bathtubs framing Burj Khalifa or Palm Jumeirah',
      'Private outdoor balcony jacuzzis overlooking the Arabian Gulf',
      'Underwater suite bathtubs facing marine aquariums',
      'Bespoke designer bath amenities and private butler service'
    ],
    whyChoose: [
      'World-leading luxury hotel architecture and hospitality',
      'Iconic romantic honeymoon setting with desert and sea experiences',
      'Michelin-starred dining and private beach club access',
      'Triple-verified partner booking links with best price guarantees'
    ]
  },

  // UK - London
  'london-uk': {
    intro: 'London offers timeless British grandeur and chic boutique elegance, with historic roll-top bathtubs, sky-high glass soaking tubs, and private luxury suites.',
    amenities: [
      'Sky-high bathtubs in The Shard with panoramic River Thames views',
      'Classic British roll-top and freestanding copper bathtubs',
      'Opulent Carrara marble bathrooms with underfloor heating',
      'Bespoke British bath and spa fragrances'
    ],
    whyChoose: [
      'Prestigious Mayfair, Westminster, and Covent Garden addresses',
      'Iconic heritage hotels with world-class afternoon tea and dining',
      'Unforgettable romantic city breaks in the heart of London',
      'Fully validated room categories ensuring guaranteed bathtub access'
    ]
  },

  // USA - New York
  'new-york-usa': {
    intro: 'New York City delivers iconic romantic luxury, from Tribeca boutique Japanese soaking tubs to sky-high suites with deep baths framing Central Park.',
    amenities: [
      'Deep Japanese-style soaking tubs in bespoke boutique suites',
      'Central Park and Hudson River panoramic skyline bathtubs',
      'Handcrafted Moroccan tile and white marble bathrooms',
      'Exclusive luxury spa bath products and plush terry robes'
    ],
    whyChoose: [
      'Unrivaled access to Broadway, Michelin-starred dining, and Central Park',
      'World-famous boutique and 5-star luxury hotels',
      'Perfect for anniversary celebrations and couple getaways',
      'Verified room tiers with private in-room bathtubs'
    ]
  },

  // USA - Las Vegas
  'las-vegas-usa': {
    intro: 'Las Vegas Strip luxury resorts feature lavish Roman soaking tubs, dual-head rain showers, and private whirlpool jacuzzis built for romantic couple celebrations.',
    amenities: [
      'All-marble master bathrooms with oversized Roman soaking tubs',
      'Strip and Fountains-facing private whirlpool suites',
      'Dual vanity stations and separate walk-in glass steam showers',
      'Direct access to world-class resort spas and poolside cabanas'
    ],
    whyChoose: [
      'Spacious multi-room luxury suites designed for entertaining and relaxation',
      'World-class entertainment, nightlife, and celebrity chef restaurants',
      'Exceptional value for ultra-luxury suite experiences',
      'Direct links to verified partner platforms with flexible booking'
    ]
  },

  // Indonesia - Bali
  'bali-indonesia': {
    intro: 'Bali is the world’s quintessential tropical romance paradise. Discover private pool villas featuring sunken outdoor stone bathtubs, jungle ravine views, and cliffside ocean jacuzzis.',
    amenities: [
      'Sunken outdoor terrazzo bathtubs in private jungle villas',
      'Cliffside oceanfront jacuzzi tubs overlooking crashing waves',
      'Flower bath preparations with exotic Balinese essential oils',
      'Private infinity plunge pools connected to open-air bathrooms'
    ],
    whyChoose: [
      'Voted the world’s top honeymoon island destination',
      'Secluded private villa sanctuaries in Ubud, Uluwatu, and Seminyak',
      'World-class Balinese spa treatments and holistic wellness',
      'Guaranteed private in-villa tubs verified across top OTAs'
    ]
  },

  // Thailand - Bangkok
  'bangkok-thailand': {
    intro: 'Bangkok offers vibrant city energy paired with world-class hospitality. Relax in sky-high suites with freestanding bathtubs overlooking the Chao Phraya River and glittering skyline.',
    amenities: [
      'Chao Phraya river-view freestanding bathtubs',
      'Private jacuzzi suites and Japanese onsen-style soaking baths',
      'Sky-high skyline-facing marble bathrooms',
      'Traditional Thai aromatherapy bath collections'
    ],
    whyChoose: [
      'Exceptional luxury value with 5-star service at affordable rates',
      'Iconic rooftop bars, street food, and luxury riverside dining',
      'Seamless transit via BTS Skytrain and river ferries',
      'Verified private in-room bathtub listings'
    ]
  },

  // Singapore - Singapore
  'singapore-singapore': {
    intro: 'Singapore blends futuristic skyline views with colonial luxury, featuring iconic octagonal bathtubs and Marina Bay skyline vistas.',
    amenities: [
      'Floor-to-ceiling window bathtubs with Marina Bay views',
      'Colonial freestanding tubs with butler service',
      'Hydro-jet jacuzzi suites in Sentosa island resorts',
      'Luxury organic wellness amenities and rainfall showers'
    ],
    whyChoose: [
      'World-class dining, botanical gardens, and luxury shopping',
      'Ultra-clean, safe, and romantic modern metropolis',
      'Iconic luxury stays like Marina Bay Sands and Raffles',
      'Every property verified across top booking channels'
    ]
  },

  // India - Coorg
  'coorg-india': {
    intro: 'Coorg (Kodagu), the Scotland of India, is famous for mist-shrouded coffee estates and lush Western Ghats. Unwind in private luxury plantation villas with outdoor heated jacuzzis and deep valley-view bathtubs.',
    amenities: [
      'Outdoor heated jacuzzis overlooking coffee plantations',
      'Rainforest-facing freestanding deep soaking bathtubs',
      'Ayurvedic herbal bath preparations with Kodava oils',
      'Private pool villas with connected open-air stone baths'
    ],
    whyChoose: [
      'Top honeymoon sanctuary in South India',
      'Cool mountain climate ideal for evening warm baths',
      'Secluded luxury eco-resorts with complete privacy',
      'Verified in-room tub and private jacuzzi amenities'
    ]
  },

  // India - Wayanad
  'wayanad-india': {
    intro: 'Wayanad offers untouched rainforests, cascading waterfalls, and spice-scented valleys. Discover serene mountain resorts and treehouse-inspired villas featuring private jacuzzis with reservoir and jungle views.',
    amenities: [
      'Lakefront private jacuzzi tubs in secluded villas',
      'Open-to-nature glass-walled soaking bathtubs',
      'Swiss-chalet style master suites with whirlpool baths',
      'Herbal steam and Ayurvedic bath therapies'
    ],
    whyChoose: [
      'Fabulous romantic mountain retreat in Northern Kerala',
      'Unobstructed views of the Western Ghats canopy',
      'Private pool and jacuzzi villas for couples',
      'Triple-verified across MakeMyTrip, Agoda, and Booking.com'
    ]
  },

  // India - Alleppey
  'alleppey-india': {
    intro: 'Alleppey (Alappuzha), the Venice of the East, is world-famous for its tranquil backwaters and palm-fringed lagoons. Relax in heritage lakefront villas featuring open-to-sky stone bathtubs and private whirlpool suites.',
    amenities: [
      'Sunken marble bathtubs overlooking Vembanad Lake',
      'Open-to-sky courtyard bathrooms with heritage tubs',
      'Floating cottage suites with private soaking baths',
      'Traditional Kerala Ayurvedic bath infusions'
    ],
    whyChoose: [
      'Ultimate backwater romance and houseboat landscapes',
      'Private island resorts with direct canal access',
      'Intimate couples retreats with sunset water views',
      'Guaranteed in-room tubs with zero shared spa pools'
    ]
  },

  // India - Mussoorie
  'mussoorie-india': {
    intro: 'Mussoorie, the Queen of the Hills, offers breathtaking vistas of the snow-capped Himalayas and the Doon Valley. Stay in historic gothic manors and modern luxury resorts with deep marble bathtubs and cedarwood jacuzzis.',
    amenities: [
      'Valley-facing marble soaking tubs with sunset vistas',
      'Outdoor heated cedarwood jacuzzis in pine forests',
      'Edwardian heritage clawfoot bathtubs with fireplaces',
      'Spa-grade bath salts and plush mountain bathrobes'
    ],
    whyChoose: [
      'Classic North Indian romantic hill station',
      'Panoramic 360-degree Himalayan snow peak views',
      'Cozy mountain fireplaces and luxury room service',
      'Verified room tier titles with guaranteed tubs'
    ]
  },

  // India - Pondicherry
  'pondicherry-india': {
    intro: 'Pondicherry (Puducherry) combines French colonial architecture with peaceful seaside charm. Discover boutique heritage havelis in White Town and beachfront villas with deep soaking tubs and open-air jacuzzis.',
    amenities: [
      'French colonial clawfoot and sunken stone bathtubs',
      'Bay of Bengal ocean-facing deep soaking tubs',
      'Open-air lagoon jacuzzis in luxury beach resorts',
      'Organic French aromatherapy bath amenities'
    ],
    whyChoose: [
      'Cobblestone streets, French cafes, and tranquil beaches',
      'Boutique heritage properties with intimate privacy',
      'Perfect coastal weekend escape from Chennai and Bangalore',
      'Triple-checked listings for couples'
    ]
  },

  // USA - Miami
  'miami-usa': {
    intro: 'Miami combines vibrant Art Deco coastal energy with world-class luxury hospitality. Discover glamorous oceanfront suites in South Beach and Surfside featuring black granite soaking tubs and Atlantic ocean panoramas.',
    amenities: [
      'Oceanfront black granite and travertine soaking bathtubs',
      'Japanese deep soaking tubs with ocean-view glass balconies',
      'Opulent red marble bathrooms with standalone tubs',
      'Custom spa bath amenities and 24/7 room service'
    ],
    whyChoose: [
      'Premier tropical beach vacation in the United States',
      'World-renowned nightlife, fine dining, and Art Deco culture',
      'Direct beach access and private rooftop pool clubs',
      'Verified in-room tubs across Booking.com and Agoda'
    ]
  },

  // USA - Los Angeles
  'los-angeles-usa': {
    intro: 'Los Angeles offers legendary Hollywood glamor and coastal tranquility. Relax in celebrity-favorite garden bungalows, cliffside Malibu retreats, and Beverly Hills high-rises with private jacuzzis and deep marble baths.',
    amenities: [
      'Private outdoor garden jacuzzis in historic bungalows',
      'Deep Italian marble soaking tubs with integrated TV',
      'Ocean-facing whirlpool tubs along Santa Monica beach',
      'In-tub fireplace and mood lighting setups'
    ],
    whyChoose: [
      'Iconic Hollywood history and luxury boutique properties',
      'Secluded canyon hideaways in Bel-Air and Beverly Hills',
      'Minutes from Rodeo Drive, Sunset Strip, and Pacific beaches',
      'Accurate room tier verification with zero shared tubs'
    ]
  },

  // USA - San Francisco
  'san-francisco-usa': {
    intro: 'San Francisco combines historic Nob Hill grandeur with modern bayfront luxury. Enjoy panoramic views of the Golden Gate and Bay Bridge while relaxing in deep travertine marble bathtubs.',
    amenities: [
      'Bay Bridge and skyline-facing deep freestanding tubs',
      'Italian marble bathrooms with oversized soaking baths',
      'High-ceiling neoclassical suites with luxury bath amenities',
      'In-mirror flat screen TVs and rainfall showers'
    ],
    whyChoose: [
      'Romantic city breaks with world-class culinary scene',
      'Iconic cable car access and historic landmark architecture',
      'Spectacular views over San Francisco Bay and Alcatraz',
      'Verified luxury stays with guaranteed bathtub access'
    ]
  },

  // USA - Chicago
  'chicago-usa': {
    intro: 'Chicago offers soaring architectural marvels and rich cultural energy. Relax in luxury skyscraper suites along the Chicago River featuring travertine marble soaking tubs with Lake Michigan vistas.',
    amenities: [
      'River and Lake Michigan-facing oversized soaking bathtubs',
      'Hydro-jet spa tubs with in-tub touch screen controls',
      'Freestanding clawfoot tubs with private fireplaces',
      'Chuan Spa and luxury designer bath amenities'
    ],
    whyChoose: [
      'Magnificent Mile shopping and world-renowned dining',
      'Iconic architectural skyline and riverwalk access',
      'Cozy luxury winter staycations for couples',
      'Triple-verified across top booking platforms'
    ]
  },

  // UK - Edinburgh
  'edinburgh-uk': {
    intro: 'Edinburgh blends gothic romance with historic castle grandeur. Stay in royal suites and historic Georgian townhouses featuring silver-gilt rolltop bathtubs and views of Edinburgh Castle.',
    amenities: [
      'Double silver-gilt and Victorian rolltop bathtubs for two',
      'Castle-view Italian marble master bathrooms',
      'Baroque country estate suites with freestanding tubs',
      'Guerlain spa toiletries and heated towel rails'
    ],
    whyChoose: [
      'One of Europe’s most romantic and historic capitals',
      'Atmospheric cobblestone Old Town and Royal Mile walks',
      'Cozy Scottish hospitality and Michelin-starred dining',
      'Guaranteed in-room tubs with zero shared facilities'
    ]
  },

  // France - Paris
  'paris-france': {
    intro: 'Paris, the City of Light and romance, offers timeless palace hotels and boutique Haussmannian suites. Indulge in Carrara marble soaking tubs overlooking the Eiffel Tower, Place Vendôme, and private courtyard gardens.',
    amenities: [
      'Eiffel Tower-facing freestanding marble soaking tubs',
      'Historic Place Vendôme palace suites with deep bathtubs',
      'Art Deco mosaic bathrooms with Diptyque and Guerlain bath rituals',
      'Private two-person whirlpool tubs in luxury Saint-Germain retreats'
    ],
    whyChoose: [
      'The world’s undisputed capital of romance and anniversary celebrations',
      'Michelin three-star dining, Seine river cruises, and Louvre access',
      'Storied historic palaces where legendary artists and icons stayed',
      'Triple-verified room tiers with guaranteed in-room bathtubs'
    ]
  },

  // Italy - Rome
  'rome-italy': {
    intro: 'Rome, the Eternal City, provides an unforgettable setting for romance. Stay in converted Renaissance palazzos and luxury retreats near the Spanish Steps featuring Carrara marble mosaic bathtubs and private whirlpools.',
    amenities: [
      'Carrara marble mosaic and circular Roman soaking bathtubs',
      'Private hydro whirlpool suites overlooking Piazza del Popolo',
      'Belle Époque palazzo bathrooms with travertine tubs',
      'Acqua di Parma toiletries and private bath butler service'
    ],
    whyChoose: [
      'Timeless history, art, and romantic cobblestone piazzas',
      'Rooftop dining overlooking the Vatican and ancient ruins',
      'World-class Italian hospitality and Ferragamo design suites',
      'Verified in-room tubs across Booking.com and Agoda'
    ]
  },

  // Netherlands - Amsterdam
  'amsterdam-netherlands': {
    intro: 'Amsterdam’s UNESCO canal ring and historic townhouses offer an intimate setting for couples. Relax in 17th-century canal palace suites with solid stone bathtubs and mood-lit hydro jacuzzis.',
    amenities: [
      'Herengracht canal-view freestanding soaking bathtubs',
      'Solid travertine stone bathtubs carved from single blocks',
      'Private two-person hydro jacuzzis with mood lighting',
      'Loft suites with exposed timber beams and freestanding baths'
    ],
    whyChoose: [
      'Picturesque canal cruises and world-famous museums',
      'Boutique Nine Streets shopping and candlelit dining',
      'Unique historic canal house architecture',
      'Accurate room tier verification on all stays'
    ]
  },

  // Greece - Santorini
  'santorini-greece': {
    intro: 'Santorini is the world’s crown jewel for honeymooners and romantic escapes. Experience cave suites carved into the volcanic cliffs of Oia and Imerovigli with private heated jacuzzi tubs overlooking the Aegean caldera.',
    amenities: [
      'Private heated cave jacuzzis facing the caldera',
      'Outdoor hydro hot tubs on private whitewashed verandas',
      'Monolithic stone soaking bathtubs with sunset views',
      'Infinity plunge pools connected to private bath terraces'
    ],
    whyChoose: [
      'World-famous caldera sunset views and Cycladic architecture',
      'Unsurpassed honeymoon and anniversary privacy',
      'Cliffside candlelit dining and volcanic wine tastings',
      'Triple-verified private tubs with zero shared pools'
    ]
  },

  // Thailand - Phuket
  'phuket-thailand': {
    intro: 'Phuket is Thailand’s premier tropical island paradise, offering lush rainforest sanctuaries and secluded private bay villas with outdoor sunken stone bathtubs and glass-wrapped jacuzzis.',
    amenities: [
      'Birds Nest villa stone soaking tubs in rainforest canopies',
      'Andaman Sea oceanfront pool villas with marble baths',
      'Open-air sunken bath pavilions next to private pools',
      'Glass-wrapped hydro jacuzzis with 300-degree coastal views'
    ],
    whyChoose: [
      'Adults-only private pool villas and world-class spa resorts',
      'Crystal-clear turquoise waters and white sand beaches',
      'Exceptional value for ultra-luxury honeymoon villas',
      'Verified in-villa private tubs and pools'
    ]
  },

  // Japan - Kyoto
  'kyoto-japan': {
    intro: 'Kyoto, the cultural heart of Japan, offers serene bamboo groves, historic temples, and traditional ryokan luxury. Relax in private suites featuring aromatic Japanese Hinoki cedarwood tubs and private open-air onsen hot springs.',
    amenities: [
      'Japanese Hinoki cedarwood deep soaking bathtubs',
      'Private outdoor natural hot-spring onsen tubs',
      'Kamogawa River and Yasaka Pagoda-view bathrooms',
      'Seasonal citrus-infused aromatic bath preparations'
    ],
    whyChoose: [
      'Unmatched peace, Japanese garden aesthetics, and temple walks',
      'Traditional Kaiseki multi-course fine dining',
      'Private natural thermal onsen waters inside your suite',
      'Verified accommodations across top booking channels'
    ]
  },

  // Japan - Tokyo
  'tokyo-japan': {
    intro: 'Tokyo combines futuristic neon-lit cityscapes with refined traditional Japanese bath culture (ofuro). Relax in high-rise skyscraper suites featuring panoramic skyline bathtubs with views of Mount Fuji and Tokyo Tower.',
    amenities: [
      'High-rise deep soaking bathtubs with Tokyo Tower and Mount Fuji views',
      'Aromatic traditional Hinoki cedarwood baths with seasonal yuzu citrus',
      'Granite-clad spa bathrooms with built-in mist saunas',
      'Japanese bath salts and luxurious silk robes'
    ],
    whyChoose: [
      'Mesmerizing glittering night panoramas from your private bath',
      'World-leading Michelin-starred culinary dining in Ginza and Roppongi',
      'Serene oasis of calm soaring high above the bustling metropolis',
      'Triple-verified room tiers with guaranteed private tubs'
    ]
  },

  // Malaysia - Kuala Lumpur
  'kuala-lumpur-malaysia': {
    intro: 'Kuala Lumpur offers dazzling modern skylines and tropical luxury. Discover premier suites with deep soaking bathtubs directly overlooking the illuminated Petronas Twin Towers and lush KLCC Park greenery.',
    amenities: [
      'Petronas Twin Towers-facing private soaking bathtubs',
      'Luxury marble bathrooms with separate rain showers and soaking tubs',
      'High-floor jetted jacuzzi suites with city skyline panoramas',
      'Spa-grade bath amenities and aromatherapy infusions'
    ],
    whyChoose: [
      'Unrivaled views of the world’s most iconic twin skyscrapers',
      'Exceptional luxury value for 5-star suites and rooftop infinity pools',
      'Vibrant shopping in Bukit Bintang and world-renowned street dining',
      'Guaranteed room tier verification across top booking platforms'
    ]
  },

  // UAE - Abu Dhabi
  'abu-dhabi-uae': {
    intro: 'Abu Dhabi offers Arabian palace grandeur and serene desert retreats. Experience pure gold-trimmed marble jacuzzis at Emirates Palace and desert fortress pool villas with circular bathtubs looking over red dunes.',
    amenities: [
      'Royal gold-trimmed marble jacuzzis with 24k bath rituals',
      'Circular terrazzo bathtubs facing panoramic desert dunes',
      'Freestanding sculpted soaking tubs with dolphin-bay views',
      'Floor-to-ceiling glass-walled bathtubs over private beaches'
    ],
    whyChoose: [
      'Palatial Arabian luxury and peaceful island beaches',
      'Iconic Louvre Abu Dhabi and Sheikh Zayed Grand Mosque',
      'Ultra-exclusive private butler and spa services',
      'Triple-checked room tiers with guaranteed tubs'
    ]
  },

  // USA - Austin
  'austin-usa': {
    intro: 'Austin, the Live Music Capital of the World, pairs vibrant Hill Country energy with bespoke luxury boutique hotels. Discover romantic suites with vintage clawfoot soaking tubs, Italian marble baths, and Lady Bird Lake views.',
    amenities: [
      'Vintage handcrafted clawfoot and travertine soaking tubs',
      'Lady Bird Lake-facing private marble bathtubs',
      'Bohemian estate suites with indoor-outdoor bathtubs',
      'Aesop luxury bath essentials and rainfall showers'
    ],
    whyChoose: [
      'Top Texas weekend getaway and anniversary destination',
      'South Congress and 2nd Street dining right at your doorstep',
      'Secluded urban estates and modern design hotels',
      'Triple-verified in-room bathtubs guaranteed on booking'
    ]
  },

  // USA - Seattle
  'seattle-usa': {
    intro: 'Seattle offers majestic Pacific Northwest mountain vistas and Elliott Bay waterfront romance. Relax in luxury rooms with deep jetted whirlpool tubs and fireplaces overlooking Puget Sound and the Olympic Mountains.',
    amenities: [
      'Puget Sound ocean-view deep soaking marble bathtubs',
      'Hydro-jet whirlpool tubs with cozy gas fireplaces',
      'Freestanding sculptural bathtubs with skyline vistas',
      'DS & Durga luxury bath products and plush robes'
    ],
    whyChoose: [
      'Steps from iconic Pike Place Market and Seattle waterfront',
      'Romantic moody Pacific Northwest coastal ambiance',
      'Floor-to-ceiling glass views over Elliott Bay ferries',
      'Accurate room tier verification with zero shared tubs'
    ]
  },

  // USA - Nashville
  'nashville-usa': {
    intro: 'Nashville (Music City) combines Southern hospitality with historic elegance and sleek modern high-rises. Experience opulent Beaux-Arts suites and glass towers with freestanding oval tubs and Cumberland River views.',
    amenities: [
      'Italian marble bathrooms with deep soaking bathtubs',
      'Freestanding oval tubs overlooking the Cumberland River',
      'Sustainable stone soaking bathtubs with organic spa salts',
      'High-altitude skyline views from corner suite tubs'
    ],
    whyChoose: [
      'Vibrant live music, Honky Tonk Highway, and gourmet dining',
      'Iconic historic landmark hotels and sustainable luxury stays',
      'Ideal romantic couples getaway in the American South',
      'Guaranteed private in-room tubs verified on all platforms'
    ]
  },

  // Maldives - Maldives
  'maldives-maldives': {
    intro: 'The Maldives is the world’s ultimate luxury honeymoon paradise. Experience private overwater water retreat villas featuring lagoon-suspended glass-bottom bathtubs, private waterslides, and starlight ocean whirlpools.',
    amenities: [
      'Lagoon-suspended glass-bottom and ocean-view bathtubs',
      'Private overwater infinity plunge pools and jacuzzis',
      'Open-air tropical stone bathrooms with direct lagoon ladders',
      'Personalized floral aromatherapy bath butler service'
    ],
    whyChoose: [
      'The #1 dream romantic honeymoon destination on Earth',
      'Complete private island seclusion with personal butler service',
      'Crystal-clear turquoise waters teeming with marine life',
      'Guaranteed private overwater villa bathtubs verified on all channels'
    ]
  },

  // Switzerland - Zurich
  'zurich-switzerland': {
    intro: 'Zurich combines Swiss precision luxury with lakeside Alpine beauty. Stay in historic fairytale castles and medieval townhouses with marble whirlpool suites looking out over Lake Zurich and the snow-capped Alps.',
    amenities: [
      'Lake Zurich and Alps-facing private hydro whirlpool tubs',
      'Deep Carrara marble bathtubs with luxury Swiss toiletries',
      'Medieval frescoed suites with modern freestanding soaking tubs',
      'Exclusive private rooftop terraces with outdoor tubs'
    ],
    whyChoose: [
      'Charming historic Old Town and luxury Bahnhofstrasse shopping',
      'Breathtaking Lake Zurich promenades and mountain excursions',
      'World-class Michelin-starred dining and private spa retreats',
      'Triple-verified in-room bathtubs guaranteed on booking'
    ]
  },

  // Switzerland - Zermatt
  'zermatt-switzerland': {
    intro: 'Zermatt, at the foot of the iconic Matterhorn, offers the world’s most romantic alpine chalets. Soak in private cedarwood whirlpools and heated outdoor tubs with uninterrupted views of the Matterhorn peak.',
    amenities: [
      'Matterhorn-facing private hydro jacuzzis and fireplaces',
      'Alpine stone soaking bathtubs with mountain spring water',
      'Private chalet suites with in-room saunas and whirlpools',
      'Floor-to-ceiling glass windows framing the Matterhorn'
    ],
    whyChoose: [
      'Car-free alpine village with horse-drawn carriage charm',
      'World-class glacier skiing and scenic mountain railways',
      'Cozy wood-burning fireplaces and warm hydrotherapy baths',
      'Accurate room tier verification with zero shared tubs'
    ]
  },

  // Spain - Barcelona
  'barcelona-spain': {
    intro: 'Barcelona blends Gaudí’s modernist architecture with Mediterranean seaside glamor. Relax in luxury beachfront towers and Passeig de Gràcia palazzos featuring hydrotherapy bathtubs and private rooftop suites.',
    amenities: [
      'Panoramic Mediterranean oceanfront soaking bathtubs',
      'Patricia Urquiola-designed circular standalone tubs',
      'Passeig de Gràcia balcony suites with private tubs',
      'Luxury Natura Bissé organic bath amenities'
    ],
    whyChoose: [
      'Vibrant Catalan tapas, culture, and beachside promenades',
      'Architectural masterpieces by Antoni Gaudí nearby',
      'Iconic rooftop bars with panoramic Mediterranean vistas',
      'Guaranteed private in-room bathtubs verified on all platforms'
    ]
  },

  // Turkey - Cappadocia
  'cappadocia-turkey': {
    intro: 'Cappadocia offers a surreal fairytale landscape of fairy chimneys and morning hot air balloons. Stay in restored ancient cave suites featuring heated hydro jacuzzis, indoor cave pools, and private wine taps.',
    amenities: [
      'Private heated cave jacuzzis facing hot air balloon sunrises',
      'Hand-carved ancient stone bathtubs with heated travertine floors',
      'Private indoor heated cave swimming pools and hydro spas',
      'Antique Anatolian tapestries and private fireplace retreats'
    ],
    whyChoose: [
      'World-famous sunrise hot air balloon flight views',
      'Unsurpassed cave architecture romance and privacy',
      'Relais & Châteaux luxury dining and Anatolian wines',
      'Triple-checked cave suite room tiers guaranteed on booking'
    ]
  },

  // Canada - Banff
  'banff-canada': {
    intro: 'Banff, in the heart of the Canadian Rocky Mountains, is a pristine alpine sanctuary. Stay in historic Scottish baronial castle resorts and Lake Louise riverside log cabins with deep clawfoot bathtubs and stone fireplaces.',
    amenities: [
      'Canadian Rockies mountain-view clawfoot soaking bathtubs',
      'Private riverside log cabin whirlpool tubs and fireplaces',
      'Mineral-rich thermal spa bath amenities and fluffy robes',
      'Bow Valley canyon vistas directly from your bathroom'
    ],
    whyChoose: [
      'Majestic snow-capped Rocky Mountain peaks and turquoise lakes',
      'Romantic winter sleigh rides and summer canoe excursions',
      'Cozy wood-burning fireplaces and warm mineral baths',
      'Verified in-cabin tubs with zero shared facilities'
    ]
  },

  // Australia - Sydney
  'sydney-australia': {
    intro: 'Sydney offers an iconic harbor setting paired with world-class cosmopolitan luxury. Soak in designer sculptural bathtubs with direct, uninterrupted views of the Sydney Opera House and Sydney Harbour Bridge.',
    amenities: [
      'Sydney Opera House and Harbour Bridge-view oval soaking tubs',
      'Floor-to-ceiling glass curved bathroom windows over Barangaroo',
      'Freestanding Parisian bathtubs in historic The Rocks suites',
      'Appelles and Byredo luxury bath amenities'
    ],
    whyChoose: [
      'World-famous Sydney Harbour panoramic vistas from your bath',
      'Steps from Circular Quay, historic The Rocks, and ferry piers',
      'World-class waterfront dining and coastal walks',
      'Triple-verified private in-room tubs across top booking channels'
    ]
  },

  // India - Jaisalmer
  'jaisalmer-india': {
    intro: 'Jaisalmer (The Golden City) offers enchanting Thar Desert romance with magnificent yellow sandstone fortresses. Stay in royal havelis and tented desert oases featuring sunken sandstone bathtubs and private open-air whirlpools.',
    amenities: [
      'Hand-carved yellow sandstone sunken soaking bathtubs',
      'Private desert tented plunge pools and hydro jacuzzis',
      'Illuminated Jaisalmer Fort views from private bath courtyards',
      'Ayurvedic rosewater and saffron bath infusions'
    ],
    whyChoose: [
      'Unforgettable desert romance, dune dining, and starlit nights',
      'Royal Rajasthani haveli architecture and opulent suites',
      'Intimate private courtyard stays with heated soaking tubs',
      'Verified room tier titles with guaranteed bathtubs'
    ]
  },

  // India - Jodhpur
  'jodhpur-india': {
    intro: 'Jodhpur (The Blue City) is dominated by the majestic Mehrangarh Fort. Indulge in authentic royal luxury at Umaid Bhawan Palace and boutique havelis featuring solid pink marble carved bathtubs and fort-facing rolltop baths.',
    amenities: [
      'Norblin-designed solid pink Italian marble royal bathtubs',
      'Mehrangarh Fort-facing freestanding cast-iron rolltop tubs',
      'Art Deco palace bathrooms with custom bath rituals',
      'Private garden terraces with sunken outdoor soaking baths'
    ],
    whyChoose: [
      'World-famous royal palace heritage and living Maharaja history',
      'Dramatic illuminated views of Mehrangarh Fort from your bath',
      'Exclusive bespoke royal hospitality and spa wellness',
      'Triple-verified in-room tubs guaranteed on booking'
    ]
  },

  // India - Chikmagalur
  'chikmagalur-india': {
    intro: 'Chikmagalur, nestled in Karnataka’s Western Ghats coffee country, offers tranquil mist-covered hills and lush plantations. Stay in private coffee estate villas with open-to-sky stone bathtubs and mountain-view jacuzzis.',
    amenities: [
      'Open-air coffee plantation stone soaking bathtubs',
      'Mullayanagiri mountain-facing private heated jacuzzis',
      'Private estate pool villas with sunken whirlpool tubs',
      'Organic coffee bean scrubs and Ayurvedic spa bath salts'
    ],
    whyChoose: [
      'Serene hill station getaway surrounded by aromatic coffee estates',
      'Breathtaking sunrise views from private mountain balconies',
      'Private plunge pools and intimate couple retreat villas',
      'Guaranteed private tubs with zero shared pool confusion'
    ]
  },

  // India - Mahabaleshwar
  'mahabaleshwar-india': {
    intro: 'Mahabaleshwar is the premier hill retreat of Maharashtra’s Western Ghats, famed for strawberry valleys and misty evergreen forests. Relax in luxury forest sanctuary suites with freestanding oval bathtubs and valley plunge pools.',
    amenities: [
      'Evergreen forest canopy-facing freestanding oval bathtubs',
      'Valley-view balcony plunge pools and deep soaking baths',
      'Private strawberry valley courtyards with heated jacuzzis',
      'Spa-grade forest bath salts and rainfall showers'
    ],
    whyChoose: [
      'Top romantic weekend getaway from Mumbai and Pune',
      'Cool mountain climate, scenic viewpoints, and strawberry farms',
      'Secluded 5-star forest resorts and private infinity pools',
      'Triple-checked room categories guaranteed on check-in'
    ]
  },

  // India - Alibaug
  'alibaug-india': {
    intro: 'Alibaug is the glamorous coastal escape just a speedboat ride away from Mumbai. Discover luxury private lake villas and boutique spa retreats featuring deep soaking bathtubs, private lawns, and tropical open-air bathrooms.',
    amenities: [
      'Lakefront private villa suites with deep soaking bathtubs',
      'Tropical open-air courtyard bathrooms with stone tubs',
      'Private lawn cabana suites with outdoor jacuzzis',
      'Mandara Spa aromatherapy bath rituals and steam showers'
    ],
    whyChoose: [
      'Effortless 20-minute speedboat access from Gateway of India',
      'Exclusive coastal celebrity retreat and weekend getaway',
      'Sprawling tropical pool resorts and intimate private villas',
      'Accurate room tier verification with zero shared tubs'
    ]
  },

  // India - Ooty
  'ooty-india': {
    intro: 'Ooty (Udhagamandalam), the Queen of Hill Stations in the Nilgiris, is India’s premier romantic mountain escape. Experience British colonial heritage suites with working wood fireplaces, clawfoot soaking bathtubs, and mist-wrapped tea garden vistas.',
    amenities: [
      'Authentic cast-iron clawfoot bathtubs and working fireplaces',
      'Tea estate-facing deep soaking tubs with panoramic valley views',
      'Heated whirlpool jacuzzi baths for chilly Nilgiri evenings',
      'Aromatic Nilgiri eucalyptus and lavender bath preparations'
    ],
    whyChoose: [
      'South India’s most celebrated honeymoon and couple sanctuary',
      'Crisp mountain air, botanical gardens, and Nilgiri Mountain Railway',
      'Historic 19th-century colonial luxury heritage estates',
      'Triple-verified room tiers with guaranteed private in-room bathtubs'
    ]
  },

  // India - Matheran
  'matheran-india': {
    intro: 'Matheran, Asia’s only automobile-free hill station, offers peaceful seclusion surrounded by dense Sahyadri forests. Relax in historic heritage bungalows and boutique retreats featuring private soaking tubs and jacuzzi suites.',
    amenities: [
      'Dense forest-view private soaking bathtubs',
      'Jetted whirlpool jacuzzis for relaxing couple getaways',
      'Colonial heritage veranda suites with classic rolltop tubs',
      'Aromatherapy bath salts and tranquil nature sounds'
    ],
    whyChoose: [
      '100% pollution-free, vehicle-free peace just 2 hours from Mumbai and Pune',
      'Scenic red-soil trails, Charlotte Lake, and breathtaking cliffside lookouts',
      'Charming heritage bungalows dating back to 1854',
      'Verified in-room tub amenities guaranteed upon booking'
    ]
  },

  // India - Saputara
  'saputara-india': {
    intro: 'Saputara, Gujarat’s picturesque hill station tucked in the Sahyadri ranges, provides a refreshing romantic retreat. Unwind in lakeview suites and scenic mountain resorts featuring private deep soaking bathtubs and hydrotherapy baths.',
    amenities: [
      'Saputara Lake-facing deep soaking bathtubs',
      'Mountain ridge-view suites with private whirlpool baths',
      'Spacious modern marble bathrooms with rainfall showers',
      'Herbal bath amenities and scenic balcony seating'
    ],
    whyChoose: [
      'Gujarat’s sole hill station with pleasant year-round mountain climate',
      'Saputara Lake boating, ropeway rides, and sunset viewpoints',
      'Peaceful weekend respite for couples from Surat, Ahmedabad, and Mumbai',
      'Accurate room tier verification with guaranteed private bathtubs'
    ]
  },

  // USA - Aspen
  'aspen-usa': {
    intro: 'Aspen combines world-class Canadian Rockies skiing with bespoke alpine glamor. Unwind in ski-in/ski-out five-star chalets featuring Holly Hunt design, deep soaking bathtubs, heated marble floors, and roaring gas fireplaces.',
    amenities: [
      'Aspen Mountain-facing deep soaking tubs and steam showers',
      'Vintage cast-iron clawfoot bathtubs with Colorado stone fireplaces',
      'Heated Italian marble bathroom floors and plush fur robes',
      'Alpine herbal bath salts and après-ski aromatherapy'
    ],
    whyChoose: [
      'The #1 luxury ski and mountain resort in North America',
      'Ski-in/ski-out direct mountain access and five-star dining',
      'Cozy fireplace warmth paired with hydrotherapy baths',
      'Guaranteed private in-room bathtubs verified on all channels'
    ]
  },

  // USA - San Diego
  'san-diego-usa': {
    intro: 'San Diego offers perpetual sunshine, Pacific Ocean breezes, and vibrant coastal culture. Stay in legendary Victorian beach resorts and sleek Gaslamp Quarter boutique hotels with deep soaking tubs and private oceanfront fire pits.',
    amenities: [
      'Coronado Beach oceanfront soaking tubs with sunset vistas',
      'Freestanding modern soaking tubs with Gaslamp Quarter views',
      'Private beachfront cabanas with outdoor hot tub decks',
      'Custom ocean-inspired bath salts and rainfall shower suites'
    ],
    whyChoose: [
      'Miles of pristine Pacific beaches and historic Coronado Island',
      'Vibrant Gaslamp nightlife, dining, and rooftop lounges',
      'Year-round perfect romantic getaway weather',
      'Triple-verified private in-room tubs on all booking platforms'
    ]
  },

  // USA - New Orleans
  'new-orleans-usa': {
    intro: 'New Orleans blends historic French Quarter elegance with world-class jazz and Creole gastronomy. Stay in 19th-century Beaux-Arts mansions and literary suites featuring private hydro jacuzzi tubs and Canal Street balcony views.',
    amenities: [
      'French Quarter historic suites with hydro whirlpool jacuzzi tubs',
      'Canal Street Beaux-Arts Italian marble soaking bathtubs',
      'Asprey and Le Labo luxury bath amenities and plush robes',
      'Private iron-lace balcony suites overlooking historic streets'
    ],
    whyChoose: [
      'Unrivaled live jazz, French Quarter romance, and Creole cuisine',
      'Historic 1800s landmark hotels and famous literary suites',
      'Intimate courtyard pools and private whirlpool suites',
      'Accurate room tier verification with zero false positives'
    ]
  },

  // USA - Boston
  'boston-usa': {
    intro: 'Boston offers historic New England romance paired with world-class luxury. Discover Beacon Hill boutique stays, Back Bay five-star hotels, and Seaport waterfront towers featuring deep marble soaking bathtubs and private jacuzzi suites for romantic couple staycations.',
    amenities: [
      'Deep marble soaking tubs with Boston Harbor and Charles River skyline views',
      'In-room jetted whirlpool tubs in Back Bay luxury towers',
      'Diptyque and Guerlain designer bath amenities with heated bathroom floors',
      'Victorian-inspired deep soaking tubs in historic brownstone suites'
    ],
    whyChoose: [
      'Strolling distance to historic Beacon Hill, Boston Common, and Newbury Street',
      'Celebrated seafood dining in the Seaport District and Italian North End',
      'Top choice for romantic anniversaries and autumn weekend escapes',
      'Verified in-room bathtub amenities confirmed across Booking.com and Agoda'
    ]
  },

  // USA - Baltimore
  'baltimore-usa': {
    intro: 'Baltimore combines historic waterfront charm with intimate romantic escapes. Experience Inner Harbor luxury hotels and historic boutique inns featuring private double jacuzzi tubs, fireside baths, and sweeping harbor views.',
    amenities: [
      'Double jacuzzi whirlpool tubs for couples with harbor and city skyline views',
      'Historic boutique suites with fireside clawfoot soaking tubs',
      'Opulent marble spa bathrooms with oversized walk-in rain showers',
      'Luxury bath salts and plush robes for weekend relaxation'
    ],
    whyChoose: [
      'Steps from the National Aquarium, Fells Point cobblestones, and Inner Harbor',
      'Romantic waterfront promenade dining and historic charm',
      'Exceptional value for private jacuzzi suites within easy reach of Washington D.C.',
      'Triple-verified room specifications with guaranteed private tubs'
    ]
  },

  // USA - Kansas City
  'kansas-city-usa': {
    intro: 'Kansas City, famed for its jazz heritage and Country Club Plaza architecture, offers romantic boutique stays featuring private in-room whirlpool jacuzzi suites and deep soaking tubs ideal for weekend couple getaways.',
    amenities: [
      'In-room whirlpool jacuzzi tubs with soothing massage jets',
      'Spanish-revival inspired deep soaking baths in Plaza luxury suites',
      'Fireplace suites with adjacent freestanding soaking bathtubs',
      'Designer bath botanicals and oversized plush bath sheets'
    ],
    whyChoose: [
      'Minutes from Country Club Plaza shopping, historic fountains, and dining',
      'World-class 18th & Vine jazz clubs and celebrated culinary scene',
      'Spacious romantic suites with exceptional Midwestern hospitality',
      'Verified partner booking links with guaranteed in-room tubs'
    ]
  },

  // USA - Orlando
  'orlando-usa': {
    intro: 'Orlando is renowned for world-class theme parks, but its luxury resort enclaves offer some of Florida’s most romantic couple retreats. Unwind in five-star suites featuring freestanding marble bathtubs, private lakefront balconies, and fireworks views.',
    amenities: [
      'Freestanding Italian marble soaking tubs with Disney fireworks views',
      'Private jetted whirlpool jacuzzi suites in luxury Bonnet Creek resorts',
      'Adult-only oasis pool sanctuaries with private cabanas',
      'Designer bathroom amenities by Salvatore Ferragamo and Le Labo'
    ],
    whyChoose: [
      'World-class AAA Five Diamond lakeside luxury resorts and spas',
      'Michelin-starred dining and championship golf at your doorstep',
      'Quiet luxury retreats secluded from theme park bustle',
      'Triple-verified in-room tubs guaranteed across booking partners'
    ]
  },

  // USA - Scottsdale
  'scottsdale-usa': {
    intro: 'Scottsdale blends dramatic Sonoran Desert landscapes with premier spa wellness and luxury living. Relax in private casitas and suites featuring deep soaking bathtubs, outdoor shower courtyards, and Camelback Mountain panoramas.',
    amenities: [
      'Camelback Mountain-facing deep soaking tubs and private patios',
      'Sonoran Desert adobe casitas with kiva fireplaces and spa baths',
      'Outdoor stone soaking bathtubs under starry Arizona skies',
      'Botanical desert bath salts and soothing agave spa rituals'
    ],
    whyChoose: [
      'America’s premier desert resort and wellness spa destination',
      'Dramatic terracotta sunrises and Old Town Scottsdale dining',
      'World-famous golf and luxury poolside cabanas',
      'Guaranteed in-room tubs with confirmed room tiers'
    ]
  },

  // USA - Lake Tahoe
  'lake-tahoe-usa': {
    intro: 'Lake Tahoe offers pristine alpine waters and dramatic Sierra Nevada mountain peaks. Discover romantic lakefront lodges and mountain chalets featuring deep jetted whirlpool tubs, stone fireplaces, and heated bathroom floors.',
    amenities: [
      'Deep jetted whirlpool bathtubs overlooking sapphire Lake Tahoe',
      'Outdoor private balcony soaking tubs nestled among towering Sierra pines',
      'Cozy stone gas fireplaces adjacent to oversized soaking tubs',
      'Heated bathroom floors and plush alpine down robes'
    ],
    whyChoose: [
      'Crystal-clear alpine lake shores and world-renowned ski slopes',
      'Cozy fireside romance for winter getaways and summer beach retreats',
      'Slope-side ski-in/ski-out five-star lodges and private cottages',
      'Accurate room tier verification with guaranteed private bathtubs'
    ]
  },

  // India - Gwalior
  'gwalior-india': {
    intro: 'Gwalior, rich in Scindia royal heritage and towering over the plains with its ancient hilltop fort, offers magnificent palace stays. Experience regal suites with vintage clawfoot tubs, Italian marble baths, and private courtyard gardens.',
    amenities: [
      'Royal Scindia heritage suites with vintage soaking bathtubs',
      'Italian marble bathrooms with luxury Ayurvedic toiletries',
      '9-acre landscaped royal estate courtyards and private pools',
      'Panoramic Gwalior Fort and Jai Vilas Palace proximity'
    ],
    whyChoose: [
      'Opulent 120-year-old royal palace architecture and live classical music',
      'Historic hill fort known as the "Gibraltar of India"',
      'Intimate private royal suites with luxury deep soaking baths',
      'Triple-verified room tiers guaranteed across all travel platforms'
    ]
  },

  // India - Rishikesh
  'rishikesh-india': {
    intro: 'Rishikesh, the world capital of yoga set along the emerald holy Ganges in the Himalayan foothills, offers serene luxury wellness sanctuaries. Unwind in private riverside soaking tubs and forest-view jacuzzi suites after exploring sacred ghats, suspension bridges, or white-water rapids.',
    amenities: [
      'Ganges river-facing deep soaking tubs with Himalayan valley views',
      'Ayurvedic herbal bath infusions and therapeutic mineral salt soaks',
      'Private balcony jacuzzi suites surrounded by Sal forests',
      'Open-air stone plunge tubs with tranquil river murmur'
    ],
    whyChoose: [
      'Minutes from iconic suspension bridges, Triveni Ghat evening aarti, and yoga ashrams',
      'Peaceful riverside wellness sanctuaries tailored for romantic retreats and rejuvenation',
      'Seamless access to river rafting, Rajaji National Park safaris, and organic cafes',
      'Triple-verified across leading travel platforms'
    ]
  },

  // India - Rajkot
  'rajkot-india': {
    intro: 'Rajkot, the cultural and commercial heart of Gujarat\'s Saurashtra region, blends rich Gandhian heritage with contemporary hospitality. Experience upscale business and leisure hotels featuring spacious marble bathtubs and rejuvenating whirlpool suites after touring historic museums and bustling bazaars.',
    amenities: [
      'Deep soaking bathtubs with premium Ayurvedic bath essentials',
      'Spacious Italian marble en-suite bathrooms with rainfall showers',
      'Executive whirlpool jacuzzi suites in central commercial districts',
      'Plush terry-cloth bathrobes and designer bathroom fixtures'
    ],
    whyChoose: [
      'Close proximity to Kaba Gandhi No Delo, Watson Museum, and vibrant handicraft markets',
      'Refined and serene suites perfect for couples seeking peaceful Saurashtra getaways',
      'Generous suite layouts with dedicated workspaces and authentic Kathiyawadi dining',
      'Triple-verified across leading travel platforms'
    ]
  },

  // India - Agra
  'agra-india': {
    intro: 'Agra, the legendary seat of Mughal emperors and home to the immortal Taj Mahal, is one of the world\'s most romantic destinations. Indulge in opulent heritage and five-star hotels offering marble soaking tubs and private jacuzzi suites with panoramic vistas of the ivory mausoleum.',
    amenities: [
      'Private Taj Mahal-facing deep soaking tubs and jacuzzi suites',
      'Mughal-inspired hand-carved marble bathrooms with rose-water bath rituals',
      'Freestanding clawfoot tubs overlooking landscaped Mughal gardens',
      'Luxury brass fittings and bespoke Ayurvedic bath products'
    ],
    whyChoose: [
      'Unrivaled views and sunrise access to the Taj Mahal and historic Agra Fort',
      'World-class romantic heritage hospitality celebrating timeless Mughal romance',
      'Fine-dining Mughlai restaurants and luxury spa pavilions on-site',
      'Triple-verified across leading travel platforms'
    ]
  },

  // India - Amritsar
  'amritsar-india': {
    intro: 'Amritsar, Punjab\'s spiritual and culinary capital, captivates travelers with the radiant Golden Temple and storied heritage streets. Retreat to premium hotels offering tranquil in-room soaking tubs and jacuzzi suites after visiting the sacred Harmandir Sahib and vibrant street-food bazaars.',
    amenities: [
      'Deep soaking tubs paired with plush bath linens and calming essential oils',
      'Spacious marble bathrooms featuring multi-jet hydrotherapy showers',
      'Boutique jacuzzi suites overlooking vibrant heritage streetscapes',
      'Handcrafted herbal bath salts and traditional wellness toiletries'
    ],
    whyChoose: [
      'Steps from the Golden Temple, Jallianwala Bagh, and iconic culinary hubs',
      'Intimate, peaceful sanctuaries for couples after experiencing evening temple ceremonies',
      'Convenient shuttles to the Wagah Border retreat ceremony and airport',
      'Triple-verified across leading travel platforms'
    ]
  },

  // India - Nashik
  'nashik-india': {
    intro: 'Nashik, India\'s premier wine capital nestled along the sacred Godavari River and Sahyadri foothills, offers an exquisite blend of viticulture and spirituality. Unwind in vineyard-facing soaking tubs and private jacuzzi villas after cellar tours and temple visits.',
    amenities: [
      'Vineyard-view deep soaking tubs overlooking rolling grape arbors',
      'Private open-air patio jacuzzis under starlit Sahyadri skies',
      'Wine-infused bath salts and grape-seed extract body treatments',
      'Spacious sunlit bathrooms with freestanding tubs and vineyard breezes'
    ],
    whyChoose: [
      'Front-row access to Sula Vineyards, boutique winery tasting rooms, and Godavari ghats',
      'Idyllic weekend wine country escape designed for romantic anniversaries and couples',
      'Boutique vineyard resort villas pairing private plunge baths with farm-to-fork dining',
      'Triple-verified across leading travel platforms'
    ]
  },

  // India - Mandarmani
  'mandarmani-india': {
    intro: 'Mandarmani, a tranquil coastal haven along the Bay of Bengal, is famous for its expansive drivable beach and peaceful seaside ambiance. Discover coastal resorts offering private ocean-facing bathtubs and balcony jacuzzis perfect for a soothing weekend getaway from Kolkata.',
    amenities: [
      'Ocean-facing freestanding tubs with panoramic Bay of Bengal views',
      'Private balcony jacuzzis catching gentle sea breezes and coastal sunrises',
      'Spacious beach-villa bathrooms with open-air rain showers',
      'Marine mineral bath salts and organic coastal wellness products'
    ],
    whyChoose: [
      'Serene beachfront access away from crowded shores with red crab-dotted sands',
      'Intimate coastal retreat for couples craving quiet seaside sunrises and candlelight dinners',
      'Short, scenic driving distance from Kolkata for spontaneous romantic weekend escapes',
      'Triple-verified across leading travel platforms'
    ]
  },

  // India - Chandigarh
  'chandigarh-india': {
    intro: 'Chandigarh, Le Corbusier\'s iconic modernist masterpiece and the joint capital of Punjab and Haryana, is celebrated for its lush gardens and orderly elegance. Stay in sophisticated five-star and boutique hotels featuring sleek freestanding soaking tubs and hydrotherapy suites near Sukhna Lake.',
    amenities: [
      'Contemporary freestanding soaking tubs with floor-to-ceiling city views',
      'Sleek Italian marble bathrooms with ambient lighting and rain showers',
      'Private jacuzzi suites overlooking Shivalik foothill horizons',
      'Designer bath amenities, botanical soaking salts, and plush robes'
    ],
    whyChoose: [
      'Minutes from Nek Chand\'s Rock Garden, Sukhna Lake promenades, and Sector 17 shopping',
      'Refined urban oasis for couples seeking a stylish, contemporary weekend staycation',
      'Spacious modernist suites with five-star dining and tranquil garden landscapes',
      'Triple-verified across leading travel platforms'
    ]
  },

  // India - Panchgani
  'panchgani-india': {
    intro: 'Panchgani, perched amidst Maharashtra\'s Sahyadri range, charms travelers with its cool mountain breezes, strawberry orchards, and the dramatic Table Land plateau. Relax in cliffside suites featuring deep soaking bathtubs and outdoor jacuzzis framing sweeping vistas of the Krishna River valley.',
    amenities: [
      'Cliff-edge deep soaking tubs overlooking the Krishna River valley',
      'Private open-air balcony jacuzzis with panoramic Sahyadri mountain vistas',
      'Colonial-style clawfoot tubs in heritage hill-station cottages',
      'Aromatherapy bath blends infused with local strawberry and herbal essences'
    ],
    whyChoose: [
      'Spectacular proximity to Table Land, Sydney Point, and fresh strawberry farm trails',
      'Crisp highland air and mist-shrouded valleys ideal for cozy romantic retreats',
      'Private mountain-view chalets offering secluded luxury and artisanal Maharashtrian dining',
      'Triple-verified across leading travel platforms'
    ]
  },

  // India - Faridabad
  'faridabad-india': {
    intro: 'Faridabad, set against the ancient Aravalli hills and the historic Surajkund reservoir, provides a tranquil, green NCR getaway just moments from Delhi. Experience premier resort and business hotels featuring deep marble bathtubs and serene jacuzzi suites surrounded by lush forested landscapes.',
    amenities: [
      'Deep marble soaking tubs overlooking forested Aravalli hills',
      'Multi-jet jacuzzi suites designed for executive relaxation and couples retreats',
      'Spacious designer bathrooms with walk-in rainfall showers and luxury fixtures',
      'Aromatherapy essential oils, custom bath crystals, and plush bathrobes'
    ],
    whyChoose: [
      'Convenient access to historic Surajkund, the annual Crafts Mela, and Aravalli nature trails',
      'Peaceful green retreat for Delhi NCR couples seeking quiet weekend staycations',
      'Expansive resort grounds featuring golf courses, fine dining, and wellness spas',
      'Triple-verified across leading travel platforms'
    ]
  },

  // India - Bhopal
  'bhopal-india': {
    intro: 'Bhopal, the enchanting City of Lakes and capital of Madhya Pradesh, merges royal Begum-era heritage with scenic lakeside beauty. Stay in regal heritage palaces and upscale hotels boasting deep marble soaking tubs and private jacuzzi suites overlooking Upper Lake (Bhojtal).',
    amenities: [
      'Upper Lake-facing private soaking bathtubs with tranquil water views',
      'Royal Begum-inspired palace suites with antique brass and marble tubs',
      'Private whirlpool jacuzzi suites set within heritage courtyards',
      'Ayurvedic bath oils, herbal soaking sachets, and luxury plush robes'
    ],
    whyChoose: [
      'Surrounded by historic landmarks including Taj-ul-Masajid, Bhojtal, and Jehan Numa heritage estates',
      'Royal Nawabi charm and serene lakefront sunsets perfect for romantic escapes',
      'Gateway to UNESCO World Heritage treasures at Sanchi and Bhimbetka',
      'Triple-verified across leading travel platforms'
    ]
  },

  // Default fallback for other destinations
  'default': {
    intro: 'Discover handpicked hotels with private in-room bathtubs and jacuzzi suites curated for couples seeking romantic getaways. Every property is triple-verified across MakeMyTrip, Agoda, and Booking.com.',
    amenities: [
      'Private in-room deep soaking bathtubs',
      'Jacuzzi suites with multi-jet hydrotherapy',
      'Luxury rainfall showerheads and marble finishes',
      'Spa-grade bath amenities and plush bathrobes',
      'Secluded, intimate bathroom layouts for couples'
    ],
    whyChoose: [
      'Guaranteed in-room tubs — no shared public spa pools',
      'Ideal for honeymoons, anniversaries, and romantic weekends',
      'Triple-verified across leading travel platforms',
      'Direct links with transparent pricing and flexible cancellation'
    ]
  }
};

export function getCityContent(city: string, country: string): typeof cityIntroContent['default'] {
  const cSlug = city.toLowerCase().trim().replace(/\s+/g, '-');
  const coSlug = country.toLowerCase().trim().replace(/\s+/g, '-');
  const key = `${cSlug}-${coSlug}`;
  return cityIntroContent[key] || cityIntroContent[`${cSlug}-india`] || cityIntroContent['default'];
}

export function generateCityPageContent(
  city: string,
  country: string,
  hotelCount: number
): string {
  const formattedCity = titleCase(city);
  const formattedCountry = titleCase(country);
  const content = getCityContent(city, country);

  const amenitiesList = content.amenities.map(a => `<li><strong>${a.split(' ')[0]}</strong> ${a.slice(a.indexOf(' ') + 1)}</li>`).join('');
  const whyChooseList = content.whyChoose.map(w => `<li>${w}</li>`).join('');

  return `
    <h2 class="text-2xl font-bold text-gray-900 mt-6 mb-3">Why Book a Hotel Room with a Bathtub in ${formattedCity}, ${formattedCountry}?</h2>
    <p class="text-gray-700 leading-relaxed mb-4">${content.intro}</p>
    <p class="text-gray-700 leading-relaxed mb-6">Explore <strong>${hotelCount}+ verified hotels</strong> with private in-room bathtubs in ${formattedCity} — each property triple-checked across Booking.com, Agoda, and MakeMyTrip to guarantee private in-room tubs without misleading photos.</p>
    
    <h3 class="text-xl font-bold text-gray-800 mt-6 mb-2">Popular Bathtub Amenities in ${formattedCity}</h3>
    <ul class="list-disc pl-5 space-y-1.5 text-gray-700 mb-6">
      ${amenitiesList}
    </ul>

    <h3 class="text-xl font-bold text-gray-800 mt-6 mb-2">Why Choose a Bathtub Hotel in ${formattedCity}?</h3>
    <ul class="list-disc pl-5 space-y-1.5 text-gray-700 mb-6">
      ${whyChooseList}
    </ul>

    <h3 class="text-xl font-bold text-gray-800 mt-6 mb-2">How to Book Your Stay in ${formattedCity}</h3>
    <p class="text-gray-700 leading-relaxed mb-2">All hotels listed on this guide feature direct links to verified online travel agencies:</p>
    <ul class="list-disc pl-5 space-y-1 text-gray-700">
      <li><strong>Booking.com:</strong> Instant confirmation with free cancellation options.</li>
      <li><strong>Agoda:</strong> Special member rates and mobile discounts across Asia & global stays.</li>
      <li><strong>MakeMyTrip:</strong> Leading platform for India and international destinations with exclusive offers.</li>
    </ul>
  `;
}
