'use client';

import { WorkflowStage, WORKFLOW_STAGES } from '@/lib/workflow';
import { CheckCircle2, Circle } from 'lucide-react';

interface WorkflowStepperProps {
  currentStage: WorkflowStage;
  onStageClick?: (stage: WorkflowStage) => void;
}

export function WorkflowStepper({ currentStage, onStageClick }: WorkflowStepperProps) {
  const currentIndex = WORKFLOW_STAGES.findIndex((s) => s.stage === currentStage);

  return (
    <div className="flex items-center justify-between mb-8">
      {WORKFLOW_STAGES.map((stageConfig, index) => {
        const isActive = stageConfig.stage === currentStage;
        const isCompleted = index < currentIndex;
        const isClickable = onStageClick && (isCompleted || stageConfig.canGoBack);

        return (
          <div key={stageConfig.stage} className="flex items-center flex-1">
            {/* Stage Circle */}
            <div className="flex flex-col items-center flex-1">
              <button
                onClick={() => isClickable && onStageClick?.(stageConfig.stage)}
                disabled={!isClickable}
                className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all ${
                  isActive
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                    : isCompleted
                    ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400'
                    : 'bg-slate-800/40 border-slate-700 text-slate-500'
                } ${isClickable ? 'cursor-pointer hover:scale-110' : 'cursor-not-allowed'}`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  <Circle className={`w-6 h-6 ${isActive ? 'fill-current' : ''}`} />
                )}
              </button>
              <div className="mt-2 text-center">
                <p
                  className={`text-xs font-semibold ${
                    isActive ? 'text-emerald-400' : isCompleted ? 'text-emerald-400/70' : 'text-slate-500'
                  }`}
                >
                  {stageConfig.label}
                </p>
                <p className="text-xs text-slate-500 mt-1 max-w-[100px]">
                  {stageConfig.description}
                </p>
              </div>
            </div>

            {/* Connector Line */}
            {index < WORKFLOW_STAGES.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 ${
                  index < currentIndex ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

