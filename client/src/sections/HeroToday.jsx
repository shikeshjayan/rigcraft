import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Card from '../components/Card';
import SkeletonCard from '../components/SkeletonCard';
import CountdownTimer from '../components/CountdownTimer';
import { productService } from '../services/product.service';

const HeroToday = () => {
  const carouselRef = useRef(null);
  const [canScroll, setCanScroll] = useState(false);

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

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['activeSaleProductsToday'],
    queryFn: () => productService.list({ limit: 1000 }),
  });

  // Calculate timer to midnight
  const endOfToday = new Date(currentTime);
  endOfToday.setHours(23, 59, 59, 999);
  const timeLeft = Math.max(0, Math.floor((endOfToday.getTime() - currentTime.getTime()) / 1000));

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  let allProducts = [];
  if (productsData?.data?.docs) {
    allProducts = productsData.data.docs;
  } else if (productsData?.data?.data?.docs) {
    allProducts = productsData.data.data.docs;
  } else if (productsData?.docs) {
    allProducts = productsData.docs;
  } else if (Array.isArray(productsData?.data)) {
    allProducts = productsData.data;
  } else if (Array.isArray(productsData)) {
    allProducts = productsData;
  }

  // Filter products for Today's Deals
  const startOfToday = new Date(currentTime);
  startOfToday.setHours(0, 0, 0, 0);

  const todaysDeals = allProducts.filter(product => {
    if (!product.saleStart || !product.saleEnd) return false;
    
    const start = new Date(product.saleStart);
    const end = new Date(product.saleEnd);
    
    // Both saleStart and saleEnd must be strictly within today (i.e. it's a 24h flash sale limit)
    // AND the current time must be within the active range
    return (
      start >= startOfToday &&
      end <= endOfToday &&
      currentTime >= start &&
      currentTime <= end
    );
  });

  useEffect(() => {
    const measure = () => {
      if (carouselRef.current) {
        setCanScroll(carouselRef.current.scrollWidth > carouselRef.current.clientWidth + 1);
      }
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [todaysDeals.length]);

  if (isLoading) return null;
  if (todaysDeals.length === 0) return null;

  // Only show 4 cards
  const displayProducts = todaysDeals.slice(0, 4);

  const formatPrice = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <section className="w-full py-16" style={{ backgroundColor: 'var(--color-bg-secondary, #F3F4F6)' }}>
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
        
        {/* Header Section */}
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
          
          {/* Timer & Carousel Nav on the Right */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-6 md:mt-0">
            <div className="flex items-center gap-4">
              <span className="text-[14px] font-[600] text-[#6B7280]">Ends in:</span>
              <CountdownTimer
                hours={hours}
                minutes={minutes}
                seconds={seconds}
                size="sm"
                showDays={false}
              />
            </div>
            {canScroll && (
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
            )}
          </div>
        </div>
        
        {/* Carousel Section */}
        <div
          ref={carouselRef}
          className="flex overflow-x-auto gap-6 pb-8 pt-2 snap-x snap-mandatory hide-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {isLoading ? (
            Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="flex-shrink-0 w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] flex flex-col snap-start">
                <SkeletonCard />
              </div>
            ))
          ) : (
            displayProducts.map((product) => {
              const price = product.salePrice || product.price;
              const mrp = product.salePrice ? product.price : null;
              const discountPercentage = mrp ? Math.round(((mrp - price) / mrp) * 100) : 0;
              const imageUrl = product.images?.[0]?.url || 'https://via.placeholder.com/300?text=No+Image';

              return (
                <div key={product._id} className="flex-shrink-0 w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] flex flex-col snap-start">
                  <Card 
 rating={product?.rating} id={product._id}
                    image={imageUrl}
                    title={product.name}
                    specs={product.tags || []}
                    description={product.shortDescription || product.description}
                    price={formatPrice(price)}
                    mrp={mrp ? formatPrice(mrp) : ''}
                    discount={discountPercentage > 0 ? `${discountPercentage}% off` : ''}
                    tag={discountPercentage > 0 ? `-${discountPercentage}%` : ''}
                    tagColor="#EF4444"
                  />
                </div>
              );
            })
          )}
        </div>

      </div>
    </section>
  );
};

export default HeroToday;
