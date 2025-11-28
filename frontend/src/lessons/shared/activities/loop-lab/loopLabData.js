// loop-lab/loopLabData.js - Data and configuration

export const loopData = {
  Heroic: {
    Bass: ['/projects/film-music-score/loops/Heroic Bass 1.mp3'],
    Brass: ['/projects/film-music-score/loops/Heroic Brass 2.mp3'],
    Drums: ['/projects/film-music-score/loops/Heroic Drums 1.mp3', '/projects/film-music-score/loops/Heroic Drums 2.mp3'],
    Strings: ['/projects/film-music-score/loops/Heroic Strings 1.mp3', '/projects/film-music-score/loops/Heroic Strings 2.mp3', '/projects/film-music-score/loops/Heroic Strings 3.mp3'],
    Synth: ['/projects/film-music-score/loops/Heroic Synth 1.mp3', '/projects/film-music-score/loops/Heroic Synth 2.mp3'],
    Vocals: ['/projects/film-music-score/loops/Heroic Vocals.mp3']
  },
  Hype: {
    Bass: ['/projects/film-music-score/loops/Hype Bass 1.wav', '/projects/film-music-score/loops/Hype Bass 2.wav'],
    Drums: ['/projects/film-music-score/loops/Hype Drums 1.wav', '/projects/film-music-score/loops/Hype Drums 2.wav', '/projects/film-music-score/loops/Hype Drums 3.wav'],
    Guitar: ['/projects/film-music-score/loops/Hype Guitar 1.wav', '/projects/film-music-score/loops/Hype Guitar 2.wav'],
    Keys: ['/projects/film-music-score/loops/Hype Keys 1.wav'],
    Synth: ['/projects/film-music-score/loops/Hype Synth 1.wav', '/projects/film-music-score/loops/Hype Synth 2.wav'],
    'Synth Lead': ['/projects/film-music-score/loops/Hype Synth Lead 1.wav', '/projects/film-music-score/loops/Hype Synth Lead 2.wav', '/projects/film-music-score/loops/Hype Synth Lead 3.wav']
  },
  Mysterious: {
    Bass: ['/projects/film-music-score/loops/Mysterious Bass 1.mp3', '/projects/film-music-score/loops/Mysterious Bass 2.mp3'],
    Drums: ['/projects/film-music-score/loops/Mysterious  Drums 2.mp3'],
    Guitar: ['/projects/film-music-score/loops/Mysterious Guitar.mp3'],
    Strings: ['/projects/film-music-score/loops/Mysterious Strings.mp3', '/projects/film-music-score/loops/Mysterious Strings 2.mp3'],
    Synth: ['/projects/film-music-score/loops/Mysterious Synth 1.mp3', '/projects/film-music-score/loops/Mysterious Synth 2.mp3', '/projects/film-music-score/loops/Mysterious  Synth 3.mp3']
  },
  Scary: {
    Bass: ['/projects/film-music-score/loops/Scary Bass 1.mp3', '/projects/film-music-score/loops/Scary Bass 2.mp3', '/projects/film-music-score/loops/Scary Bass 3.mp3'],
    Brass: ['/projects/film-music-score/loops/Scary Brass 1.mp3'],
    Percussion: ['/projects/film-music-score/loops/Scary Percussion 1.mp3', '/projects/film-music-score/loops/Scary Percussion 2.mp3'],
    Strings: ['/projects/film-music-score/loops/Scary Strings 1.mp3', '/projects/film-music-score/loops/Scary Strings 2.mp3', '/projects/film-music-score/loops/Scary Strings 3.mp3', '/projects/film-music-score/loops/Scary Strings 4.mp3'],
    Synth: ['/projects/film-music-score/loops/Scary Synth 1.mp3', '/projects/film-music-score/loops/Scary Synth 2.mp3', '/projects/film-music-score/loops/Scary Synth 3.mp3', '/projects/film-music-score/loops/Scary Synth 4.mp3']
  },
  Upbeat: {
    Bells: ['/projects/film-music-score/loops/Upbeat Bells.mp3'],
    Clarinet: ['/projects/film-music-score/loops/Upbeat Clarinet.mp3'],
    Drums: ['/projects/film-music-score/loops/Upbeat Drums 1.mp3', '/projects/film-music-score/loops/Upbeat Drums 2.mp3'],
    'Electric Bass': ['/projects/film-music-score/loops/Upbeat Electric Bass.mp3'],
    'Electric Guitar': ['/projects/film-music-score/loops/Upbeat Electric Guitar.mp3'],
    Piano: ['/projects/film-music-score/loops/Upbeat Piano.mp3'],
    'String Bass': ['/projects/film-music-score/loops/Upbeat String Bass.mp3'],
    Strings: ['/projects/film-music-score/loops/Upbeat Strings.mp3']
  }
};

export const categories = Object.keys(loopData);

export const instrumentIcons = {
  Bass: '🎸', Brass: '🎺', Drums: '🥁', Strings: '🎻', Synth: '🎹', Vocals: '🎤',
  Guitar: '🎸', Keys: '🎹', 'Synth Lead': '🎛️', Percussion: '🪘', Bells: '🔔',
  Clarinet: '🎷', 'Electric Bass': '🎸', 'Electric Guitar': '🎸', Piano: '🎹', 'String Bass': '🎻'
};

export const categoryThemes = {
  Heroic: { bg: 'from-amber-600 via-orange-600 to-red-600', emoji: '⚔️', name: 'HEROIC' },
  Hype: { bg: 'from-pink-600 via-red-500 to-orange-500', emoji: '🔥', name: 'HYPE' },
  Mysterious: { bg: 'from-purple-700 via-indigo-600 to-blue-700', emoji: '🔮', name: 'MYSTERIOUS' },
  Scary: { bg: 'from-gray-800 via-red-900 to-black', emoji: '👻', name: 'SCARY' },
  Upbeat: { bg: 'from-green-500 via-emerald-500 to-teal-500', emoji: '☀️', name: 'UPBEAT' }
};

export const powerUps = {
  double: { id: 'double', name: '2X', emoji: '✨', desc: 'Double points!', color: 'from-yellow-400 to-amber-500' },
  shield: { id: 'shield', name: 'SHIELD', emoji: '🛡️', desc: 'No penalties!', color: 'from-blue-400 to-cyan-500' },
  hint: { id: 'hint', name: 'HINT', emoji: '💡', desc: 'See count!', color: 'from-purple-400 to-pink-500' },
  bonus: { id: 'bonus', name: '+15', emoji: '🎁', desc: 'Free points!', color: 'from-green-400 to-emerald-500' },
  freebie: { id: 'freebie', name: 'FREE', emoji: '🎯', desc: 'One free!', color: 'from-orange-400 to-red-500' }
};

export const scoring = { correct: 15, wrong: 5, perfect: 25, quick: 10, streakPer: 5, maxStreak: 20 };

export const getRandomPowerUp = () => {
  if (Math.random() > 0.35) return null;
  const keys = Object.keys(powerUps);
  return powerUps[keys[Math.floor(Math.random() * keys.length)]];
};

export const calcStreakBonus = (streak) => streak < 2 ? 0 : Math.min(streak * scoring.streakPer, scoring.maxStreak);

export const getResultMessage = (correct, total, isPerfect, streak) => {
  if (isPerfect && streak >= 3) return { text: 'ON FIRE! 🔥', color: 'text-orange-400' };
  if (isPerfect) return { text: 'PERFECT! ⭐', color: 'text-yellow-400' };
  if (correct >= total - 1 && correct > 0) return { text: 'SO CLOSE!', color: 'text-green-400' };
  if (correct > 0) return { text: 'NICE TRY!', color: 'text-blue-400' };
  return { text: 'KEEP GOING!', color: 'text-purple-400' };
};