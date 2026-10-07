'use client';

import { useFavorites } from '@/components/Favorites';
import { FavoriteButton } from '@/components/Favorites';
import Link from 'next/link';
import Image from 'next/image';
import { imageUrl } from '@/lib/imageUrl';
import OutboundLink from '@/components/OutboundLink';
import { useState, useEffect } from 'react';

export default function WishlistPage() {
  const { favorites, clearAll } = useFavorites();
  const [mounted, setMounted] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleShareWishlist = async () => {
    if (favorites.length === 0) return;
    const shareTitle = 'Our Favorite Bathtub Hotels 💕';
    const hotelSummary = favorites.map((h, i) => `${i + 1}. ${h.name} (${h.city}, ${h.country}) - ${h.price || 'Rates online'}`).join('\n');
    const shareText = `Look at the hotels with private bathtubs I saved for our trip:\n\n${hotelSummary}\n\nExplore them here: https://www.hotelswithbathtubs.com/wishlist`;

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: 'https://www.hotelswithbathtubs.com/wishlist',
        });
        return;
      } catch (_) {}
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(shareText);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  if (!mounted) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-2 border-accent/30 border-t-accent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-gray-900">
            💛 Your Saved Hotels
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {favorites.length === 0
              ? 'No hotels saved yet'
              : `${favorites.length} verified stay${favorites.length > 1 ? 's' : ''} saved for comparison`}
          </p>
        </div>
        {favorites.length > 0 && (
          <div className="flex items-center gap-3">
            <button
              onClick={handleShareWishlist}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-xs shadow-xs transition-all transform hover:-translate-y-0.5"
            >
              <span>💌</span>
              <span>{copiedLink ? 'Copied to Clipboard! 💕' : 'Share with Partner'}</span>
            </button>
            <button
              onClick={clearAll}
              className="px-3 py-2 rounded-xl border border-gray-200 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 font-semibold transition-colors"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-20 bg-white border border-gray-200 rounded-2xl shadow-xs">
          <div className="text-6xl mb-4">🛁</div>
          <h2 className="font-heading text-xl font-bold text-gray-900 mb-2">
            No saved hotels yet
          </h2>
          <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">
            Tap the ❤️ button on any hotel card or use our Dream Soak Matchmaker to find and save favorite stays.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-[#1a6fde] hover:bg-[#1559b8] text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-colors"
            >
              Browse Destinations &rarr;
            </Link>
            <Link
              href="/matchmaker"
              className="inline-flex items-center gap-2 bg-blue-50 text-[#1a6fde] border border-blue-200 font-bold px-5 py-2.5 rounded-xl text-xs hover:bg-blue-100 transition-colors"
            >
              ✨ Try Matchmaker
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((h) => (
            <div
              key={h._id}
              className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-lg hover:-translate-y-0.5 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                  <Image
                    src={imageUrl(h.image?.split('/').pop() || '')}
                    alt={`${h.name} - hotel with bathtub in ${h.city}`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3">
                    <FavoriteButton
                      hotel={h}
                      className="bg-white/95 backdrop-blur-sm rounded-full p-1.5 shadow-sm"
                    />
                  </div>
                </div>
                <div className="p-4 flex flex-col flex-grow">
                  <h2 className="font-heading text-base font-bold text-gray-900 mb-1 line-clamp-2">
                    {h.name}
                  </h2>
                  <p className="text-xs text-gray-500 mb-2">
                    📍 {h.city}, {h.country}
                  </p>
                  {h.tubType && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-[#1a6fde] font-bold text-2xs rounded-lg mb-3 self-start border border-blue-100">
                      🛁 {h.tubType}
                    </span>
                  )}
                  {h.rating && (
                    <div className="flex items-center gap-1 text-sm font-bold text-gray-800 mb-3">
                      <span className="text-amber-500">★</span>
                      <span>{h.rating}</span>
                    </div>
                  )}
                  {h.price && (
                    <div className="mt-auto flex items-baseline justify-between border-t border-dashed border-gray-200 pt-3 mb-3">
                      <span className="text-2xs text-gray-400 font-bold uppercase tracking-wider">Rates From</span>
                      <span className="text-lg font-black text-gray-900">{h.price}<span className="text-2xs text-gray-400 ml-1 font-normal">/night</span></span>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 pt-0 flex gap-2">
                <Link
                  href={`/${h.countrySlug}/${h.citySlug}`}
                  className="flex-1 text-center py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl text-xs transition-colors"
                >
                  View City
                </Link>
                {(h.bookingUrl || h.agodaUrl || h.url) && (
                  <OutboundLink
                    href={h.bookingUrl || h.agodaUrl || h.url!}
                    hotelName={h.name}
                    cityName={h.city}
                    source="wishlist_cta"
                    className="flex-1 text-center py-2 bg-[#1a6fde] hover:bg-[#1559b8] text-white font-bold rounded-xl text-xs transition-colors shadow-xs flex items-center justify-center gap-1"
                  >
                    <span>Book Now</span>
                    <span>&rarr;</span>
                  </OutboundLink>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
