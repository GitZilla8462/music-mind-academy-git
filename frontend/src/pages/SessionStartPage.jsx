// SessionStartPage.jsx  
// FIXED: Now creates Firebase session with initial data
// Full-page session code display (replaces modal)
// Located at: /src/pages/SessionStartPage.jsx

import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getDatabase, ref, set } from 'firebase/database';

const SessionStartPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get session data from navigation state
  const sessionCode = location.state?.sessionCode || 'ERROR';
  const classId = location.state?.classId || null;
  const lessonPath = location.state?.lessonPath || '/lessons/film-music-project/lesson1';
  const lessonTitle = location.state?.lessonTitle || 'Lesson';
  
  const [sessionCreated, setSessionCreated] = useState(false);

  const copySessionCode = () => {
    navigator.clipboard.writeText(sessionCode);
    alert('Session code copied!');
  };

  // Create Firebase session and open control panel
  useEffect(() => {
    const initializeSession = async () => {
      if (sessionCode === 'ERROR' || sessionCreated) return;

      try {
        console.log('🔥 Creating Firebase session:', {
          sessionCode,
          classId,
          lessonPath
        });

        // Create session in Firebase with initial locked state
        const db = getDatabase();
        const sessionRef = ref(db, `sessions/${sessionCode}`);
        
        await set(sessionRef, {
          createdAt: Date.now(),
          currentStage: 'locked', // ✅ CRITICAL: Start locked
          classId: classId,
          lessonId: lessonPath,
          lessonTitle: lessonTitle,
          teacherId: 'teacher', // Replace with actual teacher ID if available
          countdownTime: 0,
          timerActive: false,
          timestamp: Date.now()
        });

        console.log('✅ Firebase session created successfully');
        setSessionCreated(true);

        // Open teacher control panel in new tab with classId
        const controlPanelUrl = `${lessonPath}?session=${sessionCode}&role=teacher${classId ? `&classId=${classId}` : ''}`;
        console.log('🎬 Opening teacher control panel:', controlPanelUrl);
        window.open(controlPanelUrl, '_blank');

      } catch (error) {
        console.error('❌ Error creating Firebase session:', error);
        alert('Failed to create session. Please try again.');
      }
    };

    initializeSession();
  }, [sessionCode, classId, lessonPath, lessonTitle, sessionCreated]);

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
                  <span className="pt-1 text-lg">Go to the join page: <strong className="text-blue-600">Your-Site.com/join</strong></span>
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center mr-4 flex-shrink-0 font-bold">2</span>
                  <span className="pt-1 text-lg">Enter the session code: <strong className="text-blue-600 text-xl font-mono">{sessionCode}</strong></span>
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center mr-4 flex-shrink-0 font-bold">3</span>
                  <span className="pt-1 text-lg">Wait for you to unlock activities</span>
                </li>
              </ol>
            </div>

            {/* Teacher Instructions */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-orange-200 rounded-2xl p-8">
              <div className="text-center mb-4">
                <p className="text-lg text-gray-700 mb-2">
                  <strong className="text-orange-600">📋 Teacher:</strong> Keep this screen projected for students to see the code.
                </p>
                <p className="text-base text-gray-600">
                  Your teacher control panel should have opened in a new tab.
                </p>
              </div>
              
              {/* Troubleshooting */}
              {sessionCreated && (
                <div className="mt-4 pt-4 border-t border-orange-200">
                  <p className="text-sm text-gray-600 mb-2">
                    Control panel didn't open?
                  </p>
                  <button
                    onClick={() => {
                      const controlPanelUrl = `${lessonPath}?session=${sessionCode}&role=teacher${classId ? `&classId=${classId}` : ''}`;
                      window.open(controlPanelUrl, '_blank');
                    }}
                    className="text-blue-600 hover:text-blue-700 font-semibold underline"
                  >
                    Click here to open it manually
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom note */}
        <div className="text-center mt-8 text-white/80 text-sm space-y-2">
          <p>💡 Keep this page open and projected while you control the lesson from your control panel</p>
          {sessionCreated && (
            <p className="text-green-300">✅ Session created in Firebase successfully</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionStartPage;