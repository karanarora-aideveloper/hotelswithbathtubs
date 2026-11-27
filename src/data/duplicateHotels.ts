/**
 * US Hotel Duplicates (Round 7 Audit M1)
 *
 * 14 US hotels exist twice in the database under two different URLs.
 * In code, we hide the duplicate copy everywhere and 301 redirect it
 * to the canonical copy we keep.
 */

import duplicates from './duplicateHotels.json';

export interface DuplicateHotelPair {
  city: string;
  citySlug: string;
  keepSlug: string;
  dropSlug: string;
}

// The list lives in duplicateHotels.json so build scripts on Node 20 can read it too.
export const DUPLICATE_HOTELS: DuplicateHotelPair[] = duplicates;

export const DUPLICATE_DROP_SLUGS = new Set(DUPLICATE_HOTELS.map((p) => p.dropSlug));

export function isDuplicateDropSlug(slug?: string | null): boolean {
  if (!slug) return false;
  return DUPLICATE_DROP_SLUGS.has(slug);
}
