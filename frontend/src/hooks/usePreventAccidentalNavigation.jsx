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
//
// NOTE: When ?passive=true is in the URL, navigation prevention is disabled.
// This is used for iframe previews to avoid IPC flooding (Chrome throttling).

import { useEffect, useRef } from 'react';

// Check if we're in passive mode (iframe preview) - should skip all navigation prevention
const isPassiveMode = () => {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return params.get('passive') === 'true';
};

// Throttle pushState calls to prevent Safari infinite loop bug
// Safari sometimes fires popstate when pushState is called, causing a loop
let lastPushStateTime = 0;
const PUSH_STATE_THROTTLE_MS = 100;

const throttledPushState = () => {
  const now = Date.now();
  if (now - lastPushStateTime < PUSH_STATE_THROTTLE_MS) {
    return false; // Throttled
  }
  lastPushStateTime = now;
  window.history.pushState(null, '', window.location.href);
  return true;
};

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
  // Use refs for all values that change - this prevents effect re-runs
  // which was causing the Safari pushState infinite loop bug
  const hasUnsavedWorkRef = useRef(hasUnsavedWork);
  const warningMessageRef = useRef(warningMessage);
  const onNavigationAttemptRef = useRef(onNavigationAttempt);
  const allowConfirmationRef = useRef(allowConfirmation);
  const onConfirmedLeaveRef = useRef(onConfirmedLeave);

  // Check passive mode once on mount (stable reference)
  const isPassiveRef = useRef(isPassiveMode());

  // Keep refs updated without triggering effect re-runs
  useEffect(() => {
    hasUnsavedWorkRef.current = hasUnsavedWork;
    warningMessageRef.current = warningMessage;
    onNavigationAttemptRef.current = onNavigationAttempt;
    allowConfirmationRef.current = allowConfirmation;
    onConfirmedLeaveRef.current = onConfirmedLeave;
  });

  useEffect(() => {
    // Skip all navigation prevention in passive mode (iframe previews)
    // This prevents IPC flooding that causes Chrome to throttle
    if (isPassiveRef.current) {
      return;
    }

    // === 1. PREVENT OVERSCROLL GESTURES (Two-finger swipe on Chromebooks) ===
    const originalBodyOverscroll = document.body.style.overscrollBehaviorX;
    const originalHtmlOverscroll = document.documentElement.style.overscrollBehaviorX;
    const originalTouchAction = document.body.style.touchAction;

    document.body.style.overscrollBehaviorX = 'none';
    document.documentElement.style.overscrollBehaviorX = 'none';
    document.body.style.touchAction = 'pan-y pinch-zoom';

    // === 2. PUSH HISTORY STATE TO INTERCEPT BACK BUTTON ===
    // Use throttled version to prevent Safari infinite loop bug
    throttledPushState();

    // === 3. POPSTATE HANDLER (defined inline to use refs) ===
    const handlePopState = () => {
      if (isPassiveRef.current) return;

      if (!hasUnsavedWorkRef.current) {
        // No unsaved work, allow navigation
        return;
      }

      // Re-push state to prevent navigation (throttled to prevent Safari loop)
      throttledPushState();

      // Notify via callback
      if (onNavigationAttemptRef.current) {
        onNavigationAttemptRef.current();
      }

      if (allowConfirmationRef.current) {
        const confirmLeave = window.confirm(
          warningMessageRef.current + '\n\nClick OK to leave anyway, or Cancel to stay.'
        );

        if (confirmLeave) {
          if (onConfirmedLeaveRef.current) {
            onConfirmedLeaveRef.current();
          } else {
            window.history.go(-2);
          }
        }
      }
    };

    // === 4. BEFOREUNLOAD HANDLER ===
    const handleBeforeUnload = (e) => {
      if (isPassiveRef.current) return;
      if (!hasUnsavedWorkRef.current) return;

      e.preventDefault();
      e.returnValue = warningMessageRef.current;
      return warningMessageRef.current;
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // === 5. PREVENT HORIZONTAL SWIPE ON TOUCH DEVICES ===
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

      if (deltaX > deltaY && touchStartX < 50 && deltaX > 30) {
        e.preventDefault();
        if (onNavigationAttemptRef.current) {
          onNavigationAttemptRef.current();
        }
      }
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });

    // === 6. PREVENT KEYBOARD SHORTCUTS FOR BACK ===
    const handleKeyDown = (e) => {
      if (!hasUnsavedWorkRef.current) return;

      if (e.altKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        if (onNavigationAttemptRef.current) {
          onNavigationAttemptRef.current();
        }
      }

      if (e.key === 'Backspace' &&
          !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName) &&
          !document.activeElement.isContentEditable) {
        e.preventDefault();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // === CLEANUP ===
    return () => {
      document.body.style.overscrollBehaviorX = originalBodyOverscroll || '';
      document.documentElement.style.overscrollBehaviorX = originalHtmlOverscroll || '';
      document.body.style.touchAction = originalTouchAction || '';

      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []); // Empty deps - all values accessed via refs
};

/**
 * Simpler version that just blocks all back navigation while active
 * Use this for tutorial/lesson modes where you never want back navigation
 */
export const useBlockBackNavigation = (isActive = true) => {
  const isActiveRef = useRef(isActive);

  useEffect(() => {
    isActiveRef.current = isActive;
  });

  useEffect(() => {
    // Skip in passive mode (iframe previews)
    if (isPassiveMode()) return;
    if (!isActiveRef.current) return;

    // Prevent overscroll
    document.body.style.overscrollBehaviorX = 'none';
    document.documentElement.style.overscrollBehaviorX = 'none';

    // Push state to intercept (throttled to prevent Safari loop)
    throttledPushState();

    const handlePopState = () => {
      if (!isActiveRef.current) return;
      // Throttled to prevent Safari infinite loop bug
      throttledPushState();
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      document.body.style.overscrollBehaviorX = '';
      document.documentElement.style.overscrollBehaviorX = '';
      window.removeEventListener('popstate', handlePopState);
    };
  }, []); // Empty deps - isActive accessed via ref
};

export default usePreventAccidentalNavigation;
