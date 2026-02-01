// Teacher Welcome Component
// src/components/teacher/TeacherWelcome.jsx
// Shows two clear paths for teachers: Browse Lessons or Set Up Classes
// Research-backed: self-select onboarding increases conversion by 15-55%

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, X, ChevronRight } from 'lucide-react';

const WELCOME_DISMISSED_KEY = 'teacher-welcome-dismissed';

const TeacherWelcome = ({ onDismiss, teacherName }) => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);

  const handleBrowseLessons = () => {
    // Stay on resources page, just dismiss the welcome
    localStorage.setItem(WELCOME_DISMISSED_KEY, 'true');
    setIsVisible(false);
    onDismiss?.();
  };

  const handleSetUpClasses = () => {
    localStorage.setItem(WELCOME_DISMISSED_KEY, 'true');
    setIsVisible(false);
    navigate('/teacher/dashboard');
  };

  const handleDismiss = () => {
    // X button only dismisses for this session, not permanently
    // Teachers can explore and still see welcome on next visit
    sessionStorage.setItem('teacher-welcome-dismissed-session', 'true');
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 text-white relative">
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
            aria-label="Dismiss"
          >
            <X size={24} />
          </button>
          <h1 className="text-2xl font-bold mb-1">
            Welcome{teacherName ? `, ${teacherName}` : ''}!
          </h1>
          <p className="text-blue-100">
            How would you like to get started?
          </p>
        </div>

        {/* Two Paths */}
        <div className="p-8">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Path 1: Browse Lessons */}
            <button
              onClick={handleBrowseLessons}
              className="group text-left p-6 rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all"
            >
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                <BookOpen className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
                Browse Lessons
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
              </h3>
              <p className="text-gray-600 mb-3">
                Try a lesson now. Students join with a simple 4-digit code.
              </p>
              <span className="inline-block text-sm text-blue-600 font-medium">
                No setup needed
              </span>
            </button>

            {/* Path 2: Set Up Classes */}
            <button
              onClick={handleSetUpClasses}
              className="group text-left p-6 rounded-xl border-2 border-gray-200 hover:border-indigo-400 hover:shadow-lg transition-all"
            >
              <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-200 transition-colors">
                <Users className="w-7 h-7 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
                Set Up My Classes
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
              </h3>
              <p className="text-gray-600 mb-3">
                Create classes to track student progress, save work, and give grades.
              </p>
              <span className="inline-block text-sm text-indigo-600 font-medium">
                For ongoing curriculum use
              </span>
            </button>
          </div>

          {/* Helper text */}
          <p className="text-center text-gray-500 text-sm mt-6">
            You can always access classes later from the "My Classes" button
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * Check if welcome should be shown
 * Returns true if teacher hasn't permanently dismissed OR temporarily dismissed this session
 */
export const shouldShowTeacherWelcome = () => {
  // Check permanent dismissal (clicked a path button)
  if (localStorage.getItem(WELCOME_DISMISSED_KEY) === 'true') {
    return false;
  }
  // Check session dismissal (clicked X)
  if (sessionStorage.getItem('teacher-welcome-dismissed-session') === 'true') {
    return false;
  }
  return true;
};

/**
 * Reset the welcome state (for testing)
 */
export const resetTeacherWelcome = () => {
  localStorage.removeItem(WELCOME_DISMISSED_KEY);
};

export default TeacherWelcome;
