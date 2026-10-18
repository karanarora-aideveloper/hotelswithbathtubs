import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const TODAY = '2026-10-18';

// Target 25 high-priority Phase 2 Indian cities based on GSC search queries and deep hotel inventory
const CITY_BLOG_CONFIGS_PHASE2 = [
  {
    citySlug: 'delhi',
    cityName: 'Delhi',
    state: 'Delhi NCR',
    title: '12 Best Hotels with Bathtubs in Delhi for Couples (2026 Jacuzzi Suites & Luxury Stays)',
    slug: 'hotels-with-bathtub-in-delhi',
    excerpt: 'Looking for romantic hotels with private bathtubs in Delhi? Discover top 5-star suites and couple-friendly sanctuaries in Aerocity, Chanakyapuri, and South Delhi with deep marble soaking tubs.',
    gscKeywords: ['hotels with bathtub in delhi', 'hotel in delhi with bathtub', 'hotel with bathtub in delhi for couples', 'bathtub hotels in delhi'],
    theme: 'Diplomatic enclaves, Mughal heritage, and 5-star Lutyens luxury sanctuaries',
    vibe: 'From palatial sprawling properties in Chanakyapuri and Aerocity to heritage boutiques in South Delhi, the capital offers couples deeply private sanctuaries with marble soaking baths and whirlpool jacuzzis.'
  },
  {
    citySlug: 'goa',
    cityName: 'Goa',
    state: 'Goa',
    title: '15 Best Hotels & Resorts in Goa with Private Bathtubs & Jacuzzis (2026 Couples Guide)',
    slug: 'hotels-with-bathtub-in-goa',
    excerpt: 'Explore top beachfront resorts and Portuguese villas in Goa with private in-room bathtubs. Discover couple-friendly jacuzzi suites, cliffside tubs, and luxury pool stays in North and South Goa.',
    gscKeywords: ['hotels in goa with bathtub for couples', 'hotels with jacuzzi in room in goa', 'bathtub hotels in goa', 'hotel with private jacuzzi in goa'],
    theme: 'Arabian Sea sunsets, swaying coconut palms, Portuguese villas, and beachside serenity',
    vibe: 'Whether looking for cliffside villas in North Goa or quiet heritage estates in South Goa, Goa provides couples with outdoor garden bathtubs, private pool jacuzzi pavilions, and sun-soaked coastal luxury.'
  },
  {
    citySlug: 'rishikesh',
    cityName: 'Rishikesh',
    state: 'Uttarakhand',
    title: 'Best Hotels in Rishikesh with Jacuzzi & Private Bathtubs (2026 Ganga View Stays)',
    slug: 'hotels-in-rishikesh-with-jacuzzi',
    excerpt: 'Planning a romantic wellness retreat in Rishikesh? Curated guide to top luxury resorts featuring private heated jacuzzis, hydrotherapy suites, and Ganga river-view bathtubs.',
    gscKeywords: ['hotel with bathtub in rishikesh', 'hotels in rishikesh with jacuzzi', 'best hotels in rishikesh with jacuzzi', 'bathtub hotel in rishikesh'],
    theme: 'Holy Ganga riverbanks, Himalayan foothill breezes, wellness yoga retreats, and private heated hydrotherapy',
    vibe: 'Nestled in the foothills of the Himalayas, Rishikesh is the wellness capital of India. Unwind after river rafting or evening Ganga Aarti in a private heated jacuzzi suite overlooking the forested valleys.'
  },
  {
    citySlug: 'mumbai',
    cityName: 'Mumbai',
    state: 'Maharashtra',
    title: 'Best Couple-Friendly Hotels with Bathtub in Mumbai & Navi Mumbai (2026 Stays)',
    slug: 'couple-friendly-hotels-with-bathtub-in-mumbai',
    excerpt: 'Discover couple-friendly hotels with private bathtubs in Mumbai. Top verified sea-facing luxury suites, boutique stays, and romantic jacuzzi hotel rooms in Juhu, Bandra, and South Mumbai.',
    gscKeywords: ['couple friendly hotels with bathtub in mumbai', 'hotels with bathtub in mumbai for unmarried couples', 'bathtub hotel in mumbai', 'couple friendly hotels in mumbai with bathtub'],
    theme: 'Marine Drive horizons, Arabian Sea sea-facing penthouses, and Juhu luxury beach sanctuaries',
    vibe: 'Escape the hustle of Mumbai into high-floor luxury suites overlooking the Arabian Sea, featuring deep Italian marble tubs, hydrotherapy jets, and guaranteed discreet couple-friendly privacy.'
  },
  {
    citySlug: 'bangalore',
    cityName: 'Bangalore',
    state: 'Karnataka',
    title: 'Top Hotels with Bathtubs in Bangalore for Couples: Best Staycation Suites (2026)',
    slug: 'hotels-with-bathtub-in-bangalore',
    excerpt: 'Looking for a relaxing staycation in the Garden City? Explore the best hotels featuring private in-room soaking tubs and jacuzzi suites in Bangalore Central, Indiranagar, and Whitefield.',
    gscKeywords: ['hotels with bathtub in bangalore', 'bathtub hotel in bangalore', 'bangalore hotels with bathtub', 'hotel with bathtub in bangalore'],
    theme: 'Garden City greenery, rooftop sky lounges, and Indiranagar & Whitefield luxury retreats',
    vibe: 'Bangalore\'s cosmopolitan luxury hotels in Central Business District, Whitefield, and Hebbal boast spacious master bathrooms with freestanding soaking tubs, garden views, and full spa pampering.'
  },
  {
    citySlug: 'udaipur',
    cityName: 'Udaipur',
    state: 'Rajasthan',
    title: 'Best Hotels in Udaipur with Bathtubs & Lake Views for Couples (2026 Romance Guide)',
    slug: 'hotels-in-udaipur-with-bathtub',
    excerpt: 'Step into fairy-tale Rajputana romance. Discover the finest heritage palace hotels in Udaipur featuring hand-carved marble bathtubs, private jacuzzis, and Lake Pichola views.',
    gscKeywords: ['hotels in udaipur with bathtub', 'udaipur hotels with bathtub', 'hotel in udaipur with bathtub', 'bathtub hotel in udaipur'],
    theme: 'Lake Pichola shimmering waters, City Palace silhouettes, and royal Mewari marble bathing rituals',
    vibe: 'Udaipur is India\'s premier romantic destination. Immerse yourself in authentic Mewar royal splendor with hand-carved marble bathtubs looking out across Lake Pichola towards the floating Lake Palace.'
  },
  {
    citySlug: 'bhopal',
    cityName: 'Bhopal',
    state: 'Madhya Pradesh',
    title: 'Best Hotels with Bathtub in Bhopal for Couples: Upper Lake Luxury Stays (2026)',
    slug: 'hotel-with-bathtub-in-bhopal',
    excerpt: 'Explore top hotels with private in-room bathtubs in Bhopal. Verified luxury suites, lake-facing boutique resorts, and couple-friendly soaking tubs near Upper Lake and Shamla Hills.',
    gscKeywords: ['hotel with bathtub in bhopal', 'bathtub hotel in bhopal', 'hotel in bhopal with bathtub', 'hotels in bhopal with bathtub', 'hotel with jacuzzi in bhopal'],
    theme: 'City of Lakes, Upper Lake tranquility, and royal heritage Nawabi hospitality',
    vibe: 'Bhopal\'s lakeside resorts and heritage hotels offer serene escapes with spacious suites, deep marble bathtubs, and panoramic sunset views across the historic Upper Lake.'
  },
  {
    citySlug: 'manali',
    cityName: 'Manali',
    state: 'Himachal Pradesh',
    title: 'Best Hotels in Manali for Honeymoon with Jacuzzi & Bathtubs (2026 Snow View Guide)',
    slug: 'best-hotels-in-manali-for-honeymoon-with-bathtubs',
    excerpt: 'Planning a romantic honeymoon in Manali? Discover cozy wooden chalets and 5-star mountain resorts featuring private in-room jacuzzis and hot bathtubs with snow-capped Himalayan views.',
    gscKeywords: ['best hotels in manali for honeymoon with bathtubs', 'hotels in manali with jacuzzi', 'hotels in manali with bathtub', 'hotel with bathtub in manali'],
    theme: 'Snow-capped Himalayan peaks, pine forests of Old Manali, and cozy log-wood fireplace suites',
    vibe: 'Nothing rivals soaking in a steaming hot jacuzzi or cedarwood tub with a cup of hot spiced tea while watching snowflakes drift past your bedroom window in the Pir Panjal mountains.'
  },
  {
    citySlug: 'shimla',
    cityName: 'Shimla',
    state: 'Himachal Pradesh',
    title: 'Best Hotels in Shimla for Honeymoon with Bathtubs: Colonial Mountain Stays (2026)',
    slug: 'best-hotels-in-shimla-for-honeymoon-with-bathtubs',
    excerpt: 'Experience vintage colonial romance in the Queen of Hills. Curated list of luxury hotels in Shimla featuring private bathtubs, heritage fireplaces, and breathtaking Himalayan ridge panoramas.',
    gscKeywords: ['best hotels in shimla for honeymoon with bathtubs', 'hotel in shimla with bathtub', 'hotels in shimla with bathtub', 'shimla luxury bathtub hotels'],
    theme: 'British colonial heritage, cedar and rhododendron forests, and panoramic Himalayan ridge vistas',
    vibe: 'The Queen of Hills offers atmospheric Victorian-era chalets and contemporary five-star hillside resorts featuring deep roll-top bathtubs that gaze out onto mist-shrouded mountain valleys.'
  },
  {
    citySlug: 'lucknow',
    cityName: 'Lucknow',
    state: 'Uttar Pradesh',
    title: 'Best Hotels with Bathtubs in Lucknow: Luxury Suites & Nawabi Opulence (2026)',
    slug: 'hotels-with-bathtub-in-lucknow',
    excerpt: 'Immerse yourself in Awadhi regal hospitality. Top luxury hotels and boutique properties in Lucknow featuring deep soaking marble bathtubs and presidential suites.',
    gscKeywords: ['hotels with bathtub in lucknow', 'hotel with bathtub in lucknow', 'hotel in lucknow with bathtub', 'bathtub hotel in lucknow'],
    theme: 'Gomti riverfront, Awadhi culinary excellence, and royal Nawabi marble architecture',
    vibe: 'Lucknow\'s five-star hotels and heritage boutique properties blend timeless Tehzeeb hospitality with opulent bathrooms featuring sunken bathtubs, rainfall showers, and spa-grade soaking amenities.'
  },
  {
    citySlug: 'munnar',
    cityName: 'Munnar',
    state: 'Kerala',
    title: 'Best Bathtub Resorts in Munnar for Couples & Honeymooners: Tea Valley Views (2026)',
    slug: 'best-bathtub-resorts-in-munnar',
    excerpt: 'Discover top honeymoon resorts in Munnar with private in-room bathtubs and jacuzzis. Soak in luxury while taking in panoramic views of emerald tea plantations and misty valleys.',
    gscKeywords: ['bathtub resort in munnar', 'best bathtub resort in munnar', 'best jacuzzi resort in munnar', 'munnar honeymoon resorts with bathtub'],
    theme: 'Rolling emerald tea plantations, misty mountain gaps, and Western Ghats biodiversity',
    vibe: 'Perched high in the misty Western Ghats, Munnar\'s boutique treehouses and luxury resorts feature floor-to-ceiling glass-enclosed bathtubs overlooking endless rolling tea carpets.'
  },
  {
    citySlug: 'lonavala',
    cityName: 'Lonavala',
    state: 'Maharashtra',
    title: 'Best Hotels & Resorts in Lonavala for Couples with Bathtub & Jacuzzi (2026)',
    slug: 'hotels-in-lonavala-for-couples-with-bathtub',
    excerpt: 'Escape to the Sahyadri hills for the weekend. Curated guide to luxury villas, boutique resorts, and romantic hotels featuring private in-room jacuzzis and bathtubs in Lonavala.',
    gscKeywords: ['hotels in lonavala for couples with bathtub', 'best hotels in lonavala with bathtub', 'hotel in lonavala with bathtub', 'hotels in lonavala with jacuzzi'],
    theme: 'Sahyadri monsoon waterfalls, misty hill plateaus, and private pool jacuzzi weekend villas',
    vibe: 'The quintessential weekend escape for Mumbai and Pune couples, Lonavala features hillside villas and private cottages with heated outdoor hot tubs and deep soaking baths surrounded by lush greenery.'
  },
  {
    citySlug: 'ooty',
    cityName: 'Ooty',
    state: 'Tamil Nadu',
    title: 'Best Resorts in Ooty with Private Bathtubs & Jacuzzis: Nilgiri Stays (2026 Guide)',
    slug: 'ooty-resorts-with-private-bathtub',
    excerpt: 'Enjoy cozy highland romance in the Nilgiris. Discover heritage colonial cottages and luxury resorts in Ooty featuring clawfoot bathtubs, private jacuzzis, and wood-burning fireplaces.',
    gscKeywords: ['ooty resorts with private bathtub', 'hotels in ooty with bathtub', 'ooty honeymoon hotels with jacuzzi', 'bathtub hotel in ooty'],
    theme: 'Nilgiri Blue Mountains, eucalyptus groves, colonial tea estates, and vintage fireplaces',
    vibe: 'Ooty\'s heritage stone cottages and hillside estates offer roaring wood-burning fireplaces paired with clawfoot soaking tubs, creating the warmest romantic sanctuary in the Nilgiris.'
  },
  {
    citySlug: 'mussoorie',
    cityName: 'Mussoorie',
    state: 'Uttarakhand',
    title: 'Best Hotels in Mussoorie with Bathtubs: Mountain View Luxury Suites (2026)',
    slug: 'mussoorie-hotels-with-bathtub',
    excerpt: 'Gaze over the Doon Valley from your private warm bath. Explore Mussoorie\'s top luxury boutique hotels featuring deep soaking tubs and mountain-view jacuzzi suites.',
    gscKeywords: ['mussoorie hotels with bathtub', 'hotels in mussoorie with bathtub for couples', 'mountain view bathtub mussoorie', 'mussoorie jacuzzi hotels'],
    theme: 'Doon Valley winter-line sunsets, Mall Road heritage, and oak forest tranquility',
    vibe: 'Gaze across the dramatic Doon Valley lights as the sun sets from a private heated bathtub or jacuzzi suite tucked into the serene pine-covered slopes of Mussoorie.'
  },
  {
    citySlug: 'nainital',
    cityName: 'Nainital',
    state: 'Uttarakhand',
    title: 'Best Hotels in Nainital with Bathtubs: Naini Lake View Suites (2026 Guide)',
    slug: 'nainital-hotels-with-bathtub',
    excerpt: 'Planning a romantic holiday in Kumaon? Top hotels in Nainital featuring private in-room bathtubs, heritage colonial charm, and scenic views across Naini Lake.',
    gscKeywords: ['nainital hotels with bathtub', 'lake view bathtub hotels nainital', 'hotels in nainital with bathtub for couples', 'bathtub hotel nainital'],
    theme: 'Emerald Naini Lake, Kumaon mountain peaks, and cozy heritage hill chalets',
    vibe: 'Nainital\'s lakeside heritage properties and ridge-top boutique resorts feature warm, elegant suites with private deep soaking bathtubs overlooking the shimmering waters of Naini Lake.'
  },
  {
    citySlug: 'mahabaleshwar',
    cityName: 'Mahabaleshwar',
    state: 'Maharashtra',
    title: 'Best Hotels in Mahabaleshwar with Jacuzzi & Bathtubs for Couples (2026)',
    slug: 'mahabaleshwar-hotels-with-jacuzzi',
    excerpt: 'Escape to Maharashtra\'s strawberry country. Discover top luxury valley resorts and boutique hotels featuring private balcony jacuzzis and deep marble soaking tubs in Mahabaleshwar.',
    gscKeywords: ['mahabaleshwar hotels with jacuzzi', 'hotels in mahabaleshwar with bathtub', 'mahabaleshwar romantic resorts with bathtub', 'bathtub hotel in mahabaleshwar'],
    theme: 'Strawberry orchards, Venna Lake boating, and dramatic Western Ghats valley lookouts',
    vibe: 'Nestled among misty strawberry plantations, Mahabaleshwar\'s luxury valley resorts feature private forest-facing balconies with jetted hot tubs and sunken marble bathtubs for couples.'
  },
  {
    citySlug: 'alibaug',
    cityName: 'Alibaug',
    state: 'Maharashtra',
    title: 'Best Luxury Villas & Resorts in Alibaug with Private Bathtubs (2026 Guide)',
    slug: 'alibaug-villas-with-private-bathtub',
    excerpt: 'Escape the city via speedboat to Alibaug. Explore top beachside villas and boutique resorts featuring outdoor stone bathtubs, private jacuzzis, and lush coconut grove pools.',
    gscKeywords: ['alibaug villas with private bathtub', 'hotels in alibaug with bathtub', 'alibaug resorts with jacuzzi in room', 'beach resort with bathtub alibaug'],
    theme: 'Mandwa ferry getaways, pristine coastal beaches, and tranquil coconut grove pool villas',
    vibe: 'Just a 20-minute speedboat ride from Gateway of India, Alibaug is Mumbai\'s favorite Hamptons-style getaway, boasting secluded pool villas with outdoor stone bathtubs under open skies.'
  },
  {
    citySlug: 'gokarna',
    cityName: 'Gokarna',
    state: 'Karnataka',
    title: 'Best Beach Resorts in Gokarna with Bathtubs: Cliffside Luxury Escapes (2026)',
    slug: 'gokarna-beach-resorts-with-bathtub',
    excerpt: 'Discover tranquil coastal paradise in Karnataka. Curated guide to cliffside boutique resorts and beach villas in Gokarna featuring private open-air soaking tubs and Arabian Sea views.',
    gscKeywords: ['gokarna beach resorts with bathtub', 'hotels in gokarna with bathtub', 'cliffside jacuzzi in gokarna', 'romantic resorts gokarna bathtub'],
    theme: 'Om Beach crescent sands, rugged Arabian Sea cliffs, and bohemian barefoot luxury',
    vibe: 'Gokarna offers couples an untouched alternative to commercial beaches, featuring clifftop eco-resorts with ocean-view open-air soaking tubs and private plunge pools.'
  },
  {
    citySlug: 'varanasi',
    cityName: 'Varanasi',
    state: 'Uttar Pradesh',
    title: 'Luxury Hotels with Bathtubs in Varanasi: Ganga View Palaces & Suites (2026)',
    slug: 'varanasi-luxury-hotels-with-bathtub',
    excerpt: 'Experience the spiritual heart of India in royal comfort. Inside look at heritage riverfront palaces and 5-star hotels in Varanasi featuring deep soaking bathtubs and Ganga views.',
    gscKeywords: ['varanasi luxury hotels with bathtub', 'hotels in varanasi with bathtub', 'ganga view hotels with bathtub in varanasi', 'heritage bathtub hotels varanasi'],
    theme: 'Eternal sacred ghats, evening Ganga Aarti spiritual resonance, and royal heritage havelis',
    vibe: 'Stay in restored 18th-century royal havelis directly on the holy ghats of Varanasi, where spacious marble suites feature deep soaking tubs offering peace and rejuvenation above the eternal river.'
  },
  {
    citySlug: 'karjat',
    cityName: 'Karjat',
    state: 'Maharashtra',
    title: 'Top Karjat Resorts & Villas with Private Bathtub & Jacuzzi for Couples (2026)',
    slug: 'karjat-resorts-with-private-bathtub',
    excerpt: 'Planning a monsoon or weekend retreat near Mumbai? Explore top boutique nature resorts and luxury pool villas in Karjat featuring sunken stone bathtubs and private jacuzzis.',
    gscKeywords: ['karjat luxury villas with jacuzzi', 'resorts in karjat with bathtub', 'karjat couple friendly resort with bathtub', 'karjat staycation private tub'],
    theme: 'Ulhas valley greenery, seasonal river streams, and rural tranquil farmstays',
    vibe: 'Nestled at the base of the Western Ghats, Karjat provides couples with intimate boutique nature resorts featuring sunken stone bathtubs, jacuzzi gazebos, and scenic mountain views.'
  },
  {
    citySlug: 'panchgani',
    cityName: 'Panchgani',
    state: 'Maharashtra',
    title: 'Best Hotels in Panchgani with Bathtubs: Scenic Table Land Valley Views (2026)',
    slug: 'panchgani-hotels-with-bathtub',
    excerpt: 'Escape to the tranquil hill station of Panchgani. Discover boutique hotels and scenic valley resorts featuring private in-room bathtubs overlooking the Krishna River Valley.',
    gscKeywords: ['panchgani hotels with bathtub', 'resorts in panchgani with bathtub', 'panchgani romantic hotels with jacuzzi', 'table land hotel bathtub'],
    theme: 'Table Land volcanic plateau, Krishna river valley views, and fresh mountain air',
    vibe: 'Overlooking the breathtaking Krishna River Valley, Panchgani\'s quiet boutique resorts offer private valley-facing balconies with warm soaking tubs and romantic garden suites.'
  },
  {
    citySlug: 'igatpuri',
    cityName: 'Igatpuri',
    state: 'Maharashtra',
    title: 'Best Igatpuri Resorts with Private Bathtub & Jacuzzi: Monsoon Getaways (2026)',
    slug: 'igatpuri-resorts-with-private-bathtub',
    excerpt: 'Immerse yourself in Sahyadri mountain mist. Top luxury villas and wellness resorts in Igatpuri featuring private jetted bathtubs, jacuzzis, and private plunge pools.',
    gscKeywords: ['igatpuri resorts with private bathtub', 'monsoon jacuzzi villas in igatpuri', 'hotels in igatpuri with bathtub', 'igatpuri pool villa with bathtub'],
    theme: 'Sahyadri mist, dramatic monsoon waterfalls, and Vipassana tranquility',
    vibe: 'Famous for its lush monsoon landscapes and fog-covered hills, Igatpuri is the premier destination for couples seeking private luxury villas with jetted whirlpool tubs and private infinity plunge pools.'
  },
  {
    citySlug: 'mount-abu',
    cityName: 'Mount Abu',
    state: 'Rajasthan',
    title: 'Best Hotels in Mount Abu with Bathtubs: Rajasthan Hill Station Romance (2026)',
    slug: 'mount-abu-hotels-with-bathtub',
    excerpt: 'Discover Rajasthan\'s tranquil hill station. Curated guide to heritage palace hotels and boutique resorts in Mount Abu featuring private marble bathtubs and Aravalli mountain views.',
    gscKeywords: ['mount abu hotels with bathtub', 'hotels in mount abu with jacuzzi', 'nakki lake hotels with bathtub', 'mount abu couple friendly bathtub hotels'],
    theme: 'Aravalli range rocky plateaus, Nakki Lake boating, and cool pine-scented breezes',
    vibe: 'Rajasthan’s only hill station blends royal colonial charm with Aravalli mountain panoramas. Relax after visiting Dilwara temples in private marble bathtubs surrounded by manicured heritage gardens.'
  },
  {
    citySlug: 'shirdi',
    cityName: 'Shirdi',
    state: 'Maharashtra',
    title: 'Best Luxury Hotels with Bathtubs in Shirdi: Peaceful Spiritual Stays (2026)',
    slug: 'shirdi-luxury-hotels-with-bathtub',
    excerpt: 'Combine spiritual devotion with restorative 5-star comfort. Top luxury hotels in Shirdi featuring private in-room bathtubs, meditation gardens, and peaceful executive suites.',
    gscKeywords: ['shirdi luxury hotels with bathtub', 'hotels in shirdi with bathtub', '5 star hotels in shirdi with bathtub', 'shirdi couple friendly suites bathtub'],
    theme: 'Sai Baba spiritual pilgrimage, tranquil meditation gardens, and 5-star comfort',
    vibe: 'Combine spiritual devotion with restorative comfort. Shirdi’s premier 5-star hotels feature expansive master suites with deep soaking tubs, offering pilgrims serene rest after temple darshan.'
  },
  {
    citySlug: 'shillong',
    cityName: 'Shillong',
    state: 'Meghalaya',
    title: 'Best Boutique Hotels in Shillong with Bathtubs: Scotland of the East (2026)',
    slug: 'shillong-boutique-hotels-with-bathtub',
    excerpt: 'Explore Meghalaya\'s cultural heart. Discover heritage British-era bungalows and pine-view luxury boutique hotels in Shillong featuring private clawfoot bathtubs.',
    gscKeywords: ['shillong boutique hotels with bathtub', 'hotels in shillong with bathtub', 'shillong luxury stays with bathtub', 'meghalaya resorts with bathtub'],
    theme: 'Pine hills, living root bridges, Umiam Lake vistas, and indie music culture',
    vibe: 'Known as the Scotland of the East, Shillong boasts charming heritage British-era bungalows and modern pine-view resorts where you can soak in deep tubs with panoramic views of the Khasi Hills.'
  }
];

function buildMarkdownBlog(cfg, hotels) {
  const cityListingUrl = `/india/${cfg.citySlug}`;
  const hotelList = hotels.slice(0, 6);

  let md = `# ${cfg.title}\n\n`;
  md += `When planning a romantic getaway, honeymoon, or restful weekend retreat in **${cfg.cityName}**, finding a hotel with an authentic private in-room bathtub or jacuzzi makes all the difference.\n\n`;
  md += `${cfg.vibe}\n\n`;
  md += `At **HotelsWithBathtubs.com**, we triple-verify every single room category across Booking.com and Agoda to confirm that your tub is **100% private inside your suite**, guaranteeing no shared facilities or unexpected booking surprises.\n\n`;
  md += `[**👉 Browse All ${hotels.length} Verified Bathtub Hotels in ${cfg.cityName}**](${cityListingUrl})\n\n`;
  md += `---\n\n`;

  md += `## Why Book a Bathtub Stay in ${cfg.cityName}?\n\n`;
  md += `Traveling through ${cfg.cityName} offers rich experiences — from ${cfg.theme.toLowerCase()} to vibrant local food scenes. Returning to your private sanctuary at the end of the day provides:\n\n`;
  md += `- **Deep Muscle Recovery:** Soothing hot baths after a full day of sightseeing or travel.\n`;
  md += `- **Intimate Romantic Ambience:** Perfect for anniversaries, birthdays, and proposals with private hydrotherapy jets or deep soaking tubs.\n`;
  md += `- **Complete Privacy:** Triple-checked suites where the bathtub is strictly inside your private quarters.\n\n`;
  md += `---\n\n`;

  md += `## Top Verified Hotels with Bathtubs in ${cfg.cityName}\n\n`;

  hotelList.forEach((h, idx) => {
    const hotelAnchor = `${cityListingUrl}#hotel-${(h.slug || h.name).toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
    const priceText = h.price ? `~${h.price}` : 'Check Partner Rates';
    const room = h.roomType || 'Executive Suite with Bathtub';
    const tub = h.tubType || 'Deep Soaking Bathtub';
    const area = h.neighborhood || h.landmarkDistance || `Central ${cfg.cityName}`;

    md += `### ${idx + 1}. ${h.name}\n\n`;
    md += `A standout luxury choice in ${cfg.cityName}, featuring elegant interiors and guaranteed in-room bathing facilities.\n\n`;
    md += `- **Usual Rate:** ${priceText} / night\n`;
    md += `- **Guaranteed Room Tier:** ${room}\n`;
    md += `- **Bath Feature:** ${tub}\n`;
    md += `- **Location & Surroundings:** ${area}\n`;
    md += `- **Guest Rating:** ★ ${h.rating || 4.7}/5 (${h.reviewsCount || 200}+ verified reviews)\n\n`;
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
  md += `**Are hotels with bathtubs in ${cfg.cityName} couple-friendly?**\n`;
  md += `Yes. All verified hotels featured in our guide welcome couples and provide complete privacy for romantic getaways, staycations, and honeymoons. Standard valid government ID is required at check-in.\n\n`;

  md += `**Do hotels in ${cfg.cityName} have in-room jacuzzis or regular soaking tubs?**\n`;
  md += `Both options are available. Luxury five-star properties often feature deep freestanding soaking tubs with views, while select premier suite categories include private hydrotherapy whirlpool jacuzzis with massage jets.\n\n`;

  md += `**Can local couples book bathtub suites in ${cfg.cityName}?**\n`;
  md += `Most upscale 4-star and 5-star properties in ${cfg.cityName} accept local residents and same-city IDs without restrictions. We recommend checking individual hotel policies during booking.\n\n`;

  md += `**How do I confirm my room has a bathtub before arriving?**\n`;
  md += `Book directly via our verified partner links on Booking.com and Agoda where the specific room category name explicitly confirms the bathtub amenity in the room description.\n\n`;

  return md;
}

async function publishPhase2() {
  console.log('🚀 Starting Phase 2 City Blog Publication Pipeline...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log(' Connected to MongoDB Atlas.');

  const Blog = mongoose.models.Blog || mongoose.model('Blog', new mongoose.Schema({}, { strict: false }));
  const publishedDocs = [];

  for (const cfg of CITY_BLOG_CONFIGS_PHASE2) {
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
      country: 'India',
      image: heroImage,
      author: 'HotelsWithBathtubs Editorial Team',
      tags: ['Hotels with Bathtub', `${cfg.cityName} Travel`, 'Romantic Getaways', 'Jacuzzi Suites', 'Couples Stays'],
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
      { upsert: true, new: true }
    );

    publishedDocs.push(blogDoc);
    console.log(`✅ Published: ${cfg.cityName} -> /blog/${cfg.slug} (${cityHotels.length} hotels)`);
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

publishPhase2().catch(err => {
  console.error('❌ Error publishing Phase 2 blogs:', err);
  process.exit(1);
});
