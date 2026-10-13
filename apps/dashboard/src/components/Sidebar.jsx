import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Flame, Zap } from 'lucide-react';

export default function Sidebar() {
  return (
    <aside className="sidebar">
      {/* Brand */}
      <NavLink to="/" className="brand" id="brand-link">
        <div className="brand-icon">
          <Zap size={20} />
        </div>
        <div>
          <div className="brand-title">CausalFunnel</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
            <span className="brand-badge">Analytics</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>v1.0</span>
          </div>
        </div>
      </NavLink>

      {/* Navigation Links */}
      <ul className="nav-menu">
        <li className="nav-item">
          <NavLink
            to="/"
            end
            id="nav-overview"
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            <LayoutDashboard size={18} />
            <span>Overview</span>
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink
            to="/sessions"
            id="nav-sessions"
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            <Users size={18} />
            <span>User Sessions</span>
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink
            to="/heatmap"
            id="nav-heatmap"
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            <Flame size={18} />
            <span>Click Heatmap</span>
          </NavLink>
        </li>
      </ul>

      {/* Sidebar Footer */}
      <div style={{
        marginTop: 'auto',
        padding: '16px',
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: 'var(--radius-sm)',
        fontSize: '0.78rem',
        color: 'var(--text-muted)',
        border: '1px solid var(--border-subtle)'
      }}>
        <div style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
          Assignment Stack
        </div>
        <div>React &bull; Node.js &bull; MongoDB</div>
        <div style={{ marginTop: '4px', color: 'var(--accent-cyan)' }}>SDK + Heatmap Engine</div>
      </div>
    </aside>
  );
}
