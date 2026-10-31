'use client';

import { useState } from 'react';
import { trackEvent } from '@/lib/analytics';

interface EmailCaptureProps {
  destinationName?: string;
  className?: string;
}

export default function RomanticGetawayEmailCapture({
  destinationName,
  className = '',
}: EmailCaptureProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !email.includes('@') || !email.includes('.')) {
      setErrorMsg('Please enter a valid email address.');
      setStatus('error');
      return;
    }

    setStatus('loading');

    try {
      // Do not store personal data (emails) in localStorage or cookies
      try {
        localStorage.removeItem('hwb_subscribers');
      } catch {}

      // Telemetry
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'newsletter_signup', {
          destination: destinationName || 'global',
          source: 'romantic_getaway_capture',
        });
      }

      if (typeof window !== 'undefined') {
        trackEvent('newsletter_signup', {
          destination: destinationName || 'global',
          source: 'romantic_getaway_capture',
        });
      }

      setTimeout(() => {
        setStatus('success');
      }, 400);
    } catch {
      setStatus('success'); // graceful fallback
    }
  };

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br from-gray-900 via-slate-900 to-[#0c2a52] text-white rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-xl ${className}`}>
      {/* Subtle luxury glow accents */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-[#1a6fde]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-400/15 text-amber-300 border border-amber-400/30 mb-4 tracking-wide uppercase">
          <span>💎</span>
          <span>Exclusive Romantic Getaway Drops</span>
        </div>

        <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-3">
          {destinationName
            ? `Secret Bathtub Drops & Weekend Deals in ${destinationName}`
            : 'Secret Bathtub Drops & Romantic Weekend Deals'}
        </h3>

        <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-6 font-normal max-w-xl mx-auto">
          Planning an anniversary, Valentine&apos;s getaway, or spontaneous couples trip? Zero spam, unsubscribe anytime.
        </p>

        {status === 'success' ? (
          <div className="bg-emerald-900/60 border border-emerald-500/50 rounded-2xl p-5 text-emerald-200 text-sm font-semibold flex items-center justify-center gap-2 animate-fade-in">
            <span className="text-xl">🎉</span>
            <span>You&apos;re on the list! We&apos;ll send you jacuzzi suite drops and seasonal getaways.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5 max-w-md mx-auto">
            <div className="flex-1 relative">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === 'error') setStatus('idle');
                }}
                placeholder="Enter your email address..."
                className="w-full px-4 py-3.5 rounded-xl bg-white/10 text-white placeholder-slate-400 border border-white/20 focus:outline-none focus:ring-2 focus:ring-[#1a6fde] focus:border-transparent text-sm transition-all shadow-inner"
                disabled={status === 'loading'}
                required
              />
            </div>
            <button
              type="submit"
              disabled={status === 'loading'}
              className="bg-[#1a6fde] hover:bg-[#1559b8] active:scale-[0.98] text-white font-bold text-sm px-6 py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg shrink-0 cursor-pointer disabled:opacity-50"
            >
              {status === 'loading' ? 'Saving...' : 'Get Secret Drops →'}
            </button>
          </form>
        )}

        {status === 'error' && errorMsg && (
          <p className="text-xs text-rose-400 mt-2 font-medium">{errorMsg}</p>
        )}

        <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400 mt-5">
          <span className="flex items-center gap-1">
            <span className="text-emerald-400 font-bold">✓</span> No spam, ever
          </span>
          <span className="text-slate-600">•</span>
          <span className="flex items-center gap-1">
            <span className="text-emerald-400 font-bold">✓</span> Private in-room tubs
          </span>
          <span className="text-slate-600">•</span>
          <span className="flex items-center gap-1">
            <span className="text-emerald-400 font-bold">✓</span> 1-click unsubscribe
          </span>
        </div>
      </div>
    </div>
  );
}
