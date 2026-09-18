import Link from 'next/link';

const TRENDING_CITIES = [
  { name: 'Bora Bora', country: 'French Polynesia', slug: '/french-polynesia/bora-bora' },
  { name: 'Santorini', country: 'Greece', slug: '/greece/santorini' },
  { name: 'Bangkok', country: 'Thailand', slug: '/thailand/bangkok' },
  { name: 'London', country: 'UK', slug: '/uk/london' },
  { name: 'New York', country: 'USA', slug: '/usa/new-york' },
  { name: 'Dubai', country: 'UAE', slug: '/uae/dubai' },
  { name: 'Singapore', country: 'Singapore', slug: '/singapore/singapore' },
  { name: 'Paris', country: 'France', slug: '/france/paris' },
  { name: 'Bali', country: 'Indonesia', slug: '/indonesia/bali' },
  { name: 'Phuket', country: 'Thailand', slug: '/thailand/phuket' },
  { name: 'Sydney', country: 'Australia', slug: '/australia/sydney' }
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
