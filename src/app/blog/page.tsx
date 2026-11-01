import Link from 'next/link';
import connectToDatabase from '@/lib/mongodb';
import Blog from '@/models/Blog';
import StructuredData from '@/components/StructuredData';
import BlogIndexClient, { BlogPostItem } from '@/components/BlogIndexClient';

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
        url: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
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
    images: ['https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp'],
  },
};

interface RawBlogDoc {
  title?: string;
  slug?: string;
  excerpt?: string;
  date?: string;
  image?: string;
  country?: string;
  city?: string;
  createdAt?: Date;
}

export default async function BlogIndex() {
  await connectToDatabase();
  const rawBlogs = (await Blog.find({ published: true })
    .sort({ createdAt: -1 })
    .lean()) as unknown as RawBlogDoc[];

  const blogs: BlogPostItem[] = rawBlogs.map((b) => ({
    title: b.title || '',
    slug: b.slug || '',
    excerpt: b.excerpt || '',
    date: b.date || (b.createdAt ? new Date(b.createdAt).toISOString().split('T')[0] : ''),
    image: b.image || '',
    country: b.country || '',
    city: b.city || '',
  }));

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://www.hotelswithbathtubs.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Travel Blog',
        item: 'https://www.hotelswithbathtubs.com/blog',
      },
    ],
  };

  const blogListSchema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Hotels With Bathtubs — Travel Guides & Jacuzzi Hotel Tips',
    description: 'Curated guides, tips, and reviews for romantic hotel suites with private bathtubs and jacuzzis.',
    url: 'https://www.hotelswithbathtubs.com/blog',
    publisher: {
      '@type': 'Organization',
      name: 'Hotels with Bathtubs',
      url: 'https://www.hotelswithbathtubs.com',
    },
    blogPost: blogs.slice(0, 10).map((b) => ({
      '@type': 'BlogPosting',
      headline: b.title,
      url: `https://www.hotelswithbathtubs.com/blog/${b.slug}`,
      datePublished: b.date,
      description: b.excerpt ? (b.excerpt.length > 155 ? b.excerpt.substring(0, 152) + '...' : b.excerpt) : undefined,
    })),
  };

  return (
    <>
      <StructuredData data={breadcrumbSchema} />
      <StructuredData data={blogListSchema} />

      <main className="min-h-screen bg-[#f5f6f8]">
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 text-xs sm:text-sm font-medium text-[#5b6478] flex items-center gap-1.5">
          <Link href="/" prefetch={false} className="hover:text-[#b08d57] transition-colors">
            Home
          </Link>
          <span>&rsaquo;</span>
          <span className="text-[#14213d] font-semibold">Blog</span>
        </div>

        {/* Hero Section in Style B */}
        <header className="relative pt-10 pb-12 sm:pt-14 sm:pb-16 px-4 sm:px-6 lg:px-8 text-center bg-white border-b border-[#e3e7ef]">
          <div className="max-w-4xl mx-auto flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#e9eef7] border border-[#e3e7ef] text-[#14213d] text-xs font-bold uppercase tracking-wider mb-4 shadow-2xs">
              <span>✨</span> Bathtub Guides &amp; Inspiration
            </div>
            <h1 className="font-playfair text-3xl sm:text-5xl lg:text-6xl font-bold text-[#14213d] mb-4 leading-tight tracking-tight">
              Travel Blog &amp; Inspiration
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-[#5b6478] font-normal max-w-2xl mx-auto leading-relaxed">
              Curated destination guides, romance tips, and recommendations for hotel suites with private in-room bathtubs and jacuzzis across the globe.
            </p>
          </div>
        </header>

        {/* Main Content with Dynamic Geo Sections */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <BlogIndexClient blogs={blogs} />

          {blogs.length === 0 && (
            <div className="text-center text-[#5b6478] py-16">
              No blog posts found.
            </div>
          )}
        </div>
      </main>
    </>
  );
}
