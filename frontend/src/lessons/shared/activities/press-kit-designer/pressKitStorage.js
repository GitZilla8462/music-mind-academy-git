// localStorage + Firebase persistence for the Press Kit Designer.
// Follows the same dual-save pattern as researchBoardStorage.js.

import { saveStudentWork, getClassAuthInfo } from '../../../../utils/studentWorkStorage';
import { SLIDE_CONFIGS, getDefaultLayout } from './slideConfigs';

const STORAGE_KEY = 'mma-press-kit-data';
const OLD_STORAGE_KEY = 'mma-slide-builder-data';
const ACTIVITY_ID = 'mj-press-kit';
const LESSON_ID = 'mj-lesson4';
const VERSION = 2;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createEmptySlide(number) {
  return {
    number,
    layout: getDefaultLayout(number),
    palette: 'genre',
    image: null,
    fields: {},
    customOverrides: {},
    objects: [], // free-form canvas objects (text, images)
  };
}

function createDefaultPressKit(artistId) {
  return {
    version: VERSION,
    artistId: artistId || null,
    slides: SLIDE_CONFIGS.map((_, i) => createEmptySlide(i + 1)),
    lastSaved: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Migration from old SlideBuilder format
// ---------------------------------------------------------------------------

function migrateFromSlideBuilder() {
  try {
    const raw = localStorage.getItem(OLD_STORAGE_KEY);
    if (!raw) return null;
    const old = JSON.parse(raw);
    if (!old || !Array.isArray(old.slides)) return null;

    // Already have new format — skip migration
    if (localStorage.getItem(STORAGE_KEY)) return null;

    const kit = createDefaultPressKit(null);

    // Old format: 5 slides with { headline, bullets[], imageUrl, imageAttribution }
    // Map: old[0] Meet -> new[0] Meet, old[1] Story -> parts of new[2] Why,
    // old[2] Sound -> new[1] Sound, old[3] Why Sign -> new[4] Sign, old[4] Listen -> new[3] Listen
    const mapping = [
      { from: 0, to: 0, fieldMap: { headline: 'hookLine' } },
      { from: 2, to: 1, fieldMap: { headline: 'soundStatement' } },
      { from: 1, to: 2, fieldMap: {} }, // Story -> reasons (best effort)
      { from: 4, to: 3, fieldMap: { headline: 'trackTitle' } },
      { from: 3, to: 4, fieldMap: { headline: 'closingPitch' } },
    ];

    mapping.forEach(({ from, to, fieldMap }) => {
      const oldSlide = old.slides[from];
      if (!oldSlide) return;

      // Map headline
      if (fieldMap.headline && oldSlide.headline) {
        kit.slides[to].fields[fieldMap[Object.keys(fieldMap)[0]]] = oldSlide.headline;
      }

      // Map bullets to reason fields for slide 3 (Why This Artist)
      if (to === 2 && oldSlide.bullets) {
        oldSlide.bullets.forEach((b, i) => {
          if (b && i < 3) kit.slides[to].fields[`reason${i + 1}`] = b;
        });
      }

      // Carry over image
      if (oldSlide.imageUrl) {
        kit.slides[to].image = {
          url: oldSlide.imageUrl,
          thumbnailUrl: oldSlide.imageUrl,
          attribution: oldSlide.imageAttribution || '',
        };
      }
    });

    savePressKit(kit);
    return kit;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

function loadPressKit() {
  let kit = null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) kit = JSON.parse(raw);
  } catch { /* ignore */ }

  // Try migration
  if (!kit) kit = migrateFromSlideBuilder();
  if (!kit) return null;

  // Backfill: ensure all text objects have an explicit width (prevents resize jump)
  let needsSave = false;
  if (kit.slides) {
    kit.slides.forEach(slide => {
      (slide.objects || []).forEach(obj => {
        if (obj.type === 'text' && !obj.width) {
          obj.width = 400;
          needsSave = true;
        }
      });
    });
    if (needsSave) {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...kit, lastSaved: new Date().toISOString() })); } catch {}
    }
  }

  return kit;
}

function savePressKit(data) {
  data.lastSaved = new Date().toISOString();
  data.version = VERSION;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

  // Fire-and-forget Firebase sync
  const auth = getClassAuthInfo();
  if (auth?.uid) {
    saveStudentWork(ACTIVITY_ID, {
      title: 'Agent Presentation Capstone',
      emoji: '\uD83C\uDFA4',
      viewRoute: '/lessons/music-journalist/lesson4?view=saved',
      category: 'Music Journalist',
      lessonId: LESSON_ID,
      type: 'press-kit',
      data,
    }, null, auth);
  }

  return data;
}

function updateSlide(slideNumber, updates) {
  const kit = loadPressKit() || createDefaultPressKit(null);
  const idx = slideNumber - 1;
  if (idx < 0 || idx >= kit.slides.length) return kit;
  kit.slides[idx] = { ...kit.slides[idx], ...updates };
  return savePressKit(kit);
}

function getOrCreatePressKit(artistId) {
  const existing = loadPressKit();
  if (existing && existing.artistId === artistId) return existing;
  // Artist changed or no existing data — create fresh
  const kit = createDefaultPressKit(artistId);
  savePressKit(kit);
  return kit;
}

export {
  STORAGE_KEY,
  ACTIVITY_ID,
  LESSON_ID,
  loadPressKit,
  savePressKit,
  updateSlide,
  getOrCreatePressKit,
  createDefaultPressKit,
  migrateFromSlideBuilder,
};
