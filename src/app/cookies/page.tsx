import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'Learn how Hotels With Bathtubs uses cookies and web technologies to improve your experience and support affiliate link functionality.',
  alternates: {
    canonical: '/cookies',
  },
};

export default function CookiePolicy() {
  return (
    <div className="bg-bg-main py-12 md:py-20 min-h-[80vh]">
      <main className="max-w-4xl mx-auto px-6 md:px-12 bg-white md:rounded-3xl shadow-sm border border-border pb-16 pt-10">
        <header className="mb-10 border-b border-border pb-8">
          <h1 className="font-heading text-3xl md:text-5xl font-extrabold text-accent-secondary leading-tight mb-4">
            Cookie Policy
          </h1>
          <p className="text-text-muted">Last updated: August 2026</p>
        </header>

        <div className="prose prose-lg max-w-none prose-headings:font-heading prose-headings:text-accent-secondary prose-p:text-text-main">
          <p>
            HotelsWithBathtubs.com uses cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. By navigating our website, you consent to our use of cookies.
          </p>
          
          <h2>What Are Cookies?</h2>
          <p>
            Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and provide valuable information to website owners.
          </p>
          
          <h2>How We Use Cookies</h2>
          <p>
            We use cookies to understand how you interact with our website, to remember your preferences, and to track affiliate links when you click through to our partner booking platforms (like MakeMyTrip, Agoda, or Booking.com).
          </p>
        </div>
      </main>
    </div>
  );
}
