import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import connectToDatabase from '@/lib/mongodb';
import Blog from '@/models/Blog';
import Hotel from '@/models/Hotel';
import { markdownToHtml } from '@/lib/markdown';
import StructuredData from '@/components/StructuredData';
import { DEFAULT_HOTEL_IMAGE, imageUrl } from '@/lib/imageUrl';
import { slugify, escapeRegex, resolveCountry } from '@/lib/utils';
import AuthorBio from '@/components/AuthorBio';
import ProgressiveImage from '@/components/ProgressiveImage';

// Safely normalize blog date strings ("August 1, 2026", "2026-08-19", etc.) to ISO 8601
function toISO(dateStr: string | undefined): string {
  if (!dateStr) return new Date().toISOString();
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? dateStr : parsed.toISOString();
}

export async function generateStaticParams() {
  await connectToDatabase();
  const blogs = await Blog.find({ published: true }).select('slug');
  return blogs.map((blog: any) => ({
    slug: blog.slug,
  }));
}

// Comprehensive mapping of international and US cities
const CITY_TO_COUNTRY: Record<string, string> = {
  'Dubai': 'uae', 'London': 'uk', 'New York': 'usa', 'Las Vegas': 'usa', 'NYC': 'usa',
  'Miami': 'usa', 'Chicago': 'usa', 'Los Angeles': 'usa', 'San Francisco': 'usa',
  'Boston': 'usa', 'Seattle': 'usa', 'Austin': 'usa', 'Nashville': 'usa',
  'Aspen': 'usa', 'San Diego': 'usa', 'New Orleans': 'usa', 'Baltimore': 'usa', 'Kansas City': 'usa',
  'Bali': 'indonesia', 'Singapore': 'singapore', 'Bangkok': 'thailand', 'Paris': 'france', 'Tokyo': 'japan',
  'Rome': 'italy', 'Barcelona': 'spain', 'Amsterdam': 'netherlands'
};

const CITY_ALIASES: Record<string, string> = {
  'nyc': 'New York',
  'new-york-city': 'New York',
  'vegas': 'Las Vegas',
  'la': 'Los Angeles',
  'sf': 'San Francisco',
  'nola': 'New Orleans',
};

function inferCountry(cityName: string): string {
  return CITY_TO_COUNTRY[cityName] || 'india';
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  await connectToDatabase();
  const blog = await Blog.findOne({ slug: resolvedParams.slug, published: true });

  if (blog) {
    const title = blog.title;
    const description = blog.excerpt || `Read our curated travel guide: ${blog.title}. Discover top romantic hotels with bathtubs and jacuzzis.`;
    const ogImage = blog.image ? imageUrl(blog.image) : DEFAULT_HOTEL_IMAGE;

    return {
      title,
      description,
      alternates: {
        canonical: `/blog/${resolvedParams.slug}`,
        languages: {
          'x-default': 'https://www.hotelswithbathtubs.com',
        },
      },
      openGraph: {
        title,
        description,
        url: `https://www.hotelswithbathtubs.com/blog/${resolvedParams.slug}`,
        siteName: 'Hotels with Bathtubs',
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: blog.title,
          },
        ],
        type: 'article',
        publishedTime: toISO(blog.date),
        authors: ['Karan Arora'],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [ogImage],
      },
    };
  }
  
  return {
    title: 'Blog Article Not Found | Hotels With Bathtubs',
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  await connectToDatabase();
  const blog = await Blog.findOne({ slug: resolvedParams.slug });

  if (!blog || !blog.published) {
    notFound();
  }

  // Fetch related blogs for "Explore Blogs" section
  const relatedBlogs = await Blog.find({ 
    slug: { $ne: resolvedParams.slug }, 
    published: true 
  }).limit(3).sort({ createdAt: -1 });

  // Convert markdown to HTML (also strips duplicate markdown H1)
  const htmlContent = markdownToHtml(blog.content);

  // Determine if this blog is strongly associated with a specific city
  // by checking if the title or slug contains a known city that we have hotels for.
  const allCities = await Hotel.distinct('city', { flagged: { $ne: true } });
  let matchedCity: string | null = null;
  let matchedCountrySlug: string = 'india';
  let matchedCityCount = 0;

  // Check known aliases first (e.g. NYC -> New York)
  const slugLower = blog.slug.toLowerCase();
  const titleLower = blog.title.toLowerCase();
  for (const [alias, canonicalCity] of Object.entries(CITY_ALIASES)) {
    const aliasRegex = new RegExp(`\\b${escapeRegex(alias)}\\b`, 'i');
    if (aliasRegex.test(titleLower) || aliasRegex.test(slugLower.replace(/-/g, ' '))) {
      matchedCity = canonicalCity;
      break;
    }
  }

  // Fallback to exact city name scan
  if (!matchedCity) {
    for (const city of allCities) {
      const regex = new RegExp(`\\b${escapeRegex(city)}\\b`, 'i');
      if (regex.test(blog.title) || regex.test(blog.slug.replace(/-/g, ' '))) {
        matchedCity = city;
        break;
      }
    }
  }

  if (matchedCity) {
    const hotel = await Hotel.findOne({
      city: new RegExp(`^${escapeRegex(matchedCity)}$`, 'i'),
      flagged: { $ne: true }
    }).select('country');
    if (hotel && hotel.country) {
      matchedCountrySlug = resolveCountry(hotel.country).slug;
    } else {
      matchedCountrySlug = inferCountry(matchedCity);
    }
    matchedCityCount = await Hotel.countDocuments({
      city: new RegExp(`^${escapeRegex(matchedCity)}$`, 'i'),
      flagged: { $ne: true }
    });
  }

  // Structured Data Schemas
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": blog.title,
    "description": blog.excerpt,
    "image": blog.image ? imageUrl(blog.image) : DEFAULT_HOTEL_IMAGE,
    "datePublished": toISO(blog.date),
    "dateModified": toISO(blog.updatedAt?.toString() || blog.date),
    "author": {
      "@type": "Person",
      "name": "Karan Arora",
      "jobTitle": "Founder & Luxury Hotel Scout",
      "url": "https://www.hotelswithbathtubs.com/about"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Hotels with Bathtubs",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.hotelswithbathtubs.com/apple-icon"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://www.hotelswithbathtubs.com/blog/${resolvedParams.slug}`
    }
  };

  // Parse FAQ from markdown content with flexible header matching
  const markdownFaqPairs = (() => {
    const faqSection = blog.content?.split(/##\s+(?:Frequently Asked Questions|FAQ)/i)[1] || blog.content?.split(/###\s+(?:Frequently Asked Questions|FAQ)/i)[1];
    if (!faqSection) return [];
    const pairs = [
      ...faqSection.matchAll(/\*\*([^*]+\?)\*\*\s*\n+([^\n*#][^\n]*(?:\n(?![*#\n])[^\n]*)*)/g),
      ...faqSection.matchAll(/###\s+([^\n?]+\?)\s*\n+([^\n*#][^\n]*(?:\n(?![*#\n])[^\n]*)*)/g)
    ];
    return pairs.map((m: RegExpExecArray) => ({
      q: m[1].trim(),
      a: m[2].trim()
    }));
  })();

  const hasMarkdownFaq = markdownFaqPairs.length > 0;

  // Contextual fallback FAQs for blogs without an in-content FAQ section
  const fallbackFaqs: { q: string; a: string }[] = matchedCity
    ? [
        {
          q: `Which hotels in ${matchedCity} feature private in-room bathtubs or jacuzzis?`,
          a: `Top verified options in ${matchedCity} include properties curated in this guide and directory, hand-checked across Booking.com and Agoda to confirm private in-room tubs rather than shared hotel wellness facilities.`
        },
        {
          q: `Are hotels with bathtubs in ${matchedCity} couple-friendly?`,
          a: `Yes, verified bathtub hotels in ${matchedCity} featured in our guide welcome couples and provide complete privacy for romantic staycations, anniversaries, and getaways.`
        },
        {
          q: `How do I ensure my room tier in ${matchedCity} includes a private bathtub?`,
          a: `When booking through verified partner links, check that your chosen room tier (such as "Suite with Bathtub", "Executive Room", or "Jacuzzi Suite") explicitly lists a private bathtub in the amenities list before reserving.`
        },
        {
          q: `What is the difference between a bathtub and a jacuzzi suite in ${matchedCity}?`,
          a: `A hotel room with a bathtub typically features a deep freestanding soaking tub or Roman bath, while a jacuzzi suite includes hydrotherapy jets and whirlpool water massage. Both are private to your room.`
        }
      ]
    : [
        {
          q: "How does Hotels with Bathtubs verify private in-room tubs?",
          a: "Every hotel is cross-verified across Booking.com and Agoda by analyzing room category specifications, verified traveler photos, and amenity tags to guarantee the tub is private inside your room."
        },
        {
          q: "Are hotel room bathtubs and jacuzzis private or shared?",
          a: "All properties recommended on Hotels with Bathtubs guarantee private, in-room bathtubs or suites. We strictly filter out properties where tubs are located in shared hotel spas."
        },
        {
          q: "Which room categories usually have bathtubs?",
          a: "Standard base rooms often only include showers. Look for categories titled 'Suite with Bathtub', 'Executive Suite', 'Deluxe Room with Spa Bath', or 'Jacuzzi Villa'."
        }
      ];

  const effectiveFaqs = hasMarkdownFaq ? markdownFaqPairs : fallbackFaqs;

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": effectiveFaqs.map(item => ({
      "@type": "Question",
      "name": item.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.a
      }
    }))
  };


  const matchedCountryInfo = resolveCountry(matchedCountrySlug);
  const matchedCountryName = matchedCountryInfo.displayName;

  const breadcrumbItems: any[] = [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://www.hotelswithbathtubs.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Travel Guides",
      "item": "https://www.hotelswithbathtubs.com/blog"
    }
  ];

  let nextPos = 3;
  if (matchedCity) {
    breadcrumbItems.push({
      "@type": "ListItem",
      "position": nextPos++,
      "name": `Hotels with Bathtubs in ${matchedCountryName}`,
      "item": `https://www.hotelswithbathtubs.com/${matchedCountrySlug}`
    });
    breadcrumbItems.push({
      "@type": "ListItem",
      "position": nextPos++,
      "name": `Hotels in ${matchedCity}`,
      "item": `https://www.hotelswithbathtubs.com/${matchedCountrySlug}/${slugify(matchedCity)}`
    });
  }

  breadcrumbItems.push({
    "@type": "ListItem",
    "position": nextPos,
    "name": blog.title,
    "item": `https://www.hotelswithbathtubs.com/blog/${resolvedParams.slug}`
  });

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbItems
  };

  return (
    <StructuredData data={articleSchema}>
      <StructuredData data={breadcrumbSchema}>
        {faqSchema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
          />
        )}
        <div className="bg-bg-main py-6 sm:py-10 md:py-16">
          <nav aria-label="Breadcrumbs" className="max-w-4xl mx-auto px-4 sm:px-8 mb-4 text-xs sm:text-sm font-medium text-text-muted flex items-center flex-wrap gap-1.5">
            <Link href="/" className="text-accent-secondary hover:underline">Home</Link>
            <span>&rsaquo;</span>
            <Link href="/blog" className="text-accent-secondary hover:underline">Guides</Link>
            {matchedCity && (
              <>
                <span>&rsaquo;</span>
                <Link href={`/${matchedCountrySlug}`} className="text-accent-secondary hover:underline">
                  {matchedCountryName}
                </Link>
                <span>&rsaquo;</span>
                <Link href={`/${matchedCountrySlug}/${slugify(matchedCity)}`} className="text-accent-secondary hover:underline">
                  {matchedCity}
                </Link>
              </>
            )}
            <span>&rsaquo;</span>
            <span className="text-text-main line-clamp-1 inline font-semibold">{blog.title}</span>
          </nav>

          <div className="max-w-4xl mx-auto px-4 sm:px-8 md:px-12 bg-white sm:rounded-2xl md:rounded-3xl shadow-sm border-y sm:border-x border-border pb-12 pt-8 sm:pb-16 sm:pt-10 mb-12 sm:mb-20">
            <header className="mb-8 sm:mb-12 text-center border-b border-border pb-6 sm:pb-8">
              <div className="text-accent font-semibold text-xs sm:text-sm mb-3 sm:mb-4 tracking-wider uppercase">
                {blog.date ? `Published on ${blog.date} by ` : 'Curated by '}Karan Arora (Founder &amp; Curator)
              </div>
              <h1 className="font-heading text-2xl sm:text-4xl md:text-5xl font-extrabold text-accent-secondary leading-tight mb-4 sm:mb-6">
                {blog.title}
              </h1>
              <div className="flex justify-center gap-4 text-xl sm:text-2xl">
                <span>🛁</span> <span>✨</span> <span>🍾</span>
              </div>
            </header>

            {blog.image && (
              <div className="relative aspect-[16/9] w-full mb-8 overflow-hidden rounded-2xl border border-border shadow-xs group">
                <ProgressiveImage
                  src={blog.image}
                  alt={blog.title}
                  priority
                  sizes="(max-width: 768px) 100vw, 800px"
                  className="object-cover"
                />
                <a
                  href={`https://www.pinterest.com/pin/create/button/?url=${encodeURIComponent(`https://www.hotelswithbathtubs.com/blog/${resolvedParams.slug}`)}&media=${encodeURIComponent(imageUrl(blog.image))}&description=${encodeURIComponent(`${blog.title} - Read our curated guide on HotelsWithBathtubs.com`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute top-4 right-4 bg-red-600/95 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5 z-10 transition-all opacity-90 sm:opacity-0 group-hover:opacity-100"
                  title="Save to Pinterest"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345-.09.375-.291 1.199-.334 1.357-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.546.535 6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
                  </svg>
                  <span>Save to Pinterest</span>
                </a>
              </div>
            )}

            <article
              className="prose prose-base sm:prose-lg md:prose-xl max-w-none break-words overflow-hidden prose-headings:font-heading prose-headings:font-bold prose-headings:text-accent-secondary prose-a:text-accent hover:prose-a:text-accent-hover prose-img:rounded-xl prose-img:shadow-md prose-p:font-serif prose-p:text-gray-800 prose-li:font-serif prose-li:text-gray-800 prose-blockquote:font-serif prose-strong:text-accent-secondary leading-relaxed"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />

            {!hasMarkdownFaq && effectiveFaqs.length > 0 && (
              <section className="mt-12 pt-8 border-t border-border">
                <h3 className="font-heading text-2xl font-bold text-accent-secondary mb-6">
                  Frequently Asked Questions
                </h3>
                <div className="space-y-3.5">
                  {effectiveFaqs.map(({ q, a }) => (
                    <details key={q} className="group border border-border rounded-xl overflow-hidden bg-bg-main shadow-2xs">
                      <summary className="flex items-center justify-between gap-3 p-4 sm:p-5 cursor-pointer font-semibold text-sm sm:text-base text-accent-secondary list-none hover:bg-accent/5 transition-colors">
                        <span>{q}</span>
                        <svg className="w-4 h-4 flex-shrink-0 transition-transform group-open:rotate-180 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </summary>
                      <p className="px-4 sm:px-5 pb-4 sm:pb-5 text-sm text-text-muted leading-relaxed border-t border-border pt-3 font-serif">
                        {a}
                      </p>
                    </details>
                  ))}
                </div>
              </section>
            )}

            <AuthorBio />

            {matchedCity && matchedCityCount > 0 && (
              <div className="mt-12 sm:mt-16 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6 sm:p-10 text-center shadow-sm">
                <h2 className="font-heading text-2xl sm:text-3xl font-bold text-accent-secondary mb-4">
                  Ready to book your stay in {matchedCity}?
                </h2>
                <p className="text-gray-700 font-serif text-lg mb-6 max-w-2xl mx-auto">
                  We have triple-verified {matchedCityCount}+ luxury hotels and boutique resorts in {matchedCity} that guarantee a private, in-room bathtub or jacuzzi for your romantic getaway.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
                  <Link 
                    href={`/${matchedCountrySlug}/${slugify(matchedCity)}`}
                    className="inline-block bg-accent hover:bg-accent-hover text-white px-8 py-3.5 rounded-xl font-bold text-base sm:text-lg transition-all shadow-md hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    View Bathtub Hotels in {matchedCity} &rarr;
                  </Link>
                  <Link 
                    href={`/${matchedCountrySlug}`}
                    className="inline-block bg-white hover:bg-gray-50 text-accent-secondary border border-accent/25 px-6 py-3.5 rounded-xl font-semibold text-base transition-all shadow-2xs"
                  >
                    All {matchedCountryName} Stays &rarr;
                  </Link>
                </div>
              </div>
            )}

            <div className="mt-12 sm:mt-16 pt-6 sm:pt-8 border-t border-border text-center">
              <Link href="/blog" className="inline-block bg-gray-100 hover:bg-gray-200 text-text-main px-6 py-3 rounded-xl font-semibold transition-colors text-sm sm:text-base">
                &larr; Back to all articles
              </Link>
            </div>
          </div>

          {/* Explore Blogs Section */}
          {relatedBlogs.length > 0 && (
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-accent-secondary mb-6 sm:mb-8 text-center">
                Explore More Guides &amp; Inspiration
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {relatedBlogs.map((relatedBlog: any) => (
                  <Link key={relatedBlog.slug} href={`/blog/${relatedBlog.slug}`} className="group bg-white border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col">
                    {relatedBlog.image && (
                      <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-border">
                        <ProgressiveImage
                          src={relatedBlog.image}
                          alt={relatedBlog.title}
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <div className="p-5 sm:p-6 flex flex-col flex-grow">
                      <p className="text-accent font-semibold text-xs sm:text-sm mb-2">{relatedBlog.date}</p>
                      <h3 className="font-heading text-lg sm:text-xl font-bold text-text-main mb-2 sm:mb-3 group-hover:text-accent transition-colors line-clamp-2">
                        {relatedBlog.title}
                      </h3>
                      <p className="text-text-muted text-sm line-clamp-3 mb-4 flex-grow font-serif">
                        {relatedBlog.excerpt}
                      </p>
                      <span className="text-accent-secondary font-semibold text-sm group-hover:underline mt-auto inline-block">Read Article &rarr;</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </StructuredData>
    </StructuredData>
  );
}
