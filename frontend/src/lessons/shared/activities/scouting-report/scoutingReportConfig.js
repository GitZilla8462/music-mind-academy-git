// Scouting Report — 3-slide config for Lesson 1
// Uses the Press Kit Designer with custom slide definitions.
// Students complete these slides during their first exploration session.

export const SCOUTING_SLIDE_CONFIGS = [
  {
    number: 1,
    title: 'My Top 5 Artists',
    subtitle: 'Who caught your ear?',
    layouts: [
      { id: 'numbered-stack', label: 'Stack', desc: 'Numbered list' },
      { id: 'centered', label: 'Centered', desc: 'Centered list' },
    ],
    fields: [
      { key: 'artist1', label: 'Artist #1', type: 'text', placeholder: 'Artist name — Genre', maxLength: 80 },
      { key: 'artist2', label: 'Artist #2', type: 'text', placeholder: 'Artist name — Genre', maxLength: 80 },
      { key: 'artist3', label: 'Artist #3', type: 'text', placeholder: 'Artist name — Genre', maxLength: 80 },
      { key: 'artist4', label: 'Artist #4', type: 'text', placeholder: 'Artist name — Genre', maxLength: 80 },
      { key: 'artist5', label: 'Artist #5', type: 'text', placeholder: 'Artist name — Genre', maxLength: 80 },
    ],
    requiredFields: ['artist1', 'artist2', 'artist3'],
  },
  {
    number: 2,
    title: 'My #1 Pick',
    subtitle: 'Who would you sign?',
    layouts: [
      { id: 'hero-overlay', label: 'Hero', desc: 'Big name with reason' },
      { id: 'centered', label: 'Centered', desc: 'Centered layout' },
    ],
    fields: [
      { key: 'topArtist', label: 'Artist Name', type: 'text', placeholder: 'Who is your #1 pick?', maxLength: 60 },
      { key: 'topGenre', label: 'Genre', type: 'text', placeholder: 'What genre?', maxLength: 40 },
      { key: 'whySign', label: 'Why This Artist?', type: 'textarea', placeholder: 'Why would you sign them? What stands out?', maxLength: 200 },
    ],
    requiredFields: ['topArtist', 'whySign'],
  },
  {
    number: 3,
    title: 'What I Notice',
    subtitle: 'Listen closely',
    layouts: [
      { id: 'statement-focus', label: 'Focus', desc: 'Observation front and center' },
      { id: 'split-mood', label: 'Split', desc: 'Fact + observation side by side' },
    ],
    fields: [
      { key: 'interestingFact', label: 'One Interesting Fact', type: 'textarea', placeholder: 'What is one interesting fact about this artist?', maxLength: 200 },
      { key: 'soundObservation', label: 'What I Hear', type: 'textarea', placeholder: 'What do you notice about their music? (instruments, style, feel)', maxLength: 200 },
    ],
    requiredFields: ['interestingFact', 'soundObservation'],
  },
];

// Slide template generators for Scouting Report (3 slides)
import { CANVAS_W } from '../../activities/press-kit-designer/components/SlideCanvas';

function uid() {
  return `sr-${Math.random().toString(36).slice(2, 10)}`;
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

export function generateScoutingSlide1Objects(fields = {}) {
  const objects = [];
  objects.push(text(CANVAS_W / 2 - 140, 30, 'My Top 5 Artists', 40, { bold: true }));

  const artists = [
    fields.artist1 || '1. ____________________',
    fields.artist2 || '2. ____________________',
    fields.artist3 || '3. ____________________',
    fields.artist4 || '4. ____________________',
    fields.artist5 || '5. ____________________',
  ];

  artists.forEach((a, i) => {
    const prefix = a.startsWith(`${i + 1}.`) ? '' : `${i + 1}. `;
    objects.push(text(100, 110 + i * 60, `${prefix}${a}`, 22, {
      color: i < 3 ? '#ffffff' : '#ffffff99',
    }));
  });

  return objects;
}

export function generateScoutingSlide2Objects(fields = {}) {
  const objects = [];
  objects.push(text(CANVAS_W / 2 - 100, 30, 'My #1 Pick', 40, { bold: true }));

  objects.push(text(CANVAS_W / 2 - 120, 120,
    fields.topArtist || 'Who is your top artist?',
    48, { bold: true, color: '#fbbf24' }
  ));

  objects.push(text(CANVAS_W / 2 - 60, 190,
    fields.topGenre || 'Genre',
    18, { color: '#ffffff88', italic: true }
  ));

  objects.push(text(80, 270,
    fields.whySign || 'Why would you sign this artist?',
    20, { color: '#ffffffcc' }
  ));

  return objects;
}

export function generateScoutingSlide3Objects(fields = {}) {
  const objects = [];
  objects.push(text(CANVAS_W / 2 - 100, 30, 'What I Notice', 40, { bold: true }));

  objects.push(text(80, 120, 'One Interesting Fact:', 16, { bold: true, color: '#fbbf24' }));
  objects.push(text(80, 150,
    fields.interestingFact || 'What is one interesting fact about this artist?',
    20, { color: '#ffffffcc' }
  ));

  objects.push(text(80, 270, 'What I Hear in Their Music:', 16, { bold: true, color: '#fbbf24' }));
  objects.push(text(80, 300,
    fields.soundObservation || 'Instruments, style, feel — what do you notice?',
    20, { color: '#ffffffcc' }
  ));

  return objects;
}

const SCOUTING_GENERATORS = {
  1: generateScoutingSlide1Objects,
  2: generateScoutingSlide2Objects,
  3: generateScoutingSlide3Objects,
};

export function generateScoutingTemplateObjects(slideNumber, fields = {}) {
  const gen = SCOUTING_GENERATORS[slideNumber];
  return gen ? gen(fields) : [];
}
