'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const DreamSoakMatchmaker = dynamic(
  () => import('@/components/DreamSoakMatchmaker'),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[460px] flex flex-col items-center justify-center p-8 text-center bg-white rounded-3xl border border-[#E5E1D8]">
        <div className="w-10 h-10 rounded-full border-2 border-[#1a6fde] border-t-transparent animate-spin mb-4" />
        <p className="text-sm font-medium text-slate-600">Loading Dream Soak Matchmaker™...</p>
      </div>
    ),
  }
);

export default function HomeMatchmakerSection() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (
        params.has('vibe') ||
        params.has('tub') ||
        params.has('region') ||
        params.has('budget') ||
        window.location.hash === '#matchmaker'
      ) {
        setIsOpen(true);
      }
    }
  }, []);

  if (isOpen) {
    return <DreamSoakMatchmaker embedded={true} />;
  }

  return (
    <div
      id="dream-soak-matchmaker"
      className="w-full bg-gradient-to-b from-blue-50/60 via-white to-white rounded-3xl border border-blue-100/80 shadow-xs p-6 sm:p-10 lg:p-12 text-center"
    >
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/70 text-[#1a6fde] text-xs font-bold tracking-wide uppercase mb-4">
        <span>✨</span>
        <span>Interactive Dream Soak Matchmaker™</span>
      </div>
      <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 tracking-tight leading-tight max-w-2xl mx-auto">
        Find Your Perfect Bathtub Stay in 30 Seconds
      </h2>
      <p className="mt-3 text-sm sm:text-base text-gray-600 max-w-xl mx-auto leading-relaxed">
        Can&apos;t decide on a destination? Tell us your dream soaking fantasy and we&apos;ll match you with curated luxury suites worldwide.
      </p>
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#1a6fde] hover:bg-[#1559b8] text-white text-sm sm:text-base font-bold shadow-md hover:shadow-lg transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <span>Start Matchmaker Quiz</span>
          <span>&rarr;</span>
        </button>
      </div>
    </div>
  );
}
