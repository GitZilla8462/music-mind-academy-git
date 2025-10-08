const express = require('express');
const router = express.Router();
const { getMusicResourcesAssignments } = require('../controllers/musicresourcesController');

// Public route - no authentication required
router.get('/assignments', getMusicResourcesAssignments);

module.exports = router;