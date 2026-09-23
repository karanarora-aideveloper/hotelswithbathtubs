import { MetadataRoute } from 'next';
import connectToDatabase from '@/lib/mongodb';
import Hotel from '@/models/Hotel';
import Blog from '@/models/Blog';
import { slugify, resolveCountry } from '@/lib/utils';

export const dynamic = 'force-static';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.hotelswithbathtubs.com';
  const fallbackDate = new Date('2026-09-08T00:00:00.000Z');

  try {
    await connectToDatabase();

    // 1. Fetch distinct country/city combinations and track actual update timestamps
    const hotels = await Hotel.find({ flagged: { $ne: true } }).select('country city updatedAt -_id');

    const countryLastMod = new Map<string, Date>();
    const locationLastMod = new Map<string, Date>();
    const locationHotelCount = new Map<string, number>();

    // Canonical mapping for consolidated neighborhoods to prevent emitting 301 redirects in sitemap
    const neighborhoodCanonicalMap: Record<string, string> = {
      'calangute': 'goa',
      'panjim': 'goa',
      'koramangala': 'bangalore',
      'mahipalpur': 'delhi',
      'paharganj': 'delhi',
    };

    for (const h of hotels) {
      if (!h.city || !h.country) continue;
      const countryInfo = resolveCountry(h.country);
      let citySlug = slugify(h.city);
      if (neighborhoodCanonicalMap[citySlug]) {
        citySlug = neighborhoodCanonicalMap[citySlug];
      }
      if (!countryInfo.slug || !citySlug) continue;

      const locKey = `${countryInfo.slug}/${citySlug}`;
      const hotelUpdated = h.updatedAt ? new Date(h.updatedAt) : fallbackDate;

      // Track hotel count for thin-destination filtering
      locationHotelCount.set(locKey, (locationHotelCount.get(locKey) || 0) + 1);

      // Track latest update for country hub
      const currCountryDate = countryLastMod.get(countryInfo.slug);
      if (!currCountryDate || hotelUpdated > currCountryDate) {
        countryLastMod.set(countryInfo.slug, hotelUpdated);
      }

      // Track latest update for city destination
      const currLocDate = locationLastMod.get(locKey);
      if (!currLocDate || hotelUpdated > currLocDate) {
        locationLastMod.set(locKey, hotelUpdated);
      }
    }

    // Country Hub Routes
    const countryRoutes = Array.from(countryLastMod.keys()).map(countrySlug => ({
      url: `${baseUrl}/${countrySlug}`,
      lastModified: countryLastMod.get(countrySlug) || fallbackDate,
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    }));

    // City Destination Routes (include all destinations with at least 1 verified hotel)
    const locationRoutes = Array.from(locationLastMod.keys())
      .filter(location => (locationHotelCount.get(location) || 0) >= 1)
      .map(location => ({
        url: `${baseUrl}/${location}`,
        lastModified: locationLastMod.get(location) || fallbackDate,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));

    // 2. Fetch all published blogs
    const blogs = await Blog.find({ published: true }).select('slug updatedAt date -_id');
    
    const blogRoutes = blogs
      .filter(blog => blog.slug && blog.slug.trim() !== '')
      .map(blog => ({
        url: `${baseUrl}/blog/${blog.slug}`,
        lastModified: blog.updatedAt ? new Date(blog.updatedAt) : fallbackDate,
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      }));

    // 3. Define static routes with genuine revision timestamps
    const staticRoutes = [
      {
        url: `${baseUrl}`,
        lastModified: new Date('2026-09-08T00:00:00.000Z'),
        changeFrequency: 'daily' as const,
        priority: 1.0,
      },
      {
        url: `${baseUrl}/blog`,
        lastModified: new Date('2026-09-08T00:00:00.000Z'),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      },
      {
        url: `${baseUrl}/about`,
        lastModified: new Date('2026-09-08T00:00:00.000Z'),
        changeFrequency: 'monthly' as const,
        priority: 0.5,
      },
      {
        url: `${baseUrl}/affiliate-policy`,
        lastModified: new Date('2026-09-08T00:00:00.000Z'),
        changeFrequency: 'yearly' as const,
        priority: 0.3,
      },
      {
        url: `${baseUrl}/privacy`,
        lastModified: new Date('2026-08-01T00:00:00.000Z'),
        changeFrequency: 'yearly' as const,
        priority: 0.3,
      },
      {
        url: `${baseUrl}/terms`,
        lastModified: new Date('2026-08-01T00:00:00.000Z'),
        changeFrequency: 'yearly' as const,
        priority: 0.3,
      },
      {
        url: `${baseUrl}/cookies`,
        lastModified: new Date('2026-08-01T00:00:00.000Z'),
        changeFrequency: 'yearly' as const,
        priority: 0.3,
      },
    ];

    return [...staticRoutes, ...countryRoutes, ...locationRoutes, ...blogRoutes];
  } catch (error) {
    console.error('Failed to build dynamic sitemap:', error);
    // Fallback static sitemap if DB is unreachable
    return [
      { url: `${baseUrl}`, lastModified: fallbackDate, changeFrequency: 'daily' as const, priority: 1.0 },
      { url: `${baseUrl}/blog`, lastModified: fallbackDate, changeFrequency: 'weekly' as const, priority: 0.8 },
      { url: `${baseUrl}/about`, lastModified: fallbackDate, changeFrequency: 'monthly' as const, priority: 0.5 },
      { url: `${baseUrl}/affiliate-policy`, lastModified: fallbackDate, changeFrequency: 'yearly' as const, priority: 0.3 },
    ];
  }
}
