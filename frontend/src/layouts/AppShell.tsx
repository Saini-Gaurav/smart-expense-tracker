import { useEffect, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../state/AuthContext';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `sidebar-link${isActive ? ' sidebar-link--active' : ''}`;

function IconOverview() {
  return (
    <svg className="sidebar-svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M4 19V5M4 19h16M4 19l4-6 4 3 4-8 4 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconList() {
  return (
    <svg className="sidebar-svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" strokeLinecap="round" />
    </svg>
  );
}

export default function AppShell() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 900px)');
    const onChange = () => {
      if (mq.matches) setMenuOpen(false);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  return (
    <div className="app-shell">
      <div
        className={`sidebar-backdrop${menuOpen ? ' sidebar-backdrop--visible' : ''}`}
        aria-hidden={!menuOpen}
        onClick={() => setMenuOpen(false)}
      />

      <aside id="app-sidebar" className={`sidebar${menuOpen ? ' sidebar--open' : ''}`} aria-label="Main navigation">
        <div className="sidebar-mobile-top">
          <button
            type="button"
            className="sidebar-close"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="sidebar-brand">
          <span className="sidebar-logo" aria-hidden>
            {'\u20B9'}
          </span>
          <div>
            <span className="sidebar-app-name">Smart Expense</span>
            <span className="sidebar-user">{user?.name}</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/dashboard" className={navLinkClass} onClick={() => setMenuOpen(false)} end>
            <span className="sidebar-icon">
              <IconOverview />
            </span>
            Overview
          </NavLink>
          <NavLink to="/expenses" className={navLinkClass} onClick={() => setMenuOpen(false)}>
            <span className="sidebar-icon">
              <IconList />
            </span>
            Expenses
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <button type="button" className="sidebar-logout" onClick={() => void logout()}>
            Log out
          </button>
        </div>
      </aside>

      <div className="app-main">
        <header className="mobile-topbar">
          <button
            type="button"
            className="menu-toggle"
            aria-expanded={menuOpen}
            aria-controls="app-sidebar"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span className="menu-toggle-bar" />
            <span className="menu-toggle-bar" />
            <span className="menu-toggle-bar" />
            <span className="sr-only">Open menu</span>
          </button>
          <span className="mobile-title">Smart Expense</span>
        </header>
        <main className="app-outlet">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
