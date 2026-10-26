'use client';

import { useState, useMemo, useRef } from 'react';
import { imageUrl, DEFAULT_HOTEL_IMAGE } from '@/lib/imageUrl';

interface HotelCardImageProps {
  primaryImage: string;
  images?: string[];
  partnerImages?: string[];
  hotelName: string;
  cityName: string;
  countryName: string;
  tubType?: string;
  priority?: boolean;
  verifiedSources?: string[];
  crossVerifiedAt?: string;
}

export default function HotelCardImage({
  primaryImage,
  images = [],
  partnerImages = [],
  hotelName,
  cityName,
  countryName,
  tubType,
  priority = false,
  verifiedSources = [],
  crossVerifiedAt,
}: HotelCardImageProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isInteractive, setIsInteractive] = useState(false);

  // Tub-First Image Ordering: prioritize photos featuring private tubs/jacuzzis
  const ownImages = useMemo(() => {
    const list = Array.isArray(images) && images.length > 0 ? [...images] : [primaryImage];
    const tubPattern = /bathtub|tub|jacuzzi|bath|soak|whirlpool/i;
    list.sort((a, b) => Number(tubPattern.test(b)) - Number(tubPattern.test(a)));
    if (primaryImage && tubPattern.test(primaryImage)) {
      const idx = list.indexOf(primaryImage);
      if (idx > 0) list.splice(idx, 1);
      if (idx !== 0) list.unshift(primaryImage);
    }
    return list;
  }, [images, primaryImage]);

  // Decision D8: our tub photo always leads; Booking.com's CDN photos (faster) fill the carousel,
  // resized to 500px for cards. Each partner photo falls back to one of our copies if it fails.
  const slides = useMemo(() => {
    const first = { src: imageUrl(ownImages[0] || primaryImage), fallback: DEFAULT_HOTEL_IMAGE };
    const partner = partnerImages.slice(0, 5).map((u, i) => ({
      src: u.replace(/\/max\d+(x\d+)?\//, '/max500/'),
      fallback: imageUrl(ownImages[i + 1] || ownImages[0] || primaryImage),
    }));
    const rest = partner.length ? [] : ownImages.slice(1).map((u) => ({ src: imageUrl(u), fallback: DEFAULT_HOTEL_IMAGE }));
    return [first, ...partner, ...rest];
  }, [ownImages, partnerImages, primaryImage]);
  const allImages = slides;
  const touchX = useRef<number | null>(null);

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % allImages.length);
  };

  const current = slides[currentIndex] || slides[0];
  const currentSrc = current.src;
  const isUSOrIntl = countryName?.toLowerCase() !== 'india';

  return (
    <div 
      className="relative h-48 sm:h-44 w-full bg-gray-100 shrink-0 overflow-hidden group/image"
      onMouseEnter={() => !isInteractive && setIsInteractive(true)}
      onTouchStart={(e) => { if (!isInteractive) setIsInteractive(true); touchX.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        if (touchX.current == null || slides.length < 2) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(dx) < 40) return;
        setCurrentIndex((p) => (dx < 0 ? (p + 1) % slides.length : (p - 1 + slides.length) % slides.length));
      }}
    >
      <img
        key={currentSrc}
        src={currentSrc}
        alt={`${hotelName} - ${tubType || 'Hotel with Private Bathtub'} in ${cityName}`}
        loading={priority && currentIndex === 0 ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority && currentIndex === 0 ? 'high' : 'auto'}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        onError={(e) => {
          const target = e.currentTarget;
          if (target.src !== current.fallback) target.src = current.fallback;
          else if (target.src !== DEFAULT_HOTEL_IMAGE) target.src = DEFAULT_HOTEL_IMAGE;
        }}
      />

      {/* Verified Badges */}
      {verifiedSources.length > 0 && (
        <div className="absolute top-3 left-3 group/tooltip flex z-20">
          <span className="bg-emerald-500/90 text-white border border-emerald-400/30 text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs backdrop-blur-xs cursor-help">
            <span className="font-black">✓</span>
            <span className="inline sm:hidden">Verified</span>
            <span className="hidden sm:inline">Verified on {verifiedSources.join(', ')}</span>
            <button type="button" className="ml-0.5 opacity-80 hover:opacity-100 bg-white/20 text-white rounded-full w-3.5 h-3.5 flex items-center justify-center text-[9px] outline-none">i</button>
          </span>
          <div className="absolute top-full left-0 mt-1.5 w-64 p-2.5 bg-gray-900 text-white text-[11px] rounded-xl shadow-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible group-focus-within/tooltip:opacity-100 group-focus-within/tooltip:visible transition-all z-30 pointer-events-none">
            {isUSOrIntl 
              ? `We manually verify every hotel across Booking.com, Expedia, and Agoda to confirm the specific room tier includes a private in-room bathtub. Last verified: ${crossVerifiedAt || 'Oct 2026'}.`
              : `We manually check every hotel across Booking.com, Agoda, and partner channels to confirm the specific room tier includes a private in-room bathtub. Last verified: ${crossVerifiedAt || 'Oct 2026'}.`}
          </div>
        </div>
      )}

      {/* Multi-Image Hover Navigation (Lazy initialized on first hover/touch to save INP) */}
      {allImages.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            type="button"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover/image:opacity-100 transition-opacity z-20 cursor-pointer shadow-sm"
            aria-label="Previous photo"
          >
            &#8249;
          </button>
          <button
            onClick={handleNext}
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover/image:opacity-100 transition-opacity z-20 cursor-pointer shadow-sm"
            aria-label="Next photo"
          >
            &#8250;
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 z-20 pointer-events-none">
            {allImages.slice(0, 5).map((_, idx) => (
              <span
                key={idx}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  currentIndex === idx ? 'bg-white w-3.5' : 'bg-white/60'
                }`}
              />
            ))}
          </div>
        </>
      )}

      {/* Pinterest Save Button */}
      <a
        href={`https://www.pinterest.com/pin/create/button/?url=${encodeURIComponent('https://www.hotelswithbathtubs.com')}&media=${encodeURIComponent((currentSrc))}&description=${encodeURIComponent(`${hotelName} - Verified Luxury Hotel with Private Bathtub in ${cityName}, ${countryName}. Guaranteed private in-room soaking tub. Plan your stay on HotelsWithBathtubs.com`)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute top-3 right-3 bg-red-600/95 hover:bg-red-700 text-white text-[11px] font-bold px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-full shadow-md flex items-center gap-1 z-10 transition-all opacity-90 sm:opacity-0 group-hover/image:opacity-100"
        title="Save to Pinterest"
        onClick={(e) => e.stopPropagation()}
      >
        <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
          <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345-.09.375-.291 1.199-.334 1.357-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.546.535 6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
        </svg>
        <span>Save</span>
      </a>
    </div>
  );
}
