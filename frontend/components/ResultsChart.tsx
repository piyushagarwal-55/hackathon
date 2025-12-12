'use client';

import { useReadContract, useWatchContractEvent } from 'wagmi';
import { POLL_ABI } from '@/lib/contracts';
import { formatNumber } from '@/lib/calculations';
import { useState, useEffect } from 'react';

interface ResultsChartProps {
  pollAddress: `0x${string}`;
  options: string[];
}

export function ResultsChart({ pollAddress, options }: ResultsChartProps) {
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch current results
  const { data: results, refetch } = useReadContract({
    address: pollAddress,
    abi: POLL_ABI,
    functionName: 'getResults',
  });

  const { data: totalVoters } = useReadContract({
    address: pollAddress,
    abi: POLL_ABI,
    functionName: 'totalVoters',
  });

  // Listen for new votes
  useWatchContractEvent({
    address: pollAddress,
    abi: POLL_ABI,
    eventName: 'VoteCast',
    onLogs() {
      refetch();
      setRefreshKey((prev) => prev + 1);
    },
  });

  const totalVotes = results
    ? results.reduce((sum, votes) => sum + Number(votes), 0)
    : 0;

  const maxVotes = results
    ? Math.max(...results.map((v) => Number(v)))
    : 0;

  if (!results || results.length === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
        <h2 className="text-2xl font-bold text-white mb-6">Live Results</h2>
        <p className="text-gray-400 text-center py-8">No votes yet. Be the first to vote!</p>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Live Results</h2>
        <div className="text-right">
          <p className="text-sm text-gray-400">Total Voters</p>
          <p className="text-2xl font-bold text-indigo-400">{totalVoters?.toString() || '0'}</p>
        </div>
      </div>

      <div className="space-y-4">
        {results.map((votes, idx) => {
          const voteCount = Number(votes);
          const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
          const isWinning = voteCount === maxVotes && voteCount > 0;

          return (
            <div key={idx} className="group">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-white font-semibold">{options[idx]}</span>
                  {isWinning && (
                    <span className="px-2 py-0.5 bg-green-500/20 border border-green-500/30 rounded-full text-xs text-green-400">
                      Leading
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">{percentage.toFixed(1)}%</p>
                  <p className="text-xs text-gray-500">{formatNumber(voteCount)} votes</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="relative h-3 bg-gray-700/30 rounded-full overflow-hidden">
                <div
                  className={`absolute top-0 left-0 h-full transition-all duration-500 rounded-full ${
                    isWinning
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                      : 'bg-gradient-to-r from-indigo-500 to-purple-600'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Winner Summary */}
      {totalVotes > 0 && (
        <div className="mt-6 pt-6 border-t border-white/10">
          <div className="bg-gradient-to-r from-green-500/10 to-emerald-600/10 border border-green-500/30 rounded-xl p-4">
            <p className="text-sm text-gray-400 mb-1">Current Winner</p>
            <p className="text-xl font-bold text-green-400">
              {options[results.indexOf(BigInt(maxVotes))]}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              with {formatNumber(maxVotes)} weighted votes
            </p>
          </div>
        </div>
      )}

      {/* Live indicator */}
      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span>Live updates</span>
      </div>
    </div>
  );
}
