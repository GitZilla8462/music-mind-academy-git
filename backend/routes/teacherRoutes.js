const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const teacherController = require('../controllers/teacherController');

// Route to get all classes for the logged-in teacher
router.get('/classes', auth.authenticateToken, teacherController.getClasses);

// Route to get a single class by its Mongoose ObjectId
router.get('/classes/:classId', auth.authenticateToken, teacherController.getClassById);

// Route to create a new class
router.post('/classes', auth.authenticateToken, teacherController.createClass);

// Route to add a single student to a class
router.post('/classes/:classId/students', auth.authenticateToken, teacherController.addStudent);

// Route to bulk add students to a class
router.post('/classes/:classId/students/bulk', auth.authenticateToken, teacherController.bulkAddStudents);

// Route to delete a student from a class
router.delete('/classes/:classId/students/:studentId', auth.authenticateToken, teacherController.deleteStudent);

// Route to delete a class and all its students
router.delete('/classes/:classId', auth.authenticateToken, teacherController.deleteClass);

// Route to get a single student by their ID
router.get('/students/:studentId', auth.authenticateToken, teacherController.getStudentById);

// Route to reset a student's password
router.post('/students/:studentId/reset-password', auth.authenticateToken, teacherController.resetStudentPassword);

// ----------------------------------------------------------------------
// Assignment Management Routes
// ----------------------------------------------------------------------

// Route to create a new assignment for a class
router.post('/assignments/create', auth.authenticateToken, auth.requireTeacher, teacherController.createAssignment);

// Route to get assignments for a specific class (for teacher view)
router.get('/assignments/:classId', auth.authenticateToken, auth.requireTeacher, teacherController.getAssignmentsForClass);

// Route to get a single assignment and its students for editing
router.get('/assignments/edit/:assignmentId', auth.authenticateToken, auth.requireTeacher, teacherController.getAssignmentDetails);

// Route to update an assignment
router.put('/assignments/:assignmentId', auth.authenticateToken, auth.requireTeacher, teacherController.updateAssignment);

// Route to delete a single assignment
router.delete('/assignments/:assignmentId', auth.authenticateToken, auth.requireTeacher, teacherController.deleteAssignment);

// Route to delete ALL assignments for a teacher
router.delete('/assignments/all', auth.authenticateToken, auth.requireTeacher, teacherController.deleteAllAssignments);

// Route to get all student submissions for a specific assignment
router.get('/assignments/:assignmentId/submissions', auth.authenticateToken, auth.requireTeacher, teacherController.getAssignmentSubmissions);

// Route to get a single submission by its ID (for embedded playback view)
router.get('/submissions/id/:submissionId', auth.authenticateToken, auth.requireTeacher, teacherController.getSubmissionById);

// Route to update a student's submission with a grade and feedback
router.put('/submissions/:submissionId/grade', auth.authenticateToken, auth.requireTeacher, teacherController.updateSubmissionGrade);

// Route to update a student's submission status
router.put('/submissions/:submissionId/status', auth.authenticateToken, auth.requireTeacher, teacherController.updateSubmissionStatus);

module.exports = router;