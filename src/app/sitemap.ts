import { MetadataRoute } from 'next';
import { shouldIndexDestination } from '@/lib/indexing';
import connectToDatabase from '@/lib/mongodb';
import Hotel from '@/models/Hotel';
import Blog from '@/models/Blog';
import { slugify, resolveCountry } from '@/lib/utils';
import { getAllStateSlugs } from '@/lib/usStates';
import fs from 'node:fs';
import path from 'node:path';

export const dynamic = 'force-static';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.hotelswithbathtubs.com';

  try {
    // 1. Fetch hotels with country, city, slug, name, and updatedAt
    // Use .cache/all-hotels.json if available for instant build performance
    let hotels: any[] = [];
    const cachePath = path.join(process.cwd(), '.cache', 'all-hotels.json');
    if (fs.existsSync(cachePath)) {
      try {
        hotels = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
      } catch {
        hotels = [];
      }
    }

    if (!hotels.length) {
      await connectToDatabase();
      hotels = await Hotel.find({ flagged: { $ne: true } })
        .select('country city slug name updatedAt image -_id')
        .lean();
    }

    const countryLastMod = new Map<string, Date>();
    const locationLastMod = new Map<string, Date>();
    const locationHotelCount = new Map<string, number>();
    const locationJacuzziCount = new Map<string, number>();
    const hotelRoutes: MetadataRoute.Sitemap = [];
    const seenHotelUrls = new Set<string>();

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
      const hotelUpdated = h.updatedAt ? new Date(h.updatedAt) : null;

      // Track hotel count for thin-destination filtering
      locationHotelCount.set(locKey, (locationHotelCount.get(locKey) || 0) + 1);

      // Track jacuzzi hotels
      const isJacuzzi = (h.tubType && /jacuzzi|whirlpool|hot tub|jet/i.test(h.tubType)) ||
        (Array.isArray(h.amenities) && h.amenities.some((a: string) => /jacuzzi|hot tub|whirlpool/i.test(a)));
      if (isJacuzzi) {
        locationJacuzziCount.set(locKey, (locationJacuzziCount.get(locKey) || 0) + 1);
      }

      // Track latest update for country hub
      if (hotelUpdated) {
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

      // Track individual hotel entity route
      const hotelSlug = slugify(h.slug || h.name);
      if (hotelSlug) {
        const hotelUrl = `${baseUrl}/${countryInfo.slug}/${citySlug}/${hotelSlug}`;
        if (!seenHotelUrls.has(hotelUrl)) {
          seenHotelUrls.add(hotelUrl);
          hotelRoutes.push({
            url: hotelUrl,
            ...(hotelUpdated ? { lastModified: hotelUpdated } : {}),
            priority: 0.65,
          });
        }
      }
    }

    // Country Hub Routes
    const countryRoutes = Array.from(countryLastMod.keys()).map(countrySlug => ({
      url: `${baseUrl}/${countrySlug}`,
      ...(countryLastMod.get(countrySlug) ? { lastModified: countryLastMod.get(countrySlug)! } : {}),
      priority: 0.85,
    }));

    // US State Hub Routes (High-intent regional hubs)
    // No `new Date()` fallback: a date that changes on every build teaches Google to ignore lastmod.
    const usaLastMod = countryLastMod.get('usa');
    const stateRoutes = getAllStateSlugs().map(slug => ({
      url: `${baseUrl}/usa/${slug}`,
      ...(usaLastMod ? { lastModified: usaLastMod } : {}),
      priority: 0.85,
    }));

    // City Destination Routes (strictly match [city]/page.tsx index threshold >= 2 hotels to prevent GSC noindex submission errors)
    const locationRoutes = Array.from(locationLastMod.keys())
      .filter(location => shouldIndexDestination(locationHotelCount.get(location) || 0))
      .map(location => ({
        url: `${baseUrl}/${location}`,
        ...(locationLastMod.get(location) ? { lastModified: locationLastMod.get(location)! } : {}),
        priority: 0.8,
      }));

    // Programmatic Jacuzzi Sub-page Routes (match jacuzzi/page.tsx index threshold >= 2 hotels)
    const jacuzziRoutes = Array.from(locationJacuzziCount.keys())
      .filter(location => shouldIndexDestination(locationJacuzziCount.get(location) || 0))
      .map(location => ({
        url: `${baseUrl}/${location}/jacuzzi`,
        ...(locationLastMod.get(location) ? { lastModified: locationLastMod.get(location)! } : {}),
        priority: 0.8,
      }));

    // 2. Fetch all published blogs
    let blogs: any[] = [];
    const blogCachePath = path.join(process.cwd(), '.cache', 'all-blogs.json');
    if (fs.existsSync(blogCachePath)) {
      try {
        blogs = JSON.parse(fs.readFileSync(blogCachePath, 'utf8'));
      } catch {
        blogs = [];
      }
    }
    if (!blogs.length) {
      await connectToDatabase();
      blogs = await Blog.find({ published: true }).select('slug updatedAt date -_id').lean();
    }
    
    const blogRoutes = blogs
      .filter(blog => blog.slug && blog.slug.trim() !== '')
      .map(blog => ({
        url: `${baseUrl}/blog/${slugify(blog.slug)}`,
        ...(blog.updatedAt ? { lastModified: new Date(blog.updatedAt) } : {}),
        priority: 0.7,
      }));

    // 3. Define static routes with genuine revision timestamps
    const staticRoutes = [
      {
        url: `${baseUrl}`,
        lastModified: new Date('2026-09-08T00:00:00.000Z'),
        priority: 1.0,
      },
      {
        url: `${baseUrl}/matchmaker`,
        lastModified: new Date('2026-10-07T00:00:00.000Z'),
        priority: 0.95,
      },
      {
        url: `${baseUrl}/couple-friendly`,
        lastModified: new Date('2026-10-19T00:00:00.000Z'),
        priority: 0.9,
      },
      {
        url: `${baseUrl}/soaking-tub-hotels`,
        lastModified: new Date('2026-10-22T00:00:00.000Z'),
        priority: 0.9,
      },
      {
        url: `${baseUrl}/hotels-with-hot-tub-in-room`,
        lastModified: new Date('2026-10-22T00:00:00.000Z'),
        priority: 0.9,
      },
      {
        url: `${baseUrl}/hostels`,
        lastModified: new Date('2026-10-19T00:00:00.000Z'),
        priority: 0.9,
      },
      {
        url: `${baseUrl}/blog`,
        lastModified: new Date('2026-09-08T00:00:00.000Z'),
        priority: 0.8,
      },
      {
        url: `${baseUrl}/about`,
        lastModified: new Date('2026-09-08T00:00:00.000Z'),
        priority: 0.6,
      },
      {
        url: `${baseUrl}/editorial-policy`,
        lastModified: new Date('2026-10-22T00:00:00.000Z'),
        priority: 0.6,
      },
      {
        url: `${baseUrl}/contact`,
        lastModified: new Date('2026-10-22T00:00:00.000Z'),
        priority: 0.6,
      },
      {
        url: `${baseUrl}/affiliate-policy`,
        lastModified: new Date('2026-09-08T00:00:00.000Z'),
        priority: 0.4,
      },
      {
        url: `${baseUrl}/privacy`,
        lastModified: new Date('2026-08-01T00:00:00.000Z'),
        priority: 0.3,
      },
      {
        url: `${baseUrl}/terms`,
        lastModified: new Date('2026-08-01T00:00:00.000Z'),
        priority: 0.3,
      },
      {
        url: `${baseUrl}/cookies`,
        lastModified: new Date('2026-08-01T00:00:00.000Z'),
        priority: 0.3,
      },
    ];

    return [...staticRoutes, ...countryRoutes, ...stateRoutes, ...locationRoutes, ...jacuzziRoutes, ...blogRoutes, ...hotelRoutes];
  } catch (error) {
    console.error('Failed to build dynamic sitemap:', error);
    // Fallback static sitemap if DB is unreachable
    return [
      { url: `${baseUrl}`, priority: 1.0 },
      { url: `${baseUrl}/blog`, priority: 0.8 },
      { url: `${baseUrl}/about`, priority: 0.6 },
      { url: `${baseUrl}/editorial-policy`, priority: 0.6 },
      { url: `${baseUrl}/contact`, priority: 0.6 },
      { url: `${baseUrl}/affiliate-policy`, priority: 0.4 },
    ];
  }
}
