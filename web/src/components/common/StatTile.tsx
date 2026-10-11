import React from 'react';
import './StatTile.css';

export type MetricProofType = 'illustrative' | 'measured';

interface StatTileProps {
  value: string | number;
  label: string;
  delta?: {
    value: string;
    positive?: boolean;
  };
  proofType: MetricProofType;
  subtext?: string;
  className?: string;
}

export const StatTile: React.FC<StatTileProps> = ({
  value,
  label,
  delta,
  proofType,
  subtext,
  className = '',
}) => {
  return (
    <div className={`ev-stat-tile ${className}`} role="group" aria-label={`${label}: ${value}`}>
      <div className="ev-stat-top">
        <span className="ev-stat-label">{label}</span>
        <span
          className={`ev-stat-proof-tag ev-proof-${proofType}`}
          title={
            proofType === 'illustrative'
              ? 'Illustrative synthetic scenario data'
              : 'Empirically measured test execution data'
          }
        >
          {proofType}
        </span>
      </div>

      <div className="ev-stat-value tabular-nums">{value}</div>

      {(delta || subtext) && (
        <div className="ev-stat-footer">
          {delta && (
            <span
              className={`ev-stat-delta ${
                delta.positive ? 'ev-delta-positive' : 'ev-delta-negative'
              }`}
            >
              {delta.value}
            </span>
          )}
          {subtext && <span className="ev-stat-subtext">{subtext}</span>}
        </div>
      )}
    </div>
  );
};
