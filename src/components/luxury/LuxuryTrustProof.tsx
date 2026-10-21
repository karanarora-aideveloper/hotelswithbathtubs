import React from 'react';

export default function LuxuryTrustProof() {
  return (
    <section className="border-y border-[#E5E1D8] bg-[#FAF8F5] py-8 sm:py-10 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 md:gap-12">
        <div className="max-w-xl text-center md:text-left">
          <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#C5A880] mb-1.5">
            Verified In-Room Luxury
          </p>
          <p className="font-playfair text-lg sm:text-xl text-[#121518] leading-snug">
            Every hotel is verified across Booking.com, Agoda, and MakeMyTrip to guarantee the bathtub is private inside your room.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-6 sm:gap-10 border-t md:border-t-0 md:border-l border-[#E5E1D8] pt-6 md:pt-0 md:pl-12 w-full md:w-auto text-center md:text-left">
          <div>
            <span className="block font-playfair text-2xl sm:text-3xl text-[#121518] font-medium">60+</span>
            <span className="text-[11px] font-medium tracking-wider uppercase text-[#6B6964]">Global Cities</span>
          </div>
          <div>
            <span className="block font-playfair text-2xl sm:text-3xl text-[#121518] font-medium">100%</span>
            <span className="text-[11px] font-medium tracking-wider uppercase text-[#6B6964]">In-Room Guarantee</span>
          </div>
          <div>
            <span className="block font-playfair text-2xl sm:text-3xl text-[#121518] font-medium">0</span>
            <span className="text-[11px] font-medium tracking-wider uppercase text-[#6B6964]">Shared Facilities</span>
          </div>
        </div>
      </div>
    </section>
  );
}
