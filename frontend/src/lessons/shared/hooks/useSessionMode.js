// File: /lessons/shared/hooks/useSessionMode.js
// Session mode detection and initialization hook

import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useSession } from '../../../context/SessionContext';

export const useSessionMode = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { startSession, joinSession, getCurrentStage } = useSession();
  
  const [sessionMode, setSessionMode] = useState(false);
  const [sessionInitialized, setSessionInitialized] = useState(false);

  // Extract URL parameters
  const searchParams = new URLSearchParams(location.search);
  const urlSessionCode = searchParams.get('session');
  const urlRole = searchParams.get('role');
  const urlClassId = searchParams.get('classId');
  const isSessionMode = !!(urlSessionCode && urlRole);

  // Determine user permissions
  const isDevelopment = import.meta.env.DEV;
  const isClassroomUser = localStorage.getItem('classroom-logged-in') === 'true';
  const classroomRole = localStorage.getItem('classroom-user-role');
  const isTeacher = user?.role === 'teacher' || classroomRole === 'teacher';
  const canAccessNavTools = isTeacher || isDevelopment;

  // Initialize session on mount if session params exist
  useEffect(() => {
    if (isSessionMode && !sessionInitialized) {
      console.log('Session mode detected:', { urlSessionCode, urlRole, urlClassId });
      
      if (urlRole === 'teacher') {
        startSession(urlSessionCode, 'teacher', urlClassId);
        console.log('Teacher session started:', { sessionCode: urlSessionCode, classId: urlClassId });
      } else if (urlRole === 'student') {
        const studentId = localStorage.getItem('classroom-user-id') || 'student-' + Date.now();
        const studentName = localStorage.getItem('classroom-username') || 'Student';
        joinSession(urlSessionCode, studentId, studentName);
        console.log('Student joining session:', { urlSessionCode, studentId, studentName });
      }
      
      setSessionMode(true);
      setSessionInitialized(true);
    }
  }, [isSessionMode, sessionInitialized, urlSessionCode, urlRole, urlClassId, startSession, joinSession]);

  return {
    sessionMode,
    isSessionMode,
    sessionInitialized,
    urlSessionCode,
    urlRole,
    urlClassId,
    isTeacher,
    canAccessNavTools,
    isDevelopment,
    getCurrentStage
  };
};