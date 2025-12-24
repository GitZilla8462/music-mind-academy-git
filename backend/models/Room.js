const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    index: true
  },
  mode: {
    type: String,
    enum: ['solo', 'partner', 'trio'],
    default: 'solo'
  },
  theme: {
    type: String,
    default: 'space-station'
  },
  status: {
    type: String,
    enum: ['creating', 'ready'],
    default: 'creating'
  },
  patterns: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  readyPlayers: {
    type: [Number],
    default: []
  },
  activeLocks: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  creatorIndex: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Auto-delete rooms older than 24 hours
roomSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

// Update the updatedAt timestamp before saving
roomSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Room', roomSchema);
