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
import { useState, useEffect, useRef } from "react";
import { TrendingUp, Plus, Search, Filter, BarChart3, Clock, Users, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { NetworkHealth } from "@/components/NetworkHealth";
import { Navigation } from "@/components/Navigation";
import { OnboardingTooltip } from "@/components/OnboardingTooltip";
import { CategoryFilter } from "@/components/CategoryFilter";
import { CategoryId } from "@/lib/categories";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'ended'>('all');
  const [filterPopularity, setFilterPopularity] = useState<'all' | 'popular' | 'new'>('all');
  const [filterCategory, setFilterCategory] = useState<CategoryId | 'all'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'votes' | 'ending'>('recent');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilterMenu(false);
      }
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setShowSortMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    <div className="min-h-screen bg-[#0f1419]">
      {/* Navigation */}
      <Navigation onCreateClick={() => setIsCreateModalOpen(true)} showCreateButton={true} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Network Status Banner */}
        <NetworkHealth />

        {/* User Stats Bar - Polymarket Style */}
        <div className="mt-6 mb-8">
          <RepDisplay />
        </div>

        {/* Unified Dashboard - Dynamic Layout */}
        <div className={`animate-fade-in ${selectedPoll ? '' : 'grid grid-cols-1 lg:grid-cols-3 gap-6'}`}>
          {/* Left Column - Active Markets */}
          <div className={`space-y-6 animate-slide-up ${selectedPoll ? '' : 'lg:col-span-2'}`}>
            {/* Category Filter */}
            {!selectedPoll && (
              <div className="animate-fade-in">
                <CategoryFilter 
                  selectedCategory={filterCategory}
                  onCategoryChange={setFilterCategory}
                />
              </div>
            )}
            
            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between animate-fade-in">
              <div className="flex gap-2 flex-1 max-w-md">
                <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search markets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-900/60 border border-slate-700/60 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <button
                  onClick={() => handlePollCreated()}
                  className="px-3 py-2.5 bg-slate-900/60 border border-slate-700/60 rounded-lg text-slate-300 hover:text-white hover:border-emerald-500/60 transition-all group"
                  title="Refresh markets"
                >
                  <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                </button>
              </div>
              <div className="flex gap-2">
                {/* Filter Button with Dropdown */}
                <div className="relative" ref={filterRef}>
                  <button 
                    onClick={() => {
                      setShowFilterMenu(!showFilterMenu);
                      setShowSortMenu(false);
                    }}
                    className={`flex items-center gap-2 px-4 py-2.5 bg-slate-900/60 border rounded-lg text-slate-300 hover:text-white hover:border-slate-600/60 transition-all ${
                      (filterStatus !== 'all' || filterPopularity !== 'all') 
                        ? 'border-emerald-500/60 text-emerald-400' 
                        : 'border-slate-700/60'
                    }`}
                  >
                  <Filter className="w-4 h-4" />
                  <span className="text-sm">Filter</span>
                    {(filterStatus !== 'all' || filterPopularity !== 'all') && (
                      <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                    )}
                  </button>
                  {showFilterMenu && (
                    <div className="absolute top-full mt-2 right-0 w-64 bg-slate-900/95 backdrop-blur-xl border border-slate-700/60 rounded-lg shadow-xl z-50 p-4">
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs text-slate-400 font-medium mb-2 block">Status</label>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setFilterStatus('all')}
                              className={`flex-1 px-3 py-1.5 rounded text-xs font-medium transition-all ${
                                filterStatus === 'all' 
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                                  : 'bg-slate-800/50 text-slate-400 border border-slate-700/40 hover:text-white'
                              }`}
                            >
                              All
                            </button>
                            <button
                              onClick={() => setFilterStatus('active')}
                              className={`flex-1 px-3 py-1.5 rounded text-xs font-medium transition-all ${
                                filterStatus === 'active' 
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                                  : 'bg-slate-800/50 text-slate-400 border border-slate-700/40 hover:text-white'
                              }`}
                            >
                              Active
                            </button>
                            <button
                              onClick={() => setFilterStatus('ended')}
                              className={`flex-1 px-3 py-1.5 rounded text-xs font-medium transition-all ${
                                filterStatus === 'ended' 
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                                  : 'bg-slate-800/50 text-slate-400 border border-slate-700/40 hover:text-white'
                              }`}
                            >
                              Ended
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-slate-400 font-medium mb-2 block">Popularity</label>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setFilterPopularity('all')}
                              className={`flex-1 px-3 py-1.5 rounded text-xs font-medium transition-all ${
                                filterPopularity === 'all' 
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                                  : 'bg-slate-800/50 text-slate-400 border border-slate-700/40 hover:text-white'
                              }`}
                            >
                              All
                            </button>
                            <button
                              onClick={() => setFilterPopularity('popular')}
                              className={`flex-1 px-3 py-1.5 rounded text-xs font-medium transition-all ${
                                filterPopularity === 'popular' 
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                                  : 'bg-slate-800/50 text-slate-400 border border-slate-700/40 hover:text-white'
                              }`}
                            >
                              Popular
                            </button>
                            <button
                              onClick={() => setFilterPopularity('new')}
                              className={`flex-1 px-3 py-1.5 rounded text-xs font-medium transition-all ${
                                filterPopularity === 'new' 
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                                  : 'bg-slate-800/50 text-slate-400 border border-slate-700/40 hover:text-white'
                              }`}
                            >
                              New
                            </button>
                          </div>
                        </div>
                        {(filterStatus !== 'all' || filterPopularity !== 'all') && (
                          <button
                            onClick={() => {
                              setFilterStatus('all');
                              setFilterPopularity('all');
                            }}
                            className="w-full px-3 py-1.5 bg-red-500/20 text-red-400 border border-red-500/40 rounded text-xs font-medium hover:bg-red-500/30 transition-all"
                          >
                            Clear Filters
                </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Sort/Trending Button with Dropdown */}
                <div className="relative" ref={sortRef}>
                  <button 
                    onClick={() => {
                      setShowSortMenu(!showSortMenu);
                      setShowFilterMenu(false);
                    }}
                    className={`flex items-center gap-2 px-4 py-2.5 bg-slate-900/60 border rounded-lg text-slate-300 hover:text-white hover:border-slate-600/60 transition-all ${
                      sortBy !== 'recent' 
                        ? 'border-emerald-500/60 text-emerald-400' 
                        : 'border-slate-700/60'
                    }`}
                  >
                  <TrendingUp className="w-4 h-4" />
                    <span className="text-sm">
                      {sortBy === 'recent' ? 'Recent' : sortBy === 'votes' ? 'Trending' : 'Ending Soon'}
                    </span>
                  </button>
                  {showSortMenu && (
                    <div className="absolute top-full mt-2 right-0 w-48 bg-slate-900/95 backdrop-blur-xl border border-slate-700/60 rounded-lg shadow-xl z-50 p-2">
                      <button
                        onClick={() => {
                          setSortBy('recent');
                          setShowSortMenu(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded text-sm transition-all ${
                          sortBy === 'recent' 
                            ? 'bg-emerald-500/20 text-emerald-400' 
                            : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                        }`}
                      >
                        📅 Most Recent
                      </button>
                      <button
                        onClick={() => {
                          setSortBy('votes');
                          setShowSortMenu(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded text-sm transition-all ${
                          sortBy === 'votes' 
                            ? 'bg-emerald-500/20 text-emerald-400' 
                            : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                        }`}
                      >
                        🔥 Most Votes
                      </button>
                      <button
                        onClick={() => {
                          setSortBy('ending');
                          setShowSortMenu(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded text-sm transition-all ${
                          sortBy === 'ending' 
                            ? 'bg-emerald-500/20 text-emerald-400' 
                            : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                        }`}
                      >
                        ⏰ Ending Soon
                </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Markets Header with Back Button */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {selectedPoll && (
                  <button
                    onClick={() => setSelectedPoll(null)}
                    className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 border border-slate-700/60 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/70 transition-all group"
                  >
                    <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="text-sm font-medium hidden sm:inline">Back</span>
                  </button>
                )}
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-emerald-400" />
                  {selectedPoll ? "Market Details" : "Active Markets"}
                </h2>
              </div>
              <span className="text-sm text-slate-400">
                {pollCount?.toString() ?? "0"} markets
              </span>
            </div>

            {/* Selected Poll - Full Width Polymarket Style */}
            {selectedPoll ? (
              <>
              <PolymarketStyleVote
                pollAddress={selectedPoll.address as `0x${string}`}
                options={selectedPoll.options}
                question={selectedPoll.question || "Market Question"}
                onVoteSuccess={handleVoteSuccess}
              />
                
                {/* Other Markets Section - Below Current Market */}
                <div className="mt-12 pt-8 border-t border-slate-800/50">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      🔍 Explore Other Markets
                    </h3>
                    <button
                      onClick={() => setSelectedPoll(null)}
                      className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
                    >
                      View All →
                    </button>
                  </div>
                  <PollList
                    onSelectPoll={(address, options, question) =>
                      setSelectedPoll({ address, options, question })
                    }
                    refreshTrigger={refreshTrigger}
                    onShare={handleShare}
                    searchQuery={searchQuery}
                    filterStatus={filterStatus}
                    filterPopularity={filterPopularity}
                    sortBy={sortBy}
                    filterCategory={filterCategory}
                  />
                </div>
              </>
            ) : (
              /* Market List */
              <PollList
                onSelectPoll={(address, options, question) =>
                  setSelectedPoll({ address, options, question })
                }
                refreshTrigger={refreshTrigger}
                onShare={handleShare}
                searchQuery={searchQuery}
                filterStatus={filterStatus}
                filterPopularity={filterPopularity}
                sortBy={sortBy}
                filterCategory={filterCategory}
                  />
            )}
                </div>

          {/* Right Column - Leaderboard + Activity (Only show when no poll selected) */}
          {!selectedPoll && (
            <div className="space-y-6 animate-scale-in" style={{ animationDelay: '0.1s' }}>
              {/* Compact Leaderboard - Top 5 */}
              <div className="bg-gradient-to-br from-slate-900/60 to-slate-800/40 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    🏆 Top Contributors
                  </h3>
                  <a href="/governance" className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
                    View All →
                  </a>
                </div>
                <ReputationLeaderboard compact={true} limit={5} />
                    </div>

              {/* Activity Feed */}
              <div className="bg-gradient-to-br from-slate-900/60 to-slate-800/40 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    📜 Recent Activity
                    </h3>
                  <a href="/governance" className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
                    View All →
                  </a>
                </div>
                <VotingHistory compact={true} limit={5} />
              </div>

              {/* Quick Stats */}
              <div className="bg-gradient-to-br from-slate-900/60 to-slate-800/40 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
                <h3 className="text-lg font-bold text-white mb-4">Platform Stats</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">Total Markets</span>
                    <span className="text-white font-bold">{pollCount?.toString() ?? "0"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">24h Volume</span>
                    <span className="text-emerald-400 font-bold">1,247</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">Active Users</span>
                    <span className="text-amber-400 font-bold">328</span>
                  </div>
                </div>
              </div>
          </div>
        )}
          </div>

        {/* Info Cards Section */}
        <div className="mt-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
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
        </div>
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

      {/* Onboarding Tooltip */}
      <OnboardingTooltip />
    </div>
  );
}
