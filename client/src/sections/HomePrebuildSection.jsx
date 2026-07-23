import React from 'react';
import Card from '../components/Card';
import { allItems } from '../data/items';

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
          {allItems.slice(0, 8).map((pc) => (
            <Card 
              key={pc.id}
              id={pc.id}
              image={pc.image}
              title={pc.title}
              specs={pc.specs}
              description={pc.description}
              price={pc.price}
              mrp={pc.mrp}
              discount={pc.discount}
              tag={pc.tag}
              tagColor={pc.tagColor}
            />
          ))}
        </div>

      </div>
    </section>
  );
};

export default HomePrebuildSection;
