const express = require('express');
const router = express.Router();
const { updateHubSpotContact } = require('../services/hubspotService');

/**
 * POST /api/hubspot/update-status
 *
 * Called when a teacher logs in for the first time.
 * Sets platform_status = "registered".
 */
router.post('/update-status', async (req, res) => {
  const { email, displayName, status, properties } = req.body;
  const platformStatus = status || 'registered';

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const token = process.env.HUBSPOT_PRIVATE_APP_TOKEN;
  if (!token) {
    console.warn('⚠️ HUBSPOT_PRIVATE_APP_TOKEN not set');
    return res.status(200).json({ message: 'HubSpot not configured' });
  }

  try {
    const allProperties = { platform_status: platformStatus, ...(properties || {}) };
    const result = await updateHubSpotContact(token, email, allProperties, displayName);
    if (result.success) {
      console.log(`✅ HubSpot: ${email} → ${platformStatus} (${result.action}, ID: ${result.data.id})`);
    } else {
      console.error(`❌ HubSpot: ${email} failed:`, result.error);
    }
    return res.json(result);
  } catch (error) {
    console.error('❌ HubSpot error:', error.message);
    return res.status(200).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/hubspot/update-lesson
 *
 * Called when a teacher finishes a real class session.
 * Updates lesson_reached and sets platform_status = "active".
 */
router.post('/update-lesson', async (req, res) => {
  const { email, lessonReached, unit } = req.body;

  if (!email || !lessonReached) {
    return res.status(400).json({ error: 'Email and lessonReached are required' });
  }

  const token = process.env.HUBSPOT_PRIVATE_APP_TOKEN;
  if (!token) {
    return res.status(200).json({ message: 'HubSpot not configured' });
  }

  try {
    const properties = {
      lesson_reached: String(lessonReached),
      platform_status: 'active'
    };

    // Track when survey emails are triggered
    const now = new Date().toISOString().split('T')[0]; // YYYY-MM-DD for HubSpot date fields
    if (Number(lessonReached) === 3) {
      properties.l3_survey_sent = now;
    }
    if (Number(lessonReached) === 5) {
      properties.l5_survey_sent = now;
    }

    const result = await updateHubSpotContact(token, email, properties);
    if (result.success) {
      console.log(`✅ HubSpot: ${email} → lesson ${lessonReached} unit ${unit || '?'} (ID: ${result.data.id})`);
    }
    return res.json(result);
  } catch (error) {
    console.error('❌ HubSpot lesson error:', error.message);
    return res.status(200).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/hubspot/batch-sync
 *
 * Called from the admin page "Sync to HubSpot" button.
 * Receives an array of teacher progress data and batch-updates HubSpot.
 */
router.post('/batch-sync', async (req, res) => {
  const { teachers } = req.body;

  if (!teachers || !Array.isArray(teachers)) {
    return res.status(400).json({ error: 'teachers array is required' });
  }

  const token = process.env.HUBSPOT_PRIVATE_APP_TOKEN;
  if (!token) {
    return res.status(200).json({ message: 'HubSpot not configured' });
  }

  const results = { updated: 0, created: 0, failed: 0, errors: [] };

  for (const teacher of teachers) {
    try {
      const properties = {
        platform_status: teacher.lessonReached > 0 ? 'active' : 'registered'
      };
      if (teacher.lessonReached > 0) {
        properties.lesson_reached = String(teacher.lessonReached);
      }

      const result = await updateHubSpotContact(token, teacher.email, properties, teacher.displayName);

      if (result.success) {
        if (result.action === 'updated') results.updated++;
        else results.created++;
        console.log(`✅ HubSpot sync: ${teacher.email} → lesson ${teacher.lessonReached} (${result.action})`);
      } else {
        results.failed++;
        results.errors.push({ email: teacher.email, error: result.error });
      }

      // Small delay to respect HubSpot rate limits (100 req / 10 sec)
      await new Promise(resolve => setTimeout(resolve, 120));
    } catch (error) {
      results.failed++;
      results.errors.push({ email: teacher.email, error: error.message });
    }
  }

  console.log(`✅ HubSpot batch sync complete: ${results.updated} updated, ${results.created} created, ${results.failed} failed`);
  return res.json(results);
});

module.exports = router;
