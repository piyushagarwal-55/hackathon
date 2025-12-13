/**
 * Workflow Builder Types and Utilities
 * Defines the structure for governance workflows: Draft → Discussion → Vote → Execute
 */

export type WorkflowStage = 'draft' | 'discussion' | 'vote' | 'execute';

export interface WorkflowDraft {
  id: string;
  title: string;
  description: string;
  options: string[];
  votingDuration: number; // days
  maxWeightCap: number;
  currentStage: WorkflowStage;
  createdAt: number;
  updatedAt: number;
  pollAddress?: string; // Set when poll is created in vote stage
  discussionNotes?: string; // Optional notes from discussion stage
  executionPlan?: string; // Placeholder for future execution details
}

export interface WorkflowStageConfig {
  stage: WorkflowStage;
  label: string;
  description: string;
  canProceed: boolean;
  canGoBack: boolean;
}

export const WORKFLOW_STAGES: WorkflowStageConfig[] = [
  {
    stage: 'draft',
    label: 'Draft',
    description: 'Define your proposal details',
    canProceed: true,
    canGoBack: false,
  },
  {
    stage: 'discussion',
    label: 'Discussion',
    description: 'Share and gather feedback',
    canProceed: true,
    canGoBack: true,
  },
  {
    stage: 'vote',
    label: 'Vote',
    description: 'Create poll and collect votes',
    canProceed: true,
    canGoBack: true,
  },
  {
    stage: 'execute',
    label: 'Execute',
    description: 'Review results and plan execution',
    canProceed: false,
    canGoBack: true,
  },
];

/**
 * Validate workflow draft
 */
export function validateWorkflowDraft(draft: Partial<WorkflowDraft>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!draft.title || draft.title.trim().length < 5) {
    errors.push('Title must be at least 5 characters');
  }

  if (!draft.description || draft.description.trim().length < 20) {
    errors.push('Description must be at least 20 characters');
  }

  if (!draft.options || draft.options.length < 2) {
    errors.push('At least 2 options are required');
  }

  const validOptions = draft.options?.filter((opt) => opt.trim().length > 0) || [];
  if (validOptions.length < 2) {
    errors.push('At least 2 valid options are required');
  }

  if (!draft.votingDuration || draft.votingDuration < 1 || draft.votingDuration > 30) {
    errors.push('Voting duration must be between 1 and 30 days');
  }

  if (!draft.maxWeightCap || draft.maxWeightCap < 2 || draft.maxWeightCap > 20) {
    errors.push('Max weight cap must be between 2x and 20x');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Create a new workflow draft
 */
export function createWorkflowDraft(): WorkflowDraft {
  return {
    id: `workflow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: '',
    description: '',
    options: ['', ''],
    votingDuration: 7,
    maxWeightCap: 10,
    currentStage: 'draft',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

/**
 * Get stage index
 */
export function getStageIndex(stage: WorkflowStage): number {
  return WORKFLOW_STAGES.findIndex((s) => s.stage === stage);
}

/**
 * Get next stage
 */
export function getNextStage(currentStage: WorkflowStage): WorkflowStage | null {
  const currentIndex = getStageIndex(currentStage);
  if (currentIndex === -1 || currentIndex >= WORKFLOW_STAGES.length - 1) {
    return null;
  }
  return WORKFLOW_STAGES[currentIndex + 1].stage;
}

/**
 * Get previous stage
 */
export function getPreviousStage(currentStage: WorkflowStage): WorkflowStage | null {
  const currentIndex = getStageIndex(currentStage);
  if (currentIndex <= 0) {
    return null;
  }
  return WORKFLOW_STAGES[currentIndex - 1].stage;
}

