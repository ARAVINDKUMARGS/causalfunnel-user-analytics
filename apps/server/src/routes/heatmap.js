const express = require('express');
const router = express.Router();
const heatmapController = require('../controllers/heatmapController');

// GET /api/heatmap/pages - Distinct pages with click counts
router.get('/pages', heatmapController.getPages);

// GET /api/heatmap - Click coordinates for selected page
router.get('/', heatmapController.getHeatmap);

module.exports = router;
