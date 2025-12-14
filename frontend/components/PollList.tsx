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
import { PollCardSkeleton } from "./SkeletonLoader";
import {
  getCategoryFromQuestion,
  getCategoryById,
  CategoryId,
} from "@/lib/categories";

interface PollListProps {
  onSelectPoll: (
    pollAddress: string,
    options: string[],
    question?: string
  ) => void;
  refreshTrigger?: number;
  onShare?: (pollAddress: string, pollQuestion: string) => void;
  searchQuery?: string;
  filterStatus?: "all" | "active" | "ended";
  filterPopularity?: "all" | "popular" | "new";
  sortBy?: "recent" | "votes" | "ending";
  filterCategory?: CategoryId | "all";
}

export function PollList({
  onSelectPoll,
  refreshTrigger,
  onShare,
  searchQuery = "",
  filterStatus = "all",
  filterPopularity = "all",
  sortBy = "recent",
  filterCategory = "all",
}: PollListProps) {
  const [selectedPollIndex, setSelectedPollIndex] = useState<number | null>(
    null
  );
  const [filteredPolls, setFilteredPolls] = useState<string[]>([]);

  // Fetch recent polls with query configuration
  const {
    data: recentPolls,
    refetch,
    isLoading,
    isError,
    error,
    status,
  } = useReadContract({
    address: POLL_FACTORY_ADDRESS,
    abi: POLL_FACTORY_ABI,
    functionName: "getRecentPolls",
    args: [10n],
    query: {
      refetchInterval: 5000, // Check every 5 seconds for new polls
      staleTime: 0, // Don't cache - always fetch fresh data
    },
  });

  // Debug logging
  useEffect(() => {
    // Intentionally no console spam in production UI.
  }, [recentPolls, isLoading, isError, error]);

  // Refetch when refreshTrigger changes (from parent)
  useEffect(() => {
    if (refreshTrigger !== undefined && refreshTrigger > 0) {
      console.log("🔄 Refetching polls due to trigger:", refreshTrigger);
      // Add a small delay to allow the transaction to be mined and indexed
      const timer = setTimeout(() => {
      refetch();
      }, 1000); // 1 second delay
      return () => clearTimeout(timer);
    }
  }, [refreshTrigger, refetch]);

  // Also refetch whenever recentPolls data changes
  useEffect(() => {
    if (recentPolls) {
      console.log("📊 Polls updated, count:", recentPolls.length);
    }
  }, [recentPolls]);

  // Filter and sort polls
  // Note: Category filtering is implemented at the card level via getCategoryFromQuestion
  // The actual filtering by category needs contract-level support or client-side filtering
  // after fetching all poll questions. For now, polls are displayed with category badges.
  useEffect(() => {
    if (!recentPolls || recentPolls.length === 0) {
      setFilteredPolls([]);
      return;
    }

    let polls = [...recentPolls];
    setFilteredPolls(polls);
  }, [
    recentPolls,
    searchQuery,
    filterStatus,
    filterPopularity,
    sortBy,
    filterCategory,
  ]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <PollCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-gradient-to-br from-slate-800/40 to-slate-700/20 backdrop-blur-lg rounded-2xl p-8 border border-slate-700/50 text-center">
        <div className="text-6xl mb-4">❌</div>
        <h3 className="text-xl font-bold text-white mb-2">
          Error Loading Polls
        </h3>
        <p className="text-slate-400 text-sm">
          {error?.message || "Unknown error"}
        </p>
      </div>
    );
  }

  if (!recentPolls || recentPolls.length === 0) {
    return (
      <div className="bg-gradient-to-br from-slate-800/40 to-slate-700/20 backdrop-blur-lg rounded-2xl p-8 border border-slate-700/50 text-center">
        <div className="text-6xl mb-4">📋</div>
        <h3 className="text-xl font-bold text-white mb-2">No Polls Yet</h3>
        <p className="text-slate-400 mb-4">
          Create the first poll to get started!
        </p>
        <div className="mt-6 p-4 bg-blue-950/30 border border-blue-500/30 rounded-lg">
          <p className="text-blue-400 text-sm font-semibold mb-2">
            💡 Ready to Start
          </p>
          <p className="text-slate-300 text-xs mb-3">
            Contracts are deployed on Arbitrum Sepolia testnet:
          </p>
          <ol className="text-left text-slate-400 text-xs space-y-1 max-w-md mx-auto">
            <li>
              1. Make sure you're connected to{" "}
              <span className="text-emerald-400 font-semibold">Arbitrum Sepolia</span> in MetaMask
            </li>
            <li>
              2. Get free test ETH from{" "}
              <a 
                href="https://faucet.quicknode.com/arbitrum/sepolia" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                faucet
              </a>
            </li>
            <li>
              3. Click "Get Free Tokens" to mint REP tokens
            </li>
            <li>
              4. Create your first poll!
            </li>
          </ol>
        </div>
      </div>
    );
  }

  const pollsToDisplay = filteredPolls.length > 0 ? filteredPolls : recentPolls;

  if (pollsToDisplay.length === 0 && searchQuery) {
    return (
      <div className="bg-gradient-to-br from-slate-800/40 to-slate-700/20 backdrop-blur-lg rounded-2xl p-8 border border-slate-700/50 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-bold text-white mb-2">No Results Found</h3>
        <p className="text-slate-400">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {pollsToDisplay.map((pollAddress, index) => (
        <PollCard
          key={`${pollAddress}-${index}`}
          pollAddress={pollAddress}
          index={index}
          isSelected={selectedPollIndex === index}
          onSelect={(options, question) => {
            setSelectedPollIndex(index);
            onSelectPoll(pollAddress, options, question);
          }}
          onShare={onShare}
          searchQuery={searchQuery}
          onCategoryClick={() => {}} // Will be wired up from parent
        />
      ))}
    </div>
  );
}

interface PollCardProps {
  pollAddress: string;
  index: number;
  isSelected: boolean;
  onSelect: (options: string[], question: string) => void;
  onShare?: (pollAddress: string, pollQuestion: string) => void;
  searchQuery?: string;
  onCategoryClick?: (category: CategoryId) => void;
}

function PollCard({
  pollAddress,
  index,
  isSelected,
  onSelect,
  onShare,
  searchQuery,
  onCategoryClick,
}: PollCardProps) {
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

  // Get category from question
  const categoryId = getCategoryFromQuestion(question as string);
  const category = getCategoryById(categoryId);

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering poll selection
    if (onShare && question) {
      onShare(pollAddress, question as string);
    }
  };

  const handleCategoryClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering poll selection
    if (onCategoryClick) {
      onCategoryClick(categoryId);
    }
  };

  return (
    <div
      onClick={() => onSelect(options as string[], question as string)}
      className={`group relative bg-[#131a22] backdrop-blur-sm rounded-xl p-5 border transition-all duration-300 cursor-pointer overflow-hidden animate-fade-in ${
        isSelected
          ? "border-emerald-500/60 shadow-lg shadow-emerald-500/20 scale-[1.02]"
          : "border-slate-800/40 hover:border-emerald-500/30 hover:bg-[#1a2332] hover:scale-[1.01] hover:shadow-md"
      }`}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-400 to-teal-500" />
      )}

      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Status Badge and Category */}
          <div className="flex items-center gap-2 mb-2">
            {isEnded ? (
              <span className="px-2 py-0.5 bg-slate-700/50 border border-slate-600/50 rounded text-xs text-slate-400 font-medium">
                Closed
              </span>
            ) : (
              <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 rounded text-xs text-emerald-400 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </span>
            )}
            <button
              onClick={handleCategoryClick}
              className={`px-2 py-0.5 ${category.bgColor} border ${category.borderColor} rounded text-xs ${category.color} font-medium flex items-center gap-1 hover:opacity-80 transition-opacity`}
            >
              <span>{category.icon}</span>
              <span>{category.name}</span>
            </button>
            <span className="text-xs text-slate-500">#{index + 1}</span>
          </div>

          {/* Question */}
          <h4 className="text-base font-semibold text-white mb-3 line-clamp-2 group-hover:text-emerald-400 transition-colors">
            {question}
          </h4>

          {/* Stats Row */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded bg-slate-800/50 flex items-center justify-center">
                <span className="text-[10px]">👥</span>
              </div>
              <span className="text-slate-400">
                {totalVoters?.toString() || "0"}
              </span>
              <span className="text-slate-600">voters</span>
            </div>
            <div className="w-px h-3 bg-slate-700/50" />
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded bg-slate-800/50 flex items-center justify-center">
                <span className="text-[10px]">⏱️</span>
              </div>
              <span className={isEnded ? "text-slate-500" : "text-emerald-400"}>
                {timeRemaining}
              </span>
            </div>
            <div className="w-px h-3 bg-slate-700/50" />
            <div className="flex items-center gap-1.5">
              <span className="text-slate-600">{options.length} options</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {onShare && (
            <button
              onClick={handleShare}
              className="p-2 text-slate-500 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors"
              title="Share"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          )}
          <div
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
            isSelected
              ? "bg-emerald-500/20 text-emerald-400"
              : "text-slate-400 group-hover:text-white group-hover:bg-slate-800/50"
            }`}
          >
            {isSelected ? "Active" : "View"}
          </div>
        </div>
      </div>
    </div>
  );
}
