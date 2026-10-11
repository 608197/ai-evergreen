import React from 'react';
import './RiskMeter.css';

export type RiskTier = 'low' | 'medium' | 'high' | 'critical';

interface RiskMeterProps {
  tier: RiskTier;
  compact?: boolean;
  className?: string;
}

export const RiskMeter: React.FC<RiskMeterProps> = ({
  tier,
  compact = false,
  className = '',
}) => {
  const getActiveSegments = (t: RiskTier) => {
    switch (t) {
      case 'low':
        return 1;
      case 'medium':
        return 2;
      case 'high':
        return 3;
      case 'critical':
        return 4;
    }
  };

  const getLabel = (t: RiskTier) => {
    switch (t) {
      case 'low':
        return 'Low risk';
      case 'medium':
        return 'Medium risk';
      case 'high':
        return 'High risk';
      case 'critical':
        return 'Critical risk';
    }
  };

  const activeCount = getActiveSegments(tier);
  const label = getLabel(tier);

  return (
    <div
      className={`ev-risk-meter ${compact ? 'ev-risk-compact' : ''} ${className}`}
      role="meter"
      aria-valuenow={activeCount}
      aria-valuemin={1}
      aria-valuemax={4}
      aria-valuetext={label}
      title={label}
    >
      <div className="ev-risk-segments" aria-hidden="true">
        {[1, 2, 3, 4].map((seg) => (
          <span
            key={seg}
            className={`ev-risk-segment ${seg <= activeCount ? 'ev-segment-active' : ''}`}
          />
        ))}
      </div>
      {!compact && <span className="ev-risk-label">{label}</span>}
      <span className="sr-only">Risk tier {tier}</span>
    </div>
  );
};
