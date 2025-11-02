// Session Context for managing classroom sessions
// FIXED: Now supports classId to link sessions to classes
// src/context/SessionContext.jsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  subscribeToSession,
  joinSession as firebaseJoinSession,
  updateSessionStage,
  updateStudentProgress,
  endSession as firebaseEndSession
} from '../firebase/config';

const SessionContext = createContext();

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within SessionProvider');
  }
  return context;
};

export const SessionProvider = ({ children }) => {
  const [sessionCode, setSessionCode] = useState(null);
  const [classId, setClassId] = useState(null); // ✅ ADDED
  const [sessionData, setSessionData] = useState(null);
  const [userRole, setUserRole] = useState(null); // 'teacher' or 'student'
  const [userId, setUserId] = useState(null);
  const [isInSession, setIsInSession] = useState(false);

  // Subscribe to session updates when session code changes
  useEffect(() => {
    if (!sessionCode) return;

    console.log('Subscribing to session:', sessionCode);
    
    const unsubscribe = subscribeToSession(sessionCode, (data) => {
      console.log('Session data updated:', data);
      setSessionData(data);
      setIsInSession(!!data);
      
      // ✅ ADDED: Extract classId from session data if available
      if (data?.classId && !classId) {
        setClassId(data.classId);
        console.log('ClassId set from session data:', data.classId);
      }
    });

    return () => {
      console.log('Unsubscribing from session:', sessionCode);
      unsubscribe();
    };
  }, [sessionCode]);

  /**
   * Start a new session (teacher only)
   * ✅ UPDATED: Now accepts optional classId parameter
   */
  const startSession = (code, teacherId, classIdParam = null) => {
    setSessionCode(code);
    setUserRole('teacher');
    setUserId(teacherId);
    setIsInSession(true);
    
    // ✅ ADDED: Store classId if provided
    if (classIdParam) {
      setClassId(classIdParam);
      console.log('Session started with classId:', classIdParam);
    }
  };

  /**
   * Join an existing session (student)
   */
  const joinSession = async (code, studentId, studentName) => {
    try {
      await firebaseJoinSession(code, studentId, studentName);
      setSessionCode(code);
      setUserRole('student');
      setUserId(studentId);
      setIsInSession(true);
      return true;
    } catch (error) {
      console.error('Error joining session:', error);
      return false;
    }
  };

  /**
   * Leave the current session
   */
  const leaveSession = () => {
    setSessionCode(null);
    setClassId(null); // ✅ ADDED
    setSessionData(null);
    setUserRole(null);
    setUserId(null);
    setIsInSession(false);
  };

  /**
   * Update the current stage (teacher only)
   */
  const setCurrentStage = async (stage) => {
    if (userRole !== 'teacher') {
      console.warn('Only teachers can update stage');
      return;
    }
    
    try {
      await updateSessionStage(sessionCode, stage);
    } catch (error) {
      console.error('Error updating stage:', error);
    }
  };

  /**
   * Mark activity as complete (student)
   */
  const markActivityComplete = async (activityId, status = 'completed') => {
    if (userRole !== 'student') {
      console.warn('Only students can mark activities complete');
      return;
    }

    try {
      await updateStudentProgress(sessionCode, userId, activityId, status);
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  /**
   * End the session (teacher only)
   */
  const endSession = async () => {
    if (userRole !== 'teacher') {
      console.warn('Only teachers can end session');
      return;
    }

    try {
      await firebaseEndSession(sessionCode);
      leaveSession();
    } catch (error) {
      console.error('Error ending session:', error);
    }
  };

  /**
   * Get current stage
   */
  const getCurrentStage = () => {
    return sessionData?.currentStage || 'locked';
  };

  /**
   * Get list of students in session
   */
  const getStudents = () => {
    if (!sessionData?.studentsJoined) return [];
    return Object.values(sessionData.studentsJoined);
  };

  /**
   * Get student progress
   */
  const getStudentProgress = (studentId) => {
    return sessionData?.studentProgress?.[studentId] || {};
  };

  /**
   * Get all student progress (for teacher)
   */
  const getAllProgress = () => {
    return sessionData?.studentProgress || {};
  };

  /**
   * Calculate progress stats for current activity
   */
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
    classId, // ✅ ADDED
    sessionData,
    userRole,
    userId,
    isInSession,
    
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

export default SessionContext;