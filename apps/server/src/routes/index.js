const express = require('express');
const router = express.Router();

const eventsRouter = require('./events');
const sessionsRouter = require('./sessions');
const heatmapRouter = require('./heatmap');
const analyticsRouter = require('./analytics');
const healthRouter = require('./health');

router.use('/events', eventsRouter);
router.use('/sessions', sessionsRouter);
router.use('/heatmap', heatmapRouter);
router.use('/analytics', analyticsRouter);
router.use('/health', healthRouter);

module.exports = router;
