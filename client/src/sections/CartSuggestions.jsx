import React, { useEffect, useState } from 'react';
import Card from '../components/Card';
import apiClient from '../api/client';

const CartSuggestions = () => {
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const { data } = await apiClient.get('/products?limit=8');
        if (data.success && data.data?.products) {
          setSuggestions(data.data.products.slice(0, 8));
        }
      } catch (err) {
        console.error('Failed to fetch suggestions', err);
      }
    };
    fetchSuggestions();
  }, []);

  if (suggestions.length === 0) return null;

  const formatPrice = (val) => {
    if (typeof val === 'number') {
      return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
    }
    return val;
  };

  return (
    <section className="w-full py-16" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <div className="max-w-[1200px] mx-auto px-4 lg:px-8">
        
        <h2 className="text-[18px] font-bold text-[#0F172A] mb-6 border-b border-[#E2E8F0] pb-2">
          You May Also Like
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 lg:gap-4">
          {suggestions.map(item => {
            const imgSource = item.image || (typeof item.images?.[0] === 'string' ? item.images[0] : item.images?.[0]?.url) || '/placeholder.png';
            const price = item.price || item.pricing?.price || item.pricing?.salePrice;
            const mrp = item.mrp || item.pricing?.price || item.price;
            return (
              <Card
                key={item._id || item.id}
                id={item._id || item.id}
                rating={item?.rating}
                image={imgSource}
                title={item.name || item.title}
                description={item.description}
                price={formatPrice(price)}
                mrp={mrp > price ? formatPrice(mrp) : undefined}
                discount={item.discount}
                tag="SUGGESTED"
                tagColor="var(--color-primary)"
                buttonText="Add to cart"
                compact={true}
                stock={item.stock}
              />
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default CartSuggestions;
