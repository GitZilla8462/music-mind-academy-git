const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  source_url: { type: String, unique: true, required: true },
  source_name: { type: String, required: true },
  original_headline: { type: String, required: true },
  generated_headline: { type: String, required: true },
  body_standard: { type: String, required: true },
  body_simplified: { type: String, required: true },
  discussion_question: String,
  image_url: String,
  image_attribution: String,
  topics: [String],
  artists: [String],
  genres: [String],
  published_at: Date,
  generated_at: { type: Date, default: Date.now },
  featured: { type: Boolean, default: false },
  approved: { type: Boolean, default: true },
  flag_count: { type: Number, default: 0 },
  view_count: { type: Number, default: 0 }
}, { timestamps: true });

articleSchema.index({ generated_at: -1 });
articleSchema.index({ featured: 1 });
articleSchema.index({ approved: 1 });
articleSchema.index({ genres: 1 });
articleSchema.index({ artists: 1 });
articleSchema.index({ topics: 1 });
articleSchema.index({ '$**': 'text' }, { weights: { generated_headline: 10, body_standard: 5, artists: 8, topics: 6 } });

module.exports = mongoose.model('Article', articleSchema);
