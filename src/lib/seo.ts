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
  },

  // Germany
  'berlin-germany': {
    intro: 'Experience the cutting-edge luxury of Berlin. Discover historic and avant-garde hotels offering private bathtubs and exclusive jacuzzi suites in the heart of Germany\'s vibrant capital.',
    amenities: ['Deep soaking tubs', 'Heated floors', 'Designer luxury toiletries', 'Spa-inspired marble bathrooms'],
    whyChoose: ['Perfect for romantic weekend getaways', 'Close to Brandenburg Gate and Museum Island', 'High-end design and modern comforts']
  },
  'munich-germany': {
    intro: 'Munich combines Bavarian charm with world-class hospitality. Find the finest luxury stays featuring in-room bathtubs and serene spa suites near Marienplatz and the English Garden.',
    amenities: ['Freestanding soaking tubs', 'Bavarian spa amenities', 'Couples massage services', 'Spacious luxury suites'],
    whyChoose: ['Ideal for Alpine stopovers', 'Rich cultural and romantic experiences', 'Proximity to luxury shopping and dining']
  },

  // Austria
  'vienna-austria': {
    intro: 'Immerse yourself in imperial elegance in Vienna. Our curated selection of luxury hotels offers opulent in-room bathtubs and private jacuzzis, surrounded by the city\'s majestic architecture.',
    amenities: ['Palatial marble bathrooms', 'Classic freestanding bathtubs', 'Premium bath salts and oils', 'Underfloor heating'],
    whyChoose: ['Unmatched imperial luxury', 'Steps away from the Vienna State Opera', 'Perfect for a grand romantic escape']
  },
  'salzburg-austria': {
    intro: 'Discover the romantic charm of Mozart\'s birthplace. These exquisite Salzburg hotels feature luxurious bathtubs and spa-like suites, blending historic grandeur with modern comfort.',
    amenities: ['Scenic alpine views from the bath', 'Luxury organic toiletries', 'Deep soaking tubs', 'In-room spa services'],
    whyChoose: ['Charming historic atmosphere', 'Gateway to the Austrian Alps', 'Ideal for anniversary celebrations']
  },

  // Czechia
  'prague-czechia': {
    intro: 'Prague\'s fairytale setting is perfect for romance. Unwind in private bathtubs and luxury jacuzzi suites overlooking the Vltava River or the historic Prague Castle.',
    amenities: ['Antique-style clawfoot tubs', 'River or castle views', 'Opulent baroque interiors', 'Aromatherapy bath menus'],
    whyChoose: ['One of Europe\'s most romantic cities', 'Exceptional value for luxury', 'Stunning historic architecture']
  },

  // Hungary
  'budapest-hungary': {
    intro: 'Known as the City of Spas, Budapest extends its thermal bath heritage into its finest luxury hotels. Enjoy private, deep soaking bathtubs and romantic jacuzzi suites.',
    amenities: ['Thermal-inspired soaking tubs', 'Danube river views', 'Luxurious Hungarian bath products', 'Spacious couple suites'],
    whyChoose: ['Rich thermal bathing culture', 'Breathtaking views of Parliament and the Danube', 'Perfect for wellness and romance']
  },

  // Portugal
  'lisbon-portugal': {
    intro: 'Experience the sun-kissed charm of Lisbon. From historic palaces to chic modern boutiques, find the best hotels offering private bathtubs for a relaxing romantic getaway.',
    amenities: ['Azulejo-tiled luxury bathrooms', 'Deep soaking tubs', 'River Tagus views', 'Premium Mediterranean bath amenities'],
    whyChoose: ['Vibrant culinary and cultural scene', 'Stunning hilltop views', 'Warm, romantic atmosphere']
  },

  // Ireland
  'dublin-ireland': {
    intro: 'Discover Irish hospitality at its finest in Dublin. Relax in plush, luxurious hotel suites featuring private bathtubs and high-end amenities after a day exploring the lively city.',
    amenities: ['Classic freestanding bathtubs', 'Plush bathrobes and slippers', 'Premium Irish organic toiletries', 'Heated towel rails'],
    whyChoose: ['Cozy and romantic hideaways', 'Close to Trinity College and Temple Bar', 'Unparalleled Irish charm and service']
  },

  // Spain
  'madrid-spain': {
    intro: 'Embrace the elegance and vibrant energy of Madrid. Our selected luxury hotels offer majestic in-room bathtubs and palatial spa suites right in the city center.',
    amenities: ['Spacious marble bathtubs', 'Exclusive Spanish luxury amenities', 'Rain showers and soaking tubs', 'In-room spa treatments'],
    whyChoose: ['World-class art museums and dining', 'Sophisticated romantic atmosphere', 'Central location for exploring']
  },

  // Italy
  'venice-italy': {
    intro: 'Venice is the epitome of romance. Stay in converted palazzos and luxury hotels featuring opulent private bathtubs overlooking the Grand Canal or quiet Venetian waterways.',
    amenities: ['Murano glass chandeliers in bathrooms', 'Canal-view soaking tubs', 'Classic Italian marble', 'Exclusive Acqua di Parma toiletries'],
    whyChoose: ['The world\'s most romantic city', 'Unforgettable gondola rides and dining', 'True palatial luxury']
  },
  'florence-italy': {
    intro: 'Surround yourself with Renaissance art and luxury in Florence. Discover the finest hotels offering private bathtubs, exquisite frescoes, and unparalleled Italian elegance.',
    amenities: ['Freestanding tubs with city views', 'Renaissance-inspired luxury bathrooms', 'Premium Italian bath products', 'Couples massage and spa'],
    whyChoose: ['Heart of the Renaissance', 'Romantic walks along the Arno', 'Exceptional culinary and art experiences']
  },
  'milan-italy': {
    intro: 'Experience the height of fashion and luxury in Milan. Unwind in ultra-modern designer suites featuring deep soaking bathtubs and exclusive in-room spa amenities.',
    amenities: ['Designer freestanding bathtubs', 'Minimalist luxury aesthetics', 'Exclusive designer toiletries', 'High-tech bathroom features'],
    whyChoose: ['World-class shopping and design', 'Sophisticated cosmopolitan vibe', 'Proximity to the Duomo']
  },

  // South Africa
  'cape-town-south-africa': {
    intro: 'Cape Town offers dramatic landscapes and ultimate luxury. Enjoy private bathtubs and jacuzzis with breathtaking views of Table Mountain or the Atlantic Ocean.',
    amenities: ['Ocean or mountain view soaking tubs', 'Luxurious African botanicals', 'Spacious private terraces', 'In-room romantic dining'],
    whyChoose: ['Incredible natural beauty', 'World-renowned winelands nearby', 'Perfect for luxury honeymoons']
  },

  // Brazil
  'rio-de-janeiro-brazil': {
    intro: 'Feel the rhythm of Rio de Janeiro. Stay in iconic beachfront luxury hotels offering private bathtubs, jacuzzis, and sweeping views of Copacabana and Ipanema.',
    amenities: ['Beachfront view soaking tubs', 'Tropical bath amenities', 'Private balconies with jacuzzis', 'Luxurious Brazilian linens'],
    whyChoose: ['Iconic beaches and vibrant culture', 'Romantic tropical atmosphere', 'Unforgettable ocean sunsets']
  },

  // Mexico
  'cancun-mexico': {
    intro: 'Cancun is the ultimate tropical escape. Discover exclusive beachfront resorts featuring private in-room jacuzzis and deep soaking bathtubs overlooking the Caribbean Sea.',
    amenities: ['Private ocean-view jacuzzis', 'Deep soaking tubs', 'All-inclusive luxury spa services', 'Premium agave-based amenities'],
    whyChoose: ['Pristine white sand beaches', 'Ultimate relaxation and romance', 'World-class luxury resorts']
  },
  'mexico-city-mexico': {
    intro: 'Explore the vibrant heart of Mexico City. Relax in sophisticated luxury hotels offering plush suites with private bathtubs, perfectly situated in Polanco and Reforma.',
    amenities: ['Modern freestanding bathtubs', 'Panoramic city views', 'Exclusive artisanal bath products', 'Spacious marble bathrooms'],
    whyChoose: ['Incredible culinary scene', 'Rich history and culture', 'Chic and cosmopolitan luxury']
  },

  // Costa Rica
  'san-jose-costa-rica': {
    intro: 'San Jose is your gateway to tropical luxury. Find the best hotels offering serene spa suites and private bathtubs, blending urban comfort with Costa Rican nature.',
    amenities: ['Tropical garden-view soaking tubs', 'Eco-friendly luxury amenities', 'In-room couples spa treatments', 'Volcanic mud bath products'],
    whyChoose: ['Perfect start to a romantic eco-tour', 'Lush tropical surroundings', 'Rich coffee culture and history']
  },

  // New Zealand
  'auckland-new-zealand': {
    intro: 'Auckland combines harbor-side beauty with urban luxury. Discover exceptional hotels featuring private bathtubs and serene suites overlooking the Viaduct Harbour.',
    amenities: ['Harbor-view deep soaking tubs', 'Premium New Zealand botanicals', 'Heated bathroom floors', 'Spacious couples suites'],
    whyChoose: ['Stunning waterfront views', 'Gateway to New Zealand\'s natural wonders', 'Sophisticated dining and romance']
  },
  'queenstown-new-zealand': {
    intro: 'Queenstown is the alpine jewel of New Zealand. Unwind after a day of adventure in luxury lodges and boutique hotels featuring private bathtubs and dramatic lake and mountain views.',
    amenities: ['Lake Wakatipu and mountain views from the bath', 'Freestanding luxury tubs', 'Locally sourced organic amenities', 'Fireplaces and heated floors'],
    whyChoose: ['Unparalleled alpine scenery', 'Ultimate romantic adventure destination', 'Exclusive luxury lodges']
  },

  // French Polynesia - Bora Bora
  'bora-bora-french-polynesia': {
    intro: 'Bora Bora is the crown jewel of South Pacific romance. Experience world-renowned overwater bungalows featuring glass-bottom soaking tubs, private horizon plunge pools, and uninterrupted views of Mount Otemanu rising over crystal turquoise lagoons.',
    amenities: [
      'Lagoon-facing freestanding soaking tubs with Mount Otemanu views',
      'Overwater villa glass-floor viewing panels adjacent to bathtubs',
      'Private sunset deck whirlpools and hydrotherapy tubs',
      'Monoi oil and Polynesian botanical bath preparations',
      'Direct lagoon access ladders from private bath pavilions'
    ],
    whyChoose: [
      'The world’s most iconic overwater honeymoon destination',
      'Unsurpassed lagoon privacy with private boat transfers and outrigger canoe breakfasts',
      'World-class coral reef snorkeling right beneath your bungalow',
      'Every luxury property verified with guaranteed in-suite tubs'
    ]
  },

  // Seychelles
  'seychelles-seychelles': {
    intro: 'Seychelles offers untouched granite boulder shores and azure Indian Ocean waters. Discover cliffside sanctuary villas and beachfront estates featuring open-air granite soaking tubs, private plunge pools, and panoramic sea views.',
    amenities: [
      'Open-air monolithic granite soaking bathtubs',
      'Cliffside private jacuzzis overlooking Anse Source d\'Argent',
      'Glass-walled master suites framing lush tropical jungle canopies',
      'Indigenous botanical and vanilla essential oil bath infusions',
      'Private sunset infinity pools with connected spa soakers'
    ],
    whyChoose: [
      'Secluded island romance and ultra-exclusive private villa living',
      'Pristine UNESCO-protected nature and world-famous granite boulder beaches',
      'Private butler service and candlelit beachside Creole dining',
      'Verified in-room bathtubs across all featured island resorts'
    ]
  },

  // Mauritius
  'mauritius-mauritius': {
    intro: 'Mauritius blends dramatic volcanic mountain backdrops with white sand lagoons. Unwind in colonial-style beachfront suites and private mountain retreats featuring deep freestanding tubs and tropical garden jacuzzis.',
    amenities: [
      'Oceanfront freestanding bathtubs overlooking coral lagoons',
      'Outdoor tropical garden bathtubs surrounded by frangipani',
      'Private terrace whirlpool jacuzzis with Le Morne mountain views',
      'Sugar-cane and spice-infused Ayurvedic bath therapies',
      'Oversized couples marble bathrooms with double rain showers'
    ],
    whyChoose: [
      'Spectacular mix of turquoise lagoons and dramatic Le Morne peaks',
      'Renowned Mauritian five-star hospitality and Michelin-caliber dining',
      'Ideal year-round destination for romantic honeymoons and anniversaries',
      'Triple-verified room tiers with guaranteed private in-room tubs'
    ]
  },

  // Fiji
  'fiji-fiji': {
    intro: 'Fiji is the South Pacific’s paradise of private islands, warm smiles, and serene coral coves. Indulge in traditional Fijian bures featuring outdoor stone bathtubs, private plunge pools, and panoramic views of calm turquoise lagoons.',
    amenities: [
      'Handcrafted outdoor stone soaking bathtubs in private garden courtyards',
      'Lagoon-edge private jacuzzis with sunset views',
      'Traditional thatched bure master suites with deep soaking tubs',
      'Pure Fiji coconut and frangipani botanical bath therapies',
      'Private beach decks with open-air rainwater showers'
    ],
    whyChoose: [
      'World-renowned Fijian warmth and private island tranquility',
      'Adults-only romantic resorts surrounded by vibrant coral reefs',
      'Intimate private beachfront bures designed exclusively for couples',
      'Guaranteed private in-room bathtubs verified on all platforms'
    ]
  },

  // UK - Manchester
  'manchester-uk': {
    intro: 'Manchester blends industrial Victorian architecture with stylish modern luxury. From Deansgate high-rise skyline suites to boutique warehouse conversions in the Northern Quarter, discover romantic hotels featuring freestanding copper tubs and private whirlpool jacuzzis.',
    amenities: [
      'Freestanding cast-iron and roll-top bathtubs in boutique warehouse suites',
      'High-rise panoramic Deansgate skyline jacuzzi suites',
      'Dual-head rainfall showers with luxury British botanical bath amenities',
      'Private spa bath access with bespoke champagne room packages'
    ],
    whyChoose: [
      'Vibrant music, theatre, dining, and culture right outside your door',
      'Unique architectural heritage hotels and modern 5-star towers',
      'Convenient rail links to London, Edinburgh, and Peak District getaways',
      'Every bathtub suite independently confirmed on Booking.com'
    ]
  },

  // India - Ahmedabad
  'ahmedabad-india': {
    intro: 'Ahmedabad combines UNESCO World Heritage havelis with modern Sabarmati riverfront luxury. Enjoy romantic couple retreats featuring deep marble soaking tubs, private jacuzzi suites, and serene courtyard stays across SG Highway and Ashram Road.',
    amenities: [
      'Deep marble soaking bathtubs with premium Ayurvedic bath oils',
      'Spacious master suites with glass-partitioned designer tubs',
      'Handcrafted terracotta and brass bathroom fixtures in heritage boutique havelis',
      'Riverfront-facing premium rooms with separate rain showers'
    ],
    whyChoose: [
      'Rich culinary, heritage, and textile culture for romantic explorers',
      'Top-tier 5-star hotels offering full couple-friendly privacy and seamless check-in',
      'Convenient base for exploring Gandhinagar, Adalaj Stepwell, and Modhera',
      'All listings verified across Booking.com, Agoda, and MakeMyTrip'
    ]
  },

  // India - Kochi
  'kochi-india': {
    intro: 'Kochi is Kerala’s historic spice capital, where Portuguese colonial mansions meet tranquil backwater vistas. Unwind in boutique heritage hotels in Fort Kochi and sea-facing luxury resorts featuring freestanding clawfoot tubs and private jacuzzi plunge baths.',
    amenities: [
      'Colonial-style freestanding clawfoot bathtubs in Fort Kochi heritage mansions',
      'Arabian Sea and Vembanad Lake sunset view jacuzzi balconies',
      'Natural Ayurvedic herbal bath salts and aromatic lemongrass oils',
      'Open-to-sky tropical bathroom designs with lush garden courtyards'
    ],
    whyChoose: [
      'Romantic waterfront promenades, Chinese fishing nets, and sunset cruises',
      'Award-winning heritage conversions with intimate boutique privacy',
      'Gateway to Kerala’s backwaters, Marari Beach, and Munnar hill tea estates',
      'Triple-verified room tiers with guaranteed private in-room bathtubs'
    ]
  },

  // India - Coimbatore
  'coimbatore-india': {
    intro: 'Nestled at the foothills of the Western Ghats, Coimbatore offers a serene sanctuary for couples. Discover contemporary luxury hotels and wellness retreats featuring deep soaking tubs, hydrotherapy jets, and peaceful mountain backdrops.',
    amenities: [
      'Deep ceramic soaking tubs with panoramic Western Ghats foothill views',
      'Spacious executive suites with modern whirlpool jacuzzi installations',
      'Herbal bath infusions and holistic wellness spa amenities',
      'Private balcony seating overlooking serene green landscaped gardens'
    ],
    whyChoose: [
      'Pleasant year-round climate and tranquil gateway to Ooty and Valparai',
      'High-standard 5-star hospitality with discreet couple-friendly privacy',
      'Proximity to Isha Yoga Center and Siruvani waterfalls',
      'Independent verification confirming in-room tubs before reservation'
    ]
  },

  // India - Pune
  'pune-india': {
    intro: 'Pune offers Maharashtra’s premier urban romantic escape. From lush green Koregaon Park boutique stays to upscale Viman Nagar and Senapati Bapat Road towers, unwind in designer suites with freestanding bathtubs and private hot tubs.',
    amenities: [
      'Freestanding designer soaking tubs with mood lighting and bath salts',
      'Skyline and lush green canopy view jacuzzi suites',
      'Walk-in glass steam showers and plush cotton bathrobes',
      'Private in-room dining setups for anniversary dates and staycations'
    ],
    whyChoose: [
      'Vibrant cafe culture, trendy microbreweries, and heritage landmarks',
      'Convenient weekend drive from Mumbai via the Mumbai-Pune Expressway',
      'Extensive selection of 5-star international chains with couple privacy',
      'No shared spa facilities — every listed bathtub is 100% in-room'
    ]
  },

  // India - Indore
  'indore-india': {
    intro: 'Indore, the cleanest city in India and culinary heart of Madhya Pradesh, features modern luxury hotels along Vijay Nagar and AB Road offering expansive executive suites with private jacuzzi tubs and deep soaking baths.',
    amenities: [
      'Oversized whirlpool jacuzzi bathtubs with massaging water jets',
      'Executive club suites with marble bathrooms and deep soaking tubs',
      'High-end designer bath amenities and complimentary bath bombs',
      'City skyline vistas from top-floor presidential and luxury suites'
    ],
    whyChoose: [
      'Legendary food streets at Sarafa Bazaar and 56 Dukan for couple foodies',
      'Exceptional value for premium 5-star suite accommodations',
      'Centrally located with easy access to Ujjain and Mandu heritage getaways',
      'Verified room tiers guaranteeing private bathtubs upon check-in'
    ]
  },

  // India - Gurgaon
  'gurgaon-india': {
    intro: 'Gurgaon (Gurugram) is Delhi NCR’s premier modern luxury hub. Featuring high-rise glass towers along Cyber City and Golf Course Road, enjoy opulent suites with panoramic floor-to-ceiling glass-wall bathtubs and private couple jacuzzis.',
    amenities: [
      'Floor-to-ceiling glass-walled bathtubs overlooking futuristic city skylines',
      'Oversized Italian marble soaking tubs and dual rain showers',
      'Private jacuzzi suites with romantic ambient lighting controls',
      'Dedicated butler service and luxury spa bathroom amenities'
    ],
    whyChoose: [
      'World-class fine dining, luxury malls, and rooftop cocktail lounges',
      'Effortless staycation access from Delhi and Indira Gandhi International Airport',
      'Highest concentration of 5-star luxury brand suites in North India',
      'Every listing triple-checked for verified in-room bathtub guarantees'
    ]
  },

  // India - Lonavala
  'lonavala-india': {
    intro: 'Lonavala is the ultimate monsoon and winter romance retreat in the Sahyadri mountains. Escape the city to luxury cliffside villas and hilltop resorts featuring outdoor private jacuzzis and mountain-view bathtubs.',
    amenities: [
      'Panoramic valley-view bathtubs overlooking mist-covered Sahyadri peaks',
      'Private outdoor heated jacuzzi tubs on secluded villa sundecks',
      'Open-air natural stone baths framed by tropical monsoon greenery',
      'Aromatic bubble bath hampers with fresh rose petals and scented candles'
    ],
    whyChoose: [
      'Breathtaking waterfalls, lush viewpoints, and cool mountain breezes',
      'Under 2 hours drive from both Mumbai and Pune for quick romantic weekends',
      'Unmatched privacy in standalone luxury pool and jacuzzi villas',
      'Strictly verified private in-room or private sundeck tubs'
    ]
  },

  // India - Karjat
  'karjat-india': {
    intro: 'Karjat offers a tranquil riverside and mountain hideaway nestled along the Ulhas River. Discover rustic-chic villas and boutique eco-resorts with open-air stone bathtubs and private plunge jacuzzis overlooking green valleys.',
    amenities: [
      'Handcrafted natural river-stone bathtubs set in private open courtyards',
      'River-facing jacuzzi tubs on private wooden decks',
      'Farm-to-table romantic candlelight dining next to private tubs',
      'Surrounding organic orchards and scenic hiking trail views'
    ],
    whyChoose: [
      'Serene escape from urban noise with fresh mountain air and clear skies',
      'Ideal for couples seeking offbeat, quiet nature retreats',
      'Short scenic drive from Mumbai, Thane, and Navi Mumbai',
      'Verified private in-room installations on every listing'
    ]
  },

  // India - Dharamshala
  'dharamshala-india': {
    intro: 'Perched under the snow-capped Dhauladhar range, Dharamshala and McLeod Ganj offer tranquil Himalayan romance. Stay in boutique mountain lodges featuring heated cedar soaking tubs and cedar-scented private jacuzzis framing cedar forests.',
    amenities: [
      'Himalayan mountain-facing heated bathtubs with pine valley vistas',
      'Cedar-wood and natural slate stone bathroom architecture',
      'Herbal mountain mineral bath salts and organic Tibetan skincare',
      'Cozy fireplace suites with adjoining deep soaking baths'
    ],
    whyChoose: [
      'Crisp Himalayan mountain air, Tibetan culture, and scenic pine trails',
      'Intimate boutique lodges with personalized mountain hospitality',
      'Perfect retreat for anniversaries, honeymoons, and peaceful creative getaways',
      'Verified in-room bathtubs confirmed across major travel platforms'
    ]
  },

  // India - Haridwar
  'haridwar-india': {
    intro: 'Haridwar offers spiritual tranquility along the sacred Ganges. Experience luxury wellness resorts and boutique heritage retreats featuring private herbal soaking tubs and tranquil river views for deep romantic rejuvenation.',
    amenities: [
      'Ganges river-view luxury suites with deep marble soaking tubs',
      'Traditional Ayurvedic herbal bath rituals and therapeutic bath oils',
      'Private balcony jacuzzi baths overlooking serene sacred ghats',
      'Calming holistic wellness spa treatments within the resort'
    ],
    whyChoose: [
      'Peaceful, rejuvenating atmosphere for couples seeking spiritual wellness',
      'Close proximity to Raja Ji National Park and scenic Rishikesh',
      'Pure vegetarian fine dining and serene riverside meditative stays',
      'Every bathtub suite independently confirmed for private in-room use'
    ]
  },

  // India - Kolhapur
  'kolhapur-india': {
    intro: 'Kolhapur showcases royal Maratha heritage, historic palaces, and rich cultural traditions. Stay in premium boutique hotels featuring executive suites with private soaking tubs and modern whirlpool jacuzzis.',
    amenities: [
      'Deep soaking ceramic bathtubs with refreshing herbal bath essences',
      'Spacious royal master suites with marble bathrooms and ambient lighting',
      'Dual shower setups with rainfall fixtures and premium bath linen',
      'Quiet, private accommodations designed for couple relaxation'
    ],
    whyChoose: [
      'Historic Mahalaxmi Temple, New Palace Museum, and Panhala Fort nearby',
      'Famous Kolhapuri culinary cuisine and authentic regional charm',
      'Great transit stopover between Mumbai, Pune, and Goa with 5-star comfort',
      'Verified private in-room bathtub amenities on partner platforms'
    ]
  },

  // India - Nainital
  'nainital-india': {
    intro: 'Nainital’s shimmering emerald lake and misty Kumaon hills have charmed couples for generations. Experience romantic heritage hotels and lake-facing luxury suites featuring vintage bathtubs and private hot water spa baths.',
    amenities: [
      'Naini Lake view vintage bathtubs set against pine-clad mountain slopes',
      'Heritage wooden paneling and cozy heated master bathrooms',
      'Hot water bubble bath preparations with mountain herbal fragrances',
      'Adjoining private sun terraces overlooking the scenic hill town'
    ],
    whyChoose: [
      'Classic hill station romance with boat rides, ropeway views, and Mall Road walks',
      'Historic colonial-era properties brimming with nostalgic charm',
      'Cool mountain escape within driving distance from Delhi NCR',
      'Triple-verified room tiers to ensure private in-room tubs'
    ]
  },

  // India - Kodaikanal
  'kodaikanal-india': {
    intro: 'Known as the "Princess of Hill Stations", Kodaikanal in Tamil Nadu’s Palani Hills offers misty pine forests, waterfalls, and romantic tranquility. Indulge in private jacuzzi suites and cliffside chalets with deep soaking bathtubs.',
    amenities: [
      'Deep soaking bathtubs framing mist-covered valleys and eucalyptus forests',
      'Private indoor whirlpool jacuzzis with therapeutic jet settings',
      'Cozy fireplace suites with heated bathrooms and plush robes',
      'Spectacular hillside viewpoints directly from your private suite'
    ],
    whyChoose: [
      'Cool year-round weather, boating on Kodai Lake, and scenic Coaker’s Walk',
      'Secluded luxury chalets ideal for honeymoons and quiet couple getaways',
      'Serene South Indian hill retreat away from urban crowds',
      'Guaranteed private in-room tubs verified on Booking.com and Agoda'
    ]
  },

  // India - Zirakpur
  'zirakpur-india': {
    intro: 'Zirakpur serves as the luxury hospitality gateway to Chandigarh, Himachal Pradesh, and the Shivalik foothills. Enjoy expansive 5-star hotel suites featuring designer bathtubs and private jacuzzi setups for relaxing weekend staycations.',
    amenities: [
      'Modern freestanding bathtubs in expansive executive and presidential suites',
      'Whirlpool jacuzzi tubs with multi-jet massage functionality',
      'Luxury designer toiletries, rain showers, and backlit vanity mirrors',
      'Quiet soundproof rooms with private in-room dining menus'
    ],
    whyChoose: [
      'Prime gateway location with seamless access to Chandigarh, Shimla, and Kasauli',
      'High-value 5-star accommodations with top-tier spa and pool amenities',
      'Discreet, couple-friendly atmosphere with hassle-free check-in',
      'Triple-verified across online booking channels for guaranteed tubs'
    ]
  },

  // India - Digha
  'digha-india': {
    intro: 'Digha is Bengal’s favorite coastal seaside getaway along the Bay of Bengal. Relax after a day on the beach in coastal luxury resorts featuring sea-breeze jacuzzi suites and private deep bathtubs built for couples.',
    amenities: [
      'Sea-facing balcony suites with private jacuzzi and hot tubs',
      'Spacious marble bathrooms with deep soaking tubs',
      'Refreshing sea breeze views and private room service amenities',
      'Coastal decor with modern fixtures and complimentary bath hampers'
    ],
    whyChoose: [
      'Relaxing sea-beach walks, fresh coastal seafood, and romantic sunsets',
      'Popular weekend train or road trip escape from Kolkata',
      'New-generation upscale resort properties offering complete privacy',
      'Guaranteed in-room tubs independently verified'
    ]
  },

  // India - Mount Abu
  'mount-abu-india': {
    intro: 'Mount Abu is Rajasthan’s only hill station, set amidst the ancient Aravalli Range. Discover romantic heritage retreats and lakeside suites offering private soaking bathtubs, mountain breezes, and sunset views over Nakki Lake.',
    amenities: [
      'Freestanding bathtubs set against Aravalli granite mountain views',
      'Heritage haveli-style master suites with hand-carved jharokhas and deep baths',
      'Aromatic herbal bath salts and traditional rosewater essences',
      'Private garden terraces overlooking lush subtropical greenery'
    ],
    whyChoose: [
      'Unique cool mountain oasis in Rajasthan with scenic Nakki Lake boat rides',
      'Intimate heritage properties with royal Rajput hospitality',
      'Peaceful retreat for couples visiting Dilwara Temples and Sunset Point',
      'Verified room categories with private in-room bathtubs confirmed'
    ]
  },

  // India - Shirdi
  'shirdi-india': {
    intro: 'Shirdi welcomes millions of pilgrims to the shrine of Sai Baba. For travelers seeking comfort and rejuvenation, top-tier spiritual retreats and luxury hotels offer peaceful suites with deep soaking tubs and private jacuzzi facilities.',
    amenities: [
      'Deep ceramic soaking tubs for relaxing after temple visits and darshan',
      'Quiet executive suites with soundproofed marble bathrooms',
      'Soothing herbal bath salts and comfortable cotton bathrobes',
      'Spacious living areas with tranquil garden and pool views'
    ],
    whyChoose: [
      'Comfortable, peaceful sanctuary just minutes from the Samadhi Mandir',
      'Pure vegetarian dining, wellness spas, and family/couple privacy',
      'Top-rated 4-star and 5-star properties offering premium amenities',
      'Independent verification confirming private in-room bathtubs'
    ]
  },

  // India - Igatpuri
  'igatpuri-india': {
    intro: 'Igatpuri is Maharashtra’s majestic waterfall and mist paradise in the Western Ghats. Unwind in luxury hillside villas and spa resorts featuring private outdoor stone bathtubs and heated jacuzzis overlooking green valleys.',
    amenities: [
      'Private outdoor stone tubs with panoramic Sahyadri mountain and waterfall views',
      'Heated jacuzzi tubs on secluded private sundecks',
      'Aromatic monsoon bubble baths with essential cedar and lavender oils',
      'Villas featuring private plunge pools and adjoining open-air baths'
    ],
    whyChoose: [
      'Spectacular monsoon clouds, mountain trails, and the Vipassana meditation center',
      'Under 2.5 hours scenic drive from Mumbai and Thane',
      'Unmatched couple privacy in standalone villas and luxury wellness resorts',
      'All listed bathtub suites triple-checked for verified in-room tubs'
    ]
  },

  // India - Mahabalipuram
  'mahabalipuram-india': {
    intro: 'Mahabalipuram (Mamallapuram) blends UNESCO World Heritage rock-cut temples with golden Coromandel Coast beaches. Indulge in beachfront luxury villas featuring sunken stone bathtubs and private oceanfront jacuzzi pools.',
    amenities: [
      'Sunken granite and marble bathtubs overlooking the Bay of Bengal',
      'Private oceanfront plunge pools and open-air tropical jacuzzis',
      'Natural sea-salt bath therapies and Ayurvedic coconut bath amenities',
      'Private beach cabanas with romantic seaside candlelight dining'
    ],
    whyChoose: [
      'Scenic East Coast Road (ECR) beach getaway just 1 hour from Chennai',
      '7th-century Shore Temple and UNESCO rock reliefs right at your doorstep',
      'World-class beach resorts offering unmatched couple luxury and privacy',
      'Verified in-room and private villa bathtubs checked across partner platforms'
    ]
  },

  // India - Darjeeling
  'darjeeling-india': {
    intro: 'Darjeeling is the Queen of the Hills, renowned for world-famous tea estates and sunrise vistas of Mount Kanchenjunga. Relax in colonial heritage suites and mountain chalets featuring vintage clawfoot bathtubs and fireplace warmth.',
    amenities: [
      'Kanchenjunga mountain-facing vintage clawfoot bathtubs',
      'Historic colonial fireplace suites with heated bathrooms',
      'Fresh Himalayan herbal bath infusions and Darjeeling tea bath salts',
      'Private balcony seating overlooking rolling emerald tea plantations'
    ],
    whyChoose: [
      'Unrivaled views of the world’s third-highest peak from your room',
      'Intimate historic heritage properties with vintage British-era elegance',
      'Romantic walks through tea gardens and along the historic Mall',
      'Every bathtub suite independently confirmed on Booking.com and Agoda'
    ]
  },

  // India - Shillong
  'shillong-india': {
    intro: 'Shillong, the "Scotland of the East", offers rolling pine hills, living root bridges, and cool mountain air. Experience boutique Meghalaya retreats and Umiam lake-view resorts featuring heated soaking tubs and private spa jacuzzis.',
    amenities: [
      'Heated soaking bathtubs framed by pine forest and lake views',
      'Natural local slate and cedar wood bathroom architecture',
      'Aromatic pine-needle bath essences and soothing herbal salts',
      'Cozy fireplace living areas with private couple dining'
    ],
    whyChoose: [
      'Cool year-round weather, waterfalls, and vibrant music culture',
      'Peaceful sanctuary for couples exploring Meghalaya’s natural wonders',
      'Intimate boutique lodges with personalized Khasi hospitality',
      'Guaranteed private in-room bathtubs verified on partner platforms'
    ]
  },

  // India - Gandhinagar
  'gandhinagar-india': {
    intro: 'Gandhinagar, Gujarat’s lush green planned capital on the banks of the Sabarmati, features contemporary 5-star resorts and golf retreats offering expansive executive suites with designer bathtubs and private whirlpool jacuzzis.',
    amenities: [
      'Modern freestanding bathtubs in spacious luxury suites',
      'Whirlpool jacuzzi tubs with relaxing hydrotherapy jets',
      'Glass-enclosed rain showers and premium Ayurvedic toiletries',
      'Expansive landscaped garden and golf course views'
    ],
    whyChoose: [
      'Tranquil, pollution-free atmosphere with abundant green canopies',
      'Close proximity to Akshardham Temple and GIFT City business hub',
      'High-end hospitality offering complete couple privacy and luxury amenities',
      'Strictly verified private in-room tubs on all listings'
    ]
  },

  // India - Daman
  'daman-india': {
    intro: 'Daman combines Portuguese colonial history with Arabian Sea beaches. Unwind in beachfront resorts and heritage hotels featuring sea-view balcony jacuzzi suites and deep bathtubs designed for relaxing weekend couple escapes.',
    amenities: [
      'Sea-facing balcony suites with private jacuzzi and hot tubs',
      'Spacious marble bathrooms with deep soaking tubs',
      'Refreshing Arabian Sea sunset views from your private room',
      'Complimentary bath hampers with aromatic sea-salt blends'
    ],
    whyChoose: [
      'Popular coastal weekend road trip from Mumbai, Surat, and Vapi',
      'Historic Portuguese forts, lighthouse, and relaxing sandy beaches',
      'Couple-friendly beachside luxury resorts with full privacy',
      'Triple-verified across online booking platforms'
    ]
  },

  // India - Puri
  'puri-india': {
    intro: 'Puri on the Bay of Bengal combines spiritual significance with breezy golden sand beaches. Stay in luxury seaside resorts along Marine Drive featuring private jacuzzi tubs and sea-facing deep soaking baths for romantic relaxation.',
    amenities: [
      'Bay of Bengal ocean-view bathtubs and private balcony jacuzzis',
      'Spacious coastal suites with natural stone and marble bathrooms',
      'Therapeutic sea-salt bath preparations and plush beach towels',
      'Private beach access with poolside dining and sunset views'
    ],
    whyChoose: [
      'Golden beach sunsets, Jagannath Temple, and Konark Sun Temple day trips',
      'Expansive coastal resorts designed for relaxed couple getaways',
      'High-standard hospitality with discrete couple-friendly check-in',
      'Independent verification confirming private in-room bathtubs'
    ]
  },

  // India - Siliguri
  'siliguri-india': {
    intro: 'Siliguri is the strategic gateway to Darjeeling, Sikkim, Bhutan, and the Dooars. Experience luxury transit retreats and foothill resorts featuring expansive suites with deep marble soaking tubs and private jacuzzi baths.',
    amenities: [
      'Deep marble soaking bathtubs in premium club and presidential suites',
      'Whirlpool jacuzzi baths with multi-speed hydrotherapy jets',
      'Soundproofed executive rooms with scenic Mahananda river and foothill views',
      'Luxury designer bathroom amenities and dual rainfall showers'
    ],
    whyChoose: [
      'Convenient luxury hub connecting Bagdogra Airport and New Jalpaiguri',
      'Top 5-star international hotel chains with excellent dining and spas',
      'Relaxing rest stop before or after mountain explorations',
      'Guaranteed in-room tubs independently verified'
    ]
  },

  // India - Yercaud
  'yercaud-india': {
    intro: 'Yercaud in Tamil Nadu’s Shevaroy Hills is a peaceful sanctuary of coffee plantations, orange groves, and spice gardens. Escape to hillside chalets featuring deep soaking bathtubs and private jacuzzis overlooking mist-covered valleys.',
    amenities: [
      'Deep soaking tubs framing scenic Shevaroy mountain and lake views',
      'Private villa jacuzzis nestled among coffee and cardamom plantations',
      'Aromatic coffee-infused bath scrubs and natural herbal essences',
      'Cozy private wooden sundecks with mountain valley panoramas'
    ],
    whyChoose: [
      'Quiet, uncrowded alternative to Ooty and Kodaikanal for couples',
      'Pleasant mountain climate with scenic boating on Yercaud Lake',
      'Intimate plantation retreats offering supreme privacy and peace',
      'Every bathtub suite triple-checked across verified booking partners'
    ]
  },

  // India - Lavasa
  'lavasa-india': {
    intro: 'Lavasa, designed in the style of the Italian coastal town of Portofino, sits along the serene shores of Warasgaon Lake in the Western Ghats. Indulge in waterfront luxury suites featuring private lake-facing bathtubs and jacuzzi tubs.',
    amenities: [
      'Waterfront bathtubs with panoramic Warasgaon Lake views',
      'Private jacuzzi suites with ambient mood lighting controls',
      'Italian-inspired master bathrooms with glass-walled walk-in showers',
      'Lakeside promenade views directly from your private balcony'
    ],
    whyChoose: [
      'Charming European architectural aesthetic surrounded by green Sahyadri hills',
      'Convenient weekend drive from Pune and Mumbai',
      'Peaceful waterfront strolls, watersports, and relaxed promenade dining',
      'Verified private in-room installations confirmed on partner platforms'
    ]
  },

  // India - Panvel
  'panvel-india': {
    intro: 'Panvel, nestled at the base of the Karnala bird sanctuary and Matheran hills, offers luxury transit hotels and countryside farm retreats featuring executive suites with private jacuzzi tubs and modern soaking baths.',
    amenities: [
      'Private whirlpool jacuzzi tubs in expansive executive suites',
      'Modern glass-walled master bathrooms with deep soaking bathtubs',
      'Scenic green hill vistas and quiet countryside surroundings',
      'Fast connectivity to Navi Mumbai, Mumbai-Pune Expressway, and Goa highway'
    ],
    whyChoose: [
      'Quick weekend getaway from Mumbai without long driving times',
      'Proximity to Karnala Fort, bird sanctuary, and Gadelshwar Lake',
      'High-value modern 4-star and 5-star accommodations with full couple privacy',
      'Triple-verified room tiers with guaranteed private in-room bathtubs'
    ]
  },

  // India - Mathura
  'mathura-india': {
    intro: 'Mathura and Vrindavan in the sacred Braj region along the Yamuna offer profound spiritual heritage. Stay in upscale boutique resorts and heritage hotels offering tranquil suites with deep soaking bathtubs for relaxing after temple visits.',
    amenities: [
      'Deep ceramic soaking bathtubs for peaceful post-darshan relaxation',
      'Spacious heritage-style master suites with quiet courtyard views',
      'Soothing herbal bath salts and traditional sandalwood bath products',
      'Comfortable air-conditioned suites with discreet, attentive hospitality'
    ],
    whyChoose: [
      'Comfortable sanctuary near Shri Krishna Janmabhoomi and Vrindavan temples',
      'Pure vegetarian dining, serene gardens, and couple/family privacy',
      'Well-managed boutique hotels offering modern comforts in sacred Braj',
      'Independent verification guaranteeing private in-room tubs'
    ]
  },

  // Saint Lucia - Soufriere
  'soufriere-saint-lucia': {
    intro: 'Soufrière is the undisputed crown jewel of Caribbean honeymoon romance, framed by the dramatic volcanic spires of the Gros and Petit Pitons. Experience iconic 3-walled open-air sanctuaries featuring private cliffside plunge pools, deep soaking stone tubs, and panoramic sunset views over the turquoise sea.',
    amenities: [
      'Open-air cliffside plunge pools and deep soaking tubs directly framing the Pitons',
      'Handcrafted volcanic stone and tropical hardwood bathroom architecture',
      'Scented botanical bath oils crafted from local St. Lucian cocoa and hibiscus',
      'Private butler service delivering chilled champagne to your private tub'
    ],
    whyChoose: [
      'Voted the world’s leading honeymoon destination for couples and anniversaries',
      'Iconic architectural sanctuaries offering complete privacy without fourth walls',
      'Nearby volcanic drive-in volcano, Sulphur Springs mud baths, and Diamond Falls',
      'Every bathtub suite independently confirmed for guaranteed private in-room tubs'
    ]
  },

  // Jamaica - Montego Bay
  'montego-bay-jamaica': {
    intro: 'Montego Bay on Jamaica’s vibrant north coast combines lush green mountains with calm azure waters. Discover world-class beachfront resorts and secluded overwater villas featuring oversized whirlpool jacuzzi tubs and private outdoor soaking baths.',
    amenities: [
      'Oversized whirlpool jacuzzi tubs overlooking private white-sand coves',
      'Outdoor stone soaking tubs on secluded tropical garden sundecks',
      'Dual rainfall showers with Jamaican blue mountain botanical bath amenities',
      'Private swim-up pool suites with adjoining hydrotherapy spa baths'
    ],
    whyChoose: [
      'World-famous reggae culture, beachfront dining, and catamaran sunset cruises',
      'Extensive selection of luxury adults-only all-inclusive couple sanctuaries',
      'Convenient direct flights from major US and UK airport hubs',
      'Triple-verified across online booking platforms for authentic private tubs'
    ]
  },

  // Bahamas - Nassau
  'nassau-bahamas': {
    intro: 'Nassau and Paradise Island offer glamorous Bahamian romance surrounded by the clearest turquoise waters on earth. Unwind in ultra-luxury oceanfront suites featuring freestanding deep soaking bathtubs, private jacuzzi balconies, and secluded beach access.',
    amenities: [
      'Freestanding designer soaking bathtubs with panoramic ocean vistas',
      'Private oceanfront balcony jacuzzi tubs for romantic sunset stargazing',
      'Expansive master bathrooms clad in Italian marble with separate rain showers',
      'Dedicated concierge service and bespoke aromatherapy bath menus'
    ],
    whyChoose: [
      'Pristine powdery white beaches, private island boat charters, and vibrant marine life',
      'Historic colonial charm blended with 5-star international luxury resorts',
      'Quick and effortless nonstop travel access from the US East Coast and London',
      'Strictly confirmed in-room bathtub guarantees on every listing'
    ]
  },

  // Dominican Republic - Punta Cana
  'punta-cana-dominican-republic': {
    intro: 'Punta Cana, where the Atlantic Ocean meets the Caribbean Sea, is famous for its endless white-sand beaches lined with towering coconut palms. Indulge in adults-only luxury suites featuring private hydrotherapy jacuzzis and open-air soaking tubs.',
    amenities: [
      'Private outdoor terrace jacuzzis overlooking swaying coconut groves',
      'Deep marble soaking bathtubs with hydro-massage water jets',
      'Swim-up luxury suites with direct pool access and adjoining private tubs',
      'Complimentary bath hampers with tropical coconut and vanilla bath scrubs'
    ],
    whyChoose: [
      'Warm tropical weather and calm turquoise waters ideal for couple relaxation',
      'World-renowned all-inclusive luxury resort options with private butler service',
      'Exceptional value for ultra-luxury suite and villa experiences',
      'Verified room tiers guaranteeing private bathtubs upon check-in'
    ]
  },

  // Turks and Caicos - Providenciales
  'providenciales-turks-and-caicos': {
    intro: 'Providenciales (Provo) is home to the award-winning powdery white sands of Grace Bay Beach. Experience ultra-luxury oceanfront residences and boutique beachfront suites featuring freestanding sculptural soaking tubs and secluded private jacuzzi terraces.',
    amenities: [
      'Freestanding sculptural soaking tubs with floor-to-ceiling turquoise ocean views',
      'Private oceanfront wrap-around terraces with sunken jacuzzi tubs',
      'Natural travertine stone bathrooms with glass-enclosed rain showers',
      'Organic mineral bath salts and plush waffle-weave luxury robes'
    ],
    whyChoose: [
      'Grace Bay Beach consistently rated among the best beaches in the world',
      'Uncrowded, tranquil island atmosphere offering elite couple privacy',
      'World-class scuba diving, coral reefs, and romantic sunset yacht charters',
      'Every listing independently verified for authentic in-room bathtub luxury'
    ]
  },

  // Barbados - Bridgetown
  'bridgetown-barbados': {
    intro: 'Bridgetown and Barbados’ legendary Platinum Coast showcase refined British-colonial heritage blended with warm Bajan hospitality. Stay in oceanfront suites featuring private marble soaking tubs, secluded balcony plunge pools, and calm Caribbean swimming waters.',
    amenities: [
      'Oceanfront freestanding marble bathtubs overlooking calm turquoise bays',
      'Private balcony plunge pools and jetted spa tubs framed by bougainvillea',
      'Handcrafted mahogany furnishings and colonial coral-stone architecture',
      'Bespoke Mount Gay rum cocktail service delivered to your bath terrace'
    ],
    whyChoose: [
      'World-famous dining scene known as the culinary capital of the Caribbean',
      'Historic UNESCO World Heritage garrison architecture and platinum beaches',
      'Elegant, intimate boutique luxury hotels tailored for romantic couples',
      'Triple-verified room specifications with guaranteed private in-room tubs'
    ]
  },

  // Aruba - Palm Beach
  'palm-beach-aruba': {
    intro: 'Palm Beach in Aruba, known as "One Happy Island", sits conveniently outside the hurricane belt, guaranteeing calm sunny skies year-round. Relax in luxury high-rise beach resorts featuring private balcony jacuzzi tubs and deep master soaking baths.',
    amenities: [
      'Private balcony jacuzzi hot tubs enjoying constant cooling trade winds',
      'Deep freestanding soaking bathtubs with premium Aloe Vera bath amenities',
      'Floor-to-ceiling glass doors opening onto panoramic sunset ocean views',
      'Spacious double-vanity bathrooms with walk-in glass rainfall showers'
    ],
    whyChoose: [
      'Guaranteed year-round sunny tropical weather outside the Caribbean hurricane zone',
      'Vibrant nightlife, beachfront restaurants, and calm clear swimming waters',
      'Renowned warm hospitality and safe, couple-friendly island atmosphere',
      'All listings verified across Booking.com and Agoda with guaranteed tubs'
    ]
  },

  // USA - Honolulu (Hawaii)
  'honolulu-usa': {
    intro: 'Honolulu and iconic Waikiki Beach blend vibrant Pacific island culture with high-rise luxury. Discover romantic oceanfront suites featuring deep Japanese soaking tubs, private balcony jacuzzis overlooking Diamond Head, and golden Pacific sunsets.',
    amenities: [
      'Deep Japanese-style soaking tubs framing panoramic Waikiki Pacific views',
      'Private oceanfront balcony jacuzzi tubs for romantic sunset viewing',
      'Hawaiian kukui nut and plumeria flower organic bath amenities',
      'Spacious marble bathrooms with double vanities and walk-in rain showers'
    ],
    whyChoose: [
      'America’s premier tropical honeymoon capital with legendary surf and sunsets',
      'World-class luxury beachfront resorts with full couple-friendly privacy',
      'Direct access to Kalakaua Avenue shopping, fine dining, and catamaran sails',
      'Every listing verified across Booking.com and Agoda for guaranteed private tubs'
    ]
  },

  // USA - Maui (Hawaii)
  'maui-usa': {
    intro: 'Maui is the quintessential romantic island paradise. From the golden crescents of Wailea to the dramatic coastline of Kapalua, experience world-famous luxury resorts featuring open-air stone soaking tubs, private plunge pools, and sunset views toward Lanai.',
    amenities: [
      'Outdoor natural volcanic stone soaking tubs on secluded tropical lanais',
      'Private oceanfront plunge pools and hydrotherapy whirlpool jacuzzis',
      'Hawaiian hibiscus bath infusions and soothing coconut milk bath salts',
      'Floor-to-ceiling sliding pocket doors framing dramatic whale-watching waters'
    ],
    whyChoose: [
      'Consistently ranked the #1 honeymoon island in the United States',
      'Iconic romantic road trips along the Road to Hana and Haleakala sunrise',
      'Unmatched couple privacy in standalone 5-star ocean villas and luxury suites',
      'Strictly confirmed private in-room or private lanai tubs on all listings'
    ]
  },

  // USA - Napa Valley (California)
  'napa-usa': {
    intro: 'Napa Valley is the pinnacle of California wine country romance. Unwind amidst rolling vineyard hills in luxury vineyard estate suites featuring outdoor soaking clawfoot tubs, private cedar hot tubs, and cozy indoor fireplaces.',
    amenities: [
      'Private outdoor clawfoot bathtubs overlooking picturesque Cabernet vineyards',
      'Aromatic grape-seed and lavender mineral bath salts crafted locally in Napa',
      'Handcrafted cedar-wood hot tubs on secluded private garden sundecks',
      'Dual-sided fireplaces warming both master bedroom and deep soaking bath'
    ],
    whyChoose: [
      'World-famous Michelin-starred dining, legendary wineries, and private tastings',
      'Intimate boutique luxury lodges offering discreet couple privacy',
      'Scenic hot air balloon rides over misty morning vine canopies',
      'Independent verification confirming guaranteed private in-room bathtubs'
    ]
  },

  // USA - Key West (Florida)
  'key-west-usa': {
    intro: 'Key West, at the southernmost tip of the continental United States, offers relaxed Caribbean bohemian charm and historic elegance. Discover historic Victorian conch cottages and seaside luxury resorts with secluded courtyard clawfoot tubs and private jacuzzis.',
    amenities: [
      'Private courtyard clawfoot bathtubs surrounded by tropical palm gardens',
      'Secluded sundeck jacuzzis perfect for warm tropical evenings under the stars',
      'Handcrafted tropical bath soaps scented with Key lime and coconut',
      'Private balconies enjoying world-famous Key West sunset views'
    ],
    whyChoose: [
      'Vibrant nightlife on Duval Street balanced with tranquil hidden alley romance',
      'Year-round subtropical warmth, snorkeling on coral reefs, and sailing cruises',
      'Charming adults-only boutique inns designed specifically for couples',
      'Triple-verified room tiers to guarantee private in-room tubs'
    ]
  },

  // USA - Charleston (South Carolina)
  'charleston-usa': {
    intro: 'Charleston is the heart of southern romance, with cobblestone streets, gas-lit lanterns, and grand Antebellum mansions. Stay in historic boutique hotels featuring deep clawfoot soaking tubs, Italian marble bathrooms, and wrought-iron garden balconies.',
    amenities: [
      'Vintage freestanding clawfoot soaking tubs in historic restored suites',
      'Italian Carrera marble bathrooms with oversized walk-in rain showers',
      'Artisanal southern magnolia bath oils and plush Turkish cotton robes',
      'Private balconies overlooking historic garden courtyards and church steeples'
    ],
    whyChoose: [
      'Voted America’s most romantic city for couple weekend getaways',
      'Celebrated Lowcountry culinary scene, carriage rides, and historic charm',
      'Exceptional boutique hospitality with evening wine receptions and turndown',
      'Every bathtub suite independently confirmed on Booking.com and Agoda'
    ]
  },

  // Iceland - Reykjavik
  'reykjavik-iceland': {
    intro: 'Reykjavik offers the ultimate Nordic geothermal wellness escape surrounded by volcanic landscapes, midnight sun, and aurora borealis. Discover boutique hotels and design suites featuring geothermal mineral-rich soaking tubs, outdoor thermal hot tubs, and private spa baths.',
    amenities: [
      'Geothermally heated outdoor hot tubs with northern sky viewing',
      'Nordic volcanic stone soaking bathtubs and private spa bathrooms',
      'Organic Icelandic silica and moss bath salts with plush heated robes',
      'Floor-to-ceiling glass suites with views of Mount Esja and Faxaflói bay'
    ],
    whyChoose: [
      'Prime base for exploring the Golden Circle, Blue Lagoon, and Northern Lights tours',
      'World-famous geothermal wellness culture and thermal springs',
      'Chic Nordic architecture with cutting-edge Icelandic culinary dining',
      'Every bathtub suite independently confirmed on Booking.com and Agoda'
    ]
  },

  // Norway - Tromso
  'tromso-norway': {
    intro: 'Tromso, the Arctic capital of Norway, is legendary for polar wilderness, majestic fjords, and front-row seats to the aurora borealis. Relax in luxury fjord-side hotels featuring private cedarwood soaking tubs, heated outdoor jacuzzis, and glass-roofed polar suites.',
    amenities: [
      'Heated outdoor jacuzzi suites overlooking dramatic Arctic fjords',
      'Freestanding designer soaking tubs with panoramic polar mountain views',
      'En-suite Scandinavian saunas paired with deep soaking whirlpool baths',
      'Warm heated floors and luxury Nordic wool throws for sub-zero comfort'
    ],
    whyChoose: [
      'World’s premier destination for Northern Lights expeditions and whale watching',
      'Recharge in steaming hot water under dancing green auroras in total intimacy',
      'Vibrant Arctic maritime culture, polar dining, and midnight sun experiences',
      'Triple-verified room tiers ensuring genuine in-room bathtubs'
    ]
  },

  // Finland - Rovaniemi
  'rovaniemi-finland': {
    intro: 'Rovaniemi in Finnish Lapland is a true Arctic wonderland right on the Arctic Circle. Stay in breathtaking glass igloos, wilderness chalets, and design lodges with private outdoor jacuzzis, en-suite Finnish saunas, and romantic whirlpool tubs beneath the stars.',
    amenities: [
      'Private outdoor hot tubs surrounded by snowdrifts and pine forests',
      'Glass-ceiling igloo suites with sunken whirlpool bathtubs',
      'Authentic cedarwood private saunas integrated with soaking bath chambers',
      'Lapland botanical bath infusions, reindeer pelt lounge chairs, and cozy fireplaces'
    ],
    whyChoose: [
      'Official hometown of Santa Claus and ultimate romantic Arctic winter wonderland',
      'Unrivaled views of the Northern Lights directly from your steaming private tub',
      'Husky sledding, snowmobile safaris, and reindeer sleigh rides outside your door',
      'Guaranteed private tub suites verified across Booking.com and Agoda'
    ]
  },

  // Sweden - Stockholm
  'stockholm-sweden': {
    intro: 'Stockholm, the Venice of the North, spans 14 pristine islands where Lake Mälaren meets the Baltic Sea. Experience high-end Scandinavian design hotels with deep freestanding soaking tubs, copper baths, and rooftop jacuzzi suites overlooking Gamla Stan.',
    amenities: [
      'Deep freestanding designer tubs crafted from Swedish cast stone and copper',
      'Waterfront suites with soaking baths overlooking Stockholm’s archipelago',
      'Spa-grade en-suite saunas paired with hydrotherapy jet tubs',
      'Nordic minimalist bathrooms with heated marble floors and organic amenities'
    ],
    whyChoose: [
      'Immerse in classic Swedish "lagom" and tranquil wellness traditions',
      'Steps from the Royal Palace, Gamla Stan cobblestones, and world-class design museums',
      'Exceptional Michelin-starred New Nordic dining paired with serene island romance',
      'Verified accommodations ensuring in-room bathtubs without deceptive photography'
    ]
  },

  // Denmark - Copenhagen
  'copenhagen-denmark': {
    intro: 'Copenhagen epitomizes romantic "hygge" with historic canal houses, Danish modern design, and cobblestone charm. Indulge in boutique hotels boasting vintage clawfoot bathtubs, bespoke brass soaking tubs, and serene courtyard spa suites.',
    amenities: [
      'Vintage freestanding roll-top clawfoot tubs in historic canal mansions',
      'Artisanal brass and terrazzo soaking tubs with bespoke Danish organic bath oils',
      'En-suite rain showers and deep soaking baths with heated stone floors',
      'Private balconies and French windows overlooking Nyhavn and leafy courtyards'
    ],
    whyChoose: [
      'The global capital of "hygge" — intimate, cozy comfort designed for couples',
      'World-renowned gastronomy from cozy bakeries to multi-starred culinary temples',
      'Walkable and bike-friendly historic neighborhoods, palaces, and harbor baths',
      'Every hotel suite vetted on Booking.com and Agoda for guaranteed tub amenities'
    ]
  },

  // South Korea - Seoul
  'seoul-south-korea': {
    intro: 'Seoul pulses with cutting-edge design, vibrant nightlife, and luxurious high-rise hospitality. Discover five-star skyscraper suites and boutique design hotels featuring floor-to-ceiling skyline bathtubs, deep soaking tubs overlooking the Han River, and Korean herbal spa preparations.',
    amenities: [
      'Floor-to-ceiling picture window bathtubs with panoramic Seoul skyline and Namsan Tower views',
      'Heated hydrotherapy whirlpool tubs with chromatic mood lighting',
      'Traditional Korean herbal bath salts (hanbang) and luxury designer toiletries',
      'Spacious marble bathrooms featuring separate walk-in rain showers and Toto washlets'
    ],
    whyChoose: [
      'Stunning high-altitude romance overlooking Gangnam and central Seoul neon skylines',
      'World-class Korean culinary culture, K-beauty wellness spas, and vibrant night markets',
      'Ultra-modern luxury suites in iconic towers like Lotte World Tower and Signiel',
      'Every bathtub listing independently verified across Booking.com and Agoda'
    ]
  },

  // South Korea - Jeju
  'jeju-south-korea': {
    intro: 'Jeju Island, Korea’s volcanic paradise and premier honeymoon haven, offers pristine coastlines, Hallasan mountain backdrops, and secluded luxury villas. Unwind in private outdoor basalt stone hot tubs, oceanfront whirlpools, and forest spa suites.',
    amenities: [
      'Private outdoor hot tubs carved from authentic Jeju volcanic basalt rock',
      'Oceanfront balcony jacuzzis overlooking the East China Sea and sunrise peaks',
      'Aromatherapy botanical baths infused with Jeju green tea and tangerine oils',
      'Secluded pool villas with heated connected soaking baths and private sundecks'
    ],
    whyChoose: [
      'South Korea’s premier honeymoon and romantic island retreat',
      'Spectacular natural wonders including Seongsan Ilchulbong, waterfalls, and white sand beaches',
      'Subtropical climate offering year-round warm soaking under starry coastal skies',
      'Guaranteed private in-room bathtubs verified on Booking.com and Agoda'
    ]
  },

  // Taiwan - Taipei
  'taipei-taiwan': {
    intro: 'Taipei blends ancient thermal hot spring traditions with vibrant metropolis luxury. Experience world-class hotels in Beitou and central Taipei featuring natural geothermal white-sulfur spring tubs, Japanese-style hinoki wood baths, and mountain-view spa suites.',
    amenities: [
      'In-room private natural geothermal hot spring tubs fed by Beitou white-sulfur springs',
      'Aromatic Japanese cedarwood (hinoki) and green serpentine stone soaking baths',
      'Taiwanese high-mountain oolong tea bath amenities and artisanal herbal infusions',
      'Floor-to-ceiling glass bathrooms framing Yangmingshan National Park greenery'
    ],
    whyChoose: [
      'One of the world’s few capital cities with direct natural volcanic hot springs in hotel rooms',
      'Legendary night market gastronomy, Michelin-starred dining, and rich cultural heritage',
      'Peaceful mountain wellness just 30 minutes from vibrant downtown Taipei',
      'Triple-verified accommodations ensuring authentic in-room hot spring tubs'
    ]
  },

  // Japan - Hakone
  'hakone-japan': {
    intro: 'Hakone is Japan’s most celebrated onsen sanctuary, framed by cedar-forested valleys, Lake Ashi, and Mount Fuji. Stay in authentic luxury ryokans and modern onsen resorts featuring private outdoor rotenburo baths, natural thermal springs, and multi-course kaiseki banquets.',
    amenities: [
      'Private open-air rotenburo baths with direct views of forested valleys and Mount Fuji',
      'Natural mineral onsen spring water continuously flowing into fragrant hinoki wood tubs',
      'Traditional tatami guestrooms with private terrace cedarwood soaking baths',
      'Yukata robes, wooden geta sandals, and artisanal Japanese hot spring bath salts'
    ],
    whyChoose: [
      'Japan’s ultimate romantic hot spring haven, just 90 minutes from Tokyo',
      'Breathtaking scenery across Lake Ashi, Hakone Shrine torii gate, and alpine ropeways',
      'Sublime traditional hospitality (omotenashi) and exquisite private kaiseki dining',
      'Every private onsen bath suite verified across Booking.com and Agoda'
    ]
  },

  // Vietnam - Da Nang
  'da-nang-vietnam': {
    intro: 'Da Nang is Vietnam’s premier coastal playground, known for powdery My Khe beaches, the Marble Mountains, and proximity to historic Hoi An. Relax in beachfront resorts and clifftop villas featuring oversized terrazzo soaking tubs, ocean-view jacuzzis, and private plunge pools.',
    amenities: [
      'Oversized freestanding terrazzo and stone soaking tubs overlooking the East Sea',
      'Private oceanfront balcony jacuzzis with sweeping views of the Son Tra Peninsula',
      'Tropical outdoor garden bathtubs sheltered under lush frangipani palms',
      'Vietnamese lemongrass and lotus flower bath preparations with luxury spa linens'
    ],
    whyChoose: [
      'World-class beach resorts offering incredible luxury value for couples',
      'Golden Dragon Bridge, Ba Na Hills, and UNESCO-listed Hoi An Ancient Town minutes away',
      'Vibrant coastal culinary scene featuring fresh seafood and French-Vietnamese fusion',
      'Triple-verified bathtub guarantees on Booking.com and Agoda'
    ]
  },

  // Sri Lanka - Galle
  'galle-sri-lanka': {
    intro: 'Galle offers timeless colonial romance on Sri Lanka’s southern coast, anchored by the 17th-century UNESCO World Heritage Dutch Fort. Indulge in restored merchant mansions and oceanfront retreats featuring vintage roll-top clawfoot tubs, private plunge whirlpools, and Ayurvedic herbal baths.',
    amenities: [
      'Vintage roll-top clawfoot tubs inside restored Dutch colonial mansions',
      'Veranda-facing soaking tubs overlooking tropical spice gardens and Indian Ocean sunsets',
      'Ayurvedic herbal bath treatments prepared with Ceylon cinnamon and sandalwood oils',
      'High timber-beamed ceilings, four-poster canopy beds, and open-air rain showers'
    ],
    whyChoose: [
      'Atmospheric cobblestone alleys, boutique art galleries, and historic rampart walks',
      'Golden southern beaches of Unawatuna and Mirissa just minutes away for whale watching',
      'Tranquil tropical sanctuary blending European heritage with warm Sri Lankan hospitality',
      'Every bathtub suite independently confirmed on Booking.com and Agoda'
    ]
  },

  // Italy - Positano
  'positano-italy': {
    intro: 'Positano clings dramatically to the cliffside of the Amalfi Coast, offering Italy’s most intoxicating coastal romance. Stay in boutique cliffside retreats featuring private sea-view hot tubs, hand-painted Vietri ceramic bathtubs, and bougainvillea-draped terraces overlooking the azure Tyrrhenian Sea.',
    amenities: [
      'Private terrace hot tubs and jacuzzi suites suspended above Positano’s pastel cliffside',
      'Artisanal hand-painted Vietri ceramic soaking bathtubs with panoramic ocean views',
      'Amalfi lemon-infused organic bath salts and plush Italian cotton robes',
      'French doors opening directly to sun-drenched private balconies overlooking the beach'
    ],
    whyChoose: [
      'The crown jewel of romantic honeymoon escapes on the Amalfi Coast',
      'Unmatched panoramic sunset vistas over Sirenuse islands and sapphire waters',
      'Cliffside Michelin-starred dining, private wooden boat charters, and Path of the Gods hiking',
      'Every bathtub suite independently confirmed on Booking.com and Agoda'
    ]
  },

  // France - Nice
  'nice-france': {
    intro: 'Nice embodies the timeless glamour and Belle Époque elegance of the French Riviera. Discover historic seafront palaces and design hotels along the Promenade des Anglais featuring deep marble soaking bathtubs, private jacuzzis, and sweeping views of the Baie des Anges.',
    amenities: [
      'Deep freestanding marble soaking bathtubs overlooking the Mediterranean Sea',
      'Private penthouse jacuzzi suites with views of Castle Hill and Promenade des Anglais',
      'Artisanal Provençal lavender and citrus bath oils with luxury French bath amenities',
      'Belle Époque high ceilings, ornate chandeliers, and private sea-facing balconies'
    ],
    whyChoose: [
      'The vibrant cultural and culinary capital of the French Riviera',
      'Stroll the sunlit Promenade des Anglais, vibrant flower markets, and Old Nice alleys',
      'Perfect luxury base for exploring Monaco, Cannes, and perched medieval villages like Èze',
      'Triple-verified accommodations guaranteeing genuine in-room bathtubs'
    ]
  },

  // Croatia - Dubrovnik
  'dubrovnik-croatia': {
    intro: 'Dubrovnik, the Pearl of the Adriatic, combines ancient stone city walls with turquoise Mediterranean sea splendor. Relax in five-star coastal hideaways featuring cliffside infinity hot tubs, deep designer bathtubs, and private terraces overlooking the Adriatic and Lokrum Island.',
    amenities: [
      'Cliff-edge hot tubs and private whirlpool suites overlooking the sparkling Adriatic Sea',
      'Oversized designer soaking tubs framed by floor-to-ceiling sea-view windows',
      'Dalmatian botanical bath preparations infused with local rosemary and sea salt',
      'Private terraces offering unobstructed vistas of the historic Dubrovnik Old Town walls'
    ],
    whyChoose: [
      'UNESCO World Heritage medieval majesty paired with pristine crystal-clear waters',
      'Stroll centuries-old marble streets, ancient city ramparts, and secluded cliffside bars',
      'Private yacht day trips to the unspoiled Elaphiti Islands directly from hotel piers',
      'Every bathtub suite independently verified on Booking.com and Agoda'
    ]
  },

  // Morocco - Marrakech
  'marrakech-morocco': {
    intro: 'Marrakech enchants with sensory splendor, vibrant souks, and hidden palace sanctuaries. Experience historic riads and luxury palace hotels featuring hand-crafted zellij tile plunge bathtubs, heated courtyard jacuzzis, and scented rosewater baths beneath palm-shaded skies.',
    amenities: [
      'Sunken hand-carved marble and zellij mosaic plunge bathtubs in intimate riad courtyards',
      'Private rooftop jacuzzis with sweeping views of the Atlas Mountains and Koutoubia Mosque',
      'Authentic Moroccan hammam bath rituals prepared with black soap, eucalyptus, and organic argan oil',
      'Candlelit bath setups strewn with fragrant red rose petals and brass lantern illumination'
    ],
    whyChoose: [
      'Ultimate exotic couple retreat blending Berber traditions with palatial luxury',
      'Tranquil private courtyard oases hidden within the bustling UNESCO-listed Medina',
      'Exquisite Moroccan gastronomy, private desert excursions, and world-class spa pampering',
      'Guaranteed private in-room soaking tubs verified across Booking.com and Agoda'
    ]
  },

  // Tanzania - Zanzibar
  'zanzibar-tanzania': {
    intro: 'Zanzibar is the legendary spice island of the Indian Ocean, famous for powder-white sands, coral reefs, and turquoise lagoons. Indulge in barefoot luxury villas featuring oceanfront wooden hot tubs, sunken terrazzo baths, and open-air soaking tubs beneath swaying coconut palms.',
    amenities: [
      'Open-air freestanding terrazzo bathtubs nestled within private tropical beach gardens',
      'Oceanfront wooden deck hot tubs with direct panoramic Indian Ocean sunset views',
      'Zanzibari spice-infused bath preparations with wild vanilla, clove, and organic coconut milk',
      'Thatched-roof luxury suites with private plunge pools, outdoor showers, and ocean breezes'
    ],
    whyChoose: [
      'One of the world’s most pristine and romantic tropical beach honeymoon destinations',
      'Incredible marine biodiversity for snorkeling, dhow sunset cruises, and dolphin safaris',
      'Historic Stone Town UNESCO romance balanced with private island tranquility',
      'Every bathtub listing independently verified across Booking.com and Agoda'
    ]
  },

  // Chile - Santiago
  'santiago-chile': {
    intro: 'Santiago blends cosmopolitan sophistication with breathtaking backdrops of the snow-capped Andes Mountains. Stay in boutique design hotels and five-star high-rises in Vitacura and Lastarria featuring rooftop whirlpool tubs, deep marble soaking baths, and Chilean vinotherapy bath soaks.',
    amenities: [
      'Panoramic picture-window bathtubs with soaring views of the snow-capped Andes',
      'Private rooftop terrace jacuzzi suites overlooking the illuminated Santiago skyline',
      'Artisanal Chilean red wine and grape-seed antioxidant bath extracts with organic salts',
      'Spacious marble bathrooms with separate walk-in rain showers and designer amenities'
    ],
    whyChoose: [
      'Gateway to Chile’s celebrated Maipo Valley wineries, Andes ski resorts, and coastal Valparaíso',
      'Vibrant culinary scene with world-ranked restaurants and sophisticated rooftop nightlife',
      'Year-round mountain views paired with luxury urban design hospitality',
      'Every bathtub listing independently verified on Booking.com and Agoda'
    ]
  },

  // Argentina - Bariloche
  'bariloche-argentina': {
    intro: 'San Carlos de Bariloche, nestled in the heart of Argentine Patagonia, is the romantic alpine jewel of South America. Unwind in lakeside luxury lodges and mountain chalets featuring private cedarwood hot tubs, bubbling hydrotherapy tubs, and sweeping views of Lake Nahuel Huapi.',
    amenities: [
      'Heated outdoor cedarwood hot tubs overlooking Lake Nahuel Huapi and the Patagonian Andes',
      'Deep freestanding soaking bathtubs positioned beside wood-burning fireplaces',
      'Patagonian rosehip (rosa mosqueta) and lavender bath infusions with luxury wool robes',
      'Private wooden balconies framing alpine pine forests and snow-dusted peaks'
    ],
    whyChoose: [
      'The "Switzerland of South America" — ultimate Patagonian honeymoon and winter romance',
      'Artisanal chocolate shops, Swiss-style fondues, and world-class craft breweries',
      'Sailing on glacial lakes, alpine hiking, and snow sports at Cerro Catedral',
      'Guaranteed private in-room bathtubs verified across Booking.com and Agoda'
    ]
  },

  // Argentina - Mendoza
  'mendoza-argentina': {
    intro: 'Mendoza is the world capital of Malbec, cradled beneath the towering peaks of the High Andes. Experience private vineyard villas and luxury wine lodges featuring outdoor soaking tubs overlooking rows of vines, Malbec vinotherapy spa baths, and private mountain-view pools.',
    amenities: [
      'Private vineyard-facing outdoor soaking tubs surrounded by lush Malbec vines',
      'Antioxidant-rich vinotherapy grape-extract bath rituals with Mendoza thermal salts',
      'Freestanding designer bathtubs with direct, unobstructed views of Mount Aconcagua foothills',
      'Private sun decks, outdoor fireplaces, and plunge pools connected to master bath suites'
    ],
    whyChoose: [
      'South America’s premier wine and gastronomy destination for couples',
      'Exclusive boutique vineyard fincas in the Uco Valley and Luján de Cuyo',
      'Horseback rides through vineyards at sunset paired with world-class cellar dining',
      'Every bathtub suite independently confirmed on Booking.com and Agoda'
    ]
  },

  // Peru - Cusco
  'cusco-peru': {
    intro: 'Cusco, the historic capital of the Inca Empire, is a city of timeless Andean mystique and colonial charm. Stay in converted 16th-century monasteries and boutique heritage palaces featuring hand-carved stone bathtubs, private heated courtyard jacuzzis, and oxygen-enriched spa suites.',
    amenities: [
      'Hand-carved Andean stone and marble soaking bathtubs in historic colonial courtyards',
      'Oxygen-enriched luxury suites with heated whirlpool tubs for ultimate high-altitude comfort',
      'Sacred Valley herbal bath preparations with Andean muña mint, eucalyptus, and pink Maras salt',
      'Original Inca stone walls, Spanish colonial frescoes, and antique brass fixtures'
    ],
    whyChoose: [
      'UNESCO World Heritage cultural sanctuary and direct gateway to Machu Picchu',
      'Incomparable atmospheric romance of cobblestone alleys and ancient Inca stonework',
      'World-renowned Novoandina gastronomy and authentic Peruvian hospitality',
      'Triple-verified accommodations ensuring genuine in-room soaking tubs'
    ]
  },

  // Colombia - Cartagena
  'cartagena-colombia': {
    intro: 'Cartagena de Indias is the jewel of the Colombian Caribbean, wrapped in 400-year-old stone walls, bougainvillea balconies, and tropical romance. Experience restored 17th-century colonial mansions featuring private rooftop jacuzzis, open-air garden tubs, and Caribbean sea-breeze spa suites.',
    amenities: [
      'Private rooftop jacuzzi pools and soaking tubs overlooking historic church domes and the Caribbean Sea',
      'Open-air tropical courtyard bathtubs surrounded by lush palms and coral stone walls',
      'Colombian organic coffee and cacao body scrubs with artisanal coconut bath oils',
      'High timber-beamed ceilings, colonial shuttered windows, and private sunset verandas'
    ],
    whyChoose: [
      'One of the world’s most enchanting and vibrant colonial walled cities for couples',
      'Sensory delight of horse-drawn carriages, salsa clubs, and world-class Caribbean dining',
      'Day trips to the pristine coral reefs and turquoise waters of the Rosario Islands',
      'Every bathtub listing independently confirmed on Booking.com and Agoda'
    ]
  },

  // Switzerland - Interlaken
  'interlaken-switzerland': {
    intro: 'Interlaken sits majestically between the turquoise waters of Lake Thun and Lake Brienz, framed by the towering peaks of the Eiger, Mönch, and Jungfrau. Stay in alpine grand hotels and mountain chalets featuring cedarwood outdoor hot tubs, private whirlpool suites, and glacier-view soaking bathtubs.',
    amenities: [
      'Panoramic glacier-view soaking tubs overlooking the Jungfrau massif and alpine lakes',
      'Private balcony jacuzzis framed by turquoise waters and snow-dusted Swiss peaks',
      'Swiss alpine pine (Arve) and mountain chamomile bath preparations with heated robes',
      'En-suite Swiss stone saunas paired with deep hydrotherapy bubbling baths'
    ],
    whyChoose: [
      'Europe’s premier alpine adventure and luxury wellness haven for couples',
      'Gateway to Jungfraujoch "Top of Europe", Grindelwald, and scenic mountain railways',
      'Pristine crystal-clear glacial air and peaceful lakeside walking promenades',
      'Every bathtub listing independently confirmed on Booking.com and Agoda'
    ]
  },

  // Switzerland - Lucerne
  'lucerne-switzerland': {
    intro: 'Lucerne is the romantic heart of central Switzerland, where medieval covered bridges and preserved towers overlook Lake Lucerne and Mount Pilatus. Experience historic Belle Époque lakefront palaces featuring freestanding marble tubs, private jacuzzis, and sweeping lake-and-mountain vistas.',
    amenities: [
      'Freestanding Italian marble soaking tubs positioned beside panoramic lake-view picture windows',
      'Private rooftop penthouse jacuzzis with sweeping views of Mount Pilatus and Mount Rigi',
      'Artisanal Swiss herbal bath oils infused with edelweiss and alpine meadow florals',
      'Belle Époque high ceilings, ornate chandeliers, and private balconies over Lake Lucerne'
    ],
    whyChoose: [
      'Picture-postcard Swiss romantic destination centered on the historic Chapel Bridge',
      'Paddle steamer cruises across Lake Lucerne and scenic cogwheel train excursions',
      'World-class luxury watch boutiques, Michelin-starred dining, and serene lakefront walks',
      'Triple-verified accommodations ensuring authentic in-room soaking tubs'
    ]
  },

  // Austria - Innsbruck
  'innsbruck-austria': {
    intro: 'Innsbruck, the imperial capital of the Austrian Tyrol, is dramatically encircled by the towering jagged peaks of the Nordkette range. Relax in boutique alpine hotels and ski lodges featuring traditional Tyrolean wooden hot tubs, private whirlpool suites, and fireside soaking baths.',
    amenities: [
      'Tyrolean stone pine (Zirbe) wood soaking tubs with natural aromatic resins',
      'Panoramic floor-to-ceiling window bathtubs framing the towering Nordkette mountain range',
      'Private terrace hot tubs perfect for post-ski mountain stargazing',
      'Organic Tyrolean alpine herb and mountain arnica bath salts with plush wool throws'
    ],
    whyChoose: [
      'Unique fusion of imperial Habsburg history and high-altitude alpine ski culture',
      'Funicular designed by Zaha Hadid ascending from the historic imperial center straight into the mountains',
      'Cozy Tyrolean culinary warmth, strudels, and romantic winter Christmas markets',
      'Guaranteed private in-room bathtubs verified across Booking.com and Agoda'
    ]
  },

  // Poland - Krakow
  'krakow-poland': {
    intro: 'Krakow, the ancient royal capital of Poland, weaves gothic grandeur, cobblestone charm, and romantic medieval lore. Discover boutique heritage hotels and restored merchant palaces in the Old Town and Kazimierz featuring vintage freestanding clawfoot tubs, deep marble baths, and heated courtyard spa suites.',
    amenities: [
      'Vintage freestanding roll-top clawfoot tubs inside restored Renaissance merchant palaces',
      'Deep Italian marble bathtubs paired with walk-in rainfall showers and heated stone floors',
      'Artisanal Polish linden blossom honey and beeswax bath infusions with luxury spa amenities',
      'Historic vaulted brick ceilings, original 16th-century wooden beams, and candlelit ambiance'
    ],
    whyChoose: [
      'One of Europe’s best-preserved and most affordable UNESCO World Heritage romantic cities',
      'Enchanting cobblestone carriage rides around Rynek Główny (Europe’s largest medieval square)',
      'Rich bohemian café culture, hidden cellar wine bars, and thriving culinary creativity',
      'Every bathtub suite independently confirmed on Booking.com and Agoda'
    ]
  },

  // Poland - Zakopane
  'zakopane-poland': {
    intro: 'Zakopane is Poland’s winter wonderland, nestled at the foot of the dramatic granite peaks of the Tatra Mountains. Unwind in authentic Goral highlander timber chalets and luxury mountain lodges featuring outdoor cedarwood hot tubs, geothermal mineral pools, and fireside whirlpool suites.',
    amenities: [
      'Heated outdoor cedarwood hot tubs surrounded by snow-covered spruce forests and Tatra peaks',
      'Private in-chalet hydrotherapy whirlpool baths beside roaring stone fireplaces',
      'Thermal mineral bath soaks infused with native Tatra pine, spruce, and mountain juniper',
      'Hand-carved wooden interiors reflecting authentic Zakopane alpine architectural heritage'
    ],
    whyChoose: [
      'Poland’s premier mountain romance destination for winter snowscapes and summer hiking',
      'Thermal bath culture fed by natural geothermal subterranean springs across Podhale',
      'Vibrant highlander folklore, traditional grilled oscypek cheese, and fireside evenings',
      'Triple-verified room tiers ensuring authentic in-room or private terrace hot tubs'
    ]
  },

  // Slovenia - Bled
  'bled-slovenia': {
    intro: 'Lake Bled is a real-life fairytale nestled in the Julian Alps, featuring a cliff-perched medieval castle and an emerald lake surrounding a romantic church island. Indulge in boutique lakeside villas and eco-luxury resorts boasting private geothermal spring hot tubs, wooden tubs, and castle-view balconies.',
    amenities: [
      'Private terrace hot tubs and jacuzzi suites framing the iconic island church and Bled Castle',
      'Natural geothermal spring water piped directly into deep wooden soaking bathtubs',
      'Slovenian wild alpine blossom and raw organic forest honey bath rituals',
      'Panoramic glass suites with unobstructed vistas of the emerald waters and Julian Alps'
    ],
    whyChoose: [
      'Widely regarded as one of the most romantic and photogenic lake destinations on Earth',
      'Traditional wooden pletna boat rides to the island to ring the wishing bell with your partner',
      'Tranquil Julian Alps walking trails, Vintgar Gorge, and world-famous Bled cream cake',
      'Every bathtub listing independently verified across Booking.com and Agoda'
    ]
  },

  // Qatar - Doha
  'doha-qatar': {
    intro: 'Doha stands as the pinnacle of modern Arabian luxury, where futuristic West Bay skyscrapers meet the tranquil waters of the Arabian Gulf. Discover opulent five-star hotel towers and palatial island resorts in The Pearl-Qatar offering expansive marble bathrooms, skyline-view deep soaking bathtubs, and romantic jacuzzi suites.',
    amenities: [
      'Oversized freestanding Italian marble soaking bathtubs with panoramic views of the Doha Corniche and West Bay skyline',
      'Private jacuzzi suites and plunge pools in beachfront palatial villas on The Pearl-Qatar and Banana Island',
      'Artisanal Arabian bath amenities infused with oud, amber, and damask rose water',
      'Floor-to-ceiling glass bathroom suites with motorized privacy blinds and chromotherapy mood lighting'
    ],
    whyChoose: [
      'World-class luxury hospitality standards with personalized 24-hour butler service',
      'Iconic architectural marvels including the Museum of Islamic Art and National Museum of Qatar',
      'Vibrant evening strolls through fragrant alleys of Souq Waqif and fine dining at Michelin-caliber venues',
      '100% verified private in-room bathtubs cross-checked across Booking.com and Agoda'
    ]
  },

  // Oman - Muscat
  'muscat-oman': {
    intro: 'Muscat delivers timeless Arabian elegance nestled between the rugged Al Hajar mountains and the Gulf of Oman. Unwind in beachfront sanctuaries and whitewashed palaces featuring sunken terrazzo bathtubs, private garden jacuzzis, and deep soaking tubs framed by dramatic coastal mountains.',
    amenities: [
      'Hand-carved Omani marble bathtubs and sunken terrazzo soaking tubs overlooking private gulf beaches',
      'Secluded garden jacuzzi suites surrounded by swaying date palms and traditional water courtyards',
      'Luxury bath infusions enriched with authentic Royal Green Hojari frankincense and coastal sea salts',
      'Private villa plunge pools and candlelit open-air soaking terraces'
    ],
    whyChoose: [
      'Pure romantic tranquility away from high-rise crowds with authentic low-rise Arabian architecture',
      'Sunset dhow cruises along dramatic mountain fjords to spot playful Arabian Sea dolphins',
      'Rich cultural explorations through the Sultan Qaboos Grand Mosque and the historic Mutrah Souq',
      'Every bathtub listing independently audited for guaranteed private in-room amenities'
    ]
  },

  // Oman - Jabal Akhdar
  'jabal-akhdar-oman': {
    intro: 'Jabal Akhdar—Oman\'s fabled "Green Mountain"—rises over 2,000 meters above sea level to offer one of the most breathtaking mountain escapes on the planet. Indulge in world-renowned cliff-edge luxury resorts boasting canyon-hanging infinity tubs, heated outdoor jacuzzis, and deep stone soaking baths with vertigo-inducing canyon vistas.',
    amenities: [
      'Dramatic canyon-edge standalone soaking bathtubs perched above 1,000-meter deep gorges',
      'Private heated terrace hot tubs and jacuzzi villas looking across terraced pomegranate orchards',
      'Locally distilled Damask rose water bath rituals and mountain herb bath salts',
      'Indoor fireplace-side soaking tubs for crisp, cool mountain evenings under star-studded skies'
    ],
    whyChoose: [
      'Unrivaled canyon vistas providing one of the most unique luxury honeymoon settings in the world',
      'Pleasantly cool mountain temperatures year-round, ideal for outdoor soaking and canyon hikes',
      'Intimate secluded retreats like Alila Jabal Akhdar and Anantara Diana’s Point cliff resorts',
      'Every room category verified for authentic private bathtubs and private hot tubs'
    ]
  },

  // Bahrain - Manama
  'manama-bahrain': {
    intro: 'Manama blends island cosmopolitan flair with ancient pearling heritage along the Arabian Gulf. Experience premier five-star urban sanctuaries and private island resorts across Bahrain Bay and Reef Island, showcasing panoramic sea-view soaking tubs, couple\'s jacuzzi suites, and lavish marble spa bathrooms.',
    amenities: [
      'Deep freestanding oval bathtubs positioned beside floor-to-ceiling windows overlooking Bahrain Bay',
      'Private terrace jacuzzis and overwater villa dipping tubs on private lagoon islands',
      'Nourishing pearl-infused mineral bath rituals celebrating Bahrain\'s historic pearl diving legacy',
      'Double rain showers and twin vanities with designer French toiletries'
    ],
    whyChoose: [
      'Private island resorts just minutes from the vibrant dining hubs of Block 338 in Adliya',
      'Spectacular sunset views over the turquoise waters of the Arabian Gulf and modern skyline',
      'UNESCO-listed pearling pathways, Qal\'at al-Bahrain fortress, and luxury boutique shopping',
      'Triple-verified across Booking.com and Agoda for guaranteed in-room bathtub amenities'
    ]
  },

  // Jordan - Dead Sea
  'dead-sea-jordan': {
    intro: 'The Dead Sea in Jordan is Earth\'s lowest elevation point (-430 meters) and one of the world\'s most renowned natural wellness sanctuaries. Pamper yourself in luxury oceanfront spa resorts featuring private mineral hydrotherapy bathtubs, heated balcony jacuzzis, and soaking suites with endless sunset views over the tranquil hypersaline sea.',
    amenities: [
      'Private sea-facing soaking bathtubs and heated terrace jacuzzi tubs overlooking the mystical waters',
      'Mineral-rich Dead Sea salt crystals and raw therapeutic black mud treatments in-suite',
      'Direct private beach access with mineral flotation coves and freshwater infinity plunge pools',
      'Spacious marble bathrooms designed for post-float therapeutic hydrotherapy soaks'
    ],
    whyChoose: [
      'A one-of-a-kind global bucket-list experience of effortless zero-gravity floating and natural mineral healing',
      'Unmatched golden hour sunsets casting crimson reflections across the tranquil water toward the Judean hills',
      'Convenient base for day trips to Mount Nebo, Madaba mosaics, and the ancient rose-red city of Petra',
      'All bathtub listings verified across major booking portals for private in-room installations'
    ]
  },

  // Saudi Arabia - AlUla
  'alula-saudi-arabia': {
    intro: 'AlUla is an extraordinary open-air living museum carved into the ochre sandstone canyons of the Ashar Valley. Discover ultra-luxury desert tented villas and canyon resorts offering rock-hewn outdoor bathtubs, private sunken pool terraces, and starlit open-sky soaking amidst towering 200,000-year-old rock formations.',
    amenities: [
      'Dramatic open-air stone bathtubs carved into sandstone terraces beneath billion-star desert skies',
      'Private heated villa plunge pools with integrated jacuzzi jets facing sheer canyon cliffs',
      'Artisanal desert botanical bath oils infused with native Arabian moringa, frankincense, and date palm extracts',
      'Fire pit lounges adjacent to freestanding deep soaking tubs for magical cool desert nights'
    ],
    whyChoose: [
      'One of the most exclusive and evocative luxury travel destinations newly open to global travelers',
      'Seamless access to Hegra (Saudi Arabia\'s first UNESCO World Heritage site) and the Maraya mirrored hall',
      'Complete serenity, absolute seclusion, and world-class luxury eco-hospitality (Banyan Tree, Habitas)',
      '100% verified private in-room and outdoor bathtub amenities'
    ]
  },

  // Philippines - El Nido
  'el-nido-philippines': {
    intro: 'El Nido on the northern tip of Palawan is a world-renowned tropical paradise of soaring karst limestone monoliths, hidden lagoons, and crystal-clear waters in Bacuit Bay. Unwind in exclusive eco-luxury island resorts and cliffside villas boasting private open-air stone soaking tubs, panoramic oceanfront jacuzzi suites, and sunset viewing terraces.',
    amenities: [
      'Private clifftop and beachfront freestanding soaking bathtubs framing dramatic views of Bacuit Bay\'s limestone karst cliffs',
      'Open-air garden jacuzzi tubs surrounded by lush tropical orchids and swaying coconut palms',
      'Artisanal organic virgin coconut oil and wild sea-salt bath infusions sourced locally in Palawan',
      'Private plunge pool and soaking bath combos with direct overwater access to turquoise coral reefs'
    ],
    whyChoose: [
      'Voted among the most visually breathtaking and romantic island archipelagos on Earth',
      'Effortless access to private catamarans touring the Big Lagoon, Secret Beach, and Snake Island',
      'Intimate eco-luxury resorts offering private candlelit beach dinners and stargazing over the Sulu Sea',
      'Every hotel listing independently verified for authentic in-room and private villa bathtub amenities'
    ]
  },

  // Philippines - Boracay
  'boracay-philippines': {
    intro: 'Boracay is legendary for its 4-kilometer powdery White Beach, azure shallow waters, and vibrant island energy. Discover premier luxury beachfront resorts and secluded clifftop sanctuaries in Station 1 and Punta Bunga Beach offering oversized marble soaking bathtubs, private sunset balcony whirlpools, and lavish spa suites.',
    amenities: [
      'Deep freestanding Italian marble bathtubs positioned against floor-to-ceiling windows overlooking White Beach',
      'Private ocean-view balcony jacuzzi suites with uninterrupted vistas of Boracay’s iconic fiery sunsets',
      'Aromatherapy bath rituals featuring native Philippine ylang-ylang, sampaguita blossom, and sweet orange oils',
      'Spacious master bathroom retreats with double rain showers and luxury botanical toiletries'
    ],
    whyChoose: [
      'World-famous powder-soft white sand that stays pleasantly cool under the tropical midday sun',
      'Romantic sunset paraw sailing cruises, beachfront candlelight dining, and vibrant nightlife',
      'Five-star hospitality retreats like Shangri-La Boracay and Discovery Shores delivering tailored butler service',
      'Triple-verified across Booking.com and Agoda to ensure guaranteed private in-room tubs'
    ]
  },

  // Cambodia - Siem Reap
  'siem-reap-cambodia': {
    intro: 'Siem Reap serves as the mystical cultural gateway to the majestic temples of Angkor Wat and the ancient Khmer civilization. Rejuvenate after days of temple exploration in serene colonial heritage resorts and boutique sanctuary villas featuring hand-carved stone soaking bathtubs, private lotus courtyard plunge pools, and open-air rain gardens.',
    amenities: [
      'Hand-carved artisanal sandstone soaking bathtubs inspired by ancient Angkorian temple architecture',
      'Private villa lotus garden jacuzzi suites and outdoor sunken marble baths surrounded by tropical frangipani',
      'Traditional Khmer botanical bath infusions made with fresh lemongrass, kaffir lime, and turmeric root',
      'Candlelit evening bath setups with floating lotus petals and calming jasmine incense'
    ],
    whyChoose: [
      'Unmatched romantic cultural setting combining UNESCO World Heritage exploration with ultra-luxe spa relaxation',
      'Sunrise temple expeditions to Angkor Wat and Ta Prohm followed by soothing afternoon spa hydrotherapy soaks',
      'Peaceful oasis retreats set amidst lush jungle gardens just minutes from vibrant French Quarter dining',
      'All listings verified across major booking portals for private in-room and courtyard bathtub fixtures'
    ]
  },

  // Laos - Luang Prabang
  'luang-prabang-laos': {
    intro: 'Luang Prabang, the UNESCO World Heritage jewel of Laos, is an enchanting royal haven where French colonial elegance seamlessly blends with golden Buddhist temples along the Mekong and Nam Khan rivers. Immerse yourself in restored French-Indochinese boutique hotels boasting vintage clawfoot roll-top tubs, teakwood veranda bathtubs, and open-air river-view jacuzzi suites.',
    amenities: [
      'Classic French-Indochinese freestanding clawfoot soaking tubs set on private polished teakwood verandas',
      'Secluded garden jacuzzi suites and outdoor river-facing stone tubs overlooking the misty Mekong River',
      'Organic botanical bath rituals utilizing highland Lao herbs, mountain lemongrass, and wild forest honey',
      'Panoramic French double doors opening from luxurious marble bathrooms to tropical garden terraces'
    ],
    whyChoose: [
      'One of Southeast Asia\'s most tranquil and soul-soothing romantic destinations with preserved historic charm',
      'Participate in the sacred dawn alms-giving ceremony and explore the multi-tiered turquoise cascades of Kuang Si Falls',
      'Idyllic sunset longtail boat cruises along the Mekong River with French wines and traditional Lao cuisine',
      'Every bathtub property independently audited to guarantee private in-room soaking amenities'
    ]
  },

  // Nepal - Pokhara
  'pokhara-nepal': {
    intro: 'Pokhara is Nepal\'s premier romantic mountain escape, set along the tranquil shores of Phewa Lake beneath the awe-inspiring snow-capped Annapurna Massif and Mount Machapuchare (Fishtail). Indulge in boutique lakeside resorts and cliffside mountain lodges featuring deep soaking bathtubs, private panoramic balcony hot tubs, and heated Himalayan jacuzzi suites.',
    amenities: [
      'Panoramic picture-window soaking bathtubs framing unobstructed reflections of the snow-peaked Annapurna Range',
      'Private heated balcony jacuzzi tubs overlooking the peaceful emerald waters of Phewa Lake',
      'Therapeutic Himalayan pink rock salt scrubs and wild high-altitude herbal bath infusions',
      'Cozy fireplace-side deep bathtubs ideal for warming up after crisp Himalayan mountain mornings'
    ],
    whyChoose: [
      'Spectacular Himalayan mountain scenery creating an unforgettable backdrop for romantic staycations and honeymoons',
      'Tranquil wooden boat excursions across Phewa Lake and breathtaking sunrise viewpoints from Sarangkot hill',
      'Gateway to scenic mountain trails, world-class paragliding, and rejuvenating Ayurvedic wellness centers',
      '100% verified private in-room bathtubs and jacuzzi suites cross-checked across Booking.com and Agoda'
    ]
  },

  // Estonia - Tallinn
  'tallinn-estonia': {
    intro: 'Tallinn is Northern Europe\'s best-preserved medieval fairy tale, where cobblestone alleys, Gothic church spires, and modern Nordic design converge. Discover romantic boutique heritage hotels and luxury design sanctuaries within Tallinn Old Town and the trendy Noblessner seafront, boasting deep freestanding clawfoot tubs, private Nordic sauna suites, and stone jacuzzi bathrooms.',
    amenities: [
      'Deep roll-top freestanding clawfoot soaking tubs positioned by exposed medieval limestone walls and chimney alcoves',
      'Private en-suite Nordic sauna rooms paired with cold plunge tubs and whirlpool jacuzzis',
      'Artisanal Estonian botanical bath salts infused with native juniper berry, birch leaves, and wild forest heather',
      'Modern glass-walled bathroom suites overlooking the terracotta rooftops of Old Town and the Baltic Sea'
    ],
    whyChoose: [
      'UNESCO World Heritage medieval Old Town offering unmatched fairy-tale romantic ambiance year-round',
      'Seamless fusion of ancient Hanseatic heritage and cutting-edge Nordic spa culture',
      'Enchanting snow-covered winter markets, cozy cellar restaurants, and vibrant summer white nights',
      'Triple-verified across Booking.com and Agoda to ensure guaranteed private in-room bathtubs'
    ]
  },

  // Latvia - Riga
  'riga-latvia': {
    intro: 'Riga is the Baltic pearl celebrated for the world\'s finest concentration of Art Nouveau architecture, medieval cobblestone charm, and tranquil Daugava riverfronts. Experience opulent five-star grand hotels and restored Art Nouveau mansions featuring lavish marble bathrooms, deep oval soaking tubs, and couple\'s whirlpool jacuzzi suites.',
    amenities: [
      'Oversized freestanding oval marble bathtubs framed by restored Art Nouveau stained glass windows',
      'Private terrace jacuzzis and penthouse whirlpool baths with views of Riga Cathedral spires and the Daugava River',
      'Nourishing Baltic amber powder scrubs and pine needle bath rituals rooted in ancient Latvian healing traditions',
      'Spacious bathroom retreats equipped with heated marble flooring, double vanities, and French spa essentials'
    ],
    whyChoose: [
      'Stunning architectural elegance with hundreds of ornate Art Nouveau facades and romantic boulevards',
      'Serene canal boat rides through Bastejkalna park and evening strolls across the historic Dome Square',
      'Affordable European luxury with world-class classical opera, vibrant culinary scene, and boutique stays',
      'Every hotel listing independently verified for authentic in-room bathtub amenities'
    ]
  },

  // Lithuania - Vilnius
  'vilnius-lithuania': {
    intro: 'Vilnius captivates with its sprawling Baroque Old Town, winding cobbled lanes, and the whimsical bohemian spirit of the Republic of Užupis. Unwind in historic 16th-century monastery conversions and boutique design hotels featuring vintage cast-iron roll-top bathtubs, private courtyard jacuzzi suites, and heated stone soaking baths.',
    amenities: [
      'Classic freestanding cast-iron soaking bathtubs set under authentic vaulted brick ceilings',
      'Private whirlpool spa suites with secluded courtyard views in the heart of Vilnius Old Town',
      'Organic Lithuanian wildflower honey and linden blossom bath preparations',
      'Cozy bathroom fireplaces and heated travertine floors for romantic Baltic autumn and winter nights'
    ],
    whyChoose: [
      'One of Europe’s largest and most enchanting Baroque Old Towns, protected as a UNESCO World Heritage site',
      'Bohemian artist enclave of Užupis with art galleries, riverside cafes, and secret courtyard gardens',
      'Panoramic sunset views from Gediminas Castle Tower and the Hill of Three Crosses',
      '100% verified private in-room bathtubs cross-checked across Booking.com and Agoda'
    ]
  },

  // Georgia - Tbilisi
  'tbilisi-georgia': {
    intro: 'Tbilisi is an evocative crossroads of European and Asian traditions, world-famous for its ancient sulfur bathhouses in Abanotubani nestled beneath Narikala Fortress. Indulge in designer boutique hotels and restored heritage mansions featuring private natural sulfur hydrotherapy tubs, carved wooden balcony soaking baths, and panoramic city-view jacuzzis.',
    amenities: [
      'Private in-room natural thermal sulfur soaking baths and deep stone hydrotherapy tubs',
      'Freestanding bathtubs set upon traditional carved wooden balconies overlooking the dramatic Mtkvari river gorge',
      'Unique Georgian wine bath rituals featuring antioxidant-rich Saperavi grape seed extracts and Kakhetian honey',
      'Artisanal eucalyptus and mountain herb bath preparations inspired by ancient Silk Road thermal rituals'
    ],
    whyChoose: [
      'Centuries-old sulfur thermal bath culture providing an extraordinary wellness experience found nowhere else',
      'Legendary Georgian hospitality, world-renowned natural wine traditions, and unforgettable supra dining feasts',
      'Romantic cable car rides up to Narikala Fortress and vibrant nighttime strolls along cobblestone Shardeni Street',
      'Every bathtub listing independently verified across Booking.com and Agoda'
    ]
  },

  // Azerbaijan - Baku
  'baku-azerbaijan': {
    intro: 'Baku, the glamorous City of Winds along the Caspian Sea, dazzles where futuristic skyline icons like the Flame Towers rise above the ancient sandstone labyrinth of Icherisheher (Old City). Stay in world-class five-star towers and boutique palace retreats boasting floor-to-ceiling panoramic Caspian Sea bathtubs, couple\'s jacuzzi suites, and lavish marble bathrooms.',
    amenities: [
      'Floor-to-ceiling glass-walled soaking bathtubs with direct vistas of the illuminated Flame Towers and Baku Bay',
      'Private terrace jacuzzis and penthouse whirlpool baths looking out across the sparkling Caspian Sea coastline',
      'Artisanal Caspian sea-salt scrubs and Persian saffron and pomegranate floral bath treatments',
      'Sumptuous Italian marble bathrooms with integrated mirror TVs, rainfall showers, and designer toiletries'
    ],
    whyChoose: [
      'Striking architectural juxtaposition of ancient Silk Road caravanserais and bold modernism (Zaha Hadid’s Heydar Aliyev Center)',
      'Breezy evening promenades along Baku Boulevard with seaside tea houses and luxury dining',
      'Unrivaled five-star luxury standards at exceptional value with panoramic penthouse views',
      'All listings verified across major booking channels for private in-room and suite bathtub installations'
    ]
  },

  // Cyprus - Paphos
  'paphos-cyprus': {
    intro: 'Paphos is the mythological birthplace of Aphrodite, the ancient Greek goddess of love and beauty, graced by year-round Mediterranean sunshine, ancient mosaics, and turquoise coastal waters. Discover premier beachfront resorts and cliffside boutique retreats featuring private sea-view plunge pools, deep freestanding marble soaking tubs, and sunset jacuzzi suites.',
    amenities: [
      'Freestanding Italian marble soaking bathtubs facing unobstructed Mediterranean Sea horizons',
      'Private terrace jacuzzi hot tubs and heated plunge pool suites overlooking Aphrodite’s Rock',
      'Botanical bath rituals infused with Cypriot extra virgin olive oil, wild coastal lavender, and sea salts',
      'Open-concept bathroom sanctuaries with double rain showers, chromotherapy lighting, and luxury European toiletries'
    ],
    whyChoose: [
      'The legendary Mediterranean island of romance, bathed in over 300 days of warm sunshine per year',
      'Effortless explorations of UNESCO World Heritage Kato Paphos mosaics and ancient Tombs of the Kings',
      'Idyllic sunset catamaran cruises around the Akamas Peninsula and Blue Lagoon',
      '100% verified in-room and terrace bathtub amenities cross-checked across Booking.com and Agoda'
    ]
  },

  // Malta - Valletta
  'valletta-malta': {
    intro: 'Valletta, the sun-kissed Baroque fortress capital built by the Knights of St. John, is a UNESCO World Heritage marvel of honey-hued limestone palaces and dramatic Grand Harbour sea views. Experience boutique luxury stays in restored 16th-century knight palazzos boasting vintage roll-top clawfoot tubs, private rooftop jacuzzi suites, and heated stone spa bathrooms.',
    amenities: [
      'Vintage roll-top clawfoot soaking bathtubs nestled beneath authentic Baroque limestone vaulted ceilings',
      'Private rooftop jacuzzi tubs overlooking the majestic battlements of the Grand Harbour and the Three Cities',
      'Therapeutic Mediterranean sea-salt infusions paired with native wild thyme and rosemary essential oils',
      'Elegant marble bathrooms complete with plush robes, towel warmers, and artisanal Maltese bath salts'
    ],
    whyChoose: [
      'One of the world\'s most concentrated and walkable historic open-air museum cities',
      'Romantic evening dgħajsa water taxi rides across the Grand Harbour and candlelit courtyard dining',
      'Proximity to St. John\'s Co-Cathedral, Caravaggio masterpieces, and the Upper Barrakka Gardens',
      'Every bathtub listing independently verified for authentic in-room soaking amenities'
    ]
  },

  // Tunisia - Sidi Bou Said
  'sidi-bou-said-tunisia': {
    intro: 'Sidi Bou Said is the iconic clifftop jewel of North Africa, famed for its brilliant cobalt blue doors, whitewashed bougainvillea-draped walls, and breathtaking views over the Gulf of Tunis. Unwind in authentic Arab-Andalusian palace hotels and luxury boutique riads featuring hand-painted ceramic mosaic plunge tubs, traditional private hammam steam rooms, and sea-facing soaking suites.',
    amenities: [
      'Deep mosaic-tiled plunge tubs and hand-carved marble bathtubs inspired by royal Andalusian palaces',
      'Private clifftop terrace jacuzzis framing sweeping vistas of the turquoise Mediterranean Sea',
      'Sensory Tunisian beauty rituals including organic orange blossom water, jasmine oils, and pure rhassoul clay',
      'Moorish archway bathrooms with brass fittings, candle niches, and heated marble seating benches'
    ],
    whyChoose: [
      'One of the Mediterranean\'s most photogenic and romantic artistic villages, beloved by painters and writers',
      'Sip fragrant pine nut mint tea at Café des Délices while watching fiery Mediterranean sunsets',
      'Minutes from the UNESCO-listed ancient ruins of Carthage and the vibrant artisan souqs of Tunis',
      'Triple-verified across Booking.com and Agoda to ensure guaranteed private in-room bathtubs'
    ]
  },

  // Egypt - Aswan
  'aswan-egypt': {
    intro: 'Aswan is Egypt\'s most serene and soul-stirring Nile sanctuary, where ancient golden sand dunes meet the tranquil waters of the Nile amidst granite boulders and lush palm islands. Indulge in timeless historic palace hotels—including the legendary Old Cataract where Agatha Christie penned her masterpieces—offering freestanding clawfoot bathtubs, private Nile-view jacuzzi balconies, and regal spa suites.',
    amenities: [
      'Freestanding Victorian roll-top soaking tubs positioned for panoramic sunset views across the Nile River',
      'Private riverfront balcony jacuzzi tubs watching traditional white-sailed feluccas glide past Elephantine Island',
      'Signature Egyptian Cleopatra bath rituals infused with warm milk, wild desert honey, and blue lotus oil',
      'Grand palatial bathrooms featuring antique brass fixtures, chandeliers, and luxury French spa products'
    ],
    whyChoose: [
      'A timeless, poetic romantic escape steeped in ancient Egyptian history and Old World colonial glamour',
      'Private sunset felucca sailing journeys around the botanical gardens of Kitchener’s Island and Philae Temple',
      'Peaceful Nubian warmth, world-class riverfront high tea, and unforgettable desert tranquility',
      'All listings verified across major booking channels for guaranteed private in-room soaking facilities'
    ]
  },

  // Egypt - Sharm El Sheikh
  'sharm-el-sheikh-egypt': {
    intro: 'Sharm El Sheikh is the ultimate Red Sea luxury coastal retreat, perched where the dramatic pink granite mountains of Sinai meet warm turquoise waters and pristine coral reefs. Discover world-class beachfront spa resorts and private cliffside villas boasting oceanfront infinity tubs, private heated balcony jacuzzis, and expansive marble bathroom suites with views of Tiran Island.',
    amenities: [
      'Private terrace and balcony heated jacuzzi tubs framing unobstructed views of the Red Sea and Tiran Island',
      'Deep freestanding soaking bathtubs positioned beside floor-to-ceiling glass windows facing the private beach',
      'Mineral-rich Red Sea salt scrubs and nourishing Sinai desert botanical aromatherapy oils',
      'Spacious marble bathrooms featuring couple\'s walk-in rain showers and private outdoor sunbeds'
    ],
    whyChoose: [
      'World-famous diving and snorkeling waters with vibrant coral reefs right off the hotel’s private jetty',
      'Romantic private candlelit beach cabana dinners under star-studded desert skies',
      'Seamless excursions to Ras Mohammed National Park, Mount Sinai, and Bedouin desert camps',
      '100% verified private in-room and terrace bathtubs cross-checked across Booking.com and Agoda'
    ]
  },

  // Uzbekistan - Samarkand
  'samarkand-uzbekistan': {
    intro: 'Samarkand is the legendary crown jewel of the ancient Silk Road, mesmerizing travelers with its soaring turquoise-domed mosques, celestial madrasahs, and timeless Islamic artistry. Experience intimate luxury boutique stays in restored Silk Road caravanserais featuring hand-painted ceramic mosaic bathtubs, private hammam steam suites, and deep soaking tubs set within fragrant courtyard gardens.',
    amenities: [
      'Intricate mosaic-tiled deep soaking plunge bathtubs crafted in traditional Timurid turquoise patterns',
      'Private in-room hammam marble steam baths and aromatherapy hot tubs',
      'Artisanal Uzbek bath preparations infused with wild mountain saffron, Damask rosewater, and dried mint',
      'Private sunlit courtyard terraces with heated soaking tubs and Persian carpets'
    ],
    whyChoose: [
      'One of the oldest continuously inhabited and most poetic cities in human history',
      'Unforgettable evening illuminations across the majestic UNESCO-listed Registan Square',
      'Marvel at the sapphire tilework of Shah-i-Zinda necropolis and savor sweet halva at the historic Siab Bazaar',
      'Triple-verified across Booking.com and Agoda for guaranteed private in-room bathtub amenities'
    ]
  },

  // Uzbekistan - Bukhara
  'bukhara-uzbekistan': {
    intro: 'Bukhara is a living medieval museum along the Silk Road, holding over two millennia of history across its terracotta minarets, domed bazaars, and tranquil oasis courtyards. Unwind in boutique heritage hotels—converted from 18th-century merchant mansions and madrasahs—boasting deep stone soaking baths, private courtyard jacuzzi suites, and traditional thermal hammam baths.',
    amenities: [
      'Authentic hand-carved stone and sunken terracotta bathtubs framed by vaulted brick ceilings',
      'Private courtyard jacuzzi suites set beneath shaded pomegranate and fig trees',
      'Therapeutic Bukharian bath rituals featuring warm herbal compresses, local almond oils, and mineral salts',
      'Spacious heritage bathrooms complete with brass rainfall showers and artisanal embroidered robes'
    ],
    whyChoose: [
      'A remarkably preserved UNESCO World Heritage ancient city that feels frozen in time',
      'Romantic candlelit dinners along the historic Lyabi-Khauz pool beneath centuries-old mulberry trees',
      'Explore ancient silk weaving, jewelers\' domes (Toqi Zargaron), and the towering Kalyan Minaret',
      'Every bathtub listing independently audited to guarantee private in-room soaking amenities'
    ]
  },

  // Kazakhstan - Almaty
  'almaty-kazakhstan': {
    intro: 'Almaty, Kazakhstan\'s scenic cultural metropolis, sits in the dramatic shadow of the snow-peaked Zailiyskiy Alatau mountains of the Tian Shan range. Indulge in alpine luxury ski chalets and five-star urban towers featuring heated outdoor cedarwood hot tubs, deep mountain-view soaking bathtubs, and private Kazakh banya steam suites.',
    amenities: [
      'Handcrafted outdoor heated cedarwood hot tubs and deep marble soaking bathtubs with panoramic Tian Shan mountain vistas',
      'Private in-room traditional Kazakh banya sauna and steam hydrotherapy suites',
      'Invigorating mountain bath preparations infused with wild Tian Shan spruce needle oil and alpine chamomile',
      'Floor-to-ceiling glass bathroom suites with heated floors and designer European amenities'
    ],
    whyChoose: [
      'Unique blend of vibrant cosmopolitan culture, tree-lined boulevards, and immediate high-alpine wilderness',
      'Ride the scenic gondola to Shymbulak Mountain Resort and visit the world-famous Medeu high-altitude ice rink',
      'Breathtaking sunsets from Kok Tobe hill and refined dining featuring Central Asian and European fusion cuisine',
      '100% verified private in-room bathtubs and jacuzzi suites cross-checked across Booking.com and Agoda'
    ]
  },

  // Mongolia - Ulaanbaatar
  'ulaanbaatar-mongolia': {
    intro: 'Ulaanbaatar, the dynamic capital of the Land of Eternal Blue Sky, bridges ancient nomadic Buddhist heritage with contemporary high-rise luxury along the Tuul River. Stay in premier five-star hotel towers and boutique wellness retreats offering floor-to-ceiling skyline soaking bathtubs, private executive jacuzzi suites, and therapeutic Mongolian botanical baths.',
    amenities: [
      'Oversized freestanding soaking bathtubs positioned beside floor-to-ceiling windows overlooking Bogd Khan Mountain',
      'Private couple\'s jacuzzi spa suites with chromotherapy lighting and Finnish saunas',
      'Nourishing Mongolian botanical bath therapies enriched with organic wild sea-buckthorn oil and steppe thyme',
      'Luxurious marble bathrooms with heated floors, rain showers, and bespoke cashmere bath amenities'
    ],
    whyChoose: [
      'Fascinating gateway to one of the world\'s last great nomadic wilderness frontiers',
      'Visit the ancient Choijin Lama Temple, Gandantegchinlen Monastery, and vibrant cashmere boutiques',
      'Enjoy evening throat-singing and traditional morin khuur horsehead fiddle orchestra performances',
      'All listings verified across major booking portals for private in-room soaking facilities'
    ]
  },

  // Mongolia - Terelj
  'terelj-mongolia': {
    intro: 'Gorkhi-Terelj National Park is a mystical wilderness wonderland of alpine valleys, granite rock formations, and larch forests nestled in the heart of Mongolia. Experience luxury glamping ger suites and eco-resorts featuring handcrafted outdoor wooden soaking tubs, private heated terrace hot tubs, and starlit open-sky wilderness baths.',
    amenities: [
      'Private handcrafted outdoor wooden hot tubs and deep soaking tubs framed by dramatic alpine rock formations',
      'Heated luxury ger tent suites equipped with modern en-suite soaking bathtubs and wood-burning stoves',
      'Therapeutic wilderness bath soaks utilizing wild Siberian larch extracts, river stones, and alpine flowers',
      'Unobstructed open-air night sky views for bathing under the world-famous billion-star Mongolian sky'
    ],
    whyChoose: [
      'An extraordinarily unique, bucket-list travel escape blending authentic nomadic culture with luxury comfort',
      'Horseback riding across pristine alpine meadows, hiking to Turtle Rock, and exploring the Aryapala Meditation Temple',
      'Absolute tranquility, pure mountain air, and unmatched celestial stargazing with zero light pollution',
      'Every bathtub listing independently verified for authentic private in-room and terrace amenities'
    ]
  },

  // Belize - Ambergris Caye
  'ambergris-caye-belize': {
    intro: 'Ambergris Caye is Belize\'s premier tropical paradise, fringed by the world-famous Belize Barrier Reef and turquoise Caribbean shallows. Unwind in beachfront boutique resorts and luxury overwater cabanas boasting private open-air jacuzzi tubs and deep soaking baths surrounded by swaying palms and ocean breezes.',
    amenities: [
      'Private oceanfront sundeck jacuzzis with panoramic views of the barrier reef',
      'Open-air coral-stone soaking tubs beneath tropical outdoor palapas',
      'Handcrafted artisan bath salts infused with organic coconut and Caribbean sea minerals',
      'Plunge pools and deep soaking tubs in standalone thatch-roof casitas'
    ],
    whyChoose: [
      'World-class snorkeling and diving at Hol Chan Marine Reserve and the Great Blue Hole',
      'Golf cart cruising, barefoot beachfront dining, and laid-back Caribbean island vibes in San Pedro',
      'Ultra-private boutique beachfront villas tailored for romantic honeymoons and milestone escapes',
      'Every bathtub and jacuzzi suite independently confirmed for verified private in-room use'
    ]
  },

  // Belize - Placencia
  'placencia-belize': {
    intro: 'Placencia is a tranquil sixteen-mile emerald peninsula in southern Belize renowned for its golden beaches and relaxed barefoot luxury. Retreat to oceanfront eco-luxury resorts and secluded Maya Beach villas featuring deep stone soaking tubs, private plunge pools, and open-air rain showers.',
    amenities: [
      'Deep freestanding stone soaking bathtubs overlooking private golden sand beaches',
      'Veranda jacuzzi tubs enveloped by lush tropical gardens and sea grape trees',
      'Natural organic botanicals, botanical bath oils, and coconut milk soaks',
      'Private lagoon-facing plunge tubs with breathtaking sunset views over the Maya Mountains'
    ],
    whyChoose: [
      'Uncrowded palm-lined beaches, tranquil Caribbean waters, and charming colorful boardwalks',
      'Gateway to world-class whale shark encounters, barrier reef diving, and jungle monkey river tours',
      'Intimate eco-chic luxury estates with bespoke farm-to-table culinary experiences',
      'Every bathtub listing rigorously verified for genuine private in-room or veranda placement'
    ]
  },

  // Guatemala - Lake Atitlan
  'lake-atitlan-guatemala': {
    intro: 'Lake Atitlan is celebrated as one of the most stunning alpine lakes on earth, framed by three majestic volcanic peaks and vibrant Maya villages. Indulge in cliffside boutique eco-lodges featuring solar-heated cedar hot tubs and panoramic stone soaking baths framing mist-shrouded volcanic waters.',
    amenities: [
      'Cliffside heated cedarwood hot tubs overlooking San Pedro and Tolimán volcanoes',
      'Handcrafted natural volcanic stone bathtubs integrated into open glass-walled suites',
      'Herbal bath infusions made with highland lavender, eucalyptus, and local medicinal plants',
      'Private infinity plunge tubs set upon terraced hillside gardens above the lake'
    ],
    whyChoose: [
      'Mesmerizing sunrises and sunsets painting dramatic volcanic silhouettes across sacred waters',
      'Rich indigenous Mayan culture, colorful artisan textile markets, and peaceful kayak excursions',
      'Exceptional tranquility and romantic seclusion far removed from commercial tourist corridors',
      'Strictly verified private soaking tubs offering unobstructed, direct lake views'
    ]
  },

  // Guatemala - Antigua
  'antigua-guatemala': {
    intro: 'Antigua Guatemala is a UNESCO World Heritage treasure, famed for its preserved 16th-century Spanish colonial architecture, cobblestone avenues, and dramatic volcanic backdrops. Experience romantic convent-palace hotels and luxury courtyard retreats with deep roll-top bathtubs, private jacuzzis, and wood-burning fireplaces.',
    amenities: [
      'Restored Spanish colonial suites with deep cast-iron roll-top and clawfoot tubs',
      'Private courtyard garden jacuzzi pools framed by bougainvillea and colonial arches',
      'Artisan handmade bath soaps crafted with Guatemalan cocoa and volcanic minerals',
      'Fireside luxury bathrooms with antique brass fixtures and hand-painted Talavera tiles'
    ],
    whyChoose: [
      'Enchanting colonial ambiance with candlelit courtyards, cobblestone lanes, and baroque church ruins',
      'World-class specialty coffee culture, gourmet volcanic dining, and views of Volcán de Agua and Fuego',
      'Boutique historical hotels offering exceptional colonial charm, romance, and warm hospitality',
      'Every bathtub suite triple-checked for private in-room and courtyard installations'
    ]
  },

  // Panama - Bocas del Toro
  'bocas-del-toro-panama': {
    intro: 'Bocas del Toro is an idyllic Caribbean archipelago in Panama where lush tropical rainforest meets crystalline turquoise waters and vibrant coral reefs. Stay in eco-luxury overwater bungalows and private island retreats boasting private overwater jacuzzis and ocean-view soaking tubs.',
    amenities: [
      'Private overwater sun deck jacuzzis perched above turquoise Caribbean waters and coral reefs',
      'Deep freestanding soaking bathtubs with floor-to-ceiling rainforest canopy or ocean views',
      'Organic coconut oil bath infusions, marine salts, and natural bamboo spa accessories',
      'Direct lagoon access and private hammock nets positioned right alongside your outdoor tub'
    ],
    whyChoose: [
      'Unrivaled tropical seclusion in authentic overwater villas and secluded private island sanctuaries',
      'Snorkeling with starfish, bioluminescent night bays, and surfing world-class Caribbean breaks',
      'A perfect blend of relaxed bohemian charm and luxurious eco-resort romance',
      '100% verified private overwater and beachfront soaking facilities'
    ]
  },

  // Panama - Panama City
  'panama-city-panama': {
    intro: 'Panama City captivates with its dynamic contrast between glittering Pacific skyscrapers and the historic charm of UNESCO-listed Casco Viejo. Discover boutique heritage palaces with romantic clawfoot tubs and high-rise luxury towers featuring floor-to-ceiling skyline and ocean-view jacuzzi suites.',
    amenities: [
      'Floor-to-ceiling window bathtubs overlooking the Pacific Ocean and the Panama Canal entrance',
      'Historic Casco Viejo suites with restored French-colonial clawfoot soaking tubs',
      'Rooftop jacuzzi plunge tubs with panoramic skyline and sunset views over the bay',
      'Premium spa bath amenities, marble bathrooms, and hydrotherapy jet installations'
    ],
    whyChoose: [
      'Cosmopolitan international dining, vibrant rooftop cocktail bars, and rich historic architecture',
      'Fascinating cultural blend of modern global capital, tropical rainforests, and historic canal heritage',
      'Ultra-luxurious 5-star hotel towers and romantic boutique mansions at competitive global rates',
      'Every bathtub listing independently verified across trusted global booking platforms'
    ]
  },

  // Kenya - Diani Beach
  'diani-beach-kenya': {
    intro: 'Diani Beach is widely acclaimed as Africa\'s leading beach destination, renowned for its powdery white sands, turquoise Indian Ocean waters, and swaying coconut palms. Discover secluded Swahili-inspired boutique villas and oceanfront luxury resorts featuring private open-air plunge pools, jacuzzi terraces, and deep marble bathtubs surrounded by lush coastal gardens.',
    amenities: [
      'Private beachfront terrace jacuzzis overlooking coral lagoons and palm canopies',
      'Open-air freestanding stone soaking tubs enveloped by fragrant tropical gardens',
      'Artisan Swahili essential oils and organic coconut milk bath infusions',
      'Sunken outdoor plunge tubs in standalone thatched-roof private bandas'
    ],
    whyChoose: [
      'Africa\'s premier tropical honeymoon haven with warm turquoise waters and pristine coral reefs',
      'Traditional dhow sailing, dolphin safaris at Kisite-Mpunguti, and sunset beach horseback rides',
      'World-class seafood dining and serene privacy along miles of uncrowded sand',
      'Rigorously verified private in-room and terrace jacuzzi suites'
    ]
  },

  // Kenya - Masai Mara
  'masai-mara-kenya': {
    intro: 'The Masai Mara is the world\'s most legendary safari wilderness, famed for the Great Migration and breathtaking savannah horizons. Experience the pinnacle of bush luxury in exclusive tented camps featuring iconic open-air copper bathtubs, heated wooden cedar tubs, and private veranda jacuzzi pools with unobstructed views of roaming wildlife.',
    amenities: [
      'Hand-beaten freestanding copper soaking tubs perched on elevated wooden game-viewing decks',
      'Lantern-lit evening bush bath preparations with warm water under African stars',
      'Panoramic savannah views overlooking elephant corridors and Mara River crossing points',
      'Organic botanicals, lemongrass bath salts, and luxury bush spa treatments'
    ],
    whyChoose: [
      'Bucket-list romantic safari with Big Five game drives and dawn hot air balloon flights',
      'Intimate all-inclusive luxury camps offering personalized butler service and campfire storytelling',
      'The quintessential African bush bath experience surrounded by raw wilderness',
      'Every property independently confirmed for authentic private veranda and ensuite soaking baths'
    ]
  },

  // Rwanda - Musanze
  'musanze-rwanda': {
    intro: 'Musanze is the mystical gateway to Volcanoes National Park, where volcanic peaks rise dramatically into mist-shrouded bamboo forests. Retreat to world-class eco-luxury lodges featuring volcanic stone fireplaces, heated cedar tubs, and deep freestanding soaking baths framing views of the Virunga volcanoes after an unforgettable day of mountain gorilla trekking.',
    amenities: [
      'Deep volcanic stone bathtubs heated by roaring in-suite wood-burning fireplaces',
      'Private veranda cedarwood hot tubs overlooking Mount Bisoke and Karisimbi',
      'Handcrafted eucalyptus and Rwandan wild herb bath preparations',
      'Heated bathroom floors, copper soaking tubs, and plush artisan bathrobes'
    ],
    whyChoose: [
      'Life-changing mountain gorilla and golden monkey trekking in pristine cloud forests',
      'Ultra-exclusive architectural lodges celebrated as global benchmarks in sustainable luxury',
      'Soulful Rwandan hospitality, farm-to-table cuisine, and tranquil mountain serenity',
      'Guaranteed private in-room soaking amenities confirmed across trusted booking channels'
    ]
  },

  // Rwanda - Kigali
  'kigali-rwanda': {
    intro: 'Kigali is revered as Africa\'s cleanest, safest, and most progressive capital, set across scenic rolling emerald hills. Stay in refined 5-star international hotels and stylish boutique retreats featuring panoramic hilltop bathtubs, marble jacuzzi suites, and lush garden terraces overlooking the twinkling city lights.',
    amenities: [
      'Floor-to-ceiling glass bathtubs with panoramic views across Kigali\'s rolling green hills',
      'Deep Italian marble soaking tubs and dual rain shower installations',
      'Private penthouse jacuzzi terraces overlooking the vibrant city skyline',
      'Premium locally-sourced volcanic spa products and aromatic herbal teas'
    ],
    whyChoose: [
      'Vibrant cultural renaissance with inspiring contemporary art galleries and artisan coffee houses',
      'Impeccably clean, peaceful, and sophisticated urban sanctuary for couples',
      'Ideal beginning or relaxing finale to a Rwandan safari and gorilla expedition',
      'Verified in-room bathtub and jacuzzi amenities across all listed properties'
    ]
  },

  // Zimbabwe - Victoria Falls
  'victoria-falls-zimbabwe': {
    intro: 'Victoria Falls, locally known as Mosi-oa-Tunya (\'The Smoke That Thunders\'), is one of the Seven Natural Wonders of the World. Indulge in colonial-era grand hotels and secluded Zambezi riverfront lodges boasting private plunge tubs, cliffside whirlpools, and deep clawfoot soaking tubs listening to the distant roar of the falls.',
    amenities: [
      'Private Zambezi river-view soaking tubs positioned for hippo and sunset boat vistas',
      'Restored colonial Victorian clawfoot roll-top bathtubs with antique brass fixtures',
      'Cliff-edge jacuzzi pools overlooking the dramatic Batoka Gorge',
      'African marula oil bath infusions and therapeutic riverside massage rituals'
    ],
    whyChoose: [
      'Awe-inspiring close encounters with one of the planet\'s greatest natural spectacles',
      'Sunset cruises on the Zambezi, helicopter flights over the falls, and private island dinners',
      'Timeless romance blending historic heritage elegance with untamed wilderness adventure',
      'Triple-verified private in-room and veranda tubs without misleading photos'
    ]
  },

  // Namibia - Sossusvlei
  'sossusvlei-namibia': {
    intro: 'Sossusvlei is an otherworldly desert wonderland in the ancient Namib Desert, famous for monumental crimson sand dunes and the ethereal white clay pan of Deadvlei. Stay in award-winning luxury desert lodges boasting outdoor sunken tubs, stargazing sundecks, and private pool-villas designed for absolute romantic isolation beneath the southern hemisphere\'s clearest night skies.',
    amenities: [
      'Outdoor sunken desert soaking tubs with unobstructed views of the crimson sand dunes',
      'Private rooftop star-beds with adjoining heated whirlpool spas for celestial stargazing',
      'Eco-conscious solar-heated hot tubs integrated into desert stone architecture',
      'Handcrafted desert mineral bath crystals and natural aloe vera skin soothers'
    ],
    whyChoose: [
      'The oldest desert on earth offering mesmerizing tranquility, silence, and surreal photographic beauty',
      'Dark Sky Reserve certification providing world-class astronomical stargazing',
      'Sunrise balloon flights over towering Dune 45 and Big Daddy',
      'Every luxury desert suite verified for authentic private outdoor and indoor soaking amenities'
    ]
  },

  // Montenegro - Kotor
  'kotor-montenegro': {
    intro: 'Kotor is the jewel of the Adriatic, nestled at the deepest point of the dramatic, fjord-like Bay of Boka beneath towering limestone cliffs. Stay in restored Venetian stone palazzos and boutique waterfront retreats featuring private balcony jacuzzis and freestanding roll-top baths overlooking tranquil sapphire waters and passing sailboats.',
    amenities: [
      'Private bay-view terrace jacuzzis overlooking the fjord-like waters of Boka Bay',
      'Freestanding Victorian cast-iron bathtubs set against original 17th-century exposed stone walls',
      'Organic Mediterranean sea salts and local lavender and rosemary bath oils',
      'Private waterfront stone jetty loungers and adjoining ensuite whirlpool tubs'
    ],
    whyChoose: [
      'UNESCO World Heritage medieval Old Town filled with winding cobbled lanes and Venetian architecture',
      'Serene and dramatic coastal fjord scenery unique to Southern Europe',
      'Romantic sunset boat cruises to Our Lady of the Rocks and Perast',
      'Guaranteed private in-room or terrace tubs confirmed on every listing'
    ]
  },

  // Montenegro - Budva
  'budva-montenegro': {
    intro: 'Budva is the pulsating heart of the Montenegrin Riviera, combining medieval walled town charm with sun-drenched Adriatic beaches and glamorous superyacht marinas. Experience cliffside luxury resorts and boutique design hotels featuring infinity-view jacuzzi suites and deep marble soaking tubs gazing out over the azure Adriatic and the iconic islet of Sveti Stefan.',
    amenities: [
      'Cliffside heated infinity jacuzzis overlooking the open Adriatic Sea and Sveti Stefan',
      'Deep circular marble soaking tubs with floor-to-ceiling panoramic glass windows',
      'Hydromassage jets, aromatherapy steam showers, and champagne bath amenities',
      'Private sundeck plunge tubs surrounded by olive groves and coastal pine trees'
    ],
    whyChoose: [
      'Glamorous Mediterranean coastal atmosphere with upscale beach clubs and Michelin-worthy seafood',
      'Historic Venetian Old Town surrounded by fortified stone walls and lively plazas',
      'Proximity to scenic coastal coves like Mogren, Queen\'s Beach, and Miločer',
      'Every bathtub listing strictly checked for genuine in-room or private terrace installation'
    ]
  },

  // Albania - Saranda
  'saranda-albania': {
    intro: 'Saranda is the sun-kissed crown of the Albanian Riviera, horseshoeing around a sparkling Ionian Sea bay facing the Greek island of Corfu. Discover contemporary beachfront boutique hotels and luxury penthouse suites offering private sea-view jacuzzis and deep soaking tubs positioned for breathtaking Mediterranean sunsets.',
    amenities: [
      'Sunset-facing private balcony jacuzzis overlooking the Ionian Sea and Corfu skyline',
      'Freestanding oval soaking tubs framed by floor-to-ceiling glass balconies',
      'Mediterranean herbal bath essences, organic olive oil soaps, and plush towels',
      'Private terrace sunbeds with adjoining whirlpool tubs for intimate evening stargazing'
    ],
    whyChoose: [
      'Incredible Mediterranean luxury value along Europe\'s fastest-emerging Riviera',
      'Gateway to the UNESCO World Heritage ancient ruins of Butrint and the turquoise Blue Eye spring',
      'Vibrant coastal promenade with fresh seafood tavernas and lively seaside cafes',
      'Independently verified private in-room and terrace jacuzzi amenities'
    ]
  },

  // Albania - Ksamil
  'ksamil-albania': {
    intro: 'Ksamil is celebrated as the \'Maldives of Europe\', famed for its powdery white sand coves, crystalline turquoise waters, and idyllic offshore uninhabited islets. Stay in intimate coastal boutique villas and luxury resorts featuring private sea-view plunge pools and panoramic jacuzzi suites just steps from translucent waters.',
    amenities: [
      'Private terrace jacuzzi plunge tubs with direct panoramic views of the Ksamil islands',
      'Deep freestanding soaking tubs situated next to open-air private sea-breeze balconies',
      'Organic botanical bath infusions crafted from Mediterranean wildflowers',
      'In-room champagne chilled and served beside private whirlpool baths'
    ],
    whyChoose: [
      'Crystal-clear turquoise waters and white sand beaches rivaling tropical island destinations',
      'Peaceful island boat excursions, paddleboarding, and secluded sunset swimming spots',
      'Exceptional romantic boutique hospitality at affordable European rates',
      'Verified authentic private in-suite and terrace soaking installations'
    ]
  },

  // Bosnia and Herzegovina - Sarajevo
  'sarajevo-bosnia-and-herzegovina': {
    intro: 'Sarajevo is the historic crossroads where East meets West, set within a picturesque valley ringed by the Dinaric Alps. Retreat to enchanting Ottoman-era boutique hotels and upscale luxury towers featuring authentic Turkish-style hammam soaking baths, private jacuzzi suites, and panoramic mountain views.',
    amenities: [
      'Handcrafted Turkish copper and stone hammam bathtubs in atmospheric vaulted suites',
      'Skyline jacuzzi tubs overlooking the minarets and church spires of Baščaršija',
      'Traditional herbal bath salts, Turkish peshtemal cotton towels, and rosewater soaks',
      'Cozy fireplace suites with adjoining deep soaking bathtubs for snowy alpine evenings'
    ],
    whyChoose: [
      'Captivating fusion of Ottoman and Austro-Hungarian architecture, culture, and rich history',
      'World-famous traditional Bosnian coffee culture, bazaar exploration, and hearty gastronomy',
      'Cozy mountain-encircled ambiance perfect for romantic winter or autumn retreats',
      'Every listed property confirmed for verified private in-room tubs'
    ]
  },

  // Bosnia and Herzegovina - Mostar
  'mostar-bosnia-and-herzegovina': {
    intro: 'Mostar is an architectural masterpiece of the Balkans, world-renowned for its graceful 16th-century stone arch Stari Most spanning the emerald Neretva River. Experience romantic stone-walled boutique havens and riverside villas offering deep freestanding bathtubs and private hot tubs with direct views of the ancient bridge.',
    amenities: [
      'Private balcony jacuzzi tubs with direct, illuminated evening views of the iconic Old Bridge',
      'Freestanding roll-top soaking bathtubs surrounded by ancient exposed river-stone walls',
      'Local lavender bath salts and artisan olive oil toiletries',
      'River-facing open-air terraces with tranquil water sounds echoing below'
    ],
    whyChoose: [
      'One of the most picturesque and romantic UNESCO World Heritage bridges on earth',
      'Candlelit riverside dining tasting Herzegovina\'s renowned Žilavka and Blatina wines',
      'Magical Old Bazaar cobblestone strolls with artisan coppersmiths and lantern shops',
      'Strictly verified private tubs ensuring unobstructed river and bridge vistas'
    ]
  },

  // North Macedonia - Ohrid
  'ohrid-north-macedonia': {
    intro: 'Lake Ohrid is one of Europe\'s oldest and deepest lakes, a dual UNESCO Natural and Cultural World Heritage marvel surrounded by dramatic peaks and ancient cliffside monasteries. Indulge in lakeside boutique villas and luxury spa hotels featuring private lakefront balcony jacuzzis and deep soaking baths overlooking crystal-clear freshwater horizons.',
    amenities: [
      'Private lake-view balcony jacuzzis framing the tranquil blue waters of Lake Ohrid',
      'Deep freestanding soaking tubs positioned for serene panoramic lake sunrises and sunsets',
      'Local Macedonian herb and wildflower bath infusions and organic spa amenities',
      'Private wooden lakeside sundecks and adjoining luxury hydrotherapy suites'
    ],
    whyChoose: [
      'A serene, unspoiled European lake paradise with millennia of history and crystal-clear water',
      'Cliffside Byzantine churches like Saint John at Kaneo perched dramatically over the lake',
      'Exceptional lakeside dining featuring fresh Ohrid trout and award-winning Macedonian wines',
      '100% verified private in-room and balcony soaking facilities'
    ]
  },

  // Portugal (Madeira) - Funchal
  'funchal-portugal': {
    intro: 'Funchal is the enchanting subtropical capital of Madeira, climbing steep volcanic slopes carpeted with botanical gardens and banana plantations above the deep blue Atlantic. Retreat to cliffside luxury quintas and 5-star oceanfront resorts featuring private hot tubs and panoramic freestanding bathtubs positioned for golden Atlantic sunrises and dolphin-watching horizons.',
    amenities: [
      'Clifftop heated jacuzzi terraces overlooking the endless Atlantic Ocean and Funchal bay',
      'Deep freestanding soaking tubs framed by floor-to-ceiling subtropical garden vistas',
      'Madeiran eucalyptus bath crystals and artisan botanical flower essences',
      'Private sun terraces with hydromassage loungers and Madeira wine tastings'
    ],
    whyChoose: [
      'Year-round spring-like climate, lush volcanic hiking along levada trails, and dramatic mountain peaks',
      'Historic Portuguese colonial quintas offering peerless old-world elegance and warmth',
      'World-class seafood dining, Madeira wine lodges, and vibrant cable car rides to Monte',
      'Every bathtub listing strictly verified for private in-suite or private terrace facilities'
    ]
  },

  // Portugal (Azores) - Ponta Delgada
  'ponta-delgada-portugal': {
    intro: 'Ponta Delgada is the vibrant gateway to the volcanic Azores archipelago on São Miguel Island, where emerald crater lakes meet natural geothermal hot springs and dramatic Atlantic coastlines. Experience boutique manor houses and luxury eco-resorts featuring geothermal mineral soaking tubs and private garden jacuzzis enveloped by hydrangeas and volcanic stone.',
    amenities: [
      'Private geothermal hot-spring soaking tubs heated by natural volcanic energy',
      'Black basalt stone bathtubs set in lush botanical greenhouse courtyards',
      'Azorean volcanic mineral bath salts and organic pineapple-infused bath therapies',
      'Heated outdoor whirlpool spas surrounded by ancient fern trees and hydrangeas'
    ],
    whyChoose: [
      'Untouched volcanic wonderland featuring Sete Cidades twin lakes and Furnas thermal springs',
      'World-renowned whale and dolphin watching in the deep Atlantic',
      'Exceptional tranquility, clean air, and farm-to-table Azorean gastronomy',
      'Guaranteed private in-room and terrace tubs independently confirmed'
    ]
  },

  // Spain (Canary Islands) - Tenerife
  'tenerife-spain': {
    intro: 'Tenerife is the largest of the Canary Islands, crowned by Mount Teide and fringed by volcanic black sand beaches and dramatic sea cliffs. Indulge in 5-star cliffside palaces and adults-only boutique resorts in Costa Adeje and Alcalá, boasting private oceanfront whirlpool tubs, Bali-bed jacuzzi decks, and deep marble baths with views of La Gomera.',
    amenities: [
      'Ocean-facing private balcony jacuzzis framing golden Atlantic sunsets over La Gomera',
      'Deep freestanding marble soaking baths integrated into open-plan luxury suites',
      'Volcanic basalt spa stone therapy and organic aloe vera bath infusions',
      'Private rooftop whirlpool solariums with panoramic views of Mount Teide'
    ],
    whyChoose: [
      'Europe\'s premier winter-sun haven with mild weather and sunny days year-round',
      'UNESCO World Heritage Teide National Park offering star-studded nocturnal skies and cable car vistas',
      'Award-winning Michelin-starred dining and world-class luxury resort infrastructure',
      'Strictly verified private tubs ensuring complete couple seclusion'
    ]
  },

  // Spain (Canary Islands) - Gran Canaria
  'gran-canaria-spain': {
    intro: 'Gran Canaria is a \'miniature continent\' renowned for dramatic microclimates, from the sweeping Saharan dunes of Maspalomas to lush pine-clad central peaks. Stay in luxury seaside wellness retreats and boutique cliffside havens featuring private terrace plunge tubs and deep soaking whirlpool baths overlooking golden dunes and turquoise Atlantic surf.',
    amenities: [
      'Private terrace jacuzzis overlooking the Maspalomas dunes and the Atlantic Ocean',
      'Deep circular soaking tubs with chromotherapy lighting and hydromassage jets',
      'Natural Canarian aloe vera skincare and ocean mineral bath salts',
      'Private palm-shaded sundecks with adjoining heated hydrotherapy pools'
    ],
    whyChoose: [
      'Dramatic golden sand dunes, dramatic mountain calderas, and charming whitewashed coastal villages',
      'Premier wellness and thalassotherapy spas celebrated throughout Europe',
      'Intimate boutique hotels designed for couples seeking year-round warmth and privacy',
      'Every bathtub accommodation verified for authentic private installations'
    ]
  },

  // Spain (Canary Islands) - Lanzarote
  'lanzarote-spain': {
    intro: 'Lanzarote is a mesmerizing volcanic paradise shaped by César Manrique\'s iconic organic architecture and alien lava fields. Discover ultra-stylish design villas and boutique eco-lodges featuring private volcanic stone hot tubs, sunken indoor-outdoor bathtubs, and panoramic terraces gazing across lunar Timanfaya landscapes to the Atlantic.',
    amenities: [
      'Sunken volcanic stone soaking bathtubs integrated into natural black lava bedrock',
      'Private terrace jacuzzis with sweeping views of the Atlantic and Timanfaya volcanic cones',
      'Local Malvasía volcanic wine served alongside candlelit evening hydrotherapy baths',
      'Organic aloe vera and sea salt scrub preparations crafted on the island'
    ],
    whyChoose: [
      'Surreal, otherworldly volcanic landscapes and pristine golden coves like Papagayo',
      'Striking whitewashed architectural harmony and captivating César Manrique cultural sites',
      'Renowned UNESCO Biosphere Reserve offering peaceful, contemplative romantic isolation',
      '100% verified private in-room and courtyard soaking amenities'
    ]
  },

  // Cape Verde - Santa Maria
  'santa-maria-cape-verde': {
    intro: 'Santa Maria on Sal Island is Cape Verde\'s sun-drenched coastal haven, where powdery golden sand dunes meet the turquoise waters of the mid-Atlantic. Experience 5-star beachfront resorts and romantic boutique suites featuring private open-air jacuzzis and deep freestanding soaking tubs cooled by Atlantic trade winds.',
    amenities: [
      'Private beachfront terrace jacuzzis overlooking turquoise Atlantic surf and golden sands',
      'Freestanding deep soaking bathtubs with open-air tropical sea breeze ventilation',
      'Hand-harvested Cabo Verde sea salt bath soaks and natural coconut oil moisturizers',
      'Private cabana sun loungers and adjoining ensuite whirlpool baths'
    ],
    whyChoose: [
      '\'No Stress\' island philosophy offering pure relaxation, warmth, and soulful Morna music',
      'Year-round sunshine, kite-surfing, turtle watching, and pristine turquoise swimming lagoons',
      'Exceptional tropical island hospitality with unique Afro-Portuguese Creole culture',
      'Triple-verified private in-room and terrace tubs for guaranteed romance'
    ]
  },

  // Bermuda - Hamilton
  'hamilton-bermuda': {
    intro: 'Hamilton, the historic pastel-hued capital of Bermuda, offers an idyllic Atlantic sanctuary where British colonial charm meets world-famous pink sand beaches. Stay in legendary harborfront resorts and secluded boutique estates featuring deep marble soaking tubs, panoramic ocean-facing hydrotherapy baths, and private veranda whirlpools overlooking Bermuda\'s turquoise Great Sound.',
    amenities: [
      'Deep marble soaking tubs with sweeping views of Hamilton Harbour and sailing yachts',
      'Private terrace hydrotherapy whirlpools overlooking Bermuda’s pastel waterfront',
      'Artisanal cedarwood and Bermuda sea salt bath infusions with fragrant oleander aromas',
      'Dual vanity spa ensuites with rainfall showers and Molton Brown toiletries'
    ],
    whyChoose: [
      'Iconic pink sand beaches, crystal-clear turquoise waters, and world-class offshore reef diving',
      'Timeless British colonial sophistication, harborfront fine dining, and historic parish tranquility',
      'Effortless luxury romantic escape just a short direct flight from the US East Coast',
      'Guaranteed private in-room and terrace tubs verified across Booking.com and Agoda'
    ]
  },

  // Bahamas - Exuma
  'exuma-bahamas': {
    intro: 'Exuma is the crown jewel of the Out Islands of the Bahamas, an archipelago of 365 pristine cays surrounded by the most luminous sapphire and turquoise water on Earth. Discover ultra-luxury beachfront villas, private island sanctuaries, and secluded boutique hideaways featuring open-air freestanding bathtubs, oceanfront plunge whirlpools, and private deck hot tubs beneath starry tropical skies.',
    amenities: [
      'Open-air freestanding soaking tubs set on secluded private decks just steps from powdery sand',
      'Oceanfront jacuzzi spas with panoramic vistas of shifting turquoise sandbars',
      'Bahamian sea salt soaks blended with coconut oil and wild tropical hibiscus blossoms',
      'Outdoor bamboo rainfall showers coupled with oversized couple soaking tubs'
    ],
    whyChoose: [
      'World-famous sapphire waters, deserted sandbars, and intimate swimming pig encounters',
      'Pure Out Island privacy and untouched natural romance far from cruise ship crowds',
      'World-class private boating, bonefishing, and snorkeling in crystal-clear visibility',
      'Triple-verified private in-room and deck soaking tubs for an unforgettable honeymoon'
    ]
  },

  // Greenland - Ilulissat
  'ilulissat-greenland': {
    intro: 'Ilulissat sits beside the UNESCO-listed Ilulissat Icefjord in Disko Bay, where colossal icebergs drift past the coastline in an awe-inspiring Arctic spectacle. Experience world-class eco-luxury lodges and boutique fjord hotels featuring heated panoramic soaking tubs, private cliff-edge hot tubs, and deep jacuzzi baths with front-row views of floating icebergs and dancing Northern Lights.',
    amenities: [
      'Heated outdoor cliff-edge hot tubs gazing directly onto colossal drifting icebergs in Disko Bay',
      'Deep soaking tubs framed by floor-to-ceiling windows for Northern Lights viewing from the bath',
      'Arctic mineral bath soaks infused with hand-foraged Greenlandic herbs and glacial salts',
      'Cozy Nordic cedarwood sauna access directly connected to private jacuzzi suites'
    ],
    whyChoose: [
      'Witness the breathtaking drama of the UNESCO World Heritage Ilulissat Icefjord and Sermeq Kujalleq glacier',
      'Romantic Arctic wilderness luxury under midnight sun in summer or ethereal Aurora Borealis in winter',
      'Dog sledding, whale watching safari cruises, and immersive Greenlandic Inuit culture',
      'Every bathtub suite independently inspected and verified on Booking.com and Agoda'
    ]
  },

  // Faroe Islands - Torshavn
  'torshavn-faroe-islands': {
    intro: 'Torshavn, one of the world\'s most charming and remote Nordic capitals, rests among the dramatic emerald cliffs and tempestuous seas of the Faroe Islands. Stay in turf-roofed boutique hotels and architectural ocean lodges featuring cedarwood outdoor hot tubs, deep ceramic soaking tubs, and private harbor-view spa baths surrounded by dramatic fjords and cascading waterfalls.',
    amenities: [
      'Outdoor cedarwood hot tubs with dramatic views of the North Atlantic and misty fjords',
      'Deep freestanding soaking bathtubs tucked beneath cozy turf roofs and Nordic timber beams',
      'Faröese seaweed and botanical mineral bath infusions for deeply restorative thermal soaks',
      'Heated slate bathroom floors, rainfall spa showers, and designer Nordic amenities'
    ],
    whyChoose: [
      'Unsurpassed North Atlantic isolation, dramatic sea stacks, and postcard-perfect turf-roofed villages',
      'World-renowned New Nordic culinary excellence and intimate Scandinavian hygge atmosphere',
      'Pristine hiking along dramatic sea cliffs, puffin colonies, and mystical waterfalls',
      '100% verified private in-room bathtubs and private outdoor hot tubs'
    ]
  },

  // Cook Islands - Rarotonga
  'rarotonga-cook-islands': {
    intro: 'Rarotonga, the vibrant Polynesian heart of the Cook Islands, is surrounded by a dazzling turquoise reef lagoon and mist-shrouded volcanic peaks. Unwind in beachfront boutique sanctuaries and private garden villas featuring open-air clawfoot bathtubs, private plunge whirlpools, and romantic outdoor soaking baths enveloped by fragrant frangipani and hibiscus.',
    amenities: [
      'Open-air freestanding clawfoot soaking tubs nestled within private tropical garden courtyards',
      'Lagoon-front deck whirlpools with uninterrupted views of Muri Lagoon and coral motus',
      'Polynesian monoi coconut oil bath soaks infused with hand-picked gardenia and sea salt',
      'Ensuite bathrooms with private open-air rainfall bamboo showers and his-and-hers vanities'
    ],
    whyChoose: [
      'Pure Polynesian warmth, traditional island nights, and barefoot tropical beach romance',
      'Snorkeling with tropical fish and paddleboarding straight from your villa terrace into calm lagoons',
      'Intimate low-rise island vibe where no building is taller than a coconut palm',
      '100% verified private in-room and garden soaking amenities across Booking.com and Agoda'
    ]
  },

  // Cook Islands - Aitutaki
  'aitutaki-cook-islands': {
    intro: 'Aitutaki boasts what is widely celebrated as the world’s most magnificent lagoon, an ethereal expanse of translucent turquoise and sapphire water dotted with powder-white sandbars. Indulge in exclusive overwater bungalows and secluded beachfront hideaways featuring ocean-edge infinity jacuzzis, deep couples soaking tubs, and open-air bathrooms under the Southern Cross.',
    amenities: [
      'Private overwater bungalow decks with built-in whirlpool tubs overlooking crystal turquoise waters',
      'Deep freestanding stone bathtubs with panoramic floor-to-ceiling vistas of the Aitutaki lagoon',
      'Aromatherapeutic island bath rituals with wild coconut cream, vanilla pods, and sea minerals',
      'Steps descending directly from your private sun deck into warm, bath-temperature lagoon water'
    ],
    whyChoose: [
      'Arguably the most breathtaking tropical lagoon on the planet for ultimate honeymoon seclusion',
      'Private boat charters to One Foot Island and deserted sandbanks for unforgettable picnics',
      'Unspoiled natural paradise with supreme privacy far from mass tourism',
      'Triple-verified private in-room and overwater tub facilities'
    ]
  },

  // Samoa - Apia
  'apia-samoa': {
    intro: 'Apia, nestled on the lush volcanic island of Upolu in Samoa, embodies the authentic and timeless spirit of Fa\'a Samoa (The Samoan Way). Experience romantic colonial-style boutique hotels and coastal cliffside resorts featuring volcanic basalt stone soaking tubs, private garden fales with open-air whirlpool baths, and natural hot spring water soaks beneath coconut palm canopies.',
    amenities: [
      'Hand-carved volcanic black stone soaking tubs in secluded open-air tropical bathroom fales',
      'Private garden whirlpools surrounded by lush ferns, ginger blossoms, and bird of paradise flowers',
      'Organic Samoan coconut oil (Popo) and nonu fruit bath infusions with sea minerals',
      'Spacious covered verandas with traditional thatched fales and private outdoor spa baths'
    ],
    whyChoose: [
      'Authentic South Pacific culture, ancient Polynesian hospitality, and peaceful island rhythm',
      'Swimming in natural volcanic wonders like the world-famous To Sua Ocean Trench and Lalomanu Beach',
      'Lush tropical rainforest waterfalls, coastal blowholes, and serene mountain vistas',
      'Guaranteed private in-room and garden bathtubs verified across Booking.com and Agoda'
    ]
  },

  // Vanuatu - Port Vila
  'port-vila-vanuatu': {
    intro: 'Port Vila, the lively island capital of Vanuatu on Efate, is an extraordinary South Pacific haven of turquoise lagoons, cascading waterfalls, and active volcanic wonders. Retreat to private island luxury villas and clifftop boutique resorts featuring overwater jacuzzi suites, sunken terrazzo bathtubs, and oceanfront hot tubs overlooking tranquil Mele Bay.',
    amenities: [
      'Sunken terrazzo bathtubs and private outdoor whirlpools with sweeping views of Mele Bay',
      'Private overwater and beach villas with direct plunge tubs and sunset cocktail decks',
      'Volcanic mineral and sulfur clay spa bath preparations sourced from surrounding volcanic islands',
      'Private outdoor tropical rain showers and romantic double deep soaking tubs'
    ],
    whyChoose: [
      'Thrilling South Pacific adventure combined with ultra-romantic private island sanctuaries',
      'World-famous underwater post office, Mele Cascades waterfalls, and pristine coral reefs',
      'Friendly Melanesian hospitality and vibrant French-Melanesian fusion dining along the waterfront',
      '100% verified private in-room and terrace tubs for romantic couples'
    ]
  },

  // New Caledonia - Noumea
  'noumea-new-caledonia': {
    intro: 'Noumea, the cosmopolitan capital of New Caledonia, fuses chic French Riviera elegance with South Pacific tropical splendor on the world\'s largest enclosed coral reef lagoon. Stay in five-star beachfront palaces and overwater lagoon bungalows in Anse Vata and Baie des Citrons featuring deep hydrotherapy soaking tubs, private oceanfront whirlpool decks, and sunset Champagne baths.',
    amenities: [
      'Deep marble hydrotherapy bathtubs overlooking the turquoise UNESCO World Heritage lagoon',
      'Private overwater terrace hot tubs with panoramic sunset views across the coral barrier reef',
      'French luxury bath amenities, aromatic lavender sea salts, and chilled French Champagne setups',
      'Sunken bathtub suites with direct views of palm-fringed bays and sailing catamarans'
    ],
    whyChoose: [
      'The "Paris of the Pacific": world-class French haute cuisine paired with tropical lagoon bliss',
      'Explore the UNESCO-listed Great Lagoon with crystal-clear visibility, sea turtles, and coral islets',
      'Sophisticated waterfront promenades, duty-free French boutiques, and vibrant marina culture',
      'Every bathtub suite independently inspected and verified across Booking.com and Agoda'
    ]
  },

  // Madagascar - Nosy Be
  'nosy-be-madagascar': {
    intro: 'Nosy Be, the legendary "Perfume Island" off the northwest coast of Madagascar, captivates travelers with fragrant ylang-ylang plantations, turquoise waters, and ancient volcanic crater lakes. Discover eco-luxury beachfront villas and hilltop boutique lodges featuring open-air stone bathtubs, private cliffside plunge whirlpools, and tropical garden soaking baths with sunset vistas across the Mozambique Channel.',
    amenities: [
      'Hand-crafted natural granite and volcanic stone bathtubs set in open-air oceanfront pavilions',
      'Private wooden deck whirlpool tubs with sweeping vistas of the Mozambique Channel and coral reefs',
      'Wild organic ylang-ylang, vanilla pod, and lemongrass aromatherapy bath preparations',
      'Ensuite bathrooms with open-air bamboo rainfall showers and exotic hardwood double vanities'
    ],
    whyChoose: [
      'Untouched tropical island paradise famous for lemur wildlife sanctuaries, whale sharks, and coral atolls',
      'Sensory bliss from rolling ylang-ylang, coffee, and clove plantations perfuming the tropical breeze',
      'Intimate barefoot luxury eco-villas offering total privacy and authentic Malagasy hospitality',
      'Triple-verified private in-room and terrace soaking tubs for unforgettable romantic escapes'
    ]
  },

  // Mozambique - Vilanculos
  'vilanculos-mozambique': {
    intro: 'Vilanculos is the gateway to the enchanting Bazaruto Archipelago, a marine national park renowned for towering coastal dunes, blindingly white sandbars, and luminous cobalt waters. Indulge in thatched beachfront luxury villas and cliffside eco-resorts featuring private sand dune plunge whirlpools, freestanding deep soaking tubs, and open-air decks for stargazing over the Indian Ocean.',
    amenities: [
      'Open-air freestanding soaking bathtubs situated just steps from the powder-white sand beaches',
      'Private oceanfront deck whirlpool spas overlooking shifting turquoise sandbars and dhow boats',
      'Hand-harvested Mozambique sea salt scrubs and pure virgin coconut oil bath infusions',
      'Spacious outdoor timber bathrooms with couple rain showers and panoramic ocean views'
    ],
    whyChoose: [
      'Gateway to the world-class Bazaruto Archipelago Marine National Park with dugongs, dolphins, and flamingos',
      'Romantic traditional dhow sailboat sunset cruises and private sandbank picnics in turquoise waters',
      'Exquisite fresh seafood, cashew nuts, and authentic Mozambican-Portuguese culinary fusion',
      'Guaranteed private in-room and deck tubs independently verified on Booking.com and Agoda'
    ]
  },

  // Botswana - Maun
  'maun-botswana': {
    intro: 'Maun is the world-renowned safari capital and gateway to the UNESCO-listed Okavango Delta, the planet\'s largest inland river delta and one of the last great wilderness sanctuaries on Earth. Experience ultra-luxury safari tented suites and riverfront bush lodges featuring private wooden deck clawfoot tubs, sunken plunge whirlpools, and starlit soaking baths with views of passing elephants and hippos.',
    amenities: [
      'Outdoor copper and rolled-tin clawfoot soaking tubs set on elevated private wooden safari decks',
      'Private plunge whirlpools with panoramic vistas over Okavango Delta lagoons and floodplains',
      'Kalahari mineral bath soaks with wild indigenous botanicals and essential oils',
      'Unobstructed sunset views of African wildlife drinking at waterholes directly from your bath'
    ],
    whyChoose: [
      'Premier African safari honeymoon destination offering unmatched wildlife encounters and mokoro canoe safaris',
      'Exclusive low-density ecotourism ensuring absolute wilderness intimacy and silence',
      'Spectacular stargazing under the crystalline Southern African night skies from your private tub',
      '100% verified private in-room and outdoor bush soaking tubs'
    ]
  },

  // Zambia - Livingstone
  'livingstone-zambia': {
    intro: 'Livingstone, located on the northern banks of the mighty Zambezi River, provides a thrilling and romantic sanctuary just moments from the awe-inspiring roar of Victoria Falls (Mosi-oa-Tunya). Relax in colonial riverfront lodges and treehouse luxury chalets featuring open-air Victorian clawfoot tubs, private river-edge jacuzzi decks, and private plunge pools gazing across the Zambezi.',
    amenities: [
      'Open-air Victorian clawfoot soaking tubs with direct views of the sunset-painted Zambezi River',
      'Private riverside deck jacuzzi tubs where you can listen to the gentle roar of Victoria Falls',
      'African marula and baobab oil bath infusions designed for deep restorative relaxation after safari walks',
      'Canopied mosquito-netted open-air bathrooms with vintage brass fittings and river stone floors'
    ],
    whyChoose: [
      'Unrivaled access to Victoria Falls, Devil\'s Pool, and romantic Zambezi sunset luxury boat cruises',
      'Abundant wildlife sightings with elephants and hippos frequently wandering along the riverbanks',
      'Rich explorer heritage, aviation safaris, and authentic Zambian cultural warmth',
      'Every bathtub suite independently inspected and verified across Booking.com and Agoda'
    ]
  },

  // Honduras - Roatan
  'roatan-honduras': {
    intro: 'Roatan, the premier gem of the Bay Islands of Honduras, rests along the world’s second-largest barrier reef, the Mesoamerican Barrier Reef. Experience clifftop boutique dive resorts and luxury beachfront villas in West Bay and Sandy Bay featuring panoramic ocean-facing whirlpool balconies, deep soaking bathtubs tucked into tropical ironwood decks, and Caribbean sunset plunge pools.',
    amenities: [
      'Private oceanfront balcony jacuzzi tubs with direct views over turquoise coral reef drop-offs',
      'Deep freestanding soaking bathtubs framed by louvered mahogany shutters and sea breezes',
      'Aromatherapeutic Caribbean coconut oil and sea mineral bath salts with fresh gardenia petals',
      'Ensuite bathrooms with open-air rainfall stone showers and double artisan hardwood vanities'
    ],
    whyChoose: [
      'World-class scuba diving and snorkeling directly from white powder beaches on the Mesoamerican Reef',
      'Laid-back Caribbean charm, dolphin encounters, and vibrant tropical reef marine life',
      'Secluded luxury hill-and-beach retreats designed for intimate honeymoon romance',
      '100% verified private in-room and balcony soaking tubs across Booking.com and Agoda'
    ]
  },

  // Nicaragua - San Juan del Sur
  'san-juan-del-sur-nicaragua': {
    intro: 'San Juan del Sur, on Nicaragua\'s picturesque Emerald Coast, blends vibrant surf culture with dramatic Pacific ocean bluffs and tranquil secluded coves. Stay in architectural clifftop eco-lodges and luxury design villas featuring infinity-edge soaking tubs, private cliffside whirlpools overlooking crashing Pacific breakers, and open-air bathrooms gazing toward spectacular fiery sunsets.',
    amenities: [
      'Private cliff-edge plunge whirlpools with panoramic vistas over the Pacific surf and crescent bay',
      'Deep polished concrete and stone soaking tubs open to warm offshore Pacific trade winds',
      'Artisanal volcanic clay and organic Nicaraguan coffee body scrubs and restorative bath soaks',
      'Open-air bamboo rain showers coupled with oversized dual soaking bathtubs'
    ],
    whyChoose: [
      'World-class Pacific surfing, turtle nesting beaches, and dramatic coastal cliff landscapes',
      'Incredible value for ultra-luxury private villa stays and eco-chic architectural retreats',
      'Vibrant coastal town energy balanced with supreme secluded cove privacy',
      'Guaranteed private in-room and terrace tubs verified on Booking.com and Agoda'
    ]
  },

  // Curacao - Willemstad
  'willemstad-curacao': {
    intro: 'Willemstad, the vibrant UNESCO World Heritage capital of Curaçao, enchants with its iconic candy-colored Dutch colonial waterfront, turquoise hidden coves, and lively European-Caribbean fusion. Indulge in restored historic boutique mansions and luxury coastal resorts featuring private plunge whirlpools, freestanding designer soaking tubs, and open-air oceanfront bath terraces.',
    amenities: [
      'Private oceanfront terrace hydrotherapy tubs overlooking turquoise Caribbean lagoons',
      'Freestanding designer soaking bathtubs nestled within historic 18th-century Dutch colonial suites',
      'Curaçao Blue liqueur and aloe vera cooling bath preparations with natural sea salts',
      'Ensuite marble bathrooms with double rain showers and luxurious French-Caribbean amenities'
    ],
    whyChoose: [
      'UNESCO-listed Handelskade harborfront charm with colorful Dutch baroque merchant architecture',
      'Secluded limestone coves like Grote Knip and Playa Lagun with crystal-clear turquoise waters',
      'Outside the Atlantic hurricane belt, ensuring idyllic romantic sunshine year-round',
      'Triple-verified private in-room and terrace tubs for romantic couples'
    ]
  },

  // Antigua and Barbuda - Saint John's
  'saint-johns-antigua-and-barbuda': {
    intro: 'Saint John\'s, the historic gateway to Antigua\'s legendary 365 white-sand beaches, offers a classic Caribbean paradise where British naval heritage meets barefoot luxury. Discover five-star clifftop sanctuaries and beachfront villa resorts featuring private infinity jacuzzis, freestanding deep marble soaking tubs, and sunset cocktail tubs gazing across Dickenson Bay and English Harbour.',
    amenities: [
      'Private clifftop infinity whirlpools with panoramic vistas of Antigua’s shimmering turquoise coastline',
      'Deep freestanding marble soaking bathtubs with floor-to-ceiling Caribbean ocean views',
      'Antiguan sea salt bath soaks infused with lemongrass, frangipani, and organic coconut nectar',
      'Spacious wraparound teak verandas with private outdoor couples hydrotherapy tubs'
    ],
    whyChoose: [
      'Legendary "beach for every day of the year" with some of the softest white powder sand in the West Indies',
      'Rich sailing heritage, world-class yachting regattas, and historic Nelson\'s Dockyard UNESCO romance',
      'Premier ultra-exclusive honeymoon resorts celebrated for exceptional culinary excellence and discretion',
      'Every bathtub suite independently inspected and verified across Booking.com and Agoda'
    ]
  },

  // Ecuador - Galapagos
  'galapagos-ecuador': {
    intro: 'The Galapagos Islands, an isolated volcanic wonderland 600 miles off Ecuador’s coast, is one of the world’s most pristine natural paradises where fearless wildlife thrives. Retreat to safari-style eco-tented lodges and oceanfront boutique sanctuaries in Santa Cruz and San Cristóbal featuring private lava stone hot tubs, panoramic Pacific sunset soaking baths, and clifftop whirlpools overlooking turquoise coves visited by marine iguanas and blue-footed boobies.',
    amenities: [
      'Private outdoor lava rock hot tubs overlooking pristine Pacific bays and volcanic craters',
      'Deep freestanding soaking bathtubs framed by floor-to-ceiling glass gazing out to sea',
      'Artisanal Ecuadorian volcanic mineral bath soaks with organic palo santo essential oils',
      'Private wooden deck whirlpools surrounded by giant tortoises and endemic Darwinian flora'
    ],
    whyChoose: [
      'Once-in-a-lifetime wildlife encounters snorkeling with sea lions, penguins, and giant tortoises',
      'UNESCO World Heritage sanctuary offering rare, deeply immersive eco-luxury and isolation',
      'Spectacular equatorial sunsets and star-canopied evening soaks in volcanic stone tubs',
      '100% verified private in-room and outdoor soaking amenities across Booking.com and Agoda'
    ]
  },
  'puerto-ayora-ecuador': {
    intro: 'Puerto Ayora, the bustling hub of Santa Cruz Island in the Galapagos, offers the perfect blend of coastal island life, vibrant seafood dining, and untouched evolutionary wonders. Unwind in boutique harborfront hotels and secluded highland eco-retreats featuring private garden jacuzzis, deep couples soaking tubs, and open-air bath verandas cooled by Pacific trade winds.',
    amenities: [
      'Private garden whirlpool tubs nestled among endemic scalesia trees and wild giant tortoises',
      'Deep freestanding soaking tubs with views of Academy Bay and resting sea lions',
      'Ecuadorian organic cacao and volcanic salt bath therapies for post-snorkeling restoration',
      'Dual stone vanity bathrooms with private open-air rain showers and sustainable bath amenities'
    ],
    whyChoose: [
      'Gateway to the Charles Darwin Research Station, Tortuga Bay, and daily uninhabited island boat excursions',
      'Lively waterfront culinary scene featuring fresh catch-of-the-day ceviches and harborfront cocktails',
      'Intimate eco-conscious romantic retreats prioritizing environmental sustainability and privacy',
      'Guaranteed private in-room and terrace tubs verified on Booking.com and Agoda'
    ]
  },

  // Uruguay - Punta del Este
  'punta-del-este-uruguay': {
    intro: 'Punta del Este, renowned as the "Saint-Tropez of South America," is the glamorous coastal playground where golden Atlantic beaches meet tranquil Rio de la Plata sunsets. Experience ultra-luxury beachfront design hotels, clifftop architectural villas, and secluded vineyard retreats in Jose Ignacio and La Barra featuring heated outdoor hydromassage jacuzzis, deep marble soaking tubs, and private oceanfront plunge decks.',
    amenities: [
      'Private oceanfront balcony jacuzzi tubs overlooking the crashing Atlantic breakers of Playa Brava',
      'Deep marble soaking bathtubs with panoramic views across tranquil sunsets on Playa Mansa',
      'Uruguayan Tannat vinotherapy bath extracts blended with local sea salt and antioxidant grape seed oil',
      'Spacious designer ensuites with oversized rainfall showers, walk-in closets, and luxury amenities'
    ],
    whyChoose: [
      'South America’s most fashionable seaside resort with world-class beach clubs, art galleries, and dining',
      'Chic bohemian-luxe atmosphere in nearby Jose Ignacio and iconic sunsets at Casapueblo',
      'Glamorous couple getaways combining Atlantic surf, coastal dunes, and boutique wine estates',
      'Triple-verified private in-room and terrace tubs for an unforgettable romantic escape'
    ]
  },

  // Bolivia - Uyuni
  'uyuni-bolivia': {
    intro: 'Salar de Uyuni in Bolivia, the world\'s largest salt flat spanning over 4,000 square miles of surreal white horizon, is an otherworldly celestial sanctuary. Discover extraordinary salt-block luxury hotels and futuristic eco-domes featuring private heated whirlpool baths, deep thermal soaking tubs, and panoramic windows framing the surreal mirror reflections and infinite galaxy-filled Andean night skies.',
    amenities: [
      'Heated private whirlpool tubs positioned directly facing the vast white salt flats of Uyuni',
      'Deep freestanding soaking tubs set within suites hand-carved from solid blocks of natural salt',
      'Andean herbal thermal bath rituals infused with indigenous muña and high-altitude wild mint',
      'Starlit nocturnal stargazing tubs beneath one of the clearest night skies on planet Earth'
    ],
    whyChoose: [
      'Breathtaking otherworldly landscapes, surreal wet-season sky reflections, and pink flamingo lagoons',
      'Unique architectural marvels staying in authentic luxury salt palaces and geodetic stargazing domes',
      'High-altitude romantic solitude with mesmerizing golden sunrises right from your private tub',
      'Every bathtub and jacuzzi suite independently inspected and verified across Booking.com and Agoda'
    ]
  },

  // Paraguay - Asuncion
  'asuncion-paraguay': {
    intro: 'Asunción, the charming historic "Mother of Cities" on the banks of the Paraguay River, blends centuries-old Spanish colonial heritage with lush subtropical green avenues. Stay in historic palace boutique hotels in Villa Morra and the colonial center featuring private courtyard whirlpools, deep clawfoot soaking tubs, and secluded garden terrace spa baths shaded by flowering lapacho trees.',
    amenities: [
      'Private courtyard hydromassage jacuzzis tucked into lush subtropical botanical gardens',
      'Deep freestanding clawfoot soaking tubs within restored 19th-century colonial suites',
      'Organic Paraguayan yerba mate and citrus blossom aromatherapy bath salts for rejuvenating soaks',
      'Spacious marble ensuites with dual rainfall showers and handcrafted artisan hardwood details'
    ],
    whyChoose: [
      'Unspoiled South American hidden gem rich in colonial history, quiet tree-lined avenues, and tranquility',
      'Vibrant culinary scene in Villa Morra featuring traditional Paraguayan gastronomy and boutique wine bars',
      'Warm and welcoming Guarani hospitality in intimate luxury properties far from commercial crowds',
      '100% verified private in-room and garden soaking amenities across Booking.com and Agoda'
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
  const isIndia = country.toLowerCase() === 'india';
  const isUSA = country.toLowerCase() === 'usa' || country.toLowerCase() === 'united states';
  const content = getCityContent(city, country);

  const amenitiesList = content.amenities.map(a => `<li><strong>${a.split(' ')[0]}</strong> ${a.slice(a.indexOf(' ') + 1)}</li>`).join('');
  const whyChooseList = content.whyChoose.map(w => `<li>${w}</li>`).join('');

  const verificationSources = isIndia
    ? 'Booking.com, Agoda, and MakeMyTrip'
    : 'Booking.com, Agoda, and Expedia';

  const bookingPartners = isIndia
    ? `
      <li><strong>Booking.com:</strong> Instant confirmation with free cancellation options.</li>
      <li><strong>Agoda:</strong> Special member rates and mobile discounts across Asia & global stays.</li>
      <li><strong>MakeMyTrip:</strong> Leading platform for India and international destinations with exclusive offers.</li>
    `
    : `
      <li><strong>Booking.com:</strong> Instant confirmation with free cancellation and member discounts.</li>
      <li><strong>Agoda:</strong> Competitive rates and exclusive mobile savings worldwide.</li>
      <li><strong>Expedia:</strong> Trusted international booking partner with flexible stay options.</li>
    `;

  // US-specific section: targets "soaking tub", "jacuzzi suite", "hot tub in room" queries
  const usaSection = isUSA ? `
    <h3 class="text-xl font-bold text-gray-800 mt-4 mb-2">Soaking Tubs, Jacuzzi Suites &amp; Hot Tubs in ${formattedCity}</h3>
    <p class="text-gray-700 leading-relaxed mb-3">US travelers search for several types of in-room tub experiences. Here's what to expect in ${formattedCity}:</p>
    <ul class="list-disc pl-5 space-y-1.5 text-gray-700 mb-5">
      <li><strong>Deep soaking tubs</strong> — Japanese-style or freestanding baths that fill 20–24 inches deep. No jets. The most common type in boutique hotels.</li>
      <li><strong>Jacuzzi suites / whirlpool suites</strong> — Jetted tubs with hydrotherapy massage jets. Found in premium room tiers at luxury properties.</li>
      <li><strong>Hot tubs in room</strong> — Private to your room only (not shared). Found at select resort properties.</li>
      <li><strong>Roman soaking tubs</strong> — Oversized, wide, shallow marble tubs. The classic Vegas-style resort tub.</li>
    </ul>
    <p class="text-gray-700 leading-relaxed mb-4">Every listing has been <strong>individually verified</strong> — not a shared spa, not a walk-in shower. Triple-checked across ${verificationSources}.</p>
  ` : '';

  const h2 = isUSA
    ? `Jacuzzi Suites &amp; Hotels With Soaking Tubs in ${formattedCity}`
    : `Why Book a Hotel Room with a Bathtub in ${formattedCity}, ${formattedCountry}?`;

  const introLine2 = isUSA
    ? `Browse <strong>${hotelCount}+ verified hotels</strong> with private soaking tubs, jacuzzi suites, and in-room hot tubs in ${formattedCity} — each individually confirmed across ${verificationSources}.`
    : `Explore <strong>${hotelCount}+ verified hotels</strong> with private in-room bathtubs in ${formattedCity} — each property triple-checked across ${verificationSources} to guarantee private in-room tubs without misleading photos.`;

  return `
    <h2 class="text-2xl font-bold text-gray-900 mt-6 mb-3">${h2}</h2>
    <p class="text-gray-700 leading-relaxed mb-4">${content.intro}</p>
    <p class="text-gray-700 leading-relaxed mb-6">${introLine2}</p>
    ${usaSection}
    <h3 class="text-xl font-bold text-gray-800 mt-6 mb-2">${isUSA ? 'Suite Amenities &amp; Features' : `Popular Bathtub Amenities in ${formattedCity}`}</h3>
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
      ${bookingPartners}
    </ul>
  `;
}
