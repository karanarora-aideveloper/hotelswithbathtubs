'use client';

import { useEffect } from 'react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    const msg = error?.message || '';
    if (
      msg.includes('ChunkLoadError') ||
      msg.includes('Failed to load chunk') ||
      msg.includes('Loading chunk') ||
      msg.includes('is not executable')
    ) {
      window.location.reload();
    }
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="w-16 h-16 bg-blue-50 text-[#1a6fde] rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-xs">
        🛁
      </div>
      <h2 className="font-heading text-2xl font-bold text-gray-900 mb-2">
        Let's refresh your stay
      </h2>
      <p className="text-gray-500 text-sm max-w-md mb-6 leading-relaxed">
        We just updated our verified bathtub inventory. Click below to load the latest stays.
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 bg-[#1a6fde] hover:bg-[#1559b8] text-white text-xs font-bold rounded-xl transition-all shadow-sm"
        >
          Refresh Stays
        </button>
        <button
          onClick={() => reset()}
          className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
