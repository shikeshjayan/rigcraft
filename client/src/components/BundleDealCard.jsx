import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { formatINR, getMemberImage, getBundlePrice } from '../utils/bundleUtils';
import { useCart } from '../context/CartContext';
import BundleCardImage from './BundleCardImage';

const BundleDealCard = ({ bundle, compact = false }) => {
  const navigate = useNavigate();
  const { addToCart, cartItems } = useCart();

  const products = bundle.products || [];
  const prebuilts = bundle.prebuiltPCs || [];
  const members = [...products, ...prebuilts];
  const thumbnails = members.map(getMemberImage).filter(Boolean);
  const mainImage = bundle.image?.url || thumbnails[0] || null;
  const inCart = cartItems.some((ci) => String(ci.id) === String(bundle._id) && ci.itemType === 'bundle');

  const { bundlePrice, itemsTotal, savings, discountPct } = getBundlePrice(bundle);
  const hasDiscount = itemsTotal > bundlePrice && bundlePrice > 0;

  const handleAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    await addToCart({
      id: bundle._id,
      _id: bundle._id,
      title: bundle.name,
      name: bundle.name,
      price: bundlePrice,
      image: mainImage,
      type: 'bundle',
      itemType: 'bundle',
    }, 1);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
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
      style={{ borderRadius: 'var(--radius-sm)', minHeight: compact ? '400px' : '400px' }}
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
              {formatINR(bundlePrice)}
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

export default BundleDealCard;
