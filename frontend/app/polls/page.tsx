'use client';

import { useState } from 'react';
import { PollList } from '@/components/PollList';
import { VoteCard } from '@/components/VoteCard';
import { ResultsChart } from '@/components/ResultsChart';
import { ShareModal } from '@/components/ShareModal';
import { Filter, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function PollsPage() {
  const [selectedPoll, setSelectedPoll] = useState<{
    address: string;
    options: string[];
  } | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [shareData, setShareData] = useState<{ address: string; question: string } | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'ended'>('active');

  const handleVoteSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleShare = (address: string, question: string) => {
    setShareData({ address, question });
    setIsShareOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800/50 bg-slate-950/50 backdrop-blur-lg sticky top-0 z-40">
        <div className="px-6 sm:px-8 lg:px-12 py-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Active Polls</h1>
            <p className="text-slate-400">
              Browse and participate in ongoing governance decisions
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 sm:px-8 lg:px-12 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-slate-800/40 to-slate-700/20 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <span className="text-xs text-slate-400">Total</span>
            </div>
            <p className="text-2xl font-bold text-white">24</p>
            <p className="text-xs text-slate-400 mt-1">All Polls</p>
          </div>

          <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 backdrop-blur-lg rounded-xl p-6 border border-emerald-500/30">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 text-emerald-400" />
              <span className="text-xs text-emerald-400">Live</span>
            </div>
            <p className="text-2xl font-bold text-white">8</p>
            <p className="text-xs text-slate-400 mt-1">Active Now</p>
          </div>

          <div className="bg-gradient-to-br from-slate-800/40 to-slate-700/20 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-5 h-5 text-teal-400" />
              <span className="text-xs text-slate-400">Completed</span>
            </div>
            <p className="text-2xl font-bold text-white">16</p>
            <p className="text-xs text-slate-400 mt-1">Ended Polls</p>
          </div>

          <div className="bg-gradient-to-br from-slate-800/40 to-slate-700/20 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-amber-400" />
              <span className="text-xs text-slate-400">Participation</span>
            </div>
            <p className="text-2xl font-bold text-white">89%</p>
            <p className="text-xs text-slate-400 mt-1">Avg Turnout</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 flex gap-2 bg-slate-800/30 backdrop-blur-lg rounded-lg p-2 border border-slate-700/50 w-fit">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-md font-semibold text-sm transition-all ${
              filterStatus === 'all'
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Polls
          </button>
          <button
            onClick={() => setFilterStatus('active')}
            className={`px-4 py-2 rounded-md font-semibold text-sm transition-all flex items-center gap-2 ${
              filterStatus === 'active'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            Active
          </button>
          <button
            onClick={() => setFilterStatus('ended')}
            className={`px-4 py-2 rounded-md font-semibold text-sm transition-all ${
              filterStatus === 'ended'
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Ended
          </button>
        </div>

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

        {/* Vote and Results Grid - Show if poll selected */}
        {selectedPoll && (
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
        )}
      </main>

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        pollAddress={shareData?.address || ''}
        pollQuestion={shareData?.question || ''}
      />
    </div>
  );
}

