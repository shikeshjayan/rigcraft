import React from 'react';
import { Link } from 'react-router-dom';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const Breadcrumb = ({ items }) => {
  if (!items || items.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center text-[12px] text-[#565959] mb-4">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <React.Fragment key={index}>
            {isLast ? (
              <span className="text-[#c45500] font-bold truncate max-w-[200px] sm:max-w-[400px]">
                {item.label}
              </span>
            ) : (
              <>
                <Link to={item.path} className="hover:underline">
                  {item.label}
                </Link>
                <ChevronRightIcon sx={{ fontSize: 14, mx: 0.5 }} />
              </>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default Breadcrumb;
