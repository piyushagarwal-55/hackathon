"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { RepDisplay } from "@/components/RepDisplay";
import { VoteCard } from "@/components/VoteCard";
import { ResultsChart } from "@/components/ResultsChart";
import { CreatePollModal } from "@/components/CreatePollModal";
import { PollList } from "@/components/PollList";
import { ReputationLeaderboard } from "@/components/ReputationLeaderboard";
import { VotingHistory } from "@/components/VotingHistory";
import { StatsDashboard } from "@/components/StatsDashboard";
import { NotificationCenter } from "@/components/NotificationCenter";
import { useReadContract } from "wagmi";
import { POLL_FACTORY_ADDRESS, POLL_FACTORY_ABI } from "@/lib/contracts";
import { useState } from "react";

// Demo poll address - update after deployment
const DEMO_POLL_ADDRESS =
  "0xCafac3dD18aC6c6e92c921884f9E4176737C052c" as `0x${string}`;

export default function Home() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPoll, setSelectedPoll] = useState<{
    address: string;
    options: string[];
  } | null>(null);
  const [activeTab, setActiveTab] = useState<
    "vote" | "leaderboard" | "history"
  >("vote");

  // Fetch recent polls
  const { data: recentPolls } = useReadContract({
    address: POLL_FACTORY_ADDRESS,
    abi: POLL_FACTORY_ABI,
    functionName: "getRecentPolls",
    args: [5n],
  });

  // Demo options
  const demoOptions = ["Security Audit", "Mobile App Development", "UX Polish"];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                  RepVote
                  <span className="text-lg">⚡</span>
                </h1>
                <p className="text-gray-400 text-sm">
                  Reputation-Weighted Voting
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <NotificationCenter />
              <ConnectButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="mb-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Fair Governance Through Reputation
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            RepVote combines reputation weighting with quadratic voting to
            create Sybil-resistant, fair decision-making for DAOs and
            communities.
          </p>
        </div>

        {/* Key Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
            <div className="text-4xl mb-3">🛡️</div>
            <h3 className="text-xl font-bold text-white mb-2">
              Sybil Resistant
            </h3>
            <p className="text-gray-400 text-sm">
              82% reduction in fake account influence through reputation
              weighting
            </p>
          </div>
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
            <div className="text-4xl mb-3">⚖️</div>
            <h3 className="text-xl font-bold text-white mb-2">
              Quadratic Voting
            </h3>
            <p className="text-gray-400 text-sm">
              Prevents whale dominance - vote cost increases exponentially
            </p>
          </div>
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
            <div className="text-4xl mb-3">📈</div>
            <h3 className="text-xl font-bold text-white mb-2">Merit Based</h3>
            <p className="text-gray-400 text-sm">
              Your voting power grows with your contributions (0.3x to 3x
              multiplier)
            </p>
          </div>
        </div>

        {/* Stats Dashboard */}
        <StatsDashboard />

        {/* User Reputation */}
        <div className="mb-8">
          <RepDisplay />
        </div>

        {/* Create Poll Button */}
        <div className="mb-8 flex justify-end">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl text-white font-bold hover:shadow-lg hover:shadow-indigo-500/50 transition-all flex items-center gap-2"
          >
            <span className="text-xl">+</span>
            Create New Poll
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-8 flex gap-2 bg-white/5 backdrop-blur-lg rounded-xl p-2 border border-white/10 w-fit">
          <button
            onClick={() => setActiveTab("vote")}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === "vote"
                ? "bg-indigo-500 text-white shadow-lg"
                : "text-gray-400 hover:text-white"
            }`}
          >
            🗳️ Vote
          </button>
          <button
            onClick={() => setActiveTab("leaderboard")}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === "leaderboard"
                ? "bg-amber-500 text-white shadow-lg"
                : "text-gray-400 hover:text-white"
            }`}
          >
            🏆 Leaderboard
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === "history"
                ? "bg-green-500 text-white shadow-lg"
                : "text-gray-400 hover:text-white"
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
              />
            </div>

            {/* Selected Poll or Demo Poll */}
            {selectedPoll || DEMO_POLL_ADDRESS !== "0x..." ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <VoteCard
                  pollAddress={
                    (selectedPoll?.address ||
                      DEMO_POLL_ADDRESS) as `0x${string}`
                  }
                  options={selectedPoll?.options || demoOptions}
                />
                <ResultsChart
                  pollAddress={
                    (selectedPoll?.address ||
                      DEMO_POLL_ADDRESS) as `0x${string}`
                  }
                  options={selectedPoll?.options || demoOptions}
                />
              </div>
            ) : (
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-12 border border-white/10 text-center">
                <div className="text-6xl mb-4">🚀</div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  Deploy Contracts to Get Started
                </h3>
                <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
                  Follow the deployment instructions in the
                  contracts/DEPLOYMENT.md file to deploy RepVote to Sepolia
                  testnet. Then update the contract addresses in
                  lib/contracts.ts and reload this page.
                </p>
                <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-4 max-w-xl mx-auto">
                  <p className="text-sm text-gray-300 font-mono">
                    cd contracts && forge script script/Deploy.s.sol --broadcast
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === "leaderboard" && <ReputationLeaderboard />}

        {activeTab === "history" && <VotingHistory />}

        {/* How It Works */}
        <div className="mt-16 bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">
            How RepVote Works
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-indigo-400">1</span>
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">
                Build Reputation
              </h4>
              <p className="text-gray-400 text-sm">
                Earn reputation through participation, voting, and contributions
                to the community
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-400">2</span>
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">
                Cast Weighted Votes
              </h4>
              <p className="text-gray-400 text-sm">
                Your reputation determines your vote multiplier (0.3x to 3x) -
                higher rep = stronger voice
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-400">3</span>
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">
                Fair Consensus
              </h4>
              <p className="text-gray-400 text-sm">
                Quadratic voting prevents whales, reputation stops Sybils -
                community wins
              </p>
            </div>
          </div>
        </div>

        {/* Formula Display */}
        <div className="mt-8 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-xl p-6 text-center">
          <p className="text-gray-400 text-sm mb-2">Vote Weight Formula</p>
          <p className="text-2xl font-bold text-white font-mono">
            √(credits) × reputation_multiplier = weighted_votes
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/20 backdrop-blur-lg mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-gray-400 text-sm">
            <p>
              RepVote - Built for Stability.nexus Hackathon
              <span className="mx-2">•</span>
              Deployed on Sepolia Testnet
            </p>
            <p className="mt-2">
              <a
                href="https://github.com/yourrepo/repvote"
                className="hover:text-white transition-colors"
              >
                GitHub
              </a>
              <span className="mx-2">•</span>
              <a
                href="https://etherscan.io"
                className="hover:text-white transition-colors"
              >
                Contract Explorer
              </a>
            </p>
          </div>
        </div>
      </footer>

      {/* Create Poll Modal */}
      <CreatePollModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={(pollAddress) => {
          console.log("Poll created:", pollAddress);
          // Optionally auto-select the new poll
        }}
      />
    </div>
  );
}
