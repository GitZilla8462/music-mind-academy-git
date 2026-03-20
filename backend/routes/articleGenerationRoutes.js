const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { runDailyPipeline } = require('../services/articleGenerationService');

// Store last run results in memory (also logged to console)
let lastRunResults = null;

// POST /api/admin/news/generate — manually trigger article generation
router.post('/generate', authenticateToken, requireAdmin, async (req, res) => {
  try {
    console.log('🗞️ Manual article generation triggered by admin');
    const results = await runDailyPipeline();
    lastRunResults = results;
    res.json({ success: true, data: results, message: `Generated ${results.generated} articles` });
  } catch (error) {
    console.error('Article generation failed:', error);
    res.status(500).json({ success: false, message: 'Generation failed', error: error.message });
  }
});

// GET /api/admin/news/generation-log — get last run results
router.get('/generation-log', authenticateToken, requireAdmin, async (req, res) => {
  res.json({ success: true, data: lastRunResults || { message: 'No generation has been run yet' } });
});

module.exports = router;
