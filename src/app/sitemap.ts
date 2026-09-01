import { MetadataRoute } from 'next';
import connectToDatabase from '@/lib/mongodb';
import Hotel from '@/models/Hotel';
import Blog from '@/models/Blog';
import { slugify, resolveCountry } from '@/lib/utils';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.hotelswithbathtubs.com';

  await connectToDatabase();

  // 1. Fetch distinct country/city combinations for dynamic hotel routes.
  const hotels = await Hotel.find({ flagged: { $ne: true } }).select('country city -_id');

  const uniqueCountries = new Set<string>();
  const uniqueLocations = new Set<string>();

  for (const h of hotels) {
    const countryInfo = resolveCountry(h.country);
    const citySlug = slugify(h.city);
    uniqueCountries.add(countryInfo.slug);
    uniqueLocations.add(`${countryInfo.slug}/${citySlug}`);
  }

  // Country Hub Routes
  const countryRoutes = Array.from(uniqueCountries).map(countrySlug => ({
    url: `${baseUrl}/${countrySlug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.85,
  }));

  // City Destination Routes
  const locationRoutes = Array.from(uniqueLocations).map(location => ({
    url: `${baseUrl}/${location}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // 2. Fetch all published blogs
  const blogs = await Blog.find({ published: true }).select('slug updatedAt -_id');
  
  const blogRoutes = blogs.map(blog => ({
    url: `${baseUrl}/blog/${blog.slug}`,
    lastModified: blog.updatedAt || new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // 3. Define static routes
  const staticRoutes = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/affiliate-policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/cookies`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
  ];

  return [...staticRoutes, ...countryRoutes, ...locationRoutes, ...blogRoutes];
}
