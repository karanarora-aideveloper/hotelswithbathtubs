import React from 'react';

export default function LuxuryTrustProof() {
  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
      <div className="bg-white border border-[#e3e7ef] rounded-[14px] p-4 sm:p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        <h3 className="font-playfair text-[19px] font-semibold text-[#14213d] mb-3">
          How we check a bathtub
        </h3>
        <div className="space-y-2.5">
          <div className="flex items-start gap-2.5 text-[13px] text-[#5b6478] leading-relaxed">
            <b className="w-[22px] h-[22px] rounded-full bg-[#e9eef7] text-[#14213d] flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
              1
            </b>
            <span>
              We find the same hotel on Booking.com or Agoda: same name, town and street number.
            </span>
          </div>
          <div className="flex items-start gap-2.5 text-[13px] text-[#5b6478] leading-relaxed">
            <b className="w-[22px] h-[22px] rounded-full bg-[#e9eef7] text-[#14213d] flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
              2
            </b>
            <span>
              We read the room list. A tub word for a named room counts as proof.
            </span>
          </div>
          <div className="flex items-start gap-2.5 text-[13px] text-[#5b6478] leading-relaxed">
            <b className="w-[22px] h-[22px] rounded-full bg-[#e9eef7] text-[#14213d] flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
              3
            </b>
            <span>
              Proven rooms get a green tick. Others say &apos;not yet confirmed&apos;.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
