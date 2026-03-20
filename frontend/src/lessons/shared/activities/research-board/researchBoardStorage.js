// File: research-board/researchBoardStorage.js
// localStorage + Firebase persistence for the Research Board
// Used by ArticleReader, ResearchBoard, and SlideBuilder components

import { saveStudentWork, getClassAuthInfo } from '../../../../utils/studentWorkStorage';

const STORAGE_KEY = 'mma-research-board';
const FIREBASE_ACTIVITY_ID = 'mj-research-board';

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function generateId() {
  return `rb-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function readFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { highlights: [], images: [], topic: '', updatedAt: '' };
}

function writeToStorage(data) {
  data.updatedAt = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

  // Fire-and-forget sync to Firebase via studentWorkStorage
  const auth = getClassAuthInfo();
  if (auth?.uid) {
    saveStudentWork(FIREBASE_ACTIVITY_ID, {
      title: 'Research Board',
      emoji: '\uD83D\uDCCB',
      viewRoute: null,
      category: 'Music Journalist',
      type: 'research-board',
      data,
    }, null, auth);
  }

  return data;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Load the full research board state.
 * @returns {{ highlights: Array, images: Array, topic: string, updatedAt: string }}
 */
export function getResearchBoard() {
  return readFromStorage();
}

/**
 * Replace the entire board (used when loading from Firebase on first open).
 * @param {object} data
 */
export function saveResearchBoard(data) {
  return writeToStorage({ ...readFromStorage(), ...data });
}

/**
 * Add a highlight to the research board.
 * @param {{ text: string, color: string, articleId: string, articleHeadline: string, sourceName: string }} highlight
 * @returns {object} updated board
 */
export function addHighlight({ text, color, articleId, articleHeadline, sourceName }) {
  const board = readFromStorage();
  board.highlights.push({
    id: generateId(),
    text,
    color,
    articleId,
    articleHeadline: articleHeadline || '',
    sourceName: sourceName || '',
    slideTag: null,
    timestamp: new Date().toISOString(),
  });
  return writeToStorage(board);
}

/**
 * Remove a highlight by id.
 * @param {string} highlightId
 * @returns {object} updated board
 */
export function removeHighlight(highlightId) {
  const board = readFromStorage();
  board.highlights = board.highlights.filter(h => h.id !== highlightId);
  return writeToStorage(board);
}

/**
 * Update the slide tag on a highlight.
 * @param {string} highlightId
 * @param {number|null} slideTag — 1-4 or null for "Untagged"
 * @returns {object} updated board
 */
export function updateHighlightSlideTag(highlightId, slideTag) {
  const board = readFromStorage();
  const hl = board.highlights.find(h => h.id === highlightId);
  if (hl) hl.slideTag = slideTag;
  return writeToStorage(board);
}

/**
 * Add an image to the research board.
 * @param {{ url: string, thumbnailUrl: string, attribution: string }} image
 * @returns {object} updated board
 */
export function addImage({ url, thumbnailUrl, attribution }) {
  const board = readFromStorage();
  board.images.push({
    id: generateId(),
    url,
    thumbnailUrl: thumbnailUrl || url,
    attribution: attribution || '',
    slideTag: null,
    timestamp: new Date().toISOString(),
  });
  return writeToStorage(board);
}

/**
 * Remove an image by id.
 * @param {string} imageId
 * @returns {object} updated board
 */
export function removeImage(imageId) {
  const board = readFromStorage();
  board.images = board.images.filter(img => img.id !== imageId);
  return writeToStorage(board);
}

/**
 * Update the slide tag on an image.
 * @param {string} imageId
 * @param {number|null} slideTag
 * @returns {object} updated board
 */
export function updateImageSlideTag(imageId, slideTag) {
  const board = readFromStorage();
  const img = board.images.find(i => i.id === imageId);
  if (img) img.slideTag = slideTag;
  return writeToStorage(board);
}

/**
 * Set the student's chosen topic.
 * @param {string} topic
 * @returns {object} updated board
 */
export function setTopic(topic) {
  const board = readFromStorage();
  board.topic = topic;
  return writeToStorage(board);
}

/**
 * Get all highlights tagged for a specific slide number.
 * @param {number} slideNumber — 1-4
 * @returns {Array}
 */
export function getHighlightsForSlide(slideNumber) {
  const board = readFromStorage();
  return board.highlights.filter(h => h.slideTag === slideNumber);
}

/**
 * Get all images tagged for a specific slide number.
 * @param {number} slideNumber — 1-4
 * @returns {Array}
 */
export function getImagesForSlide(slideNumber) {
  const board = readFromStorage();
  return board.images.filter(img => img.slideTag === slideNumber);
}

/**
 * Check if the student has enough research to start building slides.
 * Threshold: 8+ highlights and 2+ images.
 * @returns {boolean}
 */
export function isResearchReady() {
  const board = readFromStorage();
  return board.highlights.length >= 8 && board.images.length >= 2;
}

/**
 * Quick summary object for progress indicators.
 * @returns {{ highlightCount: number, imageCount: number, slidesTagged: number, isReady: boolean }}
 */
export function getResearchSummary() {
  const board = readFromStorage();
  const taggedSlides = new Set([
    ...board.highlights.filter(h => h.slideTag).map(h => h.slideTag),
    ...board.images.filter(i => i.slideTag).map(i => i.slideTag),
  ]);
  return {
    highlightCount: board.highlights.length,
    imageCount: board.images.length,
    slidesTagged: taggedSlides.size,
    isReady: board.highlights.length >= 8 && board.images.length >= 2,
  };
}
