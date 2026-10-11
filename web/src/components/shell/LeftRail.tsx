import React from 'react';
import { NavLink } from 'react-router-dom';
import { useEvergreenStore } from '../../store/useEvergreenStore';
import {
  Home,
  Layers,
  Network,
  BrainCircuit,
  Sliders,
  TrendingUp,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  Plug,
} from 'lucide-react';
import './LeftRail.css';

export const LeftRail: React.FC = () => {
  const { railCollapsed, setRailCollapsed, events } = useEvergreenStore();

  // Pending decisions count
  const openEvents = events.filter((e) => e.status === 'open');
  const pendingDecisionsCount = openEvents.length;

  return (
    <nav
      className={`ev-rail ${railCollapsed ? 'ev-rail--collapsed' : ''}`}
      aria-label="Main Navigation"
    >
      <div className="ev-rail__nav-list">
        {/* Core Destinations */}
        <NavLink
          to="/"
          className={({ isActive }) =>
            `ev-rail__item ${isActive ? 'ev-rail__item--active' : ''}`
          }
          title={railCollapsed ? 'Home (G H)' : undefined}
          end
        >
          <Home size={18} className="ev-rail__icon" aria-hidden="true" />
          {!railCollapsed && <span className="ev-rail__label">Home</span>}
          {pendingDecisionsCount > 0 && (
            <span
              className={`ev-rail__badge ${railCollapsed ? 'ev-rail__badge--dot' : ''}`}
              aria-label={`${pendingDecisionsCount} decisions waiting`}
            >
              {!railCollapsed ? pendingDecisionsCount : ''}
            </span>
          )}
        </NavLink>

        <NavLink
          to="/events/E-2026-001/blast-radius"
          className={({ isActive }) =>
            `ev-rail__item ${isActive ? 'ev-rail__item--active' : ''}`
          }
          title={railCollapsed ? 'Current Event (G E)' : undefined}
        >
          <Layers size={18} className="ev-rail__icon" aria-hidden="true" />
          {!railCollapsed && <span className="ev-rail__label">Current Event</span>}
        </NavLink>

        <NavLink
          to="/estate"
          className={({ isActive }) =>
            `ev-rail__item ${isActive ? 'ev-rail__item--active' : ''}`
          }
          title={railCollapsed ? 'Estate Explorer (G S)' : undefined}
        >
          <Network size={18} className="ev-rail__icon" aria-hidden="true" />
          {!railCollapsed && <span className="ev-rail__label">Estate</span>}
        </NavLink>

        <NavLink
          to="/integrations"
          className={({ isActive }) =>
            `ev-rail__item ${isActive ? 'ev-rail__item--active' : ''}`
          }
          title={railCollapsed ? 'Connectors & Integrations' : undefined}
        >
          <Plug size={18} className="ev-rail__icon" aria-hidden="true" />
          {!railCollapsed && <span className="ev-rail__label">Integrations</span>}
        </NavLink>

        <NavLink
          to="/memory"
          className={({ isActive }) =>
            `ev-rail__item ${isActive ? 'ev-rail__item--active' : ''}`
          }
          title={railCollapsed ? 'Qualification Memory (G M)' : undefined}
        >
          <BrainCircuit size={18} className="ev-rail__icon" aria-hidden="true" />
          {!railCollapsed && <span className="ev-rail__label">Memory</span>}
        </NavLink>

        <NavLink
          to="/controls"
          className={({ isActive }) =>
            `ev-rail__item ${isActive ? 'ev-rail__item--active' : ''}`
          }
          title={railCollapsed ? 'Controls & Kernel (G C)' : undefined}
        >
          <Sliders size={18} className="ev-rail__icon" aria-hidden="true" />
          {!railCollapsed && <span className="ev-rail__label">Controls</span>}
        </NavLink>

        {/* Roadmap Divider */}
        <div className="ev-rail__divider" role="separator">
          {!railCollapsed && <span className="ev-rail__divider-label">ROADMAP</span>}
        </div>

        {/* Roadmap Items */}
        <NavLink
          to="/portfolio"
          className={({ isActive }) =>
            `ev-rail__item ${isActive ? 'ev-rail__item--active' : ''}`
          }
          title={railCollapsed ? 'Portfolio and Horizon' : undefined}
        >
          <TrendingUp size={18} className="ev-rail__icon" aria-hidden="true" />
          {!railCollapsed && (
            <div className="ev-rail__label-wrapper">
              <span className="ev-rail__label">Portfolio</span>
              <span className="ev-rail__preview-chip">Preview</span>
            </div>
          )}
        </NavLink>

        <NavLink
          to="/gallery"
          className={({ isActive }) =>
            `ev-rail__item ${isActive ? 'ev-rail__item--active' : ''}`
          }
          title={railCollapsed ? 'Design Patterns & Component Gallery' : undefined}
        >
          <Sparkles size={18} className="ev-rail__icon" aria-hidden="true" />
          {!railCollapsed && <span className="ev-rail__label">Design Patterns</span>}
        </NavLink>
      </div>

      {/* Collapse / Expand Button */}
      <div className="ev-rail__footer">
        <button
          type="button"
          className="ev-rail__collapse-btn"
          onClick={() => setRailCollapsed(!railCollapsed)}
          aria-label={railCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {railCollapsed ? (
            <PanelLeftOpen size={18} aria-hidden="true" />
          ) : (
            <>
              <PanelLeftClose size={18} aria-hidden="true" />
              <span className="ev-rail__collapse-text">Collapse rail</span>
            </>
          )}
        </button>
      </div>
    </nav>
  );
};
