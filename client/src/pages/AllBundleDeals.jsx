import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Card from '../components/Card';
import apiClient from '../api/client';
import FadeUp from '../components/FadeUp';
import Breadcrumb from '../components/Breadcrumb';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

const AllBundleDeals = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const { data: dealsData, isLoading } = useQuery({
    queryKey: ['allBundleDeals'],
    queryFn: async () => {
      const res = await apiClient.get('/deals/active');
      return res.data;
    }
  });

  const dealsList = Array.isArray(dealsData?.data) ? dealsData.data : [];
  const activeDeal = dealsList.find((d) => d.isFeatured) || dealsList[0];
  const bundles = activeDeal?.prebuiltPCs || [];

  const totalPages = Math.max(1, Math.ceil(bundles.length / itemsPerPage));
  const currentBundles = bundles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
    <FadeUp delay={0.1}>
    <div className="w-full py-12 min-h-screen" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <div className="max-w-[1500px] mx-auto px-4 lg:px-8">
        <Breadcrumb items={[{ label: 'Home', path: '/' }, { label: 'Bundle Deals' }]} />
        <h1 className="text-[32px] font-extrabold text-[#0F172A] mb-8 uppercase">All Bundle Deals</h1>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="h-64 bg-gray-100 rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : bundles.length === 0 ? (
          <div className="py-20 text-center text-gray-500 font-medium">No bundle deals available at the moment.</div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {currentBundles.map(product => (
                <Card 
                  rating={product?.rating} key={product._id || product.id}
                  id={product._id || product.id}
                  title={product.name || product.title}
                  price={product.pricing?.price || product.price}
                  mrp={product.pricing?.mrp || product.mrp}
                  discount={product.pricing?.discount || product.discount}
                  image={product.images?.[0]?.url || product.image || '/fallback.png'}
                  description={product.shortDescription || product.description}
                  category={
                    (product.category && product.category.name) || 
                    (typeof product.category === 'string' && product.category.length !== 24 ? product.category : null) || 
                    (typeof product.brand === 'string' && product.brand.length !== 24 ? product.brand : null) || 
                    'FEATURED BUNDLE'
                  }
                  tag="BUNDLE"
                  tagColor="bg-[#3B82F6]"
                  stock={product.stock}
                />
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
