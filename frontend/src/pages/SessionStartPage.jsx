// SessionStartPage.jsx
// Full-page session code display (replaces modal)
// Located at: /src/pages/SessionStartPage.jsx

import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const SessionStartPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get session code from navigation state
  const sessionCode = location.state?.sessionCode || 'ERROR';
  const lessonPath = location.state?.lessonPath || '/lessons/film-music-project/lesson1';

  const copySessionCode = () => {
    navigator.clipboard.writeText(sessionCode);
    alert('Session code copied!');
  };

  // Auto-open control panel in a new tab when page loads
  useEffect(() => {
    // Open teacher control panel in new tab
    const controlPanelUrl = `${lessonPath}?session=${sessionCode}&role=teacher`;
    window.open(controlPanelUrl, '_blank');
  }, [lessonPath, sessionCode]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 flex items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-12 py-8">
            <div className="text-center">
              <div className="text-6xl mb-4">🎵</div>
              <h1 className="text-4xl font-bold mb-2">Live Session Started!</h1>
              <p className="text-blue-100 text-lg">Share this code with your students</p>
            </div>
          </div>

          {/* Session Code Display */}
          <div className="px-12 py-16 text-center">
            <p className="text-gray-600 text-xl mb-6 font-medium">Session Code:</p>
            
            {/* Big Session Code */}
            <div className="mb-8">
              <div className="inline-block bg-gradient-to-br from-gray-50 to-gray-100 border-4 border-blue-500 rounded-2xl px-16 py-10 shadow-lg">
                <div className="text-8xl font-black text-blue-600 tracking-widest font-mono">
                  {sessionCode}
                </div>
              </div>
            </div>

            {/* Copy Button */}
            <button
              onClick={copySessionCode}
              className="mb-12 bg-gray-100 hover:bg-gray-200 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg transition-all inline-flex items-center space-x-3 border-2 border-gray-300 hover:border-gray-400 shadow-md hover:shadow-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>Copy Code</span>
            </button>

            {/* Instructions */}
            <div className="bg-blue-50 rounded-2xl p-8 mb-12 text-left">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="bg-blue-500 text-white w-10 h-10 rounded-full flex items-center justify-center mr-3 text-lg">ℹ</span>
                Instructions for Students
              </h3>
              <ol className="space-y-4 text-gray-700">
                <li className="flex items-start">
                  <span className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center mr-4 flex-shrink-0 font-bold">1</span>
                  <span className="pt-1 text-lg">Open the lesson page on your device</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center mr-4 flex-shrink-0 font-bold">2</span>
                  <span className="pt-1 text-lg">Enter the session code: <strong className="text-blue-600 text-xl font-mono">{sessionCode}</strong></span>
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center mr-4 flex-shrink-0 font-bold">3</span>
                  <span className="pt-1 text-lg">Wait for activities to unlock</span>
                </li>
              </ol>
            </div>

            {/* Teacher Instructions */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-orange-200 rounded-2xl p-8 text-center">
              <p className="text-lg text-gray-700 mb-2">
                <strong className="text-orange-600">📋 Teacher:</strong> Keep this screen projected for students to see the code.
              </p>
              <p className="text-base text-gray-600">
                Open your teacher control panel in another tab to begin the lesson.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom note */}
        <div className="text-center mt-8 text-white/80 text-sm">
          <p>💡 Keep this page open and projected while you control the lesson from your control panel</p>
        </div>
      </div>
    </div>
  );
};

export default SessionStartPage;