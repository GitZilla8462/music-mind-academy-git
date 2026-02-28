/**
 * Drip Email Processor
 * Runs on admin page load to auto-send follow-up emails
 * to approved teachers who haven't logged in yet.
 *
 * Logic:
 * - For each approved email NOT in registered users:
 *   - If 7+ days since approval and drip-2 not sent → send drip-2
 *   - If 14+ days since approval and drip-3 not sent → send drip-3
 * - Skips anyone who has already logged in (exists in registeredUsers)
 */

import { sendTeacherEmail, hasEmailBeenSent } from './emailTracking';

const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
const FOURTEEN_DAYS = 14 * 24 * 60 * 60 * 1000;

/**
 * Process drip emails for all approved teachers
 *
 * @param {Object} approvedEmails - Map of emailKey → { email, approvedAt, name, ... }
 * @param {Set} registeredEmails - Set of lowercase emails that have logged in
 * @param {Object} outreach - Map of emailKey → { dripWelcomeSent, dripFollowup1Sent, ... }
 * @returns {Object} Summary of actions taken
 */
export const processDripEmails = async (approvedEmails, registeredEmails, outreach) => {
  const results = {
    processed: 0,
    drip2Sent: 0,
    drip3Sent: 0,
    skipped: 0,
    errors: []
  };

  const now = Date.now();
  const entries = Object.entries(approvedEmails || {});

  for (const [emailKey, data] of entries) {
    const email = data.email;
    if (!email) continue;

    // Skip if teacher has already logged in
    if (registeredEmails.has(email.toLowerCase())) {
      results.skipped++;
      continue;
    }

    const approvedAt = data.approvedAt;
    if (!approvedAt) {
      results.skipped++;
      continue;
    }

    const daysSinceApproval = now - approvedAt;
    const name = data.name || '';
    const firstName = name.split(' ')[0] || 'Teacher';

    results.processed++;

    try {
      // Check drip-2 (7 days)
      if (daysSinceApproval >= SEVEN_DAYS) {
        const drip2Sent = await hasEmailBeenSent(email, 'drip-2');
        if (!drip2Sent) {
          const result = await sendTeacherEmail(email, firstName, 'drip-2', { name: firstName });
          if (result.success) results.drip2Sent++;
        }
      }

      // Check drip-3 (14 days)
      if (daysSinceApproval >= FOURTEEN_DAYS) {
        const drip3Sent = await hasEmailBeenSent(email, 'drip-3');
        if (!drip3Sent) {
          const result = await sendTeacherEmail(email, firstName, 'drip-3', { name: firstName });
          if (result.success) results.drip3Sent++;
        }
      }
    } catch (err) {
      results.errors.push({ email, error: err.message });
    }
  }

  return results;
};
