import React from 'react';
import { AlertCircle, ArrowRight } from 'lucide-react';
import './GateBanner.css';

interface GateBannerProps {
  gateId: string; // e.g. "G1", "G2"
  gateName: string; // e.g. "Blast Radius Confirmation"
  blockingCount: number;
  message: string;
  actionText?: string;
  onActionClick?: () => void;
  className?: string;
}

export const GateBanner: React.FC<GateBannerProps> = ({
  gateId,
  gateName,
  blockingCount,
  message,
  actionText = 'Resolve first item',
  onActionClick,
  className = '',
}) => {
  return (
    <div
      className={`ev-gate-banner ${className}`}
      role="alert"
      aria-live="polite"
    >
      <div className="ev-gate-banner-left">
        <AlertCircle size={18} className="ev-gate-banner-icon" aria-hidden="true" />
        <div className="ev-gate-banner-text">
          <span className="ev-gate-tag">{gateId}: {gateName}</span>
          <span className="ev-gate-message">
            <strong>{blockingCount} unresolved {blockingCount === 1 ? 'item blocks' : 'items block'} the next stage:</strong> {message}
          </span>
        </div>
      </div>

      {onActionClick && (
        <button
          type="button"
          className="ev-gate-action-btn"
          onClick={onActionClick}
        >
          <span>{actionText}</span>
          <ArrowRight size={14} aria-hidden="true" />
        </button>
      )}
    </div>
  );
};
