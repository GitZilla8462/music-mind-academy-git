const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  className: { type: String, required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  teacherName: { type: String, required: true },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  classCode: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
});

// Index for fast teacher class lookups
classSchema.index({ teacher: 1 });

module.exports = mongoose.model('Class', classSchema);