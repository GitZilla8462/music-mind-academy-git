// routes/assignmentRoutes.js
const express = require('express');
const router = express.Router();
const { authenticateToken, requireStudent, requireTeacher, requireAdmin } = require('../middleware/auth');
const Assignment = require('../models/Assignment');
const User = require('../models/User');
const Class = require('../models/Class');

// Logging middleware for assignment routes
router.use((req, res, next) => {
    console.log(`[AssignmentRoutes] Received request: ${req.method} ${req.originalUrl}`);
    next();
});

// GET /api/assignments/:assignmentId - Get a specific assignment (for students, teachers, admins)
router.get('/:assignmentId', authenticateToken, async (req, res) => {
    try {
        const { assignmentId } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        console.log(`🔍 Fetching assignment ${assignmentId} for user ${userId} (${userRole})`);

        const assignment = await Assignment.findById(assignmentId)
            .populate('teacher', 'name email')
            .populate('class', 'className');

        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        // Check access permissions
        if (userRole === 'student') {
            // Students can only access assignments from their class
            const student = await User.findById(userId);
            if (!student || !student.classId || student.classId.toString() !== assignment.class._id.toString()) {
                return res.status(403).json({ message: 'Access denied - not enrolled in this class' });
            }
        } else if (userRole === 'teacher') {
            // Teachers can only access their own assignments
            if (assignment.teacher._id.toString() !== userId) {
                return res.status(403).json({ message: 'Access denied - not your assignment' });
            }
        }
        // Admins can access any assignment

        console.log(`✅ Assignment found: ${assignment.title}`);

        res.json({
            _id: assignment._id,
            title: assignment.title,
            description: assignment.description,
            project: assignment.project,
            mode: assignment.mode,
            dueDate: assignment.dueDate,
            createdAt: assignment.createdAt,
            teacher: {
                name: assignment.teacher.name,
                email: assignment.teacher.email
            },
            class: {
                name: assignment.class.className
            }
        });

    } catch (error) {
        console.error('Error fetching assignment:', error);
        res.status(500).json({ 
            message: 'Error fetching assignment',
            error: error.message 
        });
    }
});

// GET /api/assignments - Get all assignments (admin only, or filtered by teacher)
router.get('/', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        let query = {};
        
        if (userRole === 'teacher') {
            query.teacher = userId;
        } else if (userRole === 'student') {
            return res.status(403).json({ message: 'Students should use /api/students/assignments' });
        }
        // Admins get all assignments (no filter)

        const assignments = await Assignment.find(query)
            .populate('teacher', 'name email')
            .populate('class', 'className')
            .sort({ createdAt: -1 });

        res.json(assignments);

    } catch (error) {
        console.error('Error fetching assignments:', error);
        res.status(500).json({ 
            message: 'Error fetching assignments',
            error: error.message 
        });
    }
});

// POST /api/assignments - Create a new assignment (teachers and admins only)
router.post('/', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Only teachers and admins can create assignments' });
        }

        const { title, description, project, mode, dueDate, class: classId } = req.body;
        const userId = req.user.id;

        // Validate required fields
        if (!title || !description || !project || !mode || !classId) {
            return res.status(400).json({ message: 'Missing required fields: title, description, project, mode, class' });
        }

        // Verify the class exists and the teacher has access to it
        const classDoc = await Class.findById(classId);
        if (!classDoc) {
            return res.status(404).json({ message: 'Class not found' });
        }

        if (req.user.role === 'teacher' && classDoc.teacher.toString() !== userId) {
            return res.status(403).json({ message: 'You can only create assignments for your own classes' });
        }

        const assignment = new Assignment({
            title,
            description,
            project,
            mode,
            dueDate: dueDate ? new Date(dueDate) : undefined,
            teacher: userId,
            class: classId
        });

        await assignment.save();

        // Populate the response
        await assignment.populate('teacher', 'name email');
        await assignment.populate('class', 'className');

        console.log(`✅ Assignment created: ${assignment.title} by ${assignment.teacher.name}`);

        res.status(201).json({
            message: 'Assignment created successfully',
            assignment
        });

    } catch (error) {
        console.error('Error creating assignment:', error);
        res.status(500).json({ 
            message: 'Error creating assignment',
            error: error.message 
        });
    }
});

// PUT /api/assignments/:assignmentId - Update an assignment (teachers and admins only)
router.put('/:assignmentId', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Only teachers and admins can update assignments' });
        }

        const { assignmentId } = req.params;
        const { title, description, project, mode, dueDate } = req.body;
        const userId = req.user.id;

        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        // Teachers can only update their own assignments
        if (req.user.role === 'teacher' && assignment.teacher.toString() !== userId) {
            return res.status(403).json({ message: 'You can only update your own assignments' });
        }

        // Update fields
        if (title) assignment.title = title;
        if (description) assignment.description = description;
        if (project) assignment.project = project;
        if (mode) assignment.mode = mode;
        if (dueDate) assignment.dueDate = new Date(dueDate);

        await assignment.save();

        console.log(`✅ Assignment updated: ${assignment.title}`);

        res.json({
            message: 'Assignment updated successfully',
            assignment
        });

    } catch (error) {
        console.error('Error updating assignment:', error);
        res.status(500).json({ 
            message: 'Error updating assignment',
            error: error.message 
        });
    }
});

// DELETE /api/assignments/:assignmentId - Delete an assignment (teachers and admins only)
router.delete('/:assignmentId', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Only teachers and admins can delete assignments' });
        }

        const { assignmentId } = req.params;
        const userId = req.user.id;

        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        // Teachers can only delete their own assignments
        if (req.user.role === 'teacher' && assignment.teacher.toString() !== userId) {
            return res.status(403).json({ message: 'You can only delete your own assignments' });
        }

        await Assignment.findByIdAndDelete(assignmentId);

        console.log(`✅ Assignment deleted: ${assignment.title}`);

        res.json({
            message: 'Assignment deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting assignment:', error);
        res.status(500).json({ 
            message: 'Error deleting assignment',
            error: error.message 
        });
    }
});

module.exports = router;