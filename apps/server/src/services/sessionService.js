const Event = require('../models/Event');

async function getSessions({ websiteId, startDate, endDate, page = 1, limit = 20, sortBy = 'last_seen', sortOrder = 'desc' }) {
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

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  const sortDirection = sortOrder === 'asc' ? 1 : -1;
  const sortStage = {};
  if (sortBy === 'first_seen') {
    sortStage.first_seen = sortDirection;
  } else if (sortBy === 'total_events') {
    sortStage.total_events = sortDirection;
  } else {
    sortStage.last_seen = sortDirection;
  }

  const pipeline = [
    { $match: matchFilter },
    {
      $sort: { timestamp: 1 }
    },
    {
      $group: {
        _id: '$session_id',
        website_id: { $first: '$website_id' },
        total_events: { $sum: 1 },
        page_views: {
          $sum: { $cond: [{ $eq: ['$event_type', 'page_view'] }, 1, 0] }
        },
        clicks: {
          $sum: { $cond: [{ $eq: ['$event_type', 'click'] }, 1, 0] }
        },
        first_seen: { $first: '$timestamp' },
        last_seen: { $last: '$timestamp' },
        latest_page: { $last: '$page_url' },
        first_page: { $first: '$page_url' }
      }
    },
    {
      $addFields: {
        session_id: '$_id',
        duration_seconds: {
          $round: [
            {
              $divide: [
                { $subtract: ['$last_seen', '$first_seen'] },
                1000
              ]
            },
            1
          ]
        }
      }
    },
    {
      $project: {
        _id: 0
      }
    },
    {
      $sort: sortStage
    },
    {
      $facet: {
        metadata: [{ $count: 'total' }],
        data: [{ $skip: skip }, { $limit: limitNum }]
      }
    }
  ];

  const [result] = await Event.aggregate(pipeline);
  const total = (result && result.metadata && result.metadata[0] && result.metadata[0].total) || 0;
  const data = (result && result.data) || [];

  return {
    sessions: data.map((s) => ({
      ...s,
      first_seen: s.first_seen ? s.first_seen.toISOString() : null,
      last_seen: s.last_seen ? s.last_seen.toISOString() : null
    })),
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1
    }
  };
}

async function getSessionEvents(sessionId, { page = 1, limit = 100 } = {}) {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(200, Math.max(1, parseInt(limit, 10) || 100));
  const skip = (pageNum - 1) * limitNum;

  const total = await Event.countDocuments({ session_id: String(sessionId) });

  const events = await Event.find({ session_id: String(sessionId) })
    .sort({ timestamp: 1 }) // Chronological order
    .skip(skip)
    .limit(limitNum)
    .lean();

  return {
    session_id: sessionId,
    total,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1
    },
    events: events.map((ev) => ({
      id: ev._id.toString(),
      session_id: ev.session_id,
      website_id: ev.website_id,
      event_type: ev.event_type,
      page_url: ev.page_url,
      timestamp: ev.timestamp ? new Date(ev.timestamp).toISOString() : null,
      click: ev.click || null,
      metadata: ev.metadata || null
    }))
  };
}

module.exports = {
  getSessions,
  getSessionEvents
};
