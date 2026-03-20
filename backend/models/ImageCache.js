const mongoose = require('mongoose');

const imageCacheSchema = new mongoose.Schema({
  query: { type: String, required: true, unique: true },
  results: [{ url: String, thumbnail_url: String, title: String, attribution: String, license: String }],
  cached_at: { type: Date, default: Date.now, expires: 86400 } // TTL: 24 hours
});

module.exports = mongoose.model('ImageCache', imageCacheSchema);
