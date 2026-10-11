import React, { useState } from 'react';
import { Columns, SplitSquareVertical } from 'lucide-react';
import './DiffViewer.css';


interface DiffViewerProps {
  currentText: string;
  candidateText: string;
  currentLabel?: string;
  candidateLabel?: string;
  explanation?: string;
  verdictNote?: string;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({
  currentText,
  candidateText,
  currentLabel = 'Current Model (Atlas-1)',
  candidateLabel = 'Candidate Model (Atlas-2)',
  explanation,
  verdictNote,
}) => {
  const [viewMode, setViewMode] = useState<'side_by_side' | 'unified'>('side_by_side');

  // Simple token highlight helper: finds words differing between sentences
  const currentTokens = currentText.split(' ');
  const candidateTokens = candidateText.split(' ');

  return (
    <div className="diff-viewer">
      <div className="diff-viewer-toolbar">
        <div className="diff-toolbar-title">Differential Response & Payload Comparison</div>
        <div className="diff-mode-toggle" role="group" aria-label="Diff view format">
          <button
            type="button"
            className={`diff-toggle-btn ${viewMode === 'side_by_side' ? 'active' : ''}`}
            onClick={() => setViewMode('side_by_side')}
          >
            <Columns size={13} />
            Side-by-side
          </button>
          <button
            type="button"
            className={`diff-toggle-btn ${viewMode === 'unified' ? 'active' : ''}`}
            onClick={() => setViewMode('unified')}
          >
            <SplitSquareVertical size={13} />
            Unified
          </button>
        </div>
      </div>

      {viewMode === 'side_by_side' ? (
        <div className="diff-side-by-side">
          {/* Current Column */}
          <div className="diff-pane current-pane">
            <div className="diff-pane-header">
              <span className="diff-pane-marker minus">-</span>
              <span className="diff-pane-label">{currentLabel}</span>
            </div>
            <div className="diff-pane-content">
              <p className="diff-text">
                {currentTokens.map((tok, idx) => {
                  const isUnique = !candidateText.toLowerCase().includes(tok.toLowerCase().replace(/[^a-z0-9]/g, ''));
                  return (
                    <span key={idx} className={isUnique ? 'token-diff current-diff' : ''}>
                      {tok}{' '}
                    </span>
                  );
                })}
              </p>
            </div>
          </div>

          {/* Candidate Column */}
          <div className="diff-pane candidate-pane">
            <div className="diff-pane-header">
              <span className="diff-pane-marker plus">+</span>
              <span className="diff-pane-label">{candidateLabel}</span>
            </div>
            <div className="diff-pane-content">
              <p className="diff-text">
                {candidateTokens.map((tok, idx) => {
                  const isUnique = !currentText.toLowerCase().includes(tok.toLowerCase().replace(/[^a-z0-9]/g, ''));
                  return (
                    <span key={idx} className={isUnique ? 'token-diff candidate-diff' : ''}>
                      {tok}{' '}
                    </span>
                  );
                })}
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Unified view */
        <div className="diff-unified">
          <div className="unified-line minus-line">
            <span className="unified-marker">-</span>
            <div className="unified-content">{currentText}</div>
          </div>
          <div className="unified-line plus-line">
            <span className="unified-marker">+</span>
            <div className="unified-content">{candidateText}</div>
          </div>
        </div>
      )}

      {/* Rationale explanation footer */}
      {(explanation || verdictNote) && (
        <div className="diff-footer">
          {verdictNote && (
            <div className="diff-verdict-chip">
              <strong>Observation:</strong> {verdictNote}
            </div>
          )}
          {explanation && <p className="diff-explanation">{explanation}</p>}
        </div>
      )}
    </div>
  );
};
