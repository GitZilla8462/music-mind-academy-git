// Genre Scouts — 3-slide config for Lesson 1
// Students find one artist per genre they explored, note a surprise discovery,
// and describe one artist's sound. Lighter than the full Scouting Report (Lesson 3).

import { CANVAS_W } from '../../activities/press-kit-designer/components/SlideCanvas';

export const GENRE_SCOUTS_SLIDE_CONFIGS = [
  {
    number: 1,
    title: 'Genre Lineup',
    subtitle: 'One artist per genre',
    layouts: [
      { id: 'numbered-stack', label: 'Stack', desc: 'Numbered list' },
      { id: 'centered', label: 'Centered', desc: 'Centered list' },
    ],
    fields: [
      { key: 'artist1', label: 'Hip-Hop / R&B', type: 'text', placeholder: 'Artist name', maxLength: 80 },
      { key: 'artist2', label: 'Rock / Indie', type: 'text', placeholder: 'Artist name', maxLength: 80 },
      { key: 'artist3', label: 'Electronic / Pop', type: 'text', placeholder: 'Artist name', maxLength: 80 },
      { key: 'artist4', label: 'Jazz / Soul', type: 'text', placeholder: 'Artist name', maxLength: 80 },
      { key: 'artist5', label: 'Folk / Country', type: 'text', placeholder: 'Artist name', maxLength: 80 },
      { key: 'artist6', label: 'World / Experimental', type: 'text', placeholder: 'Artist name', maxLength: 80 },
    ],
    requiredFields: ['artist1', 'artist2', 'artist3'],
  },
  {
    number: 2,
    title: 'Surprise Discovery',
    subtitle: 'What caught you off guard?',
    layouts: [
      { id: 'hero-overlay', label: 'Hero', desc: 'Big text with reason' },
      { id: 'centered', label: 'Centered', desc: 'Centered layout' },
    ],
    fields: [
      { key: 'surpriseGenre', label: 'Which genre stood out?', type: 'text', placeholder: 'Which genre stood out to you?', maxLength: 60 },
      { key: 'surpriseArtist', label: 'Who made an impression?', type: 'text', placeholder: 'Who made a big impression?', maxLength: 60 },
      { key: 'whySurprised', label: 'Why?', type: 'textarea', placeholder: 'What about their music or profile stands out to you?', maxLength: 200 },
    ],
    requiredFields: ['surpriseGenre', 'whySurprised'],
  },
  {
    number: 3,
    title: 'Sound Snapshot',
    subtitle: 'Describe what you heard',
    layouts: [
      { id: 'statement-focus', label: 'Focus', desc: 'Observation front and center' },
      { id: 'split-mood', label: 'Split', desc: 'Sound + mood side by side' },
    ],
    fields: [
      { key: 'snapshotArtist', label: 'Pick One Artist', type: 'text', placeholder: 'Which artist do you want to describe?', maxLength: 60 },
      { key: 'whatYouHear', label: 'What Do You Hear?', type: 'textarea', placeholder: 'Instruments, style, energy — describe their sound in your own words', maxLength: 200 },
      { key: 'mood', label: 'What Mood Does It Create?', type: 'textarea', placeholder: 'How does this music make you feel? What pictures come to mind?', maxLength: 200 },
    ],
    requiredFields: ['snapshotArtist', 'whatYouHear'],
  },
];

// ── Template generators ────────────────────────────────

function uid() {
  return `gs-${Math.random().toString(36).slice(2, 10)}`;
}

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

function generateSlide1Objects(fields = {}) {
  const objects = [];
  objects.push(text(CANVAS_W / 2 - 120, 20, 'Genre Lineup', 38, { bold: true }));
  objects.push(text(CANVAS_W / 2 - 130, 65, 'One artist per genre', 16, { color: '#ffffff66', italic: true }));

  const genres = [
    { key: 'artist1', label: 'Hip-Hop / R&B' },
    { key: 'artist2', label: 'Rock / Indie' },
    { key: 'artist3', label: 'Electronic / Pop' },
    { key: 'artist4', label: 'Jazz / Soul' },
    { key: 'artist5', label: 'Folk / Country' },
    { key: 'artist6', label: 'World / Experimental' },
  ];

  genres.forEach((g, i) => {
    objects.push(text(80, 100 + i * 52, g.label, 14, { bold: true, color: '#fbbf24' }));
    objects.push(text(80, 118 + i * 52, fields[g.key] || 'Type artist name here', 20, { color: '#ffffff44' }));
  });

  return objects;
}

function generateSlide2Objects(fields = {}) {
  const objects = [];
  objects.push(text(CANVAS_W / 2 - 140, 30, 'Surprise Discovery', 38, { bold: true }));

  objects.push(text(80, 110, 'Which genre stood out to you?', 16, { bold: true, color: '#fbbf24' }));
  objects.push(text(80, 140, fields.surpriseGenre || 'Type genre here', 24, { color: fields.surpriseGenre ? '#ffffffcc' : '#ffffff44' }));

  objects.push(text(80, 200, 'Who made a big impression?', 16, { bold: true, color: '#fbbf24' }));
  objects.push(text(80, 230, fields.surpriseArtist || 'Type artist name here', 24, { color: fields.surpriseArtist ? '#ffffffcc' : '#ffffff44' }));

  objects.push(text(80, 300, 'What about their music or profile stands out to you?', 16, { bold: true, color: '#fbbf24' }));
  objects.push(text(80, 330, fields.whySurprised || 'Type your answer here', 18, { color: fields.whySurprised ? '#ffffffcc' : '#ffffff44' }));

  return objects;
}

function generateSlide3Objects(fields = {}) {
  const objects = [];
  objects.push(text(CANVAS_W / 2 - 120, 30, 'Sound Snapshot', 38, { bold: true }));

  objects.push(text(80, 110, 'Artist:', 14, { bold: true, color: '#fbbf24' }));
  objects.push(text(80, 135, fields.snapshotArtist || 'Pick one artist to describe', 24, { color: '#ffffffcc' }));

  objects.push(text(80, 200, 'What I Hear:', 14, { bold: true, color: '#fbbf24' }));
  objects.push(text(80, 225, fields.whatYouHear || 'Instruments, style, energy...', 18, { color: '#ffffffcc' }));

  objects.push(text(80, 310, 'The Mood:', 14, { bold: true, color: '#fbbf24' }));
  objects.push(text(80, 335, fields.mood || 'How does it make you feel?', 18, { color: '#ffffffcc' }));

  return objects;
}

const GENRE_SCOUTS_GENERATORS = {
  1: generateSlide1Objects,
  2: generateSlide2Objects,
  3: generateSlide3Objects,
};

export function generateGenreScoutsTemplateObjects(slideNumber, fields = {}) {
  const gen = GENRE_SCOUTS_GENERATORS[slideNumber];
  return gen ? gen(fields) : [];
}
