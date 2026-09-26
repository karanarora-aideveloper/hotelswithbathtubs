'use client';

import { useFavorites } from '@/components/Favorites';
import { FavoriteButton } from '@/components/Favorites';
import Link from 'next/link';
import Image from 'next/image';
import { imageUrl } from '@/lib/imageUrl';
import { useState, useEffect } from 'react';

export default function WishlistPage() {
  const { favorites, clearAll } = useFavorites();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-2 border-accent/30 border-t-accent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-accent-secondary">
            💛 Your Saved Hotels
          </h1>
          <p className="text-sm text-text-muted mt-1">
            {favorites.length === 0
              ? 'No hotels saved yet'
              : `${favorites.length} hotel${favorites.length > 1 ? 's' : ''} saved`}
          </p>
        </div>
        {favorites.length > 0 && (
          <button
            onClick={clearAll}
            className="text-xs text-red-500 hover:text-red-700 font-semibold transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-20 bg-white border border-border rounded-2xl">
          <div className="text-6xl mb-4">🛁</div>
          <h2 className="font-heading text-xl font-bold text-accent-secondary mb-2">
            No saved hotels yet
          </h2>
          <p className="text-sm text-text-muted mb-6 max-w-xs mx-auto">
            Tap the ❤️ button on any hotel card to save it here for later comparison.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-accent text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-accent-hover transition-colors"
          >
            Browse Hotels →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((h) => (
            <div
              key={h._id}
              className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all group flex flex-col"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image
                  src={imageUrl(h.image?.split('/').pop() || '')}
                  alt={`${h.name} - hotel with bathtub`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3">
                  <FavoriteButton
                    hotel={h}
                    className="bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-sm"
                  />
                </div>
              </div>
              <div className="p-4 flex flex-col flex-grow">
                <h2 className="font-heading text-base font-bold text-accent-secondary mb-1 line-clamp-2">
                  {h.name}
                </h2>
                <p className="text-xs text-text-muted mb-2">
                  {h.city}, {h.country}
                </p>
                {h.tubType && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-accent/10 text-accent font-bold text-2xs rounded-lg mb-3 self-start">
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
                    <span className="text-2xs text-text-muted font-bold uppercase tracking-wider">Rates From</span>
                    <span className="text-lg font-black text-accent-secondary">{h.price}<span className="text-2xs text-text-muted ml-1 font-normal">/night</span></span>
                  </div>
                )}
                <div className="flex gap-2 mt-auto">
                  <Link
                    href={`/${h.countrySlug}/${h.citySlug}`}
                    className="flex-1 text-center py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl text-xs transition-colors"
                  >
                    View City
                  </Link>
                  {(h.bookingUrl || h.agodaUrl || h.url) && (
                    <a
                      href={h.bookingUrl || h.agodaUrl || h.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-center py-2 bg-accent-secondary hover:bg-accent-secondary/90 text-white font-bold rounded-xl text-xs transition-colors"
                    >
                      Book Now →
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
