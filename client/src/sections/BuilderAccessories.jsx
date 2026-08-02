import { useState, useEffect } from 'react';
import Card from '../components/Card';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';
import { useCart } from '../context/CartContext';
import { normalizeBuilderProduct, normalizeCategory, getRawCategory } from '../utils/builderProducts';

const BuilderAccessories = () => {
  const [accessories, setAccessories] = useState([]);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchAccessories = async () => {
      try {
        const { data } = await apiClient.get('/products?limit=1000');
        if (data && data.data) {
          const docs = data.data.docs || data.data;
          const pcArray = Array.isArray(docs) ? docs : [];

          // Keep only accessories
          const accessoryItems = pcArray
            .filter(p => {
              const type = (p.categoryType || p.productType || '').toLowerCase();
              return type === 'accessory' || type === 'accessories' || normalizeCategory(getRawCategory(p)) === 'accessory';
            })
            .slice(0, 4)
            .map(p => normalizeBuilderProduct(p));

          setAccessories(accessoryItems);
        }
      } catch (error) {
        console.error('Failed to fetch accessories', error);
      }
    };
    fetchAccessories();
  }, []);

  const handleAddToCart = (item) => {
    addToCart(item);
  };

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
                category={item.category}
                tag="ACCESSORY"
                tagColor="var(--color-primary)"
                buttonText="Add to Cart"
                onButtonClick={() => handleAddToCart(item)}
              />
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
};

export default BuilderAccessories;
