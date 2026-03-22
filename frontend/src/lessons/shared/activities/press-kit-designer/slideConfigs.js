// Slide configuration for the Press Kit Designer.
// Defines field shapes, layout options, and labels for each of the 5 slides.

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
      { key: 'artistName', label: 'Artist Name',  type: 'text',     placeholder: 'e.g. Sharp Pins', maxLength: 60 },
      { key: 'genre',      label: 'Genre',         type: 'text',     placeholder: 'e.g. Indie / Alternative', maxLength: 60 },
      { key: 'location',   label: 'Location',      type: 'text',     placeholder: 'e.g. Chicago, Illinois', maxLength: 80 },
      { key: 'hookLine',   label: 'Hook Line',     type: 'textarea', placeholder: 'One punchy sentence about who they are...', maxLength: 200 },
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
      { key: 'soundStatement', label: 'Sound Statement', type: 'textarea', placeholder: 'One sentence that captures their unique sound...', maxLength: 300 },
      { key: 'influences',     label: 'Influences',      type: 'text',     placeholder: 'e.g. J Dilla, Nujabes, DJ Premier', maxLength: 120 },
      { key: 'moodTags',       label: 'Mood Tags',       type: 'tags',     placeholder: 'e.g. Chill, Groovy, Warm', maxTags: 4 },
      { key: 'ifYouLike',      label: '"If you like..."', type: 'text',     placeholder: 'If you like ___, you\'ll love ___', maxLength: 120 },
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
      { key: 'reason1', label: 'Reason 1', type: 'textarea', placeholder: 'First evidence-backed reason...', maxLength: 250 },
      { key: 'reason2', label: 'Reason 2', type: 'textarea', placeholder: 'Second evidence-backed reason...', maxLength: 250 },
      { key: 'reason3', label: 'Reason 3', type: 'textarea', placeholder: 'Third evidence-backed reason...', maxLength: 250 },
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
      { key: 'trackTitle',       label: 'Track Title',        type: 'text',     placeholder: 'e.g. Balloon Balloon Balloon', maxLength: 100 },
      { key: 'albumTitle',       label: 'Album Title',        type: 'text',     placeholder: 'e.g. Balloon Balloon Balloon', maxLength: 100 },
      { key: 'whatToListenFor',  label: 'What to Listen For', type: 'textarea', placeholder: 'What should the audience pay attention to?', maxLength: 300 },
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
      { key: 'closingPitch',  label: 'Closing Pitch',   type: 'textarea', placeholder: 'Your final 2-3 sentence argument...', maxLength: 300 },
      { key: 'callToAction',  label: 'Call to Action',  type: 'text',     placeholder: 'e.g. "Don\'t let another label find them first."', maxLength: 120 },
      { key: 'memorableFact', label: 'Memorable Fact',  type: 'text',     placeholder: 'One surprising fact that sticks...', maxLength: 150 },
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
