const Event = require('../models/Event');

async function createEvent(eventData) {
  const event = new Event(eventData);
  const saved = await event.save();
  return saved;
}

async function createEventsBatch(eventsList) {
  // Use insertMany for high-throughput batch ingestion
  const savedList = await Event.insertMany(eventsList, { ordered: false });
  return savedList;
}

module.exports = {
  createEvent,
  createEventsBatch
};
