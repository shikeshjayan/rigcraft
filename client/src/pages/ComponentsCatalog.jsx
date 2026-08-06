import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { allItems } from '../data/items';
import StarIcon from '@mui/icons-material/Star';
import StarHalfIcon from '@mui/icons-material/StarHalf';
import StarOutlineIcon from '@mui/icons-material/StarBorder';
import Card from '../components/Card';
import Breadcrumb from '../components/Breadcrumb';

const ComponentsCatalog = () => {
  const { category } = useParams();
  const [items, setItems] = useState([]);

  useEffect(() => {
    // Filter the items database based on the URL parameter
    const filtered = allItems.filter(item => item.category === category);
    setItems(filtered);
    window.scrollTo(0, 0);
  }, [category]);

  const categoryTitle = category ? category.replace('-', ' ').toUpperCase() : 'COMPONENTS';

  // Star Rating Component
  const RatingStars = ({ rating, reviews }) => {
    return (
      <div className="flex items-center gap-1 mt-1 mb-2">
        <div className="flex text-[#F59E0B]">
          {[...Array(5)].map((_, i) => (
            rating >= i + 1 ? <StarIcon key={i} sx={{ fontSize: 16 }} /> :
            rating >= i + 0.5 ? <StarHalfIcon key={i} sx={{ fontSize: 16 }} /> :
            <StarOutlineIcon key={i} sx={{ fontSize: 16, color: '#D5D9D9' }} />
          ))}
        </div>
        <span className="text-[#007185] text-[12px] ml-1 font-medium hover:text-[#C7511F] hover:underline cursor-pointer">{reviews}</span>
      </div>
    );
  };

  return (
    <section className="w-full py-8 pb-24" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
        <Breadcrumb items={[{ label: 'Home', path: '/' }, { label: 'Components', path: '/components' }, { label: categoryTitle }]} />
        
        <div className="flex justify-between items-center mb-8 border-b border-[var(--color-border)] pb-4">
          <h1 className="text-[28px] font-bold text-[#0F1111]">{categoryTitle} CATALOG</h1>
          <div className="text-[14px] text-[#565959]">Showing {items.length} results</div>
        </div>

        {items.length === 0 ? (
          <div className="w-full py-20 flex flex-col items-center justify-center text-[#565959]">
            <h2 className="text-xl font-bold mb-2">No components found</h2>
            <p>We couldn't find any items matching the category "{category}".</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <Card
                key={item.id}
                id={item.id}
                rating={item?.rating}
                image={item.image}
                title={item.title}
                specs={item.specs}
                description={item.description}
                price={item.price}
                mrp={item.mrp}
                discount={item.discount}
                tag={item.discount || 'SALE'}
                tagColor="#EF4444"
                brand={item.brand}
                warranty={item.warranty}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ComponentsCatalog;
