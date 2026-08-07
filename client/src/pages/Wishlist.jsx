import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import FadeUp from '../components/FadeUp';
import Breadcrumb from '../components/Breadcrumb';
import LoginPrompt from '../components/LoginPrompt';
import Pagination from '../components/Pagination';
import WishlistCard from '../components/WishlistCard';
import WishlistRecommendations from '../sections/WishlistRecommendations';
import StorefrontConfirm from '../components/StorefrontConfirm';
import { subscribeStockAlert } from '../api/stockAlert';
import { useToast } from '../components/toast/useToast';
import { motion, AnimatePresence } from 'framer-motion';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import AddShoppingCartOutlinedIcon from '@mui/icons-material/AddShoppingCartOutlined';
import DeleteSweepOutlinedIcon from '@mui/icons-material/DeleteSweepOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const ITEMS_PER_PAGE = 20;

const SORT_OPTIONS = [
  { key: 'recent', label: 'Recently Added' },
  { key: 'priceLow', label: 'Price: Low to High' },
  { key: 'priceHigh', label: 'Price: High to Low' },
  { key: 'nameAZ', label: 'Name A–Z' },
];

const FILTER_OPTIONS = [
  { key: 'all', label: 'All' },
  { key: 'product', label: 'Components' },
  { key: 'prebuilt', label: 'Prebuilt PCs' },
];

const parsePrice = (val) => {
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    const parsed = parseFloat(val.replace(/[^0-9.-]+/g, ''));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const getItemPrice = (item) =>
  parsePrice(item.price || item.pricing?.salePrice || item.pricing?.price || item.selling);

const getItemType = (item) => (item.itemType === 'prebuilt' ? 'prebuilt' : 'product');

const isOutOfStock = (item) => typeof item.stock === 'number' && item.stock <= 0;

const Wishlist = () => {
  const { wishlist, isLoading, removeFromWishlist, moveAllToCart, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { isLoggedIn } = useAuth();
  const { toast } = useToast();

  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [loginMessage, setLoginMessage] = useState('');
  const [flyingItem, setFlyingItem] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target)) setSortOpen(false);
    };
    const handleEscape = (e) => {
      if (e.key === 'Escape') setSortOpen(false);
    };
    if (sortOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [sortOpen]);

  const filteredWishlist = wishlist.filter(
    (item) => filterKey === 'all' || getItemType(item) === filterKey
  );

  const sortedWishlist = [...filteredWishlist].sort((a, b) => {
    switch (sortKey) {
      case 'priceLow':
        return getItemPrice(a) - getItemPrice(b);
      case 'priceHigh':
        return getItemPrice(b) - getItemPrice(a);
      case 'nameAZ':
        return (a.title || a.name || '').localeCompare(b.title || b.name || '');
      case 'recent':
      default: {
        const aTime = new Date(a.addedAt || 0).getTime();
        const bTime = new Date(b.addedAt || 0).getTime();
        return bTime - aTime;
      }
    }
  });

  const totalPages = Math.max(1, Math.ceil(sortedWishlist.length / ITEMS_PER_PAGE));

  const currentPage = Math.min(page, totalPages);
  const currentItems = sortedWishlist.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const availableCount = wishlist.filter((item) => !isOutOfStock(item)).length;
  const outOfStockCount = wishlist.filter((item) => isOutOfStock(item)).length;

  const scrollCarouselLeft = () => {
    if (carouselRef.current) carouselRef.current.scrollBy({ left: -carouselRef.current.clientWidth * 0.8, behavior: 'smooth' });
  };
  const scrollCarouselRight = () => {
    if (carouselRef.current) carouselRef.current.scrollBy({ left: carouselRef.current.clientWidth * 0.8, behavior: 'smooth' });
  };

  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;
    const update = () => setCanScroll(el.scrollWidth > el.clientWidth + 1);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [currentItems.length, page, filterKey, sortKey]);

  const handlePageChange = (nextPage) => {
    if (nextPage < 1 || nextPage > totalPages) return;
    setPage(nextPage);
  };

  const handleAddToCart = (e, item) => {
    if (!isLoggedIn) {
      setLoginMessage('You need to log in to your account to add items to the cart.');
      setShowLoginPrompt(true);
      return;
    }

    const rect = document.getElementById(`wishlist-img-${item.id}`)?.getBoundingClientRect();
    if (rect) {
      setFlyingItem({
        image: item.image || (typeof item.images?.[0] === 'string' ? item.images[0] : item.images?.[0]?.url) || '/placeholder.png',
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height
      });
      setTimeout(() => setFlyingItem(null), 800);
    }

    addToCart(item);

    removeFromWishlist(item.id || item._id);
  };

  const handleMoveAll = async () => {
    if (!isLoggedIn) {
      setLoginMessage('You need to log in to your account to move items to the cart.');
      setShowLoginPrompt(true);
      return;
    }
    if (isMovingAll) return;
    setIsMovingAll(true);
    try {
      await moveAllToCart();
    } finally {
      setIsMovingAll(false);
    }
  };

  const handleNotifyMe = async (item) => {
    if (!isLoggedIn) {
      setLoginMessage('Sign in to get notified when this item is back in stock.');
      setShowLoginPrompt(true);
      return;
    }
    try {
      await subscribeStockAlert(getItemType(item), item.id || item._id);
      toast("We'll email you when it's back in stock!");
    } catch (err) {
      toast(err.response?.data?.message || 'Could not subscribe. Try again later.', 'error');
    }
  };

  const handleShare = async () => {
    if (wishlist.length === 0) return;
    const lines = wishlist
      .slice(0, 20)
      .map((item, index) => `${index + 1}. ${item.title || item.name} — ₹${getItemPrice(item).toLocaleString('en-IN')}`)
      .join('\n');
    const text = `My RigCraft Wishlist (${wishlist.length} items):\n\n${lines}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'My RigCraft Wishlist', text });
      } else {
        await navigator.clipboard.writeText(text);
        toast('Wishlist copied to clipboard!');
      }
    } catch {
      // Share dismissed by user
    }
  };

  const activeSortLabel = SORT_OPTIONS.find((o) => o.key === sortKey)?.label;

  return (
    <FadeUp delay={0.1}>
    <div className="w-full min-h-screen bg-white py-12 px-6 lg:px-8 pb-28 lg:pb-12">
      <div className="max-w-[1400px] mx-auto">

        {/* Header */}
        <Breadcrumb items={[{ label: 'Home', path: '/' }, { label: 'Wishlist' }]} />
        <div className="mb-8">
          <h1 className="text-[28px] md:text-[32px] font-[800] text-[#282C3F] tracking-tight">My Wishlist</h1>
          <p className="text-[16px] font-medium text-[#696E79] mt-1">
            {isLoading ? 'Loading…' : `${wishlist.length} Saved ${wishlist.length === 1 ? 'Item' : 'Items'}`}
          </p>
          <p className="text-[13px] text-[#94969F] mt-0.5">Move your favorite products to cart anytime.</p>

          {wishlist.length > 0 && (
            <div className="flex flex-wrap items-center gap-3 mt-5 justify-center sm:justify-start">
              <button
                type="button"
                onClick={handleMoveAll}
                disabled={isMovingAll}
                className="inline-flex items-center gap-2 bg-[var(--color-primary)] text-white font-bold text-[13px] tracking-wide py-2.5 px-5 hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
              >
                <AddShoppingCartOutlinedIcon sx={{ fontSize: 18 }} />
                {isMovingAll ? 'Moving…' : 'Move All to Cart'}
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-2 border border-[#D4D5D9] text-[#282C3F] font-bold text-[13px] tracking-wide py-2.5 px-5 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <ShareOutlinedIcon sx={{ fontSize: 18 }} />
                Share Wishlist
              </button>
              <button
                type="button"
                onClick={() => setShowClearConfirm(true)}
                className="inline-flex items-center gap-2 border border-[#D4D5D9] text-[#7E818C] font-bold text-[13px] tracking-wide py-2.5 px-5 hover:bg-gray-50 hover:text-[#CC0C39] transition-colors cursor-pointer"
              >
                <DeleteSweepOutlinedIcon sx={{ fontSize: 18 }} />
                Clear Wishlist
              </button>
            </div>
          )}
        </div>

        {/* Wishlist Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-[var(--color-primary)] border-t-transparent" />
          </div>
        ) : wishlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="w-24 h-24 rounded-full bg-[#FFF0F3] flex items-center justify-center mb-6"
            >
              <FavoriteBorderOutlinedIcon sx={{ fontSize: 44, color: '#CC0C39' }} />
            </motion.div>
            <h2 className="text-[24px] font-bold text-[#282C3F] mb-3">Your Wishlist is Empty</h2>
            <p className="text-[#696E79] max-w-[380px] mb-8 leading-relaxed">
              Save products you love and find them quickly later. They'll be waiting for you here.
            </p>
            <Link
              to="/"
              className="px-8 py-3 bg-[var(--color-primary)] text-white font-bold tracking-wide hover:opacity-90 transition-opacity"
            >
              CONTINUE SHOPPING
            </Link>
          </div>
        ) : (
          <>
            {/* Sort / Filter / Summary */}
            <div className="flex flex-wrap items-center gap-3 mb-6 justify-center sm:justify-start">
              <div className="relative" ref={sortRef}>
                <button
                  type="button"
                  onClick={() => setSortOpen((o) => !o)}
                  aria-expanded={sortOpen}
                  className="inline-flex items-center gap-2 border border-[#D4D5D9] bg-white text-[#282C3F] text-[13px] font-semibold py-2 px-4 hover:bg-gray-50 transition-colors cursor-pointer w-52 justify-between"
                >
                  <span className="truncate">{activeSortLabel}</span>
                  <SwapVertIcon sx={{ fontSize: 16 }} />
                </button>
                <AnimatePresence>
                  {sortOpen && (
                    <motion.ul
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 top-full mt-2 w-52 bg-white border border-[#E2E8F0] shadow-xl z-40 py-1"
                    >
                      {SORT_OPTIONS.map((option) => (
                        <li key={option.key}>
                          <button
                            type="button"
                            onClick={() => {
                              setSortKey(option.key);
                              setSortOpen(false);
                              setPage(1);
                            }}
                            className={`w-full text-left px-4 py-2.5 text-[13px] font-medium hover:bg-[#F0F6FF] transition-colors cursor-pointer ${
                              sortKey === option.key ? 'text-[var(--color-primary)] bg-[#F0F6FF] font-bold' : 'text-[#282C3F]'
                            }`}
                          >
                            {option.label}
                          </button>
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {FILTER_OPTIONS.map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => {
                      setFilterKey(option.key);
                      setPage(1);
                    }}
                    className={`px-3.5 py-1.5 text-[12px] font-bold rounded-full border transition-colors cursor-pointer ${
                      filterKey === option.key
                        ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                        : 'bg-white text-[#696E79] border-[#D4D5D9] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <div className="sm:ml-auto flex items-center gap-2 text-[12px] font-semibold text-[#696E79] justify-center sm:justify-start flex-wrap">
                <span className="px-3 py-1.5 bg-gray-50 border border-[#EAEAEC] rounded-full">
                  Items: {wishlist.length}
                </span>
                <span className="px-3 py-1.5 bg-[#ECFDF5] border border-[#A7F3D0] text-[#047857] rounded-full">
                  Available: {availableCount}
                </span>
                <span className="px-3 py-1.5 bg-[#FEF2F2] border border-[#FECACA] text-[#B91C1C] rounded-full">
                  Out of Stock: {outOfStockCount}
                </span>
              </div>

              {canScroll && (
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={scrollCarouselLeft}
                    aria-label="Previous wishlist items"
                    className="flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors shadow-sm cursor-pointer"
                    style={{ borderRadius: 'var(--radius-sm)' }}
                  >
                    <ChevronLeftIcon />
                  </button>
                  <button
                    type="button"
                    onClick={scrollCarouselRight}
                    aria-label="Next wishlist items"
                    className="flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors shadow-sm cursor-pointer"
                    style={{ borderRadius: 'var(--radius-sm)' }}
                  >
                    <ChevronRightIcon />
                  </button>
                </div>
              )}
            </div>

            <div
              ref={carouselRef}
              className="flex overflow-x-auto gap-4 lg:gap-6 pb-4 snap-x snap-mandatory hide-scrollbar"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {currentItems.map((item) => (
                <div
                  key={item.id || item._id}
                  className="flex-shrink-0 w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] xl:w-[calc(20%-19.2px)] snap-start flex flex-col"
                >
                  <WishlistCard
                    item={item}
                    onAddToCart={(i, e) => handleAddToCart(e, i)}
                    onRequestRemove={(removeItem) => setRemoveConfirmItem(removeItem)}
                    onNotifyMe={handleNotifyMe}
                  />
                </div>
              ))}
            </div>

            {sortedWishlist.length > ITEMS_PER_PAGE && (
              <Pagination
                page={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}
      </div>

      {/* Recommendations / Recently Viewed */}
      {wishlist.length > 0 && <WishlistRecommendations wishlist={wishlist} />}

      {/* Mobile sticky Move All bar */}
      {wishlist.length > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#EAEAEC] shadow-[0_-2px_12px_rgba(0,0,0,0.08)] p-3">
          <button
            type="button"
            onClick={handleMoveAll}
            disabled={isMovingAll}
            className="w-full py-3 text-[14px] font-bold text-white bg-[var(--color-primary)] tracking-wide hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
          >
            {isMovingAll ? 'Moving…' : `MOVE ALL TO CART (${wishlist.length})`}
          </button>
        </div>
      )}

      {/* Flying Cart Animation */}
      <AnimatePresence>
        {flyingItem && (
          <motion.img
            src={flyingItem.image}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              zIndex: 9999,
              pointerEvents: 'none',
              objectFit: 'contain'
            }}
            initial={{
              x: flyingItem.x,
              y: flyingItem.y,
              width: flyingItem.width,
              height: flyingItem.height,
              opacity: 1,
              scale: 1,
            }}
            animate={{
              x: document.getElementById('cart-icon-header')?.getBoundingClientRect().left || window.innerWidth - 100,
              y: document.getElementById('cart-icon-header')?.getBoundingClientRect().top || 20,
              width: 40,
              height: 40,
              opacity: [1, 1, 0.8, 0],
              scale: [1, 0.8, 0.5, 0.2]
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
          />
        )}
      </AnimatePresence>

      <LoginPrompt
        isOpen={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        message={loginMessage}
      />

      <StorefrontConfirm
        isOpen={showClearConfirm}
        title="Clear Wishlist?"
        message={`This will remove all ${wishlist.length} saved items from your wishlist. This action cannot be undone.`}
        confirmLabel="Clear Wishlist"
        cancelLabel="Cancel"
        danger
        onConfirm={() => {
          clearWishlist();
          setShowClearConfirm(false);
          setPage(1);
        }}
        onCancel={() => setShowClearConfirm(false)}
      />

      <StorefrontConfirm
        isOpen={!!removeConfirmItem}
        title="Remove Item?"
        message={removeConfirmItem
          ? `Remove "${removeConfirmItem.title || removeConfirmItem.name}" from your wishlist?`
          : ''}
        confirmLabel="Remove"
        cancelLabel="Cancel"
        danger
        onConfirm={() => {
          if (removeConfirmItem) removeFromWishlist(removeConfirmItem.id || removeConfirmItem._id);
          setRemoveConfirmItem(null);
        }}
        onCancel={() => setRemoveConfirmItem(null)}
      />
    </div>
    </FadeUp>
  );
};

export default Wishlist;
