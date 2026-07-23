import React from 'react';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useWishlist } from '../context/WishlistContext';

const Card = ({ id, image, title, specs, price, tag, tagColor, description, mrp, discount, compact = false, buttonText = 'Add to cart' }) => {
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();
  
  const isWishlisted = wishlist.some(item => item.id === id);

  const handleWishlistClick = (e) => {
    e.preventDefault(); // Prevent navigating if wrapped in a Link
    e.stopPropagation();
    
    if (isWishlisted) {
      removeFromWishlist(id);
    } else {
      addToWishlist({
        id,
        image,
        title,
        price,
        mrp: mrp || '',
        discount: discount || ''
      });
    }
  };
  // Handle specs whether it is an array or a pipe-separated string
  let specParts = [];
  if (Array.isArray(specs)) {
    // If it's already an array, just use it (and optionally split by comma if needed, but we'll just use it directly)
    specParts = specs;
  } else if (typeof specs === 'string') {
    specParts = specs.split('|').map(s => s.trim());
  }
  
  // Use first 2 specs as badges, rest as description if description prop is not provided
  const badges = specParts.slice(0, 2);
  const derivedDescription = specParts.slice(2).join(' • ');
  const finalDescription = description || derivedDescription;

  return (
    <div 
      className="relative flex flex-col h-full overflow-hidden group transition-all duration-300 hover:scale-[1.02] cursor-pointer shadow-xl"
      style={{ 
        borderRadius: 'var(--radius-card)', 
        background: 'linear-gradient(135deg, #a78bfa 0%, #818cf8 100%)',
        minHeight: compact ? '300px' : '400px'
      }}
    >
      {/* Top Left Tag (Optional if passed) */}
      {tag && (
        <div 
          className={`absolute top-4 left-4 ${compact ? 'px-2 py-1 text-[8px]' : 'px-3 py-1.5 text-[10px]'} font-[800] text-white uppercase tracking-wider rounded-md shadow-sm z-10`}
          style={{ backgroundColor: tagColor || '#2563EB' }}
        >
          {tag}
        </div>
      )}

      {/* Wishlist Icon */}
      <div 
        onClick={handleWishlistClick}
        className={`absolute top-4 right-4 ${compact ? 'w-7 h-7' : 'w-9 h-9'} rounded-full backdrop-blur-md border flex items-center justify-center cursor-pointer z-20 transition-colors shadow-sm ${
          isWishlisted 
            ? 'bg-red-50 border-red-200 text-[#FF3E6C] hover:bg-red-100' 
            : 'bg-white/30 border-white/40 text-white hover:bg-white/50'
        }`}
      >
        {isWishlisted ? (
          <FavoriteIcon sx={{ fontSize: compact ? 16 : 20 }} />
        ) : (
          <FavoriteBorderIcon sx={{ fontSize: compact ? 16 : 20 }} />
        )}
      </div>

      {/* Image Container */}
      <div className={`w-full ${compact ? 'h-[150px]' : 'h-[220px]'} flex items-center justify-center overflow-hidden relative`}>
        <img 
          src={image || 'https://placehold.co/400x400/transparent/white?text=PC'} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
        />
      </div>

      {/* White Inset Section */}
      <div 
        className={`-mt-4 ${compact ? 'p-3' : 'p-5'} bg-white flex flex-col flex-grow relative z-10`}
        style={{ borderRadius: 'var(--radius-card-inset) var(--radius-card-inset) var(--radius-sm) var(--radius-sm)' }}
      >
        {/* Title */}
        <h3 
          className="font-extrabold text-[#111111] leading-tight mb-3"
          style={{ fontSize: compact ? '14px' : 'var(--font-card-title)' }}
        >
          {title}
        </h3>
        
        {/* Badges */}
        {badges.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {badges.map((badge, idx) => (
              <span 
                key={idx} 
                className={`${compact ? 'text-[9px] px-1.5 py-0.5' : 'text-[11px] px-2 py-1'} font-bold border border-gray-300 text-gray-600 uppercase tracking-wider rounded-sm`}
              >
                {badge}
              </span>
            ))}
          </div>
        )}

        {/* Description */}
        {finalDescription && (
          <p 
            className="text-[#6B7280] leading-relaxed line-clamp-3 mb-6 flex-grow"
            style={{ fontSize: compact ? '12px' : 'var(--font-card-paragraph)' }}
          >
            {finalDescription}
          </p>
        )}

        {/* Footer: Price & Button */}
        <div className="flex justify-between items-end mt-auto pt-2">
          <div className="flex flex-col">
            <span className={`${compact ? 'text-[9px]' : 'text-[11px]'} font-bold text-gray-500 uppercase tracking-widest mb-1`}>
              Price
            </span>
            <span 
              className="font-extrabold text-[#111111] leading-none"
              style={{ fontSize: compact ? '18px' : 'var(--font-card-price)' }}
            >
              {price}
            </span>
          </div>

          <button 
            className={`font-bold ${compact ? 'py-1.5 px-3 text-[12px]' : 'py-2.5 px-6'} transition-colors hover:opacity-90 shadow-sm text-white cursor-pointer`}
            style={{ 
              backgroundColor: 'var(--color-primary)', 
              borderRadius: 'var(--radius-sm)'
            }}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Card;
