import React, { useState } from 'react';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import LoginPrompt from './LoginPrompt';

const Card = ({ id, apiId, image, title, specs, price, tag, tagColor, description, mrp, discount, compact = false, category = '', rating = { average: 0, count: 0 }, itemType }) => {
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const wishlistId = apiId || id;
  const type = (itemType === 'prebuilt' || category === 'prebuilt') ? 'prebuilt' : 'product';
  
  const isWishlisted = wishlist.some(item => item.id === wishlistId);

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      setShowLoginPrompt(true);
      return;
    }

    if (isWishlisted) {
      removeFromWishlist(wishlistId);
    } else {
      addToWishlist({
        id: wishlistId,
        image,
        title,
        price,
        mrp: mrp || '',
        discount: discount || '',
        itemType: type
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

  const averageRating = rating?.average || 0;
  const ratingCount = rating?.count || 0;

  return (
    <div
      onClick={() => navigate(`/detail/${formattedTitle}/${id}${category ? `?type=${category}` : ''}`)}
      className="relative flex flex-col h-full overflow-hidden border border-gray-300 group transition-all duration-300 cursor-pointer bg-white border border-gray-100 hover:shadow-xl"
      style={{
        borderRadius: 'var(--radius-sm)',
        minHeight: compact ? '320px' : '420px'
      }}
    >
      {/* Image Container */}
      <div className="relative w-full aspect-square bg-white flex items-center justify-center border-b border-gray-100 overflow-hidden">
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
              <FavoriteIcon fontSize={compact ? 'small' : 'medium'} />
            ) : (
              <FavoriteBorderIcon fontSize={compact ? 'small' : 'medium'} />
            )}
          </button>
        </div>

        {image ? (
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-400 group-hover:bg-gray-200 transition-colors duration-300">
            <ImageOutlinedIcon sx={{ fontSize: 40, opacity: 0.5, mb: 1 }} />
            <span className="text-[10px] font-bold tracking-wider">NO IMAGE</span>
          </div>
        )}
      </div>

      {/* Content Container */}
      <div className="flex flex-col flex-1 p-4">
        {/* Brand/Category Tag */}
        <span
          className="text-gray-400 font-bold uppercase tracking-wider mb-2"
          style={{ fontSize: compact ? '9px' : '10px' }}
        >
          {category || 'Product'}
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
              {[...Array(5)].map((_, i) => {
                if (averageRating >= i + 1) return <span key={i}>★</span>;
                if (averageRating >= i + 0.5) return <span key={i}>★</span>; 
                return <span key={i} className="text-gray-300">★</span>;
              })}
            </div>
            <span className="text-gray-400 text-[10px] font-medium">({ratingCount})</span>
          </div>
        </div>
      </div>

      <LoginPrompt
        isOpen={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        message="You need to log in to your account to add items to the wishlist."
      />
    </div>
  );
};

export default Card;

