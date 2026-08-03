import React, { useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';

const Filter = React.memo(({ isOpen, onClose, filters, setFilters, onClearAll, dynamicOptions = { brands: [], ratings: [], specs: [] } }) => {

  useEffect(() => {
    // Scroll lock removed as per user request (background should be scrollable)
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen && onClose) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const toggleArrayFilter = useCallback((category, value) => {
    setFilters(prev => {
      const currentList = prev[category] || [];
      const newList = currentList.includes(value)
        ? currentList.filter(v => v !== value)
        : [...currentList, value];
      return { ...prev, [category]: newList };
    });
  }, [setFilters]);

  const toggleSpecFilter = useCallback((specKey, value) => {
    setFilters(prev => {
      const currentSpecs = prev.specs || {};
      const currentList = currentSpecs[specKey] || [];
      const newList = currentList.includes(value)
        ? currentList.filter(v => v !== value)
        : [...currentList, value];
      return { ...prev, specs: { ...currentSpecs, [specKey]: newList } };
    });
  }, [setFilters]);

  const handlePriceChange = useCallback((e) => {
    setFilters(prev => ({ ...prev, priceMax: Number(e.target.value) }));
  }, [setFilters]);

  const renderFilterSection = (title, options, isSpec = false) => {
    if (!options || options.length === 0) return null;

    return (
      <div key={title}>
        <div className="w-full h-px bg-[#E7E7E7] my-6"></div>
        <div>
          <h4 className="text-[14px] font-bold text-[#0F1111] mb-3">{title}</h4>
          <div className="flex flex-col gap-3">
            {options.map(opt => {
              const checked = isSpec
                ? (filters.specs?.[title] || []).includes(opt)
                : (filters[title.toLowerCase()] || []).includes(opt);

              return (
                <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => isSpec ? toggleSpecFilter(title, opt) : toggleArrayFilter(title.toLowerCase(), opt)}
                    className="w-[18px] h-[18px] text-[var(--color-primary)] border-gray-300 focus:ring-[var(--color-primary)] cursor-pointer"
                    style={{ borderRadius: 'var(--radius-sm)' }}
                  />
                  <span className="text-[14px] text-[#0F1111] group-hover:text-[var(--color-primary)] transition-colors">{opt}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-x-0 bottom-0 flex justify-end" style={{ top: '110px', zIndex: 999, pointerEvents: isOpen ? 'auto' : 'none' }}>
      {/* Backdrop */}
      <motion.div 
        initial={false}
        animate={{ opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.25 }}
        className="absolute inset-0 bg-black/20"
        onClick={onClose}
        style={{ willChange: 'opacity' }}
      />
      
      {/* Drawer */}
      <motion.div 
        initial={false}
        animate={{ x: isOpen ? '0%' : '100%' }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="relative bg-white shadow-2xl h-full flex flex-col border-l border-gray-200"
        style={{
          width: '320px',
          maxWidth: '85vw',
          willChange: 'transform'
        }}
      >
        <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6 sticky top-0 bg-white z-10 pb-2">
              <h3 className="text-[18px] font-bold text-[#0F1111] mt-[10px]">Filters</h3>
              <button
                onClick={onClearAll}
                className="text-[13px] font-bold text-[#EF4444] mt-[10px] hover:text-[#DC2626] hover:underline cursor-pointer"
              >
                Clear All
              </button>
            </div>

            {/* Price Range */}
            <div>
              <h4 className="text-[14px] font-bold text-[#0F1111] mb-3 flex justify-between">
                <span>Max Price</span>
                <span className="text-[#007185]">₹{(filters.priceMax || 500000).toLocaleString('en-IN')}</span>
              </h4>
              <input
                type="range"
                min="5000"
                max="500000"
                step="5000"
                value={filters.priceMax || 500000}
                onChange={handlePriceChange}
                className="w-full cursor-pointer accent-[var(--color-primary)]"
              />
            </div>

            {/* Ratings */}
            {dynamicOptions.ratings?.length > 0 && (
              <>
                <div className="w-full h-px bg-[#E7E7E7] my-6"></div>
                <div>
                  <h4 className="text-[14px] font-bold text-[#0F1111] mb-3">Customer Ratings</h4>
                  <div className="flex flex-col gap-3">
                    {dynamicOptions.ratings.map(stars => (
                      <label key={stars} className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={(filters.ratings || []).includes(stars)}
                          onChange={() => toggleArrayFilter('ratings', stars)}
                          className="w-[18px] h-[18px] text-[var(--color-primary)] border-gray-300 focus:ring-[var(--color-primary)] cursor-pointer"
                          style={{ borderRadius: 'var(--radius-sm)' }}
                        />
                        <div className="flex text-[#FFA41C]">
                          {[...Array(5)].map((_, i) => (
                            i < stars ? <StarIcon key={i} sx={{ fontSize: 18 }} /> : <StarBorderIcon key={i} sx={{ fontSize: 18 }} />
                          ))}
                          <span className="text-[14px] text-[#0F1111] ml-2 group-hover:text-[var(--color-primary)] transition-colors">& Up</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Dynamic Brands */}
            {renderFilterSection('Brands', dynamicOptions.brands)}

            {/* Dynamic Specs */}
            {dynamicOptions.specs?.map(spec => (
              renderFilterSection(spec.key, spec.options, true)
            ))}

          </div>
        </div>
      </motion.div>
    </div>
  );
});

export default Filter;
