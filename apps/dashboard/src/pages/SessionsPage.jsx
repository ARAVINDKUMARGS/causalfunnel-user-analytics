import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ChevronLeft, ChevronRight, ArrowUpDown, Clock, ExternalLink } from 'lucide-react';
import { api } from '../api/client';
import FilterBar from '../components/FilterBar';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorBanner from '../components/ErrorBanner';
import EmptyState from '../components/EmptyState';
import { formatDate, formatDuration, formatNumber, formatPageUrl } from '../utils/formatters';

export default function SessionsPage() {
  const navigate = useNavigate();
  const [websiteId, setWebsiteId] = useState('demo-store');
  const [dateRange, setDateRange] = useState('all');
  const [sortBy, setSortBy] = useState('last_seen');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const limit = 15;

  const [sessions, setSessions] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const getDates = (range) => {
    if (range === 'all') return { startDate: undefined, endDate: undefined };
    const now = new Date();
    let past = new Date();
    if (range === '24h') past.setHours(past.getHours() - 24);
    else if (range === '7d') past.setDate(past.getDate() - 7);
    else if (range === '30d') past.setDate(past.getDate() - 30);
    return {
      startDate: past.toISOString(),
      endDate: now.toISOString()
    };
  };

  const fetchSessions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const dates = getDates(dateRange);
      const res = await api.getSessions({
        websiteId,
        ...dates,
        page,
        limit,
        sortBy,
        sortOrder
      });

      setSessions(res.data || []);
      setPagination(res.pagination || { total: 0, totalPages: 1 });
    } catch (err) {
      setError(err.message || 'Failed to fetch sessions.');
    } finally {
      setIsLoading(false);
    }
  }, [websiteId, dateRange, page, sortBy, sortOrder]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setPage(1);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.5px' }}>
          User Sessions
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Explore aggregated browsing sessions and inspect end-to-end user journeys.
        </p>
      </div>

      {/* Filter Bar */}
      <FilterBar
        websiteId={websiteId}
        onWebsiteChange={(w) => { setWebsiteId(w); setPage(1); }}
        dateRange={dateRange}
        onDateRangeChange={(d) => { setDateRange(d); setPage(1); }}
        onRefresh={fetchSessions}
        isLoading={isLoading}
      />

      <ErrorBanner message={error} onRetry={fetchSessions} />

      {isLoading && <LoadingSpinner message="Loading user sessions..." />}

      {!isLoading && !error && (
        <div className="glass-card">
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={18} color="var(--accent-cyan)" />
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                Active Sessions ({formatNumber(pagination.total)})
              </h2>
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Page {page} of {pagination.totalPages}
            </div>
          </div>

          {sessions.length === 0 ? (
            <EmptyState
              title="No sessions recorded"
              description="No user sessions match your filters. Visit the demo store to begin recording real sessions."
            />
          ) : (
            <>
              <div className="data-table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Session ID</th>
                      <th
                        style={{ cursor: 'pointer' }}
                        onClick={() => toggleSort('total_events')}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span>Total Events</span>
                          <ArrowUpDown size={12} />
                        </div>
                      </th>
                      <th>Views / Clicks</th>
                      <th>Duration</th>
                      <th
                        style={{ cursor: 'pointer' }}
                        onClick={() => toggleSort('last_seen')}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span>Last Activity</span>
                          <ArrowUpDown size={12} />
                        </div>
                      </th>
                      <th>Latest Page</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((s) => (
                      <tr
                        key={s.session_id}
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate(`/sessions/${encodeURIComponent(s.session_id)}`)}
                      >
                        <td>
                          <span className="badge badge-session">
                            {s.session_id}
                          </span>
                        </td>
                        <td style={{ fontWeight: 700 }}>
                          {s.total_events}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <span className="badge badge-view">{s.page_views} V</span>
                            <span className="badge badge-click">{s.clicks} C</span>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}>
                            <Clock size={13} />
                            <span>{formatDuration(s.duration_seconds)}</span>
                          </div>
                        </td>
                        <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          {formatDate(s.last_seen)}
                        </td>
                        <td>
                          <span style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)' }}>
                            {formatPageUrl(s.latest_page)}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/sessions/${encodeURIComponent(s.session_id)}`);
                            }}
                          >
                            <span>Journey</span>
                            <ExternalLink size={12} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '20px',
                paddingTop: '16px',
                borderTop: '1px solid var(--border-subtle)'
              }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Showing {(page - 1) * limit + 1} to {Math.min(page * limit, pagination.total)} of {pagination.total} sessions
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="btn btn-sm btn-secondary"
                    id="btn-prev-page"
                  >
                    <ChevronLeft size={14} /> Previous
                  </button>
                  <button
                    disabled={page >= pagination.totalPages}
                    onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                    className="btn btn-sm btn-secondary"
                    id="btn-next-page"
                  >
                    Next <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
