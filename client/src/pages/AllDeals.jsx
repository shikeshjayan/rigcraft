import { useEffect, useState, useRef, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import DealCard from '../components/DealCard';
import BundleDealCard from '../components/BundleDealCard';
import Pagination from '../components/Pagination';
import { getMemberPrice } from '../utils/bundleUtils';
import Breadcrumb from '../components/Breadcrumb';
import apiClient from '../api/client';
import { bundleService } from '../services/bundle.service';

const uniqueBy = (items, key) =>
  Array.from(new Map(items.map(item => [item[key] || item._id, item])).values());

const normalizeItem = (item, itemType) => {
  const isPrebuilt = itemType === 'prebuilt';
  const pricing = isPrebuilt ? (item.pricing || {}) : item;

  const mrp = isPrebuilt ? pricing.price : item.price;
  const dealPrice = isPrebuilt ? (pricing.salePrice || pricing.price) : (item.salePrice || item.price);
  const discountPct =
    mrp && dealPrice && Number(mrp) > Number(dealPrice)
      ? Math.round(((Number(mrp) - Number(dealPrice)) / Number(mrp)) * 100)
      : 0;

  const categoryValue =
    (item.category && typeof item.category === 'object' && item.category.name) ||
    (typeof item.category === 'string' && item.category.length !== 24 ? item.category : null) ||
    (typeof item.brand === 'string' && item.brand.length !== 24 ? item.brand : null) ||
    (item.brand && typeof item.brand === 'object' && item.brand.name) ||
    (isPrebuilt ? 'PREBUILD' : 'COMPONENT');

  return {
    id: item._id || item.id,
    slug: item.slug,
    title: item.name || item.title,
    image: item.images?.[0]?.url || item.image || '/fallback.png',
    description: item.shortDescription || item.description,
    rating: item.rating,
    stock: item.stock,
    createdAt: item.createdAt,
    price: Number(dealPrice) || 0,
    mrp: Number(mrp) || 0,
    discountPct,
    category: categoryValue,
    endDate: item.dealEndDate,
    itemType,
  };
};

const normalizeBundle = (bundle) => {
  const members = [...(bundle.products || []), ...(bundle.prebuiltPCs || [])];
  const itemsTotal = members.reduce((sum, item) => sum + getMemberPrice(item), 0);
  const bundlePrice = Number(bundle.bundlePrice) || 0;
  const savings = Number(bundle.savings) || Math.max(0, itemsTotal - bundlePrice);
  const discountPct =
    Number(bundle.discountPct) ||
    (itemsTotal > 0 ? Math.round((savings / itemsTotal) * 100) : 0);

  return {
    id: bundle._id || bundle.id,
    slug: bundle.slug,
    title: bundle.name || bundle.title,
    image: bundle.image?.url || '/fallback.png',
    createdAt: bundle.createdAt,
    price: bundlePrice,
    mrp: itemsTotal,
    discountPct,
    endDate: bundle.endDate,
    itemType: 'bundle',
    bundle,
  };
};

const TABS = [
  { key: 'all', label: 'All Deals' },
  { key: 'components', label: 'Components' },
  { key: 'prebuilt', label: 'Prebuilt PCs' },
  { key: 'bundles', label: 'Bundle Deals' },
];

const SORT_OPTIONS = [
  { key: 'discount', label: 'Biggest Discount' },
  { key: 'priceLow', label: 'Price: Low to High' },
  { key: 'priceHigh', label: 'Price: High to Low' },
  { key: 'endingSoon', label: 'Ending Soon' },
  { key: 'newest', label: 'Newest' },
];

const sortItems = (items, sortBy) => {
  const sorted = [...items];
  switch (sortBy) {
    case 'priceLow':
      return sorted.sort((a, b) => a.price - b.price);
    case 'priceHigh':
      return sorted.sort((a, b) => b.price - a.price);
    case 'endingSoon':
      return sorted.sort((a, b) => {
        const aT = a.endDate ? new Date(a.endDate).getTime() : Infinity;
        const bT = b.endDate ? new Date(b.endDate).getTime() : Infinity;
        return aT - bT;
      });
    case 'newest':
      return sorted.sort((a, b) => {
        const aT = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bT = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bT - aT;
      });
    case 'discount':
    default:
      return sorted.sort((a, b) => b.discountPct - a.discountPct || b.mrp - a.mrp);
  }
};

const AllDeals = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Tabs + Sort State
  const [activeTab, setActiveTab] = useState('all');
  const [sortBy, setSortBy] = useState('discount');
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef(null);
  const [catOpen, setCatOpen] = useState(false);
  const catRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target)) setSortOpen(false);
      if (catRef.current && !catRef.current.contains(e.target)) setCatOpen(false);
    };
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        setSortOpen(false);
        setCatOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, []);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const { data: dealsData, isLoading: dealsLoading } = useQuery({
    queryKey: ['activeDealsProducts'],
    queryFn: async () => {
      const res = await apiClient.get('/deals/active');
      return res.data;
    },
  });

  const { data: bundlesData, isLoading: bundlesLoading } = useQuery({
    queryKey: ['activeBundlesAllDeals'],
    queryFn: () => bundleService.getActive(),
    staleTime: 60_000,
  });

  const { components, prebuilts } = useMemo(() => {
    const dealsList = Array.isArray(dealsData?.data) ? dealsData.data : [];
    const allComponents = [];
    const allPrebuilts = [];

    dealsList.forEach((deal) => {
      const endDate = deal.endDate;
      (deal.products || []).forEach((p) => allComponents.push({ ...p, dealEndDate: endDate }));
      (deal.prebuiltPCs || []).forEach((p) => allPrebuilts.push({ ...p, dealEndDate: endDate }));
    });

    return {
      components: uniqueBy(allComponents, 'slug').map((item) => normalizeItem(item, 'product')),
      prebuilts: uniqueBy(allPrebuilts, 'slug').map((item) => normalizeItem(item, 'prebuilt')),
    };
  }, [dealsData]);

  const bundles = useMemo(() => {
    const list = Array.isArray(bundlesData?.data) ? bundlesData.data : [];
    return list.map(normalizeBundle);
  }, [bundlesData]);

  const isLoading = dealsLoading || bundlesLoading;

  const allItems = useMemo(() => [...components, ...prebuilts, ...bundles], [components, prebuilts, bundles]);

  const baseItems = useMemo(() => {
    switch (activeTab) {
      case 'components':
        return components;
      case 'prebuilt':
        return prebuilts;
      case 'bundles':
        return bundles;
      case 'all':
      default:
        return allItems;
    }
  }, [activeTab, components, prebuilts, bundles, allItems]);

  const sortedItems = useMemo(() => sortItems(baseItems, sortBy), [baseItems, sortBy]);

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(sortedItems.length / itemsPerPage));
  const currentItems = sortedItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (nextPage) => {
    if (nextPage < 1 || nextPage > totalPages) return;
    setCurrentPage(nextPage);
    document.getElementById('deals-top').scrollIntoView({ behavior: 'smooth' });
  };

  const currentSortLabel = SORT_OPTIONS.find((o) => o.key === sortBy)?.label || 'Sort';

  const getTabCount = (key) =>
    key === 'all'
      ? allItems.length
      : key === 'components'
        ? components.length
        : key === 'prebuilt'
          ? prebuilts.length
          : bundles.length;

  const activeTabData = TABS.find((t) => t.key === activeTab) || TABS[0];

  const renderCard = (item) => {
    if (item.itemType === 'bundle') {
      return <BundleDealCard key={item.id} bundle={item.bundle} />;
    }
    return (
      <DealCard
        key={item.id}
        id={item.slug}
        apiId={item.id}
        title={item.title}
        image={item.image}
        price={item.price}
        mrp={item.mrp}
        stock={item.stock}
        rating={item.rating}
        description={item.description}
        category={item.category}
        endDate={item.endDate}
        itemType={item.itemType}
        compact
      />
    );
  };

  return (
    <section id="deals-top" className="w-full py-12 pb-24" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
      <div className="max-w-[1500px] mx-auto px-4 lg:px-8">
        <Breadcrumb items={[{ label: 'Home', path: '/' }, { label: 'All Deals' }]} />

        <div
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6 sticky top-[111px] z-40 py-4 border-b border-transparent backdrop-blur-md transition-all duration-300"
          style={{ backgroundColor: 'rgba(241, 245, 249, 0.95)' }}
        >
          <div className="text-center md:text-left">
            <h1 className="text-[28px] md:text-[32px] font-extrabold text-[var(--color-text)] uppercase">All Deals</h1>
            <p className="text-[14px] text-[#565959]">Showing {sortedItems.length} results</p>
          </div>

          {/* Sort Dropdown */}
          <div className="relative w-full md:w-auto" ref={sortRef}>
            <button
              type="button"
              onClick={() => setSortOpen(!sortOpen)}
              className="flex items-center justify-center gap-2 w-full md:w-52 px-4 py-2.5 bg-white border border-[#CBD5E1] rounded-sm text-[13px] font-bold text-[var(--color-text)] hover:border-[var(--color-text)] transition-colors cursor-pointer shadow-sm"
            >
              <span className="flex items-center gap-2">
                <SwapVertIcon sx={{ fontSize: 18 }} />
                {currentSortLabel}
              </span>
            </button>
            {sortOpen && (
              <div className="absolute left-0 right-0 md:left-auto md:right-0 top-full mt-2 z-40 bg-white border border-[#CBD5E1] shadow-xl overflow-hidden w-full md:w-52" style={{ borderRadius: 'var(--radius-sm)' }}>
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => {
                      setSortBy(opt.key);
                      setSortOpen(false);
                      setCurrentPage(1);
                    }}
                    className={`w-full text-center px-4 py-2.5 text-[13px] font-medium hover:bg-[#F0F6FF] transition-colors cursor-pointer ${sortBy === opt.key ? 'text-[var(--color-primary)] font-bold bg-[#F0F6FF]' : 'text-[var(--color-text)]'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Category Tabs - Desktop / Tablet */}
        <div className="hidden md:flex items-center gap-2 overflow-x-auto pb-2 mb-10 -mx-1 px-1">
          {TABS.map((tab) => {
            const count = getTabCount(tab.key);
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setActiveTab(tab.key);
                  setCurrentPage(1);
                }}
                className={`flex items-center gap-2 whitespace-nowrap px-5 py-2.5 text-[13px] font-bold uppercase tracking-wide transition-colors cursor-pointer border ${
                  active
                    ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                    : 'bg-white text-[var(--color-text)] border-[#CBD5E1] hover:border-[var(--color-text)]'
                }`}
                style={{ borderRadius: 'var(--radius-sm)' }}
              >
                {tab.label}
                <span
                  className={`text-[11px] px-1.5 py-0.5 rounded-full font-extrabold ${
                    active ? 'bg-white/20 text-white' : 'bg-[#F0F6FF] text-[var(--color-primary)]'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Category Tabs - Mobile Dropdown */}
        <div className="md:hidden relative mb-10" ref={catRef}>
          <button
            type="button"
            onClick={() => setCatOpen(!catOpen)}
            className="flex items-center justify-between gap-2 w-full px-4 py-2.5 bg-white border border-[#CBD5E1] text-[13px] font-bold text-[var(--color-text)] hover:border-[var(--color-text)] transition-colors cursor-pointer shadow-sm"
            style={{ borderRadius: 'var(--radius-sm)' }}
          >
            <span className="flex items-center gap-2">
              <SwapVertIcon sx={{ fontSize: 18 }} />
              {activeTabData.label}
              <span className="text-[11px] px-1.5 py-0.5 rounded-full font-extrabold bg-[#F0F6FF] text-[var(--color-primary)]">
                {getTabCount(activeTab)}
              </span>
            </span>
            <KeyboardArrowRightIcon
              sx={{ fontSize: 18 }}
              className={`transition-transform duration-300 ${catOpen ? 'rotate-90' : ''}`}
            />
          </button>
          {catOpen && (
            <div
              className="absolute left-0 right-0 top-full mt-2 z-40 bg-white border border-[#CBD5E1] shadow-xl overflow-hidden"
              style={{ borderRadius: 'var(--radius-sm)' }}
            >
              {TABS.map((tab) => {
                const active = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab.key);
                      setCurrentPage(1);
                      setCatOpen(false);
                    }}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 text-[13px] font-medium transition-colors cursor-pointer ${
                      active ? 'text-[var(--color-primary)] font-bold bg-[#F0F6FF]' : 'text-[var(--color-text)] hover:bg-[#F0F6FF]'
                    }`}
                  >
                    {tab.label}
                    <span
                      className={`text-[11px] px-1.5 py-0.5 rounded-full font-extrabold ${
                        active ? 'bg-[var(--color-primary)] text-white' : 'bg-[#F0F6FF] text-[var(--color-primary)]'
                      }`}
                    >
                      {getTabCount(tab.key)}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="relative">
          <div className="w-full">
            <AnimatePresence mode="wait">
              {currentItems.length === 0 && !isLoading ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full p-20 text-center border border-dashed border-gray-300 rounded-lg bg-white"
                >
                  <h3 className="text-[20px] font-bold text-[#0F1111] mb-2">No deals found</h3>
                  <p className="text-[#565959]">Try a different category or check back later.</p>
                </motion.div>
              ) : (
                <motion.div
                  key="grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 min-h-[800px] items-start content-start">
                    {isLoading ? (
                      Array.from({ length: 10 }).map((_, idx) => (
                        <div key={`skeleton-${idx}`} className="h-[400px] bg-gray-100 rounded-lg animate-pulse"></div>
                      ))
                    ) : (
                      currentItems.map(renderCard)
                    )}
                  </div>

                  {!isLoading && (
                    <Pagination
                      page={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AllDeals;
