import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    ratings: [],
    specs: {}
  };

  const [filters, setFilters] = useState(initialFilters);

  // Pagination & Loading State
  const [currentPage, setCurrentPage] = useState(1);
  const [isFiltering, setIsFiltering] = useState(false);
  const itemsPerPage = 12; 

  const [basePCs, setBasePCs] = useState([]);
  const [allProductsDict, setAllProductsDict] = useState({});

  useEffect(() => {
    const fetchPrebuilts = async () => {
      try {
        // Fetch prebuilts
        const { data: pbData } = await apiClient.get('/prebuilt-pcs');
        if (pbData && pbData.data) {
          const docs = pbData.data.docs || pbData.data;
          const pcArray = Array.isArray(docs) ? docs : [];
          
          const formatted = pcArray.map(pc => {
            const priceVal = pc.pricing?.price || pc.priceVal || 0;
            const mrpVal = pc.pricing?.salePrice || pc.mrpVal || 0;
            
            return {
              ...pc,
              id: pc._id || pc.id,
              image: pc.images?.[0]?.url || pc.images?.[0] || pc.image || null,
              title: pc.name || pc.title,
              price: priceVal ? `₹${priceVal.toLocaleString('en-IN')}` : pc.price,
              priceVal: priceVal,
              mrp: mrpVal ? `₹${mrpVal.toLocaleString('en-IN')}` : pc.mrp,
              specs: pc.tags || [],
              category: pc.category,
            };
          });
          setBasePCs(formatted);
        }

        // Fetch products to map ObjectIDs to names
        const { data: pData } = await apiClient.get('/products?limit=1000');
        const pDocs = pData?.data?.docs || pData?.data || pData?.docs || [];
        const dict = {};
        if (Array.isArray(pDocs)) {
          pDocs.forEach(p => {
             if (p._id || p.id) dict[p._id || p.id] = p.name || p.title;
          });
        }
        setAllProductsDict(dict);
      } catch (error) {
        console.error('Failed to fetch data', error);
      }
    };
    fetchPrebuilts();
  }, []);

  const handleClearAll = () => {
    setFilters(initialFilters);
    setCurrentPage(1);
  };

  // Generate dynamic filter options based on the actual product details
  const dynamicFilterOptions = useMemo(() => {
    const ratings = new Set();
    const specs = {};
    
    basePCs.forEach(p => {
      // Collect Category
      if (p.category) {
        if (!specs['Category']) specs['Category'] = new Set();
        // Capitalize category name
        const capCat = p.category.charAt(0).toUpperCase() + p.category.slice(1);
        specs['Category'].add(capCat);
      }
      
      // Collect Ratings
      const rating = Math.floor(p.rating?.average || 0);
      if (rating > 0) ratings.add(rating);
      
      // Collect Components dynamically
      if (p.components && Array.isArray(p.components)) {
        p.components.forEach(comp => {
           const type = comp.type;
           // If comp.product is a string (ObjectID), look it up in the dictionary
           let val = comp.product?.name;
           if (!val && typeof comp.product === 'string') {
             val = allProductsDict[comp.product];
           }
           
           if (type && val) {
             // Standardize component type name (e.g. "processor" -> "Processor")
             const formattedType = type.charAt(0).toUpperCase() + type.slice(1);
             if (!specs[formattedType]) specs[formattedType] = new Set();
             specs[formattedType].add(String(val));
           }
        });
      }
    });

    const parsedSpecs = Object.keys(specs).map(key => ({
      key,
      options: Array.from(specs[key]).sort()
    }));

    return {
      brands: [], // Left empty so 'Brands' header doesn't render if unsupported
      ratings: Array.from(ratings).sort((a,b) => b - a),
      specs: parsedSpecs,
    };
  }, [basePCs, allProductsDict]);

  const getPriceVal = (pc) => {
    if (pc.priceVal) return pc.priceVal;
    if (typeof pc.price === 'number') return pc.price;
    if (!pc.price) return 0;
    return parseInt(String(pc.price).replace(/[^0-9]/g, '')) || 0;
  };

  // Deep Filtering Logic
  const filteredPCs = useMemo(() => {
    return basePCs.filter(pc => {
      // 1. Price check
      if (getPriceVal(pc) > filters.priceMax) return false;

      // 2. Rating check
      if (filters.ratings && filters.ratings.length > 0) {
        const itemRating = parseFloat(pc.rating?.average) || 0;
        const meetsRating = filters.ratings.some(selectedRating => itemRating >= selectedRating);
        if (!meetsRating) return false;
      }

      // 3. Dynamic Specs check
      if (filters.specs) {
        const specKeys = Object.keys(filters.specs);
        for (let i = 0; i < specKeys.length; i++) {
          const key = specKeys[i];
          const selectedValues = filters.specs[key];
          
          if (selectedValues && selectedValues.length > 0) {
            // Special handling for Category
            if (key === 'Category') {
               const capCat = pc.category ? pc.category.charAt(0).toUpperCase() + pc.category.slice(1) : '';
               if (!selectedValues.includes(capCat)) return false;
            } else {
               // Check inside components
               let hasMatch = false;
               if (pc.components && Array.isArray(pc.components)) {
                 for (const comp of pc.components) {
                   const type = comp.type;
                   
                   let val = comp.product?.name;
                   if (!val && typeof comp.product === 'string') {
                     val = allProductsDict[comp.product];
                   }

                   const formattedType = type ? type.charAt(0).toUpperCase() + type.slice(1) : '';
                   
                   if (formattedType === key && val && selectedValues.includes(String(val))) {
                     hasMatch = true;
                     break;
                   }
                 }
               }
               if (!hasMatch) return false;
            }
          }
        }
      }

      return true;
    });
  }, [filters, basePCs]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
    
    setIsFiltering(true);
    const timer = setTimeout(() => {
      setIsFiltering(false);
    }, 400);
    
    return () => clearTimeout(timer);
  }, [filters]);

  const totalPages = Math.max(1, Math.ceil(filteredPCs.length / itemsPerPage));
  
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
            className={`flex items-center gap-2 px-4 py-2 border shadow-[0_1px_2px_rgba(0,0,0,0.05)] font-medium cursor-pointer transition-colors ${filterDropdownOpen ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'bg-white text-[#0F1111] border-[#D5D9D9] hover:bg-[#F7F7F7]'}`}
            style={{ borderRadius: 'var(--radius-sm)' }}
          >
            <FilterListIcon sx={{ fontSize: 20 }} /> Filters
          </button>
        </div>

        {/* Main Content Area */}
        <div className="relative">
          
          {/* Grid Area */}
          <div className="w-full">

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
                      currentItems.map((pc) => {
                        // Gather a few specs to show on the card tag list
                        const cardSpecs = pc.specs?.length > 0 ? [...pc.specs] : [];
                        if (cardSpecs.length === 0 && pc.components) {
                          pc.components.slice(0, 3).forEach(c => {
                             let val = c.product?.name;
                             if (!val && typeof c.product === 'string') {
                               val = allProductsDict[c.product];
                             }
                             if (val) cardSpecs.push(val);
                          });
                        }
                        
                        return (
                          <div key={pc.id} className="block h-full">
                            <Card 
                              rating={pc?.rating} id={pc.id}
                              image={pc.image || 'https://via.placeholder.com/300?text=No+Image'}
                              title={pc.title}
                              specs={cardSpecs}
                              description={pc.shortDescription || pc.description}
                              price={pc.price}
                              mrp={pc.mrp}
                              discount={pc.pricing?.salePrice ? Math.round(((pc.pricing.price - pc.pricing.salePrice) / pc.pricing.price) * 100) + '% OFF' : null}
                              tagColor="#CC0C39"
                              compact={filterDropdownOpen} 
                              category="prebuilt"
                              stock={pc.stock}
                            />
                          </div>
                        );
                      })
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
          </div>

          <Filter 
            isOpen={filterDropdownOpen}
            onClose={() => setFilterDropdownOpen(false)}
            filters={filters}
            setFilters={setFilters}
            onClearAll={handleClearAll}
            dynamicOptions={dynamicFilterOptions}
          />

        </div>
      </div>
    </section>
  );
};

export default PrebuildCatalog;
