const mongoose = require('mongoose');

const emailTemplateSchema = new mongoose.Schema({
  type: {
    type: String,
    unique: true,
    required: true,
    enum: ['drip-1', 'drip-2', 'drip-3', 'survey-l3', 'survey-l5', 'unit-complete', 'application-notify']
  },
  subject: {
    type: String,
    required: true
  },
  htmlContent: {
    type: String,
    required: true
  },
  textContent: {
    type: String,
    default: ''
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: String,
    default: null
  }
});

module.exports = mongoose.model('EmailTemplate', emailTemplateSchema);
