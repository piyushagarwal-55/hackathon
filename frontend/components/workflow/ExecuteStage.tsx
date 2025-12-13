'use client';

import { WorkflowDraft } from '@/lib/workflow';
import { CheckCircle2, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import { useReadContract } from 'wagmi';
import { POLL_ABI } from '@/lib/contracts';
import { ResultsChart } from '@/components/ResultsChart';

interface ExecuteStageProps {
  draft: WorkflowDraft;
  onChange: (draft: Partial<WorkflowDraft>) => void;
}

export function ExecuteStage({ draft, onChange }: ExecuteStageProps) {
  const pollAddress = draft.pollAddress as `0x${string}` | undefined;

  const { data: pollData } = useReadContract({
    address: pollAddress,
    abi: POLL_ABI,
    functionName: 'getResults',
    query: {
      enabled: !!pollAddress && pollAddress !== '0x0000000000000000000000000000000000000000',
      refetchInterval: 5000,
    },
  });

  const { data: isActive } = useReadContract({
    address: pollAddress,
    abi: POLL_ABI,
    functionName: 'isActive',
    query: {
      enabled: !!pollAddress && pollAddress !== '0x0000000000000000000000000000000000000000',
    },
  });

  const { data: totalVoters } = useReadContract({
    address: pollAddress,
    abi: POLL_ABI,
    functionName: 'totalVoters',
    query: {
      enabled: !!pollAddress && pollAddress !== '0x0000000000000000000000000000000000000000',
    },
  });

  const results = pollData || [];
  const totalVotes = results.reduce((sum: number, votes: bigint) => sum + Number(votes), 0);
  const maxVotes = results.length > 0 ? Math.max(...results.map((v: bigint) => Number(v))) : 0;
  const winningOptionIndex = results.findIndex((v: bigint) => Number(v) === maxVotes);

  if (!pollAddress || pollAddress === '0x0000000000000000000000000000000000000000') {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-2">Execution Plan</h3>
          <p className="text-slate-400 text-sm">
            Review the voting results and plan the execution of your proposal
          </p>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-lg font-semibold text-amber-400 mb-2">No Poll Created Yet</h4>
              <p className="text-slate-300 text-sm">
                You need to create a poll in the Vote stage before you can review results and plan execution.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const pollStillActive = isActive === true;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-white mb-2">Execution Plan</h3>
        <p className="text-slate-400 text-sm">
          Review the voting results and plan the execution of your proposal
        </p>
      </div>

      {/* Poll Status */}
      <div className={`rounded-xl p-6 border ${
        pollStillActive
          ? 'bg-blue-500/10 border-blue-500/30'
          : 'bg-emerald-500/10 border-emerald-500/30'
      }`}>
        <div className="flex items-start gap-3">
          {pollStillActive ? (
            <Clock className="w-6 h-6 text-blue-400 flex-shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <h4 className={`text-lg font-semibold mb-2 ${
              pollStillActive ? 'text-blue-400' : 'text-emerald-400'
            }`}>
              {pollStillActive ? 'Poll Still Active' : 'Poll Completed'}
            </h4>
            <p className="text-slate-300 text-sm mb-3">
              {pollStillActive
                ? 'Voting is still ongoing. Check back when the poll closes to review final results.'
                : 'Voting has concluded. Review the results below and plan your execution strategy.'}
            </p>
            {!pollStillActive && totalVoters !== undefined && (
              <div className="mt-4 pt-4 border-t border-slate-700/50">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-400">Total Voters</p>
                    <p className="text-2xl font-bold text-white">{totalVoters.toString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Total Votes</p>
                    <p className="text-2xl font-bold text-white">{totalVotes}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results Chart */}
      {!pollStillActive && (
        <div>
          <ResultsChart
            pollAddress={pollAddress}
            options={draft.options}
          />
        </div>
      )}

      {/* Winning Option */}
      {!pollStillActive && winningOptionIndex >= 0 && (
        <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 rounded-xl p-6 border border-emerald-500/30">
          <div className="flex items-start gap-3">
            <TrendingUp className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-emerald-400 mb-2">Winning Option</h4>
              <p className="text-2xl font-bold text-white mb-2">
                {draft.options[winningOptionIndex]}
              </p>
              <p className="text-slate-300 text-sm">
                Received {maxVotes} weighted votes ({totalVotes > 0 ? ((maxVotes / totalVotes) * 100).toFixed(1) : 0}% of total)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Execution Plan */}
      <div>
        <label className="block text-slate-300 mb-2 font-semibold">
          Execution Plan (Optional)
        </label>
        <textarea
          value={draft.executionPlan || ''}
          onChange={(e) => onChange({ executionPlan: e.target.value })}
          placeholder="Describe how you plan to execute the winning option. What steps will be taken? What resources are needed? Timeline?"
          rows={6}
          className="w-full px-4 py-3 bg-slate-800/40 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
        />
      </div>

      {/* Execution Plan Info */}
      {draft.executionPlan && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
          <p className="text-sm text-emerald-400">
            ✓ Your execution plan has been saved. You can edit it anytime.
          </p>
        </div>
      )}

      {/* Coming Soon */}
      <div className="bg-slate-800/40 rounded-xl p-6 border border-slate-700/50">
        <h4 className="text-lg font-semibold text-white mb-2">On-Chain Execution (Coming Soon)</h4>
        <p className="text-slate-400 text-sm mb-4">
          In a future update, you'll be able to execute on-chain actions directly from this workflow, such as:
        </p>
        <ul className="space-y-2 text-slate-300 text-sm mb-4">
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-1">•</span>
            <span>Treasury transfers and budget allocations</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-1">•</span>
            <span>Parameter changes and protocol upgrades</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-1">•</span>
            <span>Timelock and multisig integration</span>
          </li>
        </ul>
        <div className="pt-4 border-t border-slate-700/50">
          <p className="text-xs text-slate-500">
            For now, use the execution plan above to document your next steps and coordinate with your team.
          </p>
        </div>
      </div>
    </div>
  );
}

