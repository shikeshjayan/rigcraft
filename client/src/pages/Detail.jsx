import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import apiClient from '../api/client';
import FadeUp from '../components/FadeUp';

// Icons
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import Breadcrumb from '../components/Breadcrumb';
import StarIcon from '@mui/icons-material/Star';
import StarHalfIcon from '@mui/icons-material/StarHalf';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import ConstructionIcon from '@mui/icons-material/Construction';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const Detail = () => {
  const { id } = useParams();
  const location = useLocation();
  const typeParam = new URLSearchParams(location.search).get('type') || 'product';
  
  const [pc, setPc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    const fetchItem = async () => {
      setLoading(true);
      setError(false);
      try {
        const endpoint = typeParam === 'prebuilt' ? `/prebuilt-pcs/${id}` : `/products/slug/${id}`;
        const res = await apiClient.get(endpoint);
        setPc(res.data?.data || res.data);
      } catch (err) {
        console.error("Failed to load product details", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchItem();
    }
  }, [id, typeParam]);

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-50 text-[#0047AB]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0047AB]"></div>
      </div>
    );
  }

  if (error || !pc) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-gray-50 text-black">
        <h2 className="text-2xl font-bold mb-4">Item Not Found</h2>
        <p className="text-[#565959] mb-4">The item you are looking for does not exist or has been removed.</p>
        <Link to="/" className="text-[#0047AB] underline">Return to Home</Link>
      </div>
    );
  }

  // Helper variables for rendering
  const isPrebuilt = typeParam === 'prebuilt';
  const title = pc.name;
  const description = pc.description || pc.shortDescription || `Experience incredible performance with the ${title}.`;
  
  // Format price
  const formattedPrice = pc.price ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(pc.price) : '₹0';
  const mrpPrice = pc.salePrice || pc.price ? pc.price * 1.2 : pc.price; // mock MRP
  const formattedMrp = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(mrpPrice);
  
  // Images
  const images = pc.images && pc.images.length > 0 ? pc.images.map(img => img.url) : ['/fallback.png'];
  const currentImage = images[activeImage] || images[0];

  // Rating
  const ratingAvg = pc.rating?.average || 4.5;
  const reviewsCount = pc.rating?.count || Math.floor(Math.random() * 500) + 10;
  
  // Specs extraction safely
  const specifications = pc.specifications || {};
  const isIntel = pc.brand?.name === 'Intel' || (typeof pc.brand === 'string' && pc.brand.includes('Intel'));
  const processor = specifications.Processor || (isIntel ? 'Intel Core processor' : 'AMD Ryzen processor');
  const graphics = specifications.Graphics || 'Integrated Graphics';
  const memory = specifications.Memory || '16GB DDR5';
  const storage = specifications.Storage || '1TB NVMe Gen4';

  return (
    <FadeUp delay={0.1}>
    <div className="w-full bg-[#FAF9F6] text-[#0F1111] pb-20">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 pt-4">
        
        {/* Breadcrumbs */}
        <Breadcrumb items={[
          { label: 'Home', path: '/' },
          { label: isPrebuilt ? 'Prebuilt PCs' : 'Components', path: isPrebuilt ? '/prebuild' : '/components' },
          { label: pc.category?.name || 'Category' },
          { label: title }
        ]} />

        {/* Main 2-Column Layout */}
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* LEFT COLUMN: Media & Deep Details */}
          <div className="w-full lg:w-[60%] flex flex-col">
            
            {/* Image Gallery */}
            <div className="w-full bg-[#E5E7EB] rounded-sm mb-4 aspect-video flex items-center justify-center p-8">
              <img src={currentImage} alt={title} className="max-h-full max-w-full object-contain mix-blend-multiply" />
            </div>
            
            {/* Thumbnails */}
            <div className="flex gap-2 mb-12">
              {images.slice(0, 4).map((img, i) => (
                <div 
                  key={i} 
                  onClick={() => setActiveImage(i)}
                  className={`w-20 h-20 bg-white border ${i === activeImage ? 'border-[#0047AB]' : 'border-[#D5D9D9]'} rounded-sm flex items-center justify-center p-2 cursor-pointer hover:border-[#0047AB]`}
                >
                  <img src={img} alt="thumb" className="max-h-full max-w-full object-contain" />
                </div>
              ))}
            </div>

            {/* About this System */}
            <div className="mb-10">
              <h3 className="text-[16px] font-bold text-[#0F1111] border-b border-[#E7E7E7] pb-2 mb-4">About this Product</h3>
              <p className="text-[14px] text-[#333] mb-4 leading-relaxed whitespace-pre-line">
                {description}
              </p>
              
              {isPrebuilt && (
                <ul className="list-disc pl-5 space-y-3 text-[14px] text-[#333]">
                  <li><span className="font-bold">Elite Processing Power:</span> Powered by the {processor}, delivering incredible multi-core efficiency for high-octane tasks.</li>
                  <li><span className="font-bold">Next-Gen Graphics:</span> Featuring the {graphics} for real-time ray tracing and DLSS 3.5 AI upscaling.</li>
                  <li><span className="font-bold">Lightning Fast Memory:</span> Configured with {memory} for seamless multitasking.</li>
                  <li><span className="font-bold">Refined Thermal Solution:</span> Custom liquid cooling system engineered to keep temps incredibly low.</li>
                </ul>
              )}
            </div>

            {/* Technical Specifications */}
            {Object.keys(specifications).length > 0 && (
              <div>
                <h3 className="text-[16px] font-bold text-[#0F1111] mb-4">Technical Specifications</h3>
                <div className="w-full border border-[#E7E7E7] rounded-sm overflow-hidden">
                  <table className="w-full text-left text-[14px]">
                    <tbody>
                      <tr className="bg-[#F3F4F6] border-b border-[#E7E7E7]">
                        <th className="py-3 px-4 w-1/3 font-bold text-[#0F1111]">Feature</th>
                        <th className="py-3 px-4 font-bold text-[#0F1111]">Specifications</th>
                      </tr>
                      {Object.entries(specifications).map(([key, value], index) => (
                        <tr key={key} className={`${index % 2 === 0 ? '' : 'bg-[#F9FAFB]'} border-b border-[#E7E7E7]`}>
                          <td className="py-3 px-4 font-bold text-[#333] capitalize">{key}</td>
                          <td className="py-3 px-4 text-[#565959]">{String(value)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>

          {/* RIGHT COLUMN: Specs & Purchase Box */}
          <div className="w-full lg:w-[40%] flex flex-col gap-6">
            
            {/* Header / Title */}
            <div>
              <div className="bg-[#E5F0FF] text-[#0047AB] text-[11px] font-bold px-2 py-1 rounded-sm uppercase tracking-wider inline-block mb-3">
                {pc.isFeatured ? 'FEATURED PRODUCT' : (isPrebuilt ? 'FLAGSHIP SERIES' : 'PREMIUM COMPONENT')}
              </div>
              <h1 className="text-[26px] font-bold leading-tight text-[#0F1111] mb-2">
                {title}
              </h1>
              <div className="text-[13px] text-[#565959] flex items-center gap-2 mb-3">
                <span>Model: {pc.sku || `PCF-SYS-${pc._id?.substring(0, 5)}`}</span>
              </div>
              <div className="flex items-center gap-1 mb-4">
                <div className="flex text-[#0047AB]">
                  {[...Array(5)].map((_, i) => (
                    ratingAvg >= i + 1 ? <StarIcon key={i} sx={{ fontSize: 18 }} /> :
                    ratingAvg >= i + 0.5 ? <StarHalfIcon key={i} sx={{ fontSize: 18 }} /> : null
                  ))}
                </div>
                <span className="text-[#0047AB] text-[14px] font-bold ml-1">{ratingAvg}</span>
                <span className="text-[#565959] text-[13px] ml-1">({reviewsCount} Verified Reviews)</span>
              </div>
            </div>

            {/* 4-Grid Specs (if prebuilt) */}
            {isPrebuilt && (
              <div className="grid grid-cols-2 gap-3 mb-2">
                <div className="bg-[#F3F4F6] p-3 rounded-sm">
                  <div className="text-[10px] text-[#565959] font-bold uppercase tracking-wider mb-1">Processor</div>
                  <div className="text-[#0047AB] font-medium text-[13px] truncate">{processor}</div>
                </div>
                <div className="bg-[#F3F4F6] p-3 rounded-sm">
                  <div className="text-[10px] text-[#565959] font-bold uppercase tracking-wider mb-1">Graphics</div>
                  <div className="text-[#0047AB] font-medium text-[13px] truncate">{graphics}</div>
                </div>
                <div className="bg-[#F3F4F6] p-3 rounded-sm">
                  <div className="text-[10px] text-[#565959] font-bold uppercase tracking-wider mb-1">Memory</div>
                  <div className="text-[#0047AB] font-medium text-[13px] truncate">{memory}</div>
                </div>
                <div className="bg-[#F3F4F6] p-3 rounded-sm">
                  <div className="text-[10px] text-[#565959] font-bold uppercase tracking-wider mb-1">Storage</div>
                  <div className="text-[#0047AB] font-medium text-[13px] truncate">{storage}</div>
                </div>
              </div>
            )}

            {/* Key Innovations List */}
            {pc.tags && pc.tags.length > 0 && (
              <div className="mb-4">
                <div className="text-[13px] text-[#565959] mb-3">Highlights</div>
                <ul className="space-y-3">
                  {pc.tags.map((tag, i) => (
                    <li key={i} className="flex items-start gap-2 text-[13px] text-[#333]">
                      <CheckCircleOutlineIcon sx={{ fontSize: 18, color: '#0047AB', mt: 0.2 }} />
                      <div className="capitalize">{tag}</div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Sticky Purchase Box */}
            <div className="sticky top-[120px] bg-white border border-[#E7E7E7] shadow-[0_4px_12px_rgba(0,0,0,0.05)] p-5 rounded-md flex flex-col mb-6">
              
              <div className="flex items-center gap-3 mb-1">
                {pc.salePrice && pc.salePrice < pc.price && (
                  <span className="bg-[#CC0C39] text-white text-[11px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                    - {Math.round((1 - pc.salePrice/pc.price)*100)}% EXCLUSIVE
                  </span>
                )}
                {pc.salePrice && (
                  <span className="text-[14px] text-[#565959] line-through">{formattedMrp}</span>
                )}
              </div>
              
              <div className="text-[36px] font-bold text-[#0047AB] mb-1 leading-none tracking-tight">
                {pc.salePrice ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(pc.salePrice) : formattedPrice}
              </div>
              <div className="text-[13px] text-[#565959] mb-4 pb-4 border-b border-[#E7E7E7]">
                Financing available at checkout
              </div>

              {/* Delivery Info */}
              <div className="flex items-start gap-3 mb-6">
                <div className="mt-1">
                  <div className={`w-2.5 h-2.5 rounded-full mx-auto mb-1 ${pc.stock > 0 ? 'bg-[#059669]' : 'bg-red-500'}`}></div>
                  <LocalShippingOutlinedIcon sx={{ fontSize: 18, color: '#565959' }} />
                </div>
                <div>
                  <div className="text-[13px] text-[#333] font-medium">{pc.stock > 0 ? `In Stock (${pc.stock} units)` : 'Out of Stock'}</div>
                  <div className="text-[13px] text-[#565959] flex gap-2">
                    <span>Est. Delivery:</span>
                    <span className="font-bold text-[#0F1111]">3-5 Business Days</span>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col gap-3">
                <button disabled={pc.stock <= 0} className={`w-full text-white font-bold py-3 rounded-sm shadow-sm transition-colors ${pc.stock > 0 ? 'bg-[#0047AB] hover:bg-[#003380] cursor-pointer' : 'bg-gray-400 cursor-not-allowed'}`}>
                  Buy Now
                </button>
                <button disabled={pc.stock <= 0} className={`w-full bg-white text-[#0047AB] border border-[#0047AB] font-bold py-3 rounded-sm transition-colors ${pc.stock > 0 ? 'hover:bg-[#F0F6FF] cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}>
                  Add to Cart
                </button>
                {!isPrebuilt && (
                  <button className="w-full bg-[#1F2937] text-white font-bold py-3 rounded-sm hover:bg-[#111827] transition-colors flex justify-center items-center gap-2 cursor-pointer mt-2">
                    <ConstructionIcon sx={{ fontSize: 18 }} /> Add to Active Build
                  </button>
                )}
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
    </FadeUp>
  );
};

export default Detail;
