import React from 'react';
import { RefreshCw, Filter } from 'lucide-react';

export default function FilterBar({
  websiteId,
  onWebsiteChange,
  dateRange,
  onDateRangeChange,
  onRefresh,
  isLoading
}) {
  return (
    <div className="filter-container">
      <div className="filter-group">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
          <Filter size={16} />
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Filters:</span>
        </div>

        {/* Website Selector */}
        <select
          value={websiteId}
          onChange={(e) => onWebsiteChange(e.target.value)}
          className="select-control"
          id="select-website"
        >
          <option value="demo-store">demo-store (Default)</option>
          <option value="test-site">test-site</option>
          <option value="">All Websites</option>
        </select>

        {/* Date Range Selector */}
        <select
          value={dateRange}
          onChange={(e) => onDateRangeChange(e.target.value)}
          className="select-control"
          id="select-date-range"
        >
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="all">All Time</option>
        </select>
      </div>

      <div>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="btn btn-secondary btn-sm"
          id="btn-refresh"
          title="Refresh analytics metrics"
        >
          <RefreshCw
            size={14}
            style={{
              animation: isLoading ? 'spin 1s linear infinite' : 'none'
            }}
          />
          <span>Refresh</span>
        </button>
      </div>
    </div>
  );
}
