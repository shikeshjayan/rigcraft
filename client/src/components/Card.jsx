import React, { useState } from 'react';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Card = ({ id, image, title, specs, price, tag, tagColor, description, mrp, discount, compact = false, buttonText = 'Add to cart' }) => {
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  
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
  
  // Use first 2 specs as badges (split by comma), rest as description if description prop is not provided
  const badges = specParts.slice(0, 2).flatMap(part => part.split(',').map(b => b.trim()).filter(Boolean));
  const derivedDescription = specParts.slice(2).join(' • ');
  const finalDescription = description || derivedDescription;

  return (
    <div 
      className="relative flex flex-col h-full overflow-hidden group transition-all duration-300 cursor-pointer shadow-xl shadow-black/20 bg-white"
      style={{ 
        borderRadius: 'var(--radius-sm)', 
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

      {/* Image Container */}
      <div className={`w-full ${compact ? 'h-[150px]' : 'h-[220px]'} flex items-center justify-center relative bg-white`}>
        <img 
          src={image || 'https://placehold.co/400x400/transparent/white?text=PC'} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
        />
      </div>

      {/* Details Section */}
      <div 
        className={`p-5 flex flex-col flex-grow relative z-10 bg-white`}
      >
        {/* Badges / Category */}
        {badges.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {badges.map((badge, idx) => (
              <span 
                key={idx} 
                className={`${compact ? 'text-[9px]' : 'text-[11px]'} font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full uppercase tracking-wider`}
              >
                {badge}
              </span>
            ))}
          </div>
        )}

        {/* Title and Price */}
        <div className="flex flex-col items-center gap-1.5 mb-3 text-center">
          <h3 
            className="font-bold text-black leading-tight"
            style={{ fontSize: compact ? '14px' : '16px' }}
          >
            {title}
          </h3>
          <span 
            className="font-black text-black leading-tight"
            style={{ fontSize: compact ? '14px' : '16px' }}
          >
            {price}
          </span>
        </div>

        {/* Description (Hidden on compact if too long, or stylized) */}
        {finalDescription && (
          <p 
            className="text-gray-600 leading-relaxed line-clamp-2 mb-6 flex-grow"
            style={{ fontSize: compact ? '11px' : '12px' }}
          >
            {finalDescription}
          </p>
        )}
        {!finalDescription && <div className="flex-grow"></div>}

        {/* Footer: Add to Cart & Wishlist */}
        <div className="flex items-center gap-3 mt-auto">
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!isLoggedIn) {
                setShowLoginPrompt(true);
              } else {
                addToCart({ id, image, title, specs, price, mrp, discount, description });
              }
            }}
            className={`flex-grow flex items-center justify-center font-extrabold uppercase tracking-wide ${compact ? 'py-2 text-[11px]' : 'py-3 text-[13px]'} transition-colors hover:opacity-90 shadow-sm text-white cursor-pointer`}
            style={{ borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-primary)' }}
            title={buttonText}
          >
            {buttonText}
          </button>
          
          <button 
            onClick={handleWishlistClick}
            className={`flex items-center justify-center transition-colors hover:opacity-80 ${compact ? 'w-9 h-9' : 'w-[45px] h-[45px]'} cursor-pointer shrink-0`}
            style={{ 
              borderRadius: 'var(--radius-sm)',
              backgroundColor: isWishlisted ? 'var(--color-primary)' : 'rgba(37, 99, 235, 0.1)',
              color: isWishlisted ? 'white' : 'var(--color-primary)'
            }}
          >
            {isWishlisted ? (
              <FavoriteIcon sx={{ fontSize: compact ? 18 : 22, color: 'inherit' }} />
            ) : (
              <FavoriteBorderIcon sx={{ fontSize: compact ? 18 : 22, color: 'inherit' }} />
            )}
          </button>
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
            <p className="text-gray-600 mb-6 text-sm font-medium">You need to log in to your account to add items to the cart.</p>
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
