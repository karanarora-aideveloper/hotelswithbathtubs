/**
 * Image URL helper
 *
 * In development: returns local `/assets/` paths
 * In production: returns Blob URLs
 *
 * Usage: imageUrl('mmt-hyatt-delhi.webp')
 * → dev: /assets/mmt-hyatt-delhi.webp
 * → prod: https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/mmt-hyatt-delhi.webp
 */

// Use environment variable if set, otherwise use hardcoded Blob store URL
// (Vercel Blob URLs are always in the format: https://<store-id>.public.blob.vercel-storage.com/)
const BLOB_BASE_URL = process.env.NEXT_PUBLIC_BLOB_BASE_URL ||
  'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/';

export function imageUrl(src?: string): string {
  if (!src || src.trim() === '') {
    return 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp';
  }

  const trimmed = src.trim();

  // If already a full http/https URL (Unsplash, Agoda, Booking, Blob Storage, etc.), preserve it
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  // Extract clean filename from /assets/path or path
  const filename = trimmed.replace(/^\/assets\//, '').replace(/^\/+/, '');

  // In development, use local assets
  if (process.env.NODE_ENV === 'development') {
    return `/assets/${filename}`;
  }

  // In production, use Blob URLs
  if (BLOB_BASE_URL.startsWith('http')) {
    return `${BLOB_BASE_URL}${filename}`;
  }

  // Fallback to local
  return `/assets/${filename}`;
}

/**
 * For scrapers: upload image directly to Blob
 * This is used when scraping new hotels
 */
export async function uploadImageToBlob(
  filename: string,
  buffer: Buffer,
  contentType: string = 'image/webp'
) {
  if (process.env.NODE_ENV === 'development') {
    // In dev, just save to /public/assets
    const fs = require('fs');
    const path = require('path');
    const filepath = path.join(process.cwd(), 'public/assets', filename);
    fs.writeFileSync(filepath, buffer);
    return `/assets/${filename}`;
  }

  // In production, upload to Blob
  const { put } = require('@vercel/blob');

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.warn('⚠️ BLOB_READ_WRITE_TOKEN not set, falling back to local assets');
    return `/assets/${filename}`;
  }

  try {
    const blob = await put(`images/${filename}`, buffer, {
      access: 'public',
      contentType,
    });
    return blob.url;
  } catch (error) {
    console.error(`Failed to upload ${filename} to Blob:`, error);
    return `/assets/${filename}`; // Fallback
  }
}
