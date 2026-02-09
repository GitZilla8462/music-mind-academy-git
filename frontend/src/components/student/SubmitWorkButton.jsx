// Submit Work Button Component
// src/components/student/SubmitWorkButton.jsx
// Allows students to submit their work to the teacher for grading

import React, { useState } from 'react';
import { Send, Check, Loader2, Lock } from 'lucide-react';
import { useStudentAuth } from '../../context/StudentAuthContext';
import { submitWorkToTeacher } from '../../utils/studentWorkStorage';

/**
 * Button component for submitting student work to the teacher
 * Only shows for authenticated students
 *
 * @param {string} activityId - The activity ID (e.g., 'sports-composition')
 * @param {boolean} disabled - Whether the button should be disabled
 * @param {string} className - Additional CSS classes
 * @param {function} onSubmitSuccess - Callback when submission succeeds
 * @param {function} onSubmitError - Callback when submission fails
 */
const SubmitWorkButton = ({
  activityId,
  disabled = false,
  className = '',
  onSubmitSuccess,
  onSubmitError
}) => {
  const { isAuthenticated, currentStudentInfo, isPinAuth } = useStudentAuth();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  const getAuthInfo = () => {
    if (isPinAuth) {
      return {
        uid: `pin-${currentStudentInfo.classId}-${currentStudentInfo.seatNumber}`,
        classId: currentStudentInfo.classId
      };
    }
    return null;
  };

  const handleSubmit = async () => {
    const authInfo = getAuthInfo();
    if (!authInfo) return;

    setSubmitting(true);
    setError(null);

    try {
      await submitWorkToTeacher(activityId, authInfo);
      setSubmitted(true);
      onSubmitSuccess?.();
    } catch (err) {
      console.error('Submit error:', err);
      setError(err.message);
      onSubmitError?.(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <button
        disabled
        className={`flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg cursor-not-allowed ${className}`}
      >
        <Check className="w-4 h-4" />
        Submitted
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={handleSubmit}
        disabled={disabled || submitting}
        className={`flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        {submitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            Submit to Teacher
          </>
        )}
      </button>
      {error && (
        <div className="absolute top-full left-0 mt-2 p-2 bg-red-900/90 text-red-200 text-sm rounded-lg whitespace-nowrap">
          {error}
        </div>
      )}
    </div>
  );
};

/**
 * Compact version for toolbars and inline use
 */
export const SubmitWorkButtonCompact = ({
  activityId,
  disabled = false,
  className = '',
  onSubmitSuccess,
  onSubmitError
}) => {
  const { isAuthenticated, currentStudentInfo, isPinAuth } = useStudentAuth();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isAuthenticated) {
    return null;
  }

  const getAuthInfo = () => {
    if (isPinAuth) {
      return {
        uid: `pin-${currentStudentInfo.classId}-${currentStudentInfo.seatNumber}`,
        classId: currentStudentInfo.classId
      };
    }
    return null;
  };

  const handleSubmit = async () => {
    const authInfo = getAuthInfo();
    if (!authInfo) return;

    setSubmitting(true);
    try {
      await submitWorkToTeacher(activityId, authInfo);
      setSubmitted(true);
      onSubmitSuccess?.();
    } catch (err) {
      console.error('Submit error:', err);
      onSubmitError?.(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <button
        disabled
        className={`p-2 bg-green-600 text-white rounded-lg cursor-not-allowed ${className}`}
        title="Work submitted"
      >
        <Check className="w-5 h-5" />
      </button>
    );
  }

  return (
    <button
      onClick={handleSubmit}
      disabled={disabled || submitting}
      className={`p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      title="Submit to teacher"
    >
      {submitting ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <Send className="w-5 h-5" />
      )}
    </button>
  );
};

/**
 * Indicator component to show when student is not logged in
 * Can be used alongside save buttons to encourage login
 */
export const LoginToSubmitIndicator = ({ className = '' }) => {
  const { isAuthenticated } = useStudentAuth();

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 text-gray-400 text-sm ${className}`}>
      <Lock className="w-4 h-4" />
      <span>Sign in to submit to your teacher</span>
    </div>
  );
};

export default SubmitWorkButton;
