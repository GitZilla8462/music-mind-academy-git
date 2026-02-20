// Firebase Authentication Context for Student Accounts
// src/context/StudentAuthContext.jsx
// Students authenticate via musical username + 4-digit PIN (no Google Sign-In)

import { createContext, useContext, useState, useEffect } from 'react';
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
  const [pinSession, setPinSession] = useState(null);
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
    setLoading(false);
  }, []);

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

      console.log('PIN Sign-In successful');
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
        throw new Error(result.error || 'Invalid username or password.');
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

      console.log('Username Sign-In successful');
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
      localStorage.removeItem(PIN_SESSION_KEY);
      setPinSession(null);
      console.log('Student signed out successfully');
    } catch (err) {
      console.error('Sign out error:', err);
      setError(err.message);
      throw err;
    }
  };

  // Determine authentication status
  const isPinAuth = !!pinSession;
  const isAuthenticated = isPinAuth;

  // Get current student info
  const currentStudentInfo = isPinAuth
    ? {
        displayName: pinSession.displayName,
        className: pinSession.className,
        seatNumber: pinSession.seatNumber,
        classId: pinSession.classId,
        authMethod: 'pin'
      }
    : null;

  const value = {
    pinSession,
    loading,
    error,
    isAuthenticated,
    isPinAuth,
    currentStudentInfo,
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
