"use client";

import { useReadContract } from "wagmi";
import {
  POLL_FACTORY_ADDRESS,
  POLL_FACTORY_ABI,
  POLL_ABI,
} from "@/lib/contracts";
import { useState, useEffect } from "react";
import { getTimeRemaining } from "@/lib/calculations";

interface PollListProps {
  onSelectPoll: (pollAddress: string, options: string[]) => void;
  refreshTrigger?: number; // Add this to force refresh from parent
}

export function PollList({ onSelectPoll, refreshTrigger }: PollListProps) {
  const [selectedPollIndex, setSelectedPollIndex] = useState<number | null>(
    null
  );

  // Fetch recent polls with query configuration
  const { data: recentPolls, refetch, isLoading, isError, error } = useReadContract({
    address: POLL_FACTORY_ADDRESS,
    abi: POLL_FACTORY_ABI,
    functionName: "getRecentPolls",
    args: [10n],
    query: {
      refetchInterval: 5000, // Refetch every 5 seconds
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
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 text-center">
        <div className="text-6xl mb-4">⏳</div>
        <h3 className="text-xl font-bold text-white mb-2">Loading Polls...</h3>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 text-center">
        <div className="text-6xl mb-4">❌</div>
        <h3 className="text-xl font-bold text-white mb-2">Error Loading Polls</h3>
        <p className="text-gray-400 text-sm">{error?.message || "Unknown error"}</p>
      </div>
    );
  }

  if (!recentPolls || recentPolls.length === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 text-center">
        <div className="text-6xl mb-4">📋</div>
        <h3 className="text-xl font-bold text-white mb-2">No Polls Yet</h3>
        <p className="text-gray-400">Create the first poll to get started!</p>
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
}

function PollCard({ pollAddress, index, isSelected, onSelect }: PollCardProps) {
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

  return (
    <div
      onClick={() => onSelect(options as string[])}
      className={`bg-white/5 backdrop-blur-lg rounded-xl p-6 border transition-all cursor-pointer ${
        isSelected
          ? "border-indigo-500 shadow-lg shadow-indigo-500/30 scale-[1.02]"
          : "border-white/10 hover:border-white/20 hover:bg-white/10"
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-mono text-gray-500">
              #{index + 1}
            </span>
            {isEnded ? (
              <span className="px-2 py-0.5 bg-red-500/20 border border-red-500/30 rounded-full text-xs text-red-400">
                Ended
              </span>
            ) : (
              <span className="px-2 py-0.5 bg-green-500/20 border border-green-500/30 rounded-full text-xs text-green-400">
                Active
              </span>
            )}
          </div>
          <h4 className="text-lg font-bold text-white mb-2">{question}</h4>
          <p className="text-sm text-gray-400">{options.length} options</p>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-gray-500">Voters: </span>
            <span className="text-indigo-400 font-semibold">
              {totalVoters?.toString() || "0"}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Ends: </span>
            <span className={isEnded ? "text-red-400" : "text-green-400"}>
              {timeRemaining}
            </span>
          </div>
        </div>
        <button className="text-indigo-400 hover:text-indigo-300 transition-colors font-semibold">
          {isSelected ? "Selected ✓" : "View →"}
        </button>
      </div>
    </div>
  );
}


