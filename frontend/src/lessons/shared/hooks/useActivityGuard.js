/**
 * useActivityGuard - Prevents browser back button from losing activity progress
 *
 * Pushes dummy history entries and intercepts popstate events.
 * Shows a warning instead of navigating away.
 * Works on Chromebooks (back button, trackpad swipe, Alt+Left).
 */

import { useEffect, useState, useCallback } from 'react';

export function useActivityGuard(isActive = true) {
  const [showBackWarning, setShowBackWarning] = useState(false);

  useEffect(() => {
    if (!isActive) return;

    // Push 2 dummy entries so rapid back-taps are caught
    window.history.pushState({ activityGuard: true }, '');
    window.history.pushState({ activityGuard: true }, '');

    const handlePopState = () => {
      // Re-push so the guard stays active
      window.history.pushState({ activityGuard: true }, '');
      setShowBackWarning(true);
    };

    // Also guard against tab close / refresh
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isActive]);

  const dismissWarning = useCallback(() => setShowBackWarning(false), []);

  return { showBackWarning, dismissWarning };
}
