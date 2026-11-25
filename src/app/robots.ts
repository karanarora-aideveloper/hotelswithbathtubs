import { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api', '/out', '/audits'],
    },
    sitemap: [
      // The index lists every child sitemap, images included; one entry avoids duplicate URLs.
      'https://www.hotelswithbathtubs.com/sitemap_index.xml',
    ],
  };
}
