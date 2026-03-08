// Email tracking utility for automated survey and drip emails
// Prevents duplicate sends and updates teacherOutreach in Firebase

import { getDatabase, ref, get, set, update } from 'firebase/database';

const database = getDatabase();

/**
 * Convert email to Firebase-safe key
 * Matches PilotAdminPage pattern: lowercase, dots → commas
 */
export const emailToKey = (email) => email.toLowerCase().replace(/\./g, ',');

/**
 * Check if an email of this type has already been sent to this teacher
 */
export const hasEmailBeenSent = async (email, type) => {
  const emailKey = emailToKey(email);
  const snapshot = await get(ref(database, `emailsSent/${emailKey}/${type}`));
  return snapshot.exists();
};

/**
 * Mark an email as sent in Firebase
 */
export const markEmailSent = async (email, type) => {
  const emailKey = emailToKey(email);
  await set(ref(database, `emailsSent/${emailKey}/${type}`), {
    sentAt: Date.now()
  });
};

/**
 * Endpoint map for all email types
 */
const ENDPOINT_MAP = {
  'survey-l3': '/api/email/survey-l3',
  'survey-l5': '/api/email/survey-l5',
  'unit-complete': '/api/email/unit-complete',
  'drip-1': '/api/email/drip-1',
  'drip-2': '/api/email/drip-2',
  'drip-3': '/api/email/drip-3'
};

/**
 * Update the teacherOutreach node so the admin page reflects email status
 */
const updateOutreachStatus = async (email, type) => {
  const emailKey = emailToKey(email);
  const outreachRef = ref(database, `teacherOutreach/${emailKey}`);

  const updates = { email };

  if (type === 'survey-l3') {
    updates.emailedL3 = true;
    updates.emailedL3At = Date.now();
  } else if (type === 'survey-l5') {
    updates.emailedDone = true;
    updates.emailedDoneAt = Date.now();
  } else if (type === 'drip-1') {
    updates.dripWelcomeSent = true;
    updates.dripWelcomeSentAt = Date.now();
  } else if (type === 'drip-2') {
    updates.dripFollowup1Sent = true;
    updates.dripFollowup1SentAt = Date.now();
  } else if (type === 'drip-3') {
    updates.dripFollowup2Sent = true;
    updates.dripFollowup2SentAt = Date.now();
  }

  await update(outreachRef, updates);
};

/**
 * Send a teacher email (with duplicate prevention).
 * Checks Firebase first, calls backend API, then marks as sent.
 *
 * @param {string} email - Teacher email
 * @param {string} displayName - Teacher display name
 * @param {'survey-l3'|'survey-l5'|'drip-1'|'drip-2'|'drip-3'} type - Email type
 * @param {object} extraData - Additional data to pass to the API (e.g., { name })
 */
export const sendTeacherEmail = async (email, displayName, type, extraData = {}) => {
  // Check if already sent
  const alreadySent = await hasEmailBeenSent(email, type);
  if (alreadySent) {
    console.log(`[EmailTracking] ${type} already sent to ${email}, skipping`);
    return { skipped: true };
  }

  // Call backend to send the email
  // unit-complete-u2, unit-complete-u3 etc. all map to the same endpoint
  const endpoint = ENDPOINT_MAP[type] || (type.startsWith('unit-complete') ? ENDPOINT_MAP['unit-complete'] : null);
  if (!endpoint) {
    console.error(`[EmailTracking] Unknown email type: ${type}`);
    return { success: false, error: `Unknown type: ${type}` };
  }

  const body = type.startsWith('drip-')
    ? { email, name: extraData.name || displayName, ...extraData }
    : { email, displayName, ...extraData };

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  const result = await res.json();

  if (result.success) {
    // Mark as sent and update admin outreach
    await markEmailSent(email, type);
    await updateOutreachStatus(email, type);

    // Sync drip dates to HubSpot
    if (type.startsWith('drip-')) {
      try {
        const now = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const dripProperty = type === 'drip-1' ? 'drip_1_sent' : type === 'drip-2' ? 'drip_2_sent' : 'drip_3_sent';
        await fetch('/api/hubspot/update-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, status: 'approved', properties: { [dripProperty]: now } })
        });
      } catch (hsErr) {
        console.warn(`[EmailTracking] HubSpot drip sync failed for ${email}:`, hsErr.message);
      }
    }

    console.log(`[EmailTracking] ${type} sent and tracked for ${email}`);
  } else {
    console.warn(`[EmailTracking] ${type} send failed for ${email}:`, result.error);
  }

  return result;
};
