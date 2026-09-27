'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { isUserExcluded, setUserExcluded } from '@/lib/exclusion';

export default function OptOutClient() {
  const [excluded, setExcluded] = useState<boolean | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setExcluded(isUserExcluded());
  }, []);

  const handleToggle = (enableExclusion: boolean) => {
    setUserExcluded(enableExclusion);
    setExcluded(enableExclusion);
    setToastMessage(
      enableExclusion
        ? 'Exclusion enabled! Analytics & session recordings are blocked on this device.'
        : 'Exclusion removed. Tracking is re-enabled on this device.'
    );
    setTimeout(() => setToastMessage(null), 4000);
  };

  if (excluded === null) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-700 text-sm flex items-center gap-2 animate-fade-in">
          <span>🔔</span>
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center text-2xl">
            🛡️
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 font-heading">
              Internal Traffic Exclusion
            </h1>
            <p className="text-sm text-gray-500">
              Exclude your personal device from Google Analytics, PostHog recordings, and Mixpanel
            </p>
          </div>
        </div>

        {/* Current Status Box */}
        <div
          className={`rounded-xl p-5 mb-8 border ${
            excluded
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{excluded ? '✅' : '⚠️'}</span>
              <div>
                <p className="font-semibold text-base">
                  {excluded
                    ? 'Tracking is currently DISABLED on this device'
                    : 'Tracking is currently ACTIVE on this device'}
                </p>
                <p className="text-xs mt-0.5 opacity-90">
                  {excluded
                    ? 'None of your visits, clicks, searches, or session recordings will reach GA4, PostHog, or Mixpanel.'
                    : 'Your visits will be recorded as regular user traffic in analytics reports.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          {!excluded ? (
            <button
              onClick={() => handleToggle(true)}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 text-sm"
            >
              <span>🛡️</span>
              <span>Exclude My Device from Tracking</span>
            </button>
          ) : (
            <button
              onClick={() => handleToggle(false)}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-colors border border-gray-300 flex items-center justify-center gap-2 text-sm"
            >
              <span>🔄</span>
              <span>Re-enable Tracking (for analytics QA)</span>
            </button>
          )}
        </div>

        {/* Quick Tips & Device Instructions */}
        <div className="border-t border-gray-100 pt-6 space-y-4 text-xs text-gray-600">
          <h2 className="font-semibold text-gray-800 text-sm">
            How exclusion works across all your devices:
          </h2>
          <ul className="space-y-2 list-disc list-inside">
            <li>
              <strong className="text-gray-700">On this computer:</strong> Once enabled, it saves a long-term cookie and browser flag that persists across sessions and browser restarts.
            </li>
            <li>
              <strong className="text-gray-700">On your phone or tablet:</strong> Simply open any page on the website with{' '}
              <code className="bg-gray-100 px-1.5 py-0.5 rounded text-accent font-mono text-[11px]">
                ?exclude=true
              </code>{' '}
              (for example:{' '}
              <span className="font-mono text-gray-800 select-all">
                https://hotelswithbathtubs.com/?exclude=true
              </span>
              ), and that device will be automatically excluded.
            </li>
            <li>
              <strong className="text-gray-700">What gets blocked:</strong> GA4 pageviews and events, PostHog session recordings & heatmaps, and Mixpanel outbound click tracking.
            </li>
          </ul>

          <div className="pt-4 flex justify-between items-center text-xs text-gray-400">
            <Link href="/" className="text-accent hover:underline flex items-center gap-1 font-medium">
              &larr; Back to Homepage
            </Link>
            <span>Hotels With Bathtubs &bull; Internal Controls</span>
          </div>
        </div>
      </div>
    </div>
  );
}
