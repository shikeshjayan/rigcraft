import React from 'react';
import { Link } from 'react-router-dom';

const categories = [
  { name: 'CPU', path: 'Processor(CPU)', tag: 'BEST SELLER', icon: <svg className="w-[72px] h-[72px] text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25zm.75-12h9v9h-9v-9z" /></svg> },
  { name: 'Graphics Cards', path: 'Graphics card (GPU)', tag: 'POPULAR', icon: <svg className="w-[72px] h-[72px] text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 6.878V6a2.25 2.25 0 012.25-2.25h7.5A2.25 2.25 0 0118 6v.878m-12 0c.236-.027.473-.051.71-.073V21m11.29-14.195c-.237-.022-.474-.046-.71-.073V21m-10.58 0h10.58" /></svg> },
  { name: 'Motherboards', path: 'motherboard', icon: <svg className="w-[72px] h-[72px] text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z" /></svg> },
  { name: 'RAM', path: 'Memory(RAM)', icon: <svg className="w-[72px] h-[72px] text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg> },
  { name: 'Storage', path: 'storage', icon: <svg className="w-[72px] h-[72px] text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" /></svg> },
  { name: 'Power Supplies', path: 'power supply (PSU)', icon: <svg className="w-[72px] h-[72px] text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg> },
  { name: 'Cases', path: 'Computer case', icon: <svg className="w-[72px] h-[72px] text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z" /></svg> },
  { name: 'Cooling', path: 'Cooling', icon: <svg className="w-[72px] h-[72px] text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18m0-18l-3.5 3.5M12 3l3.5 3.5M12 21l-3.5-3.5M12 21l3.5-3.5M4.929 4.929l14.142 14.142m-14.142 0l3.5-3.5M4.929 4.929l3.5 3.5m10.642 10.642l-3.5-3.5M19.071 4.929l-3.5 3.5" /></svg> },
  { name: 'Software', path: 'Software', icon: <svg className="w-[72px] h-[72px] text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" /></svg> },
  { name: 'Peripherals', path: 'Accessories', icon: <svg className="w-[72px] h-[72px] text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.159-5.463-5.263 1.83 8.979-11.458 4.256 12.766z" /></svg> },
];

const HomeCategory = () => {
  return (
    <section className="w-full py-20" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12">
          <div>
            <h2 className="text-[32px] md:text-[40px] font-extrabold text-[#111111] uppercase tracking-wide">
              Shop By <span style={{ color: 'var(--color-primary)' }}>Category</span>
            </h2>
            <p className="text-[#6B7280] mt-2 text-[16px] font-[500]">
              Browse all PC components and peripherals by category.
            </p>
          </div>
          <Link to="/components" className="font-[600] text-[16px] flex items-center gap-1 mt-4 md:mt-0 transition-transform hover:translate-x-1" style={{ color: 'var(--color-primary)' }}>
            View All Categories
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        
        {/* Grid Section */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-3 xl:gap-4">
          {categories.map((cat, index) => (
            <Link
              to={`/components/${cat.path}`}
              key={index} 
              className="flex flex-col mx-auto w-full max-w-[140px] h-[170px] bg-white rounded-[var(--radius-sm)] border border-[#E5E7EB] shadow-[0_4px_20px_rgb(0,0,0,0.05)] hover:shadow-[0_12px_30px_rgb(0,0,0,0.08)] hover:-translate-y-2 hover:border-[var(--color-primary)] transition-all duration-300 cursor-pointer group relative overflow-hidden"
            >
              {/* Optional Tag */}
              {cat.tag && (
                <div 
                  className="absolute top-2 left-2 px-1.5 py-0.5 text-[8px] font-[700] text-white flex items-center gap-0.5 rounded-[4px] shadow-sm z-10 uppercase tracking-wider"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  {cat.tag === 'BEST SELLER' && (
                    <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                  )}
                  {cat.tag === 'POPULAR' && (
                    <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 24 24"><path d="M17.66 11.2C17.43 10.9 17.15 10.64 16.89 10.38C16.22 9.78 15.46 9.35 14.82 8.72C13.33 7.26 13 4.85 13.95 3C13 3.23 12.18 3.75 11.46 4.32C8.87 6.4 7.85 10.07 9.07 13.22C9.11 13.32 9.15 13.42 9.15 13.55C9.15 13.77 9 13.97 8.8 14.05C8.57 14.15 8.33 14.09 8.14 13.93C8.08 13.88 8.04 13.83 8 13.76C6.87 12.33 6.69 10.28 7.45 8.64C5.78 10.14 4.8 12.39 4.8 14.77C4.8 18.77 8.03 22 12.03 22C16.03 22 19.26 18.77 19.26 14.77C19.26 13.46 18.86 12.22 17.66 11.2Z"/></svg>
                  )}
                  {cat.tag}
                </div>
              )}

              <div className="flex flex-col items-center justify-center h-full pt-1 relative p-3 w-full">
                
                {/* Icon Container */}
                <div className="flex items-center justify-center w-[64px] h-[64px] rounded-full group-hover:scale-[1.08] transition-transform duration-300" style={{ backgroundColor: 'rgba(37, 99, 235, 0.05)' }}>
                  <div className="scale-50">
                    {cat.icon}
                  </div>
                </div>

                {/* Text Content */}
                <div className="mt-3 text-center flex flex-col items-center">
                  <h3 className="text-[12px] font-[700] text-[#111111] leading-tight mt-1">
                    {cat.name}
                  </h3>
                </div>

                {/* Arrow Button */}
                <div 
                  className="absolute bottom-3 right-3 flex items-center justify-center transition-transform duration-300 group-hover:translate-x-1"
                >
                  <svg 
                    className="w-4 h-4 transition-colors duration-300 text-[var(--color-primary)]" 
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>

              </div>
              
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomeCategory;
