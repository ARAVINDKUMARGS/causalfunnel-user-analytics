const analyticsService = require('../services/analyticsService');

async function getSummary(req, res, next) {
  try {
    const { websiteId, startDate, endDate } = req.query;

    const data = await analyticsService.getSummary({
      websiteId,
      startDate,
      endDate
    });

    res.status(200).json({
      success: true,
      data
    });
  } catch (err) {
    next(err);
  }
}

async function getTimeseries(req, res, next) {
  try {
    const { websiteId, startDate, endDate, interval } = req.query;

    const validInterval = interval === 'day' ? 'day' : 'hour';

    const data = await analyticsService.getTimeseries({
      websiteId,
      startDate,
      endDate,
      interval: validInterval
    });

    res.status(200).json({
      success: true,
      interval: validInterval,
      count: data.length,
      data
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getSummary,
  getTimeseries
};
