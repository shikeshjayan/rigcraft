import { useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Card from '../components/Card';
import SkeletonCard from '../components/SkeletonCard';
import { productService } from '../services/product.service';

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

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['newArrivalProducts'],
    queryFn: () => productService.list({ limit: 1000 }), 
  });

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

  // Filter products added within the last 15 days
  const fifteenDaysAgo = new Date();
  fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

  const newArrivals = allProducts.filter(product => {
    if (!product.createdAt) return false;
    const createdAt = new Date(product.createdAt);
    return createdAt >= fifteenDaysAgo;
  });

  // Sort newest first
  newArrivals.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const formatPrice = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <section className="w-full py-16" style={{ backgroundColor: 'var(--color-bg-primary, #ffffff)' }}>
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10">
          <div className="w-full text-center md:text-left">
            <h2 className="text-[32px] md:text-[40px] font-extrabold text-[#111111] uppercase tracking-wide">
              New <span style={{ color: 'var(--color-primary, #06B6D4)' }}>Arrivals</span>
            </h2>
            <p className="text-[#6B7280] mt-2 text-[16px] font-[500]">
              Be the first to experience our latest additions to the RigCraft lineup.
            </p>
          </div>

          <div className="flex items-center gap-2 mt-6 md:mt-0 self-end md:self-auto">
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
          {isLoading ? (
            Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="flex-shrink-0 w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] flex flex-col snap-start">
                <SkeletonCard />
              </div>
            ))
          ) : newArrivals.length === 0 ? (
             <div className="text-gray-500 py-10 text-center w-full">
                <h3 className="text-lg font-semibold">No new arrivals in the last 15 days</h3>
                <p>Check back later for fresh components!</p>
             </div>
          ) : (
            newArrivals.map((product) => {
              const price = product.salePrice || product.price;
              const mrp = product.salePrice ? product.price : null;
              const discountPercentage = mrp ? Math.round(((mrp - price) / mrp) * 100) : 0;
              const imageUrl = product.images?.[0]?.url || 'https://via.placeholder.com/300?text=No+Image';

return (
                <div key={product._id} className="flex-shrink-0 w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] flex flex-col snap-start">
                  <Card 
                    rating={product?.rating} 
                    id={product._id}
                    image={imageUrl}
                    title={product.name}
                    specs={product.tags || []}
                    description={product.shortDescription || product.description}
                    price={formatPrice(price)}
                    mrp={mrp ? formatPrice(mrp) : ''}
                    discount={discountPercentage > 0 ? `${discountPercentage}% off` : ''}
                    tag="NEW"
                    tagColor="var(--color-primary, #06B6D4)"
                    stock={product.stock}
                    brand={product.brand?.name || product.brand}
                    warranty={product.warranty}
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

export default HeroNewArrival;
