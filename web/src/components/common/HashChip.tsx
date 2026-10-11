import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, Copy, Check } from 'lucide-react';
import './HashChip.css';

interface HashChipProps {
  hash: string;
  isVerified?: boolean;
  label?: string;
  onBrokenClick?: () => void;
  className?: string;
}

export const HashChip: React.FC<HashChipProps> = ({
  hash,
  isVerified = true,
  label = 'SHA-256',
  onBrokenClick,
  className = '',
}) => {
  const [copied, setCopied] = useState(false);

  // Truncate first 8 and last 4 characters
  const formattedHash =
    hash.length > 12 ? `${hash.slice(0, 8)}...${hash.slice(-4)}` : hash;

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(hash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div
      className={`ev-hash-chip ${isVerified ? 'ev-hash-verified' : 'ev-hash-broken'} ${className}`}
      role="group"
      aria-label={`${label} hash ${formattedHash}. ${isVerified ? 'Verified' : 'INTEGRITY BROKEN'}`}
    >
      <div className="ev-hash-status" onClick={!isVerified ? onBrokenClick : undefined}>
        {isVerified ? (
          <ShieldCheck size={14} className="ev-hash-icon ev-icon-verified" aria-hidden="true" />
        ) : (
          <ShieldAlert size={14} className="ev-hash-icon ev-icon-broken" aria-hidden="true" />
        )}
        <span className="ev-hash-label">{label}:</span>
        <code className="ev-hash-code" title={hash}>{formattedHash}</code>
      </div>

      <button
        type="button"
        className="ev-hash-copy-btn"
        onClick={handleCopy}
        aria-label={copied ? 'Copied hash to clipboard' : 'Copy full hash to clipboard'}
        title="Copy full hash"
      >
        {copied ? (
          <Check size={12} className="ev-icon-copied" aria-hidden="true" />
        ) : (
          <Copy size={12} aria-hidden="true" />
        )}
      </button>
    </div>
  );
};
