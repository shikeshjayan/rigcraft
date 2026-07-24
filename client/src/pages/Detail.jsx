import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { allPCs } from '../data/mockData';
import { allItems } from '../data/items';
import FadeUp from '../components/FadeUp';

// Icons
import StarIcon from '@mui/icons-material/Star';
import StarHalfIcon from '@mui/icons-material/StarHalf';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import ConstructionIcon from '@mui/icons-material/Construction';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const Detail = () => {
  const { id } = useParams();
  
  // Find the exact item that was clicked based on the URL ID
  // It could be a PC (id < 1000) or a Component (id >= 1000)
  const parsedId = parseInt(id);
  const pc = allPCs.find(p => p.id === parsedId) || allItems.find(p => p.id === parsedId);

  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!pc) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-gray-50 text-black">
        <h2 className="text-2xl font-bold mb-4">Item Not Found</h2>
        <Link to="/" className="text-[#0047AB] underline">Return to Home</Link>
      </div>
    );
  }

  // Parse out some specs for the grid based on the title string
  const isIntel = pc.brand === 'Intel';
  const isComponent = parsedId >= 1000;
  
  const processor = isComponent ? pc.title : (isIntel ? 'Intel Core i7-14700K' : 'AMD Ryzen 7 7800X3D');
  const gpuMatch = pc.title.match(/(RTX [0-9]{4} [0-9]{2}GB)/);
  const graphics = gpuMatch ? gpuMatch[0] : (isComponent ? pc.title : 'NVIDIA RTX 4070 12GB');
  
  const memoryMatch = pc.title.match(/([0-9]{2}GB RAM)/);
  const memory = memoryMatch ? memoryMatch[0].replace(' RAM', '') : '16GB';
  
  const storage = isComponent ? pc.title : '1TB NVMe Gen4';

  return (
    <FadeUp delay={0.1}>
    <div className="w-full bg-[#FAF9F6] text-[#0F1111] pb-20">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 pt-4">
        
        {/* Breadcrumbs */}
        <div className="flex items-center text-[12px] text-[#565959] mb-4">
          <Link to="/" className="hover:underline">Home</Link>
          <ChevronRightIcon sx={{ fontSize: 14, mx: 0.5 }} />
          <Link to="/prebuild" className="hover:underline">Prebuilt PCs</Link>
          <ChevronRightIcon sx={{ fontSize: 14, mx: 0.5 }} />
          <span className="hover:underline cursor-pointer">{pc.category} Systems</span>
          <ChevronRightIcon sx={{ fontSize: 14, mx: 0.5 }} />
          <span className="font-bold text-[#0F1111] truncate max-w-[200px] sm:max-w-none">{pc.title}</span>
        </div>

        {/* Main 2-Column Layout */}
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* LEFT COLUMN: Media & Deep Details */}
          <div className="w-full lg:w-[60%] flex flex-col">
            
            {/* Image Gallery */}
            <div className="w-full bg-[#E5E7EB] rounded-sm mb-4 aspect-video flex items-center justify-center p-8">
              <img src={pc.image} alt={pc.title} className="max-h-full max-w-full object-contain mix-blend-multiply" />
            </div>
            
            {/* Thumbnails (Mocked) */}
            <div className="flex gap-2 mb-12">
              {[pc.image, pc.image, pc.image, pc.image].map((img, i) => (
                <div key={i} className={`w-20 h-20 bg-white border ${i===0 ? 'border-[#0047AB]' : 'border-[#D5D9D9]'} rounded-sm flex items-center justify-center p-2 cursor-pointer hover:border-[#0047AB]`}>
                  <img src={img} alt="thumb" className="max-h-full max-w-full object-contain" />
                </div>
              ))}
            </div>

            {/* About this System */}
            <div className="mb-10">
              <h3 className="text-[16px] font-bold text-[#0F1111] border-b border-[#E7E7E7] pb-2 mb-4">About this System</h3>
              <p className="text-[14px] text-[#333] mb-4 leading-relaxed">
                The {pc.title} is engineered for ultimate performance and unrivaled productivity. 
                Experience incredibly detailed virtual worlds with ray tracing and unprecedented AI-accelerated workflows.
              </p>
              <ul className="list-disc pl-5 space-y-3 text-[14px] text-[#333]">
                <li><span className="font-bold">Elite Processing Power:</span> Powered by the {processor}, delivering incredible multi-core efficiency for high-octane tasks.</li>
                <li><span className="font-bold">Next-Gen Graphics:</span> Featuring the {graphics} for real-time ray tracing and DLSS 3.5 AI upscaling.</li>
                <li><span className="font-bold">Lightning Fast Memory:</span> Configured with {memory} DDR5 running at 6000MHz for seamless multitasking.</li>
                <li><span className="font-bold">Refined Thermal Solution:</span> Custom liquid cooling system engineered to keep temps incredibly low while reducing noise by up to 4dB.</li>
              </ul>
            </div>

            {/* Ecosystem Compatibility Widget */}
            <div className="bg-[#0B1521] rounded-md overflow-hidden mb-10 shadow-lg border border-[#1E293B]">
              <div className="p-4 flex items-start gap-4 border-b border-[#1E293B]">
                <div className="bg-[#0047AB] p-2 rounded-sm text-white">
                  <VerifiedUserIcon />
                </div>
                <div className="flex-grow">
                  <h4 className="text-white font-bold text-[15px]">Ecosystem Compatibility</h4>
                  <p className="text-[#94A3B8] text-[13px]">Verified for PCForge Precision builds</p>
                </div>
                <div className="bg-[#059669] text-white text-[11px] font-bold px-3 py-1 rounded-sm uppercase tracking-wider">
                  Compatible
                </div>
              </div>
              <div className="flex flex-wrap p-4 bg-[#1F2937] gap-y-4">
                <div className="w-1/2 sm:w-1/3">
                  <div className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-wider mb-1">Min Power Supply</div>
                  <div className="text-white text-[13px]">850W (80+ Gold)</div>
                </div>
                <div className="w-1/2 sm:w-1/3">
                  <div className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-wider mb-1">Case Clearance</div>
                  <div className="text-white text-[13px]">Mid-Tower ATX</div>
                </div>
                <div className="w-full sm:w-1/3 mt-2 sm:mt-0">
                  <div className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-wider mb-1">Motherboard</div>
                  <div className="text-white text-[13px]">{isIntel ? 'Z790' : 'X670E'} Chipset</div>
                </div>
              </div>
              <div className="p-3 text-[11px] text-[#94A3B8] bg-[#0B1521]">
                This configuration is confirmed compatible with your saved build preferences.
              </div>
            </div>

            {/* Technical Specifications */}
            <div>
              <h3 className="text-[16px] font-bold text-[#0F1111] mb-4">Technical Specifications</h3>
              <div className="w-full border border-[#E7E7E7] rounded-sm overflow-hidden">
                <table className="w-full text-left text-[14px]">
                  <tbody>
                    <tr className="bg-[#F3F4F6] border-b border-[#E7E7E7]">
                      <th className="py-3 px-4 w-1/3 font-bold text-[#0F1111]">Feature</th>
                      <th className="py-3 px-4 font-bold text-[#0F1111]">Specifications</th>
                    </tr>
                    <tr className="border-b border-[#E7E7E7]">
                      <td className="py-3 px-4 font-bold text-[#333]">Processor</td>
                      <td className="py-3 px-4 text-[#565959]">{processor} (Up to 5.4GHz)</td>
                    </tr>
                    <tr className="bg-[#F9FAFB] border-b border-[#E7E7E7]">
                      <td className="py-3 px-4 font-bold text-[#333]">Graphics Card</td>
                      <td className="py-3 px-4 text-[#565959]">{graphics}</td>
                    </tr>
                    <tr className="border-b border-[#E7E7E7]">
                      <td className="py-3 px-4 font-bold text-[#333]">System Memory</td>
                      <td className="py-3 px-4 text-[#565959]">{memory} DDR5 6000MHz</td>
                    </tr>
                    <tr className="bg-[#F9FAFB] border-b border-[#E7E7E7]">
                      <td className="py-3 px-4 font-bold text-[#333]">Storage</td>
                      <td className="py-3 px-4 text-[#565959]">{storage}</td>
                    </tr>
                    <tr className="border-b border-[#E7E7E7]">
                      <td className="py-3 px-4 font-bold text-[#333]">Motherboard</td>
                      <td className="py-3 px-4 text-[#565959]">{isIntel ? 'ASUS ROG Z790' : 'GIGABYTE X670E AORUS'}</td>
                    </tr>
                    <tr className="bg-[#F9FAFB]">
                      <td className="py-3 px-4 font-bold text-[#333]">Power Supply</td>
                      <td className="py-3 px-4 text-[#565959]">850W 80+ Gold Fully Modular</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Specs & Purchase Box */}
          <div className="w-full lg:w-[40%] flex flex-col gap-6">
            
            {/* Header / Title */}
            <div>
              <div className="bg-[#E5F0FF] text-[#0047AB] text-[11px] font-bold px-2 py-1 rounded-sm uppercase tracking-wider inline-block mb-3">
                {pc.tier || 'FLAGSHIP SERIES'}
              </div>
              <h1 className="text-[26px] font-bold leading-tight text-[#0F1111] mb-2">
                {pc.title}
              </h1>
              <div className="text-[13px] text-[#565959] flex items-center gap-2 mb-3">
                <span>Model: PCF-SYS-{pc.id}000</span>
                <span>|</span>
                <span>SKU: {pc.id}98273{pc.id}</span>
              </div>
              <div className="flex items-center gap-1 mb-4">
                <div className="flex text-[#0047AB]">
                  {[...Array(5)].map((_, i) => (
                    pc.rating >= i + 1 ? <StarIcon key={i} sx={{ fontSize: 18 }} /> :
                    pc.rating >= i + 0.5 ? <StarHalfIcon key={i} sx={{ fontSize: 18 }} /> : null
                  ))}
                </div>
                <span className="text-[#0047AB] text-[14px] font-bold ml-1">{pc.rating}</span>
                <span className="text-[#565959] text-[13px] ml-1">({pc.reviews} Verified Benchmarks)</span>
              </div>
            </div>

            {/* 4-Grid Specs */}
            <div className="grid grid-cols-2 gap-3 mb-2">
              <div className="bg-[#F3F4F6] p-3 rounded-sm">
                <div className="text-[10px] text-[#565959] font-bold uppercase tracking-wider mb-1">Processor</div>
                <div className="text-[#0047AB] font-medium text-[13px]">{processor.split(' ')[0]} {processor.split(' ')[2]}</div>
              </div>
              <div className="bg-[#F3F4F6] p-3 rounded-sm">
                <div className="text-[10px] text-[#565959] font-bold uppercase tracking-wider mb-1">Graphics</div>
                <div className="text-[#0047AB] font-medium text-[13px]">{graphics.split(' ')[1]} {graphics.split(' ')[2]}</div>
              </div>
              <div className="bg-[#F3F4F6] p-3 rounded-sm">
                <div className="text-[10px] text-[#565959] font-bold uppercase tracking-wider mb-1">Memory</div>
                <div className="text-[#0047AB] font-medium text-[13px]">{memory} DDR5</div>
              </div>
              <div className="bg-[#F3F4F6] p-3 rounded-sm">
                <div className="text-[10px] text-[#565959] font-bold uppercase tracking-wider mb-1">Storage</div>
                <div className="text-[#0047AB] font-medium text-[13px]">{storage.split(' ')[0]} SSD</div>
              </div>
            </div>

            {/* Key Innovations List */}
            <div className="mb-4">
              <div className="text-[13px] text-[#565959] mb-3">Key Innovations</div>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-[13px] text-[#333]">
                  <CheckCircleOutlineIcon sx={{ fontSize: 18, color: '#0047AB', mt: 0.2 }} />
                  <div><span className="font-bold">DLSS 3.5 Frame Generation:</span> AI-powered graphics that quadruple performance.</div>
                </li>
                <li className="flex items-start gap-2 text-[13px] text-[#333]">
                  <CheckCircleOutlineIcon sx={{ fontSize: 18, color: '#0047AB', mt: 0.2 }} />
                  <div><span className="font-bold">Next-Gen Architecture:</span> Hyper-realistic lighting and shadow effects.</div>
                </li>
                <li className="flex items-start gap-2 text-[13px] text-[#333]">
                  <CheckCircleOutlineIcon sx={{ fontSize: 18, color: '#0047AB', mt: 0.2 }} />
                  <div><span className="font-bold">AIO Liquid Cooling:</span> Advanced thermal management for sustained heavy loads.</div>
                </li>
              </ul>
            </div>

            {/* Sticky Purchase Box */}
            <div className="sticky top-[120px] bg-white border border-[#E7E7E7] shadow-[0_4px_12px_rgba(0,0,0,0.05)] p-5 rounded-md flex flex-col mb-6">
              
              <div className="flex items-center gap-3 mb-1">
                <span className="bg-[#CC0C39] text-white text-[11px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                  -20% EXCLUSIVE
                </span>
                <span className="text-[14px] text-[#565959] line-through">{pc.mrp}</span>
              </div>
              
              <div className="text-[36px] font-bold text-[#0047AB] mb-1 leading-none tracking-tight">
                {pc.price}
              </div>
              <div className="text-[13px] text-[#565959] mb-4 pb-4 border-b border-[#E7E7E7]">
                Financing available from ₹4,500/mo
              </div>

              {/* Engineering Perk */}
              <div className="bg-[#F0F6FF] border border-[#D1E3FF] rounded-sm p-3 flex gap-3 mb-4">
                <ConstructionIcon sx={{ color: '#0047AB', fontSize: 20 }} />
                <div>
                  <div className="text-[10px] text-[#0047AB] font-bold uppercase tracking-wider mb-1">Engineering Perk</div>
                  <div className="text-[12px] text-[#333]">Includes 'Stellar Horizon' Game Bundle & 3-Year Warranty</div>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="flex items-start gap-3 mb-6">
                <div className="mt-1">
                  <div className="w-2.5 h-2.5 bg-[#059669] rounded-full mx-auto mb-1"></div>
                  <LocalShippingOutlinedIcon sx={{ fontSize: 18, color: '#565959' }} />
                </div>
                <div>
                  <div className="text-[13px] text-[#333] font-medium">In Stock at Main Laboratory</div>
                  <div className="text-[13px] text-[#565959] flex gap-2">
                    <span>Est. Delivery:</span>
                    <span className="font-bold text-[#0F1111]">Wednesday, Oct 30</span>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col gap-3">
                <button className="w-full bg-[#0047AB] text-white font-bold py-3 rounded-md hover:bg-[#003380] transition-colors shadow-sm cursor-pointer">
                  Buy Now
                </button>
                <button className="w-full bg-white text-[#0047AB] border border-[#0047AB] font-bold py-3 rounded-md hover:bg-[#F0F6FF] transition-colors cursor-pointer">
                  Add to Cart
                </button>
                <button className="w-full bg-[#1F2937] text-white font-bold py-3 rounded-md hover:bg-[#111827] transition-colors flex justify-center items-center gap-2 cursor-pointer mt-2">
                  <ConstructionIcon sx={{ fontSize: 18 }} /> Add to Active Build
                </button>
              </div>
            </div>

            {/* Engineered Combinations (Accessories) */}
            {/* <div className="border border-[#E7E7E7] bg-white rounded-sm p-5 shadow-sm">
              <h4 className="text-[15px] font-bold text-[#0F1111] mb-2">Engineered Combinations</h4>
              <p className="text-[12px] text-[#565959] mb-4 leading-relaxed">
                The PCForge Engineering team recommends pairing this system with these components for maximum efficiency.
              </p>
              
              <div className="flex items-center gap-4 py-3 border-b border-[#E7E7E7]">
                <div className="w-12 h-12 bg-[#F3F4F6] flex-shrink-0 flex items-center justify-center p-1 rounded-sm">
                  <span className="text-[10px] text-gray-400 font-bold">MONITOR</span>
                </div>
                <div className="flex-grow">
                  <div className="text-[12px] font-bold text-[#333]">ROG Swift OLED 27"</div>
                  <div className="text-[13px] font-bold text-[#0047AB]">₹85,000.00</div>
                  <div className="text-[10px] text-[#0047AB] font-bold hover:underline cursor-pointer mt-0.5">+ Add to Combo</div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 py-3 border-b border-[#E7E7E7]">
                <div className="w-12 h-12 bg-[#F3F4F6] flex-shrink-0 flex items-center justify-center p-1 rounded-sm">
                  <span className="text-[10px] text-gray-400 font-bold">KBM</span>
                </div>
                <div className="flex-grow">
                  <div className="text-[12px] font-bold text-[#333]">Razer BlackWidow V4 Pro</div>
                  <div className="text-[13px] font-bold text-[#0047AB]">₹22,999.00</div>
                  <div className="text-[10px] text-[#0047AB] font-bold hover:underline cursor-pointer mt-0.5">+ Add to Combo</div>
                </div>
              </div>

              <div className="flex justify-between items-center mt-4 mb-4">
                <div className="text-[12px] text-[#565959]">Combo Price:</div>
                <div className="text-[18px] font-bold text-[#0047AB]">{pc.price}</div>
              </div>
              <button className="w-full bg-[#4B5563] text-white font-bold py-2 rounded-sm hover:bg-[#374151] transition-colors text-[13px] cursor-pointer">
                Add Combo to Build
              </button>
            </div> */}

          </div>

        </div>
      </div>
    </div>
    </FadeUp>
  );
};

export default Detail;
