import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about Hotels With Bathtubs, our triple-verification process, and our commitment to helping travelers find guaranteed in-room bathtubs & jacuzzi suites.',
  alternates: {
    canonical: '/about',
  },
};

export default function AboutUs() {
  return (
    <div className="bg-bg-main py-12 md:py-20 min-h-[80vh]">
      <main className="max-w-4xl mx-auto px-6 md:px-12 bg-white md:rounded-3xl shadow-sm border border-border pb-16 pt-10">
        <header className="mb-10 border-b border-border pb-8 text-center">
          <h1 className="font-heading text-3xl md:text-5xl font-extrabold text-accent-secondary leading-tight mb-4">
            About Us
          </h1>
          <p className="text-text-muted text-lg max-w-2xl mx-auto">
            Your trusted guide to finding the perfect romantic getaway.
          </p>
        </header>

        <div className="prose prose-lg max-w-none prose-headings:font-heading prose-headings:text-accent-secondary prose-p:text-text-main">
          <p>
            Welcome to <strong>HotelsWithBathtubs.com</strong>, the premier directory for discovering luxury hotels and resorts featuring private, in-room bathtubs and Jacuzzis across India.
          </p>
          
          <h2>Our Mission</h2>
          <p>
            Planning a romantic anniversary, a honeymoon, or simply a weekend staycation should be stress-free. However, we realized that finding a hotel room that <em>guarantees</em> a private bathtub is surprisingly difficult. Too often, hotel listings show photos of luxury bathtubs, only for guests to arrive and find a standard shower.
          </p>
          <p>
            Our mission is to eliminate that uncertainty. We do the heavy lifting by meticulously researching and cross-verifying hotel amenities so you don't have to.
          </p>

          <h2>Our Verification Process</h2>
          <p>
            We take pride in our rigorous <strong>Triple-Verification System</strong>. Before a hotel is listed on our platform, our team checks the property across MakeMyTrip, Agoda, and Booking.com. A hotel must explicitly confirm the presence of a private bathtub or Jacuzzi across all these major platforms to be featured here.
          </p>
        </div>
      </main>
    </div>
  );
}
