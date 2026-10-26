'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { isUserExcluded } from '@/lib/exclusion';

export default function InternalTrafficBadge() {
  const [excluded, setExcluded] = useState(false);
  const [minimized, setMinimized] = useState(false);

  useEffect(() => {
    setExcluded(isUserExcluded());
  }, []);

  if (!excluded) return null;

  return (
    <div
      className="fixed bottom-4 left-4 z-50 transition-all select-none"
      role="status"
      aria-live="polite"
    >
      {minimized ? (
        <button
          onClick={() => setMinimized(false)}
          title="Click to view internal traffic exclusion details"
          className="bg-slate-900/90 hover:bg-slate-900 text-sky-400 text-xs px-2.5 py-1.5 rounded-full shadow-lg border border-slate-700 backdrop-blur-sm flex items-center gap-1.5 transition-transform hover:scale-105"
        >
          <span>🛡️</span>
          <span className="font-mono text-[11px] font-medium">Internal Mode</span>
        </button>
      ) : (
        <div className="bg-slate-900/95 text-slate-200 border border-slate-700/80 rounded-xl p-3 shadow-2xl backdrop-blur-md max-w-xs text-xs flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 font-semibold text-emerald-400">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Analytics Tracking Off</span>
            </div>
            <button
              onClick={() => setMinimized(true)}
              className="text-slate-400 hover:text-slate-200 text-xs px-1.5 py-0.5 rounded hover:bg-slate-800 transition-colors"
              title="Minimize badge"
            >
              ✕
            </button>
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            Your visits, pageviews, clicks, and session recordings are <strong className="text-white">excluded</strong> from GA4, PostHog, and Mixpanel.
          </p>
          <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[11px]">
            <Link
              href="/opt-out"
              className="text-sky-400 hover:text-sky-300 hover:underline font-medium"
            >
              Settings & Toggle &rarr;
            </Link>
            <span className="text-slate-500 font-mono text-[10px]">Admin Device</span>
          </div>
        </div>
      )}
    </div>
  );
}
