'use client';

import { Position, formatPnL, getPnLColor, getPnLSign } from '@/lib/pnl';
import { Clock, TrendingUp, Award } from 'lucide-react';
import { getCategoryById } from '@/lib/categories';

interface PositionCardProps {
  position: Position;
  onClick?: () => void;
}

export function PositionCard({ position, onClick }: PositionCardProps) {
  const category = position.category ? getCategoryById(position.category) : null;
  const daysAgo = Math.floor((Date.now() - position.timestamp * 1000) / (1000 * 60 * 60 * 24));

  return (
    <div
      onClick={onClick}
      className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 hover:border-emerald-500/30 hover:bg-slate-700/30 transition-all cursor-pointer group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="text-base font-semibold text-white mb-2 line-clamp-2 group-hover:text-emerald-400 transition-colors">
            {position.marketQuestion}
          </h4>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Status Badge */}
            {position.isActive ? (
              <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 rounded text-xs text-emerald-400 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active
              </span>
            ) : position.isWinner ? (
              <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 rounded text-xs text-amber-400 font-medium flex items-center gap-1">
                <Award className="w-3 h-3" />
                Won
              </span>
            ) : (
              <span className="px-2 py-0.5 bg-slate-700/50 border border-slate-600/50 rounded text-xs text-slate-400 font-medium">
                Lost
              </span>
            )}

            {/* Category Badge */}
            {category && (
              <span className={`px-2 py-0.5 ${category.bgColor} border ${category.borderColor} rounded text-xs ${category.color} font-medium flex items-center gap-1`}>
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </span>
            )}

            {/* Time */}
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {daysAgo === 0 ? 'Today' : `${daysAgo}d ago`}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="bg-slate-900/50 rounded-lg p-3">
          <p className="text-xs text-slate-500 mb-1">Your Bet</p>
          <p className="text-lg font-bold text-white">
            {formatPnL(position.betAmount)} REP
          </p>
        </div>

        <div className="bg-slate-900/50 rounded-lg p-3">
          <p className="text-xs text-slate-500 mb-1">Vote Weight</p>
          <p className="text-lg font-bold text-emerald-400">
            {formatPnL(position.voteWeight, 0)}
          </p>
        </div>

        {!position.isActive && position.winnings !== undefined && (
          <>
            <div className="bg-slate-900/50 rounded-lg p-3">
              <p className="text-xs text-slate-500 mb-1">Returns</p>
              <p className={`text-lg font-bold ${getPnLColor(position.winnings)}`}>
                {formatPnL(position.winnings)} REP
              </p>
            </div>

            <div className="bg-slate-900/50 rounded-lg p-3">
              <p className="text-xs text-slate-500 mb-1">P&L</p>
              <p className={`text-lg font-bold ${getPnLColor(position.winnings - position.betAmount)}`}>
                {getPnLSign(position.winnings - position.betAmount)}
                {formatPnL(position.winnings > position.betAmount ? position.winnings - position.betAmount : position.betAmount - position.winnings)} REP
              </p>
            </div>
          </>
        )}

        {position.isActive && (
          <div className="bg-slate-900/50 rounded-lg p-3 col-span-2">
            <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Potential Return
            </p>
            <p className="text-lg font-bold text-amber-400">
              Pending Market Close
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

