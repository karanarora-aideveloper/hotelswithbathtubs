'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useGeo } from '@/lib/useGeo';
import {
  COUNTRIES_WITH_HOTELS,
  getFlagEmoji,
  getCountryDisplayName,
  CountryEntry,
} from '@/lib/countries';

interface CountrySelectorProps {
  variant?: 'desktop' | 'mobile' | 'modal';
  className?: string;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSelect?: () => void;
}

export default function CountrySelector({
  variant = 'desktop',
  className = '',
  isOpen: controlledIsOpen,
  onOpenChange,
  onSelect,
}: CountrySelectorProps) {
  const { geo, setCountry } = useGeo();
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const setIsOpen = useCallback((val: boolean) => {
    setInternalIsOpen(val);
    onOpenChange?.(val);
  }, [onOpenChange]);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentCode = geo.countryCode && geo.countryCode !== 'XX' ? geo.countryCode : '';
  const currentFlag = getFlagEmoji(currentCode);
  const currentName = currentCode ? getCountryDisplayName(currentCode) : 'Select';

  // Filter countries by search query
  const filteredCountries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return COUNTRIES_WITH_HOTELS;
    return COUNTRIES_WITH_HOTELS.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.slug.includes(q)
    );
  }, [searchQuery]);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSearchQuery('');
    }
  }, [isOpen]);

  // Close on outside click or Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, setIsOpen]);

  const handleSelectCountry = (entry: CountryEntry) => {
    setCountry(entry.code);
    setIsOpen(false);
    if (onSelect) onSelect();
  };

  const handleAutoDetect = () => {
    try {
      localStorage.removeItem('hwb_country');
    } catch {}
    setCountry('');
    setIsOpen(false);
    if (onSelect) onSelect();
  };

  const renderModal = () => (
    <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        ref={dropdownRef}
        className="bg-white rounded-2xl shadow-2xl border border-[#e3e7ef] w-full max-w-sm max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#e3e7ef] bg-[#f5f6f8]">
          <div className="flex items-center gap-2">
            <span className="text-base">🌐</span>
            <span className="font-bold text-sm text-[#14213d]">Select Country</span>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="w-7 h-7 rounded-full bg-white border border-[#e3e7ef] text-[#5b6478] hover:text-[#14213d] flex items-center justify-center transition-colors text-xs"
          >
            ✕
          </button>
        </div>

        {/* Search Box */}
        <div className="p-3 border-b border-[#e3e7ef]">
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search countries..."
            className="w-full px-3 py-2 text-xs bg-[#f5f6f8] border border-[#e3e7ef] rounded-xl text-[#14213d] placeholder-[#5b6478] focus:outline-none focus:border-[#1a6fde]"
          />
        </div>

        {/* Country List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          <button
            type="button"
            onClick={handleAutoDetect}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg hover:bg-[#e9eef7] text-left transition-colors text-[#1a6fde]"
          >
            <div className="flex items-center gap-2">
              <span>📡</span>
              <span>Auto-detect via Location / IP</span>
            </div>
            {!currentCode && <span>✓</span>}
          </button>

          <div className="border-t border-[#e3e7ef]/60 my-1" />

          {filteredCountries.map((c) => {
            const isSelected = c.code === currentCode;
            return (
              <button
                key={c.code}
                type="button"
                onClick={() => handleSelectCountry(c)}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg text-left transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#1a6fde] text-white font-bold'
                    : 'hover:bg-[#f5f6f8] text-[#14213d]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">{c.flag}</span>
                  <span>{c.name}</span>
                </div>
                <span className={`text-2xs ${isSelected ? 'text-white/80' : 'text-[#5b6478]'}`}>
                  {c.code}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  if (variant === 'modal') {
    return isOpen ? renderModal() : null;
  }

  if (variant === 'mobile') {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#e9eef7]/60 border border-[#e3e7ef] rounded-xl">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">{currentFlag}</span>
            <div>
              <span className="block text-2xs uppercase tracking-wider text-[#5b6478] font-bold">
                Your Country
              </span>
              <span className="block text-xs font-bold text-[#14213d]">
                {currentName || 'Global / Auto-detect'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="px-3 py-1.5 text-xs font-bold text-[#1a6fde] bg-white border border-[#e3e7ef] rounded-lg shadow-2xs hover:bg-[#e9eef7] transition-colors cursor-pointer"
          >
            Change
          </button>
        </div>

        {isOpen && renderModal()}
      </div>
    );
  }

  // Desktop header variant
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select Country"
        aria-expanded={isOpen}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white hover:bg-[#e9eef7] text-[#14213d] text-xs font-semibold transition-all border border-[#e3e7ef] shadow-2xs whitespace-nowrap cursor-pointer shrink-0"
        title={`Country: ${currentName}`}
      >
        <span className="text-sm leading-none">{currentFlag}</span>
        <span className="text-xs font-semibold tracking-tight leading-none text-[#14213d]">
          {currentName}
        </span>
        <span className="text-[9px] text-[#5b6478] leading-none">▾</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-[#e3e7ef] z-[60] overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          {/* Header */}
          <div className="px-3.5 py-2.5 border-b border-[#e3e7ef] bg-[#f5f6f8] flex items-center justify-between">
            <span className="text-xs font-bold text-[#14213d]">Choose Destination Region</span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-xs text-[#5b6478] hover:text-[#14213d] p-0.5"
            >
              ✕
            </button>
          </div>

          {/* Search Box */}
          <div className="p-2 border-b border-[#e3e7ef]">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search countries..."
              className="w-full px-2.5 py-1.5 text-xs bg-[#f5f6f8] border border-[#e3e7ef] rounded-lg text-[#14213d] placeholder-[#5b6478] focus:outline-none focus:border-[#1a6fde]"
            />
          </div>

          {/* Country List */}
          <div className="max-h-64 overflow-y-auto p-1.5 space-y-0.5">
            <button
              type="button"
              onClick={handleAutoDetect}
              className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-semibold rounded-lg hover:bg-[#e9eef7] text-left transition-colors text-[#1a6fde] cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span>📡</span>
                <span>Auto-detect via location</span>
              </div>
              {!currentCode && <span>✓</span>}
            </button>

            <div className="border-t border-[#e3e7ef]/60 my-1" />

            {filteredCountries.map((c) => {
              const isSelected = c.code === currentCode;
              return (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => handleSelectCountry(c)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#1a6fde] text-white font-bold'
                      : 'hover:bg-[#f5f6f8] text-[#14213d]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{c.flag}</span>
                    <span className="truncate">{c.name}</span>
                  </div>
                  <span className={`text-[10px] ${isSelected ? 'text-white/80' : 'text-[#5b6478]'}`}>
                    {c.code}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
