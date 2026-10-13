import React from 'react';

export default function LoadingSpinner({ message = 'Loading analytics data...' }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 24px',
      gap: '16px'
    }}>
      <div style={{
        width: '36px',
        height: '36px',
        border: '3px solid rgba(6, 182, 212, 0.15)',
        borderTopColor: '#06b6d4',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{message}</span>
    </div>
  );
}
