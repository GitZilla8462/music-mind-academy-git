/**
 * Application Routes
 * Handles approve/decline of pilot applications from email links
 */

const express = require('express');
const router = express.Router();
const { getDatabase } = require('../services/firebaseAdmin');
const { sendDripWelcomeEmail, sendApplicationNotificationEmail } = require('../services/teacherEmailService');
const { updateHubSpotContact } = require('../services/hubspotService');

const ADMIN_SECRET = process.env.ADMIN_SECRET;

/**
 * POST /api/applications/submit
 * Public endpoint — saves application to Firebase, notifies admin, syncs HubSpot
 */
router.post('/submit', async (req, res) => {
  const data = req.body;

  if (!data.schoolEmail || !data.firstName || !data.lastName || !data.schoolName) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  const db = getDatabase();
  if (!db) {
    return res.status(500).json({ success: false, error: 'Firebase not configured' });
  }

  try {
    // 1. Save to Firebase
    const applicationData = {
      ...data,
      submittedAt: Date.now(),
      status: 'pending'
    };
    const newRef = db.ref('pilotApplications').push();
    await newRef.set(applicationData);
    const applicationId = newRef.key;

    // 2. Send admin notification email
    try {
      await sendApplicationNotificationEmail(applicationData, applicationId);
    } catch (emailErr) {
      console.error('[Applications] Admin notification failed:', emailErr.message);
    }

    // 3. Sync to HubSpot as "applied"
    const hubspotToken = process.env.HUBSPOT_PRIVATE_APP_TOKEN;
    if (hubspotToken) {
      try {
        await updateHubSpotContact(hubspotToken, data.schoolEmail, {
          platform_status: 'applied'
        }, `${data.firstName} ${data.lastName}`);
        console.log(`[Applications] HubSpot: ${data.schoolEmail} → applied`);
      } catch (hsErr) {
        console.error('[Applications] HubSpot sync failed:', hsErr.message);
      }
    }

    console.log(`[Applications] New application: ${data.firstName} ${data.lastName} (${data.schoolEmail})`);
    return res.json({ success: true, applicationId });
  } catch (err) {
    console.error('[Applications] Submit error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/applications/approve/:id?token=SECRET
 * One-click approve from admin notification email
 */
router.get('/approve/:id', async (req, res) => {
  const { id } = req.params;
  const { token } = req.query;

  if (!ADMIN_SECRET || token !== ADMIN_SECRET) {
    return res.status(403).send(htmlPage('Access Denied', 'Invalid or missing token.', 'red'));
  }

  const db = getDatabase();
  if (!db) {
    return res.status(500).send(htmlPage('Error', 'Firebase Admin not configured on server.', 'red'));
  }

  try {
    // Get the application data
    const appSnapshot = await db.ref(`pilotApplications/${id}`).once('value');
    const application = appSnapshot.val();

    if (!application) {
      return res.status(404).send(htmlPage('Not Found', 'Application not found.', 'red'));
    }

    if (application.status === 'approved') {
      return res.send(htmlPage('Already Approved', `${application.firstName} ${application.lastName} (${application.schoolEmail}) was already approved.`, 'blue'));
    }

    const schoolEmail = application.schoolEmail.toLowerCase();
    const emailKey = schoolEmail.replace(/\./g, ',');
    const now = Date.now();

    // 1. Update application status
    await db.ref(`pilotApplications/${id}`).update({
      status: 'approved',
      approvedAt: now
    });

    // 2. Add to approvedEmails/academy/
    await db.ref(`approvedEmails/academy/${emailKey}`).set({
      email: schoolEmail,
      approvedAt: now,
      name: `${application.firstName} ${application.lastName}`,
      school: application.schoolName,
      source: 'pilot-application'
    });

    // 3. Add to teacherOutreach so admin page shows them
    await db.ref(`teacherOutreach/${emailKey}`).update({
      email: schoolEmail,
      name: `${application.firstName} ${application.lastName}`,
      school: application.schoolName,
      approvedAt: now,
      source: 'pilot-application'
    });

    // 4. Mark drip-1 (welcome) as about to be sent
    await db.ref(`emailsSent/${emailKey}/drip-1`).set({ sentAt: now });

    // 5. Send welcome email (drip-1)
    const firstName = application.firstName || 'Teacher';
    const displayName = `${application.firstName} ${application.lastName}`;
    try {
      await sendDripWelcomeEmail(application.personalEmail || schoolEmail, firstName);
      await db.ref(`teacherOutreach/${emailKey}`).update({
        dripWelcomeSent: true,
        dripWelcomeSentAt: now
      });
      console.log(`[Applications] Approved ${schoolEmail}, welcome email sent`);
    } catch (emailErr) {
      console.error(`[Applications] Approved ${schoolEmail} but welcome email failed:`, emailErr.message);
    }

    // 6. Sync to HubSpot
    const hubspotToken = process.env.HUBSPOT_PRIVATE_APP_TOKEN;
    if (hubspotToken) {
      try {
        const hsResult = await updateHubSpotContact(hubspotToken, schoolEmail, {
          platform_status: 'approved'
        }, displayName);
        if (hsResult.success) {
          console.log(`[Applications] HubSpot: ${schoolEmail} → approved (${hsResult.action})`);
        }
      } catch (hsErr) {
        console.error(`[Applications] HubSpot sync failed for ${schoolEmail}:`, hsErr.message);
      }
    }

    return res.send(htmlPage(
      'Approved!',
      `<strong>${application.firstName} ${application.lastName}</strong> (${schoolEmail}) has been approved.<br><br>Welcome email sent. They can now log in at musicmindacademy.com.`,
      'green'
    ));
  } catch (err) {
    console.error('[Applications] Approve error:', err);
    return res.status(500).send(htmlPage('Error', `Something went wrong: ${err.message}`, 'red'));
  }
});

/**
 * GET /api/applications/decline/:id?token=SECRET
 * One-click decline from admin notification email
 */
router.get('/decline/:id', async (req, res) => {
  const { id } = req.params;
  const { token } = req.query;

  if (!ADMIN_SECRET || token !== ADMIN_SECRET) {
    return res.status(403).send(htmlPage('Access Denied', 'Invalid or missing token.', 'red'));
  }

  const db = getDatabase();
  if (!db) {
    return res.status(500).send(htmlPage('Error', 'Firebase Admin not configured on server.', 'red'));
  }

  try {
    const appSnapshot = await db.ref(`pilotApplications/${id}`).once('value');
    const application = appSnapshot.val();

    if (!application) {
      return res.status(404).send(htmlPage('Not Found', 'Application not found.', 'red'));
    }

    if (application.status === 'rejected') {
      return res.send(htmlPage('Already Declined', `${application.firstName} ${application.lastName} was already declined.`, 'gray'));
    }

    await db.ref(`pilotApplications/${id}`).update({
      status: 'rejected',
      rejectedAt: Date.now()
    });

    return res.send(htmlPage(
      'Declined',
      `${application.firstName} ${application.lastName} (${application.schoolEmail}) has been declined.`,
      'gray'
    ));
  } catch (err) {
    console.error('[Applications] Decline error:', err);
    return res.status(500).send(htmlPage('Error', `Something went wrong: ${err.message}`, 'red'));
  }
});

/**
 * GET /api/applications/count
 * Debug endpoint — check how many applications exist in Firebase
 */
router.get('/count', async (req, res) => {
  const db = getDatabase();
  if (!db) return res.status(500).json({ error: 'Firebase not configured' });
  try {
    const snap = await db.ref('pilotApplications').once('value');
    const count = snap.exists() ? Object.keys(snap.val()).length : 0;
    return res.json({ count, exists: snap.exists() });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/applications/bulk-import
 * Import applications from Google Forms (TSV paste)
 */
router.post('/bulk-import', async (req, res) => {
  const { applications } = req.body;

  if (!Array.isArray(applications) || applications.length === 0) {
    return res.status(400).json({ success: false, error: 'No applications provided' });
  }

  const db = getDatabase();
  if (!db) {
    return res.status(500).json({ success: false, error: 'Firebase not configured' });
  }

  try {
    // 1. Load existing pilotApplications to detect duplicates
    const existingSnap = await db.ref('pilotApplications').once('value');
    const existingEmails = new Set();
    if (existingSnap.exists()) {
      Object.values(existingSnap.val()).forEach(app => {
        if (app.schoolEmail) {
          existingEmails.add(app.schoolEmail.toLowerCase().trim());
        }
      });
    }

    // 2. Load approvedEmails/academy to determine status
    const approvedSnap = await db.ref('approvedEmails/academy').once('value');
    const approvedEmails = new Set();
    if (approvedSnap.exists()) {
      Object.values(approvedSnap.val()).forEach(entry => {
        if (entry.email) {
          approvedEmails.add(entry.email.toLowerCase().trim());
        }
      });
    }

    let imported = 0;
    let skipped = 0;
    const errors = [];

    for (const app of applications) {
      const email = (app.schoolEmail || '').toLowerCase().trim();
      if (!email) {
        skipped++;
        continue;
      }

      // Skip duplicates
      if (existingEmails.has(email)) {
        skipped++;
        continue;
      }

      // Determine status
      const isApproved = approvedEmails.has(email);

      const applicationData = {
        firstName: app.firstName || '',
        lastName: app.lastName || '',
        schoolEmail: email,
        schoolName: app.schoolName || '',
        personalEmail: app.personalEmail || '',
        city: app.city || '',
        state: app.state || '',
        grades: app.grades || [],
        devices: app.devices || [],
        classSize: app.classSize || '',
        biggestChallenge: app.biggestChallenge || '',
        whyPilot: app.whyPilot || '',
        toolsUsed: app.toolsUsed || [],
        canCommit: app.canCommit || '',
        anythingElse: app.anythingElse || '',
        submittedAt: app.submittedAt || Date.now(),
        status: isApproved ? 'approved' : 'imported',
        source: 'google-form'
      };

      try {
        const newRef = db.ref('pilotApplications').push();
        await newRef.set(applicationData);
        existingEmails.add(email); // prevent duplicates within the same batch
        imported++;
      } catch (writeErr) {
        errors.push(`${email}: ${writeErr.message}`);
      }
    }

    console.log(`[Applications] Bulk import: ${imported} imported, ${skipped} skipped, ${errors.length} errors`);
    return res.json({ success: true, imported, skipped, errors });
  } catch (err) {
    console.error('[Applications] Bulk import error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Simple HTML page response for email link clicks
 */
function htmlPage(title, message, color) {
  const colors = {
    green: { bg: '#059669', light: '#ecfdf5' },
    red: { bg: '#dc2626', light: '#fef2f2' },
    blue: { bg: '#2563eb', light: '#eff6ff' },
    gray: { bg: '#6b7280', light: '#f9fafb' }
  };
  const c = colors[color] || colors.gray;

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title} - Music Mind Academy</title></head>
<body style="margin:0;padding:40px 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:${c.light};display:flex;justify-content:center;align-items:center;min-height:100vh;">
<div style="max-width:400px;text-align:center;background:white;padding:40px;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,0.1);">
<div style="width:64px;height:64px;background:${c.bg};border-radius:50%;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;">
<span style="color:white;font-size:28px;">${color === 'green' ? '&#10003;' : color === 'red' ? '&#10007;' : '&#8226;'}</span>
</div>
<h1 style="margin:0 0 12px;font-size:24px;color:#1e293b;">${title}</h1>
<p style="color:#64748b;line-height:1.6;">${message}</p>
<p style="color:#94a3b8;font-size:13px;margin-top:24px;">Music Mind Academy</p>
</div>
</body>
</html>`;
}

module.exports = router;
