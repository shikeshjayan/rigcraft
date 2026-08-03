import { useState } from 'react';
import { Link } from 'react-router-dom';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import BuildIcon from '@mui/icons-material/Build';
import { CATEGORIES, categoryPath } from '../../constants/categories';

const MEGA_MENU_CATEGORIES = CATEGORIES.filter((c) => c.categoryType).slice(0, 10);

const MegaMenu = ({ isActive, onNavClick }) => {
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
      e.currentTarget.blur();
    }
  };

  return (
    <div
      className="relative h-full flex items-center"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocusCapture={() => setOpen(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        onKeyDown={handleKeyDown}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`flex items-center gap-1 transition-colors hover:text-[var(--color-primary)] cursor-pointer h-full ${isActive ? 'underline decoration-2 underline-offset-8' : ''}`}
        style={{ color: isActive ? 'var(--color-primary)' : 'var(--color-text)', textDecorationColor: 'var(--color-primary)' }}
      >
        Components
        <KeyboardArrowDownIcon sx={{ fontSize: 18 }} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-0 max-w-[calc(100vw-2rem)] w-[850px] transition-all duration-300 z-50 pt-2 cursor-default ${open ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
        <div
          className="p-8 shadow-2xl border border-[var(--color-border)]"
          style={{
            backgroundColor: 'var(--color-bg-primary)',
            borderRadius: 'var(--radius-sm)',
          }}
        >
          <h4 className="text-[12px] font-bold tracking-widest text-[var(--color-muted)] mb-6 uppercase">Shop By Category</h4>

          <div className="grid grid-cols-5 gap-4 mb-8">
            {MEGA_MENU_CATEGORIES.map((cat) => {
              const IconComponent = cat.icon;
              return (
                <Link
                  to={categoryPath(cat.slug)}
                  onClick={() => { close(); onNavClick(categoryPath(cat.slug)); }}
                  key={cat.slug}
                  className="flex flex-col items-center justify-center p-4 border border-[var(--color-border)] transition-all hover:border-[var(--color-primary)] hover:shadow-md cursor-pointer text-center group/card"
                  style={{ backgroundColor: 'var(--color-bg-primary)', borderRadius: 'var(--radius-sm)' }}
                >
                  <div className="mb-2 opacity-80 group-hover/card:opacity-100 group-hover/card:scale-110 transition-transform">
                    <IconComponent sx={{ fontSize: 28, color: cat.color }} />
                  </div>
                  <h5 className="text-[13px] font-bold text-[var(--color-text)] mb-1">{cat.label}</h5>
                  <p className="text-[11px] text-[var(--color-muted)] leading-tight">{cat.desc}</p>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-4 border-t border-[var(--color-border)] pt-6">
            <Link
              to="/builder"
              onClick={() => { close(); onNavClick('/builder'); }}
              className="flex items-center justify-center text-center gap-2 bg-[var(--color-primary)] text-white font-bold py-2.5 px-6 transition-opacity hover:opacity-90"
              style={{ borderRadius: 'var(--radius-sm)' }}
            >
              <BuildIcon sx={{ fontSize: 18 }} /> Build Custom PC
            </Link>
            <Link
              to="/components"
              onClick={() => { close(); onNavClick('/components'); }}
              className="bg-transparent text-[var(--color-primary)] border-2 border-[var(--color-primary)] font-bold py-2 px-6 transition-colors hover:bg-[var(--color-primary)] hover:text-white flex items-center justify-center text-center"
              style={{ borderRadius: 'var(--radius-sm)' }}
            >
              View All Components
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MegaMenu;
