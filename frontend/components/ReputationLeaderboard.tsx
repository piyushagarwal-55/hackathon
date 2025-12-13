"use client";

import { useAccount, usePublicClient, useWatchContractEvent } from "wagmi";
import {
  REPUTATION_REGISTRY_ADDRESS,
  REPUTATION_REGISTRY_ABI,
} from "@/lib/contracts";
import { getReputationLevel, formatNumber } from "@/lib/calculations";
import { Trophy } from "lucide-react";
import { useState, useEffect } from "react";
import { LeaderboardSkeleton } from "./SkeletonLoader";

interface LeaderboardEntry {
  address: string;
  reputation: bigint;
  multiplier: bigint;
  isCurrentUser: boolean;
}

interface ReputationLeaderboardProps {
  compact?: boolean;
  limit?: number;
}

export function ReputationLeaderboard({ compact = false, limit }: ReputationLeaderboardProps = {}) {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [userAddresses, setUserAddresses] = useState<Set<string>>(new Set());
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Watch for new ReputationUpdated events
  useWatchContractEvent({
    address: REPUTATION_REGISTRY_ADDRESS,
    abi: REPUTATION_REGISTRY_ABI,
    eventName: "ReputationUpdated",
    onLogs(logs) {
      // wagmi's log typing can be `never` if ABI isn't `as const`-typed.
      // We intentionally treat logs as `any` and access args defensively.
      (logs as any[]).forEach((log) => {
        const userAddr = (log?.args?.user ?? log?.args?.[0]) as string | undefined;
        if (userAddr) {
          setUserAddresses(
            (prev) => new Set([...prev, userAddr.toLowerCase()])
          );
        }
      });
    },
  });

  // Fetch historical ReputationUpdated events on mount
  useEffect(() => {
    const fetchHistoricalEvents = async () => {
      if (!publicClient) return;

      try {
        const latest = await publicClient.getBlockNumber();
        // Avoid scanning the entire chain; pull a large recent window.
        const window = 200_000n;
        const fromBlock = latest > window ? latest - window : 0n;

        const logs = await publicClient.getLogs({
          address: REPUTATION_REGISTRY_ADDRESS,
          event: {
            type: "event",
            name: "ReputationUpdated",
            inputs: [
              { indexed: true, name: "user", type: "address" },
              { indexed: false, name: "newReputation", type: "uint256" },
            ],
          },
          fromBlock,
          toBlock: "latest",
        });

        const addresses = new Set<string>();
        (logs as any[]).forEach((log) => {
          const userAddr = (log?.args?.user ?? log?.args?.[0]) as string | undefined;
          if (userAddr) {
            addresses.add(userAddr.toLowerCase());
          }
        });

        setUserAddresses(addresses);
      } catch (error) {
        console.error("Error fetching historical events:", error);
      }
    };

    fetchHistoricalEvents();
  }, [publicClient]);

  // Fetch stats for all discovered users
  const addressList = Array.from(userAddresses);

  // Fetch all user stats and update leaderboard
  useEffect(() => {
    const fetchAllStats = async () => {
      if (addressList.length === 0) {
        setIsLoading(false);
        return;
      }

      try {
        const entries: LeaderboardEntry[] = [];

        // Fetch stats for each user
        for (const addr of addressList) {
          try {
            const stats = await publicClient?.readContract({
              address: REPUTATION_REGISTRY_ADDRESS,
              abi: REPUTATION_REGISTRY_ABI,
              functionName: "getUserStats",
              args: [addr as `0x${string}`],
            });

            if (stats) {
              const [effectiveRep, multiplier] = stats as [
                bigint,
                bigint,
                bigint
              ];

              // Only include users with reputation > 0
              if (effectiveRep > BigInt(0)) {
                entries.push({
                  address: addr,
                  reputation: effectiveRep,
                  multiplier: multiplier,
                  isCurrentUser: address?.toLowerCase() === addr.toLowerCase(),
                });
              }
            }
          } catch (err) {
            // Skip failed reads
            console.error(`Failed to fetch stats for ${addr}:`, err);
          }
        }

        // Sort by reputation (highest first)
        entries.sort((a, b) => {
          if (a.reputation > b.reputation) return -1;
          if (a.reputation < b.reputation) return 1;
          return 0;
        });

        setLeaderboardData(entries);
      } catch (error) {
        console.error("Error fetching leaderboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllStats();
  }, [addressList.join(","), address, publicClient, refreshTrigger]);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshTrigger((prev) => prev + 1);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return <LeaderboardSkeleton />;
  }

  if (leaderboardData.length === 0) {
    return compact ? (
      <div className="text-center py-4">
        <p className="text-slate-400 text-sm">No data yet</p>
      </div>
    ) : (
      <div className="bg-gradient-to-br from-slate-800/40 to-slate-700/20 backdrop-blur-lg rounded-2xl p-8 border border-slate-700/50">
        <h3 className="text-2xl font-bold text-white mb-4">
          🏆 Reputation Leaderboard
        </h3>
        <p className="text-slate-400 text-center py-8">
          No users with reputation yet. Start voting to appear on the
          leaderboard!
        </p>
      </div>
    );
  }

  const displayData = limit ? leaderboardData.slice(0, limit) : leaderboardData;

  if (compact) {
    return (
      <div className="space-y-2">
        {displayData.map((user, index) => {
          const { level: userLevel, color: userColor, emoji } = getReputationLevel(user.multiplier);
          const multiplierValue = Number(user.multiplier) / 1e18;

          return (
            <div
              key={user.address}
              className={`p-3 rounded-lg border transition-all ${
                user.isCurrentUser
                  ? "bg-emerald-500/10 border-emerald-500/30"
                  : "bg-slate-800/30 border-slate-700/30 hover:bg-slate-800/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="text-lg font-bold text-slate-400 w-6">
                  #{index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-slate-300 truncate">
                      {user.address.slice(0, 6)}...{user.address.slice(-4)}
                    </span>
                    {user.isCurrentUser && (
                      <span className="px-1.5 py-0.5 bg-emerald-500/20 border border-emerald-500/40 rounded text-xs text-emerald-400">
                        You
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500">
                    {formatNumber(Number(user.reputation))} REP
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-bold ${userColor}`}>
                    {multiplierValue.toFixed(1)}x
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-800/40 to-slate-700/20 backdrop-blur-lg rounded-2xl p-8 border border-slate-700/50">
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="w-8 h-8 text-amber-400" />
        <div>
          <h3 className="text-2xl font-bold text-white">
            Reputation Leaderboard
          </h3>
          <p className="text-slate-400 text-sm">
            Top contributors in this community
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {displayData.map((user, index) => {
          const { level: userLevel, color: userColor } = getReputationLevel(
            user.multiplier
          );
          const isTop3 = index < 3;

          return (
            <div
              key={user.address}
              className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                user.isCurrentUser
                  ? "bg-emerald-500/15 border border-emerald-500/40 shadow-lg shadow-emerald-500/10"
                  : "bg-slate-800/30 border border-slate-700/50 hover:border-slate-600/50"
              }`}
            >
              {/* Rank */}
              <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
                {isTop3 ? (
                  <span className="text-3xl">
                    {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                  </span>
                ) : (
                  <span className="text-lg font-bold text-slate-500">
                    #{index + 1}
                  </span>
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
      {address && leaderboardData.some((u) => u.isCurrentUser) && (
        <div className="mt-6 pt-6 border-t border-slate-700/50">
          <div className="bg-gradient-to-r from-emerald-500/15 to-teal-500/15 border border-emerald-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">Your Global Rank</p>
                <p className="text-2xl font-bold text-white">
                  #{leaderboardData.findIndex((u) => u.isCurrentUser) + 1}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-400 mb-1">
                  Keep voting to climb!
                </p>
                <p
                  className={`text-lg font-bold ${
                    getReputationLevel(
                      leaderboardData.find((u) => u.isCurrentUser)
                        ?.multiplier || BigInt(0)
                    ).color
                  }`}
                >
                  {
                    getReputationLevel(
                      leaderboardData.find((u) => u.isCurrentUser)
                        ?.multiplier || BigInt(0)
                    ).level
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
