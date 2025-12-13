'use client';

export function PollCardSkeleton() {
  return (
    <div className="bg-[#131a22] backdrop-blur-sm rounded-xl p-5 border border-slate-800/40 animate-pulse">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          {/* Status Badge Skeleton */}
          <div className="flex items-center gap-2 mb-2">
            <div className="w-12 h-5 bg-slate-700/50 rounded"></div>
            <div className="w-8 h-4 bg-slate-700/50 rounded"></div>
          </div>

          {/* Question Skeleton */}
          <div className="space-y-2 mb-3">
            <div className="w-full h-4 bg-slate-700/50 rounded"></div>
            <div className="w-3/4 h-4 bg-slate-700/50 rounded"></div>
          </div>

          {/* Stats Row Skeleton */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-3 bg-slate-700/50 rounded"></div>
            <div className="w-px h-3 bg-slate-700/50"></div>
            <div className="w-20 h-3 bg-slate-700/50 rounded"></div>
            <div className="w-px h-3 bg-slate-700/50"></div>
            <div className="w-16 h-3 bg-slate-700/50 rounded"></div>
          </div>
        </div>

        {/* Actions Skeleton */}
        <div className="flex items-center gap-1">
          <div className="w-12 h-8 bg-slate-700/50 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="bg-slate-950/60 rounded-lg p-6 border border-slate-800/40 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="w-32 h-5 bg-slate-700/50 rounded mb-3"></div>
          <div className="flex gap-3">
            <div className="w-24 h-8 bg-slate-700/50 rounded-lg"></div>
            <div className="w-24 h-8 bg-slate-700/50 rounded-lg"></div>
            <div className="w-24 h-8 bg-slate-700/50 rounded-lg"></div>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="w-8 h-8 bg-slate-700/50 rounded-lg"></div>
          <div className="w-8 h-8 bg-slate-700/50 rounded-lg"></div>
          <div className="w-8 h-8 bg-slate-700/50 rounded-lg"></div>
          <div className="w-8 h-8 bg-slate-700/50 rounded-lg"></div>
        </div>
      </div>

      {/* Chart Area Skeleton */}
      <div className="h-96 bg-slate-900/40 rounded-lg mb-4"></div>

      {/* Time Labels Skeleton */}
      <div className="flex justify-between">
        <div className="w-16 h-3 bg-slate-700/50 rounded"></div>
        <div className="w-16 h-3 bg-slate-700/50 rounded"></div>
        <div className="w-16 h-3 bg-slate-700/50 rounded"></div>
      </div>
    </div>
  );
}

export function LeaderboardSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/30 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-slate-700/50 rounded"></div>
            <div className="flex-1">
              <div className="w-32 h-3 bg-slate-700/50 rounded mb-2"></div>
              <div className="w-20 h-3 bg-slate-700/50 rounded"></div>
            </div>
            <div className="w-12 h-4 bg-slate-700/50 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ActivitySkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="p-3 bg-slate-800/30 border border-slate-700/30 rounded-lg animate-pulse">
          <div className="flex justify-between mb-2">
            <div className="w-2/3 h-3 bg-slate-700/50 rounded"></div>
            <div className="w-20 h-3 bg-slate-700/50 rounded"></div>
          </div>
          <div className="flex gap-2">
            <div className="w-16 h-5 bg-slate-700/50 rounded"></div>
            <div className="w-24 h-5 bg-slate-700/50 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

