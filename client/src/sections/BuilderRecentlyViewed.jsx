import { useState, useEffect, useRef } from 'react';
import Card from '../components/Card';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useBuilder } from '../context/BuilderContext';

const BuilderRecentlyViewed = () => {
  const { recentViewed, selectPart } = useBuilder();
  const [canScroll, setCanScroll] = useState(false);
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

  useEffect(() => {
    const measure = () => {
      if (carouselRef.current) {
        setCanScroll(carouselRef.current.scrollWidth > carouselRef.current.clientWidth + 1);
      }
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [recentViewed.length]);

  if (!recentViewed || recentViewed.length === 0) return null;

  return (
    <section className="w-full py-16" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
      <div className="max-w-[1500px] mx-auto px-4 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
          <h2 className="text-[24px] font-bold text-[#0F172A]">
            Recently Viewed Components
          </h2>

          {canScroll && (
            <div className="flex items-center gap-2 shrink-0 self-end">
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
          )}
        </div>

        <div
          ref={carouselRef}
          className="flex overflow-x-auto gap-6 pb-2 snap-x snap-mandatory hide-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {recentViewed.slice(0, 8).map(item => (
            <div key={item.id} className="flex-shrink-0 w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] flex flex-col snap-start">
              <Card
                id={item.id}
                image={item.image}
                title={item.title}
                specs={item.specs}
                price={item.price}
                mrp={item.mrp}
                discount={item.discount}
                category={item.category}
                tag="REVIEWED"
                tagColor="var(--color-primary)"
                compact
                buttonText="Add to Build"
                onButtonClick={() => selectPart(item)}
                stock={item.stock}
                brand={item.brand?.name || item.brand}
                warranty={item.warranty}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BuilderRecentlyViewed;