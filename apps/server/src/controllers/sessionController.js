const sessionService = require('../services/sessionService');

async function listSessions(req, res, next) {
  try {
    const { websiteId, startDate, endDate, page, limit, sortBy, sortOrder } = req.query;

    const result = await sessionService.getSessions({
      websiteId,
      startDate,
      endDate,
      page,
      limit,
      sortBy,
      sortOrder
    });

    res.status(200).json({
      success: true,
      data: result.sessions,
      pagination: result.pagination
    });
  } catch (err) {
    next(err);
  }
}

async function getSessionDetail(req, res, next) {
  try {
    const { sessionId } = req.params;
    const { page, limit } = req.query;

    if (!sessionId || typeof sessionId !== 'string' || !sessionId.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Parameter',
        message: 'Valid sessionId path parameter is required'
      });
    }

    const result = await sessionService.getSessionEvents(sessionId, { page, limit });

    if (result.total === 0) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `No events found for session: ${sessionId}`
      });
    }

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listSessions,
  getSessionDetail
};
