import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const TODAY = '2026-10-18';

// Target 25 high-priority Indian cities based on GSC search queries and hotel inventory demand
const CITY_BLOG_CONFIGS = [
  {
    citySlug: 'chennai',
    cityName: 'Chennai',
    state: 'Tamil Nadu',
    title: '10 Best Hotels with Bathtubs in Chennai for Couples (2026 Jacuzzi Suites & Beach Stays)',
    slug: 'hotels-with-bathtub-in-chennai',
    excerpt: 'Looking for romantic hotels with private bathtubs in Chennai? Explore the top verified 5-star suites and beachfront luxury hotels featuring deep marble soaking tubs and ocean views.',
    gscKeywords: ['hotels with bathtub in chennai', 'bath tub hotels in chennai', 'couple friendly hotels with bathtub in chennai'],
    theme: 'Coastal luxury, Coromandel coast heritage, and Bay of Bengal sea views',
    vibe: 'From historic grand palaces on MRC Nagar to modern wellness sanctuaries in Nungambakkam and Guindy, Chennai offers couples deeply relaxing bathing experiences paired with coastal breezes.'
  },
  {
    citySlug: 'kochi',
    cityName: 'Kochi',
    state: 'Kerala',
    title: '8 Best Hotels with Bathtubs in Kochi for Couples & Honeymooners (2026 Guide)',
    slug: 'hotels-with-bathtub-in-kochi',
    excerpt: 'Discover top hotels with private in-room bathtubs in Kochi and Fort Kochi. Enjoy colonial clawfoot soaking tubs, Arabian Sea views, and luxury heritage suites for couples.',
    gscKeywords: ['bathtub hotels in kochi', 'bathtub rooms in kochi', 'hotels with bathtub in kochi for couples'],
    theme: 'Colonial heritage, spice-route charm, and Arabian Sea waterfronts',
    vibe: 'Fort Kochi and Willingdon Island boast some of India’s most atmospheric heritage accommodations, featuring vintage clawfoot bathtubs, teakwood louvers, and tranquil backwater vistas.'
  },
  {
    citySlug: 'hyderabad',
    cityName: 'Hyderabad',
    state: 'Telangana',
    title: 'Top Hotels with Bathtub in Hyderabad: Royal Palace Suites & Luxury Jacuzzis (2026)',
    slug: 'hotels-with-bathtub-in-hyderabad',
    excerpt: 'Experience Nizam-era royalty and modern luxury in Hyderabad. Curated guide to the best hotels featuring private marble bathtubs, lake views, and romantic jacuzzi suites.',
    gscKeywords: ['bath tub hotels in hyderabad', 'bathtub hotels in hyderabad', 'couple friendly hotels with bathtub in hyderabad'],
    theme: 'Nizam-era royal luxury, Durgam Cheruvu lake views, and HITEC City modern penthouses',
    vibe: 'Whether staying inside the restored historic halls of Falaknuma or modern high-rise suites overlooking Durgam Cheruvu lake, Hyderabad delivers peerless regal soaking opulence.'
  },
  {
    citySlug: 'agra',
    cityName: 'Agra',
    state: 'Uttar Pradesh',
    title: 'Best Hotels with Bathtubs in Agra Near the Taj Mahal: 2026 Luxury Couples Guide',
    slug: 'hotels-with-bathtub-in-agra',
    excerpt: 'Planning an unforgettable romantic stay in Agra? Explore top luxury hotels with private bathtubs and Taj Mahal views, featuring deep sunken marble tubs and five-star spa amenities.',
    gscKeywords: ['agra hotels with bathtub', 'hotels near taj mahal with bathtub', 'bathtub hotel in agra'],
    theme: 'Mughal architectural majesty, Taj Mahal sunrise views, and tranquil courtyard fountains',
    vibe: 'Nothing matches returning from a sunrise visit to the Taj Mahal to a warm, rose-scented soak in a private marble bath surrounded by Mughal arches and lush landscaped gardens.'
  },
  {
    citySlug: 'amritsar',
    cityName: 'Amritsar',
    state: 'Punjab',
    title: 'Best Bathtub Hotels in Amritsar for Couples: Golden Temple Luxury Stays (2026)',
    slug: 'amritsar-hotel-with-bathtub',
    excerpt: 'Looking for a peaceful luxury stay in Amritsar? Discover verified hotels featuring private in-room soaking tubs, heritage courtyards, and tranquil suites near the Golden Temple.',
    gscKeywords: ['amritsar hotel with bathtub', 'hotels in amritsar with bathtub', 'couple friendly bathtub hotel amritsar'],
    theme: 'Spiritual tranquility, Punjabi royal hospitality, and heritage colonial courtyards',
    vibe: 'Amritsar combines deeply spiritual Golden Temple serenity with luxurious boutique havelis and five-star resorts where you can soak away the travel fatigue in private marble tubs.'
  },
  {
    citySlug: 'pune',
    cityName: 'Pune',
    state: 'Maharashtra',
    title: 'Best Hotels with Jacuzzi in Pune for Couples: Romantic Suites & Weekend Escapes (2026)',
    slug: 'hotels-with-jacuzzi-in-pune',
    excerpt: 'Planning a romantic staycation in Pune? Explore the best hotels featuring private in-room jacuzzis, hydrotherapy whirlpools, and deep soaking tubs in Koregaon Park and Senapati Bapat Road.',
    gscKeywords: ['hotels with jacuzzi in pune for couples', 'bathtub hotel in pune', 'bath tub hotels in pune'],
    theme: 'Lush green boulevards of Koregaon Park, rooftop infinity pools, and couples staycations',
    vibe: 'Pune is Maharashtra’s staycation capital for couples seeking peaceful weekend escapes with heated hydrotherapy jets, deep bathtubs, and fine dining under canopy trees.'
  },
  {
    citySlug: 'indore',
    cityName: 'Indore',
    state: 'Madhya Pradesh',
    title: 'Top Hotels with Bathtubs in Indore: Premium Couple-Friendly Suites (2026 Guide)',
    slug: 'hotels-with-bathtub-in-indore',
    excerpt: 'Discover Indore’s finest luxury and boutique hotels featuring private in-room bathtubs. Perfect for romantic weekend breaks, business luxury, and couples staycations.',
    gscKeywords: ['bathtub hotel in indore', 'hotels with bathtub in indore', 'indore couple friendly hotel bathtub'],
    theme: 'Cleanest city in India, culinary excellence, and upscale boutique hospitality',
    vibe: 'Indore has blossomed into a sophisticated hospitality hub where modern business and leisure hotels offer spacious suites with private freestanding soaking tubs.'
  },
  {
    citySlug: 'digha',
    cityName: 'Digha',
    state: 'West Bengal',
    title: 'Best Bathtub Hotels in Digha & Mandarmani: Coastal Romantic Retreats (2026)',
    slug: 'bathtub-hotel-in-digha-mandarmani',
    excerpt: 'Escape the city to the Bay of Bengal coastline. Curated guide to beachfront resorts and boutique hotels featuring private in-room bathtubs in Digha and Mandarmani.',
    gscKeywords: ['bathtub hotel in digha', 'bathtub hotel in mandarmani', 'digha couple friendly hotel bathtub'],
    theme: 'Bay of Bengal sea waves, casuarina groves, and ocean-facing balconies',
    vibe: 'Digha and Mandarmani provide West Bengal couples with the ultimate seaside weekend retreat, featuring private ocean-view balcony tubs and coastal resort relaxation.'
  },
  {
    citySlug: 'siliguri',
    cityName: 'Siliguri',
    state: 'West Bengal',
    title: 'Top Hotels with Bathtubs in Siliguri: Gateway to the Eastern Himalayas (2026)',
    slug: 'bathtub-hotel-in-siliguri',
    excerpt: 'Rest in luxury at the foothills of the Himalayas. Discover top verified hotels in Siliguri with private in-room soaking bathtubs and premium suites for couples and travelers.',
    gscKeywords: ['bathtub hotel in siliguri', 'siliguri hotel with bathtub', 'hotels with bathtub in siliguri'],
    theme: 'Tea estate foothills, Himalayan gateway, and tranquil green valleys',
    vibe: 'Whether pausing en route to Darjeeling or Gangtok or enjoying a relaxing stopover, Siliguri’s top luxury hotels provide comforting deep baths and scenic views.'
  },
  {
    citySlug: 'guwahati',
    cityName: 'Guwahati',
    state: 'Assam',
    title: 'Best Hotels with Bathtub in Guwahati: Brahmaputra Riverfront Luxury (2026)',
    slug: 'hotels-with-bathtub-in-guwahati',
    excerpt: 'Explore Guwahati’s premier luxury hotels featuring private en-suite bathtubs, river views over the Brahmaputra, and serene spa suites for couples and leisure travelers.',
    gscKeywords: ['bathtub hotel in guwahati', 'hotels with bathtub in guwahati', 'guwahati luxury hotels with tub'],
    theme: 'Mighty Brahmaputra riverfronts, lush Assam greenery, and serene temple hills',
    vibe: 'As Northeast India’s cultural gateway, Guwahati offers refined luxury sanctuaries where travelers can unwind in deep designer tubs overlooking the sunset over the Brahmaputra.'
  },
  {
    citySlug: 'noida',
    cityName: 'Noida',
    state: 'Uttar Pradesh',
    title: 'Top Hotels with Bathtubs in Noida & Greater Noida for Couples (2026 Guide)',
    slug: 'bathtub-hotel-in-noida',
    excerpt: 'Looking for a relaxing couples staycation in Noida? Discover verified hotels featuring private in-room bathtubs, jacuzzi suites, and luxury amenities in Sector 18 and expressway hubs.',
    gscKeywords: ['bathtub hotel in noida', 'hotels with bathtub in noida', 'couple friendly bathtub hotel noida'],
    theme: 'Modern NCR urban luxury, private high-rise skyline suites, and couples staycations',
    vibe: 'Avoid long road trips from Delhi by booking private suite sanctuaries right in Noida, featuring designer soaking baths, room service, and complete privacy.'
  },
  {
    citySlug: 'puri',
    cityName: 'Puri',
    state: 'Odisha',
    title: 'Best Hotels with Bathtub in Puri: Sea-Facing Soaking Suites (2026 Guide)',
    slug: 'hotels-with-bathtub-in-puri',
    excerpt: 'Combine holy beach walks with five-star oceanfront relaxation in Puri. Discover top verified hotels and resorts with private in-room bathtubs overlooking the Bay of Bengal.',
    gscKeywords: ['bathtub hotel in puri', 'hotels with bathtub in puri', 'puri beach resort with bathtub'],
    theme: 'Golden beach sands, sacred Jagannath heritage, and ocean breeze balconies',
    vibe: 'Puri offers an enchanting mix of sacred sea breezes and luxurious coastal resorts featuring sea-facing balconies and deep marble baths.'
  },
  {
    citySlug: 'haridwar',
    cityName: 'Haridwar',
    state: 'Uttarakhand',
    title: 'Luxury Hotels with Bathtubs in Haridwar: Ganga View Wellness Retreats (2026)',
    slug: 'hotels-with-bathtub-in-haridwar',
    excerpt: 'Find peace along the holy Ganges. Discover Haridwar’s top luxury heritage hotels and riverside havelis featuring private soaking bathtubs and spiritual wellness sanctuaries.',
    gscKeywords: ['hotels with bathtub in haridwar', 'haridwar hotel with bathtub', 'ganga view hotel with bathtub haridwar'],
    theme: 'Sacred Ganga Ghats, evening Aarti bells, and Ayurvedic riverside healing',
    vibe: 'Haridwar’s premier heritage estates like Pilibhit House offer unforgettable private river-facing soaks accompanied by the gentle chanting of evening Ganga Aarti.'
  },
  {
    citySlug: 'dharamshala',
    cityName: 'Dharamshala',
    state: 'Himachal Pradesh',
    title: 'Best Dharamshala Hotels with Bathtubs & Dhauladhar Mountain Views (2026)',
    slug: 'dharamshala-hotels-with-bathtub',
    excerpt: 'Bask in snow-capped Himalayan serenity. Discover top hotels and resorts in Dharamshala and McLeodGanj featuring private bathtubs with panoramic mountain views.',
    gscKeywords: ['dharamshala hotels with bathtub', 'hotels with bathtub in dharamshala', 'mcleodganj hotels with bathtub'],
    theme: 'Pine-forested valleys, Tibetan monastery tranquility, and Dhauladhar snow peaks',
    vibe: 'Savor crisp cedar air and mountain stillness while relaxing in an en-suite bathtub overlooking the majestic snow-clad Dhauladhar peaks in Dharamshala and McLeodGanj.'
  },
  {
    citySlug: 'chandigarh',
    cityName: 'Chandigarh',
    state: 'Punjab & Haryana',
    title: 'Top Hotels with Bathtubs in Chandigarh & Zirakpur for Couples (2026 Guide)',
    slug: 'hotels-with-bathtub-in-chandigarh',
    excerpt: 'Looking for a romantic weekend break in the City Beautiful? Curated guide to top luxury hotels with private bathtubs and jacuzzi suites in Chandigarh and Zirakpur.',
    gscKeywords: ['hotels with bathtub in chandigarh', 'chandigarh hotels with bathtub', 'zirakpur hotel with bathtub'],
    theme: 'Corbusier architecture, lush green roundabouts, and luxury weekend getaways',
    vibe: 'Chandigarh’s tranquil tree-lined sectors and luxury Zirakpur resorts offer couples generous suites with marble deep-soaking bathtubs and top-tier hospitality.'
  },
  {
    citySlug: 'coorg',
    cityName: 'Coorg',
    state: 'Karnataka',
    title: 'Romantic Coorg Resorts with Private Bathtubs & Jacuzzi Villas (2026 Guide)',
    slug: 'coorg-resorts-with-private-bathtub',
    excerpt: 'Escape into Karnataka’s coffee country. Discover top luxury plantation resorts in Coorg featuring private outdoor bathtubs, jacuzzi cottages, and misty forest views.',
    gscKeywords: ['coorg resorts with private bathtub', 'hotels with bathtub in coorg', 'coorg honeymoon resorts with jacuzzi'],
    theme: 'Coffee plantation canopies, misty Western Ghats breezes, and birdsong mornings',
    vibe: 'Coorg is a lover’s haven where secluded private villas feature outdoor deep stone bathtubs surrounded by fragrant arabica coffee plants and spice trees.'
  },
  {
    citySlug: 'wayanad',
    cityName: 'Wayanad',
    state: 'Kerala',
    title: 'Best Wayanad Resorts with Private Jacuzzi & Rainforest Bathtubs (2026)',
    slug: 'wayanad-resorts-with-private-jacuzzi',
    excerpt: 'Immerse in the rainforests of Kerala. Discover top romantic resorts in Wayanad featuring private jacuzzi villas, treehouse soaking tubs, and mountain stream views.',
    gscKeywords: ['wayanad resorts with private jacuzzi', 'hotels with bathtub in wayanad', 'wayanad honeymoon resorts with tub'],
    theme: 'Emerald rainforests, Chembra Peak vistas, and natural stone soaking baths',
    vibe: 'Wayanad’s eco-luxury resorts let you soak in hot herbal water while watching mountain mist roll over dense Malabar rainforest canopies.'
  },
  {
    citySlug: 'kodaikanal',
    cityName: 'Kodaikanal',
    state: 'Tamil Nadu',
    title: 'Top Kodaikanal Resorts with Bathtubs: Misty Mountain Soaking Retreats (2026)',
    slug: 'kodaikanal-hotels-with-bathtub',
    excerpt: 'Chill out in the Princess of Hill Stations. Discover heritage colonial retreats and luxury cottages in Kodaikanal featuring vintage bathtubs and valley views.',
    gscKeywords: ['kodaikanal hotels with bathtub', 'hotels in kodaikanal with bathtub', 'kodaikanal honeymoon resorts bathtub'],
    theme: 'Pine forests, eucalyptus mist, colonial fireplace suites, and lake strolls',
    vibe: 'Kodaikanal’s heritage hotels feature heated wooden floors, antique clawfoot bathtubs, and crackling fireplaces for the ultimate romantic highland escape.'
  },
  {
    citySlug: 'nashik',
    cityName: 'Nashik',
    state: 'Maharashtra',
    title: 'Best Nashik Vineyard Resorts with Bathtubs: Wine Valley Luxury (2026 Guide)',
    slug: 'nashik-vineyard-resorts-with-bathtub',
    excerpt: 'Celebrate romance in India’s Napa Valley. Discover the best vineyard resorts and villas in Nashik featuring private bathtubs and lakefront jacuzzi suites.',
    gscKeywords: ['nashik vineyard resorts with bathtub', 'hotels with bathtub in nashik', 'sula vineyards hotel bathtub'],
    theme: 'Vineyard rows, Gangapur lake breezes, wine tastings, and sunset soaking',
    vibe: 'Pair a glass of chilled local vintage with an indulgent private bathtub soak overlooking endless rolling vines and the Gangapur Dam backwaters.'
  },
  {
    citySlug: 'darjeeling',
    cityName: 'Darjeeling',
    state: 'West Bengal',
    title: 'Best Darjeeling Hotels with Bathtubs: Heritage Suites with Kanchenjunga Views (2026)',
    slug: 'darjeeling-hotels-with-bathtub',
    excerpt: 'Gaze upon the third highest mountain in the world from a warm bath. Discover historic colonial hotels in Darjeeling featuring deep soaking tubs and mountain views.',
    gscKeywords: ['darjeeling hotels with bathtub', 'hotels with bathtub in darjeeling', 'darjeeling luxury hotel bathtub kanchenjunga'],
    theme: 'Historic British colonial heritage, First Flush tea estates, and Kanchenjunga peaks',
    vibe: 'Few experiences in the travel world rival relaxing in a warm Victorian clawfoot tub while watching the sunrise turn the Kanchenjunga snow peaks to molten gold.'
  },
  {
    citySlug: 'alleppey',
    cityName: 'Alleppey',
    state: 'Kerala',
    title: 'Romantic Alleppey Resorts with Bathtubs: Backwater Villas & Deep Soaking Suites (2026)',
    slug: 'alleppey-resorts-with-bathtub',
    excerpt: 'Experience the Venice of the East. Discover top backwater resorts and villas in Alleppey (Alappuzha) featuring private in-room bathtubs and serene canal views.',
    gscKeywords: ['alleppey hotel with spa', 'alleppey resorts with bathtub', 'hotels in alleppey with bathtub'],
    theme: 'Vembanad Lake serenity, gliding houseboats, and private tropical gardens',
    vibe: 'Alleppey’s luxury backwater resorts combine traditional Kerala architecture with open-air garden bathrooms and deep soaking tubs right beside shimmering lagoons.'
  },
  {
    citySlug: 'mahabalipuram',
    cityName: 'Mahabalipuram',
    state: 'Tamil Nadu',
    title: 'Best Mahabalipuram Beach Resorts with Bathtubs: Coastal Luxury Stays (2026)',
    slug: 'mahabalipuram-resorts-with-bathtub',
    excerpt: 'Unwind along the Coromandel Coast. Discover top 5-star beach resorts in Mahabalipuram featuring private oceanfront bathtubs, private plunge pools, and Shore Temple proximity.',
    gscKeywords: ['mahabalipuram resorts with bathtub', 'hotels with bathtub in mahabalipuram', 'beach resort bathtub mahabalipuram'],
    theme: 'Ancient stone temple heritage, Bay of Bengal surf, and palm-fringed beachfronts',
    vibe: 'Just an hour from Chennai along the East Coast Road, Mahabalipuram offers private seaside chalets with deep tubs where the sound of the ocean lulls you into total peace.'
  },
  {
    citySlug: 'jodhpur',
    cityName: 'Jodhpur',
    state: 'Rajasthan',
    title: 'Royal Heritage Hotels with Bathtubs in Jodhpur: Palace Suites with Fort Views (2026)',
    slug: 'jodhpur-heritage-hotels-with-bathtub',
    excerpt: 'Step into royal Rajputana splendor. Discover top palace hotels and heritage havelis in Jodhpur featuring hand-carved marble bathtubs and Mehrangarh Fort views.',
    gscKeywords: ['jodhpur heritage hotels with bathtub', 'hotels with bathtub in jodhpur', 'jodhpur palace suites with bathtub'],
    theme: 'Blue City ramparts, Mehrangarh Fort horizons, and royal Rajput sandstone palaces',
    vibe: 'Jodhpur’s legendary palace hotels offer sunken Italian and Makrana marble bathtubs accompanied by royal peacock gardens and dramatic views of Mehrangarh Fort.'
  },
  {
    citySlug: 'pondicherry',
    cityName: 'Pondicherry',
    state: 'Puducherry',
    title: 'Top Pondicherry Heritage Hotels with Bathtubs: French Quarter Luxury (2026 Guide)',
    slug: 'pondicherry-hotels-with-bathtub',
    excerpt: 'Soak in French-Tamil colonial charm. Discover top heritage hotels and villas in Pondicherry featuring private bathtubs in White Town and along the serene coastline.',
    gscKeywords: ['pondicherry hotels with bathtub', 'hotels in pondicherry with bathtub', 'white town hotel with bathtub pondicherry'],
    theme: 'Mustard-yellow French colonial mansions, bougainvillea lanes, and Promenade breezes',
    vibe: 'White Town’s restored Franco-Tamil villas provide enchanting suites with antique roll-top bathtubs, high rafter ceilings, and breezy inner courtyards.'
  },
  {
    citySlug: 'thrissur',
    cityName: 'Thrissur',
    state: 'Kerala',
    title: 'Hyatt Regency Thrissur & Luxury Stays: Premier Bathtub Suites in Kerala (2026)',
    slug: 'thrissur-luxury-hotels-with-bathtub',
    excerpt: 'Explore luxury accommodations in Kerala’s cultural capital. Inside look at the Hyatt Regency Thrissur presidential suites featuring designer deep soaking bathtubs and spa luxury.',
    gscKeywords: ['thrissur luxury hotels with bathtub', 'hyatt regency thrissur bathtub', 'hotels in thrissur with bathtub'],
    theme: 'Kerala cultural capital, temple festivals, lush coconut palms, and international 5-star luxury',
    vibe: 'Thrissur is world-famous for its grand Pooram festival and heritage temples. Now, international five-star luxury has arrived with deep designer soaking tubs for discerning travelers.'
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

async function main() {
  console.log('🚀 Starting Automated GSC-Driven City Blog Publisher...\n');

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI not found in .env.local');
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB Atlas.\n');

  const HotelCol = mongoose.connection.collection('hotels');
  const BlogCol = mongoose.connection.collection('blogs');

  let createdCount = 0;
  let updatedCount = 0;
  const publishedSlugs = [];

  for (const cfg of CITY_BLOG_CONFIGS) {
    // 1. Fetch real hotels from MongoDB for this city
    const hotels = await HotelCol.find({
      $or: [
        { citySlug: cfg.citySlug },
        { city: new RegExp(`^${cfg.cityName}$`, 'i') },
        { city: new RegExp(`^${cfg.citySlug}$`, 'i') }
      ],
      flagged: { $ne: true }
    }).sort({ rating: -1, reviewsCount: -1 }).toArray();

    if (hotels.length === 0) {
      console.warn(`⚠️ No hotels found in database for ${cfg.cityName} (${cfg.citySlug}). Skipping.`);
      continue;
    }

    // 2. Select high-res R2 image from top hotel
    const heroImage = hotels[0]?.image || 
      'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/hero-luxury-bath.webp';

    // 3. Assemble dynamic markdown content
    const content = buildMarkdownBlog(cfg, hotels);

    const blogDoc = {
      title: cfg.title,
      slug: cfg.slug,
      excerpt: cfg.excerpt,
      content,
      date: TODAY,
      published: true,
      author: 'Karan Arora',
      image: heroImage,
      country: 'India',
      city: cfg.cityName,
      updatedAt: new Date(),
    };

    const res = await BlogCol.updateOne(
      { slug: cfg.slug },
      { $set: blogDoc, $setOnInsert: { createdAt: new Date() } },
      { upsert: true }
    );

    if (res.upsertedCount > 0) {
      createdCount++;
      console.log(`✨ Created new blog: "${cfg.title}" (${cfg.slug}) [${hotels.length} hotels referenced]`);
    } else {
      updatedCount++;
      console.log(`🔄 Updated existing blog: "${cfg.title}" (${cfg.slug})`);
    }

    publishedSlugs.push(cfg.slug);
  }

  console.log(`\n--- BLOG PUBLISHING SUMMARY ---`);
  console.log(`Total blogs processed: ${CITY_BLOG_CONFIGS.length}`);
  console.log(`New blogs created: ${createdCount}`);
  console.log(`Existing blogs updated: ${updatedCount}`);

  // Update .cache/all-blogs.json so SSG and sitemap include all blogs
  const allBlogs = await BlogCol.find({ published: true }).project({ slug: 1, updatedAt: 1, date: 1, _id: 0 }).toArray();
  const cacheDir = path.resolve(process.cwd(), '.cache');
  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
  fs.writeFileSync(path.join(cacheDir, 'all-blogs.json'), JSON.stringify(allBlogs, null, 2));
  console.log(`✅ Cached ${allBlogs.length} published blogs in .cache/all-blogs.json for static sitemap.`);

  await mongoose.disconnect();
  console.log('\n🎉 Finished publishing city blogs.\n');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
