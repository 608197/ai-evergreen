import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEvergreenStore } from '../../store/useEvergreenStore';
import {
  X,
  Sparkles,
  Calendar,
  AlertCircle,
  FileText,
  Layers,
  Building,
  ArrowRight,
} from 'lucide-react';
import './ManualEventModal.css';

export const ManualEventModal: React.FC = () => {
  const navigate = useNavigate();
  const {
    isManualEventModalOpen,
    setManualEventModalOpen,
    logManualEvent,
    currentUser,
    estateEntities,
  } = useEvergreenStore();

  const [kind, setKind] = useState<'retirement' | 'upgrade' | 'price_change' | 'policy_change' | 'api_change' | 'availability'>('retirement');
  const [targetModel, setTargetModel] = useState('Atlas-1');
  const [provider, setProvider] = useState('AWS Bedrock');
  const [effectiveDate, setEffectiveDate] = useState('2026-10-24');
  const [sourceClaim, setSourceClaim] = useState('');
  const [confidence, setConfidence] = useState(0.70);
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const modalRef = useRef<HTMLDivElement>(null);

  // Available models in estate
  const estateModels = estateEntities
    .filter((e) => e.type === 'model')
    .map((e) => ({ id: e.id, name: e.name, provider: e.provider || 'Provider' }));

  const isModelInEstate = estateModels.some(
    (m) => m.name.toLowerCase() === targetModel.trim().toLowerCase()
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isManualEventModalOpen) {
        setManualEventModalOpen(false);
      }
    };

    if (isManualEventModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isManualEventModalOpen, setManualEventModalOpen]);

  if (!isManualEventModalOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!targetModel.trim()) {
      newErrors.targetModel = 'Model or component name is required.';
    }
    if (!provider.trim()) {
      newErrors.provider = 'Provider name is required.';
    }
    if ((kind === 'retirement' || kind === 'price_change') && !effectiveDate) {
      newErrors.effectiveDate = 'Effective date is required for retirement and price changes.';
    }
    if (!sourceClaim.trim()) {
      newErrors.sourceClaim = 'Source URL or notice note is mandatory (charter: external claims require provenance).';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const newEventId = logManualEvent(
      {
        title: `${targetModel} ${kind.replace('_', ' ')}`,
        kind,
        targetModel,
        provider,
        effectiveDate,
        sourceClaim,
        confidence,
        description,
      },
      currentUser
    );

    navigate(`/events/${newEventId}/blast-radius`);
  };

  return (
    <div
      className="manual-event-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) setManualEventModalOpen(false);
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="manual-event-title"
    >
      <div className="manual-event-modal" ref={modalRef}>
        {/* Header */}
        <div className="manual-event-header">
          <div className="manual-event-title-group">
            <div className="manual-event-icon-badge">
              <Sparkles className="manual-event-icon" size={18} />
            </div>
            <div>
              <h2 id="manual-event-title" className="manual-event-title">
                Log Model Change Event
              </h2>
              <span className="manual-event-subtitle">
                Overlay O3 · Ad-hoc entry with lower initial confidence (0.70)
              </span>
            </div>
          </div>
          <button
            type="button"
            className="manual-event-close-btn"
            onClick={() => setManualEventModalOpen(false)}
            aria-label="Close dialog (Esc)"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="manual-event-form">
          <div className="manual-event-body">
            {/* Field 1: Change Kind */}
            <div className="form-field-group">
              <label htmlFor="change-kind" className="form-label">
                Change Kind <span className="req-marker">*</span>
              </label>
              <select
                id="change-kind"
                className="form-select"
                value={kind}
                onChange={(e) => setKind(e.target.value as any)}
              >
                <option value="retirement">Retirement (Model End-of-Life)</option>
                <option value="upgrade">Version Upgrade (New Checkpoint)</option>
                <option value="price_change">Pricing Shift / Tier Restructure</option>
                <option value="policy_change">Upstream Safety or Policy Update</option>
                <option value="api_change">Provider API / Tool-Calling Signature Shift</option>
                <option value="availability">Regional Availability / Latency SLA</option>
              </select>
            </div>

            {/* Field 2 & 3: Model and Provider */}
            <div className="form-row-two-col">
              <div className="form-field-group">
                <label htmlFor="target-model" className="form-label">
                  Model or Component <span className="req-marker">*</span>
                </label>
                <div className="input-with-icon">
                  <Layers size={14} className="input-icon" />
                  <input
                    id="target-model"
                    type="text"
                    list="estate-models-list"
                    className={`form-input ${errors.targetModel ? 'input-error' : ''}`}
                    placeholder="e.g. Atlas-1, Claude-3.7-Sonnet"
                    value={targetModel}
                    onChange={(e) => setTargetModel(e.target.value)}
                  />
                  <datalist id="estate-models-list">
                    {estateModels.map((m) => (
                      <option key={m.id} value={m.name}>
                        {m.provider}
                      </option>
                    ))}
                  </datalist>
                </div>
                {errors.targetModel && <span className="field-error-msg">{errors.targetModel}</span>}
                {!isModelInEstate && targetModel.trim() && (
                  <div className="form-note-warning">
                    <AlertCircle size={13} />
                    <span>Not in the estate. Evergreen will discover dependencies from available evidence.</span>
                  </div>
                )}
              </div>

              <div className="form-field-group">
                <label htmlFor="model-provider" className="form-label">
                  Provider <span className="req-marker">*</span>
                </label>
                <div className="input-with-icon">
                  <Building size={14} className="input-icon" />
                  <input
                    id="model-provider"
                    type="text"
                    className={`form-input ${errors.provider ? 'input-error' : ''}`}
                    placeholder="e.g. AWS Bedrock, OpenAI"
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                  />
                </div>
                {errors.provider && <span className="field-error-msg">{errors.provider}</span>}
              </div>
            </div>

            {/* Field 4: Effective Date */}
            <div className="form-field-group">
              <label htmlFor="effective-date" className="form-label">
                Effective Date {kind === 'retirement' || kind === 'price_change' ? <span className="req-marker">*</span> : '(Optional)'}
              </label>
              <div className="input-with-icon">
                <Calendar size={14} className="input-icon" />
                <input
                  id="effective-date"
                  type="date"
                  className={`form-input ${errors.effectiveDate ? 'input-error' : ''}`}
                  value={effectiveDate}
                  onChange={(e) => setEffectiveDate(e.target.value)}
                />
              </div>
              {errors.effectiveDate && <span className="field-error-msg">{errors.effectiveDate}</span>}
            </div>

            {/* Field 5: Source Link or Note (Mandatory) */}
            <div className="form-field-group">
              <label htmlFor="source-claim" className="form-label">
                Source Notice Link or Note <span className="req-marker">*</span>
              </label>
              <div className="input-with-icon">
                <FileText size={14} className="input-icon" />
                <input
                  id="source-claim"
                  type="text"
                  className={`form-input ${errors.sourceClaim ? 'input-error' : ''}`}
                  placeholder="https://aws.amazon.com/bedrock/notice or Vendor email advisory #492"
                  value={sourceClaim}
                  onChange={(e) => setSourceClaim(e.target.value)}
                />
              </div>
              <span className="field-hint">
                Charter Rule: External claim text is untrusted; a verifiable source URI or reference is mandatory.
              </span>
              {errors.sourceClaim && <span className="field-error-msg">{errors.sourceClaim}</span>}
            </div>

            {/* Field 6: Initial Confidence Slider */}
            <div className="form-field-group">
              <div className="confidence-label-row">
                <label htmlFor="confidence-slider" className="form-label">
                  Initial Evidence Confidence: <strong>{(confidence * 100).toFixed(0)}%</strong>
                </label>
                <span className="confidence-pill">Manual baseline 0.70</span>
              </div>
              <input
                id="confidence-slider"
                type="range"
                min="0.30"
                max="0.95"
                step="0.05"
                className="form-range"
                value={confidence}
                onChange={(e) => setConfidence(parseFloat(e.target.value))}
              />
              <span className="field-hint">
                Manual entries start with lower confidence (0.70) until confirmed by automated telemetry or code scans.
              </span>
            </div>

            {/* Description / Extra Context */}
            <div className="form-field-group">
              <label htmlFor="event-description" className="form-label">
                Context & Operator Notes
              </label>
              <textarea
                id="event-description"
                rows={2}
                className="form-textarea"
                placeholder="Optional details regarding the deprecation, expected replacement models, or business impact..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="manual-event-footer">
            <button
              type="button"
              className="manual-event-cancel-btn btn-secondary"
              onClick={() => setManualEventModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="manual-event-submit-btn btn-primary">
              Log Event & Start Blast Radius <ArrowRight size={15} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
