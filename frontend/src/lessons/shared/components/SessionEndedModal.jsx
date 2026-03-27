import React, { useEffect, useState } from 'react';

/**
 * Full-screen modal shown to students when a session ends.
 * Reasons: 'teacher-ended' | 'expired' | 'heartbeat-stale'
 * Routes PIN-auth students to /student/home, guests to /join.
 */
const SessionEndedModal = ({ reason, onDismiss }) => {
  const AUTO_REDIRECT_SECONDS = 8;
  const [countdown, setCountdown] = useState(AUTO_REDIRECT_SECONDS);

  const getRedirectPath = () => {
    // PIN-auth students have a dashboard; guests go to /join
    const pinSession = localStorage.getItem('student-pin-session');
    if (pinSession) {
      try {
        const parsed = JSON.parse(pinSession);
        if (parsed && parsed.classId) {
          return '/student/home';
        }
      } catch {
        // fall through
      }
    }
    return '/join';
  };

  const handleDismiss = () => {
    if (onDismiss) onDismiss();
    window.location.href = getRedirectPath();
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleDismiss();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const isExpired = reason === 'expired' || reason === 'heartbeat-stale';

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4 text-center shadow-2xl border border-gray-700">
        {/* Icon */}
        <div className="text-6xl mb-4">
          {isExpired ? '⏰' : '👋'}
        </div>

        {/* Title */}
        <h1 className="text-white text-2xl font-bold mb-3">
          {isExpired ? 'Class Session Expired' : 'Class Is Over!'}
        </h1>

        {/* Message */}
        <p className="text-gray-300 text-lg mb-6">
          {isExpired
            ? 'This class session has been inactive and has expired. Please check with your teacher.'
            : 'Great work today! Your teacher has ended the session.'}
        </p>

        {/* Button */}
        <button
          onClick={handleDismiss}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-6 rounded-xl text-lg transition-colors"
        >
          Done
        </button>

        {/* Countdown */}
        <p className="text-gray-500 text-sm mt-4">
          Redirecting in {countdown} second{countdown !== 1 ? 's' : ''}...
        </p>
      </div>
    </div>
  );
};

export default SessionEndedModal;
