'use client';

import { useGeo } from '@/lib/useGeo';
import { tubWord } from '@/lib/tubWords';

export default function HomeTubTypesGuide() {
  const { geo } = useGeo();
  const country = geo.countryCode;

  const bathtubWord = tubWord('bathtub', country);
  const jettedWord = tubWord('jetted', country);
  const hotTubWord = tubWord('hot', country);

  const bathLower = bathtubWord.toLowerCase();
  const jettedLower = jettedWord.toLowerCase();
  const hotLower = hotTubWord.toLowerCase();

  return (
    <section className="max-w-[1200px] mx-auto px-4 sm:px-8 py-6 sm:py-8 mb-4 sm:mb-6">
      <h2 className="font-playfair text-[24px] sm:text-[26px] md:text-[34px] font-semibold text-[#14213d] mb-1">
        Tub types
      </h2>
      <div className="text-[13px] text-[#5b6478] mb-4 sm:mb-6">
        The three styles of tubs you will find in our listings
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white border border-[#e3e7ef] rounded-[16px] p-5 shadow-xs">
          <span className="text-2xl mb-2 block">🛁</span>
          <h3 className="font-playfair font-semibold text-[#14213d] text-base mb-1">
            {bathtubWord}
          </h3>
          <p className="text-xs sm:text-[13px] text-[#5b6478] leading-relaxed font-manrope">
            A {bathLower} is a normal tub to soak in.
          </p>
        </div>
        <div className="bg-white border border-[#e3e7ef] rounded-[16px] p-5 shadow-xs">
          <span className="text-2xl mb-2 block">🫧</span>
          <h3 className="font-playfair font-semibold text-[#14213d] text-base mb-1">
            {jettedWord}
          </h3>
          <p className="text-xs sm:text-[13px] text-[#5b6478] leading-relaxed font-manrope">
            A {jettedLower} is a {bathLower} with powered water jets for massage.
          </p>
        </div>
        <div className="bg-white border border-[#e3e7ef] rounded-[16px] p-5 shadow-xs">
          <span className="text-2xl mb-2 block">♨️</span>
          <h3 className="font-playfair font-semibold text-[#14213d] text-base mb-1">
            {hotTubWord}
          </h3>
          <p className="text-xs sm:text-[13px] text-[#5b6478] leading-relaxed font-manrope">
            A {hotLower} is a heated tub with water jets.
          </p>
        </div>
      </div>
    </section>
  );
}
