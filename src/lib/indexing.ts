// A destination page is only worth indexing (and listing in the sitemap) with at least this many
// hotels. Pages and the sitemap must use this one helper so they can never disagree.
export const MIN_HOTELS_TO_INDEX = 2;
export const shouldIndexDestination = (hotelCount: number): boolean => hotelCount >= MIN_HOTELS_TO_INDEX;
