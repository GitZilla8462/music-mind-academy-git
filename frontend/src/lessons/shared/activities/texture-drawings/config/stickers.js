/**
 * stickers.js - Musical Stickers Configuration
 * 
 * Categories:
 * 1. Instruments - Orchestra instruments (PNG icons)
 * 2. Dynamics - Volume levels and changes
 * 3. Tempo - Speed markings
 * 4. Articulation - How notes are played
 * 5. Symbols - Clefs, accidentals, repeats
 * 6. Form - Section labels for listening maps
 * 7. Emojis - Fun reactions
 */

// ============================================================================
// 1. INSTRUMENTS - PNG icons
// ============================================================================

export const INSTRUMENTS = {
  strings: {
    name: 'Strings',
    items: [
      { id: 'violin', name: 'Violin', render: 'svg' },
      { id: 'cello', name: 'Cello', render: 'svg' },
      { id: 'upright-bass', name: 'Upright Bass', render: 'svg' },
      { id: 'harp', name: 'Harp', render: 'svg' },
      { id: 'acoustic-guitar', name: 'Acoustic Guitar', render: 'svg' },
      { id: 'electric-guitar', name: 'Electric Guitar', render: 'svg' },
    ]
  },
  keyboards: {
    name: 'Keyboards',
    items: [
      { id: 'piano', name: 'Piano', render: 'svg' },
      { id: 'synthesizer', name: 'Synthesizer', render: 'svg' },
    ]
  },
  woodwinds: {
    name: 'Woodwinds',
    items: [
      { id: 'flute', name: 'Flute', render: 'svg' },
      { id: 'clarinet', name: 'Clarinet', render: 'svg' },
      { id: 'oboe', name: 'Oboe', render: 'svg' },
      { id: 'saxophone', name: 'Saxophone', render: 'svg' },
    ]
  },
  brass: {
    name: 'Brass',
    items: [
      { id: 'trumpet', name: 'Trumpet', render: 'svg' },
      { id: 'trombone', name: 'Trombone', render: 'svg' },
      { id: 'french-horn', name: 'French Horn', render: 'svg' },
      { id: 'tuba', name: 'Tuba', render: 'svg' },
    ]
  },
  percussion: {
    name: 'Percussion',
    items: [
      { id: 'drums', name: 'Drum Set', render: 'svg' },
      { id: 'snare-drum', name: 'Snare Drum', render: 'svg' },
      { id: 'timpani', name: 'Timpani', render: 'svg' },
      { id: 'xylophone', name: 'Xylophone', render: 'svg' },
      { id: 'cymbals', name: 'Cymbals', render: 'svg' },
      { id: 'triangle', name: 'Triangle', render: 'svg' },
      { id: 'tambourine', name: 'Tambourine', render: 'svg' },
    ]
  }
};

// ============================================================================
// 2. DYNAMICS - Volume levels and changes
// ============================================================================

export const DYNAMICS = {
  volume: {
    name: 'Volume Levels',
    items: [
      { symbol: 'pp', name: 'Pianissimo', meaning: 'Very soft', render: 'text' },
      { symbol: 'p', name: 'Piano', meaning: 'Soft', render: 'text' },
      { symbol: 'mp', name: 'Mezzo Piano', meaning: 'Medium soft', render: 'text' },
      { symbol: 'mf', name: 'Mezzo Forte', meaning: 'Medium loud', render: 'text' },
      { symbol: 'f', name: 'Forte', meaning: 'Loud', render: 'text' },
      { symbol: 'ff', name: 'Fortissimo', meaning: 'Very loud', render: 'text' },
    ]
  },
  changes: {
    name: 'Volume Changes',
    items: [
      { symbol: 'crescendo', name: 'Crescendo', meaning: 'Getting louder', render: 'crescendo' },
      { symbol: 'decrescendo', name: 'Decrescendo', meaning: 'Getting softer', render: 'decrescendo' },
      { symbol: 'sfz', name: 'Sforzando', meaning: 'Sudden accent', render: 'text' },
      { symbol: 'fp', name: 'Fortepiano', meaning: 'Loud then soft', render: 'text' },
    ]
  }
};

// ============================================================================
// 3. TEMPO - Speed markings
// ============================================================================

export const TEMPO = {
  speeds: {
    name: 'Speed',
    items: [
      { symbol: 'Largo', name: 'Largo', meaning: 'Very slow', render: 'text-italic' },
      { symbol: 'Adagio', name: 'Adagio', meaning: 'Slow', render: 'text-italic' },
      { symbol: 'Andante', name: 'Andante', meaning: 'Walking pace', render: 'text-italic' },
      { symbol: 'Moderato', name: 'Moderato', meaning: 'Moderate', render: 'text-italic' },
      { symbol: 'Allegro', name: 'Allegro', meaning: 'Fast', render: 'text-italic' },
      { symbol: 'Vivace', name: 'Vivace', meaning: 'Lively', render: 'text-italic' },
      { symbol: 'Presto', name: 'Presto', meaning: 'Very fast', render: 'text-italic' },
    ]
  },
  changes: {
    name: 'Tempo Changes',
    items: [
      { symbol: 'accel.', name: 'Accelerando', meaning: 'Speed up', render: 'text-italic' },
      { symbol: 'rit.', name: 'Ritardando', meaning: 'Slow down', render: 'text-italic' },
      { symbol: 'a tempo', name: 'A Tempo', meaning: 'Return to tempo', render: 'text-italic' },
      { symbol: 'rubato', name: 'Rubato', meaning: 'Flexible tempo', render: 'text-italic' },
    ]
  }
};

// ============================================================================
// 4. ARTICULATION - How notes are played
// ============================================================================

export const ARTICULATION = {
  markings: {
    name: 'Articulation Marks',
    items: [
      { symbol: '•', name: 'Staccato', meaning: 'Short, detached', render: 'symbol-large' },
      { symbol: '–', name: 'Tenuto', meaning: 'Held, sustained', render: 'symbol-large' },
      { symbol: '>', name: 'Accent', meaning: 'Emphasized', render: 'symbol-large' },
      { symbol: '^', name: 'Marcato', meaning: 'Strong accent', render: 'symbol-large' },
      { symbol: '𝄐', name: 'Fermata', meaning: 'Hold/pause', render: 'symbol' },
      { symbol: '⌒', name: 'Slur/Legato', meaning: 'Smooth, connected', render: 'symbol-large' },
    ]
  },
  styles: {
    name: 'Playing Styles',
    items: [
      { symbol: 'legato', name: 'Legato', meaning: 'Smooth', render: 'text-italic' },
      { symbol: 'staccato', name: 'Staccato', meaning: 'Detached', render: 'text-italic' },
      { symbol: 'pizz.', name: 'Pizzicato', meaning: 'Plucked', render: 'text-italic' },
      { symbol: 'arco', name: 'Arco', meaning: 'With bow', render: 'text-italic' },
      { symbol: 'tremolo', name: 'Tremolo', meaning: 'Rapid repeat', render: 'text-italic' },
      { symbol: 'gliss.', name: 'Glissando', meaning: 'Slide', render: 'text-italic' },
    ]
  }
};

// ============================================================================
// 5. SYMBOLS - Clefs, accidentals, repeats
// ============================================================================

export const SYMBOLS = {
  clefs: {
    name: 'Clefs',
    items: [
      { symbol: '𝄞', name: 'Treble Clef', render: 'symbol' },
      { symbol: '𝄢', name: 'Bass Clef', render: 'symbol' },
    ]
  },
  accidentals: {
    name: 'Accidentals',
    items: [
      { symbol: '♯', name: 'Sharp', render: 'symbol' },
      { symbol: '♭', name: 'Flat', render: 'symbol' },
      { symbol: '♮', name: 'Natural', render: 'symbol' },
    ]
  },
  repeats: {
    name: 'Repeats',
    items: [
      { symbol: '𝄆', name: 'Repeat Start', render: 'symbol' },
      { symbol: '𝄇', name: 'Repeat End', render: 'symbol' },
      { symbol: '𝄋', name: '1st/2nd Ending', render: 'symbol' },
    ]
  }
};

// ============================================================================
// 6. FORM - Section labels for listening maps
// ============================================================================

export const FORM = {
  sections: {
    name: 'Sections',
    items: [
      { symbol: 'A', name: 'Section A', meaning: 'First theme', render: 'form-label' },
      { symbol: 'B', name: 'Section B', meaning: 'Second theme', render: 'form-label' },
      { symbol: 'C', name: 'Section C', meaning: 'Third theme', render: 'form-label' },
      { symbol: 'D', name: 'Section D', meaning: 'Fourth theme', render: 'form-label' },
      { symbol: "A'", name: "Section A'", meaning: 'A varied', render: 'form-label' },
      { symbol: "B'", name: "Section B'", meaning: 'B varied', render: 'form-label' },
    ]
  },
  parts: {
    name: 'Parts',
    items: [
      { symbol: 'Intro', name: 'Introduction', meaning: 'Beginning', render: 'form-text' },
      { symbol: 'Theme', name: 'Theme', meaning: 'Main melody', render: 'form-text' },
      { symbol: 'Var.', name: 'Variation', meaning: 'Theme changed', render: 'form-text' },
      { symbol: 'Dev.', name: 'Development', meaning: 'Ideas explored', render: 'form-text' },
      { symbol: 'Recap', name: 'Recapitulation', meaning: 'Return', render: 'form-text' },
      { symbol: 'Coda', name: 'Coda', meaning: 'Ending', render: 'form-text' },
      { symbol: 'Bridge', name: 'Bridge', meaning: 'Transition', render: 'form-text' },
    ]
  },
  navigation: {
    name: 'Navigation',
    items: [
      { symbol: '𝄌', name: 'Coda Symbol', render: 'symbol' },
      { symbol: '𝄋', name: 'Segno', render: 'symbol' },
      { symbol: 'D.C.', name: 'Da Capo', meaning: 'From beginning', render: 'text-italic' },
      { symbol: 'D.S.', name: 'Dal Segno', meaning: 'From sign', render: 'text-italic' },
      { symbol: 'Fine', name: 'Fine', meaning: 'End', render: 'text-italic' },
    ]
  }
};

// ============================================================================
// 7. EMOJIS - Fun reactions (at bottom)
// ============================================================================

export const EMOJIS = {
  feelings: {
    name: 'Feelings',
    items: [
      { symbol: '😊', name: 'Happy' },
      { symbol: '😃', name: 'Big Smile' },
      { symbol: '😄', name: 'Grinning' },
      { symbol: '🥳', name: 'Party' },
      { symbol: '😢', name: 'Sad' },
      { symbol: '😭', name: 'Crying' },
      { symbol: '😠', name: 'Angry' },
      { symbol: '😤', name: 'Frustrated' },
      { symbol: '😌', name: 'Calm' },
      { symbol: '😇', name: 'Peaceful' },
      { symbol: '🤩', name: 'Excited' },
      { symbol: '😲', name: 'Surprised' },
      { symbol: '😨', name: 'Scared' },
      { symbol: '😱', name: 'Terrified' },
      { symbol: '😴', name: 'Sleepy' },
      { symbol: '🥱', name: 'Tired' },
      { symbol: '🥰', name: 'Loving' },
      { symbol: '😍', name: 'Heart Eyes' },
      { symbol: '😎', name: 'Cool' },
      { symbol: '🤔', name: 'Thinking' },
      { symbol: '😮', name: 'Wow' },
      { symbol: '🤗', name: 'Hugging' },
      { symbol: '😬', name: 'Nervous' },
      { symbol: '🙄', name: 'Bored' },
    ]
  },
  animals: {
    name: 'Animals',
    items: [
      { symbol: '🐦', name: 'Bird' },
      { symbol: '🦅', name: 'Eagle' },
      { symbol: '🦉', name: 'Owl' },
      { symbol: '🦁', name: 'Lion' },
      { symbol: '🐯', name: 'Tiger' },
      { symbol: '🐻', name: 'Bear' },
      { symbol: '🐘', name: 'Elephant' },
      { symbol: '🦋', name: 'Butterfly' },
      { symbol: '🐝', name: 'Bee' },
      { symbol: '🐎', name: 'Horse' },
      { symbol: '🦄', name: 'Unicorn' },
      { symbol: '🐢', name: 'Turtle' },
      { symbol: '🐌', name: 'Snail' },
      { symbol: '🐰', name: 'Bunny' },
      { symbol: '🐭', name: 'Mouse' },
      { symbol: '🐱', name: 'Cat' },
      { symbol: '🐶', name: 'Dog' },
      { symbol: '🐸', name: 'Frog' },
      { symbol: '🦆', name: 'Duck' },
      { symbol: '🐟', name: 'Fish' },
      { symbol: '🐬', name: 'Dolphin' },
      { symbol: '🦈', name: 'Shark' },
      { symbol: '🐍', name: 'Snake' },
      { symbol: '🦖', name: 'Dinosaur' },
    ]
  },
  nature: {
    name: 'Nature',
    items: [
      { symbol: '☀️', name: 'Sun' },
      { symbol: '🌤️', name: 'Sunny' },
      { symbol: '🌙', name: 'Moon' },
      { symbol: '🌛', name: 'Crescent' },
      { symbol: '⭐', name: 'Star' },
      { symbol: '🌟', name: 'Glowing Star' },
      { symbol: '✨', name: 'Sparkles' },
      { symbol: '🌈', name: 'Rainbow' },
      { symbol: '🌊', name: 'Wave' },
      { symbol: '💧', name: 'Water Drop' },
      { symbol: '🌸', name: 'Flower' },
      { symbol: '🌺', name: 'Hibiscus' },
      { symbol: '🌻', name: 'Sunflower' },
      { symbol: '🌹', name: 'Rose' },
      { symbol: '🍂', name: 'Leaves' },
      { symbol: '🍁', name: 'Maple Leaf' },
      { symbol: '❄️', name: 'Snowflake' },
      { symbol: '⛄', name: 'Snowman' },
      { symbol: '⛈️', name: 'Storm' },
      { symbol: '🌩️', name: 'Lightning' },
      { symbol: '🌲', name: 'Tree' },
      { symbol: '🏔️', name: 'Mountain' },
      { symbol: '🌅', name: 'Sunrise' },
      { symbol: '🌄', name: 'Sunset' },
    ]
  },
  actions: {
    name: 'Actions',
    items: [
      { symbol: '💃', name: 'Dancing' },
      { symbol: '🕺', name: 'Dancer' },
      { symbol: '🏃', name: 'Running' },
      { symbol: '🚶', name: 'Walking' },
      { symbol: '🤸', name: 'Jumping' },
      { symbol: '🧘', name: 'Relaxing' },
      { symbol: '👏', name: 'Clapping' },
      { symbol: '🙌', name: 'Celebrate' },
      { symbol: '👋', name: 'Waving' },
      { symbol: '👍', name: 'Thumbs Up' },
      { symbol: '✋', name: 'Stop' },
      { symbol: '👆', name: 'Pointing Up' },
      { symbol: '🤝', name: 'Together' },
      { symbol: '💪', name: 'Strong' },
      { symbol: '🎉', name: 'Party' },
      { symbol: '🎊', name: 'Confetti' },
    ]
  },
  music: {
    name: 'Music & Effects',
    items: [
      { symbol: '🎵', name: 'Notes' },
      { symbol: '🎶', name: 'Music' },
      { symbol: '🎼', name: 'Score' },
      { symbol: '🎤', name: 'Singing' },
      { symbol: '🎧', name: 'Listening' },
      { symbol: '🔔', name: 'Bell' },
      { symbol: '🔕', name: 'Quiet' },
      { symbol: '📢', name: 'Loud' },
      { symbol: '🔊', name: 'Volume Up' },
      { symbol: '🔉', name: 'Volume Down' },
      { symbol: '💥', name: 'Crash' },
      { symbol: '💫', name: 'Dizzy' },
      { symbol: '⚡', name: 'Electric' },
      { symbol: '🔥', name: 'Fire' },
      { symbol: '❤️', name: 'Heart' },
      { symbol: '💜', name: 'Purple Heart' },
      { symbol: '💙', name: 'Blue Heart' },
      { symbol: '💚', name: 'Green Heart' },
      { symbol: '❓', name: 'Question' },
      { symbol: '❗', name: 'Important' },
      { symbol: '⬆️', name: 'Up' },
      { symbol: '⬇️', name: 'Down' },
      { symbol: '➡️', name: 'Right' },
      { symbol: '⬅️', name: 'Left' },
    ]
  }
};

// ============================================================================
// TABS CONFIGURATION - Order matters!
// ============================================================================

export const STICKER_TABS = [
  { id: 'instruments', name: 'Instruments', icon: '🎻', data: INSTRUMENTS },
  { id: 'dynamics', name: 'Dynamics', icon: '🔊', data: DYNAMICS },
  { id: 'tempo', name: 'Tempo', icon: '🏃', data: TEMPO },
  { id: 'articulation', name: 'Articulation', icon: '•', data: ARTICULATION },
  { id: 'symbols', name: 'Symbols', icon: '𝄞', data: SYMBOLS },
  { id: 'form', name: 'Form', icon: '🅰️', data: FORM },
  { id: 'emojis', name: 'Emojis', icon: '😊', data: EMOJIS },
];

export default {
  INSTRUMENTS,
  DYNAMICS,
  TEMPO,
  ARTICULATION,
  SYMBOLS,
  FORM,
  EMOJIS,
  STICKER_TABS
};