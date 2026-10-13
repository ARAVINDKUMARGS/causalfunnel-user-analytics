import React, { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { api } from '../api/client';

export default function Navbar() {
  const [health, setHealth] = useState({ isHealthy: false, status: 'checking', db: '' });

  useEffect(() => {
    let mounted = true;
    const checkHealth = async () => {
      try {
        const res = await api.getHealth();
        if (mounted) {
          setHealth({
            isHealthy: res.status === 'healthy',
            status: res.status,
            db: res.database?.name || 'causalfunnel_analytics'
          });
        }
      } catch (e) {
        if (mounted) {
          setHealth({ isHealthy: false, status: 'disconnected', db: 'unreachable' });
        }
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <header className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Analytics Overview &bull; Live Telemetry
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Backend health status pill */}
        <div
          className={`health-badge ${health.isHealthy ? '' : 'degraded'}`}
          title={`Backend status: ${health.status} | DB: ${health.db}`}
        >
          <span className="dot-indicator" />
          <span>{health.isHealthy ? `MongoDB Connected (${health.db})` : 'API Disconnected'}</span>
        </div>

        {/* Link to demo store */}
        <a
          href="http://localhost:3000"
          target="_blank"
          rel="noreferrer"
          className="btn btn-secondary btn-sm"
          id="link-nav-demo-store"
          style={{ gap: '6px' }}
        >
          <span>Demo Store</span>
          <ExternalLink size={14} />
        </a>
      </div>
    </header>
  );
}
