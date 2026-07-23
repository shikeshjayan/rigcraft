import React, { useState, useEffect } from 'react';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import Card from '../components/Card';

import { allItems } from '../data/items';

const HeroToday = () => {
  // Initialize timer for 18h 43m 26s
  const [timeLeft, setTimeLeft] = useState(18 * 3600 + 43 * 60 + 26);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  const formatNumber = (num) => String(num).padStart(2, '0');

  return (
    <section className="w-full py-16" style={{ backgroundColor: 'var(--color-bg-secondary, #F3F4F6)' }}>
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
        
        {/* Header Section (Format similar to HeroDeals but with Timer on right) */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10">
          <div>
            <div className="flex items-center gap-1 mb-2 text-[#F97316]">
              <FlashOnIcon sx={{ fontSize: 18 }} />
              <span className="text-[12px] font-[800] uppercase tracking-widest">Flash Sale</span>
            </div>
            <h2 className="text-[32px] md:text-[40px] font-extrabold text-[#111111] uppercase tracking-wide">
              Today's <span style={{ color: 'var(--color-primary)' }}>Deals</span>
            </h2>
          </div>
          
          {/* Timer Section on the Right */}
          <div className="flex items-center gap-4 mt-6 md:mt-0">
            <span className="text-[14px] font-[600] text-[#6B7280]">Ends in:</span>
            <div className="flex gap-2">
              <div className="flex flex-col items-center justify-center bg-[#111827] text-white w-14 h-16 shadow-lg" style={{ borderRadius: 'var(--radius-sm, 8px)' }}>
                <span className="text-[20px] font-[800] leading-none">{formatNumber(hours)}</span>
                <span className="text-[10px] font-medium text-gray-400 mt-1">HRS</span>
              </div>
              <div className="flex flex-col items-center justify-center bg-[#111827] text-white w-14 h-16 shadow-lg" style={{ borderRadius: 'var(--radius-sm, 8px)' }}>
                <span className="text-[20px] font-[800] leading-none">{formatNumber(minutes)}</span>
                <span className="text-[10px] font-medium text-gray-400 mt-1">MIN</span>
              </div>
              <div className="flex flex-col items-center justify-center bg-[#111827] text-white w-14 h-16 shadow-lg" style={{ borderRadius: 'var(--radius-sm, 8px)' }}>
                <span className="text-[20px] font-[800] leading-none">{formatNumber(seconds)}</span>
                <span className="text-[10px] font-medium text-gray-400 mt-1">SEC</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Grid Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {allItems.slice(25, 29).map((deal) => (
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
              tag="-25%"
              tagColor="#EF4444"
            />
          ))}
        </div>

      </div>
    </section>
  );
};

export default HeroToday;
