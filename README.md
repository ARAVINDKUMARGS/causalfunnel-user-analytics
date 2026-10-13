# CausalFunnel Simple User Analytics Platform

[![CI/Tests](https://img.shields.io/badge/tests-20%2F20%20passing-brightgreen)](https://github.com/ARAVINDKUMARGS/causalfunnel-user-analytics)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Node.js](https://img.shields.io/badge/Node.js-v18%2B%20%7C%20v24-green)](https://nodejs.org/)
[![Database](https://img.shields.io/badge/Database-MongoDB%20Atlas-forestgreen)](https://cloud.mongodb.com/)
[![Frontend](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-cyan)](https://vitejs.dev/)
[![Hosting: Render](https://img.shields.io/badge/Deploy-Render%20(API)-46e3b7)](https://render.com/)
[![Hosting: Vercel](https://img.shields.io/badge/Deploy-Vercel%20(Dashboard)-black)](https://vercel.com/)

A production-grade, full-stack web analytics platform featuring a **privacy-conscious vanilla JavaScript tracking SDK**, a **high-throughput Express.js & MongoDB aggregation backend**, a **modern React + Vite analytics SaaS dashboard**, and an **instrumented ecommerce demo store**.

Built for the **CausalFunnel Full Stack Engineer Intern Technical Assignment**.

---

## 📑 Table of Contents
1. [Architecture & Monorepo Structure](#-architecture--monorepo-structure)
2. [Tech Stack](#-tech-stack)
3. [Local Development Quickstart](#-local-development-quickstart)
4. [MongoDB Atlas Configuration & Password Rotation](#-mongodb-atlas-configuration--password-rotation)
5. [Production Deployment Guide](#-production-deployment-guide)
   - [Deploying Backend API to Render](#1-backend-api-deployment-render)
   - [Deploying Analytics Dashboard to Vercel](#2-frontend-dashboard-deployment-vercel)
   - [Deploying Demo Ecommerce Store to Vercel](#3-demo-store-deployment-vercel)
6. [Tracker SDK Integration Guide](#-tracker-sdk-integration-guide)
7. [REST API Reference](#-rest-api-reference)
8. [Database Schema & Compound Index Design](#-database-schema--compound-index-design)
9. [Automated Testing & Verified Results](#-automated-testing--verified-results)
10. [Troubleshooting & DevOps FAQ](#-troubleshooting--devops-faq)
11. [Public URL Verification Checklist](#-public-url-verification-checklist)

---

## 🏗️ Architecture & Monorepo Structure

```
CausalFunnel/
├── render.yaml                  # Root Render Blueprint specification (One-Click Deploy)
├── .env.example                 # Production environment variable templates
├── .gitignore                   # Ignores .env, node_modules, build artifacts, diagnostic logs
├── package.json                 # Monorepo workspaces & orchestration scripts
├── README.md                    # Exhaustive architecture, deployment & API guide
│
├── packages/
│   └── tracker/                 # Standalone Browser Tracking SDK
│       ├── src/tracker.js       # Core vanilla tracking SDK (zero dependencies)
│       ├── dist/tracker.js      # Production distribution bundle
│       ├── tests/tracker.test.js# Node test runner unit tests (5/5 passing)
│       ├── build.js             # Builds & syncs bundle across packages
│       └── package.json
│
├── apps/
│   ├── server/                  # Express REST API & MongoDB Atlas Engine
│   │   ├── src/
│   │   │   ├── config/          # db.js (Mongoose lifecycle), env.js (Env validation)
│   │   │   ├── controllers/     # eventController, sessionController, heatmapController, etc.
│   │   │   ├── middleware/      # validation.js, rateLimiter.js, corsConfig.js, errorHandler.js
│   │   │   ├── models/          # Event.js (Mongoose schema with compound indexes)
│   │   │   ├── routes/          # events.js, sessions.js, heatmap.js, analytics.js, health.js
│   │   │   ├── services/        # sessionService, heatmapService, analyticsService
│   │   │   ├── utils/           # urlNormalizer.js, logger.js
│   │   │   ├── app.js           # Express app definition & tracker endpoint
│   │   │   └── server.js        # HTTP server with graceful shutdown (SIGINT/SIGTERM)
│   │   ├── public/              # Standalone static assets (public/tracker.js)
│   │   ├── scripts/seed.js      # Synthetic demo seeder (guarded against production)
│   │   ├── tests/api.test.js    # Supertest integration test suite (15/15 passing)
│   │   ├── render.yaml          # Render service definition
│   │   └── package.json
│   │
│   ├── dashboard/               # React 18 + Vite SaaS Analytics Dashboard
│   │   ├── src/
│   │   │   ├── api/client.js    # Centralized API client reading VITE_API_URL
│   │   │   ├── components/      # HeatmapCanvas, StatCard, FilterBar, Navbar, Sidebar, etc.
│   │   │   ├── pages/           # OverviewPage, SessionsPage, SessionDetailPage, HeatmapPage
│   │   │   ├── utils/           # formatters.js (Dates, Durations, Numbers)
│   │   │   ├── App.jsx          # React Router setup
│   │   │   ├── main.jsx         # Vite entry
│   │   │   └── index.css        # Premium dark glassmorphism design system
│   │   ├── vercel.json          # Vercel SPA rewrites for client-side routing
│   │   ├── vite.config.js       # Vite build configuration
│   │   └── package.json
│   │
│   └── demo-site/               # Aura Gadgets Demo Ecommerce Store
│       ├── index.html           # Store Home (Hero, Featured gadgets, CTA)
│       ├── products.html        # Product catalog with category filter chips
│       ├── product-detail.html  # Specifications tabs, customer reviews & Buy Now
│       ├── cart.html            # Dynamic shopping cart & sensitive checkout form
│       ├── config.js            # Production-aware dynamic endpoint resolver
│       ├── app.js               # Dynamic cart persistence & toast notification engine
│       ├── styles.css           # Modern dark ecommerce styling
│       ├── serve.js             # Lightweight static HTTP server with clean URL routing
│       ├── vercel.json          # Vercel clean URL configuration
│       └── package.json
```

---

## 💻 Tech Stack

- **Frontend**: React 18, Vite, React Router v6, Recharts, Lucide React, Vanilla CSS.
- **Backend**: Node.js (v18+ / v24 tested), Express.js 4, Mongoose 8.
- **Database**: MongoDB Atlas (Cloud) / MongoDB Local.
- **Tracking SDK**: Standalone Vanilla JavaScript SDK (IIFE / UMD compatible).
- **Testing**: Node.js Test Runner (`node:test`, `node:assert/strict`) + Supertest.
- **DevOps & Security**: Helmet, CORS with wildcard subdomains, Express-Rate-Limit, Vercel SPA rewrites, Render Blueprints.

---

## 🏃 Local Development Quickstart

### 1. Prerequisites
- **Node.js**: v18.0.0 or later (v24.13.0 verified).
- **npm**: v9.0.0 or later.
- A running MongoDB instance (Local or Atlas).

### 2. Installation
```bash
git clone https://github.com/ARAVINDKUMARGS/causalfunnel-user-analytics.git
cd causalfunnel-user-analytics
npm install
```

### 3. Environment Setup
Copy the template to `.env`:
```bash
cp .env.example .env
```
Default local values:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/causalfunnel_analytics
CORS_ORIGIN=*
VITE_API_URL=http://localhost:5000
VITE_DEMO_STORE_URL=http://localhost:3000
```

### 4. Run the Full Stack
```bash
# Terminal 1: Express REST API & Database (Port 5000)
npm run dev:server

# Terminal 2: React Analytics Dashboard (Port 5173)
npm run dev:dashboard

# Terminal 3: Demo Ecommerce Store (Port 3000)
npm run dev:demo
```

### Access URLs:
- **Analytics Dashboard**: [http://localhost:5173](http://localhost:5173)
- **Demo Store**: [http://localhost:3000](http://localhost:3000)
- **API Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)
- **Live Tracker Script**: [http://localhost:5000/tracker.js](http://localhost:5000/tracker.js)

---

## 🔒 MongoDB Atlas Configuration & Password Rotation

> [!WARNING]
> If database credentials were shared in chat or committed to an insecure location, rotate the password immediately in the MongoDB Atlas console before deploying to production.

### Step-by-Step Atlas Password Rotation & Network Whitelisting:
1. Log in to [cloud.mongodb.com](https://cloud.mongodb.com).
2. **Rotate Password**:
   - In the left sidebar, click **Database Access** under Security.
   - Find your database user (e.g. `kumargsaravind6_db_user`) and click **Edit**.
   - Click **Edit Password**, select **Autogenerate Secure Password**, and copy the new password.
   - Click **Update User**.
3. **Whitelist Render Cloud IPs**:
   - In the left sidebar, click **Network Access**.
   - Click **Add IP Address**.
   - Select **Allow Access from Anywhere** (`0.0.0.0/0`) with a note `Render Production API`.
   - Click **Confirm**. (Render dynamic containers do not have static egress IPs on free plans).
4. **Construct Your Production URI**:
   ```
   mongodb+srv://<USER>:<NEW_PASSWORD>@cluster0.jk6ibno.mongodb.net/causalfunnel_analytics?retryWrites=true&w=majority&appName=Cluster0
   ```
5. **Set in Hosting Environment**: Add this URI **only** in your Render dashboard environment variables. Never commit it to Git.

---

## 🚀 Production Deployment Guide

### 1. Backend API Deployment (Render)

You can deploy via the Render Web Console or via the provided [`render.yaml`](render.yaml) Blueprint.

#### Manual Dashboard Setup Steps:
1. Log in to [dashboard.render.com](https://dashboard.render.com) and click **New +** > **Web Service**.
2. Connect your repository: `https://github.com/ARAVINDKUMARGS/causalfunnel-user-analytics`.
3. Configure the service settings:
   - **Name**: `causalfunnel-analytics-api`
   - **Region**: Oregon (or your preferred region)
   - **Branch**: `main`
   - **Root Directory**: `apps/server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/server.js`
   - **Instance Type**: `Free`
4. Add **Environment Variables** under the Environment tab:
   | Key | Value | Description |
   | :--- | :--- | :--- |
   | `NODE_ENV` | `production` | Enables production optimizations & hides stack traces |
   | `PORT` | `10000` | Port listened to by Render container |
   | `MONGODB_URI` | `mongodb+srv://<USER>:<PASS>@.../causalfunnel_analytics?retryWrites=true&w=majority` | Your Atlas connection string |
   | `CORS_ORIGIN` | `https://*.vercel.app,https://your-dashboard.vercel.app` | Allowed origins (supports comma-separated list or `*`) |
5. Click **Create Web Service**.
6. When deployment finishes, copy your live service URL (e.g., `https://causalfunnel-analytics-api.onrender.com`).
7. Test the live health endpoint:
   ```bash
   curl -i https://causalfunnel-analytics-api.onrender.com/api/health
   # Expected: HTTP 200 { "status": "healthy", "database": { "status": "connected" } }
   ```

---

### 2. Frontend Dashboard Deployment (Vercel)

The React dashboard is optimized for Vercel with automated client-side SPA routing via [`apps/dashboard/vercel.json`](apps/dashboard/vercel.json).

#### Manual Dashboard Setup Steps:
1. Log in to [vercel.com](https://vercel.com) and click **Add New...** > **Project**.
2. Import `https://github.com/ARAVINDKUMARGS/causalfunnel-user-analytics`.
3. Configure Project Settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click **Edit** and choose `apps/dashboard`.
   - **Build Command**: `npm run build` (or Vite default)
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
4. Expand **Environment Variables** and add:
   | Key | Value | Example |
   | :--- | :--- | :--- |
   | `VITE_API_URL` | Your live Render backend URL | `https://causalfunnel-analytics-api.onrender.com` |
   | `VITE_DEMO_STORE_URL` | Your live Demo Store URL | `https://causalfunnel-demo.vercel.app` |
5. Click **Deploy**.
6. Vercel will output your public dashboard URL (e.g., `https://causalfunnel-user-analytics.vercel.app`).
7. Verify that opening `/sessions` and `/heatmap` directly in the browser does not result in 404 errors (handled by [`vercel.json`](apps/dashboard/vercel.json)).

---

### 3. Demo Store Deployment (Vercel)

The demo ecommerce website can be deployed as an independent static site on Vercel:

1. In Vercel, click **Add New...** > **Project** and select the same repository.
2. Configure Project Settings:
   - **Project Name**: `causalfunnel-demo-store`
   - **Framework Preset**: `Other`
   - **Root Directory**: Click **Edit** and choose `apps/demo-site`.
   - **Output Directory**: Leave empty (`.`)
   - **Build Command**: Leave empty
3. Click **Deploy**.
4. The demo store includes [`apps/demo-site/config.js`](apps/demo-site/config.js), which dynamically communicates with your production Render API:
   - It defaults to your configured backend or accepts runtime overrides via query parameters:
     ```
     https://your-demo-store.vercel.app/?api=https://causalfunnel-analytics-api.onrender.com&dashboard=https://causalfunnel-user-analytics.vercel.app
     ```
5. Add your live demo URL to `CORS_ORIGIN` in Render to ensure seamless cross-origin telemetry.

---

## 📦 Tracker SDK Integration Guide

To track interactions on any third-party website, add the tracking SDK script:

```html
<!-- Load the SDK from your production API or CDN -->
<script src="https://causalfunnel-analytics-api.onrender.com/tracker.js"></script>

<script>
  // Initialize the tracker
  AnalyticsTracker.init({
    apiUrl: "https://causalfunnel-analytics-api.onrender.com",
    websiteId: "production-store",
    debug: false,         // Set true in dev for console logging
    consent: true,        // Respects GDPR / user opt-out
    spaTracking: true     // Automatically captures pushState & popstate
  });
</script>
```

### SDK Programmatic Methods
- `AnalyticsTracker.trackPageView(customUrl, metadata)`: Trigger an explicit page view event.
- `AnalyticsTracker.track(eventType, data)`: Ingest a custom event.
- `AnalyticsTracker.getSessionId()`: Retrieve the current anonymous session UUID.
- `AnalyticsTracker.setConsent(false)` / `AnalyticsTracker.optOut()`: Halt tracking for opt-out users.
- `AnalyticsTracker.destroy()`: Remove window and document event listeners cleanly.

### Privacy Safeguards
The tracking SDK excludes and will **never collect**:
- Password fields (`<input type="password">`)
- Text inputs, emails, telephone numbers, and textareas (`<input type="text">`, `<textarea>`)
- Form elements marked with `data-cf-ignore="true"` or `data-analytics-ignore="true"`
- Keystrokes or sensitive input values

---

## 📡 REST API Reference

All responses return standard JSON with appropriate HTTP status codes (200, 201, 400, 404, 429, 500).

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check reporting API uptime and database connectivity. |
| `POST` | `/api/events` | Ingest a single `page_view` or `click` event. |
| `POST` | `/api/events/batch` | Batch ingest up to 50 events. |
| `GET` | `/api/sessions` | Paginated session summaries with durations and event counts. |
| `GET` | `/api/sessions/:sessionId/events` | Chronological event stream for a session. |
| `GET` | `/api/heatmap/pages` | List distinct pages with recorded clicks. |
| `GET` | `/api/heatmap?url=...&websiteId=...` | Coordinate points and viewport dimension metadata for heatmap canvas. |
| `GET` | `/api/analytics/summary` | Aggregated KPI metrics (sessions, events, views, clicks, top pages). |
| `GET` | `/api/analytics/timeseries` | Grouped event counts over hourly or daily intervals. |

---

## 🗄️ Database Schema & Compound Index Design

### Event Model Schema
- `session_id`: String, required, indexed.
- `website_id`: String, required, indexed.
- `event_type`: Enum (`['page_view', 'click']`), required.
- `page_url`: String, normalized URL, required.
- `timestamp`: Date, stored in UTC, required.
- `click`: Object (optional):
  - `clientX`, `clientY`: Viewport-relative coordinates (Number).
  - `pageX`, `pageY`: Document-relative coordinates including scroll offset (Number).
  - `scrollX`, `scrollY`: Scroll positions (Number).
  - `viewportWidth`, `viewportHeight`: Screen dimensions (Number).
  - `pageWidth`, `pageHeight`: Full page dimensions (Number).
  - `targetTag`, `targetId`, `targetClass`, `targetText`: Element descriptors (Sanitized strings).
- `metadata`: Object, size-limited to 4KB (Sanitized against NoSQL operators).

### Compound Index Rationale
1. `{ website_id: 1, session_id: 1, timestamp: -1 }`: Optimizes chronological journey queries and session aggregation grouping.
2. `{ website_id: 1, page_url: 1, event_type: 1, timestamp: -1 }`: Powers fast heatmap coordinate extraction and top page rankings.
3. `{ website_id: 1, timestamp: -1 }`: Maximizes performance for time-series date-range filtering.

---

## 🧪 Automated Testing & Verified Results

Automated test suites cover the tracker SDK, API validations, and MongoDB aggregations:

```bash
# Run tracker unit tests
npm run test:tracker

# Run server API integration tests against MongoDB Atlas
npm run test:server

# Run production builds
npm run build:tracker
npm run build:dashboard
```

### Verified Test Suite Output (20/20 Passing):
```
✔ Tracker initialization and session persistence (4.7ms)
✔ Track page view sends valid payload (1.3ms)
✔ Track click with coordinates and viewport dimensions (0.3ms)
✔ Opt-out / consent blocks event tracking (0.2ms)
✔ Repeated initialization safely resets and avoids duplicate state (0.2ms)
✔ GET /api/health returns healthy status without credentials (812.5ms)
✔ GET /tracker.js serves the JavaScript tracking SDK (10.9ms)
✔ POST /api/events records a valid page_view event (469.6ms)
✔ POST /api/events records a valid click event with coordinates (65.9ms)
✔ POST /api/events rejects invalid payloads with 400 Bad Request (25.4ms)
✔ POST /api/events/batch ingests multiple events (69.2ms)
✔ POST /api/events/batch rejects empty array or non-array (7.8ms)
✔ GET /api/sessions returns paginated session summaries (69.5ms)
✔ GET /api/sessions/:sessionId/events returns chronological timeline (127.8ms)
✔ GET /api/sessions/:sessionId/events returns 404 for unknown session (124.7ms)
✔ GET /api/heatmap/pages returns distinct pages with clicks (82.2ms)
✔ GET /api/heatmap returns click coordinates for page (123.2ms)
✔ GET /api/heatmap rejects missing url parameter (9.0ms)
✔ GET /api/analytics/summary returns KPI metrics and top pages (144.4ms)
✔ GET /api/analytics/timeseries returns grouped intervals (58.6ms)
```

---

## 🛠️ Troubleshooting & DevOps FAQ

#### 1. Render Free Tier Spin-Down (Cold Starts)
- **Symptom**: The first request to `/api/health` takes 30-50 seconds to respond.
- **Cause**: Render free tier instances spin down after 15 minutes of inactivity.
- **Solution**: The dashboard automatically retries and displays a friendly connecting badge until the server responds.

#### 2. CORS Errors in Production
- **Symptom**: `Access to fetch at 'https://...onrender.com' from origin 'https://...vercel.app' has been blocked by CORS policy`.
- **Solution**: Set `CORS_ORIGIN=*` or specify your exact comma-separated Vercel domains (e.g. `https://your-dashboard.vercel.app,https://your-demo.vercel.app`) in the Render environment variables. The API automatically strips trailing slashes and supports `*.vercel.app` wildcards.

#### 3. 404 on Direct Page Refresh in Vercel
- **Symptom**: Refreshing `/sessions` or `/heatmap` shows a 404 error.
- **Solution**: Ensure [`apps/dashboard/vercel.json`](apps/dashboard/vercel.json) contains the rewrite rule `{ "source": "/(.*)", "destination": "/index.html" }`.

#### 4. MongoDB Atlas Connection Timeout
- **Symptom**: `MongooseServerSelectionError: Server selection timed out after 5000 ms`.
- **Solution**: In Atlas, navigate to **Network Access** and verify `0.0.0.0/0` (Allow Access from Anywhere) is active. Render free containers do not have static IP addresses.

---

## ✅ Public URL Verification Checklist

Once your Render web service and Vercel frontends are deployed, complete this verification checklist to validate end-to-end operational readiness:

### 1. API Verification (Render)
Run these commands from your terminal, replacing with your live Render URL:
```bash
# 1.1 Verify API root info
curl -i https://<your-render-service>.onrender.com/
# Expected: HTTP 200 {"name":"CausalFunnel Analytics API","version":"1.0.0","status":"online"}

# 1.2 Verify API Health & MongoDB connectivity
curl -i https://<your-render-service>.onrender.com/api/health
# Expected: HTTP 200 {"status":"healthy","database":{"status":"connected","isHealthy":true}}

# 1.3 Verify standalone tracker SDK serving
curl -i https://<your-render-service>.onrender.com/tracker.js
# Expected: HTTP 200 (Serving vanilla tracker JavaScript bundle)

# 1.4 Test CORS preflight response
curl -i -X OPTIONS https://<your-render-service>.onrender.com/api/events \
  -H "Origin: https://<your-dashboard>.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type"
# Expected: HTTP 204 or 200 with Access-Control-Allow-Origin header
```

### 2. Dashboard Verification (Vercel)
- [ ] **Home / Overview Page**: Open `https://<your-dashboard>.vercel.app/`. Confirm KPI stat cards and activity timeseries charts render without errors.
- [ ] **Live Health Indicator**: In the top navbar, confirm the badge says `MongoDB Connected` with a glowing green dot.
- [ ] **SPA Direct Refresh**: Navigate to `https://<your-dashboard>.vercel.app/heatmap` and press browser refresh (**F5**). Ensure the page loads without Vercel 404 errors.
- [ ] **Session Replay & Timeline**: Navigate to `https://<your-dashboard>.vercel.app/sessions`. Click on any recorded session ID and verify that the step-by-step chronological user journey displays with timestamps and page transition tags.

### 3. Demo Store & Telemetry Streaming Verification
- [ ] **Demo Store Launch**: Open `https://<your-demo-store>.vercel.app/`.
- [ ] **Active Tracker Status**: Check the top banner to confirm `Analytics Tracker Active` is displayed. Click `⚙️ API` to verify or switch the target Render API URL.
- [ ] **User Journey Generation**:
  1. Click **Explore Collection 🎧** (triggers `click` + navigation `page_view`).
  2. Click **Add to Cart** on any product card (triggers `click` with button coordinates).
  3. Navigate to **Cart 🛒** (`page_view`).
  4. Submit **Complete Order** (`click` with metadata and automatic exclusion of sensitive input fields).
- [ ] **Real-Time Data Reflection**: Switch back to the Analytics Dashboard tab. Refresh or check the Overview / Heatmap tab to observe the newly recorded events and click coordinates plotted on the page heatmap!

