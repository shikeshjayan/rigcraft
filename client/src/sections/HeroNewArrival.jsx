import React, { useRef } from 'react';
import StarIcon from '@mui/icons-material/Star';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Card from '../components/Card';

import { allItems } from '../data/items';

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
          </div>
        </div>
        
        {/* Carousel Container */}
        <div 
          ref={carouselRef}
          className="flex overflow-x-auto gap-6 pb-8 pt-2 snap-x snap-mandatory hide-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {allItems.slice(30, 36).map((product) => (
            <div key={product.id} className="flex-shrink-0 w-[280px] sm:w-[320px] md:w-[340px] flex flex-col snap-start">
              <Card 
                id={product.id}
                image={product.image}
                title={product.title}
                specs={product.specs}
                description={product.description}
                price={product.price}
                mrp={product.mrp}
                discount={product.discount}
                tag="NEW"
                tagColor="var(--color-primary, #06B6D4)"
              />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default HeroNewArrival;
