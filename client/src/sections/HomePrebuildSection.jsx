import React from 'react';

// Using standard paths for the images assuming they are in the public directory or will be resolved.
// For missing images, we use an icon placeholder as requested.
const placeholderIcon = (
  <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const prebuiltPCs = [
  {
    id: 1,
    tag: 'BESTSELLER',
    tagColor: '#2563EB', // Primary Blue
    image: '/PC1.png',
    title: 'High End Beast',
    specs: 'Intel i9-14900K | RTX 4090 | 32GB DDR5 | 1TB NVMe SSD',
    price: '₹3,49,999'
  },
  {
    id: 2,
    tag: 'GAMING',
    tagColor: '#10B981', // Green
    image: '/PC2.png',
    title: 'Gaming Elite',
    specs: 'AMD Ryzen 7 7800X3D | RTX 4070 SUPER | 32GB DDR5 | 1TB NVMe',
    price: '₹1,79,999'
  },
  {
    id: 3,
    tag: 'POPULAR',
    tagColor: '#8B5CF6', // Purple
    image: '/PC3.png',
    title: 'Performance Pro',
    specs: 'Intel i7-14700K | RTX 4060 Ti | 16GB DDR5 | 1TB NVMe SSD',
    price: '₹1,29,999'
  },
  {
    id: 4,
    tag: 'VALUE',
    tagColor: '#F97316', // Orange
    image: null,
    title: 'Starter Gaming',
    specs: 'AMD Ryzen 5 5600 | RTX 4060 | 16GB DDR4 | 512GB NVMe SSD',
    price: '₹89,999'
  },
  {
    id: 5,
    tag: 'STREAMING',
    tagColor: '#EC4899', // Pink
    image: null,
    title: 'Creator Plus',
    specs: 'Intel i5-13600K | RTX 4060 | 32GB DDR5 | 1TB NVMe',
    price: '₹1,15,999'
  },
  {
    id: 6,
    tag: 'PRO',
    tagColor: '#3B82F6', 
    image: null,
    title: 'Workstation Alpha',
    specs: 'AMD Ryzen 9 7950X | RTX 4080 | 64GB DDR5 | 2TB NVMe',
    price: '₹2,59,999'
  },
  {
    id: 7,
    tag: 'ESPORTS',
    tagColor: '#14B8A6',
    image: null,
    title: 'Competitive Edge',
    specs: 'Intel i5-14400F | RTX 4060 Ti | 16GB DDR5 | 1TB NVMe',
    price: '₹95,999'
  },
  {
    id: 8,
    tag: 'ULTIMATE',
    tagColor: '#EF4444',
    image: null,
    title: 'Dream Machine',
    specs: 'Intel i9-14900KS | RTX 4090 | 64GB DDR5 | 4TB NVMe SSD',
    price: '₹4,19,999'
  },
  {
    id: 9,
    tag: 'BUDGET',
    tagColor: '#84CC16',
    image: null,
    title: 'Casual Gamer',
    specs: 'Intel i3-12100F | GTX 1650 | 16GB DDR4 | 512GB SSD',
    price: '₹45,999'
  },
  {
    id: 10,
    tag: 'EDITING',
    tagColor: '#6366F1',
    image: null,
    title: 'Video Editor Pro',
    specs: 'AMD Ryzen 9 5900X | RTX 3060 | 64GB DDR4 | 2TB NVMe',
    price: '₹1,35,999'
  },
  {
    id: 11,
    tag: 'COMPACT',
    tagColor: '#F59E0B',
    image: null,
    title: 'Mini ITX Build',
    specs: 'Intel i7-13700K | RTX 4070 | 32GB DDR5 | 1TB NVMe',
    price: '₹1,65,999'
  },
  {
    id: 12,
    tag: 'NEW',
    tagColor: '#06B6D4',
    image: null,
    title: 'Next Gen Entry',
    specs: 'AMD Ryzen 5 7600 | RX 7600 | 16GB DDR5 | 1TB NVMe',
    price: '₹84,999'
  }
];

const HomePrebuildSection = () => {
  return (
    <section className="w-full py-16" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
        
        {/* Header Section (Same design as HomeCategory) */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10">
          <div>
            <h2 className="text-[32px] md:text-[40px] font-extrabold text-[#111111] uppercase tracking-wide">
              Prebuilt <span style={{ color: 'var(--color-primary)' }}>PCs</span>
            </h2>
            <p className="text-[#6B7280] mt-2 text-[16px] font-[500]">
              Discover our range of high-performance prebuilt gaming and workstation PCs.
            </p>
          </div>
          <a href="#" className="font-[600] text-[16px] flex items-center gap-1 mt-4 md:mt-0 transition-transform hover:translate-x-1" style={{ color: 'var(--color-primary)' }}>
            View All Prebuilt PCs
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
        
        {/* Grid Section (4 columns, 2 rows) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {prebuiltPCs.slice(0, 8).map((pc) => (
            <div 
              key={pc.id} 
              className="flex flex-col rounded-[var(--radius-sm)] border border-[#E5E7EB] shadow-xl hover:shadow-[0_12px_30px_rgb(0,0,0,0.12)] hover:-translate-y-2 hover:border-[var(--color-primary)] transition-all duration-300 cursor-pointer relative overflow-hidden group"
              style={{ backgroundColor: 'var(--color-bg-secondary)' }}
            >
              {/* Top Tag */}
              {pc.tag && (
                <div 
                  className="absolute top-4 left-4 px-3 py-1.5 text-[10px] font-[800] text-white uppercase tracking-wider rounded-md shadow-sm z-10"
                  style={{ backgroundColor: pc.tagColor }}
                >
                  {pc.tag}
                </div>
              )}

              {/* PC Image */}
              <div className="w-full h-[240px] overflow-hidden">
                <img 
                  src="/PC1.jpeg" 
                  alt={pc.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                />
              </div>

              {/* PC Info */}
              <div className="flex flex-col flex-grow p-6 pt-5">
                <h3 className="text-[20px] font-[800] text-[#111111] leading-tight">
                  {pc.title}
                </h3>
                <p className="text-[13px] font-[500] text-[#6B7280] mt-2 leading-relaxed h-[40px] overflow-hidden">
                  {pc.specs}
                </p>
                
                <div className="mt-5 text-[24px] font-[800] text-[#111111] tracking-tight">
                  {pc.price}
                </div>

                {/* Add to Cart / View Details Button */}
                <div className="mt-6 flex flex-row items-center gap-3">
                  <button 
                    className="flex-1 py-3 font-[700] text-[12px] xl:text-[13px] text-[var(--color-primary)] transition-all duration-300 hover:shadow-md flex items-center justify-center gap-1.5 border border-[var(--color-primary)] bg-transparent hover:bg-[var(--color-primary)] hover:text-white group"
                    style={{ borderRadius: 'var(--radius-sm)' }}
                  >
                    VIEW DETAILS
                  </button>
                  
                  <button 
                    className="flex-1 py-3 font-[700] text-[12px] xl:text-[13px] text-white transition-all duration-300 hover:shadow-lg flex items-center justify-center gap-1.5"
                    style={{ backgroundColor: 'var(--color-primary)', borderRadius: 'var(--radius-sm)' }}
                  >
                    ADD TO CART
                  </button>
                </div>
              </div>
              
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default HomePrebuildSection;
