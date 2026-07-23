import React from 'react';
import { motion } from 'framer-motion';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';

const Filter = ({ isOpen, filters, setFilters, onClearAll }) => {
  
  const toggleFilter = (category, value) => {
    setFilters(prev => {
      const currentList = prev[category];
      const newList = currentList.includes(value) 
        ? currentList.filter(v => v !== value) 
        : [...currentList, value];
      return { ...prev, [category]: newList };
    });
  };

  const handlePriceChange = (e) => {
    setFilters(prev => ({ ...prev, priceMax: Number(e.target.value) }));
  };

  // Helper for rendering filter checkboxes
  const renderFilterSection = (title, categoryKey, options) => (
    <>
      <div className="w-full h-px bg-[#E7E7E7] my-6"></div>
      <div>
        <h4 className="text-[14px] font-bold text-[#0F1111] mb-3">{title}</h4>
        <div className="flex flex-col gap-3">
          {options.map(opt => (
            <label key={opt} className="flex items-center gap-3 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={filters[categoryKey].includes(opt)}
                onChange={() => toggleFilter(categoryKey, opt)}
                className="w-[18px] h-[18px] text-[var(--color-primary)] rounded border-gray-300 focus:ring-[var(--color-primary)] cursor-pointer"
              />
              <span className="text-[14px] text-[#0F1111] group-hover:text-[var(--color-primary)] transition-colors">{opt}</span>
            </label>
          ))}
        </div>
      </div>
    </>
  );

  return (
    <div className="self-stretch flex-shrink-0 z-30">
      <div className="sticky top-[180px]">
        <motion.div 
          className="bg-white border-[#D5D9D9] shadow-sm rounded-lg overflow-y-auto overflow-x-hidden custom-scrollbar"
          initial={false}
          animate={{ 
            width: isOpen ? 320 : 0, 
            opacity: isOpen ? 1 : 0,
            marginLeft: isOpen ? '0rem' : '0rem'
          }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{ 
            borderWidth: isOpen ? '1px' : '0px',
            maxHeight: '590px'
          }}
        >
          <div className="w-[305px]">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6 sticky top-0 bg-white z-10 pb-2">
            <h3 className="text-[18px] font-bold text-[#0F1111] mt-[10px]">Filters</h3>
            <button 
              onClick={onClearAll}
              className="text-[13px] font-bold text-[#007185] mt-[10px] hover:text-[#C7511F] hover:underline cursor-pointer"
            >
              Clear All
            </button>
          </div>

        {/* Price Range */}
        <div>
          <h4 className="text-[14px] font-bold text-[#0F1111] mb-3 flex justify-between">
            <span>Max Price</span>
            <span className="text-[#007185]">₹{filters.priceMax.toLocaleString('en-IN')}</span>
          </h4>
          <input 
            type="range" 
            min="30000" 
            max="500000" 
            step="10000"
            value={filters.priceMax} 
            onChange={handlePriceChange}
            className="w-full cursor-pointer accent-[var(--color-primary)]"
          />
        </div>

        {/* Ratings */}
        <div className="w-full h-px bg-[#E7E7E7] my-6"></div>
        <div>
          <h4 className="text-[14px] font-bold text-[#0F1111] mb-3">Customer Ratings</h4>
          <div className="flex flex-col gap-3">
            {[4, 3, 2, 1].map(stars => (
              <label key={stars} className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={filters.ratings.includes(stars)}
                  onChange={() => toggleFilter('ratings', stars)}
                  className="w-[18px] h-[18px] text-[var(--color-primary)] rounded border-gray-300 focus:ring-[var(--color-primary)] cursor-pointer"
                />
                <span className="flex items-center text-[#FFA41C]">
                  {[...Array(5)].map((_, i) => i < stars ? <StarIcon key={i} sx={{fontSize: 18}}/> : <StarBorderIcon key={i} sx={{fontSize: 18}}/>)}
                  <span className="text-[14px] text-[#0F1111] ml-2 group-hover:text-[var(--color-primary)] transition-colors">& Up</span>
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Massive List of Filters */}
        {renderFilterSection('Brands', 'brands', [
          'Intel', 'AMD', 'NVIDIA', 'ASUS', 'MSI', 'Gigabyte', 'Corsair', 
          'NZXT', 'Razer', 'Alienware', 'HP Omen', 'Lenovo Legion'
        ])}
        {renderFilterSection('Processor (CPU)', 'cpu', ['Core i3 / Ryzen 3', 'Core i5 / Ryzen 5', 'Core i7 / Ryzen 7', 'Core i9 / Ryzen 9', 'Threadripper / Xeon'])}
        {renderFilterSection('Motherboard Form Factor', 'motherboard', ['ATX (Standard)', 'Micro-ATX', 'Mini-ITX (Compact)', 'E-ATX (Extended)'])}
        {renderFilterSection('Graphics Card (GPU)', 'gpu', ['Integrated Graphics', 'GTX 16-Series', 'RTX 30-Series', 'RTX 40-Series', 'Radeon RX 6000-Series', 'Radeon RX 7000-Series'])}
        {renderFilterSection('Memory (RAM)', 'ram', ['8 GB', '16 GB', '32 GB', '64 GB', '128 GB +'])}
        {renderFilterSection('Storage (SSD/HDD)', 'ssd', ['500 GB NVMe', '1 TB NVMe', '2 TB NVMe', '4 TB NVMe', 'Dual Drive (SSD + HDD)'])}
        {renderFilterSection('Power Supply (PSU)', 'psu', ['Under 500W', '550W - 650W', '750W - 850W', '1000W +', 'Platinum / Titanium Rated'])}
        {renderFilterSection('Cabinet / Case', 'cabinet', ['Mid Tower', 'Full Tower', 'Dual Chamber', 'Mini/Small Form Factor', 'Open Frame'])}
        {renderFilterSection('Cooling System', 'cooling', ['Stock Air Cooler', 'Premium Air Cooler', '240mm AIO Liquid', '360mm AIO Liquid', 'Custom Loop Water Cooling'])}
        {renderFilterSection('Peripherals Included', 'peripherals', ['Mechanical Keyboard', 'Gaming Mouse', 'Gaming Headset', 'Mousepad / Deskmat'])}
        {renderFilterSection('Monitor Included', 'monitors', ['1080p Full HD', '1440p QHD / 2K', '4K Ultra HD', 'Ultrawide', '240Hz+ Esports'])}
        </div>
        </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Filter;
