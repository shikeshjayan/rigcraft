import { useEffect, useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import FilterListIcon from '@mui/icons-material/FilterList';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import Card from '../components/Card';
import Filter from '../components/Filter';
import Breadcrumb from '../components/Breadcrumb';
import SkeletonCard from '../components/SkeletonCard';
import { productService } from '../services/product.service';

const AllDeals = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['activeSaleProductsAll'],
    queryFn: () => productService.list({ limit: 1000 }),
  });

  // Extract products from the response and filter by active sale
  const activeSaleProducts = useMemo(() => {
    let allProducts = [];
    if (productsData?.data?.docs) {
      allProducts = productsData.data.docs;
    } else if (productsData?.data?.data?.docs) {
      allProducts = productsData.data.data.docs;
    } else if (productsData?.docs) {
      allProducts = productsData.docs;
    } else if (Array.isArray(productsData?.data)) {
      allProducts = productsData.data;
    } else if (Array.isArray(productsData)) {
      allProducts = productsData;
    }

    return allProducts.filter(product => {
      if (!product.salePrice) return false;
      
      if (product.saleStart && product.saleEnd) {
        const start = new Date(product.saleStart);
        const end = new Date(product.saleEnd);
        return currentTime >= start && currentTime <= end;
      }
      
      return true;
    });
  }, [productsData, currentTime]);

  // Filters State
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  
  const initialFilters = {
    priceMax: 500000,
    brands: [],
    ratings: [],
    specs: {}
  };

  const [filters, setFilters] = useState(initialFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; 

  const dynamicFilterOptions = useMemo(() => {
    const brands = new Set();
    const ratings = new Set();
    const specs = {};
    
    activeSaleProducts.forEach(p => {
      if (p.brand?.name) brands.add(p.brand.name);
      
      const rating = Math.floor(p.rating?.average || 0);
      if (rating > 0) ratings.add(rating);
      
      if (p.specifications) {
        Object.entries(p.specifications).forEach(([key, val]) => {
          if (val && typeof val !== 'object') {
            if (!specs[key]) specs[key] = new Set();
            specs[key].add(String(val));
          }
        });
      }
    });

    const parsedSpecs = Object.keys(specs).map(key => ({
      key,
      options: Array.from(specs[key]).sort()
    }));

    return {
      brands: Array.from(brands).sort(),
      ratings: Array.from(ratings).sort((a,b) => b - a),
      specs: parsedSpecs,
    };
  }, [activeSaleProducts]);

  const handleClearAll = () => {
    setFilters(initialFilters);
    setCurrentPage(1);
  };

  // Apply filters
  const filteredProducts = useMemo(() => {
    return activeSaleProducts.filter(item => {
      const price = item.salePrice || item.price || 0;
      if (price > filters.priceMax) return false;

      if (filters.ratings.length > 0) {
        const itemRating = item.rating?.average || 0;
        const meetsRating = filters.ratings.some(selectedRating => itemRating >= selectedRating);
        if (!meetsRating) return false;
      }

      if (filters.brands && filters.brands.length > 0) {
        const itemBrand = item.brand?.name;
        if (!itemBrand || !filters.brands.includes(itemBrand)) return false;
      }

      if (filters.specs) {
        const specKeys = Object.keys(filters.specs);
        for (let i = 0; i < specKeys.length; i++) {
          const key = specKeys[i];
          const selectedValues = filters.specs[key];
          if (selectedValues && selectedValues.length > 0) {
            const itemVal = item.specifications?.[key];
            if (!itemVal || !selectedValues.includes(String(itemVal))) return false;
          }
        }
      }

      return true;
    });
  }, [filters, activeSaleProducts]);

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
      document.getElementById('deals-top').scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
      document.getElementById('deals-top').scrollIntoView({ behavior: 'smooth' });
    }
  };

  const gridClasses = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 min-h-[800px] items-start content-start";

  return (
    <section id="deals-top" className="w-full py-12 pb-24" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
      <div className="max-w-[1500px] mx-auto px-4 lg:px-8">
        
        <Breadcrumb items={[{ label: 'Home', path: '/' }, { label: 'All Deals' }]} />

        <div 
          className="flex justify-between items-center mb-6 sticky top-[111px] z-40 py-4 border-b border-transparent backdrop-blur-md transition-all duration-300"
          style={{ backgroundColor: 'rgba(241, 245, 249, 0.95)' }}
        >
          <div>
            <h1 className="text-[32px] font-extrabold text-[#0F172A] uppercase">All Deals</h1>
            <p className="text-[14px] text-[#565959]">Showing {filteredProducts.length} results</p>
          </div>
          
          <button 
            onClick={() => setFilterDropdownOpen(!filterDropdownOpen)} 
            className={`flex items-center gap-2 px-4 py-2 border shadow-[0_1px_2px_rgba(0,0,0,0.05)] font-medium cursor-pointer transition-colors ${filterDropdownOpen ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'bg-white text-[#0F1111] border-[#D5D9D9] hover:bg-[#F7F7F7]'}`}
            style={{ borderRadius: 'var(--radius-sm)' }}
          >
            <FilterListIcon sx={{ fontSize: 20 }} /> Filters
          </button>
        </div>

        <div className="relative">
          <div className="w-full">
            <AnimatePresence mode="wait">
              {currentProducts.length === 0 && !isLoading ? (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full p-20 text-center border border-dashed border-gray-300 rounded-lg bg-white"
                >
                  <h3 className="text-[20px] font-bold text-[#0F1111] mb-2">No deals found</h3>
                  <p className="text-[#565959]">Try adjusting your filters or check back later.</p>
                  <button 
                    onClick={handleClearAll}
                    className="mt-4 px-6 py-2 bg-[var(--color-primary)] text-white font-bold rounded-md hover:opacity-90 cursor-pointer"
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
                  <div className={gridClasses}>
                    {isLoading ? (
                      Array.from({ length: 10 }).map((_, idx) => (
                        <SkeletonCard key={`skeleton-${idx}`} compact={filterDropdownOpen} />
                      ))
                    ) : (
                      currentProducts.map((item) => {
                        const price = item.salePrice || item.price;
                        const mrp = item.salePrice ? item.price : null;
                        const discount = item.salePrice ? Math.round(((item.price - item.salePrice) / item.price) * 100) + '% OFF' : null;
                        const imageUrl = item.images?.[0]?.url || 'https://via.placeholder.com/300?text=No+Image';
                        let specs = [];
                        if (item.specifications) {
                          const specVals = Object.values(item.specifications);
                          specs = specVals.filter(v => typeof v === 'string').slice(0, 3);
                        }
                        
                        return (
                          <div key={item._id || item.id} className="block h-full relative group">
                            <Card 
                              id={item.slug}
                              apiId={item._id || item.id}
                              rating={item?.rating}
                              image={imageUrl}
                              title={item.name}
                              specs={specs.length > 0 ? specs : undefined}
                              description={item.shortDescription || item.description || ''}
                              price={`₹${price?.toLocaleString('en-IN')}`}
                              mrp={mrp ? `₹${mrp?.toLocaleString('en-IN')}` : undefined}
                              discount={discount}
                              tag={discount ? discount : null}
                              tagColor="#E11D48"
                              compact={filterDropdownOpen} 
                              stock={item.stock}
                            />
                          </div>
                        );
                      })
                    )}
                  </div>

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

export default AllDeals;
