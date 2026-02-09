// Shared Teacher Header Component
// src/components/teacher/TeacherHeader.jsx
// Consistent navigation across all teacher pages

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useFirebaseAuth } from '../../context/FirebaseAuthContext';
import {
  LogOut,
  BookOpen,
  Users,
  HelpCircle,
  Bell,
  X,
  Mail,
  MessageSquare
} from 'lucide-react';

const TeacherHeader = ({ pendingCount = 0 }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useFirebaseAuth();
  const [showHelp, setShowHelp] = useState(false);

  // Determine which tab is active
  const isOnClasses = location.pathname.includes('/teacher/dashboard') ||
                      location.pathname.includes('/teacher/gradebook') ||
                      location.pathname.includes('/teacher/class');
  const isOnLessons = location.pathname.includes('/music-classroom-resources') ||
                      location.pathname.includes('/music-loops-in-media');

  // Check which site we're on
  const isEduSite = import.meta.env.VITE_SITE_MODE === 'edu';
  const siteName = isEduSite ? 'Music Room Tools' : 'Music Mind Academy';

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            {/* Logo + Site Name */}
            <div className="flex items-center gap-2">
              {!isEduSite && (
                <img
                  src="/MusicMindAcademyLogo.png"
                  alt="Music Mind Academy"
                  className="h-8 w-auto"
                />
              )}
              <span className="font-semibold text-gray-900 hidden sm:block">{siteName}</span>
            </div>

            {/* Navigation */}
            <nav className="flex items-center">
              <button
                onClick={() => navigate('/music-classroom-resources')}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isOnLessons
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <span className="hidden sm:inline">Browse </span>Lessons
              </button>
              <button
                onClick={() => navigate('/teacher/dashboard')}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isOnClasses
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <span className="hidden sm:inline">My </span>Classes
              </button>
              <button
                onClick={() => setShowHelp(true)}
                className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Help
              </button>
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-2">
              {/* Notifications */}
              {pendingCount > 0 && (
                <button
                  onClick={() => navigate('/teacher/dashboard')}
                  className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                  title={`${pendingCount} pending`}
                >
                  <Bell size={18} />
                  <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-medium">
                    {pendingCount > 9 ? '9+' : pendingCount}
                  </span>
                </button>
              )}

              {/* User */}
              <div className="flex items-center gap-2">
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt=""
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
                    {user?.displayName?.charAt(0) || 'T'}
                  </div>
                )}
                <span className="text-sm text-gray-700 font-medium hidden md:block max-w-[120px] truncate">
                  {user?.displayName?.split(' ')[0]}
                </span>
              </div>

              {/* Sign Out */}
              <button
                onClick={handleSignOut}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Sign out"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Help & Support</h2>
              <button
                onClick={() => setShowHelp(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-5 space-y-3">
              <div className="bg-blue-50 rounded-lg p-4 text-sm">
                <p className="font-medium text-blue-900 mb-2">Two ways to use the platform:</p>
                <ul className="text-blue-800 space-y-1">
                  <li><strong>Quick Join:</strong> Students join with a 4-digit code. No accounts needed.</li>
                  <li><strong>Classroom Mode:</strong> Students log in to save work, get grades, and track progress.</li>
                </ul>
              </div>

              <a
                href="mailto:support@musicmindacademy.com"
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Mail className="w-5 h-5 text-gray-400" />
                <div className="text-sm">
                  <div className="font-medium text-gray-900">Email Support</div>
                  <div className="text-gray-500">support@musicmindacademy.com</div>
                </div>
              </a>

              <a
                href="https://docs.google.com/forms/d/e/example/viewform"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <MessageSquare className="w-5 h-5 text-gray-400" />
                <div className="text-sm">
                  <div className="font-medium text-gray-900">Send Feedback</div>
                  <div className="text-gray-500">Help us improve</div>
                </div>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TeacherHeader;
