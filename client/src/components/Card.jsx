import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import LoginPrompt from './LoginPrompt';

const Card = ({ id, apiId, image, title, specs, price, description, mrp, discount, compact = false, category = '', rating = { average: 0, count: 0 }, itemType, buttonText, onButtonClick, tag, tagColor, to, stock }) => {
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { addToCart, cartItems, updateQuantity, removeFromCart } = useCart();
  const { isLoggedIn } = useAuth();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [loginPromptMessage, setLoginPromptMessage] = useState("");
  const [flyingImage, setFlyingImage] = useState(null);
  const imageRef = useRef(null);
  const cartFlyTimer = useRef(null);

  useEffect(() => () => {
    if (cartFlyTimer.current) clearTimeout(cartFlyTimer.current);
  }, []);

  const wishlistId = apiId || id;
  const type = (itemType === 'prebuilt' || category === 'prebuilt') ? 'prebuilt' : 'product';

  const isWishlisted = wishlist.some(item => item.id === wishlistId);

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      setLoginPromptMessage("You need to log in to your account to add items to the wishlist.");
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
  const linkTo = to || `/detail/${formattedTitle}/${id}${category ? `?type=${category}` : ''}`;

  const averageRating = rating?.average || 0;
  const ratingCount = rating?.count || 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      setLoginPromptMessage("You need to log in to your account to add items to the cart.");
      setShowLoginPrompt(true);
      return;
    }

    // Perform standard add to cart
    addToCart({
      id: apiId || id,
      image,
      title,
      price: typeof price === 'string' ? parseFloat(price.replace(/[^0-9.-]+/g,"")) : price,
      quantity: 1,
      itemType: type
    });

    // Flying animation logic
    const imgEl = imageRef.current;
    // Try desktop icon first, fallback to mobile icon
    const cartIcon = document.getElementById('navbar-cart-icon') || document.getElementById('mobile-navbar-cart-icon');

    if (imgEl && cartIcon && image) {
      const rect = imgEl.getBoundingClientRect();
      const cartRect = cartIcon.getBoundingClientRect();

      setFlyingImage({ start: rect, end: cartRect });

      cartFlyTimer.current = setTimeout(() => {
        setFlyingImage(null);
        window.dispatchEvent(new Event('added-to-cart'));
      }, 800);
    } else {
      window.dispatchEvent(new Event('added-to-cart'));
    }
  };

  const handleButtonClick = (e) => {
    if (typeof onButtonClick === 'function') {
      e.preventDefault();
      e.stopPropagation();
      onButtonClick();
      return;
    }
    handleAddToCart(e);
  };

  const buttonLabel = buttonText || 'Add to Cart';

  const isOutOfStock = typeof stock === 'number' && stock <= 0;

  const cartItemId = apiId || id;
  const inCart = cartItems.find(ci => String(ci.id) === String(cartItemId) && ci.itemType === type);

  const tagIsClass = typeof tagColor === 'string' && tagColor.startsWith('bg-');

  return (
    <Link
      to={linkTo}
      className="relative flex flex-col h-full overflow-hidden border border-gray-300 group transition-all duration-300 cursor-pointer bg-white hover:shadow-xl"
      style={{
        borderRadius: 'var(--radius-sm)',
        minHeight: compact ? '320px' : '420px'
      }}
    >
      {/* Image Container */}
      <div className="relative w-full aspect-square bg-white flex items-center justify-center border-b border-gray-100 overflow-hidden">
        {/* Discount/Tag Badge (Top Right) */}
        {tag && (
          <span
            className={`absolute top-3 right-3 px-2.5 py-1 text-[10px] font-bold text-white uppercase tracking-wider rounded-full shadow-sm z-10 ${tagIsClass ? tagColor : ''}`}
            style={tagIsClass ? undefined : { backgroundColor: tagColor || 'var(--color-danger)' }}
          >
            {tag}
          </span>
        )}

        {/* Wishlist Button (Top Left) */}
        <div className="absolute top-3 left-3 opacity-100 transition-opacity duration-300 z-20 pointer-fine:opacity-0 pointer-fine:group-hover:opacity-100">
          <button
            type="button"
            onClick={handleWishlistClick}
            aria-label={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
            title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
            className={`flex items-center cursor-pointer justify-center transition-all duration-300 hover:scale-110 shadow-md ${compact ? 'w-8 h-8' : 'w-10 h-10'} rounded-full relative overflow-hidden`}
            style={{
              color: isWishlisted ? 'var(--color-danger, red)' : 'white'
            }}
          >
            <div className="absolute inset-0 z-0 opacity-80" style={{ backgroundColor: 'var(--color-primary, #06B6D4)' }}></div>
            <div className="relative z-10 flex items-center justify-center">
              {isWishlisted ? (
                <FavoriteIcon fontSize={compact ? 'small' : 'medium'} />
              ) : (
                <FavoriteBorderIcon fontSize={compact ? 'small' : 'medium'} />
              )}
            </div>
          </button>
        </div>

        {image ? (
          <img
            ref={imageRef}
            src={image}
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
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
        {category && (
          <span
            className="text-gray-400 font-bold uppercase tracking-wider mb-2"
            style={{ fontSize: compact ? '9px' : '10px' }}
          >
            {category}
          </span>
        )}

        {/* Title */}
        <h3
          title={title}
          className="font-bold text-gray-900 leading-tight mb-2 line-clamp-1"
          style={{ fontSize: compact ? '15px' : '18px' }}
        >
          {title}
        </h3>

        {/* Spec Badges */}
        {/* {badges.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {badges.slice(0, 3).map((b, i) => (
              <span
                key={i}
                className="px-2 py-0.5 text-[10px] font-semibold rounded-full"
                style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-secondary)' }}
              >
                {b}
              </span>
            ))}
          </div>
        )} */}

        {/* Description */}
        {finalDescription && (
          <p
            className="text-gray-500 leading-relaxed line-clamp-2 mb-4"
            style={{ fontSize: compact ? '11px' : '13px' }}
          >
            {finalDescription}
          </p>
        )}

        {/* Price Row and Ratings */}
        <div className="flex items-center justify-between mb-4 mt-auto pt-2">
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

        {/* Action Button */}
        {isOutOfStock ? (
          <button
            type="button"
            disabled
            aria-disabled="true"
            className="w-full font-bold py-2.5 px-4 text-[13px] uppercase tracking-wide bg-gray-100 text-gray-400 border-2 border-gray-200 cursor-not-allowed"
            style={{ borderRadius: 'var(--radius-sm)' }}
          >
            Out of Stock
          </button>
        ) : inCart && typeof onButtonClick !== 'function' ? (
          <div
            className="w-full flex items-center border-2 border-[var(--color-primary)] overflow-hidden"
            style={{ borderRadius: 'var(--radius-sm)' }}
          >
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if ((inCart.qty || 1) > 1) {
                  updateQuantity(inCart.cartItemId, (inCart.qty || 1) - 1);
                } else {
                  removeFromCart(inCart.cartItemId);
                }
              }}
              aria-label={(inCart.qty || 1) <= 1 ? 'Remove from cart' : 'Decrease quantity'}
              className="flex-1 py-2.5 flex items-center justify-center font-bold text-[var(--color-primary)] hover:bg-[#F0F6FF] transition-colors cursor-pointer"
            >
              −
            </button>
            <span className="w-12 text-center font-bold text-[14px] text-gray-900">{inCart.qty || 1}</span>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                updateQuantity(inCart.cartItemId, Math.min((inCart.qty || 1) + 1, typeof stock === 'number' && stock > 0 ? stock : Infinity));
              }}
              disabled={typeof stock === 'number' && stock > 0 && (inCart.qty || 1) >= stock}
              aria-label="Increase quantity"
              className="flex-1 py-2.5 flex items-center justify-center font-bold text-[var(--color-primary)] hover:bg-[#F0F6FF] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              +
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleButtonClick}
            className="w-full font-bold py-2.5 px-4 text-[13px] uppercase tracking-wide transition-colors cursor-pointer bg-white text-[var(--color-primary)] border-2 border-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white active:bg-[var(--color-primary)] active:text-white"
            style={{ borderRadius: 'var(--radius-sm)' }}
          >
            {buttonLabel}
          </button>
        )}
      </div>

      <LoginPrompt
        isOpen={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        message={loginPromptMessage}
      />

      {flyingImage && createPortal(
        <motion.img
          src={image}
          initial={{
            position: 'fixed',
            top: flyingImage.start.top,
            left: flyingImage.start.left,
            width: flyingImage.start.width,
            height: flyingImage.start.height,
            zIndex: 99999,
            objectFit: 'contain'
          }}
          animate={{
            top: flyingImage.end.top + flyingImage.end.height / 2 - 15,
            left: flyingImage.end.left + flyingImage.end.width / 2 - 15,
            width: 30,
            height: 30,
            opacity: 0.2,
            scale: 0.1
          }}
          transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
          className="pointer-events-none rounded-full shadow-lg"
        />,
        document.body
      )}
    </Link>
  );
};

export default Card;
