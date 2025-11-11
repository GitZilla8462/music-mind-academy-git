// Session Context for managing classroom sessions
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
  const [classId, setClassId] = useState(null);
  const [sessionData, setSessionData] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isInSession, setIsInSession] = useState(false);

  useEffect(() => {
    if (!sessionCode) return;

    console.log('Subscribing to session:', sessionCode);
    
    const unsubscribe = subscribeToSession(sessionCode, (data) => {
      console.log('Session data updated:', data);
      setSessionData(data);
      setIsInSession(!!data);
      
      if (data?.classId && !classId) {
        setClassId(data.classId);
        console.log('ClassId set from session data:', data.classId);
      }
    });

    return () => {
      console.log('Unsubscribing from session:', sessionCode);
      unsubscribe();
    };
  }, [sessionCode, classId]);

  const startSession = (code, teacherId, classIdParam = null) => {
    setSessionCode(code);
    setUserRole('teacher');
    setUserId(teacherId);
    setIsInSession(true);
    
    if (classIdParam) {
      setClassId(classIdParam);
      console.log('Session started with classId:', classIdParam);
    }
  };

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

  const leaveSession = () => {
    setSessionCode(null);
    setClassId(null);
    setSessionData(null);
    setUserRole(null);
    setUserId(null);
    setIsInSession(false);
  };

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

// ❌ REMOVED: Do not export default - this causes Fast Refresh issues
// export default SessionContext;