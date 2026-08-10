import { useEffect, useRef, useState } from 'react';
import Card from '../components/Card';
import apiClient from '../api/client';
import { useCart } from '../context/CartContext';
import HistoryIcon from '@mui/icons-material/History';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const formatPrice = (val) => {
  if (typeof val === 'number') {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  }
  return val;
};

const getRecentIds = (excludeSet) => {
  try {
    const raw = JSON.parse(localStorage.getItem('recentlyViewed')) || [];
    return raw.filter((item) => item?.id && !excludeSet.has(String(item.id)));
  } catch {
    return [];
  }
};

const scrollCarouselLeft = (ref) => {
  if (ref.current) ref.current.scrollBy({ left: -ref.current.clientWidth * 0.8, behavior: 'smooth' });
};
const scrollCarouselRight = (ref) => {
  if (ref.current) ref.current.scrollBy({ left: ref.current.clientWidth * 0.8, behavior: 'smooth' });
};

const CartSuggestions = () => {
  const { cartItems } = useCart();
  const [suggestions, setSuggestions] = useState([]);
  const recentCarouselRef = useRef(null);
  const [canScroll, setCanScroll] = useState(false);
  const suggestionsCarouselRef = useRef(null);
  const [canScrollSuggestions, setCanScrollSuggestions] = useState(false);

  const excludeSet = new Set(cartItems.map((item) => String(item.id || item._id || item.item?._id)));

  const recentlyViewed = getRecentIds(excludeSet);

  const recentlyViewedCards = recentlyViewed.map((item) => ({
    apiId: item.id,
    image: item.image,
    title: item.name,
    price: item.selling,
    mrp: item.mrp,
    discount: item.discount,
    tag: item.tag,
    tagColor: '#0047AB',
    rating: item.rating || { average: 0, count: 0 },
    itemType: item.itemType,
    category: item.category || '',
    stock: item.stock,
    to: item.to,
    brand: item.brand,
    warranty: item.warranty,
  }));

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const { data } = await apiClient.get('/products?limit=8');
        if (data.success && data.data?.docs) {
          const excluded = new Set(cartItems.map((item) => String(item.id || item._id || item.item?._id)));
          setSuggestions(data.data.docs.filter((p) => !excluded.has(String(p._id || p.id))).slice(0, 8));
        }
      } catch (err) {
        console.error('Failed to fetch suggestions', err);
      }
    };
    fetchSuggestions();
  }, [cartItems]);

  useEffect(() => {
    const el = recentCarouselRef.current;
    if (!el) return;
    const update = () => setCanScroll(el.scrollWidth > el.clientWidth + 1);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [recentlyViewedCards.length]);

  useEffect(() => {
    const el = suggestionsCarouselRef.current;
    if (!el) return;
    const update = () => setCanScrollSuggestions(el.scrollWidth > el.clientWidth + 1);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [suggestions.length]);

  if (recentlyViewedCards.length === 0 && suggestions.length === 0) return null;

  return (
    <section className="w-full py-16" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8">

        {recentlyViewedCards.length > 0 && (
          <div className="mb-14">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6">
              <div>
                <h2 className="text-[18px] font-bold text-[var(--color-text)] flex items-center gap-2 border-b border-[var(--color-border)] pb-2">
                  <HistoryIcon sx={{ fontSize: 22, color: 'var(--color-primary)' }} />
                  Recently Viewed
                </h2>
                <p className="text-[13px] text-[var(--color-text-secondary)] mt-1">Jump back to products you explored.</p>
              </div>
              {canScroll && (
                <div className="flex items-center gap-2 mt-4 sm:mt-0 self-end">
                  <button
                    type="button"
                    onClick={() => scrollCarouselLeft(recentCarouselRef)}
                    aria-label="Previous recently viewed products"
                    className="flex items-center justify-center w-10 h-10 bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)] text-[var(--color-text)] transition-colors shadow-sm cursor-pointer"
                    style={{ borderRadius: 'var(--radius-sm)' }}
                  >
                    <ChevronLeftIcon />
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollCarouselRight(recentCarouselRef)}
                    aria-label="Next recently viewed products"
                    className="flex items-center justify-center w-10 h-10 bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)] text-[var(--color-text)] transition-colors shadow-sm cursor-pointer"
                    style={{ borderRadius: 'var(--radius-sm)' }}
                  >
                    <ChevronRightIcon />
                  </button>
                </div>
              )}
            </div>
            <div
              ref={recentCarouselRef}
              className="flex overflow-x-auto gap-6 pb-4 snap-x snap-mandatory hide-scrollbar"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {recentlyViewedCards.map((cardProps) => (
                <div
                  key={cardProps.apiId}
                  className="flex-shrink-0 w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] xl:w-[calc(25%-18px)] flex flex-col snap-start"
                >
                  <Card {...cardProps} compact={true} />
                </div>
              ))}
            </div>
          </div>
        )}

        {suggestions.length > 0 && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6">
              <h2 className="text-[18px] font-bold text-[var(--color-text)] border-b border-[var(--color-border)] pb-2">
                You May Also Like
              </h2>
              {canScrollSuggestions && (
                <div className="flex items-center gap-2 mt-4 sm:mt-0 self-end">
                  <button
                    type="button"
                    onClick={() => scrollCarouselLeft(suggestionsCarouselRef)}
                    aria-label="Previous suggestions"
                    className="flex items-center justify-center w-10 h-10 bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)] text-[var(--color-text)] transition-colors shadow-sm cursor-pointer"
                    style={{ borderRadius: 'var(--radius-sm)' }}
                  >
                    <ChevronLeftIcon />
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollCarouselRight(suggestionsCarouselRef)}
                    aria-label="Next suggestions"
                    className="flex items-center justify-center w-10 h-10 bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)] text-[var(--color-text)] transition-colors shadow-sm cursor-pointer"
                    style={{ borderRadius: 'var(--radius-sm)' }}
                  >
                    <ChevronRightIcon />
                  </button>
                </div>
              )}
            </div>

            <div
              ref={suggestionsCarouselRef}
              className="flex overflow-x-auto gap-6 pb-4 snap-x snap-mandatory hide-scrollbar"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {suggestions.map(item => {
                const imgSource = item.image || (typeof item.images?.[0] === 'string' ? item.images[0] : item.images?.[0]?.url) || '/placeholder.png';
                const price = item.price || item.pricing?.price || item.pricing?.salePrice;
                const mrp = item.mrp || item.pricing?.price || item.price;
                return (
                  <div
                    key={item._id || item.id}
                    className="flex-shrink-0 w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] xl:w-[calc(25%-18px)] flex flex-col snap-start"
                  >
                    <Card
                      id={item._id || item.id}
                      rating={item?.rating}
                      image={imgSource}
                      title={item.name || item.title}
                      description={item.description}
                      price={formatPrice(price)}
                      mrp={mrp > price ? formatPrice(mrp) : undefined}
                      discount={item.discount}
                      tag="SUGGESTED"
                      tagColor="var(--color-primary)"
                      buttonText="Add to cart"
                      compact={true}
                      stock={item.stock}
                      brand={item.brand?.name || item.brand}
                      warranty={item.warranty}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </section>
  );
};

export default CartSuggestions;
