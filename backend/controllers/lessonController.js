const Lesson = require('../models/Lesson');
const mongoose = require('mongoose');

const lessonController = {
  // Get all lessons with optional filtering
  getAllLessons: async (req, res) => {
    try {
      const { category, difficulty, tags } = req.query;
      
      const filters = {};
      if (category) filters.category = category;
      if (difficulty) filters.difficulty = difficulty;
      if (tags) filters.tags = tags.split(',');
      
      const lessons = await Lesson.findByFilters(filters);
      
      res.json({
        success: true,
        count: lessons.length,
        data: lessons
      });
    } catch (error) {
      console.error('Error fetching lessons:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching lessons',
        error: error.message
      });
    }
  },

  // Get single lesson by ID
  getLessonById: async (req, res) => {
    try {
      const { lessonId } = req.params;
      
      const lesson = await Lesson.findOne({ 
        id: lessonId, 
        isActive: true 
      });
      
      if (!lesson) {
        return res.status(404).json({
          success: false,
          message: 'Lesson not found'
        });
      }

      // Validate lesson structure
      const validation = lesson.validateStructure();
      if (!validation.isValid) {
        console.warn(`Lesson ${lessonId} has structural issues:`, validation.errors);
      }

      res.json({
        success: true,
        data: lesson,
        validation: validation
      });
    } catch (error) {
      console.error('Error fetching lesson:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching lesson',
        error: error.message
      });
    }
  },

  // Get lesson structure (without sensitive content like quiz answers)
  getLessonStructure: async (req, res) => {
    try {
      const { lessonId } = req.params;
      
      const lesson = await Lesson.findOne({ 
        id: lessonId, 
        isActive: true 
      }).select('-activities.config.correctAnswers -activities.config.explanations');
      
      if (!lesson) {
        return res.status(404).json({
          success: false,
          message: 'Lesson not found'
        });
      }

      res.json({
        success: true,
        data: {
          id: lesson.id,
          title: lesson.title,
          description: lesson.description,
          category: lesson.category,
          difficulty: lesson.difficulty,
          estimatedTime: lesson.estimatedTime,
          learningObjectives: lesson.learningObjectives,
          activities: lesson.activities.map(activity => ({
            id: activity.id,
            type: activity.type,
            title: activity.title,
            order: activity.order,
            estimatedTime: activity.estimatedTime,
            isRequired: activity.isRequired,
            // Only include safe config data
            config: {
              ...activity.config,
              correctAnswers: undefined,
              explanations: undefined
            }
          })),
          totalActivities: lesson.totalActivities,
          requiredActivities: lesson.requiredActivities
        }
      });
    } catch (error) {
      console.error('Error fetching lesson structure:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching lesson structure',
        error: error.message
      });
    }
  },

  // Create new lesson (admin/teacher only)
  createLesson: async (req, res) => {
    try {
      const lessonData = req.body;
      
      // Add creator info
      lessonData.createdBy = req.user.id;
      lessonData.updatedBy = req.user.id;
      
      // Validate required fields
      if (!lessonData.id || !lessonData.title || !lessonData.category) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: id, title, category'
        });
      }

      // Check if lesson ID already exists
      const existingLesson = await Lesson.findOne({ id: lessonData.id });
      if (existingLesson) {
        return res.status(409).json({
          success: false,
          message: 'Lesson with this ID already exists'
        });
      }

      const lesson = new Lesson(lessonData);
      
      // Validate structure
      const validation = lesson.validateStructure();
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Invalid lesson structure',
          errors: validation.errors
        });
      }

      await lesson.save();

      res.status(201).json({
        success: true,
        message: 'Lesson created successfully',
        data: lesson
      });
    } catch (error) {
      console.error('Error creating lesson:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating lesson',
        error: error.message
      });
    }
  },

  // Update lesson
  updateLesson: async (req, res) => {
    try {
      const { lessonId } = req.params;
      const updates = req.body;
      
      // Add updater info
      updates.updatedBy = req.user.id;
      
      // Don't allow changing the lesson ID
      delete updates.id;

      const lesson = await Lesson.findOneAndUpdate(
        { id: lessonId },
        updates,
        { new: true, runValidators: true }
      );

      if (!lesson) {
        return res.status(404).json({
          success: false,
          message: 'Lesson not found'
        });
      }

      // Validate updated structure
      const validation = lesson.validateStructure();
      if (!validation.isValid) {
        console.warn(`Updated lesson ${lessonId} has structural issues:`, validation.errors);
      }

      res.json({
        success: true,
        message: 'Lesson updated successfully',
        data: lesson,
        validation: validation
      });
    } catch (error) {
      console.error('Error updating lesson:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating lesson',
        error: error.message
      });
    }
  },

  // Soft delete lesson (set isActive to false)
  deleteLesson: async (req, res) => {
    try {
      const { lessonId } = req.params;
      
      const lesson = await Lesson.findOneAndUpdate(
        { id: lessonId },
        { 
          isActive: false,
          updatedBy: req.user.id
        },
        { new: true }
      );

      if (!lesson) {
        return res.status(404).json({
          success: false,
          message: 'Lesson not found'
        });
      }

      res.json({
        success: true,
        message: 'Lesson deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting lesson:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting lesson',
        error: error.message
      });
    }
  },

  // Get lessons by category (for teacher assignment interface)
  getLessonsByCategory: async (req, res) => {
    try {
      const { category } = req.params;
      
      const lessons = await Lesson.find({
        category: category,
        isActive: true,
        isPublished: true
      })
      .select('id title description difficulty estimatedTime learningObjectives thumbnail')
      .sort({ difficulty: 1, createdAt: 1 });

      res.json({
        success: true,
        category: category,
        count: lessons.length,
        data: lessons
      });
    } catch (error) {
      console.error('Error fetching lessons by category:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching lessons by category',
        error: error.message
      });
    }
  },

  // Get specific activity from a lesson
  getLessonActivity: async (req, res) => {
    try {
      const { lessonId, activityId } = req.params;
      
      const lesson = await Lesson.findOne({ 
        id: lessonId, 
        isActive: true 
      });
      
      if (!lesson) {
        return res.status(404).json({
          success: false,
          message: 'Lesson not found'
        });
      }

      const activity = lesson.activities.find(a => a.id === activityId);
      
      if (!activity) {
        return res.status(404).json({
          success: false,
          message: 'Activity not found'
        });
      }

      // For quiz activities, don't send correct answers
      let responseActivity = { ...activity.toObject() };
      if (activity.type === 'interactive-quiz') {
        if (responseActivity.config.questions) {
          responseActivity.config.questions = responseActivity.config.questions.map(q => ({
            ...q,
            correctAnswer: undefined,
            explanation: undefined
          }));
        }
      }

      res.json({
        success: true,
        data: responseActivity
      });
    } catch (error) {
      console.error('Error fetching lesson activity:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching lesson activity',
        error: error.message
      });
    }
  }
};

module.exports = lessonController;