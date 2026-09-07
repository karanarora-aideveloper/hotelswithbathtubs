import Link from 'next/link';
import Image from 'next/image';
import connectToDatabase from '@/lib/mongodb';
import Blog from '@/models/Blog';
import StructuredData from '@/components/StructuredData';
import { imageUrl } from '@/lib/imageUrl';

export const metadata = {
  title: 'Bathtub Hotel Travel Guides & Tips',
  description: 'Explore curated travel guides, honeymoon tips, and reviews of luxury hotels with private in-room bathtubs and jacuzzis across the globe.',
  alternates: {
    canonical: '/blog',
  },
  openGraph: {
    title: 'Bathtub Hotel Travel Guides & Tips',
    description: 'Explore curated travel guides, honeymoon tips, and reviews of luxury hotels with private in-room bathtubs and jacuzzis across the globe.',
    url: 'https://www.hotelswithbathtubs.com/blog',
    siteName: 'Hotels with Bathtubs',
    images: [
      {
        url: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
        width: 1200,
        height: 630,
        alt: 'Hotels With Bathtubs Travel Blog',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bathtub Hotel Travel Guides & Tips',
    description: 'Explore curated travel guides, honeymoon tips, and reviews of luxury hotels with private in-room bathtubs.',
    images: ['https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp'],
  },
};

export default async function BlogIndex() {
  await connectToDatabase();
  const blogs = await Blog.find({ published: true }).sort({ createdAt: -1 });

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
      }
    ]
  };

  const blogListSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Travel Blog & Jacuzzi Hotel Guides",
    "description": "Curated guides, tips, and reviews for romantic hotel suites with private bathtubs and jacuzzis.",
    "url": "https://www.hotelswithbathtubs.com/blog"
  };

  return (
    <StructuredData data={breadcrumbSchema}>
      <StructuredData data={blogListSchema}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="mb-4 text-xs sm:text-sm font-medium text-text-muted">
            <Link href="/" className="text-accent-secondary hover:underline">Home</Link> &rsaquo; <span className="text-text-main">Blog</span>
          </div>

          <header className="mb-10 sm:mb-12 text-center">
            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold text-accent-secondary mb-3 sm:mb-4">Travel Blog &amp; Inspiration</h1>
            <p className="text-base sm:text-lg text-text-muted max-w-2xl mx-auto px-4">
              Discover our curated destination guides, romance tips, and recommendations for the finest hotels with private bathtubs &amp; jacuzzis.
            </p>
          </header>

          {/* Featured Post: Singapore */}
          {(() => {
            const featured = blogs.find((b: any) => b.slug === 'hotels-with-bathtubs-in-singapore');
            if (!featured) return null;
            return (
              <Link href={`/blog/${featured.slug}`} className="group block mb-10 bg-gradient-to-r from-accent-secondary/5 to-accent/5 border-2 border-accent/20 rounded-2xl overflow-hidden hover:shadow-xl transition-all">
                <div className="p-6 sm:p-8 flex flex-col md:flex-row gap-6 items-center">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="bg-accent text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">✨ New</span>
                      <span className="text-accent font-semibold text-xs">{featured.date}</span>
                    </div>
                    <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-accent-secondary mb-3 group-hover:text-accent transition-colors text-wrap-balance">
                      {featured.title}
                    </h2>
                    <p className="text-text-muted text-sm sm:text-base leading-relaxed mb-4 font-serif line-clamp-3">
                      {featured.excerpt}
                    </p>
                    <span className="inline-flex items-center gap-2 text-accent-secondary font-bold text-sm group-hover:underline">
                      Read the Singapore Guide →
                    </span>
                  </div>
                  {featured.image && (
                    <div className="relative aspect-[16/10] w-full md:w-80 h-48 md:h-auto overflow-hidden rounded-xl border border-border flex-shrink-0">
                      <Image
                        src={imageUrl(featured.image)}
                        alt={featured.title}
                        fill
                        priority
                        sizes="(max-width: 768px) 100vw, 320px"
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>
              </Link>
            );
          })()}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {blogs.map((blog: any, idx: number) => (
              <Link key={blog.slug} href={`/blog/${blog.slug}`} className="group bg-white border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col">
                {blog.image && (
                  <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-border">
                    <Image
                      src={imageUrl(blog.image)}
                      alt={blog.title}
                      fill
                      priority={idx < 3}
                      loading={idx < 3 ? undefined : "lazy"}
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}
                <div className="p-5 sm:p-6 flex flex-col flex-grow">
                  <p className="text-accent font-semibold text-xs sm:text-sm mb-2">{blog.date}</p>
                  <h2 className="font-heading text-lg sm:text-xl font-bold text-text-main mb-2 sm:mb-3 group-hover:text-accent transition-colors line-clamp-2">
                    {blog.title}
                  </h2>
                  <p className="text-text-muted text-sm line-clamp-3 mb-4 flex-grow font-serif leading-relaxed">
                    {blog.excerpt}
                  </p>
                  <span className="text-accent-secondary font-semibold text-sm group-hover:underline mt-auto inline-block">Read Full Article &rarr;</span>
                </div>
              </Link>
            ))}
          </div>
          
          {blogs.length === 0 && (
            <div className="text-center text-text-muted py-12">No blog posts found.</div>
          )}
        </div>
      </StructuredData>
    </StructuredData>
  );
}
