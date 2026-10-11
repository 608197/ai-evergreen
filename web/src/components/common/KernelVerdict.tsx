import React from 'react';
import { StatusChip } from './StatusChip';
import { ExternalLink } from 'lucide-react';
import './KernelVerdict.css';

export type KernelDecision = 'permit' | 'deny';

interface KernelVerdictProps {
  decision: KernelDecision;
  ruleId: string;
  reason: string;
  onViewRule?: (ruleId: string) => void;
  className?: string;
}

export const KernelVerdict: React.FC<KernelVerdictProps> = ({
  decision,
  ruleId,
  reason,
  onViewRule,
  className = '',
}) => {
  const isDeny = decision === 'deny';

  return (
    <div
      className={`ev-kernel-verdict ${isDeny ? 'ev-verdict-deny' : 'ev-verdict-permit'} ${className}`}
      role="region"
      aria-label={`Trusted Kernel verdict: ${decision}. Rule ${ruleId}`}
    >
      <div className="ev-verdict-top">
        <StatusChip status={decision} size="small" />
        <span className="ev-verdict-rule-id tabular-nums">{ruleId}</span>
      </div>

      <div className="ev-verdict-reason">
        {reason}
      </div>

      {onViewRule && (
        <button
          type="button"
          className="ev-verdict-link"
          onClick={() => onViewRule(ruleId)}
          aria-label={`View rule details for ${ruleId}`}
        >
          <span>View rule</span>
          <ExternalLink size={12} aria-hidden="true" />
        </button>
      )}
    </div>
  );
};
