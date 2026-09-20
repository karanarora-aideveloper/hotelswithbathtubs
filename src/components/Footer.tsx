import connectToDatabase from '@/lib/mongodb';
import Hotel from '@/models/Hotel';
import Blog from '@/models/Blog';
import Link from 'next/link';
import Image from 'next/image';
import Logo from './Logo';
import { imageUrl } from '@/lib/imageUrl';
import { resolveCountry, slugify } from '@/lib/utils';

// Region groupings for better destination scanning
const regionMapping: Record<string, string> = {
  'Rajasthan': 'North India',
  'Himachal Pradesh': 'North India',
  'Punjab': 'North India',
  'Uttarakhand': 'North India',
  'Uttar Pradesh': 'North India',
  'Delhi NCR': 'North India',

  'Kerala': 'South India',
  'Tamil Nadu': 'South India',
  'Karnataka': 'South India',
  'Goa': 'South India',
  'Pondicherry': 'South India',
  'Puducherry': 'South India',

  'Maharashtra': 'West & Central India',
  'Gujarat': 'West & Central India',
  'Madhya Pradesh': 'West & Central India',
  'Daman and Diu': 'West & Central India',

  'West Bengal': 'East & North East',
  'Meghalaya': 'East & North East',
  'Odisha': 'East & North East',

  // United States & North America
  'United States': 'United States & North America',
  'USA': 'United States & North America',
  'Canada': 'United States & North America',
  'Mexico': 'United States & North America',

  // United Kingdom & Europe
  'United Kingdom': 'United Kingdom & Europe',
  'UK': 'United Kingdom & Europe',
  'France': 'United Kingdom & Europe',
  'Italy': 'United Kingdom & Europe',
  'Spain': 'United Kingdom & Europe',
  'Netherlands': 'United Kingdom & Europe',
  'Germany': 'United Kingdom & Europe',
  'Switzerland': 'United Kingdom & Europe',
  'Greece': 'United Kingdom & Europe',
  'Austria': 'United Kingdom & Europe',
  'Czechia': 'United Kingdom & Europe',
  'Hungary': 'United Kingdom & Europe',
  'Ireland': 'United Kingdom & Europe',
  'Portugal': 'United Kingdom & Europe',
  'Iceland': 'United Kingdom & Europe',
  'Norway': 'United Kingdom & Europe',
  'Finland': 'United Kingdom & Europe',
  'Sweden': 'United Kingdom & Europe',
  'Denmark': 'United Kingdom & Europe',
  'Croatia': 'United Kingdom & Europe',
  'Poland': 'United Kingdom & Europe',
  'Slovenia': 'United Kingdom & Europe',

  // Asia & Middle East
  'Singapore': 'Asia & Middle East',
  'United Arab Emirates': 'Asia & Middle East',
  'UAE': 'Asia & Middle East',
  'Thailand': 'Asia & Middle East',
  'Japan': 'Asia & Middle East',
  'Indonesia': 'Asia & Middle East',
  'Malaysia': 'Asia & Middle East',
  'Maldives': 'Asia & Middle East',
  'Turkey': 'Asia & Middle East',
  'South Korea': 'Asia & Middle East',
  'Taiwan': 'Asia & Middle East',
  'Vietnam': 'Asia & Middle East',
  'Sri Lanka': 'Asia & Middle East',
  'Qatar': 'Asia & Middle East',
  'Oman': 'Asia & Middle East',
  'Bahrain': 'Asia & Middle East',
  'Jordan': 'Asia & Middle East',
  'Saudi Arabia': 'Asia & Middle East',
  'Philippines': 'Asia & Middle East',
  'Cambodia': 'Asia & Middle East',
  'Laos': 'Asia & Middle East',
  'Nepal': 'Asia & Middle East',

  // Tropical Islands & Southern Escapes
  'French Polynesia': 'Tropical Islands & Southern Escapes',
  'Seychelles': 'Tropical Islands & Southern Escapes',
  'Mauritius': 'Tropical Islands & Southern Escapes',
  'Fiji': 'Tropical Islands & Southern Escapes',
  'Saint Lucia': 'Tropical Islands & Southern Escapes',
  'Jamaica': 'Tropical Islands & Southern Escapes',
  'Bahamas': 'Tropical Islands & Southern Escapes',
  'Dominican Republic': 'Tropical Islands & Southern Escapes',
  'Turks and Caicos': 'Tropical Islands & Southern Escapes',
  'Barbados': 'Tropical Islands & Southern Escapes',
  'Aruba': 'Tropical Islands & Southern Escapes',
  'Australia': 'Tropical Islands & Southern Escapes',
  'New Zealand': 'Tropical Islands & Southern Escapes',
  'Costa Rica': 'Tropical Islands & Southern Escapes',
  'Brazil': 'Tropical Islands & Southern Escapes',
  'South Africa': 'Tropical Islands & Southern Escapes',
  'Morocco': 'Tropical Islands & Southern Escapes',
  'Tanzania': 'Tropical Islands & Southern Escapes',
  'Chile': 'Tropical Islands & Southern Escapes',
  'Argentina': 'Tropical Islands & Southern Escapes',
  'Peru': 'Tropical Islands & Southern Escapes',
  'Colombia': 'Tropical Islands & Southern Escapes',
};


const stateMapping: Record<string, string> = {
  'Udaipur': 'Rajasthan',
  'Jaipur': 'Rajasthan',
  'Mount Abu': 'Rajasthan',
  'Jaisalmer': 'Rajasthan',
  'Jodhpur': 'Rajasthan',
  
  'Manali': 'Himachal Pradesh',
  'Shimla': 'Himachal Pradesh',
  'Dharamshala': 'Himachal Pradesh',
  
  'Munnar': 'Kerala',
  'Kochi': 'Kerala',
  'Wayanad': 'Kerala',
  'Alleppey': 'Kerala',
  'Varkala': 'Kerala',
  'Kovalam': 'Kerala',

  'Coorg': 'Karnataka',
  'Chikmagalur': 'Karnataka',
  'Gokarna': 'Karnataka',
  'Bangalore': 'Karnataka',

  'Mussoorie': 'Uttarakhand',
  'Rishikesh': 'Uttarakhand',
  'Nainital': 'Uttarakhand',
  'Dehradun': 'Uttarakhand',
  'Haridwar': 'Uttarakhand',
  'Lansdowne': 'Uttarakhand',

  'Pondicherry': 'Pondicherry',
  
  'Ooty': 'Tamil Nadu',
  'Kodaikanal': 'Tamil Nadu',
  'Coimbatore': 'Tamil Nadu',
  'Mahabalipuram': 'Tamil Nadu',
  'Yercaud': 'Tamil Nadu',
  
  'Mumbai': 'Maharashtra',
  'Lonavala': 'Maharashtra',
  'Pune': 'Maharashtra',
  'Mahabaleshwar': 'Maharashtra',
  'Alibaug': 'Maharashtra',
  'Panchgani': 'Maharashtra',
  'Karjat': 'Maharashtra',
  'Lavasa': 'Maharashtra',
  'Igatpuri': 'Maharashtra',
  'Nashik': 'Maharashtra',
  'Panvel': 'Maharashtra',
  'Kolhapur': 'Maharashtra',
  
  'Goa': 'Goa',
  'Panjim': 'Goa',
  'Calangute': 'Goa',
  
  'New Delhi': 'Delhi NCR',
  'Gurgaon': 'Delhi NCR',
  'Faridabad': 'Delhi NCR',
  'Mahipalpur': 'Delhi NCR',
  'Paharganj': 'Delhi NCR',
  
  'Kolkata': 'West Bengal',
  'Darjeeling': 'West Bengal',
  'Siliguri': 'West Bengal',
  'Digha': 'West Bengal',
  'Mandarmani': 'West Bengal',
  
  'Ahmedabad': 'Gujarat',
  'Gandhinagar': 'Gujarat',
  'Rajkot': 'Gujarat',
  'Saputara': 'Gujarat',
  
  'Bhopal': 'Madhya Pradesh',
  'Indore': 'Madhya Pradesh',
  'Gwalior': 'Madhya Pradesh',
  
  'Amritsar': 'Punjab',
  'Chandigarh': 'Punjab',
  'Zirakpur': 'Punjab',
  
  'Agra': 'Uttar Pradesh',
  'Mathura': 'Uttar Pradesh',
  
  'Puri': 'Odisha',
  'Shillong': 'Meghalaya',
  'Daman': 'Daman and Diu',
};

function getUrlSlug(text: string) {
  return text.toLowerCase().replace(/\s+/g, '-');
}

export default async function Footer() {
  await connectToDatabase();

  // Fetch all unique cities from the DB. Excludes flagged hotels
  const citiesData = await Hotel.aggregate([
    { $match: { flagged: { $ne: true } } },
    { $group: { _id: { city: "$city", country: "$country" }, hotelCount: { $sum: 1 }, image: { $first: "$image" } } }
  ]);

  // Fetch recent blog posts with images
  const recentBlogs = await Blog.find({ published: true })
    .sort({ createdAt: -1 })
    .limit(3)
    .select('title slug excerpt date image author');

  // Group cities by macro-region for effortless scanning
  const regionGroups: Record<string, { city: string, country: string, hotelCount: number }[]> = {
    'United States & North America': [],
    'United Kingdom & Europe': [],
    'Asia & Middle East': [],
    'Tropical Islands & Southern Escapes': [],
    'North India': [],
    'South India': [],
    'West & Central India': [],
    'East & North East': [],
  };

  citiesData.forEach(item => {
    const city = item._id.city;
    const country = item._id.country;
    const hotelCount = item.hotelCount;

    let subGroup = country;
    if (country.toLowerCase() === 'india') {
      subGroup = stateMapping[city] || 'North India';
    }

    const region = regionMapping[subGroup] || regionMapping[country] || (country.toLowerCase() === 'india' ? 'North India' : 'United Kingdom & Europe');

    if (!regionGroups[region]) {
      regionGroups[region] = [];
    }
    regionGroups[region].push({ city, country, hotelCount });
  });

  // Aggregate country hubs for direct internal link architecture
  const countryHubMap = new Map<string, { name: string; slug: string; hotelCount: number }>();
  citiesData.forEach(item => {
    const country = item._id.country;
    if (!country) return;
    const info = resolveCountry(country);
    const existing = countryHubMap.get(info.slug);
    if (existing) {
      existing.hotelCount += item.hotelCount;
    } else {
      countryHubMap.set(info.slug, {
        name: info.displayName,
        slug: info.slug,
        hotelCount: item.hotelCount,
      });
    }
  });
  const countryHubList = Array.from(countryHubMap.values()).sort((a, b) => b.hotelCount - a.hotelCount);

  return (
    <footer className="mt-16 bg-gray-50 text-text-main border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-16">

        {/* Travel Blog Section - Visually Rich Editorial Cards */}
        {recentBlogs.length > 0 && (
          <section className="mb-20 bg-white rounded-3xl p-6 sm:p-10 border border-border shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-gray-100">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-accent">Editorial &amp; Travel Inspiration</span>
                <h3 className="font-heading text-2xl sm:text-3xl font-extrabold text-accent-secondary mt-1">
                  Romantic Getaways &amp; Jacuzzi Hotel Guides
                </h3>
              </div>
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 bg-accent/10 hover:bg-accent hover:text-white text-accent font-bold text-xs sm:text-sm px-4 py-2 rounded-xl transition-all self-start sm:self-auto"
              >
                <span>Browse All Guides</span>
                <span>&rarr;</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {recentBlogs.map((blog) => (
                <Link
                  key={blog._id}
                  href={`/blog/${blog.slug}`}
                  className="group bg-gray-50 hover:bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-accent hover:shadow-xl transition-all flex flex-col"
                >
                  <div className="relative overflow-hidden aspect-[16/10]">
                    <Image
                      src={imageUrl(blog.image)}
                      alt={blog.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs text-accent-secondary font-bold text-2xs px-2.5 py-1 rounded-full shadow-2xs uppercase tracking-wider">
                      {blog.date}
                    </span>
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <h4 className="font-heading font-bold text-accent-secondary group-hover:text-accent transition-colors text-lg leading-snug mb-2 line-clamp-2">
                      {blog.title}
                    </h4>
                    {blog.excerpt && (
                      <p className="text-xs sm:text-sm text-text-muted line-clamp-2 font-serif leading-relaxed mb-4">
                        {blog.excerpt}
                      </p>
                    )}
                    <span className="mt-auto text-xs font-bold text-accent inline-flex items-center gap-1 group-hover:underline">
                      <span>Read Full Guide</span>
                      <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Country Hubs Directory - Direct Crawl Navigation to All 34 Countries */}
        <section className="mb-16 pb-12 border-b border-border">
          <div className="flex items-center gap-3 mb-6 pb-3 border-b border-gray-200">
            <div className="w-9 h-9 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
              </svg>
            </div>
            <div>
              <h3 className="font-heading text-2xl sm:text-3xl font-bold text-accent-secondary">Browse by Country</h3>
              <p className="text-xs sm:text-sm text-text-muted mt-0.5">Explore verified hotels with private bathtubs and jacuzzis across top travel destinations</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {countryHubList.map(country => (
              <Link
                key={country.slug}
                href={`/${country.slug}`}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-accent-secondary hover:text-white border border-gray-200 hover:border-accent-secondary rounded-xl text-xs sm:text-sm font-bold text-accent-secondary transition-all group shadow-2xs hover:shadow-sm"
              >
                <span>{country.name}</span>
                <span className="text-2xs text-text-muted group-hover:text-white/80 font-normal">
                  ({country.hotelCount})
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Hotels by Region Explorer - Easy-to-Scan Regional Groupings */}
        <section className="mb-20 pb-12 border-b border-border">
          <div className="flex items-center justify-between mb-8 pb-3 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-accent-secondary/10 text-accent-secondary flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-heading text-2xl sm:text-3xl font-bold text-accent-secondary">Browse Hotels by Region</h3>
                <p className="text-xs sm:text-sm text-text-muted mt-0.5">Quickly jump to verified stays grouped by geographic travel zones</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-6 sm:space-y-8">
            {Object.entries(regionGroups).filter(([_, cities]) => cities.length > 0).map(([region, cities]) => (
              <div key={region} className="bg-white p-4 sm:p-6 rounded-2xl border border-border shadow-2xs">
                <h4 className="font-heading font-bold text-accent-secondary text-base mb-3 sm:mb-4 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-accent"></span>
                  <span>{region}</span>
                  <span className="text-xs text-text-muted font-sans font-normal ml-auto">
                    {cities.length} {cities.length === 1 ? 'Destination' : 'Destinations'}
                  </span>
                </h4>
                <div className="flex flex-wrap gap-2 sm:gap-2.5">
                  {cities.sort((a, b) => a.city.localeCompare(b.city)).map(loc => {
                    const countrySlug = resolveCountry(loc.country).slug;
                    const citySlug = slugify(loc.city);
                    return (
                      <Link
                        key={`${countrySlug}-${citySlug}`}
                        href={`/${countrySlug}/${citySlug}`}
                        className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-gray-50 hover:bg-accent-secondary hover:text-white border border-gray-200 hover:border-accent-secondary rounded-xl text-xs sm:text-sm font-semibold text-text-main transition-all group shadow-2xs hover:shadow-sm"
                      >
                        <span>{loc.city}</span>
                        <span className="text-2xs text-text-muted group-hover:text-white/80 font-normal">
                          ({loc.hotelCount})
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="mb-16 pb-12 border-b border-border scroll-mt-24">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
              </svg>
            </div>
            <h3 className="font-heading text-2xl font-bold text-accent-secondary">Frequently Asked Questions</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-xl border border-border">
              <h4 className="font-bold text-text-main mb-2 text-sm">How do you verify hotel bathtubs?</h4>
              <p className="text-xs text-text-muted leading-relaxed">
                We independently inspect room specifications across MakeMyTrip, Agoda, and Booking.com. Only hotels confirming in-room tubs or jacuzzis across all three platforms are featured.
              </p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-border">
              <h4 className="font-bold text-text-main mb-2 text-sm">Are bathtubs guaranteed in every room?</h4>
              <p className="text-xs text-text-muted leading-relaxed">
                Yes! We only list properties where private in-room bathtubs or jacuzzis are explicitly documented room amenities, eliminating misleading shower-only photos.
              </p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-border">
              <h4 className="font-bold text-text-main mb-2 text-sm">Which destinations do you cover?</h4>
              <p className="text-xs text-text-muted leading-relaxed">
                We curate 60+ romantic destinations across India, Southeast Asia, the Middle East, Europe, and the US, including Manali, Goa, Udaipur, Dubai, London, and Bali.
              </p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-border">
              <h4 className="font-bold text-text-main mb-2 text-sm">How do bookings work?</h4>
              <p className="text-xs text-text-muted leading-relaxed">
                We provide direct links to verified online travel agencies (MakeMyTrip, Agoda, and Booking.com) so you can compare live rates and book directly with the provider.
              </p>
            </div>
          </div>
        </section>

        {/* What Makes Us Different - Differentiator Tiles (2x2 on mobile, 4-col on md) */}
        <section className="mb-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
            <div className="bg-white p-3.5 sm:p-5 rounded-xl border border-border shadow-2xs">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2.5 sm:mb-3">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="font-bold text-text-main text-xs sm:text-sm mb-1 sm:mb-1.5">Triple Verified</h4>
              <p className="text-2xs sm:text-xs text-text-muted">Cross-checked across 3 major platforms</p>
            </div>
            <div className="bg-white p-3.5 sm:p-5 rounded-xl border border-border shadow-2xs">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center mb-2.5 sm:mb-3">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
              </div>
              <h4 className="font-bold text-text-main text-xs sm:text-sm mb-1 sm:mb-1.5">Guaranteed Tubs</h4>
              <p className="text-2xs sm:text-xs text-text-muted">Confirmed in-room hot tubs &amp; jacuzzis</p>
            </div>
            <div className="bg-white p-3.5 sm:p-5 rounded-xl border border-border shadow-2xs">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2.5 sm:mb-3">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
              </div>
              <h4 className="font-bold text-text-main text-xs sm:text-sm mb-1 sm:mb-1.5">Direct Booking</h4>
              <p className="text-2xs sm:text-xs text-text-muted">Direct links to official travel partners</p>
            </div>
            <div className="bg-white p-3.5 sm:p-5 rounded-xl border border-border shadow-2xs">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-2.5 sm:mb-3">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
              </div>
              <h4 className="font-bold text-text-main text-xs sm:text-sm mb-1 sm:mb-1.5">Curated Stays</h4>
              <p className="text-2xs sm:text-xs text-text-muted">Handpicked luxury romantic escapes</p>
            </div>
          </div>
        </section>

        {/* High-Converting Bottom Return-to-Destinations Action Banner */}
        <section className="my-10 sm:my-14 bg-gradient-to-r from-accent-secondary via-[#002b66] to-[#0f4a7c] text-white rounded-2xl sm:rounded-3xl p-6 sm:p-12 text-center shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-xs text-white text-xs font-bold rounded-full uppercase tracking-wider inline-block mb-3">
              Start Your Romantic Escape
            </span>
            <h3 className="font-heading text-xl sm:text-3xl md:text-4xl font-extrabold mb-2 sm:mb-3 leading-tight">
              Ready to Book Your Luxury Bathtub Stay?
            </h3>
            <p className="text-white/85 text-xs sm:text-base mb-6 sm:mb-8 max-w-xl mx-auto">
              Explore our full directory of verified hotels with private bathtubs and jacuzzis across India and global destinations.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4">
              <a
                href="/#destinations"
                className="bg-accent hover:bg-accent-hover text-white px-6 sm:px-8 py-3.5 rounded-xl font-bold text-sm sm:text-base transition-all shadow-md hover:shadow-lg inline-flex items-center justify-center gap-2"
              >
                <span>Browse All Destinations</span>
                <span>&uarr;</span>
              </a>
              <Link
                href="/blog"
                className="bg-white/10 hover:bg-white/20 text-white border border-white/30 px-5 sm:px-6 py-3.5 rounded-xl font-bold text-sm sm:text-base transition-all backdrop-blur-xs inline-flex items-center justify-center"
              >
                Read Travel Inspiration &rarr;
              </Link>
            </div>
          </div>
        </section>

        {/* Footer Bottom Links & Brand */}
        <div className="pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-6">
            <div className="flex items-start gap-4">
              <Logo className="w-12 h-10 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-heading text-lg font-bold text-accent-secondary mb-1">Hotels with Bathtubs</h4>
                <p className="text-xs text-text-muted max-w-sm leading-relaxed">
                  Discover premium hotels with private bathtubs and jacuzzis. Triple-verified across MakeMyTrip, Agoda &amp; Booking.com for romantic getaways.
                </p>
              </div>
            </div>
            <div className="text-left md:text-right">
              <p className="text-xs text-text-muted font-medium mb-3">&copy; 2026 HotelsWithBathtubs.com</p>
              <div className="flex gap-4 flex-wrap justify-start md:justify-end text-xs">
                <Link href="/blog" className="text-text-muted hover:text-accent font-medium transition-colors">Travel Blog</Link>
                <Link href="/about" className="text-text-muted hover:text-accent font-medium transition-colors">About Us</Link>
                <Link href="/affiliate-policy" className="text-text-muted hover:text-accent font-medium transition-colors">Affiliate Policy</Link>
                <Link href="/privacy" className="text-text-muted hover:text-accent font-medium transition-colors">Privacy</Link>
                <Link href="/terms" className="text-text-muted hover:text-accent font-medium transition-colors">Terms</Link>
                <Link href="/cookies" className="text-text-muted hover:text-accent font-medium transition-colors">Cookies</Link>
              </div>
            </div>
          </div>
          <p className="text-center text-xs text-text-muted/70 pt-4 border-t border-border">
            All rights reserved. Hotels with Bathtubs is an independent travel guide connecting you to luxury hotels with verified amenities worldwide.
          </p>
        </div>
      </div>
    </footer>
  );
}
