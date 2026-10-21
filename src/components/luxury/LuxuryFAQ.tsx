import React from 'react';

const FAQS = [
  {
    q: 'How do I find a hotel with a private bathtub in room?',
    a: 'Use the destination search or browse our curated city collections. Every hotel listed on Hotels with Bathtubs is triple-verified across Booking.com, Agoda, and MakeMyTrip to guarantee the bathtub or jacuzzi is private inside your room, never in a shared spa or wellness floor.',
  },
  {
    q: 'What is the difference between a soaking bathtub and a jacuzzi suite?',
    a: 'A soaking bathtub features a deep freestanding marble, stone, or clawfoot bath designed for still, immersive hot baths. A jacuzzi suite includes a hydrotherapy tub equipped with powered massage jets and temperature controls. Both are fully private to your room.',
  },
  {
    q: 'What bathtub types are most common across luxury hotels in India?',
    a: 'In India, luxury heritage palaces and modern resorts feature distinct architectural bath typologies: hand-carved sunken Makrana marble baths in Rajasthan (often with Taj Mahal or Lake Pichola views), private terrace jacuzzis in Goa, vintage Victorian clawfoot tubs in colonial hill stations like Shimla, and open-air granite stone baths in Kerala backwaters.',
  },
  {
    q: 'Are hotel rooms with private bathtubs more expensive?',
    a: 'Not always. While presidential suites and monument-view villas command premium rates, many five-star and boutique hotels feature bathtubs in standard and executive category rooms. Starting rates range from ₹4,500/night in India and $150/night internationally.',
  },
];

export default function LuxuryFAQ() {
  return (
    <section id="faq" aria-label="Frequently Asked Questions" className="bg-[#FAF8F5] py-16 sm:py-24 border-t border-[#E5E1D8]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <p className="text-[11px] font-semibold tracking-[0.25em] uppercase text-[#C5A880] mb-2">
            Essential Inquiries
          </p>
          <h2 className="font-playfair text-3xl sm:text-4xl text-[#121518] font-normal tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {FAQS.map(({ q, a }) => (
            <details
              key={q}
              className="group border border-[#E5E1D8] rounded-2xl bg-white shadow-2xs overflow-hidden transition-all duration-200 hover:border-[#C5A880]/50"
            >
              <summary className="flex items-center justify-between gap-4 p-5 sm:p-6 cursor-pointer font-playfair text-base sm:text-lg text-[#121518] list-none hover:bg-[#FAF8F5]/80 transition-colors">
                <span>{q}</span>
                <span className="w-6 h-6 flex-shrink-0 flex items-center justify-center rounded-full bg-[#F5F2EC] text-[#121518] text-xs transition-transform duration-200 group-open:rotate-180">
                  ↓
                </span>
              </summary>
              <p className="px-5 sm:px-6 pb-6 text-sm text-[#6B6964] leading-relaxed border-t border-[#E5E1D8]/60 pt-4 font-sans">
                {a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
