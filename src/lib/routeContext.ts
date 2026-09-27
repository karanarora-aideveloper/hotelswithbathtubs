export interface RouteContext {
  page_type: 'homepage' | 'country_hub' | 'city_listings' | 'hotel_detail' | 'blog_index' | 'blog_post' | 'admin' | 'other';
  country?: string;
  city?: string;
  hotel?: string;
  blog_slug?: string;
}

export function getRouteContext(path: string): RouteContext {
  const parts = path.split('/').filter(Boolean);
  if (parts.length === 0) {
    return { page_type: 'homepage' };
  }

  if (parts[0] === 'blog') {
    if (parts.length > 1) {
      return { page_type: 'blog_post', blog_slug: parts[1] };
    }
    return { page_type: 'blog_index' };
  }

  if (parts[0] === 'admin' || parts[0] === 'api') {
    return { page_type: 'admin' };
  }

  if (parts.length === 1) {
    return { page_type: 'country_hub', country: parts[0] };
  }

  if (parts.length === 2) {
    return { page_type: 'city_listings', country: parts[0], city: parts[1] };
  }

  if (parts.length === 3) {
    return { page_type: 'hotel_detail', country: parts[0], city: parts[1], hotel: parts[2] };
  }

  return { page_type: 'other' };
}
