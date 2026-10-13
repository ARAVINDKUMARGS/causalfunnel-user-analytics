# CausalFunnel Simple User Analytics Application

A high-performance, full-stack web analytics platform featuring a **privacy-conscious vanilla JavaScript tracking SDK**, an **Express.js & MongoDB aggregation backend**, a **modern React + Vite analytics SaaS dashboard**, and an **instrumented ecommerce demo store**.

Built for the **CausalFunnel Full Stack Engineer Intern Technical Assignment**.

---

## 🌟 Key Features

1. **Lightweight Standalone Browser Tracking SDK (`@causalfunnel/tracker`)**:
   - Zero external runtime dependencies; drops into any HTML page or SPA.
   - Automatically tracks `page_view` events on load and on SPA route changes.
   - Automatically captures `click` interactions with full coordinate metadata (`clientX/Y`, `pageX/Y`, scroll offsets, viewport & document dimensions).
   - Generates persistent, cryptographically secure anonymous session IDs (`crypto.randomUUID` with RFC4122 v4 fallback) stored in `localStorage` with memory fallback.
   - Privacy-by-design: automatically ignores password fields, email/phone/text inputs, textareas, and elements with `data-cf-ignore` or `data-analytics-ignore`.
   - Network resilience: non-blocking `fetch(keepalive)` with an in-memory retry queue that automatically drains upon reconnection.
   - User consent management: supports opt-in/opt-out methods (`setConsent()`, `optOut()`).

2. **Scalable Express REST API & MongoDB Engine (`apps/server`)**:
   - Clean modular architecture: controllers, services, models, middleware, and config.
   - **High-performance MongoDB aggregation pipelines** for real-time session summaries, metrics, and timeseries—never loading unindexed raw datasets into Node.js memory.
   - Compound indexes tailored for high write and aggregation throughput:
     - `{ website_id: 1, session_id: 1, timestamp: -1 }`
     - `{ website_id: 1, page_url: 1, event_type: 1, timestamp: -1 }`
     - `{ website_id: 1, timestamp: -1 }`
   - Strict input validation, URL normalization, rate limiting (`express-rate-limit`), Helmet security headers, and configurable CORS.
   - Safe `/api/health` monitoring API uptime and database connectivity without leaking credentials.

3. **Polished SaaS Analytics Dashboard (`apps/dashboard`)**:
   - Modern React 18 + Vite with custom Vanilla CSS glassmorphism aesthetic and Inter typography.
   - **Overview**: 4 KPI cards (Sessions, Events, Page Views, Clicks), Recharts activity time-series (hourly/daily), and Most Engaged Pages ranking.
   - **User Sessions**: Paginated session explorer with sorting, view/click ratios, duration, and direct jump to journeys.
   - **Session Journey**: Chronological event timeline displaying step-by-step visitor journeys with exact click coordinates and viewport metrics.
   - **Click Heatmap Visualizer**: Normalized coordinate canvas visualization that scales clicks across diverse viewport dimensions and scroll offsets, with radius/opacity sliders and viewport vs. document toggles.

4. **Aura Gadgets Demo Ecommerce Store (`apps/demo-site`)**:
   - Realistic multi-page store (Home, Catalog, Product Detail, Cart/Checkout).
   - Pre-instrumented with the SDK to stream live page views and clicks directly to the local backend.
   - Demonstrates sensitive form exclusion (password inputs, payment forms).

---

## 🏗️ Architecture & Repository Structure

```
CausalFunnel/
├── .env.example                 # Environment configuration template
├── .gitignore                   # Excludes node_modules, dist, secrets, and local logs
├── package.json                 # Monorepo workspaces and orchestration scripts
├── README.md                    # Project documentation
│
├── packages/
│   └── tracker/                 # Standalone Browser Tracking SDK
│       ├── src/
│       │   └── tracker.js       # Core vanilla tracking SDK
│       ├── dist/
│       │   └── tracker.js       # Minified / distributable bundle
│       ├── tests/
│       │   └── tracker.test.js  # Node.js test runner unit tests
│       ├── build.js             # Bundle generator
│       └── package.json
│
├── apps/
│   ├── server/                  # Express REST API & MongoDB Database
│   │   ├── src/
│   │   │   ├── config/          # db.js, env.js (Graceful shutdown, validation)
│   │   │   ├── controllers/     # Route handlers
│   │   │   ├── middleware/      # validation.js, rateLimiter.js, corsConfig.js, errorHandler.js
│   │   │   ├── models/          # Event.js (Mongoose schema & compound indexes)
│   │   │   ├── routes/          # events.js, sessions.js, heatmap.js, analytics.js, health.js
│   │   │   ├── services/        # eventService, sessionService, heatmapService, analyticsService
│   │   │   ├── utils/           # urlNormalizer.js, logger.js
│   │   │   ├── app.js           # Express app instance
│   │   │   └── server.js        # HTTP server listener with graceful shutdown
│   │   ├── scripts/
│   │   │   └── seed.js          # Synthetic demo data seeder
│   │   ├── tests/
│   │   │   └── api.test.js      # Supertest integration test suite
│   │   ├── render.yaml          # Render deployment blueprint
│   │   └── package.json
│   │
│   ├── dashboard/               # React + Vite SaaS Analytics Dashboard
│   │   ├── src/
│   │   │   ├── api/             # client.js (Centralized API client)
│   │   │   ├── components/      # StatCard, FilterBar, HeatmapCanvas, Navbar, Sidebar, etc.
│   │   │   ├── pages/           # OverviewPage, SessionsPage, SessionDetailPage, HeatmapPage
│   │   │   ├── utils/           # formatters.js
│   │   │   ├── App.jsx          # React Router layout
│   │   │   ├── main.jsx         # Vite entry
│   │   │   └── index.css        # Premium dark glassmorphism design system
│   │   ├── index.html
│   │   ├── vite.config.js
│   │   ├── vercel.json          # Vercel SPA rewrite configuration
│   │   └── package.json
│   │
│   └── demo-site/               # Aura Gadgets Demo Ecommerce Store
│       ├── index.html           # Home page
│       ├── products.html        # Product catalog
│       ├── product-detail.html  # Product details & specifications
│       ├── cart.html            # Cart & sensitive checkout form
│       ├── styles.css           # Modern ecommerce UI
│       ├── app.js               # Client interactions & cart state
│       ├── serve.js             # Lightweight static HTTP server (Port 3000)
│       └── package.json
```

---

## 💻 Tech Stack

- **Frontend**: React 18, Vite, React Router v6, Recharts, Lucide React, Vanilla CSS.
- **Backend**: Node.js (v18+ / v24 tested), Express.js 4, Mongoose 8.
- **Database**: MongoDB (Local instance or MongoDB Atlas).
- **Tracker**: Standalone Vanilla JavaScript SDK (IIFE / UMD).
- **Testing**: Node.js Test Runner (`node:test`, `node:assert/strict`) + Supertest.
- **Security**: Helmet, CORS, Express-Rate-Limit, Strict NoSQL query sanitization.

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18.0.0 or later (v24.13.0 verified).
- **npm**: v9.0.0 or later (v11.7.0 verified).
- **MongoDB**: A running local MongoDB service on `mongodb://127.0.0.1:27017` or a MongoDB Atlas connection string.

### 2. Installation
Clone the repository and install all workspace dependencies from the root:
```bash
git clone https://github.com/ARAVINDKUMARGS/causalfunnel-user-analytics.git
cd causalfunnel-user-analytics
npm install
```

### 3. Environment Configuration
Create a `.env` file in the project root based on `.env.example`:
```bash
cp .env.example .env
```
Default configuration values:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/causalfunnel_analytics
CORS_ORIGIN=http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000
VITE_API_URL=http://localhost:5000
```

### 4. Seed Synthetic Demo Data (Optional)
Populate your database with realistic sessions, page views, and click coordinate heatmaps for testing:
```bash
npm run seed
```
*(Safety Note: The seed script will refuse to execute in production).*

---

## 🏃 Running the Application

### Option A: Run All Services Concurrently
From the project root:
```bash
# Terminal 1: Backend Server (Port 5000)
npm run dev:server

# Terminal 2: React Dashboard (Port 5173)
npm run dev:dashboard

# Terminal 3: Demo Store (Port 3000)
npm run dev:demo
```

### Service Access URLs:
- **Analytics Dashboard**: [http://localhost:5173](http://localhost:5173)
- **Demo Ecommerce Store**: [http://localhost:3000](http://localhost:3000)
- **API Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)
- **Live Tracker Script**: [http://localhost:5000/tracker.js](http://localhost:5000/tracker.js)

---

## 📦 Tracker SDK Integration Guide

To track any website, add the compiled tracking script and initialize it:

```html
<!-- Include tracker from your analytics backend -->
<script src="http://localhost:5000/tracker.js"></script>

<script>
  // Initialize tracker
  AnalyticsTracker.init({
    apiUrl: "http://localhost:5000",
    websiteId: "demo-store",
    debug: true,         // Enables console logs in development
    consent: true,       // Default true; respects opt-outs
    spaTracking: true    // Tracks pushState & popstate navigation
  });
</script>
```

### Programmatic SDK Methods
- `AnalyticsTracker.trackPageView(customUrl, metadata)`: Manually trigger a page view.
- `AnalyticsTracker.track(eventType, data)`: Ingest a custom event.
- `AnalyticsTracker.getSessionId()`: Retrieve the active anonymous session ID.
- `AnalyticsTracker.setConsent(false)` / `AnalyticsTracker.optOut()`: Opt out user from tracking.
- `AnalyticsTracker.destroy()`: Safely remove event listeners and clean up memory.

### Privacy Safeguards
The SDK intentionally ignores and will **never collect**:
- Passwords (`<input type="password">`)
- Text inputs and textareas (`<input type="text">`, `<input type="email">`, `<textarea>`)
- Elements decorated with `data-cf-ignore="true"` or `data-analytics-ignore="true"`
- Keystrokes or form input contents

---

## 📡 REST API Reference

All responses return standard JSON with appropriate HTTP status codes (200, 201, 400, 404, 429, 500).

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check reporting API uptime and MongoDB status. |
| `POST` | `/api/events` | Ingest a single `page_view` or `click` event. |
| `POST` | `/api/events/batch` | Batch ingest up to 50 events. |
| `GET` | `/api/sessions` | Paginated sessions summary with total events, views, clicks, duration. |
| `GET` | `/api/sessions/:sessionId/events` | Chronological event stream for a session. |
| `GET` | `/api/heatmap/pages` | List distinct pages with recorded clicks. |
| `GET` | `/api/heatmap?url=...&websiteId=...` | Coordinate points and dimension metadata for heatmap canvas. |
| `GET` | `/api/analytics/summary` | Aggregated KPI summary (sessions, events, views, clicks, top pages). |
| `GET` | `/api/analytics/timeseries` | Grouped event counts over hourly or daily intervals. |

### Example Payload (`POST /api/events`):
```json
{
  "session_id": "8d982534-9c40-4736-b10a-17c6cd80072c",
  "website_id": "demo-store",
  "event_type": "click",
  "page_url": "http://localhost:3000/products.html",
  "timestamp": "2026-10-13T14:10:00.000Z",
  "click": {
    "clientX": 420,
    "clientY": 640,
    "pageX": 420,
    "pageY": 790,
    "scrollX": 0,
    "scrollY": 150,
    "viewportWidth": 1440,
    "viewportHeight": 900,
    "pageWidth": 1440,
    "pageHeight": 2400,
    "targetTag": "button",
    "targetId": "btn-add-1",
    "targetClass": "btn btn-sm btn-accent",
    "targetText": "Add to Cart"
  }
}
```

---

## 🧪 Testing & Verification

Automated test suites cover the backend API, the tracking SDK, and end-to-end browser workflows:

```bash
# 1. Run Tracker SDK unit tests (Session IDs, opt-out, listeners, payload formats)
npm run test:tracker

# 2. Run REST API integration tests (Supertest + MongoDB aggregations + validations)
npm run test:server

# 3. Verify Production Builds
npm run build:tracker
npm run build:dashboard
```

### Verified Test Results:
```
✔ Tracker initialization and session persistence (7.6ms)
✔ Track page view sends valid payload (2.4ms)
✔ Track click with coordinates and viewport dimensions (0.5ms)
✔ Opt-out / consent blocks event tracking (0.8ms)
✔ Repeated initialization safely resets and avoids duplicate state (0.5ms)
✔ GET /api/health returns healthy status without credentials (57.7ms)
✔ GET /tracker.js serves the JavaScript tracking SDK (18.4ms)
✔ POST /api/events records a valid page_view event (57.9ms)
✔ POST /api/events records a valid click event with coordinates (25.1ms)
✔ POST /api/events rejects invalid payloads with 400 Bad Request (24.8ms)
✔ POST /api/events/batch ingests multiple events (15.1ms)
✔ POST /api/events/batch rejects empty array or non-array (11.7ms)
✔ GET /api/sessions returns paginated session summaries (212.4ms)
✔ GET /api/sessions/:sessionId/events returns chronological timeline (22.1ms)
✔ GET /api/sessions/:sessionId/events returns 404 for unknown session (11.5ms)
✔ GET /api/heatmap/pages returns distinct pages with clicks (20.1ms)
✔ GET /api/heatmap returns click coordinates for page (18.3ms)
✔ GET /api/heatmap rejects missing url parameter (5.4ms)
✔ GET /api/analytics/summary returns KPI metrics and top pages (28.2ms)
✔ GET /api/analytics/timeseries returns grouped intervals (24.9ms)
```
**Total: 20/20 Automated Tests Passed (100% Pass Rate).**

---

## 🚢 Production Deployment

### 1. Frontend (Vercel)
1. Link your GitHub repository in the Vercel dashboard.
2. Set **Root Directory** to `apps/dashboard`.
3. Set **Build Command** to `npm run build`.
4. Set **Output Directory** to `dist`.
5. Add Environment Variable:
   - `VITE_API_URL`: `https://your-api-domain.onrender.com`
6. `apps/dashboard/vercel.json` already contains SPA rewrites to support React Router.

### 2. Backend (Render / Node.js Host)
1. Deploy via Render Blueprint using `apps/server/render.yaml` or create a new Web Service.
2. Set **Root Directory** to `apps/server`.
3. Set **Build Command** to `npm install`.
4. Set **Start Command** to `node src/server.js`.
5. Set Environment Variables:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `MONGODB_URI`: `mongodb+srv://<user>:<password>@cluster0.mongodb.net/causalfunnel_analytics`
   - `CORS_ORIGIN`: `https://your-dashboard.vercel.app`

---

## ⚖️ Assumptions, Trade-offs & Known Limitations

1. **Normalized Coordinate Heatmap**: 
   - *Design Decision*: Without taking and storing full-page screenshots on the client, coordinates are mapped onto a standardized canvas scaled to recorded viewport dimensions. This preserves user privacy, saves client bandwidth, and scales across resolutions.
2. **Session Persistence**:
   - *Design Decision*: Session IDs are persisted in browser `localStorage` and memory. Third-party cookie deprecation does not affect tracking.
3. **Aggregations vs. In-Memory**:
   - *Design Decision*: All session grouping, durations, and counts use native MongoDB `$group` and `$facet` pipelines rather than loading event collections into Node.js application memory.

---

## 🔒 Security & Privacy Statement

- No passwords, input text, email addresses, or payment card numbers are collected by the tracker SDK.
- Client inputs are strictly sanitized before database insertion to prevent NoSQL injection.
- Production error handlers strip stack traces and internal server details.
- Environment secrets are excluded from Git through `.gitignore`.
