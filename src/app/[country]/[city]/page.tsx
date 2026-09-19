import connectToDatabase from '@/lib/mongodb';
import Hotel from '@/models/Hotel';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { imageUrl, DEFAULT_HOTEL_IMAGE } from '@/lib/imageUrl';
import StructuredData from '@/components/StructuredData';
import CityHotelsClient from '@/components/CityHotelsClient';
import Blog from '@/models/Blog';
import Image from 'next/image';
import { escapeRegex, titleCase, slugify, resolveCountry } from '@/lib/utils';
import { generateCityPageContent } from '@/lib/seo';
import TrendingDestinations from '@/components/TrendingDestinations';

export const revalidate = 3600;

export async function generateStaticParams() {
  await connectToDatabase();
  const destinations = await Hotel.aggregate([
    { $match: { flagged: { $ne: true } } },
    { $group: { _id: { city: "$city", country: "$country" } } }
  ]);

  return destinations.map((d: any) => {
    const countryInfo = resolveCountry(d._id.country);
    return {
      country: countryInfo.slug,
      city: slugify(d._id.city),
    };
  });
}

export async function generateMetadata({ params }: { params: Promise<{ country: string, city: string }> }) {
  const resolvedParams = await params;
  await connectToDatabase();

  const countryInfo = resolveCountry(resolvedParams.country);
  const rawCity = decodeURIComponent(resolvedParams.city).replace(/-/g, ' ');
  const cityName = titleCase(rawCity);
  const countryName = countryInfo.displayName;
  const countrySlug = countryInfo.slug;
  const citySlug = slugify(rawCity);

  // Fetch the first hotel to get a city-specific image if available, and count for description
  const [firstHotel, hotelCount] = await Promise.all([
    Hotel.findOne({
      city: new RegExp(`^${escapeRegex(rawCity)}$`, 'i'),
      country: countryInfo.regex,
      flagged: { $ne: true }
    }).select('image'),
    Hotel.countDocuments({
      city: new RegExp(`^${escapeRegex(rawCity)}$`, 'i'),
      country: countryInfo.regex,
      flagged: { $ne: true }
    }),
  ]);

  if (hotelCount === 0) {
    return {
      title: `Hotels in ${cityName} Not Found`,
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const ogImage = firstHotel && firstHotel.image
    ? imageUrl(firstHotel.image.split('/').pop() || '')
    : DEFAULT_HOTEL_IMAGE;

  // SERP-Optimized Title (48-58 chars): Front-loaded target keywords + current year freshness + trust hook
  // Uses absolute title to prevent layout template from appending redundant suffixes that cause truncation
  const pageTitle = `${hotelCount} Best Hotels with Bathtub in ${cityName} (2026) | Verified Stays`;
  const pageDescription = `Find top hotels with bathtub in room in ${cityName}, ${countryName}. Explore ${hotelCount}+ verified stays with private jacuzzi suites & deep soaking tubs for couples.`;

  return {
    title: {
      absolute: pageTitle,
    },
    description: pageDescription,
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: `/${countrySlug}/${citySlug}`,
      languages: {
        ...(countrySlug === 'usa' ? { 'en-US': `https://www.hotelswithbathtubs.com/${countrySlug}/${citySlug}` } : {}),
        ...(countrySlug === 'uk' ? { 'en-GB': `https://www.hotelswithbathtubs.com/${countrySlug}/${citySlug}` } : {}),
        ...(countrySlug === 'singapore' ? { 'en-SG': `https://www.hotelswithbathtubs.com/${countrySlug}/${citySlug}` } : {}),
        ...(countrySlug === 'uae' ? { 'en-AE': `https://www.hotelswithbathtubs.com/${countrySlug}/${citySlug}` } : {}),
        ...(countrySlug === 'india' ? { 'en-IN': `https://www.hotelswithbathtubs.com/${countrySlug}/${citySlug}` } : {}),
        ...(countrySlug === 'australia' ? { 'en-AU': `https://www.hotelswithbathtubs.com/${countrySlug}/${citySlug}` } : {}),
        ...(countrySlug === 'canada' ? { 'en-CA': `https://www.hotelswithbathtubs.com/${countrySlug}/${citySlug}` } : {}),
        'x-default': 'https://www.hotelswithbathtubs.com',
      },
    },
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: `https://www.hotelswithbathtubs.com/${countrySlug}/${citySlug}`,
      siteName: 'Hotels with Bathtubs',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `Hotels with Bathtubs in ${cityName}`,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDescription,
      images: [ogImage],
    },
  };

}

export default async function CityHotelsPage({
  params,
}: {
  params: Promise<{ country: string; city: string }>;
}) {
  const resolvedParams = await params;
  await connectToDatabase();

  const countryInfo = resolveCountry(resolvedParams.country);
  const rawCity = decodeURIComponent(resolvedParams.city).replace(/-/g, ' ');
  const cityName = titleCase(rawCity);
  const countryName = countryInfo.displayName;
  const countrySlug = countryInfo.slug;
  const citySlug = slugify(rawCity);

  // Fetch only active (non-flagged) hotels using country regex for alias tolerance
  // Sort by rating desc so best-rated hotels appear first for E-E-A-T and UX
  const rawHotels = await Hotel.find({
    city: new RegExp(`^${escapeRegex(rawCity)}$`, 'i'),
    country: countryInfo.regex,
    flagged: { $ne: true }
  }).sort({ rating: -1 });


  if (rawHotels.length === 0) {
    notFound();
  }

  const hotels = rawHotels.map((h: any) => ({
    _id: h._id?.toString(),
    name: h.name,
    city: h.city,
    country: h.country,
    image: h.image,
    url: h.url,
    agodaUrl: h.agodaUrl,
    bookingUrl: h.bookingUrl,
    amenities: h.amenities || [],
    description: h.description || '',
    rating: h.rating,
    reviewsCount: h.reviewsCount,
    roomType: h.roomType,
    tubType: h.tubType,
    bookingTip: h.bookingTip,
    price: h.price,
    neighborhood: h.neighborhood,
    landmarkDistance: h.landmarkDistance,
  }));

  // Fetch related blogs where title or slug contains the city name
  const relatedBlogs = await Blog.find({
    $or: [
      { title: new RegExp(`\\b${escapeRegex(rawCity)}\\b`, 'i') },
      { slug: new RegExp(`\\b${escapeRegex(rawCity)}\\b`, 'i') }
    ],
    published: true
  }).limit(3).sort({ createdAt: -1 });

  // Rich Schema: BreadcrumbList + ItemList of Hotels
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
        "name": countryName,
        "item": `https://www.hotelswithbathtubs.com/${countrySlug}`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": `Hotels with Bathtubs in ${cityName}`,
        "item": `https://www.hotelswithbathtubs.com/${countrySlug}/${citySlug}`
      }
    ]
  };

  const hotelListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `Hotels with Bathtubs in ${cityName}`,
    "description": `Curated list of verified hotels and resorts with private in-room bathtubs and jacuzzis in ${cityName}, ${countryName}.`,
    "numberOfItems": hotels.length,
    "itemListElement": hotels.map((h, idx) => ({
      "@type": "ListItem",
      "position": idx + 1,
      "url": `https://www.hotelswithbathtubs.com/${countrySlug}/${citySlug}#hotel-${slugify(h.name)}`,
      "name": h.name,
      "item": {
        "@type": "Hotel",
        "name": h.name,
        "description": h.description || `Verified hotel with private in-room bathtub in ${cityName}`,
        "image": imageUrl(h.image?.split('/').pop() || ''),
        "address": {
          "@type": "PostalAddress",
          "addressLocality": cityName,
          "addressCountry": countryName
        },
        "priceRange": h.price ? `${h.price}` : "$$$",
        ...(h.rating && h.reviewsCount ? {
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": Number(h.rating),
            "reviewCount": Number(h.reviewsCount),
            "bestRating": "5",
            "worstRating": "1"
          }
        } : {}),
        "amenityFeature": (h.amenities || []).map((a: string) => ({
          "@type": "LocationFeatureSpecification",
          "name": a,
          "value": true
        }))
      }
    }))
  };

  const idRequirement = countrySlug === 'india'
    ? 'valid government photo IDs (Aadhaar, Passport, or Driving License)'
    : 'valid government-issued photo ID (Passport or national ID card)';

  // FAQPage schema for the 4 structured FAQ questions displayed on this page
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `Which hotels in ${cityName} have private in-room bathtubs or jacuzzis?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Top verified hotels in ${cityName} offering private in-room tubs include ${hotels.slice(0, 3).map(h => h.name).join(', ')}. All listings on this page have been verified across ${countrySlug === 'india' ? 'MakeMyTrip, Agoda, and Booking.com' : 'Expedia, Agoda, and Booking.com'} to confirm that the specific room tier includes a bathtub or jacuzzi.`
        }
      },
      {
        "@type": "Question",
        "name": `Are these bathtub hotels in ${cityName} couple-friendly?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Yes. Verified properties in ${cityName} featured on our guide welcome couples and provide full privacy in their suites. We recommend carrying ${idRequirement} for check-in.`
        }
      },
      {
        "@type": "Question",
        "name": `How do I make sure my room in ${cityName} definitely has a bathtub?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Standard or base rooms often only include standing showers. When clicking through our verified partner links, ensure you select room categories named "Suite with Bathtub", "Jacuzzi Suite", "Executive Room", or "Royal Suite" where the amenity list explicitly lists a private bathtub.`
        }
      },
      {
        "@type": "Question",
        "name": `Are there budget-friendly hotels with bathtubs in ${cityName}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Yes, ${cityName} offers a wide spectrum of accommodations ranging from affordable boutique hotels to ultra-luxury 5-star resorts featuring deep soaking bathtubs and private spa baths.`
        }
      }
    ]
  };

  return (
    <>
      <StructuredData data={breadcrumbSchema} />
      <StructuredData data={hotelListSchema} />
      <StructuredData data={faqSchema} />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 text-xs sm:text-sm font-medium text-text-muted">
        <Link href="/" className="text-accent-secondary hover:underline">Home</Link> &rsaquo; <Link href={`/${countrySlug}`} className="text-accent-secondary hover:underline">{countryName}</Link> &rsaquo; Hotels with Bathtubs in {cityName}
      </div>

            <header className="relative py-20 sm:py-24 px-4 sm:px-8 text-center bg-gradient-to-br from-gray-900 to-accent-secondary text-white overflow-hidden">
              <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
                <div className="bg-white/20 border border-white/40 backdrop-blur-md px-4 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold shadow-lg mb-6 flex items-center gap-2">
                  <span>🏨</span> {hotels.length} Verified Hotels · Triple-Source Validated
                </div>
                <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
                  Hotels with Bathtub in {cityName} for Couples &amp; Romantic Stays
                </h1>
                <p className="text-base sm:text-lg md:text-xl font-medium opacity-90 max-w-2xl mx-auto">
                  {rawHotels.length}+ verified hotels with private in-room bathtubs &amp; jacuzzi suites in {cityName}, {countryName} — every listing triple-checked, no shared spa tubs.
                </p>
              </div>
            </header>

            {/* Trust Banner with SVGs */}
            <div className="trust-banner max-w-4xl mx-4 md:mx-auto -mt-8 relative z-20 bg-white rounded-2xl shadow-xl flex flex-wrap justify-center gap-4 md:gap-8 p-4 md:p-5 border border-border text-xs sm:text-sm">
              <div className="flex items-center gap-2 font-semibold text-accent-secondary">
                <svg className="w-5 h-5 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Verified on {countrySlug === 'india' ? 'MakeMyTrip, Agoda' : 'Expedia, Agoda'} &amp; Booking.com</span>
              </div>
              <div className="flex items-center gap-2 font-semibold text-accent-secondary">
                <svg className="w-5 h-5 text-sky-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
                <span>Guaranteed Bathtubs</span>
              </div>
              <div className="flex items-center gap-2 font-semibold text-accent-secondary">
                <svg className="w-5 h-5 text-indigo-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
                <span>Trusted Booking Links</span>
              </div>
            </div>

            {/* SEO Content Section */}
            <section className="max-w-4xl mx-auto px-4 sm:px-8 py-10">
              <div className="bg-gradient-to-br from-amber-50/70 to-orange-50/70 border border-amber-200/80 rounded-2xl p-6 sm:p-8 shadow-xs">
                <div dangerouslySetInnerHTML={{
                  __html: generateCityPageContent(cityName, countryName, rawHotels.length)
                }} />
              </div>
            </section>

            {/* Editorial & Affiliate Disclosure */}
            <div className="max-w-4xl mx-auto px-4 sm:px-8 -mt-4 mb-8 text-center">
              <p className="text-2xs sm:text-xs text-text-muted bg-gray-50 border border-gray-200 rounded-xl px-4 py-2">
                <strong>Reader Disclosure:</strong> When you book through our verified partner links on Booking.com, Agoda{countrySlug === 'india' ? ', or MakeMyTrip' : ', or Expedia'}, we may earn an affiliate commission at zero additional cost to you. We strictly recommend rooms independently verified to feature private in-room bathtubs.
              </p>
            </div>

            <section className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
              <CityHotelsClient
                hotels={hotels}
                cityName={cityName}
                countryName={countryName}
              />

              {/* Frequently Asked Questions Section (SEO & Conversion) */}
              <section className="mt-20 pt-12 border-t border-gray-200">
                <div className="max-w-4xl mx-auto">
                  <div className="text-center mb-10">
                    <span className="text-xs font-bold uppercase tracking-wider text-accent-secondary bg-accent-secondary/10 px-3 py-1 rounded-full">
                      Frequently Asked Questions
                    </span>
                    <h2 className="font-heading text-2xl sm:text-3xl font-bold text-gray-900 mt-3">
                      Booking Bathtub &amp; Jacuzzi Hotels in {cityName}
                    </h2>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <h3 className="font-bold text-lg text-gray-900 mb-2">
                        Which hotels in {cityName} have private in-room bathtubs or jacuzzis?
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        Top verified hotels in {cityName} offering private in-room tubs include {hotels.slice(0, 3).map(h => h.name).join(', ')}. All listings on this page have been verified across {countrySlug === 'india' ? 'MakeMyTrip, Agoda, and Booking.com' : 'Expedia, Agoda, and Booking.com'} to confirm that the specific room tier includes a bathtub or jacuzzi.
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <h3 className="font-bold text-lg text-gray-900 mb-2">
                        Are these bathtub hotels in {cityName} couple-friendly?
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        Yes. Verified properties in {cityName} featured on our guide welcome couples and provide full privacy in their suites. We recommend carrying {idRequirement} for check-in.
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <h3 className="font-bold text-lg text-gray-900 mb-2">
                        How do I make sure my room in {cityName} definitely has a bathtub?
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        Standard or base rooms often only include standing showers. When clicking through our verified partner links, ensure you select room categories named &ldquo;Suite with Bathtub&rdquo;, &ldquo;Jacuzzi Suite&rdquo;, &ldquo;Executive Room&rdquo;, or &ldquo;Royal Suite&rdquo; where the amenity list explicitly lists a private bathtub.
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <h3 className="font-bold text-lg text-gray-900 mb-2">
                        Are there budget-friendly hotels with bathtubs in {cityName}?
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        Yes, {cityName} offers a wide spectrum of accommodations ranging from affordable boutique hotels to ultra-luxury 5-star resorts featuring deep soaking bathtubs and private spa baths.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Related Blogs Section */}
              {relatedBlogs.length > 0 && (
                <section className="mt-16 pt-12 border-t border-gray-200">
                  <div className="max-w-7xl mx-auto">
                    <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-accent-secondary mb-6 sm:mb-8 text-center">
                      Travel Guides &amp; Inspiration for {cityName}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                      {relatedBlogs.map((blog: any) => (
                        <Link key={blog.slug} href={`/blog/${blog.slug}`} className="group bg-white border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col">
                          {blog.image && (
                            <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-border">
                              <Image
                                src={imageUrl(blog.image)}
                                alt={blog.title}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            </div>
                          )}
                          <div className="p-5 sm:p-6 flex flex-col flex-grow">
                            <p className="text-accent font-semibold text-xs sm:text-sm mb-2">{blog.date}</p>
                            <h3 className="font-heading text-lg sm:text-xl font-bold text-text-main mb-2 sm:mb-3 group-hover:text-accent transition-colors line-clamp-2">
                              {blog.title}
                            </h3>
                            <p className="text-text-muted text-sm line-clamp-3 mb-4 flex-grow font-serif">
                              {blog.excerpt}
                            </p>
                            <span className="text-accent-secondary font-semibold text-sm group-hover:underline mt-auto inline-block">Read Article &rarr;</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {/* Also Explore: Cross-links to international & popular cities */}
              {(() => {
                const isIndia = countrySlug === 'india';
                const isTropical = ['french-polynesia', 'seychelles', 'mauritius', 'fiji', 'maldives', 'indonesia', 'greece'].includes(countrySlug);

                const tropicalLinks = [
                  { label: 'Bora Bora', href: '/french-polynesia/bora-bora' },
                  { label: 'Maldives', href: '/maldives/maldives' },
                  { label: 'Seychelles', href: '/seychelles/seychelles' },
                  { label: 'Mauritius', href: '/mauritius/mauritius' },
                  { label: 'Fiji', href: '/fiji/fiji' },
                  { label: 'Bali', href: '/indonesia/bali' },
                  { label: 'Santorini', href: '/greece/santorini' },
                  { label: 'Phuket', href: '/thailand/phuket' },
                ];

                const globalMetropolisLinks = [
                  { label: 'London', href: '/uk/london' },
                  { label: 'Paris', href: '/france/paris' },
                  { label: 'New York', href: '/usa/new-york' },
                  { label: 'Tokyo', href: '/japan/tokyo' },
                  { label: 'Dubai', href: '/uae/dubai' },
                  { label: 'Singapore', href: '/singapore/singapore' },
                  { label: 'Bangkok', href: '/thailand/bangkok' },
                  { label: 'Zurich', href: '/switzerland/zurich' },
                  { label: 'Rome', href: '/italy/rome' },
                ];

                const indiaLinks = [
                  { label: 'Goa', href: '/india/goa' },
                  { label: 'Udaipur', href: '/india/udaipur' },
                  { label: 'Manali', href: '/india/manali' },
                  { label: 'Munnar', href: '/india/munnar' },
                  { label: 'Jaipur', href: '/india/jaipur' },
                  { label: 'Mumbai', href: '/india/mumbai' },
                  { label: 'Delhi', href: '/india/delhi' },
                  { label: 'Bangalore', href: '/india/bangalore' },
                ];

                let links = globalMetropolisLinks;
                let heading = '🌏 Also Popular: Iconic Global Bathtub Stays';

                if (isIndia) {
                  links = globalMetropolisLinks;
                  heading = '🌏 Also Popular: International Luxury Stays';
                } else if (isTropical) {
                  links = tropicalLinks;
                  heading = '🏝️ Also Popular: Tropical & Overwater Bathtub Havens';
                } else {
                  links = globalMetropolisLinks;
                  heading = '🌍 Also Popular: World-Class City Bathtub Suites';
                }

                return (
                  <section className="mt-12 pt-8 border-t border-gray-200 max-w-4xl mx-auto">
                    <p className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3">{heading}</p>
                    <div className="flex flex-wrap gap-2">
                      {links
                        .filter(l => !l.href.includes(`/${countrySlug}/${citySlug}`))
                        .map(l => (
                          <Link
                            key={l.href}
                            href={l.href}
                            className="px-3 py-1.5 bg-gray-100 hover:bg-accent-secondary hover:text-white text-accent-secondary text-xs font-semibold rounded-lg transition-colors"
                          >
                            {l.label}
                          </Link>
                        ))}
                    </div>
                  </section>
                );
              })()}
            </section>
            <TrendingDestinations currentCity={cityName} />
          </>
  );
}
