// Temporary utility: Seeds fake student submissions for testing the Activity Grading View
// DELETE THIS FILE after testing
// Usage: import and call from ClassDetailPage with a temp button

import { getDatabase, ref, set } from 'firebase/database';

const database = getDatabase();

function generateFakeSvgImage(index) {
  const colors = [
    '#4f46e5', '#7c3aed', '#2563eb', '#0891b2', '#059669',
    '#d97706', '#dc2626', '#db2777', '#6366f1', '#14b8a6',
    '#8b5cf6', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444',
    '#ec4899', '#6366f1', '#06b6d4', '#22c55e', '#eab308'
  ];
  const color = colors[index % colors.length];
  const instruments = ['Violin', 'Trumpet', 'Flute', 'Drums', 'Cello', 'Piano', 'Clarinet', 'Timpani', 'Viola', 'Oboe'];
  const instrumentColors = ['#f472b6', '#fb923c', '#a78bfa', '#34d399', '#60a5fa', '#fbbf24', '#f87171', '#2dd4bf', '#c084fc', '#38bdf8'];
  const dynamics = ['pp', 'p', 'mp', 'mf', 'f', 'ff'];

  let stickers = '';
  const stickerCount = 5 + (index % 6);
  for (let i = 0; i < stickerCount; i++) {
    const x = 60 + ((index * 73 + i * 137) % 680);
    const row = i % 4;
    const y = 45 + row * 100 + ((index * 31 + i * 47) % 60);
    const inst = instruments[(index + i) % instruments.length];
    const instColor = instrumentColors[(index + i) % instrumentColors.length];
    stickers += `<rect x="${x - 25}" y="${y - 14}" width="50" height="18" rx="9" fill="${instColor}" opacity="0.8"/>`;
    stickers += `<text x="${x}" y="${y}" text-anchor="middle" fill="white" font-size="9" font-weight="bold" font-family="sans-serif">${inst}</text>`;
  }
  for (let i = 0; i < 3; i++) {
    const x = 120 + ((index * 53 + i * 220) % 560);
    const row = (i + 1) % 4;
    const y = 55 + row * 100 + ((index * 41 + i * 67) % 35);
    const dyn = dynamics[(index + i) % dynamics.length];
    stickers += `<text x="${x}" y="${y}" fill="#fbbf24" font-size="20" font-weight="bold" font-style="italic" font-family="serif">${dyn}</text>`;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="420" viewBox="0 0 800 420">
    <rect width="800" height="420" fill="#1e1b4b"/>
    <text x="400" y="20" text-anchor="middle" fill="#94a3b8" font-size="11" font-family="sans-serif">Allegro (from Vivaldi Spring) - Antonio Vivaldi</text>
    <rect x="10" y="30" width="780" height="90" fill="${color}" opacity="0.25" rx="6"/>
    <rect x="10" y="130" width="780" height="90" fill="${color}" opacity="0.35" rx="6"/>
    <rect x="10" y="230" width="780" height="90" fill="${color}" opacity="0.45" rx="6"/>
    <rect x="10" y="330" width="780" height="80" fill="${color}" opacity="0.55" rx="6"/>
    <text x="20" y="80" fill="white" font-size="12" opacity="0.5" font-family="sans-serif">0:00 - 0:30</text>
    <text x="20" y="180" fill="white" font-size="12" opacity="0.5" font-family="sans-serif">0:30 - 1:00</text>
    <text x="20" y="280" fill="white" font-size="12" opacity="0.5" font-family="sans-serif">1:00 - 1:30</text>
    <text x="20" y="375" fill="white" font-size="12" opacity="0.5" font-family="sans-serif">1:30 - 2:00</text>
    ${stickers}
  </svg>`;

  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

export async function seedDynamicsListeningMap(classId, roster) {
  const lessonId = 'll-lesson1';
  const activityId = 'dynamics-listening-map';
  const workKey = `${lessonId}-${activityId}`;

  const submittingCount = Math.ceil(roster.length * 0.7);
  const submitting = roster.slice(0, submittingCount);
  const skipping = roster.slice(submittingCount);

  console.log(`🌱 Seeding ${submitting.length} submissions for Dynamics Listening Map...`);

  for (let i = 0; i < submitting.length; i++) {
    const student = submitting[i];
    const uid = student.studentUid || `seat-${student.seatNumber}`;
    const submittedAt = Date.now() - (submitting.length - i) * 120000;
    const isGraded = i < 2;

    const imageData = generateFakeSvgImage(i);

    // Write student work
    await set(ref(database, `studentWork/${uid}/${workKey}`), {
      workId: workKey,
      studentUid: uid,
      classId,
      lessonId,
      activityId,
      type: 'composition',
      status: isGraded ? 'graded' : 'submitted',
      title: 'Dynamics Listening Map',
      emoji: '🗺️',
      createdAt: submittedAt - 300000,
      updatedAt: submittedAt,
      submittedAt,
      data: {
        imageData,
        songTitle: "Allegro (from Vivaldi's Spring)",
        composer: 'Antonio Vivaldi',
        numRows: 4,
        savedAt: new Date(submittedAt).toISOString()
      }
    });

    // Write submission record
    await set(ref(database, `submissions/${classId}/${lessonId}/${uid}`), {
      studentUid: uid,
      lessonId,
      activityId,
      workKey,
      title: 'Dynamics Listening Map',
      submittedAt,
      status: isGraded ? 'graded' : 'submitted',
      grade: null,
      feedback: null
    });

    // Write grade if graded
    if (isGraded) {
      const grades = [
        { type: 'letter', grade: 'A', feedback: 'Excellent dynamics labeling!' },
        { type: 'points', points: 88, maxPoints: 100, feedback: 'Good work, try labeling more sections.' }
      ];
      const g = grades[i % grades.length];

      await set(ref(database, `grades/${classId}/${uid}/${lessonId}`), {
        ...g,
        quickFeedback: ['creative-choices', 'good-timing'],
        activityId,
        activityType: 'composition',
        gradedAt: submittedAt + 60000,
        gradedBy: 'seed-script',
        updatedAt: submittedAt + 60000
      });
    }

    console.log(`  ${isGraded ? '✅ GRADED' : '📝 SUBMITTED'}: ${student.displayName || `Seat ${student.seatNumber}`}`);
  }

  for (const s of skipping) {
    console.log(`  ⬜ NOT STARTED: ${s.displayName || `Seat ${s.seatNumber}`}`);
  }

  console.log(`\n✅ Done! ${submitting.length} submissions seeded. Refresh the page to see them.`);
  return submitting.length;
}
