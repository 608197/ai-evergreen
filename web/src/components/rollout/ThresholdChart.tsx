import React, { useState } from 'react';
import type { MetricTelemetry } from '../../types/domain';
import { StatusChip } from '../common/StatusChip';
import './ThresholdChart.css';

interface ThresholdChartProps {
  metric: MetricTelemetry;
}

export const ThresholdChart: React.FC<ThresholdChartProps> = ({ metric }) => {
  const [showTable, setShowTable] = useState(false);

  // SVG dimensions
  const svgWidth = 260;
  const svgHeight = 70;
  const padX = 10;
  const padY = 8;

  const history = metric.history;
  const allValues = history.map((h) => h.value).concat(metric.limit);
  const minVal = Math.min(...allValues);
  const maxVal = Math.max(...allValues);
  const range = maxVal - minVal || 1;

  const getY = (val: number) => {
    const norm = (val - minVal) / range;
    return svgHeight - padY - norm * (svgHeight - 2 * padY);
  };

  const getX = (idx: number) => {
    if (history.length <= 1) return svgWidth / 2;
    return padX + (idx / (history.length - 1)) * (svgWidth - 2 * padX);
  };

  const limitY = getY(metric.limit);

  // Generate SVG path for line and area
  const points = history.map((h, i) => ({ x: getX(i), y: getY(h.value) }));
  const pathD = points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');
  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${svgHeight - padY} L ${points[0].x} ${svgHeight - padY} Z`
    : '';

  return (
    <div
      className={`threshold-chart-card ${metric.isBreach ? 'threshold-chart-card--breach' : ''}`}
      role="region"
      aria-label={`${metric.name} metric telemetry`}
    >
      <div className="threshold-chart-header">
        <span className="threshold-metric-name">{metric.name}</span>
        <StatusChip
          status={metric.isBreach ? 'fail' : 'pass'}
          label={metric.isBreach ? 'BREACH' : 'HEALTHY'}
        />
      </div>

      <div className="threshold-chart-metrics">
        <div className="threshold-current-value">
          {metric.current}
          {metric.unit && <span style={{ fontSize: '0.85rem', marginLeft: '3px' }}>{metric.unit}</span>}
        </div>
        <div className="threshold-limit-badge">
          Limit: {metric.comparator} {metric.limit}
          {metric.unit ? ` ${metric.unit}` : ''}
        </div>
      </div>

      <div className="threshold-svg-wrap">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="threshold-svg"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {/* Limit horizontal line */}
          <line
            x1={padX}
            y1={limitY}
            x2={svgWidth - padX}
            y2={limitY}
            className="chart-limit-line"
          />

          {/* Area fill */}
          {areaD && <path d={areaD} className="chart-data-area" />}

          {/* Line stroke */}
          {pathD && <path d={pathD} className="chart-data-line" />}

          {/* Points */}
          {points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={3.5}
              className="chart-data-point"
            />
          ))}
        </svg>
      </div>

      <button
        type="button"
        className="threshold-table-toggle"
        onClick={() => setShowTable(!showTable)}
        aria-expanded={showTable}
      >
        {showTable ? 'Hide data table' : 'Show accessible table'}
      </button>

      {showTable && (
        <table className="threshold-data-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {history.map((pt, i) => (
              <tr key={i}>
                <td>{pt.timestamp}</td>
                <td>{pt.value} {metric.unit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
