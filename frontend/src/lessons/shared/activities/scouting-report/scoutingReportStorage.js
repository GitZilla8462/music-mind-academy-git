// Scouting Report storage — separate from Press Kit (Lesson 4).
// Uses same structure but different localStorage key.
// Supports both Scouting Report (L3) and Genre Scouts (L1) via optional key/config params.

import { saveStudentWork, getClassAuthInfo } from '../../../../utils/studentWorkStorage';
import { SCOUTING_SLIDE_CONFIGS } from './scoutingReportConfig';

const DEFAULT_STORAGE_KEY = 'mma-scouting-report-data';
const DEFAULT_ACTIVITY_ID = 'mj-scouting-report';
const DEFAULT_LESSON_ID = 'mj-lesson3';

function createEmptySlide(number, slideConfigs) {
  return {
    number,
    layout: slideConfigs[number - 1]?.layouts[0]?.id || 'centered',
    palette: 'genre',
    image: null,
    fields: {},
    customOverrides: {},
    objects: [],
  };
}

function createDefaultScoutingReport(slideConfigs) {
  return {
    version: 1,
    artistId: null,
    slides: slideConfigs.map((_, i) => createEmptySlide(i + 1, slideConfigs)),
    lastSaved: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };
}

export function loadScoutingReport(key = DEFAULT_STORAGE_KEY, slideConfigs = SCOUTING_SLIDE_CONFIGS) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveScoutingReport(report, key = DEFAULT_STORAGE_KEY, activityId = DEFAULT_ACTIVITY_ID, lessonId = DEFAULT_LESSON_ID, completedReports = null) {
  try {
    report.lastSaved = new Date().toISOString();
    localStorage.setItem(key, JSON.stringify(report));

    // Also sync to Firebase if in a class session
    const auth = getClassAuthInfo();
    if (auth?.studentUid) {
      const totalComplete = (completedReports?.length || 0) + (report.slides?.length > 0 ? 0 : 0);
      const data = {
        slides: report.slides,
        lastSaved: report.lastSaved,
      };
      // Include all completed reports so teacher/dashboard can see them
      if (completedReports && completedReports.length > 0) {
        data.completedReports = completedReports.map(cr => ({
          slides: cr.report?.slides,
          artistName: cr.artistName,
          completedAt: cr.completedAt,
        }));
        data.totalReports = completedReports.length + 1; // +1 for current
      }
      saveStudentWork(lessonId, activityId, data).catch(() => {});
    }
  } catch (err) {
    console.error('Failed to save scouting report:', err);
  }
}

export function getOrCreateScoutingReport(key = DEFAULT_STORAGE_KEY, slideConfigs = SCOUTING_SLIDE_CONFIGS) {
  // null key = create fresh in-memory report without loading/saving
  if (key === null) {
    return createDefaultScoutingReport(slideConfigs);
  }
  let report = loadScoutingReport(key, slideConfigs);
  if (!report) {
    report = createDefaultScoutingReport(slideConfigs);
    saveScoutingReport(report, key);
  }
  return report;
}
