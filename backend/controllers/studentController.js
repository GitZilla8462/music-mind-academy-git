// /backend/controllers/studentController.js
const User = require('../models/User');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');

/**
 * @desc Get all assignments for the logged-in student
 * @route GET /api/students/assignments
 * @access Private
 */
exports.getAssignmentsForStudent = async (req, res) => {
    try {
        console.log('🔍 Fetching assignments for user ID:', req.user.id);
        
        // The auth middleware attaches the user ID to the request
        const student = await User.findById(req.user.id).select('classId name');
        console.log('🔍 Student found:', student);

        if (!student || !student.classId) {
            console.log('❌ Student not found or no classId assigned');
            return res.status(404).json({ msg: 'Student not found or not enrolled in a class.' });
        }

        console.log('🔍 Looking for assignments for classId:', student.classId);
        
        // Find all assignments that belong to the student's class.
        // The .populate() method is used to get the full project details
        // instead of just the project ID.
        const assignments = await Assignment.find({ class: student.classId }).populate('project');
        
        console.log(`🔍 Found ${assignments.length} assignments for student ${req.user.id}`);
        console.log('🔍 Assignment details:', assignments.map(a => ({ id: a._id, title: a.title, class: a.class })));

        res.json(assignments);

    } catch (err) {
        console.error('❌ Error in getAssignmentsForStudent:', err.message);
        res.status(500).send('Server Error');
    }
};

/**
 * @desc Submit an assignment
 * @route POST /api/students/assignments/:assignmentId/submit
 * @access Private
 */
exports.submitAssignment = async (req, res) => {
    try {
        const { assignmentId } = req.params;
        const { studentWork } = req.body;
        const studentId = req.user.id;

        console.log(`[StudentController] Submitting assignment ${assignmentId} for student ${studentId}`);
        
        // Validate that the assignment exists
        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) {
            return res.status(404).json({ msg: 'Assignment not found' });
        }

        // Check if student belongs to the same class as the assignment
        const student = await User.findById(studentId);
        if (!student) {
            return res.status(404).json({ msg: 'Student not found' });
        }

        if (student.classId.toString() !== assignment.class.toString()) {
            return res.status(403).json({ msg: 'Not authorized to submit to this assignment' });
        }

        // Check if submission already exists and update or create new one
        let submission = await Submission.findOne({ 
            assignment: assignmentId, 
            student: studentId 
        });

        if (submission) {
            // Update existing submission
            submission.studentWork = studentWork;
            submission.status = 'submitted';
            // The pre-save hook will automatically set submittedAt
            await submission.save();
            console.log(`[StudentController] Updated existing submission for assignment ${assignmentId}`);
        } else {
            // Create new submission
            submission = new Submission({
                assignment: assignmentId,
                student: studentId,
                studentWork: studentWork,
                status: 'submitted'
                // The pre-save hook will automatically set submittedAt
            });
            await submission.save();
            console.log(`[StudentController] Created new submission for assignment ${assignmentId}`);
        }

        res.status(200).json({ 
            success: true, 
            message: 'Assignment submitted successfully',
            submissionId: submission._id
        });

    } catch (error) {
        console.error('Error submitting assignment:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error while submitting assignment',
            error: error.message 
        });
    }
};

/**
 * @desc Get grades for the logged-in student
 * @route GET /api/students/grades
 * @access Private
 */
exports.getStudentGrades = async (req, res) => {
    try {
        const studentId = req.user.id;
        
        console.log('🔍 Fetching grades for student ID:', studentId);
        
        // Find all submissions for this student that have been graded
        const gradedSubmissions = await Submission.find({
            student: studentId,
            grade: { $exists: true, $ne: null }
        })
        .populate('assignment', 'title project')
        .sort({ submittedAt: -1 });

        console.log(`🔍 Found ${gradedSubmissions.length} graded submissions for student ${studentId}`);

        // Calculate overall statistics
        const totalGradedAssignments = gradedSubmissions.length;
        
        if (totalGradedAssignments === 0) {
            console.log('📊 No graded assignments found for student');
            return res.json({
                overallGrade: null,
                gpa: null,
                completedAssignments: [],
                gradeBreakdown: {
                    assignments: null,
                    quizzes: null,
                    participation: null,
                    finalProject: null
                }
            });
        }

        // Calculate average score
        const totalScore = gradedSubmissions.reduce((sum, submission) => sum + submission.grade, 0);
        const averageScore = Math.round(totalScore / totalGradedAssignments);

        console.log(`📊 Average score: ${averageScore}% from ${totalGradedAssignments} assignments`);

        // Convert average score to letter grade
        const getLetterGrade = (score) => {
            if (score >= 97) return 'A+';
            if (score >= 93) return 'A';
            if (score >= 90) return 'A-';
            if (score >= 87) return 'B+';
            if (score >= 83) return 'B';
            if (score >= 80) return 'B-';
            if (score >= 77) return 'C+';
            if (score >= 73) return 'C';
            if (score >= 70) return 'C-';
            if (score >= 67) return 'D+';
            if (score >= 65) return 'D';
            return 'F';
        };

        // Calculate GPA (4.0 scale)
        const getGPA = (score) => {
            if (score >= 97) return 4.0;
            if (score >= 93) return 4.0;
            if (score >= 90) return 3.7;
            if (score >= 87) return 3.3;
            if (score >= 83) return 3.0;
            if (score >= 80) return 2.7;
            if (score >= 77) return 2.3;
            if (score >= 73) return 2.0;
            if (score >= 70) return 1.7;
            if (score >= 67) return 1.3;
            if (score >= 65) return 1.0;
            return 0.0;
        };

        // Format completed assignments for frontend
        const completedAssignments = gradedSubmissions.map(submission => ({
            id: submission._id,
            title: submission.assignment.title,
            type: submission.assignment.project || 'assignment',
            score: submission.grade,
            grade: getLetterGrade(submission.grade),
            submittedDate: submission.submittedAt,
            feedback: submission.feedback || ''
        }));

        // Calculate grade breakdown by assignment type
        const assignmentTypes = ['solfege', 'listening', 'practice'];
        const gradeBreakdown = {
            assignments: null,
            quizzes: null,
            participation: null,
            finalProject: null
        };

        // Calculate average for different assignment types
        const assignmentSubmissions = gradedSubmissions.filter(s => 
            assignmentTypes.includes(s.assignment.project)
        );
        
        if (assignmentSubmissions.length > 0) {
            const assignmentAvg = Math.round(
                assignmentSubmissions.reduce((sum, s) => sum + s.grade, 0) / assignmentSubmissions.length
            );
            gradeBreakdown.assignments = assignmentAvg;
            gradeBreakdown.quizzes = assignmentAvg; // For now, use same value
            gradeBreakdown.participation = Math.min(100, assignmentAvg + 5); // Slightly higher
        }

        const response = {
            overallGrade: getLetterGrade(averageScore),
            gpa: getGPA(averageScore),
            completedAssignments,
            gradeBreakdown
        };

        console.log('📊 Returning grade data:', { 
            overallGrade: response.overallGrade, 
            gpa: response.gpa, 
            assignmentsCount: response.completedAssignments.length 
        });

        res.json(response);

    } catch (error) {
        console.error('❌ Error fetching student grades:', error);
        res.status(500).json({ 
            message: 'Failed to fetch grades', 
            error: error.message 
        });
    }
};