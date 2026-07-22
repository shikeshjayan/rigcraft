import React, { useState, useEffect } from 'react';

const hotDeals = [
  {
    id: 1,
    title: 'MSI RTX 4070 Super Gaming X 12GB GDDR6X',
    price: '₹54,999',
    oldPrice: '₹64,999',
    discount: '-15%'
  },
  {
    id: 2,
    title: 'Intel Core i7-14700K Processor',
    price: '₹29,999',
    oldPrice: '₹37,499',
    discount: '-20%'
  },
  {
    id: 3,
    title: 'Corsair Vengeance 16GB (8x2) DDR5 6000MHz',
    price: '₹9,999',
    oldPrice: '₹13,299',
    discount: '-25%'
  },
  {
    id: 4,
    title: 'Samsung 980 Pro 1TB NVMe SSD',
    price: '₹6,999',
    oldPrice: '₹9,999',
    discount: '-30%'
  }
];

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
          {hotDeals.map((deal) => (
            <div 
              key={deal.id} 
              className="flex flex-col bg-white border border-[#E5E7EB] shadow-xl hover:shadow-[0_12px_30px_rgb(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-300 relative p-5 group"
              style={{ borderRadius: 'var(--radius-sm, 6px)' }}
            >
              {/* Discount Badge */}
              <div className="absolute top-4 right-4 w-[42px] h-[42px] bg-[#E11D48] text-white rounded-full flex items-center justify-center text-[12px] font-bold shadow-md z-10">
                {deal.discount}
              </div>

              {/* Product Image */}
              <div className="w-full h-[180px] flex items-center justify-center p-4">
                <img 
                  src="/PC2.avif" 
                  alt={deal.title} 
                  className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-sm"
                />
              </div>

              {/* Product Details */}
              <div className="flex flex-col flex-grow mt-2">
                <h3 className="text-[14px] font-[700] text-[#111111] leading-tight min-h-[40px] line-clamp-2">
                  {deal.title}
                </h3>
                
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-[20px] font-extrabold" style={{ color: 'var(--color-primary, #06B6D4)' }}>
                    {deal.price}
                  </span>
                  <span className="text-[13px] font-medium text-[#9CA3AF] line-through">
                    {deal.oldPrice}
                  </span>
                </div>

                {/* Countdown Timer */}
                <div className="grid grid-cols-4 gap-2 mt-5">
                  <div className="flex flex-col items-center justify-center border border-[#E5E7EB] rounded-md py-1.5 bg-gray-50">
                    <span className="text-[16px] font-[800] text-[#111111] leading-none">{formatNumber(days)}</span>
                    <span className="text-[8px] font-bold text-[#6B7280] uppercase mt-1">Days</span>
                  </div>
                  <div className="flex flex-col items-center justify-center border border-[#E5E7EB] rounded-md py-1.5 bg-gray-50">
                    <span className="text-[16px] font-[800] text-[#111111] leading-none">{formatNumber(hours)}</span>
                    <span className="text-[8px] font-bold text-[#6B7280] uppercase mt-1">Hrs</span>
                  </div>
                  <div className="flex flex-col items-center justify-center border border-[#E5E7EB] rounded-md py-1.5 bg-gray-50">
                    <span className="text-[16px] font-[800] text-[#111111] leading-none">{formatNumber(minutes)}</span>
                    <span className="text-[8px] font-bold text-[#6B7280] uppercase mt-1">Mins</span>
                  </div>
                  <div className="flex flex-col items-center justify-center border border-[#E5E7EB] rounded-md py-1.5 bg-gray-50">
                    <span className="text-[16px] font-[800] text-[#111111] leading-none">{formatNumber(seconds)}</span>
                    <span className="text-[8px] font-bold text-[#6B7280] uppercase mt-1">Secs</span>
                  </div>
                </div>

                {/* Add to Cart Button */}
                <button 
                  className="w-full mt-5 py-3 text-white text-[13px] font-bold uppercase tracking-wide transition-all hover:brightness-110 hover:shadow-md"
                  style={{ backgroundColor: 'var(--color-primary, #06B6D4)', borderRadius: 'var(--radius-sm, 6px)' }}
                >
                  Add To Cart
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default HeroDeals;
