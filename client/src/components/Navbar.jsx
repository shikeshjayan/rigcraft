import React from 'react';
import SearchIcon from '@mui/icons-material/Search';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';

const Navbar = () => {
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
          <a href="/" className="flex items-center cursor-pointer text-2xl font-black tracking-tight hover:opacity-80 transition-opacity" style={{ color: 'var(--color-text)' }}>
            <span style={{ color: 'var(--color-primary)' }}>Rig</span>Craft
          </a>

          {/* Center: Links */}
          <nav className="hidden lg:flex items-center gap-8 font-semibold text-[15px]">
            <a href="#" className="transition-colors underline decoration-2 underline-offset-8 cursor-pointer" style={{ color: 'var(--color-primary)', textDecorationColor: 'var(--color-primary)' }}>Home</a>
            <a href="#" className="transition-colors hover:text-[var(--color-primary)] cursor-pointer" style={{ color: 'var(--color-text)' }}>Prebuild</a>
            <a href="#" className="transition-colors hover:text-[var(--color-primary)] cursor-pointer" style={{ color: 'var(--color-text)' }}>Components</a>
            <a href="#" className="transition-colors hover:text-[var(--color-primary)] cursor-pointer" style={{ color: 'var(--color-text)' }}>PC Builder</a>
            <a href="#" className="transition-colors hover:text-[var(--color-primary)] cursor-pointer" style={{ color: 'var(--color-text)' }}>Deals</a>
            <a href="#" className="transition-colors hover:text-[var(--color-primary)] cursor-pointer" style={{ color: 'var(--color-text)' }}>Blog</a>
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
              <button aria-label="Wishlist" className="hover:text-[var(--color-primary)] transition-colors p-1 flex items-center justify-center cursor-pointer">
                <FavoriteBorderIcon sx={{ fontSize: 24 }} />
              </button>
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
