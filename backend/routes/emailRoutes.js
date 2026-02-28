const express = require('express');
const router = express.Router();
const { sendMidPilotSurveyEmail, sendFinalPilotSurveyEmail } = require('../services/teacherEmailService');

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

module.exports = router;
