const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  email: { type: String, unique: true, sparse: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'teacher', 'student'], required: true },
  phone: String,
  school: String,
  subjects: [String],
  class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' }, // Add this line
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['active', 'inactive', 'pending'], default: 'active' },
  studentsCount: { type: Number, default: 0 },
  progress: { type: Number, default: 0 },
  grade: { type: String, default: 'N/A' },
  joinDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
  createdAt: { type: Date, default: Date.now },
  lastLogin: Date
});

module.exports = mongoose.model('User', userSchema);