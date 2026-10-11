import React from 'react';
import './ConfidenceMeter.css';

interface ConfidenceMeterProps {
  score: number; // 0.00 to 1.00
  showBar?: boolean;
  className?: string;
}

export const ConfidenceMeter: React.FC<ConfidenceMeterProps> = ({
  score,
  showBar = true,
  className = '',
}) => {
  const clampedScore = Math.max(0, Math.min(1, score));

  const getBand = (val: number) => {
    if (val >= 0.90) return { label: 'High', class: 'band-high' };
    if (val >= 0.75) return { label: 'Moderate', class: 'band-moderate' };
    if (val >= 0.60) return { label: 'Low', class: 'band-low' };
    return { label: 'Very low', class: 'band-very-low' };
  };

  const band = getBand(clampedScore);
  const showLimitNotice = clampedScore < 0.75;

  return (
    <div className={`ev-confidence-meter ${className}`} title={`Confidence: ${clampedScore.toFixed(2)} (${band.label})`}>
      <div className="ev-confidence-header">
        <span className="ev-confidence-score tabular-nums">{clampedScore.toFixed(2)}</span>
        <span className={`ev-confidence-band ${band.class}`}>{band.label}</span>
      </div>

      {showBar && (
        <div
          className="ev-confidence-bar-container"
          role="progressbar"
          aria-valuenow={Math.round(clampedScore * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Confidence score: ${clampedScore.toFixed(2)}`}
        >
          {/* Threshold ticks at 0.60, 0.75, 0.90 */}
          <span className="ev-confidence-tick tick-60" style={{ left: '60%' }} title="0.60 threshold" />
          <span className="ev-confidence-tick tick-75" style={{ left: '75%' }} title="0.75 threshold" />
          <span className="ev-confidence-tick tick-90" style={{ left: '90%' }} title="0.90 threshold" />
          <div
            className={`ev-confidence-fill ${band.class}`}
            style={{ width: `${clampedScore * 100}%` }}
          />
        </div>
      )}

      {showLimitNotice && (
        <span className="ev-confidence-warning">
          Confidence limits apply
        </span>
      )}
    </div>
  );
};
