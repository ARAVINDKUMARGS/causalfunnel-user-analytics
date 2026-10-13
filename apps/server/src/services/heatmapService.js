const Event = require('../models/Event');
const { normalizeUrl } = require('../utils/urlNormalizer');

async function getHeatmapPages(websiteId) {
  const matchFilter = { event_type: 'click' };
  if (websiteId) {
    matchFilter.website_id = String(websiteId);
  }

  const pages = await Event.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: '$page_url',
        click_count: { $sum: 1 },
        last_clicked: { $max: '$timestamp' }
      }
    },
    {
      $project: {
        _id: 0,
        page_url: '$_id',
        click_count: 1,
        last_clicked: 1
      }
    },
    { $sort: { click_count: -1 } }
  ]);

  return pages.map((p) => ({
    ...p,
    last_clicked: p.last_clicked ? new Date(p.last_clicked).toISOString() : null
  }));
}

async function getHeatmapData({ url, websiteId, startDate, endDate, limit = 1500 }) {
  const normalizedUrl = normalizeUrl(url);

  const matchFilter = {
    event_type: 'click'
  };

  if (normalizedUrl) {
    matchFilter.page_url = normalizedUrl;
  } else if (url) {
    matchFilter.page_url = url;
  }

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

  const limitNum = Math.min(3000, Math.max(1, parseInt(limit, 10) || 1500));

  const totalClicks = await Event.countDocuments(matchFilter);

  const clicks = await Event.find(matchFilter, {
    'click.clientX': 1,
    'click.clientY': 1,
    'click.pageX': 1,
    'click.pageY': 1,
    'click.scrollX': 1,
    'click.scrollY': 1,
    'click.viewportWidth': 1,
    'click.viewportHeight': 1,
    'click.pageWidth': 1,
    'click.pageHeight': 1,
    'click.targetTag': 1,
    'click.targetId': 1,
    'click.targetClass': 1,
    'click.targetText': 1,
    timestamp: 1,
    page_url: 1
  })
    .sort({ timestamp: -1 })
    .limit(limitNum)
    .lean();

  return {
    page_url: normalizedUrl || url,
    website_id: websiteId || null,
    total_clicks: totalClicks,
    sampled_count: clicks.length,
    clicks: clicks.map((c) => ({
      id: c._id.toString(),
      timestamp: c.timestamp ? new Date(c.timestamp).toISOString() : null,
      ...c.click
    }))
  };
}

module.exports = {
  getHeatmapPages,
  getHeatmapData
};
