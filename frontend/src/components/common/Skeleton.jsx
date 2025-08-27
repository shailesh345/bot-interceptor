import React from 'react';
import { motion } from 'framer-motion';

export const Skeleton = ({ className = '', ...props }) => (
  <div
    className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] rounded ${className}`}
    style={{
      animation: 'shimmer 2s infinite linear',
    }}
    {...props}
  />
);

export const BillingCardSkeleton = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="bg-white rounded-xl shadow-sm border p-6 space-y-4"
  >
    <div className="flex items-center space-x-4">
      <Skeleton className="w-12 h-12 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-6 w-32" />
      </div>
    </div>
    <Skeleton className="h-3 w-full" />
  </motion.div>
);

export const TableSkeleton = ({ rows = 5, columns = 6 }) => (
  <div className="space-y-3">
    {/* Table Header */}
    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} className="h-4 w-20" />
      ))}
    </div>
    
    {/* Table Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton key={colIndex} className="h-8 w-full" />
        ))}
      </div>
    ))}
  </div>
);

export const SubscriptionSkeleton = () => (
  <div className="space-y-6">
    {/* Status Cards */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <BillingCardSkeleton key={i} />
      ))}
    </div>
    
    {/* Usage Section */}
    <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
      <Skeleton className="h-6 w-32" />
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-3 w-full rounded-full" />
          </div>
        ))}
      </div>
    </div>
    
    {/* Plans Section */}
    <div className="bg-white rounded-xl shadow-sm border p-6 space-y-6">
      <Skeleton className="h-6 w-32" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-6 space-y-4">
            <div className="text-center space-y-2">
              <Skeleton className="h-6 w-24 mx-auto" />
              <Skeleton className="h-8 w-16 mx-auto" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="flex items-center space-x-2">
                  <Skeleton className="w-5 h-5 rounded-full" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </div>
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const InvoiceTableSkeleton = () => (
  <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
    <div className="p-6 border-b">
      <Skeleton className="h-6 w-32" />
    </div>
    <div className="p-6">
      <TableSkeleton rows={6} columns={6} />
    </div>
  </div>
);

// Add shimmer animation styles
export const SkeletonStyles = () => {
  React.useEffect(() => {
    // Add shimmer animation styles to document head
    const style = document.createElement('style');
    style.textContent = `
      @keyframes shimmer {
        0% {
          background-position: -200% 0;
        }
        100% {
          background-position: 200% 0;
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  return null;
};

export default Skeleton;