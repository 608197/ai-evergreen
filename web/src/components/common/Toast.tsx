import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, X, RotateCcw } from 'lucide-react';
import './Toast.css';

export type ToastType = 'success' | 'warn' | 'error';

interface ToastProps {
  id: string;
  type?: ToastType;
  message: string;
  subtext?: string;
  onUndo?: () => void;
  onClose: (id: string) => void;
  durationMs?: number;
  className?: string;
}

export const Toast: React.FC<ToastProps> = ({
  id,
  type = 'success',
  message,
  subtext,
  onUndo,
  onClose,
  durationMs = 6000,
  className = '',
}) => {
  useEffect(() => {
    if (durationMs > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, durationMs);
      return () => clearTimeout(timer);
    }
  }, [id, durationMs, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={16} className="ev-toast-icon ev-toast-icon-success" aria-hidden="true" />;
      case 'warn':
        return <AlertTriangle size={16} className="ev-toast-icon ev-toast-icon-warn" aria-hidden="true" />;
      case 'error':
        return <AlertCircle size={16} className="ev-toast-icon ev-toast-icon-error" aria-hidden="true" />;
    }
  };

  return (
    <div
      className={`ev-toast ev-toast-${type} ${className}`}
      role="status"
      aria-live={type === 'error' ? 'assertive' : 'polite'}
    >
      <div className="ev-toast-content">
        {getIcon()}
        <div className="ev-toast-text">
          <div className="ev-toast-msg">{message}</div>
          {subtext && <div className="ev-toast-subtext">{subtext}</div>}
        </div>
      </div>

      <div className="ev-toast-actions">
        {onUndo && (
          <button
            type="button"
            className="ev-toast-undo-btn"
            onClick={onUndo}
            aria-label="Undo action"
          >
            <RotateCcw size={12} aria-hidden="true" />
            <span>Undo</span>
          </button>
        )}
        <button
          type="button"
          className="ev-toast-close-btn"
          onClick={() => onClose(id)}
          aria-label="Close notification"
        >
          <X size={14} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};
