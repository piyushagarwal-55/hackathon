"use client";

import { RepDisplay } from "@/components/RepDisplay";
import { VoteCard } from "@/components/VoteCard";
import { ResultsChart } from "@/components/ResultsChart";
import { CreatePollModal } from "@/components/CreatePollModal";
import { PollList } from "@/components/PollList";
import { ShareModal } from "@/components/ShareModal";
import { ReputationLeaderboard } from "@/components/ReputationLeaderboard";
import { VotingHistory } from "@/components/VotingHistory";
import { useReadContract } from "wagmi";
import { POLL_FACTORY_ADDRESS, POLL_FACTORY_ABI } from "@/lib/contracts";
import { useState } from "react";
import { ArrowRight, Shield, Calculator, Gavel } from "lucide-react";

// Demo poll address - Create your first poll using the "Create Poll" button!
// Once created, you can paste the address here or select from PollList
const DEMO_POLL_ADDRESS =
  "0x0000000000000000000000000000000000000000" as `0x${string}`;


export default function Home() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [shareData, setShareData] = useState<{ address: string; question: string } | null>(null);
  const [selectedPoll, setSelectedPoll] = useState<{
    address: string;
    options: string[];
  } | null>(null);
  const [activeTab, setActiveTab] = useState<
    "vote" | "leaderboard" | "history"
  >("vote");
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header - Minimal top bar */}
      <header className="border-b border-slate-800/50 bg-slate-950/50 backdrop-blur-lg sticky top-0 z-40">
        <div className="px-6 sm:px-8 lg:px-12 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Dashboard</h2>
              <p className="text-xs text-slate-400">Welcome back to RepVote</p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg font-semibold text-sm transition-all shadow-lg shadow-emerald-500/30 flex items-center gap-2"
            >
              <span>+</span>
              Create Poll
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 sm:px-8 lg:px-12 py-8">
        {/* Hero Section */}
        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Fair Governance Through Reputation
          </h1>
          <p className="text-lg text-slate-300 max-w-3xl">
            RepVote combines reputation weighting with quadratic voting to
            create Sybil-resistant, fair decision-making.
          </p>
        </div>

        {/* User Reputation Card */}
        <div className="mb-12">
          <RepDisplay />
        </div>

        {/* Tabs Navigation */}
        <div className="mb-8 flex gap-2 bg-slate-800/30 backdrop-blur-lg rounded-lg p-2 border border-slate-700/50 w-fit">
          <button
            onClick={() => setActiveTab("vote")}
            className={`px-6 py-2 rounded-md font-semibold text-sm transition-all ${
              activeTab === "vote"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/30"
                : "text-slate-300 hover:text-white"
            }`}
          >
            🗳️ Vote
          </button>
          <button
            onClick={() => setActiveTab("leaderboard")}
            className={`px-6 py-2 rounded-md font-semibold text-sm transition-all ${
              activeTab === "leaderboard"
                ? "bg-amber-600 text-white shadow-lg shadow-amber-500/30"
                : "text-slate-300 hover:text-white"
            }`}
          >
            🏆 Leaderboard
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-6 py-2 rounded-md font-semibold text-sm transition-all ${
              activeTab === "history"
                ? "bg-teal-600 text-white shadow-lg shadow-teal-500/30"
                : "text-slate-300 hover:text-white"
            }`}
          >
            📜 History
          </button>
        </div>

        {/* Content based on active tab */}
        {activeTab === "vote" && (
          <>
            {/* Poll List */}
            <div className="mb-8">
              <PollList
                onSelectPoll={(address, options) =>
                  setSelectedPoll({ address, options })
                }
                refreshTrigger={refreshTrigger}
                onShare={handleShare}
              />
            </div>

            {/* Vote and Results Grid */}
            {selectedPoll ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <VoteCard
                  pollAddress={selectedPoll.address as `0x${string}`}
                  options={selectedPoll.options}
                  onVoteSuccess={handleVoteSuccess}
                />
                <ResultsChart
                  pollAddress={selectedPoll.address as `0x${string}`}
                  options={selectedPoll.options}
                />
              </div>
            ) : (
              <div className="bg-gradient-to-br from-slate-800/40 to-slate-700/40 backdrop-blur-lg rounded-2xl p-12 border border-slate-700/50 text-center">
                <div className="text-6xl mb-4">🚀</div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  Deploy Contracts to Get Started
                </h3>
                <p className="text-slate-400 mb-6 max-w-2xl mx-auto">
                  Follow the deployment instructions in the
                  contracts/DEPLOYMENT.md file to deploy RepVote to Sepolia
                  testnet.
                </p>
                <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-lg p-4 max-w-xl mx-auto">
                  <p className="text-sm text-slate-300 font-mono">
                    cd contracts && forge script script/Deploy.s.sol --broadcast
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === "leaderboard" && <ReputationLeaderboard />}

        {activeTab === "history" && <VotingHistory />}

        {/* Share Modal */}
        {shareData && (
          <ShareModal
            isOpen={isShareOpen}
            onClose={() => setIsShareOpen(false)}
            pollAddress={shareData.address}
            pollQuestion={shareData.question}
          />
        )}

        {/* How It Works - Circuit Board Style */}
        <div className="mt-16 mb-12">
          <h3 className="text-2xl font-bold text-white mb-12 text-center">
            How RepVote Works
          </h3>
          
          <div className="relative">
            {/* Connecting line */}
            <div className="absolute top-20 left-12 right-12 h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent hidden lg:block" />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="relative">
                <div className="flex flex-col items-center">
                  <div className="relative z-10 mb-6">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-600/20 border border-emerald-500/50 flex items-center justify-center">
                      <Shield className="w-10 h-10 text-emerald-400" />
                    </div>
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2 text-center">
                    Identity
                  </h4>
                  <p className="text-slate-400 text-sm text-center">
                    Build your reputation through participation and contributions
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative">
                <div className="flex flex-col items-center">
                  <div className="relative z-10 mb-6">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-amber-500/50 flex items-center justify-center">
                      <Calculator className="w-10 h-10 text-amber-400" />
                    </div>
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2 text-center">
                    Calculation
                  </h4>
                  <p className="text-slate-400 text-sm text-center">
                    Quadratic voting with reputation multipliers (0.3x - 3x)
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative">
                <div className="flex flex-col items-center">
                  <div className="relative z-10 mb-6">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-500/20 to-cyan-600/20 border border-teal-500/50 flex items-center justify-center">
                      <Gavel className="w-10 h-10 text-teal-400" />
                    </div>
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2 text-center">
                    Consensus
                  </h4>
                  <p className="text-slate-400 text-sm text-center">
                    Fair outcomes resistant to Sybils and whale dominance
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Formula Display */}
        <div className="bg-gradient-to-r from-slate-800/50 to-slate-800/30 border border-slate-700/50 rounded-xl p-8 text-center mb-12">
          <p className="text-slate-400 text-sm mb-3 uppercase tracking-wide">
            Vote Weight Calculation
          </p>
          <div className="font-mono text-xl text-emerald-400 mb-2">
            √(credits) × reputation_multiplier = weighted_votes
          </div>
          <p className="text-slate-500 text-xs">
            Prevents whale dominance while rewarding reputation
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 bg-slate-950/50 backdrop-blur-lg mt-16">
        <div className="px-6 sm:px-8 lg:px-12 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div>
                <h4 className="text-white font-semibold mb-3">RepVote</h4>
                <p className="text-slate-400 text-sm">
                  Fair governance through reputation-weighted voting
                </p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-3">Resources</h4>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li><a href="#" className="hover:text-emerald-400 transition">Documentation</a></li>
                  <li><a href="#" className="hover:text-emerald-400 transition">GitHub</a></li>
                  <li><a href="#" className="hover:text-emerald-400 transition">Discord</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-3">Network</h4>
                <p className="text-slate-400 text-sm">Sepolia Testnet</p>
              </div>
            </div>
            <div className="border-t border-slate-800/50 pt-6 text-center text-slate-500 text-xs">
              <p>© 2025 RepVote. Built for Stability.nexus Hackathon</p>
            </div>
          </div>
        </div>
      </footer>

      {/* Create Poll Modal */}
      <CreatePollModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handlePollCreated}
      />
    </div>
  );
}
