'use client';

import { WorkflowDraft } from '@/lib/workflow';
import { Plus, X } from 'lucide-react';

interface DraftStageProps {
  draft: WorkflowDraft;
  onChange: (draft: Partial<WorkflowDraft>) => void;
}

export function DraftStage({ draft, onChange }: DraftStageProps) {
  const addOption = () => {
    if (draft.options.length < 10) {
      onChange({ options: [...draft.options, ''] });
    }
  };

  const removeOption = (index: number) => {
    if (draft.options.length > 2) {
      onChange({ options: draft.options.filter((_, i) => i !== index) });
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...draft.options];
    newOptions[index] = value;
    onChange({ options: newOptions });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-white mb-2">Draft Your Proposal</h3>
        <p className="text-slate-400 text-sm">
          Define the question, options, and voting parameters for your governance proposal
        </p>
      </div>

      {/* Title */}
      <div>
        <label className="block text-slate-300 mb-2 font-semibold">
          Proposal Title *
        </label>
        <input
          type="text"
          value={draft.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="What should we prioritize next?"
          className="w-full px-4 py-3 bg-slate-800/40 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          maxLength={200}
          required
        />
        <p className="text-xs text-slate-500 mt-1">{draft.title.length}/200</p>
        {draft.title.length > 0 && draft.title.length < 5 && (
          <p className="text-xs text-amber-400 mt-1">Title must be at least 5 characters</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-slate-300 mb-2 font-semibold">
          Description *
        </label>
        <textarea
          value={draft.description}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="Provide context and reasoning for this proposal..."
          rows={4}
          className="w-full px-4 py-3 bg-slate-800/40 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
          maxLength={1000}
          required
        />
        <p className="text-xs text-slate-500 mt-1">{draft.description.length}/1000</p>
        {draft.description.length > 0 && draft.description.length < 20 && (
          <p className="text-xs text-amber-400 mt-1">Description must be at least 20 characters</p>
        )}
      </div>

      {/* Options */}
      <div>
        <label className="block text-slate-300 mb-2 font-semibold">
          Voting Options * (2-10)
        </label>
        <div className="space-y-3">
          {draft.options.map((option, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={option}
                onChange={(e) => updateOption(index, e.target.value)}
                placeholder={`Option ${index + 1}`}
                className="flex-1 px-4 py-3 bg-slate-800/40 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                maxLength={100}
              />
              {draft.options.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeOption(index)}
                  className="px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 hover:bg-red-500/30 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
        {draft.options.length < 10 && (
          <button
            type="button"
            onClick={addOption}
            className="mt-3 px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-400 hover:bg-emerald-500/30 transition-colors text-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Option
          </button>
        )}
      </div>

      {/* Voting Duration */}
      <div>
        <label className="block text-slate-300 mb-2 font-semibold">
          Voting Duration: {draft.votingDuration} days
        </label>
        <input
          type="range"
          min="1"
          max="30"
          value={draft.votingDuration}
          onChange={(e) => onChange({ votingDuration: Number(e.target.value) })}
          className="w-full h-2 bg-emerald-700/30 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-emerald-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
        />
        <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span>1 day</span>
          <span>30 days</span>
        </div>
      </div>

      {/* Max Weight Cap */}
      <div>
        <label className="block text-slate-300 mb-2 font-semibold">
          Max Vote Weight Cap: {draft.maxWeightCap}x
        </label>
        <input
          type="range"
          min="2"
          max="20"
          value={draft.maxWeightCap}
          onChange={(e) => onChange({ maxWeightCap: Number(e.target.value) })}
          className="w-full h-2 bg-purple-700/30 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-purple-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
        />
        <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span>2x (strict)</span>
          <span>20x (lenient)</span>
        </div>
        <p className="text-xs text-slate-400 mt-2">
          Prevents any single vote from having more than {draft.maxWeightCap}x the average weight
        </p>
      </div>
    </div>
  );
}

