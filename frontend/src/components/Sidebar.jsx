// src/components/Sidebar.jsx
import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.info('You have logged out successfully.');
    navigate('/login');
  };

  const closeMobile = () => setMobileOpen(false);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Helper to determine active link with query params
  const isNavActive = (path, search = '') => {
    if (search) {
      return location.pathname === path && location.search === search;
    }
    return location.pathname === path && !location.search;
  };

  return (
    <>
      {/* Mobile Top Header */}
      <header className="mobile-header">
        <button
          className="btn-mobile-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation menu"
        >
          ☰
        </button>
        <div className="mobile-brand">
          <div className="brand-icon">✓</div>
          <span>TaskFlow</span>
        </div>
        <div className="user-avatar" style={{ width: 28, height: 28, fontSize: '0.75rem' }}>
          {getInitials(user?.name)}
        </div>
      </header>

      {/* Backdrop for mobile drawer */}
      {mobileOpen && <div className="sidebar-backdrop" onClick={closeMobile} />}

      {/* Main Sidebar */}
      <aside className={`app-sidebar ${mobileOpen ? 'is-open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-icon">✓</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span className="brand-title">TaskFlow</span>
            <span className="brand-subtitle">Workspace</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-group-title">MAIN MENU</div>

          <NavLink
            to="/dashboard"
            className={() => `sidebar-link ${isNavActive('/dashboard') ? 'active' : ''}`}
            onClick={closeMobile}
          >
            <span className="nav-icon">📊</span>
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/tasks"
            className={() => `sidebar-link ${isNavActive('/tasks') ? 'active' : ''}`}
            onClick={closeMobile}
          >
            <span className="nav-icon">📋</span>
            <span>All Tasks</span>
          </NavLink>

          <NavLink
            to="/tasks/kanban"
            className={() => `sidebar-link ${isNavActive('/tasks/kanban') ? 'active' : ''}`}
            onClick={closeMobile}
          >
            <span className="nav-icon">📌</span>
            <span>Kanban Board</span>
          </NavLink>

          <div className="nav-group-title">QUICK FILTERS</div>

          <NavLink
            to="/tasks?status=pending"
            className={() => `sidebar-link ${isNavActive('/tasks', '?status=pending') ? 'active' : ''}`}
            onClick={closeMobile}
          >
            <span className="nav-icon">⏳</span>
            <span>Pending Tasks</span>
          </NavLink>

          <NavLink
            to="/tasks?status=completed"
            className={() => `sidebar-link ${isNavActive('/tasks', '?status=completed') ? 'active' : ''}`}
            onClick={closeMobile}
          >
            <span className="nav-icon">✅</span>
            <span>Completed Tasks</span>
          </NavLink>

          <div className="nav-group-title">ACTIONS</div>

          <NavLink
            to="/tasks/create"
            className={() => `sidebar-link ${isNavActive('/tasks/create') ? 'active' : ''}`}
            onClick={closeMobile}
          >
            <span className="nav-icon">➕</span>
            <span>Create Task</span>
          </NavLink>
        </nav>

        {/* User Card & Logout Footer */}
        <div className="sidebar-footer">
          {user && (
            <div className="user-profile-widget">
              <div className="user-avatar">{getInitials(user.name)}</div>
              <div className="user-meta">
                <span className="user-meta-name">{user.name}</span>
                <span className="user-meta-email">{user.email}</span>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="btn btn-outline btn-sm sidebar-logout-btn"
            title="Log out of TaskFlow"
          >
            🚪 Logout
          </button>
        </div>
      </aside>
    </>
  );
}
