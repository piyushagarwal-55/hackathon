'use client';

import { useAccount, useReadContract } from 'wagmi';
import { REPUTATION_REGISTRY_ADDRESS, REPUTATION_REGISTRY_ABI } from '@/lib/contracts';
import { getReputationLevel, formatNumber } from '@/lib/calculations';

export function RepDisplay() {
  const { address, isConnected } = useAccount();

  const { data: userStats } = useReadContract({
    address: REPUTATION_REGISTRY_ADDRESS,
    abi: REPUTATION_REGISTRY_ABI,
    functionName: 'getUserStats',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected,
    },
  });

  if (!isConnected) {
    return (
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
        <p className="text-gray-400 text-center">
          Connect wallet to view your reputation
        </p>
      </div>
    );
  }

  if (!userStats) {
    return (
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
          <div className="h-8 bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  const [effectiveRep, multiplier, lastVote] = userStats;
  const { level, color, description } = getReputationLevel(multiplier);

  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Reputation Score */}
        <div>
          <p className="text-gray-400 text-sm mb-1">Your Reputation</p>
          <p className="text-4xl font-bold text-white">
            {formatNumber(Number(effectiveRep))}
          </p>
        </div>

        {/* Vote Multiplier */}
        <div>
          <p className="text-gray-400 text-sm mb-1">Vote Multiplier</p>
          <p className="text-4xl font-bold text-indigo-400">
            {(Number(multiplier) / 1e18).toFixed(1)}x
          </p>
        </div>

        {/* Reputation Level */}
        <div>
          <p className="text-gray-400 text-sm mb-1">Level</p>
          <p className={`text-2xl font-bold ${color}`}>{level}</p>
          <p className="text-gray-500 text-xs mt-1">{description}</p>
        </div>
      </div>

      {/* Last Vote Time */}
      {lastVote > 0 && typeof window !== 'undefined' && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-gray-400 text-xs">
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
