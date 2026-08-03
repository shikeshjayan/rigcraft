import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Card from '../components/Card';
import apiClient from '../api/client';

const ActiveDeals = () => {
  const { data: dealsData, isLoading } = useQuery({
    queryKey: ['activeDealsProducts'],
    queryFn: async () => {
      const res = await apiClient.get('/deals/active');
      return res.data;
    }
  });

  const dealsList = Array.isArray(dealsData?.data) ? dealsData.data : [];
  const allDealItems = dealsList.reduce((acc, deal) => {
    const products = deal.products || [];
    const prebuiltPCs = deal.prebuiltPCs || [];
    return [...acc, ...products, ...prebuiltPCs];
  }, []);
  
  const uniqueDeals = Array.from(new Map(allDealItems.map(item => [item._id || item.id, item])).values());
  const deals = uniqueDeals;

  if (isLoading) {
    return (
      <section className="w-full py-16 border-t border-[#E2E8F0]" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
        <div className="max-w-[1500px] mx-auto px-4 lg:px-8">
          <div className="animate-pulse h-8 w-48 bg-gray-200 mb-8 rounded"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="h-64 bg-gray-100 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (deals.length === 0) {
    return null; // Don't show the section if there are no products in the active deal
  }

  return (
    <section className="w-full py-16 border-t border-[#E2E8F0]" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
      <div className="max-w-[1500px] mx-auto px-4 lg:px-8">
        
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-[24px] md:text-[32px] font-extrabold text-[#0F172A] tracking-tight uppercase">
              Active Deals
            </h2>
            <div className="w-16 h-1 bg-[#0052FF] mt-2"></div>
          </div>
          <Link to="/alldeals" className="text-[12px] font-bold text-[#0F172A] border border-[#CBD5E1] py-2 px-6 rounded-sm hover:border-[#0F172A] transition-colors uppercase tracking-wide cursor-pointer bg-white text-center">
            VIEW ALL
          </Link>
        </div>
        
        {/* 4 Columns Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {deals.map((product) => (
            <div key={product._id || product.id}>
              <Card 
                rating={product?.rating} id={product._id || product.id}
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
                  'FEATURED DEAL'
                }
                tag="HOT DEAL"
                tagColor="bg-[#EF4444]"
              />
            </div>
          ))}
        </div>
        
      </div>
    </section>
  );
};

export default ActiveDeals;
