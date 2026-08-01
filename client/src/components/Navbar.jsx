import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import FadeUp from './FadeUp';
import SearchIcon from '@mui/icons-material/Search';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import DesktopWindowsOutlinedIcon from '@mui/icons-material/DesktopWindowsOutlined';
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
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { getProfile } from '../api/auth';
import { getPublicSettings } from '../services/settings.service';
import { searchService } from '../services/search.service';
import { getRecentSearches, addRecentSearch, clearRecentSearches } from '../utils/recentSearches';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import ConfirmationNumberOutlinedIcon from '@mui/icons-material/ConfirmationNumberOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import HeadsetMicOutlinedIcon from '@mui/icons-material/HeadsetMicOutlined';

const RECENT_SEARCHES_KEY = 'rigcraft_recent_searches';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, user, logout } = useAuth();
    
    const handleNavClick = (path) => {
      if (location.pathname === path || (path.split('?')[0] === location.pathname && path.includes('?'))) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    
    const handleMobileNavClick = (path) => {
      if (location.pathname === path || (path.split('?')[0] === location.pathname && path.includes('?'))) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      setMobileMenuOpen(false);
    };
  
  const { data: profileData } = useQuery({
    queryKey: ['profile', user?._id || user?.id],
    queryFn: getProfile,
    enabled: isLoggedIn,
    retry: false
  });

  const firstName = isLoggedIn ? (user?.firstName || profileData?.data?.firstName || 'Customer') : 'Customer';
  const profileText = isLoggedIn ? (user?.firstName || profileData?.data?.firstName || 'Profile') : 'Profile';

  const { data: brandData } = useQuery({
    queryKey: ['publicSettings'],
    queryFn: getPublicSettings,
    staleTime: 300000,
  });
  const brand = brandData?.general;

   const isHome = location.pathname === '/';
   const isPrebuild = location.pathname === '/prebuild';
   const isDeals = location.pathname === '/deals';
   const isBuilder = location.pathname === '/builder';
   const isComponents = location.pathname.startsWith('/components');
  const { wishlist } = useWishlist();
  const { cartItems } = useCart();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({});
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [recentSearches, setRecentSearches] = useState(() => getRecentSearches(RECENT_SEARCHES_KEY));
  const [activeIndex, setActiveIndex] = useState(-1);
  const searchContainerRef = useRef(null);
  const mobileSearchContainerRef = useRef(null);
  const searchRequestIdRef = useRef(0);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) &&
        (mobileSearchContainerRef.current ? !mobileSearchContainerRef.current.contains(event.target) : true)
      ) {
        setShowSearchResults(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      const q = searchQuery.trim();
      if (q.length < 3) {
        setSearchResults({});
        setActiveIndex(-1);
        return;
      }
      const requestId = ++searchRequestIdRef.current;
      setIsSearching(true);
      try {
        const data = await searchService.public(q);
        if (requestId !== searchRequestIdRef.current) return;
        setSearchResults(data || {});
        setActiveIndex(-1);
      } catch (error) {
        if (requestId !== searchRequestIdRef.current) return;
        console.error("Search failed:", error);
        setSearchResults({});
      } finally {
        if (requestId === searchRequestIdRef.current) setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(fetchResults, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const SEARCH_SECTIONS = [
    {
      key: 'products',
      label: 'Products',
      link: (item) => `/detail/${item.slug || item.id}`,
      primary: (item) => item.name,
      secondary: (item) => item.sku,
      price: (item) => item.salePrice || item.price,
      image: (item) => item.image,
      badge: () => 'Product',
    },
    {
      key: 'prebuiltPCs',
      label: 'Prebuilt PCs',
      link: (item) => `/detail/${item.slug || item.id}?type=prebuilt`,
      primary: (item) => item.name,
      secondary: (item) => item.sku,
      price: (item) => item.pricing?.salePrice || item.pricing?.price,
      image: (item) => item.image,
      badge: () => 'Prebuilt PC',
    },
    {
      key: 'categories',
      label: 'Categories',
      link: () => `/components`,
      primary: (item) => item.name,
    },
    {
      key: 'brands',
      label: 'Brands',
      link: (item) => `/components?brand=${encodeURIComponent(item.name)}`,
      primary: (item) => item.name,
    },
    {
      key: 'deals',
      label: 'Deals',
      link: () => `/deals`,
      primary: (item) => item.title,
    },
  ];

  const executeSearch = (term) => {
    const q = (term ?? searchQuery).trim();
    if (!q) return;
    navigate(`/components?search=${encodeURIComponent(q)}`);
    addRecentSearch(RECENT_SEARCHES_KEY, q);
    setRecentSearches(getRecentSearches(RECENT_SEARCHES_KEY));
    setShowSearchResults(false);
    setMobileSearchOpen(false);
    setActiveIndex(-1);
  };

  const handleClearRecents = () => {
    clearRecentSearches(RECENT_SEARCHES_KEY);
    setRecentSearches([]);
    setActiveIndex(-1);
  };

  const buildRows = () => {
    const q = searchQuery.trim();
    const rowsArr = [];
    if (q.length >= 3) {
      SEARCH_SECTIONS.forEach((s) => {
        (searchResults?.[s.key] || []).forEach((item) => {
          rowsArr.push({
            key: `${s.key}-${item.id || item.slug}`,
            action: () => {
              addRecentSearch(RECENT_SEARCHES_KEY, q);
              setRecentSearches(getRecentSearches(RECENT_SEARCHES_KEY));
              setShowSearchResults(false);
              setSearchQuery('');
              setMobileSearchOpen(false);
              setActiveIndex(-1);
              navigate(s.link(item));
            },
          });
        });
      });
      rowsArr.push({
        key: 'view-all',
        action: () => executeSearch(q),
      });
    } else if (recentSearches.length > 0) {
      recentSearches.forEach((term) => {
        rowsArr.push({
          key: `recent-${term}`,
          action: () => executeSearch(term),
        });
      });
    }
    return rowsArr;
  };

  const handleSearchKeyDown = (e) => {
    const rowsArr = buildRows();
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (rowsArr.length === 0) return;
      setActiveIndex((prev) => {
        if (prev === -1) return e.key === 'ArrowDown' ? 0 : rowsArr.length - 1;
        const next = e.key === 'ArrowDown' ? prev + 1 : prev - 1;
        if (next >= rowsArr.length) return 0;
        if (next < 0) return rowsArr.length - 1;
        return next;
      });
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && rowsArr[activeIndex]) {
        e.preventDefault();
        rowsArr[activeIndex].action();
      } else if (searchQuery.trim()) {
        e.preventDefault();
        executeSearch(searchQuery);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setShowSearchResults(false);
      setActiveIndex(-1);
    }
  };

  const renderSearchResults = () => {
    if (!showSearchResults) return null;

    if (!searchQuery.trim()) {
      if (recentSearches.length === 0) return null;
      return (
        <div className="absolute top-full right-0 mt-2 w-full lg:w-[400px] bg-white border border-[var(--color-border)] shadow-xl z-50 overflow-hidden" style={{ borderRadius: 'var(--radius-sm)' }}>
          <div className="px-3 pt-3 pb-1 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wide text-gray-400">Recent searches</span>
            <button onClick={handleClearRecents} className="text-[11px] font-bold text-[var(--color-primary)] hover:underline cursor-pointer">Clear</button>
          </div>
          <div className="max-h-[300px] overflow-y-auto">
            {recentSearches.map((term, idx) => (
              <button
                key={`recent-${term}`}
                onClick={() => executeSearch(term)}
                onMouseEnter={() => setActiveIndex(idx)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors cursor-pointer ${idx === activeIndex ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
              >
                <SearchOutlinedIcon sx={{ fontSize: 16, color: 'var(--color-muted)' }} />
                <span className="text-sm font-medium text-gray-700 truncate">{term}</span>
              </button>
            ))}
          </div>
        </div>
      );
    }

    const groups = SEARCH_SECTIONS
      .map((s) => ({ ...s, items: searchResults?.[s.key] || [] }))
      .filter((g) => g.items.length > 0);
    const hasResults = groups.length > 0;
    const viewAllIndex = groups.reduce((n, g) => n + g.items.length, 0);

    return (
      <div className="absolute top-full right-0 mt-2 w-full lg:w-[400px] bg-white border border-[var(--color-border)] shadow-xl z-50 overflow-hidden" style={{ borderRadius: 'var(--radius-sm)' }}>
        {isSearching ? (
          <div className="p-4 text-center text-sm text-gray-500">Searching...</div>
        ) : hasResults ? (
          <div className="max-h-[400px] overflow-y-auto">
            {(() => {
              let flatIndex = 0;
              return groups.map((group) => (
                <div key={group.key} className="border-b border-gray-100 last:border-0">
                  <div className="px-3 pt-3 pb-1 text-[11px] font-bold uppercase tracking-wide text-gray-400">
                    {group.label}
                  </div>
                  {group.items.map((item) => {
                    const idx = flatIndex++;
                    return (
                      <Link
                        to={group.link(item)}
                        key={`${group.key}-${item.id || item.slug}`}
                        onMouseEnter={() => setActiveIndex(idx)}
                        onClick={() => { addRecentSearch(RECENT_SEARCHES_KEY, searchQuery); setRecentSearches(getRecentSearches(RECENT_SEARCHES_KEY)); setShowSearchResults(false); setSearchQuery(''); setMobileSearchOpen(false); setActiveIndex(-1); }}
                        className={`flex items-center gap-3 px-3 py-2 transition-colors ${idx === activeIndex ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
                      >
                        {group.image && (
                          <div className="w-10 h-10 bg-gray-100 flex-shrink-0 flex items-center justify-center rounded overflow-hidden">
                            {group.image(item) ? (
                              <img src={group.image(item)} alt={group.primary(item)} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-gray-400 text-[9px] font-bold">NO IMG</span>
                            )}
                          </div>
                        )}
                        <div className="flex flex-col flex-1 min-w-0 text-left">
                          <span className="text-sm font-bold text-gray-800 truncate">{group.primary(item)}</span>
                          {group.secondary && (
                            <span className="text-xs text-gray-500 truncate">{group.secondary(item)}</span>
                          )}
                          {group.price && (
                            <span className="text-xs text-[var(--color-primary)] font-bold mt-0.5">
                              ₹{(Number(group.price(item)) || 0).toLocaleString()}
                            </span>
                          )}
                        </div>
                        {group.badge && (
                          <div className="flex-shrink-0 hidden sm:block">
                            <span className="text-[10px] font-bold px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                              {group.badge(item)}
                            </span>
                          </div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              ));
            })()}
            <button
              onClick={() => executeSearch(searchQuery)}
              onMouseEnter={() => setActiveIndex(viewAllIndex)}
              className={`block w-full text-center p-3 text-sm font-bold transition-colors cursor-pointer ${viewAllIndex === activeIndex ? 'bg-[var(--color-primary)] text-white' : 'text-[var(--color-primary)] bg-gray-50 hover:bg-[var(--color-primary)] hover:text-white'}`}
            >
              View all results
            </button>
          </div>
        ) : (
          <div className="p-4 text-center text-sm text-gray-500">No results found for "{searchQuery}"</div>
        )}
      </div>
    );
  };
  
  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
    setMobileMenuOpen(false); // Close mobile menu if open
  };

  return (
    <>
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="sticky top-0 z-50 flex flex-col w-full"
    >
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
              type="button"
              className="lg:hidden p-1 -ml-2 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={mobileMenuOpen}
              style={{ color: 'var(--color-text)' }}
            >
              <MenuIcon sx={{ fontSize: 28 }} />
            </button>
            <Link to="/" className="flex items-center cursor-pointer gap-2 text-2xl font-black tracking-tight hover:opacity-80 transition-opacity" style={{ color: 'var(--color-text)' }}>
              {brand?.logo?.url ? (
                <img src={brand.logo.url} alt={brand.storeName || 'RigCraft'} className="w-8 h-8 object-contain" />
              ) : (
                <PrecisionManufacturingIcon sx={{ fontSize: 32, color: 'var(--color-primary)' }} />
              )}
              <span style={{ color: 'var(--color-primary)' }}>{(brand?.storeName || 'RigCraft').slice(0, 3)}</span>{(brand?.storeName || 'RigCraft').slice(3)}
            </Link>
          </div>
          {/* Center: Links */}
          <nav className="hidden lg:flex items-center gap-8 font-semibold text-[15px] h-full">
            <Link to="/" onClick={() => handleNavClick('/')} className={`transition-colors cursor-pointer flex items-center h-full ${isHome ? 'underline decoration-2 underline-offset-8' : 'hover:text-[var(--color-primary)]'}`} style={{ color: isHome ? 'var(--color-primary)' : 'var(--color-text)', textDecorationColor: 'var(--color-primary)' }}>Home</Link>
            <Link to="/prebuild" onClick={() => handleNavClick('/prebuild')} className={`transition-colors cursor-pointer flex items-center h-full ${isPrebuild ? 'underline decoration-2 underline-offset-8' : 'hover:text-[var(--color-primary)]'}`} style={{ color: isPrebuild ? 'var(--color-primary)' : 'var(--color-text)', textDecorationColor: 'var(--color-primary)' }}>Prebuild</Link>
            
            {/* Components Dropdown */}
            <div className="relative group h-full flex items-center">
              <button
                type="button"
                className={`flex items-center gap-1 transition-colors group-hover:text-[var(--color-primary)] focus-within:text-[var(--color-primary)] cursor-pointer h-full ${isComponents ? 'underline decoration-2 underline-offset-8' : ''}`}
                style={{ color: isComponents ? 'var(--color-primary)' : 'var(--color-text)', textDecorationColor: 'var(--color-primary)' }}
              >
                Components
                 <KeyboardArrowDownIcon sx={{ fontSize: 18 }} className="transition-transform duration-200 group-hover:rotate-180" />
              </button>
              
              {/* Mega Menu */}
                 <div className="absolute top-full left-1/2 -translate-x-1/2 mt-0 w-[850px] opacity-0 invisible group-hover:opacity-100 group-hover:visible focus-within:opacity-100 focus-within:visible transition-all duration-300 z-50 pt-2 cursor-default">
                <div 
                  className="p-8 shadow-2xl border border-[var(--color-border)]"
                  style={{ 
                    backgroundColor: 'var(--color-bg-primary)', 
                    borderRadius: 'var(--radius-sm)'
                  }}
                >
                  <h4 className="text-[12px] font-bold tracking-widest text-[#6B7280] mb-6 uppercase">Shop By Category</h4>
                  
                  {/* Grid */}
                  <div className="grid grid-cols-5 gap-4 mb-8">
                    {[
                      { icon: <MemoryIcon sx={{ fontSize: 28, color: '#8B5CF6' }}/>, title: 'CPU', desc: 'Intel & AMD Processors', link: '/components/Processor(CPU)' },
                      { icon: <VideogameAssetIcon sx={{ fontSize: 28, color: '#3B82F6' }}/>, title: 'GPU', desc: 'NVIDIA & AMD Cards', link: '/components/Graphics card (GPU)' },
                      { icon: <DeveloperBoardIcon sx={{ fontSize: 28, color: '#10B981' }}/>, title: 'Motherboard', desc: 'ATX, mATX, ITX', link: '/components/motherboard' },
                      { icon: <MemoryIcon sx={{ fontSize: 28, color: '#F43F5E' }}/>, title: 'RAM', desc: 'DDR4 & DDR5 Memory', link: '/components/Memory(RAM)' },
                      { icon: <SaveIcon sx={{ fontSize: 28, color: '#6366F1' }}/>, title: 'SSD / Storage', desc: 'NVMe, SATA, HDD', link: '/components/storage' },
                      { icon: <BoltIcon sx={{ fontSize: 28, color: '#F59E0B' }}/>, title: 'Power Supply', desc: 'Modular & Semi-Modular', link: '/components/power supply (PSU)' },
                      { icon: <ComputerIcon sx={{ fontSize: 28, color: '#06B6D4' }}/>, title: 'Cabinet', desc: 'Mid, Full & Mini Tower', link: '/components/Computer case' },
                      { icon: <AcUnitIcon sx={{ fontSize: 28, color: '#0EA5E9' }}/>, title: 'Cooling', desc: 'Air & Liquid Coolers', link: '/components/Cooling' },
                      { icon: <MouseIcon sx={{ fontSize: 28, color: '#8B5CF6' }}/>, title: 'Peripherals', desc: 'Keyboard, Mouse, Headset', link: '/components/Accessories' },
                      { icon: <MonitorIcon sx={{ fontSize: 28, color: '#14B8A6' }}/>, title: 'Software', desc: 'Windows/Linux', link: '/components/Software' },
                    ].map((item, idx) => (
                      <Link to={item.link} onClick={() => handleNavClick(item.link)} key={idx} className="flex flex-col items-center justify-center p-4 border border-[var(--color-border)] transition-all hover:border-[var(--color-primary)] hover:shadow-md cursor-pointer text-center group/card" style={{ backgroundColor: 'var(--color-bg-primary)', borderRadius: 'var(--radius-sm)' }}>
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

            <Link to="/builder" onClick={() => handleNavClick('/builder')} className={`transition-colors cursor-pointer flex items-center h-full ${isBuilder ? 'underline decoration-2 underline-offset-8' : 'hover:text-[var(--color-primary)]'}`} style={{ color: isBuilder ? 'var(--color-primary)' : 'var(--color-text)', textDecorationColor: 'var(--color-primary)' }}>PC Builder</Link>
            <Link to="/deals" onClick={() => handleNavClick('/deals')} className={`transition-colors cursor-pointer flex items-center h-full ${isDeals ? 'underline decoration-2 underline-offset-8' : 'hover:text-[var(--color-primary)]'}`} style={{ color: isDeals ? 'var(--color-primary)' : 'var(--color-text)', textDecorationColor: 'var(--color-primary)' }}>Deals</Link>
          </nav>

          {/* Right: Searchbar & Icons */}
          <div className="flex items-center gap-6">
            {/* Searchbar Desktop */}
            <div className="relative hidden lg:flex items-center group" ref={searchContainerRef}>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setActiveIndex(-1); setShowSearchResults(true); }}
                onFocus={() => { if (searchQuery || recentSearches.length > 0) setShowSearchResults(true); }}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search products..." 
                className="pl-5 pr-10 py-2 rounded-[var(--radius-sm)] text-[14px] font-medium outline-none transition-all w-[280px] focus:w-[280px] focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-opacity-20 placeholder:text-[var(--color-muted)]"
                style={{
                  backgroundColor: 'var(--color-bg-secondary)',
                  color: 'var(--color-text)',
                  border: '1px solid var(--color-border)'
                }}
              />
              <button 
                onClick={() => executeSearch(searchQuery)}
                className="absolute right-3 p-1 rounded-full transition-colors group-hover:text-[var(--color-primary)] flex items-center justify-center cursor-pointer" 
                style={{ color: 'var(--color-text-secondary)' }}
                aria-label="Search"
              >
                <SearchIcon sx={{ fontSize: 20 }} />
              </button>
              
              {renderSearchResults()}
            </div>

            {/* Icons */}
            <div className="flex items-center gap-4 sm:gap-6" style={{ color: 'var(--color-text)' }}>
              
              {/* Mobile Search Icon */}
              <button 
                type="button"
                className="lg:hidden relative flex flex-col items-center justify-center cursor-pointer hover:text-[var(--color-primary)] transition-colors h-full pb-1 pt-1"
                onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
                aria-label="Search"
                aria-expanded={mobileSearchOpen}
              >
                <SearchIcon sx={{ fontSize: 24 }} />
                <span className="hidden md:block text-[12px] font-bold mt-0.5">Search</span>
              </button>

              {/* Profile (Desktop Only) */}
              <div className="relative group hidden lg:flex flex-col items-center justify-center cursor-pointer hover:text-[var(--color-primary)] focus-within:text-[var(--color-primary)] transition-colors h-full pb-1 pt-1"
                role="button"
                tabIndex={0}
                aria-haspopup="menu"
              >
                <PersonOutlineOutlinedIcon sx={{ fontSize: 24 }} />
                <span className="text-[12px] font-bold mt-0.5">{isLoggedIn ? profileText : 'Profile'}</span>
                <span className="sr-only">Open account menu</span>
                
                {/* Profile Hover Dropdown */}
                <div className="absolute top-full right-[-50px] mt-0 w-[300px] opacity-0 invisible group-hover:opacity-100 group-hover:visible focus-within:opacity-100 focus-within:visible transition-all duration-300 z-50 pt-2 cursor-default shadow-2xl">
                 <div className="bg-white border border-[#E2E8F0] shadow-2xl py-2 text-left" style={{ borderRadius: 'var(--radius-sm)' }}>
                     {!isLoggedIn && (
                       <div className="px-5 py-3 border-b border-[#E2E8F0] flex justify-between items-center">
                         <span className="text-[14px] font-semibold text-[#0F172A]">New Customer?</span>
                         <Link
                           to="/login"
                           onClick={() => setShowSearchResults(false)}
                           className="text-[var(--color-primary)] text-[14px] font-bold cursor-pointer hover:underline"
                         >
                           Sign Up / Sign In
                         </Link>
                       </div>
                     )}
                     {isLoggedIn && (
                       <div className="px-5 py-3 text-[14px] font-bold text-[#64748B]">
                         Your Account
                       </div>
                     )}

                     <ul className="flex flex-col text-[14px] text-[#334155] font-medium pb-2">
                       {isLoggedIn && (
                         <>
                           <li className="mx-2 my-0.5">
                             <Link to="/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-sm hover:bg-gradient-to-r hover:from-[#E8F4FF] hover:to-transparent hover:text-[var(--color-primary)] transition-all cursor-pointer group/item">
                               <PersonOutlineOutlinedIcon fontSize="small" className="text-[var(--color-primary)] opacity-80 group-hover/item:opacity-100" />
                               My Profile
                             </Link>
                           </li>
                           <li className="mx-2 my-0.5">
                             <Link to="/profile?tab=builds" className="flex items-center gap-3 px-3 py-2.5 rounded-sm hover:bg-gradient-to-r hover:from-[#E8F4FF] hover:to-transparent hover:text-[var(--color-primary)] transition-all cursor-pointer group/item">
                               <DesktopWindowsOutlinedIcon fontSize="small" className="text-[var(--color-primary)] opacity-80 group-hover/item:opacity-100" />
                               Your Build
                             </Link>
                           </li>
                         </>
                       )}
                       <li className="mx-2 my-0.5">
                         <Link to="/orders" className="flex items-center gap-3 px-3 py-2.5 rounded-sm hover:bg-gradient-to-r hover:from-[#E8F4FF] hover:to-transparent hover:text-[var(--color-primary)] transition-all cursor-pointer group/item">
                           <Inventory2OutlinedIcon fontSize="small" className="text-[var(--color-primary)] opacity-80 group-hover/item:opacity-100" />
                           Orders
                         </Link>
                       </li>
                       <li className="mx-2 my-0.5">
                         <Link to="/profile?tab=coupons" className="flex items-center gap-3 px-3 py-2.5 rounded-sm hover:bg-gradient-to-r hover:from-[#E8F4FF] hover:to-transparent hover:text-[var(--color-primary)] transition-all cursor-pointer group/item">
                           <ConfirmationNumberOutlinedIcon fontSize="small" className="text-[var(--color-primary)] opacity-80 group-hover/item:opacity-100" />
                           Coupons
                         </Link>
                       </li>
                       <li className="mx-2 my-0.5">
                         <Link to="/profile?tab=addresses" className="flex items-center gap-3 px-3 py-2.5 rounded-sm hover:bg-gradient-to-r hover:from-[#E8F4FF] hover:to-transparent hover:text-[var(--color-primary)] transition-all cursor-pointer group/item">
                           <LocationOnOutlinedIcon fontSize="small" className="text-[var(--color-primary)] opacity-80 group-hover/item:opacity-100" />
                           Saved Addresses
                         </Link>
                       </li>
                       <li className="mx-2 my-0.5">
                         <Link to="/wishlist" className="flex items-center gap-3 px-3 py-2.5 rounded-sm hover:bg-gradient-to-r hover:from-[#E8F4FF] hover:to-transparent hover:text-[var(--color-primary)] transition-all cursor-pointer group/item">
                           <FavoriteBorderIcon fontSize="small" className="text-[var(--color-primary)] opacity-80 group-hover/item:opacity-100" />
                           Wishlist
                         </Link>
                       </li>
                       <li className="mx-2 my-0.5">
                         <Link to="/contact" className="flex items-center gap-3 px-3 py-2.5 rounded-sm hover:bg-gradient-to-r hover:from-[#E8F4FF] hover:to-transparent hover:text-[var(--color-primary)] transition-all cursor-pointer group/item">
                           <HeadsetMicOutlinedIcon fontSize="small" className="text-[var(--color-primary)] opacity-80 group-hover/item:opacity-100" />
                           Contact Us
                         </Link>
                       </li>
                       {isLoggedIn && (
                         <>
                           <div className="border-t border-[#E2E8F0] my-1 mx-2"></div>
                           <li className="mx-2 my-0.5">
                             <button
                               type="button"
                               onClick={handleLogoutClick}
                               className="w-full flex items-center gap-3 px-3 py-2.5 rounded-sm hover:bg-gradient-to-r hover:from-red-50 hover:to-transparent hover:text-red-600 transition-all cursor-pointer text-[#334155] group/item"
                             >
                               <LogoutOutlinedIcon fontSize="small" className="text-[#64748B] opacity-80 group-hover/item:text-red-600 group-hover/item:opacity-100" />
                               Logout
                             </button>
                           </li>
                         </>
                       )}
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

      {/* Mobile Search Bar Dropdown */}
      {mobileSearchOpen && (
        <div className="lg:hidden w-full bg-white border-b border-[var(--color-border)] p-4 absolute top-full left-0 z-40 shadow-md">
          <div className="relative flex items-center" ref={mobileSearchContainerRef}>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setActiveIndex(-1); setShowSearchResults(true); }}
              onFocus={() => { if (searchQuery || recentSearches.length > 0) setShowSearchResults(true); }}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search products..." 
              className="w-full pl-4 pr-10 py-2.5 rounded-[var(--radius-sm)] text-[14px] font-medium outline-none border border-[var(--color-border)] focus:border-[var(--color-primary)] bg-[var(--color-bg-secondary)] text-black placeholder-gray-500"
            />
            <button 
              onClick={() => executeSearch(searchQuery)}
              className="absolute right-3 p-1 text-[var(--color-text-secondary)]"
            >
              <SearchIcon sx={{ fontSize: 20 }} />
            </button>
            
            {renderSearchResults()}
          </div>
        </div>
      )}
    </motion.header>

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
                <span style={{ color: 'var(--color-primary)' }}>{(brand?.storeName || 'RigCraft').slice(0, 3)}</span>{(brand?.storeName || 'RigCraft').slice(3)}
              </span>
              <button 
                className="p-2 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => setMobileMenuOpen(false)}
              >
                <CloseIcon />
              </button>
            </div>
            
            <nav className="flex flex-col p-4 gap-2">
              <Link to="/" onClick={() => handleMobileNavClick('/')} className="text-[16px] font-bold p-3 rounded-md hover:bg-[var(--color-bg-secondary)] transition-colors" style={{ color: isHome ? 'var(--color-primary)' : 'var(--color-text)' }}>Home</Link>
              <Link to="/prebuild" onClick={() => handleMobileNavClick('/prebuild')} className="text-[16px] font-bold p-3 rounded-md hover:bg-[var(--color-bg-secondary)] transition-colors" style={{ color: isPrebuild ? 'var(--color-primary)' : 'var(--color-text)' }}>Prebuilds</Link>
              <Link to="/components" onClick={() => handleMobileNavClick('/components')} className="text-[16px] font-bold p-3 rounded-md hover:bg-[var(--color-bg-secondary)] transition-colors" style={{ color: 'var(--color-text)' }}>Components</Link>
              <Link to="/builder" onClick={() => handleMobileNavClick('/builder')} className="text-[16px] font-bold p-3 rounded-md hover:bg-[var(--color-bg-secondary)] transition-colors" style={{ color: 'var(--color-text)' }}>PC Builder</Link>
              <Link to="/deals" onClick={() => handleMobileNavClick('/deals')} className="text-[16px] font-bold p-3 rounded-md hover:bg-[var(--color-bg-secondary)] transition-colors" style={{ color: isDeals ? 'var(--color-primary)' : 'var(--color-text)' }}>Deals</Link>
            </nav>

            {/* Mobile User Icons */}
            <div className="flex flex-col px-4 mt-2 gap-2 pb-4">
              <div className="text-[12px] font-bold text-[var(--color-muted)] uppercase tracking-wider mb-2">My Account</div>
              <Link to="/profile" onClick={() => handleMobileNavClick('/profile')} className="flex items-center gap-3 text-[16px] font-bold p-3 rounded-md hover:bg-[var(--color-bg-secondary)] transition-colors cursor-pointer text-[var(--color-text)]">
                <PersonOutlineOutlinedIcon />
                {isLoggedIn ? profileText : 'Profile'}
              </Link>
              <Link to="/wishlist" onClick={() => handleMobileNavClick('/wishlist')} className="flex items-center justify-between text-[16px] font-bold p-3 rounded-md hover:bg-[var(--color-bg-secondary)] transition-colors cursor-pointer text-[var(--color-text)]">
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
              <Link to="/cart" onClick={() => handleMobileNavClick('/cart')} className="flex items-center justify-between text-[16px] font-bold p-3 rounded-md hover:bg-[var(--color-bg-secondary)] transition-colors cursor-pointer text-[var(--color-text)]">
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
              {isLoggedIn ? (
                <div className="flex flex-col gap-3">
                  <div className="text-[16px] font-bold text-center text-[var(--color-text)]">
                     Hi, welcome back {firstName}
                  </div>
                  <button 
                    onClick={handleLogoutClick}
                    className="w-full flex items-center justify-center gap-2 bg-red-600 text-white font-bold py-3 rounded-sm cursor-pointer hover:bg-red-700 transition-colors shadow-md"
                  >
                    <LogoutOutlinedIcon fontSize="small" />
                    LOGOUT
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => {
                    navigate('/login');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full bg-[var(--color-primary)] text-white font-bold py-3 rounded-sm cursor-pointer hover:opacity-90 transition-opacity"
                >
                  LOGIN / SIGNUP
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <FadeUp>
            <div className="bg-white rounded-md p-6 max-w-sm w-full shadow-2xl">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Logout</h3>
              <p className="text-gray-600 mb-6 text-sm">Are you sure you want to log out of your account?</p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-2.5 font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-sm transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    logout();
                    setShowLogoutConfirm(false);
                  }}
                  className="flex-1 py-2.5 font-bold text-white bg-red-600 hover:bg-red-700 rounded-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <LogoutOutlinedIcon fontSize="small" />
                  Confirm
                </button>
              </div>
            </div>
          </FadeUp>
        </div>
      )}
    </>
  );
};

export default Navbar;
