'use client';

import { useState, useEffect } from 'react';
import { WorkflowDraft, createWorkflowDraft, validateWorkflowDraft, getNextStage, getPreviousStage, WorkflowStage } from '@/lib/workflow';
import { saveDraft, getAllDrafts, deleteDraft } from '@/lib/draftStore';
import { WorkflowStepper } from './workflow/WorkflowStepper';
import { DraftStage } from './workflow/DraftStage';
import { DiscussionStage } from './workflow/DiscussionStage';
import { VoteStage } from './workflow/VoteStage';
import { ExecuteStage } from './workflow/ExecuteStage';
import { ArrowLeft, ArrowRight, Save, Trash2, FileText, X } from 'lucide-react';
import { toast } from 'sonner';

interface WorkflowBuilderProps {
  initialDraftId?: string;
  onClose?: () => void;
}

export function WorkflowBuilder({ initialDraftId, onClose }: WorkflowBuilderProps) {
  const [draft, setDraft] = useState<WorkflowDraft>(createWorkflowDraft());
  const [savedDrafts, setSavedDrafts] = useState<WorkflowDraft[]>([]);
  const [showDraftList, setShowDraftList] = useState(false);

  // Load drafts on mount
  useEffect(() => {
    setSavedDrafts(getAllDrafts());
  }, []);

  // Load initial draft if provided
  useEffect(() => {
    if (initialDraftId) {
      const loaded = savedDrafts.find((d) => d.id === initialDraftId);
      if (loaded) {
        setDraft(loaded);
      }
    }
  }, [initialDraftId, savedDrafts]);

  const handleDraftChange = (updates: Partial<WorkflowDraft>) => {
    const updated = { ...draft, ...updates };
    setDraft(updated);
    // Auto-save on change
    saveDraft(updated);
  };

  const handleNext = () => {
    const nextStage = getNextStage(draft.currentStage);
    if (nextStage) {
      // Validate before proceeding
      if (draft.currentStage === 'draft') {
        const validation = validateWorkflowDraft(draft);
        if (!validation.valid) {
          toast.error(`Please fix errors: ${validation.errors.join(', ')}`);
          return;
        }
      }
      handleDraftChange({ currentStage: nextStage });
    }
  };

  const handlePrevious = () => {
    const prevStage = getPreviousStage(draft.currentStage);
    if (prevStage) {
      handleDraftChange({ currentStage: prevStage });
    }
  };

  const handleSave = () => {
    const validation = validateWorkflowDraft(draft);
    if (!validation.valid) {
      toast.error(`Cannot save: ${validation.errors.join(', ')}`);
      return;
    }
    saveDraft(draft);
    setSavedDrafts(getAllDrafts());
    toast.success('Draft saved!');
  };

  const handleLoadDraft = (loadedDraft: WorkflowDraft) => {
    setDraft(loadedDraft);
    setShowDraftList(false);
    toast.success('Draft loaded!');
  };

  const handleDeleteDraft = (id: string) => {
    if (confirm('Are you sure you want to delete this draft?')) {
      deleteDraft(id);
      setSavedDrafts(getAllDrafts());
      if (draft.id === id) {
        setDraft(createWorkflowDraft());
      }
      toast.success('Draft deleted');
    }
  };

  const handleNewDraft = () => {
    setDraft(createWorkflowDraft());
    setShowDraftList(false);
  };

  const handlePollCreated = (pollAddress: string) => {
    handleDraftChange({ pollAddress });
    toast.success('Poll created successfully!');
  };

  const canProceed = draft.currentStage !== 'execute';
  const canGoBack = draft.currentStage !== 'draft';

  return (
    <div className="bg-gradient-to-br from-slate-900/40 to-slate-800/20 backdrop-blur-lg rounded-2xl p-8 border border-slate-700/50 shadow-2xl shadow-black/20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-400" />
            Workflow Builder
          </h2>
          <p className="text-slate-400 text-sm">
            Create structured governance proposals: Draft → Discussion → Vote → Execute
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDraftList(!showDraftList)}
            className="px-4 py-2 bg-slate-900/40 border border-slate-700/60 rounded-lg text-slate-200 hover:bg-slate-800/60 transition-colors text-sm flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            {savedDrafts.length > 0 ? `${savedDrafts.length} Drafts` : 'No Drafts'}
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-900/40 border border-slate-700/60 rounded-lg text-slate-200 hover:bg-slate-800/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Draft List Modal */}
      {showDraftList && (
        <div className="mb-6 bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Saved Drafts</h3>
            <button
              onClick={handleNewDraft}
              className="px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-400 hover:bg-emerald-500/30 transition-colors text-sm"
            >
              + New Draft
            </button>
          </div>
          {savedDrafts.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 text-sm mb-2">No saved drafts yet</p>
              <p className="text-slate-500 text-xs">Start creating a workflow and it will be auto-saved</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {savedDrafts.map((saved) => (
                <div
                  key={saved.id}
                  className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-slate-700/50 hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{saved.title || 'Untitled Draft'}</p>
                    <p className="text-xs text-slate-400">
                      {new Date(saved.updatedAt).toLocaleDateString()} • {saved.currentStage}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleLoadDraft(saved)}
                      className="px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-400 hover:bg-emerald-500/30 transition-colors text-sm"
                    >
                      Load
                    </button>
                    <button
                      onClick={() => handleDeleteDraft(saved.id)}
                      className="px-3 py-1.5 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/30 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Stepper */}
      <WorkflowStepper
        currentStage={draft.currentStage}
        onStageClick={(stage) => {
          // Allow going back to previous stages
          const currentIndex = ['draft', 'discussion', 'vote', 'execute'].indexOf(draft.currentStage);
          const targetIndex = ['draft', 'discussion', 'vote', 'execute'].indexOf(stage);
          if (targetIndex <= currentIndex) {
            handleDraftChange({ currentStage: stage });
          }
        }}
      />

      {/* Stage Content */}
      <div className="mb-6">
        {draft.currentStage === 'draft' && (
          <DraftStage draft={draft} onChange={handleDraftChange} />
        )}
        {draft.currentStage === 'discussion' && (
          <DiscussionStage draft={draft} onChange={handleDraftChange} />
        )}
        {draft.currentStage === 'vote' && (
          <VoteStage draft={draft} onChange={handleDraftChange} onPollCreated={handlePollCreated} />
        )}
        {draft.currentStage === 'execute' && (
          <ExecuteStage draft={draft} onChange={handleDraftChange} />
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-700/50">
        <div className="flex items-center gap-2">
          {canGoBack && (
            <button
              onClick={handlePrevious}
              className="px-4 py-2 bg-slate-900/40 border border-slate-700/60 rounded-lg text-slate-200 hover:bg-slate-800/60 transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </button>
          )}
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500/15 border border-blue-500/30 rounded-lg text-blue-300 hover:bg-blue-500/25 transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Draft
          </button>
        </div>
        {canProceed && (
          <button
            onClick={handleNext}
            className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg font-semibold transition-all shadow-lg shadow-emerald-500/30 flex items-center gap-2"
          >
            Next
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

