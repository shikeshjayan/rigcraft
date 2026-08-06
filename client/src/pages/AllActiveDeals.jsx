import React, { useEffect } from 'react';
import Card from '../components/Card';
import { allItems } from '../data/items';
import FadeUp from '../components/FadeUp';
import Breadcrumb from '../components/Breadcrumb';

const AllActiveDeals = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const deals = allItems.slice(0, 30); // Show 30 deals

  return (
    <FadeUp delay={0.1}>
    <div className="w-full py-12 min-h-screen" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
      <div className="max-w-[1500px] mx-auto px-4 lg:px-8">
        <Breadcrumb items={[{ label: 'Home', path: '/' }, { label: 'Active Deals' }]} />
        <h1 className="text-[32px] font-extrabold text-[var(--color-text)] mb-8 uppercase">All Active Deals</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {deals.map(product => (
            <div key={product.id} className="transform scale-[0.95] origin-top">
              <Card {...product} />
            </div>
          ))}
        </div>
      </div>
    </div>
    </FadeUp>
  );
};

export default AllActiveDeals;
