import type { Metadata } from 'next';
import Link from 'next/link';
import StructuredData from '@/components/StructuredData';
import { getHubData, roundedCount } from '@/lib/hubData';

export const dynamic = 'force-static';

const URL = 'https://www.hotelswithbathtubs.com/hotels-with-bathtub';

// National hub for the place-less searches ("hotel with bathtub", "hotel room with bathtub"),
// which Google spread over 124 of our URLs (GROWTH_AUDIT_2026-11-25, finding 5). HUBS-1.
export async function generateMetadata(): Promise<Metadata> {
  const { totalHotels, cities } = await getHubData();
  const title = `Hotels with Bathtub in Room: ${roundedCount(totalHotels)} Hotels in ${roundedCount(cities.length)} Cities`;
  const description = `Find a hotel room with a private bathtub or jacuzzi. ${roundedCount(totalHotels)} hotels in ${roundedCount(cities.length)} cities, the room type to book, and which hotels Booking.com lists with a tub.`;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: URL },
    openGraph: { title, description, url: URL, siteName: 'Hotels with Bathtubs', type: 'website' },
  };
}

const TUB_LINKS = [
  { href: '/soaking-tub-hotels', label: 'Soaking tub hotels', note: 'Deep and freestanding tubs' },
  { href: '/hotels-with-hot-tub-in-room', label: 'Hot tub in the room', note: 'Jetted and hot tub suites' },
  { href: '/couple-friendly', label: 'Couple-friendly hotels', note: 'Stays for two' },
  { href: '/matchmaker', label: 'Bathtub matchmaker', note: 'Four questions, matched hotels' },
];

export default async function HotelsWithBathtubPage() {
  const { totalHotels, totalConfirmed, cities, countries } = await getHubData();
  const topCities = cities.filter((c) => c.indexed).slice(0, 24);
  const topConfirmed = cities
    .filter((c) => c.indexed && c.confirmedCount >= 3)
    .sort((a, b) => b.confirmedCount - a.confirmedCount)
    .slice(0, 12);
  const listedCountries = countries.filter((c) => c.cities.some((x) => x.indexed));

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Hotels with a bathtub in the room',
    url: URL,
    description: `${totalHotels.toLocaleString('en-US')} hotels with a private bathtub or jacuzzi in ${cities.length} cities.`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: topCities.length,
      itemListElement: topCities.map((c, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: `Hotels with a bathtub in ${c.city}`,
        url: `https://www.hotelswithbathtubs.com/${c.countrySlug}/${c.citySlug}`,
      })),
    },
  };
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.hotelswithbathtubs.com/' },
      { '@type': 'ListItem', position: 2, name: 'Hotels with a bathtub', item: URL },
    ],
  };

  return (
    <StructuredData data={collectionSchema}>
      <StructuredData data={breadcrumbSchema}>
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10 sm:py-14">
          <nav aria-label="Breadcrumb" className="text-xs text-text-muted mb-4">
            <Link href="/" prefetch={false} className="hover:underline">Home</Link> <span aria-hidden="true">/</span> Hotels with a bathtub
          </nav>

          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-accent-secondary mb-3">
            Hotels with a bathtub in the room
          </h1>
          <p className="text-text-muted max-w-3xl mb-4">
            We list {totalHotels.toLocaleString('en-US')} hotels in {cities.length} cities
            where you can book a room with a private bathtub or jacuzzi, with the room type to ask for and where to book it.
          </p>
          <p className="text-text-muted max-w-3xl mb-8">
            {totalConfirmed.toLocaleString('en-US')} of them are <strong>confirmed</strong>: Booking.com lists a bathtub or jacuzzi
            for the room. The rest are <strong>reported, not yet confirmed</strong>, so check the room description before you book.{' '}
            <Link href="/how-we-check-bathtubs" prefetch={false} className="text-accent hover:underline">How we check bathtubs</Link>
          </p>

          <div className="mb-10">
            <Link
              href="/hotels-with-bathtub-near-me"
              prefetch={false}
              className="inline-block rounded-full bg-accent text-white px-5 py-2.5 text-sm font-semibold hover:opacity-90"
            >
              Find hotels with a bathtub near me
            </Link>
          </div>

          <section className="mb-12">
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-accent-secondary mb-4">Cities with the most bathtub hotels</h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {topCities.map((c) => (
                <li key={`${c.countrySlug}/${c.citySlug}`}>
                  <Link
                    href={`/${c.countrySlug}/${c.citySlug}`}
                    prefetch={false}
                    className="block rounded-xl border border-border px-4 py-3 hover:border-accent transition-colors"
                  >
                    <span className="font-semibold text-text-main">Hotels with a bathtub in {c.city}</span>
                    <span className="block text-xs text-text-muted mt-0.5">
                      {c.country} · {c.hotelCount} hotels{c.confirmedCount > 0 ? ` · ${c.confirmedCount} confirmed` : ''}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {topConfirmed.length > 0 && (
            <section className="mb-12">
              <h2 className="font-heading text-xl sm:text-2xl font-bold text-accent-secondary mb-2">Most confirmed bathtub rooms</h2>
              <p className="text-sm text-text-muted mb-4">Cities where Booking.com lists a tub for the most rooms.</p>
              <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-2">
                {topConfirmed.map((c) => (
                  <li key={`${c.countrySlug}/${c.citySlug}`}>
                    <Link href={`/${c.countrySlug}/${c.citySlug}`} prefetch={false} className="text-sm text-text-main hover:text-accent hover:underline">
                      {c.city} <span className="text-text-muted">({c.confirmedCount} confirmed)</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="mb-12">
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-accent-secondary mb-4">By type of tub</h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {TUB_LINKS.map((t) => (
                <li key={t.href}>
                  <Link href={t.href} prefetch={false} className="block rounded-xl border border-border px-4 py-3 hover:border-accent transition-colors">
                    <span className="font-semibold text-text-main">{t.label}</span>
                    <span className="block text-xs text-text-muted mt-0.5">{t.note}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-accent-secondary mb-4">By country</h2>
            <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-2">
              {listedCountries.map((c) => (
                <li key={c.slug}>
                  <Link href={`/${c.slug}`} prefetch={false} className="text-sm text-text-main hover:text-accent hover:underline">
                    {c.name} <span className="text-text-muted">({c.hotelCount})</span>
                  </Link>
                </li>
              ))}
            </ul>
            <p className="text-sm text-text-muted mt-6">
              Every city we cover is on the{' '}
              <Link href="/destinations" prefetch={false} className="text-accent hover:underline">all destinations</Link> page.
            </p>
          </section>

          <section className="max-w-3xl">
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-accent-secondary mb-4">How to book a room with a bathtub</h2>
            <ol className="list-decimal pl-5 space-y-2 text-sm text-text-main">
              <li>Pick the city, then a hotel marked confirmed if you can.</li>
              <li>Book the exact room type shown on the hotel page. Many hotels have tubs in suites only.</li>
              <li>Read the room description on the booking site for &quot;bathtub&quot; or &quot;jacuzzi&quot; before you pay.</li>
              <li>If it isn&apos;t clear, ask the hotel to confirm a room with a tub, in writing.</li>
            </ol>
          </section>
        </div>
      </StructuredData>
    </StructuredData>
  );
}
