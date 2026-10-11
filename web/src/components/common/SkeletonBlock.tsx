import React from 'react';
import './SkeletonBlock.css';

interface SkeletonBlockProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  className?: string;
}

export const SkeletonBlock: React.FC<SkeletonBlockProps> = ({
  width = '100%',
  height = '20px',
  borderRadius = 'var(--ev-radius-control)',
  className = '',
}) => {
  return (
    <div
      className={`ev-skeleton-block ${className}`}
      style={{
        width,
        height,
        borderRadius,
      }}
      aria-hidden="true"
    />
  );
};
