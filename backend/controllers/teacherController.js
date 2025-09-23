const Class = require('../models/Class');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');

const Assignment = require('../models/Assignment'); 
const Submission = require('../models/Submission');

// Helper function to generate a unique class code
const generateClassCode = () => {
    return uuidv4();
};

// Helper function to generate random account info
const generateRandomAccount = () => {
    const instruments = ['flute', 'piano', 'oboe', 'harp', 'lute', 'drum', 'lyre', 'cello', 'viola', 'organ', 'tuba', 'cymbal', 'horn'];
    const filteredInstruments = instruments.filter(inst => inst.length >= 4 && inst.length <= 5);
    const instrument = filteredInstruments[Math.floor(Math.random() * filteredInstruments.length)];
    const number = Math.floor(100 + Math.random() * 900);
    const generatedName = `${instrument}${number}`;
    
    const animals = ['shark', 'bear', 'lion', 'eagle', 'tiger', 'wolf', 'cat', 'dog', 'zebra', 'mouse', 'snake', 'gecko'];
    const filteredAnimals = animals.filter(animal => animal.length >= 4 && animal.length <= 5);
    const animal = filteredAnimals[Math.floor(Math.random() * filteredAnimals.length)];
    const randomNumber = Math.floor(100 + Math.random() * 900);
    const generatedPass = `${animal}${randomNumber}`;
    
    return { name: generatedName, password: generatedPass };
};

// @route   GET /api/teachers/classes/:classId
// @desc    Get a single class by its ID
// @access  Private (Teacher)
exports.getClassById = async (req, res) => {
    try {
        const classData = await Class.findById(req.params.classId)
            .populate('teacher', 'name')
            .populate('students', 'name progress');

        if (!classData) {
            return res.status(404).json({ error: 'Class not found' });
        }

        if (classData.teacher._id.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Access denied. You can only view your own classes.' });
        }
        
        res.json(classData);

    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ error: 'Invalid class ID format' });
        }
        console.error('Error fetching class data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// @route   GET /api/teachers/classes
// @desc    Get all classes for the logged-in teacher
// @access  Private (Teacher)
exports.getClasses = async (req, res) => {
    console.log('✅ getClasses function entered.');
    try {
        console.log(`✅ User authenticated. Attempting to find classes for teacher ID: ${req.user.id}`);
        const classes = await Class.find({ teacher: req.user.id }).populate('students', 'name');
        console.log(`✅ Successfully found ${classes.length} classes.`);
        res.json(classes);
    } catch (err) {
        console.error('❌ Error fetching classes:', err.message);
        res.status(500).json({ error: 'Server Error' });
    }
    console.log('✅ getClasses function finished.');
};

// @route   POST /api/teachers/classes
// @desc    Create a new class
// @access  Private (Teacher)
exports.createClass = async (req, res) => {
    try {
        if (!req.body) {
            return res.status(400).json({ error: 'Request body is missing' });
        }
        
        if (!req.body.className) {
            return res.status(400).json({ error: 'Class name is required' });
        }
        
        if (!req.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const { className } = req.body;
        
        const teacher = await User.findById(req.user.id);
        if (!teacher) {
            return res.status(404).json({ error: 'Teacher not found' });
        }

        const newClass = new Class({
            className: className.trim(),
            teacher: req.user.id,
            teacherName: teacher.name,
            classCode: generateClassCode(),
            students: []
        });

        await newClass.save();

        res.status(201).json({ 
            message: 'Class created successfully', 
            class: newClass 
        });

    } catch (error) {
        console.error('Error creating class:', error);
        res.status(500).json({ error: 'Failed to create class' });
    }
};

// @route   POST /api/teachers/classes/:classId/students
// @desc    Add a single student to a class
// @access  Private (Teacher)
exports.addStudent = async (req, res) => {
    try {
        const { name, password } = req.body;

        if (!name || !password) {
            return res.status(400).json({ error: 'Name and password are required' });
        }

        const classData = await Class.findById(req.params.classId);
        if (!classData) {
            return res.status(404).json({ error: 'Class not found' });
        }

        if (classData.teacher.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Access denied. You can only modify your own classes.' });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const student = new User({
            name: name.trim(),
            password: hashedPassword,
            role: 'student',
            school: req.user.school || 'Unknown School',
            teacher: req.user.id,
            classId: req.params.classId,  // ✅ FIXED: Changed from 'class' to 'classId'
            progress: 0
        });

        await student.save();

        const updatedClass = await Class.findByIdAndUpdate(
            req.params.classId,
            { $push: { students: student._id } },
            { new: true }
        ).populate('students', 'name progress');

        res.status(201).json({ 
            message: 'Student added successfully', 
            student: student,
            class: updatedClass 
        });
    } catch (err) {
        console.error('Add student error:', err.message);
        res.status(500).json({ error: 'Server Error' });
    }
};

// @route   POST /api/teachers/classes/:classId/students/bulk
// @desc    Bulk add students to a class
// @access  Private (Teacher)
exports.bulkAddStudents = async (req, res) => {
    try {
        const { numberOfStudents } = req.body;
        const classId = req.params.classId;

        if (!numberOfStudents || numberOfStudents < 1 || numberOfStudents > 50) {
            return res.status(400).json({ error: 'Number of students must be between 1 and 50' });
        }

        const classData = await Class.findById(classId);
        if (!classData) {
            return res.status(404).json({ error: 'Class not found' });
        }

        if (classData.teacher.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Access denied. You can only modify your own classes.' });
        }

        const newStudents = [];
        const generatedAccounts = [];
        let studentsCreated = 0;
        let attempts = 0;
        const maxAttempts = numberOfStudents * 2;

        while (studentsCreated < numberOfStudents && attempts < maxAttempts) {
            attempts++;
            try {
                const { name: studentName, password: tempPassword } = generateRandomAccount();
                const hashedPassword = await bcrypt.hash(tempPassword, 12);
                
                const student = new User({
                    name: studentName,
                    password: hashedPassword,
                    role: 'student',
                    school: req.user.school || 'Unknown School',
                    teacher: req.user.id,
                    classId: classId,  // ✅ FIXED: Changed from 'class' to 'classId'
                    progress: 0
                });

                await student.save();

                newStudents.push(student);
                generatedAccounts.push({
                    accountName: studentName,
                    password: tempPassword
                });
                studentsCreated++;

            } catch (err) {
                if (err.code === 11000) {
                    console.warn(`Attempt ${attempts}: Duplicate name generated, retrying...`);
                } else {
                    console.error('Unexpected error during student creation:', err);
                    return res.status(500).json({ error: 'Server Error' });
                }
            }
        }

        if (studentsCreated === 0) {
            return res.status(500).json({ error: 'Failed to create any students after multiple attempts.' });
        }
        
        const newStudentIds = newStudents.map(student => student._id);

        await Class.findByIdAndUpdate(
            classId,
            { $push: { students: { $each: newStudentIds } } },
            { new: true }
        );

        res.status(200).json({
            message: `${studentsCreated} students added successfully`,
            accounts: generatedAccounts
        });

    } catch (err) {
        console.error('Bulk add error:', err.message);
        res.status(500).json({ error: 'Server Error' });
    }
};

// Direct fix for oboe889 student (no authentication required)
exports.directFixOboe = async (req, res) => {
    try {
        console.log('🔧 Fix function called');
        const student = await User.findOne({ name: 'oboe889' });
        console.log('🔧 Student before fix:', student);
        
        if (!student) {
            console.log('❌ Student oboe889 not found');
            return res.status(404).json({ error: 'Student oboe889 not found' });
        }
        
        // Copy the class field to classId field
        console.log('🔧 Copying class to classId:', student.class);
        student.classId = student.class;
        const savedStudent = await student.save();
        console.log('🔧 Student after save:', savedStudent);
        
        res.json({ 
            message: 'Student oboe889 fixed successfully!', 
            student: { name: savedStudent.name, classId: savedStudent.classId }
        });
    } catch (err) {
        console.error('🔧 Fix error:', err);
        res.status(500).json({ error: err.message });
    }
};

// @route   DELETE /api/teachers/classes/:classId/students/:studentId
// @desc    Delete a student from a class
// @access  Private (Teacher)
exports.deleteStudent = async (req, res) => {
    try {
        const { classId, studentId } = req.params;

        const classData = await Class.findById(classId);
        if (!classData) {
            return res.status(404).json({ error: 'Class not found' });
        }

        if (classData.teacher.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Access denied. You can only modify your own classes.' });
        }

        await Class.findByIdAndUpdate(
            classId,
            { $pull: { students: studentId } },
            { new: true }
        );

        await User.findByIdAndDelete(studentId);

        res.json({ message: 'Student deleted successfully.' });

    } catch (err) {
        console.error('Delete student error:', err.message);
        res.status(500).json({ error: 'Server Error' });
    }
};

// @route   DELETE /api/teachers/classes/:classId
// @desc    Delete a class and its students
// @access  Private (Teacher)
exports.deleteClass = async (req, res) => {
    try {
        const classId = req.params.classId;
        const classToDelete = await Class.findById(classId);

        if (!classToDelete) {
            return res.status(404).json({ error: 'Class not found' });
        }

        if (classToDelete.teacher.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Access denied. You can only delete your own classes.' });
        }

        const studentIds = classToDelete.students;

        await User.deleteMany({ _id: { $in: studentIds } });

        await Class.findByIdAndDelete(classId);

        res.json({ message: 'Class and all associated students deleted successfully.' });

    } catch (err) {
        console.error('Delete class error:', err.message);
        res.status(500).json({ error: 'Server Error' });
    }
};

// ----------------------------------------------------------------------
// Student Management and Assignment Management Functions
// ----------------------------------------------------------------------

// @route   GET /api/teachers/students/:studentId
// @desc    Get a single student by ID
// @access  Private (Teacher)
exports.getStudentById = async (req, res) => {
    try {
        const student = await User.findById(req.params.studentId).select('-password'); // Exclude password
        
        if (!student) {
            return res.status(404).json({ error: 'Student not found.' });
        }

        // Check if the authenticated user is the student's teacher
        if (student.teacher.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Access denied. You can only view your own students.' });
        }

        res.json(student);

    } catch (err) {
        console.error('Error fetching student details:', err.message);
        res.status(500).json({ error: 'Server Error' });
    }
};

// @route   POST /api/teachers/students/:studentId/reset-password
// @desc    Reset a student's password
// @access  Private (Teacher)
exports.resetStudentPassword = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ error: 'New password is required.' });
        }

        const student = await User.findById(studentId);

        if (!student) {
            return res.status(404).json({ error: 'Student not found.' });
        }

        // Check if the authenticated user is the student's teacher
        if (student.teacher.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Access denied. You can only reset passwords for your own students.' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 12);
        student.password = hashedPassword;
        await student.save();

        res.json({ message: 'Student password reset successfully.' });

    } catch (err) {
        console.error('Error resetting password:', err.message);
        res.status(500).json({ error: 'Server Error' });
    }
};

// @route   POST /api/teachers/assignments/create
// @desc    Create a new assignment for a class
// @access  Private (Teacher)
exports.createAssignment = async (req, res) => {
    try {
        const { title, description, dueDate, classId, project } = req.body;
        
        if (!title || !classId || !project) {
            return res.status(400).json({ error: 'Title, class ID, and project are required' });
        }
        
        const classData = await Class.findById(classId);
        if (!classData) {
            return res.status(404).json({ error: 'Class not found.' });
        }
        
        if (classData.teacher.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Access denied. You can only create assignments for your own classes.' });
        }

        const parsedDueDate = dueDate ? new Date(dueDate) : null;
        if (dueDate && isNaN(parsedDueDate.getTime())) {
            return res.status(400).json({ error: 'Invalid due date format.' });
        }

        const newAssignment = new Assignment({
            title,
            description,
            project: project.projectId,
            mode: project.projectType === 'project' ? 'lesson' : 'sandbox',
            teacher: req.user.id,
            class: classId,  // Assignments are saved with 'class' field
            dueDate: parsedDueDate,
        });
        
        const savedAssignment = await newAssignment.save();

        const submissionsToCreate = classData.students.map(studentId => ({
            assignment: savedAssignment._id,
            student: studentId,
        }));
        
        await Submission.insertMany(submissionsToCreate);
        
        res.status(201).json({ 
            message: `Assignment "${savedAssignment.title}" created successfully for ${classData.students.length} students.`, 
            assignment: savedAssignment,
            submissionCount: classData.students.length
        });

    } catch (error) {
        console.error('Error creating assignment:', error.message);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ error: messages.join(', ') });
        }
        res.status(500).json({ error: 'Failed to create assignment' });
    }
};

// @route   GET /api/teachers/assignments/:classId
// @desc    Get assignments for a specific class (for teacher view)
// @access  Private (Teacher)
exports.getAssignmentsForClass = async (req, res) => {
    try {
        const classId = req.params.classId;

        const classData = await Class.findById(classId);
        if (!classData) {
            return res.status(404).json({ error: 'Class not found.' });
        }

        if (classData.teacher.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Access denied. You can only view assignments for your own classes.' });
        }

        const assignments = await Assignment.find({ class: classId })  // ✅ FIXED: Find by 'class' field
            .populate('class', 'className')  // ✅ FIXED: Populate 'class' field
            .sort({ dueDate: 1 });
        
        res.json(assignments);

    } catch (err) {
        console.error('Error fetching assignments for class:', err.message);
        res.status(500).json({ error: 'Server Error' });
    }
};

// @route   GET /api/teachers/assignments/student
// @desc    Get assignments for the logged-in student
// @access  Private (Student)
exports.getAssignmentsForStudent = async (req, res) => {
    try {
        const student = await User.findById(req.user.id);
        
        if (!student || student.role !== 'student' || !student.classId) {
            return res.status(404).json({ error: 'Student not found or not assigned to a class.' });
        }

        const assignments = await Assignment.find({ class: student.classId }).sort({ dueDate: 1 });  // ✅ FIXED: Find by 'class' field using student's classId
        
        res.json(assignments);

    } catch (err) {
        console.error('Error fetching assignments for student:', err.message);
        res.status(500).json({ error: 'Server Error' });
    }
};

// @route   GET /api/teachers/assignments/edit/:assignmentId
// @desc    Get a single assignment and its associated student entries for editing
// @access  Private (Teacher)
exports.getAssignmentDetails = async (req, res) => {
    try {
        const { assignmentId } = req.params;

        const assignmentDetails = await Assignment.findById(assignmentId).populate('class', 'className');  // ✅ FIXED: Populate 'class' field

        if (!assignmentDetails || assignmentDetails.teacher.toString() !== req.user.id) {
            return res.status(404).json({ error: 'Assignment not found or access denied.' });
        }

        const assignedStudents = await Submission.find({
            assignment: assignmentDetails._id,
        }).populate('student', 'name');

        res.json({
            assignmentDetails,
            assignedStudents,
        });

    } catch (err) {
        console.error('Error fetching assignment details:', err);
        res.status(500).json({ error: 'Server Error' });
    }
};

// @route   PUT /api/teachers/assignments/:assignmentId
// @desc    Update a single assignment
// @access  Private (Teacher)
exports.updateAssignment = async (req, res) => {
    try {
        const { assignmentId } = req.params;
        const { title, description, dueDate } = req.body;

        const assignment = await Assignment.findById(assignmentId);

        if (!assignment || assignment.teacher.toString() !== req.user.id) {
            return res.status(404).json({ error: 'Assignment not found or access denied.' });
        }
        
        const relatedAssignments = await Assignment.find({
            class: assignment.class,  // ✅ FIXED: Find by 'class' field
            project: assignment.project,
        });

        const updatePromises = relatedAssignments.map(async (relatedAssignment) => {
            relatedAssignment.title = title || relatedAssignment.title;
            relatedAssignment.description = description || relatedAssignment.description;
            relatedAssignment.dueDate = dueDate ? new Date(dueDate) : relatedAssignment.dueDate;
            return relatedAssignment.save();
        });

        await Promise.all(updatePromises);
        
        res.json({ message: 'Assignments updated successfully' });

    } catch (err) {
        console.error('Error updating assignment:', err);
        res.status(500).json({ error: 'Server Error' });
    }
};

// @route   DELETE /api/teachers/assignments/:assignmentId
// @desc    Delete a single assignment
// @access  Private (Teacher)
exports.deleteAssignment = async (req, res) => {
    try {
        const { assignmentId } = req.params;
        
        // Find the assignment and verify ownership
        const assignment = await Assignment.findById(assignmentId);
        
        if (!assignment) {
            return res.status(404).json({ error: 'Assignment not found.' });
        }
        
        if (assignment.teacher.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Access denied. You can only delete your own assignments.' });
        }
        
        // Delete related submissions first
        await Submission.deleteMany({ assignment: assignmentId });
        
        // Delete the assignment
        await Assignment.findByIdAndDelete(assignmentId);
        
        res.json({ message: 'Assignment deleted successfully.' });
        
    } catch (err) {
        console.error('Error deleting assignment:', err.message);
        res.status(500).json({ error: 'Server Error' });
    }
};

// @route   DELETE /api/teachers/assignments/all
// @desc    Delete all assignments for the logged-in teacher
// @access  Private (Teacher)
exports.deleteAllAssignments = async (req, res) => {
    try {
        const teacherId = req.user.id;
        
        const result = await Assignment.deleteMany({ teacher: teacherId });

        res.json({ 
            message: `Successfully deleted ${result.deletedCount} assignments.`,
            deletedCount: result.deletedCount
        });
        
    } catch (err) {
        console.error('Error deleting all assignments:', err.message);
        res.status(500).json({ error: 'Server Error' });
    }
};

// @route   GET /api/teachers/assignments/:assignmentId/submissions
// @desc    Get all student submissions for a specific assignment
// @access  Private (Teacher)
exports.getAssignmentSubmissions = async (req, res) => {
    try {
        const { assignmentId } = req.params;

        const assignment = await Assignment.findById(assignmentId).populate('class', 'className');  // ✅ FIXED: Populate 'class' field

        if (!assignment || assignment.teacher.toString() !== req.user.id) {
            return res.status(404).json({ error: 'Assignment not found or access denied.' });
        }

        const submissions = await Submission.find({ assignment: assignmentId })
            .populate('student', 'name');

        res.json({
            assignment: {
                _id: assignment._id,
                title: assignment.title,
                project: assignment.project,
                dueDate: assignment.dueDate,
                class: assignment.class,  // ✅ FIXED: Return 'class' field
            },
            submissions,
        });

    } catch (err) {
        console.error('Error fetching assignment submissions:', err);
        res.status(500).json({ error: 'Server Error' });
    }
};

// @route   GET /api/submissions/id/:submissionId
// @desc    Get a single submission by its ID (for embedded playback view)
// @access  Private (Teacher)
exports.getSubmissionById = async (req, res) => {
    try {
        const { submissionId } = req.params;

        // Find the submission and populate student and assignment data
        const submission = await Submission.findById(submissionId)
            .populate('student', 'name firstName lastName email')
            .populate('assignment', 'title description teacher');

        if (!submission) {
            return res.status(404).json({ error: 'Submission not found.' });
        }

        // Check if the assignment exists and has a teacher
        if (!submission.assignment || !submission.assignment.teacher) {
            return res.status(404).json({ error: 'Assignment or teacher not found for this submission.' });
        }

        // Check if the authenticated user is the teacher of this assignment
        if (submission.assignment.teacher.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Access denied. You can only view submissions for your own assignments.' });
        }

        res.json(submission);

    } catch (err) {
        console.error('Error fetching submission by ID:', err.message);
        res.status(500).json({ error: 'Server Error' });
    }
};

// @route   PUT /api/teachers/submissions/:submissionId/grade
// @desc    Update a student's submission with a grade and feedback
// @access  Private (Teacher)
exports.updateSubmissionGrade = async (req, res) => {
    try {
        const { submissionId } = req.params;
        const { grade, feedback } = req.body;

        // Find the submission and populate the assignment to check teacher ownership
        const submission = await Submission.findById(submissionId)
            .populate('assignment');

        if (!submission) {
            return res.status(404).json({ error: 'Submission not found.' });
        }

        // Check if the authenticated user is the teacher of this assignment
        if (submission.assignment.teacher.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Access denied. You can only grade submissions for your own assignments.' });
        }

        // Update the submission with grade and feedback
        submission.grade = grade;
        submission.feedback = feedback;
        submission.status = 'graded';
        
        await submission.save();

        res.json({ 
            message: 'Submission graded successfully.',
            submission 
        });

    } catch (err) {
        console.error('Error updating submission grade:', err.message);
        res.status(500).json({ error: 'Server Error' });
    }
};

// @route   PUT /api/teachers/submissions/:submissionId/status
// @desc    Update a student's submission status
// @access  Private (Teacher)
exports.updateSubmissionStatus = async (req, res) => {
    try {
        const { submissionId } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ error: 'Status is required.' });
        }

        // Find the submission and populate the assignment to check teacher ownership
        const submission = await Submission.findById(submissionId)
            .populate('assignment');

        if (!submission) {
            return res.status(404).json({ error: 'Submission not found.' });
        }

        // Check if the authenticated user is the teacher of this assignment
        if (submission.assignment.teacher.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Access denied. You can only update submissions for your own assignments.' });
        }

        // Update the submission status
        submission.status = status;
        await submission.save();

        res.json({ 
            message: 'Submission status updated successfully.',
            submission 
        });

    } catch (err) {
        console.error('Error updating submission status:', err.message);
        res.status(500).json({ error: 'Server Error' });
    }
};