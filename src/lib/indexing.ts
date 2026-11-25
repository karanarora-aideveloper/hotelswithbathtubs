import { isHotelConfirmed } from '@/lib/hotelText';

// GROWTH-FIX1 (25 Nov 2026, founder approved): pages that Google sees as thin or unproven are
// kept on the site for visitors but marked noindex and left out of the sitemaps.
// Keep scripts/generate-split-sitemaps.mjs in step with these rules.

/** City and jacuzzi pages need at least this many hotels to be indexed. */
export const MIN_HOTELS_TO_INDEX = 3;
export const shouldIndexDestination = (hotelCount: number): boolean => hotelCount >= MIN_HOTELS_TO_INDEX;

/**
 * A hotel page is indexed when its bathtub is confirmed with recorded proof, or when it is a
 * legacy USA/India listing (no import yet). Not indexed: imported hotels whose check recorded
 * no tub, and unproven hotels in every other country.
 */
export function shouldIndexHotel(
  hotel: { importBatch?: string | null; bookingTubLabels?: string[] | null; bathtubConfirmed?: boolean | null } | null | undefined,
  countrySlug: string
): boolean {
  if (!hotel) return false;
  if (isHotelConfirmed(hotel)) return true;
  if (hotel.importBatch) return false;
  return countrySlug === 'usa' || countrySlug === 'india';
}
