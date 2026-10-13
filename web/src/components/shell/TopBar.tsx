import React, { useState, useRef, useEffect } from 'react';
import { useEvergreenStore } from '../../store/useEvergreenStore';
import { SandboxBadge } from '../common/SandboxBadge';
import { FreshnessPill } from '../common/FreshnessPill';
import { Search, Bell, Shield, Command, BookOpen, Sparkles, HelpCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import './TopBar.css';

export const TopBar: React.FC = () => {
  const navigate = useNavigate();
  const {
    notifications,
    markNotificationRead,
    isGraphStale,
    graphFreshnessLabel,
    setCommandPaletteOpen,
    setGlossaryPanelOpen,
    setDemoDirectorOpen,
    backendStatus,
    backendInfo,
  } = useEvergreenStore();

  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadNotifs = notifications.filter((n) => !n.readAt);

  // Close notifications menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="ev-topbar" role="banner">
      {/* Brand */}
      <div className="ev-topbar__brand-area">
        <Link to="/" className="ev-topbar__brand-link" aria-label="AI Evergreen Home">
          <div className="ev-topbar__logo-icon">
            <Shield size={18} aria-hidden="true" />
          </div>
          <span className="ev-topbar__brand-text">AI Evergreen</span>
        </Link>
      </div>

      {/* Global Search / Command Palette Trigger */}
      <div className="ev-topbar__search-area">
        <button
          type="button"
          className="ev-topbar__search-trigger"
          onClick={() => setCommandPaletteOpen(true)}
          aria-label="Open command palette (Ctrl+K)"
          title="Search events, applications, models, rules... (Ctrl+K)"
        >
          <Search size={16} className="ev-topbar__search-icon" aria-hidden="true" />
          <span className="ev-topbar__search-placeholder">
            Search events, applications, models, rules...
          </span>
          <kbd className="ev-topbar__search-kbd">
            <Command size={11} aria-hidden="true" /> K
          </kbd>
        </button>
      </div>

      {/* Right Tools Area */}
      <div className="ev-topbar__tools-area">
        <SandboxBadge variant="pill" />
        <FreshnessPill
          isStale={isGraphStale}
          lastUpdatedText={isGraphStale ? 'Stale · Fallback active' : graphFreshnessLabel}
        />

        {/* Backend Connectivity Status */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '3px 9px',
            borderRadius: 12,
            fontSize: '0.72rem',
            fontFamily: 'monospace',
            backgroundColor:
              backendStatus === 'online'
                ? 'rgba(16, 185, 129, 0.12)'
                : backendStatus === 'checking'
                ? 'rgba(245, 158, 11, 0.12)'
                : 'rgba(148, 163, 184, 0.12)',
            color:
              backendStatus === 'online'
                ? '#10B981'
                : backendStatus === 'checking'
                ? '#F59E0B'
                : '#94A3B8',
            border: `1px solid ${
              backendStatus === 'online'
                ? 'rgba(16, 185, 129, 0.3)'
                : backendStatus === 'checking'
                ? 'rgba(245, 158, 11, 0.3)'
                : 'rgba(148, 163, 184, 0.3)'
            }`,
          }}
          title={
            backendStatus === 'online'
              ? `FastAPI Control Plane: Online (${backendInfo?.nodes ?? 151} nodes, ${backendInfo?.edges ?? 149} edges)`
              : backendStatus === 'checking'
              ? 'Checking connection to FastAPI backend...'
              : 'FastAPI Offline · Local Seed Engine Active'
          }
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor:
                backendStatus === 'online'
                  ? '#10B981'
                  : backendStatus === 'checking'
                  ? '#F59E0B'
                  : '#94A3B8',
              boxShadow: backendStatus === 'online' ? '0 0 6px #10B981' : undefined,
            }}
          />
          <span>
            {backendStatus === 'online'
              ? 'API: 200 OK'
              : backendStatus === 'checking'
              ? 'API: CONNECTING'
              : 'API: LOCAL SEED'}
          </span>
        </div>

        {/* Charter Glossary (Overlay O5) */}
        <button
          type="button"
          className="ev-topbar__tool-btn"
          onClick={() => setGlossaryPanelOpen(true)}
          title="Charter Glossary (Overlay O5)"
          aria-label="Open Charter Glossary"
        >
          <BookOpen size={18} aria-hidden="true" />
        </button>

        {/* Keyboard Shortcuts */}
        <button
          type="button"
          className="ev-topbar__tool-btn"
          onClick={() => useEvergreenStore.getState().openDrawer('shortcuts')}
          title="Keyboard Shortcuts (?)"
          aria-label="Keyboard Shortcuts"
        >
          <HelpCircle size={18} aria-hidden="true" />
        </button>

        {/* System Narrator Launcher */}
        <button
          type="button"
          className="ev-topbar__narrator-btn"
          onClick={() => setDemoDirectorOpen(true)}
          title="Open System Narrator & Interactive Enterprise Guide (Ctrl+Alt+D)"
          aria-label="Open System Narrator"
        >
          <Sparkles size={14} style={{ color: '#38BDF8' }} aria-hidden="true" />
          <span>System Narrator</span>
        </button>

        {/* Notifications */}
        <div className="ev-topbar__notif-wrapper" ref={notifRef}>
          <button
            type="button"
            className={`ev-topbar__tool-btn ${unreadNotifs.length > 0 ? 'ev-topbar__tool-btn--active' : ''}`}
            onClick={() => setNotifOpen(!notifOpen)}
            aria-expanded={notifOpen}
            aria-label={`Notifications, ${unreadNotifs.length} unread`}
          >
            <Bell size={18} aria-hidden="true" />
            {unreadNotifs.length > 0 && (
              <span className="ev-topbar__notif-badge">{unreadNotifs.length}</span>
            )}
          </button>

          {notifOpen && (
            <div className="ev-topbar__popover ev-topbar__notif-popover" role="region" aria-label="Notifications">
              <div className="ev-topbar__popover-header">
                <h3 className="ev-topbar__popover-title">Notifications</h3>
                <span className="ev-topbar__popover-sub">{unreadNotifs.length} unread</span>
              </div>
              <ul className="ev-topbar__notif-list">
                {notifications.map((notif) => (
                  <li
                    key={notif.id}
                    className={`ev-topbar__notif-item ${!notif.readAt ? 'ev-topbar__notif-item--unread' : ''}`}
                    onClick={() => {
                      markNotificationRead(notif.id);
                      setNotifOpen(false);
                      navigate(notif.deepLink);
                    }}
                  >
                    <div className="ev-topbar__notif-content">
                      <p className="ev-topbar__notif-title">{notif.title}</p>
                      <time className="ev-topbar__notif-time">Today, simulated</time>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
