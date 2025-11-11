// Session Context for managing classroom sessions
// UPDATED: Logging only for UNEXPECTED errors, not normal session ends
// src/context/SessionContext.jsx

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  subscribeToSession,
  joinSession as firebaseJoinSession,
  updateSessionStage,
  updateStudentProgress,
  endSession as firebaseEndSession
} from '../firebase/config';
import { logger } from '../utils/UniversalLogger';

const SessionContext = createContext();

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within SessionProvider');
  }
  return context;
};

export const SessionProvider = ({ children }) => {
  // Restore from localStorage on page reload
  const [sessionCode, setSessionCode] = useState(() => {
    const saved = localStorage.getItem('current-session-code');
    if (saved) console.log('🔄 Restoring session from localStorage:', saved);
    return saved || null;
  });
  
  const [userRole, setUserRole] = useState(() => {
    return localStorage.getItem('current-session-role') || null;
  });
  
  const [userId, setUserId] = useState(() => {
    return localStorage.getItem('current-session-userId') || null;
  });
  
  const [classId, setClassId] = useState(null);
  const [sessionData, setSessionData] = useState(null);
  const [isInSession, setIsInSession] = useState(false);
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  
  const prevStageRef = useRef(null);
  const isNormalEndRef = useRef(false); // Track if this is a normal session end

  // Save to localStorage when session info changes
  useEffect(() => {
    if (sessionCode) {
      localStorage.setItem('current-session-code', sessionCode);
    } else {
      localStorage.removeItem('current-session-code');
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

  // Firebase subscription with logging
  useEffect(() => {
    if (!sessionCode) return;

    console.log('📡 Subscribing to session:', sessionCode);
    setIsLoadingSession(true);
    
    // ✅ Initialize logger if student is restoring from localStorage
    if (userRole === 'student' && userId && !logger.isInitialized) {
      console.log('🔄 Initializing logger from restored session');
      const studentName = localStorage.getItem('current-session-studentName') || userId;
      logger.init({
        studentId: userId,
        sessionCode: sessionCode,
        lessonId: 'lesson1',
        studentName: studentName
      });
    }
    
    const unsubscribe = subscribeToSession(sessionCode, (data) => {
      setIsLoadingSession(false);
      
      // 🚨 ONLY log if session data becomes null UNEXPECTEDLY (not during normal end)
      if (data === null && !isNormalEndRef.current) {
        console.error('🔴 CRITICAL: Session data became NULL unexpectedly!');
        console.error('   Session code:', sessionCode);
        console.error('   Last stage:', prevStageRef.current);
        console.error('   Time:', new Date().toISOString());
        
        // Log to Firebase if student role
        if (userRole === 'student') {
          logger.kick('Session data lost unexpectedly', { 
            sessionCode,
            lastStage: prevStageRef.current,
            wasNormalEnd: false
          });
        }
      }
      
      // ℹ️ Session ended normally - just log to console, NO red button
      if (data?.currentStage === 'ended') {
        console.log('📋 Session ended normally by teacher');
        console.log('   Session code:', sessionCode);
        console.log('   Time:', new Date().toISOString());
        
        // Mark this as a normal end so we don't log errors
        isNormalEndRef.current = true;
        
        // DO NOT log to Firebase - this is normal behavior
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
      
      console.log('📊 Session update:', {
        hasData: !!data,
        currentStage: data?.currentStage,
        studentsCount: Object.keys(data?.studentsJoined || {}).length,
        isEnded: data?.currentStage === 'ended',
        time: new Date().toLocaleTimeString()
      });
      
      setSessionData(data);
      setIsInSession(!!data);
      
      if (data?.classId && !classId) {
        setClassId(data.classId);
        console.log('ClassId set from session data:', data.classId);
      }
    });

    return () => {
      console.log('🔌 Unsubscribing from session:', sessionCode);
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
        if (!sessionData && sessionCode && !isNormalEndRef.current) {
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
  
  // Monitor if session data disappears AFTER being loaded (ignore initial null and normal ends)
  useEffect(() => {
    if (isLoadingSession) return; // Ignore during initial load
    if (isNormalEndRef.current) return; // Ignore if session ended normally
    
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
    isNormalEndRef.current = false; // Reset flag
    
    if (classIdParam) {
      setClassId(classIdParam);
      console.log('Session started with classId:', classIdParam);
    }
  };

  const joinSession = async (code, studentId, studentName) => {
    try {
      console.log('👤 Student joining session:', { code, studentId, studentName });
      await firebaseJoinSession(code, studentId, studentName);
      
      setSessionCode(code);
      setUserRole('student');
      setUserId(studentId);
      setIsInSession(true);
      isNormalEndRef.current = false; // Reset flag
      
      // ✅ Save student name to localStorage
      if (studentName) {
        localStorage.setItem('current-session-studentName', studentName);
      }
      
      // ✅ Initialize logger with session info
      logger.init({
        studentId,
        sessionCode: code,
        lessonId: 'lesson1',
        studentName
      });
      
      console.log('✅ Student successfully joined session');
      return true;
    } catch (error) {
      console.error('❌ Error joining session:', error);
      logger.error('Failed to join session', { error: error.message });
      return false;
    }
  };

  const leaveSession = () => {
    console.log('🚪 Leaving session:', { sessionCode, userRole });
    
    // Cleanup logger
    if (userRole === 'student') {
      logger.cleanup();
    }
    
    // Clear localStorage
    localStorage.removeItem('current-session-code');
    localStorage.removeItem('current-session-role');
    localStorage.removeItem('current-session-userId');
    localStorage.removeItem('current-session-studentName');
    
    setSessionCode(null);
    setClassId(null);
    setSessionData(null);
    setUserRole(null);
    setUserId(null);
    setIsInSession(false);
    isNormalEndRef.current = false; // Reset flag
  };

  const setCurrentStage = async (stage) => {
    if (userRole !== 'teacher') {
      console.warn('⚠️ Only teachers can update stage');
      return;
    }
    
    try {
      console.log('➡️ Teacher advancing stage to:', stage);
      await updateSessionStage(sessionCode, stage);
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
      console.log('🛑 Teacher ending session normally:', sessionCode);
      isNormalEndRef.current = true; // Mark as normal end
      await firebaseEndSession(sessionCode);
      leaveSession();
    } catch (error) {
      console.error('❌ Error ending session:', error);
    }
  };

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
    // State
    sessionCode,
    classId,
    sessionData,
    userRole,
    userId,
    isInSession,
    isLoadingSession,
    
    // Actions
    startSession,
    joinSession,
    leaveSession,
    setCurrentStage,
    markActivityComplete,
    endSession,
    
    // Getters
    getCurrentStage,
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