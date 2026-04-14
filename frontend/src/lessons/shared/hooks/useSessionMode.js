// File: /lessons/shared/hooks/useSessionMode.js
// Session mode detection and initialization hook

import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useFirebaseAuth } from '../../../context/FirebaseAuthContext';
import { useSession } from '../../../context/SessionContext';
import { useStudentAuth } from '../../../context/StudentAuthContext';

export const useSessionMode = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { user: firebaseUser, loading: firebaseAuthLoading } = useFirebaseAuth();
  const { startSession, joinSession, getCurrentStage, sessionCode: activeSessionCode, userRole: activeRole } = useSession();
  const { currentStudentInfo } = useStudentAuth();

  const [sessionMode, setSessionMode] = useState(false);
  const [sessionInitialized, setSessionInitialized] = useState(false);

  // Extract URL parameters
  const searchParams = new URLSearchParams(location.search);
  const urlSessionCode = searchParams.get('session');
  const requestedRole = searchParams.get('role');
  const urlClassId = searchParams.get('classId');
  const urlClassCode = searchParams.get('classCode'); // Permanent class code for display
  const urlSeatId = searchParams.get('seatId'); // Present when student already joined via StudentHome
  const isPreviewMode = searchParams.get('preview') === 'true';

  // Verify teacher role: must have Firebase auth (Google/Microsoft sign-in)
  // Wait for Firebase auth to finish loading before downgrading teacher role
  const isVerifiedTeacher = !!firebaseUser;
  const authReady = !firebaseAuthLoading;
  const urlRole = (!authReady && requestedRole === 'teacher')
    ? 'teacher'  // Trust the URL role while auth is still loading
    : (requestedRole === 'teacher' && !isVerifiedTeacher ? 'student' : requestedRole);

  // Session can be via session code (quick) or classId (class-based)
  const isSessionMode = !!((urlSessionCode || urlClassId) && urlRole);

  // Determine user permissions
  const isDevelopment = import.meta.env.DEV;
  let isClassroomUser = false;
  let classroomRole = null;
  try {
    isClassroomUser = localStorage.getItem('classroom-logged-in') === 'true';
    classroomRole = localStorage.getItem('classroom-user-role');
  } catch (e) {
    // localStorage blocked on some managed Chromebooks
  }
  const isTeacher = user?.role === 'teacher' || classroomRole === 'teacher' || isVerifiedTeacher;
  const canAccessNavTools = isTeacher || isDevelopment;

  // Initialize session on mount if session params exist (wait for auth to be ready)
  useEffect(() => {
    if (isSessionMode && !sessionInitialized && authReady) {
      console.log('Session mode detected:', { urlSessionCode, urlRole, urlClassId, isPreviewMode });

      // Skip if SessionContext already restored this session from URL params
      const alreadyActive = activeSessionCode === urlSessionCode && activeRole === urlRole;

      if (urlRole === 'teacher' && isVerifiedTeacher) {
        if (!alreadyActive) {
          startSession(urlSessionCode, 'teacher', urlClassId, urlClassCode);
          console.log('Teacher session started:', { sessionCode: urlSessionCode, classId: urlClassId });
        }
      } else if (urlRole === 'student' || (requestedRole === 'teacher' && !isVerifiedTeacher)) {
        // Skip joining as a student if this is preview mode (teacher's preview panel)
        // Preview mode should only observe, not add to student count
        if (isPreviewMode) {
          console.log('👀 Preview mode - skipping student join to avoid counting teacher as student');
        } else {
          // Get student ID: use seatId from URL if student already joined via StudentHome/JoinWithCode,
          // otherwise create a persistent ID for quick-session students
          let studentId;
          let studentName;
          try {
            // seatId in URL means student already joined via class roster — use the same ID
            // to avoid creating a duplicate entry in studentsJoined
            studentId = urlSeatId || localStorage.getItem('classroom-user-id');
            if (!studentId) {
              studentId = 'student-' + Date.now();
              localStorage.setItem('classroom-user-id', studentId);
              console.log('🆔 Created new persistent student ID:', studentId);
            }
            // Use PIN-auth student name first (from class roster), then fall back to classroom-username
            studentName = currentStudentInfo?.displayName || localStorage.getItem('classroom-username') || 'Student';
          } catch (e) {
            studentId = urlSeatId || 'student-' + Date.now();
            studentName = currentStudentInfo?.displayName || 'Student';
          }
          // Use classCode for class-based sessions, sessionCode for quick sessions
          const codeToJoin = urlClassCode || urlSessionCode;
          if (codeToJoin) {
            joinSession(codeToJoin, studentId, studentName);
            console.log('Student joining session with ID:', studentId);
          } else {
            console.warn('⚠️ No session code or class code found for student join');
          }
        }
      }

      setSessionMode(true);
      setSessionInitialized(true);
    }
  }, [isSessionMode, sessionInitialized, authReady, urlSessionCode, urlRole, urlClassId, isPreviewMode, startSession, joinSession]);

  return {
    sessionMode,
    isSessionMode,
    sessionInitialized,
    urlSessionCode,
    urlRole,
    urlClassId,
    urlClassCode, // Permanent class code for display on teacher's screen
    isPreviewMode,
    isTeacher,
    canAccessNavTools,
    isDevelopment,
    getCurrentStage
  };
};