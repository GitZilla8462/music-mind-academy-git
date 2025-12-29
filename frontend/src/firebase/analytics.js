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
 * Update session stage (for tracking progress) and log time spent on previous stage
 */
export const logStageChange = async (sessionCode, newStage) => {
  if (!sessionCode) return;

  const now = Date.now();
  const sessionRef = ref(database, `pilotSessions/${sessionCode}`);

  try {
    // Get current session data to calculate time on previous stage
    const snapshot = await get(sessionRef);

    if (snapshot.exists()) {
      const sessionData = snapshot.val();
      const previousStage = sessionData.lastStage;
      const previousStageAt = sessionData.lastStageAt || sessionData.startTime;

      // Calculate time spent on previous stage
      if (previousStage && previousStageAt) {
        const timeOnStage = now - previousStageAt;

        // Store time per stage
        const stageTimesRef = ref(database, `pilotSessions/${sessionCode}/stageTimes/${previousStage}`);
        const stageSnapshot = await get(stageTimesRef);
        const existingTime = stageSnapshot.exists() ? stageSnapshot.val() : 0;

        await set(stageTimesRef, existingTime + timeOnStage);

        console.log(`📊 Time on ${previousStage}: ${Math.round(timeOnStage / 1000)}s`);
      }
    }

    // Update to new stage
    await update(sessionRef, {
      lastStage: newStage,
      lastStageAt: now
    });
  } catch (error) {
    // Fallback: just update the stage
    await update(sessionRef, {
      lastStage: newStage,
      lastStageAt: now
    });
  }
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
// POST-SESSION SURVEY
// ==========================================

/**
 * Save survey response from teacher after session (quick rating)
 */
export const saveSurveyResponse = async (surveyData) => {
  if (!surveyData.sessionCode) return;

  try {
    // Save to dedicated surveys collection
    const surveyRef = ref(database, `surveys/${surveyData.sessionCode}`);
    await set(surveyRef, {
      ...surveyData,
      surveyType: 'quick',
      savedAt: Date.now()
    });

    // Also update the session record with survey data
    const sessionRef = ref(database, `pilotSessions/${surveyData.sessionCode}`);
    await update(sessionRef, {
      hasSurvey: true,
      surveyType: 'quick',
      surveyRating: surveyData.rating || null,
      usedWithStudents: surveyData.usedWithStudents,
      surveySubmittedAt: Date.now()
    });

    console.log(`📊 Saved quick survey for session ${surveyData.sessionCode}`);
  } catch (error) {
    console.error('Failed to save survey:', error);
    throw error;
  }
};

/**
 * Save mid-pilot survey response (after Lesson 3)
 */
export const saveMidPilotSurvey = async (surveyData) => {
  if (!surveyData.sessionCode) return;

  try {
    // Save to midPilot surveys collection
    const surveyRef = ref(database, `surveys/midPilot/${surveyData.sessionCode}`);
    await set(surveyRef, {
      ...surveyData,
      surveyType: 'midPilot',
      savedAt: Date.now()
    });

    // Also update the session record
    const sessionRef = ref(database, `pilotSessions/${surveyData.sessionCode}`);
    await update(sessionRef, {
      hasSurvey: true,
      surveyType: 'midPilot',
      surveySubmittedAt: Date.now()
    });

    console.log(`📊 Saved mid-pilot survey for session ${surveyData.sessionCode}`);
  } catch (error) {
    console.error('Failed to save mid-pilot survey:', error);
    throw error;
  }
};

/**
 * Save final PMF survey response (after Lesson 5)
 */
export const saveFinalPilotSurvey = async (surveyData) => {
  if (!surveyData.sessionCode) return;

  try {
    // Save to finalPilot surveys collection
    const surveyRef = ref(database, `surveys/finalPilot/${surveyData.sessionCode}`);
    await set(surveyRef, {
      ...surveyData,
      surveyType: 'finalPilot',
      savedAt: Date.now()
    });

    // Also update the session record
    const sessionRef = ref(database, `pilotSessions/${surveyData.sessionCode}`);
    await update(sessionRef, {
      hasSurvey: true,
      surveyType: 'finalPilot',
      pmfScore: surveyData.disappointment,
      npsScore: surveyData.npsScore,
      surveySubmittedAt: Date.now()
    });

    console.log(`📊 Saved final pilot survey for session ${surveyData.sessionCode}`);
  } catch (error) {
    console.error('Failed to save final pilot survey:', error);
    throw error;
  }
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
    // Get lessons with visit counts
    const lessonsVisited = [];
    if (data.lessonsVisited) {
      Object.entries(data.lessonsVisited).forEach(([lessonId, lessonData]) => {
        lessonsVisited.push({
          lessonId,
          visitCount: lessonData.visitCount || 1,
          firstVisited: lessonData.firstVisited,
          lastVisited: lessonData.lastVisited
        });
      });
    }

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
    const data = child.val();
    sessions.push({
      sessionCode: child.key,
      ...data,
      // Include stage times if available
      stageTimes: data.stageTimes || {}
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
// HEARTBEAT / ACTIVITY TRACKING
// ==========================================

/**
 * Update session activity (heartbeat) - call every minute
 * This ensures we capture time even if user forgets to end session
 */
export const updateSessionHeartbeat = async (sessionCode, teacherUid) => {
  if (!sessionCode) return;

  const now = Date.now();

  try {
    // Update session's last heartbeat
    const sessionRef = ref(database, `pilotSessions/${sessionCode}`);
    const snapshot = await get(sessionRef);

    if (snapshot.exists()) {
      const sessionData = snapshot.val();
      const startTime = sessionData.startTime;
      const duration = now - startTime;

      await update(sessionRef, {
        lastHeartbeat: now,
        duration: duration // Update duration based on heartbeat
      });

      // Also update teacher's total time
      if (teacherUid) {
        const teacherRef = ref(database, `teacherAnalytics/${teacherUid}`);
        await update(teacherRef, {
          lastActivity: now
        });
      }
    }
  } catch (error) {
    console.warn('Heartbeat update failed:', error.message);
  }
};

/**
 * Final update when page is unloading (beforeunload)
 * Uses sendBeacon for reliability
 */
export const sendFinalHeartbeat = (sessionCode, teacherUid) => {
  if (!sessionCode) return;

  // Note: sendBeacon doesn't work with Firebase SDK
  // Instead, we rely on the heartbeat having captured recent activity
  console.log('📊 Session closing, last heartbeat already recorded');
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
