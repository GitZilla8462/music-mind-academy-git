// Teacher analytics tracking for pilot program
// src/firebase/analytics.js

import { getDatabase, ref, get, set, update, push, onValue } from 'firebase/database';

const database = getDatabase();

// ==========================================
// TEACHER ACTIVITY TRACKING
// ==========================================

/**
 * Log when a teacher visits a lesson (for tracking which lessons they've tried)
 */
export const logLessonVisit = async (teacherUid, teacherEmail, lessonId) => {
  if (!teacherUid || !lessonId) return;

  const visitRef = ref(database, `teacherAnalytics/${teacherUid}/lessonsVisited/${lessonId}`);
  const snapshot = await get(visitRef);

  if (snapshot.exists()) {
    // Update visit count
    await update(visitRef, {
      visitCount: (snapshot.val().visitCount || 1) + 1,
      lastVisited: Date.now()
    });
  } else {
    // First visit
    await set(visitRef, {
      lessonId,
      firstVisited: Date.now(),
      lastVisited: Date.now(),
      visitCount: 1
    });
  }

  // Update teacher's last activity
  await update(ref(database, `teacherAnalytics/${teacherUid}`), {
    email: teacherEmail,
    lastActivity: Date.now()
  });

  console.log(`📊 Logged lesson visit: ${lessonId} for ${teacherEmail}`);
};

/**
 * Log session creation with detailed analytics
 */
export const logSessionCreated = async (teacherUid, teacherEmail, sessionData) => {
  if (!teacherUid) return;

  const { sessionCode, lessonId, lessonRoute } = sessionData;

  // Log to teacher's session history
  const sessionLogRef = push(ref(database, `teacherAnalytics/${teacherUid}/sessions`));
  await set(sessionLogRef, {
    sessionCode,
    lessonId,
    lessonRoute,
    startTime: Date.now(),
    endTime: null,
    duration: null,
    studentsJoined: 0,
    lastStage: 'join-code',
    completed: false
  });

  // Update teacher stats
  const teacherRef = ref(database, `teacherAnalytics/${teacherUid}`);
  const teacherSnap = await get(teacherRef);
  const currentStats = teacherSnap.val() || {};

  await update(teacherRef, {
    email: teacherEmail,
    totalSessions: (currentStats.totalSessions || 0) + 1,
    lastSessionAt: Date.now(),
    lastActivity: Date.now()
  });

  // Log to global sessions for admin view
  await set(ref(database, `pilotSessions/${sessionCode}`), {
    teacherUid,
    teacherEmail,
    lessonId,
    lessonRoute,
    startTime: Date.now(),
    endTime: null,
    duration: null,
    studentsJoined: 0,
    lastStage: 'join-code',
    completed: false
  });

  console.log(`📊 Logged session created: ${sessionCode} by ${teacherEmail}`);
  return sessionLogRef.key;
};

/**
 * Update session when it ends
 */
export const logSessionEnded = async (sessionCode, lastStage, studentsJoined) => {
  if (!sessionCode) return;

  const sessionRef = ref(database, `pilotSessions/${sessionCode}`);
  const snapshot = await get(sessionRef);

  if (!snapshot.exists()) return;

  const sessionData = snapshot.val();
  const startTime = sessionData.startTime;
  const endTime = Date.now();
  const duration = endTime - startTime;

  // Update session record
  await update(sessionRef, {
    endTime,
    duration,
    lastStage,
    studentsJoined: studentsJoined || 0,
    completed: lastStage === 'conclusion' || lastStage === 'ended'
  });

  // Update teacher's total time
  if (sessionData.teacherUid) {
    const teacherRef = ref(database, `teacherAnalytics/${sessionData.teacherUid}`);
    const teacherSnap = await get(teacherRef);
    const currentStats = teacherSnap.val() || {};

    await update(teacherRef, {
      totalTimeOnSite: (currentStats.totalTimeOnSite || 0) + duration,
      lastActivity: Date.now()
    });
  }

  console.log(`📊 Logged session ended: ${sessionCode}, duration: ${Math.round(duration / 60000)} min`);
};

/**
 * Update session stage (for tracking progress)
 */
export const logStageChange = async (sessionCode, newStage) => {
  if (!sessionCode) return;

  const sessionRef = ref(database, `pilotSessions/${sessionCode}`);
  await update(sessionRef, {
    lastStage: newStage,
    lastStageAt: Date.now()
  });
};

/**
 * Update student count for a session
 */
export const logStudentJoined = async (sessionCode, studentCount) => {
  if (!sessionCode) return;

  const sessionRef = ref(database, `pilotSessions/${sessionCode}`);
  await update(sessionRef, {
    studentsJoined: studentCount
  });
};

// ==========================================
// ANALYTICS RETRIEVAL FOR ADMIN
// ==========================================

/**
 * Get all teacher analytics
 */
export const getTeacherAnalytics = async () => {
  const analyticsRef = ref(database, 'teacherAnalytics');
  const snapshot = await get(analyticsRef);

  if (!snapshot.exists()) return [];

  const teachers = [];
  snapshot.forEach((child) => {
    const data = child.val();
    const lessonsVisited = data.lessonsVisited ? Object.keys(data.lessonsVisited) : [];

    teachers.push({
      uid: child.key,
      email: data.email,
      firstLogin: data.firstLogin,
      lastActivity: data.lastActivity,
      totalSessions: data.totalSessions || 0,
      totalTimeOnSite: data.totalTimeOnSite || 0,
      lessonsVisited,
      lastSessionAt: data.lastSessionAt
    });
  });

  // Sort by last activity
  teachers.sort((a, b) => (b.lastActivity || 0) - (a.lastActivity || 0));

  return teachers;
};

/**
 * Get all pilot sessions
 */
export const getPilotSessions = async () => {
  const sessionsRef = ref(database, 'pilotSessions');
  const snapshot = await get(sessionsRef);

  if (!snapshot.exists()) return [];

  const sessions = [];
  snapshot.forEach((child) => {
    sessions.push({
      sessionCode: child.key,
      ...child.val()
    });
  });

  // Sort by start time descending
  sessions.sort((a, b) => (b.startTime || 0) - (a.startTime || 0));

  return sessions;
};

/**
 * Get summary stats for dashboard
 */
export const getPilotSummaryStats = async () => {
  const [teachers, sessions] = await Promise.all([
    getTeacherAnalytics(),
    getPilotSessions()
  ]);

  // Calculate lesson popularity
  const lessonCounts = {};
  sessions.forEach((s) => {
    if (s.lessonId) {
      lessonCounts[s.lessonId] = (lessonCounts[s.lessonId] || 0) + 1;
    }
  });

  const mostPopularLesson = Object.entries(lessonCounts)
    .sort((a, b) => b[1] - a[1])[0];

  // Calculate average session duration
  const completedSessions = sessions.filter(s => s.duration);
  const avgDuration = completedSessions.length > 0
    ? completedSessions.reduce((sum, s) => sum + s.duration, 0) / completedSessions.length
    : 0;

  // Calculate teachers with multiple sessions
  const teachersWithMultiple = teachers.filter(t => t.totalSessions > 1).length;

  return {
    totalTeachers: teachers.length,
    totalSessions: sessions.length,
    mostPopularLesson: mostPopularLesson ? mostPopularLesson[0] : 'N/A',
    mostPopularLessonCount: mostPopularLesson ? mostPopularLesson[1] : 0,
    avgSessionDuration: avgDuration,
    teachersWithMultipleSessions: teachersWithMultiple,
    retentionRate: teachers.length > 0
      ? Math.round((teachersWithMultiple / teachers.length) * 100)
      : 0
  };
};

/**
 * Subscribe to real-time analytics updates
 */
export const subscribeToAnalytics = (callback) => {
  const analyticsRef = ref(database, 'teacherAnalytics');

  return onValue(analyticsRef, async () => {
    const stats = await getPilotSummaryStats();
    const teachers = await getTeacherAnalytics();
    const sessions = await getPilotSessions();
    callback({ stats, teachers, sessions });
  });
};

// ==========================================
// FIRST LOGIN TRACKING
// ==========================================

/**
 * Track first login for a teacher
 */
export const trackFirstLogin = async (teacherUid, teacherEmail) => {
  if (!teacherUid) return;

  const teacherRef = ref(database, `teacherAnalytics/${teacherUid}`);
  const snapshot = await get(teacherRef);

  if (!snapshot.exists() || !snapshot.val().firstLogin) {
    await update(teacherRef, {
      email: teacherEmail,
      firstLogin: Date.now(),
      lastActivity: Date.now()
    });
    console.log(`📊 Tracked first login for ${teacherEmail}`);
  } else {
    await update(teacherRef, {
      lastActivity: Date.now()
    });
  }
};
