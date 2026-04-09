// Claim Your Artist — 3-slide config for Lesson 3
// Slide 1: Artist Overview (name, track, location, genre)
// Slide 2: The Four Points (unique sound, compelling story, signs of growth, gut feeling)
// Slide 3: Fact or Opinion Sort (student classifies 6 statements)
// Uses SlideCanvas from PressKitDesigner with pre-filled template objects.

import { CANVAS_W } from '../../activities/press-kit-designer/components/SlideCanvas';

export const CLAIM_ARTIST_SLIDE_CONFIGS = [
  {
    number: 1,
    title: 'Artist Overview',
    subtitle: 'Who are you scouting?',
    layouts: [
      { id: 'info-card', label: 'Card', desc: 'Artist info card' },
      { id: 'centered', label: 'Centered', desc: 'Centered layout' },
    ],
    fields: [
      { key: 'artistName', label: 'Artist Name', type: 'text', placeholder: 'Who are you scouting?', maxLength: 60 },
      { key: 'trackName', label: 'Track Name', type: 'text', placeholder: 'Which track are you evaluating?', maxLength: 80 },
      { key: 'location', label: 'Location', type: 'text', placeholder: 'Where is this artist from?', maxLength: 60 },
      { key: 'genre', label: 'Genre', type: 'text', placeholder: 'What genre is their music?', maxLength: 40 },
    ],
    requiredFields: ['artistName', 'trackName'],
  },
  {
    number: 2,
    title: 'The Four Points',
    subtitle: 'Use specific details — not vague opinions',
    layouts: [
      { id: 'four-points', label: 'Points', desc: 'Four labeled sections' },
      { id: 'centered', label: 'Centered', desc: 'Centered layout' },
    ],
    fields: [
      { key: 'uniqueSound', label: 'Point 1: Unique Sound', type: 'textarea', placeholder: 'What makes their sound different?', maxLength: 200 },
      { key: 'compellingStory', label: 'Point 2: Compelling Story', type: 'textarea', placeholder: 'What is their background or story?', maxLength: 200 },
      { key: 'signsOfGrowth', label: 'Point 3: Signs of Growth', type: 'textarea', placeholder: 'What evidence shows they are growing?', maxLength: 200 },
      { key: 'gutFeeling', label: 'Point 4: Gut Feeling', type: 'textarea', placeholder: 'What is your personal reaction to them?', maxLength: 200 },
    ],
    requiredFields: ['uniqueSound', 'compellingStory', 'signsOfGrowth', 'gutFeeling'],
  },
  {
    number: 3,
    title: 'Fact or Opinion',
    subtitle: 'Classify each statement',
    layouts: [
      { id: 'sort-grid', label: 'Grid', desc: 'Statement grid' },
      { id: 'centered', label: 'Centered', desc: 'Centered layout' },
    ],
    fields: [
      { key: 'sort1', label: '"Released 3 EPs in two years"', type: 'text', placeholder: 'Fact/Opinion + Strong/Weak', maxLength: 40 },
      { key: 'sort2', label: '"Best music on the platform"', type: 'text', placeholder: 'Fact/Opinion + Strong/Weak', maxLength: 40 },
      { key: 'sort3', label: '"Self-taught, produces solo"', type: 'text', placeholder: 'Fact/Opinion + Strong/Weak', maxLength: 40 },
      { key: 'sort4', label: '"Really cool vibe"', type: 'text', placeholder: 'Fact/Opinion + Strong/Weak', maxLength: 40 },
      { key: 'sort5', label: '"Blends jazz, soul, Latin"', type: 'text', placeholder: 'Fact/Opinion + Strong/Weak', maxLength: 40 },
      { key: 'sort6', label: '"Everyone should listen"', type: 'text', placeholder: 'Fact/Opinion + Strong/Weak', maxLength: 40 },
    ],
    requiredFields: ['sort1', 'sort2', 'sort3', 'sort4', 'sort5', 'sort6'],
  },
];

// ── Template generators ────────────────────────────────

function uid() {
  return `ca-${Math.random().toString(36).slice(2, 10)}`;
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
  objects.push(text(CANVAS_W / 2 - 120, 20, 'Artist Overview', 38, { bold: true }));
  objects.push(text(CANVAS_W / 2 - 130, 62, 'Slide 1 of 3', 14, { color: '#fbbf2488', italic: true }));

  const rows = [
    { label: 'Artist Name', key: 'artistName', placeholder: 'Who are you scouting?' },
    { label: 'Track Name', key: 'trackName', placeholder: 'Which track?' },
    { label: 'Location', key: 'location', placeholder: 'Where are they from?' },
    { label: 'Genre', key: 'genre', placeholder: 'What genre?' },
  ];

  rows.forEach((r, i) => {
    objects.push(text(80, 110 + i * 70, r.label, 14, { bold: true, color: '#fbbf24' }));
    objects.push(text(80, 130 + i * 70, fields[r.key] || r.placeholder, 22, { color: fields[r.key] ? '#ffffffcc' : '#ffffff44' }));
  });

  return objects;
}

function generateSlide2Objects(fields = {}) {
  const objects = [];
  objects.push(text(CANVAS_W / 2 - 100, 15, 'The Four Points', 36, { bold: true }));
  objects.push(text(CANVAS_W / 2 - 140, 52, 'Use specific details, not vague opinions', 12, { color: '#ffffff55', italic: true }));

  const points = [
    { label: 'Unique Sound', key: 'uniqueSound', color: '#fbbf24' },
    { label: 'Compelling Story', key: 'compellingStory', color: '#60a5fa' },
    { label: 'Signs of Growth', key: 'signsOfGrowth', color: '#34d399' },
    { label: 'Gut Feeling', key: 'gutFeeling', color: '#a78bfa' },
  ];

  points.forEach((p, i) => {
    const y = 80 + i * 82;
    objects.push(text(60, y, `${i + 1}. ${p.label}`, 15, { bold: true, color: p.color }));
    const val = fields[p.key] || '';
    objects.push(text(60, y + 20, val || 'Your answer here...', 16, { color: val ? '#ffffffcc' : '#ffffff33' }));
  });

  return objects;
}

function generateSlide3Objects(fields = {}) {
  const objects = [];
  objects.push(text(CANVAS_W / 2 - 120, 15, 'Fact or Opinion Sort', 34, { bold: true }));
  objects.push(text(CANVAS_W / 2 - 170, 50, 'For each: Fact/Opinion + Strong/Weak', 13, { color: '#ffffff55', italic: true }));

  const statements = [
    { key: 'sort1', text: '"Released 3 EPs in two years"' },
    { key: 'sort2', text: '"Best music on the platform"' },
    { key: 'sort3', text: '"Self-taught, produces solo"' },
    { key: 'sort4', text: '"Really cool vibe"' },
    { key: 'sort5', text: '"Blends jazz, soul, Latin"' },
    { key: 'sort6', text: '"Everyone should listen"' },
  ];

  statements.forEach((s, i) => {
    const y = 78 + i * 52;
    objects.push(text(60, y, s.text, 14, { color: '#ffffffaa' }));
    const val = fields[s.key] || '';
    objects.push(text(420, y, val || '→ ___________', 14, {
      color: val ? '#fbbf24' : '#ffffff22',
      bold: !!val,
    }));
  });

  return objects;
}

const CLAIM_ARTIST_GENERATORS = {
  1: generateSlide1Objects,
  2: generateSlide2Objects,
  3: generateSlide3Objects,
};

export function generateClaimArtistTemplateObjects(slideNumber, fields = {}) {
  const gen = CLAIM_ARTIST_GENERATORS[slideNumber];
  return gen ? gen(fields) : [];
}
