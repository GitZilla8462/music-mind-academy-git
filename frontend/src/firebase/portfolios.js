// Student Portfolio Firebase Operations
// src/firebase/portfolios.js
// Handles portfolio metadata, featured work curation, and share tokens

import { getDatabase, ref, get, set, update } from 'firebase/database';

const database = getDatabase();

/**
 * Generate a unique share token for a portfolio
 */
export const generateShareToken = () => {
  return `ptf-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Get or create a portfolio for a student
 * Creates default portfolio if none exists
 *
 * @param {string} studentUid - Student UID
 * @param {object} defaults - Default values for new portfolio { displayName, className }
 * @returns {Promise<object>} Portfolio data
 */
export const getOrCreatePortfolio = async (studentUid, defaults = {}) => {
  const portfolioRef = ref(database, `portfolios/${studentUid}`);
  const snapshot = await get(portfolioRef);

  if (snapshot.exists()) {
    return snapshot.val();
  }

  // Create default portfolio
  const now = Date.now();
  const portfolio = {
    shareToken: null,
    isPublic: false,
    title: 'My Music Portfolio',
    displayName: defaults.displayName || 'Student',
    className: defaults.className || '',
    featuredWork: [],
    createdAt: now,
    updatedAt: now
  };

  await set(portfolioRef, portfolio);
  return portfolio;
};

/**
 * Update portfolio fields
 *
 * @param {string} studentUid - Student UID
 * @param {object} updates - Fields to update
 */
export const updatePortfolio = async (studentUid, updates) => {
  const portfolioRef = ref(database, `portfolios/${studentUid}`);
  await update(portfolioRef, {
    ...updates,
    updatedAt: Date.now()
  });
};

/**
 * Toggle a work item in the featured list
 *
 * @param {string} studentUid - Student UID
 * @param {string} workKey - Work key (e.g., 'fm-lesson2-city-composition')
 * @returns {Promise<string[]>} Updated featured work array
 */
export const toggleFeaturedWork = async (studentUid, workKey) => {
  const portfolioRef = ref(database, `portfolios/${studentUid}`);
  const snapshot = await get(portfolioRef);

  if (!snapshot.exists()) {
    // Create portfolio with this item featured
    await set(portfolioRef, {
      shareToken: null,
      isPublic: false,
      title: 'My Music Portfolio',
      displayName: 'Student',
      className: '',
      featuredWork: [workKey],
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
    return [workKey];
  }

  const portfolio = snapshot.val();
  const featured = portfolio.featuredWork || [];

  let updatedFeatured;
  if (featured.includes(workKey)) {
    updatedFeatured = featured.filter(k => k !== workKey);
  } else {
    updatedFeatured = [...featured, workKey];
  }

  await update(portfolioRef, {
    featuredWork: updatedFeatured,
    updatedAt: Date.now()
  });

  return updatedFeatured;
};

/**
 * Create a share token for a portfolio and make it public
 *
 * @param {string} studentUid - Student UID
 * @returns {Promise<string>} The share token
 */
export const createShareToken = async (studentUid) => {
  // Check if portfolio already has a token
  const portfolioRef = ref(database, `portfolios/${studentUid}`);
  const snapshot = await get(portfolioRef);

  if (snapshot.exists() && snapshot.val().shareToken) {
    return snapshot.val().shareToken;
  }

  const token = generateShareToken();

  // Write token lookup
  const tokenRef = ref(database, `portfolioTokens/${token}`);
  await set(tokenRef, {
    studentUid,
    createdAt: Date.now()
  });

  // Update portfolio with token and make public
  await update(portfolioRef, {
    shareToken: token,
    isPublic: true,
    updatedAt: Date.now()
  });

  return token;
};

/**
 * Get a portfolio by its share token (for public viewing)
 *
 * @param {string} shareToken - The share token
 * @returns {Promise<object|null>} { portfolio, studentUid } or null
 */
export const getPortfolioByToken = async (shareToken) => {
  // Look up student UID from token
  const tokenRef = ref(database, `portfolioTokens/${shareToken}`);
  const tokenSnapshot = await get(tokenRef);

  if (!tokenSnapshot.exists()) {
    return null;
  }

  const { studentUid } = tokenSnapshot.val();

  // Get portfolio data
  const portfolioRef = ref(database, `portfolios/${studentUid}`);
  const portfolioSnapshot = await get(portfolioRef);

  if (!portfolioSnapshot.exists()) {
    return null;
  }

  return {
    portfolio: portfolioSnapshot.val(),
    studentUid
  };
};

/**
 * Toggle portfolio public/private
 *
 * @param {string} studentUid - Student UID
 * @param {boolean} isPublic - Whether the portfolio should be public
 */
export const setPortfolioPublic = async (studentUid, isPublic) => {
  await updatePortfolio(studentUid, { isPublic });
};

/**
 * Get a student's work items for portfolio display (from studentWork path)
 *
 * @param {string} studentUid - Student UID
 * @returns {Promise<object[]>} Array of work items
 */
export const getPortfolioWorkItems = async (studentUid) => {
  const workRef = ref(database, `studentWork/${studentUid}`);
  const snapshot = await get(workRef);

  if (!snapshot.exists()) return [];

  const works = [];
  snapshot.forEach((child) => {
    const work = child.val();
    // Only include compositions (not standalone reflections)
    if (work.type !== 'reflection') {
      works.push(work);
    }
  });

  works.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  return works;
};

/**
 * Get grades for portfolio display
 *
 * @param {string} classId - Class ID
 * @param {string} studentUid - Student UID
 * @returns {Promise<object>} Map of lessonId -> grade data
 */
export const getPortfolioGrades = async (classId, studentUid) => {
  const gradesRef = ref(database, `grades/${classId}/${studentUid}`);
  const snapshot = await get(gradesRef);

  if (!snapshot.exists()) return {};
  return snapshot.val();
};
