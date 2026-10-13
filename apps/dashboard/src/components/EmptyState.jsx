import React from 'react';
import { Database } from 'lucide-react';

export default function EmptyState({
  title = 'No Data Found',
  description = 'No events match the selected filters or time period. Interact with the demo store to generate activity.',
  actionText,
  onAction
}) {
  return (
    <div style={{
      textAlign: 'center',
      padding: '48px 24px',
      background: 'rgba(255, 255, 255, 0.02)',
      borderRadius: 'var(--radius-lg)',
      border: '1px dashed var(--border-medium)',
      margin: '16px 0'
    }}>
      <div style={{
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        background: 'rgba(6, 182, 212, 0.1)',
        color: 'var(--accent-cyan)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 16px'
      }}>
        <Database size={28} />
      </div>
      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>{title}</h3>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '450px', margin: '0 auto 20px', fontSize: '0.9rem' }}>
        {description}
      </p>
      {actionText && onAction && (
        <button onClick={onAction} className="btn btn-secondary btn-sm">
          {actionText}
        </button>
      )}
    </div>
  );
}
