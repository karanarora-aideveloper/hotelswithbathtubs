import Link from 'next/link';

const TRENDING_CITIES = [
  { name: 'Paris', country: 'France', slug: '/france/paris' },
  { name: 'Bali', country: 'Indonesia', slug: '/indonesia/bali' },
  { name: 'Tokyo', country: 'Japan', slug: '/japan/tokyo' },
  { name: 'Venice', country: 'Italy', slug: '/italy/venice' },
  { name: 'Orlando', country: 'USA', slug: '/usa/orlando' },
  { name: 'Cancun', country: 'Mexico', slug: '/mexico/cancun' }
];

export default function TrendingDestinations({ currentCity }: { currentCity: string }) {
  const filtered = TRENDING_CITIES.filter(c => c.name.toLowerCase() !== currentCity.toLowerCase()).slice(0, 5);

  return (
    <div className="mt-16 pt-10 border-t border-border">
      <h3 className="text-xl font-heading font-bold mb-6 text-text-main">
        Trending Global Destinations
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
        {filtered.map(dest => (
          <Link
            key={dest.slug}
            href={dest.slug}
            className="block p-4 rounded-xl border border-border bg-white shadow-sm hover:shadow-md transition-shadow group"
          >
            <span className="block font-bold text-accent-secondary group-hover:text-accent transition-colors">
              {dest.name}
            </span>
            <span className="block text-sm text-text-muted mt-1">
              {dest.country}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
