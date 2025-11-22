// File: /pages/MusicLoopsInMediaHub.jsx
// Music Loops in Media Project - Hub page for all 5 lessons
// ✅ FIXED: Lesson IDs now match actual lesson identifiers (lesson2, lesson3, lesson4, etc.)
// ✅ FIXED: Lesson4 (Cooking Process Video) now available for live sessions

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createSession } from '../firebase/config';

const MusicLoopsInMediaHub = () => {
  const navigate = useNavigate();
  const [savedProgress, setSavedProgress] = useState({});
  const [creatingSession, setCreatingSession] = useState(null);
  
  const userRole = localStorage.getItem('classroom-user-role');
  
  useEffect(() => {
    const progress = {
      lesson1: localStorage.getItem('lesson1-progress'),
      lesson2: localStorage.getItem('lesson2-progress'),
      lesson3: localStorage.getItem('lesson3-progress'),
      lesson4: localStorage.getItem('lesson4-progress'),
      lesson5: localStorage.getItem('lesson5-progress')
    };
    setSavedProgress(progress);
  }, []);

  // ✅ FIXED: Now passes lessonRoute as third parameter
  const handleStartSession = async (lessonId, lessonRoute) => {
    console.log('🎬 Starting session for:', { lessonId, lessonRoute });
    setCreatingSession(lessonId);
    
    try {
      const code = await createSession('teacher', lessonId, lessonRoute);
      console.log(`✅ Session created: ${code} for ${lessonId} at route ${lessonRoute}`);
      console.log(`🔗 Redirecting to: ${lessonRoute}?session=${code}&role=teacher`);
      
      window.location.href = `${lessonRoute}?session=${code}&role=teacher`;
    } catch (error) {
      console.error('❌ Error creating session:', error);
      alert('Failed to create session. Please try again.');
      setCreatingSession(null);
    }
  };

  const lessons = [
    {
      id: 'lesson2',  // ✅ FIXED: Use actual lesson ID
      number: 1,
      title: 'Sports Highlight Reel Music',
      concept: 'Texture & Layering',
      description: 'Create high-energy music for basketball, skateboarding, and football highlights',
      icon: '🏀',
      color: 'from-orange-500 to-red-500',
      videos: ['Basketball', 'Skateboarding', 'Football'],
      duration: '35 minutes',
      route: '/lessons/film-music-project/lesson2',
      available: true
    },
    {
      id: 'lesson3',  // ✅ FIXED: Use actual lesson ID
      number: 2,
      title: 'City Soundscapes',
      concept: 'Texture & Layering',
      description: 'Learn about musical texture and create layered city soundscapes',
      icon: '🏙️',
      color: 'from-green-500 to-teal-500',
      videos: ['City Atmosphere'],
      duration: '35 minutes',
      route: '/lessons/film-music-project/lesson3',
      available: true  // ✅ Now available for live sessions
    },
    {
      id: 'lesson4',  // ✅ FIXED: Use actual lesson ID
      number: 3,
      title: "Chef's Soundtrack",
      concept: 'Mood Progression',
      description: 'Score a cooking video with music that evolves throughout the process',
      icon: '🍳',
      color: 'from-yellow-500 to-orange-500',
      videos: ['Recipe Tutorial', 'Food Preparation', 'Plating'],
      duration: '35 minutes',
      route: '/lessons/film-music-project/lesson4',
      available: true  // ✅ Now available for live sessions
    },
    {
      id: 'lesson5',  // ✅ FIXED: Use actual lesson ID
      number: 4,
      title: 'Comedy Advertisement',
      concept: 'Contrast & Timing',
      description: 'Create comedic music with perfect timing for funny commercial moments',
      icon: '😂',
      color: 'from-green-500 to-teal-500',
      videos: ['Product Ad', 'Skit', 'Infomercial'],
      duration: '35 minutes',
      route: '/lessons/film-music-project/lesson5',
      available: false
    },
    {
      id: 'lesson6',  // ✅ FIXED: Use actual lesson ID
      number: 5,
      title: 'Student Choice Composition',
      concept: 'Apply All Skills',
      description: 'Choose your own video and apply everything you\'ve learned',
      icon: '⭐',
      color: 'from-blue-500 to-indigo-500',
      videos: ['Student Selected'],
      duration: '35 minutes',
      route: '/lessons/film-music-project/lesson6',
      available: false
    }
  ];

  const getProgressBadge = (lessonId) => {
    if (savedProgress[lessonId]) {
      return (
        <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg flex items-center gap-1">
          <span>✓</span>
          <span>In Progress</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="bg-gray-800 border-b border-gray-700 shadow-xl">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <button
            onClick={() => navigate('/')}
            className="mb-4 text-blue-400 hover:text-blue-300 flex items-center gap-2 transition-colors"
          >
            <span>←</span>
            <span>Back to Home</span>
          </button>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="text-6xl">🎵</div>
            <div>
              <h1 className="text-5xl font-bold text-white mb-2">
                Music Loops in Media
              </h1>
              <p className="text-xl text-gray-300">
                Compose original music for different types of media
              </p>
            </div>
          </div>
          
          <div className="flex gap-6 text-sm text-gray-400 mt-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📚</span>
              <span>5 Lessons</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">⏱️</span>
              <span>~35 min each</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              <span>Grades 6-8</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-gray-800 rounded-xl p-6 mb-8 border border-gray-700 shadow-xl">
          <h2 className="text-2xl font-bold text-white mb-4">Unit Overview</h2>
          <p className="text-gray-300 text-lg leading-relaxed mb-4">
            In this unit, you'll learn how music loops are used to enhance different types of media. 
            Each lesson focuses on a different media context and musical concept:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🏀</span>
              <div>
                <div className="font-semibold text-white">Texture & Layering</div>
                <div className="text-sm">Building energy through multiple loop layers</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎮</span>
              <div>
                <div className="font-semibold text-white">Repetition & Variation</div>
                <div className="text-sm">Creating loops that don't get boring</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🍳</span>
              <div>
                <div className="font-semibold text-white">Mood Progression</div>
                <div className="text-sm">Music that evolves with the action</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">😂</span>
              <div>
                <div className="font-semibold text-white">Contrast & Timing</div>
                <div className="text-sm">Syncing music to comedic moments</div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {lessons.map((lesson) => (
            <div
              key={lesson.id}
              className={`relative bg-gray-800 rounded-xl overflow-hidden border border-gray-700 shadow-xl transition-all duration-300 ${
                lesson.available 
                  ? 'hover:shadow-2xl hover:scale-[1.01]' 
                  : 'opacity-60'
              }`}
            >
              {getProgressBadge(lesson.id)}
              
              {!lesson.available && (
                <div className="absolute top-3 right-3 bg-gray-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg z-10">
                  Coming Soon
                </div>
              )}

              <div className="flex flex-col md:flex-row">
                <div className={`bg-gradient-to-br ${lesson.color} p-8 flex items-center justify-center md:w-48`}>
                  <div className="text-center text-white">
                    <div className="text-7xl mb-2">{lesson.icon}</div>
                    <div className="text-2xl font-bold">Lesson {lesson.number}</div>
                  </div>
                </div>

                <div className="flex-1 p-6">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {lesson.title}
                  </h3>
                  
                  <div className="flex items-center gap-4 mb-3">
                    <span className="px-3 py-1 bg-gray-700 text-blue-300 text-sm rounded-full font-semibold">
                      {lesson.concept}
                    </span>
                    <span className="text-gray-400 text-sm">
                      ⏱️ {lesson.duration}
                    </span>
                  </div>

                  <p className="text-gray-300 mb-4 text-lg">
                    {lesson.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {lesson.videos.map((video, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-gray-700 text-gray-300 text-sm rounded-lg"
                      >
                        {video}
                      </span>
                    ))}
                  </div>

                  {lesson.available && (
                    <div className="flex gap-3 mt-4">
                      {userRole === 'teacher' && (
                        <button 
                          onClick={() => handleStartSession(lesson.id, lesson.route)}
                          disabled={creatingSession === lesson.id}
                          className={`flex-1 px-6 py-3 ${
                            creatingSession === lesson.id 
                              ? 'bg-gray-500 cursor-not-allowed' 
                              : 'bg-blue-500 hover:bg-blue-600'
                          } text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2`}
                        >
                          {creatingSession === lesson.id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                              <span>Creating Session...</span>
                            </>
                          ) : (
                            <>
                              <span>🎬</span>
                              <span>Start Live Session</span>
                            </>
                          )}
                        </button>
                      )}

                      {userRole === 'student' && (
                        <button 
                          onClick={() => navigate(lesson.route)}
                          className="flex-1 px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-lg transition-colors"
                        >
                          Practice Solo →
                        </button>
                      )}
                    </div>
                  )}

                  {!lesson.available && (
                    <div className="mt-4 text-gray-500 text-sm italic">
                      This lesson will be available soon
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MusicLoopsInMediaHub;