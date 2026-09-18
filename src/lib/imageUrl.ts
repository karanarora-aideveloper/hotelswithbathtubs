

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

