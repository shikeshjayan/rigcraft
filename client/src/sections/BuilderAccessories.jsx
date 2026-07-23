import React from 'react';
import Card from '../components/Card';
import { allItems } from '../data/items';
import { Link } from 'react-router-dom';

const BuilderAccessories = () => {
  const accessories = allItems.filter(item => 
    item.category === 'peripherals' || item.category === 'monitor'
  ).slice(0, 4);

  // Fallback if none exist
  const finalAccessories = accessories.length > 0 ? accessories : allItems.slice(0, 4);
  return (
    <section className="w-full py-16" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
      <div className="max-w-[1500px] mx-auto px-4 lg:px-8">
        
        <h2 className="text-[20px] font-bold text-[#0F172A] mb-6">
          Recommended Accessories
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {finalAccessories.map(item => (
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
                tagColor="#0052FF"
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
