// Mood Match Game Configuration
// Class voting activity - no right/wrong answers, discussion-focused

// Mood categories with colors
export const MOOD_CATEGORIES = [
  {
    id: 'heroic',
    name: 'Heroic',
    description: 'Powerful, bold',
    color: '#EF4444' // red
  },
  {
    id: 'scary',
    name: 'Scary',
    description: 'Tense, frightening',
    color: '#7C3AED' // purple
  },
  {
    id: 'mysterious',
    name: 'Mysterious',
    description: 'Intriguing, curious',
    color: '#3B82F6' // blue
  },
  {
    id: 'upbeat',
    name: 'Upbeat',
    description: 'Happy, positive',
    color: '#10B981' // green
  },
  {
    id: 'hype',
    name: 'Hype',
    description: 'Exciting, energizing',
    color: '#F59E0B' // orange/amber
  }
];

// 8 loops for the game - mix of clear and ambiguous moods
export const GAME_LOOPS = [
  {
    id: 'loop-1',
    name: 'Heroic Brass 2',
    file: '/projects/film-music-score/loops/Heroic Brass 2.mp3',
    // Clear heroic - good starting loop
    notes: 'Brass fanfare, major key, triumphant feel'
  },
  {
    id: 'loop-2',
    name: 'Scary Strings 2',
    file: '/projects/film-music-score/loops/Scary Strings 2.mp3',
    // Clear scary
    notes: 'Tense strings, dissonant, builds suspense'
  },
  {
    id: 'loop-3',
    name: 'Mysterious Synth 1',
    file: '/projects/film-music-score/loops/Mysterious Synth 1.mp3',
    // Could be mysterious or scary - good discussion
    notes: 'Atmospheric synth, could feel eerie or curious'
  },
  {
    id: 'loop-4',
    name: 'Upbeat Piano',
    file: '/projects/film-music-score/loops/Upbeat Piano.mp3',
    // Clear upbeat
    notes: 'Bright piano, major key, happy feel'
  },
  {
    id: 'loop-5',
    name: 'Heroic Strings 1',
    file: '/projects/film-music-score/loops/Heroic Strings 1.mp3',
    // Could be heroic or mysterious - strings can go either way
    notes: 'Sweeping strings, could feel epic or atmospheric'
  },
  {
    id: 'loop-6',
    name: 'Scary Synth 3',
    file: '/projects/film-music-score/loops/Scary Synth 3.mp3',
    // Clear scary
    notes: 'Low synth, ominous, horror feel'
  },
  {
    id: 'loop-7',
    name: 'Mysterious Bass 1',
    file: '/projects/film-music-score/loops/Mysterious Bass 1.mp3',
    // Could be mysterious or scary - ambiguous low sounds
    notes: 'Deep bass, could feel curious or threatening'
  },
  {
    id: 'loop-8',
    name: 'Upbeat Drums 1',
    file: '/projects/film-music-score/loops/Upbeat Drums 1.mp3',
    // Could be upbeat or heroic - energetic drums
    notes: 'Driving rhythm, could feel happy or powerful'
  }
];

// Discussion prompt generators based on vote distribution
export const generateDiscussionPrompt = (tally, totalVotes) => {
  const moods = Object.entries(tally).sort((a, b) => b[1] - a[1]);

  if (moods.length === 0) {
    return "No votes yet. What mood do you think this loop creates?";
  }

  const [topMood, topCount] = moods[0];
  const topPercentage = (topCount / totalVotes) * 100;
  const topMoodName = MOOD_CATEGORIES.find(m => m.id === topMood)?.name || topMood;

  // One mood has >60% of votes - clear consensus
  if (topPercentage > 60) {
    const descriptions = {
      heroic: 'powerful',
      scary: 'frightening',
      mysterious: 'intriguing',
      upbeat: 'happy',
      hype: 'exciting'
    };
    return `Most picked ${topMoodName}. What made it feel ${descriptions[topMood] || 'that way'}?`;
  }

  // Two moods are close (within 20% of each other)
  if (moods.length >= 2) {
    const [secondMood, secondCount] = moods[1];
    const secondPercentage = (secondCount / totalVotes) * 100;
    const secondMoodName = MOOD_CATEGORIES.find(m => m.id === secondMood)?.name || secondMood;

    if (topPercentage - secondPercentage <= 20) {
      return `Split between ${topMoodName} and ${secondMoodName}. What's the difference?`;
    }
  }

  // Check for outliers (1-2 votes for a minority mood)
  const outliers = moods.filter(([_, count]) => count >= 1 && count <= 2);
  if (outliers.length > 0 && moods.length > 2) {
    const [outlierMood, outlierCount] = outliers[0];
    const outlierMoodName = MOOD_CATEGORIES.find(m => m.id === outlierMood)?.name || outlierMood;
    return `${outlierCount} ${outlierCount === 1 ? 'person' : 'people'} picked ${outlierMoodName}. Interesting choice—why might that be?`;
  }

  // Votes are spread evenly (no mood has >40%)
  if (topPercentage <= 40 && moods.length >= 3) {
    return "Votes are spread out! This loop has mixed feelings. Why?";
  }

  // Default
  return `Most picked ${topMoodName}. What sounds made you think of that mood?`;
};

// Summary insights based on all 8 loops
export const generateSummaryInsight = () => {
  return "Key Insight: Mood is somewhat subjective! The same music can feel different to different people—and that's okay.";
};
