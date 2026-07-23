import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import FilterListIcon from '@mui/icons-material/FilterList';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import Card from '../components/Card';
import SkeletonCard from '../components/SkeletonCard';
import Filter from '../components/Filter';
import { allItems } from '../data/items';

const ComponentsCatalog = () => {
  const { category } = useParams(); // For when routing from Mega Menu
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  
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
  const [currentPage, setCurrentPage] = useState(1);
  const [isFiltering, setIsFiltering] = useState(false);
  const itemsPerPage = 40; 

  // Reset category filters when the URL category parameter changes
  useEffect(() => {
    if (category) {
      setFilters(initialFilters);
      setCurrentPage(1);
    }
  }, [category]);

  const baseComponents = useMemo(() => {
    // Ensure we only show individual components. In this database, all items are components.
    if (category) {
      return allItems.filter(item => item.category === category);
    }
    return allItems;
  }, [category]);

  const handleClearAll = () => {
    setFilters(initialFilters);
    setCurrentPage(1);
  };

  const getPriceVal = (priceStr) => {
    return parseInt(priceStr.replace(/[^0-9]/g, '')) || 0;
  };

  const filteredComponents = useMemo(() => {
    return baseComponents.filter(item => {
      if (getPriceVal(item.price) > filters.priceMax) return false;

      if (filters.ratings.length > 0) {
        const itemRating = parseFloat(item.rating) || 0;
        const meetsRating = filters.ratings.some(selectedRating => itemRating >= selectedRating);
        if (!meetsRating) return false;
      }

      const hasKeyword = (selectedOptions, searchTargetStr) => {
        if (selectedOptions.length === 0) return true;
        const target = searchTargetStr.toLowerCase();
        return selectedOptions.some(option => {
          const lowerOpt = option.toLowerCase();
          return target.includes(lowerOpt.split(' ')[0]);
        });
      };

      const fullTextSearch = (item.title + ' ' + (item.specs ? item.specs.join(' ') : '') + ' ' + (item.brand || '')).toLowerCase();

      if (filters.brands.length > 0) {
        const itemBrand = item.brand ? item.brand.toLowerCase() : '';
        const meetsBrand = filters.brands.some(b => itemBrand.includes(b.toLowerCase()) || fullTextSearch.includes(b.toLowerCase()));
        if (!meetsBrand) return false;
      }

      if (!hasKeyword(filters.cpu, fullTextSearch)) return false;
      if (!hasKeyword(filters.gpu, fullTextSearch)) return false;
      if (!hasKeyword(filters.ram, fullTextSearch)) return false;
      if (!hasKeyword(filters.ssd, fullTextSearch)) return false;
      if (!hasKeyword(filters.motherboard, fullTextSearch)) return false;
      if (!hasKeyword(filters.psu, fullTextSearch)) return false;

      return true;
    });
  }, [filters, baseComponents]);

  useEffect(() => {
    setCurrentPage(1);
    
    // Trigger skeleton loading
    setIsFiltering(true);
    const timer = setTimeout(() => {
      setIsFiltering(false);
    }, 600); // 600ms skeleton loading duration
    
    return () => clearTimeout(timer);
  }, [filters, category]);

  const totalPages = Math.ceil(filteredComponents.length / itemsPerPage);
  
  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredComponents.slice(start, start + itemsPerPage);
  }, [filteredComponents, currentPage]);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
      document.getElementById('catalog-top').scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
      document.getElementById('catalog-top').scrollIntoView({ behavior: 'smooth' });
    }
  };

  const categoryTitle = category ? category.replace('-', ' ').toUpperCase() : 'ALL COMPONENTS';

  return (
    <section id="catalog-top" className="w-full py-12 pb-24" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
      <div className="max-w-[1500px] mx-auto px-4 lg:px-8">
        
        {/* Top Bar with Filters Button */}
        <div 
          className="flex justify-between items-center mb-6 sticky top-[111px] z-40 py-4 border-b border-transparent backdrop-blur-md transition-all duration-300"
          style={{ backgroundColor: 'rgba(241, 245, 249, 0.95)' }} // Matches bg-secondary but translucent
        >
          <div>
            <h1 className="text-[24px] font-bold text-[#0F1111]">{categoryTitle}</h1>
            <p className="text-[14px] text-[#565959]">Showing {filteredComponents.length} results</p>
          </div>
          
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
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full p-20 text-center border border-dashed border-gray-300 rounded-lg bg-white"
                >
                  <h3 className="text-[20px] font-bold text-[#0F1111] mb-2">No components found</h3>
                  <p className="text-[#565959]">Try adjusting your filters or search criteria.</p>
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 min-h-[800px] items-start content-start">
                    {isFiltering ? (
                      // Render Skeletons
                      Array.from({ length: Math.min(itemsPerPage, filteredComponents.length || 10) }).map((_, idx) => (
                        <SkeletonCard key={`skeleton-${idx}`} compact={filterDropdownOpen} />
                      ))
                    ) : (
                      // Render Real Cards without motion wrapper to prevent flying
                      currentItems.map((item) => (
                        <div key={item.id} className="block h-full animate-fade-in">
                          <Link to={`/detail/${item.id}`} className="block h-full">
                            <Card 
                              id={item.id}
                              image={item.image}
                              title={item.title}
                              specs={item.specs}
                              description={item.description}
                              price={item.price}
                              mrp={item.mrp}
                              discount={item.discount}
                              tag={item.discount || 'SALE'}
                              tagColor="#CC0C39"
                              compact={filterDropdownOpen} 
                            />
                          </Link>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      className="w-full flex items-center justify-center gap-6 mt-16 border-t border-[#E2E8F0] pt-8"
                    >
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
                    </motion.div>
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

export default ComponentsCatalog;
