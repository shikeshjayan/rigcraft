import React from 'react';
import Card from '../components/Card';
import { allItems } from '../data/items';
import { Link } from 'react-router-dom';

const BuilderUpgrades = () => {
  // Grab a few premium items for upgrades (e.g. DDR5 RAM, high-end PSU, high-end NVMe)
  const upgrades = [
    allItems.find(item => item.category === 'ram' && item.priceVal > 15000),
    allItems.find(item => item.category === 'power-supply' && item.priceVal > 12000),
    allItems.find(item => item.category === 'storage' && item.priceVal > 10000),
    allItems.find(item => item.category === 'cooling' && item.priceVal > 15000)
  ].filter(Boolean).slice(0, 4);

  // Fallback to any 4 items if not enough high end found
  const finalUpgrades = upgrades.length === 4 ? upgrades : allItems.slice(0, 4);
  return (
    <section className="w-full py-16" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <div className="max-w-[1500px] mx-auto px-4 lg:px-8">
        
        <h2 className="text-[20px] font-bold text-[#0F172A] mb-6">
          Recommended Upgrades
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {finalUpgrades.map(item => (
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
                tag="RECOMMENDED"
                tagColor="#0052FF"
                buttonText="Add to Build"
              />
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
};

export default BuilderUpgrades;
