const express = require('express');
const helmet = require('helmet');
const path = require('path');
const corsMiddleware = require('./middleware/corsConfig');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const apiRoutes = require('./routes/index');

const app = express();

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Permit loading tracker and demo assets locally
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);

// CORS
app.use(corsMiddleware);

// Body parsing with safe size bounds
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// Serve the compiled tracking SDK directly from the server for easy integration
const trackerDistPath = path.resolve(__dirname, '../../../packages/tracker/dist');
const trackerSrcPath = path.resolve(__dirname, '../../../packages/tracker/src');

app.get('/tracker.js', (req, res) => {
  res.sendFile(path.join(trackerDistPath, 'tracker.js'), (err) => {
    if (err) {
      // Fallback to src if dist is not yet built
      res.sendFile(path.join(trackerSrcPath, 'tracker.js'));
    }
  });
});

// Root API information
app.get('/', (req, res) => {
  res.json({
    name: 'CausalFunnel Analytics API',
    version: '1.0.0',
    documentation: '/api/health',
    status: 'online'
  });
});

// Mount API routes
app.use('/api', apiRoutes);

// Catch 404
app.use(notFoundHandler);

// Central Error Handler
app.use(errorHandler);

module.exports = app;
