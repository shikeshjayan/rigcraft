import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { allItems } from '../data/items';
import StarIcon from '@mui/icons-material/Star';
import StarHalfIcon from '@mui/icons-material/StarHalf';
import StarOutlineIcon from '@mui/icons-material/StarBorder';

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
        
        <div className="flex justify-between items-center mb-8 border-b border-[#E2E8F0] pb-4">
          <h1 className="text-[28px] font-bold text-[#0F1111]">{categoryTitle} CATALOG</h1>
          <div className="text-[14px] text-[#565959]">Showing {items.length} results</div>
        </div>

        {items.length === 0 ? (
          <div className="w-full py-20 flex flex-col items-center justify-center text-[#565959]">
            <h2 className="text-xl font-bold mb-2">No components found</h2>
            <p>We couldn't find any items matching the category "{category}".</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {items.map((item) => (
              <Link 
                to={`/detail/${item.id}`}
                key={item.id} 
                className="flex flex-col bg-white overflow-hidden relative cursor-pointer group shadow-sm hover:shadow-xl transition-shadow border border-[#E7E7E7]"
                style={{ borderRadius: 'var(--radius-sm, 6px)' }}
              >
                {/* Product Image */}
                <div className="relative w-full aspect-square bg-[#F3F4F6] flex items-center justify-center p-6 overflow-hidden">
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 mix-blend-multiply"
                  />
                  <div className="absolute top-[10px] right-[10px] bg-black/70 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                    {item.brand}
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="text-[15px] font-bold text-[#007185] group-hover:text-[#C7511F] line-clamp-2 leading-snug mb-1 transition-colors">
                    {item.title}
                  </h3>
                  
                  <RatingStars rating={item.rating} reviews={item.reviews} />
                  
                  <div className="text-[12px] text-[#565959] line-clamp-2 mb-3 flex-grow">
                    {item.specs[0]}
                  </div>

                  {/* Price Section */}
                  <div className="mt-auto">
                    <div className="flex items-baseline gap-1.5 mb-1">
                      <span className="text-[22px] font-bold text-[#0F1111] leading-none">{item.price}</span>
                      <span className="text-[12px] text-[#565959] line-through">{item.mrp}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-white bg-[#CC0C39] text-[10px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                        {item.discount}
                      </span>
                    </div>

                    <div className="text-[12px] text-[#565959]">
                      <span className="text-[#007185] font-bold">FREE Delivery</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ComponentsCatalog;
