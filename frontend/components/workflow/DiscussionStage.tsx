'use client';

import { WorkflowDraft } from '@/lib/workflow';
import { Share2, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface DiscussionStageProps {
  draft: WorkflowDraft;
  onChange: (draft: Partial<WorkflowDraft>) => void;
  onShare?: () => void;
}

export function DiscussionStage({ draft, onChange, onShare }: DiscussionStageProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/governance/workflow/${draft.id}`
    : '';

  const handleCopyLink = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const proposalSummary = `**${draft.title}**\n\n${draft.description}\n\n**Options:**\n${draft.options.map((opt, i) => `${i + 1}. ${opt}`).join('\n')}\n\n**Voting Duration:** ${draft.votingDuration} days`;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-white mb-2">Share for Discussion</h3>
        <p className="text-slate-400 text-sm">
          Share your proposal with the community to gather feedback before voting
        </p>
      </div>

      {/* Proposal Summary */}
      <div className="bg-slate-800/40 rounded-xl p-6 border border-slate-700/50">
        <h4 className="text-lg font-semibold text-white mb-3">Proposal Summary</h4>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-slate-400 mb-1">Title</p>
            <p className="text-white font-medium">{draft.title || 'Untitled Proposal'}</p>
          </div>
          <div>
            <p className="text-sm text-slate-400 mb-1">Description</p>
            <p className="text-white">{draft.description || 'No description provided'}</p>
          </div>
          <div>
            <p className="text-sm text-slate-400 mb-2">Options</p>
            <ul className="space-y-1">
              {draft.options.map((opt, idx) => (
                <li key={idx} className="text-white flex items-start gap-2">
                  <span className="text-emerald-400">{idx + 1}.</span>
                  <span>{opt || `Option ${idx + 1} (empty)`}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex gap-4 text-sm">
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

      {/* Discussion Notes */}
      <div>
        <label className="block text-slate-300 mb-2 font-semibold">
          Discussion Notes (Optional)
        </label>
        <textarea
          value={draft.discussionNotes || ''}
          onChange={(e) => onChange({ discussionNotes: e.target.value })}
          placeholder="Add notes from community feedback, questions, or concerns..."
          rows={4}
          className="w-full px-4 py-3 bg-slate-800/40 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
        />
      </div>

      {/* Share Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleCopyLink}
          className="flex-1 px-4 py-3 bg-slate-800/40 border border-slate-700/50 rounded-xl text-white hover:bg-slate-700/50 transition-colors flex items-center justify-center gap-2"
        >
          {copied ? (
            <>
              <Check className="w-5 h-5 text-emerald-400" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-5 h-5" />
              <span>Copy Link</span>
            </>
          )}
        </button>
        {onShare && (
          <button
            onClick={onShare}
            className="flex-1 px-4 py-3 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-400 hover:bg-emerald-500/30 transition-colors flex items-center justify-center gap-2"
          >
            <Share2 className="w-5 h-5" />
            <span>Share</span>
          </button>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
        <p className="text-sm text-blue-400">
          💡 <strong>Tip:</strong> Share this proposal link with your community to gather feedback before moving to voting. You can always come back to edit your notes. The discussion stage helps build consensus before on-chain voting begins.
        </p>
      </div>

      {/* Validation Warning */}
      {(!draft.title || draft.title.length < 5 || !draft.description || draft.description.length < 20) && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
          <p className="text-sm text-amber-400">
            ⚠️ <strong>Warning:</strong> Your proposal draft is incomplete. Make sure to fill in the title and description before sharing.
          </p>
        </div>
      )}
    </div>
  );
}

