'use client';

import { motion } from 'framer-motion';

// Common shimmer animation helper
const shimmerVariants = {
  animate: {
    backgroundPosition: ['200% 0', '-200% 0'],
    transition: {
      repeat: Infinity,
      duration: 1.5,
      ease: 'linear'
    }
  }
};

const ShimmerElement = ({ className }) => {
  return (
    <div className={`relative overflow-hidden bg-slate-200 dark:bg-slate-800/80 rounded-xl ${className}`}>
      {/* Moving Shimmer Overlay */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-white/5 to-transparent bg-[length:200%_100%]"
        variants={shimmerVariants}
        animate="animate"
      />
    </div>
  );
};

// 1. Dashboard Metric Card Skeleton
export function SkeletonCard() {
  return (
    <div className="bg-surface border border-outline rounded-2xl p-6 space-y-4 shadow-sm relative overflow-hidden">
      <div className="flex justify-between items-start">
        <div className="space-y-2 w-2/3">
          {/* Label placeholder */}
          <ShimmerElement className="h-4 w-24" />
          {/* Main Stat value placeholder */}
          <ShimmerElement className="h-8 w-16" />
        </div>
        {/* Icon container placeholder */}
        <ShimmerElement className="w-10 h-10 rounded-xl shrink-0" />
      </div>
      
      <div className="flex items-center gap-2 pt-2 border-t border-outline/30">
        {/* Sub-label trend indicator */}
        <ShimmerElement className="h-3.5 w-12 rounded-full" />
        <ShimmerElement className="h-3 w-28" />
      </div>
    </div>
  );
}

// 2. Dashboard Chart Skeleton
export function SkeletonChart({ title = "Recruitment Trends" }) {
  return (
    <div className="bg-surface border border-outline rounded-2xl p-6 space-y-6 shadow-sm relative overflow-hidden h-[340px]">
      <div className="flex items-center justify-between">
        <div className="space-y-1.5 w-1/3">
          <ShimmerElement className="h-5 w-32" />
          <ShimmerElement className="h-3 w-48" />
        </div>
        <ShimmerElement className="h-7 w-24 rounded-lg" />
      </div>

      {/* Grid lines and wave simulator */}
      <div className="flex-1 h-[200px] flex flex-col justify-between relative pt-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="w-full border-b border-outline/30 h-0" />
        ))}
        
        {/* Waves mockup */}
        <div className="absolute inset-x-0 bottom-4 top-8 flex items-end justify-between px-2 gap-4">
          {[40, 60, 45, 80, 55, 90, 70, 85].map((height, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
              <ShimmerElement 
                className="w-full rounded-t-lg" 
                style={{ height: `${height}%` }}
              />
              <ShimmerElement className="h-3 w-8" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 3. Table List Skeleton
export function SkeletonTable({ rows = 5, cols = 4 }) {
  return (
    <div className="bg-surface border border-outline rounded-2xl p-6 space-y-4 shadow-sm relative overflow-hidden">
      <div className="flex justify-between items-center pb-4 border-b border-outline/40">
        <div className="space-y-1.5 w-1/3">
          <ShimmerElement className="h-5 w-36" />
          <ShimmerElement className="h-3 w-56" />
        </div>
        <ShimmerElement className="h-8 w-28 rounded-xl" />
      </div>

      <div className="space-y-4 pt-2">
        {/* Table rows mock */}
        {[...Array(rows)].map((_, rIdx) => (
          <div 
            key={rIdx} 
            className="flex items-center justify-between py-3 border-b border-outline/25 last:border-b-0 gap-6"
          >
            <div className="flex items-center gap-3 w-1/3">
              {/* Circular Avatar mock */}
              <ShimmerElement className="w-8 h-8 rounded-full shrink-0" />
              <div className="space-y-1.5 w-full">
                <ShimmerElement className="h-3.5 w-3/4" />
                <ShimmerElement className="h-2.5 w-1/2" />
              </div>
            </div>
            
            {/* Columns */}
            <div className="flex-1 flex items-center justify-between gap-4">
              <ShimmerElement className="h-3.5 w-20" />
              <ShimmerElement className="h-3.5 w-24" />
              <ShimmerElement className="h-5 w-16 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 4. Sidebar Activity Feed Skeleton
export function SkeletonActivityFeed() {
  return (
    <div className="bg-surface border border-outline rounded-2xl p-6 space-y-5 shadow-sm relative overflow-hidden">
      <div className="space-y-1.5 pb-3 border-b border-outline/40">
        <ShimmerElement className="h-5 w-28" />
        <ShimmerElement className="h-3.5 w-44" />
      </div>

      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex gap-3 items-start py-1">
            <ShimmerElement className="w-7 h-7 rounded-xl shrink-0 mt-0.5" />
            <div className="space-y-2 flex-1">
              <ShimmerElement className="h-3 w-11/12" />
              <ShimmerElement className="h-2.5 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
