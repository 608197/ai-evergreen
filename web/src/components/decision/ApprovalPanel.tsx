import React from 'react';
import { useEvergreenStore } from '../../store/useEvergreenStore';
import { StatusChip } from '../common/StatusChip';
import './ApprovalPanel.css';

interface ApprovalPanelProps {
  selectedIds: string[];
  onClearSelection: () => void;
  onOpenModal: () => void;
}

export const ApprovalPanel: React.FC<ApprovalPanelProps> = ({
  selectedIds,
  onClearSelection,
  onOpenModal,
}) => {
  const { recommendations, currentEventId } = useEvergreenStore();

  if (selectedIds.length === 0) return null;

  const eventRecs = recommendations.filter(
    (r) => r.eventId === currentEventId && selectedIds.includes(r.workloadId)
  );

  const canaryCount = eventRecs.filter((r) => r.treatment === 'canary').length;
  const migrateCount = eventRecs.filter((r) => r.treatment === 'migrate').length;

  return (
    <div className="approval-panel-sticky" role="region" aria-label="Approval Scope Actions">
      <div className="approval-panel__info">
        <div className="approval-panel__headline">
          <span className="approval-panel__count">
            {selectedIds.length} {selectedIds.length === 1 ? 'workload' : 'workloads'} selected for approval
          </span>
          <div className="approval-panel__breakdown">
            {canaryCount > 0 && (
              <StatusChip status="canary" label={`${canaryCount} CANARY`} />
            )}
            {migrateCount > 0 && (
              <StatusChip status="migrate" label={`${migrateCount} MIGRATE`} />
            )}
          </div>
        </div>
        <span className="approval-panel__subtext">
          No bulk "Approve All" exists by design. Each promotion requires verified human sign-off.
        </span>
      </div>

      <div className="approval-panel__actions">
        <button
          type="button"
          className="approval-panel__clear-btn"
          onClick={onClearSelection}
        >
          Clear Selection
        </button>
        <button
          type="button"
          className="btn btn-primary approval-panel__sign-btn"
          onClick={onOpenModal}
        >
          <span>Review & Sign Scope ({selectedIds.length})</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
};
