'use client';

import { useState } from 'react';
import { CreatePollModal } from '@/components/CreatePollModal';
import { ReputationLeaderboard } from '@/components/ReputationLeaderboard';
import { VotingHistory } from '@/components/VotingHistory';
import { WorkflowBuilder } from '@/components/WorkflowBuilder';
import { NetworkHealth } from '@/components/NetworkHealth';
import { useAccount, useReadContract } from 'wagmi';
import { REPUTATION_REGISTRY_ADDRESS, REPUTATION_REGISTRY_ABI } from '@/lib/contracts';
import { 
  Users, 
  TrendingUp, 
  Award, 
  Gavel, 
  Plus,
  Shield,
  BarChart3,
  Clock,
  FileText,
  LayoutDashboard
} from 'lucide-react';

type GovernanceTab = 'overview' | 'workflow';

export default function GovernancePage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState<GovernanceTab>('overview');
  const { address, isConnected } = useAccount();

  const { data: userStats } = useReadContract({
    address: REPUTATION_REGISTRY_ADDRESS,
    abi: REPUTATION_REGISTRY_ABI,
    functionName: 'getUserStats',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected,
      refetchInterval: 10000,
    },
  });

  const handlePollCreated = () => {
    setRefreshTrigger((prev) => prev + 1);
    setIsCreateModalOpen(false);
  };

  const effectiveRep = userStats ? Number(userStats[0]) : 0;
  const multiplier = userStats ? Number(userStats[1]) / 1e18 : 0.3;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800/50 bg-slate-950/50 backdrop-blur-lg sticky top-0 z-40">
        <div className="px-6 sm:px-8 lg:px-12 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Governance</h1>
              <p className="text-slate-400">
                Participate in RepVote governance and manage proposals
              </p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg font-semibold transition-all shadow-lg shadow-emerald-500/30 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Proposal
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 sm:px-8 lg:px-12 py-8">
        {/* Network Health */}
        <div className="mb-6">
          <NetworkHealth />
        </div>

        {/* Tabs */}
        <div className="mb-8 flex gap-2 bg-slate-800/30 backdrop-blur-lg rounded-lg p-2 border border-slate-700/50 w-fit">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-2 rounded-md font-semibold text-sm transition-all flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('workflow')}
            className={`px-6 py-2 rounded-md font-semibold text-sm transition-all flex items-center gap-2 ${
              activeTab === 'workflow'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            Workflow Builder
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'workflow' ? (
          <WorkflowBuilder />
        ) : (
          <>
            {/* Governance Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-slate-800/40 to-slate-700/20 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-3">
              <Gavel className="w-5 h-5 text-emerald-400" />
              <span className="text-xs px-2 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-emerald-400">
                Total
              </span>
            </div>
            <p className="text-3xl font-bold text-white mb-1">24</p>
            <p className="text-xs text-slate-400">Total Proposals</p>
          </div>

          <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 backdrop-blur-lg rounded-xl p-6 border border-emerald-500/30">
            <div className="flex items-center justify-between mb-3">
              <Clock className="w-5 h-5 text-emerald-400" />
              <span className="text-xs px-2 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-emerald-400">
                Live
              </span>
            </div>
            <p className="text-3xl font-bold text-white mb-1">8</p>
            <p className="text-xs text-slate-400">Active Proposals</p>
          </div>

          <div className="bg-gradient-to-br from-slate-800/40 to-slate-700/20 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-3">
              <Users className="w-5 h-5 text-amber-400" />
              <span className="text-xs px-2 py-1 bg-amber-500/20 border border-amber-500/30 rounded-full text-amber-400">
                Members
              </span>
            </div>
            <p className="text-3xl font-bold text-white mb-1">1,247</p>
            <p className="text-xs text-slate-400">Active Voters</p>
          </div>

          <div className="bg-gradient-to-br from-slate-800/40 to-slate-700/20 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-3">
              <BarChart3 className="w-5 h-5 text-teal-400" />
              <span className="text-xs px-2 py-1 bg-teal-500/20 border border-teal-500/30 rounded-full text-teal-400">
                Rate
              </span>
            </div>
            <p className="text-3xl font-bold text-white mb-1">89%</p>
            <p className="text-xs text-slate-400">Participation</p>
          </div>
        </div>

        {/* Your Governance Power */}
        {isConnected && (
          <div className="mb-8 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 backdrop-blur-lg rounded-2xl p-8 border border-emerald-500/30">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Your Governance Power</h2>
                <p className="text-slate-400">Your reputation determines your voting influence</p>
              </div>
              <Shield className="w-12 h-12 text-emerald-400" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-800/40 rounded-lg p-6 border border-slate-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-5 h-5 text-emerald-400" />
                  <p className="text-slate-400 text-sm">Reputation Score</p>
                </div>
                <p className="text-4xl font-bold text-white">{effectiveRep}</p>
                <p className="text-xs text-slate-500 mt-2">Earned through participation</p>
              </div>

              <div className="bg-slate-800/40 rounded-lg p-6 border border-slate-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-amber-400" />
                  <p className="text-slate-400 text-sm">Vote Multiplier</p>
                </div>
                <p className="text-4xl font-bold text-amber-400">{multiplier.toFixed(1)}x</p>
                <p className="text-xs text-slate-500 mt-2">Based on your reputation</p>
              </div>

              <div className="bg-slate-800/40 rounded-lg p-6 border border-slate-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <Gavel className="w-5 h-5 text-teal-400" />
                  <p className="text-slate-400 text-sm">Proposals Created</p>
                </div>
                <p className="text-4xl font-bold text-white">3</p>
                <p className="text-xs text-slate-500 mt-2">Lifetime contributions</p>
              </div>
            </div>
          </div>
        )}

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Leaderboard */}
          <div>
            <ReputationLeaderboard />
          </div>

          {/* Right Column - Voting History */}
          <div>
            <VotingHistory />
          </div>
        </div>

        {/* Governance Guidelines */}
        <div className="mt-8 bg-gradient-to-br from-slate-800/40 to-slate-700/20 backdrop-blur-lg rounded-2xl p-8 border border-slate-700/50">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Shield className="w-6 h-6 text-emerald-400" />
            Governance Guidelines
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-emerald-400 mb-2">Creating Proposals</h3>
              <ul className="space-y-2 text-slate-300 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-1">•</span>
                  <span>Proposals must be clear and specific</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-1">•</span>
                  <span>Provide at least 2-5 options for voting</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-1">•</span>
                  <span>Set appropriate voting duration</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-1">•</span>
                  <span>Include context and reasoning</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-amber-400 mb-2">Voting Best Practices</h3>
              <ul className="space-y-2 text-slate-300 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-1">•</span>
                  <span>Read proposals carefully before voting</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-1">•</span>
                  <span>Consider long-term impact on the community</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-1">•</span>
                  <span>Vote based on merit, not popularity</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-1">•</span>
                  <span>Build reputation through consistent participation</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
          </>
        )}
      </main>

      {/* Create Poll Modal */}
      <CreatePollModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handlePollCreated}
      />
    </div>
  );
}

