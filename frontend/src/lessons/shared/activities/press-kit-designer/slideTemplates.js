// Slide templates — generate starter objects from template layouts.
// When a student starts a slide, these functions place pre-positioned
// text and image objects on the canvas with clear placeholder prompts.
// Students double-click to edit, then move/resize to customize.

import { CANVAS_W, CANVAS_H } from './components/SlideCanvas';

// Unique ID generator — avoids collisions with canvas-generated IDs
function uid() {
  return `tpl-${Math.random().toString(36).slice(2, 10)}`;
}

// Helper to create a text object with placeholder support
function text(x, y, txt, fontSize = 24, opts = {}) {
  return {
    id: uid(),
    type: 'text',
    x, y,
    text: txt,
    fontSize,
    color: opts.color || '#ffffff',
    bold: opts.bold ?? false,
    italic: opts.italic ?? false,
    fontFamily: opts.fontFamily || 'Inter, system-ui, sans-serif',
  };
}

// Helper to create an image
function img(x, y, w, h, url = null) {
  return {
    id: uid(),
    type: 'image',
    x, y,
    width: w,
    height: h,
    url: url,
    attribution: '',
  };
}

// ---------------------------------------------------------------------------
// Slide 1: This Is [Artist]
// ---------------------------------------------------------------------------

export function generateSlide1Objects(fields = {}, imageUrl = null) {
  const objects = [];

  objects.push(text(60, 100,
    fields.artistName || 'Type artist name here',
    56, { bold: true }
  ));

  objects.push(text(60, 185,
    fields.genre || 'Type genre here (e.g. Indie / Alternative)',
    18, { color: '#fbbf24', bold: true }
  ));

  objects.push(text(60, 225,
    fields.location || 'Type location here (e.g. Chicago, Illinois)',
    16, { color: '#ffffffaa', italic: true }
  ));

  objects.push(text(60, 310,
    fields.hookLine || 'Type one punchy sentence about who they are...',
    20, { color: '#ffffffcc' }
  ));

  if (imageUrl) {
    objects.push(img(600, 70, 280, 280, imageUrl));
  }

  return objects;
}

// ---------------------------------------------------------------------------
// Slide 2: Their Sound
// ---------------------------------------------------------------------------

export function generateSlide2Objects(fields = {}) {
  const objects = [];

  objects.push(text(CANVAS_W / 2 - 120, 30,
    'Their Sound',
    36, { bold: true }
  ));

  objects.push(text(80, 120,
    fields.soundStatement || 'Type your Sound Statement here — one sentence that captures their unique sound...',
    22, { italic: true, color: '#ffffffdd' }
  ));

  const moods = fields.moodTags || [];
  if (moods.length > 0) {
    moods.forEach((tag, i) => {
      objects.push(text(80 + i * 150, 260, tag, 16, { color: '#fbbf24', bold: true }));
    });
  } else {
    objects.push(text(80, 260,
      'Type mood tags here (e.g. Chill, Groovy, Warm)',
      16, { color: '#fbbf24', bold: true }
    ));
  }

  objects.push(text(80, 320,
    fields.influences ? `Influences: ${fields.influences}` : 'Type influences here (e.g. J Dilla, Nujabes)',
    16, { color: '#ffffff88' }
  ));

  objects.push(text(80, 390,
    fields.ifYouLike || 'Type: "If you like [artist], you\'ll love [your artist]"',
    18, { italic: true, color: '#fbbf24' }
  ));

  return objects;
}

// ---------------------------------------------------------------------------
// Slide 3: Why They're About to Blow Up
// ---------------------------------------------------------------------------

export function generateSlide3Objects(fields = {}) {
  const objects = [];

  objects.push(text(60, 30,
    'Why They\'re About to Blow Up',
    36, { bold: true }
  ));

  const reasons = [
    { num: '1.', text: fields.reason1 || 'Type reason 1 — what\'s unique about their sound?' },
    { num: '2.', text: fields.reason2 || 'Type reason 2 — what\'s their story?' },
    { num: '3.', text: fields.reason3 || 'Type reason 3 — what evidence shows they\'re growing?' },
  ];

  reasons.forEach((r, i) => {
    objects.push(text(60, 120 + i * 130, r.num, 28, { bold: true, color: '#fbbf24' }));
    objects.push(text(100, 120 + i * 130, r.text, 18, { color: '#ffffffcc' }));
  });

  return objects;
}

// ---------------------------------------------------------------------------
// Slide 4: Press Play
// ---------------------------------------------------------------------------

export function generateSlide4Objects(fields = {}, imageUrl = null) {
  const objects = [];

  objects.push(text(CANVAS_W / 2 - 80, 30,
    'Press Play',
    36, { bold: true }
  ));

  objects.push(text(CANVAS_W / 2 - 150, 120,
    fields.trackTitle || 'Type track title here',
    42, { bold: true }
  ));

  objects.push(text(CANVAS_W / 2 - 100, 195,
    fields.albumTitle || 'Type album title here',
    18, { color: '#ffffff88' }
  ));

  objects.push(text(80, 300,
    fields.whatToListenFor || 'Type what the audience should listen for in this track...',
    18, { color: '#ffffffcc', italic: true }
  ));

  if (imageUrl) {
    objects.push(img(640, 80, 240, 240, imageUrl));
  }

  return objects;
}

// ---------------------------------------------------------------------------
// Slide 5: Make Them Go Viral
// ---------------------------------------------------------------------------

export function generateSlide5Objects(fields = {}, imageUrl = null) {
  const objects = [];

  objects.push(text(80, 60,
    'Make Them Go Viral',
    36, { bold: true }
  ));

  objects.push(text(80, 150,
    fields.closingPitch || 'Type your closing pitch — why should anyone care about this artist RIGHT NOW?',
    26, { color: '#ffffffee' }
  ));

  objects.push(text(CANVAS_W / 2 - 180, 310,
    fields.callToAction || 'Type your call to action (e.g. "Follow them before everyone else does")',
    22, { bold: true, color: '#fbbf24' }
  ));

  objects.push(text(80, 430,
    fields.memorableFact || 'Type one surprising fact that sticks...',
    16, { italic: true, color: '#ffffff77' }
  ));

  if (imageUrl) {
    objects.push(img(620, 60, 260, 260, imageUrl));
  }

  return objects;
}

// ---------------------------------------------------------------------------
// Master generator
// ---------------------------------------------------------------------------

const GENERATORS = {
  1: generateSlide1Objects,
  2: generateSlide2Objects,
  3: generateSlide3Objects,
  4: generateSlide4Objects,
  5: generateSlide5Objects,
};

export function generateTemplateObjects(slideNumber, fields = {}, imageUrl = null) {
  const gen = GENERATORS[slideNumber];
  return gen ? gen(fields, imageUrl) : [];
}
