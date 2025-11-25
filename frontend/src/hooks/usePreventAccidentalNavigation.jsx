// usePreventAccidentalNavigation.jsx
// Prevents accidental navigation on Chromebooks (two-finger swipe back gesture)
// and other browsers (back button, refresh, etc.)
//
// USAGE: Import and call in MusicComposer.jsx or any composition page
//
// import { usePreventAccidentalNavigation } from '../hooks/usePreventAccidentalNavigation';
//
// // Inside your component:
// usePreventAccidentalNavigation({
//   hasUnsavedWork: placedLoops.length > 0 || hasUnsavedChanges,
//   onNavigationAttempt: () => showToast?.('Use the Back button to exit safely', 'warning')
// });

import { useEffect, useCallback, useRef } from 'react';

/**
 * Hook to prevent accidental navigation away from composition pages
 * Especially useful for Chromebooks where two-finger swipe triggers browser back
 * 
 * @param {Object} options
 * @param {boolean} options.hasUnsavedWork - Whether there's unsaved work to protect
 * @param {string} options.warningMessage - Message to show when navigation is blocked
 * @param {function} options.onNavigationAttempt - Callback when navigation is attempted
 * @param {boolean} options.allowConfirmation - If true, shows confirm dialog instead of blocking
 * @param {function} options.onConfirmedLeave - Callback if user confirms they want to leave
 */
export const usePreventAccidentalNavigation = ({
  hasUnsavedWork = false,
  warningMessage = 'You have unsaved work! Use the Back button in the app to exit safely.',
  onNavigationAttempt = null,
  allowConfirmation = false,
  onConfirmedLeave = null
} = {}) => {
  const hasUnsavedWorkRef = useRef(hasUnsavedWork);
  
  // Keep ref updated without triggering effect re-runs
  useEffect(() => {
    hasUnsavedWorkRef.current = hasUnsavedWork;
  }, [hasUnsavedWork]);

  // Handle popstate (browser back button / two-finger swipe)
  const handlePopState = useCallback((e) => {
    if (!hasUnsavedWorkRef.current) {
      // No unsaved work, allow navigation
      return;
    }

    // Re-push state to prevent navigation
    window.history.pushState(null, '', window.location.href);
    
    // Notify via callback
    if (onNavigationAttempt) {
      onNavigationAttempt();
    }

    if (allowConfirmation) {
      // Show confirmation dialog
      const confirmLeave = window.confirm(warningMessage + '\n\nClick OK to leave anyway, or Cancel to stay.');
      
      if (confirmLeave) {
        // User confirmed - allow navigation
        if (onConfirmedLeave) {
          onConfirmedLeave();
        } else {
          // Navigate back by going back twice (past our pushed state)
          window.history.go(-2);
        }
      }
    }
  }, [warningMessage, onNavigationAttempt, allowConfirmation, onConfirmedLeave]);

  // Handle beforeunload (page refresh, close tab, etc.)
  const handleBeforeUnload = useCallback((e) => {
    if (!hasUnsavedWorkRef.current) {
      return;
    }
    
    // Standard way to trigger browser's "Leave site?" dialog
    e.preventDefault();
    e.returnValue = warningMessage;
    return warningMessage;
  }, [warningMessage]);

  useEffect(() => {
    // === 1. PREVENT OVERSCROLL GESTURES (Two-finger swipe on Chromebooks) ===
    // This is the main fix for the Chromebook issue
    const originalBodyOverscroll = document.body.style.overscrollBehaviorX;
    const originalHtmlOverscroll = document.documentElement.style.overscrollBehaviorX;
    const originalTouchAction = document.body.style.touchAction;
    
    document.body.style.overscrollBehaviorX = 'none';
    document.documentElement.style.overscrollBehaviorX = 'none';
    // Restrict touch actions to vertical pan and pinch zoom only
    document.body.style.touchAction = 'pan-y pinch-zoom';
    
    // === 2. PUSH HISTORY STATE TO INTERCEPT BACK BUTTON ===
    // This creates a "buffer" state that we can catch
    window.history.pushState(null, '', window.location.href);
    
    // === 3. ADD EVENT LISTENERS ===
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // === 4. PREVENT HORIZONTAL SWIPE ON TOUCH DEVICES ===
    let touchStartX = 0;
    let touchStartY = 0;
    
    const handleTouchStart = (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };
    
    const handleTouchMove = (e) => {
      if (!hasUnsavedWorkRef.current) return;
      
      const touchCurrentX = e.touches[0].clientX;
      const touchCurrentY = e.touches[0].clientY;
      const deltaX = Math.abs(touchCurrentX - touchStartX);
      const deltaY = Math.abs(touchCurrentY - touchStartY);
      
      // If horizontal swipe is dominant and starts from left edge (back gesture zone)
      if (deltaX > deltaY && touchStartX < 50 && deltaX > 30) {
        e.preventDefault();
        if (onNavigationAttempt) {
          onNavigationAttempt();
        }
      }
    };
    
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    
    // === 5. PREVENT KEYBOARD SHORTCUTS FOR BACK (Alt+Left Arrow) ===
    const handleKeyDown = (e) => {
      if (!hasUnsavedWorkRef.current) return;
      
      // Alt + Left Arrow (common back shortcut)
      if (e.altKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        if (onNavigationAttempt) {
          onNavigationAttempt();
        }
      }
      
      // Backspace outside of input fields (old back navigation)
      if (e.key === 'Backspace' && 
          !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName) &&
          !document.activeElement.isContentEditable) {
        e.preventDefault();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    // === CLEANUP ===
    return () => {
      // Restore original styles
      document.body.style.overscrollBehaviorX = originalBodyOverscroll || '';
      document.documentElement.style.overscrollBehaviorX = originalHtmlOverscroll || '';
      document.body.style.touchAction = originalTouchAction || '';
      
      // Remove event listeners
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handlePopState, handleBeforeUnload, onNavigationAttempt]);
};

/**
 * Simpler version that just blocks all back navigation while active
 * Use this for tutorial/lesson modes where you never want back navigation
 */
export const useBlockBackNavigation = (isActive = true) => {
  useEffect(() => {
    if (!isActive) return;
    
    // Prevent overscroll
    document.body.style.overscrollBehaviorX = 'none';
    document.documentElement.style.overscrollBehaviorX = 'none';
    
    // Push state to intercept
    window.history.pushState(null, '', window.location.href);
    
    const handlePopState = () => {
      window.history.pushState(null, '', window.location.href);
    };
    
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      document.body.style.overscrollBehaviorX = '';
      document.documentElement.style.overscrollBehaviorX = '';
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isActive]);
};

export default usePreventAccidentalNavigation;