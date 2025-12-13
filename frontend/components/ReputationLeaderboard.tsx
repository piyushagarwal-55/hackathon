"use client";

import { useReadContract, useAccount } from "wagmi";
import {
  REPUTATION_REGISTRY_ADDRESS,
  REPUTATION_REGISTRY_ABI,
} from "@/lib/contracts";
import { getReputationLevel, formatNumber } from "@/lib/calculations";
import { Trophy } from "lucide-react";
import { useState, useEffect } from "react";

// Fixed list of addresses to check (Anvil default accounts + space for connected user)
const KNOWN_ADDRESSES = [
  "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", // Anvil #0
  "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", // Anvil #1
  "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", // Anvil #2
  "0x90F79bf6EB2c4f870365E785982E1f101E93b906", // Anvil #3
  "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65", // Anvil #4
  "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc", // Anvil #5
  "0x976EA74026E726554dB657fA54763abd0C3a0aa9", // Anvil #6
  "0x14dC79964da2C08b23698B3D3cc7Ca32193d9955", // Anvil #7
  "0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f", // Anvil #8
  "0xa0Ee7A142d267C1f36714E4a8F75612F20a79720", // Anvil #9
];

interface LeaderboardEntry {
  address: string;
  reputation: bigint;
  multiplier: bigint;
  isCurrentUser: boolean;
}

export function ReputationLeaderboard() {
  const { address: currentUser } = useAccount();
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>(
    []
  );

  // Create a fixed list of addresses to fetch (known addresses + current user if not in list)
  const addressesToFetch =
    currentUser && !KNOWN_ADDRESSES.includes(currentUser)
      ? [...KNOWN_ADDRESSES, currentUser]
      : KNOWN_ADDRESSES;

  // Fixed number of hooks - one for each address slot
  // We'll fetch up to 11 addresses (10 Anvil + 1 connected user)
  const stats0 = useReadContract({
    address: REPUTATION_REGISTRY_ADDRESS,
    abi: REPUTATION_REGISTRY_ABI,
    functionName: "getUserStats",
    args: [addressesToFetch[0] as `0x${string}`],
    query: { enabled: !!addressesToFetch[0], refetchInterval: 10000 },
  });

  const stats1 = useReadContract({
    address: REPUTATION_REGISTRY_ADDRESS,
    abi: REPUTATION_REGISTRY_ABI,
    functionName: "getUserStats",
    args: [addressesToFetch[1] as `0x${string}`],
    query: { enabled: !!addressesToFetch[1], refetchInterval: 10000 },
  });

  const stats2 = useReadContract({
    address: REPUTATION_REGISTRY_ADDRESS,
    abi: REPUTATION_REGISTRY_ABI,
    functionName: "getUserStats",
    args: [addressesToFetch[2] as `0x${string}`],
    query: { enabled: !!addressesToFetch[2], refetchInterval: 10000 },
  });

  const stats3 = useReadContract({
    address: REPUTATION_REGISTRY_ADDRESS,
    abi: REPUTATION_REGISTRY_ABI,
    functionName: "getUserStats",
    args: [addressesToFetch[3] as `0x${string}`],
    query: { enabled: !!addressesToFetch[3], refetchInterval: 10000 },
  });

  const stats4 = useReadContract({
    address: REPUTATION_REGISTRY_ADDRESS,
    abi: REPUTATION_REGISTRY_ABI,
    functionName: "getUserStats",
    args: [addressesToFetch[4] as `0x${string}`],
    query: { enabled: !!addressesToFetch[4], refetchInterval: 10000 },
  });

  const stats5 = useReadContract({
    address: REPUTATION_REGISTRY_ADDRESS,
    abi: REPUTATION_REGISTRY_ABI,
    functionName: "getUserStats",
    args: [addressesToFetch[5] as `0x${string}`],
    query: { enabled: !!addressesToFetch[5], refetchInterval: 10000 },
  });

  const stats6 = useReadContract({
    address: REPUTATION_REGISTRY_ADDRESS,
    abi: REPUTATION_REGISTRY_ABI,
    functionName: "getUserStats",
    args: [addressesToFetch[6] as `0x${string}`],
    query: { enabled: !!addressesToFetch[6], refetchInterval: 10000 },
  });

  const stats7 = useReadContract({
    address: REPUTATION_REGISTRY_ADDRESS,
    abi: REPUTATION_REGISTRY_ABI,
    functionName: "getUserStats",
    args: [addressesToFetch[7] as `0x${string}`],
    query: { enabled: !!addressesToFetch[7], refetchInterval: 10000 },
  });

  const stats8 = useReadContract({
    address: REPUTATION_REGISTRY_ADDRESS,
    abi: REPUTATION_REGISTRY_ABI,
    functionName: "getUserStats",
    args: [addressesToFetch[8] as `0x${string}`],
    query: { enabled: !!addressesToFetch[8], refetchInterval: 10000 },
  });

  const stats9 = useReadContract({
    address: REPUTATION_REGISTRY_ADDRESS,
    abi: REPUTATION_REGISTRY_ABI,
    functionName: "getUserStats",
    args: [addressesToFetch[9] as `0x${string}`],
    query: { enabled: !!addressesToFetch[9], refetchInterval: 10000 },
  });

  const stats10 = useReadContract({
    address: REPUTATION_REGISTRY_ADDRESS,
    abi: REPUTATION_REGISTRY_ABI,
    functionName: "getUserStats",
    args: addressesToFetch[10]
      ? [addressesToFetch[10] as `0x${string}`]
      : undefined,
    query: { enabled: !!addressesToFetch[10], refetchInterval: 10000 },
  });

  // Collect all stats into an array
  const allStats = [
    stats0,
    stats1,
    stats2,
    stats3,
    stats4,
    stats5,
    stats6,
    stats7,
    stats8,
    stats9,
    stats10,
  ];

  // Build leaderboard from all fetched stats
  useEffect(() => {
    const entries: LeaderboardEntry[] = [];

    allStats.forEach((stat, index) => {
      if (stat.data && addressesToFetch[index]) {
        const [effectiveRep, multiplier] = stat.data as [
          bigint,
          bigint,
          bigint
        ];

        // Only include users with reputation > 0
        if (effectiveRep > 0n) {
          entries.push({
            address: addressesToFetch[index],
            reputation: effectiveRep,
            multiplier: multiplier,
            isCurrentUser:
              currentUser?.toLowerCase() ===
              addressesToFetch[index].toLowerCase(),
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
  }, [
    stats0.data,
    stats1.data,
    stats2.data,
    stats3.data,
    stats4.data,
    stats5.data,
    stats6.data,
    stats7.data,
    stats8.data,
    stats9.data,
    stats10.data,
    currentUser,
  ]);

  if (leaderboardData.length === 0) {
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
        <div className="text-center py-12">
          <div className="text-5xl mb-4">🏆</div>
          <p className="text-slate-300 text-lg mb-2">No Rankings Yet</p>
          <p className="text-slate-400 text-sm">
            Start voting on polls to build your reputation and appear on the
            leaderboard!
          </p>
        </div>
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
        {leaderboardData.map((user, index) => {
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
      {currentUser && leaderboardData.some((u) => u.isCurrentUser) && (
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
                        ?.multiplier || 0n
                    ).color
                  }`}
                >
                  {
                    getReputationLevel(
                      leaderboardData.find((u) => u.isCurrentUser)
                        ?.multiplier || 0n
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
