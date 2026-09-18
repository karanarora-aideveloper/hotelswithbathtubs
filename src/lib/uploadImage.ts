import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { R2_PUBLIC_BASE_URL } from './imageUrl';

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
