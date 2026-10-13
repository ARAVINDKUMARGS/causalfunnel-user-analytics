import React, { useEffect, useState, useCallback } from 'react';
import { Flame, Compass, RefreshCw, Layers } from 'lucide-react';
import { api } from '../api/client';
import HeatmapCanvas from '../components/HeatmapCanvas';
import FilterBar from '../components/FilterBar';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorBanner from '../components/ErrorBanner';
import EmptyState from '../components/EmptyState';
import { formatNumber, formatPageUrl } from '../utils/formatters';

export default function HeatmapPage() {
  const [websiteId, setWebsiteId] = useState('demo-store');
  const [dateRange, setDateRange] = useState('all');
  const [pages, setPages] = useState([]);
  const [selectedUrl, setSelectedUrl] = useState('');

  const [heatmapData, setHeatmapData] = useState(null);
  const [isLoadingPages, setIsLoadingPages] = useState(true);
  const [isLoadingHeatmap, setIsLoadingHeatmap] = useState(false);
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

  // 1. Fetch available pages with clicks
  const fetchPages = useCallback(async () => {
    setIsLoadingPages(true);
    setError(null);
    try {
      const res = await api.getHeatmapPages(websiteId);
      const pageList = res.data || [];
      setPages(pageList);

      // Auto-select first page if none selected or current is missing
      if (pageList.length > 0) {
        if (!selectedUrl || !pageList.some((p) => p.page_url === selectedUrl)) {
          setSelectedUrl(pageList[0].page_url);
        }
      } else {
        setSelectedUrl('');
        setHeatmapData(null);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch heatmap page list.');
    } finally {
      setIsLoadingPages(false);
    }
  }, [websiteId, selectedUrl]);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  // 2. Fetch click coordinate points for the selected URL
  const fetchHeatmap = useCallback(async () => {
    if (!selectedUrl) return;
    setIsLoadingHeatmap(true);
    setError(null);
    try {
      const dates = getDates(dateRange);
      const res = await api.getHeatmap({
        url: selectedUrl,
        websiteId,
        ...dates,
        limit: 1500
      });
      setHeatmapData(res.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch click coordinates.');
    } finally {
      setIsLoadingHeatmap(false);
    }
  }, [selectedUrl, websiteId, dateRange]);

  useEffect(() => {
    fetchHeatmap();
  }, [fetchHeatmap]);

  const clicks = heatmapData?.clicks || [];

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.5px' }}>
          Click Heatmap Visualizer
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Analyze user interaction density across tracked page coordinates.
        </p>
      </div>

      {/* Filter Bar */}
      <FilterBar
        websiteId={websiteId}
        onWebsiteChange={setWebsiteId}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        onRefresh={() => {
          fetchPages();
          fetchHeatmap();
        }}
        isLoading={isLoadingPages || isLoadingHeatmap}
      />

      <ErrorBanner message={error} onRetry={fetchHeatmap} />

      {/* Page Selector Bar */}
      <div className="glass-card" style={{ marginBottom: '24px', padding: '18px 24px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '280px' }}>
            <Layers size={18} color="var(--accent-cyan)" />
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                Select Tracked Page URL ({pages.length} pages recorded with clicks):
              </label>
              <select
                value={selectedUrl}
                onChange={(e) => setSelectedUrl(e.target.value)}
                className="select-control"
                id="select-heatmap-url"
                style={{ width: '100%' }}
                disabled={pages.length === 0}
              >
                {pages.length === 0 ? (
                  <option value="">No pages with recorded clicks</option>
                ) : (
                  pages.map((p) => (
                    <option key={p.page_url} value={p.page_url}>
                      {formatPageUrl(p.page_url)} — ({p.click_count} clicks) — {p.page_url}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                {formatNumber(heatmapData?.total_clicks || 0)}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Total Recorded Clicks
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {(isLoadingPages || isLoadingHeatmap) && (
        <LoadingSpinner message="Calculating normalized click coordinates..." />
      )}

      {/* Empty page state */}
      {!isLoadingPages && !isLoadingHeatmap && pages.length === 0 && (
        <EmptyState
          title="No Click Heatmaps Available"
          description="We haven't recorded any clicks for this website yet. Click elements on the demo store to populate the heatmap."
          actionText="Visit Demo Store"
          onAction={() => window.open('http://localhost:3000', '_blank')}
        />
      )}

      {/* Canvas Visualization */}
      {!isLoadingPages && !isLoadingHeatmap && pages.length > 0 && selectedUrl && (
        <HeatmapCanvas
          clicks={clicks}
          totalClicks={heatmapData?.total_clicks || 0}
          pageUrl={selectedUrl}
        />
      )}
    </div>
  );
}
