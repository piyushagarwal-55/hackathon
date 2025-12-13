"use client";

import { useReadContract, useWatchContractEvent } from "wagmi";
import { POLL_ABI } from "@/lib/contracts";
import { formatNumber } from "@/lib/calculations";
import { useState, useEffect } from "react";
import { TrendingUp, AlertCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

interface ResultsChartProps {
  pollAddress: `0x${string}`;
  options: string[];
}

export function ResultsChart({ pollAddress, options }: ResultsChartProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(0);
  const queryClient = useQueryClient();

  // Check if address is valid (not zero address)
  const isZeroAddress =
    pollAddress === "0x0000000000000000000000000000000000000000";

  // Fetch current results with polling enabled - ONLY if valid address
  const {
    data: results,
    refetch: refetchResults,
    isLoading,
    isFetching,
    isRefetching,
    queryKey: resultsQueryKey,
    error: resultsError,
    status: resultsStatus,
  } = useReadContract({
    address: pollAddress,
    abi: POLL_ABI,
    functionName: "getResults",
    query: {
      enabled: !isZeroAddress, // Disable query if zero address
      refetchInterval: isZeroAddress ? false : 5000, // Reduced frequency to avoid timeouts
      staleTime: 1000,
      gcTime: 5000,
    },
  });

  const {
    data: totalVoters,
    refetch: refetchVoters,
    queryKey: votersQueryKey,
    error: votersError,
  } = useReadContract({
    address: pollAddress,
    abi: POLL_ABI,
    functionName: "totalVoters",
    query: {
      enabled: !isZeroAddress, // Disable query if zero address
      refetchInterval: isZeroAddress ? false : 5000, // Reduced frequency to avoid timeouts
      staleTime: 1000,
      gcTime: 5000,
    },
  });

  // Debug logging
  useEffect(() => {
    // Intentionally no console spam in production UI.
  }, [
    results,
    totalVoters,
    refreshKey,
    isLoading,
    isFetching,
    isRefetching,
    lastUpdateTime,
    pollAddress,
  ]);

  // Listen for new votes with proper event handling - disabled if zero address
  useWatchContractEvent({
    address: isZeroAddress ? undefined : pollAddress,
    abi: POLL_ABI,
    eventName: "VoteCast",
    enabled: !isZeroAddress,
    onLogs(logs) {
      console.log("🎯 VoteCast Event Detected!", logs);

      // Invalidate and refetch queries immediately
      queryClient.invalidateQueries({ queryKey: resultsQueryKey });
      queryClient.invalidateQueries({ queryKey: votersQueryKey });

      // Also manually refetch
      refetchResults();
      refetchVoters();

      setLastUpdateTime(Date.now());
      setRefreshKey((prev) => prev + 1);
    },
    poll: true,
    pollingInterval: 3000, // Reduced frequency
  });

  const totalVotes = results
    ? results.reduce((sum, votes) => sum + Number(votes), 0)
    : 0;

  const maxVotes = results ? Math.max(...results.map((v) => Number(v))) : 0;

  // Show helpful message if zero address
  if (isZeroAddress) {
    return (
      <div className="bg-gradient-to-br from-slate-800/40 to-slate-700/20 backdrop-blur-lg rounded-2xl p-8 border border-slate-700/50">
        <h2 className="text-2xl font-bold text-white mb-6">Live Results</h2>
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="w-12 h-12 text-amber-500 mb-4" />
          <p className="text-slate-300 text-center font-semibold mb-2">
            No Poll Selected
          </p>
          <p className="text-slate-400 text-center text-sm max-w-md">
            Please select a poll from the list above or create a new poll to
            view results.
          </p>
          <p className="text-amber-400 text-center text-xs mt-4 max-w-md">
            💡 Tip: Make sure Anvil blockchain is running and contracts are
            deployed.
          </p>
        </div>
      </div>
    );
  }

  if (!results || results.length === 0) {
    return (
      <div className="bg-gradient-to-br from-slate-800/40 to-slate-700/20 backdrop-blur-lg rounded-2xl p-8 border border-slate-700/50">
        <h2 className="text-2xl font-bold text-white mb-6">Live Results</h2>
        <div className="flex flex-col items-center justify-center py-12">
          <TrendingUp className="w-12 h-12 text-slate-600 mb-4" />
          <p className="text-slate-400 text-center">
            No votes yet. Be the first to vote!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/60 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          📊 Live Results
        </h2>
        <div className="text-right">
          <p className="text-slate-500 text-xs">Voters</p>
          <p className="text-lg font-bold text-emerald-400">
            {totalVoters?.toString() || "0"}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {results.map((votes, idx) => {
          const voteCount = Number(votes);
          const percentage =
            totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
          const isWinning = voteCount === maxVotes && voteCount > 0;

          return (
            <div key={idx} className="group">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-white font-medium text-sm truncate">
                    {options[idx]}
                  </span>
                  {isWinning && (
                    <span className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/40 rounded text-xs font-medium text-emerald-400 flex items-center gap-1 flex-shrink-0">
                      🏆
                    </span>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-white font-bold text-sm">
                    {percentage.toFixed(1)}%
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="relative h-2 bg-slate-800/50 rounded-full overflow-hidden">
                <div
                  className={`absolute top-0 left-0 h-full transition-all duration-500 ${
                    isWinning
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                      : "bg-slate-600"
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {formatNumber(voteCount)} votes
              </p>
            </div>
          );
        })}
      </div>

      {/* Winner Summary */}
      {totalVotes > 0 && (
        <div className="mt-5 pt-5 border-t border-slate-700/40">
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-400 text-xs font-medium mb-1">
                  Leading
                </p>
                <p className="text-lg font-bold text-white">
                  {options[results.indexOf(BigInt(maxVotes))]}
                </p>
              </div>
              <div className="text-right">
                <p className="text-emerald-400 text-2xl font-bold">
                  {totalVotes > 0
                    ? (
                        (Number(results[results.indexOf(BigInt(maxVotes))]) /
                          totalVotes) *
                        100
                      ).toFixed(1)
                    : 0}
                  %
                </p>
                <p className="text-slate-500 text-xs">
                  {formatNumber(maxVotes)} votes
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Live indicator */}
      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
        <span>Real-time</span>
      </div>
    </div>
  );
}
