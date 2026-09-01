import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Affiliate Policy & Disclosure',
  description: 'Read our Affiliate Policy & Disclosure. Learn how Hotels With Bathtubs works with verified OTAs like MakeMyTrip, Agoda, and Booking.com.',
  alternates: {
    canonical: '/affiliate-policy',
  },
};

export default function AffiliatePolicy() {
  return (
    <div className="bg-bg-main py-12 md:py-20 min-h-[80vh]">
      <main className="max-w-4xl mx-auto px-6 md:px-12 bg-white md:rounded-3xl shadow-sm border border-border pb-16 pt-10">
        <header className="mb-10 border-b border-border pb-8">
          <h1 className="font-heading text-3xl md:text-5xl font-extrabold text-accent-secondary leading-tight mb-4">
            Affiliate Policy & Disclosure
          </h1>
          <p className="text-text-muted">Last updated: August 2026</p>
        </header>

        <div className="prose prose-lg max-w-none prose-headings:font-heading prose-headings:text-accent-secondary prose-p:text-text-main prose-a:text-accent hover:prose-a:text-accent-hover">
          <p>
            At <strong>HotelsWithBathtubs.com</strong>, our primary goal is to help you discover the most romantic and luxurious accommodations featuring private in-room bathtubs and Jacuzzis. To keep our platform free for users, we participate in various affiliate marketing programs.
          </p>

          <h2>How We Earn</h2>
          <p>
            When you click on a hotel link on our website and make a booking, we may earn a small commission from the booking platform at absolutely <strong>no additional cost to you</strong>.
          </p>

          <h2>Our Affiliate Partners</h2>
          <p>
            We are proud to partner with some of the world's leading online travel agencies (OTAs) and booking platforms, including but not limited to:
          </p>
          <ul>
            <li><strong>MakeMyTrip (MMT)</strong></li>
            <li><strong>Agoda</strong></li>
            <li><strong>Booking.com</strong></li>
          </ul>

          <h2>Editorial Integrity</h2>
          <p>
            Please note that our participation in affiliate programs does not influence our editorial content or the hotels we choose to feature. We curate and verify hotels strictly based on their amenities, specifically ensuring they offer premium in-room bathtub experiences. We only recommend properties that meet our high standards for a romantic getaway.
          </p>

          <h2>Questions?</h2>
          <p>
            If you have any questions regarding our affiliate relationships or how our platform operates, please feel free to <Link href="#">contact us</Link>. Your trust is paramount to us, and we are committed to complete transparency.
          </p>
        </div>
      </main>
    </div>
  );
}
