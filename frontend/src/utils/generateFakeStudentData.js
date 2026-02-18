// Dev utility: Generate fake Listening Journey data for all students in a class
// Run from browser console: await generateFakeLJData('-Olczy2I-J3xC1kw_mcb')
//
// This writes directly to Firebase:
//   studentWork/{seatUid}/ll-lesson3-listening-journey
//   submissions/{classId}/ll-lesson3/{seatUid}

import { getDatabase, ref, get, set } from 'firebase/database';

const database = getDatabase();

const SKIES = ['clear-day', 'golden-hour', 'stormy', 'night', 'sunrise', 'overcast', 'cosmic', 'aurora'];
const SCENES = ['blue-forest', 'mountain-peak', 'winter-night', 'night-mountain', 'dark-forest', 'autumn-forest', 'city'];
const GROUNDS = ['grass', 'pavement', 'rock', 'water', 'sand'];
const TEMPOS = ['largo', 'adagio', 'andante', 'moderato', 'allegro', 'presto'];
const DYNAMICS = ['pp', 'p', 'mp', 'mf', 'f', 'ff'];
const WEATHERS = ['none', 'none', 'none', 'rain', 'snow']; // bias toward no weather
const CHARACTERS = [
  { id: 'dog', name: 'Dog', type: 'sprite', frameSize: 48, displayScale: 1.3, sprites: {
    idle: { src: '/images/characters/dog/idle.png', frames: 4 },
    walk: { src: '/images/characters/dog/walk.png', frames: 6 },
    run: { src: '/images/characters/dog/run.png', frames: 6 },
  }},
  { id: 'cat', name: 'Cat', type: 'sprite', frameSize: 48, displayScale: 1.3, sprites: {
    idle: { src: '/images/characters/cat/idle.png', frames: 4 },
    walk: { src: '/images/characters/cat/walk.png', frames: 6 },
    run: { src: '/images/characters/cat/run.png', frames: 6 },
  }},
  { id: 'dog2', name: 'Dog 2', type: 'sprite', frameSize: 48, displayScale: 1.3, sprites: {
    idle: { src: '/images/characters/dog2/idle.png', frames: 4 },
    walk: { src: '/images/characters/dog2/walk.png', frames: 6 },
    run: { src: '/images/characters/dog2/run.png', frames: 6 },
  }},
  { id: 'cat2', name: 'Cat 2', type: 'sprite', frameSize: 48, displayScale: 1.3, sprites: {
    idle: { src: '/images/characters/cat2/idle.png', frames: 4 },
    walk: { src: '/images/characters/cat2/walk.png', frames: 6 },
    run: { src: '/images/characters/cat2/run.png', frames: 6 },
  }},
];

const SECTION_COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];
const SECTION_LABELS = [
  ['A', 'Sneaky Start'], ['B', 'Building Energy'], ["A'", 'Explosive Return'],
];

const STICKER_POOL = [
  { render: 'emoji', icon: '🎺', name: 'Trumpet' },
  { render: 'emoji', icon: '🥁', name: 'Drums' },
  { render: 'emoji', icon: '🎻', name: 'Violin' },
  { render: 'emoji', icon: '⬆️', name: 'Getting Louder' },
  { render: 'emoji', icon: '⬇️', name: 'Getting Softer' },
  { render: 'emoji', icon: '🔥', name: 'Fire' },
  { render: 'emoji', icon: '❄️', name: 'Ice' },
  { render: 'emoji', icon: '⭐', name: 'Star' },
  { render: 'emoji', icon: '💀', name: 'Spooky' },
  { render: 'emoji', icon: '🏃', name: 'Fast' },
  { render: 'symbol', icon: 'ff', name: 'Fortissimo', color: '#EF4444' },
  { render: 'symbol', icon: 'pp', name: 'Pianissimo', color: '#3B82F6' },
  { render: 'crescendo', icon: '<', name: 'Crescendo' },
  { render: 'decrescendo', icon: '>', name: 'Decrescendo' },
];

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const rand = (min, max) => min + Math.random() * (max - min);

// Mountain King sections (lesson 3 preset)
const BASE_SECTIONS = [
  { id: 1, label: 'A', sectionLabel: 'Sneaky Start', startTime: 0, endTime: 59, color: '#3B82F6' },
  { id: 2, label: 'B', sectionLabel: 'Building Energy', startTime: 59, endTime: 101, color: '#EF4444' },
  { id: 3, label: "A'", sectionLabel: 'Explosive Return', startTime: 101, endTime: 150, color: '#3B82F6' },
];

function generateSections() {
  return BASE_SECTIONS.map(base => ({
    ...base,
    sky: pick(SKIES),
    scene: pick(SCENES),
    ground: pick(GROUNDS),
    tempo: pick(TEMPOS),
    dynamics: pick(DYNAMICS),
    articulation: pick(['legato', 'staccato', 'marcato']),
    weather: pick(WEATHERS),
    nightMode: Math.random() > 0.7,
    movement: pick(['walk', 'walk', 'run', 'sprint']),
  }));
}

function generateStickers(sections) {
  const count = Math.floor(rand(2, 8));
  return Array.from({ length: count }, (_, i) => {
    const section = pick(sections);
    const template = pick(STICKER_POOL);
    return {
      id: i + 1,
      type: 'sticker',
      ...template,
      timestamp: rand(section.startTime, section.endTime - 2),
      duration: section.endTime - section.startTime,
      position: { x: rand(0.1, 0.9), y: rand(0.1, 0.7) },
      scale: rand(1.5, 3),
      placedAtOffset: rand(0, 5),
      entryOffsetX: 0,
    };
  });
}

function generateGuideData(sections) {
  const guide = {};
  sections.forEach((s, i) => {
    guide[i] = {
      dynamics: pick(['Getting louder', 'Staying quiet', 'Very loud', 'Soft then loud']),
      instruments: pick(['Strings only', 'Full orchestra', 'Woodwinds and brass', 'Just percussion']),
      mood: pick(['Sneaky', 'Exciting', 'Scary', 'Triumphant', 'Mysterious', 'Peaceful']),
    };
  });
  return guide;
}

function generateEssayData() {
  const essays = [
    "The music started really quiet and sneaky with the strings playing pizzicato. Then it got louder and louder as more instruments joined in. The brass section made it feel really powerful at the end.",
    "I thought this piece was cool because it starts so quiet you can barely hear it. The tempo keeps getting faster which made me feel nervous like something was chasing me. The ending was SO loud!",
    "In section A the music was mysterious and quiet. The violins were plucking their strings which sounded creepy. Section B had more instruments and got faster. The return of A was like an explosion of sound.",
    "This piece reminded me of a chase scene in a movie. The beginning was like someone sneaking around, then they got caught and had to run. The dynamics changed from pianissimo to fortissimo which was dramatic.",
    "I noticed the tempo getting faster throughout the whole piece. At first it was andante but by the end it was presto. The dynamics also changed - it started piano and ended fortissimo. The crescendo was really gradual.",
    "My favorite part was when the brass instruments came in during section B. It changed the whole mood from sneaky to powerful. I placed stickers to mark where I heard the trumpets enter.",
    "The piece has ABA form. Both A sections have the same melody but the second time it's way louder and faster. Section B is different because new instruments play and the rhythm changes.",
    "I chose the night mountain scene because the music felt dark and mysterious. The dog character walked slowly at first then ran faster as the tempo increased. I added rain for the scary parts.",
  ];
  return { text: pick(essays) };
}

function generateWorkData(seatUid, classId) {
  const sections = generateSections();
  const character = pick(CHARACTERS);
  const items = generateStickers(sections);
  const guideData = generateGuideData(sections);
  const essayData = generateEssayData();

  return {
    workId: 'll-lesson3-listening-journey',
    studentUid: seatUid,
    classId,
    lessonId: 'll-lesson3',
    activityId: 'listening-journey',
    type: 'composition',
    status: 'submitted',
    title: 'Listening Journey',
    emoji: '🎭',
    createdAt: Date.now() - Math.floor(rand(60000, 600000)),
    updatedAt: Date.now() - Math.floor(rand(10000, 60000)),
    submittedAt: Date.now() - Math.floor(rand(1000, 30000)),
    data: {
      sections,
      character,
      items,
      guideData,
      essayData,
      drawingData: null,
    }
  };
}

export async function generateFakeLJData(classId) {
  console.log(`🎲 Generating fake Listening Journey data for class: ${classId}`);

  // 1. Get the roster
  const rosterRef = ref(database, `classRosters/${classId}`);
  const rosterSnap = await get(rosterRef);
  if (!rosterSnap.exists()) {
    console.error('No roster found for class:', classId);
    return;
  }

  const seats = [];
  rosterSnap.forEach(child => seats.push(child.val()));
  seats.sort((a, b) => a.seatNumber - b.seatNumber);

  console.log(`Found ${seats.length} students in roster`);

  // 2. Generate and write data for each student
  let written = 0;
  for (const seat of seats) {
    const seatUid = seat.studentUid || `seat-${seat.seatNumber}`;
    const displayName = `${seat.firstName} ${seat.lastName}`.trim() || `Seat ${seat.seatNumber}`;

    // Generate unique work data
    const workData = generateWorkData(seatUid, classId);

    // Write to studentWork/{seatUid}/ll-lesson3-listening-journey
    const workRef = ref(database, `studentWork/${seatUid}/ll-lesson3-listening-journey`);
    await set(workRef, workData);

    // Write submission record
    const subRef = ref(database, `submissions/${classId}/ll-lesson3/${seatUid}`);
    await set(subRef, {
      studentUid: seatUid,
      lessonId: 'll-lesson3',
      activityId: 'listening-journey',
      workKey: 'll-lesson3-listening-journey',
      title: 'Listening Journey',
      submittedAt: workData.submittedAt,
      status: 'pending',
      grade: null,
      feedback: null,
    });

    written++;
    console.log(`  ✅ ${displayName} (${seatUid}) — ${workData.data.sections.length} sections, ${workData.data.items.length} stickers`);
  }

  console.log(`\n🎉 Done! Generated data for ${written} students.`);
  console.log('Reload the class detail page to see the submissions.');
}

// Auto-expose to window for console access
if (typeof window !== 'undefined') {
  window.generateFakeLJData = generateFakeLJData;
}
