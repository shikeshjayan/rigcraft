import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import { allItems } from '../data/items';

const ActiveDeals = () => {
  const deals = allItems.slice(20, 25);

  return (
    <section className="w-full py-16 border-t border-[#E2E8F0]" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
      <div className="max-w-[1500px] mx-auto px-4 lg:px-8">
        
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-[24px] md:text-[32px] font-extrabold text-[#0F172A] tracking-tight uppercase">
              Active Deals
            </h2>
            <div className="w-16 h-1 bg-[#0052FF] mt-2"></div>
          </div>
          <Link to="/deals/active" className="text-[12px] font-bold text-[#0F172A] border border-[#CBD5E1] py-2 px-6 rounded-sm hover:border-[#0F172A] transition-colors uppercase tracking-wide cursor-pointer bg-white text-center">
            VIEW ALL
          </Link>
        </div>
        
        {/* 5 Columns Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4">
          {deals.map((product) => (
            <div key={product.id} className="transform scale-[0.95] origin-top">
              <Card {...product} />
            </div>
          ))}
        </div>
        
      </div>
    </section>
  );
};

export default ActiveDeals;
