'use client';

import { useEffect, useState } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { REPUTATION_REGISTRY_ADDRESS, REPUTATION_REGISTRY_ABI } from '@/lib/contracts';
import { getReputationLevel, formatNumber } from '@/lib/calculations';
import { Award, TrendingUp } from 'lucide-react';

export function RepDisplay() {
  const { address, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: userStats } = useReadContract({
    address: REPUTATION_REGISTRY_ADDRESS,
    abi: REPUTATION_REGISTRY_ABI,
    functionName: 'getUserStats',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected && mounted,
      refetchInterval: 10000, // Refresh reputation every 10 seconds
      staleTime: 5000,
    },
  });

  // Prevent hydration mismatch by showing loading state until mounted
  if (!mounted) {
    return (
      <div className="bg-gradient-to-br from-slate-800/40 to-slate-700/20 backdrop-blur-lg rounded-2xl p-8 border border-slate-700/50">
        <div className="animate-pulse">
          <div className="h-4 bg-slate-700/40 rounded w-3/4 mb-2"></div>
          <div className="h-8 bg-slate-700/40 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="bg-gradient-to-br from-slate-800/40 to-slate-700/20 backdrop-blur-lg rounded-2xl p-8 border border-slate-700/50">
        <p className="text-slate-400 text-center">
          Connect wallet to view your reputation
        </p>
      </div>
    );
  }

  if (!userStats) {
    return (
      <div className="bg-gradient-to-br from-slate-800/40 to-slate-700/20 backdrop-blur-lg rounded-2xl p-8 border border-slate-700/50">
        <div className="animate-pulse">
          <div className="h-4 bg-slate-700/40 rounded w-3/4 mb-2"></div>
          <div className="h-8 bg-slate-700/40 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  const [effectiveRep, multiplier, lastVote] = userStats;
  const { level, color, description } = getReputationLevel(multiplier);

  return (
    <div className="bg-gradient-to-br from-slate-800/40 to-slate-700/20 backdrop-blur-lg rounded-2xl p-8 border border-slate-700/50">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Reputation Score */}
        <div className="p-6 bg-slate-800/30 rounded-lg border border-slate-700/30">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-4 h-4 text-emerald-400" />
            <p className="text-slate-400 text-sm">Your Reputation</p>
          </div>
          <p className="text-3xl font-bold text-white">
            {formatNumber(Number(effectiveRep))}
          </p>
        </div>

        {/* Vote Multiplier */}
        <div className="p-6 bg-slate-800/30 rounded-lg border border-slate-700/30">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            <p className="text-slate-400 text-sm">Vote Multiplier</p>
          </div>
          <p className="text-3xl font-bold text-amber-400">
            {(Number(multiplier) / 1e18).toFixed(1)}x
          </p>
        </div>

        {/* Reputation Level */}
        <div className="p-6 bg-slate-800/30 rounded-lg border border-slate-700/30">
          <p className="text-slate-400 text-sm mb-2">Level</p>
          <p className={`text-2xl font-bold ${color} mb-1`}>{level}</p>
          <p className="text-slate-500 text-xs">{description}</p>
        </div>
      </div>

      {/* Last Vote Time */}
      {lastVote > 0 && (
        <div className="mt-6 pt-6 border-t border-slate-700/50">
          <p className="text-slate-500 text-xs">
            Last voted:{' '}
            {new Date(Number(lastVote) * 1000).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </p>
        </div>
      )}
    </div>
  );
}
