import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import FadeUp from './FadeUp';
import SearchIcon from '@mui/icons-material/Search';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
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
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const isPrebuild = location.pathname === '/prebuild';
  const isDeals = location.pathname === '/deals';
  const isBuilder = location.pathname === '/builder';
  const { wishlist } = useWishlist();
  const { cartItems } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  return (
    <>
    <header className="sticky top-0 z-50 flex flex-col w-full">
      <FadeUp delay={0.1}>
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
      <div className="relative w-full h-[60px] md:h-[75px] flex items-center">
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
          {/* Left: Hamburger & Logo */}
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-1 -ml-2 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
              onClick={() => setMobileMenuOpen(true)}
              style={{ color: 'var(--color-text)' }}
            >
              <MenuIcon sx={{ fontSize: 28 }} />
            </button>
            <Link to="/" className="flex items-center cursor-pointer text-2xl font-black tracking-tight hover:opacity-80 transition-opacity" style={{ color: 'var(--color-text)' }}>
              <span style={{ color: 'var(--color-primary)' }}>Rig</span>Craft
            </Link>
          </div>



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

            <Link to="/builder" className={`transition-colors cursor-pointer flex items-center h-full ${isBuilder ? 'underline decoration-2 underline-offset-8' : 'hover:text-[var(--color-primary)]'}`} style={{ color: isBuilder ? 'var(--color-primary)' : 'var(--color-text)', textDecorationColor: 'var(--color-primary)' }}>PC Builder</Link>
            <Link to="/deals" className={`transition-colors cursor-pointer flex items-center h-full ${isDeals ? 'underline decoration-2 underline-offset-8' : 'hover:text-[var(--color-primary)]'}`} style={{ color: isDeals ? 'var(--color-primary)' : 'var(--color-text)', textDecorationColor: 'var(--color-primary)' }}>Deals</Link>
          </nav>

          {/* Right: Searchbar & Icons */}
          <div className="flex items-center gap-6">
            {/* Searchbar Desktop */}
            <div className="relative hidden lg:flex items-center group">
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
            <div className="flex items-center gap-4 sm:gap-6" style={{ color: 'var(--color-text)' }}>
              
              {/* Mobile Search Icon */}
              <button 
                className="lg:hidden relative flex flex-col items-center justify-center cursor-pointer hover:text-[var(--color-primary)] transition-colors h-full pb-1 pt-1"
                onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              >
                <SearchIcon sx={{ fontSize: 24 }} />
                <span className="hidden md:block text-[12px] font-bold mt-0.5">Search</span>
              </button>

              {/* Profile (Desktop Only) */}
              <div className="relative group hidden lg:flex flex-col items-center justify-center cursor-pointer hover:text-[var(--color-primary)] transition-colors h-full pb-1 pt-1">
                <PersonOutlineOutlinedIcon sx={{ fontSize: 24 }} />
                <span className="text-[12px] font-bold mt-0.5">Profile</span>
                
                {/* Profile Hover Dropdown */}
                <div className="absolute top-full right-[-50px] mt-0 w-[300px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 pt-2 cursor-default shadow-2xl">
                  <div className="bg-white border border-[#E2E8F0] p-6 text-left" style={{ borderRadius: 'var(--radius-sm)' }}>
                    <h4 className="text-[15px] font-extrabold text-[#0F172A] mb-1">Welcome</h4>
                    <p className="text-[13px] text-[#64748B] mb-5">To access account and manage orders</p>
                    <button className="text-[var(--color-primary)] text-[13px] font-bold border border-[var(--color-primary)] py-2.5 px-6 rounded-sm transition-colors cursor-pointer mb-3 hover:bg-[#FDF2F2]">
                      LOGIN / SIGNUP
                    </button>
                    <div className="border-t border-[#E2E8F0] my-3 -mx-6"></div>
                    <ul className="flex flex-col text-[14px] text-[#334155] space-y-3 py-1 font-medium">
                      <li className="hover:text-[var(--color-primary)] hover:font-bold transition-all cursor-pointer">Orders</li>
                      <li className="hover:text-[var(--color-primary)] hover:font-bold transition-all cursor-pointer">Wishlist</li>
                      <li className="hover:text-[var(--color-primary)] hover:font-bold transition-all cursor-pointer">Contact Us</li>
                    </ul>
                    <div className="border-t border-[#E2E8F0] my-3 -mx-6"></div>
                    <ul className="flex flex-col text-[14px] text-[#334155] space-y-3 py-1 font-medium">
                      <li className="hover:text-[var(--color-primary)] hover:font-bold transition-all cursor-pointer">Coupons</li>
                      <li className="hover:text-[var(--color-primary)] hover:font-bold transition-all cursor-pointer">Saved Cards</li>
                      <li className="hover:text-[var(--color-primary)] hover:font-bold transition-all cursor-pointer">Saved Addresses</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Wishlist (Desktop Only) */}
              <Link to="/wishlist" aria-label="Wishlist" className="hidden lg:flex hover:text-[var(--color-primary)] transition-colors flex-col items-center justify-center cursor-pointer relative pb-1 pt-1">
                <div className="relative">
                  <FavoriteBorderIcon sx={{ fontSize: 24 }} />
                  {wishlist.length > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-[#FF3E6C] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {wishlist.length}
                    </span>
                  )}
                </div>
                <span className="text-[12px] font-bold mt-0.5">Wishlist</span>
              </Link>
              
              {/* Cart (Desktop Only) */}
              <Link to="/cart" aria-label="Cart" className="hidden lg:flex hover:text-[var(--color-primary)] transition-colors flex-col items-center justify-center cursor-pointer relative pb-1 pt-1">
                <div className="relative">
                  <ShoppingCartOutlinedIcon sx={{ fontSize: 24 }} />
                  {cartItems.length > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-[#FF3E6C] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {cartItems.length}
                    </span>
                  )}
                </div>
                <span className="text-[12px] font-bold mt-0.5">Cart</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
      </FadeUp>

      {/* Mobile Search Bar Dropdown */}
      {mobileSearchOpen && (
        <div className="lg:hidden w-full bg-white border-b border-[var(--color-border)] p-4 absolute top-full left-0 z-40 shadow-md">
          <div className="relative flex items-center">
            <input 
              type="text" 
              placeholder="Search products..." 
              className="w-full pl-4 pr-10 py-2.5 rounded-[var(--radius-sm)] text-[14px] font-medium outline-none border border-[var(--color-border)] focus:border-[var(--color-primary)] bg-[var(--color-bg-secondary)] text-black placeholder-gray-500"
            />
            <button className="absolute right-3 p-1 text-[var(--color-text-secondary)]">
              <SearchIcon sx={{ fontSize: 20 }} />
            </button>
          </div>
        </div>
      )}

    </header>

      {/* Mobile Slide-out Menu - Moved OUTSIDE header to fix sticky transform stacking context issue */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden flex">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
            onClick={() => setMobileMenuOpen(false)}
          ></div>
          
          {/* Drawer */}
          <div className="relative w-[300px] h-full bg-[var(--color-bg-primary)] shadow-2xl flex flex-col overflow-y-auto transform transition-transform">
            <div className="p-4 flex items-center justify-between border-b border-[var(--color-border)]">
              <span className="text-xl font-black" style={{ color: 'var(--color-text)' }}>
                <span style={{ color: 'var(--color-primary)' }}>Rig</span>Craft
              </span>
              <button 
                className="p-2 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => setMobileMenuOpen(false)}
              >
                <CloseIcon />
              </button>
            </div>
            
            <nav className="flex flex-col p-4 gap-2">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="text-[16px] font-bold p-3 rounded-md hover:bg-[var(--color-bg-secondary)] transition-colors" style={{ color: isHome ? 'var(--color-primary)' : 'var(--color-text)' }}>Home</Link>
              <Link to="/prebuild" onClick={() => setMobileMenuOpen(false)} className="text-[16px] font-bold p-3 rounded-md hover:bg-[var(--color-bg-secondary)] transition-colors" style={{ color: isPrebuild ? 'var(--color-primary)' : 'var(--color-text)' }}>Prebuilds</Link>
              <Link to="/components" onClick={() => setMobileMenuOpen(false)} className="text-[16px] font-bold p-3 rounded-md hover:bg-[var(--color-bg-secondary)] transition-colors" style={{ color: 'var(--color-text)' }}>Components</Link>
              <Link to="/builder" onClick={() => setMobileMenuOpen(false)} className="text-[16px] font-bold p-3 rounded-md hover:bg-[var(--color-bg-secondary)] transition-colors" style={{ color: 'var(--color-text)' }}>PC Builder</Link>
              <Link to="/deals" onClick={() => setMobileMenuOpen(false)} className="text-[16px] font-bold p-3 rounded-md hover:bg-[var(--color-bg-secondary)] transition-colors" style={{ color: isDeals ? 'var(--color-primary)' : 'var(--color-text)' }}>Deals</Link>
            </nav>

            {/* Mobile User Icons */}
            <div className="flex flex-col px-4 mt-2 gap-2 pb-4">
              <div className="text-[12px] font-bold text-[var(--color-muted)] uppercase tracking-wider mb-2">My Account</div>
              <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 text-[16px] font-bold p-3 rounded-md hover:bg-[var(--color-bg-secondary)] transition-colors cursor-pointer text-[var(--color-text)]">
                <PersonOutlineOutlinedIcon />
                Profile
              </Link>
              <Link to="/wishlist" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between text-[16px] font-bold p-3 rounded-md hover:bg-[var(--color-bg-secondary)] transition-colors cursor-pointer text-[var(--color-text)]">
                <div className="flex items-center gap-3">
                  <FavoriteBorderIcon />
                  Wishlist
                </div>
                {wishlist.length > 0 && (
                  <span className="bg-[#FF3E6C] text-white text-[12px] font-bold w-6 h-6 rounded-full flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </Link>
              <Link to="/cart" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between text-[16px] font-bold p-3 rounded-md hover:bg-[var(--color-bg-secondary)] transition-colors cursor-pointer text-[var(--color-text)]">
                <div className="flex items-center gap-3">
                  <ShoppingCartOutlinedIcon />
                  Cart
                </div>
                {cartItems.length > 0 && (
                  <span className="bg-[#FF3E6C] text-white text-[12px] font-bold w-6 h-6 rounded-full flex items-center justify-center">
                    {cartItems.length}
                  </span>
                )}
              </Link>
            </div>
            
            <div className="mt-auto p-4 border-t border-[var(--color-border)]">
              <button className="w-full bg-[var(--color-primary)] text-white font-bold py-3 rounded-sm cursor-pointer hover:opacity-90">
                LOGIN / SIGNUP
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
