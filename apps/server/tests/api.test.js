const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../src/app');
const { connectDB, disconnectDB } = require('../src/config/db');

// Connect to MongoDB before tests and close after
test.before(async () => {
  await connectDB();
});

test.after(async () => {
  await disconnectDB();
});

test('GET /api/health returns healthy status without credentials', async () => {
  const res = await request(app).get('/api/health');
  assert.equal(res.status, 200);
  assert.equal(res.body.status, 'healthy');
  assert.ok(typeof res.body.uptime === 'number');
  assert.equal(res.body.database.status, 'connected');
  // Check no password or credentials leaked
  assert.equal(res.body.database.password, undefined);
  assert.equal(res.body.database.uri, undefined);
});

test('GET /tracker.js serves the JavaScript tracking SDK', async () => {
  const res = await request(app).get('/tracker.js');
  assert.equal(res.status, 200);
  assert.ok(res.text.includes('AnalyticsTracker'));
});

test('POST /api/events records a valid page_view event', async () => {
  const payload = {
    session_id: 'test-session-001',
    website_id: 'test-site',
    event_type: 'page_view',
    page_url: 'http://localhost:3000/home',
    timestamp: new Date().toISOString()
  };

  const res = await request(app)
    .post('/api/events')
    .send(payload);

  assert.equal(res.status, 201);
  assert.equal(res.body.success, true);
  assert.ok(res.body.event.id);
  assert.equal(res.body.event.session_id, 'test-session-001');
  assert.equal(res.body.event.event_type, 'page_view');
});

test('POST /api/events records a valid click event with coordinates', async () => {
  const payload = {
    session_id: 'test-session-001',
    website_id: 'test-site',
    event_type: 'click',
    page_url: 'http://localhost:3000/home',
    click: {
      clientX: 320,
      clientY: 240,
      pageX: 320,
      pageY: 540,
      scrollX: 0,
      scrollY: 300,
      viewportWidth: 1440,
      viewportHeight: 900,
      pageWidth: 1440,
      pageHeight: 2500,
      targetTag: 'button',
      targetId: 'btn-test',
      targetText: 'Click Me'
    }
  };

  const res = await request(app)
    .post('/api/events')
    .send(payload);

  assert.equal(res.status, 201);
  assert.equal(res.body.success, true);
  assert.ok(res.body.event.id);
  assert.equal(res.body.event.event_type, 'click');
});

test('POST /api/events rejects invalid payloads with 400 Bad Request', async () => {
  // Missing session_id
  const res1 = await request(app)
    .post('/api/events')
    .send({
      website_id: 'test-site',
      event_type: 'page_view',
      page_url: 'http://localhost:3000/'
    });
  assert.equal(res1.status, 400);
  assert.equal(res1.body.success, false);

  // Invalid event_type
  const res2 = await request(app)
    .post('/api/events')
    .send({
      session_id: 'sess-1',
      website_id: 'test-site',
      event_type: 'unsupported_event',
      page_url: 'http://localhost:3000/'
    });
  assert.equal(res2.status, 400);

  // Invalid URL protocol
  const res3 = await request(app)
    .post('/api/events')
    .send({
      session_id: 'sess-1',
      website_id: 'test-site',
      event_type: 'page_view',
      page_url: 'javascript:alert(1)'
    });
  assert.equal(res3.status, 400);

  // Negative click coordinates
  const res4 = await request(app)
    .post('/api/events')
    .send({
      session_id: 'sess-1',
      website_id: 'test-site',
      event_type: 'click',
      page_url: 'http://localhost:3000/',
      click: {
        clientX: -50,
        clientY: 100
      }
    });
  assert.equal(res4.status, 400);
});

test('POST /api/events/batch ingests multiple events', async () => {
  const events = [
    {
      session_id: 'batch-sess-01',
      website_id: 'batch-site',
      event_type: 'page_view',
      page_url: 'http://localhost:3000/step-1'
    },
    {
      session_id: 'batch-sess-01',
      website_id: 'batch-site',
      event_type: 'click',
      page_url: 'http://localhost:3000/step-1',
      click: { clientX: 100, clientY: 150 }
    }
  ];

  const res = await request(app)
    .post('/api/events/batch')
    .send({ events });

  assert.equal(res.status, 201);
  assert.equal(res.body.success, true);
  assert.equal(res.body.count, 2);
  assert.equal(res.body.eventIds.length, 2);
});

test('POST /api/events/batch rejects empty array or non-array', async () => {
  const res1 = await request(app)
    .post('/api/events/batch')
    .send({ events: [] });
  assert.equal(res1.status, 400);

  const res2 = await request(app)
    .post('/api/events/batch')
    .send({ events: 'not-an-array' });
  assert.equal(res2.status, 400);
});

test('GET /api/sessions returns paginated session summaries', async () => {
  const res = await request(app)
    .get('/api/sessions?websiteId=demo-store&limit=5');

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.ok(Array.isArray(res.body.data));
  assert.ok(res.body.pagination);
  assert.ok(res.body.pagination.total >= 0);

  if (res.body.data.length > 0) {
    const first = res.body.data[0];
    assert.ok(first.session_id);
    assert.ok(typeof first.total_events === 'number');
    assert.ok(typeof first.page_views === 'number');
    assert.ok(typeof first.clicks === 'number');
  }
});

test('GET /api/sessions/:sessionId/events returns chronological timeline', async () => {
  const res = await request(app)
    .get('/api/sessions/test-session-001/events');

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.data.session_id, 'test-session-001');
  assert.ok(Array.isArray(res.body.data.events));
  assert.ok(res.body.data.events.length >= 2);

  // Chronological order verification
  const t1 = new Date(res.body.data.events[0].timestamp).getTime();
  const t2 = new Date(res.body.data.events[1].timestamp).getTime();
  assert.ok(t1 <= t2, 'Events should be sorted in chronological order');
});

test('GET /api/sessions/:sessionId/events returns 404 for unknown session', async () => {
  const res = await request(app)
    .get('/api/sessions/completely-unknown-session-999999/events');

  assert.equal(res.status, 404);
  assert.equal(res.body.success, false);
});

test('GET /api/heatmap/pages returns distinct pages with clicks', async () => {
  const res = await request(app)
    .get('/api/heatmap/pages?websiteId=demo-store');

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.ok(Array.isArray(res.body.data));
  if (res.body.data.length > 0) {
    assert.ok(res.body.data[0].page_url);
    assert.ok(typeof res.body.data[0].click_count === 'number');
  }
});

test('GET /api/heatmap returns click coordinates for page', async () => {
  const res = await request(app)
    .get('/api/heatmap?url=http://localhost:3000/home&websiteId=test-site');

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.ok(res.body.data.clicks);
  assert.ok(res.body.data.total_clicks >= 1);
  const click = res.body.data.clicks[0];
  assert.equal(click.clientX, 320);
  assert.equal(click.clientY, 240);
});

test('GET /api/heatmap rejects missing url parameter', async () => {
  const res = await request(app).get('/api/heatmap');
  assert.equal(res.status, 400);
  assert.equal(res.body.success, false);
});

test('GET /api/analytics/summary returns KPI metrics and top pages', async () => {
  const res = await request(app)
    .get('/api/analytics/summary?websiteId=demo-store');

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.ok(typeof res.body.data.total_events === 'number');
  assert.ok(typeof res.body.data.total_sessions === 'number');
  assert.ok(typeof res.body.data.page_views === 'number');
  assert.ok(typeof res.body.data.clicks === 'number');
  assert.ok(Array.isArray(res.body.data.top_pages));
});

test('GET /api/analytics/timeseries returns grouped intervals', async () => {
  const res = await request(app)
    .get('/api/analytics/timeseries?websiteId=demo-store&interval=hour');

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.ok(Array.isArray(res.body.data));
});
