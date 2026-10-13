const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

// GET /api/analytics/summary - KPI overview summary
router.get('/summary', analyticsController.getSummary);

// GET /api/analytics/timeseries - Activity time-series
router.get('/timeseries', analyticsController.getTimeseries);

module.exports = router;
