import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import BoltIcon from '@mui/icons-material/Bolt';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { bundleService } from '../services/bundle.service';
import FadeUp from '../components/FadeUp';
import Breadcrumb from '../components/Breadcrumb';

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

const BundleGridCard = ({ bundle }) => {
  const navigate = useNavigate();
  const products = bundle.products || [];
  const prebuilts = bundle.prebuiltPCs || [];
  const members = [...products, ...prebuilts];
  const thumbnails = members.map(getMemberImage).filter(Boolean);
  const visibleThumbs = thumbnails.slice(0, 3);
  const overflow = thumbnails.length - visibleThumbs.length;
  const mainImage = bundle.image?.url || null;

  const itemsTotal = members.reduce((sum, item) => sum + getMemberPrice(item), 0);
  const bundlePrice = Number(bundle.bundlePrice) || 0;
  const savings = Number(bundle.savings) || Math.max(0, itemsTotal - bundlePrice);
  const discountPct =
    Number(bundle.discountPct) ||
    (itemsTotal > 0 ? Math.round((savings / itemsTotal) * 100) : 0);

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
      className="bg-white border border-[#E2E8F0] overflow-hidden hover:shadow-lg hover:border-[#0052FF]/40 transition-all duration-300 flex flex-col cursor-pointer"
      style={{ borderRadius: 'var(--radius-sm)' }}
    >
      <div className="block relative h-36 bg-[#F8FAFC] flex items-center justify-center overflow-hidden">
        {mainImage ? (
          <img src={mainImage} alt={bundle.name} className="w-full h-full object-cover mix-blend-multiply" />
        ) : visibleThumbs.length > 0 ? (
          <>
            {visibleThumbs.map((src, i) => (
              <div key={i} className="w-16 h-20 bg-white border border-[#E2E8F0] rounded-md p-1.5 shadow-sm">
                <img src={src} alt={`${bundle.name} item ${i + 1}`} className="w-full h-full object-contain mix-blend-multiply" />
              </div>
            ))}
            {overflow > 0 && (
              <div className="w-9 h-9 rounded-full bg-[#0F172A] text-white text-[12px] font-bold flex items-center justify-center">
                +{overflow}
              </div>
            )}
          </>
        ) : (
          <span className="text-[13px] font-bold text-[#64748B] uppercase tracking-wide">Bundle</span>
        )}
        <div className="absolute top-3 left-3 bg-[#0052FF] text-white text-[10px] font-bold uppercase tracking-wider rounded px-2 py-1 flex items-center gap-1">
          <BoltIcon sx={{ fontSize: 12 }} />
          {members.length} items
        </div>
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-[15px] font-extrabold text-[#0F172A] tracking-tight leading-snug hover:text-[#0052FF] transition-colors">
          {bundle.name}
        </h3>
        {bundle.description && (
          <p className="text-[12px] text-[#64748B] mt-1 line-clamp-2 leading-relaxed">{bundle.description}</p>
        )}
        <div className="mt-3 flex items-end gap-2 flex-wrap">
          <span className="text-[12px] text-[#94A3B8] line-through">{formatINR(itemsTotal)}</span>
          <span className="text-[19px] font-black text-[#0F172A] tracking-tight leading-none">{formatINR(bundlePrice)}</span>
        </div>
        <div className="mt-2 inline-flex">
          <span className="bg-green-100 text-green-800 text-[10.5px] font-bold rounded px-2 py-1">
            Save {formatINR(savings)} ({discountPct}% OFF)
          </span>
        </div>
      </div>
    </motion.div>
  );
};

const AllBundleDeals = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const { data, isLoading } = useQuery({
    queryKey: ['allBundleDeals'],
    queryFn: () => bundleService.getActive(),
    staleTime: 60_000,
  });

  const bundles = Array.isArray(data?.data) ? data.data : [];

  const totalPages = Math.max(1, Math.ceil(bundles.length / itemsPerPage));
  const currentBundles = bundles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <FadeUp delay={0.1}>
      <div className="w-full py-12 min-h-screen" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        <div className="max-w-[1500px] mx-auto px-4 lg:px-8">
          <Breadcrumb items={[{ label: 'Home', path: '/' }, { label: 'Bundle Deals' }]} />
          <h1 className="text-[32px] font-extrabold text-[#0F172A] mb-8 uppercase">All Bundle Deals</h1>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, idx) => (
                <div key={idx} className="h-64 bg-white border border-[#E2E8F0] animate-pulse" style={{ borderRadius: 'var(--radius-sm)' }} />
              ))}
            </div>
          ) : bundles.length === 0 ? (
            <div className="py-20 text-center text-[#64748B] font-medium">No bundle deals available at the moment.</div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {currentBundles.map((bundle) => (
                  <BundleGridCard key={bundle._id} bundle={bundle} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="w-full flex items-center justify-center gap-6 mt-16 border-t border-[#E2E8F0] pt-8">
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 px-5 py-2.5 bg-white border border-[#D5D9D9] rounded-md font-bold text-[#0F1111] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F7F7F7] transition-colors cursor-pointer shadow-sm"
                  >
                    <KeyboardArrowLeftIcon /> Previous
                  </button>

                  <span className="text-[15px] font-bold text-[#565959]">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1 px-5 py-2.5 bg-white border border-[#D5D9D9] rounded-md font-bold text-[#0F1111] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F7F7F7] transition-colors cursor-pointer shadow-sm"
                  >
                    Next <KeyboardArrowRightIcon />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </FadeUp>
  );
};

export default AllBundleDeals;
