'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { imageUrl } from '@/lib/imageUrl';

interface HotelGalleryProps {
  images?: string[];
  partnerImages?: string[];
  primaryImage: string;
  hotelName: string;
  cityName: string;
  countryName: string;
  roomType?: string;
  verifiedPlatformsText: string;
}

export default function HotelGallery({
  images = [],
  partnerImages = [],
  primaryImage,
  hotelName,
  cityName,
  countryName,
  roomType,
  verifiedPlatformsText,
}: HotelGalleryProps) {
  const [activeModalIndex, setActiveModalIndex] = useState<number | null>(null);

  // Decision D8: our tub photo leads; Booking.com CDN photos follow; our copies are the fallback.
  const ownImages = Array.isArray(images) && images.length > 0 ? images.map((img) => imageUrl(img)) : [imageUrl(primaryImage)];
  const partner = partnerImages.slice(0, 7);
  const allImages = partner.length ? [ownImages[0], ...partner] : ownImages;
  const fallbackFor = (src: string) => {
    const i = allImages.indexOf(src);
    return i > 0 && partner.length ? ownImages[i] || ownImages[0] : ownImages[0];
  };
  const onImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const fb = fallbackFor(img.getAttribute('data-src') || '');
    if (fb && img.src !== fb) img.src = fb;
  };

  // Keyboard navigation for full-screen lightbox
  useEffect(() => {
    if (activeModalIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveModalIndex(null);
      if (e.key === 'ArrowRight') {
        setActiveModalIndex((prev) => (prev !== null ? (prev + 1) % allImages.length : 0));
      }
      if (e.key === 'ArrowLeft') {
        setActiveModalIndex((prev) => (prev !== null ? (prev - 1 + allImages.length) % allImages.length : 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModalIndex, allImages.length]);

  const hasMultiple = allImages.length >= 4;

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-5 pb-2">
        {hasMultiple ? (
          /* 5-Photo Luxury Bento Grid (Airbnb / Five-Star Style) */
          <div className="relative rounded-3xl overflow-hidden shadow-sm border border-[#5b8296]/20 bg-[#1f262d]">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 h-[340px] sm:h-[420px] md:h-[480px]">
              {/* Main Hero Photo (Takes 2 Columns) */}
              <div
                onClick={() => setActiveModalIndex(0)}
                className="relative md:col-span-2 h-full cursor-pointer overflow-hidden group"
              >
                <Image
                  src={allImages[0]}
                  data-src={allImages[0]}
                  onError={onImgError}
                  alt={`${hotelName} - Guaranteed in-room bathtub in ${cityName}`}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover group-hover:scale-103 transition-transform duration-500 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                <span className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-full border border-white/20">
                  🛁 In-Room Bathtub
                </span>
              </div>

              {/* Grid 2 & 3 */}
              <div className="hidden md:flex flex-col gap-2 h-full">
                <div
                  onClick={() => setActiveModalIndex(1)}
                  className="relative flex-1 cursor-pointer overflow-hidden group"
                >
                  <Image
                    src={allImages[1] || allImages[0]}
                  data-src={allImages[1] || allImages[0]}
                  onError={onImgError}
                    alt={`${hotelName} suite interior`}
                    fill
                    sizes="25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                </div>
                <div
                  onClick={() => setActiveModalIndex(2)}
                  className="relative flex-1 cursor-pointer overflow-hidden group"
                >
                  <Image
                    src={allImages[2] || allImages[0]}
                  data-src={allImages[2] || allImages[0]}
                  onError={onImgError}
                    alt={`${hotelName} bathroom and tub space`}
                    fill
                    sizes="25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                </div>
              </div>

              {/* Grid 4 & 5 */}
              <div className="hidden md:flex flex-col gap-2 h-full">
                <div
                  onClick={() => setActiveModalIndex(3)}
                  className="relative flex-1 cursor-pointer overflow-hidden group"
                >
                  <Image
                    src={allImages[3] || allImages[0]}
                  data-src={allImages[3] || allImages[0]}
                  onError={onImgError}
                    alt={`${hotelName} room view`}
                    fill
                    sizes="25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                </div>
                <div
                  onClick={() => setActiveModalIndex(4 % allImages.length)}
                  className="relative flex-1 cursor-pointer overflow-hidden group"
                >
                  <Image
                    src={allImages[4] || allImages[0]}
                  data-src={allImages[4] || allImages[0]}
                  onError={onImgError}
                    alt={`${hotelName} property and ambiance`}
                    fill
                    sizes="25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                </div>
              </div>
            </div>

            {/* Verification Badges (Top Left) */}
            <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2 z-10 font-jakarta pointer-events-none">
              <span className="bg-white/95 backdrop-blur-md text-[#1f262d] text-xs font-semibold px-3 py-1.5 rounded-full shadow-xs border border-white/40 flex items-center gap-1.5">
                <span className="text-emerald-700 font-bold">✓</span> Verified In-Room Bathtub
              </span>
              <span className="bg-[#1f262d]/80 backdrop-blur-md text-white text-xs font-medium px-3 py-1.5 rounded-full border border-white/20 hidden sm:flex items-center gap-1.5">
                <span className="text-[#8eaab9]">✦</span> Triple-Source Audited
              </span>
            </div>

            {/* "View All Photos" Button (Bottom Right) */}
            <button
              onClick={() => setActiveModalIndex(0)}
              type="button"
              className="absolute bottom-4 right-4 bg-white/95 hover:bg-white text-gray-900 text-xs font-bold px-4 py-2 rounded-xl shadow-lg border border-gray-200 backdrop-blur-md flex items-center gap-2 transition-all hover:scale-103 cursor-pointer z-10"
            >
              <svg className="w-4 h-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>View all {allImages.length} photos</span>
            </button>
          </div>
        ) : (
          /* Single Image Contained Showcase (Fallback) */
          <div className="relative aspect-[16/10] sm:aspect-[2.1/1] md:aspect-[2.4/1] max-h-[520px] w-full rounded-3xl overflow-hidden shadow-sm border border-[#5b8296]/20 bg-[#1f262d] group cursor-pointer"
               onClick={() => setActiveModalIndex(0)}>
            <Image
              src={allImages[0]}
                  data-src={allImages[0]}
                  onError={onImgError}
              alt={`${hotelName} with private bathtub in ${cityName}`}
              fill
              priority
              sizes="(max-width: 1280px) 100vw, 1280px"
              className="object-cover group-hover:scale-102 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1f262d]/90 via-[#1f262d]/30 to-[#1f262d]/10 pointer-events-none" />

            <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex flex-wrap items-center gap-2 z-10 font-jakarta pointer-events-none">
              <span className="bg-white/90 backdrop-blur-md text-[#1f262d] text-xs font-semibold px-3.5 py-1.5 rounded-full shadow-xs border border-white/40 flex items-center gap-1.5">
                <span className="text-emerald-700 font-bold">✓</span> Verified In-Room Bathtub
              </span>
              <span className="bg-[#1f262d]/75 backdrop-blur-md text-white text-xs font-medium px-3.5 py-1.5 rounded-full border border-white/20 hidden sm:flex items-center gap-1.5">
                <span className="text-[#8eaab9]">✦</span> Triple-Source Audited
              </span>
            </div>

            <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3 text-white z-10 font-jakarta pointer-events-none">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-medium text-white mb-2 border border-white/30">
                  <span>🏷️</span> Guaranteed Tier: {roomType || 'Suite / Deluxe Room with Bathtub'}
                </div>
                <p className="text-xs sm:text-sm text-white/85 font-medium">
                  {verifiedPlatformsText}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Photo Lightbox Modal */}
      {activeModalIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4">
          {/* Top Bar */}
          <div className="absolute top-0 left-0 right-0 p-4 sm:p-6 flex items-center justify-between text-white z-10">
            <div>
              <h3 className="font-bold text-base sm:text-lg">{hotelName}</h3>
              <p className="text-xs sm:text-sm text-gray-400">Photo {activeModalIndex + 1} of {allImages.length}</p>
            </div>
            <button
              onClick={() => setActiveModalIndex(null)}
              className="bg-white/10 hover:bg-white/20 text-white rounded-full p-2.5 transition-colors cursor-pointer"
              title="Close (Esc)"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Active Photo with Next/Prev Controls */}
          <div className="relative w-full max-w-5xl h-[65vh] sm:h-[75vh] flex items-center justify-center">
            <Image
              src={allImages[activeModalIndex]}
                  data-src={allImages[activeModalIndex]}
                  onError={onImgError}
              alt={`${hotelName} photo ${activeModalIndex + 1}`}
              fill
              className="object-contain"
              sizes="(max-width: 1280px) 100vw, 1280px"
              priority
            />

            {/* Left Button */}
            {allImages.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveModalIndex((prev) => (prev !== null ? (prev - 1 + allImages.length) % allImages.length : 0));
                }}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/90 text-white p-3 rounded-full border border-white/20 transition-all cursor-pointer z-10"
                title="Previous photo (Left arrow)"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            {/* Right Button */}
            {allImages.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveModalIndex((prev) => (prev !== null ? (prev + 1) % allImages.length : 0));
                }}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/90 text-white p-3 rounded-full border border-white/20 transition-all cursor-pointer z-10"
                title="Next photo (Right arrow)"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>

          {/* Bottom Thumbnails */}
          {allImages.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto p-3 max-w-xl z-10">
              {allImages.map((thumb, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveModalIndex(idx)}
                  className={`relative w-14 h-14 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                    activeModalIndex === idx ? 'border-white scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <Image src={thumb}
                  data-src={thumb}
                  onError={onImgError} alt={`Thumbnail ${idx + 1}`} fill className="object-cover" sizes="56px" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
