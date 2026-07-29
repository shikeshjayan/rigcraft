import React, { useState } from 'react';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Card = ({ id, image, title, specs, price, tag, tagColor, description, mrp, discount, compact = false, category = '' }) => {
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  
  const isWishlisted = wishlist.some(item => item.id === id);

  const handleWishlistClick = (e) => {
    e.preventDefault(); 
    e.stopPropagation();
    
    if (!isLoggedIn) {
      setShowLoginPrompt(true);
      return;
    }

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
    specParts = specs;
  } else if (typeof specs === 'string') {
    specParts = specs.split('|').map(s => s.trim());
  }
  
  // Use specs as badges and description
  const badges = specParts.slice(0, 3).flatMap(part => part.split(',').map(b => b.trim()).filter(Boolean));
  const derivedDescription = specParts.slice(3).join(' • ');
  const finalDescription = description || derivedDescription;

  // Format title for URL
  const formattedTitle = title ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'product';

  return (
    <div 
      onClick={() => navigate(`/detail/${formattedTitle}/${id}`)}
      className="relative flex flex-col h-full overflow-hidden border border-gray-300 group transition-all duration-300 cursor-pointer bg-white border border-gray-100 hover:shadow-xl"
      style={{ 
        borderRadius: 'var(--radius-sm)', 
        minHeight: compact ? '320px' : '420px'  
      }}
    >
      {/* Image Container */}
      <div className={`w-full ${compact ? 'h-[160px]' : 'h-[220px]'} relative bg-[#f8f9fa] overflow-hidden`}>
        {/* Top Right Tag */}
        {/* {tag && (
          <div 
            className="absolute top-3 right-3 px-3 py-1 text-[10px] font-bold text-white uppercase tracking-wider rounded-full shadow-sm z-10"
            style={{ backgroundColor: tagColor || '#E11D48' }}
          >
            {tag}
          </div>
        )} */}
        
        {/* Hover Wishlist Button (Top Left) */}
        <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
          <button 
            onClick={handleWishlistClick}
            className={`flex items-center cursor-pointer justify-center transition-all duration-300 hover:scale-110 shadow-md ${compact ? 'w-8 h-8' : 'w-10 h-10'} rounded-full bg-white`}
            style={{ 
              color: isWishlisted ? '#E11D48' : '#4B5563'
            }}
            title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
          >
            {isWishlisted ? (
              <FavoriteIcon sx={{ fontSize: compact ? 18 : 20 }} />
            ) : (
              <FavoriteBorderIcon sx={{ fontSize: compact ? 18 : 20 }} />
            )}
          </button>
        </div>

        <img 
          src={image || 'https://placehold.co/400x400/transparent/black?text=Product'} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
        />
      </div>

      {/* Details Section */}
      <div className="p-5 flex flex-col flex-grow text-left">
        {/* Category */}
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
          {category || 'HIGH-PERFORMANCE LAPTOP'}
        </span>

        {/* Title */}
        <h3 
          className="font-bold text-gray-900 leading-tight mb-2 line-clamp-1"
          style={{ fontSize: compact ? '15px' : '18px' }}
        >
          {title}
        </h3>

        {/* Description */}
        {finalDescription && (
          <p 
            className="text-gray-500 leading-relaxed line-clamp-2 mb-4"
            style={{ fontSize: compact ? '11px' : '13px' }}
          >
            {finalDescription}
          </p>
        )}

        {/* Badges */}
        {badges.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4 mt-auto">
            {badges.map((badge, idx) => (
              <span 
                key={idx} 
                className="text-[10px] font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full whitespace-nowrap"
              >
                {badge}
              </span>
            ))}
          </div>
        )}
        
        {/* Price Row and Ratings */}
        <div className="flex items-center justify-between mb-4 mt-auto">
          <div className="flex flex-col gap-0.5">
            {mrp && (
              <span className="text-gray-400 line-through text-xs">{mrp}</span>
            )}
            <span className="font-extrabold text-gray-900 text-xl">
              {price}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-auto">
            <div className="flex text-yellow-400 text-sm">
              ★★★★★
            </div>
            <span className="text-gray-400 text-[10px] font-medium">245</span>
          </div>
        </div>
      </div>

      {/* Login Prompt Popup */}
      {showLoginPrompt && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowLoginPrompt(false);
          }}
        >
          <div 
            className="bg-white p-6 shadow-2xl max-w-sm w-full relative animate-in fade-in zoom-in duration-200"
            style={{ borderRadius: 'var(--radius-sm)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-extrabold text-gray-900 mb-2">Login Required</h3>
            <p className="text-gray-600 mb-6 text-sm font-medium">You need to log in to your account to add items to the wishlist.</p>
            <div className="flex gap-3">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowLoginPrompt(false);
                }}
                className="flex-1 py-2 font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
                style={{ borderRadius: 'var(--radius-sm)' }}
              >
                Cancel
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigate('/login');
                }}
                className="flex-1 py-2 font-bold text-white bg-[var(--color-primary)] hover:opacity-90 transition-colors shadow-md cursor-pointer"
                style={{ borderRadius: 'var(--radius-sm)' }}
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Card;

