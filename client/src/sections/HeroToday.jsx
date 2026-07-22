import React, { useState, useEffect } from 'react';
import MemoryOutlinedIcon from '@mui/icons-material/MemoryOutlined';
import DeveloperBoardOutlinedIcon from '@mui/icons-material/DeveloperBoardOutlined';
import StorageOutlinedIcon from '@mui/icons-material/StorageOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import FlashOnIcon from '@mui/icons-material/FlashOn';

const todayDeals = [
  {
    id: 1,
    title: 'RTX 4080 Super 16GB',
    price: '₹79,999',
    oldPrice: '₹1,05,000',
    discount: '-24%',
    left: '8 left',
    progress: 20,
    progressColor: '#EF4444', // red
    icon: <MemoryOutlinedIcon sx={{ fontSize: 64, color: '#9CA3AF' }} />
  },
  {
    id: 2,
    title: 'AMD Ryzen 9 7950X3D',
    price: '₹44,999',
    oldPrice: '₹62,000',
    discount: '-27%',
    left: '15 left',
    progress: 35,
    progressColor: '#EF4444', // red
    icon: <DeveloperBoardOutlinedIcon sx={{ fontSize: 64, color: '#9CA3AF' }} />
  },
  {
    id: 3,
    title: 'Corsair 32GB DDR5-6000 Kit',
    price: '₹11,999',
    oldPrice: '₹16,999',
    discount: '-29%',
    left: '42 left',
    progress: 80,
    progressColor: '#10B981', // green
    icon: <StorageOutlinedIcon sx={{ fontSize: 64, color: '#9CA3AF' }} />
  },
  {
    id: 4,
    title: 'WD Black SN850X 4TB',
    price: '₹18,999',
    oldPrice: '₹26,000',
    discount: '-26%',
    left: '23 left',
    progress: 60,
    progressColor: '#10B981', // green
    icon: <SaveOutlinedIcon sx={{ fontSize: 64, color: '#9CA3AF' }} />
  }
];

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
          {todayDeals.map((deal) => (
            <div 
              key={deal.id} 
              className="flex flex-col shadow-xl hover:shadow-[0_12px_30px_rgb(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-300 group overflow-hidden border border-[#E5E7EB] p-4"
              style={{ 
                backgroundColor: 'var(--color-bg-primary, #ffffff)',
                borderRadius: 'var(--radius-sm, 8px)' 
              }}
            >
              {/* Image/Icon Container */}
              <div 
                className="w-full h-[180px] bg-[#1F2937] flex items-center justify-center relative mb-4 overflow-hidden"
                style={{ borderRadius: 'var(--radius-sm, 8px)' }}
              >
                {/* Badges */}
                <div className="absolute top-3 left-3 bg-[#EF4444] text-white px-2 py-1 text-[12px] font-[800] shadow-md z-10" style={{ borderRadius: 'var(--radius-sm, 4px)' }}>
                  {deal.discount}
                </div>
                <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 text-[11px] font-[600] z-10" style={{ borderRadius: 'var(--radius-sm, 4px)' }}>
                  {deal.left}
                </div>
                
                {/* Material Icon (Placeholder for Image) */}
                <div className="group-hover:scale-110 transition-transform duration-500">
                  {deal.icon}
                </div>
              </div>

              {/* Product Details */}
              <div className="flex flex-col flex-grow">
                <h3 className="text-[15px] font-[700] text-[#111111] leading-tight mb-2 line-clamp-2">
                  {deal.title}
                </h3>
                
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-[22px] font-extrabold text-[#111111]">
                    {deal.price}
                  </span>
                  <span className="text-[14px] font-medium text-[#9CA3AF] line-through">
                    {deal.oldPrice}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-1.5 bg-gray-200 rounded-full mb-6 overflow-hidden">
                  <div 
                    className="h-full rounded-full" 
                    style={{ 
                      width: `${deal.progress}%`, 
                      backgroundColor: deal.progressColor 
                    }}
                  />
                </div>

                {/* Add to Cart Button */}
                <button 
                  className="w-full mt-auto cursor-pointer py-3 text-white text-[14px] font-bold transition-all hover:brightness-110 hover:shadow-md"
                  style={{ 
                    backgroundColor: 'var(--color-primary, #2563EB)', 
                    borderRadius: 'var(--radius-sm, 8px)' 
                  }}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default HeroToday;
