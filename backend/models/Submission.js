// backend/models/Submission.js

const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
    assignment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assignment',
        required: true,
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    studentWork: {
        type: String,
        default: '',
    },
    grade: {
        type: Number,
        min: 0,
        max: 100,
    },
    feedback: {
        type: String,
        default: '',
    },
    status: {
        type: String,
        enum: ['not started', 'in progress', 'submitted', 'graded'],
        default: 'not started',
    },
    submittedAt: {
        type: Date,
    },
    gradedAt: {
        type: Date,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Update the updatedAt field before saving
SubmissionSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    
    // Set submittedAt when status changes to 'submitted'
    if (this.status === 'submitted' && !this.submittedAt) {
        this.submittedAt = Date.now();
    }
    
    // Set gradedAt when status changes to 'graded'
    if (this.status === 'graded' && !this.gradedAt) {
        this.gradedAt = Date.now();
    }
    
    next();
});

module.exports = mongoose.model('Submission', SubmissionSchema);