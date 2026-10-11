import React, { useState, useEffect, useRef } from 'react';
import { useEvergreenStore } from '../../store/useEvergreenStore';
import { GLOSSARY_ENTRIES } from '../../constants/glossary';
import {
  X,
  Search,
  BookOpen,
  Bookmark,
  ExternalLink,
} from 'lucide-react';
import './GlossaryPanel.css';

export const GlossaryPanel: React.FC = () => {
  const {
    isGlossaryPanelOpen,
    setGlossaryPanelOpen,
    activeGlossaryTerm,
    setActiveGlossaryTerm,
  } = useEvergreenStore();

  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const activeTermCardRef = useRef<HTMLDivElement>(null);

  const categories = ['all', 'Architecture', 'Governance', 'Evaluation', 'Deployment', 'Lifecycle', 'Process'];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isGlossaryPanelOpen) {
        setGlossaryPanelOpen(false);
      }
    };

    if (isGlossaryPanelOpen) {
      window.addEventListener('keydown', handleKeyDown);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);

      if (activeGlossaryTerm && activeTermCardRef.current) {
        activeTermCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isGlossaryPanelOpen, activeGlossaryTerm, setGlossaryPanelOpen]);

  if (!isGlossaryPanelOpen) return null;

  const filteredEntries = GLOSSARY_ENTRIES.filter((entry) => {
    const matchesQuery =
      entry.term.toLowerCase().includes(query.toLowerCase()) ||
      entry.definition.toLowerCase().includes(query.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || entry.category?.toLowerCase() === selectedCategory.toLowerCase();
    return matchesQuery && matchesCategory;
  });

  return (
    <div
      className="glossary-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setGlossaryPanelOpen(false);
          setActiveGlossaryTerm(null);
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="glossary-title"
    >
      <div className="glossary-panel">
        {/* Header */}
        <div className="glossary-header">
          <div className="glossary-title-group">
            <BookOpen className="glossary-title-icon" size={20} />
            <div>
              <h2 id="glossary-title" className="glossary-title">
                Charter Glossary
              </h2>
              <span className="glossary-subtitle">
                Overlay O5 · 20 Canonical definitions from Charter §1.3
              </span>
            </div>
          </div>
          <button
            type="button"
            className="glossary-close-btn"
            onClick={() => {
              setGlossaryPanelOpen(false);
              setActiveGlossaryTerm(null);
            }}
            aria-label="Close glossary (Esc)"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="glossary-filter-bar">
          <div className="glossary-search-box">
            <Search size={14} className="glossary-search-icon" />
            <input
              ref={searchInputRef}
              type="text"
              className="glossary-search-input"
              placeholder="Search charter terms or definitions..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button
                type="button"
                className="glossary-search-clear"
                onClick={() => setQuery('')}
              >
                Clear
              </button>
            )}
          </div>

          <div className="glossary-categories">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`glossary-cat-chip ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Term List */}
        <div className="glossary-body">
          {filteredEntries.length === 0 ? (
            <div className="glossary-empty-state">
              <p>No charter terms match &ldquo;{query}&rdquo;.</p>
              <button
                type="button"
                className="btn-secondary btn-sm"
                onClick={() => {
                  setQuery('');
                  setSelectedCategory('all');
                }}
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="glossary-terms-list">
              {filteredEntries.map((item) => {
                const isSelected = activeGlossaryTerm?.toLowerCase() === item.term.toLowerCase();
                return (
                  <div
                    key={item.term}
                    ref={isSelected ? activeTermCardRef : undefined}
                    className={`glossary-card ${isSelected ? 'highlighted' : ''}`}
                    onClick={() => setActiveGlossaryTerm(item.term)}
                  >
                    <div className="glossary-card-header">
                      <div className="glossary-term-name">
                        <Bookmark size={14} className="glossary-bookmark-icon" />
                        <strong>{item.term}</strong>
                      </div>
                      <div className="glossary-card-tags">
                        {item.category && (
                          <span className="glossary-category-pill">{item.category}</span>
                        )}
                        {item.charterRef && (
                          <span className="glossary-ref-pill">{item.charterRef}</span>
                        )}
                      </div>
                    </div>
                    <p className="glossary-definition">{item.definition}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="glossary-footer">
          <span className="glossary-footer-note">
            Definitions are verbatim from the approved Project Charter. No generative paraphrasing permitted.
          </span>
          <a
            href="https://github.com/google/ai-evergreen"
            target="_blank"
            rel="noopener noreferrer"
            className="glossary-charter-link"
          >
            Charter Doc <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </div>
  );
};
