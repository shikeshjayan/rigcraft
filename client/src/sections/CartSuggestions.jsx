import React from 'react';
import Card from '../components/Card';
import { allItems } from '../data/items';
import { Link } from 'react-router-dom';

const CartSuggestions = () => {
  // Grab 8 items for a 4x2 grid
  const suggestions = allItems.slice(2, 10);

  return (
    <section className="w-full py-16" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <div className="max-w-[1200px] mx-auto px-4 lg:px-8">
        
        <h2 className="text-[18px] font-bold text-[#0F172A] mb-6 border-b border-[#E2E8F0] pb-2">
          You May Also Like
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 lg:gap-4">
          {suggestions.map(item => (
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
                tag="SUGGESTED"
                tagColor="#14b8a6"
                buttonText="Add to cart"
                compact={true}
              />
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
};

export default CartSuggestions;
