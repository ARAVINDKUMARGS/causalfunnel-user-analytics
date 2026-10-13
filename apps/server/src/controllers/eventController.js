const eventService = require('../services/eventService');

async function postEvent(req, res, next) {
  try {
    const saved = await eventService.createEvent(req.validatedEvent);
    res.status(201).json({
      success: true,
      message: 'Event recorded successfully',
      event: {
        id: saved._id.toString(),
        session_id: saved.session_id,
        website_id: saved.website_id,
        event_type: saved.event_type,
        page_url: saved.page_url,
        timestamp: saved.timestamp.toISOString()
      }
    });
  } catch (err) {
    next(err);
  }
}

async function postBatchEvents(req, res, next) {
  try {
    const saved = await eventService.createEventsBatch(req.validatedEvents);
    res.status(201).json({
      success: true,
      message: `Successfully ingested ${saved.length} events`,
      count: saved.length,
      eventIds: saved.map((e) => e._id.toString())
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  postEvent,
  postBatchEvents
};
