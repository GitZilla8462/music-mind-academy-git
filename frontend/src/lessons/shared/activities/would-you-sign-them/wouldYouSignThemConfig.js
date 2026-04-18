// Would You Sign Them? — Configuration
// Small-group game for Unit 3 Lesson 3 (bonus)
// 32 evidence statements (8 per category) — players identify which of the 4 checklist points each supports
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

// 32 evidence statements — each maps to one checklist point (8 per category)
// Large pool so each 8-round game feels different
export const STATEMENTS = [
  // ===== UNIQUE SOUND (8) =====
  {
    id: 'w1',
    text: "Their mix of jazz guitar over trap beats doesn't sound like anything else in the library.",
    answer: 'unique-sound',
    explanation: "UNIQUE SOUND — blending two unexpected genres creates a sound nobody else has.",
  },
  {
    id: 'w5',
    text: "They layer live cello with electronic production — I've never heard that combination before.",
    answer: 'unique-sound',
    explanation: "UNIQUE SOUND — an unusual instrument pairing that sets them apart from everyone else.",
  },
  {
    id: 'w9',
    text: "They record their vocals through a broken speaker on purpose — it gives everything this gritty, lo-fi texture.",
    answer: 'unique-sound',
    explanation: "UNIQUE SOUND — using unconventional recording techniques creates a signature sound.",
  },
  {
    id: 'w10',
    text: "They sing in three different languages in a single song, blending Korean pop melodies with reggaeton rhythms.",
    answer: 'unique-sound',
    explanation: "UNIQUE SOUND — mixing multiple languages and genres in one track is something almost nobody does.",
  },
  {
    id: 'w11',
    text: "Their beats are made entirely from sounds they recorded in their school cafeteria — trays, forks, conversations.",
    answer: 'unique-sound',
    explanation: "UNIQUE SOUND — turning everyday noises into music is wildly creative and impossible to copy.",
  },
  {
    id: 'w12',
    text: "They play the steel drums over heavy metal guitar riffs. It shouldn't work, but it sounds incredible.",
    answer: 'unique-sound',
    explanation: "UNIQUE SOUND — pairing instruments from completely different worlds creates something fresh.",
  },
  {
    id: 'w13',
    text: "If you played me 10 songs and one of them was theirs, I'd spot it immediately. Nobody sounds like them.",
    answer: 'unique-sound',
    explanation: "UNIQUE SOUND — being instantly recognizable means they've built a truly distinct style.",
  },
  {
    id: 'w14',
    text: "They tune their guitar way lower than normal and run it through effects that make it sound like a whale singing.",
    answer: 'unique-sound',
    explanation: "UNIQUE SOUND — experimenting with tuning and effects creates a one-of-a-kind sonic identity.",
  },

  // ===== COMPELLING STORY (8) =====
  {
    id: 'w2',
    text: "They grew up in a small fishing village and started recording songs on a borrowed phone.",
    answer: 'compelling-story',
    explanation: "COMPELLING STORY — a vivid origin story makes you care about the artist as a person.",
  },
  {
    id: 'w6',
    text: "After their mom's accident, music became their only way to process what happened.",
    answer: 'compelling-story',
    explanation: "COMPELLING STORY — a deeply personal reason for making music that gives it emotional weight.",
  },
  {
    id: 'w15',
    text: "They're a deaf musician who creates music by feeling vibrations through the floor.",
    answer: 'compelling-story',
    explanation: "COMPELLING STORY — overcoming a major challenge to make music is a story people connect with deeply.",
  },
  {
    id: 'w16',
    text: "They started writing songs to help their little sister fall asleep, and now thousands of people use them for the same thing.",
    answer: 'compelling-story',
    explanation: "COMPELLING STORY — music born from love for family resonates with everyone.",
  },
  {
    id: 'w17',
    text: "They moved to a new country at age 12 speaking zero English and learned the language entirely through song lyrics.",
    answer: 'compelling-story',
    explanation: "COMPELLING STORY — using music to bridge cultures and languages is powerful and relatable.",
  },
  {
    id: 'w18',
    text: "They were told by their school choir director that they couldn't sing. Two years later they had a million streams.",
    answer: 'compelling-story',
    explanation: "COMPELLING STORY — proving doubters wrong is a narrative fans love to rally behind.",
  },
  {
    id: 'w19',
    text: "Every song on their album is a letter to a different person who changed their life — teachers, friends, even a bus driver.",
    answer: 'compelling-story',
    explanation: "COMPELLING STORY — personal, specific dedications show depth and make listeners curious.",
  },
  {
    id: 'w20',
    text: "They build all their own instruments out of recycled materials from their neighborhood.",
    answer: 'compelling-story',
    explanation: "COMPELLING STORY — resourcefulness and creativity woven together make a story worth sharing.",
  },

  // ===== SIGNS OF GROWTH (8) =====
  {
    id: 'w3',
    text: "Six months ago they had 80 followers. Now they have over 4,000.",
    answer: 'signs-of-growth',
    explanation: "SIGNS OF GROWTH — a 50x jump in followers in half a year shows serious momentum.",
  },
  {
    id: 'w7',
    text: "They went from busking in subway stations to headlining a 500-person festival stage.",
    answer: 'signs-of-growth',
    explanation: "SIGNS OF GROWTH — going from street performing to festival headliner shows clear upward trajectory.",
  },
  {
    id: 'w21',
    text: "Their first song got 200 plays. Their newest one got 200,000 — and it's only been out two weeks.",
    answer: 'signs-of-growth',
    explanation: "SIGNS OF GROWTH — a 1000x increase in plays shows their audience is expanding fast.",
  },
  {
    id: 'w22',
    text: "Three different music blogs all featured them in the same month without being asked.",
    answer: 'signs-of-growth',
    explanation: "SIGNS OF GROWTH — organic press coverage from multiple sources means the buzz is real.",
  },
  {
    id: 'w23',
    text: "Last year they played open mics. This year two established artists asked to collaborate with them.",
    answer: 'signs-of-growth',
    explanation: "SIGNS OF GROWTH — when bigger artists reach out, it proves you're on the rise.",
  },
  {
    id: 'w24',
    text: "Their live shows used to have 15 people. Last weekend 300 showed up and they had to turn people away.",
    answer: 'signs-of-growth',
    explanation: "SIGNS OF GROWTH — a 20x increase in live audience means word is spreading fast.",
  },
  {
    id: 'w25',
    text: "They released their first EP in January. By March it was on 50 different fan-made playlists.",
    answer: 'signs-of-growth',
    explanation: "SIGNS OF GROWTH — fans actively sharing your music on their own playlists shows organic momentum.",
  },
  {
    id: 'w26',
    text: "Their comment section used to be empty. Now every post has hundreds of replies from fans in different countries.",
    answer: 'signs-of-growth',
    explanation: "SIGNS OF GROWTH — growing international engagement shows the fanbase is scaling beyond local reach.",
  },

  // ===== GUT FEELING (8) =====
  {
    id: 'w4',
    text: "I can't explain it, but every time their track comes on I turn the volume up.",
    answer: 'gut-feeling',
    explanation: "GUT FEELING — you can't put it into words, but something about them grabs you.",
  },
  {
    id: 'w8',
    text: "I listened to their whole catalog twice yesterday and I still want to hear more.",
    answer: 'gut-feeling',
    explanation: "GUT FEELING — you're drawn back without a logical reason. That's pure instinct.",
  },
  {
    id: 'w27',
    text: "I don't even listen to this genre normally, but something about their music just pulls me in.",
    answer: 'gut-feeling',
    explanation: "GUT FEELING — when music crosses genre barriers and grabs you anyway, that's pure instinct.",
  },
  {
    id: 'w28',
    text: "I showed their song to five different friends and every single one asked 'who is this?' within 30 seconds.",
    answer: 'gut-feeling',
    explanation: "GUT FEELING — when everyone reacts the same way without being told what to think, there's something special.",
  },
  {
    id: 'w29',
    text: "There's no hit single or viral moment — I just have a feeling they're about to blow up.",
    answer: 'gut-feeling',
    explanation: "GUT FEELING — sometimes you sense potential before there's hard evidence to back it up.",
  },
  {
    id: 'w30',
    text: "I caught myself humming their melody in the shower and I only heard the song once.",
    answer: 'gut-feeling',
    explanation: "GUT FEELING — a melody that sticks after one listen is a sign of something undeniable.",
  },
  {
    id: 'w31',
    text: "Honestly? On paper they're nothing special. But when you press play, something just clicks.",
    answer: 'gut-feeling',
    explanation: "GUT FEELING — the 'it factor' doesn't always show up in stats. Sometimes you just feel it.",
  },
  {
    id: 'w32',
    text: "I keep coming back to check if they've dropped anything new, even though I follow hundreds of artists.",
    answer: 'gut-feeling',
    explanation: "GUT FEELING — when one artist stands out from hundreds, your instincts are telling you something.",
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
