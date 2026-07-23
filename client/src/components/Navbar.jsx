import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import MemoryIcon from '@mui/icons-material/Memory';
import VideogameAssetIcon from '@mui/icons-material/VideogameAsset';
import DeveloperBoardIcon from '@mui/icons-material/DeveloperBoard';
import SaveIcon from '@mui/icons-material/Save';
import BoltIcon from '@mui/icons-material/Bolt';
import ComputerIcon from '@mui/icons-material/Computer';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import MouseIcon from '@mui/icons-material/Mouse';
import MonitorIcon from '@mui/icons-material/Monitor';
import BuildIcon from '@mui/icons-material/Build';
import { useWishlist } from '../context/WishlistContext';

const Navbar = () => {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const isPrebuild = location.pathname === '/prebuild';
  const { wishlist } = useWishlist();

  return (
    <header className="sticky top-0 z-50 flex flex-col w-full animate-fade-in-down">
      {/* Announcement Top Bar */}
      <div 
        className="text-center py-2 text-sm font-medium z-20 relative"
        style={{ 
          backgroundColor: 'var(--color-primary)', 
          color: 'var(--color-bg-primary)',
          borderBottom: '1px solid var(--color-border)'
        }}
      >
        Limited Time: Get free assembly on all custom builds!
      </div>

      {/* Main Navbar */}
      <div className="relative w-full h-[75px] flex items-center">
        {/* Background layer: solid top, gradient transparent bottom with blur */}
        <div 
          className="absolute top-0 left-0 w-full pointer-events-none z-[-1] bg-[var(--color-bg-primary)] border-b border-[var(--color-border)] shadow-xl" 
          style={{
            height: '100%',
            // paddingBottom: '24px', // Extends the background slightly for the fade effect
            boxSizing: 'content-box',
            // background: 'linear-gradient(to bottom, var(--color-bg-primary) 0%, var(--color-bg-primary) calc(100% - 24px), transparent 100%)',
            // backdropFilter: 'blur(12px)',
            // WebkitBackdropFilter: 'blur(12px)',
            // maskImage: 'linear-gradient(to bottom, black 0%, black calc(100% - 24px), transparent 100%)',
            // WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black calc(100% - 24px), transparent 100%)'
          }}
        />

        {/* Navbar Content */}
        <div className="relative z-10 flex items-center justify-between w-full max-w-[1400px] mx-auto px-6 lg:px-8">
          {/* Left: Logo */}
          <Link to="/" className="flex items-center cursor-pointer text-2xl font-black tracking-tight hover:opacity-80 transition-opacity" style={{ color: 'var(--color-text)' }}>
            <span style={{ color: 'var(--color-primary)' }}>Rig</span>Craft
          </Link>



// ... (Inside the nav section)
          {/* Center: Links */}
          <nav className="hidden lg:flex items-center gap-8 font-semibold text-[15px] h-full">
            <Link to="/" className={`transition-colors cursor-pointer flex items-center h-full ${isHome ? 'underline decoration-2 underline-offset-8' : 'hover:text-[var(--color-primary)]'}`} style={{ color: isHome ? 'var(--color-primary)' : 'var(--color-text)', textDecorationColor: 'var(--color-primary)' }}>Home</Link>
            <Link to="/prebuild" className={`transition-colors cursor-pointer flex items-center h-full ${isPrebuild ? 'underline decoration-2 underline-offset-8' : 'hover:text-[var(--color-primary)]'}`} style={{ color: isPrebuild ? 'var(--color-primary)' : 'var(--color-text)', textDecorationColor: 'var(--color-primary)' }}>Prebuild</Link>
            
            {/* Components Dropdown */}
            <div className="relative group h-full flex items-center">
              <a href="#" className="flex items-center gap-1 transition-colors group-hover:text-[var(--color-primary)] cursor-pointer h-full" style={{ color: 'var(--color-text)' }}>
                Components
                <KeyboardArrowDownIcon sx={{ fontSize: 18 }} className="transition-transform duration-200 group-hover:rotate-180" />
              </a>
              
              {/* Mega Menu */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-0 w-[850px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 pt-2 cursor-default">
                <div 
                  className="p-8 shadow-2xl border border-[var(--color-border)]"
                  style={{ 
                    backgroundColor: 'var(--color-bg-secondary)', 
                    borderRadius: 'var(--radius-sm)'
                  }}
                >
                  <h4 className="text-[12px] font-bold tracking-widest text-[#6B7280] mb-6 uppercase">Shop By Category</h4>
                  
                  {/* Grid */}
                  <div className="grid grid-cols-5 gap-4 mb-8">
                    {[
                      { icon: <MemoryIcon sx={{ fontSize: 28, color: '#8B5CF6' }}/>, title: 'CPU', desc: 'Intel & AMD Processors', link: '/components/cpu' },
                      { icon: <VideogameAssetIcon sx={{ fontSize: 28, color: '#3B82F6' }}/>, title: 'GPU', desc: 'NVIDIA & AMD Cards', link: '/components/gpu' },
                      { icon: <DeveloperBoardIcon sx={{ fontSize: 28, color: '#10B981' }}/>, title: 'Motherboard', desc: 'ATX, mATX, ITX', link: '/components/motherboard' },
                      { icon: <MemoryIcon sx={{ fontSize: 28, color: '#F43F5E' }}/>, title: 'RAM', desc: 'DDR4 & DDR5 Memory', link: '/components/ram' },
                      { icon: <SaveIcon sx={{ fontSize: 28, color: '#6366F1' }}/>, title: 'SSD / Storage', desc: 'NVMe, SATA, HDD', link: '/components/storage' },
                      { icon: <BoltIcon sx={{ fontSize: 28, color: '#F59E0B' }}/>, title: 'Power Supply', desc: 'Modular & Semi-Modular', link: '/components/power-supply' },
                      { icon: <ComputerIcon sx={{ fontSize: 28, color: '#06B6D4' }}/>, title: 'Cabinet', desc: 'Mid, Full & Mini Tower', link: '/components/cabinet' },
                      { icon: <AcUnitIcon sx={{ fontSize: 28, color: '#0EA5E9' }}/>, title: 'Cooling', desc: 'Air & Liquid Coolers', link: '/components/cooling' },
                      { icon: <MouseIcon sx={{ fontSize: 28, color: '#8B5CF6' }}/>, title: 'Peripherals', desc: 'Keyboard, Mouse, Headset', link: '/components/peripherals' },
                      { icon: <MonitorIcon sx={{ fontSize: 28, color: '#14B8A6' }}/>, title: 'Monitor', desc: '4K, 144Hz, OLED', link: '/components/monitor' },
                    ].map((item, idx) => (
                      <Link to={item.link} key={idx} className="flex flex-col items-center justify-center p-4 border border-[var(--color-border)] transition-all hover:border-[var(--color-primary)] hover:shadow-md cursor-pointer text-center group/card" style={{ backgroundColor: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                        <div className="mb-2 opacity-80 group-hover/card:opacity-100 group-hover/card:scale-110 transition-transform">{item.icon}</div>
                        <h5 className="text-[13px] font-bold text-[var(--color-text)] mb-1">{item.title}</h5>
                        <p className="text-[11px] text-[var(--color-muted)] leading-tight">{item.desc}</p>
                      </Link>
                    ))}
                  </div>

                  {/* Footer Buttons */}
                  <div className="flex items-center gap-4 border-t border-[var(--color-border)] pt-6">
                    <Link to="/builder" className="flex items-center justify-center text-center gap-2 bg-[var(--color-primary)] text-white font-bold py-2.5 px-6 transition-opacity hover:opacity-90" style={{ borderRadius: 'var(--radius-sm)' }}>
                      <BuildIcon sx={{ fontSize: 18 }} /> Build Custom PC
                    </Link>
                    <Link to="/components" className="bg-transparent text-[var(--color-primary)] border-2 border-[var(--color-primary)] font-bold py-2 px-6 transition-colors hover:bg-[var(--color-primary)] hover:text-white flex items-center justify-center text-center" style={{ borderRadius: 'var(--radius-sm)' }}>
                      View All Components
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <Link to="/builder" className="transition-colors hover:text-[var(--color-primary)] cursor-pointer flex items-center h-full" style={{ color: 'var(--color-text)' }}>PC Builder</Link>
            <Link to="/" className="transition-colors hover:text-[var(--color-primary)] cursor-pointer flex items-center h-full" style={{ color: 'var(--color-text)' }}>Deals</Link>
            <Link to="/" className="transition-colors hover:text-[var(--color-primary)] cursor-pointer flex items-center h-full" style={{ color: 'var(--color-text)' }}>Blog</Link>
          </nav>

          {/* Right: Searchbar & Icons */}
          <div className="flex items-center gap-6">
            {/* Searchbar */}
            <div className="relative hidden md:flex items-center group">
              <input 
                type="text" 
                placeholder="Search products..." 
                className="pl-5 pr-10 py-2 rounded-[var(--radius-sm)] text-[14px] font-medium outline-none transition-all w-[280px] focus:w-[280px] focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-opacity-20 placeholder:text-[var(--color-muted)]"
                style={{
                  backgroundColor: 'var(--color-bg-secondary)',
                  color: 'var(--color-text)',
                  border: '1px solid var(--color-border)'
                }}
              />
              <button 
                className="absolute right-3 p-1 rounded-full transition-colors group-hover:text-[var(--color-primary)] flex items-center justify-center cursor-pointer" 
                style={{ color: 'var(--color-text-secondary)' }}
                aria-label="Search"
              >
                <SearchIcon sx={{ fontSize: 20 }} />
              </button>
            </div>

            {/* Icons */}
            <div className="flex items-center gap-4" style={{ color: 'var(--color-text)' }}>
              <Link to="/wishlist" aria-label="Wishlist" className="hover:text-[var(--color-primary)] transition-colors p-1 flex items-center justify-center cursor-pointer relative">
                <FavoriteBorderIcon sx={{ fontSize: 24 }} />
                {wishlist.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#FF3E6C] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </Link>
              <button aria-label="Cart" className="hover:text-[var(--color-primary)] transition-colors p-1 relative flex items-center justify-center cursor-pointer">
                <ShoppingCartOutlinedIcon sx={{ fontSize: 24 }} />
              </button>
              <button aria-label="Profile" className="hover:text-[var(--color-primary)] transition-colors p-1 ml-1 flex items-center justify-center cursor-pointer">
                <PersonOutlineOutlinedIcon sx={{ fontSize: 26 }} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
