import React from 'react';
import {
  CheckCircle2,
  Activity,
  Search,
  Ban,
  ShieldCheck,
  ShieldX,
  Check,
  AlertTriangle,
  X,
  Minus,
  HelpCircle,
  Clock,
  GitCompare,
} from 'lucide-react';
import './StatusChip.css';

export type StatusVariant =
  | 'migrate'
  | 'canary'
  | 'investigate'
  | 'block'
  | 'permit'
  | 'deny'
  | 'pass'
  | 'warn'
  | 'fail'
  | 'na'
  | 'inconclusive'
  | 'stale'
  | 'unresolved'
  | 'conflict'
  | 'confirmed'
  | 'proposed'
  | 'overridden'
  | 'unaffected';

export type StatusSize = 'small' | 'medium';

interface StatusChipProps {
  status: StatusVariant;
  label?: string;
  size?: StatusSize;
  className?: string;
}

export const StatusChip: React.FC<StatusChipProps> = ({
  status,
  label,
  size = 'medium',
  className = '',
}) => {
  const getMeta = () => {
    switch (status) {
      case 'migrate':
        return { icon: CheckCircle2, defaultLabel: 'Migrate' };
      case 'canary':
        return { icon: Activity, defaultLabel: 'Canary' };
      case 'investigate':
        return { icon: Search, defaultLabel: 'Investigate' };
      case 'block':
        return { icon: Ban, defaultLabel: 'Block' };
      case 'permit':
        return { icon: ShieldCheck, defaultLabel: 'Kernel: Permit' };
      case 'deny':
        return { icon: ShieldX, defaultLabel: 'Kernel: Deny' };
      case 'pass':
        return { icon: Check, defaultLabel: 'Pass' };
      case 'warn':
        return { icon: AlertTriangle, defaultLabel: 'Warn' };
      case 'fail':
        return { icon: X, defaultLabel: 'Fail' };
      case 'na':
        return { icon: Minus, defaultLabel: 'N/A' };
      case 'inconclusive':
        return { icon: HelpCircle, defaultLabel: 'Inconclusive' };
      case 'stale':
        return { icon: Clock, defaultLabel: 'Stale' };
      case 'unresolved':
        return { icon: HelpCircle, defaultLabel: 'Unresolved' };
      case 'conflict':
        return { icon: GitCompare, defaultLabel: 'Conflict' };
      case 'confirmed':
        return { icon: Check, defaultLabel: 'Confirmed' };
      case 'proposed':
        return { icon: HelpCircle, defaultLabel: 'Proposed' };
      case 'overridden':
        return { icon: AlertTriangle, defaultLabel: 'Overridden' };
      case 'unaffected':
        return { icon: Minus, defaultLabel: 'Connected' };
    }
  };

  const { icon: Icon, defaultLabel } = getMeta();
  const text = label || defaultLabel;
  const iconSize = size === 'small' ? 12 : 14;

  return (
    <span
      className={`ev-status-chip ev-status-${status} ev-size-${size} ${className}`}
      role="status"
      aria-label={text}
    >
      <Icon size={iconSize} className="ev-status-icon" aria-hidden="true" />
      <span className="ev-status-label">{text}</span>
    </span>
  );
};
