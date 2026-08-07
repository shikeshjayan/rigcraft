import { useEffect, useRef, useState } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import FadeUp from '../components/FadeUp';
import { allItems } from '../data/items';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import LoginPrompt from '../components/LoginPrompt';
import ProductReviews from '../components/ProductReviews';
import Card from '../components/Card';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../components/toast/useToast';

// Icons
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import Breadcrumb from '../components/Breadcrumb';
import StarIcon from '@mui/icons-material/Star';
import StarHalfIcon from '@mui/icons-material/StarHalf';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import ConstructionIcon from '@mui/icons-material/Construction';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShareIcon from '@mui/icons-material/Share';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import LockIcon from '@mui/icons-material/Lock';
import HistoryIcon from '@mui/icons-material/History';
import ConfirmDialog from '../components/Navbar/ConfirmDialog';

const formatINR = (num) => {
  const value = Number(num) || 0;
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
};

const Detail = () => {
  const { id } = useParams();
  const location = useLocation();
  const typeParam = new URLSearchParams(location.search).get('type') || 'product';
  const isPrebuilt = typeParam === 'prebuilt';

  const [pc, setPc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);

  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [loginMessage, setLoginMessage] = useState("");
  const [flyingItem, setFlyingItem] = useState(null);
  const [isHammering, setIsHammering] = useState(false);
  const [pendingReplaceCategory, setPendingReplaceCategory] = useState(null);
  const [related, setRelated] = useState([]);
  const [relatedScrollable, setRelatedScrollable] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [recentScrollable, setRecentScrollable] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [showMobileBar, setShowMobileBar] = useState(false);
  const [dealIds, setDealIds] = useState(() => new Set());

  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { isLoggedIn } = useAuth();
  const { toast } = useToast();

  const handleBuyNow = () => {
    if (!isLoggedIn) {
      setLoginMessage("You need to log in to your account to buy this item.");
      setShowLoginPrompt(true);
      return;
    }
    addToCart(pc, qty);
    navigate('/cart?step=address');
  };

  const handleAddToCart = () => {
    if (!isLoggedIn) {
      setLoginMessage("You need to log in to your account to add items to the cart.");
      setShowLoginPrompt(true);
      return;
    }

    const rect = document.getElementById('main-product-image')?.getBoundingClientRect();
    if (rect) {
      setFlyingItem({
        image: pc.images && pc.images.length > 0 ? pc.images[activeImage].url : '/fallback.png',
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height
      });

      setTimeout(() => {
        setFlyingItem(null);
      }, 800);
    }

    addToCart(pc);
  };

  const handleAddToBuild = () => {
    if (!isLoggedIn) {
      setLoginMessage("You need to log in to your account to add items to your build.");
      setShowLoginPrompt(true);
      return;
    }

    setIsHammering(true);
    setTimeout(() => setIsHammering(false), 600);
    let draftBuild = JSON.parse(localStorage.getItem('draftBuild')) || {};

    let dbCategory = 'misc';
    if (pc.category?.slug) dbCategory = pc.category.slug;
    else if (typeof pc.category === 'string') dbCategory = pc.category.toLowerCase();

    const CATEGORY_MAP = {
      processor: "cpu",
      motherboard: "motherboard",
      ram: "ram",
      storage: "ssd",
      gpu: "gpu",
      case: "cabinet",
      "power-supply": "psu",
      cooling: "cooling"
    };

    let categoryKey = CATEGORY_MAP[dbCategory] || dbCategory;

    if (draftBuild[categoryKey]) {
       setPendingReplaceCategory(categoryKey);
       return;
    }
    
    commitComponentToBuild(categoryKey);
  };

  const commitComponentToBuild = (categoryKey) => {
    const currentDraft = JSON.parse(localStorage.getItem('draftBuild')) || {};
    currentDraft[categoryKey] = pc;
    localStorage.setItem('draftBuild', JSON.stringify(currentDraft));
    setPendingReplaceCategory(null);
    toast('Component added to your Active Build!');
  };

  const handleWishlistToggle = () => {
    if (!isLoggedIn) {
      setLoginMessage("You need to log in to your account to add items to the wishlist.");
      setShowLoginPrompt(true);
      return;
    }
    const wishlistId = pc._id;
  const images = pc.images && pc.images.length > 0 ? pc.images.map(img => img.url) : ['/fallback.png'];
    const title = pc.name;
    if (isWishlisted) {
      removeFromWishlist(wishlistId);
    } else {
      addToWishlist({
        id: wishlistId,
        image: images[activeImage] || images[0],
        title,
        price: formatINR(Number(pc.pricing?.salePrice) || Number(pc.salePrice) || Number(pc.price) || Number(pc.priceVal) || 0),
        mrp: formatINR((Number(pc.pricing?.price) || Number(pc.price) || Number(pc.priceVal) || 0) * 1.2),
        discount: '',
        itemType: isPrebuilt ? 'prebuilt' : 'product'
      });
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: pc.name, text: pc.description || '', url });
      } catch {
        // User cancelled the native share sheet
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        toast('Product link copied to clipboard!');
      } catch {
        toast('Could not copy link.', 'error');
      }
    }
  };

  const scrollToReviews = () => {
    document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const carouselRef = useRef(null);
  const recentCarouselRef = useRef(null);

  const scrollCarouselLeft = (ref = carouselRef) => {
    if (ref.current) {
      ref.current.scrollBy({ left: -400, behavior: 'smooth' });
    }
  };

  const scrollCarouselRight = (ref = carouselRef) => {
    if (ref.current) {
      ref.current.scrollBy({ left: 400, behavior: 'smooth' });
    }
  };

  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    const fetchItem = async () => {
      setLoading(true);
      setError(false);
      setQty(1);
      setActiveImage(0);
      setRelated([]);
      setDescriptionExpanded(false);
      try {
        const endpoint = isPrebuilt ? `/prebuilt-pcs/${id}` : `/products/${id}`;
        const res = await apiClient.get(endpoint);
        setPc(res.data?.data || res.data);
      } catch (err) {
        // Fallback to local items if API fails (e.g. for mock component items)
        const mockItem = allItems.find(item => item.id.toString() === id);
        if (mockItem) {
          setPc({
            _id: mockItem.id,
            name: mockItem.title,
            description: mockItem.description,
            price: mockItem.priceVal,
            salePrice: mockItem.priceVal,
            images: [{ url: mockItem.image }],
            rating: { average: parseFloat(mockItem.rating), count: mockItem.reviews },
            brand: { name: mockItem.brand },
            specifications: { Processor: mockItem.specs ? mockItem.specs.join(', ') : '' },
            isMock: true
          });
        } else {
          // Log a clean warning instead of the full error object to avoid massive React fiber stack traces
          console.warn(`Product not found (404): ${id}`);
          setError(true);
        }
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchItem();
    }
  }, [id, isPrebuilt]);

  // Related / similar products
  useEffect(() => {
    if (!pc) return undefined;
    const slugOrId = pc.slug || pc._id;
    if (!slugOrId) return undefined;
    let cancelled = false;
    const endpoint = isPrebuilt
      ? `/prebuilt-pcs/${slugOrId}/similar?limit=8`
      : `/products/${slugOrId}/related?limit=8`;

    apiClient.get(endpoint)
      .then((res) => {
        if (cancelled) return;
        const data = res.data?.data;
        const list = Array.isArray(data) ? data : (data?.docs || []);
        setRelated(list.filter((item) => item._id !== pc._id).slice(0, 8));
      })
      .catch(() => {
        if (!cancelled) setRelated([]);
      });

    return () => { cancelled = true; };
  }, [pc, isPrebuilt]);

  // Track whether each carousel actually overflows (buttons only shown when scrollable)
  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return undefined;
    const compute = () => setRelatedScrollable(el.scrollWidth > el.clientWidth + 1);
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, [related]);

  useEffect(() => {
    const el = recentCarouselRef.current;
    if (!el) return undefined;
    const compute = () => setRecentScrollable(el.scrollWidth > el.clientWidth + 1);
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, [recentlyViewed]);

  // Show sticky mobile bar once the buy box scrolls out of view
  useEffect(() => {
    if (!pc) return undefined;
    const onScroll = () => {
      const buyBox = document.getElementById('buy-box');
      if (!buyBox) {
        setShowMobileBar(false);
        return;
      }
      setShowMobileBar(buyBox.getBoundingClientRect().bottom < 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [pc]);

  // Hot Deal membership: build a Set of ids from active deals
  useEffect(() => {
    let cancelled = false;
    apiClient.get('/deals/active')
      .then((res) => {
        if (cancelled) return;
        const data = res.data?.data;
        const deals = Array.isArray(data) ? data : (data?.docs || []);
        const ids = new Set();
        deals.forEach((d) => {
          (d.products || []).forEach((p) => ids.add(String(p?._id || p)));
          (d.prebuiltPCs || []).forEach((p) => ids.add(String(p?._id || p)));
        });
        setDealIds(ids);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  // Recently viewed (localStorage, capped at 8)
  useEffect(() => {
    if (!pc) return;
    const itemType = isPrebuilt ? 'prebuilt' : 'product';
    const slug = pc.slug || pc.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'product';
    const price = Number(pc.pricing?.price) || Number(pc.price) || Number(pc.priceVal) || 0;
    const sale = Number(pc.pricing?.salePrice) || Number(pc.salePrice) || 0;
    const selling = sale > 0 ? sale : price;
    const mrp = sale ? (price || sale * 1.2) : (price * 1.2);
    const disc = mrp > selling ? Math.round((1 - selling / mrp) * 100) : 0;
    const entry = {
      id: pc._id,
      name: pc.name,
      image: pc.images?.[0]?.url || '/fallback.png',
      selling: formatINR(selling),
      mrp: formatINR(mrp),
      discount: disc ? `${disc}%` : '',
      tag: disc ? `-${disc}%` : '',
      itemType,
      category: pc.category?.name || (isPrebuilt ? 'Prebuilt PC' : ''),
      stock: typeof pc.stock === 'number' ? pc.stock : 0,
      rating: pc.rating || { average: 0, count: 0 },
      to: `/detail/${slug}/${pc._id}?type=${typeParam}`
    };
    try {
      const existing = JSON.parse(localStorage.getItem('recentlyViewed')) || [];
      const next = [entry, ...existing.filter((e) => e.id !== pc._id)].slice(0, 8);
      localStorage.setItem('recentlyViewed', JSON.stringify(next));
      setRecentlyViewed(next);
    } catch {
      // Ignore storage failures
    }
  }, [pc, isPrebuilt, typeParam]);

  if (loading) {
    return (
      <div className="w-full bg-[#FAF9F6] text-[#0F1111] min-h-screen">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 pt-6 pb-16">
          <div className="h-4 bg-gray-200 rounded-sm w-64 mb-8 animate-pulse" />
          <div className="flex flex-col lg:flex-row gap-10">
            <div className="w-full lg:w-[60%]">
              <div className="aspect-[4/3] bg-gray-200 rounded-sm mb-4 animate-pulse" />
              <div className="flex gap-2 mb-10">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-sm animate-pulse" />
                ))}
              </div>
            </div>
            <div className="w-full lg:w-[40%] space-y-4">
              <div className="h-6 bg-gray-200 rounded-sm w-1/2 animate-pulse" />
              <div className="h-8 bg-gray-200 rounded-sm w-3/4 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded-sm w-2/3 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded-sm w-1/2 animate-pulse" />
              <div className="h-44 bg-gray-200 rounded-md animate-pulse mt-6" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !pc) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-[#FAF9F6] text-[#0F1111] px-4">
        <SearchOffIcon sx={{ fontSize: 56, color: '#D5D9D9', mb: 3 }} />
        <h2 className="text-2xl font-bold mb-2">Item Not Found</h2>
        <p className="text-[#565959] mb-6">The item you are looking for does not exist or has been removed.</p>
        <div className="flex gap-6">
          <Link to="/" className="text-[#0047AB] underline">Return to Home</Link>
          <Link to={isPrebuilt ? '/prebuild' : '/components'} className="text-[#0047AB] underline">Browse {isPrebuilt ? 'Prebuilds' : 'Components'}</Link>
        </div>
      </div>
    );
  }

  // Helper variables for rendering
  const title = pc.name;
  const description = pc.description || pc.shortDescription || `Experience incredible performance with the ${title}.`;

  // Format price (handle both Product and Prebuilt PC schemas)
  const pcPrice = Number(pc.pricing?.price) || Number(pc.price) || Number(pc.priceVal) || 0;
  const pcSalePrice = Number(pc.pricing?.salePrice) || Number(pc.salePrice) || 0;

  const actualPrice = pcPrice;
  const actualSalePrice = pcSalePrice;
  const sellingPrice = actualSalePrice > 0 ? actualSalePrice : actualPrice;

  const mrpPrice = actualSalePrice ? (actualPrice || actualSalePrice * 1.2) : (actualPrice * 1.2);
  const formattedMrp = formatINR(mrpPrice);
  const formattedSelling = formatINR(sellingPrice);

  const discountPercent = mrpPrice > sellingPrice ? Math.round((1 - sellingPrice / mrpPrice) * 100) : 0;
  const saveAmount = Math.max(0, mrpPrice - sellingPrice);
  const emiMonthly = sellingPrice > 0 ? Math.ceil(sellingPrice / 3) : 0;

  // Images
  const images = pc.images && pc.images.length > 0 ? pc.images.map(img => img.url) : ['/fallback.png'];
  const currentImage = images[activeImage] || images[0];

  // Stock
  const stock = typeof pc.stock === 'number' ? pc.stock : (pc.isMock ? 10 : 0);
  const inStock = stock > 0;

  // Rating
  const ratingAvg = pc.rating?.average ?? 0;
  const reviewsCount = pc.rating?.count ?? 0;

  // Hero info + auto badges
  const brandName = typeof pc.brand === 'string' ? pc.brand : (pc.brand?.name || '');
  const categoryName = typeof pc.category === 'string' ? pc.category : (pc.category?.name || '');
  const soldCount = Number(pc.soldCount) || 0;
  const isBestSeller = soldCount >= 500;
  const createdAtDate = pc.createdAt ? new Date(pc.createdAt) : null;
  const isNewArrival = createdAtDate
    ? (Date.now() - createdAtDate.getTime()) < 30 * 24 * 60 * 60 * 1000
    : false;
  const isHotDeal = dealIds.has(String(pc._id));
  const warranty = pc.warranty;
  const warrantyText =
    warranty && typeof warranty === 'object' && warranty.duration
      ? `${warranty.duration} ${warranty.unit === 'month' ? 'Month' : 'Year'}${warranty.duration > 1 ? 's' : ''} ${warranty.type === 'manufacturer' ? 'Manufacturer' : 'Seller'} Warranty`
      : (typeof warranty === 'string' ? warranty : '1-Year Warranty');

  // Read more / less for long descriptions
  const isLongDescription = description.length > 200;
  const displayedDescription =
    isLongDescription && !descriptionExpanded
      ? description.slice(0, 200).trimEnd() + '…'
      : description;

  // Specs extraction safely
  const specifications = pc.specifications || {};
  const isIntel = pc.brand?.name === 'Intel' || (typeof pc.brand === 'string' && pc.brand.includes('Intel'));
  const processor = specifications.Processor || (isIntel ? 'Intel Core processor' : 'AMD Ryzen processor');
  const graphics = specifications.Graphics || 'Integrated Graphics';
  const memory = specifications.Memory || '16GB DDR5';
  const storage = specifications.Storage || '1TB NVMe Gen4';

  // Wishlist state
  const wishlistId = pc._id;
  const isWishlisted = wishlist.some(item => item.id === wishlistId);

  // Related product cards
  const relatedCards = related.map((item) => {
    const itemPrice = Number(item.pricing?.price) || Number(item.price) || 0;
    const itemSale = Number(item.pricing?.salePrice) || 0;
    const itemSelling = itemSale > 0 ? itemSale : itemPrice;
    const itemMrp = itemSale ? (itemPrice || itemSale * 1.2) : (itemPrice * 1.2);
    const itemDiscount = itemMrp > itemSelling ? Math.round((1 - itemSelling / itemMrp) * 100) : 0;
    const slug = item.slug || item.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'product';
    return {
      apiId: item._id,
      image: item.images?.[0]?.url,
      title: item.name,
      price: formatINR(itemSelling),
      mrp: formatINR(itemMrp),
      discount: itemDiscount ? `${itemDiscount}%` : '',
      tag: itemDiscount ? `-${itemDiscount}%` : '',
      tagColor: '#CC0C39',
      rating: item.rating || { average: 0, count: 0 },
      itemType: isPrebuilt ? 'prebuilt' : 'product',
      category: item.category?.name || (isPrebuilt ? 'Prebuilt PC' : item.category || ''),
      stock: item.stock,
      to: `/detail/${slug}/${item._id}?type=${typeParam}`,
      brand: item.brand?.name || item.brand,
      warranty: item.warranty,
    };
  });

  // Recently viewed cards (from localStorage)
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

  // Sticky section nav items
  const navItems = [
    { label: 'Overview', id: 'overview-section' },
    ...(Object.keys(specifications).length > 0 ? [{ label: 'Specifications', id: 'specs-section' }] : []),
    { label: 'Reviews', id: 'reviews-section' },
    ...(relatedCards.length > 0 ? [{ label: 'Related', id: 'related-section' }] : []),
  ];

  return (
    <FadeUp delay={0.1}>
    <div className="w-full bg-[#FAF9F6] text-[#0F1111] pb-28 lg:pb-20">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 pt-4">

        {/* Breadcrumbs */}
        <Breadcrumb items={[
          { label: 'Home', path: '/' },
          { label: isPrebuilt ? 'Prebuilt PCs' : 'Components', path: isPrebuilt ? '/prebuild' : '/components' },
          { label: pc.category?.name || 'Category' },
          { label: title }
        ]} />

        {/* Sticky section nav */}
        <div
          className="sticky top-[111px] z-30 bg-white/95 backdrop-blur-md border-b border-[#E7E7E7] -mx-4 lg:-mx-8 px-4 lg:px-8 mb-6"
          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
        >
          <nav className="flex gap-6 overflow-x-auto py-2.5 text-[13px] font-semibold" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {navItems.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                className="text-[#565959] hover:text-[#0047AB] whitespace-nowrap cursor-pointer transition-colors"
              >
                {s.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Main 2-Column Layout */}
        <div id="overview-section" className="scroll-mt-28 flex flex-col lg:flex-row gap-10 lg:gap-14">

          {/* LEFT COLUMN: Media & Deep Details */}
          <div className="w-full lg:w-[60%] min-w-0">

            {/* Image Gallery */}
            <div className="w-full h-[400px] lg:h-[500px] bg-[#E5E7EB] rounded-sm mb-4 flex items-center justify-center p-8 relative">
              <img id="main-product-image" src={currentImage} alt={title} className="max-h-full max-w-full object-contain mix-blend-multiply" />
            </div>
            
            {/* Thumbnails */}
            <div className="flex gap-2 mb-12 overflow-x-auto hide-scrollbar">
              {images.slice(0, 4).map((img, i) => (
                <div 
                  key={i} 
                  onClick={() => setActiveImage(i)}
                  className={`w-20 h-20 shrink-0 bg-white border ${i === activeImage ? 'border-[#0047AB]' : 'border-[#D5D9D9]'} rounded-sm flex items-center justify-center p-2 cursor-pointer hover:border-[#0047AB]`}
                >
                  <img src={img} alt="thumb" className="max-h-full max-w-full object-contain" />
                </div>
              ))}
            </div>

            {/* About this System */}
            <div className="mb-10">
              <h3 className="text-[16px] font-bold text-[#0F1111] border-b border-[#E7E7E7] pb-2 mb-4">About this Product</h3>
              <p className="text-[14px] text-[#333] mb-4 leading-relaxed whitespace-pre-line">
                {displayedDescription}
                {isLongDescription && (
                  <button
                    type="button"
                    onClick={() => setDescriptionExpanded((v) => !v)}
                    className="ml-1 inline text-[#0047AB] text-[13px] font-bold cursor-pointer hover:underline"
                  >
                    {descriptionExpanded ? 'Read less' : 'Read more'}
                  </button>
                )}
              </p>

              {isPrebuilt && (
                <ul className="list-disc pl-5 space-y-3 text-[14px] text-[#333]">
                  <li><span className="font-bold">Elite Processing Power:</span> Powered by the {processor}, delivering incredible multi-core efficiency for high-octane tasks.</li>
                  <li><span className="font-bold">Next-Gen Graphics:</span> Featuring the {graphics} for real-time ray tracing and DLSS 3.5 AI upscaling.</li>
                  <li><span className="font-bold">Lightning Fast Memory:</span> Configured with {memory} for seamless multitasking.</li>
                  <li><span className="font-bold">Refined Thermal Solution:</span> Custom liquid cooling system engineered to keep temps incredibly low.</li>
                </ul>
              )}
            </div>

            {/* Technical Specifications */}
            {Object.keys(specifications).length > 0 && (
              <div id="specs-section" className="scroll-mt-28 mb-10">
                <h3 className="text-[16px] font-bold text-[#0F1111] mb-4">Technical Specifications</h3>
                <div className="bg-white border border-[#E7E7E7] rounded-sm overflow-hidden">
                  {Object.entries(specifications).map(([key, value], index) => (
                    <div
                      key={key}
                      className={`flex items-start justify-between gap-4 px-5 py-3.5 ${
                        index !== Object.keys(specifications).length - 1 ? 'border-b border-[#E7E7E7]' : ''
                      }`}
                    >
                      <span className="text-[13px] text-[#565959] capitalize shrink-0">{key}</span>
                      <span className="text-[14px] font-medium text-[#0F1111] text-right">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* RIGHT COLUMN: Specs & Purchase Box */}
          <div className="w-full lg:w-[40%] min-w-0 flex flex-col gap-6">

            {/* Header / Title */}
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="bg-[#E5F0FF] text-[#0047AB] text-[11px] font-bold px-2 py-1 rounded-sm uppercase tracking-wider mb-3">
                  {pc.isFeatured ? 'FEATURED PRODUCT' : (isPrebuilt ? 'FLAGSHIP SERIES' : 'PREMIUM COMPONENT')}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleWishlistToggle}
                    aria-label={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                    className="w-9 h-9 flex items-center justify-center rounded-full border border-[#D5D9D9] bg-white hover:border-[#0047AB] transition-colors"
                  >
                    {isWishlisted ? (
                      <FavoriteIcon sx={{ fontSize: 20, color: '#CC0C39' }} />
                    ) : (
                      <FavoriteBorderIcon sx={{ fontSize: 20, color: '#0F1111' }} />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleShare}
                    aria-label="Share product"
                    className="w-9 h-9 flex items-center justify-center rounded-full border border-[#D5D9D9] bg-white hover:border-[#0047AB] transition-colors"
                  >
                    <ShareIcon sx={{ fontSize: 19, color: '#0F1111' }} />
                  </button>
                </div>
              </div>
              <h1 className="text-[24px] sm:text-[26px] font-bold leading-tight text-[#0F1111] mb-2">
                {title}
              </h1>
              <div className="text-[13px] text-[#565959] flex items-center gap-2 mb-3">
                <span>Model: {pc.sku || `PCF-SYS-${pc._id?.substring(0, 5)}`}</span>
              </div>
              <button type="button" onClick={scrollToReviews} className="flex items-center gap-1 mb-4 group">
                <div className="flex text-[#F59E0B]">
                  {[...Array(5)].map((_, i) => (
                    ratingAvg >= i + 1 ? <StarIcon key={i} sx={{ fontSize: 18 }} /> :
                    ratingAvg >= i + 0.5 ? <StarHalfIcon key={i} sx={{ fontSize: 18 }} /> :
                    <StarBorderIcon key={i} sx={{ fontSize: 18, color: '#D5D9D9' }} />
                  ))}
                </div>
                <span className="text-[#0047AB] text-[14px] font-bold ml-1">{ratingAvg || 'New'}</span>
                {reviewsCount > 0 && (
                  <span className="text-[#565959] text-[13px] ml-1 group-hover:text-[#0047AB] group-hover:underline">
                    ({reviewsCount} Reviews)
                  </span>
                )}
              </button>

              {/* Auto badges */}
              {(isBestSeller || isNewArrival || isHotDeal) && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {isBestSeller && (
                    <span className="bg-[#CC0C39] text-white text-[11px] font-bold px-2 py-1 rounded-sm uppercase tracking-wider">Best Seller</span>
                  )}
                  {isNewArrival && (
                    <span className="bg-[#059669] text-white text-[11px] font-bold px-2 py-1 rounded-sm uppercase tracking-wider">New Arrival</span>
                  )}
                  {isHotDeal && (
                    <span className="bg-[#F59E0B] text-white text-[11px] font-bold px-2 py-1 rounded-sm uppercase tracking-wider">Hot Deal</span>
                  )}
                </div>
              )}

              {/* Hero info block */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-[#565959] mb-4">
                {brandName && (
                  <span>Brand: <span className="font-bold text-[#0F1111]">{brandName}</span></span>
                )}
                {categoryName && (
                  <span>Category: <span className="font-bold text-[#0F1111]">{categoryName}</span></span>
                )}
                {soldCount > 0 && (
                  <span>Sold <span className="font-bold text-[#0F1111]">{soldCount}+</span></span>
                )}
              </div>
            </div>

            {/* 4-Grid Specs (if prebuilt) */}
            {isPrebuilt && (
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#F3F4F6] p-3 rounded-sm">
                  <div className="text-[10px] text-[#565959] font-bold uppercase tracking-wider mb-1">Processor</div>
                  <div className="text-[#0047AB] font-medium text-[13px] truncate">{processor}</div>
                </div>
                <div className="bg-[#F3F4F6] p-3 rounded-sm">
                  <div className="text-[10px] text-[#565959] font-bold uppercase tracking-wider mb-1">Graphics</div>
                  <div className="text-[#0047AB] font-medium text-[13px] truncate">{graphics}</div>
                </div>
                <div className="bg-[#F3F4F6] p-3 rounded-sm">
                  <div className="text-[10px] text-[#565959] font-bold uppercase tracking-wider mb-1">Memory</div>
                  <div className="text-[#0047AB] font-medium text-[13px] truncate">{memory}</div>
                </div>
                <div className="bg-[#F3F4F6] p-3 rounded-sm">
                  <div className="text-[10px] text-[#565959] font-bold uppercase tracking-wider mb-1">Storage</div>
                  <div className="text-[#0047AB] font-medium text-[13px] truncate">{storage}</div>
                </div>
              </div>
            )}

            {/* Sticky Purchase Box */}
            <div id="buy-box" className="lg:sticky lg:top-[120px] bg-white border border-[#E7E7E7] shadow-[0_4px_12px_rgba(0,0,0,0.05)] p-5 rounded-md flex flex-col">

              <div className="flex items-center gap-3 mb-1">
                {discountPercent > 0 && (
                  <span className="bg-[#CC0C39] text-white text-[11px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                    - {discountPercent}% EXCLUSIVE
                  </span>
                )}
              </div>

              <div className="flex items-end gap-3 mb-1 flex-wrap">
                <span className="text-[36px] font-bold text-[#0047AB] leading-none tracking-tight">
                  {formattedSelling}
                </span>
                {mrpPrice > sellingPrice && (
                  <span className="text-[14px] text-[#565959] line-through mb-1">{formattedMrp}</span>
                )}
              </div>
              {saveAmount > 0 && (
                <div className="text-[13px] text-[#059669] font-semibold mb-1">
                  You save {formatINR(saveAmount)} ({discountPercent}%)
                </div>
              )}
              <div className="text-[13px] text-[#565959] mb-4 pb-4 border-b border-[#E7E7E7]">
                {emiMonthly > 0 ? `EMI from ${formatINR(emiMonthly)}/mo available at checkout` : 'Financing available at checkout'}
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center justify-between mb-5">
                <span className="text-[13px] text-[#333] font-medium">Quantity</span>
                <div className="flex items-center border border-[#D5D9D9] rounded-sm overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                    disabled={qty <= 1}
                    aria-label="Decrease quantity"
                    className="w-9 h-9 flex items-center justify-center hover:bg-[#F0F6FF] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <RemoveIcon sx={{ fontSize: 18 }} />
                  </button>
                  <span className="w-12 text-center font-bold text-[14px]">{qty}</span>
                  <button
                    type="button"
                    onClick={() => setQty(q => Math.min(stock, q + 1))}
                    disabled={qty >= stock}
                    aria-label="Increase quantity"
                    className="w-9 h-9 flex items-center justify-center hover:bg-[#F0F6FF] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <AddIcon sx={{ fontSize: 18 }} />
                  </button>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="flex items-start gap-3 mb-5">
                <div className="mt-1 flex flex-col items-center gap-1">
                  <span className={`w-2.5 h-2.5 rounded-full ${inStock ? 'bg-[#059669]' : 'bg-red-500'}`}></span>
                  <LocalShippingOutlinedIcon sx={{ fontSize: 18, color: '#565959' }} />
                </div>
                <div>
                  <div className="text-[13px] text-[#333] font-medium">{inStock ? 'In Stock' : 'Out of Stock'}</div>
                  <div className="text-[13px] text-[#565959] flex gap-2">
                    <span>Est. Delivery:</span>
                    <span className="font-bold text-[#0F1111]">3-5 Business Days</span>
                  </div>
                  {inStock && stock <= 5 && (
                    <div className="text-[12px] text-[#CC0C39] font-semibold mt-1">Only {stock} left in stock — order soon!</div>
                  )}
                </div>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-2 mb-5 pb-5 border-b border-[#E7E7E7]">
                <div className="flex flex-col items-center gap-1 text-center">
                  <VerifiedUserIcon sx={{ fontSize: 20, color: '#0047AB' }} />
                  <span className="text-[10px] text-[#565959] font-semibold leading-tight">Secure Payment</span>
                </div>
                <div className="flex flex-col items-center gap-1 text-center">
                  <CheckCircleOutlineIcon sx={{ fontSize: 20, color: '#0047AB' }} />
                  <span className="text-[10px] text-[#565959] font-semibold leading-tight">{warrantyText}</span>
                </div>
                <div className="flex flex-col items-center gap-1 text-center">
                  <LocalShippingOutlinedIcon sx={{ fontSize: 20, color: '#0047AB' }} />
                  <span className="text-[10px] text-[#565959] font-semibold leading-tight">Free Delivery</span>
                </div>
              </div>

              {/* Returns + Secure checkout */}
              <div className="flex items-center justify-between text-[12px] text-[#565959] mb-5">
                <span>7-Day Easy Returns</span>
                <span className="flex items-center gap-1">
                  <LockIcon sx={{ fontSize: 14, color: '#0047AB' }} />
                  Secure Checkout
                </span>
              </div>

              {/* Buttons */}
              <div className="flex flex-col gap-3">
                <button onClick={handleBuyNow} disabled={!inStock} className={`w-full text-white font-bold py-3 rounded-sm shadow-sm transition-colors ${inStock ? 'bg-[#0047AB] hover:bg-[#003380] cursor-pointer' : 'bg-gray-400 cursor-not-allowed'}`}>
                  Buy Now
                </button>
                <button onClick={handleAddToCart} disabled={!inStock} className={`w-full bg-white text-[var(--color-primary)] border-2 border-[var(--color-primary)] font-bold py-3 rounded-sm transition-colors ${inStock ? 'hover:bg-[var(--color-primary)] hover:text-white active:bg-[var(--color-primary)] active:text-white cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}>
                  Add to Cart
                </button>
                {!isPrebuilt && (
                  <button onClick={handleAddToBuild} className="w-full bg-[#1F2937] text-white font-bold py-3 rounded-sm hover:bg-[#111827] transition-colors flex justify-center items-center gap-2 cursor-pointer mt-2 overflow-hidden">
                    <motion.div
                      animate={isHammering ? { rotate: [0, -45, 10, -45, 10, 0] } : {}}
                      transition={{ duration: 0.5, ease: "easeInOut" }}
                    >
                      <ConstructionIcon sx={{ fontSize: 18 }} />
                    </motion.div>
                    Add to Active Build
                  </button>
                )}
              </div>
            </div>

          </div>

        </div>

        {/* Related Products Carousel */}
        {relatedCards.length > 0 && (
          <div id="related-section" className="scroll-mt-28 mt-16">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8">
              <div>
                <h3 className="text-[20px] font-bold text-[#0F1111]">Related Products</h3>
                <p className="text-[#6B7280] mt-1 text-[14px]">Customers also viewed these great options.</p>
              </div>
              {relatedScrollable && (
              <div className="flex items-center gap-2 mt-4 sm:mt-0 self-end">
                <button
                  type="button"
                  onClick={() => scrollCarouselLeft()}
                  aria-label="Previous related products"
                  className="flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors shadow-sm"
                  style={{ borderRadius: 'var(--radius-sm)' }}
                >
                  <ChevronLeftIcon />
                </button>
                <button
                  type="button"
                  onClick={() => scrollCarouselRight()}
                  aria-label="Next related products"
                  className="flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors shadow-sm"
                  style={{ borderRadius: 'var(--radius-sm)' }}
                >
                  <ChevronRightIcon />
                </button>
              </div>
              )}
            </div>
            <div
              ref={carouselRef}
              className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory hide-scrollbar"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {relatedCards.map((cardProps) => (
                <div key={cardProps.apiId} className="flex-shrink-0 w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] xl:w-[calc(25%-18px)] flex flex-col snap-start">
                  <Card {...cardProps} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews Section */}
        <div id="reviews-section" className="scroll-mt-28">
          <ProductReviews itemId={pc._id} itemType={isPrebuilt ? 'prebuilt' : 'product'} ratingSummary={pc.rating} />
        </div>

        {/* Recently Viewed Carousel */}
        {recentlyViewedCards.length > 0 && (
          <div id="recently-viewed-section" className="scroll-mt-28 mt-16">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8">
              <div>
                <h3 className="text-[20px] font-bold text-[#0F1111] flex items-center gap-2">
                  <HistoryIcon sx={{ fontSize: 22, color: '#0047AB' }} />
                  Recently Viewed
                </h3>
                <p className="text-[#6B7280] mt-1 text-[14px]">Jump back to products you explored.</p>
              </div>
              {recentScrollable && (
              <div className="flex items-center gap-2 mt-4 sm:mt-0 self-end">
                <button
                  type="button"
                  onClick={() => scrollCarouselLeft(recentCarouselRef)}
                  aria-label="Previous recently viewed products"
                  className="flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors shadow-sm"
                  style={{ borderRadius: 'var(--radius-sm)' }}
                >
                  <ChevronLeftIcon />
                </button>
                <button
                  type="button"
                  onClick={() => scrollCarouselRight(recentCarouselRef)}
                  aria-label="Next recently viewed products"
                  className="flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors shadow-sm"
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
                <div key={cardProps.apiId} className="flex-shrink-0 w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] xl:w-[calc(25%-18px)] flex flex-col snap-start">
                  <Card {...cardProps} />
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

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
            transition={{ duration: 0.8, ease: "easeInOut" }}
          />
        )}
      </AnimatePresence>

      {/* Sticky Mobile Purchase Bar */}
      <AnimatePresence>
        {inStock && showMobileBar && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed inset-x-0 bottom-0 z-50 bg-white border-t border-[#E7E7E7] shadow-[0_-4px_16px_rgba(0,0,0,0.08)] lg:hidden"
          >
            <div className="flex items-center gap-3 px-4 py-3" style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}>
              <div className="min-w-[88px]">
                <div className="text-[#0047AB] text-[17px] font-extrabold leading-none">{formattedSelling}</div>
                {discountPercent > 0 && (
                  <div className="text-[11px] text-[#CC0C39] font-bold mt-0.5">{discountPercent}% off</div>
                )}
              </div>
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-white text-[var(--color-primary)] border-2 border-[var(--color-primary)] font-bold py-2.5 rounded-sm text-[13px] uppercase tracking-wide hover:bg-[var(--color-primary)] hover:text-white active:bg-[var(--color-primary)] active:text-white transition-colors"
              >
                Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 bg-[#0047AB] text-white font-bold py-2.5 rounded-sm text-[13px] uppercase tracking-wide hover:bg-[#003380] transition-colors"
              >
                Buy Now
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <LoginPrompt
        isOpen={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        message={loginMessage}
      />

      <ConfirmDialog
        open={!!pendingReplaceCategory}
        title={`Replace ${pendingReplaceCategory}?`}
        message={`You already have a ${pendingReplaceCategory} in your active build. Replace it with ${title}?`}
        confirmLabel="Replace"
        cancelLabel="Keep Current"
        onConfirm={() => commitComponentToBuild(pendingReplaceCategory)}
        onCancel={() => setPendingReplaceCategory(null)}
      />
    </div>
    </FadeUp>
  );
};

export default Detail;
