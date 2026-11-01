import React from 'react';

const FAQS = [
  {
    q: 'How do I find a hotel with a private bathtub in room?',
    a: 'Use the destination search or browse our city collections. We list rooms whose partner or rental listing mentions a private bathtub, soaking tub, hot tub or jacuzzi.',
  },
  {
    q: 'What is the difference between a soaking bathtub and a jacuzzi suite?',
    a: 'A soaking bathtub features a deep freestanding marble, stone, or clawfoot bath designed for still, immersive hot baths. A jacuzzi suite includes a hydrotherapy tub equipped with powered massage jets and temperature controls.',
  },
  {
    q: 'What bathtub types are most common across hotels in India?',
    a: 'In India, heritage palaces and modern resorts feature distinct architectural bath typologies: hand-carved sunken Makrana marble baths in Rajasthan, private terrace jacuzzis in Goa, vintage Victorian clawfoot tubs in colonial hill stations like Shimla, and open-air granite stone baths in Kerala backwaters.',
  },
  {
    q: 'Are hotel rooms with private bathtubs more expensive?',
    a: 'Not always. While presidential suites and monument-view villas command higher rates, many boutique and heritage hotels feature bathtubs in standard and executive category rooms. Starting rates range from ₹4,500/night in India and $150/night internationally.',
  },
];

export default function LuxuryFAQ() {
  return (
    <section id="faq" aria-label="Frequently Asked Questions" className="bg-[#f5f6f8] py-12 sm:py-16 border-t border-[#e3e7ef]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-10">
          <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#b08d57] mb-1.5 font-manrope">
            Common Questions
          </p>
          <h2 className="font-playfair text-2xl sm:text-3xl text-[#14213d] font-semibold tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {FAQS.map(({ q, a }) => (
            <details
              key={q}
              className="group border border-[#e3e7ef] rounded-[14px] bg-white shadow-2xs overflow-hidden transition-all duration-200"
            >
              <summary className="flex items-center justify-between gap-4 p-4 sm:p-5 cursor-pointer font-playfair text-base sm:text-lg text-[#14213d] font-semibold list-none hover:bg-[#f5f6f8]/60 transition-colors">
                <span>{q}</span>
                <span className="w-6 h-6 flex-shrink-0 flex items-center justify-center rounded-full bg-[#e9eef7] text-[#14213d] text-xs transition-transform duration-200 group-open:rotate-180">
                  ↓
                </span>
              </summary>
              <p className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-[#5b6478] leading-relaxed border-t border-[#e3e7ef] pt-3.5 font-manrope">
                {a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
