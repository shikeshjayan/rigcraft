import React from 'react';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';

const features = [
  {
    id: 1,
    title: 'Wide Selection',
    description: '1000+ premium components from top brands',
    icon: <Inventory2OutlinedIcon sx={{ fontSize: 36, color: 'var(--color-primary)' }} />
  },
  {
    id: 2,
    title: 'Best Prices',
    description: 'Competitive pricing guaranteed',
    icon: <VerifiedOutlinedIcon sx={{ fontSize: 36, color: 'var(--color-primary)' }} />
  },
  {
    id: 3,
    title: 'Fast Shipping',
    description: 'Quick delivery across India',
    icon: <LocalShippingOutlinedIcon sx={{ fontSize: 36, color: 'var(--color-primary)' }} />
  },
  {
    id: 4,
    title: 'Secure Shopping',
    description: 'Safe & secure payment options',
    icon: <SecurityOutlinedIcon sx={{ fontSize: 36, color: 'var(--color-primary)' }} />
  },
  {
    id: 5,
    title: 'Expert Support',
    description: 'Professional help when you need it',
    icon: <SupportAgentOutlinedIcon sx={{ fontSize: 36, color: 'var(--color-primary)' }} />
  }
];

const WhyChooseUs = () => {
  return (
    <section className="w-full py-20 bg-white">
      <div className="max-w-[1500px] mx-auto px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="flex flex-col justify-center items-center text-center mb-12 max-w-3xl mx-auto">
          <h2 className="text-[32px] md:text-[36px] font-extrabold text-[#111111] mb-4">
            Why choose <span className='text-[var(--color-primary)]'>Rig</span> Craft
          </h2>
          <p className="text-[15px] md:text-[16px] font-medium text-[#6B7280] leading-relaxed">
            Experience unmatched quality, expert support, and the best prices in the market. We are dedicated to providing you with top-tier components and seamless custom PC builds.
          </p>
        </div>
        
        {/* Grid Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {features.map((feature) => (
            <div 
              key={feature.id} 
              className="flex flex-col items-center justify-start text-center px-4 py-10 shadow-sm border border-gray-300 transition-all duration-300 hover:shadow-md"
              style={{ 
                backgroundColor: 'white', 
                borderRadius: 'var(--radius-sm, 8px)' 
              }}
            >
              {/* Icon Wrapper */}
              <div className="mb-6 flex items-center justify-center">
                {feature.icon}
              </div>
              
              {/* Text Content */}
              <h3 className="text-[16px] font-bold text-[#111111] mb-2">
                {feature.title}
              </h3>
              <p className="text-[13px] font-medium text-[#6B7280] leading-snug">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default WhyChooseUs;
