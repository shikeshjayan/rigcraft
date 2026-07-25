import React, { useEffect } from 'react';
import Card from '../components/Card';
import { allItems } from '../data/items';
import FadeUp from '../components/FadeUp';

const AllBundleDeals = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Modify some items to simulate bundles
  const bundles = allItems.slice(30, 50).map(item => ({...item, title: item.title + ' + Intel Core i7 Combo', brand: 'Combo Deal'})); 

  return (
    <FadeUp delay={0.1}>
    <div className="w-full py-12 min-h-screen" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <div className="max-w-[1500px] mx-auto px-4 lg:px-8">
        <h1 className="text-[32px] font-extrabold text-[#0F172A] mb-8 uppercase">All Bundle Deals</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {bundles.map(product => (
            <Card key={product.id} {...product} />
          ))}
        </div>
      </div>
    </div>
    </FadeUp>
  );
};

export default AllBundleDeals;
