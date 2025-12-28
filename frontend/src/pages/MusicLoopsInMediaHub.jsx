// File: /pages/MusicLoopsInMediaHub.jsx
// Music for Media Unit - Hub page for all lessons
// Updated: Added Getting Started banner and unit cards grid
// Updated: Added analytics tracking for pilot program

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createSession } from '../firebase/config';
import { ChevronDown, ChevronUp, Check, FileText, ExternalLink, Play, ArrowLeft, X } from 'lucide-react';
import { useFirebaseAuth } from '../context/FirebaseAuthContext';
import { logSessionCreated, logLessonVisit } from '../firebase/analytics';

const MusicLoopsInMediaHub = () => {
  const navigate = useNavigate();
  const [creatingSession, setCreatingSession] = useState(null);
  const [expandedLessons, setExpandedLessons] = useState({});
  const [showGettingStarted, setShowGettingStarted] = useState(true);
  const [selectedUnit, setSelectedUnit] = useState('music-for-media');

  // Get authenticated teacher info
  const { user } = useFirebaseAuth();

  // Default to teacher role - hub is for teachers
  const userRole = localStorage.getItem('classroom-user-role') || 'teacher';

  // Check localStorage for banner dismissal
  useEffect(() => {
    const hidden = localStorage.getItem('hideGettingStarted');
    if (hidden === 'true') {
      setShowGettingStarted(false);
    }
  }, []);

  const dismissGettingStarted = () => {
    setShowGettingStarted(false);
    localStorage.setItem('hideGettingStarted', 'true');
  };

  const toggleExpanded = (lessonId) => {
    setExpandedLessons(prev => ({
      ...prev,
      [lessonId]: !prev[lessonId]
    }));
  };

  const handleStartSession = async (lessonId, lessonRoute) => {
    setCreatingSession(lessonId);
    try {
      // Use authenticated teacher's UID if available, fallback to 'teacher'
      const teacherId = user?.uid || 'teacher';
      const teacherEmail = user?.email || 'anonymous';

      const code = await createSession(teacherId, lessonId, lessonRoute);

      // Log analytics for pilot tracking
      if (user?.uid) {
        try {
          await logSessionCreated(user.uid, user.email, {
            sessionCode: code,
            lessonId,
            lessonRoute
          });
          await logLessonVisit(user.uid, user.email, lessonId);
        } catch (analyticsError) {
          console.warn('Analytics logging failed (non-critical):', analyticsError);
        }
      }

      window.location.href = `${lessonRoute}?session=${code}&role=teacher`;
    } catch (error) {
      console.error('Error creating session:', error);
      alert('Failed to create session. Please try again.');
      setCreatingSession(null);
    }
  };

  const handleDemoActivity = (activityType, activityTitle) => {
    const demoUrl = `/demo?activity=${activityType}&title=${encodeURIComponent(activityTitle)}`;
    window.open(demoUrl, '_blank', 'width=1280,height=800,menubar=no,toolbar=no');
  };

  const handleOpenLessonPlan = (lessonId) => {
    const route = `/lesson-plan/${lessonId}`;
    window.open(route, '_blank');
  };

  // Unit cards data
  const units = [
    {
      id: 'music-for-media',
      title: 'Music for Media',
      icon: '🎬',
      status: 'active',
      details: '5 Lessons • Grades 6-8',
      color: 'from-sky-500 to-blue-600'
    },
    {
      id: 'film-music-project',
      title: 'Film Music Project',
      icon: '🎬',
      status: 'coming',
      details: 'Coming April 2026',
      color: 'from-slate-400 to-slate-500'
    },
    {
      id: 'world-music-project',
      title: 'World Music Project',
      icon: '🌍',
      status: 'coming',
      details: 'Coming June 2026',
      color: 'from-slate-400 to-slate-500'
    },
    {
      id: 'foley-artist',
      title: 'Foley Artist',
      icon: '🎤',
      status: 'coming',
      details: 'Coming August 2026',
      color: 'from-slate-400 to-slate-500'
    }
  ];

  const lessons = [
    // Lesson 1: Mood (Drone Footage)
    {
      id: 'lesson1',
      number: 1,
      icon: '🎬',
      title: 'Score the Adventure',
      concept: 'Mood & Expression',
      essentialQuestion: 'How does music create an emotional atmosphere?',
      color: 'from-purple-500 to-indigo-600',
      route: '/lessons/film-music-project/lesson1',
      available: true,
      hasLessonPlan: true,
      inThisLesson: 'Students discover how music creates emotion by watching the same video with different scores, then compose their own adventure soundtrack.',
      studentsWill: [
        'Identify how music creates different moods',
        'Match loops to mood categories (Heroic, Hype, Mysterious, Scary, Upbeat)',
        'Compose a soundtrack for drone footage'
      ],
      activities: [
        { title: 'Introduction', description: 'Welcome, agenda, and hook setup', time: 3 },
        { title: 'Hook Video', description: 'Same scene with different scores', time: 3 },
        { title: 'Mood Discussion', description: 'How did the music change the feeling?', time: 2 },
        { title: 'Mood Categories', description: 'Introduce the 5 mood types', time: 2 },
        { title: 'Mood Match Game', description: 'Listen to loops, match to moods', time: 5, activityType: 'mood-match-game' },
        { title: 'DAW Tutorial Video', description: 'Learn to use the composition tool', time: 2 },
        { title: 'Composition', description: 'Pick a mood, score drone footage with 5+ loops', time: 12, activityType: 'adventure-composition' },
        { title: 'Two Stars and a Wish', description: 'Reflect on your composition', time: 5, activityType: 'two-stars-wish' },
        { title: 'Conclusion', description: 'Share moods and discuss', time: 2 }
      ]
    },
    // Lesson 2: Layers/Texture (City Soundscape)
    {
      id: 'lesson2',
      number: 2,
      icon: '🏙️',
      title: 'City Soundscapes',
      concept: 'Texture & Layering',
      essentialQuestion: 'How do layers of sound create texture?',
      color: 'from-cyan-500 to-blue-600',
      route: '/lessons/film-music-project/lesson2',
      available: true,
      hasLessonPlan: true,
      inThisLesson: 'Students visualize how layers create texture using a listening map, then build their own rich city soundscape.',
      studentsWill: [
        'Understand thin vs. thick musical texture',
        'Create a visual listening map while listening',
        'Build layered compositions for city footage'
      ],
      activities: [
        { title: 'Introduction', description: 'What city have you visited?', time: 2 },
        { title: 'Texture Concept', description: 'Layers create thick/thin sound (sandwich analogy)', time: 6 },
        { title: 'Listening Map Video', description: 'How to visualize texture', time: 2 },
        { title: 'Listening Map Activity', description: 'Draw while listening to music', time: 8, activityType: 'listening-map' },
        { title: 'Composition', description: 'Create a city soundscape with 5+ layers', time: 10, activityType: 'city-composition-activity' },
        { title: 'Two Stars and a Wish', description: 'Reflect on your layers', time: 3, activityType: 'two-stars-wish' },
        { title: 'Discussion', description: 'What is texture? Compare compositions', time: 2 }
      ]
    },
    // Lesson 3: Form/Structure (Epic Wildlife)
    {
      id: 'lesson3',
      number: 3,
      icon: '🌍',
      title: 'Epic Wildlife',
      concept: 'Form & Structure',
      essentialQuestion: 'How do sections organize to tell a musical story?',
      color: 'from-green-500 to-teal-600',
      route: '/lessons/film-music-project/lesson3',
      available: true,
      hasLessonPlan: true,
      inThisLesson: 'Students learn how film scores follow a story arc with distinct sections (Intro → A → A\' → Outro), then create an epic nature documentary soundtrack.',
      studentsWill: [
        'Understand sectional loop form (Intro, A, A\', Outro)',
        'Match loops to song sections in a game',
        'Compose a complete film score with structure'
      ],
      activities: [
        { title: 'Introduction', description: 'Song form and structure concepts', time: 6 },
        { title: 'Sectional Loop Builder', description: 'Game: Match loops to sections (leaderboard)', time: 6, activityType: 'sectional-loop-builder' },
        { title: 'Composition', description: 'Score wildlife footage with sections', time: 12, activityType: 'wildlife-composition-activity' },
        { title: 'Two Stars and a Wish', description: 'Reflect on your form choices', time: 6, activityType: 'two-stars-wish' },
        { title: 'Robot Melody Maker', description: 'Create loops and watch your robot dance', time: 8, activityType: 'robot-melody-maker', isBonus: true }
      ]
    },
    // Lesson 4: Beat/Rhythm (Sports Highlight)
    {
      id: 'lesson4',
      number: 4,
      icon: '🏀',
      title: 'Sports Highlight Reel',
      concept: 'Rhythm & Beat',
      essentialQuestion: 'How do rhythmic phrases convey energy?',
      color: 'from-orange-500 to-red-600',
      route: '/lessons/film-music-project/lesson4',
      available: true,
      hasLessonPlan: true,
      inThisLesson: 'Students learn how rhythm and beat create energy by comparing video with/without music, learn drum sounds, create their own beat, then score a sports highlight.',
      studentsWill: [
        'Explain the role of kick, snare, and hi-hat in a beat',
        'Create an original 4-bar rhythmic pattern',
        'Combine beats with loops to score a sports video'
      ],
      activities: [
        { title: 'Hook', description: 'Compare video with and without music', time: 6 },
        { title: 'Beat Basics', description: 'Beat, measure, kick, snare, hi-hat', time: 5 },
        { title: 'Build Your Beat', description: 'Create a drum pattern using the grid', time: 8, activityType: 'student-beat-maker' },
        { title: 'Composition', description: 'Use your beat + 3 loops to score sports video', time: 13, activityType: 'sports-composition-activity' },
        { title: 'Beat Spotlight', description: 'Reflect on your rhythmic choices', time: 4, activityType: 'beat-spotlight' },
        { title: 'Conclusion', description: 'Rhythm is the heartbeat of your music', time: 1 },
        { title: 'Beat Escape Room', description: 'Create beat puzzles for a partner to solve', time: 10, activityType: 'beat-escape-room', isBonus: true, isPartnerActivity: true }
      ]
    },
    // Lesson 5: Melody & Contour (Game On!)
    {
      id: 'lesson5',
      number: 5,
      icon: '🎮',
      title: 'Game On!',
      concept: 'Melody & Contour',
      essentialQuestion: 'How do melodic phrases create memorable themes?',
      color: 'from-pink-500 to-purple-600',
      route: '/lessons/film-music-project/lesson5',
      available: true,
      hasLessonPlan: true,
      inThisLesson: 'Students discover how melody creates memorable themes by analyzing famous game music, learning about contour patterns (ascending, descending, arch), and composing their own video game soundtrack.',
      studentsWill: [
        'Identify and describe contour patterns in melodies',
        'Create an 8-beat melody using pentatonic scale',
        'Compose a video game soundtrack with layered melodies'
      ],
      activities: [
        { title: 'Hook', description: 'Guess the game from the melody', time: 4 },
        { title: 'Vocabulary', description: 'Melody, contour, phrase, ascending/descending', time: 4 },
        { title: 'Building a Melody Demo', description: 'Teacher demonstrates contour patterns', time: 3, activityType: 'melody-builder-demo' },
        { title: 'Make Your Melody', description: 'Create an 8-beat melody with contour', time: 8, activityType: 'student-melody-maker' },
        { title: 'Composition', description: 'Layer melodies to score game footage', time: 12, activityType: 'game-composition-activity' },
        { title: 'Melody Spotlight', description: 'Reflect on your melodic choices', time: 5, activityType: 'melody-spotlight' },
        { title: 'Discussion', description: 'What contour did you use? Why?', time: 2 },
        { title: 'Melody Mystery', description: 'Create melody puzzles for a partner to solve', time: 10, activityType: 'melody-mystery', isBonus: true, isPartnerActivity: true }
      ]
    },
    // Lesson 6: Capstone (Student Choice) - was lesson5
    {
      id: 'lesson6',
      number: 6,
      icon: '🎓',
      title: 'Director\'s Cut',
      concept: 'All Concepts Combined',
      essentialQuestion: 'How do all musical elements combine to effectively score media?',
      color: 'from-amber-500 to-orange-600',
      route: '/lessons/film-music-project/lesson6',
      available: false,
      hasLessonPlan: false,
      inThisLesson: 'Students apply mood, texture, form, rhythm, and melody to create a complete film score for a video of their choice.',
      studentsWill: [
        'Plan a composition using all five concepts',
        'Create a polished film score independently',
        'Present and explain their creative choices'
      ],
      activities: [
        { title: 'Review', description: 'Revisit all five music concepts', time: 5 },
        { title: 'Planning', description: 'Choose video and plan your approach', time: 5 },
        { title: 'Composition', description: 'Create your capstone score', time: 23 },
        { title: 'Peer Review', description: 'Gallery walk and feedback', time: 7 },
        { title: 'Share & Celebrate', description: 'Present highlights to class', time: 4 }
      ]
    }
  ];

  const getTotalTime = (activities) => {
    return activities
      .filter(a => !a.isBonus)
      .reduce((sum, a) => sum + (a.time || 0), 0);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* HEADER */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-900">
              Music Mind Academy
            </h1>
            {user && (
              <button
                onClick={() => {
                  localStorage.removeItem('classroom-logged-in');
                  navigate('/');
                }}
                className="text-slate-600 hover:text-slate-900 font-medium"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>

      {/* GETTING STARTED BANNER */}
      {showGettingStarted && (
        <div className="bg-gradient-to-r from-sky-500 to-blue-600 text-white">
          <div className="max-w-5xl mx-auto px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div>
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    🚀 NEW HERE?
                  </h2>
                  <p className="text-sky-100 text-sm mt-1">
                    Get started in minutes with our quick guides
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => window.open('#', '_blank')}
                    className="bg-white text-sky-600 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-sky-50 transition-colors flex items-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    2-Min Tutorial
                  </button>
                  <button
                    onClick={() => window.open('#', '_blank')}
                    className="bg-sky-400/30 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-sky-400/40 transition-colors flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    Quick Start
                  </button>
                </div>
              </div>
              <button
                onClick={dismissGettingStarted}
                className="text-white/70 hover:text-white p-1"
                aria-label="Dismiss"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UNIT CARDS */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {units.map((unit) => {
            const isActive = unit.status === 'active';
            const isSelected = selectedUnit === unit.id;

            return (
              <button
                key={unit.id}
                onClick={() => isActive && setSelectedUnit(unit.id)}
                disabled={!isActive}
                className={`text-left p-5 rounded-xl border-2 transition-all ${
                  isActive
                    ? isSelected
                      ? 'border-sky-500 bg-sky-50 shadow-md'
                      : 'border-slate-200 bg-white hover:border-sky-300 hover:shadow-sm cursor-pointer'
                    : 'border-slate-200 bg-slate-100 opacity-60 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${unit.color} flex items-center justify-center flex-shrink-0`}>
                    <span className="text-2xl">{unit.icon}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-lg font-bold ${isActive ? 'text-slate-900' : 'text-slate-500'}`}>
                      {unit.title}
                    </h3>
                    <p className={`text-sm ${isActive ? 'text-slate-600' : 'text-slate-400'}`}>
                      {unit.details}
                    </p>
                  </div>
                  {isActive && (
                    <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded">
                      Active
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* SELECTED UNIT HEADER */}
        {selectedUnit === 'music-for-media' && (
          <>
            <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
              <div className="flex items-start gap-5">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-3xl">🎬</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Music for Media</h2>
                  <p className="text-lg text-slate-600 mt-1">
                    Create soundtracks for video — the way professionals do it.
                  </p>
                  <p className="text-sm text-slate-500 mt-2">
                    5 Lessons  •  ~40 min each  •  Grades 6-8
                  </p>
                </div>
              </div>
            </div>

            {/* LESSON CARDS */}
            <div className="space-y-6">
              {lessons.map((lesson) => {
                const isExpanded = expandedLessons[lesson.id];
                const totalTime = getTotalTime(lesson.activities);

                return (
                  <div
                    key={lesson.id}
                    className={`bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden transition-all ${
                      lesson.available ? '' : 'opacity-50'
                    }`}
                  >
                    {/* COLLAPSED CARD HEADER - Always Visible */}
                    <div className="p-6">
                      <div className="flex items-start gap-5">
                        {/* Gradient Icon */}
                        <div className={`w-20 h-20 rounded-xl bg-gradient-to-br ${lesson.color} flex items-center justify-center flex-shrink-0`}>
                          <span className="text-3xl">{lesson.icon}</span>
                        </div>

                        {/* Lesson Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-base font-semibold text-sky-600 uppercase tracking-wide">
                                Lesson {lesson.number}
                              </p>
                              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                                {lesson.title}
                              </h3>
                              <p className="text-base text-slate-600 mt-1">
                                {lesson.concept}
                              </p>
                            </div>
                            <div className="text-right flex-shrink-0 ml-4">
                              <span className="text-xl font-semibold text-slate-800">
                                ~40 min
                              </span>
                              {!lesson.available && (
                                <p className="text-sm text-slate-500 mt-1">Coming Soon</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Row: Expand Button (left) + Start Session (right) */}
                      {lesson.available && (
                        <div className="mt-4 flex items-center justify-between">
                          {/* Expand/Collapse Button - Left */}
                          <button
                            onClick={() => toggleExpanded(lesson.id)}
                            className="flex items-center gap-2 text-sky-600 hover:text-sky-700 font-medium text-base"
                          >
                            {isExpanded ? (
                              <>
                                <ChevronUp className="w-5 h-5" />
                                Hide Overview
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-5 h-5" />
                                Lesson Overview
                              </>
                            )}
                          </button>

                          {/* Start Session Button - Right (Teacher Only) */}
                          {userRole === 'teacher' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartSession(lesson.id, lesson.route);
                              }}
                              disabled={creatingSession === lesson.id}
                              className={`font-semibold py-2.5 px-5 rounded-lg transition-colors flex items-center gap-2 ${
                                creatingSession === lesson.id
                                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                                  : 'bg-sky-500 hover:bg-sky-600 text-white'
                              }`}
                            >
                              {creatingSession === lesson.id ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                  Creating...
                                </>
                              ) : (
                                'Start Session'
                              )}
                            </button>
                          )}

                        </div>
                      )}
                    </div>

                    {/* EXPANDED CONTENT */}
                    {isExpanded && lesson.available && (
                      <div className="border-t border-slate-200">
                        {/* Section 1: Lesson Description */}
                        <div className="px-6 py-6 bg-slate-50 border-b border-slate-200">
                          {/* In This Lesson */}
                          <div className="mb-5">
                            <h4 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-2">
                              In This Lesson
                            </h4>
                            <p className="text-lg text-slate-800">
                              {lesson.inThisLesson}
                            </p>
                          </div>

                          {/* Students Will */}
                          <div className="mb-5">
                            <h4 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-2">
                              Students Will
                            </h4>
                            <ul className="space-y-2">
                              {lesson.studentsWill.map((outcome, i) => (
                                <li key={i} className="flex items-start gap-2 text-base text-slate-800">
                                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                  <span>{outcome}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Essential Question */}
                          <div>
                            <h4 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-2">
                              Essential Question
                            </h4>
                            <p className="text-lg text-slate-800 italic">
                              "{lesson.essentialQuestion}"
                            </p>
                          </div>
                        </div>

                        {/* Section 2: Activities List */}
                        {userRole === 'teacher' && (
                          <div className="px-6 py-6">
                            <h4 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-4">
                              Activities
                            </h4>

                            {/* Activities Header Row */}
                            <div className="grid grid-cols-[200px_1fr_auto_60px_80px] gap-x-4 items-center py-2 border-b border-slate-200 mb-1">
                              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                Activity
                              </span>
                              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                Description
                              </span>
                              <span></span>
                              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide text-right">
                                Time
                              </span>
                              <span></span>
                            </div>

                            {/* Activities Table with CSS Grid */}
                            <div className="space-y-0">
                              {lesson.activities.map((activity, index) => (
                                <div
                                  key={index}
                                  className="grid grid-cols-[200px_1fr_auto_60px_80px] gap-x-4 items-center py-3 border-b border-slate-100 last:border-b-0"
                                >
                                  {/* Column 1: Title */}
                                  <span className={`text-base font-medium truncate ${activity.isBonus ? 'text-amber-700' : 'text-slate-800'}`}>
                                    {activity.title}
                                  </span>

                                  {/* Column 2: Description */}
                                  <span className="text-slate-700 text-base truncate">
                                    {activity.description}
                                  </span>

                                  {/* Column 3: Badges */}
                                  <div className="flex gap-1">
                                    {activity.isPartnerActivity && (
                                      <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded">
                                        Partner
                                      </span>
                                    )}
                                    {activity.isBonus && (
                                      <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded">
                                        Bonus
                                      </span>
                                    )}
                                  </div>

                                  {/* Column 4: Time */}
                                  <span className="text-slate-600 text-base text-right">
                                    {activity.time} min
                                  </span>

                                  {/* Column 5: Preview Button */}
                                  <div className="text-right">
                                    {activity.activityType ? (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDemoActivity(activity.activityType, activity.title);
                                        }}
                                        className="inline-flex items-center gap-1 text-sm text-sky-600 hover:text-sky-700 font-medium"
                                      >
                                        <Play className="w-4 h-4" />
                                        Preview
                                      </button>
                                    ) : (
                                      <span className="text-sm text-slate-400">—</span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Total Time */}
                            <div className="flex justify-end mt-4 pt-3 border-t border-slate-200">
                              <span className="text-base text-slate-600">
                                Total (excluding bonus):
                              </span>
                              <span className="text-base font-semibold text-slate-800 ml-2">
                                ~40 min
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Section 3: Lesson Plan Link (Teacher Only) */}
                        {lesson.hasLessonPlan && userRole === 'teacher' && (
                          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenLessonPlan(lesson.id);
                              }}
                              className="flex items-center gap-2 text-slate-600 hover:text-slate-800 font-medium transition-colors"
                            >
                              <FileText className="w-5 h-5" />
                              View Lesson Plan
                              <ExternalLink className="w-4 h-4 text-slate-400" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* FOOTER HELP LINKS */}
      <div className="border-t border-slate-200 bg-white mt-8">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="flex items-center justify-center gap-6 text-sm text-slate-600">
            <span>Need help?</span>
            <a
              href="#"
              className="flex items-center gap-1.5 text-sky-600 hover:text-sky-700 font-medium"
            >
              <Play className="w-4 h-4" />
              Tutorial
            </a>
            <a
              href="#"
              className="flex items-center gap-1.5 text-sky-600 hover:text-sky-700 font-medium"
            >
              <FileText className="w-4 h-4" />
              Quick Start
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicLoopsInMediaHub;
