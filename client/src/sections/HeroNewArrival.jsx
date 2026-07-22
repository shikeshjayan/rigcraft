import React, { useRef } from 'react';
import StarIcon from '@mui/icons-material/Star';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const newArrivals = [
  {
    id: 1,
    title: 'RigCraft Nova X9',
    description: 'Next-generation performance engineered for flawless 4K gaming and heavy multitasking.',
    price: '₹1,99,999',
    rating: 4.9,
    reviews: 124,
    image: '/PC3.avif',
    specs: ['Intel i9-14900K', 'RTX 4080 Super', '32GB DDR5']
  },
  {
    id: 2,
    title: 'RigCraft Stealth Mini',
    description: 'A compact Mini-ITX powerhouse designed for small spaces without compromising on frame rates.',
    price: '₹1,45,999',
    rating: 4.8,
    reviews: 89,
    image: '/PC1.jpeg',
    specs: ['AMD Ryzen 7 7800X3D', 'RTX 4070 Ti', '32GB DDR5']
  },
  {
    id: 3,
    title: 'RigCraft Titan Z',
    description: 'The ultimate liquid-cooled workstation for rendering, AI development, and 3D modeling.',
    price: '₹3,29,999',
    rating: 5.0,
    reviews: 42,
    image: '/PC2.avif',
    specs: ['AMD Threadripper', 'RTX 4090', '128GB DDR5']
  },
  {
    id: 4,
    title: 'RigCraft Eclipse V2',
    description: 'Premium aesthetics meet high airflow. Featuring full tempered glass and custom RGB lighting.',
    price: '₹1,15,999',
    rating: 4.7,
    reviews: 215,
    image: '/PC3.avif',
    specs: ['Intel i5-13600K', 'RTX 4060 Ti', '16GB DDR5']
  },
  {
    id: 5,
    title: 'RigCraft Apex Pro',
    description: 'Built for competitive esports titles, delivering ultra-low latency and consistent high FPS.',
    price: '₹89,999',
    rating: 4.6,
    reviews: 310,
    image: '/PC1.jpeg',
    specs: ['AMD Ryzen 5 7600X', 'RX 7600', '16GB DDR5']
  },
  {
    id: 6,
    title: 'RigCraft Zenith Ultra',
    description: 'Our flagship desktop featuring dual-loop custom watercooling and hand-binned components.',
    price: '₹4,99,999',
    rating: 5.0,
    reviews: 18,
    image: '/PC2.avif',
    specs: ['Intel i9-14900KS', 'RTX 4090', '64GB DDR5']
  }
];

const HeroNewArrival = () => {
  const carouselRef = useRef(null);

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -400, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 400, behavior: 'smooth' });
    }
  };

  return (
    <section className="w-full py-16" style={{ backgroundColor: 'var(--color-bg-primary, #ffffff)' }}>
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
        
        {/* Header Section (Same as HeroDeals styling) */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10">
          <div>
            <h2 className="text-[32px] md:text-[40px] font-extrabold text-[#111111] uppercase tracking-wide">
              New <span style={{ color: 'var(--color-primary, #06B6D4)' }}>Arrivals</span>
            </h2>
            <p className="text-[#6B7280] mt-2 text-[16px] font-[500]">
              Be the first to experience our latest additions to the RigCraft lineup.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-6 md:mt-0">
            {/* Carousel Navigation Arrows */}
            <div className="flex items-center gap-2">
              <button 
                onClick={scrollLeft}
                className="flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors shadow-sm cursor-pointer"
                style={{ borderRadius: 'var(--radius-sm, 8px)' }}
                aria-label="Previous"
              >
                <ChevronLeftIcon />
              </button>
              <button 
                onClick={scrollRight}
                className="flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors shadow-sm cursor-pointer"
                style={{ borderRadius: 'var(--radius-sm, 8px)' }}
                aria-label="Next"
              >
                <ChevronRightIcon />
              </button>
            </div>

            {/* View All Link */}
            <a href="#" className="font-[600] text-[16px] flex items-center gap-1 transition-transform hover:translate-x-1 sm:ml-4 cursor-pointer" style={{ color: 'var(--color-primary, #06B6D4)' }}>
              View All
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
        
        {/* Carousel Container */}
        <div 
          ref={carouselRef}
          className="flex overflow-x-auto gap-6 pb-8 pt-2 snap-x snap-mandatory hide-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {newArrivals.map((product) => (
            <div 
              key={product.id} 
              className="flex flex-col min-w-[280px] sm:min-w-[320px] md:min-w-[360px] max-w-[380px] flex-shrink-0 snap-start shadow-xl hover:shadow-[0_12px_30px_rgb(0,0,0,0.12)] border border-[#E5E7EB] transition-all duration-300 relative group cursor-pointer"
              style={{ 
                backgroundColor: 'var(--color-bg-secondary, #F9FAFB)', 
                borderRadius: 'var(--radius-sm, 8px)' 
              }}
            >
              {/* Product Image Area */}
              <div 
                className="w-full h-[220px] bg-[#F3F4F6] flex items-center justify-center relative overflow-hidden p-4"
                style={{ borderTopLeftRadius: 'var(--radius-sm, 8px)', borderTopRightRadius: 'var(--radius-sm, 8px)' }}
              >
                {/* NEW Badge */}
                <div 
                  className="absolute top-3 left-3 px-2 py-1 text-white text-[11px] font-[800] tracking-wider uppercase z-10 shadow-sm"
                  style={{ backgroundColor: 'var(--color-primary, #06B6D4)', borderRadius: 'var(--radius-sm, 4px)' }}
                >
                  NEW
                </div>
                
                <img 
                  src={product.image} 
                  alt={product.title} 
                  className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Product Information */}
              <div className="flex flex-col flex-grow p-5 relative">
                
                {/* Specification Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {product.specs.map((spec, index) => (
                    <span 
                      key={index} 
                      className="px-2 py-1 bg-gray-200 text-[#374151] text-[10px] font-bold rounded-sm uppercase tracking-wide"
                    >
                      {spec}
                    </span>
                  ))}
                </div>

                {/* Name */}
                <h3 className="text-[18px] font-[800] text-[#111111] leading-tight mb-2">
                  {product.title}
                </h3>
                
                {/* Description */}
                <p className="text-[13px] text-[#6B7280] font-medium leading-relaxed mb-4 line-clamp-2">
                  {product.description}
                </p>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-4">
                  <StarIcon sx={{ fontSize: 16, color: '#F59E0B' }} />
                  <span className="text-[13px] font-bold text-[#111111]">{product.rating}</span>
                  <span className="text-[12px] text-[#9CA3AF] ml-1">({product.reviews})</span>
                </div>

                {/* Price */}
                <div className="mt-auto pt-4 border-t border-[#E5E7EB]">
                  <span className="text-[22px] font-extrabold text-[#111111]">
                    {product.price}
                  </span>
                </div>

                {/* Add to Cart CTA (Bottom Right) */}
                <button 
                  className="absolute bottom-5 right-5 flex items-center gap-1.5 text-white shadow-md transition-all hover:scale-105 hover:shadow-lg hover:brightness-110 cursor-pointer px-3 py-1.5"
                  style={{ backgroundColor: 'var(--color-primary, #06B6D4)', borderRadius: 'var(--radius-sm, 8px)' }}
                >
                  <ShoppingCartOutlinedIcon sx={{ fontSize: 14 }} />
                  <span className="text-[11px] font-bold uppercase tracking-wider">Add to Cart</span>
                </button>
                
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default HeroNewArrival;
