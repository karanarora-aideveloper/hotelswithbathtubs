import type { Metadata } from 'next';
import Link from 'next/link';
import NotFoundTracker from '@/components/NotFoundTracker';
import TrendingDestinations from '@/components/TrendingDestinations';

export const metadata: Metadata = {
  title: 'Page Not Found | Hotels With Bathtubs',
  description: 'The page you were looking for could not be found. Explore luxury hotels with private bathtubs and jacuzzi suites worldwide.',
  alternates: {
    canonical: undefined,
  },
  openGraph: {},
};

export default function NotFound() {
  const popularHubs = [
    { label: '🗽 New York Stays', href: '/usa/new-york' },
    { label: '🎰 Las Vegas Jacuzzis', href: '/usa/las-vegas' },
    { label: '🇬🇧 London Soaking Baths', href: '/uk/london' },
    { label: '🗼 Paris Luxury Tubs', href: '/france/paris' },
    { label: '🇬🇷 Santorini Caldera Hot Tubs', href: '/greece/santorini' },
    { label: '🇹🇭 Bangkok Skyline Baths', href: '/thailand/bangkok' },
    { label: '🏝️ Bali Private Villas', href: '/indonesia/bali' },
    { label: '✨ Dream Soak Matchmaker', href: '/matchmaker' },
  ];

  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center text-center px-4 sm:px-8 py-16 sm:py-24 max-w-5xl mx-auto font-jakarta">
      <NotFoundTracker />
      
      <div className="w-16 h-16 rounded-3xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-3xl mb-6 shadow-xs">
        🛁
      </div>

      <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-3 tracking-tight">
        Page Not Found
      </h1>

      <p className="text-gray-500 text-sm sm:text-base mb-8 max-w-md mx-auto leading-relaxed">
        The destination or hotel URL you requested may have moved or been updated. Discover in-room soaking tubs &amp; jacuzzi suites below:
      </p>

      {/* Quick Search Hub Links */}
      <div className="w-full max-w-2xl bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-sm mb-10">
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
          Explore Most Requested Bathtub Hubs
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {popularHubs.map((hub) => (
            <Link
              key={hub.href}
              href={hub.href}
              className="px-3.5 py-2 bg-slate-50 hover:bg-[#1a6fde] hover:text-white text-gray-700 text-xs font-semibold rounded-xl border border-gray-200/80 transition-all shadow-2xs"
            >
              {hub.label}
            </Link>
          ))}
        </div>
      </div>

      <Link
        href="/"
        className="inline-flex items-center gap-2 px-6 py-3 bg-[#1a6fde] hover:bg-[#1559b8] text-white text-sm font-bold rounded-xl shadow-sm hover:shadow-md transition-all mb-12"
      >
        <span>&larr; Back to Homepage Directory</span>
      </Link>

      {/* Trending Destinations Section */}
      <div className="w-full text-left">
        <TrendingDestinations currentCity="" />
      </div>
    </div>
  );
}
