const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const studentController = require('../controllers/studentController');

// Logging middleware for student routes
router.use((req, res, next) => {
    console.log(`[StudentRoutes] Received request: ${req.method} ${req.originalUrl}`);
    next();
});

// Route to get assignments for the logged-in student
// This is now at GET /api/students/assignments
router.get('/assignments', auth.authenticateToken, auth.requireStudent, studentController.getAssignmentsForStudent);

// Route to get grades for the logged-in student
// This is now at GET /api/students/grades
router.get('/grades', auth.authenticateToken, auth.requireStudent, studentController.getStudentGrades);

// Route to submit an assignment
router.post('/assignments/:assignmentId/submit', auth.authenticateToken, auth.requireStudent, studentController.submitAssignment);

module.exports = router;