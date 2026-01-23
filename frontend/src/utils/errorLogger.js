/**
 * First-party error logging utility with breadcrumbs and context
 * - Sends errors to our own backend (can't be blocked by school firewalls)
 * - No third-party data sharing (better for student privacy)
 * - Includes breadcrumbs (user actions before error)
 * - Captures console logs for debugging
 * - Triggers email alerts for critical errors
 *
 * Privacy-safe: No student identifiers, names, or session IDs are logged
 */

// Use relative URL so it goes to the same domain (can't be blocked)
const ERROR_API_URL = '/api/errors';

// ============================================================
// BREADCRUMBS - Track user actions leading to error
// ============================================================
const MAX_BREADCRUMBS = 20;
const breadcrumbs = [];

/**
 * Add a breadcrumb (user action)
 * @param {string} type - click, navigation, api, console, etc.
 * @param {string} message - Description of the action
 * @param {object} data - Additional data (optional)
 */
export const addBreadcrumb = (type, message, data = {}) => {
  breadcrumbs.push({
    type,
    message,
    timestamp: Date.now(),
    ...data
  });

  // Keep only the last N breadcrumbs
  if (breadcrumbs.length > MAX_BREADCRUMBS) {
    breadcrumbs.shift();
  }
};

// ============================================================
// CONSOLE CAPTURE - Capture recent console output
// ============================================================
const MAX_CONSOLE_LOGS = 15;
const consoleLogs = [];
let originalConsole = {};

const captureConsole = () => {
  ['log', 'warn', 'error', 'info'].forEach(method => {
    originalConsole[method] = console[method];
    console[method] = (...args) => {
      // Call original
      originalConsole[method].apply(console, args);

      // Capture (but not our own logging messages)
      const message = args.map(arg => {
        if (typeof arg === 'object') {
          try {
            return JSON.stringify(arg).substring(0, 200);
          } catch {
            return '[Object]';
          }
        }
        return String(arg).substring(0, 200);
      }).join(' ');

      if (!message.includes('[ErrorLogger]')) {
        consoleLogs.push({
          level: method,
          message,
          timestamp: Date.now()
        });

        if (consoleLogs.length > MAX_CONSOLE_LOGS) {
          consoleLogs.shift();
        }
      }
    };
  });
};

// ============================================================
// CONTEXT - Gather app context
// ============================================================

// Store current context (updated by app components)
let currentContext = {
  lesson: null,
  activity: null,
  role: null, // 'teacher' or 'student'
  sessionCode: null
};

/**
 * Update the current context (call from components)
 * @param {object} context - { lesson, activity, role, sessionCode }
 */
export const setErrorContext = (context) => {
  currentContext = { ...currentContext, ...context };
};

// Detect browser info
const getBrowserInfo = () => {
  const ua = navigator.userAgent;
  let browser = 'Unknown';
  let version = '';

  if (ua.includes('Chrome/')) {
    browser = 'Chrome';
    version = ua.match(/Chrome\/(\d+)/)?.[1] || '';
  } else if (ua.includes('Safari/') && !ua.includes('Chrome')) {
    browser = 'Safari';
    version = ua.match(/Version\/(\d+)/)?.[1] || '';
  } else if (ua.includes('Firefox/')) {
    browser = 'Firefox';
    version = ua.match(/Firefox\/(\d+)/)?.[1] || '';
  } else if (ua.includes('Edge/')) {
    browser = 'Edge';
    version = ua.match(/Edge\/(\d+)/)?.[1] || '';
  }

  return version ? `${browser} ${version}` : browser;
};

// Detect device type
const getDeviceInfo = () => {
  const ua = navigator.userAgent;
  if (/CrOS/.test(ua)) return 'Chromebook';
  if (/iPad/.test(ua)) return 'iPad';
  if (/iPhone/.test(ua)) return 'iPhone';
  if (/Android/.test(ua) && /Mobile/.test(ua)) return 'Android Phone';
  if (/Android/.test(ua)) return 'Android Tablet';
  if (/Mac/.test(ua)) return 'Mac';
  if (/Windows/.test(ua)) return 'Windows';
  if (/Linux/.test(ua)) return 'Linux';
  return 'Unknown';
};

// Get site mode from env
const getSiteMode = () => {
  return import.meta.env.VITE_SITE_MODE || 'unknown';
};

// Sanitize URL to remove potential student identifiers
const sanitizeUrl = (url) => {
  try {
    const urlObj = new URL(url, window.location.origin);
    // Remove query params that might contain student/session info
    return urlObj.pathname;
  } catch {
    return url?.split('?')[0] || 'unknown';
  }
};

// Determine error type from error object
const getErrorType = (error, context = {}) => {
  if (context.isReactError) return 'react';
  if (!error) return 'unknown';

  const message = (error.message || String(error)).toLowerCase();
  const name = (error.name || '').toLowerCase();

  if (message.includes('fetch') || message.includes('network') || message.includes('cors') || name === 'typeerror' && message.includes('failed')) {
    return 'network';
  }
  if (message.includes('audio') || message.includes('tone') || message.includes('audiocontext')) {
    return 'audio';
  }
  if (message.includes('chunk') || message.includes('loading') || message.includes('dynamically imported')) {
    return 'chunk';
  }
  return 'javascript';
};

// Determine severity from error
const getSeverity = (error, context = {}) => {
  if (context.isUnhandled) return 'critical';
  if (context.isReactError) return 'high';

  const message = (error?.message || String(error)).toLowerCase();

  if (message.includes('crash') || message.includes('fatal')) return 'critical';
  if (message.includes('undefined') || message.includes('null') || message.includes('cannot read')) return 'high';
  if (message.includes('warning') || message.includes('deprecated')) return 'low';
  return 'medium';
};

// ============================================================
// MAIN LOGGING FUNCTION
// ============================================================

/**
 * Log an error to our backend
 * @param {Error|string} error - The error object or message
 * @param {Object} context - Additional context
 */
export const logError = async (error, context = {}) => {
  // Don't log in development unless explicitly enabled
  if (import.meta.env.DEV && !import.meta.env.VITE_LOG_ERRORS_IN_DEV) {
    console.warn('[ErrorLogger] Skipping error log in development:', error);
    return;
  }

  try {
    const errorData = {
      // Error details
      message: error?.message || String(error),
      stack: error?.stack || null,

      // Page and component
      page: sanitizeUrl(window.location.href),
      component: context.component || null,

      // Browser/device
      browser: getBrowserInfo(),
      device: getDeviceInfo(),
      userAgent: navigator.userAgent,
      screenSize: `${window.innerWidth}x${window.innerHeight}`,
      online: navigator.onLine,

      // App context
      siteMode: getSiteMode(),
      appVersion: import.meta.env.VITE_APP_VERSION || null,
      lesson: currentContext.lesson,
      activity: currentContext.activity,
      userRole: currentContext.role,

      // Error classification
      errorType: getErrorType(error, context),
      severity: getSeverity(error, context),

      // Debugging info
      breadcrumbs: [...breadcrumbs],
      consoleLogs: [...consoleLogs],

      // Timestamps
      timestamp: new Date().toISOString(),
      localTime: new Date().toLocaleString()
    };

    // Fire and forget - don't block on response
    fetch(ERROR_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(errorData)
    }).catch(() => {
      // Silently fail - we don't want error logging to cause more errors
    });
  } catch {
    // Silently fail
  }
};

/**
 * React Error Boundary helper
 */
export const logReactError = (error, errorInfo) => {
  logError(error, {
    isReactError: true,
    component: errorInfo?.componentStack?.split('\n')[1]?.trim() || 'Unknown'
  });
};

// ============================================================
// AUTO-TRACKING - Automatically capture breadcrumbs
// ============================================================

const setupAutoTracking = () => {
  // Track clicks
  document.addEventListener('click', (e) => {
    const target = e.target;
    const tagName = target.tagName?.toLowerCase();
    const text = target.textContent?.substring(0, 30) || '';
    const className = target.className?.split?.(' ')?.[0] || '';

    if (tagName === 'button' || tagName === 'a' || target.role === 'button') {
      addBreadcrumb('click', `Clicked ${tagName}: "${text}"`, { className });
    }
  }, { passive: true, capture: true });

  // Track navigation
  let lastUrl = window.location.href;
  const checkNavigation = () => {
    if (window.location.href !== lastUrl) {
      addBreadcrumb('navigation', `Navigated to ${sanitizeUrl(window.location.href)}`);
      lastUrl = window.location.href;
    }
  };

  // Check for navigation on popstate and periodically
  window.addEventListener('popstate', checkNavigation);
  setInterval(checkNavigation, 1000);

  // Track fetch errors
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    const url = typeof args[0] === 'string' ? args[0] : args[0]?.url || 'unknown';
    const method = args[1]?.method || 'GET';

    try {
      const response = await originalFetch.apply(window, args);
      if (!response.ok && !url.includes('/api/errors')) {
        addBreadcrumb('api', `API ${method} ${sanitizeUrl(url)} failed: ${response.status}`);
      }
      return response;
    } catch (error) {
      if (!url.includes('/api/errors')) {
        addBreadcrumb('api', `API ${method} ${sanitizeUrl(url)} error: ${error.message}`);
      }
      throw error;
    }
  };

  // Track online/offline
  window.addEventListener('online', () => addBreadcrumb('network', 'Back online'));
  window.addEventListener('offline', () => addBreadcrumb('network', 'Went offline'));
};

// ============================================================
// INITIALIZATION
// ============================================================

let initialized = false;

/**
 * Initialize global error handlers
 * Call this once at app startup
 */
export const initErrorLogging = () => {
  if (initialized) return;
  initialized = true;

  // Don't initialize in development unless explicitly enabled
  if (import.meta.env.DEV && !import.meta.env.VITE_LOG_ERRORS_IN_DEV) {
    console.log('[ErrorLogger] Disabled in development');
    return;
  }

  // Capture console output
  captureConsole();

  // Setup auto-tracking for breadcrumbs
  setupAutoTracking();

  // Global error handler (catches uncaught errors)
  window.onerror = (message, source, lineno, colno, error) => {
    logError(error || new Error(message), {
      isUnhandled: true,
      component: source ? `${source}:${lineno}:${colno}` : 'Unknown'
    });
  };

  // Unhandled promise rejection handler
  window.onunhandledrejection = (event) => {
    logError(event.reason || new Error('Unhandled Promise Rejection'), {
      isUnhandled: true,
      component: 'UnhandledPromiseRejection'
    });
  };

  // Initial breadcrumb
  addBreadcrumb('init', 'App initialized');

  console.log('[ErrorLogger] First-party error logging initialized with breadcrumbs');
};

export default {
  logError,
  logReactError,
  initErrorLogging,
  addBreadcrumb,
  setErrorContext
};
