'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useFavorites, useMounted } from '@/components/Favorites';
import CountrySelector from '@/components/CountrySelector';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreDropdownRef = useRef<HTMLDivElement>(null);

  const mounted = useMounted();
  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setIsOpen(false);
    setMoreOpen(false);
  }
  const { favorites } = useFavorites();
  const favCount = mounted ? favorites.length : 0;

  // Handle escape key to close menus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (moreOpen) setMoreOpen(false);
        if (isOpen) setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, moreOpen]);

  // Close "More" dropdown on outside click
  useEffect(() => {
    if (!moreOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (moreDropdownRef.current && !moreDropdownRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [moreOpen]);

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

  if (pathname?.startsWith('/redesign')) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 bg-[#f5f6f8] border-b border-[#e3e7ef]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between h-[64px]">
          {/* Brand Logo & Name: single line, no top clipping */}
          <Link
            href="/"
            prefetch={false}
            className="flex flex-col items-start text-left focus:outline-none group shrink-0 whitespace-nowrap pr-2"
          >
            <span className="font-playfair text-[20px] sm:text-[22px] font-semibold tracking-normal text-[#14213d] leading-snug whitespace-nowrap pt-1">
              Hotels with Bathtubs
            </span>
            <span className="font-sans text-[8.5px] sm:text-[9px] font-semibold tracking-[0.22em] uppercase text-[#5b6478] leading-none mt-0.5 whitespace-nowrap">
              ROOMS WITH A TUB, CHECKED
            </span>
          </Link>

          {/* Desktop Navigation Links (Visible on lg: 1024px and up) */}
          <nav aria-label="Main Navigation" className="hidden lg:flex items-center gap-3 xl:gap-4 2xl:gap-5 text-sm font-semibold text-[#14213d] shrink-0">
            <Link
              href="/matchmaker"
              prefetch={false}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#e9eef7] hover:bg-[#dce4f2] text-[#14213d] text-xs font-bold transition-all border border-[#e3e7ef] whitespace-nowrap shrink-0"
            >
              <span className="text-sm">✨</span>
              <span>Matchmaker</span>
            </Link>
            <Link href="/#destinations" prefetch={false} className="hover:text-[#b08d57] transition-colors whitespace-nowrap shrink-0">
              Destinations
            </Link>
            <Link href="/blog" prefetch={false} className="hover:text-[#b08d57] transition-colors whitespace-nowrap shrink-0">
              Travel Guides
            </Link>
            <Link href="/couple-friendly" prefetch={false} className="hover:text-[#b08d57] transition-colors whitespace-nowrap shrink-0">
              Couple Stays
            </Link>

            {/* How we check: visible at xl (1280px+), under More at 1024-1279px */}
            <Link
              href="/how-we-check-bathtubs"
              prefetch={false}
              className="hidden xl:inline-flex hover:text-[#b08d57] transition-colors whitespace-nowrap shrink-0"
            >
              How we check
            </Link>

            {/* Hostels & FAQs: visible at >= 1400px, under More at 1024-1399px */}
            <Link
              href="/hostels"
              prefetch={false}
              className="hidden nav-wide-show hover:text-[#b08d57] transition-colors items-center gap-1 whitespace-nowrap shrink-0"
            >
              <span>Hostels</span>
              <span className="text-[9px] font-bold px-1.5 py-0.2 bg-[#e9eef7] text-[#14213d] rounded-full">New</span>
            </Link>
            <Link
              href="/#faq"
              prefetch={false}
              className="hidden nav-wide-show hover:text-[#b08d57] transition-colors whitespace-nowrap shrink-0"
            >
              FAQs
            </Link>

            {/* Progressive Disclosure "More ⌄" dropdown: visible at 1024-1399px, hidden at >= 1400px */}
            <div className="relative hidden lg:flex nav-wide-hide shrink-0" ref={moreDropdownRef}>
              <button
                type="button"
                onClick={() => setMoreOpen(!moreOpen)}
                aria-expanded={moreOpen}
                className="flex items-center gap-1 hover:text-[#b08d57] transition-colors whitespace-nowrap py-1 cursor-pointer font-semibold text-sm"
              >
                <span>More</span>
                <span className="text-[10px] text-[#5b6478]">▾</span>
              </button>
              {moreOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-[#e3e7ef] py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  {/* How we check (in More at 1024-1279px, moves to main nav at >= 1280px) */}
                  <Link
                    href="/how-we-check-bathtubs"
                    prefetch={false}
                    onClick={() => setMoreOpen(false)}
                    className="xl:hidden flex items-center px-4 py-2 text-xs font-semibold text-[#14213d] hover:bg-[#f5f6f8] hover:text-[#b08d57] transition-colors"
                  >
                    How we check
                  </Link>
                  {/* Hostels (in More below 1400px) */}
                  <Link
                    href="/hostels"
                    prefetch={false}
                    onClick={() => setMoreOpen(false)}
                    className="flex items-center justify-between px-4 py-2 text-xs font-semibold text-[#14213d] hover:bg-[#f5f6f8] hover:text-[#b08d57] transition-colors"
                  >
                    <span>Hostels</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 bg-[#e9eef7] text-[#14213d] rounded-full">New</span>
                  </Link>
                  {/* FAQs (in More below 1400px) */}
                  <Link
                    href="/#faq"
                    prefetch={false}
                    onClick={() => setMoreOpen(false)}
                    className="flex items-center px-4 py-2 text-xs font-semibold text-[#14213d] hover:bg-[#f5f6f8] hover:text-[#b08d57] transition-colors"
                  >
                    FAQs
                  </Link>
                </div>
              )}
            </div>

            {/* Country Selector Menu */}
            <CountrySelector variant="desktop" className="shrink-0" />

            {/* Wishlist Heart */}
            <Link
              href="/wishlist"
              prefetch={false}
              className="relative hover:text-[#b08d57] transition-colors flex items-center p-1 whitespace-nowrap shrink-0"
              title="Your saved hotels"
            >
              <svg className="w-5 h-5 text-[#5b6478] hover:text-[#b08d57] transition-colors" fill={favCount > 0 ? '#b08d57' : 'none'} stroke={favCount > 0 ? '#b08d57' : 'currentColor'} viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {favCount > 0 && (
                <span className="absolute -top-1 -right-1.5 bg-[#b08d57] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {favCount}
                </span>
              )}
            </Link>

            {/* Brass CTA button: visible only at 1280px and wider */}
            <Link
              href="/#destinations"
              prefetch={false}
              className="hidden xl:inline-flex bg-[#b08d57] hover:bg-[#9c7b48] text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-xs whitespace-nowrap shrink-0 ml-1"
            >
              Browse 150+ Destinations &rarr;
            </Link>
          </nav>

          {/* Mobile Menu Icon (< lg: 1024px) */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={isOpen}
              aria-controls="mobile-navigation"
              className="p-2 -mr-2 text-[#14213d] hover:opacity-80 transition-opacity focus:outline-none"
            >
              <span className="sr-only">Menu</span>
              <div className="w-[22px] h-[14px] border-t-2 border-b-2 border-[#14213d] relative before:content-[''] before:absolute before:left-0 before:right-0 before:top-[4px] before:border-t-2 before:border-[#14213d]" />
            </button>
          </div>
        </div>
      </div>

      {mounted && createPortal(
        <>
          {/* Slide-over Backdrop */}
          <div
            className={`fixed inset-0 bg-black/50 backdrop-blur-xs z-[100] lg:hidden transition-opacity duration-300 ease-in-out ${
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
            className={`fixed top-0 right-0 bottom-0 w-[88vw] max-w-sm bg-white z-[101] shadow-2xl flex flex-col lg:hidden transition-transform duration-300 ease-in-out border-l border-[#e3e7ef] ${
              isOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#e3e7ef] bg-[#f5f6f8]">
              <div className="flex flex-col items-start text-left">
                <span className="font-playfair text-base font-semibold text-[#14213d] leading-tight">
                  Hotels with Bathtubs
                </span>
                <span className="font-sans text-[8.5px] font-semibold tracking-[0.2em] uppercase text-[#5b6478] mt-0.5">
                  ROOMS WITH A TUB, CHECKED
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close navigation menu"
                className="w-8 h-8 rounded-full bg-white border border-[#e3e7ef] text-[#5b6478] hover:text-[#14213d] flex items-center justify-center transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.25">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6 font-sans">
              {/* Mobile Country Selector */}
              <div>
                <CountrySelector variant="mobile" onSelect={() => setIsOpen(false)} />
              </div>

              {/* Dream Soak Matchmaker Feature Card */}
              <Link
                href="/matchmaker"
                prefetch={false}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 p-3.5 bg-[#e9eef7] border border-[#e3e7ef] rounded-2xl shadow-xs transition-all group"
              >
                <div className="w-9 h-9 rounded-xl bg-[#b08d57] text-white flex items-center justify-center text-base flex-shrink-0 shadow-xs">
                  ✨
                </div>
                <div className="min-w-0">
                  <span className="block text-xs font-bold text-[#14213d] group-hover:text-[#b08d57] truncate">
                    Bathtub Matchmaker
                  </span>
                  <span className="block text-2xs text-[#5b6478] truncate">
                    Find hotels matched to your travel style
                  </span>
                </div>
              </Link>

              {/* Main Site Navigation */}
              <div>
                <span className="text-2xs font-bold uppercase tracking-wider text-[#5b6478] block mb-2">
                  Explore Destinations
                </span>
                <nav className="flex flex-col space-y-1">
                  <Link
                    href="/#destinations"
                    prefetch={false}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold text-[#14213d] hover:bg-[#f5f6f8] hover:text-[#b08d57] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-base">🗺️</span>
                      <span>Browse All Destinations</span>
                    </div>
                    <span className="text-[#5b6478] text-xs">&rarr;</span>
                  </Link>

                  <Link
                    href="/usa"
                    prefetch={false}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold text-[#14213d] hover:bg-[#f5f6f8] hover:text-[#b08d57] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-base">🇺🇸</span>
                      <span>United States Hotels</span>
                    </div>
                    <span className="text-[#5b6478] text-xs">&rarr;</span>
                  </Link>

                  <Link
                    href="/india"
                    prefetch={false}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold text-[#14213d] hover:bg-[#f5f6f8] hover:text-[#b08d57] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-base">🇮🇳</span>
                      <span>India Hotels</span>
                    </div>
                    <span className="text-[#5b6478] text-xs">&rarr;</span>
                  </Link>

                  <Link
                    href="/uk"
                    prefetch={false}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold text-[#14213d] hover:bg-[#f5f6f8] hover:text-[#b08d57] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-base">🇬🇧</span>
                      <span>United Kingdom Hotels</span>
                    </div>
                    <span className="text-[#5b6478] text-xs">&rarr;</span>
                  </Link>
                </nav>
              </div>

              {/* Stays & Guides */}
              <div>
                <span className="text-2xs font-bold uppercase tracking-wider text-[#5b6478] block mb-2">
                  Specialty Collections
                </span>
                <nav className="flex flex-col space-y-1">
                  <Link
                    href="/blog"
                    prefetch={false}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold text-[#14213d] hover:bg-[#f5f6f8] hover:text-[#b08d57] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-base">📖</span>
                      <div>
                        <span className="block">Travel Guides &amp; Blog</span>
                        <span className="block text-2xs text-[#5b6478] font-normal">Curated itineraries &amp; reviews</span>
                      </div>
                    </div>
                    <span className="text-[#5b6478] text-xs">&rarr;</span>
                  </Link>

                  <Link
                    href="/couple-friendly"
                    prefetch={false}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold text-[#14213d] hover:bg-[#f5f6f8] hover:text-[#b08d57] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-base">💖</span>
                      <div>
                        <span className="block">Couple-Friendly Stays</span>
                        <span className="block text-2xs text-[#5b6478] font-normal">Private tubs &amp; romantic suites</span>
                      </div>
                    </div>
                    <span className="text-[#5b6478] text-xs">&rarr;</span>
                  </Link>

                  <Link
                    href="/hostels"
                    prefetch={false}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold text-[#14213d] hover:bg-[#f5f6f8] hover:text-[#b08d57] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-base">🎒</span>
                      <div>
                        <span className="block">Hostels &amp; Poshtels</span>
                        <span className="block text-2xs text-[#5b6478] font-normal">Social vibes &amp; private tubs</span>
                      </div>
                    </div>
                    <span className="text-[#5b6478] text-xs">&rarr;</span>
                  </Link>

                  <Link
                    href="/wishlist"
                    prefetch={false}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold text-[#14213d] hover:bg-[#f5f6f8] hover:text-[#b08d57] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <svg className="w-4 h-4 text-[#b08d57]" fill={favCount > 0 ? '#b08d57' : 'none'} stroke={favCount > 0 ? '#b08d57' : 'currentColor'} viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <div>
                        <span className="block">Saved Wishlist</span>
                        <span className="block text-2xs text-[#5b6478] font-normal">
                          {favCount > 0 ? `${favCount} hotels saved` : 'Your favorite hotels'}
                        </span>
                      </div>
                    </div>
                    {favCount > 0 ? (
                      <span className="bg-[#b08d57] text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                        {favCount}
                      </span>
                    ) : (
                      <span className="text-[#5b6478] text-xs">&rarr;</span>
                    )}
                  </Link>
                </nav>
              </div>

              {/* Trust & Policy Links */}
              <div>
                <span className="text-2xs font-bold uppercase tracking-wider text-[#5b6478] block mb-2">
                  Trust &amp; Standards
                </span>
                <nav className="flex flex-col space-y-1">
                  <Link
                    href="/how-we-check-bathtubs"
                    prefetch={false}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold text-[#14213d] hover:bg-[#f5f6f8] hover:text-[#b08d57] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-base">✓</span>
                      <div>
                        <span className="block">How we check</span>
                        <span className="block text-2xs text-[#5b6478] font-normal">Our listing criteria</span>
                      </div>
                    </div>
                    <span className="text-[#5b6478] text-xs">&rarr;</span>
                  </Link>

                  <Link
                    href="/#faq"
                    prefetch={false}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold text-[#14213d] hover:bg-[#f5f6f8] hover:text-[#b08d57] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-base">❓</span>
                      <span>Frequently Asked Questions</span>
                    </div>
                    <span className="text-[#5b6478] text-xs">&rarr;</span>
                  </Link>

                  <Link
                    href="/about"
                    prefetch={false}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold text-[#14213d] hover:bg-[#f5f6f8] hover:text-[#b08d57] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-base">ℹ️</span>
                      <span>About Hotels With Bathtubs</span>
                    </div>
                    <span className="text-[#5b6478] text-xs">&rarr;</span>
                  </Link>
                </nav>
              </div>
            </div>

            {/* Drawer Footer CTA */}
            <div className="p-5 border-t border-[#e3e7ef] bg-[#f5f6f8] space-y-3 font-sans">
              <Link
                href="/#destinations"
                prefetch={false}
                onClick={() => setIsOpen(false)}
                className="w-full bg-[#b08d57] hover:bg-[#9c7b48] text-white text-sm font-bold py-3 px-4 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2"
              >
                <span>Explore 150+ Destinations</span>
                <span>&rarr;</span>
              </Link>
              <p className="text-[10px] text-center text-[#5b6478]">
                Listings across Booking.com &amp; Agoda · Private in-room tubs
              </p>
            </div>
          </div>
        </>,
        document.body
      )}
    </header>
  );
}
