'use client';

import { useReadContract, useAccount } from 'wagmi';
import { REPUTATION_REGISTRY_ADDRESS, REPUTATION_REGISTRY_ABI } from '@/lib/contracts';
import { getReputationLevel, formatNumber } from '@/lib/calculations';
import { Trophy } from 'lucide-react';
import { useState, useEffect } from 'react';

// Known addresses to check (Anvil test accounts + connected user)
const KNOWN_ADDRESSES = [
  '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', // Anvil account #0
  '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', // Anvil account #1
  '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC', // Anvil account #2
  '0x90F79bf6EB2c4f870365E785982E1f101E93b906', // Anvil account #3
  '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65', // Anvil account #4
];

interface LeaderboardEntry {
  address: string;
  reputation: bigint;
  multiplier: bigint;
  isCurrentUser: boolean;
}

export function ReputationLeaderboard() {
  const { address } = useAccount();
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Get addresses to check (known + connected)
  const addressesToCheck = address && !KNOWN_ADDRESSES.includes(address)
    ? [...KNOWN_ADDRESSES, address]
    : KNOWN_ADDRESSES;

  // Fetch user stats for all known addresses
  const userStatsQueries = addressesToCheck.map((addr) =>
    useReadContract({
      address: REPUTATION_REGISTRY_ADDRESS,
      abi: REPUTATION_REGISTRY_ABI,
      functionName: 'getUserStats',
      args: [addr as `0x${string}`],
      query: {
        refetchInterval: 5000,
      },
    })
  );

  useEffect(() => {
    const entries: LeaderboardEntry[] = [];
    
    userStatsQueries.forEach((query, index) => {
      if (query.data) {
        const [effectiveRep, multiplier] = query.data as [bigint, bigint, bigint];
        
        // Only include users with reputation > 0
        if (effectiveRep > 0n) {
          entries.push({
            address: addressesToCheck[index],
            reputation: effectiveRep,
            multiplier: multiplier,
            isCurrentUser: address?.toLowerCase() === addressesToCheck[index].toLowerCase(),
          });
        }
      }
    });

    // Sort by reputation (highest first)
    entries.sort((a, b) => {
      if (a.reputation > b.reputation) return -1;
      if (a.reputation < b.reputation) return 1;
      return 0;
    });

    setLeaderboardData(entries);
    setIsLoading(false);
  }, [userStatsQueries.map(q => q.data).join(','), address]);

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-slate-800/40 to-slate-700/20 backdrop-blur-lg rounded-2xl p-8 border border-slate-700/50">
        <h3 className="text-2xl font-bold text-white mb-4">🏆 Reputation Leaderboard</h3>
        <p className="text-slate-400 text-center py-8">Loading leaderboard...</p>
      </div>
    );
  }

  if (leaderboardData.length === 0) {
    return (
      <div className="bg-gradient-to-br from-slate-800/40 to-slate-700/20 backdrop-blur-lg rounded-2xl p-8 border border-slate-700/50">
        <h3 className="text-2xl font-bold text-white mb-4">🏆 Reputation Leaderboard</h3>
        <p className="text-slate-400 text-center py-8">
          No users with reputation yet. Start voting to appear on the leaderboard!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-800/40 to-slate-700/20 backdrop-blur-lg rounded-2xl p-8 border border-slate-700/50">
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="w-8 h-8 text-amber-400" />
        <div>
          <h3 className="text-2xl font-bold text-white">Reputation Leaderboard</h3>
          <p className="text-slate-400 text-sm">Top contributors in this community</p>
        </div>
      </div>

      <div className="space-y-3">
        {leaderboardData.map((user, index) => {
          const { level: userLevel, color: userColor } = getReputationLevel(user.multiplier);
          const isTop3 = index < 3;
          
          return (
            <div
              key={user.address}
              className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                user.isCurrentUser
                  ? 'bg-emerald-500/15 border border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                  : 'bg-slate-800/30 border border-slate-700/50 hover:border-slate-600/50'
              }`}
            >
              {/* Rank */}
              <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
                {isTop3 ? (
                  <span className="text-3xl">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                  </span>
                ) : (
                  <span className="text-lg font-bold text-slate-500">#{index + 1}</span>
                )}
              </div>

              {/* Address */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-mono text-sm text-white truncate">
                    {user.address.slice(0, 6)}...{user.address.slice(-4)}
                  </p>
                  {user.isCurrentUser && (
                    <span className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/40 rounded-full text-xs text-emerald-400 font-semibold">
                      You
                    </span>
                  )}
                </div>
                <p className={`text-xs ${userColor}`}>{userLevel}</p>
              </div>

              {/* Stats */}
              <div className="text-right">
                <p className="text-lg font-bold text-white">
                  {formatNumber(Number(user.reputation))}
                </p>
                <p className="text-xs text-slate-400">
                  {(Number(user.multiplier) / 1e18).toFixed(1)}x multiplier
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Your Stats */}
      {address && leaderboardData.some(u => u.isCurrentUser) && (
        <div className="mt-6 pt-6 border-t border-slate-700/50">
          <div className="bg-gradient-to-r from-emerald-500/15 to-teal-500/15 border border-emerald-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">Your Global Rank</p>
                <p className="text-2xl font-bold text-white">
                  #{leaderboardData.findIndex(u => u.isCurrentUser) + 1}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-400 mb-1">Keep voting to climb!</p>
                <p className={`text-lg font-bold ${getReputationLevel(leaderboardData.find(u => u.isCurrentUser)?.multiplier || 0n).color}`}>
                  {getReputationLevel(leaderboardData.find(u => u.isCurrentUser)?.multiplier || 0n).level}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}




