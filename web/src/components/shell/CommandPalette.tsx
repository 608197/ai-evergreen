import React, { useState, useEffect, useRef } from 'react';
import { useEvergreenStore } from '../../store/useEvergreenStore';
import { useNavigate } from 'react-router-dom';
import { Search, Layers, Cpu, ShieldAlert, ArrowRight, X, Plus, BookOpen, Sparkles, RotateCcw } from 'lucide-react';
import { apiClient } from '../../api/client';
import './CommandPalette.css';

export const CommandPalette: React.FC = () => {
  const {
    commandPaletteOpen,
    setCommandPaletteOpen,
    events,
    workloads,
    setManualEventModalOpen,
    setGlossaryPanelOpen,
    setDemoDirectorOpen,
    resetScenario,
  } = useEvergreenStore();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Handle Ctrl+K shortcut globally
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
      if (e.key === 'Escape' && commandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  useEffect(() => {
    if (commandPaletteOpen) {
      const timer = setTimeout(() => {
        setQuery('');
        setSelectedIndex(0);
        inputRef.current?.focus();
      }, 10);
      return () => clearTimeout(timer);
    }
  }, [commandPaletteOpen]);

  if (!commandPaletteOpen) return null;

  // Search items including actions
  const items: Array<{
    id: string;
    title: string;
    category: string;
    icon: any;
    route?: string;
    action?: () => void;
  }> = [
    {
      id: 'action-log-event',
      title: 'Log new model change event (Overlay O3)',
      category: 'Action',
      icon: Plus,
      action: () => setManualEventModalOpen(true),
    },
    {
      id: 'action-demo-director',
      title: 'Open Demo Director (12-Step Walkthrough & Injections)',
      category: 'Action',
      icon: Sparkles,
      action: () => setDemoDirectorOpen(true),
    },
    {
      id: 'action-reset-demo',
      title: 'Reset Demo Scenario (Restore Seed State & Clear Injections)',
      category: 'Action',
      icon: RotateCcw,
      action: () => {
        resetScenario();
        apiClient.resetDemoState().catch(() => {});
        navigate('/');
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'action-glossary',
      title: 'Open Charter Glossary (Overlay O5)',
      category: 'Action',
      icon: BookOpen,
      action: () => setGlossaryPanelOpen(true),
    },
    ...events.map((e) => ({
      id: e.id,
      title: `${e.title} (${e.id})`,
      category: 'Change Event',
      icon: Layers,
      route: `/events/${e.id}/blast-radius`,
    })),
    ...workloads.map((w) => ({
      id: w.id,
      title: `${w.name} · ${w.workloadType}`,
      category: 'Workload',
      icon: Cpu,
      route: `/events/E-2026-001/blast-radius`,
    })),
    {
      id: 'rule-k014',
      title: 'Kernel Rule K-014 (Refund policy check prerequisite)',
      category: 'Policy Rule',
      icon: ShieldAlert,
      route: '/controls',
    },
  ].filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (item: (typeof items)[0]) => {
    setCommandPaletteOpen(false);
    if (item.action) {
      item.action();
    } else if (item.route) {
      navigate(item.route);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, items.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + items.length) % Math.max(1, items.length));
    } else if (e.key === 'Enter' && items[selectedIndex]) {
      e.preventDefault();
      handleSelect(items[selectedIndex]);
    }
  };

  return (
    <div className="ev-palette-backdrop" onClick={() => setCommandPaletteOpen(false)}>
      <div
        className="ev-palette-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Command Palette"
      >
        <div className="ev-palette-search">
          <Search size={18} className="ev-palette-search-icon" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            className="ev-palette-input"
            placeholder="Search events, applications, models, rules..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
          />
          <button
            type="button"
            className="ev-palette-close"
            onClick={() => setCommandPaletteOpen(false)}
            aria-label="Close command palette"
          >
            <X size={16} />
          </button>
        </div>

        <div className="ev-palette-results">
          {items.length === 0 ? (
            <div className="ev-palette-empty">No results found for "{query}"</div>
          ) : (
            <ul className="ev-palette-list" role="listbox">
              {items.map((item, idx) => {
                const IconComponent = item.icon;
                const isSelected = idx === selectedIndex;
                return (
                  <li
                    key={item.id}
                    className={`ev-palette-item ${isSelected ? 'ev-palette-item--selected' : ''}`}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                  >
                    <IconComponent size={16} className="ev-palette-item-icon" aria-hidden="true" />
                    <div className="ev-palette-item-info">
                      <span className="ev-palette-item-title">{item.title}</span>
                      <span className="ev-palette-item-cat">{item.category}</span>
                    </div>
                    <ArrowRight size={14} className="ev-palette-item-arrow" aria-hidden="true" />
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="ev-palette-footer">
          <span>
            Use <kbd>↑</kbd> <kbd>↓</kbd> to navigate, <kbd>Enter</kbd> to select, <kbd>Esc</kbd> to dismiss
          </span>
        </div>
      </div>
    </div>
  );
};
