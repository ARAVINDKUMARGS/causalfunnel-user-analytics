import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, MousePointer, Clock, MapPin, Tag, Smartphone, Monitor } from 'lucide-react';
import { api } from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorBanner from '../components/ErrorBanner';
import EmptyState from '../components/EmptyState';
import { formatDate, formatTimeOnly, formatPageUrl } from '../utils/formatters';

export default function SessionDetailPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [sessionData, setSessionData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetchSessionTimeline = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await api.getSessionEvents(sessionId);
        if (mounted) {
          setSessionData(res.data);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || 'Session not found or error loading events.');
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchSessionTimeline();
    return () => { mounted = false; };
  }, [sessionId]);

  const events = sessionData?.events || [];

  return (
    <div>
      {/* Top back navigation */}
      <div style={{ marginBottom: '24px' }}>
        <button
          onClick={() => navigate('/sessions')}
          className="btn btn-secondary btn-sm"
          id="btn-back-sessions"
          style={{ marginBottom: '16px' }}
        >
          <ArrowLeft size={14} /> Back to Sessions List
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.5px' }}>
              Session Journey
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
              <span className="badge badge-session" style={{ fontSize: '0.85rem' }}>
                {sessionId}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {events.length} chronological events recorded
              </span>
            </div>
          </div>
        </div>
      </div>

      <ErrorBanner message={error} onRetry={() => window.location.reload()} />

      {isLoading && <LoadingSpinner message="Reconstructing session timeline..." />}

      {!isLoading && !error && events.length === 0 && (
        <EmptyState
          title="Session has no recorded events"
          description="We found no activity records for this session ID."
          actionText="Return to Sessions"
          onAction={() => navigate('/sessions')}
        />
      )}

      {!isLoading && !error && events.length > 0 && (
        <div className="glass-card">
          <div style={{ marginBottom: '24px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Interactive Event Stream</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Follow the visitor step-by-step from landing to conversion or exit.
            </p>
          </div>

          <div className="timeline">
            {events.map((ev, index) => {
              const isClick = ev.event_type === 'click';
              const prevEvent = index > 0 ? events[index - 1] : null;
              let diffSeconds = 0;
              if (prevEvent && ev.timestamp && prevEvent.timestamp) {
                diffSeconds = Math.round((new Date(ev.timestamp) - new Date(prevEvent.timestamp)) / 1000);
              }

              return (
                <div key={ev.id || index} className="timeline-item">
                  {/* Step Marker */}
                  <div className="timeline-marker" style={{ borderColor: isClick ? 'var(--accent-cyan)' : 'var(--accent-indigo)' }}>
                    {isClick ? (
                      <MousePointer size={11} color="var(--accent-cyan)" />
                    ) : (
                      <Eye size={11} color="var(--accent-indigo)" />
                    )}
                  </div>

                  {/* Event Card */}
                  <div style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '16px 20px',
                    marginLeft: '8px'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '8px',
                      flexWrap: 'wrap',
                      gap: '8px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className={`badge ${isClick ? 'badge-click' : 'badge-view'}`}>
                          Step #{index + 1} &bull; {ev.event_type}
                        </span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {formatPageUrl(ev.page_url)}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {index > 0 && diffSeconds > 0 && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={12} /> +{diffSeconds}s
                          </span>
                        )}
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {formatDate(ev.timestamp)}
                        </span>
                      </div>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                      URL: <code>{ev.page_url}</code>
                    </div>

                    {/* Click specifics */}
                    {isClick && ev.click && (
                      <div style={{
                        marginTop: '12px',
                        padding: '12px',
                        background: 'rgba(0, 0, 0, 0.25)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-subtle)',
                        fontSize: '0.82rem',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                        gap: '12px'
                      }}>
                        <div>
                          <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={13} color="var(--accent-cyan)" />
                            <span>Coordinates:</span>
                          </div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                            Client: ({ev.click.clientX}, {ev.click.clientY})
                          </div>
                          <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                            Page: ({ev.click.pageX}, {ev.click.pageY})
                          </div>
                        </div>

                        <div>
                          <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Tag size={13} color="var(--accent-purple)" />
                            <span>Target Element:</span>
                          </div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                            &lt;{ev.click.targetTag || 'element'}&gt;
                            {ev.click.targetId ? ` #${ev.click.targetId}` : ''}
                          </div>
                          {ev.click.targetText && (
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontStyle: 'italic' }}>
                              &ldquo;{ev.click.targetText}&rdquo;
                            </div>
                          )}
                        </div>

                        <div>
                          <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Monitor size={13} color="var(--accent-emerald)" />
                            <span>Viewport Resolution:</span>
                          </div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                            {ev.click.viewportWidth} &times; {ev.click.viewportHeight} px
                          </div>
                          <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                            Scroll Offset: Y={ev.click.scrollY}px
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
