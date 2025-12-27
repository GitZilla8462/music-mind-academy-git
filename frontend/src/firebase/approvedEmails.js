// Approved emails management for pilot program
// src/firebase/approvedEmails.js
// Uses Realtime Database (same as sessions)
// Supports separate lists for Academy and Edu sites

import { getDatabase, ref, get, set, remove } from 'firebase/database';

// Get database reference
const database = getDatabase();

// Site types
export const SITE_TYPES = {
  ACADEMY: 'academy',
  EDU: 'edu'
};

/**
 * Get current site type based on environment
 */
export const getCurrentSiteType = () => {
  return import.meta.env.VITE_SITE_MODE === 'edu' ? SITE_TYPES.EDU : SITE_TYPES.ACADEMY;
};

/**
 * Convert email to a valid Firebase key (replace . with ,)
 * Firebase keys can't contain . # $ [ ] /
 */
const emailToKey = (email) => {
  return email.toLowerCase().trim().replace(/\./g, ',');
};

/**
 * Convert Firebase key back to email
 */
const keyToEmail = (key) => {
  return key.replace(/,/g, '.');
};

/**
 * Check if an email is approved for the pilot program
 * @param {string} email - Email to check
 * @param {string} siteType - Optional site type (defaults to current site)
 * @returns {boolean} Whether the email is approved
 */
export const isEmailApproved = async (email, siteType = null) => {
  if (!email) return false;

  // Use provided site type or detect from environment
  const site = siteType || getCurrentSiteType();

  try {
    const emailKey = emailToKey(email);
    const emailRef = ref(database, `approvedEmails/${site}/${emailKey}`);
    const snapshot = await get(emailRef);

    return snapshot.exists();
  } catch (error) {
    console.error('Error checking email approval:', error);
    return false;
  }
};

/**
 * Add an email to the approved list
 * @param {string} email - Email to approve
 * @param {string} siteType - Site type ('academy' or 'edu')
 * @param {string} notes - Optional notes about the user
 */
export const addApprovedEmail = async (email, siteType = SITE_TYPES.ACADEMY, notes = '') => {
  if (!email) {
    console.error('Email is required');
    return false;
  }

  if (!Object.values(SITE_TYPES).includes(siteType)) {
    console.error('Invalid site type. Use "academy" or "edu"');
    return false;
  }

  const emailKey = emailToKey(email);
  const emailRef = ref(database, `approvedEmails/${siteType}/${emailKey}`);

  await set(emailRef, {
    email: email.toLowerCase().trim(),
    approvedAt: Date.now(),
    notes,
    siteType
  });

  console.log(`Approved email for ${siteType}: ${email.toLowerCase().trim()}`);
  return true;
};

/**
 * Remove an email from the approved list
 * @param {string} email - Email to remove
 * @param {string} siteType - Site type ('academy' or 'edu')
 */
export const removeApprovedEmail = async (email, siteType = SITE_TYPES.ACADEMY) => {
  if (!email) {
    console.error('Email is required');
    return false;
  }

  const emailKey = emailToKey(email);
  const emailRef = ref(database, `approvedEmails/${siteType}/${emailKey}`);

  await remove(emailRef);
  console.log(`Removed email from ${siteType}: ${email.toLowerCase().trim()}`);
  return true;
};

/**
 * List all approved emails for a site
 * @param {string} siteType - Site type ('academy' or 'edu')
 * @returns {Array} List of approved emails
 */
export const listApprovedEmails = async (siteType = SITE_TYPES.ACADEMY) => {
  const emailsRef = ref(database, `approvedEmails/${siteType}`);
  const snapshot = await get(emailsRef);

  if (!snapshot.exists()) {
    console.log(`No approved emails for ${siteType} yet`);
    return [];
  }

  const emails = [];
  snapshot.forEach((child) => {
    emails.push(child.val());
  });

  console.log(`${siteType} approved emails:`);
  console.table(emails);
  return emails;
};

/**
 * List all approved emails for both sites
 * @returns {Object} Object with academy and edu arrays
 */
export const listAllApprovedEmails = async () => {
  const academy = await listApprovedEmails(SITE_TYPES.ACADEMY);
  const edu = await listApprovedEmails(SITE_TYPES.EDU);
  return { academy, edu };
};

// Expose helper functions to window for console access
if (typeof window !== 'undefined') {
  window.addApprovedEmail = async (email, siteType = 'academy', notes = '') => {
    try {
      await addApprovedEmail(email, siteType, notes);
      return `${email} approved for ${siteType}!`;
    } catch (error) {
      console.error('Failed to add email:', error);
      return `Failed: ${error.message}`;
    }
  };

  window.removeApprovedEmail = async (email, siteType = 'academy') => {
    try {
      await removeApprovedEmail(email, siteType);
      return `${email} removed from ${siteType}!`;
    } catch (error) {
      console.error('Failed to remove email:', error);
      return `Failed: ${error.message}`;
    }
  };

  window.listApprovedEmails = async (siteType = 'academy') => {
    try {
      return await listApprovedEmails(siteType);
    } catch (error) {
      console.error('Failed to list emails:', error);
      return `Failed: ${error.message}`;
    }
  };

  window.listAllApprovedEmails = async () => {
    try {
      return await listAllApprovedEmails();
    } catch (error) {
      console.error('Failed to list emails:', error);
      return `Failed: ${error.message}`;
    }
  };

  console.log('Pilot email management loaded. Available commands:');
  console.log('  await addApprovedEmail("email@example.com", "academy", "optional notes")');
  console.log('  await addApprovedEmail("email@example.com", "edu", "optional notes")');
  console.log('  await removeApprovedEmail("email@example.com", "academy")');
  console.log('  await listApprovedEmails("academy")  // or "edu"');
  console.log('  await listAllApprovedEmails()');
}
