import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/index.css';
import { initDevTools } from './utils/devTools.js';

// Initialize dev tools in development mode
initDevTools();

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
);