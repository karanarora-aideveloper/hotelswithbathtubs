import type { Metadata } from 'next';
import Link from 'next/link';
import StructuredData from '@/components/StructuredData';
import NearMePicker, { type NearMeCity } from '@/components/NearMePicker';
import { getHubData, roundedCount } from '@/lib/hubData';

export const dynamic = 'force-static';

const URL = 'https://www.hotelswithbathtubs.com/hotels-with-bathtub-near-me';

// "Near me" hub (HUBS-1): 2,717 impressions in 90 days for near-me searches with no page
// that sends people to their city (GROWTH_AUDIT_2026-11-25, finding 5).
export async function generateMetadata(): Promise<Metadata> {
  const { cities } = await getHubData();
  const title = 'Hotels with Bathtub Near Me: Find Your City';
  const description = `Find hotels with a bathtub or jacuzzi in the room near you. Pick your city from ${roundedCount(cities.length)} cities and see which rooms have a tub.`;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: URL },
    openGraph: { title, description, url: URL, siteName: 'Hotels with Bathtubs', type: 'website' },
  };
}

export default async function NearMePage() {
  const { cities, countries } = await getHubData();
  const pickerCities: NearMeCity[] = cities.map((c) => [c.city, c.citySlug, c.countrySlug, c.country, c.hotelCount, c.confirmedCount]);
  const listed = countries
    .map((k) => ({ ...k, shown: k.cities.filter((c) => c.indexed) }))
    .filter((k) => k.shown.length > 0);

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.hotelswithbathtubs.com/' },
      { '@type': 'ListItem', position: 2, name: 'Hotels with a bathtub', item: 'https://www.hotelswithbathtubs.com/hotels-with-bathtub' },
      { '@type': 'ListItem', position: 3, name: 'Near me', item: URL },
    ],
  };

  return (
    <StructuredData data={breadcrumbSchema}>
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10 sm:py-14">
        <nav aria-label="Breadcrumb" className="text-xs text-text-muted mb-4">
          <Link href="/" prefetch={false} className="hover:underline">Home</Link> <span aria-hidden="true">/</span>{' '}
          <Link href="/hotels-with-bathtub" prefetch={false} className="hover:underline">Hotels with a bathtub</Link>{' '}
          <span aria-hidden="true">/</span> Near me
        </nav>

        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-accent-secondary mb-3">
          Hotels with a bathtub near me
        </h1>
        <p className="text-text-muted max-w-3xl mb-8">
          Pick your city to see hotels where you can book a room with a private bathtub or jacuzzi, the room type to ask for,
          and which ones Booking.com lists with a tub. We cover {cities.length} cities in {countries.length} countries.
        </p>

        <NearMePicker cities={pickerCities} />

        <section>
          <h2 className="font-heading text-xl sm:text-2xl font-bold text-accent-secondary mb-6">All cities by country</h2>
          {listed.map((k) => (
            <div key={k.slug} className="mb-8">
              <h3 className="font-semibold text-text-main mb-2">
                <Link href={`/${k.slug}`} prefetch={false} className="hover:text-accent hover:underline">
                  {k.name}
                </Link>{' '}
                <span className="text-sm font-normal text-text-muted">({k.hotelCount} hotels)</span>
              </h3>
              <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-1.5">
                {k.shown.map((c) => (
                  <li key={c.citySlug}>
                    <Link href={`/${c.countrySlug}/${c.citySlug}`} prefetch={false} className="text-sm text-text-main hover:text-accent hover:underline">
                      {c.city} <span className="text-text-muted">({c.hotelCount})</span>
                    </Link>
                  </li>
                ))}
              </ul>
              {k.cities.length > k.shown.length && (
                <p className="text-xs text-text-muted mt-2">
                  Smaller towns in {k.name}: see the{' '}
                  <Link href={`/${k.slug}`} prefetch={false} className="text-accent hover:underline">{k.name} page</Link>.
                </p>
              )}
            </div>
          ))}
        </section>
      </div>
    </StructuredData>
  );
}
