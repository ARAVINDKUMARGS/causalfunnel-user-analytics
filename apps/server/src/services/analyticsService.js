const Event = require('../models/Event');

async function getSummary({ websiteId, startDate, endDate }) {
  const matchFilter = {};
  if (websiteId) {
    matchFilter.website_id = String(websiteId);
  }
  if (startDate || endDate) {
    matchFilter.timestamp = {};
    if (startDate) {
      matchFilter.timestamp.$gte = new Date(startDate);
    }
    if (endDate) {
      matchFilter.timestamp.$lte = new Date(endDate);
    }
  }

  // 1. Overall stats
  const [stats] = await Event.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: null,
        total_events: { $sum: 1 },
        page_views: {
          $sum: { $cond: [{ $eq: ['$event_type', 'page_view'] }, 1, 0] }
        },
        clicks: {
          $sum: { $cond: [{ $eq: ['$event_type', 'click'] }, 1, 0] }
        },
        unique_sessions: { $addToSet: '$session_id' }
      }
    },
    {
      $project: {
        _id: 0,
        total_events: 1,
        page_views: 1,
        clicks: 1,
        total_sessions: { $size: '$unique_sessions' }
      }
    }
  ]);

  // 2. Top pages breakdown
  const topPages = await Event.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: '$page_url',
        total_events: { $sum: 1 },
        page_views: {
          $sum: { $cond: [{ $eq: ['$event_type', 'page_view'] }, 1, 0] }
        },
        clicks: {
          $sum: { $cond: [{ $eq: ['$event_type', 'click'] }, 1, 0] }
        }
      }
    },
    {
      $project: {
        _id: 0,
        page_url: '$_id',
        total_events: 1,
        page_views: 1,
        clicks: 1
      }
    },
    { $sort: { total_events: -1 } },
    { $limit: 10 }
  ]);

  const fallbackStats = stats || {
    total_events: 0,
    page_views: 0,
    clicks: 0,
    total_sessions: 0
  };

  const avgEventsPerSession = fallbackStats.total_sessions > 0
    ? Number((fallbackStats.total_events / fallbackStats.total_sessions).toFixed(1))
    : 0;

  return {
    ...fallbackStats,
    avg_events_per_session: avgEventsPerSession,
    top_pages: topPages
  };
}

async function getTimeseries({ websiteId, startDate, endDate, interval = 'hour' }) {
  const matchFilter = {};
  if (websiteId) {
    matchFilter.website_id = String(websiteId);
  }
  if (startDate || endDate) {
    matchFilter.timestamp = {};
    if (startDate) {
      matchFilter.timestamp.$gte = new Date(startDate);
    }
    if (endDate) {
      matchFilter.timestamp.$lte = new Date(endDate);
    }
  }

  // Format string based on interval
  const dateFormat = interval === 'day' ? '%Y-%m-%d' : '%Y-%m-%d %H:00';

  const series = await Event.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: {
          $dateToString: {
            format: dateFormat,
            date: '$timestamp',
            timezone: 'UTC'
          }
        },
        total_events: { $sum: 1 },
        page_views: {
          $sum: { $cond: [{ $eq: ['$event_type', 'page_view'] }, 1, 0] }
        },
        clicks: {
          $sum: { $cond: [{ $eq: ['$event_type', 'click'] }, 1, 0] }
        },
        unique_sessions: { $addToSet: '$session_id' }
      }
    },
    {
      $project: {
        _id: 0,
        time: '$_id',
        total_events: 1,
        page_views: 1,
        clicks: 1,
        sessions: { $size: '$unique_sessions' }
      }
    },
    { $sort: { time: 1 } }
  ]);

  return series;
}

module.exports = {
  getSummary,
  getTimeseries
};
