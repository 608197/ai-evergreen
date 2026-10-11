import React from 'react';
import { Database } from 'lucide-react';
import './SandboxBadge.css';

interface SandboxBadgeProps {
  variant?: 'pill' | 'strip';
  className?: string;
}

export const SandboxBadge: React.FC<SandboxBadgeProps> = ({
  variant = 'pill',
  className = '',
}) => {
  if (variant === 'strip') {
    return (
      <footer
        className={`ev-sandbox-strip ${className}`}
        role="contentinfo"
        aria-label="Sandbox environment notice"
      >
        <Database size={13} aria-hidden="true" />
        <span>Sandbox environment · All models, applications, and decisions run on synthetic enterprise data</span>
      </footer>
    );
  }

  return (
    <div
      className={`ev-sandbox-badge ${className}`}
      role="status"
      title="This instance operates strictly on synthetic models and estate data"
    >
      <span className="ev-sandbox-dot" aria-hidden="true" />
      <span className="ev-sandbox-text">Sandbox · Synthetic data</span>
    </div>
  );
};
