import React from 'react';

export default function LuxuryTrustProof() {
  return (
    <section className="max-w-[1200px] mx-auto px-4 sm:px-8 py-6 sm:py-8">
      <h2 className="font-playfair text-[24px] sm:text-[26px] md:text-[34px] font-semibold text-[#14213d] mb-1">
        How we check a bathtub
      </h2>
      <div className="text-[13px] text-[#5b6478] mb-4 sm:mb-6 font-manrope">
        Three steps for every hotel
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-[#e3e7ef] rounded-[16px] p-5 shadow-xs">
          <b className="inline-flex w-7 h-7 rounded-full bg-[#e9eef7] text-[#14213d] items-center justify-center font-bold text-xs mb-2.5">
            1
          </b>
          <p className="m-0 text-[#5b6478] text-[14px] leading-relaxed font-manrope">
            We find the same hotel on Booking.com or Agoda: same name, town and street number.
          </p>
        </div>
        <div className="bg-white border border-[#e3e7ef] rounded-[16px] p-5 shadow-xs">
          <b className="inline-flex w-7 h-7 rounded-full bg-[#e9eef7] text-[#14213d] items-center justify-center font-bold text-xs mb-2.5">
            2
          </b>
          <p className="m-0 text-[#5b6478] text-[14px] leading-relaxed font-manrope">
            We read the room list. A tub word for a named room counts as proof.
          </p>
        </div>
        <div className="bg-white border border-[#e3e7ef] rounded-[16px] p-5 shadow-xs">
          <b className="inline-flex w-7 h-7 rounded-full bg-[#e9eef7] text-[#14213d] items-center justify-center font-bold text-xs mb-2.5">
            3
          </b>
          <p className="m-0 text-[#5b6478] text-[14px] leading-relaxed font-manrope">
            Proven rooms get a green tick. Others say &apos;not yet confirmed&apos;.
          </p>
        </div>
      </div>
    </section>
  );
}
