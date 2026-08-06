import { useState, useEffect, useMemo, useRef } from 'react';
import Card from '../components/Card';
import ConfirmDialog from '../components/Navbar/ConfirmDialog';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import apiClient from '../api/client';
import { useBuilder, STEPS, MULTI_SLOT_CATEGORIES } from '../context/BuilderContext';
import { normalizeBuilderProduct } from '../utils/builderProducts';
import { useToast } from '../components/toast/useToast';

const CATEGORY_KEY_MAP = { storage: 'ssd', cooler: 'cooling' };

const BuilderUpgrades = () => {
  const { selectedParts, compatibility, selectPart } = useBuilder();
  const [allItems, setAllItems] = useState([]);
  const [pendingReplace, setPendingReplace] = useState(null);
  const [canScroll, setCanScroll] = useState(false);
  const carouselRef = useRef(null);
  const { toast } = useToast();

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -400, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 400, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await apiClient.get('/products?limit=1000');
        if (data && data.data) {
          const docs = data.data.docs || data.data;
          const pcArray = Array.isArray(docs) ? docs : [];
          setAllItems(pcArray.map(p => normalizeBuilderProduct(p)));
        }
      } catch (error) {
        console.error('Failed to fetch upgrade products', error);
      }
    };
    fetchProducts();
  }, []);

  // Category (slot name) -> available normalized items
  const byCategory = useMemo(() => {
    const map = {};
    for (const item of allItems) {
      if (!item.category) continue;
      (map[item.category] = map[item.category] || []).push(item);
    }
    return map;
  }, [allItems]);

  const slotKeyFor = (type) => CATEGORY_KEY_MAP[type] || type;

  const recommendations = useMemo(() => {
    const picks = [];

    // 1. Missing required components — best sellers first
    const missingSlots = (compatibility.missing || []).map(slotKeyFor);
    for (const slot of missingSlots) {
      const candidates = (byCategory[slot] || [])
        .slice()
        .sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0) || (b.viewCount || 0) - (a.viewCount || 0));
      for (const item of candidates.slice(0, 2)) {
        picks.push({ item, reason: `Missing ${STEPS.find(s => s.category === slot)?.label || slot}`, tag: 'RECOMMENDED' });
      }
    }

    // 2. Smart upgrades for filled slots — cheaper upgrades first
    if (picks.length < 8) {
      STEPS.filter(s => s.category !== null).forEach(step => {
        const value = selectedParts[step.category];
        const current = MULTI_SLOT_CATEGORIES.includes(step.category)
          ? null
          : value;
        if (!current || picks.length >= 8) return;
        const currentPrice = Number(current.priceVal) || 0;
        const candidates = (byCategory[step.category] || [])
          .filter(item => item.id !== current.id && (Number(item.priceVal) || 0) > currentPrice && (Number(item.priceVal) || 0) > 0)
          .sort((a, b) => (Number(a.priceVal) || 0) - (Number(b.priceVal) || 0))
          .slice(0, 1);
        for (const item of candidates) {
          picks.push({ item, reason: `Upgrade from your ${step.label}`, tag: 'UPGRADE' });
        }
      });
    }

    return picks.slice(0, 8);
  }, [byCategory, selectedParts, compatibility.missing]);

  useEffect(() => {
    const measure = () => {
      if (carouselRef.current) {
        setCanScroll(carouselRef.current.scrollWidth > carouselRef.current.clientWidth + 1);
      }
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [recommendations.length]);

  const applyToBuild = (item) => {
    selectPart(item);
    toast('Component added to your build!', 'success');
    document.getElementById('builder-workspace')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleAddToBuild = (item) => {
    const isMultiSlot = MULTI_SLOT_CATEGORIES.includes(item.category);
    const existing = selectedParts[item.category];

    if (!isMultiSlot && existing && existing.id !== item.id) {
      setPendingReplace({ current: existing, incoming: item });
      return;
    }

    applyToBuild(item);
  };

  const confirmReplace = () => {
    if (pendingReplace) applyToBuild(pendingReplace.incoming);
    setPendingReplace(null);
  };

  return (
    <section className="w-full py-16" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <div className="max-w-[1500px] mx-auto px-4 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
          <div>
            <h2 className="text-[24px] font-bold text-[#0F172A] mb-1">
              Recommended Upgrades
            </h2>
            <p className="text-[14px] text-[#64748B]">
              Smart suggestions based on your current build — missing parts first, then value upgrades.
            </p>
          </div>

          {canScroll && (
            <div className="flex items-center gap-2 shrink-0 self-end">
              <button
                onClick={scrollLeft}
                className="flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors shadow-sm cursor-pointer"
                style={{ borderRadius: 'var(--radius-sm, 8px)' }}
                aria-label="Previous"
              >
                <ChevronLeftIcon />
              </button>
              <button
                onClick={scrollRight}
                className="flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors shadow-sm cursor-pointer"
                style={{ borderRadius: 'var(--radius-sm, 8px)' }}
                aria-label="Next"
              >
                <ChevronRightIcon />
              </button>
            </div>
          )}
        </div>

        {recommendations.length === 0 ? (
          <div className="bg-white border border-[#CBD5E1] p-8 text-center" style={{ borderRadius: 'var(--radius-sm)' }}>
            <div className="text-[15px] font-bold text-[#0F172A] mb-1">No recommendations yet.</div>
            <p className="text-[13px] text-[#64748B]">Select some components above and we'll suggest the best next parts and upgrades.</p>
          </div>
        ) : (
          <div
            ref={carouselRef}
            className="flex overflow-x-auto gap-6 pb-2 snap-x snap-mandatory hide-scrollbar"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {recommendations.map(({ item, reason, tag }) => (
              <div key={item.id} className="flex-shrink-0 w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] flex flex-col snap-start">
                <Card
                  id={item.id}
                  image={item.image}
                  title={item.title}
                  specs={item.specs}
                  description={reason}
                  price={item.price}
                  mrp={item.mrp}
                  discount={item.discount}
                  category={item.category}
                  tag={tag}
                  tagColor={tag === 'RECOMMENDED' ? '#10B981' : 'var(--color-primary)'}
                  buttonText="Add to Build"
                  onButtonClick={() => handleAddToBuild(item)}
                  stock={item.stock}
                  brand={item.brand?.name || item.brand}
                  warranty={item.warranty}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!pendingReplace}
        title="Replace component?"
        message={pendingReplace
          ? `Replace your current ${STEPS.find(s => s.category === pendingReplace.incoming.category)?.label || 'component'} (${pendingReplace.current.title}) with (${pendingReplace.incoming.title})?`
          : ''}
        confirmLabel="Replace"
        cancelLabel="Keep Current"
        onConfirm={confirmReplace}
        onCancel={() => setPendingReplace(null)}
      />
    </section>
  );
};

export default BuilderUpgrades;
