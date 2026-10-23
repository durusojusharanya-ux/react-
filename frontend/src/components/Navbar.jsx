// src/components/Navbar.jsx
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <NavLink to="/dashboard" className="navbar-brand">
          <div className="brand-icon">✓</div>
          <span>TaskFlow</span>
        </NavLink>

        <nav className={`navbar-links ${mobileMenuOpen ? 'is-open' : ''}`}>
          <NavLink
            to="/dashboard"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/tasks"
            end
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            All Tasks
          </NavLink>
          <NavLink
            to="/tasks/create"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            + Create Task
          </NavLink>
        </nav>

        <div className="navbar-user">
          {user && (
            <div className="user-badge" title={user.email}>
              <div className="user-avatar">{getInitials(user.name)}</div>
              <span className="user-name">{user.name}</span>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="btn btn-outline btn-sm"
            title="Log out of TaskFlow"
          >
            Logout
          </button>
          <button
            className="btn-mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            ☰
          </button>
        </div>
      </div>
    </header>
  );
}
