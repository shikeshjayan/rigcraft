import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { CATEGORIES, categoryPath } from '../../constants/categories';
import { useDialog } from '../../hooks/useDialog';

const NAV_LINK_CLASS = 'text-[16px] font-bold p-3 rounded-md hover:bg-[var(--color-bg-secondary)] transition-colors';

const MobileDrawer = ({
  open,
  onClose,
  brand,
  isLoggedIn,
  firstName,
  profileText,
  wishlistCount,
  cartCount,
  onLogout,
}) => {
  const containerRef = useDialog({ open, onClose });
  const navigate = useNavigate();
  const location = useLocation();
  const [componentsOpen, setComponentsOpen] = useState(false);

  if (!open) return null;

  const storeName = brand?.storeName || 'RigCraft';
  const isComponentsActive = location.pathname.startsWith('/components');

  const brandText = (
    <>
      <span style={{ color: 'var(--color-primary)' }}>{storeName.slice(0, 3)}</span>{storeName.slice(3)}
    </>
  );

  return (
    <div className="fixed inset-0 z-[100] lg:hidden flex" role="presentation">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true"></div>

      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className="relative w-[300px] h-full bg-[var(--color-bg-primary)] shadow-2xl flex flex-col overflow-y-auto"
      >
        <div className="p-4 flex items-center justify-between border-b border-[var(--color-border)]">
          <span className="text-xl font-black" style={{ color: 'var(--color-text)' }}>{brandText}</span>
          <button
            type="button"
            className="p-2 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
            onClick={onClose}
            aria-label="Close menu"
          >
            <CloseIcon />
          </button>
        </div>

        <nav className="flex flex-col p-4 gap-2">
          <Link to="/" onClick={onClose} className={NAV_LINK_CLASS} style={{ color: location.pathname === '/' ? 'var(--color-primary)' : 'var(--color-text)' }}>Home</Link>
          <Link to="/prebuild" onClick={onClose} className={NAV_LINK_CLASS} style={{ color: location.pathname === '/prebuild' ? 'var(--color-primary)' : 'var(--color-text)' }}>Prebuilds</Link>

          <div>
            <button
              type="button"
              onClick={() => setComponentsOpen((o) => !o)}
              aria-expanded={componentsOpen}
              className={`w-full flex items-center justify-between text-[16px] font-bold p-3 rounded-md hover:bg-[var(--color-bg-secondary)] transition-colors cursor-pointer`}
              style={{ color: isComponentsActive ? 'var(--color-primary)' : 'var(--color-text)' }}
            >
              Components
              <KeyboardArrowDownIcon sx={{ fontSize: 18 }} className={`transition-transform duration-200 ${componentsOpen ? 'rotate-180' : ''}`} />
            </button>
            {componentsOpen && (
              <div className="pl-4 flex flex-col gap-1 border-l-2 border-[var(--color-border)] ml-4 py-1">
                <Link to="/components" onClick={onClose} className="text-[14px] font-semibold p-2 rounded-md hover:bg-[var(--color-bg-secondary)] transition-colors" style={{ color: 'var(--color-text)' }}>All Components</Link>
                {CATEGORIES.filter((c) => c.categoryType).map((cat) => (
                  <Link
                    key={cat.slug}
                    to={categoryPath(cat.slug)}
                    onClick={onClose}
                    className="text-[14px] font-semibold p-2 rounded-md hover:bg-[var(--color-bg-secondary)] transition-colors"
                    style={{ color: location.pathname === categoryPath(cat.slug) ? 'var(--color-primary)' : 'var(--color-text-secondary)' }}
                  >
                    {cat.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link to="/builder" onClick={onClose} className={NAV_LINK_CLASS} style={{ color: location.pathname === '/builder' ? 'var(--color-primary)' : 'var(--color-text)' }}>PC Builder</Link>
          <Link to="/deals" onClick={onClose} className={NAV_LINK_CLASS} style={{ color: location.pathname === '/deals' ? 'var(--color-primary)' : 'var(--color-text)' }}>Deals</Link>
        </nav>

        <div className="flex flex-col px-4 mt-2 gap-2 pb-4">
          <div className="text-[12px] font-bold text-[var(--color-muted)] uppercase tracking-wider mb-2">My Account</div>
          <Link to="/profile" onClick={onClose} className="flex items-center gap-3 text-[16px] font-bold p-3 rounded-md hover:bg-[var(--color-bg-secondary)] transition-colors cursor-pointer" style={{ color: 'var(--color-text)' }}>
            <PersonOutlineOutlinedIcon />
            {isLoggedIn ? profileText : 'Profile'}
          </Link>
          <Link to="/wishlist" onClick={onClose} className="flex items-center justify-between text-[16px] font-bold p-3 rounded-md hover:bg-[var(--color-bg-secondary)] transition-colors cursor-pointer" style={{ color: 'var(--color-text)' }}>
            <div className="flex items-center gap-3">
              <FavoriteBorderIcon />
              Wishlist
            </div>
            {wishlistCount > 0 && (
              <span className="bg-[var(--color-danger)] text-white text-[12px] font-bold w-6 h-6 rounded-full flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </Link>
          <Link to="/cart" onClick={onClose} className="flex items-center justify-between text-[16px] font-bold p-3 rounded-md hover:bg-[var(--color-bg-secondary)] transition-colors cursor-pointer" style={{ color: 'var(--color-text)' }}>
            <div className="flex items-center gap-3">
              <ShoppingCartOutlinedIcon />
              Cart
            </div>
            {cartCount > 0 && (
              <span className="bg-[var(--color-danger)] text-white text-[12px] font-bold w-6 h-6 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
        </div>

        <div className="mt-auto p-4 border-t border-[var(--color-border)]">
          {isLoggedIn ? (
            <div className="flex flex-col gap-3">
              <div className="text-[16px] font-bold text-center" style={{ color: 'var(--color-text)' }}>
                Hi, welcome back {firstName}
              </div>
              <button
                type="button"
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 bg-red-600 text-white font-bold py-3 rounded-sm cursor-pointer hover:bg-red-700 transition-colors shadow-md"
              >
                <LogoutOutlinedIcon fontSize="small" />
                LOGOUT
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                navigate('/login');
                onClose();
              }}
              className="w-full bg-[var(--color-primary)] text-white font-bold py-3 rounded-sm cursor-pointer hover:opacity-90 transition-opacity"
            >
              LOGIN / SIGNUP
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileDrawer;
