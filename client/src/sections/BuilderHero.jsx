import { useState } from 'react';
import { Link } from 'react-router-dom';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import VerifiedIcon from '@mui/icons-material/Verified';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

const BuilderHero = () => {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  const scrollToBuilder = () => {
    document.getElementById('builder-workspace')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const BENEFITS = [
    { icon: <VerifiedIcon sx={{ fontSize: 16 }} />, label: 'Compatibility Checked' },
    { icon: <VerifiedUserIcon sx={{ fontSize: 16 }} />, label: 'Genuine Components' },
    { icon: <AutoAwesomeIcon sx={{ fontSize: 16 }} />, label: 'Expert Recommendations' }
  ];

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

        {/* CTA + Benefits */}
        <div className="flex flex-col gap-6">
          <button
            onClick={scrollToBuilder}
            className="flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[#1E3A8A] text-white font-bold px-8 py-3.5 text-[15px] transition-colors cursor-pointer w-fit"
            style={{ borderRadius: 'var(--radius-sm)' }}
          >
            Start Building
            <KeyboardArrowRightIcon sx={{ fontSize: 20 }} />
          </button>

          <div className="flex flex-wrap gap-3">
            {BENEFITS.map((benefit) => (
              <div
                key={benefit.label}
                className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-[13px] font-bold text-white px-3.5 py-2"
                style={{ borderRadius: 'var(--radius-sm)' }}
              >
                <span className="text-[var(--color-primary)]">{benefit.icon}</span>
                {benefit.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BuilderHero;
