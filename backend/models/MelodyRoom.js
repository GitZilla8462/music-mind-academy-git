const mongoose = require('mongoose');

const melodyRoomSchema = new mongoose.Schema({
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
  concept: {
    type: String,
    default: 'vanishing-composer'
  },
  ending: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['creating', 'ready'],
    default: 'creating'
  },
  melodies: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  readyPlayers: {
    type: [Number],
    default: []
  },
  activeScenes: {
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
melodyRoomSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

// Update the updatedAt timestamp before saving
melodyRoomSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('MelodyRoom', melodyRoomSchema);
