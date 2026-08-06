import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import BoltIcon from '@mui/icons-material/Bolt';
import { bundleService } from '../services/bundle.service';
import { useCart } from '../context/CartContext';
import useCountdown from '../hooks/useCountdown';

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

const BundleCountdown = ({ endDate }) => {
  const countdown = useCountdown(endDate);
  if (!endDate || countdown.expired) return null;
  return (
    <div className="flex items-center gap-1 text-[11px] font-bold text-[#B91C1C]">
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

const BundleCard = ({ bundle }) => {
  const { addToCart, cartItems } = useCart();
  const navigate = useNavigate();

  const products = bundle.products || [];
  const prebuilts = bundle.prebuiltPCs || [];
  const members = [...products, ...prebuilts];
  const thumbnails = members.map(getMemberImage).filter(Boolean);
  const visibleThumbs = thumbnails.slice(0, 3);
  const overflow = thumbnails.length - visibleThumbs.length;
  const memberCount = members.length;
  const mainImage = bundle.image?.url || null;
  const inCart = cartItems.some((ci) => String(ci.id) === String(bundle._id) && ci.itemType === 'bundle');

  const itemsTotal = members.reduce((sum, item) => sum + getMemberPrice(item), 0);
  const savings = Number(bundle.savings) || 0;
  const discountPct =
    Number(bundle.discountPct) ||
    (itemsTotal > 0 ? Math.round((savings / itemsTotal) * 100) : 0);

  const handleAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    await addToCart({
      id: bundle._id,
      _id: bundle._id,
      title: bundle.name,
      name: bundle.name,
      price: Number(bundle.bundlePrice) || 0,
      image: bundle.image?.url || thumbnails[0] || null,
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
      className="bg-white border border-[#E2E8F0] overflow-hidden hover:shadow-lg hover:border-[#0052FF]/40 transition-all duration-300 flex flex-col cursor-pointer"
      style={{ borderRadius: 'var(--radius-sm)' }}
    >
      {/* Composition thumbnails */}
      <div className="block relative h-40 bg-[#F8FAFC] flex items-center justify-center overflow-hidden">
        {mainImage ? (
          <img src={mainImage} alt={bundle.name} className="w-full h-full object-cover mix-blend-multiply" />
        ) : visibleThumbs.length > 0 ? (
          <>
            {visibleThumbs.map((src, i) => (
              <div key={i} className="w-20 h-24 bg-white border border-[#E2E8F0] rounded-md p-1.5 shadow-sm">
                <img src={src} alt={`${bundle.name} item ${i + 1}`} className="w-full h-full object-contain mix-blend-multiply" />
              </div>
            ))}
            {overflow > 0 && (
              <div className="w-10 h-10 rounded-full bg-[#0F172A] text-white text-[13px] font-bold flex items-center justify-center">
                +{overflow}
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center gap-1 text-[13px] font-bold text-[#64748B] uppercase tracking-wide">
            {members.map((m, i) => (
              <span key={i} className="flex items-center">
                {i > 0 && <span className="text-[#0052FF] font-black mx-1">+</span>}
                {String(m.name || 'Item').split(' ').slice(0, 2).join(' ')}
              </span>
            ))}
          </div>
        )}

        <div className="absolute top-3 left-3 bg-[#0052FF] text-white text-[10px] font-bold uppercase tracking-wider rounded px-2 py-1 flex items-center gap-1">
          <BoltIcon sx={{ fontSize: 13 }} />
          Bundle · {memberCount} items
        </div>
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[16px] font-extrabold text-[#0F172A] tracking-tight leading-snug hover:text-[#0052FF] transition-colors">
            {bundle.name}
          </h3>
        </div>

        {bundle.description && (
          <p className="text-[12.5px] text-[#64748B] mt-1.5 line-clamp-2 leading-relaxed">
            {bundle.description}
          </p>
        )}

        {/* Pricing */}
        <div className="mt-4 flex items-end gap-2 flex-wrap">
          <span className="text-[13px] text-[#94A3B8] line-through">{formatINR(itemsTotal)}</span>
          <span className="text-[22px] font-black text-[#0F172A] tracking-tight leading-none">{formatINR(bundle.bundlePrice)}</span>
        </div>
        <div className="mt-2 inline-flex items-center gap-1.5">
          <span className="bg-green-100 text-green-800 text-[11px] font-bold rounded px-2 py-1">
            Save {formatINR(savings)} ({discountPct}% OFF)
          </span>
        </div>

        {/* Member chips */}
        <div className="mt-3 flex flex-wrap gap-1">
          {members.slice(0, 3).map((m, i) => (
            <span key={i} className="text-[10.5px] font-semibold text-[#475569] bg-[#F1F5F9] border border-[#E2E8F0] rounded-full px-2 py-0.5 max-w-full truncate">
              {String(m.name || 'Item')}
            </span>
          ))}
          {members.length > 3 && (
            <span className="text-[10.5px] font-semibold text-[#475569] bg-[#F1F5F9] border border-[#E2E8F0] rounded-full px-2 py-0.5">
              +{members.length - 3} more
            </span>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-[#E2E8F0] flex items-center justify-between gap-2">
          <BundleCountdown endDate={bundle.endDate} />
          {inCart ? (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                navigate('/cart');
              }}
              className="ml-auto inline-flex items-center gap-1.5 bg-[#0052FF] hover:bg-[#0041CC] text-white text-[12.5px] font-bold uppercase tracking-wide px-4 py-2.5 transition-colors cursor-pointer"
              style={{ borderRadius: 'var(--radius-sm)' }}
            >
              <ShoppingCartOutlinedIcon sx={{ fontSize: 16 }} />
              View Cart
            </button>
          ) : (
            <button
              onClick={handleAdd}
              className="ml-auto inline-flex items-center gap-1.5 bg-[#0052FF] hover:bg-[#0041CC] text-white text-[12.5px] font-bold uppercase tracking-wide px-4 py-2.5 transition-colors cursor-pointer"
              style={{ borderRadius: 'var(--radius-sm)' }}
            >
              <ShoppingCartOutlinedIcon sx={{ fontSize: 16 }} />
              Add Bundle
            </button>
          )}
        </div>
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

  if (!isLoading && bundles.length === 0) return null;

  return (
    <section id="deals-bundles" className="w-full py-16" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <div className="max-w-[1500px] mx-auto px-4 lg:px-8">
        <div className="mb-8">
          <h2 className="text-[24px] md:text-[32px] font-extrabold text-[#0F172A] tracking-tight uppercase">
            Bundle Deals
          </h2>
          <p className="text-[13px] text-[#64748B] font-medium mt-1">
            Buy the whole combo together — save more than building it piece by piece
          </p>
          <div className="w-16 h-1 bg-[#0052FF] mt-2"></div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[0, 1, 2].map((i) => (
              <div key={i} className="bg-white border border-[#E2E8F0] h-80 animate-pulse" style={{ borderRadius: 'var(--radius-sm)' }}></div>
            ))}
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.12 } } }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {bundles.map((bundle) => (
              <BundleCard key={bundle._id} bundle={bundle} />
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default DealsBundleSection;
