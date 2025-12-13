"use client";

import { RepDisplay } from "@/components/RepDisplay";
import { VoteCard } from "@/components/VoteCard";
import { ResultsChart } from "@/components/ResultsChart";
import { PolymarketStyleVote } from "@/components/PolymarketStyleVote";
import { CreatePollModal } from "@/components/CreatePollModal";
import { PollList } from "@/components/PollList";
import { ShareModal } from "@/components/ShareModal";
import { ReputationLeaderboard } from "@/components/ReputationLeaderboard";
import { VotingHistory } from "@/components/VotingHistory";
import { useReadContract, useAccount } from "wagmi";
import { POLL_FACTORY_ADDRESS, POLL_FACTORY_ABI } from "@/lib/contracts";
import { useState } from "react";
import { TrendingUp, Plus, Search, Filter, BarChart3, Clock, Users } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { NetworkHealth } from "@/components/NetworkHealth";
import { Navigation } from "@/components/Navigation";

// Demo poll address - Create your first poll using the "Create Poll" button!
// Once created, you can paste the address here or select from PollList
const DEMO_POLL_ADDRESS =
  "0x0000000000000000000000000000000000000000" as `0x${string}`;


export default function Home() {
  const { address: userAddress } = useAccount();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [shareData, setShareData] = useState<{ address: string; question: string } | null>(null);
  const [selectedPoll, setSelectedPoll] = useState<{
    address: string;
    options: string[];
    question?: string;
  } | null>(null);
  const [activeView, setActiveView] = useState<
    "markets" | "leaderboard" | "history"
  >("markets");
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handlePollCreated = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleVoteSuccess = () => {
    // Trigger results chart refresh
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleShare = (address: string, question: string) => {
    setShareData({ address, question });
    setIsShareOpen(true);
  };

  const demoOptions = ["Security Audit", "Mobile App Development", "UX Polish"];

  const { data: pollCount } = useReadContract({
    address: POLL_FACTORY_ADDRESS,
    abi: POLL_FACTORY_ABI,
    functionName: "getPollCount",
    query: { refetchInterval: 15000 },
  });

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Navigation */}
      <Navigation onCreateClick={() => setIsCreateModalOpen(true)} showCreateButton={true} />
      
      {/* Sub Navigation for Dashboard Views */}
      <div className="bg-slate-900/40 border-b border-slate-800/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 py-3">
            <button
              onClick={() => setActiveView("markets")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeView === "markets"
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              📊 Markets
            </button>
            <button
              onClick={() => setActiveView("leaderboard")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeView === "leaderboard"
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              🏆 Leaderboard
            </button>
            <button
              onClick={() => setActiveView("history")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeView === "history"
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              📜 Activity
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Network Status Banner */}
        <NetworkHealth />

        {/* User Stats Bar - Polymarket Style */}
        <div className="mt-6 mb-8">
          <RepDisplay />
        </div>

        {/* Content based on active view */}
        {activeView === "markets" && (
          <div className="space-y-6">
            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search markets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-700/60 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                />
              </div>
              <div className="flex gap-2">
                <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-900/60 border border-slate-700/60 rounded-lg text-slate-300 hover:text-white hover:border-slate-600/60 transition-all">
                  <Filter className="w-4 h-4" />
                  <span className="text-sm">Filter</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-900/60 border border-slate-700/60 rounded-lg text-slate-300 hover:text-white hover:border-slate-600/60 transition-all">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm">Trending</span>
                </button>
              </div>
            </div>

            {/* Selected Poll - Full Width Polymarket Style */}
            {selectedPoll ? (
              <PolymarketStyleVote
                pollAddress={selectedPoll.address as `0x${string}`}
                options={selectedPoll.options}
                question={selectedPoll.question || "Market Question"}
                onVoteSuccess={handleVoteSuccess}
              />
            ) : (
              /* Markets Grid - When no poll selected */
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Market List */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-emerald-400" />
                      Active Markets
                    </h2>
                    <span className="text-sm text-slate-400">
                      {pollCount?.toString() ?? "0"} markets
                    </span>
                  </div>
                  
                  <PollList
                    onSelectPoll={(address, options, question) =>
                      setSelectedPoll({ address, options, question })
                    }
                    refreshTrigger={refreshTrigger}
                    onShare={handleShare}
                  />
                </div>

                {/* Right Column - Placeholder */}
                <div className="space-y-4">
                  <div className="sticky top-24 bg-gradient-to-br from-slate-900/60 to-slate-800/40 backdrop-blur-lg rounded-xl p-8 border border-slate-700/50 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800/50 flex items-center justify-center">
                      <BarChart3 className="w-8 h-8 text-slate-600" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">
                      Select a Market
                    </h3>
                    <p className="text-slate-400 text-sm">
                      Choose a poll from the list to view details and cast your vote
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeView === "leaderboard" && (
          <div className="max-w-4xl mx-auto">
            <ReputationLeaderboard />
          </div>
        )}

        {activeView === "history" && (
          <div className="max-w-5xl mx-auto">
            <VotingHistory />
          </div>
        )}

        {/* Info Cards Section - Only show in markets view */}
        {activeView === "markets" && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Real-Time Results</h3>
                  <p className="text-slate-400 text-sm">
                    Watch votes update live as the community decides
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/5 border border-purple-500/20 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Earn Reputation</h3>
                  <p className="text-slate-400 text-sm">
                    Build influence through consistent participation
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Sybil Resistant</h3>
                  <p className="text-slate-400 text-sm">
                    Quadratic voting prevents manipulation attacks
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Compact Footer */}
      <footer className="border-t border-slate-800/50 bg-slate-900/40 backdrop-blur-xl mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6 text-sm text-slate-400">
              <a href="/docs" className="hover:text-emerald-400 transition-colors">Docs</a>
              <a href="#" className="hover:text-emerald-400 transition-colors">GitHub</a>
              <a href="#" className="hover:text-emerald-400 transition-colors">Discord</a>
            </div>
            <div className="text-slate-500 text-sm">
              © 2025 RepVote • Powered by Quadratic Voting
            </div>
          </div>
        </div>
      </footer>

      {/* Share Modal */}
      {shareData && (
        <ShareModal
          isOpen={isShareOpen}
          onClose={() => setIsShareOpen(false)}
          pollAddress={shareData.address}
          pollQuestion={shareData.question}
        />
      )}

      {/* Create Poll Modal */}
      <CreatePollModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handlePollCreated}
      />
    </div>
  );
}
