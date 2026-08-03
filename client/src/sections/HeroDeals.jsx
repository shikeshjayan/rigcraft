import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Card from '../components/Card';
import CountdownTimer from '../components/CountdownTimer';
import { productService } from '../services/product.service';

const HeroDeals = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['activeSaleProductsHero'],
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

  const activeSaleProducts = allProducts.filter(product => {
    if (!product.salePrice) return false;
    
    if (product.saleStart && product.saleEnd) {
      const start = new Date(product.saleStart);
      const end = new Date(product.saleEnd);
      return currentTime >= start && currentTime <= end;
    }
    
    return true;
  });

  // Show only 4 products
  const displayProducts = activeSaleProducts.slice(0, 4);

  if (isLoading) return null;
  if (activeSaleProducts.length === 0) return null;

  // Countdown to the soonest sale end among the displayed products
  const soonestEnd = displayProducts.reduce((min, product) => {
    const t = product.saleEnd ? new Date(product.saleEnd).getTime() : Infinity;
    return t < min ? t : min;
  }, Infinity);
  const dealEnd = Number.isFinite(soonestEnd) ? new Date(soonestEnd) : null;
  const diffSeconds = dealEnd ? Math.max(0, Math.floor((dealEnd.getTime() - currentTime.getTime()) / 1000)) : 0;
  const days = Math.floor(diffSeconds / 86400);
  const hours = Math.floor((diffSeconds % 86400) / 3600);
  const minutes = Math.floor((diffSeconds % 3600) / 60);
  const seconds = diffSeconds % 60;

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
          <div className="flex items-center gap-6 mt-4 md:mt-0">
            <div className="flex items-center gap-2">
              <span className="text-[14px] font-[600] text-[#6B7280]">Ends in:</span>
              <CountdownTimer
                days={days}
                hours={hours}
                minutes={minutes}
                seconds={seconds}
                size="sm"
              />
            </div>
            <Link to="/deals" className="font-[600] text-[16px] flex items-center gap-1 transition-transform hover:translate-x-1" style={{ color: 'var(--color-primary, #06B6D4)' }}>
              View All Deals
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
        
        {/* Grid Section */}
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayProducts.map((product) => {
              const price = product.salePrice || product.price;
              const mrp = product.salePrice ? product.price : null;
              const discountPercentage = mrp ? Math.round(((mrp - price) / mrp) * 100) : 0;
              
              // Formatting currency
              const formatPrice = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

              return (
                <Card 
 rating={product?.rating} key={product._id}
                  id={product._id}
                  image={product.images?.[0]?.url}
                  title={product.name}
                  specs={product.tags || []}
                  description={product.shortDescription || product.description}
                  price={formatPrice(price)}
                  mrp={mrp ? formatPrice(mrp) : ''}
                  discount={discountPercentage > 0 ? `${discountPercentage}% off` : ''}
                  tag={discountPercentage > 0 ? `-${discountPercentage}%` : ''}
                  tagColor="#E11D48"
                  category={product.categoryType}
                />
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
};

export default HeroDeals;
