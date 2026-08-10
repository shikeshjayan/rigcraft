import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import LoginPrompt from './LoginPrompt';
import useCountdown from '../hooks/useCountdown';
import { usePublicSettings } from '../context/PublicSettingsContext';

const formatINR = (n) => {
  const num = Number(n);
  return `₹${Number.isFinite(num) ? num.toLocaleString('en-IN') : 0}`;
};

const formatWarranty = (warranty) => {
  if (!warranty?.duration || !warranty?.unit) return null;
  const { duration, unit } = warranty;
  const label = unit === 'year' ? (duration === 1 ? 'Year' : 'Years') : (duration === 1 ? 'Month' : 'Months');
  return `${duration} ${label} Warranty`;
};

const getStockStatus = (stock, lowStockThreshold = 5) => {
  if (typeof stock !== 'number' || stock <= 0) return { status: 'out', text: 'Out of Stock', className: 'text-[#EF4444]' };
  if (stock <= lowStockThreshold) return { status: 'low', text: `Only ${stock} Left`, className: 'text-[#EA580C]' };
  return { status: 'in', text: 'In Stock', className: 'text-[#16A34A]' };
};

const DealCard = ({
  id,
  apiId,
  title,
  image,
  price,
  mrp,
  stock,
  category = '',
  tag,
  tagColor,
  endDate,
  itemType,
  rating = { average: 0, count: 0 },
  description,
  compact = false,
  to,
  brand,
  warranty,
}) => {
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { addToCart, cartItems, updateQuantity, removeFromCart } = useCart();
  const { isLoggedIn } = useAuth();
  const { freeShippingAbove } = usePublicSettings();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [loginPromptMessage, setLoginPromptMessage] = useState("");
  const [flyingImage, setFlyingImage] = useState(null);
  const imageRef = useRef(null);
  const cartFlyTimer = useRef(null);

  useEffect(() => () => {
    if (cartFlyTimer.current) clearTimeout(cartFlyTimer.current);
  }, []);

  const countdown = useCountdown(endDate);

  const type = (itemType === 'prebuilt' || category === 'prebuilt') ? 'prebuilt' : 'product';
  const wishlistId = apiId || id;

  const isWishlisted = wishlist.some(item => item.id === wishlistId);

  const dealPrice = Number(price) || 0;
  const originalMrp = Number(mrp) || 0;
  const hasDiscount = originalMrp > dealPrice && dealPrice > 0;
  const discountPct = hasDiscount ? Math.round(((originalMrp - dealPrice) / originalMrp) * 100) : 0;
  const savings = hasDiscount ? originalMrp - dealPrice : 0;

  const isOutOfStock = typeof stock === 'number' && stock <= 0;
  const lowStockThreshold = 5;
  const isLowStock = !isOutOfStock && typeof stock === 'number' && stock > 0 && stock <= lowStockThreshold;

  const countdownLabel = (() => {
    if (countdown.expired) return null;
    if (countdown.days > 0) return `${countdown.days}d ${countdown.hours}h Left`;
    if (countdown.hours > 0) return `${countdown.hours}h ${countdown.minutes}m Left`;
    return `${countdown.minutes}m ${countdown.seconds}s Left`;
  })();

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
        price: dealPrice,
        mrp: originalMrp || '',
        discount: discountPct ? `${discountPct}%` : '',
        itemType: type,
      });
    }
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      setLoginPromptMessage("You need to log in to your account to add items to the cart.");
      setShowLoginPrompt(true);
      return;
    }

    addToCart({
      id: apiId || id,
      image,
      title,
      price: dealPrice,
      quantity: 1,
      itemType: type,
    });

    const imgEl = imageRef.current;
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

  const formattedTitle = title ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'product';
  const linkTo = to || `/detail/${formattedTitle}/${id}?type=${type}`;

  const averageRating = rating?.average || 0;
  const ratingCount = rating?.count || 0;

  const cartItemId = apiId || id;
  const inCart = cartItems.find(ci => String(ci.id) === String(cartItemId) && ci.itemType === type);

  const tagIsClass = typeof tagColor === 'string' && tagColor.startsWith('bg-');

  const warrantyText = formatWarranty(warranty);
  const stockInfo = getStockStatus(stock);
  const ratingDisplay = ratingCount > 0
    ? `${averageRating.toFixed(1)} (${ratingCount})`
    : 'New';

  const renderStars = () => {
    return [...Array(5)].map((_, i) => {
      const fill = averageRating >= i + 1 ? 1 : (averageRating >= i + 0.5 ? 0.5 : 0);
      if (fill === 1) return <span key={i}>★</span>;
      if (fill === 0.5) return (
        <span key={i} style={{ display: 'inline-flex', position: 'relative', width: '0.5em', overflow: 'hidden' }}>
          <span>★</span>
          <span style={{ position: 'absolute', left: '0.5em', top: 0, color: 'var(--color-text-muted)' }}>★</span>
        </span>
      );
      return <span key={i} className="text-gray-300">★</span>;
    });
  };

  return (
    <Link
      to={linkTo}
      className="relative flex flex-col h-full overflow-hidden border border-gray-300 group transition-all duration-300 cursor-pointer bg-white hover:shadow-xl"
      style={{
        borderRadius: 'var(--radius-sm)',
        minHeight: compact ? '455px' : '555px'
      }}
    >
      <div className="relative w-full aspect-square bg-white flex items-center justify-center border-b border-gray-100 overflow-hidden">
        {hasDiscount && (
          <span className="absolute top-3 left-3 px-2.5 py-1 text-[11px] font-extrabold text-white uppercase tracking-wider rounded-full shadow-sm z-10 bg-[#EF4444]">
            -{discountPct}%
          </span>
        )}

        {tag && (
          <span
            className={`absolute top-3 left-1/2 -translate-x-1/2 px-2.5 py-1 text-[10px] font-bold text-white uppercase tracking-wider rounded-full shadow-sm z-10 ${tagIsClass ? tagColor : ''}`}
            style={tagIsClass ? undefined : { backgroundColor: tagColor || 'var(--color-danger)' }}
          >
            {tag}
          </span>
        )}

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

      <div className="flex flex-col flex-1 p-4">
        <span
          className="text-gray-400 font-bold uppercase tracking-wider mb-2"
          style={{ fontSize: compact ? '9px' : '10px' }}
        >
          {brand || category}
        </span>

        <h3
          title={title}
          className="font-bold text-gray-900 leading-tight mb-2 line-clamp-1"
          style={{ fontSize: compact ? '15px' : '18px' }}
        >
          {title}
        </h3>

        <div className="flex items-center gap-1.5 mb-2">
          <div className="flex text-yellow-400 text-sm" aria-label={`Rating ${averageRating.toFixed(1)} out of 5`}>
            {renderStars()}
          </div>
          <span className="text-gray-400 text-[10px] font-medium">
            {ratingDisplay}
          </span>
        </div>

        {description && (
          <p
            className="text-gray-500 leading-relaxed line-clamp-2 mb-3"
            style={{ fontSize: compact ? '11px' : '13px' }}
          >
            {description}
          </p>
        )}

        <div className="mb-3">
          <div className="flex items-end gap-2 flex-wrap mb-1">
            <span className="font-extrabold text-gray-900 text-xl leading-none">
              {formatINR(dealPrice)}
            </span>
            {hasDiscount && (
              <span className="text-gray-400 line-through text-sm leading-none mb-0.5">
                {formatINR(originalMrp)}
              </span>
            )}
          </div>
          {hasDiscount && (
            <div className="flex items-center gap-1 mt-1.5">
              <span className="text-[#16A34A] font-bold text-[13px]">Save {formatINR(savings)} ({discountPct}%)</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 mt-2 mb-2">
          {endDate && countdownLabel ? (
            <span className={`inline-flex items-center gap-1 font-bold text-[11px] px-2 py-0.5 rounded-full ${countdown.days === 0 && countdown.hours <= 12 ? 'bg-[#FEE2E2] text-[#B91C1C]' : 'bg-[#FFF7ED] text-[#EA580C]'}`}>
              <TimerOutlinedIcon sx={{ fontSize: 13 }} />
              {countdownLabel}
            </span>
          ) : (
            <span className="text-[11px] font-medium text-gray-400">Deal ends soon</span>
          )}

          {isLowStock && (
            <span className="text-[11px] font-bold text-[#B91C1C]">
              Only {stock} Left
            </span>
          )}
        </div>

        {isLowStock && (
          <div className="w-full h-1 bg-gray-100 rounded-full mt-2 mb-2 overflow-hidden">
            <div
              className="h-full bg-[#EF4444] rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (stock / lowStockThreshold) * 100)}%` }}
            ></div>
          </div>
        )}

        <div className={`flex items-center gap-1.5 mb-3 ${stockInfo.className} font-medium text-[12px]`}>
          {stockInfo.status === 'in' && <span>✔</span>}
          {stockInfo.status === 'low' && <span>⚠</span>}
          {stockInfo.status === 'out' && <span>✕</span>}
          {stockInfo.text}
        </div>

        <div className="flex flex-wrap gap-2 mb-4" role="img" aria-label="Trust badges">
          {warrantyText && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-full">
              <ShieldOutlinedIcon sx={{ fontSize: 13 }} />
              {warrantyText}
            </span>
          )}
          {freeShippingAbove > 0 && dealPrice >= freeShippingAbove && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-full">
              <LocalShippingOutlinedIcon sx={{ fontSize: 13 }} />
              Free Shipping
            </span>
          )}
        </div>

        <div className="flex items-stretch gap-2 mt-auto">
          {isOutOfStock ? (
            <button
              type="button"
              disabled
              aria-disabled="true"
              className="flex-1 font-bold py-2.5 px-4 text-[13px] uppercase tracking-wide bg-gray-100 text-gray-400 border-2 border-gray-200 cursor-not-allowed"
              style={{ borderRadius: 'var(--radius-sm)' }}
            >
              Out of Stock
            </button>
          ) : inCart ? (
            <div
              className="flex-1 flex items-center border-2 border-[var(--color-primary)] overflow-hidden"
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
              onClick={handleAddToCart}
              className="flex-1 font-bold py-2.5 px-4 text-[13px] uppercase tracking-wide transition-colors cursor-pointer bg-white text-[var(--color-primary)] border-2 border-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white active:bg-[var(--color-primary)] active:text-white"
              style={{ borderRadius: 'var(--radius-sm)' }}
            >
              Add to Cart
            </button>
          )}
          <button
            type="button"
            onClick={handleWishlistClick}
            aria-label={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
            title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
            className="shrink-0 flex items-center justify-center transition-all duration-300 cursor-pointer bg-white border-2 border-[var(--color-primary)] hover:bg-[#F0F6FF] hover:scale-105 active:bg-[#F0F6FF]"
            style={{
              borderRadius: 'var(--radius-sm)',
              width: 46,
              color: isWishlisted ? 'var(--color-danger, red)' : 'var(--color-primary)'
            }}
          >
            {isWishlisted ? (
              <FavoriteIcon fontSize={compact ? 'small' : 'medium'} />
            ) : (
              <FavoriteBorderIcon fontSize={compact ? 'small' : 'medium'} />
            )}
          </button>
        </div>
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

export default DealCard;