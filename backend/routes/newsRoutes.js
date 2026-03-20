const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Public endpoints
router.get('/feed', newsController.getFeed);
router.get('/featured', newsController.getFeatured);
router.get('/search', newsController.searchArticles);
router.get('/article/:id', newsController.getArticle);
router.post('/flag/:id', newsController.flagArticle);

// Admin endpoints
router.get('/admin', authenticateToken, requireAdmin, newsController.adminGetAll);
router.patch('/admin/:id', authenticateToken, requireAdmin, newsController.adminUpdateArticle);

module.exports = router;
