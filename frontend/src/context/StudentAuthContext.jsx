// Firebase Authentication Context for Student Accounts
// src/context/StudentAuthContext.jsx

import { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase/config';
import { getOrCreateStudent, getStudentById, isTeacher } from '../firebase/students';
import { getClassByCode } from '../firebase/classes';
import { verifyPin, getSeat } from '../firebase/enrollments';

// Session storage keys for PIN-based auth
const PIN_SESSION_KEY = 'student-pin-session';
const PIN_SESSION_EXPIRY = 8 * 60 * 60 * 1000; // 8 hours

const StudentAuthContext = createContext(null);

export const useStudentAuth = () => {
  const context = useContext(StudentAuthContext);
  if (!context) {
    throw new Error('useStudentAuth must be used within a StudentAuthProvider');
  }
  return context;
};

export const StudentAuthProvider = ({ children }) => {
  const [student, setStudent] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [pinSession, setPinSession] = useState(null); // For PIN-based auth
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check for existing PIN session on mount
  useEffect(() => {
    const savedSession = localStorage.getItem(PIN_SESSION_KEY);
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        // Check if session is expired
        if (session.expiresAt > Date.now()) {
          setPinSession(session);
        } else {
          // Clear expired session
          localStorage.removeItem(PIN_SESSION_KEY);
        }
      } catch (e) {
        localStorage.removeItem(PIN_SESSION_KEY);
      }
    }
  }, []);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Check if this is a student account (not a teacher)
          const teacherCheck = await isTeacher(firebaseUser.uid);

          if (teacherCheck) {
            // This is a teacher account, not a student
            // Don't set student state - let them use teacher auth
            console.log('User is a teacher, not setting student state');
            setStudent(null);
            setStudentData(null);
            setLoading(false);
            return;
          }

          // Check if student record exists
          const data = await getStudentById(firebaseUser.uid);

          if (data) {
            setStudent(firebaseUser);
            setStudentData(data);
          } else {
            // User exists in Firebase Auth but no student record
            // This could be a new student who needs to complete setup
            setStudent(firebaseUser);
            setStudentData(null);
          }
        } catch (err) {
          console.error('Error checking student status:', err);
        }
      } else {
        setStudent(null);
        setStudentData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Sign in with Google (for students - no email whitelist)
  const signInWithGoogle = async () => {
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;

      // Check if this email is already a teacher
      const teacherCheck = await isTeacher(firebaseUser.uid);

      if (teacherCheck) {
        // Sign them out from student portal
        await firebaseSignOut(auth);
        setStudent(null);
        setStudentData(null);

        const teacherError = new Error('This account is registered as a teacher. Please use the teacher login.');
        teacherError.code = 'auth/is-teacher';
        throw teacherError;
      }

      // Create or update student record
      const data = await getOrCreateStudent(firebaseUser);
      setStudentData(data);

      console.log('Student Sign-In successful:', firebaseUser.email);
      return { user: firebaseUser, studentData: data };
    } catch (err) {
      console.error('Student Sign-In error:', err);
      setError(err.message);
      throw err;
    }
  };

  // Sign in with PIN (Class Code + Seat + PIN) - legacy seat number method
  const signInWithPin = async (classCode, seatNumber, pin) => {
    setError(null);
    try {
      const classData = await getClassByCode(classCode.toUpperCase());

      if (!classData) {
        throw new Error('Class not found. Check the class code and try again.');
      }

      if (classData.mode !== 'accounts') {
        throw new Error('This class does not support student accounts. Ask your teacher for help.');
      }

      const pinResult = await verifyPin(classData.id, parseInt(seatNumber), pin);

      if (!pinResult.valid) {
        throw new Error(pinResult.error || 'Invalid PIN. Please check your seat number and PIN.');
      }

      const seat = await getSeat(classData.id, parseInt(seatNumber));

      const session = {
        classId: classData.id,
        classCode: classData.classCode,
        className: classData.name,
        seatNumber: parseInt(seatNumber),
        displayName: seat.displayName,
        username: seat.username,
        teacherUid: classData.teacherUid,
        createdAt: Date.now(),
        expiresAt: Date.now() + PIN_SESSION_EXPIRY
      };

      localStorage.setItem(PIN_SESSION_KEY, JSON.stringify(session));
      setPinSession(session);

      console.log('PIN Sign-In successful:', session.displayName);
      return session;
    } catch (err) {
      console.error('PIN Sign-In error:', err);
      setError(err.message);
      throw err;
    }
  };

  // Sign in with just username + PIN (global lookup, no class code needed)
  const signInWithUsername = async (username, pin) => {
    setError(null);
    try {
      const { verifyStudentGlobal } = await import('../firebase/enrollments');
      const result = await verifyStudentGlobal(username.toLowerCase().trim(), pin);

      if (!result.success) {
        throw new Error(result.error || 'Invalid username or PIN.');
      }

      const session = {
        classId: result.classId,
        classCode: result.classCode,
        className: result.className,
        seatNumber: result.seatNumber,
        displayName: result.studentName,
        username: result.username,
        teacherUid: result.teacherUid,
        createdAt: Date.now(),
        expiresAt: Date.now() + PIN_SESSION_EXPIRY
      };

      localStorage.setItem(PIN_SESSION_KEY, JSON.stringify(session));
      setPinSession(session);

      console.log('Username Sign-In successful:', session.displayName);
      return session;
    } catch (err) {
      console.error('Username Sign-In error:', err);
      setError(err.message);
      throw err;
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      // Sign out from Firebase (if Google auth)
      if (student) {
        await firebaseSignOut(auth);
      }

      // Clear PIN session
      localStorage.removeItem(PIN_SESSION_KEY);

      setStudent(null);
      setStudentData(null);
      setPinSession(null);
      console.log('Student signed out successfully');
    } catch (err) {
      console.error('Sign out error:', err);
      setError(err.message);
      throw err;
    }
  };

  // Determine authentication status
  const isGoogleAuth = !!student && !!studentData;
  const isPinAuth = !!pinSession;
  const isAuthenticated = isGoogleAuth || isPinAuth;

  // Get current student info (from either auth method)
  const currentStudentInfo = isGoogleAuth
    ? {
        displayName: studentData.displayName,
        email: studentData.email,
        photoURL: studentData.photoURL,
        authMethod: 'google',
        uid: student.uid
      }
    : isPinAuth
    ? {
        displayName: pinSession.displayName,
        className: pinSession.className,
        seatNumber: pinSession.seatNumber,
        classId: pinSession.classId,
        authMethod: 'pin'
      }
    : null;

  const value = {
    student,
    studentData,
    pinSession,
    loading,
    error,
    isAuthenticated,
    isGoogleAuth,
    isPinAuth,
    currentStudentInfo,
    isPartialAuth: !!student && !studentData, // Signed in but no student record yet
    signInWithGoogle,
    signInWithPin,
    signInWithUsername,
    signOut
  };

  return (
    <StudentAuthContext.Provider value={value}>
      {children}
    </StudentAuthContext.Provider>
  );
};

export default StudentAuthContext;
