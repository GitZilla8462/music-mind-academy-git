// Slide configuration for the Press Kit Designer.
// Defines field shapes, layout options, labels, hints (guiding questions), and placeholders (sentence starters).

const SLIDE_CONFIGS = [
  {
    number: 1,
    title: 'Meet the Artist',
    subtitle: 'Who are they?',
    layouts: [
      { id: 'hero-overlay',  label: 'Hero',     desc: 'Full image with text overlay' },
      { id: 'image-left',    label: 'Split',    desc: 'Image left, text right' },
      { id: 'centered',      label: 'Centered', desc: 'Centered with round image' },
    ],
    fields: [
      { key: 'artistName', label: 'Artist Name',  type: 'text',     placeholder: 'Artist Name', maxLength: 60 },
      { key: 'genre',      label: 'Genre',         type: 'text',     placeholder: 'Genre / Subgenre', maxLength: 60 },
      { key: 'location',   label: 'Location',      type: 'text',     placeholder: 'City, State or Country', maxLength: 80 },
      { key: 'hookLine',   label: 'Hook Line',     type: 'textarea', hint: 'What makes this artist different from everyone else in their genre?', placeholder: 'This artist stands out because...', maxLength: 200 },
    ],
    requiredFields: ['artistName', 'hookLine'],
  },
  {
    number: 2,
    title: 'Their Sound',
    subtitle: 'What do they sound like?',
    layouts: [
      { id: 'statement-focus', label: 'Quote',  desc: 'Sound Statement front and center' },
      { id: 'split-mood',      label: 'Split',  desc: 'Statement + mood cards' },
      { id: 'card-grid',       label: 'Cards',  desc: 'Statement with info cards' },
    ],
    fields: [
      { key: 'soundStatement', label: 'Sound Statement', type: 'textarea', hint: 'How would you describe the overall sound and feel of this musician to someone who has never heard them?', placeholder: 'Their music sounds like... because...', maxLength: 300 },
      { key: 'influences',     label: 'Influences',      type: 'text',     hint: 'Who does this artist sound like?', placeholder: 'They sound like a mix of... and...', maxLength: 120 },
      { key: 'moodTags',       label: 'Mood Tags',       type: 'tags',     placeholder: 'e.g. Chill, Groovy, Warm', maxTags: 4 },
      { key: 'ifYouLike',      label: '"If you like..."', type: 'text',     placeholder: 'If you like ___, you\'ll love this artist because ___', maxLength: 120 },
    ],
    requiredFields: ['soundStatement'],
  },
  {
    number: 3,
    title: 'Why This Artist',
    subtitle: 'Why should they be signed?',
    layouts: [
      { id: 'numbered-stack', label: 'Stack',     desc: 'Three numbered cards' },
      { id: 'columns',       label: 'Columns',   desc: 'Three equal columns' },
      { id: 'spotlight',     label: 'Spotlight', desc: 'One featured + two smaller' },
    ],
    fields: [
      { key: 'reason1', label: 'Reason 1', type: 'textarea', hint: 'What musical element (instrumentation, rhythm, vocals) makes this artist stand out?', placeholder: 'One thing that makes their sound unique is...', maxLength: 250 },
      { key: 'reason2', label: 'Reason 2', type: 'textarea', hint: 'What evidence shows this artist is growing? Use a number, quote, or fact.', placeholder: 'You can tell they\'re on the rise because...', maxLength: 250 },
      { key: 'reason3', label: 'Reason 3', type: 'textarea', hint: 'Why do listeners keep coming back to this artist?', placeholder: 'People connect with this artist because...', maxLength: 250 },
    ],
    requiredFields: ['reason1', 'reason2', 'reason3'],
  },
  {
    number: 4,
    title: 'Listen',
    subtitle: 'Hear for yourself',
    layouts: [
      { id: 'player-center',   label: 'Centered', desc: 'Player front and center' },
      { id: 'album-art-left',  label: 'Album',    desc: 'Album art + track info' },
      { id: 'minimal',         label: 'Minimal',  desc: 'Track title large, clean' },
    ],
    fields: [
      { key: 'trackTitle',       label: 'Track Title',        type: 'text',     placeholder: 'Song Title', maxLength: 100 },
      { key: 'albumTitle',       label: 'Album Title',        type: 'text',     placeholder: 'Album or EP Title', maxLength: 100 },
      { key: 'whatToListenFor',  label: 'What to Listen For', type: 'textarea', hint: 'What specific moment in this song should the audience pay attention to?', placeholder: 'Listen for the part where... because it shows...', maxLength: 300 },
    ],
    requiredFields: ['trackTitle', 'whatToListenFor'],
  },
  {
    number: 5,
    title: 'Sign Them',
    subtitle: 'Make your case',
    layouts: [
      { id: 'pitch-bold',   label: 'Bold',   desc: 'Big closing statement' },
      { id: 'split-pitch',  label: 'Split',  desc: 'Image + pitch side by side' },
      { id: 'full-impact',  label: 'Impact', desc: 'Quote background + CTA' },
    ],
    fields: [
      { key: 'closingPitch',  label: 'Closing Pitch',   type: 'textarea', hint: 'Why should a label invest in this artist right now?', placeholder: 'This artist deserves to be signed because...', maxLength: 300 },
      { key: 'callToAction',  label: 'Call to Action',  type: 'text',     hint: 'What do you want the audience to do after hearing your pitch?', placeholder: 'Don\'t miss your chance to...', maxLength: 120 },
      { key: 'memorableFact', label: 'Memorable Fact',  type: 'text',     hint: 'What\'s one surprising thing about this artist people will remember?', placeholder: 'One thing most people don\'t know is...', maxLength: 150 },
    ],
    requiredFields: ['closingPitch', 'callToAction'],
  },
];

/**
 * Get config for a specific slide number (1-indexed).
 */
function getSlideConfig(slideNumber) {
  return SLIDE_CONFIGS[slideNumber - 1] || null;
}

/**
 * Get the default layout ID for a given slide number.
 */
function getDefaultLayout(slideNumber) {
  const cfg = getSlideConfig(slideNumber);
  return cfg ? cfg.layouts[0].id : 'hero-overlay';
}

/**
 * Check if a slide's required fields are filled.
 */
function isSlideComplete(slideNumber, fields) {
  const cfg = getSlideConfig(slideNumber);
  if (!cfg) return false;
  return cfg.requiredFields.every(key => {
    const val = fields[key];
    if (Array.isArray(val)) return val.length > 0;
    return val && val.trim().length > 0;
  });
}

export { SLIDE_CONFIGS, getSlideConfig, getDefaultLayout, isSlideComplete };
