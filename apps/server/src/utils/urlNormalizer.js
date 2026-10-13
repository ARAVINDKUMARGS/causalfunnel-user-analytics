/**
 * URL normalization utility
 * Normalizes URLs for consistent storage, aggregation, and querying.
 */
function normalizeUrl(input) {
  if (!input || typeof input !== 'string') {
    return null;
  }

  const trimmed = input.trim();
  if (!trimmed) return null;

  try {
    // If it's a relative path e.g. /products/1, format safely
    let parsed;
    if (trimmed.startsWith('/')) {
      parsed = new URL(trimmed, 'http://localhost');
      return parsed.pathname;
    } else {
      parsed = new URL(trimmed);
    }

    // Only allow http: or https:
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }

    // Lowercase hostname
    const host = parsed.hostname.toLowerCase();
    const port = (parsed.port && parsed.port !== '80' && parsed.port !== '443') ? `:${parsed.port}` : '';
    
    // Normalize path: strip trailing slash except for root '/'
    let pathname = parsed.pathname || '/';
    if (pathname.length > 1 && pathname.endsWith('/')) {
      pathname = pathname.slice(0, -1);
    }

    // Sort query parameters for consistent hash/grouping if search exists
    let search = '';
    if (parsed.searchParams && Array.from(parsed.searchParams.keys()).length > 0) {
      const keys = Array.from(parsed.searchParams.keys()).sort();
      const searchParams = new URLSearchParams();
      keys.forEach((key) => {
        const values = parsed.searchParams.getAll(key);
        values.forEach((val) => searchParams.append(key, val));
      });
      search = `?${searchParams.toString()}`;
    }

    return `${parsed.protocol}//${host}${port}${pathname}${search}`;
  } catch (err) {
    return null;
  }
}

function isValidUrl(input) {
  return normalizeUrl(input) !== null;
}

module.exports = {
  normalizeUrl,
  isValidUrl
};
