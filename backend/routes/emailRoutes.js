const express = require('express');
const router = express.Router();
const {
  sendMidPilotSurveyEmail,
  sendFinalPilotSurveyEmail,
  sendApplicationNotificationEmail,
  sendDripWelcomeEmail,
  sendDripFollowup1Email,
  sendDripFollowup2Email
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

module.exports = router;
