import { Inbox } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import './EmptyState.css';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onActionClick?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  description,
  actionText,
  onActionClick,
  className = '',
}) => {
  return (
    <div className={`ev-empty-state ${className}`} role="status">
      <div className="ev-empty-icon-wrap" aria-hidden="true">
        <Icon size={24} className="ev-empty-icon" />
      </div>
      <h3 className="ev-empty-title">{title}</h3>
      <p className="ev-empty-desc">{description}</p>
      {actionText && onActionClick && (
        <button
          type="button"
          className="ev-empty-action-btn"
          onClick={onActionClick}
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
