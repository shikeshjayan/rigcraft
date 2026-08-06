import React from 'react';

const SkeletonCard = ({ compact }) => {
  return (
    <div 
      className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-[#E2E8F0] overflow-hidden"
      style={{
        height: compact ? '375px' : '480px'
      }}
    >
      {/* Image Skeleton */}
      <div 
        className="w-full relative bg-gray-200 animate-pulse"
        style={{ height: compact ? '160px' : '220px' }}
      ></div>

      <div className="flex flex-col flex-grow p-5">
        {/* Brand/Category Skeleton */}
        <div className="h-3 bg-gray-200 rounded w-1/3 mb-2 animate-pulse"></div>
        
        {/* Title Skeleton */}
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-3 animate-pulse"></div>
        
        {/* Rating Skeleton */}
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4 animate-pulse"></div>

        {/* Description Skeleton */}
        <div className="space-y-2 mb-4">
          <div className="h-3 bg-gray-200 rounded w-full animate-pulse"></div>
          <div className="h-3 bg-gray-200 rounded w-5/6 animate-pulse"></div>
        </div>

        {/* Price Skeleton */}
        <div className="mb-3">
          <div className="flex items-end gap-2 flex-wrap mb-1">
            <div className="h-6 bg-gray-200 rounded w-24 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
          </div>
          <div className="h-3 bg-gray-200 rounded w-28 animate-pulse"></div>
        </div>

        {/* Stock Skeleton */}
        <div className="h-3 bg-gray-200 rounded w-1/3 mb-3 animate-pulse"></div>

        {/* Trust Badges Skeleton */}
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="h-5 bg-gray-200 rounded-full w-24 animate-pulse"></div>
          <div className="h-5 bg-gray-200 rounded-full w-28 animate-pulse"></div>
        </div>

        {/* Footer Skeleton */}
        <div className="flex items-stretch gap-2 mt-auto">
          <div className="h-10 bg-gray-200 rounded flex-1 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-12 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;