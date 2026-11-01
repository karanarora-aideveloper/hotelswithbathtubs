'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import FallbackImg from '@/components/FallbackImg';
import { imageUrl } from '@/lib/imageUrl';
import { useGeo } from '@/lib/useGeo';
import { useMounted } from '@/components/Favorites';
import {
  getCountryDisplayName,
  getFlagEmoji,
  COUNTRIES_WITH_HOTELS,
} from '@/lib/countries';
import CountrySelector from '@/components/CountrySelector';

export type BlogPostItem = {
  title: string;
  slug: string;
  excerpt: string;
  date?: string;
  image?: string;
  country?: string;
  city?: string;
};

function formatBlogDate(dateStr?: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
  return dateStr;
}

export function getBlogCountryCode(countryStr?: string): string {
  if (!countryStr) return '';
  const s = countryStr.trim().toLowerCase();
  if (s === 'india') return 'IN';
  if (s === 'usa' || s === 'united states') return 'US';
  if (s === 'uk' || s === 'united kingdom') return 'GB';
  if (s === 'italy') return 'IT';
  if (s === 'spain') return 'ES';
  if (s === 'france') return 'FR';
  if (s === 'uae' || s === 'united arab emirates') return 'AE';
  if (s === 'thailand') return 'TH';
  if (s === 'greece') return 'GR';
  if (s === 'french polynesia') return 'PF';
  if (s === 'switzerland') return 'CH';
  if (s === 'japan') return 'JP';
  const found = COUNTRIES_WITH_HOTELS.find(
    (c) =>
      c.name.toLowerCase() === s ||
      c.code.toLowerCase() === s ||
      c.slug === s.replace(/\s+/g, '-')
  );
  if (found) return found.code;
  if (countryStr.length === 2) return countryStr.toUpperCase();
  return '';
}

function BlogCard({
  blog,
  priority = false,
}: {
  blog: BlogPostItem;
  priority?: boolean;
}) {
  return (
    <Link
      key={blog.slug}
      href={`/blog/${blog.slug}`}
      prefetch={false}
      className="group bg-white rounded-2xl border border-[#e3e7ef] shadow-[0_4px_18px_rgba(0,0,0,0.05)] overflow-hidden hover:shadow-md hover:border-[#b08d57] transition-all flex flex-col"
    >
      {blog.image && (
        <div className="relative aspect-[16/10] w-full bg-[#f5f6f8] overflow-hidden border-b border-[#e3e7ef] shrink-0">
          <FallbackImg
            src={imageUrl(blog.image)}
            alt={blog.title}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            fetchPriority={priority ? 'high' : 'auto'}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      )}
      <div className="p-4 sm:p-5 flex flex-col flex-grow">
        {/* City & Country or Topic line */}
        <div className="flex items-center justify-between text-[11px] font-bold text-[#5b6478] mb-1.5 uppercase tracking-wider">
          <span>
            {blog.city && blog.country
              ? `${blog.city}, ${blog.country}`
              : blog.country || 'Travel Guide'}
          </span>
          {blog.date && (
            <span className="text-[11px] font-normal lowercase tracking-normal text-[#5b6478]">
              {formatBlogDate(blog.date)}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-playfair text-[18px] sm:text-[20px] font-bold text-[#14213d] leading-snug mb-2 group-hover:text-[#b08d57] transition-colors line-clamp-2">
          {blog.title}
        </h3>

        {/* Excerpt clipped to 2 lines */}
        <p className="text-xs text-[#5b6478] line-clamp-2 leading-relaxed mb-4 flex-grow">
          {blog.excerpt}
        </p>

        {/* Read guide button */}
        <span className="text-xs font-bold text-[#1a6fde] group-hover:text-[#b08d57] transition-colors mt-auto inline-flex items-center gap-1">
          Read Guide &rarr;
        </span>
      </div>
    </Link>
  );
}

export default function BlogIndexClient({ blogs }: { blogs: BlogPostItem[] }) {
  const { geo } = useGeo();
  const mounted = useMounted();
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  // Active visitor country code
  const activeCountryCode = useMemo(() => {
    if (!mounted || !geo.countryCode || geo.countryCode === 'XX') return '';
    return geo.countryCode.toUpperCase();
  }, [mounted, geo.countryCode]);

  // Section 1: Up to 9 posts for the active country (newest first)
  const countryPosts = useMemo(() => {
    if (!activeCountryCode) return [];
    return blogs.filter((b) => getBlogCountryCode(b.country) === activeCountryCode).slice(0, 9);
  }, [blogs, activeCountryCode]);

  const hasCountrySection = countryPosts.length > 0;

  // Section 2: Posts with no country (general guides)
  const generalPosts = useMemo(() => {
    return blogs.filter((b) => !b.country);
  }, [blogs]);

  // Section 3: All other posts (grouped by country)
  // Exclude posts shown in Section 1 (the first 9 of active country)
  const otherPosts = useMemo(() => {
    const countryPostSlugs = new Set(countryPosts.map((b) => b.slug));
    return blogs.filter((b) => b.country && !countryPostSlugs.has(b.slug));
  }, [blogs, countryPosts]);

  // Group other posts by country name
  const otherCountryGroups = useMemo(() => {
    const map = new Map<string, { code: string; name: string; flag: string; posts: BlogPostItem[] }>();

    for (const b of otherPosts) {
      const code = getBlogCountryCode(b.country);
      const name = b.country?.trim() || 'Other';
      if (!map.has(name)) {
        map.set(name, {
          code,
          name,
          flag: code ? getFlagEmoji(code) : '🌍',
          posts: [],
        });
      }
      map.get(name)!.posts.push(b);
    }

    // Sort country groups by post count descending
    return Array.from(map.values()).sort((a, b) => b.posts.length - a.posts.length || a.name.localeCompare(b.name));
  }, [otherPosts]);

  const currentCountryName = activeCountryCode
    ? getCountryDisplayName(activeCountryCode) || activeCountryCode
    : '';
  const currentFlag = activeCountryCode ? getFlagEmoji(activeCountryCode) : '';

  return (
    <div>
      {/* Country Selection Modal */}
      <CountrySelector
        variant="modal"
        isOpen={isSelectorOpen}
        onOpenChange={setIsSelectorOpen}
      />

      {/* SECTION 1: For {flag} {Country} (Rendered when visitor's country has posts) */}
      {hasCountrySection && (
        <section className="mb-14 sm:mb-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 pb-4 border-b border-[#e3e7ef] gap-2">
            <div>
              <div
                id="blog-country-switch-line"
                className="text-xs sm:text-sm text-[#5b6478] font-medium flex items-center gap-1.5 mb-2"
              >
                <span>Showing {currentCountryName} · </span>
                <button
                  type="button"
                  onClick={() => setIsSelectorOpen(true)}
                  className="text-[#1a6fde] hover:underline font-semibold cursor-pointer inline-flex items-center"
                >
                  Change
                </button>
              </div>
              <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-[#14213d] tracking-tight">
                For {currentFlag} {currentCountryName}
              </h2>
            </div>
            <p className="text-xs text-[#5b6478] max-w-xs">
              Hand-picked bathtub guides and suites for travelers in {currentCountryName}.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {countryPosts.map((blog, idx) => (
              <BlogCard key={blog.slug} blog={blog} priority={idx < 3} />
            ))}
          </div>
        </section>
      )}

      {/* SECTION 2: Guides for every trip (Posts with no country) */}
      <section className="mb-14 sm:mb-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 pb-4 border-b border-[#e3e7ef] gap-2">
          <div>
            <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-[#14213d] tracking-tight">
              Guides for every trip
            </h2>
          </div>
          <p className="text-xs text-[#5b6478] max-w-xs">
            Etiquette, planning advice, and tips for bathtub stays worldwide.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {generalPosts.map((blog, idx) => (
            <BlogCard
              key={blog.slug}
              blog={blog}
              priority={!hasCountrySection && idx < 3}
            />
          ))}
        </div>
      </section>

      {/* SECTION 3: More destinations (All other posts grouped by country) */}
      {otherCountryGroups.length > 0 && (
        <section className="mb-14 sm:mb-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-[#e3e7ef] gap-2">
            <div>
              <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-[#14213d] tracking-tight">
                More destinations
              </h2>
            </div>
            <p className="text-xs text-[#5b6478] max-w-xs">
              Explore bathtub suite guides across global destinations.
            </p>
          </div>

          <div className="space-y-12">
            {otherCountryGroups.map(({ name, flag, posts }) => (
              <div key={name}>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl">{flag}</span>
                  <h3 className="font-playfair text-xl font-bold text-[#14213d]">
                    {name}
                  </h3>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#e9eef7] text-[#5b6478]">
                    {posts.length} {posts.length === 1 ? 'guide' : 'guides'}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                  {posts.map((blog) => (
                    <BlogCard key={blog.slug} blog={blog} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
