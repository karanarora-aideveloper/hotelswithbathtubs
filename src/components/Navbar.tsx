'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from '@/components/Logo';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close mobile menu on route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Handle escape key to close menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Prevent background scroll when mobile drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-border/80 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-15 sm:h-16">
          {/* Brand Logo & Name */}
          <Link
            href="/"
            className="flex items-center gap-2.5 sm:gap-3 flex-shrink-0 group focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-lg"
          >
            <Logo className="w-8 h-8 sm:w-9 sm:h-9 flex-shrink-0 transition-transform group-hover:scale-105" />
            <div className="flex flex-col items-start text-left min-w-0">
              <span className="font-heading text-base sm:text-lg font-extrabold tracking-tight text-accent-secondary leading-tight">
                Hotels With Bathtubs
              </span>
              <p className="text-text-muted text-2xs font-medium hidden sm:block">
                Verified Luxury In-Room Tubs &amp; Jacuzzis
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links (Visible on lg: 1024px and up to prevent tablet clipping) */}
          <nav aria-label="Main Navigation" className="hidden lg:flex items-center gap-6 xl:gap-7 text-sm font-semibold text-text-main">
            <Link
              href="/usa"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-accent-secondary border border-amber-200/80 rounded-lg text-xs font-bold transition-all shadow-2xs"
            >
              <span>🇺🇸</span>
              <span>USA Stays</span>
            </Link>
            <Link href="/#destinations" className="hover:text-accent transition-colors">
              Destinations
            </Link>
            <Link href="/blog" className="hover:text-accent transition-colors">
              Travel Guides
            </Link>
            <Link href="/#verification" className="hover:text-accent transition-colors">
              Verification
            </Link>
            <Link href="/#faq" className="hover:text-accent transition-colors">
              FAQs
            </Link>
            <Link
              href="/#destinations"
              className="bg-accent hover:bg-accent-hover text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-2xs hover:shadow-md transform hover:-translate-y-0.5 whitespace-nowrap ml-1"
            >
              Browse 150+ Destinations &rarr;
            </Link>
          </nav>

          {/* Mobile & Tablet Controls (< lg: 1024px) */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={isOpen}
              aria-controls="mobile-navigation"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-gray-200 bg-white hover:bg-gray-50 active:bg-gray-100 text-text-main font-semibold text-xs shadow-2xs transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent min-h-[40px]"
            >
              <span className="text-2xs font-bold uppercase tracking-wider text-text-muted">Menu</span>
              <svg className="w-4 h-4 text-accent-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.25">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {mounted && createPortal(
        <>
          {/* Slide-over Backdrop */}
          <div
            className={`fixed inset-0 bg-black/60 backdrop-blur-xs z-[100] lg:hidden transition-opacity duration-300 ease-in-out ${
              isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Slide-over Drawer Panel */}
          <div
            id="mobile-navigation"
            role="dialog"
            aria-modal="true"
            aria-label="Site Navigation"
            className={`fixed top-0 right-0 bottom-0 w-[88vw] max-w-sm bg-white z-[101] shadow-2xl flex flex-col lg:hidden transition-transform duration-300 ease-in-out ${
              isOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/80 bg-gray-50/50">
          <div className="flex items-center gap-2.5">
            <Logo className="w-7 h-7 flex-shrink-0" />
            <span className="font-heading text-sm font-extrabold text-accent-secondary">
              Hotels With Bathtubs
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Close navigation menu"
            className="w-9 h-9 rounded-full bg-white border border-gray-200 text-text-muted hover:text-text-main hover:bg-gray-100 flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.25">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
          {/* Quick Destination Hubs */}
          <div>
            <span className="text-2xs font-bold uppercase tracking-wider text-text-muted block mb-2.5">
              Popular Collections
            </span>
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/usa"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 p-2.5 bg-gray-50 hover:bg-amber-50/60 border border-gray-200/80 rounded-xl transition-all group"
              >
                <span className="text-xl">🇺🇸</span>
                <div className="min-w-0">
                  <span className="block text-xs font-bold text-accent-secondary group-hover:text-accent truncate">USA Stays</span>
                  <span className="block text-3xs text-text-muted">New York, Vegas...</span>
                </div>
              </Link>
              <Link
                href="/india"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 p-2.5 bg-gray-50 hover:bg-amber-50/60 border border-gray-200/80 rounded-xl transition-all group"
              >
                <span className="text-xl">🇮🇳</span>
                <div className="min-w-0">
                  <span className="block text-xs font-bold text-accent-secondary group-hover:text-accent truncate">India Stays</span>
                  <span className="block text-3xs text-text-muted">Goa, Udaipur...</span>
                </div>
              </Link>
              <Link
                href="/#destinations"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 p-2.5 bg-gray-50 hover:bg-amber-50/60 border border-gray-200/80 rounded-xl transition-all group col-span-2"
              >
                <span className="text-xl">🌍</span>
                <div className="min-w-0">
                  <span className="block text-xs font-bold text-accent-secondary group-hover:text-accent truncate">All 150+ Destinations</span>
                  <span className="block text-3xs text-text-muted">Paris, Tokyo, Dubai, Bali &amp; more</span>
                </div>
              </Link>
            </div>
          </div>

          {/* Navigation Links with Micro-Copy */}
          <div>
            <span className="text-2xs font-bold uppercase tracking-wider text-text-muted block mb-2">
              Explore &amp; Guides
            </span>
            <nav className="flex flex-col space-y-1">
              <Link
                href="/"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold text-text-main hover:bg-gray-50 hover:text-accent transition-colors"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                  </svg>
                  <span>Home</span>
                </div>
                <span className="text-text-muted text-xs">&rarr;</span>
              </Link>

              <Link
                href="/#destinations"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold text-text-main hover:bg-gray-50 hover:text-accent transition-colors"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  <div>
                    <span className="block">All Destinations</span>
                    <span className="block text-2xs text-text-muted font-normal">Browse by region &amp; city</span>
                  </div>
                </div>
                <span className="text-text-muted text-xs">&rarr;</span>
              </Link>

              <Link
                href="/blog"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold text-text-main hover:bg-gray-50 hover:text-accent transition-colors"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                  </svg>
                  <div>
                    <span className="block">Travel Guides &amp; Blog</span>
                    <span className="block text-2xs text-text-muted font-normal">Curated itineraries &amp; reviews</span>
                  </div>
                </div>
                <span className="text-text-muted text-xs">&rarr;</span>
              </Link>
            </nav>
          </div>

          {/* Trust & Policy Links */}
          <div>
            <span className="text-2xs font-bold uppercase tracking-wider text-text-muted block mb-2">
              Trust &amp; Standards
            </span>
            <nav className="flex flex-col space-y-1">
              <Link
                href="/#verification"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold text-text-main hover:bg-gray-50 hover:text-accent transition-colors"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                  <div>
                    <span className="block">Triple-Verification</span>
                    <span className="block text-2xs text-text-muted font-normal">How we guarantee private tubs</span>
                  </div>
                </div>
                <span className="text-text-muted text-xs">&rarr;</span>
              </Link>

              <Link
                href="/#faq"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold text-text-main hover:bg-gray-50 hover:text-accent transition-colors"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                  </svg>
                  <span>Frequently Asked Questions</span>
                </div>
                <span className="text-text-muted text-xs">&rarr;</span>
              </Link>

              <Link
                href="/about"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold text-text-main hover:bg-gray-50 hover:text-accent transition-colors"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                  </svg>
                  <span>About Hotels With Bathtubs</span>
                </div>
                <span className="text-text-muted text-xs">&rarr;</span>
              </Link>
            </nav>
          </div>
        </div>

        {/* Drawer Footer CTA */}
        <div className="p-5 border-t border-border/80 bg-gray-50/70 space-y-3">
          <Link
            href="/#destinations"
            onClick={() => setIsOpen(false)}
            className="w-full bg-accent hover:bg-accent-hover text-white text-sm font-bold py-3 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
          >
            <span>Explore 150+ Destinations</span>
            <span>&rarr;</span>
          </Link>
          <p className="text-3xs text-center text-text-muted">
            Triple-verified across Booking.com &amp; Agoda · Guaranteed private tubs
          </p>
        </div>
      </div>
        </>,
        document.body
      )}
    </header>
  );
}
