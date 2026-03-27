// Scouting Report storage — separate from Press Kit (Lesson 4).
// Uses same structure but different localStorage key.

import { saveStudentWork, getClassAuthInfo } from '../../../../utils/studentWorkStorage';
import { SCOUTING_SLIDE_CONFIGS } from './scoutingReportConfig';

const STORAGE_KEY = 'mma-scouting-report-data';
const ACTIVITY_ID = 'mj-scouting-report';
const LESSON_ID = 'mj-lesson1';

function createEmptySlide(number) {
  return {
    number,
    layout: SCOUTING_SLIDE_CONFIGS[number - 1]?.layouts[0]?.id || 'centered',
    palette: 'genre',
    image: null,
    fields: {},
    customOverrides: {},
    objects: [],
  };
}

function createDefaultScoutingReport() {
  return {
    version: 1,
    artistId: null,
    slides: SCOUTING_SLIDE_CONFIGS.map((_, i) => createEmptySlide(i + 1)),
    lastSaved: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };
}

export function loadScoutingReport() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveScoutingReport(report) {
  try {
    report.lastSaved = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(report));

    // Also sync to Firebase if in a class session
    const auth = getClassAuthInfo();
    if (auth?.studentUid) {
      saveStudentWork(LESSON_ID, ACTIVITY_ID, {
        slides: report.slides,
        lastSaved: report.lastSaved,
      }).catch(() => {});
    }
  } catch (err) {
    console.error('Failed to save scouting report:', err);
  }
}

export function getOrCreateScoutingReport() {
  let report = loadScoutingReport();
  if (!report) {
    report = createDefaultScoutingReport();
    saveScoutingReport(report);
  }
  return report;
}
