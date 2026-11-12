import Link from 'next/link';
import FallbackImg from '@/components/FallbackImg';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import connectToDatabase from '@/lib/mongodb';
import Blog from '@/models/Blog';
import Hotel from '@/models/Hotel';
import { markdownToHtml } from '@/lib/markdown';
import StructuredData, { safeJsonLd } from '@/components/StructuredData';
import { DEFAULT_HOTEL_IMAGE, imageUrl } from '@/lib/imageUrl';
import { slugify, escapeRegex, resolveCountry } from '@/lib/utils';
import { sanitizePlaceholderText } from '@/lib/location';
import { dropClaimSentences, dropClaimSentencesFromMarkdown, hasClaimPhrase } from '@/lib/claims';
import { isHotelConfirmed, getLinkedPartners } from '@/lib/evidence';
import { tubWord } from '@/lib/tubWords';
import { isHotelSlugMatch } from '@/lib/hotelSlugMatch';
import HotelCardImage from '@/components/HotelCardImage';
import AuthorBio from '@/components/AuthorBio';
import OutboundLink from '@/components/OutboundLink';
import { cleanOutboundUrl } from '@/lib/affiliate';
import LazyEmailCapture from '@/components/LazyEmailCapture';

const MONTH_NAMES: Record<string, number> = {
  january: 0, feb: 1, february: 1, mar: 2, march: 2, apr: 3, april: 3,
  may: 4, jun: 5, june: 5, jul: 6, july: 6, aug: 7, august: 7,
  sep: 8, september: 8, oct: 9, october: 9, nov: 10, november: 10, dec: 11, december: 11
};

function parseBlogDate(val: string | Date | undefined | null): Date | null {
  if (!val) return null;
  if (val instanceof Date) return isNaN(val.getTime()) ? null : val;
  if (typeof val !== 'string') return null;
  const s = val.trim();
  if (!s) return null;
  const ymd = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (ymd) {
    if (s.length === 10) return new Date(Date.UTC(+ymd[1], +ymd[2] - 1, +ymd[3]));
    const parsed = new Date(s);
    return isNaN(parsed.getTime()) ? null : parsed;
  }
  const mdy = s.match(/^([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})/);
  if (mdy) {
    const m = MONTH_NAMES[mdy[1].toLowerCase()];
    if (m !== undefined) return new Date(Date.UTC(+mdy[3], m, +mdy[2]));
  }
  const my = s.match(/^([A-Za-z]+)\s+(\d{4})/);
  if (my) {
    const m = MONTH_NAMES[my[1].toLowerCase()];
    if (m !== undefined) return new Date(Date.UTC(+my[2], m, 1));
  }
  const parsed = new Date(s);
  return isNaN(parsed.getTime()) ? null : parsed;
}

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function formatDisplayDate(d: Date | null): string {
  if (!d) return '';
  return `${d.getUTCDate()} ${MONTHS_SHORT[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

// Safely normalize blog date strings ("August 1, 2026", "2026-08-19", etc.) to ISO 8601
function toISO(dateStr: string | undefined): string {
  if (!dateStr) return new Date().toISOString();
  const parsed = parseBlogDate(dateStr);
  return parsed ? parsed.toISOString() : dateStr;
}

export async function generateStaticParams() {
  await connectToDatabase();
  const blogs = await Blog.find({ published: true, slug: { $ne: 'kolkata-hotels-with-bathtub-couples-guide' } }).select('slug');
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

function buildBlogDescription(rawDesc?: string): string {
  if (!rawDesc) return 'Explore top romantic hotels with private bathtubs and jacuzzi suites worldwide.';
  const clean = rawDesc.replace(/\s+/g, ' ').trim();
  if (clean.length <= 155 && /[.!?]$/.test(clean)) {
    return clean;
  }

  const candidates: string[] = [];
  const sentences = clean.match(/[^.!?]+[.!?]+/g) || [];

  let combo = '';
  for (const s of sentences) {
    const trimmed = s.trim();
    const candidate = combo ? `${combo} ${trimmed}` : trimmed;
    if (candidate.length <= 155) {
      combo = candidate;
    } else {
      break;
    }
  }
  if (combo) candidates.push(combo);

  for (const s of sentences) {
    const trimmed = s.trim();
    if (trimmed.length <= 155 && trimmed.length >= 30) {
      candidates.push(trimmed);
    }
  }

  const clauses = clean.split(/\s+[—–-]\s+|;\s*/);
  for (let cl of clauses) {
    cl = cl.trim();
    if (!/[.!?]$/.test(cl)) cl += '.';
    cl = cl.charAt(0).toUpperCase() + cl.slice(1);
    if (cl.length <= 155 && cl.length >= 35) {
      candidates.push(cl);
    }
  }

  if (candidates.length > 0) {
    candidates.sort((a, b) => b.length - a.length);
    return candidates[0];
  }

  const truncated = clean.slice(0, 150);
  const lastSpace = truncated.lastIndexOf(' ');
  const wordBoundary = lastSpace > 40 ? truncated.slice(0, lastSpace) : truncated;
  return wordBoundary.replace(/[,;:\s-]+$/, '') + '.';
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  await connectToDatabase();
  const blog = await Blog.findOne({ slug: resolvedParams.slug, published: true });

  if (blog) {
    let title = (blog.title || '').trim();
    if (title.length > 60) {
      const parts = title.split(/[:|–—]/);
      if (parts[0] && parts[0].trim().length >= 25 && parts[0].trim().length <= 60) {
        title = parts[0].trim();
      }
    }
    if (title.length > 60 && /\s*\([^)]+\)\s*$/.test(title)) {
      const stripped = title.replace(/\s*\([^)]+\)\s*$/, '').trim();
      if (stripped.length >= 25 && stripped.length <= 60) {
        title = stripped;
      }
    }
    if (title.length > 65) {
      const sub = title.slice(0, 60);
      const lastSpace = sub.lastIndexOf(' ');
      if (lastSpace > 30) {
        title = sub.slice(0, lastSpace).trim();
      }
    }
    title = title.replace(/\s+(?:&|and|with|in|for|of|the|at|a|an|,|-)\s*$/i, '').trim();

    // If post title is 50 chars or more, don't add the brand.
    // Also don't add brand if it would exceed 65 chars.
    const brand = ' | Hotels With Bathtubs';
    const pageTitle = (title.includes('Hotels With Bathtubs') || title.length >= 50 || (title + brand).length > 65)
      ? title
      : `${title}${brand}`;

    const description = buildBlogDescription(sanitizePlaceholderText(blog.excerpt) || blog.title);
    let ogImage = blog.image ? imageUrl(blog.image) : DEFAULT_HOTEL_IMAGE;

    // Fix Item 9: Ensure non-Delhi blog posts do not use Leela Palace New Delhi photo
    if (ogImage.includes('leela-palace-new-delhi')) {
      const isDelhi = /delhi/i.test(blog.slug) || /delhi/i.test(blog.title);
      if (!isDelhi) {
        let targetCity: string | null = null;
        for (const [alias, canonical] of Object.entries(CITY_ALIASES)) {
          if (new RegExp(`\\b${escapeRegex(alias)}\\b`, 'i').test(blog.slug) || new RegExp(`\\b${escapeRegex(alias)}\\b`, 'i').test(blog.title)) {
            targetCity = canonical;
            break;
          }
        }
        if (!targetCity) {
          const matched = blog.slug.match(/(miami|lucknow|gurgaon|bhopal|kolkata|bangalore|munnar|manali|rishikesh|goa|mumbai|jaipur|udaipur)/i);
          if (matched) targetCity = matched[1];
        }
        if (targetCity) {
          const sampleHotel = await Hotel.findOne({
            city: new RegExp(`^${escapeRegex(targetCity)}$`, 'i'),
            image: { $exists: true, $ne: '' },
            flagged: { $ne: true }
          }).select('image');
          if (sampleHotel?.image) {
            ogImage = imageUrl(sampleHotel.image);
          }
        }
      }
    }

    return {
      title: {
        absolute: pageTitle,
      },
      description,
      alternates: {
        canonical: `/blog/${resolvedParams.slug}`,
      },
      openGraph: {
        title: pageTitle,
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
        title: pageTitle,
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

  // Convert markdown to HTML (also strips duplicate markdown H1 & fixes legacy broken internal links)
  const sanitizedContent = dropClaimSentencesFromMarkdown(sanitizePlaceholderText(blog.content || ''));
  const htmlContent = markdownToHtml(sanitizedContent.replace(/\/india\/mahipalpur\b/g, '/india/delhi'));

  // Determine if this blog is strongly associated with a specific city
  // by checking if the title or slug contains a known city that we have hotels for.
  const allCities = await Hotel.distinct('city', { flagged: { $ne: true } });
  let matchedCity: string | null = null;
  let matchedCountrySlug: string = 'india';
  let matchedCityCount = 0;
  let featuredHotels: any[] = [];

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
    const [cityCount, cityHotels] = await Promise.all([
      Hotel.countDocuments({
        city: new RegExp(`^${escapeRegex(matchedCity)}$`, 'i'),
        flagged: { $ne: true }
      }),
      Hotel.find({
        city: new RegExp(`^${escapeRegex(matchedCity)}$`, 'i'),
        flagged: { $ne: true }
      }).lean()
    ]);
    matchedCityCount = cityCount;

    // Show up to 6 hotels: proven first (isHotelConfirmed), then most booking sites (getLinkedPartners), then rating
    // Leave out hotels whose slug names a different hotel
    const validCityHotels = cityHotels.filter((h: any) =>
      isHotelSlugMatch(h, matchedCity, hotel?.country || matchedCountryName)
    );

    const sortedHotels = [...validCityHotels].sort((a: any, b: any) => {
      const aConf = isHotelConfirmed(a) ? 1 : 0;
      const bConf = isHotelConfirmed(b) ? 1 : 0;
      if (bConf !== aConf) return bConf - aConf;

      const aPartners = getLinkedPartners(a).length;
      const bPartners = getLinkedPartners(b).length;
      if (bPartners !== aPartners) return bPartners - aPartners;

      const aRating = Number(a.rating) || 0;
      const bRating = Number(b.rating) || 0;
      return bRating - aRating;
    });
    featuredHotels = sortedHotels.slice(0, 6);
  }

  // True date calculation for visible text, JSON-LD, and sitemap synchronization
  const pubDate = parseBlogDate(blog.date);
  const upDate = parseBlogDate(blog.updatedAt);
  const isUpdatedLater = Boolean(
    pubDate &&
    upDate &&
    upDate.getTime() > pubDate.getTime() &&
    formatDisplayDate(upDate) !== formatDisplayDate(pubDate)
  );

  const visibleDateText = isUpdatedLater
    ? `Published ${formatDisplayDate(pubDate)} · Updated ${formatDisplayDate(upDate)}`
    : (pubDate ? `Published ${formatDisplayDate(pubDate)}` : (upDate ? `Published ${formatDisplayDate(upDate)}` : ''));

  const jsonLdPublished = pubDate ? pubDate.toISOString() : (upDate ? upDate.toISOString() : '');
  const jsonLdModified = isUpdatedLater && upDate ? upDate.toISOString() : jsonLdPublished;

  // Split markdown content so hotel photo block can sit right after the first paragraph
  const firstPEnd = htmlContent.indexOf('</p>');
  let introHtml = htmlContent;
  let bodyHtml = '';
  if (firstPEnd !== -1 && featuredHotels.length > 0 && matchedCity) {
    introHtml = htmlContent.slice(0, firstPEnd + 4);
    bodyHtml = htmlContent.slice(firstPEnd + 4);
  }

  // Structured Data Schemas
  // Strip markdown syntax to get plain text for wordCount/articleBody
  const plainText = sanitizedContent
    ? sanitizedContent
        .replace(/#{1,6}\s+/g, '')         // strip markdown headings
        .replace(/<[^>]+>/g, '')            // strip any HTML tags
        .replace(/[*_`[\]()!#>]/g, '')      // strip markdown syntax chars
        .replace(/\s+/g, ' ')
        .trim()
    : '';
  const wordCount = plainText ? plainText.split(/\s+/).length : undefined;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": blog.title,
    "description": sanitizePlaceholderText(blog.excerpt) || blog.excerpt,
    "image": blog.image ? imageUrl(blog.image) : DEFAULT_HOTEL_IMAGE,
    "datePublished": jsonLdPublished,
    "dateModified": jsonLdModified,
    "author": {
      "@type": "Person",
      "name": "Karan Arora",
      "jobTitle": "Founder & Travel Editor",
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
    },
    ...(wordCount ? { "wordCount": wordCount } : {}),
    ...(plainText ? { "articleBody": plainText.substring(0, 500) } : {}),
  };

  // Parse FAQ from markdown content with flexible header matching
  const markdownFaqPairs = (() => {
    const faqSection = sanitizedContent?.split(/##\s+(?:Frequently Asked Questions|FAQ)/i)[1] || sanitizedContent?.split(/###\s+(?:Frequently Asked Questions|FAQ)/i)[1];
    if (!faqSection) return [];
    const pairs = [
      ...faqSection.matchAll(/\*\*([^*]+\?)\*\*\s*\n+([^\n*#][^\n]*(?:\n(?![*#\n])[^\n]*)*)/g),
      ...faqSection.matchAll(/###\s+([^\n?]+\?)\s*\n+([^\n*#][^\n]*(?:\n(?![*#\n])[^\n]*)*)/g)
    ];
    return pairs.map((m: RegExpExecArray) => {
      const q = m[1].trim();
      const a = dropClaimSentences(m[2].trim());
      return { q, a };
    }).filter((item) => item.q && item.a && !hasClaimPhrase(item.q) && !hasClaimPhrase(item.a));
  })();

  const hasMarkdownFaq = markdownFaqPairs.length > 0;

  // Contextual fallback FAQs for blogs without an in-content FAQ section
  const fallbackFaqs: { q: string; a: string }[] = matchedCity
    ? [
        {
          q: `Which hotels in ${matchedCity} feature private in-room bathtubs or jacuzzis?`,
          a: `Top options in ${matchedCity} include properties featured in this guide and directory, listed with private in-room tubs on Booking.com and Agoda rather than shared hotel wellness facilities.`
        },
        {
          q: `How do I ensure my room tier in ${matchedCity} includes a private bathtub?`,
          a: `When booking through partner links, check that your chosen room tier (such as "Suite with Bathtub", "Executive Room", or "Jacuzzi Suite") explicitly lists a private bathtub in the amenities list before reserving.`
        },
        {
          q: `What is the difference between a bathtub and a jacuzzi suite in ${matchedCity}?`,
          a: `A hotel room with a bathtub typically features a deep freestanding soaking tub or Roman bath, while a jacuzzi suite includes hydrotherapy jets and whirlpool water massage.`
        }
      ]
    : [
        {
          q: "How does Hotels with Bathtubs list in-room tubs?",
          a: "We list rooms whose partner or rental listing mentions a private bathtub, soaking tub, hot tub or jacuzzi."
        },
        {
          q: "Are hotel room bathtubs and jacuzzis private or shared?",
          a: "Properties listed on Hotels with Bathtubs feature private, in-room bathtubs or suites. We do not list properties where tubs are located in shared hotel spas."
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
            dangerouslySetInnerHTML={{ __html: safeJsonLd(faqSchema) }}
          />
        )}
        <div className="bg-[#f5f6f8] min-h-screen py-6 sm:py-10">
          <nav aria-label="Breadcrumbs" className="max-w-[720px] mx-auto px-4 mb-4 text-xs font-medium text-[#5b6478] flex items-center flex-wrap gap-1.5">
            <Link href="/" prefetch={false} className="hover:text-[#14213d] hover:underline">Home</Link>
            <span>&rsaquo;</span>
            <Link href="/blog" prefetch={false} className="hover:text-[#14213d] hover:underline">Guides</Link>
            {matchedCity && (
              <>
                <span>&rsaquo;</span>
                <Link href={`/${matchedCountrySlug}`} prefetch={false} className="hover:text-[#14213d] hover:underline">
                  {matchedCountryName}
                </Link>
                <span>&rsaquo;</span>
                <Link href={`/${matchedCountrySlug}/${slugify(matchedCity)}`} prefetch={false} className="hover:text-[#14213d] hover:underline">
                  {matchedCity}
                </Link>
              </>
            )}
            <span>&rsaquo;</span>
            <span className="text-[#14213d] line-clamp-1 font-semibold">{blog.title}</span>
          </nav>

          <main className="max-w-[720px] mx-auto px-4">
            <div className="bg-white rounded-2xl border border-[#e3e7ef] p-6 sm:p-10 mb-10 shadow-xs">
              <header className="mb-6 pb-6 border-b border-[#e3e7ef]">
                {visibleDateText && (
                  <div className="text-xs sm:text-sm text-[#5b6478] mb-2 font-medium">
                    {visibleDateText} · By Karan Arora
                  </div>
                )}
                <h1 className="font-playfair text-2xl sm:text-3xl md:text-4xl font-bold text-[#14213d] leading-tight mb-3">
                  {blog.title}
                </h1>
                {matchedCity && matchedCityCount > 0 && (
                  <p className="text-sm font-medium text-[#b08d57]">
                    <Link href={`/${matchedCountrySlug}/${slugify(matchedCity)}`} className="hover:underline">
                      See all {matchedCityCount} hotels in {matchedCity} &rarr;
                    </Link>
                  </p>
                )}
              </header>

              {(() => {
                let displayImage = blog.image;
                if (displayImage && displayImage.includes('leela-palace-new-delhi') && matchedCity && !/delhi/i.test(matchedCity)) {
                  if (featuredHotels.length > 0 && featuredHotels[0].image) {
                    displayImage = featuredHotels[0].image;
                  }
                }
                return displayImage ? (
                  <div className="relative aspect-[16/9] w-full mb-8 overflow-hidden rounded-xl border border-[#e3e7ef]">
                    <FallbackImg
                      src={imageUrl(displayImage)}
                      alt={blog.title}
                      loading="eager"
                      decoding="async"
                      fetchPriority="high"
                      className="object-cover w-full h-full"
                    />
                  </div>
                ) : null;
              })()}

              {/* First paragraph / intro prose */}
              <div
                className="prose prose-base sm:prose-lg max-w-none text-[#14213d] prose-headings:font-playfair prose-headings:text-[#14213d] prose-a:text-[#b08d57] hover:prose-a:underline leading-relaxed mb-6"
                dangerouslySetInnerHTML={{ __html: introHtml }}
              />

              {/* Hotels with a tub in {City} block */}
              {featuredHotels.length > 0 && matchedCity && (
                <section aria-label={`Hotels with a tub in ${matchedCity}`} className="my-8 pt-6 pb-6 border-t border-b border-[#e3e7ef]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                    <h2 className="font-playfair text-xl sm:text-2xl font-bold text-[#14213d]">
                      Hotels with a tub in {matchedCity}
                    </h2>
                    <Link
                      href={`/${matchedCountrySlug}/${slugify(matchedCity)}`}
                      prefetch={false}
                      className="text-xs font-semibold text-[#b08d57] hover:underline flex items-center gap-1"
                    >
                      <span>See all {matchedCityCount} hotels &rarr;</span>
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {featuredHotels.map((h: any, idx: number) => {
                      const hotelUrl = `/${matchedCountrySlug}/${slugify(matchedCity)}/${h.slug || slugify(h.name)}`;
                      const tubLower = (h.tubType || '').toLowerCase();
                      const hotelCountry = h.country || matchedCountryName;
                      const cardTubWord = tubWord(tubLower, hotelCountry);
                      const confirmed = isHotelConfirmed(h);

                      return (
                        <div
                          key={h._id?.toString() || h.slug || idx}
                          className="bg-white rounded-xl border border-[#e3e7ef] shadow-xs overflow-hidden flex flex-col justify-between"
                        >
                          <div>
                            <HotelCardImage
                              primaryImage={h.image || ''}
                              images={h.images}
                              partnerImages={h.partnerImages}
                              hotelName={h.name}
                              cityName={h.city || matchedCity}
                              countryName={h.country || matchedCountryName}
                              tubType={h.tubType}
                              priority={idx === 0}
                              className="relative aspect-[16/10] w-full bg-[#f5f6f8] shrink-0 overflow-hidden group/image"
                            >
                              {confirmed ? (
                                <span className="absolute left-2.5 top-2.5 z-10 bg-[#e3f2ee] text-[#1f6f5c] text-[11px] font-bold px-2.5 py-1 rounded-full shadow-xs pointer-events-none">
                                  ✓ Tub proven
                                </span>
                              ) : (
                                <span className="absolute left-2.5 top-2.5 z-10 bg-[#e3e7ef] text-[#5b6478] text-[11px] font-bold px-2.5 py-1 rounded-full shadow-xs pointer-events-none">
                                  Reported, not yet confirmed
                                </span>
                              )}
                            </HotelCardImage>

                            <div className="p-3.5">
                              <Link href={hotelUrl} prefetch={false} className="block group mb-1">
                                <h3 className="font-playfair text-base font-semibold text-[#14213d] group-hover:text-[#b08d57] transition-colors line-clamp-1">
                                  {h.name}
                                </h3>
                              </Link>

                              <div className="text-[12px] leading-[1.4] bg-[#f5f6f8] text-[#14213d] rounded-lg p-2 mb-2">
                                {confirmed ? (
                                  h.roomType ? (
                                    <span>Book the <strong className="font-bold text-[#14213d]">{h.roomType}</strong> for an in-room {cardTubWord}</span>
                                  ) : (
                                    <span>In-room <strong className="font-bold text-[#14213d]">{cardTubWord}</strong></span>
                                  )
                                ) : (
                                  h.roomType ? (
                                    <span>Reported room: <strong className="font-bold text-[#14213d]">{h.roomType}</strong></span>
                                  ) : (
                                    <span>A {cardTubWord} is reported; check room details before booking</span>
                                  )
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="p-3.5 pt-0">
                            <Link
                              href={hotelUrl}
                              prefetch={false}
                              className="inline-block text-xs font-semibold text-[#b08d57] hover:underline"
                            >
                              View hotel &rarr;
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Remaining body prose */}
              {bodyHtml && (
                <div
                  className="prose prose-base sm:prose-lg max-w-none text-[#14213d] prose-headings:font-playfair prose-headings:text-[#14213d] prose-a:text-[#b08d57] hover:prose-a:underline leading-relaxed mb-8"
                  dangerouslySetInnerHTML={{ __html: bodyHtml }}
                />
              )}

              {/* FAQ Section */}
              {!hasMarkdownFaq && effectiveFaqs.length > 0 && (
                <section className="mt-10 pt-8 border-t border-[#e3e7ef]">
                  <h2 className="font-playfair text-xl sm:text-2xl font-bold text-[#14213d] mb-6">
                    Frequently Asked Questions
                  </h2>
                  <div className="space-y-3.5">
                    {effectiveFaqs.map(({ q, a }) => (
                      <details key={q} className="group border border-[#e3e7ef] rounded-xl overflow-hidden bg-[#f5f6f8]">
                        <summary className="flex items-center justify-between gap-3 p-4 cursor-pointer font-semibold text-sm sm:text-base text-[#14213d] list-none hover:bg-black/5 transition-colors">
                          <span>{q}</span>
                          <svg className="w-4 h-4 flex-shrink-0 transition-transform group-open:rotate-180 text-[#b08d57]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </summary>
                        <p className="px-4 pb-4 text-sm text-[#5b6478] leading-relaxed border-t border-[#e3e7ef] pt-3">
                          {a}
                        </p>
                      </details>
                    ))}
                  </div>
                </section>
              )}

              {/* Author Bio */}
              <div className="mt-10 pt-8 border-t border-[#e3e7ef]">
                <AuthorBio />
              </div>

              {/* Ready to book stay / city CTA */}
              {matchedCity && matchedCityCount > 0 && (
                <div className="mt-10 bg-[#f5f6f8] border border-[#e3e7ef] rounded-2xl p-6 sm:p-8 text-center">
                  <h2 className="font-playfair text-xl sm:text-2xl font-bold text-[#14213d] mb-2">
                    Ready to book your stay in {matchedCity}?
                  </h2>
                  <p className="text-sm text-[#5b6478] mb-5 max-w-xl mx-auto">
                    We list {matchedCityCount} hotels in {matchedCity} with a private bathtub or jacuzzi in the room.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Link
                      href={`/${matchedCountrySlug}/${slugify(matchedCity)}`}
                      className="inline-block bg-[#14213d] hover:bg-[#1f262d] text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors"
                    >
                      View Bathtub Hotels in {matchedCity} &rarr;
                    </Link>
                    <Link
                      href={`/${matchedCountrySlug}`}
                      className="inline-block bg-white hover:bg-gray-50 text-[#14213d] border border-[#e3e7ef] px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors"
                    >
                      All {matchedCountryName} Stays &rarr;
                    </Link>
                  </div>
                  <p className="text-xs text-[#5b6478] text-center mt-5">
                    Links go straight to the booking site. We don&apos;t earn a commission from them today.
                  </p>
                </div>
              )}

              {/* Email Capture */}
              <div className="mt-8 mb-4">
                <LazyEmailCapture destinationName={matchedCity || undefined} />
              </div>

              {/* Back to all articles */}
              <div className="mt-8 pt-6 border-t border-[#e3e7ef] text-center">
                <Link href="/blog" className="inline-block bg-[#f5f6f8] hover:bg-[#e3e7ef] text-[#14213d] px-5 py-2.5 rounded-xl font-semibold transition-colors text-sm">
                  &larr; Back to all articles
                </Link>
              </div>
            </div>
          </main>

          {/* Explore Blogs Section */}
          {relatedBlogs.length > 0 && (
            <section className="max-w-[720px] mx-auto px-4 mt-8 mb-12">
              <h2 className="font-playfair text-xl sm:text-2xl font-bold text-[#14213d] mb-6 text-center">
                Explore More Guides
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {relatedBlogs.map((relatedBlog: any) => (
                  <Link key={relatedBlog.slug} href={`/blog/${relatedBlog.slug}`} className="group bg-white border border-[#e3e7ef] rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col">
                    {relatedBlog.image && (
                      <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-[#e3e7ef] bg-[#f5f6f8]">
                        <FallbackImg
                          src={imageUrl(relatedBlog.image)}
                          alt={relatedBlog.title}
                          loading="lazy"
                          decoding="async"
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="p-4 flex flex-col flex-grow">
                      <p className="text-[#b08d57] font-medium text-xs mb-1">
                        {formatDisplayDate(parseBlogDate(relatedBlog.date))}
                      </p>
                      <h3 className="font-playfair text-sm font-bold text-[#14213d] mb-2 group-hover:text-[#b08d57] transition-colors line-clamp-2">
                        {relatedBlog.title}
                      </h3>
                      <span className="text-xs font-semibold text-[#14213d] group-hover:underline mt-auto inline-block">Read guide &rarr;</span>
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
