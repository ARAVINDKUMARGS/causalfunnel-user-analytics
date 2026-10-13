import React, { useEffect, useState, useCallback } from 'react';
import { Users, Activity, Eye, MousePointer, TrendingUp, Compass, ArrowUpRight } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { api } from '../api/client';
import StatCard from '../components/StatCard';
import FilterBar from '../components/FilterBar';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorBanner from '../components/ErrorBanner';
import EmptyState from '../components/EmptyState';
import { formatNumber, formatPageUrl } from '../utils/formatters';

export default function OverviewPage() {
  const [websiteId, setWebsiteId] = useState('demo-store');
  const [dateRange, setDateRange] = useState('7d');
  const [summary, setSummary] = useState(null);
  const [timeseries, setTimeseries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Compute start date based on selected filter
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

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const dates = getDates(dateRange);
      const [sumRes, timeRes] = await Promise.all([
        api.getSummary({ websiteId, ...dates }),
        api.getTimeseries({
          websiteId,
          ...dates,
          interval: dateRange === '24h' ? 'hour' : 'day'
        })
      ]);

      setSummary(sumRes.data || null);
      setTimeseries(timeRes.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch analytics metrics.');
    } finally {
      setIsLoading(false);
    }
  }, [websiteId, dateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.5px' }}>
          Overview Analytics
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Real-time metrics, session volume, and event engagement tracked via CausalFunnel SDK.
        </p>
      </div>

      {/* Filter Controls */}
      <FilterBar
        websiteId={websiteId}
        onWebsiteChange={setWebsiteId}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        onRefresh={fetchData}
        isLoading={isLoading}
      />

      {/* Error state */}
      <ErrorBanner message={error} onRetry={fetchData} />

      {/* Loading state */}
      {isLoading && <LoadingSpinner message="Aggregating telemetry from database..." />}

      {!isLoading && !error && (
        <>
          {/* KPI Cards */}
          <div className="stats-grid">
            <StatCard
              title="Total Sessions"
              value={formatNumber(summary?.total_sessions || 0)}
              subtext="Unique browser sessions"
              icon={Users}
              accentColor="var(--accent-cyan)"
            />
            <StatCard
              title="Total Events"
              value={formatNumber(summary?.total_events || 0)}
              subtext={`${summary?.avg_events_per_session || 0} events / session avg`}
              icon={Activity}
              accentColor="var(--accent-indigo)"
            />
            <StatCard
              title="Page Views"
              value={formatNumber(summary?.page_views || 0)}
              subtext="Recorded page loads"
              icon={Eye}
              accentColor="var(--accent-purple)"
            />
            <StatCard
              title="User Clicks"
              value={formatNumber(summary?.clicks || 0)}
              subtext="Interactions captured"
              icon={MousePointer}
              accentColor="var(--accent-emerald)"
            />
          </div>

          {/* Activity Time Series Chart */}
          <div className="glass-card" style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Activity Over Time</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Event volume breakdown (Page Views vs Clicks)
                </p>
              </div>
              <span className="badge badge-view">
                <TrendingUp size={14} /> Timeseries
              </span>
            </div>

            {timeseries.length === 0 ? (
              <EmptyState
                title="No time series points"
                description="No activity occurred in the selected date window."
              />
            ) : (
              <div style={{ width: '100%', height: 320 }}>
                <ResponsiveContainer>
                  <AreaChart data={timeseries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPageViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#818cf8" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis
                      dataKey="time"
                      stroke="#64748b"
                      fontSize={11}
                      tickLine={false}
                      tickFormatter={(val) => val.split(' ')[0] || val}
                    />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#111a2e',
                        borderColor: 'rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '0.85rem'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="page_views"
                      name="Page Views"
                      stroke="#818cf8"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorPageViews)"
                    />
                    <Area
                      type="monotone"
                      dataKey="clicks"
                      name="Clicks"
                      stroke="#06b6d4"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorClicks)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Top Pages Breakdown Table */}
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Most Engaged Pages</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Page traffic and click counts sorted by total volume
                </p>
              </div>
            </div>

            {!summary?.top_pages || summary.top_pages.length === 0 ? (
              <EmptyState
                title="No page data"
                description="Events recorded by the SDK will show page rankings here."
              />
            ) : (
              <div className="data-table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Page URL</th>
                      <th>Total Events</th>
                      <th>Page Views</th>
                      <th>Clicks</th>
                      <th>Click-to-View Ratio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.top_pages.map((p, idx) => {
                      const ratio = p.page_views > 0
                        ? `${Math.round((p.clicks / p.page_views) * 100)}%`
                        : '—';
                      return (
                        <tr key={idx}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Compass size={16} color="var(--accent-cyan)" />
                              <span style={{ fontWeight: 600 }}>{formatPageUrl(p.page_url)}</span>
                            </div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {p.page_url}
                            </span>
                          </td>
                          <td style={{ fontWeight: 700 }}>{formatNumber(p.total_events)}</td>
                          <td>
                            <span className="badge badge-view">{p.page_views} views</span>
                          </td>
                          <td>
                            <span className="badge badge-click">{p.clicks} clicks</span>
                          </td>
                          <td>
                            <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>
                              {ratio}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
