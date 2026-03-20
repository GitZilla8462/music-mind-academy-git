const mongoose = require('mongoose');

const artistBlocklistSchema = new mongoose.Schema({
  artist_name: { type: String, required: true, unique: true },
  reason: String,
  added_by: String,
  added_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ArtistBlocklist', artistBlocklistSchema);
