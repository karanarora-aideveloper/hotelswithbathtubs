'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getRecentlyViewed, RecentHotel } from '@/lib/recentlyViewed';
import { useMounted } from '@/components/Favorites';

export default function RecentlyViewedRow({
  className = '',
}: {
  className?: string;
}) {
  const [recent, setRecent] = useState<RecentHotel[]>([]);
  const mounted = useMounted();

  useEffect(() => {
    const load = () => {
      setRecent(getRecentlyViewed().slice(0, 8));
    };

    load();

    const handleUpdate = () => load();
    window.addEventListener('hwb_recent_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('hwb_recent_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  if (!mounted || recent.length === 0) {
    return null;
  }

  return (
    <section className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#e3e7ef]">
        <div className="flex items-center gap-2">
          <span className="text-base">🕒</span>
          <h2 className="font-playfair text-xl sm:text-2xl font-bold text-[#14213d] tracking-tight">
            Recently viewed
          </h2>
        </div>
        <span className="text-2xs text-[#5b6478] font-semibold">
          {recent.length} {recent.length === 1 ? 'hotel' : 'hotels'}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
        {recent.map((hotel) => (
          <Link
            key={hotel.id || hotel.url}
            href={hotel.url}
            prefetch={false}
            className="group flex flex-col bg-white border border-[#e3e7ef] rounded-xl overflow-hidden shadow-2xs hover:shadow-xs hover:border-[#b08d57] transition-all"
          >
            <div className="relative aspect-[4/3] w-full bg-[#f5f6f8] overflow-hidden">
              {hotel.image ? (
                <Image
                  src={hotel.image}
                  alt={hotel.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300 text-2xl">
                  🛁
                </div>
              )}
            </div>
            <div className="p-2.5 flex flex-col flex-grow">
              <span className="font-playfair font-semibold text-xs text-[#14213d] line-clamp-1 group-hover:text-[#b08d57] transition-colors">
                {hotel.name}
              </span>
              <span className="text-2xs text-[#5b6478] line-clamp-1 mt-0.5">
                {hotel.city}, {hotel.country}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
