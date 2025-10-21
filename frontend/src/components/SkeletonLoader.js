import React from 'react';

// Base skeleton component
export const Skeleton = ({ className = '', width, height }) => {
  const baseClasses = 'animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] rounded';
  const style = {
    width: width || '100%',
    height: height || '1rem',
  };

  return <div className={`${baseClasses} ${className}`} style={style} />;
};

// Dashboard skeleton loader
export const DashboardSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Partner card skeleton */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <Skeleton height="1.5rem" width="60%" className="mb-3" />
        <div className="flex items-center gap-3">
          <Skeleton height="3rem" width="3rem" className="rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton height="1.25rem" width="40%" />
            <Skeleton height="1rem" width="70%" />
          </div>
        </div>
      </div>

      {/* Goals card skeleton */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <Skeleton height="2rem" width="50%" className="mb-6" />

        {/* Add goal input skeleton */}
        <div className="flex gap-2 mb-6">
          <Skeleton height="2.5rem" className="flex-1" />
          <Skeleton height="2.5rem" width="5rem" />
        </div>

        {/* Goal items skeleton */}
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Skeleton height="1.5rem" width="1.5rem" className="rounded-full" />
              <Skeleton height="1rem" className="flex-1" width={`${60 + i * 10}%`} />
              <Skeleton height="1.125rem" width="1.125rem" />
              <Skeleton height="1.125rem" width="1.125rem" />
            </div>
          ))}
        </div>

        {/* Progress bar skeleton */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <Skeleton height="0.875rem" width="40%" />
            <Skeleton height="0.875rem" width="10%" />
          </div>
          <Skeleton height="0.5rem" className="rounded-full" />
        </div>
      </div>
    </div>
  );
};

// Partner page skeleton loader
export const PartnerPageSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Partner profile skeleton */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-4">
          <Skeleton height="4rem" width="4rem" className="rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton height="1.5rem" width="50%" />
            <Skeleton height="1rem" width="70%" />
          </div>
        </div>
      </div>

      {/* Goals skeleton */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <Skeleton height="1.5rem" width="40%" className="mb-4" />

        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start gap-3 mb-3">
                <Skeleton height="1.5rem" width="1.5rem" className="rounded-full" />
                <Skeleton height="1.25rem" className="flex-1" width="80%" />
              </div>

              {/* Comments skeleton */}
              <div className="ml-9 space-y-2">
                <div className="bg-gray-50 rounded p-3">
                  <Skeleton height="0.875rem" width="90%" className="mb-1" />
                  <Skeleton height="0.75rem" width="30%" />
                </div>

                {/* Comment input skeleton */}
                <div className="flex gap-2 mt-3">
                  <Skeleton height="2.5rem" className="flex-1" />
                  <Skeleton height="2.5rem" width="4rem" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Generic card skeleton
export const CardSkeleton = ({ lines = 3 }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-3">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height="1rem"
          width={`${Math.random() * 30 + 60}%`}
        />
      ))}
    </div>
  );
};

export default Skeleton;
