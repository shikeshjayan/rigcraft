import React from 'react';
import { Link } from 'react-router-dom';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const Breadcrumb = ({ items, variant = 'light' }) => {
  if (!items || items.length === 0) return null;

  const isDark = variant === 'dark';

  return (
    <nav
      aria-label="breadcrumb"
      className={`flex flex-wrap items-center text-[12px] mb-4 ${
        isDark ? 'text-gray-300 font-medium' : 'text-[#565959]'
      }`}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const linkClasses = isDark
          ? 'hover:text-white transition-colors'
          : 'hover:underline';

        return (
          <React.Fragment key={index}>
            {isLast ? (
              <span
                className={`font-bold truncate max-w-[200px] sm:max-w-[400px] ${
                  isDark ? 'text-[var(--color-primary)]' : 'text-[#c45500]'
                }`}
              >
                {item.label}
              </span>
            ) : (
              <>
                {item.path ? (
                  <Link to={item.path} className={linkClasses}>
                    {item.label}
                  </Link>
                ) : (
                  <span className={linkClasses}>{item.label}</span>
                )}
                <ChevronRightIcon sx={{ fontSize: 14, mx: 0.5 }} />
              </>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;
