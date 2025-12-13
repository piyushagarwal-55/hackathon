'use client';

import { WorkflowDraft } from '@/lib/workflow';
import { CreatePollModal } from '@/components/CreatePollModal';
import { VoteCard } from '@/components/VoteCard';
import { ResultsChart } from '@/components/ResultsChart';
import { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { useReadContract } from 'wagmi';
import { POLL_FACTORY_ADDRESS, POLL_FACTORY_ABI } from '@/lib/contracts';

interface VoteStageProps {
  draft: WorkflowDraft;
  onChange: (draft: Partial<WorkflowDraft>) => void;
  onPollCreated?: (pollAddress: string) => void;
}

export function VoteStage({ draft, onChange, onPollCreated }: VoteStageProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [pollCreatedHash, setPollCreatedHash] = useState<string | null>(null);
  const validOptions = draft.options.filter((opt) => opt.trim().length > 0);

  // Fetch recent polls to find the newly created one
  const { data: recentPolls } = useReadContract({
    address: POLL_FACTORY_ADDRESS,
    abi: POLL_FACTORY_ABI,
    functionName: 'getRecentPolls',
    args: [5n],
    query: {
      enabled: !!pollCreatedHash,
      refetchInterval: pollCreatedHash ? 2000 : false,
    },
  });

  // When poll is created, find it in recent polls
  useEffect(() => {
    if (pollCreatedHash && recentPolls && recentPolls.length > 0 && !draft.pollAddress) {
      // Assume the first poll in recent polls is the newly created one
      const newPollAddress = recentPolls[0];
      onChange({ pollAddress: newPollAddress });
      onPollCreated?.(newPollAddress);
      setPollCreatedHash(null);
    }
  }, [pollCreatedHash, recentPolls, draft.pollAddress, onChange, onPollCreated]);

  const handlePollCreated = () => {
    // This is called when CreatePollModal's onSuccess fires
    // We'll detect the new poll by watching recent polls
    setIsCreateModalOpen(false);
  };

  const handleCreatePoll = () => {
    setIsCreateModalOpen(true);
  };

  // If poll already exists, show voting interface
  if (draft.pollAddress && draft.pollAddress !== '0x0000000000000000000000000000000000000000') {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            Poll Created Successfully
          </h3>
          <p className="text-slate-400 text-sm">
            Your poll is live! Community members can now vote on your proposal.
          </p>
        </div>

        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
          <p className="text-sm text-emerald-400">
            <strong>Poll Address:</strong>{' '}
            <span className="font-mono text-xs break-all">{draft.pollAddress}</span>
          </p>
        </div>

        {/* Voting Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <VoteCard
            pollAddress={draft.pollAddress as `0x${string}`}
            options={draft.options}
          />
          <ResultsChart
            pollAddress={draft.pollAddress as `0x${string}`}
            options={draft.options}
          />
        </div>

        <CreatePollModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => {}}
        />
      </div>
    );
  }

  // Show create poll interface
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-white mb-2">Create Poll for Voting</h3>
        <p className="text-slate-400 text-sm">
          Create an on-chain poll based on your proposal. Once created, community members can vote.
        </p>
      </div>

      {/* Proposal Preview */}
      <div className="bg-slate-800/40 rounded-xl p-6 border border-slate-700/50">
        <h4 className="text-lg font-semibold text-white mb-3">Proposal Preview</h4>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-slate-400 mb-1">Question</p>
            <p className="text-white font-medium">{draft.title || 'Untitled Proposal'}</p>
          </div>
          <div>
            <p className="text-sm text-slate-400 mb-1">Options</p>
            <ul className="space-y-1">
              {draft.options.map((opt, idx) => (
                <li key={idx} className="text-white flex items-start gap-2">
                  <span className="text-emerald-400">{idx + 1}.</span>
                  <span>{opt || `Option ${idx + 1} (empty)`}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex gap-4 text-sm pt-2 border-t border-slate-700/50">
            <div>
              <span className="text-slate-400">Duration:</span>{' '}
              <span className="text-white">{draft.votingDuration} days</span>
            </div>
            <div>
              <span className="text-slate-400">Weight Cap:</span>{' '}
              <span className="text-white">{draft.maxWeightCap}x</span>
            </div>
          </div>
        </div>
      </div>

      {/* Create Poll Button */}
      <button
        onClick={handleCreatePoll}
        className="w-full px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        disabled={
          !draft.title ||
          draft.title.length < 5 ||
          !draft.description ||
          draft.description.length < 20 ||
          validOptions.length < 2
        }
      >
        <span>Create Poll</span>
      </button>

      {/* Validation Warning */}
      {(!draft.title || draft.title.length < 5 || !draft.description || draft.description.length < 20 || draft.options.filter(opt => opt.trim().length > 0).length < 2) && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
          <p className="text-sm text-amber-400 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <span>
              <strong>Warning:</strong> Your proposal is incomplete. Please complete the draft stage before creating a poll.
            </span>
          </p>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
        <p className="text-sm text-blue-400 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <span>
            <strong>Note:</strong> Once you create the poll, it will be deployed on-chain and voting will begin immediately. Make sure your proposal is finalized before proceeding. The poll will use the settings from your draft (duration, weight cap, etc.).
          </span>
        </p>
      </div>

      <CreatePollModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          handlePollCreated();
          // Start watching for new poll
          setPollCreatedHash('pending');
        }}
        initialQuestion={draft.title}
        initialOptions={validOptions.length >= 2 ? validOptions : draft.options}
        initialDuration={draft.votingDuration}
        initialMaxWeightCap={draft.maxWeightCap}
      />
    </div>
  );
}

