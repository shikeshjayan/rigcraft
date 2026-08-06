import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import BoltIcon from '@mui/icons-material/Bolt';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import LockIcon from '@mui/icons-material/Lock';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import { bundleService } from '../services/bundle.service';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import useCountdown from '../hooks/useCountdown';
import LoginPrompt from '../components/LoginPrompt';
import Breadcrumb from '../components/Breadcrumb';
import FadeUp from '../components/FadeUp';
import ProductGallery from '../components/ProductGallery';

const formatINR = (n) => {
  const num = Number(n);
  return `₹${Number.isFinite(num) ? num.toLocaleString('en-IN') : 0}`;
};

const getMemberImage = (item) => {
  if (!item) return null;
  if (typeof item.image === 'string') return item.image;
  if (item.image?.url) return item.image.url;
  if (typeof item.images?.[0] === 'string') return item.images[0];
  return item.images?.[0]?.url || null;
};

const getMemberPrice = (item) => {
  if (!item) return 0;
  const sale = Number(item.pricing?.salePrice ?? item.salePrice);
  const regular = Number(item.pricing?.price ?? item.price ?? 0);
  return sale > 0 ? sale : regular;
};

const memberSlug = (item) => item.slug || item.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'item';

const BundleCountdown = ({ endDate }) => {
  const countdown = useCountdown(endDate);
  if (!endDate || countdown.expired) return null;
  return (
    <div className="flex items-center gap-1 text-[12px] font-bold text-[#B91C1C]">
      <span className="uppercase tracking-wide mr-1">Ends in</span>
      {[
        { label: 'd', value: countdown.days },
        { label: 'h', value: countdown.hours },
        { label: 'm', value: countdown.minutes },
        { label: 's', value: countdown.seconds },
      ].map(({ label, value }) => (
        <span key={label} className="flex items-baseline gap-0.5">
          <span className="bg-[#FEE2E2] text-[#B91C1C] rounded px-1 py-0.5 min-w-[22px] text-center">
            {String(value).padStart(2, '0')}
          </span>
          <span className="text-[10px] text-[#94A3B8]">{label}</span>
        </span>
      ))}
    </div>
  );
};

const BundleDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart, cartItems } = useCart();
  const { isLoggedIn } = useAuth();
  const [qty, setQty] = useState(1);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [loginMessage, setLoginMessage] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['bundle', slug],
    queryFn: () => bundleService.getBySlug(slug),
    staleTime: 60_000,
    retry: 1,
  });

  const bundle = data?.data;

  if (isLoading) {
    return (
      <div className="w-full min-h-screen" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 pt-6 pb-16">
          <div className="h-4 bg-gray-200 rounded-sm w-64 mb-8 animate-pulse" />
          <div className="flex flex-col lg:flex-row gap-10">
            <div className="w-full lg:w-[60%]">
              <div className="aspect-[4/3] bg-gray-200 mb-4 animate-pulse" style={{ borderRadius: 'var(--radius-sm)' }} />
              <div className="flex gap-2 mb-10">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-20 h-20 bg-gray-200 animate-pulse" style={{ borderRadius: 'var(--radius-sm)' }} />
                ))}
              </div>
            </div>
            <div className="w-full lg:w-[40%] space-y-4">
              <div className="h-6 bg-gray-200 rounded-sm w-1/2 animate-pulse" />
              <div className="h-8 bg-gray-200 rounded-sm w-3/4 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded-sm w-2/3 animate-pulse" />
              <div className="h-44 bg-gray-200 animate-pulse mt-6" style={{ borderRadius: 'var(--radius-sm)' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !bundle) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center px-4" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        <SearchOffIcon sx={{ fontSize: 56, color: '#CBD5E1', mb: 3 }} />
        <h2 className="text-2xl font-bold mb-2 text-[#0F172A]">Bundle Not Found</h2>
        <p className="text-[#64748B] mb-6">The bundle you are looking for does not exist or has been removed.</p>
        <div className="flex gap-6">
          <Link to="/" className="text-[#0052FF] underline font-medium">Return to Home</Link>
          <Link to="/deals" className="text-[#0052FF] underline font-medium">Browse Deals</Link>
        </div>
      </div>
    );
  }

  const products = Array.isArray(bundle.products) ? bundle.products : [];
  const prebuilts = Array.isArray(bundle.prebuiltPCs) ? bundle.prebuiltPCs : [];
  const members = [...products, ...prebuilts];
  const memberImages = members.map(getMemberImage).filter(Boolean);
  const itemsTotal = members.reduce((sum, item) => sum + getMemberPrice(item), 0);
  const bundlePrice = Number(bundle.bundlePrice) || 0;
  const savings = Number(bundle.savings) || Math.max(0, itemsTotal - bundlePrice);
  const discountPct =
    Number(bundle.discountPct) ||
    (itemsTotal > 0 ? Math.round((savings / itemsTotal) * 100) : 0);

  const galleryImages = [bundle.image?.url, ...memberImages].filter(Boolean);
  const inCart = cartItems.some((ci) => String(ci.id) === String(bundle._id) && ci.itemType === 'bundle');

  const handleAddToCart = () => {
    if (!isLoggedIn) {
      setLoginMessage('You need to log in to your account to add bundles to the cart.');
      setShowLoginPrompt(true);
      return;
    }
    addToCart({
      id: bundle._id,
      _id: bundle._id,
      title: bundle.name,
      name: bundle.name,
      price: bundlePrice,
      image: bundle.image?.url || memberImages[0] || null,
      type: 'bundle',
      itemType: 'bundle',
    }, qty);
  };

  const handleBuyNow = () => {
    if (!isLoggedIn) {
      setLoginMessage('You need to log in to your account to buy this bundle.');
      setShowLoginPrompt(true);
      return;
    }
    addToCart({
      id: bundle._id,
      _id: bundle._id,
      title: bundle.name,
      name: bundle.name,
      price: bundlePrice,
      image: bundle.image?.url || memberImages[0] || null,
      type: 'bundle',
      itemType: 'bundle',
    }, qty);
    navigate('/cart?step=address');
  };

  return (
    <FadeUp delay={0.1}>
      <div className="w-full min-h-screen pb-20" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 pt-4">
          <Breadcrumb items={[
            { label: 'Home', path: '/' },
            { label: 'Deals', path: '/deals' },
            { label: bundle.name },
          ]} />

          <div className="flex flex-col lg:flex-row gap-10 lg:gap-14 mt-6">
            {/* LEFT: Media */}
            <div className="w-full lg:w-[55%] min-w-0">
              <div className="relative mb-6">
                <ProductGallery images={galleryImages} title={bundle.name} fill />
                <div className="absolute top-4 right-4 z-10 bg-[#0052FF] text-white text-[11px] font-bold uppercase tracking-wider rounded px-2.5 py-1.5 flex items-center gap-1">
                  <BoltIcon sx={{ fontSize: 14 }} />
                  Bundle · {members.length} items
                </div>
              </div>

              {/* What's included */}
              <div className="mb-10">
                <h3 className="text-[16px] font-bold text-[#0F172A] border-b border-[#E2E8F0] pb-2 mb-4">
                  What's Included
                </h3>
                <div className="flex flex-col">
                  {members.map((item, i) => {
                    const isPrebuiltItem = prebuilts.some((p) => String(p._id) === String(item._id));
                    const itemPrice = getMemberPrice(item);
                    const detailLink = `/detail/${memberSlug(item)}/${item._id}?type=${isPrebuiltItem ? 'prebuilt' : 'product'}`;
                    return (
                      <Link
                        key={`${item._id || i}`}
                        to={detailLink}
                        className="flex items-center gap-4 bg-white border border-[#E2E8F0] p-3 transition-colors hover:border-[#0052FF]/40"
                        style={{ borderRadius: 'var(--radius-sm)' }}
                      >
                        <div className="w-16 h-16 bg-[#F8FAFC] border border-[#E2E8F0] rounded p-1.5 flex items-center justify-center shrink-0 overflow-hidden">
                          <img src={getMemberImage(item) || '/fallback.png'} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] font-bold text-[#0F172A] truncate">{item.name || 'Item'}</div>
                          <div className="text-[11px] text-[#64748B] font-semibold uppercase tracking-wide mt-0.5">
                            {isPrebuiltItem ? 'Prebuilt PC' : 'Component'}
                          </div>
                          <div className="text-[13px] font-bold text-[#0F172A] mt-0.5">{formatINR(itemPrice)}</div>
                        </div>
                        <ChevronRightIcon sx={{ fontSize: 20, color: '#94A3B8' }} />
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Description */}
              {bundle.description && (
                <div className="mb-10">
                  <h3 className="text-[16px] font-bold text-[#0F172A] border-b border-[#E2E8F0] pb-2 mb-4">
                    About this Bundle
                  </h3>
                  <p className="text-[14px] text-[#475569] leading-relaxed whitespace-pre-line">{bundle.description}</p>
                </div>
              )}
            </div>

            {/* RIGHT: Buy box */}
            <div className="w-full lg:w-[45%] min-w-0">
              <div id="buy-box" className="lg:sticky lg:top-[120px] bg-white border border-[#E2E8F0] shadow-[0_4px_12px_rgba(0,0,0,0.05)] p-6 flex flex-col"
                style={{ borderRadius: 'var(--radius-sm)' }}>
                <h1 className="text-[22px] sm:text-[26px] font-extrabold tracking-tight text-[#0F172A] leading-tight mb-2">
                  {bundle.name}
                </h1>

                <div className="flex items-end gap-2 flex-wrap mb-1">
                  {itemsTotal > bundlePrice && (
                    <span className="text-[14px] text-[#94A3B8] line-through mb-1">{formatINR(itemsTotal)}</span>
                  )}
                  <span className="text-[34px] font-black text-[#0052FF] leading-none tracking-tight">
                    {formatINR(bundlePrice)}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="bg-green-100 text-green-800 text-[12px] font-bold rounded px-2 py-1">
                    Save {formatINR(savings)} ({discountPct}% OFF)
                  </span>
                  <BundleCountdown endDate={bundle.endDate} />
                </div>

                <div className="text-[12.5px] text-[#64748B] mt-4 pb-4 border-b border-[#E2E8F0]">
                  Buy the whole combo together — priced lower than buying each item separately.
                </div>

                {/* Quantity */}
                <div className="flex items-center justify-between mt-5 mb-5">
                  <span className="text-[13px] text-[#334155] font-medium">Quantity</span>
                  <div className="flex items-center border border-[#CBD5E1] overflow-hidden" style={{ borderRadius: 'var(--radius-sm)' }}>
                    <button
                      type="button"
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      disabled={qty <= 1}
                      aria-label="Decrease quantity"
                      className="w-10 h-10 flex items-center justify-center hover:bg-[#EFF6FF] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer text-[18px] font-bold text-[#0F172A]"
                    >
                      −
                    </button>
                    <span className="w-12 text-center font-bold text-[14px] text-[#0F172A]">{qty}</span>
                    <button
                      type="button"
                      onClick={() => setQty((q) => q + 1)}
                      aria-label="Increase quantity"
                      className="w-10 h-10 flex items-center justify-center hover:bg-[#EFF6FF] transition-colors cursor-pointer text-[18px] font-bold text-[#0F172A]"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Trust badges */}
                <div className="grid grid-cols-3 gap-2 mb-5 pb-5 border-b border-[#E2E8F0]">
                  <div className="flex flex-col items-center gap-1 text-center">
                    <VerifiedUserIcon sx={{ fontSize: 20, color: '#0052FF' }} />
                    <span className="text-[10px] text-[#64748B] font-semibold leading-tight">Secure Payment</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 text-center">
                    <LocalShippingOutlinedIcon sx={{ fontSize: 20, color: '#0052FF' }} />
                    <span className="text-[10px] text-[#64748B] font-semibold leading-tight">Free Delivery</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 text-center">
                    <CheckCircleOutlineIcon sx={{ fontSize: 20, color: '#0052FF' }} />
                    <span className="text-[10px] text-[#64748B] font-semibold leading-tight">1-Year Warranty</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[12px] text-[#64748B] mb-5">
                  <span>7-Day Easy Returns</span>
                  <span className="flex items-center gap-1">
                    <LockIcon sx={{ fontSize: 14, color: '#0052FF' }} />
                    Secure Checkout
                  </span>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleBuyNow}
                    className="w-full bg-[#0052FF] hover:bg-[#0041CC] text-white font-bold py-3.5 transition-colors cursor-pointer text-[14px] uppercase tracking-wide"
                    style={{ borderRadius: 'var(--radius-sm)' }}
                  >
                    Buy Now
                  </button>
                  {inCart ? (
                    <button
                      onClick={() => navigate('/cart')}
                      className="w-full bg-[#0052FF] hover:bg-[#0041CC] text-white font-bold py-3 transition-colors cursor-pointer text-[14px] uppercase tracking-wide flex items-center justify-center gap-2"
                      style={{ borderRadius: 'var(--radius-sm)' }}
                    >
                      <ShoppingCartOutlinedIcon sx={{ fontSize: 18 }} />
                      View Cart
                    </button>
                  ) : (
                    <button
                      onClick={handleAddToCart}
                      className="w-full bg-white text-[#0052FF] border-2 border-[#0052FF] font-bold py-3 transition-colors hover:bg-[#0052FF] hover:text-white cursor-pointer text-[14px] uppercase tracking-wide flex items-center justify-center gap-2"
                      style={{ borderRadius: 'var(--radius-sm)' }}
                    >
                      <ShoppingCartOutlinedIcon sx={{ fontSize: 18 }} />
                      Add to Cart
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <LoginPrompt
          isOpen={showLoginPrompt}
          onClose={() => setShowLoginPrompt(false)}
          message={loginMessage}
        />
      </div>
    </FadeUp>
  );
};

export default BundleDetail;
