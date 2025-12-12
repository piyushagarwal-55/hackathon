'use client';

import { useAccount } from 'wagmi';
import { formatTimestamp } from '@/lib/calculations';

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
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
        <h3 className="text-2xl font-bold text-white mb-4">📜 Your Voting History</h3>
        <p className="text-gray-400 text-center py-8">
          Connect wallet to see your voting history
        </p>
      </div>
    );
  }

  if (mockHistory.length === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
        <h3 className="text-2xl font-bold text-white mb-4">📜 Your Voting History</h3>
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🗳️</div>
          <p className="text-gray-400">You haven't voted yet</p>
          <p className="text-sm text-gray-500 mt-2">Cast your first vote to start building reputation!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-white">📜 Your Voting History</h3>
        <span className="px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 rounded-full text-sm text-indigo-400">
          {mockHistory.length} {mockHistory.length === 1 ? 'vote' : 'votes'}
        </span>
      </div>

      <div className="space-y-4">
        {mockHistory.map((vote, index) => (
          <div
            key={index}
            className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <p className="text-white font-semibold mb-1">{vote.pollQuestion}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-1 bg-green-500/20 border border-green-500/30 rounded-lg text-xs text-green-400">
                    Voted: {vote.option}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatTimestamp(vote.timestamp)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 text-sm">
              <div>
                <span className="text-gray-500">Credits: </span>
                <span className="text-indigo-400 font-semibold">{vote.creditsSpent}</span>
              </div>
              <div>
                <span className="text-gray-500">Weight: </span>
                <span className="text-green-400 font-semibold">{vote.weightedVotes.toFixed(2)}</span>
              </div>
              <a
                href={`https://localhost:8545/tx/${vote.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto text-indigo-400 hover:text-indigo-300 transition-colors text-xs"
              >
                View TX →
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Stats Summary */}
      <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-gray-400 text-xs mb-1">Total Votes</p>
          <p className="text-2xl font-bold text-white">{mockHistory.length}</p>
        </div>
        <div className="text-center">
          <p className="text-gray-400 text-xs mb-1">Total Credits</p>
          <p className="text-2xl font-bold text-indigo-400">
            {mockHistory.reduce((sum, v) => sum + v.creditsSpent, 0)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-gray-400 text-xs mb-1">Avg Weight</p>
          <p className="text-2xl font-bold text-green-400">
            {(mockHistory.reduce((sum, v) => sum + v.weightedVotes, 0) / mockHistory.length).toFixed(1)}
          </p>
        </div>
      </div>
    </div>
  );
}




