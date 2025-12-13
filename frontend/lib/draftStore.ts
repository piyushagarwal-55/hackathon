/**
 * Draft Store - LocalStorage-based persistence for workflow drafts
 */

import { WorkflowDraft } from './workflow';

const STORAGE_KEY = 'repvote_workflow_drafts';
const MAX_DRAFTS = 50; // Limit stored drafts

/**
 * Get all saved drafts
 */
export function getAllDrafts(): WorkflowDraft[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as WorkflowDraft[];
  } catch (error) {
    console.error('Failed to load drafts:', error);
    return [];
  }
}

/**
 * Save a draft
 */
export function saveDraft(draft: WorkflowDraft): void {
  if (typeof window === 'undefined') return;
  
  try {
    const drafts = getAllDrafts();
    const existingIndex = drafts.findIndex((d) => d.id === draft.id);
    
    const updatedDraft = {
      ...draft,
      updatedAt: Date.now(),
    };
    
    if (existingIndex >= 0) {
      drafts[existingIndex] = updatedDraft;
    } else {
      drafts.unshift(updatedDraft);
      // Keep only the most recent drafts
      if (drafts.length > MAX_DRAFTS) {
        drafts.splice(MAX_DRAFTS);
      }
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
  } catch (error) {
    console.error('Failed to save draft:', error);
  }
}

/**
 * Get a specific draft by ID
 */
export function getDraft(id: string): WorkflowDraft | null {
  const drafts = getAllDrafts();
  return drafts.find((d) => d.id === id) || null;
}

/**
 * Delete a draft
 */
export function deleteDraft(id: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    const drafts = getAllDrafts();
    const filtered = drafts.filter((d) => d.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to delete draft:', error);
  }
}

/**
 * Clear all drafts
 */
export function clearAllDrafts(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

