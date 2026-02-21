// backend/models/Assignment.js

const mongoose = require('mongoose');

const AssignmentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    project: {
        type: String,
        required: true,
    },
    mode: {
        type: String,
        enum: ['lesson', 'sandbox'],
        required: true,
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        required: true,
    },
    dueDate: {
        type: Date,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Indexes for query performance
AssignmentSchema.index({ teacher: 1 });
AssignmentSchema.index({ class: 1 });

module.exports = mongoose.model('Assignment', AssignmentSchema);