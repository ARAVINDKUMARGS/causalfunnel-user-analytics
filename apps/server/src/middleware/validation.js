const { normalizeUrl, isValidUrl } = require('../utils/urlNormalizer');

function sanitizeKey(key) {
  return typeof key === 'string' && !key.startsWith('$') && !key.includes('.');
}

function sanitizeObject(obj, depth = 0) {
  if (depth > 5 || !obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map((item) => sanitizeObject(item, depth + 1));

  const clean = {};
  for (const [k, v] of Object.entries(obj)) {
    if (sanitizeKey(k)) {
      clean[k] = typeof v === 'object' ? sanitizeObject(v, depth + 1) : v;
    }
  }
  return clean;
}

function validateEventObject(data) {
  const errors = [];

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return { isValid: false, errors: ['Request body must be a JSON object'] };
  }

  // session_id
  if (!data.session_id || typeof data.session_id !== 'string' || !data.session_id.trim()) {
    errors.push('session_id is required and must be a non-empty string');
  } else if (data.session_id.length > 128) {
    errors.push('session_id exceeds maximum length of 128 characters');
  }

  // website_id
  if (!data.website_id || typeof data.website_id !== 'string' || !data.website_id.trim()) {
    errors.push('website_id is required and must be a non-empty string');
  } else if (data.website_id.length > 64) {
    errors.push('website_id exceeds maximum length of 64 characters');
  }

  // event_type
  if (!data.event_type || !['page_view', 'click'].includes(data.event_type)) {
    errors.push('event_type must be either "page_view" or "click"');
  }

  // page_url
  if (!data.page_url || typeof data.page_url !== 'string') {
    errors.push('page_url is required');
  } else if (!isValidUrl(data.page_url)) {
    errors.push('page_url is invalid or has unsupported protocol');
  }

  // timestamp
  let parsedTimestamp = new Date();
  if (data.timestamp) {
    const d = new Date(data.timestamp);
    if (isNaN(d.getTime())) {
      errors.push('timestamp must be a valid ISO 8601 date string or timestamp');
    } else {
      parsedTimestamp = d;
    }
  }

  // click coordinates validation
  let clickData = undefined;
  if (data.event_type === 'click') {
    if (data.click && typeof data.click === 'object') {
      const {
        clientX,
        clientY,
        pageX,
        pageY,
        scrollX,
        scrollY,
        viewportWidth,
        viewportHeight,
        pageWidth,
        pageHeight,
        targetTag,
        targetId,
        targetClass,
        targetText
      } = data.click;

      const numCheck = (val, name) => {
        if (val !== undefined && (typeof val !== 'number' || isNaN(val) || val < 0)) {
          errors.push(`click.${name} must be a non-negative number`);
        }
      };

      numCheck(clientX, 'clientX');
      numCheck(clientY, 'clientY');
      numCheck(pageX, 'pageX');
      numCheck(pageY, 'pageY');
      numCheck(scrollX, 'scrollX');
      numCheck(scrollY, 'scrollY');
      numCheck(viewportWidth, 'viewportWidth');
      numCheck(viewportHeight, 'viewportHeight');
      numCheck(pageWidth, 'pageWidth');
      numCheck(pageHeight, 'pageHeight');

      clickData = {
        clientX: typeof clientX === 'number' ? Math.round(clientX) : 0,
        clientY: typeof clientY === 'number' ? Math.round(clientY) : 0,
        pageX: typeof pageX === 'number' ? Math.round(pageX) : 0,
        pageY: typeof pageY === 'number' ? Math.round(pageY) : 0,
        scrollX: typeof scrollX === 'number' ? Math.round(scrollX) : 0,
        scrollY: typeof scrollY === 'number' ? Math.round(scrollY) : 0,
        viewportWidth: typeof viewportWidth === 'number' ? Math.round(viewportWidth) : 0,
        viewportHeight: typeof viewportHeight === 'number' ? Math.round(viewportHeight) : 0,
        pageWidth: typeof pageWidth === 'number' ? Math.round(pageWidth) : 0,
        pageHeight: typeof pageHeight === 'number' ? Math.round(pageHeight) : 0,
        targetTag: typeof targetTag === 'string' ? targetTag.slice(0, 30) : '',
        targetId: typeof targetId === 'string' ? targetId.slice(0, 60) : '',
        targetClass: typeof targetClass === 'string' ? targetClass.slice(0, 120) : '',
        targetText: typeof targetText === 'string' ? targetText.slice(0, 120) : ''
      };
    } else {
      clickData = {
        clientX: 0,
        clientY: 0,
        pageX: 0,
        pageY: 0
      };
    }
  }

  // metadata
  let cleanMetadata = undefined;
  if (data.metadata && typeof data.metadata === 'object') {
    cleanMetadata = sanitizeObject(data.metadata);
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    normalized: {
      session_id: data.session_id.trim(),
      website_id: data.website_id.trim(),
      event_type: data.event_type,
      page_url: normalizeUrl(data.page_url),
      timestamp: parsedTimestamp,
      click: clickData,
      metadata: cleanMetadata
    }
  };
}

function validateEventMiddleware(req, res, next) {
  const result = validateEventObject(req.body);
  if (!result.isValid) {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: result.errors
    });
  }
  req.validatedEvent = result.normalized;
  next();
}

function validateBatchMiddleware(req, res, next) {
  const { events } = req.body;
  if (!Array.isArray(events)) {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: ['Field "events" must be an array of event objects']
    });
  }

  if (events.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: ['Events array cannot be empty']
    });
  }

  const MAX_BATCH_SIZE = 50;
  if (events.length > MAX_BATCH_SIZE) {
    return res.status(400).json({
      success: false,
      error: 'Batch Size Exceeded',
      details: [`Maximum batch size is ${MAX_BATCH_SIZE} events`]
    });
  }

  const normalizedList = [];
  const errors = [];

  events.forEach((ev, idx) => {
    const res = validateEventObject(ev);
    if (!res.isValid) {
      errors.push({ index: idx, errors: res.errors });
    } else {
      normalizedList.push(res.normalized);
    }
  });

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Batch Validation Error',
      details: errors
    });
  }

  req.validatedEvents = normalizedList;
  next();
}

module.exports = {
  validateEventObject,
  validateEventMiddleware,
  validateBatchMiddleware
};
