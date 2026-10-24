'use client';

import { DEFAULT_HOTEL_IMAGE } from '@/lib/imageUrl';

// An <img> that swaps to the default hotel photo if its source fails to load.
// Event handlers cannot be passed from Server Components, so this lives on the client.
export default function FallbackImg(props: React.ImgHTMLAttributes<HTMLImageElement> & { fallbackSrc?: string }) {
  const { fallbackSrc = DEFAULT_HOTEL_IMAGE, alt = '', ...rest } = props;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt={alt}
      {...rest}
      onError={(e) => {
        const el = e.currentTarget;
        if (el.src !== fallbackSrc) el.src = fallbackSrc;
      }}
    />
  );
}
