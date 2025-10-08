const express = require('express');
const router = express.Router();
const lessonController = require('../controllers/lessonController');
// Assuming you have auth middleware - adjust import path as needed
// const { authenticateToken, requireRole } = require('../middleware/auth');

// Public routes (students can access)
router.get('/', lessonController.getAllLessons);
router.get('/category/:category', lessonController.getLessonsByCategory);
router.get('/:lessonId', lessonController.getLessonById);
router.get('/:lessonId/structure', lessonController.getLessonStructure);
router.get('/:lessonId/activities/:activityId', lessonController.getLessonActivity);

// Protected routes (require authentication)
// Uncomment and adjust these based on your auth middleware

// Teacher/Admin only routes
// router.post('/', authenticateToken, requireRole(['teacher', 'admin']), lessonController.createLesson);
// router.put('/:lessonId', authenticateToken, requireRole(['teacher', 'admin']), lessonController.updateLesson);
// router.delete('/:lessonId', authenticateToken, requireRole(['teacher', 'admin']), lessonController.deleteLesson);

// Temporary unprotected routes for testing (REMOVE IN PRODUCTION)
router.post('/', lessonController.createLesson);
router.put('/:lessonId', lessonController.updateLesson);
router.delete('/:lessonId', lessonController.deleteLesson);

module.exports = router;