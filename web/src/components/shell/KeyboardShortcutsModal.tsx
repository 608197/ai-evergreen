import React, { useEffect } from 'react';
import { useEvergreenStore } from '../../store/useEvergreenStore';
import { X, Keyboard } from 'lucide-react';
import './KeyboardShortcutsModal.css';

export const KeyboardShortcutsModal: React.FC = () => {
  const { activeDrawer, closeDrawer } = useEvergreenStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        useEvergreenStore.getState().openDrawer('shortcuts');
      }
      if (e.key === 'Escape' && activeDrawer.kind === 'shortcuts') {
        closeDrawer();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeDrawer.kind, closeDrawer]);

  if (activeDrawer.kind !== 'shortcuts') return null;

  const shortcutGroups = [
    {
      group: 'Navigation',
      shortcuts: [
        { keys: ['G', 'H'], desc: 'Go to Home' },
        { keys: ['G', 'E'], desc: 'Go to Current Event' },
        { keys: ['G', 'S'], desc: 'Go to Estate Explorer' },
        { keys: ['G', 'M'], desc: 'Go to Qualification Memory' },
        { keys: ['G', 'C'], desc: 'Go to Controls & Policy' },
        { keys: ['1', '–', '6'], desc: 'Switch stage 1 to 6 in event' },
      ],
    },
    {
      group: 'Actions & Focus',
      shortcuts: [
        { keys: ['Ctrl', 'K'], desc: 'Open command search palette' },
        { keys: ['J', '/', 'K'], desc: 'Move list or row selection down / up' },
        { keys: ['Enter'], desc: 'Open / decide selected item' },
        { keys: ['X'], desc: 'Open "Why" evidence rationale drawer' },
        { keys: ['Esc'], desc: 'Dismiss drawer, popover or modal' },
        { keys: ['?'], desc: 'Open this shortcuts cheatsheet' },
      ],
    },
  ];

  return (
    <div className="ev-shortcuts-backdrop" onClick={closeDrawer}>
      <div
        className="ev-shortcuts-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-title"
      >
        <div className="ev-shortcuts-header">
          <div className="ev-shortcuts-title-wrap">
            <Keyboard size={20} className="ev-shortcuts-icon" aria-hidden="true" />
            <h2 id="shortcuts-title" className="ev-shortcuts-title">
              Keyboard Shortcuts
            </h2>
          </div>
          <button
            type="button"
            className="ev-shortcuts-close"
            onClick={closeDrawer}
            aria-label="Close shortcuts cheatsheet"
          >
            <X size={18} />
          </button>
        </div>

        <div className="ev-shortcuts-content">
          {shortcutGroups.map((group) => (
            <div key={group.group} className="ev-shortcuts-group">
              <h3 className="ev-shortcuts-group-title">{group.group}</h3>
              <div className="ev-shortcuts-grid">
                {group.shortcuts.map((s, idx) => (
                  <div key={idx} className="ev-shortcuts-row">
                    <span className="ev-shortcuts-desc">{s.desc}</span>
                    <div className="ev-shortcuts-keys">
                      {s.keys.map((k, kIdx) => (
                        <kbd key={kIdx} className="ev-shortcuts-kbd">
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="ev-shortcuts-footer">
          <span>Shortcuts are inactive when editing text fields. Press <kbd>Esc</kbd> to return.</span>
        </div>
      </div>
    </div>
  );
};
