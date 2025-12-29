// Firebase Authentication Context for Teacher Accounts
// src/context/FirebaseAuthContext.jsx

import { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink
} from 'firebase/auth';
import { auth, googleProvider, microsoftProvider } from '../firebase/config';
import { getOrCreateUser, getUserById } from '../firebase/users';
import { isEmailApproved } from '../firebase/approvedEmails';
import { trackFirstLogin } from '../firebase/analytics';

// Import to expose console helpers (addApprovedEmail, etc.)
import '../firebase/approvedEmails';

// Key for storing email for magic link sign-in
const EMAIL_FOR_SIGN_IN_KEY = 'emailForSignIn';

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

      // Run approval check and user creation in PARALLEL for faster sign-in
      const [approved, data] = await Promise.all([
        isEmailApproved(firebaseUser.email),
        getOrCreateUser(firebaseUser)
      ]);

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

  // Sign in with Microsoft
  const signInWithMicrosoft = async () => {
    setError(null);
    try {
      const result = await signInWithPopup(auth, microsoftProvider);
      const firebaseUser = result.user;

      // Run approval check and user creation in PARALLEL for faster sign-in
      const [approved, data] = await Promise.all([
        isEmailApproved(firebaseUser.email),
        getOrCreateUser(firebaseUser)
      ]);

      if (!approved) {
        // Sign them out immediately
        await firebaseSignOut(auth);
        setUser(null);
        setUserData(null);

        const notApprovedError = new Error("Your email is not registered for access. Contact support@musicmindacademy.com");
        notApprovedError.code = 'auth/not-approved';
        console.log('⚠️ Email not approved:', firebaseUser.email);
        throw notApprovedError;
      }

      setUserData(data);

      // Track login for analytics (non-blocking)
      trackFirstLogin(firebaseUser.uid, firebaseUser.email).catch(err => {
        console.warn('Analytics tracking failed (non-critical):', err.message);
      });

      console.log('✅ Microsoft Sign-In successful:', firebaseUser.email);
      return { user: firebaseUser, userData: data };
    } catch (err) {
      console.error('❌ Microsoft Sign-In error:', err);
      setError(err.message);
      throw err;
    }
  };

  // Send magic link email
  const sendMagicLink = async (email) => {
    setError(null);
    const normalizedEmail = email.toLowerCase().trim();

    // First check if email is approved
    const approved = await isEmailApproved(normalizedEmail);

    if (!approved) {
      const notApprovedError = new Error("This email is not registered. Contact support@musicmindacademy.com");
      notApprovedError.code = 'auth/not-approved';
      console.log('⚠️ Email not approved for magic link:', normalizedEmail);
      throw notApprovedError;
    }

    // Configure the action code settings
    const actionCodeSettings = {
      url: window.location.origin + '/login',
      handleCodeInApp: true
    };

    try {
      await sendSignInLinkToEmail(auth, normalizedEmail, actionCodeSettings);
      // Store the email locally for when user returns
      localStorage.setItem(EMAIL_FOR_SIGN_IN_KEY, normalizedEmail);
      console.log('✅ Magic link sent to:', normalizedEmail);
      return true;
    } catch (err) {
      console.error('❌ Failed to send magic link:', err);
      setError(err.message);
      throw err;
    }
  };

  // Complete magic link sign-in (called when user returns from email link)
  const completeMagicLinkSignIn = async (emailFromPrompt = null) => {
    setError(null);

    // Check if current URL is a sign-in link
    if (!isSignInWithEmailLink(auth, window.location.href)) {
      return null; // Not a magic link URL
    }

    // Get email from localStorage or prompt
    let email = localStorage.getItem(EMAIL_FOR_SIGN_IN_KEY);
    if (!email && emailFromPrompt) {
      email = emailFromPrompt;
    }

    if (!email) {
      // User needs to provide email
      const needsEmailError = new Error('Please enter your email to complete sign-in');
      needsEmailError.code = 'auth/needs-email';
      throw needsEmailError;
    }

    try {
      const result = await signInWithEmailLink(auth, email, window.location.href);
      const firebaseUser = result.user;

      // Clear the stored email
      localStorage.removeItem(EMAIL_FOR_SIGN_IN_KEY);

      // Check if email is approved (double check)
      const approved = await isEmailApproved(firebaseUser.email);

      if (!approved) {
        await firebaseSignOut(auth);
        setUser(null);
        setUserData(null);

        const notApprovedError = new Error("Your email is not registered for access. Contact support@musicmindacademy.com");
        notApprovedError.code = 'auth/not-approved';
        throw notApprovedError;
      }

      // Get or create user document
      const data = await getOrCreateUser(firebaseUser);
      setUserData(data);

      // Track login
      trackFirstLogin(firebaseUser.uid, firebaseUser.email).catch(err => {
        console.warn('Analytics tracking failed (non-critical):', err.message);
      });

      console.log('✅ Magic link Sign-In successful:', firebaseUser.email);
      return { user: firebaseUser, userData: data };
    } catch (err) {
      console.error('❌ Magic link Sign-In error:', err);
      localStorage.removeItem(EMAIL_FOR_SIGN_IN_KEY);
      setError(err.message);
      throw err;
    }
  };

  // Check if current URL is a magic link
  const isMagicLinkUrl = () => {
    return isSignInWithEmailLink(auth, window.location.href);
  };

  // Get stored email for magic link (if any)
  const getStoredEmailForMagicLink = () => {
    return localStorage.getItem(EMAIL_FOR_SIGN_IN_KEY);
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
    signInWithMicrosoft,
    sendMagicLink,
    completeMagicLinkSignIn,
    isMagicLinkUrl,
    getStoredEmailForMagicLink,
    signOut
  };

  return (
    <FirebaseAuthContext.Provider value={value}>
      {children}
    </FirebaseAuthContext.Provider>
  );
};

export default FirebaseAuthContext;
