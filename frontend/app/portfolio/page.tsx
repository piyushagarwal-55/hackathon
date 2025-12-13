'use client';

import { Navigation } from '@/components/Navigation';
import { PositionCard } from '@/components/PositionCard';
import { calculatePnL, formatPnL, getPnLColor, getPnLSign } from '@/lib/pnl';
import { useAccount } from 'wagmi';
import { TrendingUp, TrendingDown, DollarSign, Target, Award, Clock, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useUserPositions } from '@/hooks/useUserPositions';

export default function PortfolioPage() {
  const { address, isConnected } = useAccount();
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  // Fetch real-time user positions
  const { positions, isLoading } = useUserPositions();

  const pnl = calculatePnL(positions);

  const filteredPositions = positions.filter((pos) => {
    if (filter === 'active') return pos.isActive;
    if (filter === 'completed') return !pos.isActive;
    return true;
  });

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[#0f1419]">
        <Navigation showCreateButton={false} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-12 text-center">
            <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-slate-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Connect Your Wallet</h2>
            <p className="text-slate-400">Connect your wallet to view your portfolio</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1419]">
      <Navigation showCreateButton={false} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Portfolio</h1>
          <p className="text-slate-400">Track your predictions and performance</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total Invested */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Total Invested</p>
                <p className="text-xl font-bold text-white">
                  {formatPnL(pnl.totalInvested)}
                </p>
              </div>
            </div>
          </div>

          {/* Total Returned */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Total Returned</p>
                <p className="text-xl font-bold text-emerald-400">
                  {formatPnL(pnl.totalReturned)}
                </p>
              </div>
            </div>
          </div>

          {/* Realized P&L */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 ${pnl.realizedPnL >= 0n ? 'bg-emerald-500/20' : 'bg-red-500/20'} rounded-lg flex items-center justify-center`}>
                {pnl.realizedPnL >= 0n ? (
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-400" />
                )}
              </div>
              <div>
                <p className="text-xs text-slate-400">Realized P&L</p>
                <p className={`text-xl font-bold ${getPnLColor(pnl.realizedPnL)}`}>
                  {getPnLSign(pnl.realizedPnL)}
                  {formatPnL(pnl.realizedPnL >= 0n ? pnl.realizedPnL : -pnl.realizedPnL)}
                </p>
              </div>
            </div>
          </div>

          {/* ROI */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 ${pnl.roiPercentage >= 0 ? 'bg-amber-500/20' : 'bg-red-500/20'} rounded-lg flex items-center justify-center`}>
                <Target className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400">ROI</p>
                <p className={`text-xl font-bold ${pnl.roiPercentage >= 0 ? 'text-amber-400' : 'text-red-400'}`}>
                  {pnl.roiPercentage >= 0 ? '+' : ''}{pnl.roiPercentage.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Win/Loss/Pending Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-emerald-400 mb-1">{pnl.winCount}</p>
            <p className="text-sm text-slate-400">Wins</p>
          </div>
          <div className="bg-slate-700/30 border border-slate-600/50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-slate-400 mb-1">{pnl.lossCount}</p>
            <p className="text-sm text-slate-400">Losses</p>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-amber-400 mb-1">{pnl.pendingCount}</p>
            <p className="text-sm text-slate-400">Pending</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === 'all'
                ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-400'
                : 'bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            All Positions ({positions.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === 'active'
                ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-400'
                : 'bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            Active ({pnl.pendingCount})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === 'completed'
                ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-400'
                : 'bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            Completed ({pnl.winCount + pnl.lossCount})
          </button>
        </div>

        {/* Positions List */}
        {isLoading ? (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-12 text-center">
            <Loader2 className="w-12 h-12 text-emerald-400 animate-spin mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Loading Positions...</h3>
            <p className="text-slate-400">Fetching your portfolio data from the blockchain</p>
          </div>
        ) : filteredPositions.length === 0 ? (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-12 text-center">
            <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Positions Yet</h3>
            <p className="text-slate-400 mb-6">
              {filter === 'all' 
                ? 'Start voting on markets to build your portfolio'
                : `No ${filter} positions found`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredPositions.map((position, index) => (
              <PositionCard
                key={`${position.marketAddress}-${index}`}
                position={position}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

