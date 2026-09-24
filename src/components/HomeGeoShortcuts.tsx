'use client';

import Link from 'next/link';
import { useGeo } from '@/lib/useGeo';

const US_SHORTCUTS = [
  { name: 'New York', href: '/usa/new-york' },
  { name: 'Las Vegas', href: '/usa/las-vegas' },
  { name: 'Miami', href: '/usa/miami' },
  { name: 'Los Angeles', href: '/usa/los-angeles' },
  { name: 'Chicago', href: '/usa/chicago' },
  { name: 'London', href: '/uk/london' },
  { name: 'Paris', href: '/france/paris' },
  { name: 'Dubai', href: '/uae/dubai' },
  { name: 'Goa', href: '/india/goa' },
  { name: 'Udaipur', href: '/india/udaipur' },
  { name: 'Manali', href: '/india/manali' },
  { name: 'Singapore', href: '/singapore/singapore' },
  { name: 'Tokyo', href: '/japan/tokyo' },
];

const INDIA_SHORTCUTS = [
  { name: 'Goa', href: '/india/goa' },
  { name: 'Udaipur', href: '/india/udaipur' },
  { name: 'Manali', href: '/india/manali' },
  { name: 'Munnar', href: '/india/munnar' },
  { name: 'Jaipur', href: '/india/jaipur' },
  { name: 'Delhi', href: '/india/delhi' },
  { name: 'Kolkata', href: '/india/kolkata' },
  { name: 'New York', href: '/usa/new-york' },
  { name: 'Dubai', href: '/uae/dubai' },
  { name: 'London', href: '/uk/london' },
  { name: 'Paris', href: '/france/paris' },
  { name: 'Singapore', href: '/singapore/singapore' },
];

export default function HomeGeoShortcuts() {
  const { geo } = useGeo();
  const shortcuts = geo.isIndia ? INDIA_SHORTCUTS : US_SHORTCUTS;

  return (
    <div className="mt-4 pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs w-full min-w-0">
      {/* Mobile Horizontal Scroll Rail */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth w-full min-w-0 sm:hidden py-1">
        <span className="text-text-muted font-medium flex items-center gap-1.5 flex-shrink-0">
          <span>Popular:</span>
          {geo.isIndia ? (
            <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-800 rounded-md font-semibold">
              🇮🇳 India
            </span>
          ) : (
            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md font-semibold">
              🇺🇸 USA
            </span>
          )}
        </span>
        {shortcuts.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="px-3.5 py-2 min-h-[40px] bg-gray-100 hover:bg-accent-secondary hover:text-white rounded-xl text-accent-secondary font-semibold transition-colors flex-shrink-0 text-xs inline-flex items-center justify-center"
          >
            {item.name}
          </Link>
        ))}
      </div>

      {/* Desktop Wrapped Layout */}
      <div className="hidden sm:flex items-center gap-1.5 flex-wrap">
        <span className="text-text-muted font-medium flex items-center gap-1">
          <span>Popular:</span>
          {geo.isIndia ? (
            <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-800 rounded-md font-semibold">
              🇮🇳 India
            </span>
          ) : (
            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md font-semibold">
              🇺🇸 USA &amp; Global
            </span>
          )}
        </span>
        {shortcuts.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="px-2.5 py-1 bg-gray-100 hover:bg-accent-secondary hover:text-white rounded-lg text-accent-secondary font-semibold transition-colors"
          >
            {item.name}
          </Link>
        ))}
      </div>

      <a 
        href="#destinations" 
        className="text-accent font-bold hover:underline inline-flex items-center gap-1 self-end sm:self-auto flex-shrink-0"
      >
        <span>Browse All Destinations</span>
        <span>↓</span>
      </a>
    </div>
  );
}
