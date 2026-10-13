import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function ErrorBanner({ message, onRetry }) {
  if (!message) return null;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '14px 20px',
      background: 'rgba(244, 63, 94, 0.1)',
      border: '1px solid rgba(244, 63, 94, 0.3)',
      borderRadius: 'var(--radius-md)',
      color: '#fb7185',
      marginBottom: '20px',
      gap: '12px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <AlertCircle size={20} />
        <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{message}</span>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="btn btn-sm btn-secondary"
          style={{ borderColor: 'rgba(244, 63, 94, 0.4)', color: '#fb7185' }}
        >
          <RefreshCw size={14} /> Retry
        </button>
      )}
    </div>
  );
}
