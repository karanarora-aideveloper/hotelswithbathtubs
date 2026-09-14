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
    <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2 text-xs">
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-text-muted font-medium flex items-center gap-1">
          <span>Popular:</span>
          {geo.isIndia ? (
            <span className="text-2xs px-1.5 py-0.5 bg-orange-100 text-orange-800 rounded-md font-semibold">
              🇮🇳 India
            </span>
          ) : (
            <span className="text-2xs px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded-md font-semibold">
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
        className="text-accent font-bold hover:underline inline-flex items-center gap-1 ml-auto sm:ml-0"
      >
        <span>Browse All Destinations</span>
        <span>↓</span>
      </a>
    </div>
  );
}
