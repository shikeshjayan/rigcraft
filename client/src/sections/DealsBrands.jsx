import React from 'react';

const DealsBrands = () => {
  const brands = [
    "ASUS ROG", "NVIDIA", "AMD RYZEN", "INTEL", "CORSAIR", 
    "GIGABYTE", "MSI", "NZXT", "LIAN LI", "COOLER MASTER"
  ];

  return (
    <section className="w-full py-16 border-t border-[#E2E8F0] overflow-hidden" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
      <div className="flex items-center gap-16 whitespace-nowrap animate-marquee">
        {/* Render multiple sets to create a seamless infinite scrolling marquee */}
        {[...brands, ...brands, ...brands].map((brand, i) => (
          <div key={i} className="text-[32px] md:text-[48px] font-extrabold text-[#CBD5E1] tracking-widest uppercase hover:text-[#0052FF] transition-colors cursor-pointer">
            {brand}
          </div>
        ))}
      </div>
      
      {/* Inline styles for the marquee animation */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        .animate-marquee {
          animation: marquee 25s linear infinite;
        }
      `}} />
    </section>
  );
};

export default DealsBrands;
