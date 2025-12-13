"use client";

import { useReadContract } from "wagmi";
import {
  POLL_FACTORY_ADDRESS,
  POLL_FACTORY_ABI,
  POLL_ABI,
} from "@/lib/contracts";
import { useState, useEffect } from "react";
import { getTimeRemaining } from "@/lib/calculations";
import { Share2 } from "lucide-react";

interface PollListProps {
  onSelectPoll: (pollAddress: string, options: string[]) => void;
  refreshTrigger?: number; // Add this to force refresh from parent
  onShare?: (pollAddress: string, pollQuestion: string) => void; // Add share callback
}

export function PollList({ onSelectPoll, refreshTrigger, onShare }: PollListProps) {
  const [selectedPollIndex, setSelectedPollIndex] = useState<number | null>(
    null
  );

  // Fetch recent polls with query configuration
  const { data: recentPolls, refetch, isLoading, isError, error, status } = useReadContract({
    address: POLL_FACTORY_ADDRESS,
    abi: POLL_FACTORY_ABI,
    functionName: "getRecentPolls",
    args: [10n],
    query: {
      refetchInterval: 10000, // Reduced to every 10 seconds to prevent timeouts
      staleTime: 5000,
    },
  });


  // Debug logging
  useEffect(() => {
    console.log("PollList data state:", {
      recentPolls,
      isLoading,
      isError,
      error,
      pollCount: recentPolls?.length
    });
  }, [recentPolls, isLoading, isError, error]);

  // Refetch when refreshTrigger changes (from parent)
  useEffect(() => {
    if (refreshTrigger !== undefined && refreshTrigger > 0) {
      console.log("Refetching polls due to refreshTrigger:", refreshTrigger);
      refetch();
    }
  }, [refreshTrigger, refetch]);

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-slate-800/40 to-slate-700/20 backdrop-blur-lg rounded-2xl p-8 border border-slate-700/50 text-center">
        <div className="text-6xl mb-4">⏳</div>
        <h3 className="text-xl font-bold text-white mb-2">Loading Polls...</h3>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-gradient-to-br from-slate-800/40 to-slate-700/20 backdrop-blur-lg rounded-2xl p-8 border border-slate-700/50 text-center">
        <div className="text-6xl mb-4">❌</div>
        <h3 className="text-xl font-bold text-white mb-2">Error Loading Polls</h3>
        <p className="text-slate-400 text-sm">{error?.message || "Unknown error"}</p>
      </div>
    );
  }

  if (!recentPolls || recentPolls.length === 0) {
    return (
      <div className="bg-gradient-to-br from-slate-800/40 to-slate-700/20 backdrop-blur-lg rounded-2xl p-8 border border-slate-700/50 text-center">
        <div className="text-6xl mb-4">📋</div>
        <h3 className="text-xl font-bold text-white mb-2">No Polls Yet</h3>
        <p className="text-slate-400 mb-4">Create the first poll to get started!</p>
        <div className="mt-6 p-4 bg-amber-950/30 border border-amber-500/30 rounded-lg">
          <p className="text-amber-400 text-sm font-semibold mb-2">⚠️ Setup Required</p>
          <p className="text-slate-300 text-xs mb-3">To create polls, ensure your local blockchain is running:</p>
          <ol className="text-left text-slate-400 text-xs space-y-1 max-w-md mx-auto">
            <li>1. Start Anvil: <code className="text-emerald-400 bg-slate-900/50 px-2 py-0.5 rounded">anvil --host 0.0.0.0 --cors-origins "*"</code></li>
            <li>2. Deploy contracts: <code className="text-emerald-400 bg-slate-900/50 px-2 py-0.5 rounded">forge script script/DeployLocal.s.sol --broadcast --rpc-url http://localhost:8545</code></li>
            <li>3. Connect MetaMask to Anvil (Chain ID: 31337, RPC: http://localhost:3000/api/rpc)</li>
          </ol>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-bold text-white mb-4">Recent Polls</h3>
      <div className="grid gap-4">
        {recentPolls.map((pollAddress, index) => (
          <PollCard
            key={`${pollAddress}-${index}`}
            pollAddress={pollAddress}
            index={index}
            isSelected={selectedPollIndex === index}
            onSelect={(options) => {
              setSelectedPollIndex(index);
              onSelectPoll(pollAddress, options);
            }}
            onShare={onShare}
          />
        ))}
      </div>
    </div>
  );
}

interface PollCardProps {
  pollAddress: string;
  index: number;
  isSelected: boolean;
  onSelect: (options: string[]) => void;
  onShare?: (pollAddress: string, pollQuestion: string) => void;
}

function PollCard({ pollAddress, index, isSelected, onSelect, onShare }: PollCardProps) {
  // Fetch poll data directly from the Poll contract
  const { data: question } = useReadContract({
    address: pollAddress as `0x${string}`,
    abi: POLL_ABI,
    functionName: "question",
  });

  const { data: options } = useReadContract({
    address: pollAddress as `0x${string}`,
    abi: POLL_ABI,
    functionName: "getOptions",
  });

  const { data: endTime } = useReadContract({
    address: pollAddress as `0x${string}`,
    abi: POLL_ABI,
    functionName: "endTime",
  });

  const { data: isActive } = useReadContract({
    address: pollAddress as `0x${string}`,
    abi: POLL_ABI,
    functionName: "isActive",
  });

  const { data: totalVoters } = useReadContract({
    address: pollAddress as `0x${string}`,
    abi: POLL_ABI,
    functionName: "totalVoters",
  });

  if (!question || !options) return null;

  const timeRemaining = endTime ? getTimeRemaining(endTime) : "Unknown";
  const isEnded = timeRemaining === "Ended";

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering poll selection
    if (onShare && question) {
      onShare(pollAddress, question as string);
    }
  };

  return (
    <div
      onClick={() => onSelect(options as string[])}
      className={`bg-gradient-to-br backdrop-blur-lg rounded-xl p-6 border transition-all cursor-pointer ${
        isSelected
          ? "from-emerald-500/20 to-teal-500/10 border-emerald-500/50 shadow-lg shadow-emerald-500/20 scale-[1.02]"
          : "from-slate-800/40 to-slate-700/20 border-slate-700/50 hover:border-slate-600/50 hover:bg-slate-700/30"
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-mono text-slate-500">
              #{index + 1}
            </span>
            {isEnded ? (
              <span className="px-2 py-0.5 bg-red-500/20 border border-red-500/30 rounded-full text-xs text-red-400 font-semibold">
                Ended
              </span>
            ) : (
              <span className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-xs text-emerald-400 font-semibold">
                Active
              </span>
            )}
          </div>
          <h4 className="text-lg font-bold text-white mb-2">{question}</h4>
          <p className="text-sm text-slate-400">{options.length} options</p>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-slate-500">Voters: </span>
            <span className="text-emerald-400 font-semibold">
              {totalVoters?.toString() || "0"}
            </span>
          </div>
          <div>
            <span className="text-slate-500">Ends: </span>
            <span className={isEnded ? "text-red-400" : "text-emerald-400"}>
              {timeRemaining}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onShare && (
            <button
              onClick={handleShare}
              className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-700/50 rounded-lg"
              title="Share poll"
            >
              <Share2 className="w-4 h-4" />
            </button>
          )}
          <button className="text-emerald-400 hover:text-emerald-300 transition-colors font-semibold">
            {isSelected ? "Selected ✓" : "View →"}
          </button>
        </div>
      </div>
    </div>
  );
}


