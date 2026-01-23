import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/index.css';
import { initDevTools } from './utils/devTools.js';
import { initErrorLogging } from './utils/errorLogger.js';

// Initialize first-party error logging
// - Sends errors to our own backend (can't be blocked by school firewalls)
// - No third-party data sharing (better for student privacy)
// - Includes email alerts for critical errors
initErrorLogging();

// Initialize dev tools in development mode
initDevTools();

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
);
