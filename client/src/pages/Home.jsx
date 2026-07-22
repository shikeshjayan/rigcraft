import React from 'react';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import StarOutlineOutlinedIcon from '@mui/icons-material/StarOutlineOutlined';
import HeroOffer from '../sections/HeroOffer';
import HeroDeals from '../sections/HeroDeals';
import HeroToday from '../sections/HeroToday';
import HeroNewArrival from '../sections/HeroNewArrival';
import HeroReview from '../sections/HeroReview';
import WhyChooseUs from '../sections/WhyChooseUs';
import HomeCategory from '../sections/HomeCategory';
import HomePrebuildSection from '../sections/HomePrebuildSection';
import HomeParallax from '../sections/HomeParallax';

const SpecBadge = ({ title, positionClass, lineTransform, isRight }) => {
  return (
    <div className={`absolute ${positionClass} hidden lg:flex items-center`}>
      {!isRight && (
        <div 
          className="z-10 p-[2px] shadow-[0_0_15px_rgba(37,99,235,0.2)]"
          style={{
             background: 'var(--color-primary)',
             clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)'
          }}
        >
          <div 
            className="px-4 py-2 text-[13px] font-bold tracking-wide"
            style={{
               backgroundColor: 'var(--color-bg-secondary)',
               color: 'var(--color-text)',
               clipPath: 'polygon(9px 0, 100% 0, 100% calc(100% - 9px), calc(100% - 9px) 100%, 0 100%, 0 9px)'
            }}
          >
            {title}
          </div>
        </div>
      )}
      
      <svg width="115" height="60" viewBox="0 0 140 60" fill="none" className={isRight ? "-mr-1" : "-ml-1"} style={{ transform: lineTransform }}>
        <circle cx="4" cy="30" r="5" fill="var(--color-primary)" />
        <path d="M4 30 H 30 L 60 10 H 95 M 115 10 H 136" stroke="var(--color-primary)" strokeWidth="2" />
        <rect x="95" y="8" width="20" height="4" fill="var(--color-primary)" />
        <circle cx="136" cy="10" r="3" fill="var(--color-primary)" />
      </svg>

      {isRight && (
        <div 
          className="z-10 p-[2px] shadow-[0_0_15px_rgba(37,99,235,0.2)]"
          style={{
             background: 'var(--color-primary)',
             clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)'
          }}
        >
          <div 
            className="px-4 py-2 text-[13px] font-bold tracking-wide"
            style={{
               backgroundColor: 'var(--color-bg-secondary)',
               color: 'var(--color-text)',
               clipPath: 'polygon(9px 0, 100% 0, 100% calc(100% - 9px), calc(100% - 9px) 100%, 0 100%, 0 9px)'
            }}
          >
            {title}
          </div>
        </div>
      )}
    </div>
  );
};

const Home = () => {
  return (
    <>
      {/* ================= HERO SECTION ================= */}
      <section className="relative w-full overflow-hidden min-h-[calc(100vh-72px)] lg:h-[calc(100vh-72px)] flex items-center" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 lg:px-8 py-12 lg:py-0 animate-fade-in-up">
        <div className="flex flex-col-reverse lg:flex-row items-center justify-between gap-12 lg:gap-8">
          
          {/* Left Content Column */}
          <div className="w-full lg:w-1/2 flex flex-col items-start text-left">
            
            {/* Eyebrow */}
            <div 
              className="font-bold uppercase tracking-[2px] mb-4" 
              style={{ fontSize: '14px', color: 'var(--color-primary)' }}
            >
              BUILD. PLAY. DOMINATE.
            </div>
            
            {/* Main Heading */}
            <h1 className="font-extrabold leading-[1.1] text-[#111111] text-[36px] md:text-[38px] lg:text-[52px] mb-6">
              MASTER YOUR CRAFT.<br />
              BUILD YOUR<br />
              <span style={{ color: 'var(--color-primary)' }}>ULTIMATE PC.</span>
            </h1>
            
            {/* Description */}
            <p 
              className="font-normal max-w-[600px] mb-10"
              style={{ fontSize: '18px', lineHeight: '1.7', color: '#6B7280' }}
            >
              Precision engineered gaming rigs, creator workstations, and custom PC builds powered by real-time compatibility checking.
            </p>
            
            {/* CTA Section */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-16">
              <button 
                className="w-full sm:w-auto flex items-center justify-center font-semibold transition-all duration-300 ease-in-out hover:scale-[1.03] cursor-pointer"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: 'white',
                  height: '52px',
                  padding: '0 28px',
                  borderRadius: 'var(--radius-sm)',
                  // boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.4)'
                }}
              >
                START YOUR BUILD
              </button>
              <button 
                className="w-full sm:w-auto flex items-center justify-center font-semibold transition-all duration-300 ease-in-out group cursor-pointer"
                style={{
                  backgroundColor: 'transparent',
                  border: '1px solid var(--color-primary)',
                  color: 'var(--color-primary)',
                  height: '52px',
                  padding: '0 28px',
                  borderRadius: 'var(--radius-sm)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-primary)';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--color-primary)';
                }}
              >
                SHOP PREBUILTS
              </button>
            </div>
            
            {/* Statistics Bar */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 w-full pt-2">
              
              <div className="flex flex-col items-start gap-2">
                <PeopleOutlinedIcon className="cursor-pointer" style={{ color: 'var(--color-primary)', fontSize: '28px' }} />
                <div>
                  <div className="font-bold text-[24px]" style={{ color: 'var(--color-primary)' }}>2L+</div>
                  <div className="font-medium text-[14px]" style={{ color: '#6B7280' }}>Happy Customers</div>
                </div>
              </div>

              <div className="flex flex-col items-start gap-2">
                <VerifiedUserOutlinedIcon className="cursor-pointer" style={{ color: 'var(--color-primary)', fontSize: '28px' }} />
                <div>
                  <div className="font-bold text-[24px]" style={{ color: 'var(--color-primary)' }}>99%</div>
                  <div className="font-medium text-[14px]" style={{ color: '#6B7280' }}>Compatibility Rate</div>
                </div>
              </div>

              <div className="flex flex-col items-start gap-2 col-span-2 md:col-span-1">
                <StarOutlineOutlinedIcon className="cursor-pointer" style={{ color: 'var(--color-primary)', fontSize: '28px' }} />
                <div>
                  <div className="font-bold text-[24px]" style={{ color: 'var(--color-primary)' }}>4.9 ★</div>
                  <div className="font-medium text-[14px]" style={{ color: '#6B7280' }}>Average Rating</div>
                </div>
              </div>
              
            </div>
          </div>
          
          {/* Right Content Column (Image) */}
          <div className="w-full lg:w-1/2 flex items-center justify-center relative mt-10 lg:mt-0 lg:-translate-y-12">
            {/* Radial Glow */}
            <div 
              className="absolute inset-0 rounded-full blur-[100px] opacity-20 pointer-events-none"
              style={{
                background: 'radial-gradient(circle, var(--color-primary) 0%, transparent 70%)',
                transform: 'scale(1.2)'
              }}
            ></div>
            
            {/* Floating Container for Image & Specs */}
            <div className="relative z-10 w-full max-w-[750px] animate-float flex items-center justify-center">
              {/* Image */}
              <img 
                src="/heroimage.png" 
                alt="Custom gaming PC workstation with real-time compatibility support" 
                className="w-full max-h-[50vh] lg:max-h-[75vh] object-contain drop-shadow-2xl"
              />
              
              <SpecBadge 
                title="Intel Core i9 14900K" 
                positionClass="top-[25%] left-[-17%]" 
                lineTransform="scaleY(-1)" 
                isRight={false} 
              />
              <SpecBadge 
                title="64GB DDR5 RAM" 
                positionClass="bottom-[25%] left-[-14%]" 
                lineTransform="none" 
                isRight={false} 
              />
              <SpecBadge 
                title="NVIDIA RTX 4090" 
                positionClass="top-[15%] right-[-10%]" 
                lineTransform="scaleX(-1) scaleY(-1)" 
                isRight={true} 
              />
              <SpecBadge 
                title="2TB NVMe PCIe 5.0" 
                positionClass="bottom-[25%] right-[-10%]" 
                lineTransform="scaleX(-1)" 
                isRight={true} 
              />
            </div>
          </div>
          
        </div>
      </div>
    </section>

      {/* ================= HERO OFFER SECTION ================= */}
      <HeroOffer />


      {/* ================= HOME CATEGORY SECTION ================= */}
      <HomeCategory />

      {/* ================= HOME PREBUILT SECTION ================= */}
      <HomePrebuildSection />

      {/* ================= HOME PARALLAX SECTION ================= */}
      <HomeParallax />
      
      {/* ================= HERO DEALS SECTION ================= */}
      <HeroDeals />

      {/* ================= WHY CHOOSE US SECTION ================= */}
      <WhyChooseUs />
      
      {/* ================= TODAY'S DEALS SECTION ================= */}
      <HeroToday />

      {/* ================= NEW ARRIVALS SECTION ================= */}
      <HeroNewArrival />

      {/* ================= REVIEW SECTION ================= */}
      <HeroReview />
    </>
  );
};

export default Home;
