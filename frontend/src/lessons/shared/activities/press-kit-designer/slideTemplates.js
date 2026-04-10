// Slide templates — generate starter objects from template layouts.
// When a student starts a slide, these functions place pre-positioned
// text and image objects on the canvas with guiding question prompts.
// Students double-click to edit, then move/resize to customize.
// Empty fields show sentence starters to reduce blank-page paralysis.

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
    width: opts.width || 400,
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
// Slide 1: Meet the Artist
// ---------------------------------------------------------------------------

export function generateSlide1Objects(fields = {}, imageUrl = null) {
  const objects = [];

  objects.push(text(60, 100,
    fields.artistName || 'Artist Name',
    56, { bold: true }
  ));

  objects.push(text(60, 185,
    fields.genre || 'Genre / Subgenre',
    18, { color: '#fbbf24', bold: true }
  ));

  objects.push(text(60, 225,
    fields.location || 'City, State or Country',
    16, { color: '#ffffffaa', italic: true }
  ));

  objects.push(text(60, 310,
    fields.hookLine || 'This artist stands out because...',
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
    fields.soundStatement || 'Their music sounds like... because...',
    22, { italic: true, color: '#ffffffdd' }
  ));

  const moods = fields.moodTags || [];
  if (moods.length > 0) {
    moods.forEach((tag, i) => {
      objects.push(text(80 + i * 150, 260, tag, 16, { color: '#fbbf24', bold: true }));
    });
  } else {
    objects.push(text(80, 260,
      'Add 3 mood words (e.g. Chill, Dreamy, Powerful)',
      16, { color: '#fbbf24', bold: true }
    ));
  }

  objects.push(text(80, 320,
    fields.influences ? `Influences: ${fields.influences}` : 'They sound like a mix of... and...',
    16, { color: '#ffffff88' }
  ));

  objects.push(text(80, 390,
    fields.ifYouLike || 'If you like ___, you\'ll love this artist because...',
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
    { num: '1.', text: fields.reason1 || 'One thing that makes their sound unique is...' },
    { num: '2.', text: fields.reason2 || 'You can tell they\'re on the rise because...' },
    { num: '3.', text: fields.reason3 || 'This artist fits into a bigger trend because...' },
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
    fields.trackTitle || 'Song Title',
    42, { bold: true }
  ));

  objects.push(text(CANVAS_W / 2 - 100, 195,
    fields.albumTitle || 'Album or EP Title',
    18, { color: '#ffffff88' }
  ));

  objects.push(text(80, 300,
    fields.whatToListenFor || 'Listen for the part where... because it shows...',
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
    fields.closingPitch || 'This artist deserves to be signed because...',
    26, { color: '#ffffffee' }
  ));

  objects.push(text(CANVAS_W / 2 - 180, 310,
    fields.callToAction || 'Don\'t miss your chance to...',
    22, { bold: true, color: '#fbbf24' }
  ));

  objects.push(text(80, 430,
    fields.memorableFact || 'One thing most people don\'t know is...',
    16, { italic: true, color: '#ffffff77' }
  ));

  if (imageUrl) {
    objects.push(img(620, 60, 260, 260, imageUrl));
  }

  return objects;
}

// ---------------------------------------------------------------------------
// Bonus Track slide
// ---------------------------------------------------------------------------

export function generateBonusTrackObjects(bonusNumber = 1) {
  const objects = [];

  objects.push(text(60, 40,
    `Bonus Track ${bonusNumber}`,
    40, { bold: true }
  ));

  objects.push(text(60, 120,
    '4 things people should know about this track:',
    18, { color: '#fbbf24', bold: true }
  ));

  const starters = [
    'This track stands out because...',
    'The instruments / sounds you\'ll hear are...',
    'The mood of this track is... because...',
    'I picked this track because...',
  ];

  starters.forEach((s, i) => {
    objects.push(text(80, 175 + i * 55, `${i + 1}. ${s}`, 16, { color: '#ffffffcc' }));
  });

  objects.push(text(CANVAS_W / 2 - 100, 430,
    'Place Audio Here',
    22, { bold: true, color: '#ffffff44', width: 220 }
  ));

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
