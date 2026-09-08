'use client';

import { useState } from 'react';
import Image from 'next/image';
import { imageUrl, DEFAULT_HOTEL_IMAGE } from '@/lib/imageUrl';

interface ProgressiveImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  className?: string;
  containerClassName?: string;
}

export default function ProgressiveImage({
  src,
  alt,
  fill = true,
  width,
  height,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  priority = false,
  className = '',
  containerClassName = '',
}: ProgressiveImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const resolvedUrl = imgError ? DEFAULT_HOTEL_IMAGE : imageUrl(src);

  return (
    <div className={`relative w-full h-full overflow-hidden bg-gray-100 ${containerClassName}`}>
      {/* Skeleton Shimmer Placeholder with Subtle Bathtub Watermark */}
      {!isLoaded && (
        <div className="absolute inset-0 z-0 flex items-center justify-center bg-gradient-to-r from-gray-100 via-gray-200/60 to-gray-100 animate-pulse">
          <svg
            className="w-10 h-10 text-gray-300/80"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M21 10H7V5c0-1.1-.9-2-2-2s-2 .9-2 2v10c0 2.21 1.79 4 4 4h1V21h2v-2h8v2h2v-2h1c1.1 0 2-.9 2-2v-5c0-2.21-1.79-4-4-4zm2 7c0 .55-.45 1-1 1H4c-1.1 0-2-.9-2-2v-3h21v4zM5 5c0-.55.45-1 1-1s1 .45 1 1v3H5V5z" />
          </svg>
        </div>
      )}

      {/* Optimized Image with native lazy loading and SSR inclusion */}
      <Image
        src={resolvedUrl}
        alt={alt}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        sizes={sizes}
        priority={priority}
        loading={priority ? undefined : 'lazy'}
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        onError={() => setImgError(true)}
        className={`object-cover transition-opacity duration-300 ease-out ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
      />
    </div>
  );
}

