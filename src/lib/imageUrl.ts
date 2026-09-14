/**
 * Image URL helper
 *
 * Primary storage: Cloudflare R2 (dreamwave bucket / hotelswithbathtubs prefix)
 * Legacy compatibility: Automatically rewrites blocked Vercel Blob URLs to Cloudflare R2
 */

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// Base public URL for Cloudflare R2 images
export const R2_PUBLIC_BASE_URL =
  process.env.NEXT_PUBLIC_R2_PUBLIC_URL ||
  'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs';

export const DEFAULT_HOTEL_IMAGE =
  `${R2_PUBLIC_BASE_URL}/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp`;

export function imageUrl(src?: string): string {
  if (!src || src.trim() === '') {
    return DEFAULT_HOTEL_IMAGE;
  }

  const trimmed = src.trim();

  // Agoda blocks hotlinking and serves 42-byte transparent 1x1 GIFs: intercept and fall back
  if (trimmed.includes('agoda.net') || trimmed.includes('agoda.com')) {
    return DEFAULT_HOTEL_IMAGE;
  }

  // Intercept & rewrite any blocked Vercel Blob URLs to high-speed Cloudflare R2
  if (trimmed.includes('wsyhnifiqkc8fvyw.public.blob.vercel-storage.com') || trimmed.includes('blob.vercel-storage.com')) {
    const filename = trimmed.split('/images/')[1] || trimmed.split('/').pop() || '';
    return `${R2_PUBLIC_BASE_URL}/images/${filename}`;
  }

  // If already pointing to Cloudflare R2, preserve it
  if (trimmed.includes('.r2.dev') || trimmed.includes('r2.cloudflarestorage.com')) {
    return trimmed;
  }

  // If already an external full http/https URL (Unsplash, Booking, etc.), preserve it
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  // Extract clean filename from /assets/path or relative path
  const filename = trimmed.replace(/^\/assets\//, '').replace(/^\/+/, '');

  // Route to Cloudflare R2
  return `${R2_PUBLIC_BASE_URL}/images/${filename}`;
}

/**
 * Upload image to Cloudflare R2 (S3-compatible)
 * Used by scrapers and admin tools
 */
export async function uploadImageToBlob(
  filename: string,
  buffer: Buffer,
  contentType: string = 'image/webp'
) {
  if (process.env.NODE_ENV === 'development' && !process.env.R2_SECRET_ACCESS_KEY) {
    const fs = require('fs');
    const path = require('path');
    const filepath = path.join(process.cwd(), 'public/assets', filename);
    fs.writeFileSync(filepath, buffer);
    return `/assets/${filename}`;
  }

  if (!process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY) {
    console.warn('⚠️ Cloudflare R2 credentials not set, falling back to local assets');
    return `/assets/${filename}`;
  }

  try {
    const s3 = new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });

    const bucket = process.env.R2_BUCKET_NAME || 'dreamwave';
    const key = `hotelswithbathtubs/images/${filename}`;

    await s3.send(new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }));

    return `${R2_PUBLIC_BASE_URL}/images/${filename}`;
  } catch (error) {
    console.error(`Failed to upload ${filename} to Cloudflare R2:`, error);
    return `/assets/${filename}`;
  }
}
