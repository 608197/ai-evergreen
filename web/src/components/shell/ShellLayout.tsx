import React from 'react';
import { Outlet } from 'react-router-dom';
import { TopBar } from './TopBar';
import { LeftRail } from './LeftRail';
import { CommandPalette } from './CommandPalette';
import { KeyboardShortcutsModal } from './KeyboardShortcutsModal';
import { ManualEventModal } from '../overlays/ManualEventModal';
import { HardStopModal } from '../overlays/HardStopModal';
import { GlossaryPanel } from '../overlays/GlossaryPanel';
import { DemoDirector } from './DemoDirector';
import './ShellLayout.css';

export const ShellLayout: React.FC = () => {
  return (
    <div className="ev-shell">
      <TopBar />
      <div className="ev-shell__body">
        <LeftRail />
        <main className="ev-shell__content" id="main-content" tabIndex={-1}>
          <Outlet />
        </main>
      </div>

      {/* Global Overlays & Modals */}
      <CommandPalette />
      <KeyboardShortcutsModal />
      <ManualEventModal />
      <HardStopModal />
      <GlossaryPanel />
      <DemoDirector />
    </div>
  );
};
