'use client';

import { useReadContract } from 'wagmi';
import { POLL_FACTORY_ADDRESS, POLL_FACTORY_ABI } from '@/lib/contracts';
import { TrendingUp, Shield, Zap } from 'lucide-react';

export function StatsDashboard() {
  const { data: pollCount } = useReadContract({
    address: POLL_FACTORY_ADDRESS,
    abi: POLL_FACTORY_ABI,
    functionName: 'getPollCount',
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      {/* Card 1: Reputation Score - Large */}
      <div className="bg-gradient-to-br from-slate-800/40 to-slate-700/20 backdrop-blur-lg rounded-2xl p-8 border border-slate-700/50 hover:border-emerald-500/50 transition-all hover:shadow-lg hover:shadow-emerald-500/10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-slate-400 text-sm font-medium mb-2">Your Reputation</p>
            <p className="text-5xl font-bold text-white">—</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/50">
            <Shield className="w-6 h-6 text-emerald-400" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/50 rounded-full text-xs font-semibold text-emerald-400">
            Top 10%
          </span>
          <span className="text-slate-500 text-xs">Based on activity</span>
        </div>
      </div>

      {/* Card 2: Voting Power - Medium */}
      <div className="bg-gradient-to-br from-slate-800/40 to-slate-700/20 backdrop-blur-lg rounded-2xl p-8 border border-slate-700/50 hover:border-amber-500/50 transition-all hover:shadow-lg hover:shadow-amber-500/10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-slate-400 text-sm font-medium mb-2">Vote Multiplier</p>
            <p className="text-4xl font-bold text-amber-400">1.5x</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center border border-amber-500/50">
            <TrendingUp className="w-6 h-6 text-amber-400" />
          </div>
        </div>
        <p className="text-slate-500 text-xs">Based on your history</p>
      </div>

      {/* Card 3: Sybil Protection - Medium */}
      <div className="bg-gradient-to-br from-slate-800/40 to-slate-700/20 backdrop-blur-lg rounded-2xl p-8 border border-slate-700/50 hover:border-teal-500/50 transition-all hover:shadow-lg hover:shadow-teal-500/10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-slate-400 text-sm font-medium mb-2">Sybil Shield</p>
            <p className="text-4xl font-bold text-teal-400">99.8%</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-500/20 flex items-center justify-center border border-teal-500/50">
            <Zap className="w-6 h-6 text-teal-400 animate-pulse" />
          </div>
        </div>
        <p className="text-slate-500 text-xs">Protected</p>
      </div>

      {/* Card 4: Total Polls - Wide spanning 2 cols on desktop */}
      <div className="md:col-span-3 bg-gradient-to-br from-slate-800/40 via-slate-700/20 to-slate-800/40 backdrop-blur-lg rounded-2xl p-8 border border-slate-700/50 hover:border-slate-600/50 transition-all">
        <div className="grid grid-cols-3 gap-6">
          <div>
            <p className="text-slate-400 text-sm font-medium mb-2">Total Polls</p>
            <p className="text-3xl font-bold text-white">{pollCount?.toString() || '0'}</p>
            <p className="text-slate-500 text-xs mt-1">Active & completed</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm font-medium mb-2">Total Votes</p>
            <p className="text-3xl font-bold text-white">47</p>
            <p className="text-slate-500 text-xs mt-1">Weighted votes cast</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm font-medium mb-2">Active Voters</p>
            <p className="text-3xl font-bold text-white">12</p>
            <p className="text-slate-500 text-xs mt-1">Community members</p>
          </div>
        </div>
      </div>
    </div>
  );
}




