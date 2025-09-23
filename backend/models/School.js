const mongoose = require('mongoose');

const schoolSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  principal: { type: String, required: true },
  type: { type: String, required: true },
  status: { type: String, enum: ['active', 'inactive', 'pending'], default: 'active' },
  teacherCount: { type: Number, default: 0 },
  studentCount: { type: Number, default: 0 },
  addedDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('School', schoolSchema);