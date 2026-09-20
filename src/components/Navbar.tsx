'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from '@/components/Logo';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

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
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-border shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Brand Logo & Name */}
          <Link
            href="/"
            className="flex items-center gap-2 sm:gap-3 flex-shrink-0 group focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-lg"
          >
            <Logo className="w-8 h-8 sm:w-9 sm:h-9 flex-shrink-0 transition-transform group-hover:scale-105" />
            <div className="flex flex-col items-start text-left min-w-0">
              <span className="font-heading text-sm sm:text-base md:text-lg font-extrabold tracking-tight text-accent-secondary leading-tight truncate">
                Hotels With Bathtubs
              </span>
              <p className="text-text-muted text-2xs font-medium hidden sm:block">
                Verified Premium Suites &amp; Jacuzzis
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links (Visible on md and up) */}
          <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-4 lg:gap-6 text-xs sm:text-sm font-semibold text-text-main">
            <Link
              href="/usa"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-accent-secondary border border-amber-200/80 rounded-lg font-bold transition-all shadow-2xs"
            >
              <span>🇺🇸</span>
              <span>USA Stays</span>
            </Link>
            <Link href="/#destinations" className="hover:text-accent transition-colors py-1">
              Destinations
            </Link>
            <Link href="/blog" className="hover:text-accent transition-colors py-1">
              Travel Guides
            </Link>
            <Link href="/#verification" className="hover:text-accent transition-colors py-1">
              Verification
            </Link>
            <Link href="/#faq" className="hover:text-accent transition-colors py-1">
              FAQs
            </Link>
            <Link
              href="/#destinations"
              className="bg-accent hover:bg-accent-hover text-white text-xs font-bold px-3.5 py-2 rounded-lg transition-colors shadow-2xs whitespace-nowrap ml-1"
            >
              Browse 125+ Destinations
            </Link>
          </nav>

          {/* Mobile Right Controls (< md) */}
          <div className="flex items-center gap-2 md:hidden">
            <Link
              href="/usa"
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-accent-secondary border border-amber-200/80 rounded-lg text-xs font-bold shadow-2xs"
            >
              <span>🇺🇸</span>
              <span>USA</span>
            </Link>

            {/* Hamburger Button */}
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={isOpen}
              aria-controls="mobile-navigation"
              className="p-2 rounded-lg text-text-main hover:text-accent hover:bg-gray-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              {isOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.25">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.25">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 top-14 sm:top-16 bg-black/40 backdrop-blur-xs z-40 md:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer Menu Content */}
      <div
        id="mobile-navigation"
        className={`fixed top-14 sm:top-16 left-0 right-0 bg-white border-b border-border shadow-xl z-50 md:hidden transition-all duration-300 ease-in-out transform ${
          isOpen ? 'opacity-100 translate-y-0 visible' : 'opacity-0 -translate-y-2 invisible pointer-events-none'
        } max-h-[calc(100vh-3.5rem)] overflow-y-auto`}
      >
        <div className="p-4 sm:p-6 space-y-4">
          {/* Quick Hub Jump Pills */}
          <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
            <span className="text-2xs font-bold uppercase tracking-wider text-text-muted block mb-2">
              Featured Collections
            </span>
            <div className="grid grid-cols-3 gap-2">
              <Link
                href="/usa"
                onClick={() => setIsOpen(false)}
                className="flex flex-col items-center justify-center p-2.5 bg-white border border-gray-200 rounded-lg text-center hover:border-accent transition-colors"
              >
                <span className="text-lg mb-1">🇺🇸</span>
                <span className="text-xs font-bold text-accent-secondary">USA</span>
              </Link>
              <Link
                href="/india"
                onClick={() => setIsOpen(false)}
                className="flex flex-col items-center justify-center p-2.5 bg-white border border-gray-200 rounded-lg text-center hover:border-accent transition-colors"
              >
                <span className="text-lg mb-1">🇮🇳</span>
                <span className="text-xs font-bold text-accent-secondary">India</span>
              </Link>
              <Link
                href="/#destinations"
                onClick={() => setIsOpen(false)}
                className="flex flex-col items-center justify-center p-2.5 bg-white border border-gray-200 rounded-lg text-center hover:border-accent transition-colors"
              >
                <span className="text-lg mb-1">🌍</span>
                <span className="text-xs font-bold text-accent-secondary">Global</span>
              </Link>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col space-y-1">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="px-3 py-2.5 rounded-lg text-sm font-semibold text-text-main hover:bg-gray-50 hover:text-accent transition-colors flex items-center justify-between"
            >
              <span>Home</span>
              <span className="text-text-muted text-xs">&rarr;</span>
            </Link>
            <Link
              href="/#destinations"
              onClick={() => setIsOpen(false)}
              className="px-3 py-2.5 rounded-lg text-sm font-semibold text-text-main hover:bg-gray-50 hover:text-accent transition-colors flex items-center justify-between"
            >
              <span>All 125+ Destinations</span>
              <span className="text-text-muted text-xs">&rarr;</span>
            </Link>
            <Link
              href="/blog"
              onClick={() => setIsOpen(false)}
              className="px-3 py-2.5 rounded-lg text-sm font-semibold text-text-main hover:bg-gray-50 hover:text-accent transition-colors flex items-center justify-between"
            >
              <span>Travel Guides &amp; Blog</span>
              <span className="text-text-muted text-xs">&rarr;</span>
            </Link>
            <Link
              href="/#verification"
              onClick={() => setIsOpen(false)}
              className="px-3 py-2.5 rounded-lg text-sm font-semibold text-text-main hover:bg-gray-50 hover:text-accent transition-colors flex items-center justify-between"
            >
              <span>Our Triple-Verification Promise</span>
              <span className="text-text-muted text-xs">&rarr;</span>
            </Link>
            <Link
              href="/#faq"
              onClick={() => setIsOpen(false)}
              className="px-3 py-2.5 rounded-lg text-sm font-semibold text-text-main hover:bg-gray-50 hover:text-accent transition-colors flex items-center justify-between"
            >
              <span>Frequently Asked Questions</span>
              <span className="text-text-muted text-xs">&rarr;</span>
            </Link>
            <Link
              href="/about"
              onClick={() => setIsOpen(false)}
              className="px-3 py-2.5 rounded-lg text-sm font-semibold text-text-main hover:bg-gray-50 hover:text-accent transition-colors flex items-center justify-between"
            >
              <span>About Hotels With Bathtubs</span>
              <span className="text-text-muted text-xs">&rarr;</span>
            </Link>
          </nav>

          {/* Mobile CTA Button */}
          <div className="pt-2">
            <Link
              href="/#destinations"
              onClick={() => setIsOpen(false)}
              className="w-full bg-accent hover:bg-accent-hover text-white text-sm font-bold py-3 px-4 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <span>Find Hotels with In-Room Bathtubs</span>
              <span>&rarr;</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
