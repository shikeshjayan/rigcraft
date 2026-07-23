import { useState, useEffect } from 'react';
import Card from '../components/Card';

import { allItems } from '../data/items';

const HeroDeals = () => {
  // Initialize timer for 3 days from now (in seconds)
  const [timeLeft, setTimeLeft] = useState(3 * 24 * 60 * 60);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const days = Math.floor(timeLeft / (24 * 60 * 60));
  const hours = Math.floor((timeLeft % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((timeLeft % (60 * 60)) / 60);
  const seconds = timeLeft % 60;

  const formatNumber = (num) => String(num).padStart(2, '0');

  return (
    <section className="w-full py-16" style={{ backgroundColor: 'var(--color-bg-secondary, #ffffff)' }}>
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10">
          <div>
            <h2 className="text-[32px] md:text-[40px] font-extrabold text-[#111111] uppercase tracking-wide">
              Hot <span style={{ color: 'var(--color-primary)' }}>Deals</span>
            </h2>
            <p className="text-[#6B7280] mt-2 text-[16px] font-[500]">
              Don't miss out on these limited time offers for top tier components.
            </p>
          </div>
          <a href="#" className="font-[600] text-[16px] flex items-center gap-1 mt-4 md:mt-0 transition-transform hover:translate-x-1" style={{ color: 'var(--color-primary, #06B6D4)' }}>
            View All Deals
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
        
        {/* Grid Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {allItems.slice(100, 104).map((deal) => (
            <Card 
              key={deal.id}
              id={deal.id}
              image={deal.image}
              title={deal.title}
              specs={deal.specs}
              description={deal.description}
              price={deal.price}
              mrp={deal.mrp}
              discount={deal.discount}
              tag="-20%"
              tagColor="#E11D48"
            />
          ))}
        </div>

      </div>
    </section>
  );
};

export default HeroDeals;
