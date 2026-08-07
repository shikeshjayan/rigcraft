import { usePublicSettings } from '../context/PublicSettingsContext';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { Link } from 'react-router-dom';

const parsePrice = (val) => {
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    const parsed = parseFloat(val.replace(/[^0-9.-]+/g, ''));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const formatINR = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

const formatWarranty = (warranty) => {
  if (!warranty?.duration || !warranty?.unit) return null;
  const { duration, unit } = warranty;
  const label = unit === 'year' ? (duration === 1 ? 'Year' : 'Years') : (duration === 1 ? 'Month' : 'Months');
  return `${duration} ${label} Warranty`;
};

const getItemImage = (item) =>
  item.image || (typeof item.images?.[0] === 'string' ? item.images[0] : item.images?.[0]?.url) || '/placeholder.png';

const getItemTitle = (item) => item.title || item.name || '';

const getItemId = (item) => item.id || item._id;

const getBrandName = (brand) => {
  if (!brand) return 'Rigcraft';
  if (typeof brand === 'object' && brand !== null) return brand.name || brand.title || 'Rigcraft';
  if (/^[a-fA-F0-9]{24}$/.test(String(brand))) return 'Rigcraft';
  return brand;
};

const formatAddedDate = (addedAt) => {
  if (!addedAt) return null;
  const date = new Date(addedAt);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const renderStars = (averageRating) =>
  [...Array(5)].map((_, i) => {
    const fill = averageRating >= i + 1 ? 1 : (averageRating >= i + 0.5 ? 0.5 : 0);
    if (fill === 1) return <span key={i}>★</span>;
    if (fill === 0.5) return (
      <span key={i} style={{ display: 'inline-flex', position: 'relative', width: '0.5em', overflow: 'hidden' }}>
        <span>★</span>
        <span style={{ position: 'absolute', left: '0.5em', top: 0, color: '#D1D5DB' }}>★</span>
      </span>
    );
    return <span key={i} className="text-gray-300">★</span>;
  });

const WishlistCard = ({ item, onAddToCart, onRequestRemove, onNotifyMe }) => {
  const { freeShippingAbove } = usePublicSettings();

  const id = getItemId(item);
  const title = getItemTitle(item);
  const image = getItemImage(item);
  const brand = getBrandName(item.brand);
  const priceNum = parsePrice(item.price || item.pricing?.salePrice || item.selling);
  const mrpNum = parsePrice(item.mrp || item.pricing?.price);
  const hasDiscount = mrpNum > priceNum && priceNum > 0;
  const savings = hasDiscount ? mrpNum - priceNum : 0;
  const discountPct = hasDiscount ? Math.round((savings / mrpNum) * 100) : 0;
  const warrantyText = formatWarranty(item.warranty);
  const addedLabel = formatAddedDate(item.addedAt);
  const averageRating = item.rating?.average || 0;
  const ratingCount = item.rating?.count || 0;
  const ratingDisplay = ratingCount > 0 ? `${averageRating.toFixed(1)} (${ratingCount})` : 'New';
  const linkTo = `/detail/${item.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}/${id}${item.itemType === 'prebuilt' ? '?type=prebuilt' : ''}`;
  const isOutOfStock = typeof item.stock === 'number' && item.stock <= 0;
  const isLowStock = typeof item.stock === 'number' && item.stock > 0 && item.stock <= 5;

  return (
    <div className="flex flex-col h-full bg-white border border-[#EAEAEC] rounded-[var(--radius-sm)] shadow-sm hover:shadow-md transition-shadow group">
      {/* Product Image */}
      <Link to={linkTo} className="block w-full aspect-[3/4] bg-[#F5F6F6] overflow-hidden relative rounded-t-[var(--radius-sm)]">
        {image ? (
          <img
            id={`wishlist-img-${id}`}
            src={image}
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-400">
            <ImageOutlinedIcon sx={{ fontSize: 40, opacity: 0.5, mb: 1 }} />
            <span className="text-[10px] font-bold tracking-wider">NO IMAGE</span>
          </div>
        )}
        {isLowStock && (
          <span className="absolute bottom-2 left-2 px-2 py-0.5 text-[10px] font-bold text-white bg-[#EA580C] rounded-full">
            Only {item.stock} Left
          </span>
        )}
      </Link>

      {/* Product Info */}
      <div className="p-4 flex flex-col flex-grow">
        {brand && (
          <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px] mb-1">{brand}</span>
        )}
        <Link
          to={linkTo}
          className="text-[14px] text-[#282C3F] hover:text-[var(--color-primary)] font-normal truncate mb-1 transition-colors cursor-pointer block"
        >
          {title}
        </Link>

        <div className="flex items-center gap-2.5 mb-2">
          <div className="flex text-yellow-400 text-sm" aria-label={`Rating ${averageRating.toFixed(1)} out of 5`}>
            {renderStars(averageRating)}
          </div>
          <span className="text-gray-400 text-[10px] font-medium">{ratingDisplay}</span>
        </div>

        <div className="mb-2">
          <div className="flex items-end gap-2 flex-wrap mb-1">
            <span className="text-[14px] font-[800] text-[#282C3F] leading-none">{formatINR(priceNum)}</span>
            {hasDiscount && (
              <span className="text-[12px] text-[#7E818C] line-through leading-none mb-0.5">{formatINR(mrpNum)}</span>
            )}
          </div>
          {hasDiscount && (
            <div className="text-[#16A34A] font-bold text-[12px]">
              {discountPct >= 5 ? `${formatINR(savings)} OFF` : `Save ${formatINR(savings)}`}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5 mb-2" role="img" aria-label="Trust badges">
          {warrantyText && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-full">
              <ShieldOutlinedIcon sx={{ fontSize: 13 }} />
              {warrantyText}
            </span>
          )}
          {freeShippingAbove > 0 && priceNum >= freeShippingAbove && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-full">
              <LocalShippingOutlinedIcon sx={{ fontSize: 13 }} />
              Free Shipping
            </span>
          )}
        </div>

        {addedLabel && (
          <span className="text-[11px] text-gray-400 mb-2">
            Added on {addedLabel}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="p-3 flex items-stretch gap-2">
        {isOutOfStock ? (
          <button
            type="button"
            onClick={() => onNotifyMe?.(item)}
            className="flex-1 font-bold py-2.5 px-4 text-[13px] uppercase tracking-wide transition-colors cursor-pointer bg-white text-[var(--color-primary)] border-2 border-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white active:bg-[var(--color-primary)] active:text-white"
            style={{ borderRadius: 'var(--radius-sm)' }}
          >
            <NotificationsActiveOutlinedIcon sx={{ fontSize: 16, mr: 1 }} />
            Notify Me
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onAddToCart?.(item)}
            className="flex-1 font-bold py-2.5 px-4 text-[13px] uppercase tracking-wide transition-colors cursor-pointer bg-white text-[var(--color-primary)] border-2 border-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white active:bg-[var(--color-primary)] active:text-white"
            style={{ borderRadius: 'var(--radius-sm)' }}
          >
            Add to Cart
          </button>
        )}
        <button
          type="button"
          onClick={() => onRequestRemove?.(item)}
          aria-label="Remove from wishlist"
          className="shrink-0 flex items-center justify-center transition-all duration-300 cursor-pointer bg-white border-2 border-border text-text-secondary hover:border-danger hover:text-danger hover:bg-danger/10 hover:scale-105 active:border-danger active:text-danger pointer-coarse:border-danger pointer-coarse:text-danger"
          style={
            {
              borderRadius: 'var(--radius-sm)',
              width: 46,
            }
          }
        >
          <DeleteOutlinedIcon sx={{ fontSize: 20 }} />
        </button>
      </div>
    </div>
  );
};

export default WishlistCard;
