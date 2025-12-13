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
import { PageHeader } from "@/components/PageHeader";
import { NetworkHealth } from "@/components/NetworkHealth";

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

  const { data: pollCount } = useReadContract({
    address: POLL_FACTORY_ADDRESS,
    abi: POLL_FACTORY_ABI,
    functionName: "getPollCount",
    query: { refetchInterval: 15000 },
  });

  return (
    <div className="min-h-screen">
      <PageHeader
        title="Dashboard"
        subtitle="Reputation-weighted governance & live polls"
        actions={
          <button onClick={() => setIsCreateModalOpen(true)} className="rv-btn-primary">
            <span className="text-lg leading-none">+</span>
            Create Poll
          </button>
        }
      >
        <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
          <div className="max-w-3xl text-sm text-slate-400">
            Quadratic voting + reputation multiplier gives Sybil resistance without whale dominance.
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rv-chip">
              <span className="text-slate-400">Total polls</span>
              <span className="text-white">{pollCount?.toString() ?? "—"}</span>
            </span>
            <span className="rv-chip">
              <span className="text-slate-400">Network</span>
              <span className="text-emerald-300">Testnet</span>
            </span>
          </div>
        </div>
      </PageHeader>

      {/* Main Content */}
      <main className="rv-container py-8 space-y-10">
        <NetworkHealth />

        {/* User Reputation Card */}
        <RepDisplay />

        {/* Tabs Navigation */}
        <div className="rv-tabs w-fit">
          <button
            onClick={() => setActiveTab("vote")}
            className={`rv-tab ${activeTab === "vote" ? "rv-tab-active" : ""}`}
          >
            🗳️ Vote
          </button>
          <button
            onClick={() => setActiveTab("leaderboard")}
            className={`rv-tab ${activeTab === "leaderboard" ? "rv-tab-active" : ""}`}
          >
            🏆 Leaderboard
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`rv-tab ${activeTab === "history" ? "rv-tab-active" : ""}`}
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
              <div className="rv-card p-10 text-center">
                <div className="text-5xl mb-3">🧭</div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  Select a poll to vote
                </h3>
                <p className="text-slate-400 max-w-2xl mx-auto">
                  Pick a poll from the list above to see the voting card and live results.
                </p>
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
        <div className="rv-card-soft p-8 text-center">
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
      <footer className="border-t border-slate-800/50 bg-slate-950/40 backdrop-blur-xl mt-16">
        <div className="rv-container py-10">
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
                  <li><a href="/docs" className="hover:text-emerald-300 transition-colors">Documentation</a></li>
                  <li><a href="#" className="hover:text-emerald-300 transition-colors">GitHub</a></li>
                  <li><a href="#" className="hover:text-emerald-300 transition-colors">Discord</a></li>
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
