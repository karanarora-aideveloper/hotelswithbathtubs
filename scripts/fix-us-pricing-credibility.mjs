import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import mongoose from 'mongoose';

const UPDATES = [
  // --- BOSTON ($340 cluster) ---
  { slug: 'four-seasons-boston-boston', price: '$785', streetAddress: '200 Boylston St', postalCode: '02116', latitude: 42.3524, longitude: -71.0697 },
  { slug: 'raffles-boston-boston', price: '$820', streetAddress: '40 Trinity Pl', postalCode: '02116', latitude: 42.3486, longitude: -71.0747 },
  { slug: 'mandarin-oriental-boston-boston', price: '$740', streetAddress: '776 Boylston St', postalCode: '02199', latitude: 42.3489, longitude: -71.0817 },
  { slug: 'boston-harbor-hotel-boston', price: '$565', streetAddress: '70 Rowes Wharf', postalCode: '02110', latitude: 42.3567, longitude: -71.0506 },
  { slug: 'omni-boston-hotel-at-the-seaport-boston', price: '$285', streetAddress: '450 Summer St', postalCode: '02210', latitude: 42.3477, longitude: -71.0423 },
  { slug: 'the-westin-boston-seaport-district-boston', price: '$265', streetAddress: '425 Summer St', postalCode: '02210', latitude: 42.3481, longitude: -71.0435 },
  { slug: 'clarendon-square-bed-breakfast-boston', price: '$315', streetAddress: '198 W Brookline St', postalCode: '02118', latitude: 42.3438, longitude: -71.0732 },
  { slug: 'the-newbury-boston', streetAddress: '1 Newbury St', postalCode: '02116', latitude: 42.3528, longitude: -71.0717 },
  { slug: 'the-eliot-hotel-boston', streetAddress: '370 Commonwealth Ave', postalCode: '02215', latitude: 42.3497, longitude: -71.0894 },
  { slug: 'the-liberty-hotel-boston', streetAddress: '215 Charles St', postalCode: '02114', latitude: 42.3622, longitude: -71.0694 },
  { slug: 'xv-beacon-hotel-boston', streetAddress: '15 Beacon St', postalCode: '02108', latitude: 42.3589, longitude: -71.0622 },
  { slug: 'the-langham-boston', streetAddress: '250 Franklin St', postalCode: '02110', latitude: 42.3561, longitude: -71.0547 },
  { slug: 'the-lenox-hotel-boston', streetAddress: '61 Exeter St', postalCode: '02116', latitude: 42.3494, longitude: -71.0797 },
  { slug: 'the-whitney-hotel-boston', streetAddress: '170 Charles St', postalCode: '02114', latitude: 42.3597, longitude: -71.0706 },
  { slug: 'battery-wharf-hotel-boston', streetAddress: '3 Battery Wharf', postalCode: '02109', latitude: 42.3667, longitude: -71.0514 },
  { slug: 'encore-boston-harbor-boston', streetAddress: '1 Broadway', postalCode: '02149', latitude: 42.3928, longitude: -71.0697 },
  { slug: 'intercontinental-boston-boston', streetAddress: '510 Atlantic Ave', postalCode: '02210', latitude: 42.3539, longitude: -71.0517 },
  { slug: 'the-godfrey-hotel-boston', streetAddress: '505 Washington St', postalCode: '02111', latitude: 42.3542, longitude: -71.0614 },
  { slug: 'the-colonnade-hotel-boston', streetAddress: '120 Huntington Ave', postalCode: '02116', latitude: 42.3458, longitude: -71.0806 },

  // --- LOS ANGELES ($360 cluster) ---
  { slug: 'los-angeles-hotel-bel-air-dorchester-collection', price: '$1,280', streetAddress: '701 Stone Canyon Rd', postalCode: '90077', latitude: 34.0847, longitude: -118.4489 },
  { slug: 'los-angeles-the-beverly-hills-hotel', price: '$1,150', streetAddress: '9641 Sunset Blvd', postalCode: '90210', latitude: 34.0817, longitude: -118.4139 },
  { slug: 'los-angeles-waldorf-astoria-beverly-hills', price: '$920', streetAddress: '9850 Wilshire Blvd', postalCode: '90210', latitude: 34.0675, longitude: -118.4128 },
  { slug: 'los-angeles-shutters-on-the-beach-santa-monica', price: '$795', streetAddress: '1 Pico Blvd', postalCode: '90405', latitude: 34.0069, longitude: -118.4897 },
  { slug: 'los-angeles-chateau-marmont-west-hollywood', price: '$710', streetAddress: '8221 Sunset Blvd', postalCode: '90046', latitude: 34.0983, longitude: -118.3683 },

  // --- HONOLULU ---
  { slug: 'honolulu-the-royal-hawaiian-a-luxury-collection-resort-waikiki', price: '$495', streetAddress: '2259 Kalakaua Ave', postalCode: '96815', latitude: 21.2778, longitude: -157.8286 },
  { slug: 'honolulu-the-kahala-hotel-and-resort', price: '$640', streetAddress: '5000 Kahala Ave', postalCode: '96816', latitude: 21.2714, longitude: -157.7739 },
  { slug: 'honolulu-halepuna-waikiki-by-halekulani', price: '$395', streetAddress: '2233 Helumoa Rd', postalCode: '96815', latitude: 21.2789, longitude: -157.8306 },
  { slug: 'honolulu-prince-waikiki', price: '$380', streetAddress: '100 Holomoana St', postalCode: '96815', latitude: 21.2872, longitude: -157.8406 },
  { slug: 'honolulu-hyatt-regency-waikiki-beach-resort-spa', price: '$340', streetAddress: '2424 Kalakaua Ave', postalCode: '96815', latitude: 21.2764, longitude: -157.8250 },
  { slug: 'honolulu-alohilani-resort-waikiki-beach', price: '$375', streetAddress: '2490 Kalakaua Ave', postalCode: '96815', latitude: 21.2750, longitude: -157.8236 },
  { slug: 'honolulu-hilton-hawaiian-village-waikiki-beach-resort', price: '$310', streetAddress: '2005 Kalia Rd', postalCode: '96815', latitude: 21.2839, longitude: -157.8375 },
  { slug: 'honolulu-embassy-suites-by-hilton-waikiki-beach-walk', price: '$365', streetAddress: '201 Beach Walk', postalCode: '96815', latitude: 21.2797, longitude: -157.8308 },
  { slug: 'honolulu-hilton-waikiki-beach-resort-spa', price: '$295', streetAddress: '2500 Kuhio Ave', postalCode: '96815', latitude: 21.2753, longitude: -157.8222 },
  { slug: 'honolulu-ilikai-2127-spectacular-ocean-harbor-views', price: '$285', streetAddress: '1777 Ala Moana Blvd', postalCode: '96815', latitude: 21.2847, longitude: -157.8389 },
  { slug: 'honolulu-aston-at-the-executive-centre-hotel', price: '$238', streetAddress: '1088 Bishop St', postalCode: '96813', latitude: 21.3103, longitude: -157.8617 },
  { slug: 'honolulu-wayfinder-waikiki', price: '$225', streetAddress: '2375 Ala Wai Blvd', postalCode: '96815', latitude: 21.2792, longitude: -157.8247 },
  { slug: 'honolulu-pacific-monarch-hotel', price: '$215', streetAddress: '2427 Kuhio Ave', postalCode: '96815', latitude: 21.2761, longitude: -157.8239 },
  { slug: 'honolulu-waikiki-malia', price: '$195', streetAddress: '2211 Kuhio Ave', postalCode: '96815', latitude: 21.2800, longitude: -157.8283 },
  { slug: 'honolulu-white-sands-hotel', price: '$185', streetAddress: '431 Nohonani St', postalCode: '96815', latitude: 21.2806, longitude: -157.8267 },

  // --- MAUI ---
  { slug: 'maui-the-ritz-carlton-maui-kapalua', price: '$950', streetAddress: '1 Ritz Carlton Dr', postalCode: '96761', latitude: 21.0028, longitude: -156.6547 },
  { slug: 'maui-andaz-maui-at-wailea-resort', price: '$890', streetAddress: '3550 Wailea Alanui Dr', postalCode: '96753', latitude: 20.6947, longitude: -156.4436 },
  { slug: 'maui-hotel-wailea-maui', price: '$840', streetAddress: '555 Kaukahi St', postalCode: '96753', latitude: 20.6792, longitude: -156.4361 },
  { slug: 'maui-wailea-beach-resort', price: '$780', streetAddress: '3700 Wailea Alanui Dr', postalCode: '96753', latitude: 20.6869, longitude: -156.4422 },
  { slug: 'maui-hana-maui-resort-a-destination-by-hyatt-residence', price: '$675', streetAddress: '5031 Hana Hwy', postalCode: '96713', latitude: 20.7553, longitude: -155.9864 },
  { slug: 'maui-sheraton-maui-resort-spa', price: '$540', streetAddress: '2605 Kaanapali Pkwy', postalCode: '96761', latitude: 20.9264, longitude: -156.6975 },
  { slug: 'maui-hyatt-regency-maui-resort-spa', price: '$520', streetAddress: '200 Nohea Kai Dr', postalCode: '96761', latitude: 20.9167, longitude: -156.6933 },
  { slug: 'maui-hilton-grand-vacations-club-maui-bay-villas', price: '$475', streetAddress: '575 S Kihei Rd', postalCode: '96753', latitude: 20.7672, longitude: -156.4633 },
  { slug: 'maui-residence-inn-by-marriott-maui-wailea', price: '$460', streetAddress: '75 Wailea Ike Dr', postalCode: '96753', latitude: 20.6883, longitude: -156.4383 },
  { slug: 'maui-lumeria-maui-wellness-retreat-center', price: '$390', streetAddress: '1813 Baldwin Ave', postalCode: '96768', latitude: 20.8719, longitude: -156.3386 },
  { slug: 'maui-maui-coast-hotel', price: '$345', streetAddress: '2259 S Kihei Rd', postalCode: '96753', latitude: 20.7297, longitude: -156.4478 },
  { slug: 'maui-aston-kaanapali-shores', price: '$335', streetAddress: '3361 Lower Honoapiilani Rd', postalCode: '96761', latitude: 20.9547, longitude: -156.6908 },
  { slug: 'maui-aston-maui-hill', price: '$310', streetAddress: '2880 S Kihei Rd', postalCode: '96753', latitude: 20.7139, longitude: -156.4444 },
  { slug: 'maui-courtyard-by-marriott-maui-kahului-airport', price: '$290', streetAddress: '532 Keolani Pl', postalCode: '96732', latitude: 20.8931, longitude: -156.4428 },
  { slug: 'maui-aston-at-the-maui-banyan', price: '$260', streetAddress: '2575 S Kihei Rd', postalCode: '96753', latitude: 20.7208, longitude: -156.4472 },

  // --- NAPA ---
  { slug: 'napa-sttupa-estate-napa-valley', price: '$590', streetAddress: 'Atlas Peak Rd', postalCode: '94558', latitude: 38.3842, longitude: -122.2592 },
  { slug: 'napa-bann-at-oak-knoll-napa', price: '$485', streetAddress: '1070 Oak Knoll Ave', postalCode: '94558', latitude: 38.3547, longitude: -122.3167 },
  { slug: 'napa-the-westin-verasa-napa', price: '$460', streetAddress: '1314 McKinstry St', postalCode: '94559', latitude: 38.3039, longitude: -122.2806 },
  { slug: 'napa-senza-hotel', price: '$440', streetAddress: '4066 Howard Ln', postalCode: '94558', latitude: 38.3414, longitude: -122.3278 },
  { slug: 'napa-the-meritage-resort-and-spa', price: '$395', streetAddress: '875 Bordeaux Way', postalCode: '94558', latitude: 38.2483, longitude: -122.2764 },
  { slug: 'napa-casa-mani-resort-napa-valley-curio-collection-by-hilton', price: '$380', streetAddress: '853 Bordeaux Way', postalCode: '94558', latitude: 38.2489, longitude: -122.2778 },
  { slug: 'napa-the-knoll-hotel-napa-valley-tapestry-collection-by-hilt', price: '$325', streetAddress: '3131 California Blvd', postalCode: '94558', latitude: 38.3242, longitude: -122.2986 },
  { slug: 'napa-elm-house-inn', price: '$275', streetAddress: '800 California Blvd', postalCode: '94559', latitude: 38.2981, longitude: -122.2917 },
  { slug: 'napa-hotel-indigo-napa-valley-by-ihg', price: '$265', streetAddress: '4133 Solano Ave', postalCode: '94558', latitude: 38.3431, longitude: -122.3308 },
  { slug: 'napa-riverpointe-napa-valley-resort', price: '$230', streetAddress: '500 Lincoln Ave', postalCode: '94558', latitude: 38.3147, longitude: -122.2858 },
  { slug: 'napa-springhill-suites-napa-valley', price: '$220', streetAddress: '101 Gateway Rd E', postalCode: '94558', latitude: 38.2281, longitude: -122.2719 },
  { slug: 'napa-hampton-inn-suites', price: '$215', streetAddress: '945 Hartle Ct', postalCode: '94559', latitude: 38.2919, longitude: -122.2789 },
  { slug: 'napa-napa-winery-inn', price: '$195', streetAddress: '1998 Trower Ave', postalCode: '94558', latitude: 38.3325, longitude: -122.3161 },
  { slug: 'napa-hawthorn-suites-by-wyndham-napa-valley', price: '$185', streetAddress: '314 Soscol Ave', postalCode: '94559', latitude: 38.2869, longitude: -122.2750 },
  { slug: 'napa-goodspring-motel', price: '$165', streetAddress: '1580 Lincoln Ave', postalCode: '94558', latitude: 38.3106, longitude: -122.2711 },

  // --- ASPEN ---
  { slug: 'aspen-the-sky-residences-at-w-aspen', price: '$1,150', streetAddress: '550 S Spring St', postalCode: '81611', latitude: 39.1864, longitude: -106.8208 },
  { slug: 'aspen-white-elephant-aspen', price: '$850', streetAddress: '517 E Hopkins Ave', postalCode: '81611', latitude: 39.1894, longitude: -106.8172 },
  { slug: 'aspen-spacious-3-3-in-aspen-s-core-with-sauna', price: '$620', streetAddress: 'E Hyman Ave', postalCode: '81611', latitude: 39.1897, longitude: -106.8189 },
  { slug: 'aspen-aspen-square-condominium-hotel', price: '$580', streetAddress: '617 E Cooper Ave', postalCode: '81611', latitude: 39.1883, longitude: -106.8167 },
  { slug: 'aspen-center-of-aspen-1-br', price: '$490', streetAddress: 'E Main St', postalCode: '81611', latitude: 39.1917, longitude: -106.8183 },
  { slug: 'aspen-timberline-condominiums-1-bedroom-premier-unit-d2b', price: '$445', streetAddress: '690 Carriage Way', postalCode: '81615', latitude: 39.2089, longitude: -106.9536 },
  { slug: 'aspen-crestwood-2105-deluxe-1-bedroom', price: '$415', streetAddress: '400 Wood Rd', postalCode: '81615', latitude: 39.2114, longitude: -106.9567 },
  { slug: 'aspen-aspen-mountain-lodge', price: '$375', streetAddress: '311 W Main St', postalCode: '81611', latitude: 39.1931, longitude: -106.8247 },
  { slug: 'aspen-timberline-condominiums-studio-loft-deluxe-unit-314', price: '$365', streetAddress: '690 Carriage Way', postalCode: '81615', latitude: 39.2089, longitude: -106.9536 },
  { slug: 'aspen-timberline-condominiums-studio-deluxe-unit-118', price: '$355', streetAddress: '690 Carriage Way', postalCode: '81615', latitude: 39.2089, longitude: -106.9536 },
  { slug: 'aspen-timberline-condominiums-studio-standard-unit-216', price: '$340', streetAddress: '690 Carriage Way', postalCode: '81615', latitude: 39.2089, longitude: -106.9536 },
  { slug: 'aspen-timberline-condominiums-studio-loft-standard-unit-305', price: '$330', streetAddress: '690 Carriage Way', postalCode: '81615', latitude: 39.2089, longitude: -106.9536 },
  { slug: 'aspen-the-inn-at-aspen', price: '$310', streetAddress: '38750 CO-82', postalCode: '81611', latitude: 39.2228, longitude: -106.8581 },

  // --- KEY WEST ---
  { slug: 'key-west-hyatt-centric-key-west-resort-spa', price: '$475', streetAddress: '601 Front St', postalCode: '33040', latitude: 24.5606, longitude: -81.8061 },
  { slug: 'key-west-orchid-key-inn', price: '$395', streetAddress: '1004 Duval St', postalCode: '33040', latitude: 24.5492, longitude: -81.7967 },
  { slug: 'key-west-hyatt-vacation-club-at-windward-pointe', price: '$385', streetAddress: '3675 S Roosevelt Blvd', postalCode: '33040', latitude: 24.5517, longitude: -81.7483 },
  { slug: 'key-west-almond-tree-inn', price: '$380', streetAddress: '512 Truman Ave', postalCode: '33040', latitude: 24.5508, longitude: -81.7961 },
  { slug: 'key-west-paradise-inn', price: '$365', streetAddress: '819 Simonton St', postalCode: '33040', latitude: 24.5519, longitude: -81.7981 },
  { slug: 'key-west-the-mermaid-the-alligator', price: '$350', streetAddress: '729 Truman Ave', postalCode: '33040', latitude: 24.5503, longitude: -81.7936 },
  { slug: 'key-west-the-capitana-key-west', price: '$340', streetAddress: '2401 N Roosevelt Blvd', postalCode: '33040', latitude: 24.5681, longitude: -81.7719 },
  { slug: 'key-west-margaritaville-beach-house-key-west', price: '$325', streetAddress: '2001 S Roosevelt Blvd', postalCode: '33040', latitude: 24.5514, longitude: -81.7675 },
  { slug: 'key-west-southernmost-inn-adult-exclusive', price: '$310', streetAddress: '525 United St', postalCode: '33040', latitude: 24.5475, longitude: -81.7958 },
  { slug: 'key-west-the-cabana-inn-key-west', price: '$280', streetAddress: '413 Fleming St', postalCode: '33040', latitude: 24.5583, longitude: -81.8019 },
  { slug: 'key-west-the-artist-house', price: '$275', streetAddress: '534 Eaton St', postalCode: '33040', latitude: 24.5589, longitude: -81.8003 },
  { slug: 'key-west-blue-flamingo-resort-key-west', price: '$260', streetAddress: '3824 N Roosevelt Blvd', postalCode: '33040', latitude: 24.5714, longitude: -81.7564 },
  { slug: 'key-west-havana-cabana-at-key-west', price: '$245', streetAddress: '3420 N Roosevelt Blvd', postalCode: '33040', latitude: 24.5703, longitude: -81.7614 },
  { slug: 'key-west-new-orleans-house', price: '$240', streetAddress: '724 Duval St', postalCode: '33040', latitude: 24.5522, longitude: -81.7986 },
  { slug: 'key-west-hilton-garden-inn-key-west-the-keys-collection', price: '$210', streetAddress: '3930 N Roosevelt Blvd', postalCode: '33040', latitude: 24.5722, longitude: -81.7547 },

  // --- CHARLESTON ---
  { slug: 'charleston-the-charleston-place', price: '$580', streetAddress: '205 Meeting St', postalCode: '29401', latitude: 32.7806, longitude: -79.9325 },
  { slug: 'charleston-the-beach-club-at-charleston-harbor-resort-and-marina', price: '$425', streetAddress: '28 Patriots Point Rd', postalCode: '29464', latitude: 32.7911, longitude: -79.9042 },
  { slug: 'charleston-water-s-edge-inn', price: '$340', streetAddress: '79 Center St', postalCode: '29439', latitude: 32.6547, longitude: -79.9406 },
  { slug: 'charleston-full-townhouse-near-shem-creek-downtown-with-hot-tub', price: '$310', streetAddress: 'Shem Creek Area', postalCode: '29464', latitude: 32.7964, longitude: -79.8833 },
  { slug: 'charleston-harborside-at-charleston-harbor-resort-and-marina', price: '$295', streetAddress: '20 Patriots Point Rd', postalCode: '29464', latitude: 32.7906, longitude: -79.9036 },
  { slug: 'charleston-meeting-street-inn', price: '$285', streetAddress: '173 Meeting St', postalCode: '29401', latitude: 32.7792, longitude: -79.9317 },
  { slug: 'charleston-charleston-oasis-with-hot-tub-mins-to-dtwn', price: '$270', streetAddress: 'West Ashley', postalCode: '29407', latitude: 32.7850, longitude: -79.9800 },
  { slug: 'charleston-courtyard-charleston-waterfront', price: '$230', streetAddress: '35 Lockwood Dr', postalCode: '29401', latitude: 32.7758, longitude: -79.9575 },
  { slug: 'charleston-courtyard-charleston-mount-pleasant', price: '$210', streetAddress: '1251 Woodland Way', postalCode: '29464', latitude: 32.8136, longitude: -79.8653 },
  { slug: 'charleston-residence-inn-charleston-riverview', price: '$195', streetAddress: '90 Ripley Point Dr', postalCode: '29407', latitude: 32.7761, longitude: -79.9619 },
  { slug: 'charleston-drury-plaza-hotel-north-charleston', price: '$185', streetAddress: '2934 W Montague Ave', postalCode: '29418', latitude: 32.8683, longitude: -80.0147 },
  { slug: 'charleston-springhill-suites-by-marriott-charleston-riverview', price: '$175', streetAddress: '98 Ripley Point Dr', postalCode: '29407', latitude: 32.7764, longitude: -79.9625 },
  { slug: 'charleston-holiday-inn-express-suites-charleston-arpt-conv-ctr-are', price: '$160', streetAddress: '3025 W Montague Ave', postalCode: '29418', latitude: 32.8697, longitude: -80.0161 },
  { slug: 'charleston-fairfield-inn-and-suites-charleston-north-university-ar', price: '$155', streetAddress: '2540 Northbridge Park Dr', postalCode: '29406', latitude: 32.9367, longitude: -80.0461 },
  { slug: 'charleston-country-inn-suites-by-radisson-charleston-north-sc', price: '$145', streetAddress: '7429 Northside Dr', postalCode: '29420', latitude: 32.9467, longitude: -80.0700 },

  // --- SAN FRANCISCO ---
  { slug: 'san-francisco-the-st-regis-san-francisco', price: '$590', streetAddress: '125 3rd St', postalCode: '94103', latitude: 37.7858, longitude: -122.4011 },
  { slug: 'san-francisco-the-ritz-carlton-san-francisco', price: '$545', streetAddress: '600 Stockton St', postalCode: '94108', latitude: 37.7922, longitude: -122.4069 },
  { slug: 'san-francisco-fairmont-san-francisco', price: '$460', streetAddress: '950 Mason St', postalCode: '94108', latitude: 37.7925, longitude: -122.4108 },
  { slug: 'san-francisco-1-hotel-san-francisco', price: '$425', streetAddress: '8 Mission St', postalCode: '94105', latitude: 37.7928, longitude: -122.3931 },
  { slug: 'san-francisco-palace-hotel-a-luxury-collection-hotel-san-francisco', price: '$345', streetAddress: '2 New Montgomery St', postalCode: '94105', latitude: 37.7881, longitude: -122.4019 },

  // --- AUSTIN ---
  { slug: 'austin-hotel-saint-cecilia-austin', price: '$680', streetAddress: '112 Academy Dr', postalCode: '78704', latitude: 30.2522, longitude: -97.7478 },
  { slug: 'austin-commodore-perry-estate-auberge-resorts-collection-austin', price: '$620', streetAddress: '4100 Red River St', postalCode: '78751', latitude: 30.2989, longitude: -97.7214 },
  { slug: 'austin-four-seasons-hotel-austin', price: '$595', streetAddress: '98 San Jacinto Blvd', postalCode: '78701', latitude: 30.2625, longitude: -97.7428 },
  { slug: 'austin-austin-proper-hotel-residences', price: '$475', streetAddress: '600 W 2nd St', postalCode: '78701', latitude: 30.2661, longitude: -97.7497 },
  { slug: 'austin-the-driskill-in-the-unbound-collection-by-hyatt-austin', price: '$340', streetAddress: '604 Brazos St', postalCode: '78701', latitude: 30.2683, longitude: -97.7411 },

  // --- SEATTLE ---
  { slug: 'seattle-four-seasons-hotel-seattle', price: '$640', streetAddress: '99 Union St', postalCode: '98101', latitude: 47.6075, longitude: -122.3392 },
  { slug: 'seattle-lotte-hotel-seattle', price: '$410', streetAddress: '809 5th Ave', postalCode: '98104', latitude: 47.6053, longitude: -122.3314 },
  { slug: 'seattle-inn-at-the-market-seattle', price: '$395', streetAddress: '86 Pine St', postalCode: '98101', latitude: 47.6094, longitude: -122.3414 },
  { slug: 'seattle-the-edgewater-hotel-seattle', price: '$385', streetAddress: '2411 Alaskan Way', postalCode: '98121', latitude: 47.6128, longitude: -122.3533 },
  { slug: 'seattle-thompson-seattle', price: '$345', streetAddress: '110 Stewart St', postalCode: '98101', latitude: 47.6106, longitude: -122.3417 },

  // --- NASHVILLE ---
  { slug: 'nashville-four-seasons-hotel-nashville', price: '$610', streetAddress: '100 Demonbreun St', postalCode: '37201', latitude: 36.1603, longitude: -86.7739 },
  { slug: 'nashville-the-hermitage-hotel-nashville', price: '$485', streetAddress: '231 6th Ave N', postalCode: '37219', latitude: 36.1644, longitude: -86.7825 },
  { slug: 'nashville-1-hotel-nashville', price: '$440', streetAddress: '710 Demonbreun St', postalCode: '37203', latitude: 36.1564, longitude: -86.7811 },
  { slug: 'nashville-the-joseph-a-luxury-collection-hotel-nashville', price: '$425', streetAddress: '401 Korean Veterans Blvd', postalCode: '37201', latitude: 36.1561, longitude: -86.7753 },
  { slug: 'nashville-jw-marriott-nashville', price: '$365', streetAddress: '201 8th Ave S', postalCode: '37203', latitude: 36.1567, longitude: -86.7828 },

  // --- BALTIMORE ---
  { slug: 'four-seasons-baltimore-baltimore', price: '$460', streetAddress: '200 International Dr', postalCode: '21202', latitude: 39.2825, longitude: -76.6022 },
  { slug: '1840s-carrollton-inn-baltimore', price: '$245', streetAddress: '50 Albemarle St', postalCode: '21202', latitude: 39.2878, longitude: -76.6033 },
  { slug: 'the-royal-sonesta-harbor-court-baltimore-baltimore', price: '$215', streetAddress: '550 Light St', postalCode: '21202', latitude: 39.2839, longitude: -76.6133 },

  // --- KANSAS CITY ---
  { slug: 'loews-kansas-city-hotel-kansas-city', price: '$275', streetAddress: '1515 Wyandotte St', postalCode: '64108', latitude: 39.0950, longitude: -94.5864 },
  { slug: 'the-westin-kansas-city-at-crown-center-kansas-city', price: '$210', streetAddress: '1 E Pershing Rd', postalCode: '64108', latitude: 39.0839, longitude: -94.5842 },
  { slug: 'drury-inn-suites-kansas-city-airport-kansas-city', price: '$155', streetAddress: '7900 NW Tiffany Springs Pkwy', postalCode: '64153', latitude: 39.2789, longitude: -94.6719 },

  // --- NEW ORLEANS ---
  { slug: 'new-orleans-the-windsor-court', price: '$380', streetAddress: '300 Gravier St', postalCode: '70130', latitude: 29.9497, longitude: -90.0658 },
  { slug: 'new-orleans-maison-de-la-luz', price: '$420', streetAddress: '546 Carondelet St', postalCode: '70130', latitude: 29.9492, longitude: -90.0711 },
  { slug: 'new-orleans-the-roosevelt-waldorf-astoria', price: '$310', streetAddress: '130 Roosevelt Way', postalCode: '70112', latitude: 29.9536, longitude: -90.0717 },
  { slug: 'new-orleans-the-ritz-carlton-new-orleans', price: '$465', streetAddress: '921 Canal St', postalCode: '70112', latitude: 29.9542, longitude: -90.0697 },
  { slug: 'new-orleans-hotel-monteleone-french-quarter-new-orleans', price: '$295', streetAddress: '214 Royal St', postalCode: '70130', latitude: 29.9547, longitude: -90.0669 },
];

async function run() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI);
  const collection = mongoose.connection.collection('hotels');

  // 1. Delete misplaced listings in SF and New Orleans
  const deleteResult = await collection.deleteMany({
    slug: {
      $in: [
        'luxury-stay-in-kharadi-near-eon-san-francisco-1124',
        'spacious-4br-with-private-patio-banafseg-villas-san-francisco-4576',
        'livora-luxe-studio-near-medanta-hospital-sec-39-san-francisco-9141',
        'pool-hottub-sauna-5-min-to-joshuatree-np-dt-new-orleans-1806',
        'bide-in-the-trees-romantic-treehouse-100-skywalk-new-orleans-2829'
      ]
    }
  });
  console.log(`Deleted ${deleteResult.deletedCount} misplaced non-metro listings.`);

  // 2. Apply updates to the clustered hotels
  let updatedCount = 0;
  for (const item of UPDATES) {
    const { slug, ...fields } = item;
    const res = await collection.updateOne(
      { slug },
      { $set: { ...fields, updatedAt: new Date() } }
    );
    if (res.matchedCount > 0) {
      updatedCount++;
    } else {
      console.warn(`No match found for slug: ${slug}`);
    }
  }

  console.log(`Successfully updated ${updatedCount} clustered hotels with calibrated pricing and geo coordinates.`);
  await mongoose.disconnect();
}

run().catch(console.error);
