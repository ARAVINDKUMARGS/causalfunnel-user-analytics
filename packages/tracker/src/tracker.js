/**
 * CausalFunnel Analytics Tracker SDK
 * Lightweight, privacy-conscious vanilla JavaScript browser analytics SDK.
 * Supports page views, click tracking with viewport/document coordinates,
 * resilient offline retry queues, session persistence, and consent controls.
 */
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.AnalyticsTracker = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // Constants
  var STORAGE_KEY_SESSION = 'cf_analytics_session_id';
  var STORAGE_KEY_CONSENT = 'cf_analytics_consent';
  var MAX_QUEUE_SIZE = 50;
  var MAX_RETRIES = 3;
  var RETRY_DELAY_MS = 3000;
  var TEXT_TRUNCATE_LEN = 80;

  // Internal state
  var state = {
    isInitialized: false,
    apiUrl: '',
    websiteId: '',
    debug: false,
    consent: true,
    sessionId: null,
    queue: [],
    isFlushing: false,
    eventListeners: [],
    spaTracking: true,
    lastTrackedUrl: ''
  };

  /**
   * Safe logger
   */
  function log(message, data) {
    if (state.debug && typeof console !== 'undefined' && console.log) {
      console.log('[AnalyticsTracker] ' + message, data !== undefined ? data : '');
    }
  }

  function warn(message, error) {
    if (state.debug && typeof console !== 'undefined' && console.warn) {
      console.warn('[AnalyticsTracker] ' + message, error !== undefined ? error : '');
    }
  }

  /**
   * Generate RFC4122 v4 UUID
   */
  function generateUUID() {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      try {
        return crypto.randomUUID();
      } catch (e) {
        // Fallback below
      }
    }

    if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
      try {
        var buf = new Uint8Array(16);
        crypto.getRandomValues(buf);
        buf[6] = (buf[6] & 0x0f) | 0x40; // Version 4
        buf[8] = (buf[8] & 0x3f) | 0x80; // Variant 10
        var hex = [];
        for (var i = 0; i < 16; i++) {
          var h = buf[i].toString(16);
          hex.push(h.length === 1 ? '0' + h : h);
        }
        return (
          hex.slice(0, 4).join('') + '-' +
          hex.slice(4, 6).join('') + '-' +
          hex.slice(6, 8).join('') + '-' +
          hex.slice(8, 10).join('') + '-' +
          hex.slice(10, 16).join('')
        );
      } catch (err) {
        // Fallback below
      }
    }

    // Pure math fallback
    var d = new Date().getTime();
    var d2 = (typeof performance !== 'undefined' && performance.now && performance.now() * 1000) || 0;
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16;
      if (d > 0) {
        r = (d + r) % 16 | 0;
        d = Math.floor(d / 16);
      } else {
        r = (d2 + r) % 16 | 0;
        d2 = Math.floor(d2 / 16);
      }
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  /**
   * Safe storage access (handles restricted iframes or disabled cookies)
   */
  function getStorageItem(key) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch (e) {
      // Storage unavailable
    }
    return null;
  }

  function setStorageItem(key, value) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
        return true;
      }
    } catch (e) {
      // Storage unavailable
    }
    return false;
  }

  function removeStorageItem(key) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch (e) {
      // Storage unavailable
    }
  }

  /**
   * Session ID management
   */
  function getOrCreateSessionId() {
    if (state.sessionId) {
      return state.sessionId;
    }

    var stored = getStorageItem(STORAGE_KEY_SESSION);
    if (stored && typeof stored === 'string' && stored.length >= 10) {
      state.sessionId = stored;
      return stored;
    }

    var newId = generateUUID();
    state.sessionId = newId;
    setStorageItem(STORAGE_KEY_SESSION, newId);
    log('Created new session ID: ' + newId);
    return newId;
  }

  /**
   * Normalize and sanitize URL
   */
  function getCurrentUrl() {
    if (typeof window === 'undefined' || !window.location) {
      return 'http://localhost';
    }
    try {
      var loc = window.location;
      // Strip hashes or sensitive query parameters if needed
      return loc.origin + loc.pathname + loc.search;
    } catch (e) {
      return 'http://localhost';
    }
  }

  /**
   * Privacy sanitizer: Check if element is sensitive
   */
  function isSensitiveElement(el) {
    if (!el || !el.tagName) return false;

    var tag = el.tagName.toLowerCase();

    // Sensitive form inputs
    if (tag === 'input') {
      var type = (el.getAttribute('type') || 'text').toLowerCase();
      // Block passwords, emails, phones, numbers, credit cards, or text
      if (['password', 'email', 'tel', 'hidden', 'text', 'search', 'number'].indexOf(type) !== -1) {
        return true;
      }
    }

    if (tag === 'textarea' || tag === 'select') {
      return true;
    }

    // Check opt-out or ignore attributes
    if (
      el.hasAttribute('data-analytics-ignore') ||
      el.hasAttribute('data-cf-ignore') ||
      el.getAttribute('aria-hidden') === 'true'
    ) {
      return true;
    }

    // Check parent elements up to 4 levels
    var parent = el.parentElement;
    var depth = 0;
    while (parent && depth < 4) {
      if (
        parent.hasAttribute('data-analytics-ignore') ||
        parent.hasAttribute('data-cf-ignore') ||
        (parent.tagName && parent.tagName.toLowerCase() === 'form' && parent.hasAttribute('data-cf-ignore'))
      ) {
        return true;
      }
      parent = parent.parentElement;
      depth++;
    }

    return false;
  }

  /**
   * Sanitize element text
   */
  function getSanitizedText(el) {
    if (!el) return '';
    try {
      var text = el.innerText || el.textContent || '';
      text = text.replace(/\s+/g, ' ').trim();
      if (text.length > TEXT_TRUNCATE_LEN) {
        text = text.substring(0, TEXT_TRUNCATE_LEN) + '...';
      }
      return text;
    } catch (e) {
      return '';
    }
  }

  /**
   * Viewport and page dimensions helper
   */
  function getDimensions() {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return {
        scrollX: 0,
        scrollY: 0,
        viewportWidth: 1024,
        viewportHeight: 768,
        pageWidth: 1024,
        pageHeight: 768
      };
    }

    var doc = document.documentElement || document.body;
    var scrollX = window.pageXOffset || (doc && doc.scrollLeft) || 0;
    var scrollY = window.pageYOffset || (doc && doc.scrollTop) || 0;
    var viewportWidth = window.innerWidth || (doc && doc.clientWidth) || 1024;
    var viewportHeight = window.innerHeight || (doc && doc.clientHeight) || 768;

    var pageWidth = Math.max(
      doc ? doc.scrollWidth : 0,
      doc ? doc.offsetWidth : 0,
      doc ? doc.clientWidth : 0,
      viewportWidth
    );
    var pageHeight = Math.max(
      doc ? doc.scrollHeight : 0,
      doc ? doc.offsetHeight : 0,
      doc ? doc.clientHeight : 0,
      viewportHeight
    );

    return {
      scrollX: Math.round(scrollX),
      scrollY: Math.round(scrollY),
      viewportWidth: Math.round(viewportWidth),
      viewportHeight: Math.round(viewportHeight),
      pageWidth: Math.round(pageWidth),
      pageHeight: Math.round(pageHeight)
    };
  }

  /**
   * Network sender with retry queue
   */
  function sendPayload(payload, retryCount) {
    retryCount = retryCount || 0;

    if (!state.apiUrl) {
      warn('API URL not configured; dropping event');
      return;
    }

    var endpoint = state.apiUrl.replace(/\/+$/, '') + '/api/events';
    var serialized = JSON.stringify(payload);

    if (typeof fetch === 'function') {
      try {
        fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: serialized,
          keepalive: true
        })
          .then(function (res) {
            if (!res.ok) {
              throw new Error('HTTP error status ' + res.status);
            }
            return res.json().catch(function () { return {}; });
          })
          .then(function (data) {
            log('Event sent successfully: ' + payload.event_type, data);
            flushQueue();
          })
          .catch(function (err) {
            warn('Failed to send event: ' + err.message, payload);
            enqueueForRetry(payload, retryCount + 1);
          });
      } catch (err) {
        warn('Fetch exception: ' + err.message);
        enqueueForRetry(payload, retryCount + 1);
      }
    } else {
      // Fallback: XMLHttpRequest
      try {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', endpoint, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onreadystatechange = function () {
          if (xhr.readyState === 4) {
            if (xhr.status >= 200 && xhr.status < 300) {
              log('Event sent via XHR: ' + payload.event_type);
              flushQueue();
            } else {
              enqueueForRetry(payload, retryCount + 1);
            }
          }
        };
        xhr.onerror = function () {
          enqueueForRetry(payload, retryCount + 1);
        };
        xhr.send(serialized);
      } catch (err) {
        enqueueForRetry(payload, retryCount + 1);
      }
    }
  }

  function enqueueForRetry(payload, nextRetry) {
    if (nextRetry > MAX_RETRIES) {
      warn('Max retries exceeded for event; dropped: ' + payload.event_type);
      return;
    }

    if (state.queue.length >= MAX_QUEUE_SIZE) {
      // Remove oldest
      state.queue.shift();
    }

    state.queue.push({
      payload: payload,
      retryCount: nextRetry
    });
    log('Enqueued event for retry. Queue length: ' + state.queue.length);
  }

  function flushQueue() {
    if (state.isFlushing || state.queue.length === 0) return;
    state.isFlushing = true;

    setTimeout(function () {
      if (state.queue.length === 0) {
        state.isFlushing = false;
        return;
      }
      var item = state.queue.shift();
      state.isFlushing = false;
      if (item && item.payload) {
        log('Retrying queued event: ' + item.payload.event_type);
        sendPayload(item.payload, item.retryCount);
      }
    }, RETRY_DELAY_MS);
  }

  /**
   * Click event listener handler
   */
  function handleClick(event) {
    if (!state.isInitialized || !state.consent) return;

    try {
      var target = event.target || event.srcElement;
      if (!target) return;

      // Exclude sensitive inputs or ignored elements
      if (isSensitiveElement(target)) {
        log('Ignoring click on sensitive or excluded element');
        return;
      }

      var dims = getDimensions();
      var clientX = typeof event.clientX === 'number' ? Math.round(event.clientX) : 0;
      var clientY = typeof event.clientY === 'number' ? Math.round(event.clientY) : 0;
      var pageX = typeof event.pageX === 'number' ? Math.round(event.pageX) : (clientX + dims.scrollX);
      var pageY = typeof event.pageY === 'number' ? Math.round(event.pageY) : (clientY + dims.scrollY);

      var targetTag = (target.tagName || '').toLowerCase();
      var targetId = target.id ? String(target.id).substring(0, 50) : '';
      var targetClass = target.className && typeof target.className === 'string'
        ? target.className.substring(0, 100)
        : '';
      var targetText = getSanitizedText(target);

      var clickData = {
        clientX: clientX,
        clientY: clientY,
        pageX: pageX,
        pageY: pageY,
        scrollX: dims.scrollX,
        scrollY: dims.scrollY,
        viewportWidth: dims.viewportWidth,
        viewportHeight: dims.viewportHeight,
        pageWidth: dims.pageWidth,
        pageHeight: dims.pageHeight,
        targetTag: targetTag,
        targetId: targetId,
        targetClass: targetClass,
        targetText: targetText
      };

      AnalyticsTracker.track('click', {
        click: clickData
      });
    } catch (err) {
      warn('Error processing click event: ' + err.message);
    }
  }

  /**
   * SPA navigation listener (popstate and pushState/replaceState wrap)
   */
  var originalPushState = null;
  var originalReplaceState = null;

  function handleSpaNavigation() {
    if (!state.isInitialized || !state.spaTracking) return;
    var current = getCurrentUrl();
    if (current !== state.lastTrackedUrl) {
      log('SPA navigation detected: ' + current);
      AnalyticsTracker.trackPageView(current);
    }
  }

  function setupSpaListeners() {
    if (typeof window === 'undefined' || !window.history) return;

    var popstateHandler = function () {
      handleSpaNavigation();
    };
    window.addEventListener('popstate', popstateHandler);
    state.eventListeners.push({ target: window, type: 'popstate', handler: popstateHandler });

    if (window.history.pushState && !originalPushState) {
      originalPushState = window.history.pushState;
      window.history.pushState = function () {
        var ret = originalPushState.apply(this, arguments);
        handleSpaNavigation();
        return ret;
      };
    }

    if (window.history.replaceState && !originalReplaceState) {
      originalReplaceState = window.history.replaceState;
      window.history.replaceState = function () {
        var ret = originalReplaceState.apply(this, arguments);
        handleSpaNavigation();
        return ret;
      };
    }
  }

  function teardownSpaListeners() {
    if (originalPushState && typeof window !== 'undefined' && window.history) {
      window.history.pushState = originalPushState;
      originalPushState = null;
    }
    if (originalReplaceState && typeof window !== 'undefined' && window.history) {
      window.history.replaceState = originalReplaceState;
      originalReplaceState = null;
    }
  }

  /**
   * Public API
   */
  var AnalyticsTracker = {
    /**
     * Initialize tracker
     */
    init: function (options) {
      options = options || {};

      // If already initialized, destroy prior listeners to prevent duplicates
      if (state.isInitialized) {
        log('Tracker already initialized; reconfiguring...');
        AnalyticsTracker.destroy();
      }

      state.apiUrl = options.apiUrl || 'http://localhost:5000';
      state.websiteId = options.websiteId || 'default-site';
      state.debug = Boolean(options.debug);
      state.spaTracking = options.spaTracking !== undefined ? Boolean(options.spaTracking) : true;

      // Consent check: default true unless explicitly false or stored as opt-out
      var storedConsent = getStorageItem(STORAGE_KEY_CONSENT);
      if (storedConsent === 'false' || options.consent === false) {
        state.consent = false;
        log('User has opted out or consent is false; events will not be sent');
      } else {
        state.consent = true;
      }

      getOrCreateSessionId();
      state.isInitialized = true;

      // Register click listener
      if (typeof document !== 'undefined' && document.addEventListener) {
        document.addEventListener('click', handleClick, true);
        state.eventListeners.push({ target: document, type: 'click', handler: handleClick, capture: true });
      }

      // Register network online listener
      if (typeof window !== 'undefined' && window.addEventListener) {
        var onlineHandler = function () {
          log('Network restored; flushing queue');
          flushQueue();
        };
        window.addEventListener('online', onlineHandler);
        state.eventListeners.push({ target: window, type: 'online', handler: onlineHandler });
      }

      // Setup SPA listeners
      if (state.spaTracking) {
        setupSpaListeners();
      }

      log('Initialized successfully for websiteId: ' + state.websiteId);

      // Auto track initial page view unless autoTrackPageView === false
      if (options.autoTrackPageView !== false) {
        AnalyticsTracker.trackPageView();
      }

      return AnalyticsTracker;
    },

    /**
     * Track a page view event
     */
    trackPageView: function (customUrl, metadata) {
      if (!state.isInitialized) {
        warn('Cannot track page view: Tracker not initialized');
        return;
      }

      var url = customUrl || getCurrentUrl();
      state.lastTrackedUrl = url;

      return AnalyticsTracker.track('page_view', {
        page_url: url,
        metadata: metadata || {}
      });
    },

    /**
     * Generic track method
     */
    track: function (eventType, customData) {
      if (!state.isInitialized) {
        warn('Tracker not initialized. Call AnalyticsTracker.init() first.');
        return false;
      }

      if (!state.consent) {
        log('Event ignored due to lack of consent / opt-out');
        return false;
      }

      if (eventType !== 'page_view' && eventType !== 'click') {
        warn('Unsupported event type: ' + eventType);
        return false;
      }

      customData = customData || {};
      var payload = {
        session_id: getOrCreateSessionId(),
        website_id: state.websiteId,
        event_type: eventType,
        page_url: customData.page_url || getCurrentUrl(),
        timestamp: new Date().toISOString()
      };

      if (eventType === 'click' && customData.click) {
        payload.click = customData.click;
      }

      if (customData.metadata && typeof customData.metadata === 'object') {
        payload.metadata = customData.metadata;
      }

      sendPayload(payload, 0);
      return true;
    },

    /**
     * Opt-in or opt-out user consent
     */
    setConsent: function (hasConsent) {
      state.consent = Boolean(hasConsent);
      setStorageItem(STORAGE_KEY_CONSENT, state.consent ? 'true' : 'false');
      log('User consent updated: ' + state.consent);
    },

    /**
     * Convenience optOut method
     */
    optOut: function () {
      AnalyticsTracker.setConsent(false);
    },

    /**
     * Get current session ID
     */
    getSessionId: function () {
      return getOrCreateSessionId();
    },

    /**
     * Get state (for testing or inspection)
     */
    getState: function () {
      return {
        isInitialized: state.isInitialized,
        apiUrl: state.apiUrl,
        websiteId: state.websiteId,
        sessionId: state.sessionId,
        consent: state.consent,
        queueLength: state.queue.length
      };
    },

    /**
     * Tear down listeners and state
     */
    destroy: function () {
      // Remove all event listeners
      for (var i = 0; i < state.eventListeners.length; i++) {
        var l = state.eventListeners[i];
        try {
          if (l.target && l.target.removeEventListener) {
            l.target.removeEventListener(l.type, l.handler, Boolean(l.capture));
          }
        } catch (e) {}
      }
      state.eventListeners = [];

      teardownSpaListeners();

      state.isInitialized = false;
      state.queue = [];
      log('Tracker destroyed');
    }
  };

  return AnalyticsTracker;
});
