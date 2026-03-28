/**
 * Drip Email Cron Service
 * Runs daily to send follow-up emails to approved teachers who haven't logged in.
 *
 * Safety checks:
 * 1. Only targets teachers in approvedEmails/academy who are NOT in registeredUsers
 * 2. Skips anyone who has already received that drip email (checks emailsSent)
 * 3. Requires a valid approvedAt timestamp and correct elapsed time
 * 4. 1-second delay between emails to respect Resend rate limits
 * 5. Logs every action and emails a summary to admin
 */

const { getDatabase } = require('./firebaseAdmin');
const { sendDripFollowup1Email, sendDripFollowup2Email } = require('./teacherEmailService');

const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
const FOURTEEN_DAYS = 14 * 24 * 60 * 60 * 1000;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Run the drip email processor.
 * Returns a summary of what was sent.
 */
const runDripProcessor = async () => {
  const db = getDatabase();
  if (!db) {
    console.log('[DripCron] Firebase not initialized, skipping');
    return { error: 'Firebase not initialized' };
  }

  const now = Date.now();
  const results = {
    processed: 0,
    drip2Sent: 0,
    drip2Skipped: 0,
    drip3Sent: 0,
    drip3Skipped: 0,
    alreadyLoggedIn: 0,
    errors: [],
    details: []
  };

  try {
    // 1. Get all approved emails
    const approvedSnap = await db.ref('approvedEmails/academy').once('value');
    const approved = approvedSnap.val() || {};

    // 2. Get all registered users (people who have logged in)
    const registeredSnap = await db.ref('registeredUsers').once('value');
    const registered = registeredSnap.val() || {};
    const registeredEmails = new Set(
      Object.values(registered)
        .map(u => u.email?.toLowerCase())
        .filter(Boolean)
    );

    // 3. Get all emails already sent
    const emailsSentSnap = await db.ref('emailsSent').once('value');
    const emailsSent = emailsSentSnap.val() || {};

    // 4. Get teacher outreach data (for names)
    const outreachSnap = await db.ref('teacherOutreach').once('value');
    const outreach = outreachSnap.val() || {};

    const entries = Object.entries(approved);
    console.log(`[DripCron] Processing ${entries.length} approved teachers...`);

    for (const [emailKey, data] of entries) {
      const email = data.email?.toLowerCase();
      if (!email) continue;

      // Skip if teacher has already logged in
      if (registeredEmails.has(email)) {
        results.alreadyLoggedIn++;
        continue;
      }

      const approvedAt = data.approvedAt;
      if (!approvedAt) continue;

      const daysSinceApproval = now - approvedAt;
      const daysNum = Math.round(daysSinceApproval / (24 * 60 * 60 * 1000));

      // Get name from outreach or approved data
      const outreachData = outreach[emailKey] || {};
      const name = data.name || outreachData.name || '';
      const firstName = name.split(' ')[0] || 'Teacher';

      results.processed++;

      // Check what's already been sent to this teacher
      const sent = emailsSent[emailKey] || {};

      // Skip if any email was sent in the last 7 days (avoid stacking with manual emails)
      const COOLDOWN = 7 * 24 * 60 * 60 * 1000;
      const recentlySent = Object.values(sent).some(e => e.sentAt && (now - e.sentAt) < COOLDOWN);
      if (recentlySent) {
        results.details.push(`SKIPPED (recent email) → ${email}`);
        continue;
      }

      // Skip teachers approved before March 28, 2026 — they were manually
      // emailed on that date and the drip system wasn't active before then.
      // Drip emails only apply to new teachers going forward.
      if (approvedAt < new Date('2026-03-28T00:00:00Z').getTime()) {
        continue;
      }

      try {
        // Drip 2: 7-day follow-up
        if (daysSinceApproval >= SEVEN_DAYS && !sent['drip-2']) {
          await sendDripFollowup1Email(email, firstName);
          // Track in Firebase
          await db.ref(`emailsSent/${emailKey}/drip-2`).set({
            sentAt: now,
            subject: 'Just checking in - have you had a chance to log in?',
            type: 'drip-2'
          });
          results.drip2Sent++;
          results.details.push(`drip-2 → ${email} (${firstName}, ${daysNum} days)`);
          await sleep(1000); // Rate limit
        } else if (daysSinceApproval >= SEVEN_DAYS && sent['drip-2']) {
          results.drip2Skipped++;
        }

        // Drip 3: 14-day follow-up
        if (daysSinceApproval >= FOURTEEN_DAYS && !sent['drip-3']) {
          await sendDripFollowup2Email(email, firstName);
          // Track in Firebase
          await db.ref(`emailsSent/${emailKey}/drip-3`).set({
            sentAt: now,
            subject: 'Last reminder - your pilot access is waiting',
            type: 'drip-3'
          });
          results.drip3Sent++;
          results.details.push(`drip-3 → ${email} (${firstName}, ${daysNum} days)`);
          await sleep(1000); // Rate limit
        } else if (daysSinceApproval >= FOURTEEN_DAYS && sent['drip-3']) {
          results.drip3Skipped++;
        }
      } catch (err) {
        results.errors.push({ email, error: err.message });
        console.error(`[DripCron] Error processing ${email}:`, err.message);
      }
    }

    console.log(`[DripCron] Done. Drip-2 sent: ${results.drip2Sent}, Drip-3 sent: ${results.drip3Sent}, Already logged in: ${results.alreadyLoggedIn}, Errors: ${results.errors.length}`);
    if (results.details.length > 0) {
      console.log(`[DripCron] Emails sent:\n  ${results.details.join('\n  ')}`);
    }

  } catch (err) {
    console.error('[DripCron] Fatal error:', err.message);
    results.errors.push({ email: 'SYSTEM', error: err.message });
  }

  return results;
};

module.exports = { runDripProcessor };
