// Email tracking utility for automated survey emails
// Prevents duplicate sends and updates teacherOutreach in Firebase

import { getDatabase, ref, get, set, update } from 'firebase/database';

const database = getDatabase();

/**
 * Convert email to Firebase-safe key
 * Matches PilotAdminPage pattern: lowercase, dots → commas
 */
const emailToKey = (email) => email.toLowerCase().replace(/\./g, ',');

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
const markEmailSent = async (email, type) => {
  const emailKey = emailToKey(email);
  await set(ref(database, `emailsSent/${emailKey}/${type}`), {
    sentAt: Date.now()
  });
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
  }

  await update(outreachRef, updates);
};

/**
 * Send a teacher email (with duplicate prevention).
 * Checks Firebase first, calls backend API, then marks as sent.
 *
 * @param {string} email - Teacher email
 * @param {string} displayName - Teacher display name
 * @param {'survey-l3'|'survey-l5'} type - Email type
 */
export const sendTeacherEmail = async (email, displayName, type) => {
  // Check if already sent
  const alreadySent = await hasEmailBeenSent(email, type);
  if (alreadySent) {
    console.log(`[EmailTracking] ${type} already sent to ${email}, skipping`);
    return { skipped: true };
  }

  // Call backend to send the email
  const endpoint = type === 'survey-l3' ? '/api/email/survey-l3' : '/api/email/survey-l5';

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, displayName })
  });

  const result = await res.json();

  if (result.success) {
    // Mark as sent and update admin outreach
    await markEmailSent(email, type);
    await updateOutreachStatus(email, type);
    console.log(`[EmailTracking] ${type} sent and tracked for ${email}`);
  } else {
    console.warn(`[EmailTracking] ${type} send failed for ${email}:`, result.error);
  }

  return result;
};
