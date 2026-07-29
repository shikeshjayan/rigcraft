import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import FilterListIcon from '@mui/icons-material/FilterList';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import Card from '../components/Card';
import SkeletonCard from '../components/SkeletonCard';
import Filter from '../components/Filter';
import apiClient from '../api/client';

const PrebuildCatalog = () => {
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  
  // Unified Filter State
  const initialFilters = {
    priceMax: 500000,
    brands: [],
    ratings: [],
    cpu: [],
    motherboard: [],
    gpu: [],
    ram: [],
    ssd: [],
    psu: [],
    cabinet: [],
    cooling: [],
    peripherals: [],
    monitors: []
  };

  const [filters, setFilters] = useState(initialFilters);

  // Pagination & Loading State
  const [currentPage, setCurrentPage] = useState(1);
  const [isFiltering, setIsFiltering] = useState(false);
  const itemsPerPage = 40; // 5 columns * 8 rows

  const [basePCs, setBasePCs] = useState([]);

  useEffect(() => {
    const fetchPrebuilts = async () => {
      try {
        const { data } = await apiClient.get('/prebuilt-pcs');
        if (data && data.data) {
          const docs = data.data.docs || data.data;
          const pcArray = Array.isArray(docs) ? docs : [];
          
          const formatted = pcArray.map(pc => {
            const priceVal = pc.pricing?.price || pc.priceVal || 0;
            const mrpVal = pc.pricing?.salePrice || pc.mrpVal || 0;
            
            return {
              ...pc,
              id: pc._id || pc.id,
              image: pc.images?.[0]?.url || pc.images?.[0] || pc.image || null,
              title: pc.name || pc.title,
              price: priceVal ? `₹${priceVal.toLocaleString()}` : pc.price,
              priceVal: priceVal,
              mrp: mrpVal ? `₹${mrpVal.toLocaleString()}` : pc.mrp,
              specs: pc.specs || pc.tags || [],
              brand: pc.brand || ''
            };
          });
          setBasePCs(formatted);
        }
      } catch (error) {
        console.error('Failed to fetch prebuilt PCs', error);
      }
    };
    fetchPrebuilts();
  }, []);

  const handleClearAll = () => {
    setFilters(initialFilters);
    setCurrentPage(1);
  };

  // Extract a numeric price for filtering
  const getPriceVal = (priceStr) => {
    if (typeof priceStr === 'number') return priceStr;
    if (!priceStr) return 0;
    return parseInt(String(priceStr).replace(/[^0-9]/g, '')) || 0;
  };

  // Deep Filtering Logic
  const filteredPCs = useMemo(() => {
    return basePCs.filter(pc => {
      // 1. Price check
      if (getPriceVal(pc.price) > filters.priceMax) return false;

      // 2. Rating check
      if (filters.ratings.length > 0) {
        const itemRating = parseFloat(pc.rating) || 0;
        const meetsRating = filters.ratings.some(selectedRating => itemRating >= selectedRating);
        if (!meetsRating) return false;
      }

      // Helper function to check if any of the selected filter keywords exist in the item's title or specs
      const hasKeyword = (selectedOptions, searchTargetStr) => {
        if (selectedOptions.length === 0) return true; // If no filter selected, pass
        const target = searchTargetStr.toLowerCase();
        
        return selectedOptions.some(option => {
          const lowerOpt = option.toLowerCase();
          
          // Custom mapping for broad categories since mock data isn't perfect
          if (lowerOpt.includes('ryzen 3') || lowerOpt.includes('core i3')) {
            return target.includes('ryzen 3') || target.includes('i3');
          }
          if (lowerOpt.includes('ryzen 5') || lowerOpt.includes('core i5')) {
            return target.includes('ryzen 5') || target.includes('i5');
          }
          if (lowerOpt.includes('ryzen 7') || lowerOpt.includes('core i7')) {
            return target.includes('ryzen 7') || target.includes('i7');
          }
          if (lowerOpt.includes('ryzen 9') || lowerOpt.includes('core i9')) {
            return target.includes('ryzen 9') || target.includes('i9');
          }
          if (lowerOpt.includes('rtx 40-series')) {
            return target.includes('rtx 40');
          }
          if (lowerOpt.includes('rtx 30-series')) {
            return target.includes('rtx 30');
          }
          if (lowerOpt.includes('16 gb')) {
            return target.includes('16gb') || target.includes('16 gb');
          }
          if (lowerOpt.includes('32 gb')) {
            return target.includes('32gb') || target.includes('32 gb');
          }
          
          // Direct fallback match
          return target.includes(lowerOpt.split(' ')[0]); // Check just the first word for broad matching
        });
      };

      // Combine title and specs into one searchable string
      const fullTextSearch = (pc.title + ' ' + (pc.specs ? pc.specs.join(' ') : '') + ' ' + (pc.brand || '')).toLowerCase();

      // 3. Check Brands
      if (filters.brands.length > 0) {
        const itemBrand = pc.brand ? pc.brand.toLowerCase() : '';
        const meetsBrand = filters.brands.some(b => itemBrand.includes(b.toLowerCase()) || fullTextSearch.includes(b.toLowerCase()));
        if (!meetsBrand) return false;
      }

      // 4. Check Smart Filters
      if (!hasKeyword(filters.cpu, fullTextSearch)) return false;
      if (!hasKeyword(filters.gpu, fullTextSearch)) return false;
      if (!hasKeyword(filters.ram, fullTextSearch)) return false;
      if (!hasKeyword(filters.ssd, fullTextSearch)) return false;
      // You can add logic for motherboard, psu, etc if mock data supports it.

      return true;
    });
  }, [filters, basePCs]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
    
    // Trigger skeleton loading
    setIsFiltering(true);
    const timer = setTimeout(() => {
      setIsFiltering(false);
    }, 600);
    
    return () => clearTimeout(timer);
  }, [filters]);

  const totalPages = Math.ceil(filteredPCs.length / itemsPerPage);
  
  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPCs.slice(start, start + itemsPerPage);
  }, [filteredPCs, currentPage]);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <section className="w-full py-8 pb-24" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <div className="max-w-[1500px] mx-auto px-4 lg:px-8">
        
        {/* Top Bar with Filters Button */}
        <div 
          className="flex justify-between items-center mb-6 sticky top-[111px] z-40 py-4 border-b border-transparent backdrop-blur-md"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}
        >
          <h1 className="text-[24px] font-bold text-[#0F1111]">Prebuild Catalog</h1>
          
          <button 
            onClick={() => setFilterDropdownOpen(!filterDropdownOpen)} 
            className={`flex items-center gap-2 px-4 py-2 border shadow-[0_1px_2px_rgba(0,0,0,0.05)] rounded-full font-medium cursor-pointer transition-colors ${filterDropdownOpen ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'bg-white text-[#0F1111] border-[#D5D9D9] hover:bg-[#F7F7F7]'}`}
          >
            <FilterListIcon sx={{ fontSize: 20 }} /> Filters
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex relative gap-6">
          
          {/* Grid Area */}
          <motion.div layout className="flex-1 min-w-0">
            
            <AnimatePresence mode="wait">
              {currentItems.length === 0 ? (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="w-full p-20 text-center border border-dashed border-gray-300 rounded-lg"
                >
                  <h3 className="text-[20px] font-bold text-[#0F1111] mb-2">No results found</h3>
                  <p className="text-[#565959]">Try adjusting your filters to find what you're looking for.</p>
                  <button 
                    onClick={handleClearAll}
                    className="mt-4 px-6 py-2 bg-[var(--color-primary)] text-white font-bold rounded-md hover:opacity-90"
                  >
                    Clear All Filters
                  </button>
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
                    {isFiltering ? (
                      // Render Skeletons
                      Array.from({ length: Math.min(itemsPerPage, filteredPCs.length || 10) }).map((_, idx) => (
                        <SkeletonCard key={`skeleton-${idx}`} compact={filterDropdownOpen} />
                      ))
                    ) : (
                      // Render Real Cards without motion wrapper to prevent flying
                      currentItems.map((pc) => (
                        <div key={pc.id} className="block h-full animate-fade-in">
                          <Link to={`/detail/${pc.id}`} className="block h-full">
                            <Card 
                              id={pc.id}
                              image={pc.image}
                              title={pc.title}
                              specs={pc.specs}
                              description={pc.description}
                              price={pc.price}
                              mrp={pc.mrp}
                              discount={pc.discount}
                              tag={pc.discount || 'SALE'}
                              tagColor="#CC0C39"
                              compact={filterDropdownOpen} 
                              category="prebuilt"
                            />
                          </Link>
                        </div>
                      ))
                    )}
                  </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="w-full flex items-center justify-center gap-6 mt-16 border-t border-[#E2E8F0] pt-8">
                    <button 
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                      className="flex items-center gap-1 px-5 py-2.5 bg-white border border-[#D5D9D9] rounded-md font-bold text-[#0F1111] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F7F7F7] transition-colors cursor-pointer"
                    >
                      <KeyboardArrowLeftIcon /> Previous
                    </button>
                    
                    <span className="text-[15px] font-bold text-[#565959]">
                      Page {currentPage} of {totalPages}
                    </span>

                    <button 
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-1 px-5 py-2.5 bg-white border border-[#D5D9D9] rounded-md font-bold text-[#0F1111] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F7F7F7] transition-colors cursor-pointer"
                    >
                      Next <KeyboardArrowRightIcon />
                    </button>
                  </div>
                )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Extracted Filter Sidebar Component */}
          <Filter 
            isOpen={filterDropdownOpen}
            filters={filters}
            setFilters={setFilters}
            onClearAll={handleClearAll}
          />

        </div>
      </div>
    </section>
  );
};

export default PrebuildCatalog;
