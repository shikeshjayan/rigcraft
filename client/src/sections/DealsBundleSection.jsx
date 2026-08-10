import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import { bundleService } from '../services/bundle.service';
import { useCart } from '../context/CartContext';
import useCountdown from '../hooks/useCountdown';
import BundleCardImage from '../components/BundleCardImage';

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

const BundleCard = ({ bundle }) => {
  const { addToCart, cartItems } = useCart();
  const navigate = useNavigate();
  const countdown = useCountdown(bundle.endDate);

  const products = bundle.products || [];
  const prebuilts = bundle.prebuiltPCs || [];
  const members = [...products, ...prebuilts];
  const thumbnails = members.map(getMemberImage).filter(Boolean);
  const mainImage = bundle.image?.url || thumbnails[0] || null;
  const inCart = cartItems.some((ci) => String(ci.id) === String(bundle._id) && ci.itemType === 'bundle');

  const itemsTotal = members.reduce((sum, item) => sum + getMemberPrice(item), 0);
  const dealPrice = Number(bundle.bundlePrice) || 0;
  const hasDiscount = itemsTotal > dealPrice && dealPrice > 0;
  const savings = hasDiscount ? itemsTotal - dealPrice : 0;
  const discountPct = hasDiscount
    ? Math.round(((itemsTotal - dealPrice) / itemsTotal) * 100)
    : 0;

  const countdownLabel = (() => {
    if (countdown.expired) return null;
    if (countdown.days > 0) return `${countdown.days}d ${countdown.hours}h Left`;
    if (countdown.hours > 0) return `${countdown.hours}h ${countdown.minutes}m Left`;
    return `${countdown.minutes}m ${countdown.seconds}s Left`;
  })();

  const handleAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    await addToCart({
      id: bundle._id,
      _id: bundle._id,
      title: bundle.name,
      name: bundle.name,
      price: dealPrice,
      image: mainImage,
      type: 'bundle',
      itemType: 'bundle',
    }, 1);
  };

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 24 },
        show: { opacity: 1, y: 0 },
      }}
      onClick={() => navigate(`/bundle/${bundle.slug}`)}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigate(`/bundle/${bundle.slug}`);
        }
      }}
      className="relative flex flex-col h-full overflow-hidden border border-gray-300 group transition-all duration-300 cursor-pointer bg-white hover:shadow-xl"
      style={{ borderRadius: 'var(--radius-sm)', minHeight: '400px' }}
    >
      {/* Image Container */}
      <div className="relative w-full aspect-square bg-white flex items-center justify-center border-b border-gray-100 overflow-hidden">
        {/* Discount Badge (Top Left) */}
        {hasDiscount && (
          <span className="absolute top-3 left-3 px-2.5 py-1 text-[11px] font-extrabold text-white uppercase tracking-wider rounded-full shadow-sm z-10 bg-[#EF4444]">
            -{discountPct}%
          </span>
        )}

        {/* Tag Badge (Top Center) */}
        <span className="absolute top-3 left-1/2 -translate-x-1/2 px-2.5 py-1 text-[10px] font-bold text-white uppercase tracking-wider rounded-full shadow-sm z-10 bg-[#0052FF]">
          Bundle
        </span>

        {/* Image */}
        <BundleCardImage bundle={bundle} thumbnails={thumbnails} name={bundle.name} />
      </div>

      {/* Content Container */}
      <div className="flex flex-col flex-1 p-4">
        {/* Category Tag */}
        <span className="text-gray-400 font-bold uppercase tracking-wider mb-2" style={{ fontSize: '9px' }}>
          Bundle Deal
        </span>

        {/* Title */}
        <h3
          title={bundle.name}
          className="font-bold text-gray-900 leading-tight mb-2 line-clamp-1"
          style={{ fontSize: '15px' }}
        >
          {bundle.name}
        </h3>

        {/* Description */}
        {bundle.description && (
          <p
            className="text-gray-500 leading-relaxed line-clamp-2 mb-3"
            style={{ fontSize: '11px' }}
          >
            {bundle.description}
          </p>
        )}

        {/* Price Block */}
        <div className="mt-auto pt-2">
          <div className="flex items-end gap-2 flex-wrap">
            <span className="font-extrabold text-gray-900 text-xl leading-none">
              {formatINR(dealPrice)}
            </span>
            {hasDiscount && (
              <span className="text-gray-400 line-through text-sm leading-none mb-0.5">
                {formatINR(itemsTotal)}
              </span>
            )}
          </div>
          {hasDiscount && (
            <div className="flex items-center gap-1 mt-1.5">
              <span className="text-[#16A34A] font-bold text-[13px]">Save {formatINR(savings)}</span>
              <span className="text-gray-300">•</span>
              <span className="text-[#EA580C] font-bold text-[13px]">{discountPct}% OFF</span>
            </div>
          )}
        </div>

        {/* Countdown */}
        <div className="flex items-center gap-2 mt-3">
          {bundle.endDate && countdownLabel ? (
            <span className={`inline-flex items-center gap-1 font-bold text-[11px] px-2 py-0.5 rounded-full ${countdown.days === 0 && countdown.hours <= 12 ? 'bg-[#FEE2E2] text-[#B91C1C]' : 'bg-[#FFF7ED] text-[#EA580C]'}`}>
              <TimerOutlinedIcon sx={{ fontSize: 13 }} />
              {countdownLabel}
            </span>
          ) : (
            <span className="text-[11px] font-medium text-gray-400">Deal ends soon</span>
          )}
        </div>

        {/* Action Button */}
        {inCart ? (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              navigate('/cart');
            }}
            className="w-full font-bold py-2.5 px-4 text-[13px] uppercase tracking-wide transition-colors cursor-pointer bg-white text-[var(--color-primary)] border-2 border-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white active:bg-[var(--color-primary)] active:text-white mt-3"
            style={{ borderRadius: 'var(--radius-sm)' }}
          >
            View Cart
          </button>
        ) : (
          <button
            type="button"
            onClick={handleAdd}
            className="w-full font-bold py-2.5 px-4 text-[13px] uppercase tracking-wide transition-colors cursor-pointer bg-white text-[var(--color-primary)] border-2 border-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white active:bg-[var(--color-primary)] active:text-white mt-3"
            style={{ borderRadius: 'var(--radius-sm)' }}
          >
            Add to Cart
          </button>
        )}
      </div>
    </motion.div>
  );
};

const DealsBundleSection = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['activeBundles'],
    queryFn: () => bundleService.getActive(),
    staleTime: 60_000,
  });

  const bundles = data?.data || [];

  if (isLoading) {
    return (
      <section id="deals-bundles" className="w-full py-16" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        <div className="max-w-[1500px] mx-auto px-4 lg:px-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-[24px] md:text-[32px] font-extrabold text-[var(--color-text)] tracking-tight uppercase">
              Bundle Deals
            </h2>
            <p className="text-[13px] text-[var(--color-text-secondary)] font-medium mt-1">
              Buy the whole combo together — save more than building it piece by piece
            </p>
            <div className="w-16 h-1 bg-[#0052FF] mt-2"></div>
          </div>
          <Link
            to="/alldeals"
            className="text-[12px] font-bold text-[var(--color-text)] border border-[#CBD5E1] py-2 px-6 rounded-sm hover:border-[var(--color-text)] transition-colors uppercase tracking-wide cursor-pointer bg-white text-center whitespace-nowrap"
          >
            VIEW ALL
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-[var(--color-border)] h-80 animate-pulse" style={{ borderRadius: 'var(--radius-sm)' }}></div>
          ))}
        </div>
        </div>
      </section>
    );
  }

  return (
    <section id="deals-bundles" className="w-full py-16" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <div className="max-w-[1500px] mx-auto px-4 lg:px-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-[24px] md:text-[32px] font-extrabold text-[var(--color-text)] tracking-tight uppercase">
              Bundle Deals
            </h2>
            <p className="text-[13px] text-[var(--color-text-secondary)] font-medium mt-1">
              Buy the whole combo together — save more than building it piece by piece
            </p>
            <div className="w-16 h-1 bg-[#0052FF] mt-2"></div>
          </div>
          <Link
            to="/alldeals"
            className="text-[12px] font-bold text-[var(--color-text)] border border-[#CBD5E1] py-2 px-6 rounded-sm hover:border-[var(--color-text)] transition-colors uppercase tracking-wide cursor-pointer bg-white text-center whitespace-nowrap"
          >
            VIEW ALL
          </Link>
        </div>

        {bundles.length === 0 ? (
          <div className="w-full p-16 text-center border border-dashed border-gray-300 rounded-lg bg-white">
            <h3 className="text-[20px] font-bold text-[#0F1111] mb-2">No bundle deals right now</h3>
            <p className="text-[#565959] font-medium">Check back soon — new bundles drop regularly.</p>
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.12 } } }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
          >
            {bundles.slice(0, 4).map((bundle) => (
              <BundleCard key={bundle._id} bundle={bundle} />
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default DealsBundleSection;
