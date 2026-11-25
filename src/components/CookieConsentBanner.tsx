'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { clearAnalyticsStorage, CONSENT_REGIONS, NOTICE_REGIONS, hasGlobalPrivacyControl } from '@/lib/consent';
import { getUserRecurrenceData, resetRecurrenceCache } from '@/lib/userRecurrence';
import { fetchSharedGeo, getCachedGeo } from '@/lib/useGeo';

export default function CookieConsentBanner() {
  const [isOpen, setIsOpen] = useState(false);
  // optin: UK/EEA/CH, nothing runs until Accept. notice: US, analytics runs until Opt out.
  const [mode, setMode] = useState<'optin' | 'notice'>('optin');

  useEffect(() => {
    // Reopen when user clicks "Cookie settings" in footer
    const handleOpenSettings = () => {
      const code = (getCachedGeo()?.countryCode || '').toUpperCase();
      setMode(NOTICE_REGIONS.has(code) ? 'notice' : 'optin');
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
      // Check region via shared geo lookup
      fetchSharedGeo()
        .then((data) => {
          const code = (data?.countryCode || '').toUpperCase();
          if (CONSENT_REGIONS.has(code)) {
            setMode('optin');
            setIsOpen(true);
            if (savedConsent !== 'granted') {
              clearAnalyticsStorage();
            }
          } else if (NOTICE_REGIONS.has(code)) {
            setMode('notice');
            setIsOpen(true);
            // Global Privacy Control already opts the visitor out; make sure nothing is stored.
            if (hasGlobalPrivacyControl()) clearAnalyticsStorage();
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
    resetRecurrenceCache();
    getUserRecurrenceData();
    window.dispatchEvent(new CustomEvent('hwb-consent-updated', { detail: { consent: 'granted' } }));
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
    clearAnalyticsStorage();
    resetRecurrenceCache();
    window.dispatchEvent(new CustomEvent('hwb-consent-updated', { detail: { consent: 'denied' } }));
    setIsOpen(false);
  };

  if (!isOpen) return null;
  const gpc = hasGlobalPrivacyControl();

  return (
    <div
      role="region"
      aria-label="Cookie consent banner"
      className="fixed bottom-0 inset-x-0 z-50 p-3 sm:p-4 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-xl"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm text-slate-700">
        <p className="text-center sm:text-left leading-normal font-jakarta">
          {mode === 'notice' ? (
            <>
              We use Google Analytics cookies to see which pages help travellers. We don&apos;t sell or share your personal information.
              {gpc ? ' Your browser\'s Global Privacy Control is on, so analytics is off.' : ' You can opt out at any time.'} Read our{' '}
              <Link href="/privacy#your-rights" className="text-accent underline font-semibold hover:text-accent-hover">
                Privacy Policy
              </Link>
              .
            </>
          ) : (
            <>
              We use cookies to analyze site traffic and improve your browsing experience. Read our{' '}
              <Link href="/cookies" className="text-accent underline font-semibold hover:text-accent-hover">
                Cookie Policy
              </Link>
              .
            </>
          )}
        </p>
        <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0 font-jakarta">
          {!(mode === 'notice' && gpc) && (
            <button
              type="button"
              onClick={handleReject}
              className="flex-1 sm:flex-none px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer text-center"
            >
              {mode === 'notice' ? 'Opt out' : 'Reject'}
            </button>
          )}
          <button
            type="button"
            // With Global Privacy Control on, "OK" only closes the notice and keeps analytics off.
            onClick={mode === 'notice' && gpc ? handleReject : handleAccept}
            className="flex-1 sm:flex-none px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer text-center"
          >
            {mode === 'notice' ? (gpc ? 'OK' : 'Allow cookies') : 'Accept'}
          </button>
        </div>
      </div>
    </div>
  );
}
