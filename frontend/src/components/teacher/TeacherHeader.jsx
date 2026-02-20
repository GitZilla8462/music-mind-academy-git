// Shared Teacher Header Component
// src/components/teacher/TeacherHeader.jsx
// Consistent navigation across all teacher pages

import React, { useState, useEffect } from 'react';
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
import TutorialVideoLibrary from './onboarding/TutorialVideoLibrary';
import { getUnwatchedCount } from './onboarding/tutorialVideos';

const TeacherHeader = ({ pendingCount = 0 }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useFirebaseAuth();
  const [showHelp, setShowHelp] = useState(false);
  const [unwatchedCount, setUnwatchedCount] = useState(0);

  // Check for unwatched videos
  useEffect(() => {
    setUnwatchedCount(getUnwatchedCount());
  }, [showHelp]);

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
                className="relative px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Help
                {unwatchedCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full" />
                )}
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

      {/* Tutorial Video Library (replaces old Help modal) */}
      <TutorialVideoLibrary
        isOpen={showHelp}
        onClose={() => {
          setShowHelp(false);
          setUnwatchedCount(getUnwatchedCount());
        }}
      />
    </>
  );
};

export default TeacherHeader;
