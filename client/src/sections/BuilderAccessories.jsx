import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';

const BuilderAccessories = () => {
  const [accessories, setAccessories] = useState([]);

  useEffect(() => {
    const fetchAccessories = async () => {
      try {
        const { data } = await apiClient.get('/products?limit=50');
        if (data && data.data) {
          const docs = data.data.docs || data.data;
          const pcArray = Array.isArray(docs) ? docs : [];
          
          // Keep only accessories
          const accessoryItems = pcArray.filter(p => {
             const type = (p.categoryType || p.productType || '').toLowerCase();
             return type === 'accessory' || type === 'accessories';
          });
          
          const formatted = accessoryItems.slice(0, 4).map(p => {
            const priceVal = p.pricing?.price || p.priceVal || p.price || 0;
            const mrpVal = p.pricing?.salePrice || p.mrpVal || p.mrp || 0;
            return {
              ...p,
              id: p._id || p.id,
              image: p.images?.[0]?.url || p.images?.[0] || p.image || null,
              title: p.name || p.title,
              price: priceVal ? `₹${priceVal.toLocaleString()}` : p.price,
              priceVal: priceVal,
              mrp: mrpVal ? `₹${mrpVal.toLocaleString()}` : p.mrp,
              specs: p.specifications ? Object.entries(p.specifications).map(([k, v]) => `${k}: ${v}`) : []
            };
          });
          setAccessories(formatted);
        }
      } catch (error) {
        console.error('Failed to fetch accessories', error);
      }
    };
    fetchAccessories();
  }, []);
  return (
    <section className="w-full py-16" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
      <div className="max-w-[1500px] mx-auto px-4 lg:px-8">
        
        <h2 className="text-[20px] font-bold text-[#0F172A] mb-6">
          Recommended Accessories
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {accessories.map(item => (
            <Link to={`/detail/${item.id}`} key={item.id} className="block h-full">
              <Card 
                id={item.id}
                image={item.image}
                title={item.title}
                specs={item.specs}
                description={item.description}
                price={item.price}
                mrp={item.mrp}
                discount={item.discount}
                tag="ACCESSORY"
                tagColor="var(--color-primary)"
                buttonText="Add to Cart"
              />
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
};

export default BuilderAccessories;
