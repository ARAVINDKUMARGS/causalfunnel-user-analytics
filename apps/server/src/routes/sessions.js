const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');

// GET /api/sessions - Paginated session list
router.get('/', sessionController.listSessions);

// GET /api/sessions/:sessionId/events - Chronological events for a session
router.get('/:sessionId/events', sessionController.getSessionDetail);

module.exports = router;
