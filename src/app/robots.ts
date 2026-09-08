import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api', '/out'],
    },
    sitemap: 'https://www.hotelswithbathtubs.com/sitemap.xml',
  };
}
