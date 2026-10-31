'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export const CONSENT_REGIONS = new Set([
  'AT', 'BE', 'BG', 'CH', 'CY', 'CZ', 'DE', 'DK', 'EE', 'ES',
  'FI', 'FR', 'GB', 'GR', 'HR', 'HU', 'IE', 'IS', 'IT', 'LI',
  'LT', 'LU', 'LV', 'MT', 'NL', 'NO', 'PL', 'PT', 'RO', 'SE',
  'SI', 'SK',
]);

export default function CookieConsentBanner() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Reopen when user clicks "Cookie settings" in footer
    const handleOpenSettings = () => {
      setIsOpen(true);
    };

    window.addEventListener('open-cookie-settings', handleOpenSettings);

    // Check if consent has already been chosen
    let savedConsent: string | null = null;
    try {
      savedConsent = localStorage.getItem('hwb_consent');
    } catch {
      // In private browsing or storage-disabled environments
    }

    if (!savedConsent) {
      // Check region via /api/geo
      fetch('/api/geo')
        .then((res) => {
          if (!res.ok) return null;
          return res.json();
        })
        .then((data) => {
          const code = (data?.countryCode || '').toUpperCase();
          if (CONSENT_REGIONS.has(code)) {
            setIsOpen(true);
          }
        })
        .catch(() => {
          // If geo fails, keep closed by default
        });
    }

    return () => {
      window.removeEventListener('open-cookie-settings', handleOpenSettings);
    };
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem('hwb_consent', 'granted');
    } catch {}
    if (typeof (window as any).gtag === 'function') {
      (window as any).gtag('consent', 'update', {
        analytics_storage: 'granted',
      });
    }
    setIsOpen(false);
  };

  const handleReject = () => {
    try {
      localStorage.setItem('hwb_consent', 'denied');
    } catch {}
    if (typeof (window as any).gtag === 'function') {
      (window as any).gtag('consent', 'update', {
        analytics_storage: 'denied',
      });
    }
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div
      role="region"
      aria-label="Cookie consent banner"
      className="fixed bottom-0 inset-x-0 z-50 p-3 sm:p-4 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-xl"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm text-slate-700">
        <p className="text-center sm:text-left leading-normal font-jakarta">
          We use cookies to analyze site traffic and improve your browsing experience. Read our{' '}
          <Link href="/cookies" className="text-accent underline font-semibold hover:text-accent-hover">
            Cookie Policy
          </Link>
          .
        </p>
        <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0 font-jakarta">
          <button
            type="button"
            onClick={handleReject}
            className="flex-1 sm:flex-none px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer text-center"
          >
            Reject
          </button>
          <button
            type="button"
            onClick={handleAccept}
            className="flex-1 sm:flex-none px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer text-center"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
