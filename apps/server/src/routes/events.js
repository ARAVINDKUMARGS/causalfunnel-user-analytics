const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { validateEventMiddleware, validateBatchMiddleware } = require('../middleware/validation');
const { ingestionLimiter } = require('../middleware/rateLimiter');

// POST /api/events - Ingest single event
router.post('/', ingestionLimiter, validateEventMiddleware, eventController.postEvent);

// POST /api/events/batch - Ingest batch events
router.post('/batch', ingestionLimiter, validateBatchMiddleware, eventController.postBatchEvents);

module.exports = router;
