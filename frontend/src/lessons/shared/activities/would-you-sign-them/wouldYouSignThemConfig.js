// Would You Sign Them? — Configuration
// Small-group game for Unit 3 Lesson 3 (bonus)
// 8 evidence statements — players identify which of the 4 checklist points each supports
// Groups of 2–3, join with 4-digit codes, speed bonus scoring

export const TOTAL_ROUNDS = 8;
export const ANSWER_TIME = 15000; // 15s to answer each round
export const BETWEEN_ROUND_DELAY = 2000; // 2s pause before next round

// The 4-Point Checklist options
export const CHECKLIST_OPTIONS = [
  { value: 'unique-sound', label: 'Unique Sound', color: '#F59E0B', emoji: '\u{1F3B5}' },
  { value: 'compelling-story', label: 'Compelling Story', color: '#3B82F6', emoji: '\u{1F4D6}' },
  { value: 'signs-of-growth', label: 'Signs of Growth', color: '#10B981', emoji: '\u{1F4C8}' },
  { value: 'gut-feeling', label: 'Gut Feeling', color: '#8B5CF6', emoji: '\u{1F525}' },
];

// 8 evidence statements — each maps to one checklist point
// Designed to be trickier than the Fact/Opinion game's "which point" set
export const STATEMENTS = [
  {
    id: 'w1',
    text: "Their mix of jazz guitar over trap beats doesn't sound like anything else in the library.",
    answer: 'unique-sound',
    explanation: "UNIQUE SOUND — blending two unexpected genres creates a sound nobody else has.",
  },
  {
    id: 'w2',
    text: "They grew up in a small fishing village and started recording songs on a borrowed phone.",
    answer: 'compelling-story',
    explanation: "COMPELLING STORY — a vivid origin story makes you care about the artist as a person.",
  },
  {
    id: 'w3',
    text: "Six months ago they had 80 followers. Now they have over 4,000.",
    answer: 'signs-of-growth',
    explanation: "SIGNS OF GROWTH — a 50x jump in followers in half a year shows serious momentum.",
  },
  {
    id: 'w4',
    text: "I can't explain it, but every time their track comes on I turn the volume up.",
    answer: 'gut-feeling',
    explanation: "GUT FEELING — you can't put it into words, but something about them grabs you.",
  },
  {
    id: 'w5',
    text: "They layer live cello with electronic production — I've never heard that combination before.",
    answer: 'unique-sound',
    explanation: "UNIQUE SOUND — an unusual instrument pairing that sets them apart from everyone else.",
  },
  {
    id: 'w6',
    text: "After their mom's accident, music became their only way to process what happened.",
    answer: 'compelling-story',
    explanation: "COMPELLING STORY — a deeply personal reason for making music that gives it emotional weight.",
  },
  {
    id: 'w7',
    text: "They went from busking in subway stations to headlining a 500-person festival stage.",
    answer: 'signs-of-growth',
    explanation: "SIGNS OF GROWTH — going from street performing to festival headliner shows clear upward trajectory.",
  },
  {
    id: 'w8',
    text: "I listened to their whole catalog twice yesterday and I still want to hear more.",
    answer: 'gut-feeling',
    explanation: "GUT FEELING — you're drawn back without a logical reason. That's pure instinct.",
  },
];

// Shuffle helper
export const shuffleArray = (arr) => [...arr].sort(() => Math.random() - 0.5);

// Calculate scores for a round
// +10 base for correct, +5 speed bonus (scaled by how fast within ANSWER_TIME)
export const calculateScore = (isCorrect, answerTimeMs) => {
  if (!isCorrect) return 0;
  const base = 10;
  const maxBonus = 5;
  const secondsElapsed = answerTimeMs / 1000;
  const maxSeconds = ANSWER_TIME / 1000;
  const bonus = Math.round(maxBonus * Math.max(0, 1 - secondsElapsed / maxSeconds));
  return base + bonus;
};
