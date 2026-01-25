const mongoose = require('mongoose');

// Breadcrumb schema - user actions leading to error
const breadcrumbSchema = new mongoose.Schema({
  type: String,      // click, navigation, api, console, network, init
  message: String,
  timestamp: Number
}, { _id: false });

// Console log schema - captured console output
const consoleLogSchema = new mongoose.Schema({
  level: String,     // log, warn, error, info
  message: String,
  timestamp: Number
}, { _id: false });

const errorLogSchema = new mongoose.Schema({
  // Error details
  message: {
    type: String,
    required: true
  },
  stack: {
    type: String,
    default: null
  },

  // Context (privacy-safe - no student identifiers)
  page: {
    type: String,
    required: true
  },
  component: {
    type: String,
    default: null
  },

  // Browser/device info
  browser: {
    type: String,
    default: null
  },
  device: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  },
  screenSize: {
    type: String,
    default: null
  },
  online: {
    type: Boolean,
    default: true
  },

  // App context
  siteMode: {
    type: String,
    enum: ['academy', 'edu', 'tools', 'unknown'],
    default: 'unknown'
  },
  appVersion: {
    type: String,
    default: null
  },
  lesson: {
    type: String,
    default: null
  },
  activity: {
    type: String,
    default: null
  },
  userRole: {
    type: String,
    enum: ['teacher', 'student', null],
    default: null
  },

  // Error metadata
  errorType: {
    type: String,
    enum: ['javascript', 'react', 'network', 'audio', 'chunk', 'unknown'],
    default: 'unknown'
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },

  // Debugging info - breadcrumbs and console logs
  breadcrumbs: {
    type: [breadcrumbSchema],
    default: []
  },
  consoleLogs: {
    type: [consoleLogSchema],
    default: []
  },

  // Status for tracking
  status: {
    type: String,
    enum: ['new', 'seen', 'investigating', 'resolved', 'ignored'],
    default: 'new'
  },

  // Email notification sent
  emailSent: {
    type: Boolean,
    default: false
  },

  // Timestamps
  localTime: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Auto-delete logs older than 30 days to manage storage
errorLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

// Index for common queries
errorLogSchema.index({ status: 1, createdAt: -1 });
errorLogSchema.index({ page: 1 });
errorLogSchema.index({ errorType: 1 });

module.exports = mongoose.model('ErrorLog', errorLogSchema);
