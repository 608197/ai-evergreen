import React, { useState, useRef, useEffect } from 'react';
import { useEvergreenStore } from '../../store/useEvergreenStore';
import { SandboxBadge } from '../common/SandboxBadge';
import { FreshnessPill } from '../common/FreshnessPill';
import { Search, Bell, Shield, ChevronDown, Check, HelpCircle, Command, BookOpen, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import './TopBar.css';

export const TopBar: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentUser,
    identities,
    setCurrentUser,
    notifications,
    markNotificationRead,
    isGraphStale,
    graphFreshnessLabel,
    setCommandPaletteOpen,
    setGlossaryPanelOpen,
    setDemoDirectorOpen,
  } = useEvergreenStore();

  const [identityOpen, setIdentityOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const identityRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadNotifs = notifications.filter((n) => !n.readAt);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (identityRef.current && !identityRef.current.contains(e.target as Node)) {
        setIdentityOpen(false);
      }
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

        {/* Demo Director Launcher */}
        <button
          type="button"
          className="ev-topbar__tool-btn"
          onClick={() => setDemoDirectorOpen(true)}
          title="Demo Director Mode (Ctrl+Alt+D)"
          aria-label="Open Demo Director mode"
        >
          <Sparkles size={17} style={{ color: '#38BDF8' }} aria-hidden="true" />
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

        {/* Identity & Role Switcher */}
        <div className="ev-topbar__identity-wrapper" ref={identityRef}>
          <button
            type="button"
            className="ev-topbar__identity-btn"
            onClick={() => setIdentityOpen(!identityOpen)}
            aria-expanded={identityOpen}
            aria-label={`User menu: ${currentUser.name}, ${currentUser.roleTitle}`}
          >
            <span className="ev-topbar__avatar" aria-hidden="true">
              {currentUser.initials}
            </span>
            <div className="ev-topbar__identity-info">
              <span className="ev-topbar__identity-name">{currentUser.name}</span>
              <span className="ev-topbar__identity-role">{currentUser.roleTitle}</span>
            </div>
            <ChevronDown size={14} className="ev-topbar__identity-chevron" aria-hidden="true" />
          </button>

          {identityOpen && (
            <div className="ev-topbar__popover ev-topbar__identity-popover" role="menu">
              <div className="ev-topbar__popover-header">
                <div>
                  <div className="ev-topbar__identity-popover-name">{currentUser.name}</div>
                  <div className="ev-topbar__identity-popover-role">{currentUser.roleTitle}</div>
                </div>
                <span className="ev-topbar__synthetic-tag">Synthetic User</span>
              </div>

              <div className="ev-topbar__role-section">
                <div className="ev-topbar__section-label">SWITCH DEMO IDENTITY</div>
                <div className="ev-topbar__role-list">
                  {identities.map((id) => (
                    <button
                      key={id.id}
                      type="button"
                      role="menuitem"
                      className={`ev-topbar__role-item ${id.id === currentUser.id ? 'ev-topbar__role-item--current' : ''}`}
                      onClick={() => {
                        setCurrentUser(id.id);
                        setIdentityOpen(false);
                      }}
                    >
                      <span className="ev-topbar__avatar-sm">{id.initials}</span>
                      <div className="ev-topbar__role-details">
                        <span className="ev-topbar__role-name">{id.name}</span>
                        <span className="ev-topbar__role-title">{id.roleTitle}</span>
                      </div>
                      {id.id === currentUser.id && (
                        <Check size={14} className="ev-topbar__check-icon" aria-hidden="true" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="ev-topbar__popover-footer">
                <button
                  type="button"
                  className="ev-topbar__footer-action"
                  onClick={() => {
                    setIdentityOpen(false);
                    setDemoDirectorOpen(true);
                  }}
                >
                  <Sparkles size={14} style={{ color: '#38BDF8' }} aria-hidden="true" />
                  Demo Director Mode (Ctrl+Alt+D)
                </button>
                <button
                  type="button"
                  className="ev-topbar__footer-action"
                  onClick={() => {
                    setIdentityOpen(false);
                    setGlossaryPanelOpen(true);
                  }}
                >
                  <BookOpen size={14} aria-hidden="true" />
                  Charter Glossary (O5)
                </button>
                <button
                  type="button"
                  className="ev-topbar__footer-action"
                  onClick={() => {
                    setIdentityOpen(false);
                    useEvergreenStore.getState().openDrawer('shortcuts');
                  }}
                >
                  <HelpCircle size={14} aria-hidden="true" />
                  Keyboard Shortcuts (?)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
