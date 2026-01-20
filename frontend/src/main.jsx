import React from 'react';
import ReactDOM from 'react-dom/client';
import * as Sentry from '@sentry/react';
import App from './App.jsx';
import './styles/index.css';
import { initDevTools } from './utils/devTools.js';

// Initialize Sentry for error tracking (only in production)
if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.VITE_SITE_MODE || 'unknown',
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
    // Performance monitoring - sample 10% of transactions
    tracesSampleRate: 0.1,
    // Session replay - capture 10% of sessions, 100% of sessions with errors
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    // Don't send errors in development
    enabled: import.meta.env.PROD,
    // Add useful context
    beforeSend(event) {
      // Add site mode to all events
      event.tags = {
        ...event.tags,
        siteMode: import.meta.env.VITE_SITE_MODE || 'unknown',
      };
      return event;
    },
  });
  console.log('🛡️ Sentry initialized for error tracking');
}

// Initialize dev tools in development mode
initDevTools();

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
);