// Session Context for managing classroom sessions
// UPDATED: Prioritize URL params over localStorage for session code
// ✅ FIXED: Export currentStage as direct value to prevent render loops
// ✅ IMPROVED: Auto-clear ended sessions, validate before restore, 3-hour expiration
// ✅ FIXED: Use queueMicrotask to prevent setState during render
// src/context/SessionContext.jsx

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  subscribeToSession,
  joinSession as firebaseJoinSession,
  updateSessionStage,
  updateStudentProgress,
  endSession as firebaseEndSession
} from '../firebase/config';
import { updateClassSessionStage, endClassSession, subscribeToClassSession } from '../firebase/classes';
import { logger } from '../utils/UniversalLogger';
import { logSessionEnded, logStageChange, logStudentJoined, updateSessionHeartbeat } from '../firebase/analytics';

const SessionContext = createContext();

// Session expires after 3 hours (in milliseconds)
const SESSION_EXPIRY_MS = 3 * 60 * 60 * 1000;

// Pages that don't need session restoration
const NO_SESSION_PATHS = ['/', '/join', '/view/', '/login', '/demo'];

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within SessionProvider');
  }
  return context;
};

// Helper to check if current page needs session
const shouldRestoreSession = () => {
  const path = window.location.pathname;
  const search = window.location.search;
  
  // If URL has ?view= parameter, don't restore session (viewing saved work)
  if (search.includes('view=')) {
    console.log('🚫 Skipping session restore: viewing saved work');
    return false;
  }
  
  // Check if path starts with any no-session path
  for (const noSessionPath of NO_SESSION_PATHS) {
    if (path === noSessionPath || path.startsWith(noSessionPath)) {
      console.log('🚫 Skipping session restore: on', path);
      return false;
    }
  }
  
  return true;
};

// Helper to check if saved session is expired
const isSessionExpired = () => {
  const savedTime = localStorage.getItem('current-session-time');
  if (!savedTime) return false;
  
  const elapsed = Date.now() - parseInt(savedTime, 10);
  if (elapsed > SESSION_EXPIRY_MS) {
    console.log('⏰ Session expired after', Math.round(elapsed / 1000 / 60), 'minutes');
    return true;
  }
  return false;
};

// Helper to clear all session data from localStorage
const clearSessionStorage = () => {
  localStorage.removeItem('current-session-code');
  localStorage.removeItem('current-session-role');
  localStorage.removeItem('current-session-userId');
  localStorage.removeItem('current-session-studentName');
  localStorage.removeItem('current-session-time');
  console.log('🧹 Session storage cleared');
};

export const SessionProvider = ({ children }) => {
  // ✅ IMPROVED: Check URL params FIRST, validate saved session before restoring
  const [sessionCode, setSessionCode] = useState(() => {
    // Priority 1: URL parameter (for new sessions)
    const urlParams = new URLSearchParams(window.location.search);
    const urlSessionCode = urlParams.get('session');
    
    if (urlSessionCode) {
      console.log('🆕 Using session from URL:', urlSessionCode);
      localStorage.setItem('current-session-code', urlSessionCode);
      localStorage.setItem('current-session-time', Date.now().toString());
      return urlSessionCode;
    }
    
    // Priority 2: Check if we should restore session on this page
    if (!shouldRestoreSession()) {
      return null;
    }
    
    // Priority 3: Check if session is expired
    if (isSessionExpired()) {
      clearSessionStorage();
      return null;
    }
    
    // Priority 4: localStorage (for page refreshes during active session)
    const saved = localStorage.getItem('current-session-code');
    if (saved) {
      console.log('🔄 Restoring session from localStorage:', saved);
      return saved;
    }
    
    return null;
  });
  
  const [userRole, setUserRole] = useState(() => {
    // Check URL first for role
    const urlParams = new URLSearchParams(window.location.search);
    const urlRole = urlParams.get('role');
    
    if (urlRole) {
      localStorage.setItem('current-session-role', urlRole);
      return urlRole;
    }
    
    // Only restore role if we're restoring session
    if (!shouldRestoreSession() || isSessionExpired()) {
      return null;
    }
    
    return localStorage.getItem('current-session-role') || null;
  });
  
  const [userId, setUserId] = useState(() => {
    if (!shouldRestoreSession() || isSessionExpired()) {
      return null;
    }
    return localStorage.getItem('current-session-userId') || null;
  });
  
  const [classId, setClassId] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('classId') || null;
  });
  const [sessionData, setSessionData] = useState(null);
  const [isInSession, setIsInSession] = useState(false);
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  
  const prevStageRef = useRef(null);
  const isNormalEndRef = useRef(false);
  const hasJoinedRef = useRef(false);
  const hasAutoCleanedRef = useRef(false);

  // ✅ NEW: Derive currentStage as a value (not a function call)
  // This allows components to use it reactively without calling a function during render
  const currentStage = sessionData?.currentStage || 'join-code';

  // ✅ ADDED: Watch for URL changes (browser back/forward, etc)
  useEffect(() => {
    const handleUrlChange = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const urlSessionCode = urlParams.get('session');
      const urlRole = urlParams.get('role');
      
      if (urlSessionCode && urlSessionCode !== sessionCode) {
        console.log('🔄 Session code changed in URL:', urlSessionCode);
        setSessionCode(urlSessionCode);
        localStorage.setItem('current-session-code', urlSessionCode);
        localStorage.setItem('current-session-time', Date.now().toString());
      }
      
      if (urlRole && urlRole !== userRole) {
        console.log('🔄 Role changed in URL:', urlRole);
        setUserRole(urlRole);
        localStorage.setItem('current-session-role', urlRole);
      }
    };
    
    // Listen for URL changes (popstate for back/forward)
    window.addEventListener('popstate', handleUrlChange);
    
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, [sessionCode, userRole]);

  // Save to localStorage when session info changes
  useEffect(() => {
    if (sessionCode) {
      localStorage.setItem('current-session-code', sessionCode);
      // Update timestamp when session is active
      if (!localStorage.getItem('current-session-time')) {
        localStorage.setItem('current-session-time', Date.now().toString());
      }
    } else {
      localStorage.removeItem('current-session-code');
      localStorage.removeItem('current-session-time');
    }
  }, [sessionCode]);
  
  useEffect(() => {
    if (userRole) {
      localStorage.setItem('current-session-role', userRole);
    } else {
      localStorage.removeItem('current-session-role');
    }
  }, [userRole]);
  
  useEffect(() => {
    if (userId) {
      localStorage.setItem('current-session-userId', userId);
    } else {
      localStorage.removeItem('current-session-userId');
    }
  }, [userId]);

  // Heartbeat for tracking session duration (every 60 seconds)
  useEffect(() => {
    // Only run heartbeat for teachers with active sessions
    if (!sessionCode || userRole !== 'teacher') return;

    // Get teacher UID from sessionData or localStorage
    const teacherUid = sessionData?.teacherId || localStorage.getItem('classroom-user-id');

    // Initial heartbeat
    updateSessionHeartbeat(sessionCode, teacherUid).catch(() => {});

    // Set up interval for every 60 seconds
    const heartbeatInterval = setInterval(() => {
      updateSessionHeartbeat(sessionCode, teacherUid).catch(() => {});
    }, 60000); // 60 seconds

    console.log('💓 Started session heartbeat for:', sessionCode);

    return () => {
      clearInterval(heartbeatInterval);
      console.log('💔 Stopped session heartbeat');
    };
  }, [sessionCode, userRole, sessionData?.teacherId]);

  // Firebase subscription with logging
  // Supports both traditional sessions (sessionCode) and class-based sessions (classId)
  useEffect(() => {
    // Need either sessionCode OR classId to subscribe
    if (!sessionCode && !classId) return;

    const sessionIdentifier = sessionCode || classId;
    const isClassSession = !sessionCode && !!classId;

    console.log('📡 Subscribing to', isClassSession ? 'class session:' : 'session:', sessionIdentifier);
    setIsLoadingSession(true);

    // Initialize logger if student is restoring from localStorage
    if (userRole === 'student' && userId && !logger.isInitialized) {
      console.log('🔄 Initializing logger from restored session');
      const studentName = localStorage.getItem('current-session-studentName') || userId;
      logger.init({
        studentId: userId,
        sessionCode: sessionIdentifier,
        lessonId: 'lesson1',
        studentName: studentName
      });
    }

    // Use class session subscription for class-based sessions
    const unsubscribe = isClassSession
      ? subscribeToClassSession(classId, handleSessionUpdate)
      : subscribeToSession(sessionCode, handleSessionUpdate);

    function handleSessionUpdate(data) {
      // ✅ FIX: Defer all setState calls to avoid "Cannot update component while rendering" error
      queueMicrotask(() => {
        setIsLoadingSession(false);

        // ✅ IMPROVED: If session doesn't exist, clear storage and reset
        if (data === null && !isNormalEndRef.current) {
          if (prevStageRef.current) {
            // Session was active but disappeared unexpectedly
            console.error('🔴 CRITICAL: Session data became NULL unexpectedly!');
            console.error('   Session identifier:', sessionIdentifier);
            console.error('   Last stage:', prevStageRef.current);

            if (userRole === 'student') {
              logger.kick('Session data lost unexpectedly', {
                sessionCode: sessionIdentifier,
                lastStage: prevStageRef.current,
                wasNormalEnd: false
              });
            }
          } else {
            // Session never existed or was already ended
            console.log('📭 Session not found or already ended:', sessionIdentifier);
          }

          // Auto-cleanup if session doesn't exist
          if (!hasAutoCleanedRef.current) {
            hasAutoCleanedRef.current = true;
            console.log('🧹 Auto-cleaning invalid session from storage');
            clearSessionStorage();
            prevStageRef.current = null;
            setSessionCode(null);
            setUserRole(null);
            setUserId(null);
            setIsInSession(false);
          }
          return;
        }

        // For class sessions, check if session is not active (ended)
        if (isClassSession && data && !data.active) {
          console.log('📋 Class session ended or not active');
          isNormalEndRef.current = true;

          if (!hasAutoCleanedRef.current && userRole === 'student') {
            hasAutoCleanedRef.current = true;
            console.log('🧹 Auto-cleaning ended class session');

            setTimeout(() => {
              clearSessionStorage();
            }, 2000);
          }
          return;
        }

        // ✅ IMPROVED: Session ended normally - auto-cleanup for students
        if (data?.currentStage === 'ended') {
          console.log('📋 Session ended normally by teacher');
          isNormalEndRef.current = true;

          // Auto-cleanup after a short delay (let UI show "session ended" message first)
          if (!hasAutoCleanedRef.current && userRole === 'student') {
            hasAutoCleanedRef.current = true;
            console.log('🧹 Auto-cleaning ended session (student will be redirected)');

            setTimeout(() => {
              clearSessionStorage();
              // Note: The lesson component handles the redirect to /join
            }, 2000);
          }
        }

        // Log stage changes (info only)
        if (data?.currentStage !== prevStageRef.current) {
          console.log('🎬 Stage changed:', {
            from: prevStageRef.current,
            to: data?.currentStage,
            time: new Date().toLocaleTimeString()
          });

          // Log stage transitions for students (info only, not errors)
          if (userRole === 'student' && data?.currentStage !== 'ended') {
            logger.stageChange(prevStageRef.current, data?.currentStage);
          }

          prevStageRef.current = data?.currentStage;
        }

        setSessionData(data);
        setIsInSession(!!data && (isClassSession ? data.active : true));

        if (data?.classId && !classId) {
          setClassId(data.classId);
          console.log('ClassId set from session data:', data.classId);
        }
      });
    }

    return () => {
      console.log('🔌 Unsubscribing from', isClassSession ? 'class session:' : 'session:', sessionIdentifier);
      setIsLoadingSession(false);
      unsubscribe();
    };
  }, [sessionCode, classId, userRole, userId]);
  
  // Monitor tab visibility (detect when Chromebook sleeps)
  useEffect(() => {
    if (!sessionCode || userRole !== 'student') return;
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('👁️ Student tab became visible again');
        
        // Check if session data was lost while tab was hidden
        if (!sessionData && sessionCode && !isNormalEndRef.current && prevStageRef.current) {
          console.error('⚠️ Session data lost while tab was hidden!');
          logger.warning('Session lost while tab hidden (possible Chromebook sleep)', {
            sessionCode
          });
        }
      } else {
        console.log('🙈 Student tab hidden (sleep/minimize)');
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [sessionCode, sessionData, userRole]);
  
  // Monitor teacher heartbeat — if teacher's browser has been closed for 1 hour, end session for students
  const HEARTBEAT_STALE_MS = 60 * 60 * 1000; // 1 hour
  useEffect(() => {
    if (!sessionCode || userRole !== 'student' || !sessionData) return;
    if (isNormalEndRef.current) return;

    const checkHeartbeat = () => {
      const lastHB = sessionData?.lastHeartbeat;
      if (!lastHB) return; // no heartbeat field yet — teacher hasn't sent one
      const elapsed = Date.now() - lastHB;
      if (elapsed > HEARTBEAT_STALE_MS) {
        console.log(`⏰ Teacher heartbeat stale (${Math.round(elapsed / 60000)} min) — ending session for student`);
        isNormalEndRef.current = true;
        if (!hasAutoCleanedRef.current) {
          hasAutoCleanedRef.current = true;
          clearSessionStorage();
          setSessionCode(null);
          setUserRole(null);
          setUserId(null);
          setIsInSession(false);
        }
      }
    };

    // Check on mount and every 5 minutes (very low overhead)
    checkHeartbeat();
    const interval = setInterval(checkHeartbeat, 5 * 60 * 1000);

    // Also check when tab becomes visible (Chromebook wakes up)
    const onVisible = () => {
      if (document.visibilityState === 'visible') checkHeartbeat();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [sessionCode, userRole, sessionData]);

  // Monitor if session data disappears AFTER being loaded (ignore initial null and normal ends)
  useEffect(() => {
    if (isLoadingSession) return;
    if (isNormalEndRef.current) return;
    if (!prevStageRef.current) return;
    
    if (sessionData === null && sessionCode && userRole === 'student') {
      console.error('🔴 DANGER: sessionData is NULL after being previously loaded!');
      console.error('   Session code:', sessionCode);
      console.error('   User role:', userRole);
      console.error('   This means session was deleted or network dropped!');
      
      logger.error('Session data disappeared unexpectedly', {
        sessionCode,
        userRole,
        lastStage: prevStageRef.current
      });
    }
  }, [sessionData, sessionCode, userRole, isLoadingSession]);

  const startSession = (code, teacherId, classIdParam = null) => {
    console.log('🎬 Teacher starting session:', { code, teacherId });
    setSessionCode(code);
    setUserRole('teacher');
    setUserId(teacherId);
    setIsInSession(true);
    isNormalEndRef.current = false;
    hasAutoCleanedRef.current = false;
    
    // Set session start time
    localStorage.setItem('current-session-time', Date.now().toString());
    
    if (classIdParam) {
      setClassId(classIdParam);
      console.log('Session started with classId:', classIdParam);
    }
  };

  const joinSession = async (code, studentId, studentName) => {
    try {
      // Prevent re-joining if already joined
      if (hasJoinedRef.current) {
        console.log('⏭️ Student already joined, skipping re-join');
        return true;
      }

      console.log('Student joining session');

      // First, fetch the session data to get the lessonRoute
      const { getDatabase, ref: dbRef, get } = await import('firebase/database');
      const db = getDatabase();

      let sessionData = null;
      let isClassSession = false;
      let classIdForSession = null;

      // Check if this is a class code (6-char: 2 letters + 4 numbers) or session code (4 digits)
      const isClassCode = /^[A-Z]{2}\d{4}$/i.test(code);

      if (isClassCode) {
        // Look up class by class code
        console.log('🏫 Detected class code, looking up class...');
        const codeRef = dbRef(db, `classCodes/${code.toUpperCase()}`);
        const codeSnapshot = await get(codeRef);

        if (!codeSnapshot.exists()) {
          throw new Error('Class not found');
        }

        const foundClassId = codeSnapshot.val();
        const classRef = dbRef(db, `classes/${foundClassId}`);
        const classSnapshot = await get(classRef);

        if (!classSnapshot.exists()) {
          throw new Error('Class not found');
        }

        const classData = classSnapshot.val();

        if (!classData.currentSession?.active) {
          throw new Error('No active session for this class');
        }

        sessionData = classData.currentSession;
        isClassSession = true;
        classIdForSession = foundClassId;
        console.log('✅ Found class session:', { classId: foundClassId, lessonRoute: sessionData.lessonRoute });
      } else {
        // Traditional session code lookup
        const sessionRef = dbRef(db, `sessions/${code}`);
        const snapshot = await get(sessionRef);

        if (!snapshot.exists()) {
          throw new Error('Session not found');
        }

        sessionData = snapshot.val();
      }
      
      // ✅ NEW: Check if session is already ended
      if (sessionData.currentStage === 'ended') {
        console.log('⚠️ Cannot join - session has already ended');
        throw new Error('Session has ended');
      }
      
      const lessonRoute = sessionData.lessonRoute || sessionData.lessonId || '/lessons/film-music-project/lesson1';

      console.log('📚 Session lesson route:', lessonRoute);
      console.log('📚 Full session data:', sessionData);

      // Join the session - different path for class vs traditional sessions
      if (isClassSession && classIdForSession) {
        // For class sessions, write to classes/{classId}/currentSession/studentsJoined
        const { set: dbSet } = await import('firebase/database');
        const studentRef = dbRef(db, `classes/${classIdForSession}/currentSession/studentsJoined/${studentId}`);
        await dbSet(studentRef, {
          id: studentId,
          name: studentName || 'Student',
          joinedAt: Date.now(),
          score: 0
        });
        console.log('Student joined class session');
      } else {
        // Traditional session
        await firebaseJoinSession(code, studentId, studentName || 'Student');
      }

      // ✅ Update analytics with atomic increment
      logStudentJoined(code).catch((err) => {
        console.warn('Analytics student count update failed (non-critical):', err);
      });

      // Store classId if this is a class session
      if (isClassSession && classIdForSession) {
        setClassId(classIdForSession);
        // Don't set sessionCode for class sessions — use classId subscription path instead
        // Clear any stale session code from localStorage to prevent restore conflicts
        localStorage.removeItem('current-session-code');
      } else {
        setSessionCode(code);
      }
      setUserRole('student');
      setUserId(studentId);
      setIsInSession(true);
      isNormalEndRef.current = false;
      hasAutoCleanedRef.current = false;
      
      // Save student name and session time to localStorage
      localStorage.setItem('current-session-studentName', studentName || 'Student');
      localStorage.setItem('current-session-time', Date.now().toString());
      
      // Initialize logger with session info
      logger.init({
        studentId,
        sessionCode: code,
        lessonId: sessionData.lessonId || lessonRoute,
        studentName: studentName || 'Student'
      });
      
      console.log('✅ Student successfully joined session');
      
      // Mark as joined to prevent re-joining
      hasJoinedRef.current = true;
      
      // ONLY navigate if we're NOT already on the correct page
      const currentPath = window.location.pathname;

      if (!currentPath.includes(lessonRoute)) {
        // Use classId for class sessions, session code for traditional sessions
        const navUrl = isClassSession && classIdForSession
          ? `${lessonRoute}?classId=${classIdForSession}&role=student&classCode=${code}`
          : `${lessonRoute}?session=${code}&role=student`;
        console.log('🚀 Navigating to:', navUrl);
        window.location.href = navUrl;
      } else {
        console.log('✅ Already on correct lesson page, no redirect needed');
      }
      
      return true;
    } catch (error) {
      console.error('❌ Error joining session:', error);
      logger.error('Failed to join session', { error: error.message });
      return false;
    }
  };

  const joinSessionWithMusicalName = async (code, studentId) => {
    try {
      if (hasJoinedRef.current) {
        console.log('⏭️ Student already joined, skipping re-join');
        return true;
      }
      
      console.log('Student joining with musical name');
      
      const { getDatabase, ref: dbRef, get } = await import('firebase/database');
      const db = getDatabase();
      const sessionRef = dbRef(db, `sessions/${code}`);
      const snapshot = await get(sessionRef);
      
      if (!snapshot.exists()) {
        throw new Error('Session not found');
      }
      
      const sessionData = snapshot.val();
      
      // ✅ NEW: Check if session is already ended
      if (sessionData.currentStage === 'ended') {
        console.log('⚠️ Cannot join - session has already ended');
        throw new Error('Session has ended');
      }
      
      const { generateUniqueMusicalName } = await import('../utils/musicalNameGenerator');
      const existingNames = sessionData.studentsJoined 
        ? Object.values(sessionData.studentsJoined).map(s => s.name)
        : [];
      
      const musicalName = generateUniqueMusicalName(existingNames);
      console.log('🎵 Generated musical name:', musicalName);
      
      await firebaseJoinSession(code, studentId, musicalName);

      // ✅ Update analytics with atomic increment
      logStudentJoined(code).catch((err) => {
        console.warn('Analytics student count update failed (non-critical):', err);
      });

      setSessionCode(code);
      setUserRole('student');
      setUserId(studentId);
      setIsInSession(true);
      hasAutoCleanedRef.current = false;

      localStorage.setItem('current-session-studentName', musicalName);
      localStorage.setItem('current-session-time', Date.now().toString());
      
      logger.init({
        studentId,
        sessionCode: code,
        lessonId: sessionData.lessonId,
        studentName: musicalName
      });
      
      hasJoinedRef.current = true;
      
      return true;
    } catch (error) {
      console.error('❌ Error joining with musical name:', error);
      return false;
    }
  };

  const leaveSession = () => {
    console.log('🚪 Leaving session:', { sessionCode, userRole });
    
    if (userRole === 'student') {
      logger.cleanup();
    }
    
    clearSessionStorage();
    
    setSessionCode(null);
    setClassId(null);
    setSessionData(null);
    setUserRole(null);
    setUserId(null);
    setIsInSession(false);
    isNormalEndRef.current = false;
    hasJoinedRef.current = false;
    hasAutoCleanedRef.current = false;
  };

  const setCurrentStage = async (stage) => {
    if (userRole !== 'teacher') {
      console.warn('⚠️ Only teachers can update stage');
      return;
    }

    try {
      console.log('➡️ Teacher advancing stage to:', stage);

      // Use class session update for class-based sessions, traditional for quick sessions
      if (classId) {
        await updateClassSessionStage(classId, stage);
        console.log('✅ Updated class session stage:', stage);
      } else if (sessionCode) {
        await updateSessionStage(sessionCode, stage);
      } else {
        console.error('❌ No classId or sessionCode available to update stage');
        return;
      }

      // Log stage change for analytics (non-blocking)
      const analyticsCode = sessionCode || classId;
      logStageChange(analyticsCode, stage).catch(() => {});
    } catch (error) {
      console.error('❌ Error updating stage:', error);
    }
  };

  const markActivityComplete = async (activityId, status = 'completed') => {
    if (userRole !== 'student') {
      console.warn('⚠️ Only students can mark activities complete');
      return;
    }

    try {
      await updateStudentProgress(sessionCode, userId, activityId, status);
    } catch (error) {
      console.error('❌ Error updating progress:', error);
      logger.error('Failed to update progress', { 
        activityId, 
        status, 
        error: error.message 
      });
    }
  };

  const endSession = async () => {
    if (userRole !== 'teacher') {
      console.warn('⚠️ Only teachers can end session');
      return;
    }

    try {
      const sessionIdentifier = sessionCode || classId;
      console.log('🛑 Teacher ending session normally:', sessionIdentifier);
      isNormalEndRef.current = true;

      // Log session analytics before ending
      const lastStage = sessionData?.currentStage || 'unknown';
      const students = sessionData?.studentsJoined ? Object.keys(sessionData.studentsJoined).length : 0;

      try {
        await logSessionEnded(sessionIdentifier, lastStage, students);
        console.log('📊 Logged session end analytics');
      } catch (analyticsError) {
        console.warn('Analytics logging failed (non-critical):', analyticsError);
      }

      // Get the lesson route before clearing session data
      // Strip any query parameters to avoid re-entering session mode
      let lessonRoute = sessionData?.lessonRoute || sessionData?.lessonId || '/lessons/film-music-project/lesson1';

      // Remove query parameters (e.g., ?session=XXX&role=teacher)
      if (lessonRoute.includes('?')) {
        lessonRoute = lessonRoute.split('?')[0];
      }

      // Use class session end for class-based sessions, traditional for quick sessions
      if (classId) {
        await endClassSession(classId);
        console.log('✅ Ended class session:', classId);
      } else if (sessionCode) {
        await firebaseEndSession(sessionCode);
      }

      leaveSession();

      // Navigate back to the appropriate hub page based on lesson type
      setTimeout(() => {
        if (lessonRoute.includes('/lessons/film-music-project/')) {
          window.location.href = '/music-loops-in-media-hub';
        } else if (lessonRoute.includes('/lessons/listening-lab/')) {
          window.location.href = '/listening-lab-hub';
        } else {
          window.location.href = '/music-classroom-resources';
        }
      }, 500);

    } catch (error) {
      console.error('❌ Error ending session:', error);
    }
  };

  // ✅ KEPT for backwards compatibility - but prefer using currentStage directly
  const getCurrentStage = () => {
    return sessionData?.currentStage || 'join-code';
  };

  const getStudents = () => {
    if (!sessionData?.studentsJoined) return [];
    return Object.values(sessionData.studentsJoined);
  };

  const getStudentProgress = (studentId) => {
    return sessionData?.studentProgress?.[studentId] || {};
  };

  const getAllProgress = () => {
    return sessionData?.studentProgress || {};
  };

  const getProgressStats = (activityId) => {
    const allProgress = getAllProgress();
    const students = getStudents();
    
    let completed = 0;
    let working = 0;
    let bonusCompleted = 0;
    
    students.forEach(student => {
      const progress = allProgress[student.id];
      if (progress?.[activityId] === 'completed') {
        completed++;
      } else if (progress?.[activityId] === 'working') {
        working++;
      }
      
      if (progress?.[`${activityId}-bonus`] === 'completed') {
        bonusCompleted++;
      }
    });

    return {
      total: students.length,
      completed,
      working,
      notStarted: students.length - completed - working,
      bonusCompleted
    };
  };

  const value = {
    sessionCode,
    classId,
    sessionData,
    currentStage,  // ✅ Direct value - use this instead of getCurrentStage()
    userRole,
    userId,
    isInSession,
    isLoadingSession,
    
    startSession,
    joinSession,
    joinSessionWithMusicalName,
    leaveSession,
    setCurrentStage,
    markActivityComplete,
    endSession,
    
    getCurrentStage,  // ✅ KEPT for backwards compatibility
    getStudents,
    getStudentProgress,
    getAllProgress,
    getProgressStats
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
};