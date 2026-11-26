/**
 * US Hotel Duplicates (Round 7 Audit M1)
 *
 * 14 US hotels exist twice in the database under two different URLs.
 * In code, we hide the duplicate copy everywhere and 301 redirect it
 * to the canonical copy we keep.
 */

export interface DuplicateHotelPair {
  city: string;
  citySlug: string;
  keepSlug: string;
  dropSlug: string;
}

export const DUPLICATE_HOTELS: DuplicateHotelPair[] = [
  {
    city: 'Austin',
    citySlug: 'austin',
    keepSlug: 'hotel-saint-cecilia-austin',
    dropSlug: 'austin-hotel-saint-cecilia-austin',
  },
  {
    city: 'Austin',
    citySlug: 'austin',
    keepSlug: 'austin-the-driskill-in-the-unbound-collection-by-hyatt-austin',
    dropSlug: 'the-driskill-austin',
  },
  {
    city: 'San Diego',
    citySlug: 'san-diego',
    keepSlug: 'san-diego-fairmont-grand-del-mar',
    dropSlug: 'fairmont-grand-del-mar-san-diego',
  },
  {
    city: 'San Diego',
    citySlug: 'san-diego',
    keepSlug: 'rancho-valencia-resort-san-diego',
    dropSlug: 'san-diego-rancho-valencia-resort-spa',
  },
  {
    city: 'Lake Tahoe',
    citySlug: 'lake-tahoe',
    keepSlug: 'desolation-hotel-south-lake-tahoe-lake-tahoe',
    dropSlug: 'desolation-hotel-lake-tahoe',
  },
  {
    city: 'Lake Tahoe',
    citySlug: 'lake-tahoe',
    keepSlug: 'the-landing-resort-spa-south-lake-tahoe-lake-tahoe',
    dropSlug: 'the-landing-resort-spa-lake-tahoe',
  },
  {
    city: 'Seattle',
    citySlug: 'seattle',
    keepSlug: 'seattle-inn-at-the-market-seattle',
    dropSlug: 'inn-at-the-market-seattle',
  },
  {
    city: 'Seattle',
    citySlug: 'seattle',
    keepSlug: 'seattle-thompson-seattle',
    dropSlug: 'thompson-seattle',
  },
  {
    city: 'Nashville',
    citySlug: 'nashville',
    keepSlug: 'nashville-the-joseph-a-luxury-collection-hotel-nashville',
    dropSlug: 'the-joseph-luxury-collection-nashville',
  },
  {
    city: 'Orlando',
    citySlug: 'orlando',
    keepSlug: 'disney-s-grand-floridian-resort-spa-orlando',
    dropSlug: 'disneys-grand-floridian-resort-orlando',
  },
  {
    city: 'Scottsdale',
    citySlug: 'scottsdale',
    keepSlug: 'fairmont-scottsdale-princess-scottsdale',
    dropSlug: 'fairmont-scottsdale-princess',
  },
  {
    city: 'Scottsdale',
    citySlug: 'scottsdale',
    keepSlug: 'omni-scottsdale-resort-spa-at-montelucia-scottsdale',
    dropSlug: 'omni-scottsdale-resort-montelucia',
  },
  {
    city: 'San Francisco',
    citySlug: 'san-francisco',
    keepSlug: 'san-francisco-1-hotel-san-francisco',
    dropSlug: '1-hotel-san-francisco',
  },
  {
    city: 'San Francisco',
    citySlug: 'san-francisco',
    keepSlug: 'san-francisco-palace-hotel-a-luxury-collection-hotel-san-francisco',
    dropSlug: 'palace-hotel-san-francisco',
  },
  // DUP-BOOKING1 (26 Nov 2026): the same property listed twice, found because both copies share one
  // Booking.com page. citySlug is the kept copy's town; the dropped copy may sit in a neighbouring town.
  {
    city: 'Scottsdale',
    citySlug: 'scottsdale',
    keepSlug: 'the-phoenician-a-luxury-collection-resort-scottsdale-scottsdale',
    dropSlug: 'the-phoenician-resort-phoenix',
  },
  {
    city: 'South Lake Tahoe',
    citySlug: 'south-lake-tahoe',
    keepSlug: 'desolation-hotel-south-lake-tahoe',
    dropSlug: 'desolation-hotel-south-lake-tahoe-lake-tahoe',
  },
  {
    city: 'South Lake Tahoe',
    citySlug: 'south-lake-tahoe',
    keepSlug: 'marriotts-timber-lodge-south-lake-tahoe',
    dropSlug: 'marriotts-timber-lodge-lake-tahoe',
  },
  {
    city: 'Dharamshala',
    citySlug: 'dharamshala',
    keepSlug: 'fortune-park-moksha-dharamshala',
    dropSlug: 'fortune-park-moksha-mcleodganj',
  },
  {
    city: 'Dharamshala',
    citySlug: 'dharamshala',
    keepSlug: 'norbu-the-montanna-ihcl-seleqtions-dharamshala',
    dropSlug: 'norbu-the-montanna-mcleodganj-ihcl-seleqtions-mcleodganj',
  },
  {
    city: 'Ajmer',
    citySlug: 'ajmer',
    keepSlug: 'pratap-mahal-ajmer-ihcl-seleqtions-ajmer',
    dropSlug: 'pratap-mahal-pushkar-ihcl-seleqtions-pushkar',
  },
  {
    city: 'Jagdalpur',
    citySlug: 'jagdalpur',
    keepSlug: 'bastar-jungle-resort-jagdalpur',
    dropSlug: 'bastar-jungle-resort-chitrakote',
  },
  {
    city: 'Ilulissat',
    citySlug: 'ilulissat',
    keepSlug: 'ilulissat-ilulissat-harbour-stay',
    dropSlug: 'ilulissat-ilulissat-stay',
  },
  {
    city: 'Lonavala',
    citySlug: 'lonavala',
    keepSlug: 'juvana-resort-spa-aamby-valley-city-lonavala',
    dropSlug: 'aamby-valley-city-lonavala',
  },
];

export const DUPLICATE_DROP_SLUGS = new Set(DUPLICATE_HOTELS.map((p) => p.dropSlug));

export function isDuplicateDropSlug(slug?: string | null): boolean {
  if (!slug) return false;
  return DUPLICATE_DROP_SLUGS.has(slug);
}
