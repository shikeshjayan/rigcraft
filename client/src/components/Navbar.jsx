import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SearchIcon from '@mui/icons-material/Search';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { getProfile } from '../api/auth';
import { getPublicSettings } from '../services/settings.service';
import { useSearch } from '../hooks/useSearch';
import apiClient from '../api/client';
import SearchBar from './Navbar/SearchBar';
import MegaMenu from './Navbar/MegaMenu';
import ProfileMenu from './Navbar/ProfileMenu';
import MobileDrawer from './Navbar/MobileDrawer';
import ConfirmDialog from './Navbar/ConfirmDialog';

const BANNER_KEY = 'rigcraft_banner_dismissed';

const Navbar = () => {
  const location = useLocation();
  const { isLoggedIn, user, logout } = useAuth();
  const { wishlist } = useWishlist();
  const { cartItems } = useCart();
  const search = useSearch();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(() => {
    try {
      return localStorage.getItem(BANNER_KEY) !== '1';
    } catch {
      return true;
    }
  });

  const { data: profileData } = useQuery({
    queryKey: ['profile', user?._id || user?.id],
    queryFn: getProfile,
    enabled: isLoggedIn,
    retry: false,
  });

  const { data: brandData } = useQuery({
    queryKey: ['publicSettings'],
    queryFn: getPublicSettings,
    staleTime: 300000,
  });
  const brand = brandData?.general;

  const firstName = isLoggedIn ? (user?.firstName || profileData?.data?.firstName || 'Customer') : 'Customer';
  const profileText = isLoggedIn ? (user?.firstName || profileData?.data?.firstName || 'Profile') : 'Profile';

  const isHome = location.pathname === '/';
  const isPrebuild = location.pathname === '/prebuild';
  const isDeals = location.pathname === '/deals';
  const isBuilder = location.pathname === '/builder';
  const isComponents = location.pathname.startsWith('/components');

  const wishlistCount = wishlist.length;
  const cartCount = cartItems.reduce((sum, item) => sum + (item.qty || 1), 0);

  const handleNavClick = (path) => {
    if (location.pathname === path) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
    setMobileMenuOpen(false);
    search.setMobileSearchOpen(false);
  };

  const closeMobileOverlays = () => {
    setMobileMenuOpen(false);
    search.setMobileSearchOpen(false);
  };

  const dismissBanner = () => {
    setBannerVisible(false);
    try {
      localStorage.setItem(BANNER_KEY, '1');
    } catch {
      // storage unavailable — ignore
    }
  };

  const storeName = brand?.storeName || 'RigCraft';
  const brandText = (
    <>
      <span style={{ color: 'var(--color-primary)' }}>{storeName.slice(0, 3)}</span>{storeName.slice(3)}
    </>
  );

  const formatCount = (n) => (n > 99 ? '99+' : n);

  const { data: promotionsData } = useQuery({
    queryKey: ['promotions'],
    queryFn: async () => {
      const res = await apiClient.get('/deals/promotions');
      return res.data;
    },
    staleTime: 300000,
  });

  const announcements = (promotionsData?.data || [])
    .flatMap((deal) =>
      (deal.promotion?.topBar || [])
        .filter((t) => t.enabled && t.text)
        .map((t) => t.text)
    );

  const [announcementIndex, setAnnouncementIndex] = useState(0);

  useEffect(() => {
    if (announcements.length <= 1) return;
    const id = setInterval(() => {
      setAnnouncementIndex((i) => (i + 1) % announcements.length);
    }, 5000);
    return () => clearInterval(id);
  }, [announcements.length]);

  const currentAnnouncement =
    announcements.length > 0 ? announcements[announcementIndex % announcements.length] : null;

  const navLinkClass = (active) =>
    `transition-colors cursor-pointer flex items-center h-full ${active ? 'underline decoration-2 underline-offset-8' : 'hover:text-[var(--color-primary)]'}`;
  const navLinkStyle = (active) => ({
    color: active ? 'var(--color-primary)' : 'var(--color-text)',
    textDecorationColor: 'var(--color-primary)',
  });

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
        className="sticky top-0 z-50 flex flex-col w-full"
      >
        {/* Announcement Top Bar */}
        {bannerVisible && currentAnnouncement && (
          <div
            className="text-center py-2 px-10 text-sm font-medium z-20 relative"
            style={{
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-bg-primary)',
              borderBottom: '1px solid var(--color-border)',
            }}
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={announcementIndex}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35 }}
                className="inline-block"
              >
                {currentAnnouncement}
              </motion.span>
            </AnimatePresence>
            <button
              type="button"
              onClick={dismissBanner}
              aria-label="Dismiss announcement"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:opacity-70 transition-opacity cursor-pointer"
            >
              <CloseIcon sx={{ fontSize: 16 }} />
            </button>
          </div>
        )}

        {/* Main Navbar */}
        <div className="relative w-full h-[60px] md:h-[75px] flex items-center">
          {/* Background layer */}
          <div
            className="absolute top-0 left-0 w-full pointer-events-none z-[-1] bg-[var(--color-bg-primary)] border-b border-[var(--color-border)] shadow-xl"
            style={{ height: '100%', boxSizing: 'content-box' }}
          />

          {/* Navbar Content */}
          <div className="relative z-10 flex items-center justify-between w-full max-w-[1600px] mx-auto px-6 lg:px-8">
            {/* Left: Hamburger & Logo */}
            <div className="flex items-center gap-4">
              <button
                type="button"
                className="lg:hidden p-1 -ml-2 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => { setMobileMenuOpen(true); search.setMobileSearchOpen(false); }}
                aria-label="Open menu"
                aria-expanded={mobileMenuOpen}
                style={{ color: 'var(--color-text)' }}
              >
                <MenuIcon sx={{ fontSize: 28 }} />
              </button>
              <Link to="/" className="flex items-center cursor-pointer gap-2 text-2xl font-black tracking-tight hover:opacity-80 transition-opacity" style={{ color: 'var(--color-text)' }}>
                {brand?.logo?.url ? (
                  <img src={brand.logo.url} alt={storeName} className="w-8 h-8 object-contain" />
                ) : (
                  <PrecisionManufacturingIcon sx={{ fontSize: 32, color: 'var(--color-primary)' }} />
                )}
                {brandText}
              </Link>
            </div>

            {/* Center: Links */}
            <nav className="hidden lg:flex items-center gap-12 font-semibold text-[15px] h-full">
              <Link to="/" onClick={() => handleNavClick('/')} className={navLinkClass(isHome)} style={navLinkStyle(isHome)}>Home</Link>
              <Link to="/prebuild" onClick={() => handleNavClick('/prebuild')} className={navLinkClass(isPrebuild)} style={navLinkStyle(isPrebuild)}>Prebuild</Link>

              <MegaMenu isActive={isComponents} onNavClick={handleNavClick} />

              <Link to="/builder" onClick={() => handleNavClick('/builder')} className={navLinkClass(isBuilder)} style={navLinkStyle(isBuilder)}>PC Builder</Link>
              <Link to="/deals" onClick={() => handleNavClick('/deals')} className={navLinkClass(isDeals)} style={navLinkStyle(isDeals)}>Deals</Link>
            </nav>

            {/* Right: Searchbar & Icons */}
            <div className="flex items-center gap-6 lg:gap-10">
              <SearchBar search={search} variant="desktop" />

              {/* Icons */}
              <div className="flex items-center gap-5 sm:gap-7" style={{ color: 'var(--color-text)' }}>
                {/* Mobile Search Icon */}
                <button
                  type="button"
                  className="lg:hidden relative flex flex-col items-center justify-center cursor-pointer hover:text-[var(--color-primary)] transition-colors h-full pb-1 pt-1"
                  onClick={() => search.setMobileSearchOpen((o) => !o)}
                  aria-label="Search"
                  aria-expanded={search.mobileSearchOpen}
                >
                  <SearchIcon sx={{ fontSize: 24 }} />
                  <span className="hidden md:block text-[12px] font-bold mt-0.5">Search</span>
                </button>

                <ProfileMenu isLoggedIn={isLoggedIn} profileText={profileText} onLogout={handleLogoutClick} />

                {/* Wishlist (Desktop Only) */}
                <Link to="/wishlist" aria-label="Wishlist" className="hidden lg:flex hover:text-[var(--color-primary)] transition-colors flex-col items-center justify-center cursor-pointer relative pb-1 pt-1">
                  <div className="relative">
                    <FavoriteBorderIcon sx={{ fontSize: 24 }} />
                    {wishlistCount > 0 && (
                      <span className="absolute -top-1.5 -right-2 bg-[var(--color-danger)] text-white text-[10px] font-bold min-w-4 h-4 px-1 rounded-full flex items-center justify-center">
                        {formatCount(wishlistCount)}
                      </span>
                    )}
                  </div>
                  <span className="text-[12px] font-bold mt-0.5">Wishlist</span>
                </Link>

                {/* Cart (Desktop Only) */}
                <Link to="/cart" aria-label="Cart" className="hidden lg:flex hover:text-[var(--color-primary)] transition-colors flex-col items-center justify-center cursor-pointer relative pb-1 pt-1">
                  <div className="relative">
                    <ShoppingCartOutlinedIcon sx={{ fontSize: 24 }} />
                    {cartCount > 0 && (
                      <span className="absolute -top-1.5 -right-2 bg-[var(--color-danger)] text-white text-[10px] font-bold min-w-4 h-4 px-1 rounded-full flex items-center justify-center">
                        {formatCount(cartCount)}
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
        {search.mobileSearchOpen && (
          <div className="lg:hidden w-full bg-[var(--color-bg-primary)] border-b border-[var(--color-border)] p-4 absolute top-full left-0 z-40 shadow-md">
            <SearchBar search={search} variant="mobile" />
          </div>
        )}
      </motion.header>

      {/* Mobile Slide-out Menu - kept outside header to avoid sticky transform stacking context issues */}
      <MobileDrawer
        open={mobileMenuOpen}
        onClose={closeMobileOverlays}
        brand={brand}
        isLoggedIn={isLoggedIn}
        firstName={firstName}
        profileText={profileText}
        wishlistCount={wishlistCount}
        cartCount={cartCount}
        onLogout={handleLogoutClick}
      />

      {/* Logout Confirmation Modal */}
      <ConfirmDialog
        open={showLogoutConfirm}
        title="Confirm Logout"
        message="Are you sure you want to log out of your account?"
        confirmLabel="Confirm"
        cancelLabel="Cancel"
        onConfirm={() => {
          logout();
          setShowLogoutConfirm(false);
        }}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </>
  );
};

export default Navbar;
