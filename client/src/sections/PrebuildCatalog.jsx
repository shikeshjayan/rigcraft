import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StarIcon from '@mui/icons-material/Star';
import StarHalfIcon from '@mui/icons-material/StarHalf';
import StarOutlineIcon from '@mui/icons-material/StarBorder';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import FilterListIcon from '@mui/icons-material/FilterList';

import { allPCs } from '../data/mockData';

const categories = ['Gaming', 'Streaming', 'Creator', 'Workstation', 'Budget', 'Premium', 'Office'];

// Star Rating Component
const RatingStars = ({ rating, reviews }) => {
  return (
    <div className="flex items-center gap-1 mb-1.5">
      <div className="flex text-[#FFA41C]">
        {[...Array(5)].map((_, index) => {
          if (rating >= index + 1) return <StarIcon key={index} sx={{ fontSize: 16 }} />;
          if (rating >= index + 0.5) return <StarHalfIcon key={index} sx={{ fontSize: 16 }} />;
          return <StarOutlineIcon key={index} sx={{ fontSize: 16 }} />;
        })}
      </div>
      <span className="text-[12px] text-[#007185] hover:text-[#C7511F] cursor-pointer ml-1">{reviews}</span>
    </div>
  );
};

// Reusable Carousel Component for each Category
const PCScrollRow = ({ category, pcs }) => {
  const scrollRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 800; 
      scrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  if (pcs.length === 0) return null;

  return (
    <div className="mb-10 pt-4 border-t border-[#E2E8F0]">
      {/* Category Heading */}
      <h2 className="text-[20px] font-bold text-[#0F1111] tracking-tight mb-4">{category} Systems</h2>
      
      <div className="relative group">
        
        {/* Left Arrow */}
        {showLeftArrow && (
          <button 
            onClick={() => scroll('left')} 
            className="absolute left-[-42px] top-[40%] -translate-y-1/2 -ml-3 z-10 w-11 h-14 bg-[var(--color-bg-secondary)] shadow-[0_1px_3px_rgba(0,0,0,0.15)] rounded-sm flex items-center justify-center text-[var(--color-primary)] hover:bg-[#F7F7F7] cursor-pointer"
          >
            <ChevronLeftIcon sx={{ fontSize: 32 }} />
          </button>
        )}

        {/* Right Arrow */}
        {showRightArrow && (
          <button 
            onClick={() => scroll('right')} 
            className="absolute right-[-42px] top-[40%] -translate-y-1/2 -mr-3 z-10 w-11 h-14 bg-[var(--color-bg-secondary)] shadow-[0_1px_3px_rgba(0,0,0,0.15)] rounded-sm flex items-center justify-center text-[var(--color-primary)] hover:bg-[#F7F7F7] cursor-pointer"
          >
            <ChevronRightIcon sx={{ fontSize: 32 }} />
          </button>
        )}
        
        {/* Horizontal Scroll Container */}
        <div 
          ref={scrollRef} 
          onScroll={handleScroll}
          className="flex gap-4 overflow-x-auto pb-4 pt-1 px-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {pcs.map((pc) => (
            <Link 
              to={`/detail/${pc.id}`}
              key={pc.id} 
              className="flex-shrink-0 w-[220px] md:w-[240px] flex flex-col bg-white overflow-hidden relative cursor-pointer group"
              style={{ borderRadius: 'var(--radius-sm, 6px)', scrollSnapAlign: 'start' }}
            >
              {/* Product Image */}
              <div className="w-full aspect-square bg-[#F7F7F7] mb-3 flex items-center justify-center p-4">
                <img 
                  src={pc.image} 
                  alt={pc.title} 
                  className="max-w-full max-h-full object-contain mix-blend-multiply"
                />
              </div>

              {/* Content Area */}
              <div className="flex flex-col flex-grow px-1">
                {/* Title */}
                <h3 className="text-[14px] font-medium text-[#007185] hover:text-[#C7511F] mb-1 leading-[1.3] line-clamp-4">
                  {pc.title}
                </h3>
                
                {/* Rating */}
                <RatingStars rating={pc.rating} reviews={pc.reviews} />
                
                {/* Deal Badge */}
                <div className="mb-1.5 flex items-center gap-2">
                  <span className="bg-[#CC0C39] text-white text-[12px] font-bold px-1.5 py-0.5 rounded-sm">
                    {pc.discount}
                  </span>
                  <span className="text-[#CC0C39] text-[12px] font-bold">Limited time deal</span>
                </div>
                
                {/* Price */}
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-[20px] font-medium text-[#0F1111]">
                    {pc.price}
                  </span>
                </div>
                
                {/* MRP */}
                <div className="text-[12px] text-[#565959] mb-2">
                  M.R.P: <span className="line-through">{pc.mrp}</span>
                </div>
                
                {/* Delivery */}
                <div className="text-[12px] text-[#0F1111]">
                  Get it by <span className="font-bold">Tomorrow, July 23</span>
                  <div className="text-[#565959] mt-0.5">FREE Delivery by RigCraft</div>
                </div>
                
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

const PrebuildCatalog = () => {
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [priceMax, setPriceMax] = useState(400000);
  const [selectedBrands, setSelectedBrands] = useState([]);
  
  const toggleBrand = (brand) => {
    setSelectedBrands(prev => 
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  const filteredPCs = allPCs.filter(pc => {
    if (pc.priceVal > priceMax) return false;
    if (selectedBrands.length > 0 && !selectedBrands.includes(pc.brand)) return false;
    return true;
  });

  return (
    <section className="w-full py-8 pb-24" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
        
        {/* Top Bar with Filters Dropdown */}
        <div 
          className="flex justify-between items-center mb-6 sticky top-[111px] z-40 py-4 border-b border-transparent backdrop-blur-md"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}
        >
          <h1 className="text-[24px] font-bold text-[#0F1111]">Shop by Category</h1>
          
          <div className="relative">
            <button 
              onClick={() => setFilterDropdownOpen(!filterDropdownOpen)} 
              className="flex items-center gap-2 px-4 py-2 bg-white border border-[#D5D9D9] shadow-[0_1px_2px_rgba(0,0,0,0.05)] rounded-full font-medium text-[#0F1111] hover:bg-[#F7F7F7] cursor-pointer"
            >
              <FilterListIcon sx={{ fontSize: 20 }} /> Filters
            </button>
            
            {/* Filter Dropdown Menu */}
            {filterDropdownOpen && (
              <div className="absolute right-0 top-12 w-[340px] max-h-[60vh] overflow-y-auto bg-white border border-[#D5D9D9] shadow-2xl rounded-md p-5 flex flex-col gap-6 z-50">
                
                <div>
                  <h4 className="text-[14px] font-bold text-[#0F1111] mb-3">Max Price: ₹{priceMax.toLocaleString('en-IN')}</h4>
                  <input 
                    type="range" 
                    min="30000" 
                    max="1000000" 
                    step="10000"
                    value={priceMax} 
                    onChange={(e) => setPriceMax(Number(e.target.value))}
                    className="w-full cursor-pointer accent-[#007185]"
                  />
                </div>

                <div className="w-full h-px bg-[#E7E7E7]"></div>

                {/* Processor Brand */}
                <div>
                  <h4 className="text-[14px] font-bold text-[#0F1111] mb-3">Processor Brand</h4>
                  <div className="flex flex-col gap-2">
                    {['Intel', 'AMD'].map(brand => (
                      <label key={brand} className="flex items-center gap-3 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={selectedBrands.includes(brand)}
                          onChange={() => toggleBrand(brand)}
                          className="w-4 h-4 text-[#007185] rounded border-gray-300 focus:ring-[#007185]"
                        />
                        <span className="text-[14px] text-[#0F1111]">{brand}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="w-full h-px bg-[#E7E7E7]"></div>

                {/* Processor Tier */}
                <div>
                  <h4 className="text-[14px] font-bold text-[#0F1111] mb-3">Processor Tier</h4>
                  <div className="flex flex-col gap-2">
                    {['Core i3 / Ryzen 3', 'Core i5 / Ryzen 5', 'Core i7 / Ryzen 7', 'Core i9 / Ryzen 9', 'Threadripper / Xeon'].map(tier => (
                      <label key={tier} className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" className="w-4 h-4 text-[#007185] rounded border-gray-300 focus:ring-[#007185]" />
                        <span className="text-[14px] text-[#0F1111]">{tier}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="w-full h-px bg-[#E7E7E7]"></div>

                {/* Graphics Card */}
                <div>
                  <h4 className="text-[14px] font-bold text-[#0F1111] mb-3">Graphics Card (GPU)</h4>
                  <div className="flex flex-col gap-2">
                    {['Integrated Graphics', 'GTX 1650 / RX 6400', 'RTX 3060 / RX 7600', 'RTX 4060 / 4070', 'RTX 4080 / 4090', 'Radeon RX 7900 XTX'].map(gpu => (
                      <label key={gpu} className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" className="w-4 h-4 text-[#007185] rounded border-gray-300 focus:ring-[#007185]" />
                        <span className="text-[14px] text-[#0F1111]">{gpu}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="w-full h-px bg-[#E7E7E7]"></div>

                {/* Memory (RAM) */}
                <div>
                  <h4 className="text-[14px] font-bold text-[#0F1111] mb-3">Memory (RAM)</h4>
                  <div className="flex flex-col gap-2">
                    {['8 GB', '16 GB', '32 GB', '64 GB', '128 GB +'].map(ram => (
                      <label key={ram} className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" className="w-4 h-4 text-[#007185] rounded border-gray-300 focus:ring-[#007185]" />
                        <span className="text-[14px] text-[#0F1111]">{ram}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="w-full h-px bg-[#E7E7E7]"></div>

                {/* Storage */}
                <div>
                  <h4 className="text-[14px] font-bold text-[#0F1111] mb-3">Storage Capacity</h4>
                  <div className="flex flex-col gap-2">
                    {['500 GB', '1 TB', '2 TB', '4 TB', '8 TB +'].map(storage => (
                      <label key={storage} className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" className="w-4 h-4 text-[#007185] rounded border-gray-300 focus:ring-[#007185]" />
                        <span className="text-[14px] text-[#0F1111]">{storage}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="w-full h-px bg-[#E7E7E7]"></div>

                {/* Form Factor */}
                <div>
                  <h4 className="text-[14px] font-bold text-[#0F1111] mb-3">Form Factor</h4>
                  <div className="flex flex-col gap-2">
                    {['Mini-ITX (Small Form)', 'Micro-ATX', 'Mid-Tower', 'Full-Tower (Ultimate)'].map(form => (
                      <label key={form} className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" className="w-4 h-4 text-[#007185] rounded border-gray-300 focus:ring-[#007185]" />
                        <span className="text-[14px] text-[#0F1111]">{form}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="w-full h-px bg-[#E7E7E7]"></div>

                {/* Features */}
                <div>
                  <h4 className="text-[14px] font-bold text-[#0F1111] mb-3">Premium Features</h4>
                  <div className="flex flex-col gap-2">
                    {['Custom Liquid Cooling', 'AIO Liquid Cooler', 'RGB Lighting', 'WiFi 6E / Bluetooth 5.3', 'Thunderbolt 4'].map(feat => (
                      <label key={feat} className="flex items-center gap-3 cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 text-[#007185] rounded border-gray-300 focus:ring-[#007185]"
                        />
                        <span className="text-[14px] text-[#0F1111]">{feat}</span>
                      </label>
                    ))}
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>

        {/* Main Content (Carousels taking full screen width) */}
        <div className="w-full">
          {categories.map(cat => (
            <PCScrollRow 
              key={cat} 
              category={cat} 
              pcs={filteredPCs.filter(p => p.category === cat)} 
            />
          ))}
          
          {filteredPCs.length === 0 && (
            <div className="w-full p-12 text-center">
              <h3 className="text-[18px] font-bold text-[#0F1111] mb-2">No results found</h3>
              <p className="text-[#565959]">Try adjusting your filters.</p>
            </div>
          )}
        </div>

      </div>
    </section>
  );
};

export default PrebuildCatalog;
