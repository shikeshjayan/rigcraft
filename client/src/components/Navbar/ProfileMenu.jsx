import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import DesktopWindowsOutlinedIcon from '@mui/icons-material/DesktopWindowsOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import ConfirmationNumberOutlinedIcon from '@mui/icons-material/ConfirmationNumberOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import HeadsetMicOutlinedIcon from '@mui/icons-material/HeadsetMicOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';

const MENU_LINK_CLASS =
  'flex items-center gap-3 px-3 py-2.5 rounded-sm hover:bg-gradient-to-r hover:from-[#E8F4FF] hover:to-transparent hover:text-[var(--color-primary)] transition-all cursor-pointer';

const ProfileMenu = ({ isLoggedIn, profileText, onLogout }) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
      e.currentTarget.blur();
    }
  };

  return (
    <div
      className="relative hidden lg:flex flex-col items-center justify-center h-full pb-1 pt-1"
      ref={containerRef}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        onKeyDown={handleKeyDown}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Open account menu"
        className="flex flex-col items-center justify-center cursor-pointer hover:text-[var(--color-primary)] transition-colors"
      >
        <PersonOutlineOutlinedIcon sx={{ fontSize: 24 }} />
        <span className="text-[12px] font-bold mt-0.5">{isLoggedIn ? profileText : 'Profile'}</span>
      </button>

      {open && (
        <div className="absolute top-full right-[-50px] mt-0 w-[300px] opacity-100 visible transition-all duration-300 z-50 pt-2 cursor-default shadow-2xl">
          <div className="bg-[var(--color-bg-primary)] border border-[var(--color-border)] shadow-2xl py-2 text-left" style={{ borderRadius: 'var(--radius-sm)' }}>
            {!isLoggedIn && (
              <div className="px-5 py-3 border-b border-[var(--color-border)] flex justify-between items-center">
                <span className="text-[14px] font-semibold text-[var(--color-text)]">New Customer?</span>
                <Link to="/login" onClick={() => setOpen(false)} className="text-[var(--color-primary)] text-[14px] font-bold cursor-pointer hover:underline">
                  Sign Up / Sign In
                </Link>
              </div>
            )}
            {isLoggedIn && (
              <div className="px-5 py-3 text-[14px] font-bold text-[var(--color-text-secondary)]">
                Your Account
              </div>
            )}

            <ul className="flex flex-col text-[14px] text-[var(--color-text-secondary)] font-medium pb-2">
              {isLoggedIn && (
                <>
                  <li className="mx-2 my-0.5">
                    <Link to="/profile" onClick={() => setOpen(false)} className={MENU_LINK_CLASS}>
                      <PersonOutlineOutlinedIcon fontSize="small" className="text-[var(--color-primary)] opacity-80" />
                      My Profile
                    </Link>
                  </li>
                  <li className="mx-2 my-0.5">
                    <Link to="/profile?tab=builds" onClick={() => setOpen(false)} className={MENU_LINK_CLASS}>
                      <DesktopWindowsOutlinedIcon fontSize="small" className="text-[var(--color-primary)] opacity-80" />
                      Your Build
                    </Link>
                  </li>
                </>
              )}
              <li className="mx-2 my-0.5">
                <Link to="/orders" onClick={() => setOpen(false)} className={MENU_LINK_CLASS}>
                  <Inventory2OutlinedIcon fontSize="small" className="text-[var(--color-primary)] opacity-80" />
                  Orders
                </Link>
              </li>
              <li className="mx-2 my-0.5">
                <Link to="/profile?tab=coupons" onClick={() => setOpen(false)} className={MENU_LINK_CLASS}>
                  <ConfirmationNumberOutlinedIcon fontSize="small" className="text-[var(--color-primary)] opacity-80" />
                  Coupons
                </Link>
              </li>
              <li className="mx-2 my-0.5">
                <Link to="/profile?tab=addresses" onClick={() => setOpen(false)} className={MENU_LINK_CLASS}>
                  <LocationOnOutlinedIcon fontSize="small" className="text-[var(--color-primary)] opacity-80" />
                  Saved Addresses
                </Link>
              </li>
              <li className="mx-2 my-0.5">
                <Link to="/wishlist" onClick={() => setOpen(false)} className={MENU_LINK_CLASS}>
                  <FavoriteBorderIcon fontSize="small" className="text-[var(--color-primary)] opacity-80" />
                  Wishlist
                </Link>
              </li>
              <li className="mx-2 my-0.5">
                <Link to="/contact" onClick={() => setOpen(false)} className={MENU_LINK_CLASS}>
                  <HeadsetMicOutlinedIcon fontSize="small" className="text-[var(--color-primary)] opacity-80" />
                  Contact Us
                </Link>
              </li>
              {isLoggedIn && (
                <>
                  <div className="border-t border-[var(--color-border)] my-1 mx-2"></div>
                  <li className="mx-2 my-0.5">
                    <button
                      type="button"
                      onClick={() => { setOpen(false); onLogout(); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-sm hover:bg-gradient-to-r hover:from-red-50 hover:to-transparent hover:text-red-600 transition-all cursor-pointer text-[var(--color-text-secondary)]"
                    >
                      <LogoutOutlinedIcon fontSize="small" className="text-[var(--color-muted)]" />
                      Logout
                    </button>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;
