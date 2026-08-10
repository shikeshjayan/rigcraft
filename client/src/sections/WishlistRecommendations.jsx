import { useRef, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Card from '../components/Card';
import apiClient from '../api/client';
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

const WishlistRecommendations = ({ wishlist }) => {
  const excludeSet = new Set(wishlist.map((item) => String(item.id || item._id)));
  const recentCarouselRef = useRef(null);
  const [canScroll, setCanScroll] = useState(false);
  const suggestionsCarouselRef = useRef(null);
  const [canScrollSuggestions, setCanScrollSuggestions] = useState(false);

  const recentlyViewed = getRecentIds(excludeSet);

  const recentlyViewedCards = recentlyViewed.map((item) => ({
    apiId: item.id,
    image: item.image,
    title: item.name,
    price: item.selling,
    mrp: item.mrp,
    discount: item.discount,
    tag: item.tag,
    tagColor: '#CC0C39',
    rating: item.rating || { average: 0, count: 0 },
    itemType: item.itemType,
    category: item.category || '',
    stock: item.stock,
    to: item.to,
    brand: item.brand,
    warranty: item.warranty,
  }));

  const { data: recommendations = [] } = useQuery({
    queryKey: ['recommendations', 'wishlist'],
    queryFn: async () => {
      const { data } = await apiClient.get('/products?limit=8');
      if (!(data.success && data.data?.docs)) return [];
      return data.data.docs.filter((p) => !excludeSet.has(String(p._id || p.id)));
    },
    staleTime: 300000,
  });

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
  }, [recommendations.length]);

  if (recentlyViewedCards.length === 0 && recommendations.length === 0) return null;

  return (
    <section className="w-full bg-white pt-14 pb-4" aria-label="More products for you">
      <div className="max-w-[1400px] mx-auto">
        {recentlyViewedCards.length > 0 && (
          <div className="mb-14">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6">
              <div>
                <h3 className="text-[20px] font-bold text-[#0F1111] flex items-center gap-2">
                  <HistoryIcon sx={{ fontSize: 22, color: '#0047AB' }} />
                  Recently Viewed
                </h3>
                <p className="text-[#6B7280] mt-1 text-[14px]">Jump back to products you explored.</p>
              </div>
              {canScroll && (
                <div className="flex items-center gap-2 mt-4 sm:mt-0 self-end">
                  <button
                    type="button"
                    onClick={() => scrollCarouselLeft(recentCarouselRef)}
                    aria-label="Previous recently viewed products"
                    className="flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors shadow-sm cursor-pointer"
                    style={{ borderRadius: 'var(--radius-sm)' }}
                  >
                    <ChevronLeftIcon />
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollCarouselRight(recentCarouselRef)}
                    aria-label="Next recently viewed products"
                    className="flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors shadow-sm cursor-pointer"
                    style={{ borderRadius: 'var(--radius-sm)' }}
                  >
                    <ChevronRightIcon />
                  </button>
                </div>
              )}
            </div>
            <div
              ref={recentCarouselRef}
              className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory hide-scrollbar"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {recentlyViewedCards.map((cardProps) => (
                <div
                  key={cardProps.apiId}
                  className="flex-shrink-0 w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] xl:w-[calc(25%-18px)] flex flex-col snap-start"
                >
                  <Card {...cardProps} />
                </div>
              ))}
            </div>
          </div>
        )}

        {recommendations.length > 0 && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6">
              <div>
                <h3 className="text-[20px] font-bold text-[#0F1111] border-b border-[#EAEAEC] pb-3">
                  Recommended for You
                </h3>
                <p className="text-[#6B7280] mt-1 text-[14px]">
                  Picks based on what you've saved.
                </p>
              </div>
              {canScrollSuggestions && (
                <div className="flex items-center gap-2 mt-4 sm:mt-0 self-end">
                  <button
                    type="button"
                    onClick={() => scrollCarouselLeft(suggestionsCarouselRef)}
                    aria-label="Previous recommendations"
                    className="flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors shadow-sm cursor-pointer"
                    style={{ borderRadius: 'var(--radius-sm)' }}
                  >
                    <ChevronLeftIcon />
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollCarouselRight(suggestionsCarouselRef)}
                    aria-label="Next recommendations"
                    className="flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors shadow-sm cursor-pointer"
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
              {recommendations.map((item) => {
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
                      tag="RECOMMENDED"
                      tagColor="#0047AB"
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

export default WishlistRecommendations;
