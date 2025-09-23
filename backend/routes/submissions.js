// routes/submissions.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth'); // Import the specific function
const Submission = require('../models/Submission'); // Your existing submission model
const Assignment = require('../models/Assignment'); // Your assignment model
const User = require('../models/User');

// Submit an assignment
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { assignment, studentWork, status } = req.body;
    const studentId = req.user.id; // From JWT token

    // Validate assignment exists
    const assignmentDoc = await Assignment.findById(assignment);
    if (!assignmentDoc) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if student is enrolled in the class
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const isEnrolled = assignmentDoc.class && student.classId && student.classId.toString() === assignmentDoc.class.toString();
    if (!isEnrolled && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not enrolled in this class' });
    }

    // Check if submission already exists
    const existingSubmission = await Submission.findOne({ 
      assignment: assignment, 
      student: studentId 
    });

    if (existingSubmission) {
      // Update existing submission
      existingSubmission.studentWork = studentWork;
      existingSubmission.status = status || 'submitted';
      
      await existingSubmission.save();
      
      return res.json({
        message: 'Assignment updated successfully',
        submission: existingSubmission
      });
    }

    // Create new submission
    const submission = new Submission({
      assignment: assignment,
      student: studentId,
      studentWork: studentWork,
      status: status || 'submitted'
    });

    await submission.save();

    // Populate student and assignment info for response
    await submission.populate('student', 'firstName lastName email');
    await submission.populate('assignment', 'title description dueDate');

    res.status(201).json({
      message: 'Assignment submitted successfully',
      submission
    });

  } catch (error) {
    console.error('Error submitting assignment:', error);
    res.status(500).json({ 
      message: 'Error submitting assignment',
      error: error.message 
    });
  }
});

// Get submissions for a specific assignment (for teachers)
router.get('/assignment/:assignmentId', authenticateToken, async (req, res) => {
  try {
    const { assignmentId } = req.params;

    // Verify teacher has access to this assignment
    const assignment = await Assignment.findById(assignmentId).populate('teacher');
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    if (req.user.role !== 'admin' && assignment.teacher._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const submissions = await Submission.find({ assignment: assignmentId })
      .populate('student', 'firstName lastName email')
      .populate('assignment', 'title description dueDate')
      .sort({ submittedAt: -1 });

    res.json(submissions);

  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ 
      message: 'Error fetching submissions',
      error: error.message 
    });
  }
});

// Get a specific submission (for teachers or the student who submitted)
router.get('/:submissionId', authenticateToken, async (req, res) => {
  try {
    const { submissionId } = req.params;

    const submission = await Submission.findById(submissionId)
      .populate('student', 'firstName lastName email')
      .populate('assignment', 'title description dueDate');

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Check access rights
    const isStudent = req.user.role === 'student' && submission.student._id.toString() === req.user.id;
    const isTeacher = req.user.role === 'teacher';
    const isAdmin = req.user.role === 'admin';

    if (!isStudent && !isTeacher && !isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(submission);

  } catch (error) {
    console.error('Error fetching submission:', error);
    res.status(500).json({ 
      message: 'Error fetching submission',
      error: error.message 
    });
  }
});

// Grade a submission (teachers only)
router.put('/:submissionId/grade', authenticateToken, async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { grade, feedback } = req.body;

    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only teachers can grade submissions' });
    }

    const submission = await Submission.findById(submissionId)
      .populate('student', 'firstName lastName email')
      .populate('assignment', 'title description');

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Update submission with grade
    submission.grade = grade;
    submission.feedback = feedback;
    submission.status = 'graded';

    await submission.save();

    res.json({
      message: 'Submission graded successfully',
      submission
    });

  } catch (error) {
    console.error('Error grading submission:', error);
    res.status(500).json({ 
      message: 'Error grading submission',
      error: error.message 
    });
  }
});

// Get student's submissions (for student dashboard)
router.get('/student/my-submissions', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const submissions = await Submission.find({ student: req.user.id })
      .populate('assignment', 'title description dueDate')
      .sort({ submittedAt: -1 });

    res.json(submissions);

  } catch (error) {
    console.error('Error fetching student submissions:', error);
    res.status(500).json({ 
      message: 'Error fetching submissions',
      error: error.message 
    });
  }
});

module.exports = router;