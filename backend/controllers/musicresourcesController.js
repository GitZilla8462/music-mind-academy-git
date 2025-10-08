const Assignment = require('../models/Assignment');

// Get all assignments for music resources (no auth required)
exports.getMusicResourcesAssignments = async (req, res) => {
    try {
        const assignments = await Assignment.find()
            .sort({ createdAt: -1 });
        
        res.json(assignments);
    } catch (error) {
        console.error('Error fetching music resources assignments:', error);
        res.status(500).json({ error: 'Failed to fetch assignments' });
    }
};