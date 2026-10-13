const test = require('node:test');
const assert = require('node:assert/strict');

// Mock browser globals for test environment
global.window = {
  location: {
    origin: 'http://localhost:3000',
    pathname: '/products/1',
    search: '?ref=banner'
  },
  localStorage: {
    _data: {},
    getItem(k) { return this._data[k] || null; },
    setItem(k, v) { this._data[k] = String(v); },
    removeItem(k) { delete this._data[k]; },
    clear() { this._data = {}; }
  },
  innerWidth: 1280,
  innerHeight: 720,
  pageXOffset: 0,
  pageYOffset: 150,
  addEventListener: () => {},
  removeEventListener: () => {}
};

global.document = {
  documentElement: {
    scrollWidth: 1280,
    scrollHeight: 2400,
    clientWidth: 1280,
    clientHeight: 720
  },
  addEventListener: () => {},
  removeEventListener: () => {}
};

// Track sent payloads
let sentPayloads = [];
global.fetch = async (url, options) => {
  sentPayloads.push({ url, body: JSON.parse(options.body) });
  return {
    ok: true,
    status: 201,
    json: async () => ({ success: true })
  };
};

const AnalyticsTracker = require('../src/tracker.js');

test('Tracker initialization and session persistence', () => {
  global.window.localStorage.clear();
  sentPayloads = [];

  AnalyticsTracker.init({
    apiUrl: 'http://localhost:5000',
    websiteId: 'test-site',
    autoTrackPageView: false
  });

  const sessionId = AnalyticsTracker.getSessionId();
  assert.ok(sessionId, 'Session ID must be generated');
  assert.equal(typeof sessionId, 'string');
  assert.ok(sessionId.length >= 20, 'Session ID should have adequate length');

  // Verify stored in localStorage
  assert.equal(global.window.localStorage.getItem('cf_analytics_session_id'), sessionId);

  AnalyticsTracker.destroy();
});

test('Track page view sends valid payload', () => {
  sentPayloads = [];
  AnalyticsTracker.init({
    apiUrl: 'http://localhost:5000',
    websiteId: 'test-site',
    autoTrackPageView: false
  });

  AnalyticsTracker.trackPageView('http://localhost:3000/checkout', { step: 1 });

  assert.equal(sentPayloads.length, 1);
  const p = sentPayloads[0].body;
  assert.equal(p.event_type, 'page_view');
  assert.equal(p.page_url, 'http://localhost:3000/checkout');
  assert.equal(p.website_id, 'test-site');
  assert.ok(p.session_id);
  assert.ok(p.timestamp);
  assert.equal(p.metadata.step, 1);

  AnalyticsTracker.destroy();
});

test('Track click with coordinates and viewport dimensions', () => {
  sentPayloads = [];
  AnalyticsTracker.init({
    apiUrl: 'http://localhost:5000',
    websiteId: 'test-site',
    autoTrackPageView: false
  });

  AnalyticsTracker.track('click', {
    click: {
      clientX: 250,
      clientY: 180,
      pageX: 250,
      pageY: 330,
      scrollX: 0,
      scrollY: 150,
      viewportWidth: 1280,
      viewportHeight: 720,
      pageWidth: 1280,
      pageHeight: 2400,
      targetTag: 'button',
      targetId: 'btn-buy-now',
      targetClass: 'btn btn-primary',
      targetText: 'Buy Now'
    }
  });

  assert.equal(sentPayloads.length, 1);
  const p = sentPayloads[0].body;
  assert.equal(p.event_type, 'click');
  assert.equal(p.click.clientX, 250);
  assert.equal(p.click.targetTag, 'button');
  assert.equal(p.click.targetId, 'btn-buy-now');

  AnalyticsTracker.destroy();
});

test('Opt-out / consent blocks event tracking', () => {
  sentPayloads = [];
  AnalyticsTracker.init({
    apiUrl: 'http://localhost:5000',
    websiteId: 'test-site',
    autoTrackPageView: false
  });

  AnalyticsTracker.setConsent(false);
  const result = AnalyticsTracker.track('page_view');
  assert.equal(result, false, 'Should return false when consent is revoked');
  assert.equal(sentPayloads.length, 0, 'No payloads should be sent when consent is false');

  // Re-enable consent
  AnalyticsTracker.setConsent(true);
  const result2 = AnalyticsTracker.track('page_view');
  assert.equal(result2, true, 'Should return true when consent is restored');
  assert.equal(sentPayloads.length, 1, 'Event should be sent after consent is restored');

  AnalyticsTracker.destroy();
});

test('Repeated initialization safely resets and avoids duplicate state', () => {
  sentPayloads = [];
  AnalyticsTracker.init({
    apiUrl: 'http://localhost:5000',
    websiteId: 'site-a',
    autoTrackPageView: false
  });

  assert.equal(AnalyticsTracker.getState().websiteId, 'site-a');

  // Re-init with another site
  AnalyticsTracker.init({
    apiUrl: 'http://localhost:5000',
    websiteId: 'site-b',
    autoTrackPageView: false
  });

  assert.equal(AnalyticsTracker.getState().websiteId, 'site-b');
  assert.equal(AnalyticsTracker.getState().isInitialized, true);

  AnalyticsTracker.destroy();
  assert.equal(AnalyticsTracker.getState().isInitialized, false);
});
