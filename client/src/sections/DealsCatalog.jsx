import { useState, useRef, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import apiClient from '../api/client';
import DealCard from '../components/DealCard';
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

const SORT_OPTIONS = [
  { key: 'discount', label: 'Biggest Discount' },
  { key: 'priceLow', label: 'Price: Low to High' },
  { key: 'priceHigh', label: 'Price: High to Low' },
  { key: 'endingSoon', label: 'Ending Soon' },
  { key: 'newest', label: 'Newest' },
];

const DealsCatalog = () => {
  const [sortBy, setSortBy] = useState('discount');
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target)) setSortOpen(false);
    };
    const handleKey = (e) => {
      if (e.key === 'Escape') setSortOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, []);

  const { data: dealsData, isLoading } = useQuery({
    queryKey: ['activeDealsProducts'],
    queryFn: async () => {
      const res = await apiClient.get('/deals/active');
      return res.data;
    },
  });

  const { data: bundlesData } = useQuery({
    queryKey: ['activeBundlesShopDeals'],
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

  const { sortedComponents, sortedPrebuilts } = useMemo(() => {
    const sortItems = (items) => {
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

    return {
      sortedComponents: sortItems(components),
      sortedPrebuilts: sortItems(prebuilts),
    };
  }, [components, prebuilts, sortBy]);

  const currentSortLabel = SORT_OPTIONS.find((o) => o.key === sortBy)?.label || 'Sort';

  const renderCard = (item) => (
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

  const renderGrid = (items) =>
    items.length > 0 ? (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {items.slice(0, 8).map(renderCard)}
      </div>
    ) : null;

  const renderGroup = (title, subTitle, items, viewAllTo) =>
    items.length > 0 && (
      <div className="mb-14 last:mb-0">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h3 className="text-[20px] md:text-[26px] font-extrabold text-[#0F172A] tracking-tight uppercase">
              {title}
            </h3>
            {subTitle && (
              <p className="text-[13px] text-[#64748B] font-medium mt-1">{subTitle}</p>
            )}
            <div className="w-16 h-1 bg-[#0052FF] mt-2"></div>
          </div>
          {viewAllTo && (
            <Link
              to={viewAllTo}
              className="text-[12px] font-bold text-[#0F172A] border border-[#CBD5E1] py-2 px-6 rounded-sm hover:border-[#0F172A] transition-colors uppercase tracking-wide cursor-pointer bg-white text-center whitespace-nowrap"
            >
              VIEW ALL
            </Link>
          )}
        </div>
        {renderGrid(items)}
      </div>
    );

  const isEmpty = !isLoading && sortedComponents.length === 0 && sortedPrebuilts.length === 0;

  return (
    <section
      id="deals-catalog"
      className="w-full py-16 border-t border-[#E2E8F0] scroll-mt-24"
      style={{ backgroundColor: 'var(--color-bg-secondary)' }}
    >
      <div className="max-w-[1500px] mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-[24px] md:text-[32px] font-extrabold text-[#0F172A] tracking-tight uppercase">
              Shop Deals
            </h2>
            <p className="text-[14px] text-[#64748B] font-medium mt-1">
              {components.length + prebuilts.length + (Array.isArray(bundlesData?.data) ? bundlesData.data.length : 0)} products on sale right now
            </p>
            <div className="w-16 h-1 bg-[#0052FF] mt-2"></div>
          </div>

          {/* Sort Dropdown */}
          <div className="relative" ref={sortRef}>
            <button
              type="button"
              onClick={() => setSortOpen(!sortOpen)}
              className="flex items-center justify-center gap-2 w-52 px-4 py-2.5 bg-white border border-[#CBD5E1] rounded-sm text-[13px] font-bold text-[#0F172A] hover:border-[#0F172A] transition-colors cursor-pointer shadow-sm"
            >
              <span className="flex items-center gap-2">
                <SwapVertIcon sx={{ fontSize: 18 }} />
                {currentSortLabel}
              </span>
            </button>
            {sortOpen && (
              <div className="absolute right-0 top-full mt-2 z-40 bg-white border border-[#CBD5E1] shadow-xl overflow-hidden w-52" style={{ borderRadius: 'var(--radius-sm)' }}>
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => {
                      setSortBy(opt.key);
                      setSortOpen(false);
                    }}
                    className={`w-full text-center px-4 py-2.5 text-[13px] font-medium hover:bg-[#F0F6FF] transition-colors cursor-pointer ${sortBy === opt.key ? 'text-[var(--color-primary)] font-bold bg-[#F0F6FF]' : 'text-[#0F172A]'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="h-[480px] bg-gray-100 rounded-lg animate-pulse"></div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {isEmpty && (
          <div className="w-full p-16 text-center border border-dashed border-gray-300 rounded-lg bg-white">
            <h3 className="text-[20px] font-bold text-[#0F1111] mb-2">No active deals right now</h3>
            <p className="text-[#565959] font-medium">Check back soon — new deals drop regularly.</p>
          </div>
        )}

        {/* Content */}
        {!isLoading && !isEmpty && (
          <>
            {renderGroup(
              'Component Deals',
              'Component deals on the hottest hardware',
              sortedComponents,
              '/alldeals'
            )}
            {renderGroup(
              'Prebuilt PC Deals',
              'Complete prebuilt PCs, ready to game',
              sortedPrebuilts,
              '/alldeals'
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default DealsCatalog;
