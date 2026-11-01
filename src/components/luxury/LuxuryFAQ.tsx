import React from 'react';

export const FAQS = [
  {
    q: 'How do you know a hotel has a bathtub?',
    a: 'We look up room details on Booking.com and Agoda. A room gets a green tick when a booking site lists a tub. Other hotels stay on the site labelled not yet confirmed. We never delete a hotel for missing proof.',
  },
  {
    q: 'What is the difference between a bathtub and a jetted tub?',
    a: 'A bathtub is a normal tub to soak in. A jetted tub is a bathtub with powered water jets for massage. A hot tub is a heated tub with water jets. We state the tub type for each room on our site.',
  },
  {
    q: 'Does every room at a listed hotel have a bathtub?',
    a: 'No. Many hotels only have tubs in specific rooms. Standard rooms often have a shower only. We list the exact room name where a tub was found. Check the room name on the booking site before you book.',
  },
  {
    q: 'What counts as proof that a room has a tub?',
    a: 'Proof comes from booking site room details. Words like bathtub, soaking tub, whirlpool, or jacuzzi in the room name count as proof. A booking site label for bathtub or hot tub also counts. General labels like "bath or shower" do not count.',
  },
  {
    q: 'What does "not yet confirmed" mean?',
    a: 'It means our listing names a room with a tub, but no booking site shows the tub for that room yet. The hotel stays on our site so you can check it yourself. We keep checking booking sites and update the label when we find proof.',
  },
  {
    q: 'Can I book a hotel directly through HotelsWithBathtubs?',
    a: 'No. We are an independent guide and do not take bookings. We provide links to booking sites where you can reserve the room. Always review the room details on the booking site before paying.',
  },
];

export default function LuxuryFAQ() {
  return (
    <section id="faq" aria-label="Frequently Asked Questions" className="bg-[#f5f6f8] py-8 sm:py-12 border-t border-[#e3e7ef]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-6 sm:mb-8">
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
