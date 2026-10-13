const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '');

function buildQuery(params = {}) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, value);
    }
  }
  const str = query.toString();
  return str ? `?${str}` : '';
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const message = data.message || data.error || `HTTP error ${res.status}`;
      const err = new Error(message);
      err.status = res.status;
      err.details = data.details;
      throw err;
    }

    return data;
  } catch (err) {
    console.error(`[API Error] ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  getHealth: () => request('/api/health'),

  getSummary: (params) => request(`/api/analytics/summary${buildQuery(params)}`),

  getTimeseries: (params) => request(`/api/analytics/timeseries${buildQuery(params)}`),

  getSessions: (params) => request(`/api/sessions${buildQuery(params)}`),

  getSessionEvents: (sessionId, params) =>
    request(`/api/sessions/${encodeURIComponent(sessionId)}/events${buildQuery(params)}`),

  getHeatmapPages: (websiteId) =>
    request(`/api/heatmap/pages${buildQuery({ websiteId })}`),

  getHeatmap: (params) =>
    request(`/api/heatmap${buildQuery(params)}`)
};
