import React from 'react';
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Minus,
  HelpCircle,
  AlertOctagon,
} from 'lucide-react';
import type { EvaluationCellResult, EvaluationDimension } from '../../types/domain';
import './HeatmapGrid.css';

interface HeatmapGridProps {
  results: EvaluationCellResult[];
  selectedWorkloadId: string;
  selectedDimension: EvaluationDimension;
  onSelectCell: (workloadId: string, dimension: EvaluationDimension) => void;
}

const DIMENSIONS: { key: EvaluationDimension; label: string; isDeterministic: boolean }[] = [
  { key: 'deterministic', label: 'Deterministic', isDeterministic: true },
  { key: 'schema', label: 'Schema', isDeterministic: true },
  { key: 'semantic', label: 'Semantic', isDeterministic: false },
  { key: 'safety', label: 'Safety', isDeterministic: false },
  { key: 'tool_use', label: 'Tool use', isDeterministic: false },
  { key: 'trajectory', label: 'Trajectory', isDeterministic: true },
  { key: 'cost', label: 'Cost', isDeterministic: true },
  { key: 'latency', label: 'Latency', isDeterministic: true },
];

export const HeatmapGrid: React.FC<HeatmapGridProps> = ({
  results,
  selectedWorkloadId,
  selectedDimension,
  onSelectCell,
}) => {
  // Extract unique workloads in order
  const workloadIds = Array.from(new Set(results.map((r) => r.workloadId)));
  const workloadMap = new Map<string, { id: string; name: string }>();
  results.forEach((r) => {
    if (!workloadMap.has(r.workloadId)) {
      workloadMap.set(r.workloadId, { id: r.workloadId, name: r.workloadName });
    }
  });

  // Fast cell lookup: `${workloadId}_${dimension}`
  const cellMap = new Map<string, EvaluationCellResult>();
  results.forEach((r) => {
    cellMap.set(`${r.workloadId}_${r.dimension}`, r);
  });

  // Check which workloads have a deterministic failure
  const hasDeterministicFail = (workloadId: string) => {
    return results.some(
      (r) =>
        r.workloadId === workloadId &&
        r.isDeterministic &&
        r.status === 'fail'
    );
  };

  return (
    <div className="heatmap-container" role="region" aria-label="Evaluation Results Heatmap">
      <div className="heatmap-table-wrap">
        <table className="heatmap-table">
          <thead>
            <tr>
              <th className="heatmap-th-workload">Workload</th>
              {DIMENSIONS.map((dim) => (
                <th
                  key={dim.key}
                  className={`heatmap-th ${dim.isDeterministic ? 'th-deterministic' : ''}`}
                >
                  <div className="th-content">
                    <span>{dim.label}</span>
                    {dim.isDeterministic && <span className="th-det-marker">DET</span>}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {workloadIds.map((wId) => {
              const info = workloadMap.get(wId)!;
              const isDetFailed = hasDeterministicFail(wId);
              const isSelectedRow = selectedWorkloadId === wId;

              return (
                <tr
                  key={wId}
                  className={`heatmap-row ${isDetFailed ? 'row-deterministic-fail' : ''} ${
                    isSelectedRow ? 'row-selected' : ''
                  }`}
                >
                  <td className="heatmap-td-workload">
                    <div className="workload-cell-info">
                      <span className="workload-name">{info.name}</span>
                      {isDetFailed && (
                        <div
                          className="deterministic-fail-callout"
                          title="Deterministic check failed. LLMs advise; policy determines allowed actions."
                        >
                          <AlertOctagon size={12} />
                          <span>Deterministic failure: this overrides other results.</span>
                        </div>
                      )}
                    </div>
                  </td>

                  {DIMENSIONS.map((dim) => {
                    const cell = cellMap.get(`${wId}_${dim.key}`);
                    const isSelected = selectedWorkloadId === wId && selectedDimension === dim.key;
                    const status = cell ? cell.status : 'na';

                    return (
                      <td key={dim.key} className="heatmap-td-cell">
                        <button
                          type="button"
                          className={`heatmap-cell cell-${status} ${isSelected ? 'cell-active' : ''}`}
                          onClick={() => onSelectCell(wId, dim.key)}
                          title={`${info.name} - ${dim.label}: ${status.toUpperCase()} ${
                            cell?.score !== undefined ? `(${(cell.score * 100).toFixed(0)}%)` : ''
                          }`}
                          aria-label={`${info.name} ${dim.label} status: ${status}`}
                        >
                          {status === 'pass' && (
                            <span className="cell-indicator pass">
                              <CheckCircle size={14} className="cell-icon" />
                              <span className="cell-text">P</span>
                            </span>
                          )}
                          {status === 'warn' && (
                            <span className="cell-indicator warn">
                              <AlertTriangle size={14} className="cell-icon" />
                              <span className="cell-text">W</span>
                            </span>
                          )}
                          {status === 'fail' && (
                            <span className="cell-indicator fail">
                              <XCircle size={14} className="cell-icon" />
                              <span className="cell-text">F</span>
                            </span>
                          )}
                          {status === 'na' && (
                            <span className="cell-indicator na">
                              <Minus size={14} className="cell-icon" />
                              <span className="cell-text">n/a</span>
                            </span>
                          )}
                          {status === 'inconclusive' && (
                            <span className="cell-indicator inc">
                              <HelpCircle size={14} className="cell-icon" />
                              <span className="cell-text">?</span>
                            </span>
                          )}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend strip */}
      <div className="heatmap-legend">
        <div className="legend-items">
          <div className="legend-item">
            <span className="legend-dot pass">✓</span>
            <span>Pass (P)</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot warn">!</span>
            <span>Warn (W)</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot fail">✗</span>
            <span>Fail (F)</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot na">-</span>
            <span>Not Applicable (n/a)</span>
          </div>
        </div>
        <div className="legend-rule-reminder">
          <AlertOctagon size={13} className="text-fail" />
          <span>Deterministic checks outrank probabilistic judges. LLMs advise; policy determines.</span>
        </div>
      </div>
    </div>
  );
};
