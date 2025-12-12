'use client';

import { useReadContract, useAccount } from 'wagmi';
import { REPUTATION_REGISTRY_ADDRESS, REPUTATION_REGISTRY_ABI } from '@/lib/contracts';
import { getReputationLevel, formatNumber } from '@/lib/calculations';

export function ReputationLeaderboard() {
  const { address } = useAccount();

  // In a real app, you'd fetch this from the contract or an indexer
  // For now, we'll show the connected user's stats
  const { data: userStats } = useReadContract({
    address: REPUTATION_REGISTRY_ADDRESS,
    abi: REPUTATION_REGISTRY_ABI,
    functionName: 'getUserStats',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  if (!userStats) {
    return (
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
        <h3 className="text-2xl font-bold text-white mb-4">🏆 Reputation Leaderboard</h3>
        <p className="text-gray-400 text-center py-8">
          Connect wallet to see your ranking
        </p>
      </div>
    );
  }

  const [effectiveRep, multiplier] = userStats;
  const { level, color } = getReputationLevel(multiplier);

  // Mock leaderboard data (in production, fetch from contract events or indexer)
  const leaderboardData = [
    {
      address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      reputation: 1000,
      multiplier: 3e18,
      isCurrentUser: address?.toLowerCase() === '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'.toLowerCase(),
    },
    {
      address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
      reputation: 100,
      multiplier: 15e17,
      isCurrentUser: address?.toLowerCase() === '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'.toLowerCase(),
    },
    {
      address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
      reputation: 10,
      multiplier: 5e17,
      isCurrentUser: address?.toLowerCase() === '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC'.toLowerCase(),
    },
  ];

  return (
    <div className="bg-gradient-to-br from-amber-900/20 to-yellow-900/20 backdrop-blur-lg rounded-2xl p-8 border border-amber-500/20">
      <div className="flex items-center gap-3 mb-6">
        <div className="text-4xl">🏆</div>
        <div>
          <h3 className="text-2xl font-bold text-white">Reputation Leaderboard</h3>
          <p className="text-gray-400 text-sm">Top contributors in this community</p>
        </div>
      </div>

      <div className="space-y-3">
        {leaderboardData.map((user, index) => {
          const { level: userLevel, color: userColor } = getReputationLevel(BigInt(user.multiplier));
          const isTop3 = index < 3;
          
          return (
            <div
              key={user.address}
              className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                user.isCurrentUser
                  ? 'bg-indigo-500/20 border border-indigo-500/30 shadow-lg'
                  : 'bg-white/5 border border-white/10'
              }`}
            >
              {/* Rank */}
              <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
                {isTop3 ? (
                  <span className="text-3xl">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                  </span>
                ) : (
                  <span className="text-xl font-bold text-gray-500">#{index + 1}</span>
                )}
              </div>

              {/* Address */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-mono text-sm text-white truncate">
                    {user.address.slice(0, 6)}...{user.address.slice(-4)}
                  </p>
                  {user.isCurrentUser && (
                    <span className="px-2 py-0.5 bg-indigo-500/20 border border-indigo-500/30 rounded-full text-xs text-indigo-400">
                      You
                    </span>
                  )}
                </div>
                <p className={`text-xs ${userColor}`}>{userLevel}</p>
              </div>

              {/* Stats */}
              <div className="text-right">
                <p className="text-lg font-bold text-white">
                  {formatNumber(user.reputation)}
                </p>
                <p className="text-xs text-gray-400">
                  {(user.multiplier / 1e18).toFixed(1)}x multiplier
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Your Stats */}
      {address && (
        <div className="mt-6 pt-6 border-t border-white/10">
          <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Your Global Rank</p>
                <p className="text-2xl font-bold text-white">
                  #{leaderboardData.findIndex(u => u.isCurrentUser) + 1}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400 mb-1">Keep voting to climb!</p>
                <p className={`text-lg font-bold ${color}`}>{level}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



