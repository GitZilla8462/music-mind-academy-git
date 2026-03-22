const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const Article = require('../models/Article');
const { verifyToken } = require('../services/articleApprovalService');

// Public endpoints
router.get('/feed', newsController.getFeed);
router.get('/featured', newsController.getFeatured);
router.get('/search', newsController.searchArticles);
router.get('/article/:id', newsController.getArticle);
router.post('/flag/:id', newsController.flagArticle);

// Email approval endpoints (token-based, no login required)
router.get('/preview/:id', async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).send('Article not found');
    if (!verifyToken(req.params.id, 'approve', req.query.token)) {
      return res.status(403).send('Invalid token');
    }

    const approveUrl = `/api/news/approve/${article._id}?token=${req.query.token}`;
    const skipToken = req.query.token; // reuse for simplicity
    const genre = article.genres?.length ? article.genres.join(', ') : 'general';

    res.send(`<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${article.generated_headline}</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 640px; margin: 0 auto; padding: 24px; background: #f9fafb; color: #111827; }
  .card { background: white; border-radius: 12px; padding: 32px; border: 1px solid #e5e7eb; }
  h1 { font-size: 22px; margin: 0 0 8px; line-height: 1.3; }
  .meta { font-size: 13px; color: #6b7280; margin-bottom: 20px; }
  .label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; margin: 20px 0 6px; }
  .body { font-size: 15px; line-height: 1.7; color: #374151; white-space: pre-wrap; }
  .discuss { background: #f3f4f6; border-radius: 8px; padding: 16px; margin-top: 20px; }
  .discuss p { margin: 0; font-size: 14px; color: #374151; }
  .actions { margin-top: 24px; display: flex; gap: 12px; }
  .btn { display: inline-block; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600; text-align: center; }
  .btn-approve { background: #059669; color: white; }
  .btn-skip { background: #dc2626; color: white; }
</style></head>
<body>
  <div class="card">
    <h1>${article.generated_headline}</h1>
    <div class="meta">${article.source_name || ''} &middot; ${genre} &middot; ${article.published_at ? new Date(article.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : ''}</div>

    <div class="label">Standard (Grade 7-8)</div>
    <div class="body">${article.body_standard || ''}</div>

    <div class="label" style="margin-top: 28px;">Simplified (Grade 6-7)</div>
    <div class="body">${article.body_simplified || ''}</div>

    ${article.discussion_question ? `
    <div class="discuss">
      <div class="label" style="margin: 0 0 4px;">Discussion Question</div>
      <p>${article.discussion_question}</p>
    </div>` : ''}

    <div class="actions">
      <a href="${approveUrl}" class="btn btn-approve">Approve for Students</a>
      <a href="/api/news/skip/${article._id}?token=${skipToken}" class="btn btn-skip">Skip</a>
    </div>
  </div>
</body></html>`);
  } catch (error) {
    res.status(500).send('Error loading article');
  }
});

router.get('/approve/:id', async (req, res) => {
  try {
    if (!verifyToken(req.params.id, 'approve', req.query.token)) {
      return res.status(403).send('Invalid token');
    }
    const article = await Article.findByIdAndUpdate(req.params.id, { approved: true }, { new: true });
    if (!article) return res.status(404).send('Article not found');

    res.send(`<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<style>body { font-family: -apple-system, sans-serif; max-width: 480px; margin: 80px auto; text-align: center; }</style></head>
<body>
  <div style="font-size: 48px; margin-bottom: 16px;">&#10003;</div>
  <h2 style="color: #059669;">Approved</h2>
  <p style="color: #6b7280;">"${article.generated_headline}" is now visible to students.</p>
</body></html>`);
  } catch (error) {
    res.status(500).send('Error approving article');
  }
});

router.get('/skip/:id', async (req, res) => {
  try {
    if (!verifyToken(req.params.id, 'skip', req.query.token)) {
      return res.status(403).send('Invalid token');
    }
    const article = await Article.findByIdAndUpdate(req.params.id, { approved: false }, { new: true });
    if (!article) return res.status(404).send('Article not found');

    res.send(`<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<style>body { font-family: -apple-system, sans-serif; max-width: 480px; margin: 80px auto; text-align: center; }</style></head>
<body>
  <div style="font-size: 48px; margin-bottom: 16px;">&#10005;</div>
  <h2 style="color: #dc2626;">Skipped</h2>
  <p style="color: #6b7280;">"${article.generated_headline}" will not be shown to students.</p>
</body></html>`);
  } catch (error) {
    res.status(500).send('Error skipping article');
  }
});

// Admin endpoints
router.get('/admin', authenticateToken, requireAdmin, newsController.adminGetAll);
router.patch('/admin/:id', authenticateToken, requireAdmin, newsController.adminUpdateArticle);

module.exports = router;
