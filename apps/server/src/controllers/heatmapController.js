const heatmapService = require('../services/heatmapService');
const { isValidUrl } = require('../utils/urlNormalizer');

async function getPages(req, res, next) {
  try {
    const { websiteId } = req.query;
    const pages = await heatmapService.getHeatmapPages(websiteId);
    res.status(200).json({
      success: true,
      count: pages.length,
      data: pages
    });
  } catch (err) {
    next(err);
  }
}

async function getHeatmap(req, res, next) {
  try {
    const { url, websiteId, startDate, endDate, limit } = req.query;

    if (!url || typeof url !== 'string' || !url.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Missing Parameter',
        message: 'Query parameter "url" is required for heatmap coordinates'
      });
    }

    if (!isValidUrl(url)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Parameter',
        message: 'Query parameter "url" must be a valid URL'
      });
    }

    const data = await heatmapService.getHeatmapData({
      url,
      websiteId,
      startDate,
      endDate,
      limit
    });

    res.status(200).json({
      success: true,
      data
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getPages,
  getHeatmap
};
