import React from 'react';

export default function StatCard({ title, value, subtext, icon: Icon, accentColor = 'var(--accent-cyan)' }) {
  return (
    <div className="glass-card stat-card" style={{ '--accent-color': accentColor }}>
      <div>
        <div className="stat-label">{title}</div>
        <div className="stat-value">{value}</div>
        {subtext && <div className="stat-subtext">{subtext}</div>}
      </div>
      {Icon && (
        <div className="stat-icon" style={{ '--accent-color': accentColor }}>
          <Icon size={22} />
        </div>
      )}
    </div>
  );
}
