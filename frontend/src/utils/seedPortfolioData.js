// Seed Portfolio Data — Run from browser console while logged in as teacher
// Usage: import('/src/utils/seedPortfolioData.js').then(m => m.seedChloePortfolio())
//
// Creates 3 realistic compositions, grades, reflections, and a portfolio for Chloe Davis

import { getDatabase, ref, get, set, update } from 'firebase/database';

// Mood color palette (matches DAW)
const COLORS = {
  Heroic: '#f59e0b',
  Mysterious: '#8b5cf6',
  Scary: '#ef4444',
  Hype: '#3b82f6',
  Upbeat: '#22c55e'
};

// ============================================================
// COMPOSITION 1: City Soundscape (Mysterious mood, Lesson 2 - Texture)
// ============================================================
const cityComposition = {
  placedLoops: [
    { id: 'c1', name: 'Mysterious Strings 1', file: '/projects/film-music-score/loops/Mysterious Strings 1.m4a', duration: 8, trackIndex: 0, startTime: 0, endTime: 8, volume: 0.7, color: COLORS.Mysterious, category: 'Mysterious', instrument: 'Strings', mood: 'Mysterious' },
    { id: 'c2', name: 'Mysterious Keys 1', file: '/projects/film-music-score/loops/Mysterious Keys 1.m4a', duration: 8, trackIndex: 1, startTime: 4, endTime: 12, volume: 0.6, color: COLORS.Mysterious, category: 'Mysterious', instrument: 'Keys', mood: 'Mysterious' },
    { id: 'c3', name: 'Mysterious Drums 1', file: '/projects/film-music-score/loops/Mysterious Drums 1.m4a', duration: 8, trackIndex: 2, startTime: 8, endTime: 16, volume: 0.5, color: COLORS.Mysterious, category: 'Mysterious', instrument: 'Drums', mood: 'Mysterious' },
    { id: 'c4', name: 'Mysterious Synth 2', file: '/projects/film-music-score/loops/Mysterious Synth 2.m4a', duration: 8, trackIndex: 3, startTime: 0, endTime: 8, volume: 0.4, color: COLORS.Mysterious, category: 'Mysterious', instrument: 'Synth', mood: 'Mysterious' },
    { id: 'c5', name: 'Mysterious Bass 1', file: '/projects/film-music-score/loops/Mysterious Bass 1.m4a', duration: 8, trackIndex: 4, startTime: 8, endTime: 16, volume: 0.6, color: COLORS.Mysterious, category: 'Mysterious', instrument: 'Bass', mood: 'Mysterious' },
    { id: 'c6', name: 'Mysterious Glockenspiel', file: '/projects/film-music-score/loops/Mysterious Glockenspiel.m4a', duration: 4, trackIndex: 0, startTime: 12, endTime: 16, volume: 0.5, color: COLORS.Mysterious, category: 'Mysterious', instrument: 'Other', mood: 'Mysterious' },
    { id: 'c7', name: 'Mysterious Strings 2', file: '/projects/film-music-score/loops/Mysterious Strings 2.m4a', duration: 8, trackIndex: 1, startTime: 16, endTime: 24, volume: 0.7, color: COLORS.Mysterious, category: 'Mysterious', instrument: 'Strings', mood: 'Mysterious' },
    { id: 'c8', name: 'Mysterious Synth 1', file: '/projects/film-music-score/loops/Mysterious Synth 1.m4a', duration: 8, trackIndex: 3, startTime: 16, endTime: 24, volume: 0.5, color: COLORS.Mysterious, category: 'Mysterious', instrument: 'Synth', mood: 'Mysterious' },
  ],
  compositionDuration: 24,
  loopCount: 8,
  reflection: {
    reviewType: 'self',
    star1: 'I used lots of different textures by layering strings, synth, and glockenspiel together',
    star2: 'The mysterious mood really fits the city at night video — it feels spooky and cool',
    wish: 'I could try adding more space between the layers so each instrument stands out more',
    vibe: 'Mysterious nighttime vibes',
    submittedAt: Date.now() - 86400000 * 5
  }
};

// ============================================================
// COMPOSITION 2: Epic Wildlife (Heroic mood, Lesson 3 - Form)
// ============================================================
const wildlifeComposition = {
  placedLoops: [
    // Section A (intro) - just strings
    { id: 'w1', name: 'Heroic Strings 1', file: '/projects/film-music-score/loops/Heroic Strings 1.m4a', duration: 8, trackIndex: 0, startTime: 0, endTime: 8, volume: 0.6, color: COLORS.Heroic, category: 'Heroic', instrument: 'Strings', mood: 'Heroic' },
    { id: 'w2', name: 'Heroic Piano 1', file: '/projects/film-music-score/loops/Heroic Piano 1.m4a', duration: 8, trackIndex: 1, startTime: 0, endTime: 8, volume: 0.4, color: COLORS.Heroic, category: 'Heroic', instrument: 'Keys', mood: 'Heroic' },
    // Section B (buildup) - add brass and drums
    { id: 'w3', name: 'Heroic Brass 1', file: '/projects/film-music-score/loops/Heroic Brass 1.m4a', duration: 8, trackIndex: 2, startTime: 8, endTime: 16, volume: 0.7, color: COLORS.Heroic, category: 'Heroic', instrument: 'Brass', mood: 'Heroic' },
    { id: 'w4', name: 'Heroic Drums 1', file: '/projects/film-music-score/loops/Heroic Drums 1.m4a', duration: 8, trackIndex: 3, startTime: 8, endTime: 16, volume: 0.6, color: COLORS.Heroic, category: 'Heroic', instrument: 'Drums', mood: 'Heroic' },
    { id: 'w5', name: 'Heroic Strings 2', file: '/projects/film-music-score/loops/Heroic Strings 2.m4a', duration: 8, trackIndex: 0, startTime: 8, endTime: 16, volume: 0.7, color: COLORS.Heroic, category: 'Heroic', instrument: 'Strings', mood: 'Heroic' },
    // Section C (climax) - everything!
    { id: 'w6', name: 'Heroic Vocals 1', file: '/projects/film-music-score/loops/Heroic Vocals 1.m4a', duration: 8, trackIndex: 4, startTime: 16, endTime: 24, volume: 0.5, color: COLORS.Heroic, category: 'Heroic', instrument: 'Vocals', mood: 'Heroic' },
    { id: 'w7', name: 'Heroic Brass 2', file: '/projects/film-music-score/loops/Heroic Brass 2.m4a', duration: 8, trackIndex: 2, startTime: 16, endTime: 24, volume: 0.8, color: COLORS.Heroic, category: 'Heroic', instrument: 'Brass', mood: 'Heroic' },
    { id: 'w8', name: 'Heroic Drums 3', file: '/projects/film-music-score/loops/Heroic Drums 3.m4a', duration: 8, trackIndex: 3, startTime: 16, endTime: 24, volume: 0.7, color: COLORS.Heroic, category: 'Heroic', instrument: 'Drums', mood: 'Heroic' },
    { id: 'w9', name: 'Heroic Strings 3', file: '/projects/film-music-score/loops/Heroic Strings 3.m4a', duration: 8, trackIndex: 0, startTime: 16, endTime: 24, volume: 0.8, color: COLORS.Heroic, category: 'Heroic', instrument: 'Strings', mood: 'Heroic' },
    { id: 'w10', name: 'Heroic Vibraphone', file: '/projects/film-music-score/loops/Heroic Vibraphone.m4a', duration: 8, trackIndex: 5, startTime: 16, endTime: 24, volume: 0.4, color: COLORS.Heroic, category: 'Heroic', instrument: 'Other', mood: 'Heroic' },
    // Outro - thin back out
    { id: 'w11', name: 'Heroic Strings 4', file: '/projects/film-music-score/loops/Heroic Strings 4.m4a', duration: 8, trackIndex: 0, startTime: 24, endTime: 32, volume: 0.5, color: COLORS.Heroic, category: 'Heroic', instrument: 'Strings', mood: 'Heroic' },
    { id: 'w12', name: 'Heroic Marimba', file: '/projects/film-music-score/loops/Heroic Marimba.m4a', duration: 4, trackIndex: 5, startTime: 24, endTime: 28, volume: 0.3, color: COLORS.Heroic, category: 'Heroic', instrument: 'Other', mood: 'Heroic' },
  ],
  compositionDuration: 32,
  loopCount: 12,
  reflection: {
    reviewType: 'partner',
    partnerName: 'Marcus',
    star1: 'The form is really clear — I can hear the intro build up to the climax with all the instruments',
    star2: 'The brass and drums entering at the same time in section B makes it feel powerful',
    wish: 'I tried making the outro longer so it feels less sudden when the music ends',
    vibe: 'Epic adventure vibes',
    submittedAt: Date.now() - 86400000 * 3
  }
};

// ============================================================
// COMPOSITION 3: Sports Highlights (Hype mood, Lesson 4 - Rhythm)
// ============================================================
const sportsComposition = {
  placedLoops: [
    { id: 's1', name: 'Hype Drums 1', file: '/projects/film-music-score/loops/Hype Drums 1.m4a', duration: 4, trackIndex: 0, startTime: 0, endTime: 4, volume: 0.7, color: COLORS.Hype, category: 'Hype', instrument: 'Drums', mood: 'Hype' },
    { id: 's2', name: 'Hype Bass 1', file: '/projects/film-music-score/loops/Hype Bass 1.m4a', duration: 4, trackIndex: 1, startTime: 0, endTime: 4, volume: 0.6, color: COLORS.Hype, category: 'Hype', instrument: 'Bass', mood: 'Hype' },
    { id: 's3', name: 'Hype Synth 1', file: '/projects/film-music-score/loops/Hype Synth 1.m4a', duration: 4, trackIndex: 2, startTime: 2, endTime: 6, volume: 0.5, color: COLORS.Hype, category: 'Hype', instrument: 'Synth', mood: 'Hype' },
    { id: 's4', name: 'Hype Drums 2', file: '/projects/film-music-score/loops/Hype Drums 2.m4a', duration: 4, trackIndex: 0, startTime: 4, endTime: 8, volume: 0.7, color: COLORS.Hype, category: 'Hype', instrument: 'Drums', mood: 'Hype' },
    { id: 's5', name: 'Hype Lead 1', file: '/projects/film-music-score/loops/Hype Lead 1.m4a', duration: 4, trackIndex: 3, startTime: 4, endTime: 8, volume: 0.6, color: COLORS.Hype, category: 'Hype', instrument: 'Other', mood: 'Hype' },
    { id: 's6', name: 'Hype Strings 1', file: '/projects/film-music-score/loops/Hype Strings 1.m4a', duration: 4, trackIndex: 4, startTime: 6, endTime: 10, volume: 0.5, color: COLORS.Hype, category: 'Hype', instrument: 'Strings', mood: 'Hype' },
    { id: 's7', name: 'Hype Guitar 1', file: '/projects/film-music-score/loops/Hype Guitar 1.m4a', duration: 4, trackIndex: 2, startTime: 8, endTime: 12, volume: 0.6, color: COLORS.Hype, category: 'Hype', instrument: 'Guitar', mood: 'Hype' },
    { id: 's8', name: 'Hype Drums 3', file: '/projects/film-music-score/loops/Hype Drums 3.m4a', duration: 4, trackIndex: 0, startTime: 8, endTime: 12, volume: 0.8, color: COLORS.Hype, category: 'Hype', instrument: 'Drums', mood: 'Hype' },
    { id: 's9', name: 'Hype Bass 2', file: '/projects/film-music-score/loops/Hype Bass 2.m4a', duration: 4, trackIndex: 1, startTime: 8, endTime: 12, volume: 0.7, color: COLORS.Hype, category: 'Hype', instrument: 'Bass', mood: 'Hype' },
    { id: 's10', name: 'Hype Lead 2', file: '/projects/film-music-score/loops/Hype Lead 2.m4a', duration: 4, trackIndex: 3, startTime: 10, endTime: 14, volume: 0.6, color: COLORS.Hype, category: 'Hype', instrument: 'Other', mood: 'Hype' },
    { id: 's11', name: 'Hype Synth 3', file: '/projects/film-music-score/loops/Hype Synth 3.m4a', duration: 4, trackIndex: 5, startTime: 12, endTime: 16, volume: 0.5, color: COLORS.Hype, category: 'Hype', instrument: 'Synth', mood: 'Hype' },
    { id: 's12', name: 'Hype Strings 2', file: '/projects/film-music-score/loops/Hype Strings 2.m4a', duration: 4, trackIndex: 4, startTime: 12, endTime: 16, volume: 0.6, color: COLORS.Hype, category: 'Hype', instrument: 'Strings', mood: 'Hype' },
  ],
  compositionDuration: 16,
  loopCount: 12,
  reflection: {
    reviewType: 'self',
    star1: 'I kept a strong beat going the whole time — the drums never stop which makes it feel like a real sports highlight',
    star2: 'Layering the synth and guitar on top of the drums gives it a lot of energy',
    wish: 'I could add a breakdown section where just the bass plays to give the listener a break before the beat drops again',
    vibe: 'Hype sports energy',
    submittedAt: Date.now() - 86400000 * 1
  }
};

export async function seedChloePortfolio() {
  const db = getDatabase();

  // Step 1: Find Chloe via username lookup
  console.log('Looking up viola995...');
  const usernameRef = ref(db, 'usernames/viola995');
  const usernameSnap = await get(usernameRef);

  if (!usernameSnap.exists()) {
    console.error('Username viola995 not found in Firebase. Make sure the backfill ran.');
    return;
  }

  const { classId, seatNumber } = usernameSnap.val();
  const studentUid = `pin-${classId}-${seatNumber}`;
  console.log(`Found Chloe: classId=${classId}, seat=${seatNumber}, uid=${studentUid}`);

  const now = Date.now();

  // Step 2: Write 3 compositions to studentWork
  const works = [
    {
      workId: 'fm-lesson2-city-composition',
      studentUid,
      classId,
      lessonId: 'fm-lesson2',
      activityId: 'city-composition',
      type: 'composition',
      status: 'graded',
      title: 'Midnight City',
      emoji: '🏙️',
      data: cityComposition,
      createdAt: now - 86400000 * 5,
      updatedAt: now - 86400000 * 5,
      submittedAt: now - 86400000 * 5
    },
    {
      workId: 'fm-lesson3-wildlife-composition',
      studentUid,
      classId,
      lessonId: 'fm-lesson3',
      activityId: 'wildlife-composition',
      type: 'composition',
      status: 'graded',
      title: 'Epic Safari',
      emoji: '🌍',
      data: wildlifeComposition,
      createdAt: now - 86400000 * 3,
      updatedAt: now - 86400000 * 3,
      submittedAt: now - 86400000 * 3
    },
    {
      workId: 'fm-lesson4-sports-composition',
      studentUid,
      classId,
      lessonId: 'fm-lesson4',
      activityId: 'sports-composition',
      type: 'composition',
      status: 'submitted',
      title: 'Basketball Highlights',
      emoji: '🏀',
      data: sportsComposition,
      createdAt: now - 86400000 * 1,
      updatedAt: now - 86400000 * 1,
      submittedAt: now - 86400000 * 1
    }
  ];

  for (const work of works) {
    const workRef = ref(db, `studentWork/${studentUid}/${work.workId}`);
    await set(workRef, work);
    console.log(`Wrote: ${work.workId} — "${work.title}"`);
  }

  // Step 3: Write grades for the first two (graded) compositions
  const gradesData = {
    'fm-lesson2': {
      grade: 'A',
      feedback: 'Excellent use of layering! The mysterious mood is very clear and the glockenspiel adds a nice sparkle on top. Great texture choices.',
      gradedAt: now - 86400000 * 4,
      gradedBy: 'teacher'
    },
    'fm-lesson3': {
      grade: 'B',
      feedback: 'Good form — I can hear the intro, buildup, climax, and outro. The climax section is really powerful with all the instruments. The outro could be a bit longer to give the piece a more natural ending.',
      gradedAt: now - 86400000 * 2,
      gradedBy: 'teacher'
    }
  };

  for (const [lessonId, grade] of Object.entries(gradesData)) {
    const gradeRef = ref(db, `grades/${classId}/${studentUid}/${lessonId}`);
    await set(gradeRef, grade);
    console.log(`Wrote grade: ${lessonId} → ${grade.grade}`);
  }

  // Step 4: Create portfolio with featured items + share token
  const shareToken = `ptf-${now}-${Math.random().toString(36).substr(2, 9)}`;

  const portfolio = {
    shareToken,
    isPublic: true,
    title: "Chloe's Music Portfolio",
    displayName: 'Chloe',
    className: 'Gen Music 1',
    featuredWork: [
      'fm-lesson2-city-composition',
      'fm-lesson3-wildlife-composition',
      'fm-lesson4-sports-composition'
    ],
    createdAt: now,
    updatedAt: now
  };

  await set(ref(db, `portfolios/${studentUid}`), portfolio);
  await set(ref(db, `portfolioTokens/${shareToken}`), { studentUid, createdAt: now });

  console.log('\n=== DONE! ===');
  console.log(`Student UID: ${studentUid}`);
  console.log(`Portfolio share token: ${shareToken}`);
  console.log(`Public URL: ${window.location.origin}/portfolio/${shareToken}`);
  console.log('\nLog in as Chloe (viola995 / 9443) to see the Portfolio tab.');
  console.log('Or visit the public URL above to see the shared view.');

  return { studentUid, shareToken, publicUrl: `${window.location.origin}/portfolio/${shareToken}` };
}
