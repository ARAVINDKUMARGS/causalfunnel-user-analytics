/**
 * Dynamic Configuration for Demo Ecommerce Store
 * Resolves API URL and Dashboard URL flexibly:
 * 1. URL Query parameter: ?api=... &dashboard=...
 * 2. localStorage persistence: cf_api_url, cf_dashboard_url
 * 3. window.__CF_API_URL__ (if injected)
 * 4. Default:
 *    - In local development: http://localhost:5000 (API) and http://localhost:5173 (Dashboard)
 *    - In production: uses current origin or configured Render/Vercel URLs
 */
(function () {
  const params = new URLSearchParams(window.location.search);
  const isLocal =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1';

  // Allow runtime URL query parameter overrides (?api=https://my-api.onrender.com)
  if (params.get('api')) {
    try {
      localStorage.setItem('cf_api_url', params.get('api'));
    } catch (e) {}
  }
  if (params.get('dashboard')) {
    try {
      localStorage.setItem('cf_dashboard_url', params.get('dashboard'));
    } catch (e) {}
  }

  let storedApi = null;
  let storedDashboard = null;
  try {
    storedApi = localStorage.getItem('cf_api_url');
    storedDashboard = localStorage.getItem('cf_dashboard_url');
  } catch (e) {}

  const defaultApi = isLocal
    ? 'http://localhost:5000'
    : (window.__CF_API_URL__ || window.location.origin);

  const defaultDashboard = isLocal
    ? 'http://localhost:5173'
    : (window.__CF_DASHBOARD_URL__ || 'https://causalfunnel-user-analytics.vercel.app');

  window.CF_CONFIG = {
    apiUrl: storedApi || defaultApi,
    dashboardUrl: storedDashboard || defaultDashboard,
    websiteId: 'demo-store'
  };

  // Sync dashboard link in banner once DOM is ready
  document.addEventListener('DOMContentLoaded', function () {
    const link = document.getElementById('link-open-dashboard');
    if (link && window.CF_CONFIG.dashboardUrl) {
      link.href = window.CF_CONFIG.dashboardUrl;
    }
  });
})();
