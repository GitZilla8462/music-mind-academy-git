const express = require('express');
const router = express.Router();
const EmailTemplate = require('../models/EmailTemplate');
const {
  sendMidPilotSurveyEmail,
  sendFinalPilotSurveyEmail,
  sendApplicationNotificationEmail,
  sendDripWelcomeEmail,
  sendDripFollowup1Email,
  sendDripFollowup2Email,
  getEmailPreview,
  getDefaultTemplates
} = require('../services/teacherEmailService');

/**
 * POST /api/email/survey-l3
 * Send mid-pilot survey email after Lesson 3
 */
router.post('/survey-l3', async (req, res) => {
  const { email, displayName } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const result = await sendMidPilotSurveyEmail(email, displayName);
    return res.json(result);
  } catch (error) {
    console.error('[EmailRoute] survey-l3 error:', error.message);
    return res.status(200).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/email/survey-l5
 * Send final pilot survey email after Lesson 5
 */
router.post('/survey-l5', async (req, res) => {
  const { email, displayName } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const result = await sendFinalPilotSurveyEmail(email, displayName);
    return res.json(result);
  } catch (error) {
    console.error('[EmailRoute] survey-l5 error:', error.message);
    return res.status(200).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/email/application-notify
 * Send admin notification email for new pilot application
 */
router.post('/application-notify', async (req, res) => {
  const { applicationId, ...applicationData } = req.body;

  if (!applicationId || !applicationData.schoolEmail) {
    return res.status(400).json({ error: 'applicationId and schoolEmail are required' });
  }

  try {
    const result = await sendApplicationNotificationEmail(applicationData, applicationId);
    return res.json(result);
  } catch (error) {
    console.error('[EmailRoute] application-notify error:', error.message);
    return res.status(200).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/email/drip-1
 * Send welcome email (drip 1) to approved teacher
 */
router.post('/drip-1', async (req, res) => {
  const { email, name } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const result = await sendDripWelcomeEmail(email, name);
    return res.json(result);
  } catch (error) {
    console.error('[EmailRoute] drip-1 error:', error.message);
    return res.status(200).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/email/drip-2
 * Send follow-up email (drip 2) - 7 days after approval, no login
 */
router.post('/drip-2', async (req, res) => {
  const { email, name } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const result = await sendDripFollowup1Email(email, name);
    return res.json(result);
  } catch (error) {
    console.error('[EmailRoute] drip-2 error:', error.message);
    return res.status(200).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/email/drip-3
 * Send final reminder email (drip 3) - 14 days after approval, no login
 */
router.post('/drip-3', async (req, res) => {
  const { email, name } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const result = await sendDripFollowup2Email(email, name);
    return res.json(result);
  } catch (error) {
    console.error('[EmailRoute] drip-3 error:', error.message);
    return res.status(200).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/email/preview/:type
 * Get rendered HTML preview for an email template (no sending)
 * Returns custom template from MongoDB if it exists, otherwise default
 */
router.get('/preview/:type', async (req, res) => {
  const { type } = req.params;

  try {
    // Check for custom template in MongoDB
    const custom = await EmailTemplate.findOne({ type });
    if (custom) {
      return res.json({
        subject: custom.subject,
        html: custom.htmlContent,
        from: getEmailPreview(type)?.from || 'Music Mind Academy',
        isCustom: true,
        updatedAt: custom.updatedAt,
        updatedBy: custom.updatedBy
      });
    }
  } catch (err) {
    console.error('[EmailRoute] MongoDB lookup failed, using default:', err.message);
  }

  // Fall back to default
  const preview = getEmailPreview(type);
  if (!preview) {
    return res.status(404).json({ error: `Unknown email type: ${type}` });
  }

  return res.json({ ...preview, isCustom: false });
});

/**
 * GET /api/email/templates
 * List all email templates (custom + defaults merged)
 */
router.get('/templates', async (req, res) => {
  try {
    const defaults = getDefaultTemplates();
    const customs = await EmailTemplate.find({});
    const customMap = {};
    customs.forEach(c => { customMap[c.type] = c; });

    const templates = Object.entries(defaults).map(([type, def]) => {
      const custom = customMap[type];
      return {
        type,
        subject: custom ? custom.subject : def.subject,
        htmlContent: custom ? custom.htmlContent : def.html,
        from: def.from,
        isCustom: !!custom,
        updatedAt: custom?.updatedAt || null,
        updatedBy: custom?.updatedBy || null
      };
    });

    return res.json(templates);
  } catch (err) {
    console.error('[EmailRoute] Failed to list templates:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/email/templates/:type
 * Save a custom email template (upsert)
 */
router.put('/templates/:type', async (req, res) => {
  const { type } = req.params;
  const { subject, htmlContent, updatedBy } = req.body;

  const validTypes = ['drip-1', 'drip-2', 'drip-3', 'survey-l3', 'survey-l5', 'application-notify'];
  if (!validTypes.includes(type)) {
    return res.status(400).json({ error: `Invalid template type: ${type}` });
  }
  if (!subject || !htmlContent) {
    return res.status(400).json({ error: 'subject and htmlContent are required' });
  }

  try {
    const template = await EmailTemplate.findOneAndUpdate(
      { type },
      { subject, htmlContent, updatedBy, updatedAt: Date.now() },
      { upsert: true, new: true }
    );
    return res.json({ success: true, template });
  } catch (err) {
    console.error('[EmailRoute] Failed to save template:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/email/templates/:type/reset
 * Delete custom template, reverting to default
 */
router.post('/templates/:type/reset', async (req, res) => {
  const { type } = req.params;
  try {
    await EmailTemplate.deleteOne({ type });
    return res.json({ success: true, message: `Reset ${type} to default` });
  } catch (err) {
    console.error('[EmailRoute] Failed to reset template:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
