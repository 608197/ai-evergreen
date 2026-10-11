import React, { useState, useRef, useEffect } from 'react';
import { BookOpen } from 'lucide-react';
import { CHARTER_GLOSSARY } from '../../constants/glossary';
import { useEvergreenStore } from '../../store/useEvergreenStore';
import './GlossaryTerm.css';

export { CHARTER_GLOSSARY };

interface GlossaryTermProps {
  term: string;
  displayText?: string;
  onOpenGlossary?: (term: string) => void;
  className?: string;
}

export const GlossaryTerm: React.FC<GlossaryTermProps> = ({
  term,
  displayText,
  onOpenGlossary,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);

  const definition = CHARTER_GLOSSARY[term] || 'Charter definition term';

  // Handle outside click or escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <span
      ref={containerRef}
      className={`ev-glossary-container ${className}`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        type="button"
        className="ev-glossary-term-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        {displayText || term}
      </button>

      {isOpen && (
        <span className="ev-glossary-popover" role="tooltip">
          <span className="ev-glossary-header">
            <span className="ev-glossary-title">{term}</span>
            <span className="ev-glossary-tag">Charter §1.3</span>
          </span>
          <span className="ev-glossary-definition">{definition}</span>
          <button
            type="button"
            className="ev-glossary-open-link"
            onClick={(e) => {
              e.stopPropagation();
              if (onOpenGlossary) {
                onOpenGlossary(term);
              } else {
                useEvergreenStore.getState().setActiveGlossaryTerm(term);
              }
              setIsOpen(false);
            }}
          >
            <BookOpen size={12} aria-hidden="true" />
            <span>Open full glossary</span>
          </button>
        </span>
      )}
    </span>
  );
};
