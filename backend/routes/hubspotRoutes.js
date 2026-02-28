const express = require('express');
const router = express.Router();

const HUBSPOT_API = 'https://api.hubapi.com/crm/v3/objects/contacts';

/**
 * Helper: Update a HubSpot contact by email. Creates if not found.
 */
async function updateHubSpotContact(token, email, properties, displayName) {
  // Try to update existing contact
  const updateRes = await fetch(
    `${HUBSPOT_API}/${encodeURIComponent(email)}?idProperty=email`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ properties })
    }
  );

  if (updateRes.ok) {
    return { success: true, action: 'updated', data: await updateRes.json() };
  }

  // If not found, create
  if (updateRes.status === 404) {
    const nameParts = (displayName || '').split(' ');
    const createProps = {
      email,
      firstname: nameParts[0] || '',
      lastname: nameParts.slice(1).join(' ') || '',
      ...properties
    };

    const createRes = await fetch(HUBSPOT_API, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ properties: createProps })
    });

    if (createRes.ok) {
      return { success: true, action: 'created', data: await createRes.json() };
    }
    return { success: false, error: await createRes.text() };
  }

  return { success: false, error: await updateRes.text() };
}

/**
 * POST /api/hubspot/update-status
 *
 * Called when a teacher logs in for the first time.
 * Sets platform_status = "registered".
 */
router.post('/update-status', async (req, res) => {
  const { email, displayName } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const token = process.env.HUBSPOT_PRIVATE_APP_TOKEN;
  if (!token) {
    console.warn('⚠️ HUBSPOT_PRIVATE_APP_TOKEN not set');
    return res.status(200).json({ message: 'HubSpot not configured' });
  }

  try {
    const result = await updateHubSpotContact(token, email, { platform_status: 'registered' }, displayName);
    if (result.success) {
      console.log(`✅ HubSpot: ${email} → registered (${result.action}, ID: ${result.data.id})`);
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
    const result = await updateHubSpotContact(token, email, {
      lesson_reached: String(lessonReached),
      platform_status: 'active'
    });
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
