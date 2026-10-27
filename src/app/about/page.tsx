import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about Hotels With Bathtubs, how we check room listings, and our commitment to helping travelers find private in-room bathtubs & jacuzzi suites.',
  alternates: {
    canonical: '/about',
  },
};

export default function AboutUs() {
  return (
    <div className="bg-bg-main py-6 sm:py-12 md:py-20 min-h-[80vh]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-12 bg-white sm:rounded-2xl md:rounded-3xl shadow-sm border-y sm:border border-border pb-12 pt-6 sm:pb-16 sm:pt-10">
        <header className="mb-8 sm:mb-10 border-b border-border pb-6 sm:pb-8 text-center">
          <h1 className="font-heading text-2xl sm:text-3xl md:text-5xl font-extrabold text-accent-secondary leading-tight mb-3 sm:mb-4">
            About Hotels With Bathtubs
          </h1>
          <p className="text-text-muted text-sm sm:text-base md:text-lg max-w-2xl mx-auto">
            Your independent guide to discovering hotels with private in-room bathtubs &amp; jacuzzi suites worldwide.
          </p>
        </header>

        <div className="prose prose-lg max-w-none prose-headings:font-heading prose-headings:text-accent-secondary prose-p:text-text-main">
          <p>
            Welcome to <strong>HotelsWithBathtubs.com</strong>, the premier independent directory dedicated exclusively to couples, honeymooners, and leisure travelers seeking accommodations with private in-room bathtubs, deep soaking tubs, and jacuzzi suites across over 100 destinations in India, North America, Europe, Southeast Asia, and the Middle East.
          </p>
          
          <h2>Our Mission</h2>
          <p>
            Planning a romantic anniversary, a honeymoon, or a relaxing weekend staycation should be joyful and stress-free. Yet finding a hotel room that features a private in-room bathtub is one of the most frustrating challenges in travel booking. Too often, online travel agencies show photos of bathtubs that turn out to be located in shared spa facilities or only exist in ultra-exclusive penthouse suites, leaving guests with a standard standing shower upon arrival.
          </p>
          <p>
            Our mission is simple: eliminate that uncertainty. We do the research and partner-listing checks so you can book with confidence.
          </p>

          <h2>How We Check Rooms</h2>
          <p>
            To curate our directory, we check rooms using booking partner listings:
          </p>
          <ul>
            <li><strong>Room Specification Checks:</strong> We cross-reference guest room listings across major reservation channels including Booking.com, Expedia, Agoda, and direct hotel property systems to confirm the bathtub is inside the guest room or private suite, not in a shared public spa.</li>
            <li><strong>Specific Room Tier Identification:</strong> We identify the exact room category name (such as &ldquo;Executive Suite with Bathtub&rdquo; or &ldquo;Deluxe Jacuzzi Room&rdquo;) and provide direct booking guidance so guests don&rsquo;t accidentally select base-tier rooms with standing showers.</li>
            <li><strong>Regular Link &amp; Inventory Updates:</strong> Hotel room configurations change over time. Our automated and manual checks monitor booking link integrity and amenity details on a regular basis.</li>
          </ul>

          <h2>Editorial Independence &amp; Integrity</h2>
          <p>
            Hotels cannot pay to be listed or favorably ranked on Hotels With Bathtubs. While we participate in affiliate programs with major OTAs (Booking.com, Expedia, Agoda, Trip.com) to maintain our research platform free for readers, our editorial rankings remain editorially independent.
          </p>

          <h2>Contact &amp; Editorial Feedback</h2>
          <p>
            Spotted an amenity change or have a question about a stay? We welcome feedback from fellow travelers and hotel managers. Reach our editorial team directly at{' '}
            <a href="mailto:editorial@hotelswithbathtubs.com" className="text-accent hover:underline font-semibold">
              editorial@hotelswithbathtubs.com
            </a>.
          </p>
        </div>
      </div>
    </div>
  );
}
