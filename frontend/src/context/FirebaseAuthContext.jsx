// Firebase Authentication Context for Teacher Accounts
// src/context/FirebaseAuthContext.jsx

import { createContext, useContext, useState, useEffect } from 'react';
import { signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider } from '../firebase/config';
import { getOrCreateUser, getUserById } from '../firebase/users';
import { isEmailApproved } from '../firebase/approvedEmails';
import { trackFirstLogin } from '../firebase/analytics';

// Import to expose console helpers (addApprovedEmail, etc.)
import '../firebase/approvedEmails';

const FirebaseAuthContext = createContext(null);

export const useFirebaseAuth = () => {
  const context = useContext(FirebaseAuthContext);
  if (!context) {
    throw new Error('useFirebaseAuth must be used within a FirebaseAuthProvider');
  }
  return context;
};

export const FirebaseAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Verify user is still approved
        try {
          const approved = await isEmailApproved(firebaseUser.email);

          if (!approved) {
            // User's email was removed from approved list
            console.log('⚠️ User no longer approved, signing out:', firebaseUser.email);
            await firebaseSignOut(auth);
            setUser(null);
            setUserData(null);
            setLoading(false);
            return;
          }

          setUser(firebaseUser);
          // Fetch user data from Firestore
          const data = await getUserById(firebaseUser.uid);
          setUserData(data);
        } catch (err) {
          console.error('Error checking user approval:', err);
        }
      } else {
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Sign in with Google
  const signInWithGoogle = async () => {
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;

      // Check if email is approved for pilot program
      const approved = await isEmailApproved(firebaseUser.email);

      if (!approved) {
        // Sign them out immediately
        await firebaseSignOut(auth);
        setUser(null);
        setUserData(null);

        const notApprovedError = new Error("Your email hasn't been approved for the pilot yet. Please apply through our form and wait for approval.");
        notApprovedError.code = 'auth/not-approved';
        console.log('⚠️ Email not approved:', firebaseUser.email);
        throw notApprovedError;
      }

      // Get or create user document in Firestore
      const data = await getOrCreateUser(firebaseUser);
      setUserData(data);

      // Track login for analytics (non-blocking - don't fail sign-in if analytics fails)
      trackFirstLogin(firebaseUser.uid, firebaseUser.email).catch(err => {
        console.warn('Analytics tracking failed (non-critical):', err.message);
      });

      console.log('✅ Google Sign-In successful:', firebaseUser.email);
      return { user: firebaseUser, userData: data };
    } catch (err) {
      console.error('❌ Google Sign-In error:', err);
      setError(err.message);
      throw err;
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setUserData(null);
      console.log('✅ Signed out successfully');
    } catch (err) {
      console.error('❌ Sign out error:', err);
      setError(err.message);
      throw err;
    }
  };

  const value = {
    user,
    userData,
    loading,
    error,
    isAuthenticated: !!user,
    signInWithGoogle,
    signOut
  };

  return (
    <FirebaseAuthContext.Provider value={value}>
      {children}
    </FirebaseAuthContext.Provider>
  );
};

export default FirebaseAuthContext;
