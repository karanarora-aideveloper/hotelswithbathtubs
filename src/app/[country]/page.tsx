import connectToDatabase from '@/lib/mongodb';
import Hotel from '@/models/Hotel';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import CityCard from '@/components/CityCard';
import StructuredData from '@/components/StructuredData';
import { escapeRegex, titleCase, slugify, resolveCountry } from '@/lib/utils';

export const revalidate = 3600;

export async function generateStaticParams() {
  await connectToDatabase();
  const countries = await Hotel.aggregate([
    { $match: { flagged: { $ne: true } } },
    { $group: { _id: "$country" } }
  ]);

  const seen = new Set<string>();
  const params: { country: string }[] = [];

  for (const c of countries) {
    const info = resolveCountry(c._id);
    if (!seen.has(info.slug)) {
      seen.add(info.slug);
      params.push({ country: info.slug });
    }
  }

  return params;
}

export async function generateMetadata({ params }: { params: Promise<{ country: string }> }) {
  const resolvedParams = await params;
  await connectToDatabase();

  const countryInfo = resolveCountry(resolvedParams.country);
  const countryName = countryInfo.displayName;
  const countrySlug = countryInfo.slug;

  // Count active hotels in this country using alias-tolerant regex
  const hotelCount = await Hotel.countDocuments({
    country: countryInfo.regex,
    flagged: { $ne: true }
  });

  if (hotelCount === 0) {
    return {
      title: 'Country Not Found',
    };
  }

  const pageTitle = `Hotels with Bathtub in ${countryName}`;
  const pageDescription = `Discover ${hotelCount}+ verified hotels with private in-room bathtubs & jacuzzi suites across top cities in ${countryName}. Triple-checked for romantic stays.`;

  return {
    title: pageTitle,
    description: pageDescription,
    keywords: `hotels with bathtubs ${countryName}, hotels with jacuzzi ${countryName}, couple friendly bathtub hotels in ${countryName}, romantic hotels in ${countryName}, luxury suites ${countryName}, private hot tub ${countryName}`,
    alternates: {
      canonical: `/${countrySlug}`,
    },
    openGraph: {
      title: `${pageTitle} | Hotels With Bathtubs`,
      description: pageDescription,
      url: `https://www.hotelswithbathtubs.com/${countrySlug}`,
      siteName: 'Hotels with Bathtubs',
      images: [
        {
          url: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
          width: 1200,
          height: 630,
          alt: `Hotels with Bathtubs in ${countryName}`,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${pageTitle} | Hotels With Bathtubs`,
      description: pageDescription,
      images: ['https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp'],
    },
  };
}

export default async function CountryHubPage({
  params,
}: {
  params: Promise<{ country: string }>;
}) {
  const resolvedParams = await params;
  await connectToDatabase();

  const countryInfo = resolveCountry(resolvedParams.country);
  const countryName = countryInfo.displayName;
  const countrySlug = countryInfo.slug;

  // Aggregate cities and active hotel counts inside this country
  const pipeline = [
    {
      $match: {
        country: countryInfo.regex,
        flagged: { $ne: true }
      }
    },
    {
      $group: {
        _id: { city: "$city", country: "$country" },
        hotelCount: { $sum: 1 },
        image: { $first: "$image" }
      }
    },
    { $sort: { hotelCount: -1 as const } }
  ];

  const cities = await Hotel.aggregate<any>(pipeline);

  if (cities.length === 0) {
    notFound();
  }

  const totalHotels = cities.reduce((acc, curr) => acc + curr.hotelCount, 0);

  // Breadcrumb List Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://www.hotelswithbathtubs.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": `Hotels with Bathtubs in ${countryName}`,
        "item": `https://www.hotelswithbathtubs.com/${countrySlug}`
      }
    ]
  };

  // ItemList Schema for Cities in this Country
  const cityListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `Destinations with Bathtubs in ${countryName}`,
    "description": `Browse top cities in ${countryName} featuring verified hotels with in-room bathtubs and private jacuzzis.`,
    "numberOfItems": cities.length,
    "itemListElement": cities.map((c, idx) => ({
      "@type": "ListItem",
      "position": idx + 1,
      "url": `https://www.hotelswithbathtubs.com/${countrySlug}/${slugify(c._id.city)}`,
      "name": `${c._id.city}, ${countryName}`
    }))
  };

  return (
    <StructuredData data={breadcrumbSchema}>
      <StructuredData data={cityListSchema}>
        <>
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 text-xs sm:text-sm font-medium text-text-muted">
            <Link href="/" className="text-accent-secondary hover:underline">Home</Link> &rsaquo; Hotels with Bathtubs in {countryName}
          </div>

          <header className="relative py-20 sm:py-24 px-4 sm:px-8 text-center bg-gradient-to-br from-gray-900 to-accent-secondary text-white overflow-hidden">
            <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
              <div className="bg-white/20 border border-white/40 backdrop-blur-md px-4 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold shadow-lg mb-6 flex items-center gap-2">
                <span>🌍</span> {cities.length} {cities.length === 1 ? 'City' : 'Cities'} · {totalHotels} Verified Stays
              </div>
              <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
                Hotels with Bathtub in Room in {countryName}
              </h1>
              <p className="text-base sm:text-lg md:text-xl font-medium opacity-90 max-w-2xl mx-auto">
                Explore romantic destinations in {countryName} offering private in-room bathtubs and jacuzzis, triple-verified for couples.
              </p>
            </div>
          </header>

          <section className="max-w-7xl mx-auto px-4 sm:px-8 py-16">
            {/* Country Hub Editorial Context */}
            <div className="bg-gradient-to-br from-amber-50/70 to-orange-50/70 border border-amber-200/80 rounded-2xl p-6 sm:p-8 shadow-xs mb-12">
              <h2 className="font-heading text-xl sm:text-2xl font-bold text-accent-secondary mb-3">
                Why Book a Bathtub Hotel in {countryName}?
              </h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                Whether you are planning an anniversary, a romantic honeymoon, or a rejuvenating weekend getaway, {countryName} offers an incredible collection of luxury hotels, heritage villas, and boutique resorts featuring private in-room bathtubs and jacuzzi suites.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Every property featured across our {countryName} destinations is triple-verified across MakeMyTrip, Agoda, and Booking.com to confirm that your chosen room tier guarantees a private in-room soaking tub or whirlpool jacuzzi.
              </p>
            </div>

            <div className="flex items-center justify-between mb-8 border-b border-gray-200 pb-3">
              <div>
                <h2 className="font-heading text-2xl sm:text-3xl font-bold text-accent-secondary">Romantic Destinations</h2>
                <p className="text-text-muted text-sm mt-1">Select a city in {countryName} to find your perfect stay with private tubs</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
              {cities.map((item: any, idx: number) => (
                <CityCard
                  key={`${item._id.city}-${item._id.country}`}
                  city={item._id.city}
                  country={item._id.country}
                  hotelCount={item.hotelCount}
                  image={item.image}
                  priority={idx < 4}
                />
              ))}
            </div>
          </section>
        </>
      </StructuredData>
    </StructuredData>
  );
}
