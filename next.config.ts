import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['mongoose', 'mongodb', 'isomorphic-dompurify', 'jsdom', 'cheerio', 'markdown-it'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'wsyhnifiqkc8fvyw.public.blob.vercel-storage.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.agoda.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.agoda.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.bstatic.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.booking.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/usa/new-york-city',
        destination: '/usa/new-york',
        permanent: true,
      },
      {
        source: '/usa/new%20york',
        destination: '/usa/new-york',
        permanent: true,
      },
      // Legacy city URL formats → canonical /country/city paths
      // These were indexed by Google under old URL structures and split ranking authority
      {
        source: '/hotels-with-bathtub-in-new-delhi',
        destination: '/india/delhi',
        permanent: true,
      },
      {
        source: '/hotels-with-bathtub-in-new-delhi/',
        destination: '/india/delhi',
        permanent: true,
      },
      {
        source: '/hotels-with-bathtub-in-bangalore',
        destination: '/india/bangalore',
        permanent: true,
      },
      {
        source: '/hotels-with-bathtub-in-jaipur',
        destination: '/india/jaipur',
        permanent: true,
      },
      {
        source: '/hotels-with-bathtub-in-ahmedabad',
        destination: '/india/ahmedabad',
        permanent: true,
      },
      {
        source: '/hotels-with-bathtub-in-pune',
        destination: '/india/pune',
        permanent: true,
      },
      {
        source: '/mahipalpur',
        destination: '/india/delhi',
        permanent: true,
      },
      {
        source: '/kochi',
        destination: '/india/kochi',
        permanent: true,
      },
      {
        source: '/kochi/',
        destination: '/india/kochi',
        permanent: true,
      },
      {
        source: '/rishikesh',
        destination: '/india/rishikesh',
        permanent: true,
      },
      {
        source: '/rishikesh/',
        destination: '/india/rishikesh',
        permanent: true,
      },
      {
        source: '/agra',
        destination: '/india/agra',
        permanent: true,
      },
      {
        source: '/darjeeling',
        destination: '/india/darjeeling',
        permanent: true,
      },
      {
        source: '/dharamshala',
        destination: '/india/dharamshala',
        permanent: true,
      },
      // Regional neighborhood consolidation redirects
      {
        source: '/india/calangute',
        destination: '/india/goa',
        permanent: true,
      },
      {
        source: '/calangute',
        destination: '/india/goa',
        permanent: true,
      },
      {
        source: '/india/panjim',
        destination: '/india/goa',
        permanent: true,
      },
      {
        source: '/panjim',
        destination: '/india/goa',
        permanent: true,
      },
      {
        source: '/india/koramangala',
        destination: '/india/bangalore',
        permanent: true,
      },
      {
        source: '/koramangala',
        destination: '/india/bangalore',
        permanent: true,
      },
      {
        source: '/india/mahipalpur',
        destination: '/india/delhi',
        permanent: true,
      },
      // Blog slug aliases & historical redirects
      {
        source: '/blog/verify-hotel-amenities',
        destination: '/blog/verify-hotel-amenities-accurate-booking',
        permanent: true,
      },
      {
        source: '/blog/budget-romantic-trips-india',
        destination: '/blog/budget-romantic-getaway-india',
        permanent: true,
      },
      {
        source: '/blog/honeymoon-hotels-bathtubs',
        destination: '/blog/honeymoon-hotels-freestanding-bathtubs-india',
        permanent: true,
      },
      {
        source: '/blog/how-verification-works',
        destination: '/#verification',
        permanent: true,
      },
      {
        source: '/blog/luxury-couple-hotels-india-cities',
        destination: '/blog/best-hotels-private-jacuzzi-couples-india',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
