import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

const BuilderHero = () => {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  return (
    <section className="relative w-full h-[60vh] md:h-screen min-h-[500px] flex items-center justify-center overflow-hidden bg-[#0F1111]">
      
      {/* Loading State */}
      {!isVideoLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
          <div className="w-12 h-12 border-4 border-gray-700 border-t-[var(--color-primary)] rounded-full animate-spin mb-4"></div>
          <span className="text-gray-400 text-sm font-medium animate-pulse tracking-wide">Loading Experience...</span>
        </div>
      )}

      {/* Background Video */}
      <video 
        src="/prebuild-hero.mp4" 
        autoPlay 
        muted 
        loop 
        playsInline
        preload="auto"
        onCanPlay={() => setIsVideoLoaded(true)}
        className={`absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-1000 ${isVideoLoaded ? 'opacity-100' : 'opacity-0'}`}
      />
      
      {/* Dark Overlay for better text readability */}
      <div className={`absolute inset-0 bg-black/60 z-0 transition-opacity duration-1000 ${isVideoLoaded ? 'opacity-100' : 'opacity-0'}`}></div>

      {/* Content Container (Layered on top) */}
      <div className="relative z-10 w-full max-w-[1500px] mx-auto px-4 lg:px-[100px] flex flex-col justify-start items-start h-full pt-16 md:pt-24">
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center text-[12px] text-gray-300 font-medium mb-6">
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <KeyboardArrowRightIcon sx={{ fontSize: 16, marginX: 0.5 }} />
          <span className="text-white font-bold">Build PC</span>
        </div>

        {/* Header Content */}
        <div className="max-w-4xl mb-8">
          <h1 className="text-[40px] md:text-[64px] font-extrabold text-white mb-4 leading-tight tracking-tight">
            Configure Your <span className="text-[var(--color-primary)]">Custom PC</span>
          </h1>
          <p className="text-[16px] md:text-[18px] text-gray-300 leading-relaxed max-w-2xl">
            Select components to start your build. We'll handle compatibility checks automatically.
          </p>
        </div>
      </div>
    </section>
  );
};

export default BuilderHero;
