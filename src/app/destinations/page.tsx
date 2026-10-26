import type { Metadata } from 'next';
import Link from 'next/link';
import StructuredData from '@/components/StructuredData';
import { getDestinationsDirectory, REGION_ORDER } from '@/lib/destinationsDirectory';

export const metadata: Metadata = {
  title: 'All Destinations by City',
  description:
    'Browse every destination with verified hotel rooms that have a private bathtub or in-room jacuzzi, grouped by region and country, from New York and Las Vegas to Jaipur and Goa.',
  alternates: { canonical: 'https://www.hotelswithbathtubs.com/destinations' },
};

// Hub page for the full city directory. It replaces the long lists that used to sit in the
// footer of every page (decision D7): one crawlable page instead of 226 links on 5,700 pages.
export default async function DestinationsPage() {
  const { regions, countries, cities } = await getDestinationsDirectory();
  const totalHotels = cities.reduce((s, c) => s + c.hotelCount, 0);

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "All Destinations with Bathtub & Jacuzzi Hotels",
    "description": `Directory of ${totalHotels.toLocaleString('en-US')} verified hotel rooms featuring private in-room bathtubs and jacuzzi suites across ${cities.length} cities worldwide.`,
    "url": "https://www.hotelswithbathtubs.com/destinations",
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://www.hotelswithbathtubs.com/",
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "All Destinations",
        "item": "https://www.hotelswithbathtubs.com/destinations",
      },
    ],
  };

  return (
    <StructuredData data={collectionSchema}>
      <StructuredData data={breadcrumbSchema}>
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10 sm:py-14">
          <nav aria-label="Breadcrumb" className="text-xs text-text-muted mb-4">
            <Link href="/" className="hover:underline">Home</Link> <span aria-hidden="true">/</span> All destinations
          </nav>
      <h1 className="font-heading text-3xl sm:text-4xl font-bold text-accent-secondary mb-3">
        All destinations with in-room bathtubs and jacuzzi suites
      </h1>
      <p className="text-text-muted max-w-3xl mb-10">
        {totalHotels.toLocaleString('en-US')} hotels in {cities.length} cities across {countries.length} countries. Pick a city to see
        rooms with a private tub, the exact room type to book, and where to book it.
      </p>

      {REGION_ORDER.filter((r) => regions[r]?.length).map((region) => (
        <section key={region} className="mb-10">
          <h2 className="font-heading text-xl sm:text-2xl font-bold text-accent-secondary mb-4">
            {region} <span className="text-sm font-normal text-text-muted">({regions[region].length})</span>
          </h2>
          <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-2">
            {regions[region].map((c) => (
              <li key={`${c.countrySlug}/${c.citySlug}`}>
                <Link href={`/${c.countrySlug}/${c.citySlug}`} prefetch={false} className="text-sm text-text-main hover:text-accent hover:underline">
                  {c.city} <span className="text-text-muted">({c.hotelCount})</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <section className="mt-12 pt-8 border-t border-border">
        <h2 className="font-heading text-xl sm:text-2xl font-bold text-accent-secondary mb-4">Browse by country</h2>
        <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-2">
          {countries.map((c) => (
            <li key={c.slug}>
              <Link href={`/${c.slug}`} prefetch={false} className="text-sm text-text-main hover:text-accent hover:underline">
                {c.name} <span className="text-text-muted">({c.hotelCount})</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  </StructuredData>
</StructuredData>
  );
}
