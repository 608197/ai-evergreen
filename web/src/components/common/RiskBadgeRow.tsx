import React from 'react';
import { StatusChip } from './StatusChip';
import './RiskBadgeRow.css';

interface OutcomeCounts {
  migrate: number;
  canary: number;
  investigate: number;
  block: number;
}

interface RiskBadgeRowProps {
  counts: OutcomeCounts;
  className?: string;
  onFilterClick?: (status: keyof OutcomeCounts) => void;
  activeFilter?: string | null;
}

export const RiskBadgeRow: React.FC<RiskBadgeRowProps> = ({
  counts,
  className = '',
  onFilterClick,
  activeFilter,
}) => {
  const outcomes: Array<{ key: keyof OutcomeCounts; label: string }> = [
    { key: 'migrate', label: `Migrate ${counts.migrate}` },
    { key: 'canary', label: `Canary ${counts.canary}` },
    { key: 'investigate', label: `Investigate ${counts.investigate}` },
    { key: 'block', label: `Block ${counts.block}` },
  ];

  return (
    <div
      className={`ev-risk-badge-row ${className}`}
      role="group"
      aria-label="Summary of outcome counts"
    >
      {outcomes.map(({ key, label }) => {
        const isSelected = activeFilter === key;
        const chip = (
          <StatusChip
            status={key}
            label={label}
            size="medium"
          />
        );

        if (onFilterClick) {
          return (
            <button
              key={key}
              type="button"
              className={`ev-risk-badge-btn ${isSelected ? 'ev-badge-selected' : ''}`}
              onClick={() => onFilterClick(key)}
              aria-pressed={isSelected}
            >
              {chip}
            </button>
          );
        }

        return <span key={key}>{chip}</span>;
      })}
    </div>
  );
};
