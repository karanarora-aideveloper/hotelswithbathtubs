import type { NextConfig } from "next";

// Static export (used by scripts/build-cloudflare.mjs, which sets NEXT_EXPORT=true)
// cannot coexist with middleware, so local dev runs without it.
const isExport = process.env.NEXT_EXPORT === 'true';

const nextConfig: NextConfig = {
  output: isExport ? 'export' : undefined,
  staticPageGenerationTimeout: 180,
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ['mongoose', 'mongodb', 'isomorphic-dompurify', 'jsdom', 'cheerio', 'markdown-it'],
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-c12991664bbf475e918cb03e3ac5b910.r2.dev',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.r2.dev',
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
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
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
    ],
  },
};

export default nextConfig;

// Trigger Cloudflare Pages remote build with full Airbnb catalog across 278 global cities - 1789630000
