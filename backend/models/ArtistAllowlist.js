const mongoose = require('mongoose');

const artistAllowlistSchema = new mongoose.Schema({
  artist_name: { type: String, required: true, unique: true },
  genres: [String],
  verified_clean: { type: Boolean, default: true },
  tiny_desk_url: String,
  added_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ArtistAllowlist', artistAllowlistSchema);
