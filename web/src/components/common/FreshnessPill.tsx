import React from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import './FreshnessPill.css';

interface FreshnessPillProps {
  isStale?: boolean;
  lastUpdatedText?: string;
  className?: string;
  onClick?: () => void;
}

export const FreshnessPill: React.FC<FreshnessPillProps> = ({
  isStale = false,
  lastUpdatedText = 'Graph fresh 2 min ago',
  className = '',
  onClick,
}) => {
  return (
    <div
      className={`ev-freshness-pill ${isStale ? 'ev-freshness-stale' : 'ev-freshness-fresh'} ${className}`}
      role="status"
      aria-live="polite"
      onClick={onClick}
      title={
        isStale
          ? 'Data is stale: Autonomous scope reduction paused'
          : 'Data is current and verified against recent graph state'
      }
    >
      {isStale ? (
        <>
          <AlertTriangle size={13} className="ev-freshness-icon" aria-hidden="true" />
          <span className="ev-freshness-label">Graph Stale (Reduction Paused)</span>
        </>
      ) : (
        <>
          <Clock size={13} className="ev-freshness-icon" aria-hidden="true" />
          <span className="ev-freshness-dot" aria-hidden="true" />
          <span className="ev-freshness-label">{lastUpdatedText}</span>
        </>
      )}
    </div>
  );
};
