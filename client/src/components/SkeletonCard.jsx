import React from 'react';

const SkeletonCard = () => {
  return (
    <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between h-[280px] animate-pulse border border-slate-800">
      <div>
        {/* Author Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-800 animate-shimmer" />
            <div className="space-y-1.5">
              <div className="w-24 h-3.5 bg-slate-800 rounded animate-shimmer" />
              <div className="w-16 h-2.5 bg-slate-800/60 rounded animate-shimmer" />
            </div>
          </div>
          <div className="w-16 h-4 bg-slate-800 rounded-full animate-shimmer" />
        </div>

        {/* Title */}
        <div className="w-3/4 h-6 bg-slate-800 rounded-md mb-3 animate-shimmer" />

        {/* Content Lines */}
        <div className="space-y-2 mb-6">
          <div className="w-full h-3.5 bg-slate-800/80 rounded animate-shimmer" />
          <div className="w-5/6 h-3.5 bg-slate-800/80 rounded animate-shimmer" />
          <div className="w-2/3 h-3.5 bg-slate-800/80 rounded animate-shimmer" />
        </div>
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-14 h-6 bg-slate-800 rounded-full animate-shimmer" />
          <div className="w-14 h-6 bg-slate-800 rounded-full animate-shimmer" />
        </div>
        <div className="w-20 h-4 bg-slate-800 rounded animate-shimmer" />
      </div>
    </div>
  );
};

export default SkeletonCard;
