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
        // eslint-disable-next-line react-hooks/set-state-in-effect
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
      className="w-full bg-white rounded-2xl border border-[#e3e7ef] shadow-xs p-6 sm:p-10 text-center"
    >
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e9eef7] text-[#14213d] text-xs font-bold tracking-wide uppercase mb-3">
        <span>✨</span>
        <span>Bathtub Matchmaker</span>
      </div>
      <h2 className="font-playfair text-2xl sm:text-3xl font-semibold text-[#14213d] tracking-tight leading-tight max-w-2xl mx-auto">
        Find Your Ideal Bathtub Stay in 30 Seconds
      </h2>
      <p className="mt-2.5 text-xs sm:text-sm text-[#5b6478] max-w-xl mx-auto leading-relaxed font-manrope">
        Can&apos;t decide on a destination? Tell us what you are looking for and we&apos;ll match you with rooms with a private tub.
      </p>
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-[10px] bg-[#b08d57] hover:bg-[#9c7b48] text-white text-sm font-bold shadow-xs hover:shadow-md transition-all cursor-pointer font-manrope"
        >
          <span>Start Matchmaker Quiz</span>
          <span>&rarr;</span>
        </button>
      </div>
    </div>
  );
}
