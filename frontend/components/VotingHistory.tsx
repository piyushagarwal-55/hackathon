'use client';

import { useAccount } from 'wagmi';
import { formatTimestamp } from '@/lib/calculations';
import { History } from 'lucide-react';

export function VotingHistory() {
  const { address, isConnected } = useAccount();

  // In production, fetch this from contract events or indexer
  const mockHistory = address
    ? [
        {
          pollQuestion: 'What should we prioritize for the next quarter?',
          option: 'Security Audit',
          creditsSpent: 9,
          weightedVotes: 9,
          timestamp: BigInt(Math.floor(Date.now() / 1000) - 3600),
          txHash: '0x1234...5678',
        },
      ]
    : [];

  if (!isConnected) {
    return (
      <div className="bg-gradient-to-br from-slate-800/40 to-slate-700/20 backdrop-blur-lg rounded-2xl p-8 border border-slate-700/50">
        <h3 className="text-2xl font-bold text-white mb-4">📜 Your Voting History</h3>
        <p className="text-slate-400 text-center py-8">
          Connect wallet to see your voting history
        </p>
      </div>
    );
  }

  if (mockHistory.length === 0) {
    return (
      <div className="bg-gradient-to-br from-slate-800/40 to-slate-700/20 backdrop-blur-lg rounded-2xl p-8 border border-slate-700/50">
        <h3 className="text-2xl font-bold text-white mb-4">📜 Your Voting History</h3>
        <div className="text-center py-8">
          <History className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">You haven't voted yet</p>
          <p className="text-sm text-slate-500 mt-2">Cast your first vote to start building reputation!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-800/40 to-slate-700/20 backdrop-blur-lg rounded-2xl p-8 border border-slate-700/50">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-white">📜 Your Voting History</h3>
        <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-sm text-emerald-400 font-semibold">
          {mockHistory.length} {mockHistory.length === 1 ? 'vote' : 'votes'}
        </span>
      </div>

      <div className="space-y-4">
        {mockHistory.map((vote, index) => (
          <div
            key={index}
            className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-5 hover:bg-slate-800/50 hover:border-slate-600/50 transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <p className="text-white font-semibold mb-1">{vote.pollQuestion}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-xs text-emerald-400 font-semibold">
                    Voted: {vote.option}
                  </span>
                  <span className="text-xs text-slate-500">
                    {formatTimestamp(vote.timestamp)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 text-sm">
              <div>
                <span className="text-slate-500">Credits: </span>
                <span className="text-emerald-400 font-semibold">{vote.creditsSpent}</span>
              </div>
              <div>
                <span className="text-slate-500">Weight: </span>
                <span className="text-amber-400 font-semibold">{vote.weightedVotes.toFixed(2)}</span>
              </div>
              <a
                href={`https://localhost:8545/tx/${vote.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto text-emerald-400 hover:text-emerald-300 transition-colors text-xs font-semibold"
              >
                View TX →
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Stats Summary */}
      <div className="mt-6 pt-6 border-t border-slate-700/50 grid grid-cols-3 gap-4">
        <div className="text-center p-4 bg-slate-800/30 rounded-lg border border-slate-700/30">
          <p className="text-slate-500 text-xs mb-1">Total Votes</p>
          <p className="text-2xl font-bold text-white">{mockHistory.length}</p>
        </div>
        <div className="text-center p-4 bg-slate-800/30 rounded-lg border border-slate-700/30">
          <p className="text-slate-500 text-xs mb-1">Total Credits</p>
          <p className="text-2xl font-bold text-emerald-400">
            {mockHistory.reduce((sum, v) => sum + v.creditsSpent, 0)}
          </p>
        </div>
        <div className="text-center p-4 bg-slate-800/30 rounded-lg border border-slate-700/30">
          <p className="text-slate-500 text-xs mb-1">Avg Weight</p>
          <p className="text-2xl font-bold text-amber-400">
            {(mockHistory.reduce((sum, v) => sum + v.weightedVotes, 0) / mockHistory.length).toFixed(1)}
          </p>
        </div>
      </div>
    </div>
  );
}




