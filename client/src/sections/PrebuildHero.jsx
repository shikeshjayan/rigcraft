import React from 'react';

const PrebuildHero = () => {
  return (
    <section className="w-full py-16 md:py-24" style={{ backgroundColor: 'var(--color-bg-primary, #ffffff)' }}>
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8 text-center flex flex-col items-center">
        
        {/* Category Tag */}
        <p className="text-[13px] md:text-[14px] font-[800] uppercase tracking-[0.2em] mb-4 text-[#38BDF8]">
          READY-BUILT SYSTEMS
        </p>

        {/* Main Heading */}
        <h1 className="font-extrabold leading-[1.15] text-[#111111] text-[28px] md:text-[42px] mb-6">
          Ready To Play.<br />
          Ready To Win.
        </h1>

        {/* Assurance Subtitle */}
        <p className="font-medium max-w-[600px] text-[#6B7280] text-[15px] leading-relaxed">
          Expert-assembled, stress-tested, and shipped with a 3-year warranty
        </p>

      </div>
    </section>
  );
};

export default PrebuildHero;
