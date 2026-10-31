import React from 'react';

export const SurahListSkeleton: React.FC = () => {
  return (
    <div className="space-y-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between p-4 bg-white rounded-xl border border-[#E5E1D5] animate-pulse"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center" />
            <div className="space-y-2">
              <div className="h-4 w-28 bg-slate-200 rounded" />
              <div className="h-3 w-36 bg-slate-100 rounded" />
            </div>
          </div>
          <div className="h-6 w-16 bg-slate-100 rounded" />
        </div>
      ))}
    </div>
  );
};

export const AyahReaderSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="p-5 md:p-6 bg-white rounded-2xl border border-[#E5E1D5] animate-pulse space-y-4"
        >
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div className="h-4 w-16 bg-slate-200 rounded" />
            <div className="flex gap-2">
              <div className="w-8 h-8 rounded bg-slate-100" />
              <div className="w-8 h-8 rounded bg-slate-100" />
            </div>
          </div>
          <div className="h-10 w-full bg-slate-100 rounded" />
          <div className="h-4 w-3/4 bg-slate-100 rounded" />
          <div className="h-4 w-full bg-slate-200 rounded" />
        </div>
      ))}
    </div>
  );
};
