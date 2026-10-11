import React from 'react';
import { Check, Lock } from 'lucide-react';
import './StageStepper.css';

export type StageState = 'complete' | 'current' | 'available' | 'locked';

export interface StageStep {
  id: string; // e.g., 'blast-radius', 'plan', 'results', 'decision', 'rollout', 'record'
  index: number; // 1 to 6
  name: string;
  state: StageState;
  openBadge?: string; // e.g., "1 to resolve"
  lockReason?: string; // e.g., "Complete Gate G1 first"
}

interface StageStepperProps {
  stages: StageStep[];
  currentStageId: string;
  onSelectStage: (stageId: string) => void;
  className?: string;
}

export const StageStepper: React.FC<StageStepperProps> = ({
  stages,
  currentStageId,
  onSelectStage,
  className = '',
}) => {
  return (
    <nav
      className={`ev-stage-stepper ${className}`}
      aria-label="Event qualification pipeline"
    >
      <ol className="ev-stepper-list">
        {stages.map((stage, idx) => {
          const isCurrent = stage.id === currentStageId;
          const isComplete = stage.state === 'complete';
          const isLocked = stage.state === 'locked';

          return (
            <li
              key={stage.id}
              className={`ev-stepper-item ev-step-${stage.state} ${isCurrent ? 'ev-step-active' : ''}`}
            >
              {idx > 0 && <span className="ev-stepper-connector" aria-hidden="true" />}

              <button
                type="button"
                className="ev-step-btn"
                disabled={isLocked}
                onClick={() => !isLocked && onSelectStage(stage.id)}
                aria-current={isCurrent ? 'step' : undefined}
                title={isLocked ? stage.lockReason || 'Locked until prior stage clears gate' : undefined}
              >
                <span className="ev-step-indicator">
                  {isComplete ? (
                    <Check size={12} className="ev-step-check" aria-hidden="true" />
                  ) : isLocked ? (
                    <Lock size={11} className="ev-step-lock" aria-hidden="true" />
                  ) : (
                    <span className="ev-step-num tabular-nums">{stage.index}</span>
                  )}
                </span>

                <span className="ev-step-name">{stage.name}</span>

                {stage.openBadge && (
                  <span className="ev-step-badge" aria-label={`${stage.openBadge} open items`}>
                    {stage.openBadge}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
