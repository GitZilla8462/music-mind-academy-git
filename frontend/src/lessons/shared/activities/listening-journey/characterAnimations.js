// File: /lessons/shared/activities/listening-journey/characterAnimations.js
// Maps musical properties to visual animation parameters

// Tempo -> walk speed multiplier
export const TEMPO_SPEEDS = [
  { id: 'largo', label: 'Largo', bpm: 40, speed: 0.3, icon: '🐢' },
  { id: 'adagio', label: 'Adagio', bpm: 60, speed: 0.5, icon: '🚶' },
  { id: 'andante', label: 'Andante', bpm: 76, speed: 1.0, icon: '🚶‍♂️' },
  { id: 'moderato', label: 'Moderato', bpm: 108, speed: 1.5, icon: '🚶‍♂️💨' },
  { id: 'allegro', label: 'Allegro', bpm: 120, speed: 2.0, icon: '🏃' },
  { id: 'presto', label: 'Presto', bpm: 168, speed: 3.0, icon: '💨' }
];

// Dynamics -> scale and opacity
export const DYNAMICS_LEVELS = [
  { id: 'pp', label: 'pp', name: 'Pianissimo', scale: 0.6, opacity: 0.5, brightness: 0.6, icon: '🤫' },
  { id: 'p', label: 'p', name: 'Piano', scale: 0.75, opacity: 0.65, brightness: 0.75, icon: '🤲' },
  { id: 'mp', label: 'mp', name: 'Mezzo Piano', scale: 0.85, opacity: 0.8, brightness: 0.85, icon: '👐' },
  { id: 'mf', label: 'mf', name: 'Mezzo Forte', scale: 1.0, opacity: 1.0, brightness: 1.0, icon: '👏' },
  { id: 'f', label: 'f', name: 'Forte', scale: 1.15, opacity: 1.0, brightness: 1.15, icon: '💪' },
  { id: 'ff', label: 'ff', name: 'Fortissimo', scale: 1.3, opacity: 1.0, brightness: 1.3, icon: '🔊' }
];

// Articulation -> movement style
export const ARTICULATION_STYLES = [
  {
    id: 'legato',
    label: 'Legato',
    description: 'Smooth & connected',
    icon: '🎵',
    // CSS animation: smooth glide
    animation: 'legato-walk',
    cssKeyframes: `
      @keyframes legato-walk {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-4px); }
      }
    `,
    animationDuration: '2s',
    timingFunction: 'ease-in-out'
  },
  {
    id: 'staccato',
    label: 'Staccato',
    description: 'Short & bouncy',
    icon: '⚡',
    // CSS animation: bouncy hop
    animation: 'staccato-walk',
    cssKeyframes: `
      @keyframes staccato-walk {
        0%, 100% { transform: translateY(0); }
        30% { transform: translateY(-16px); }
        60% { transform: translateY(0); }
      }
    `,
    animationDuration: '0.5s',
    timingFunction: 'ease-out'
  },
  {
    id: 'marcato',
    label: 'Marcato',
    description: 'Strong & accented',
    icon: '🥁',
    // CSS animation: stomp
    animation: 'marcato-walk',
    cssKeyframes: `
      @keyframes marcato-walk {
        0% { transform: translateY(0) scaleY(1); }
        20% { transform: translateY(-12px) scaleY(1.05); }
        50% { transform: translateY(0) scaleY(0.95); }
        70% { transform: translateY(0) scaleY(1); }
        100% { transform: translateY(0) scaleY(1); }
      }
    `,
    animationDuration: '0.8s',
    timingFunction: 'ease-in'
  }
];

// Movement -> animation state + cycle speed override
export const MOVEMENT_TYPES = [
  { id: 'crawl', label: 'Crawl', icon: '🐛', anim: 'walk', cycleDuration: 1.2, scrollMultiplier: 0.3 },
  { id: 'walk', label: 'Walk', icon: '🚶', anim: 'walk', cycleDuration: 0.6, scrollMultiplier: 1.0 },
  { id: 'run', label: 'Run', icon: '🏃', anim: 'run', cycleDuration: 0.35, scrollMultiplier: 2.0 },
  { id: 'sprint', label: 'Sprint', icon: '💨', anim: 'run', cycleDuration: 0.2, scrollMultiplier: 3.5 },
];

export const getTempoById = (id) => TEMPO_SPEEDS.find(t => t.id === id) || TEMPO_SPEEDS[2];
export const getDynamicsById = (id) => DYNAMICS_LEVELS.find(d => d.id === id) || DYNAMICS_LEVELS[3];
export const getArticulationById = (id) => ARTICULATION_STYLES.find(a => a.id === id) || ARTICULATION_STYLES[0];
export const getMovementById = (id) => MOVEMENT_TYPES.find(m => m.id === id) || MOVEMENT_TYPES.find(m => m.id === 'walk');
