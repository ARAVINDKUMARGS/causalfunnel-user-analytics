export function formatDate(iso) {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  } catch (e) {
    return '—';
  }
}

export function formatTimeOnly(iso) {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  } catch (e) {
    return '—';
  }
}

export function formatDuration(seconds) {
  if (typeof seconds !== 'number' || seconds <= 0) return '1s';
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  if (mins < 60) return `${mins}m ${secs}s`;
  const hours = Math.floor(mins / 60);
  return `${hours}h ${mins % 60}m`;
}

export function formatNumber(num) {
  if (typeof num !== 'number') return '0';
  return num.toLocaleString();
}

export function formatPageUrl(url) {
  if (!url) return '/';
  try {
    const parsed = new URL(url);
    return parsed.pathname + (parsed.search || '');
  } catch (e) {
    return url;
  }
}

export function truncateString(str, len = 25) {
  if (!str) return '';
  return str.length > len ? str.slice(0, len) + '…' : str;
}
