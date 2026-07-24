import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import { allItems } from '../data/items';

const BundleDeals = () => {
  const bundles = allItems.slice(38, 42).map(item => ({...item, title: item.title + ' + Intel Core i7 Combo', brand: 'Combo Deal'}));

  return (
    <section className="w-full py-16 border-t border-[#E2E8F0]" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <div className="max-w-[1500px] mx-auto px-4 lg:px-8">
        
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-[24px] md:text-[32px] font-extrabold text-[#0F172A] tracking-tight uppercase">
              Bundle Deals
            </h2>
            <div className="w-16 h-1 bg-[#0052FF] mt-2"></div>
          </div>
          <Link to="/deals/bundles" className="text-[12px] font-bold text-[#0F172A] border border-[#CBD5E1] py-2 px-6 rounded-sm hover:border-[#0F172A] transition-colors uppercase tracking-wide cursor-pointer bg-white text-center">
            VIEW BUNDLES
          </Link>
        </div>
        
        {/* 4 Columns Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {bundles.map((product) => (
            <div key={product.id}>
              <Card {...product} />
            </div>
          ))}
        </div>
        
      </div>
    </section>
  );
};

export default BundleDeals;
