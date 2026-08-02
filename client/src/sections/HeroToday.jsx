import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import Card from '../components/Card';
import SkeletonCard from '../components/SkeletonCard';
import { productService } from '../services/product.service';

const HeroToday = () => {
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

  const formatNumber = (num) => String(num).padStart(2, '0');

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
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, idx) => (
              <SkeletonCard key={idx} />
            ))}
          </div>
        ) : displayProducts.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <h3 className="text-[18px] font-bold">No active flash sales right now</h3>
            <p>Check back later for exciting today's deals!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayProducts.map((product) => {
              const price = product.salePrice || product.price;
              const mrp = product.salePrice ? product.price : null;
              const discountPercentage = mrp ? Math.round(((mrp - price) / mrp) * 100) : 0;
              const imageUrl = product.images?.[0]?.url || 'https://via.placeholder.com/300?text=No+Image';

              return (
                <Card 
 rating={product?.rating} key={product._id}
                  id={product._id}
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
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
};

export default HeroToday;
