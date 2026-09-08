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

export async function generateStaticParams() {
  await connectToDatabase();
  const blogs = await Blog.find({ published: true }).select('slug');
  return blogs.map((blog: any) => ({
    slug: blog.slug,
  }));
}

// Very basic mapping of common countries for cities
const CITY_TO_COUNTRY: Record<string, string> = {
  'Dubai': 'uae', 'London': 'uk', 'New York': 'usa', 'Las Vegas': 'usa', 'NYC': 'usa',
  'Bali': 'indonesia', 'Singapore': 'singapore', 'Bangkok': 'thailand', 'Paris': 'france', 'Tokyo': 'japan'
};

function inferCountry(cityName: string): string {
  return CITY_TO_COUNTRY[cityName] || 'india'; // Default to India for all other cities currently
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
        publishedTime: blog.date,
        authors: [blog.author || 'Travel Editor'],
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

  for (const city of allCities) {
    const regex = new RegExp(`\\b${escapeRegex(city)}\\b`, 'i');
    if (regex.test(blog.title) || regex.test(blog.slug.replace(/-/g, ' '))) {
      matchedCity = city;
      const hotel = await Hotel.findOne({
        city: new RegExp(`^${escapeRegex(city)}$`, 'i'),
        flagged: { $ne: true }
      }).select('country');
      if (hotel && hotel.country) {
        matchedCountrySlug = resolveCountry(hotel.country).slug;
      } else {
        matchedCountrySlug = inferCountry(city);
      }
      matchedCityCount = await Hotel.countDocuments({
        city: new RegExp(`^${escapeRegex(city)}$`, 'i'),
        flagged: { $ne: true }
      });
      break;
    }
  }

  // Structured Data Schemas
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": blog.title,
    "description": blog.excerpt,
    "image": blog.image ? imageUrl(blog.image) : DEFAULT_HOTEL_IMAGE,
    "datePublished": blog.date,
    "dateModified": blog.updatedAt || blog.date,
    "author": {
      "@type": "Person",
      "name": blog.author || "Travel Editor"
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

  // Parse FAQ from markdown content
  const faqSchema = (() => {
    const faqSection = blog.content?.split(/##\s+Frequently Asked Questions/i)[1];
    if (!faqSection) return null;
    const pairs = [...faqSection.matchAll(/\*\*([^*]+\?)\*\*\s*\n+([^\n*#][^\n]*(?:\n(?![*#\n])[^\n]*)*)/g)];
    const questions = pairs.map((m: RegExpExecArray) => ({
      "@type": "Question",
      "name": m[1].trim(),
      "acceptedAnswer": { "@type": "Answer", "text": m[2].trim() }
    }));
    if (questions.length === 0) return null;
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": questions
    };
  })();

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
        "name": "Travel Blog",
        "item": "https://www.hotelswithbathtubs.com/blog"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": blog.title,
        "item": `https://www.hotelswithbathtubs.com/blog/${resolvedParams.slug}`
      }
    ]
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
          <div className="max-w-4xl mx-auto px-4 sm:px-8 mb-4 text-xs sm:text-sm font-medium text-text-muted">
            <Link href="/" className="text-accent-secondary hover:underline">Home</Link> &rsaquo; <Link href="/blog" className="text-accent-secondary hover:underline">Blog</Link> &rsaquo; <span className="text-text-main line-clamp-1 inline">{blog.title}</span>
          </div>

          <div className="max-w-4xl mx-auto px-4 sm:px-8 md:px-12 bg-white sm:rounded-2xl md:rounded-3xl shadow-sm border-y sm:border-x border-border pb-12 pt-8 sm:pb-16 sm:pt-10 mb-12 sm:mb-20">
            <header className="mb-8 sm:mb-12 text-center border-b border-border pb-6 sm:pb-8">
              <div className="text-accent font-semibold text-xs sm:text-sm mb-3 sm:mb-4 tracking-wider uppercase">
                Published on {blog.date} by {blog.author || 'Travel Editor'}
              </div>
              <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold text-accent-secondary leading-tight mb-4 sm:mb-6">
                {blog.title}
              </h1>
              <div className="flex justify-center gap-4 text-xl sm:text-2xl">
                <span>🛁</span> <span>✨</span> <span>🍾</span>
              </div>
            </header>

            {blog.image && (
              <div className="relative aspect-[16/9] w-full mb-8 overflow-hidden rounded-2xl border border-border shadow-xs">
                <Image
                  src={imageUrl(blog.image)}
                  alt={blog.title}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 800px"
                  className="object-cover"
                />
              </div>
            )}

            <article
              className="prose prose-base sm:prose-lg md:prose-xl max-w-none prose-headings:font-heading prose-headings:font-bold prose-headings:text-accent-secondary prose-a:text-accent hover:prose-a:text-accent-hover prose-img:rounded-xl prose-img:shadow-md prose-p:font-serif prose-p:text-gray-800 prose-li:font-serif prose-li:text-gray-800 prose-blockquote:font-serif prose-strong:text-accent-secondary leading-relaxed"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />

            {matchedCity && matchedCityCount > 0 && (
              <div className="mt-12 sm:mt-16 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6 sm:p-10 text-center shadow-sm">
                <h2 className="font-heading text-2xl sm:text-3xl font-bold text-accent-secondary mb-4">
                  Ready to book your stay in {matchedCity}?
                </h2>
                <p className="text-gray-700 font-serif text-lg mb-6 max-w-2xl mx-auto">
                  We have triple-verified {matchedCityCount}+ luxury hotels and boutique resorts in {matchedCity} that guarantee a private, in-room bathtub or jacuzzi for your romantic getaway.
                </p>
                <Link 
                  href={`/${matchedCountrySlug}/${slugify(matchedCity)}`}
                  className="inline-block bg-accent hover:bg-accent-hover text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-md hover:shadow-xl transform hover:-translate-y-1"
                >
                  View Bathtub Hotels in {matchedCity} &rarr;
                </Link>
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
                        <Image
                          src={imageUrl(relatedBlog.image)}
                          alt={relatedBlog.title}
                          fill
                          loading="lazy"
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
