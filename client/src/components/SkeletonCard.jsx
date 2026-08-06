import React from 'react';

const SkeletonCard = ({ compact }) => {
  return (
    <div 
      className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-[var(--color-border)] overflow-hidden"
      style={{
        height: compact ? '400px' : '480px'
      }}
    >
      {/* Image Skeleton */}
      <div 
        className="w-full relative bg-gray-200 animate-pulse"
        style={{ height: compact ? '160px' : '220px' }}
      ></div>

      <div className="flex flex-col flex-grow p-5">
        {/* Title Skeleton */}
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-3 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4 animate-pulse"></div>

        {/* Specs Skeleton */}
        <div className="space-y-2 mb-6">
          <div className="h-3 bg-gray-200 rounded w-full animate-pulse"></div>
          <div className="h-3 bg-gray-200 rounded w-5/6 animate-pulse"></div>
          <div className="h-3 bg-gray-200 rounded w-4/6 animate-pulse"></div>
        </div>

        {/* Footer Skeleton */}
        <div className="flex justify-between items-end mt-auto pt-2">
          <div className="flex flex-col gap-2">
            <div className="h-3 bg-gray-200 rounded w-12 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-24 animate-pulse"></div>
          </div>
          
          <div className="h-10 bg-gray-200 rounded w-28 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;
