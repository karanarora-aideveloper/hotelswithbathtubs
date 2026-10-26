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
];

export const DUPLICATE_DROP_SLUGS = new Set(DUPLICATE_HOTELS.map((p) => p.dropSlug));

export function isDuplicateDropSlug(slug?: string | null): boolean {
  if (!slug) return false;
  return DUPLICATE_DROP_SLUGS.has(slug);
}
