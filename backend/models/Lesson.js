const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['intro-video', 'interactive-quiz', 'composer-daw', 'reflection', 'theory-lesson', 'ear-training']
  },
  title: {
    type: String,
    required: true
  },
  order: {
    type: Number,
    required: true
  },
  estimatedTime: {
    type: Number, // minutes
    required: true
  },
  isRequired: {
    type: Boolean,
    default: true
  },
  config: {
    // Activity-specific configuration
    // For intro-video: { segments: ['intro-1.mp4', 'intro-2.mp4'], voiceScript: '...' }
    // For quiz: { questionCount: 5, passingScore: 80 }
    // For composer-daw: { project: 'horror-scene', availableLoops: [...] }
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
});

const lessonSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['film-music', 'music-theory', 'ear-training', 'composition', 'performance']
  },
  subcategory: {
    type: String,
    default: ''
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['beginner', 'intermediate', 'advanced']
  },
  estimatedTime: {
    type: Number, // total minutes for entire lesson
    required: true
  },
  thumbnail: {
    type: String, // path to thumbnail image
    default: ''
  },
  
  // Learning objectives
  learningObjectives: [{
    type: String,
    required: true
  }],
  
  // Prerequisites - other lessons that should be completed first
  prerequisites: [{
    lessonId: {
      type: String,
      ref: 'Lesson'
    },
    required: {
      type: Boolean,
      default: true
    }
  }],
  
  // The actual lesson activities in order
  activities: [activitySchema],
  
  // Content organization
  tags: [{
    type: String
  }],
  
  // Status and metadata
  isActive: {
    type: Boolean,
    default: true
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  version: {
    type: String,
    default: '1.0'
  },
  
  // Who can access this lesson
  accessLevel: {
    type: String,
    enum: ['public', 'school', 'premium'],
    default: 'public'
  },
  
  // Analytics
  totalAssignments: {
    type: Number,
    default: 0
  },
  averageCompletionTime: {
    type: Number, // minutes
    default: 0
  },
  averageScore: {
    type: Number,
    default: 0
  },
  
  // Audit fields
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
lessonSchema.index({ category: 1, difficulty: 1 });
lessonSchema.index({ isActive: 1, isPublished: 1 });
lessonSchema.index({ tags: 1 });

// Virtual for calculating total activities
lessonSchema.virtual('totalActivities').get(function() {
  return this.activities.length;
});

// Virtual for required activities count
lessonSchema.virtual('requiredActivities').get(function() {
  return this.activities.filter(activity => activity.isRequired).length;
});

// Method to get activities by type
lessonSchema.methods.getActivitiesByType = function(type) {
  return this.activities.filter(activity => activity.type === type);
};

// Method to get next activity after given activity ID
lessonSchema.methods.getNextActivity = function(currentActivityId) {
  const currentIndex = this.activities.findIndex(activity => activity.id === currentActivityId);
  if (currentIndex === -1 || currentIndex === this.activities.length - 1) {
    return null;
  }
  return this.activities[currentIndex + 1];
};

// Method to validate lesson structure
lessonSchema.methods.validateStructure = function() {
  const errors = [];
  
  // Check if activities have sequential order
  const orders = this.activities.map(a => a.order).sort((a, b) => a - b);
  for (let i = 0; i < orders.length; i++) {
    if (orders[i] !== i + 1) {
      errors.push(`Activity order should be sequential. Missing order ${i + 1}`);
    }
  }
  
  // Check for duplicate activity IDs
  const activityIds = this.activities.map(a => a.id);
  const uniqueIds = [...new Set(activityIds)];
  if (activityIds.length !== uniqueIds.length) {
    errors.push('Duplicate activity IDs found');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Static method to find lessons by category and difficulty
lessonSchema.statics.findByFilters = function(filters = {}) {
  const query = { isActive: true, isPublished: true };
  
  if (filters.category) query.category = filters.category;
  if (filters.difficulty) query.difficulty = filters.difficulty;
  if (filters.tags && filters.tags.length > 0) {
    query.tags = { $in: filters.tags };
  }
  
  return this.find(query).sort({ createdAt: -1 });
};

module.exports = mongoose.model('Lesson', lessonSchema);